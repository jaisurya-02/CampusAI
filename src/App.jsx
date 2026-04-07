import { useEffect, useMemo, useState } from 'react'
import {
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  CircleAlert,
  Compass,
  GraduationCap,
  MessageSquareText,
  Sparkles,
} from 'lucide-react'
import { Navigate, Route, Routes, Link, useLocation } from 'react-router-dom'
import EventFinderPage from './pages/EventFinder.jsx'
import StudyAssistantPage from './pages/StudyAssistant.jsx'
import GenerateNotesPage from './pages/GenerateNotes.jsx'
import MockTestGeneratorPage from './pages/MockTestGenerator.jsx'
import ExplainConceptPage from './pages/ExplainConcept.jsx'
import ComplaintSupportPage from './pages/ComplaintSupport.jsx'
import OpportunityHubPage from './pages/OpportunityHub.jsx'
import DashboardPage from './pages/Dashboard.jsx'
import ChatbotWidget from './components/ChatbotWidget.jsx'

function HomePage() {
  const subtitleText = 'Your Smart Companion for Campus Life'

  const featureCards = useMemo(
    () => [
      {
        icon: CalendarDays,
        title: 'Event Finder',
        description: 'Discover college events, clubs, hackathons, and social activities tailored to your interests.',
        cta: 'Open Event Finder',
        path: '/event-finder',
      },
      {
        icon: GraduationCap,
        title: 'Study Assistant',
        description: 'Get instant support with notes, topic explanations, and smart study plans for every semester.',
        cta: 'Open Study Assistant',
        path: '/study-assistant',
      },
      {
        icon: MessageSquareText,
        title: 'Complaint Support',
        description: 'Raise issues, track updates, and get transparent responses with streamlined digital support.',
        cta: 'Open Complaint Support',
        path: '/complaint-support',
      },
      {
        icon: BriefcaseBusiness,
        title: 'Opportunity Hub',
        description: 'Find internships, scholarships, competitions, and campus opportunities in one place.',
        cta: 'Open Opportunity Hub',
        path: '/opportunity-hub',
      },
    ],
    [],
  )

  const tabData = useMemo(
    () => ({
      Events: {
        title: 'Campus Events Pulse',
        description: 'Track live events, RSVP instantly, and receive AI-ranked suggestions based on your vibe.',
        items: ['Tech Fest in 2 days', 'Design Club meetup', 'Open mic night in amphitheater'],
      },
      Academics: {
        title: 'Academic Accelerator',
        description: 'Generate revision plans, summarize lectures, and pinpoint weak topics before exams.',
        items: ['Maths quick revision roadmap', 'AI lab assignment checklist', '3 pending notes synced'],
      },
      Opportunities: {
        title: 'Future Opportunity Feed',
        description: 'Stay ahead with curated internships, scholarships, and competitions matched to your profile.',
        items: ['Frontend internship applications open', 'Research grant deadline tomorrow', 'National coding challenge'],
      },
    }),
    [],
  )

  const testimonials = useMemo(
    () => [
      {
        name: 'Aarav M.',
        role: 'Computer Science, 3rd Year',
        review: 'CampusAI helped me discover opportunities I would have missed. The dashboard feels like a personal command center.',
      },
      {
        name: 'Meera S.',
        role: 'Electronics, 2nd Year',
        review: 'The Study Assistant made exam prep much less stressful. I love how fast and intuitive everything is.',
      },
      {
        name: 'Rohan T.',
        role: 'Mechanical, Final Year',
        review: 'Complaint tracking is finally transparent. It feels like the campus finally listens and responds quickly.',
      },
    ],
    [],
  )

  const [activeTab, setActiveTab] = useState('Events')
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [typedSubtitle, setTypedSubtitle] = useState('')
  const [typingDirection, setTypingDirection] = useState('forward')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typingDirection === 'forward') {
        if (typedSubtitle.length < subtitleText.length) {
          setTypedSubtitle(subtitleText.slice(0, typedSubtitle.length + 1))
        } else {
          setTypingDirection('pause')
        }
      } else if (typingDirection === 'pause') {
        setTypingDirection('backward')
      } else if (typedSubtitle.length > 0) {
        setTypedSubtitle(subtitleText.slice(0, typedSubtitle.length - 1))
      } else {
        setTypingDirection('forward')
      }
    }, typingDirection === 'pause' ? 1100 : typingDirection === 'forward' ? 55 : 32)

    return () => clearTimeout(timer)
  }, [typedSubtitle, typingDirection, subtitleText])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length)
    }, 3800)

    return () => clearInterval(timer)
  }, [testimonials.length])

  return (
    <div className="relative overflow-x-hidden bg-[#060814] text-slate-100 selection:bg-cyan-300/40 selection:text-white">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(125,79,255,0.45)_0%,_rgba(40,99,255,0)_65%)] blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(20,215,255,0.24)_0%,_rgba(0,0,0,0)_66%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(113,69,255,0.18)_10%,_rgba(0,0,0,0)_65%)] blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            // Procedurally place subtle particles for a dynamic hero ambiance.
            key={`particle-${i}`}
            className="particle"
            style={{
              left: `${(i * 9.5) % 100}%`,
              top: `${(i * 13) % 100}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${8 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-3 font-display text-xl font-bold tracking-wide text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-indigo-500 text-slate-950 shadow-glow">
              <Sparkles size={18} />
            </span>
            CampusAI
          </div>
          <ul className="hidden items-center gap-7 text-sm text-slate-200/90 md:flex">
            {['Home', 'Features', 'About'].map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase()}`}
                  className="transition duration-300 hover:text-cyan-300"
                >
                  {link}
                </a>
              </li>
            ))}
            <li>
              <Link to="/dashboard" className="transition duration-300 hover:text-cyan-300">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/event-finder" className="transition duration-300 hover:text-cyan-300">
                Events
              </Link>
            </li>
            <li>
              <Link to="/study-assistant" className="transition duration-300 hover:text-cyan-300">
                Study
              </Link>
            </li>
            <li>
              <Link to="/complaint-support" className="transition duration-300 hover:text-cyan-300">
                Complaints
              </Link>
            </li>
            <li>
              <Link to="/opportunity-hub" className="transition duration-300 hover:text-cyan-300">
                Opportunities
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 md:px-8 md:pb-24">
        <section id="home" className="pt-20 md:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.24em] text-cyan-100">
              Next-Gen Campus Intelligence
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
              AI College Assistant
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
              {typedSubtitle}
              <span className="ml-0.5 inline-block h-5 w-[2px] animate-pulse bg-cyan-200/90 align-middle" />
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#features"
                className="group inline-flex items-center rounded-full border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-7 py-3.5 font-medium text-white shadow-glow transition duration-300 hover:-translate-y-1 hover:saturate-150"
              >
                Explore Features
              </a>
              <Link
                to="/study-assistant"
                className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-medium text-slate-100 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-cyan-300/60 hover:bg-cyan-300/10"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="pt-20 md:pt-24">
          <div className="mb-8 flex items-center gap-3 text-cyan-200">
            <Compass className="h-5 w-5" />
            <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">Smart Features</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {featureCards.map((card) => {
              const Icon = card.icon

              return (
                <article
                  key={card.title}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-card backdrop-blur-xl transition duration-500 hover:-translate-y-1.5 hover:border-cyan-300/45"
                >
                  <div className="absolute inset-0 -z-10 opacity-0 transition duration-500 group-hover:opacity-100">
                    <div className="absolute -right-24 -top-24 h-44 w-44 rounded-full bg-cyan-300/15 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-indigo-400/15 blur-2xl" />
                  </div>
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200/30 bg-cyan-300/10 text-cyan-200 transition duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{card.description}</p>
                  {card.path ? (
                    <Link
                      to={card.path}
                      className="mt-4 inline-flex items-center rounded-full border border-cyan-200/35 bg-cyan-300/10 px-4 py-2 text-xs font-semibold tracking-wide text-cyan-100 transition duration-300 hover:border-cyan-200/60 hover:bg-cyan-300/20"
                    >
                      {card.cta}
                    </Link>
                  ) : (
                    <span className="mt-4 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-slate-300">
                      {card.cta}
                    </span>
                  )}
                </article>
              )
            })}
          </div>
        </section>

        <section id="dashboard" className="pt-20 md:pt-24">
          <div className="mb-8 flex items-center gap-3 text-indigo-200">
            <BellRing className="h-5 w-5" />
            <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">Dashboard Preview</h2>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-xl md:p-7">
            <div className="grid gap-5 lg:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 lg:col-span-2">
                <h3 className="font-display text-lg text-white">Analytics Snapshot</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Engagement', value: '78%' },
                    { label: 'Resolved Issues', value: '264' },
                    { label: 'Opportunity Hits', value: '526' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
                      <p className="mt-2 font-display text-2xl text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex h-24 items-end gap-2">
                  {[40, 52, 48, 64, 71, 67, 78].map((height, idx) => (
                    <div
                      key={`mini-perf-${idx}`}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-500/90 to-cyan-300/90"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <h3 className="font-display text-lg text-white">Open Dashboard</h3>
                <p className="mt-3 text-sm text-slate-300">
                  Explore full analytics, timeframe filters, trend charts, heatmaps, and smart campus notifications.
                </p>
                <Link
                  to="/dashboard"
                  className="mt-5 inline-flex items-center rounded-full border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition duration-300 hover:-translate-y-0.5 hover:saturate-150"
                >
                  Open Full Dashboard
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section id="about" className="pt-20 md:pt-24">
          <div className="mb-8 flex items-center gap-3 text-emerald-200">
            <Sparkles className="h-5 w-5" />
            <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">Interactive Feed</h2>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-xl md:p-7">
            <div className="flex flex-wrap gap-3">
              {Object.keys(tabData).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition duration-300 ${
                    activeTab === tab
                      ? 'animate-pulseGlow border border-cyan-300/30 bg-cyan-300/15 text-cyan-100'
                      : 'border border-white/15 bg-white/5 text-slate-300 hover:border-cyan-300/35 hover:text-cyan-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/35 p-5 transition duration-500">
              <h3 className="font-display text-xl text-white">{tabData[activeTab].title}</h3>
              <p className="mt-2 text-sm text-slate-300">{tabData[activeTab].description}</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {tabData[activeTab].items.map((item) => (
                  <li key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="pt-20 md:pt-24">
          <h2 className="mb-8 text-center font-display text-2xl font-semibold text-white md:text-3xl">
            Student Feedback
          </h2>
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-xl md:p-7">
            <div
              className="flex items-stretch transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
            >
              {testimonials.map((item) => (
                <article key={item.name} className="flex h-full min-h-[210px] w-full flex-shrink-0 flex-col justify-between px-1">
                  <p className="min-h-[96px] text-lg leading-relaxed text-slate-100">"{item.review}"</p>
                  <div className="mt-6">
                    <p className="font-display text-base font-semibold text-cyan-200">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-300">{item.role}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  type="button"
                  aria-label={`Go to testimonial ${idx + 1}`}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === activeTestimonial ? 'w-8 bg-cyan-300' : 'w-2.5 bg-slate-500 hover:bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/40 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-slate-300 md:flex-row md:px-8">
          <p>CampusAI © 2026. Designed for modern campus life.</p>
          <div className="flex items-center gap-5">
            {['Instagram', 'LinkedIn', 'X', 'YouTube'].map((item) => (
              <a key={item} href="#" className="transition duration-300 hover:text-cyan-300">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('route-enter')

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('route-exit')
    }
  }, [location, displayLocation])

  useEffect(() => {
    if (transitionStage === 'route-exit') {
      const timer = setTimeout(() => {
        setDisplayLocation(location)
        setTransitionStage('route-enter')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 220)

      return () => clearTimeout(timer)
    }

    return undefined
  }, [transitionStage, location])

  return (
    <>
      <div className={`route-shell ${transitionStage}`}>
        <Routes location={displayLocation}>
          <Route path="/" element={<HomePage />} />
          <Route path="/event-finder" element={<EventFinderPage />} />
          <Route path="/study-assistant" element={<StudyAssistantPage />} />
          <Route path="/generate-notes" element={<GenerateNotesPage />} />
          <Route path="/mock-test" element={<MockTestGeneratorPage />} />
          <Route path="/explain-concept" element={<ExplainConceptPage />} />
          <Route path="/complaint-support" element={<ComplaintSupportPage />} />
          <Route path="/opportunity-hub" element={<OpportunityHubPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <ChatbotWidget />
    </>
  )
}

export default App
