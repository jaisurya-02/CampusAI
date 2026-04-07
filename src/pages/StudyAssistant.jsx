import { useMemo, useState } from 'react'
import {
  BookOpenCheck,
  Brain,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Target,
} from 'lucide-react'
import { Link } from 'react-router-dom'

function StudyAssistantPage() {
  const subjects = ['All', 'Mathematics', 'Programming', 'Electronics', 'Physics']
  const [activeSubject, setActiveSubject] = useState('All')

  const resources = useMemo(
    () => [
      {
        title: 'Calculus Revision Sprint',
        subject: 'Mathematics',
        type: 'Quick Notes',
        eta: '25 min',
        description: 'Limits, derivatives, integration shortcuts, and exam-style solved examples.',
      },
      {
        title: 'DSA Problem Ladder',
        subject: 'Programming',
        type: 'Practice Set',
        eta: '45 min',
        description: 'Curated arrays, trees, and graph drills with ascending complexity.',
      },
      {
        title: 'Digital Circuits Cheatsheet',
        subject: 'Electronics',
        type: 'Summary',
        eta: '18 min',
        description: 'K-maps, logic simplification, and common gate-level exam traps.',
      },
      {
        title: 'Mechanics Crash Deck',
        subject: 'Physics',
        type: 'Flashcards',
        eta: '22 min',
        description: 'Force systems, rotational dynamics, and high-yield formulas.',
      },
      {
        title: 'Object-Oriented Design Drill',
        subject: 'Programming',
        type: 'Concept Trainer',
        eta: '30 min',
        description: 'Solidify OOP with practical mini-scenarios and quiz checkpoints.',
      },
      {
        title: 'Probability Rapid Recap',
        subject: 'Mathematics',
        type: 'Mind Map',
        eta: '20 min',
        description: 'Distributions, Bayes theorem, and intuitive probability flowcharts.',
      },
    ],
    [],
  )

  const filteredResources = useMemo(() => {
    if (activeSubject === 'All') {
      return resources
    }

    return resources.filter((resource) => resource.subject === activeSubject)
  }, [activeSubject, resources])

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
              to="/event-finder"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 transition duration-300 hover:border-cyan-300/55 hover:bg-cyan-300/10"
            >
              Event Finder
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
            AI Learning Companion
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            Study Assistant
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Organize revisions, focus on weak topics, and maintain a high-impact study flow with guided learning
            blocks and smart recommendations.
          </p>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-xl lg:col-span-2">
            <div className="mb-4 flex items-center gap-2 text-cyan-200">
              <Target size={17} />
              <h2 className="font-display text-lg text-white">Focus Subjects</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => setActiveSubject(subject)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
                    activeSubject === subject
                      ? 'animate-pulseGlow border border-cyan-300/30 bg-cyan-300/15 text-cyan-100'
                      : 'border border-white/15 bg-white/5 text-slate-300 hover:border-cyan-300/35 hover:text-cyan-200'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-xl">
            <h2 className="font-display text-lg text-white">Today Plan</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">8:00 PM · Revise linear algebra</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">9:00 PM · Solve 5 DSA medium questions</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">10:00 PM · Physics mock quiz</li>
            </ul>
          </article>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {filteredResources.map((resource) => (
            <article
              key={resource.title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-card backdrop-blur-xl transition duration-500 hover:-translate-y-1.5 hover:border-cyan-300/45"
            >
              <div className="absolute inset-0 -z-10 opacity-0 transition duration-500 group-hover:opacity-100">
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-300/15 blur-3xl" />
                <div className="absolute -bottom-12 left-0 h-28 w-28 rounded-full bg-indigo-400/15 blur-2xl" />
              </div>

              <div className="mb-3 inline-flex rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-100">
                {resource.subject}
              </div>
              <h3 className="font-display text-xl font-semibold text-white">{resource.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{resource.description}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1">
                  <FileText size={12} />
                  {resource.type}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1">
                  <Clock3 size={12} />
                  {resource.eta}
                </span>
              </div>

              <button
                type="button"
                className="mt-5 inline-flex items-center rounded-full border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition duration-300 hover:-translate-y-0.5 hover:saturate-150"
              >
                Start Session
              </button>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-slate-950/35 p-5 backdrop-blur-xl md:p-6">
          <div className="mb-3 flex items-center gap-2 text-emerald-200">
            <Brain size={18} />
            <h2 className="font-display text-lg text-white">Quick Study Tools</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/generate-notes"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 transition duration-300 hover:border-cyan-300/45"
            >
              <BookOpenCheck size={15} className="text-cyan-300" />
              Generate Notes
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 transition duration-300 hover:border-cyan-300/45"
            >
              <GraduationCap size={15} className="text-indigo-300" />
              Mock Test
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 transition duration-300 hover:border-cyan-300/45"
            >
              <Lightbulb size={15} className="text-violet-300" />
              Explain Concept
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 transition duration-300 hover:border-cyan-300/45"
            >
              <Brain size={15} className="text-cyan-300" />
              Flashcard Mode
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default StudyAssistantPage
