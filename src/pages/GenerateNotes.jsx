import { useState } from 'react'
import { BookOpenCheck, ChevronRight, LoaderCircle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

function GenerateNotesPage() {
  const [topic, setTopic] = useState('')
  const [generatedNotes, setGeneratedNotes] = useState('')
  const [notesError, setNotesError] = useState('')
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false)
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  const generateStructuredNotes = async () => {
    if (!topic.trim() || isGeneratingNotes) {
      return
    }

    if (!apiKey) {
      setNotesError('Missing API key. Add VITE_GROQ_API_KEY in .env.local and restart the dev server.')
      return
    }

    setNotesError('')
    setGeneratedNotes('')
    setIsGeneratingNotes(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.3,
          max_tokens: 900,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert study coach. Return only structured study notes in plain text Markdown. Follow this exact layout with concise content: 1) Title, 2) Overview, 3) Key Concepts (bullet points), 4) Important Formulas/Definitions (if applicable), 5) Step-by-step Explanation, 6) Quick Revision Points, 7) Practice Questions (5), 8) Common Mistakes, 9) 24-hour Revision Plan. Keep language simple and exam-focused.',
            },
            {
              role: 'user',
              content: `Generate study notes for: ${topic.trim()}`,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('notes_generation_failed')
      }

      const data = await response.json()
      const notes = data?.choices?.[0]?.message?.content?.trim()

      if (!notes) {
        setNotesError('No notes were generated. Please try a more specific topic.')
        return
      }

      setGeneratedNotes(notes)
    } catch {
      setNotesError('Could not generate notes right now. Check API key/network and try again.')
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

      <main className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16">
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

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={generateStructuredNotes}
              disabled={isGeneratingNotes || !topic.trim()}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGeneratingNotes ? <LoaderCircle size={14} className="animate-spin" /> : <BookOpenCheck size={14} />}
              {isGeneratingNotes ? 'Generating Notes' : 'Generate Structured Notes'}
            </button>
            {!apiKey && <p className="text-xs text-amber-200/90">Set VITE_GROQ_API_KEY in .env.local to enable AI notes.</p>}
          </div>

          {notesError && <p className="mt-3 text-sm text-rose-200">{notesError}</p>}

          {generatedNotes && (
            <article className="mt-4 rounded-2xl border border-cyan-200/20 bg-slate-950/60 p-4">
              <h2 className="font-display text-base font-semibold text-white">Generated Study Notes</h2>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-200">{generatedNotes}</pre>
            </article>
          )}
        </section>
      </main>
    </div>
  )
}

export default GenerateNotesPage
