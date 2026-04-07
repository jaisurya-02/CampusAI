import { useState } from 'react'
import { BookOpenCheck, ChevronRight, LoaderCircle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const MIN_COUNTS = {
  keyConcepts: 6,
  formulasOrDefinitions: 4,
  stepByStep: 6,
  quickRevisionPoints: 6,
  practiceQuestions: 5,
  commonMistakes: 4,
  revisionPlan24h: 4,
}

function GenerateNotesPage() {
  const [topic, setTopic] = useState('')
  const [detailedMode, setDetailedMode] = useState(false)
  const [generatedNotes, setGeneratedNotes] = useState(null)
  const [notesError, setNotesError] = useState('')
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false)
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  const toArray = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean)
    }

    if (typeof value === 'string') {
      return value
        .split(/\n|;|\s(?=\d+\.)/)
        .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
        .filter(Boolean)
    }

    return []
  }

  const safeParseJson = (rawContent) => {
    const cleaned = rawContent
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

      throw new Error('invalid_json_payload')
    }
  }

  const extractStringByKey = (rawContent, keys) => {
    for (const key of keys) {
      const pattern = new RegExp(`"${key}"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*,\\s*"|\\s*})`, 'i')
      const match = rawContent.match(pattern)

      if (match?.[1]) {
        return match[1].replace(/\\n/g, ' ').trim()
      }
    }

    return ''
  }

  const extractArrayByKey = (rawContent, keys) => {
    for (const key of keys) {
      const pattern = new RegExp(`"${key}"\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'i')
      const match = rawContent.match(pattern)

      if (match?.[1]) {
        return match[1]
          .split(/\n|,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
          .map((item) =>
            item
              .replace(/^\s*"/, '')
              .replace(/"\s*$/, '')
              .replace(/^[-*\d.\s]+/, '')
              .replace(/\\n/g, ' ')
              .trim(),
          )
          .filter(Boolean)
      }
    }

    return []
  }

  const parseNotesPayload = (rawContent) => {
    try {
      const parsed = safeParseJson(rawContent)

      const keyConcepts = toArray(parsed?.keyConcepts ?? parsed?.key_concepts ?? parsed?.concepts)
      const formulasOrDefinitions = toArray(
        parsed?.formulasOrDefinitions ?? parsed?.formulas_or_definitions ?? parsed?.importantFormulas ?? parsed?.definitions,
      )
      const stepByStep = toArray(parsed?.stepByStep ?? parsed?.step_by_step ?? parsed?.steps)
      const quickRevisionPoints = toArray(
        parsed?.quickRevisionPoints ?? parsed?.quick_revision_points ?? parsed?.revisionPoints,
      )
      const practiceQuestions = toArray(
        parsed?.practiceQuestions ?? parsed?.practice_questions ?? parsed?.questions,
      )
      const commonMistakes = toArray(parsed?.commonMistakes ?? parsed?.common_mistakes ?? parsed?.mistakes)
      const revisionPlan24h = toArray(parsed?.revisionPlan24h ?? parsed?.revision_plan_24h ?? parsed?.revisionPlan)

      return {
        title: String(parsed?.title || ''),
        overview: String(parsed?.overview || ''),
        keyConcepts,
        formulasOrDefinitions,
        stepByStep,
        quickRevisionPoints,
        practiceQuestions,
        commonMistakes,
        revisionPlan24h,
      }
    } catch {
      return {
        title: extractStringByKey(rawContent, ['title']) || 'Generated Notes',
        overview: extractStringByKey(rawContent, ['overview']) || '',
        keyConcepts: extractArrayByKey(rawContent, ['keyConcepts', 'key_concepts', 'concepts']),
        formulasOrDefinitions: extractArrayByKey(rawContent, [
          'formulasOrDefinitions',
          'formulas_or_definitions',
          'importantFormulas',
          'definitions',
        ]),
        stepByStep: extractArrayByKey(rawContent, ['stepByStep', 'step_by_step', 'steps']),
        quickRevisionPoints: extractArrayByKey(rawContent, [
          'quickRevisionPoints',
          'quick_revision_points',
          'revisionPoints',
        ]),
        practiceQuestions: extractArrayByKey(rawContent, ['practiceQuestions', 'practice_questions', 'questions']),
        commonMistakes: extractArrayByKey(rawContent, ['commonMistakes', 'common_mistakes', 'mistakes']),
        revisionPlan24h: extractArrayByKey(rawContent, ['revisionPlan24h', 'revision_plan_24h', 'revisionPlan']),
      }
    }
  }

  const hasMinimumDepth = (notes) => {
    if (!notes.title || !notes.overview) {
      return false
    }

    return Object.entries(MIN_COUNTS).every(([key, min]) => (notes[key]?.length || 0) >= min)
  }

  const mergeUnique = (first = [], second = []) => {
    const seen = new Set()
    return [...first, ...second].filter((item) => {
      const normalized = item.toLowerCase()
      if (!item || seen.has(normalized)) {
        return false
      }
      seen.add(normalized)
      return true
    })
  }

  const mergeNotes = (base, extra) => {
    if (!extra) {
      return base
    }

    return {
      title: base.title || extra.title,
      overview: base.overview.length >= extra.overview.length ? base.overview : extra.overview,
      keyConcepts: mergeUnique(base.keyConcepts, extra.keyConcepts),
      formulasOrDefinitions: mergeUnique(base.formulasOrDefinitions, extra.formulasOrDefinitions),
      stepByStep: mergeUnique(base.stepByStep, extra.stepByStep),
      quickRevisionPoints: mergeUnique(base.quickRevisionPoints, extra.quickRevisionPoints),
      practiceQuestions: mergeUnique(base.practiceQuestions, extra.practiceQuestions),
      commonMistakes: mergeUnique(base.commonMistakes, extra.commonMistakes),
      revisionPlan24h: mergeUnique(base.revisionPlan24h, extra.revisionPlan24h),
    }
  }

  const buildSystemPrompt = (strictMode, passType = 'standard') => {
    const baseRules =
      'You are an expert study coach. Return ONLY valid JSON with this exact schema and no extra text: {"title":"string","overview":"string","keyConcepts":["string"],"formulasOrDefinitions":["string"],"stepByStep":["string"],"quickRevisionPoints":["string"],"practiceQuestions":["string"],"commonMistakes":["string"],"revisionPlan24h":["string"]}. Never return markdown. Never wrap JSON in code fences.'

    const depthRules =
      'Depth requirements: keyConcepts minimum 6 points, formulasOrDefinitions minimum 4 points, stepByStep minimum 6 steps, quickRevisionPoints minimum 6 points, practiceQuestions exactly 5 questions, commonMistakes minimum 4 points, revisionPlan24h minimum 4 actionable steps. Keep each point concise but informative for exam prep.'

    const strictRules = strictMode
      ? 'IMPORTANT: Every section must satisfy the exact item counts. Do not return short/incomplete sections.'
      : 'Prefer complete coverage for all sections and avoid short sections.'

    const passRules =
      passType === 'concept'
        ? 'Concept pass focus: give deeper and more technical content for keyConcepts, formulasOrDefinitions, stepByStep, and quickRevisionPoints. Still fill all sections.'
        : passType === 'practice'
          ? 'Practice pass focus: give stronger exam practice content for practiceQuestions, commonMistakes, and revisionPlan24h. Still fill all sections.'
          : 'Balanced pass: fill all sections with even quality.'

    return `${baseRules} ${depthRules} ${strictRules} ${passRules}`
  }

  const requestNotes = async (systemPrompt, userPrompt) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
          max_tokens: 1600,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null)
      const apiMessage = errorPayload?.error?.message || `Notes generation failed (${response.status})`
      throw new Error(apiMessage)
    }

    const data = await response.json()
    return data?.choices?.[0]?.message?.content?.trim()
  }

  const generateStructuredNotes = async () => {
    if (!topic.trim() || isGeneratingNotes) {
      return
    }

    if (!apiKey) {
      setNotesError('Missing API key. Add VITE_GROQ_API_KEY in .env.local and restart the dev server.')
      return
    }

    setNotesError('')
    setGeneratedNotes(null)
    setIsGeneratingNotes(true)

    try {
      const baseUserPrompt = `Generate study notes for: ${topic.trim()}`
      let notesRaw = await requestNotes(buildSystemPrompt(false), baseUserPrompt)

      if (!notesRaw) {
        setNotesError('No notes were generated. Please try a more specific topic.')
        return
      }

      let notes = parseNotesPayload(notesRaw)

      if (detailedMode) {
        const conceptRaw = await requestNotes(
          buildSystemPrompt(true, 'concept'),
          `Concept pass for topic: ${topic.trim()}. Emphasize concepts, formulas, step-by-step understanding, and revision triggers.`,
        )
        const practiceRaw = await requestNotes(
          buildSystemPrompt(true, 'practice'),
          `Practice pass for topic: ${topic.trim()}. Emphasize exam questions, likely mistakes, and a realistic 24-hour revision plan.`,
        )

        const conceptNotes = conceptRaw ? parseNotesPayload(conceptRaw) : null
        const practiceNotes = practiceRaw ? parseNotesPayload(practiceRaw) : null
        notes = mergeNotes(mergeNotes(notes, conceptNotes), practiceNotes)
      }

      if (!hasMinimumDepth(notes)) {
        notesRaw = await requestNotes(buildSystemPrompt(true), baseUserPrompt)
        if (notesRaw) {
          notes = parseNotesPayload(notesRaw)
        }
      }

      if (!hasMinimumDepth(notes)) {
        setNotesError('Generated response was incomplete. Please try again.')
        return
      }

      setGeneratedNotes(notes)
    } catch (error) {
      const details = error instanceof Error ? error.message : 'Unexpected error'
      setNotesError(`Could not generate structured notes right now. ${details}`)
    } finally {
      setIsGeneratingNotes(false)
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

      <main className="relative z-10 mx-auto w-full max-w-[92rem] px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16">
        <section>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-100">
            AI Notes Generator
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            Generate Notes
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Enter any topic and get structured study notes with concept highlights, revision points, practice questions,
            and a short revision plan.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-950/35 p-5 backdrop-blur-xl md:p-6">
          <label htmlFor="notes-topic" className="block text-sm font-semibold text-cyan-100">
            What should I generate notes for?
          </label>
          <textarea
            id="notes-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            rows={4}
            placeholder="Example: Fourier series for engineering mathematics"
            className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300/50"
          />

          <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={detailedMode}
              onChange={(event) => setDetailedMode(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-slate-900 accent-cyan-300"
            />
            Detailed Mode (two-pass deep notes)
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={generateStructuredNotes}
              disabled={isGeneratingNotes || !topic.trim()}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGeneratingNotes ? <LoaderCircle size={14} className="animate-spin" /> : <BookOpenCheck size={14} />}
              {isGeneratingNotes ? 'Generating Notes' : detailedMode ? 'Generate Detailed Notes' : 'Generate Structured Notes'}
            </button>
            {!apiKey && <p className="text-xs text-amber-200/90">Set VITE_GROQ_API_KEY in .env.local to enable AI notes.</p>}
          </div>

          {notesError && <p className="mt-3 text-sm text-rose-200">{notesError}</p>}

          {generatedNotes && (
            <article className="mt-4 rounded-2xl border border-cyan-200/20 bg-slate-950/60 p-4">
              <header className="mb-4 rounded-xl border border-white/10 bg-gradient-to-br from-cyan-300/10 to-indigo-500/10 p-4">
                <h2 className="font-display text-lg font-semibold text-white">{generatedNotes.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-200">{generatedNotes.overview}</p>
              </header>

              <div className="columns-1 gap-4 md:columns-2 lg:columns-3 2xl:columns-4">
              <section className="mb-4 break-inside-avoid rounded-xl border border-white/10 bg-white/5 p-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cyan-100">Quick Revision Points</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {generatedNotes.quickRevisionPoints.map((item, index) => (
                    <li key={`revision-${index}`}>• {item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-4 break-inside-avoid rounded-xl border border-white/10 bg-white/5 p-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cyan-100">Key Concepts</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {generatedNotes.keyConcepts.map((item, index) => (
                    <li key={`concept-${index}`}>• {item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-4 break-inside-avoid rounded-xl border border-white/10 bg-white/5 p-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cyan-100">
                  Important Formulas/Definitions
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {generatedNotes.formulasOrDefinitions.map((item, index) => (
                    <li key={`formula-${index}`}>• {item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-4 break-inside-avoid rounded-xl border border-white/10 bg-white/5 p-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cyan-100">Step-by-step Explanation</h3>
                <ol className="mt-2 space-y-1 text-sm text-slate-200">
                  {generatedNotes.stepByStep.map((item, index) => (
                    <li key={`step-${index}`}>{index + 1}. {item}</li>
                  ))}
                </ol>
              </section>

              <section className="mb-4 break-inside-avoid rounded-xl border border-white/10 bg-white/5 p-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cyan-100">Practice Questions</h3>
                <ol className="mt-2 space-y-1 text-sm text-slate-200">
                  {generatedNotes.practiceQuestions.map((item, index) => (
                    <li key={`question-${index}`}>{index + 1}. {item}</li>
                  ))}
                </ol>
              </section>

              <section className="mb-4 break-inside-avoid rounded-xl border border-white/10 bg-white/5 p-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cyan-100">Common Mistakes</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {generatedNotes.commonMistakes.map((item, index) => (
                    <li key={`mistake-${index}`}>• {item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-4 break-inside-avoid rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-cyan-300/10 p-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cyan-100">24-hour Revision Plan</h3>
                <ol className="mt-2 space-y-1 text-sm text-slate-200">
                  {generatedNotes.revisionPlan24h.map((item, index) => (
                    <li key={`plan-${index}`}>{index + 1}. {item}</li>
                  ))}
                </ol>
              </section>
              </div>
            </article>
          )}
        </section>
      </main>
    </div>
  )
}

export default GenerateNotesPage
