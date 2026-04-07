import { useMemo, useState } from 'react'
import {
  Award,
  BriefcaseBusiness,
  ChevronRight,
  Clock3,
  ExternalLink,
  Rocket,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { Link } from 'react-router-dom'

function OpportunityHubPage() {
  const filters = ['All', 'Internships', 'Scholarships', 'Competitions', 'Campus Roles']
  const [activeFilter, setActiveFilter] = useState('All')

  const opportunities = useMemo(
    () => [
      {
        title: 'Frontend Developer Internship - Nexora Labs',
        type: 'Internships',
        deadline: 'Apr 18',
        stipend: 'INR 25,000/month',
        mode: 'Remote',
        description: 'Build React interfaces for AI-first products with mentor-led code reviews.',
      },
      {
        title: 'Women in STEM Merit Scholarship',
        type: 'Scholarships',
        deadline: 'Apr 20',
        stipend: 'Up to INR 1,20,000',
        mode: 'National',
        description: 'Support for high-performing students in STEM tracks with leadership goals.',
      },
      {
        title: 'National Innovation Challenge 2026',
        type: 'Competitions',
        deadline: 'Apr 24',
        stipend: 'Prize Pool INR 7,00,000',
        mode: 'Hybrid',
        description: 'Prototype and pitch impactful student solutions for real community problems.',
      },
      {
        title: 'Campus Tech Ambassador Program',
        type: 'Campus Roles',
        deadline: 'Apr 16',
        stipend: 'Certificate + Perks',
        mode: 'On Campus',
        description: 'Lead coding events, coordinate workshops, and grow the student tech ecosystem.',
      },
      {
        title: 'Data Analyst Internship - Vectra Insights',
        type: 'Internships',
        deadline: 'Apr 22',
        stipend: 'INR 18,000/month',
        mode: 'Hybrid',
        description: 'Work with dashboards, KPIs, and model-driven insights in real client projects.',
      },
      {
        title: 'Global Buildathon Student League',
        type: 'Competitions',
        deadline: 'Apr 27',
        stipend: 'Prize Pool USD 10,000',
        mode: 'Online',
        description: '48-hour build sprint with international mentors and startup judges.',
      },
    ],
    [],
  )

  const visibleOpportunities = useMemo(() => {
    if (activeFilter === 'All') {
      return opportunities
    }

    return opportunities.filter((item) => item.type === activeFilter)
  }, [activeFilter, opportunities])

  const typeIcon = (type) => {
    if (type === 'Internships') {
      return BriefcaseBusiness
    }

    if (type === 'Scholarships') {
      return Award
    }

    if (type === 'Competitions') {
      return Trophy
    }

    return Rocket
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
              to="/event-finder"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 transition duration-300 hover:border-cyan-300/55 hover:bg-cyan-300/10"
            >
              Events
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
            Career and Growth Engine
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            Opportunity Hub
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Discover curated internships, scholarships, competitions, and student leadership roles aligned with your
            profile and ambitions.
          </p>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-xl lg:col-span-2">
            <div className="mb-4 flex items-center gap-2 text-cyan-200">
              <Target size={17} />
              <h2 className="font-display text-lg text-white">Opportunity Filters</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveFilter(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
                    activeFilter === item
                      ? 'animate-pulseGlow border border-cyan-300/30 bg-cyan-300/15 text-cyan-100'
                      : 'border border-white/15 bg-white/5 text-slate-300 hover:border-cyan-300/35 hover:text-cyan-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-xl">
            <h2 className="font-display text-lg text-white">This Week</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">14 new opportunities</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">5 deadlines in 3 days</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Top match score: 92%</li>
            </ul>
          </article>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {visibleOpportunities.map((item) => {
            const Icon = typeIcon(item.type)

            return (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-card backdrop-blur-xl transition duration-500 hover:-translate-y-1.5 hover:border-cyan-300/45"
              >
                <div className="absolute inset-0 -z-10 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-300/15 blur-3xl" />
                  <div className="absolute -bottom-12 left-0 h-28 w-28 rounded-full bg-indigo-400/15 blur-2xl" />
                </div>

                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-100">
                  <Icon size={12} />
                  {item.type}
                </div>
                <h3 className="font-display text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.description}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1">
                    <Clock3 size={12} />
                    Deadline: {item.deadline}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1">
                    <Award size={12} />
                    {item.stipend}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1">
                    <Rocket size={12} />
                    {item.mode}
                  </span>
                </div>

                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-1 rounded-full border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition duration-300 hover:-translate-y-0.5 hover:saturate-150"
                >
                  Apply Now
                  <ExternalLink size={14} />
                </button>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}

export default OpportunityHubPage
