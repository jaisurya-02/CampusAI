import { useMemo, useState } from 'react'
import { BellRing, ChevronRight, CircleAlert, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const timeframeData = {
  '24H': {
    stats: [
      { label: 'Active Students', value: '612', delta: '+5.2% vs yesterday' },
      { label: 'Event Engagement', value: '74%', delta: '+2.1% today' },
      { label: 'Resolved Complaints', value: '18', delta: '91% closure' },
      { label: 'Opportunity Matches', value: '93', delta: '+21 in 24h' },
    ],
    bars: [36, 42, 38, 49, 57, 61, 59, 66, 73, 70, 79, 84],
  },
  '7D': {
    stats: [
      { label: 'Active Students', value: '1,842', delta: '+12.4% this week' },
      { label: 'Event Engagement', value: '78%', delta: '+8.1% this week' },
      { label: 'Resolved Complaints', value: '264', delta: '94% resolution rate' },
      { label: 'Opportunity Matches', value: '526', delta: '+67 this week' },
    ],
    bars: [32, 46, 38, 64, 58, 75, 68, 82, 74, 90, 86, 93],
  },
  '30D': {
    stats: [
      { label: 'Active Students', value: '5,904', delta: '+19.3% this month' },
      { label: 'Event Engagement', value: '81%', delta: '+10.7% this month' },
      { label: 'Resolved Complaints', value: '1,028', delta: '95% resolution rate' },
      { label: 'Opportunity Matches', value: '2,094', delta: '+301 this month' },
    ],
    bars: [28, 33, 40, 47, 54, 61, 68, 74, 79, 84, 88, 95],
  },
}

function DashboardPage() {
  const [timeframe, setTimeframe] = useState('7D')

  const heatmap = useMemo(
    () => [22, 35, 18, 45, 60, 52, 40, 70, 82, 66, 57, 74, 29, 12, 33, 48, 64, 79, 53, 44, 39, 62, 71, 58],
    [],
  )

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
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-100">
                Analytics Command Center
              </p>
              <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                Campus Dashboard
              </h1>
              <p className="mt-4 max-w-2xl text-slate-300">
                Monitor engagement, support health, and growth opportunities across the campus ecosystem.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {['24H', '7D', '30D'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTimeframe(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
                    timeframe === item
                      ? 'animate-pulseGlow border border-cyan-300/30 bg-cyan-300/15 text-cyan-100'
                      : 'border border-white/15 bg-white/5 text-slate-300 hover:border-cyan-300/35 hover:text-cyan-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-xl md:p-7">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {timeframeData[timeframe].stats.map((stat) => (
              <article key={stat.label} className="flex min-h-[128px] flex-col justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{stat.label}</p>
                <p className="mt-2 font-display text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-emerald-300">{stat.delta}</p>
              </article>
            ))}
          </div>

          <div className="grid items-stretch gap-5 lg:grid-cols-3">
            <article className="flex min-h-[350px] flex-col rounded-2xl border border-white/10 bg-slate-950/40 p-5 lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg text-white">Performance Trend</h3>
                <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                  {timeframe} View
                </span>
              </div>
              <div className="mt-5 flex h-44 items-end gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                {timeframeData[timeframe].bars.map((height, idx) => (
                  <div key={`perf-${idx}`} className="group flex h-full flex-1 items-end justify-center">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-indigo-500/90 to-cyan-300/90 transition duration-300 group-hover:from-cyan-300 group-hover:to-indigo-300"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
            </article>

            <article className="flex min-h-[350px] flex-col rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <h3 className="font-display text-lg text-white">Campus Pulse Score</h3>
              <div className="mt-5 flex flex-1 items-center justify-center">
                <div
                  className="relative grid h-32 w-32 place-items-center rounded-full"
                  style={{ background: 'conic-gradient(rgba(103,232,249,0.9) 0 299deg, rgba(255,255,255,0.12) 299deg 360deg)' }}
                >
                  <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-950 text-center">
                    <p className="font-display text-2xl text-white">83</p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Excellent</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 space-y-2 text-xs text-slate-300">
                <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Engagement: High</p>
                <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Response SLA: 1.8 hrs</p>
                <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Drop-off Risk: Low</p>
              </div>
            </article>
          </div>

          <div className="grid items-stretch gap-5 xl:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 xl:col-span-2">
              <h3 className="font-display text-lg text-white">Student Activity Heatmap</h3>
              <div className="mt-4 grid grid-cols-12 gap-1.5">
                {heatmap.map((intensity, idx) => (
                  <span
                    key={`heat-${idx}`}
                    className="h-5 rounded-sm"
                    style={{ backgroundColor: `rgba(34, 211, 238, ${0.12 + intensity / 100})` }}
                  />
                ))}
              </div>
            </article>

            <article className="flex min-h-[220px] flex-col rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <h3 className="font-display text-lg text-white">Smart Notifications</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2">
                  <CircleAlert className="mt-0.5 h-4 w-4 text-cyan-300" />
                  14 opportunity matches refreshed in the last 3 hours
                </li>
                <li className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2">
                  <CircleAlert className="mt-0.5 h-4 w-4 text-violet-300" />
                  Complaint resolution SLA breached in Hostel Block B
                </li>
                <li className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2">
                  <CircleAlert className="mt-0.5 h-4 w-4 text-emerald-300" />
                  Event RSVP spike detected for Startup Expo
                </li>
              </ul>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
