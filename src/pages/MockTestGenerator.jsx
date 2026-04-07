import { useState } from 'react'
import {
  ChevronRight,
  FileUp,
  ListChecks,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

GlobalWorkerOptions.workerSrc = pdfWorker

function MockTestGeneratorPage() {
  const [fileName, setFileName] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [questionCount, setQuestionCount] = useState(15)
  const [difficulty, setDifficulty] = useState('Mixed')
  const [generatedTest, setGeneratedTest] = useState(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  const parseJsonFromResponse = (rawText) => {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim()

    try {
      return JSON.parse(cleaned)
    } catch {
      const firstBrace = cleaned.indexOf('{')
      const lastBrace = cleaned.lastIndexOf('}')

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1))
      }

      throw new Error('invalid_mock_test_payload')
    }
  }

  const normalizeMockTest = (payload) => {
    const sections = Array.isArray(payload?.sections)
      ? payload.sections.map((section) => ({
          name: String(section?.name || 'Section'),
          questions: Array.isArray(section?.questions)
            ? section.questions.map((question, idx) => ({
                type: String(question?.type || 'short').toLowerCase(),
                question: String(question?.question || `Question ${idx + 1}`),
                options: Array.isArray(question?.options) ? question.options.map((item) => String(item)) : [],
                answer: String(question?.answer || 'Not provided'),
                explanation: String(question?.explanation || ''),
                marks: Number(question?.marks || 1),
              }))
            : [],
        }))
      : []

    return {
      title: String(payload?.title || 'AI Mock Test'),
      instructions: String(payload?.instructions || 'Read each question carefully and manage time efficiently.'),
      estimatedTime: String(payload?.estimatedTime || '45 min'),
      totalMarks: Number(payload?.totalMarks || 0),
      sections,
    }
  }

  const extractTextFromPdf = async (file) => {
    setIsExtracting(true)
    setError('')
    setGeneratedTest(null)
    setShowAnswers(false)

    try {
      const bytes = await file.arrayBuffer()
      const pdf = await getDocument({ data: new Uint8Array(bytes) }).promise
      const pages = []

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()

        pages.push(pageText)
      }

      const merged = pages.join('\n').trim()
      if (!merged) {
        throw new Error('No text could be extracted from this PDF.')
      }

      setSourceText(merged.slice(0, 28000))
      setFileName(file.name)
    } catch (extractError) {
      const message = extractError instanceof Error ? extractError.message : 'Could not read PDF file.'
      setError(message)
      setSourceText('')
      setFileName('')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.')
      return
    }

    await extractTextFromPdf(file)
  }

  const generateMockTest = async () => {
    if (!apiKey) {
      setError('Missing API key. Add VITE_GROQ_API_KEY in .env.local and restart the dev server.')
      return
    }

    if (!sourceText) {
      setError('Upload a PDF first so AI can analyze it.')
      return
    }

    setIsGenerating(true)
    setError('')

    const systemPrompt = `You are an exam paper setter. Return ONLY valid JSON with this schema and no extra text:\n{\n  "title": "string",\n  "instructions": "string",\n  "estimatedTime": "string",\n  "totalMarks": number,\n  "sections": [\n    {\n      "name": "string",\n      "questions": [\n        {\n          "type": "mcq|short|long",\n          "question": "string",\n          "options": ["string"],\n          "answer": "string",\n          "explanation": "string",\n          "marks": number\n        }\n      ]\n    }\n  ]\n}\nRules: Create exactly ${questionCount} questions total. Difficulty should be ${difficulty}. Include at least one MCQ section and one descriptive section. For MCQ include exactly 4 options each. Return concise but clear answer keys.`

    const userPrompt = `Create a mock test from this study material:\n\n${sourceText}`

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.25,
          max_tokens: 2600,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const apiMessage = errorPayload?.error?.message || `Mock test generation failed (${response.status})`
        throw new Error(apiMessage)
      }

      const data = await response.json()
      const rawText = data?.choices?.[0]?.message?.content?.trim()

      if (!rawText) {
        throw new Error('Empty AI response received.')
      }

      const parsed = parseJsonFromResponse(rawText)
      const normalized = normalizeMockTest(parsed)

      if (!normalized.sections.length) {
        throw new Error('AI response did not contain valid sections/questions.')
      }

      setGeneratedTest(normalized)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Could not generate mock test.'
      setError(message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#060814] text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-28 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(125,79,255,0.4)_0%,_rgba(40,99,255,0)_65%)] blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(20,215,255,0.2)_0%,_rgba(0,0,0,0)_66%)] blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/45 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3 font-display text-xl font-bold tracking-wide text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-indigo-500 text-slate-950 shadow-glow">
              <Sparkles size={18} />
            </span>
            CampusAI
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/study-assistant"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 transition duration-300 hover:border-cyan-300/55 hover:bg-cyan-300/10"
            >
              Study Assistant
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 transition duration-300 hover:border-cyan-300/55 hover:bg-cyan-300/10"
            >
              Back to Home
              <ChevronRight size={15} />
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16">
        <section>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-100">
            AI Mock Test Generator
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            Generate Mock Test From PDF
          </h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Upload your class notes or textbook PDF. AI will analyze the content and generate a tailored mock test with
            objective and descriptive questions.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-950/35 p-5 backdrop-blur-xl md:p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <label className="rounded-2xl border border-dashed border-cyan-200/35 bg-white/5 p-4 text-sm text-slate-200 lg:col-span-2">
              <span className="mb-2 inline-flex items-center gap-2 font-semibold text-cyan-100">
                <FileUp size={16} /> Upload PDF Material
              </span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="mt-2 block w-full cursor-pointer text-sm file:mr-3 file:rounded-full file:border-0 file:bg-cyan-300/20 file:px-3 file:py-2 file:text-cyan-100"
              />
              {isExtracting && <p className="mt-2 text-xs text-cyan-100">Extracting PDF content...</p>}
              {fileName && <p className="mt-2 text-xs text-emerald-200">Loaded: {fileName}</p>}
            </label>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <label className="block text-xs uppercase tracking-wide text-slate-300">Difficulty</label>
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
                <option>Mixed</option>
              </select>

              <label className="mt-4 block text-xs uppercase tracking-wide text-slate-300">Questions</label>
              <input
                type="number"
                min={5}
                max={40}
                value={questionCount}
                onChange={(event) => setQuestionCount(Number(event.target.value || 15))}
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={generateMockTest}
              disabled={isGenerating || isExtracting || !sourceText}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? <LoaderCircle size={14} className="animate-spin" /> : <ListChecks size={14} />}
              {isGenerating ? 'Generating Mock Test' : 'Generate Mock Test'}
            </button>

            {generatedTest && (
              <button
                type="button"
                onClick={() => setShowAnswers((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan-300/45"
              >
                <ShieldCheck size={14} className="text-cyan-300" />
                {showAnswers ? 'Hide Answer Key' : 'Show Answer Key'}
              </button>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-rose-200">{error}</p>}
        </section>

        {generatedTest && (
          <section className="mt-8 rounded-3xl border border-white/10 bg-slate-950/35 p-5 backdrop-blur-xl md:p-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="font-display text-2xl text-white">{generatedTest.title}</h2>
              <p className="mt-2 text-sm text-slate-200">{generatedTest.instructions}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Estimated time: {generatedTest.estimatedTime}</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Total marks: {generatedTest.totalMarks}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {generatedTest.sections.map((section, sectionIndex) => (
                <article key={`${section.name}-${sectionIndex}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="font-display text-lg text-cyan-100">{section.name}</h3>
                  <ol className="mt-3 space-y-3 text-sm text-slate-100">
                    {section.questions.map((question, questionIndex) => (
                      <li key={`${sectionIndex}-${questionIndex}`} className="rounded-xl border border-white/10 bg-slate-950/45 p-3">
                        <p className="font-medium text-white">
                          {questionIndex + 1}. {question.question}
                        </p>

                        {question.type === 'mcq' && question.options.length > 0 && (
                          <ul className="mt-2 space-y-1 text-slate-200">
                            {question.options.map((option, optionIndex) => (
                              <li key={`${sectionIndex}-${questionIndex}-opt-${optionIndex}`}>{String.fromCharCode(65 + optionIndex)}. {option}</li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
                          <span className="uppercase tracking-wide">{question.type}</span>
                          <span>{question.marks} mark(s)</span>
                        </div>

                        {showAnswers && (
                          <div className="mt-2 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-2 text-xs text-emerald-100">
                            <p>
                              <span className="font-semibold">Answer:</span> {question.answer}
                            </p>
                            {question.explanation ? (
                              <p className="mt-1">
                                <span className="font-semibold">Why:</span> {question.explanation}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default MockTestGeneratorPage
