import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FilePlus2,
  MessageSquareWarning,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

function ComplaintSupportPage() {
  const tabs = ['All', 'Open', 'In Progress', 'Resolved']
  const [activeTab, setActiveTab] = useState('All')

  const complaints = useMemo(
    () => [
      {
        id: 'C-241',
        title: 'Library AC not working in East Wing',
        category: 'Infrastructure',
        status: 'Open',
        updated: '2 hours ago',
        owner: 'Facilities Team',
      },
      {
        id: 'C-238',
        title: 'Wi-Fi disconnects in Hostel Block B',
        category: 'IT Support',
        status: 'In Progress',
        updated: '40 minutes ago',
        owner: 'Network Cell',
      },
      {
        id: 'C-229',
        title: 'Mess food quality concern',
        category: 'Student Welfare',
        status: 'Resolved',
        updated: '1 day ago',
        owner: 'Mess Committee',
      },
      {
        id: 'C-224',
        title: 'Projector issue in Seminar Hall 2',
        category: 'Classroom Support',
        status: 'In Progress',
        updated: '3 hours ago',
        owner: 'Academic Ops',
      },
      {
        id: 'C-220',
        title: 'Water leakage near parking bay',
        category: 'Maintenance',
        status: 'Resolved',
        updated: '2 days ago',
        owner: 'Maintenance Team',
      },
    ],
    [],
  )

  const filteredComplaints = useMemo(() => {
    if (activeTab === 'All') {
      return complaints
    }

    return complaints.filter((item) => item.status === activeTab)
  }, [activeTab, complaints])

  const getStatusClass = (status) => {
    if (status === 'Open') {
      return 'border-amber-300/40 bg-amber-300/10 text-amber-100'
    }

    if (status === 'In Progress') {
      return 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
    }

    return 'border-emerald-300/40 bg-emerald-300/10 text-emerald-100'
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
            Student Support Console
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            Complaint Support
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Raise concerns, monitor resolution progress, and receive transparent updates from college support teams.
          </p>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-xl lg:col-span-2">
            <div className="mb-4 flex items-center gap-2 text-cyan-200">
              <MessageSquareWarning size={17} />
              <h2 className="font-display text-lg text-white">Track Complaints</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
                    activeTab === tab
                      ? 'animate-pulseGlow border border-cyan-300/30 bg-cyan-300/15 text-cyan-100'
                      : 'border border-white/15 bg-white/5 text-slate-300 hover:border-cyan-300/35 hover:text-cyan-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-xl">
            <h2 className="font-display text-lg text-white">Quick Stats</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">12 total complaints</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">4 in progress</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">7 resolved this week</li>
            </ul>
          </article>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {filteredComplaints.map((item) => (
            <article
              key={item.id}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-card backdrop-blur-xl transition duration-500 hover:-translate-y-1.5 hover:border-cyan-300/45"
            >
              <div className="absolute inset-0 -z-10 opacity-0 transition duration-500 group-hover:opacity-100">
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-300/15 blur-3xl" />
                <div className="absolute -bottom-12 left-0 h-28 w-28 rounded-full bg-indigo-400/15 blur-2xl" />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.id}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-white">{item.title}</h3>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(item.status)}`}>
                  {item.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1">
                  <AlertTriangle size={12} />
                  {item.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1">
                  <Clock3 size={12} />
                  {item.updated}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1">
                  <UserRound size={12} />
                  {item.owner}
                </span>
              </div>

              <button
                type="button"
                className="mt-5 inline-flex items-center rounded-full border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition duration-300 hover:-translate-y-0.5 hover:saturate-150"
              >
                View Details
              </button>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-slate-950/35 p-5 backdrop-blur-xl md:p-6">
          <div className="mb-4 flex items-center gap-2 text-emerald-200">
            <FilePlus2 size={18} />
            <h2 className="font-display text-lg text-white">Raise New Complaint</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 transition duration-300 hover:border-cyan-300/45"
            >
              <MessageSquareWarning size={15} className="text-cyan-300" />
              Infrastructure
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 transition duration-300 hover:border-cyan-300/45"
            >
              <AlertTriangle size={15} className="text-amber-300" />
              IT Support
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 transition duration-300 hover:border-cyan-300/45"
            >
              <ShieldCheck size={15} className="text-emerald-300" />
              Student Welfare
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 transition duration-300 hover:border-cyan-300/45"
            >
              <CheckCircle2 size={15} className="text-indigo-300" />
              Academic Ops
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ComplaintSupportPage
