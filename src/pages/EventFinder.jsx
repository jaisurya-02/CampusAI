import { useEffect, useMemo, useState } from 'react'
import {
  CalendarClock,
  ChevronRight,
  ExternalLink,
  Filter,
  Flame,
  LoaderCircle,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const KNOWAFEST_MARKDOWN_PROXY_URL = '/api/knowafest/events'

function classifyExternalCategory(title) {
  const normalized = title.toLowerCase()

  if (normalized.includes('sports') || normalized.includes('marathon') || normalized.includes('tournament')) {
    return 'Sports'
  }

  if (
    normalized.includes('cultural') ||
    normalized.includes('dance') ||
    normalized.includes('music') ||
    normalized.includes('fest')
  ) {
    return 'Cultural'
  }

  if (
    normalized.includes('workshop') ||
    normalized.includes('bootcamp') ||
    normalized.includes('training') ||
    normalized.includes('fdp')
  ) {
    return 'Workshops'
  }

  return 'Tech'
}

function isValidKnowafestEventLink(link) {
  try {
    const parsedUrl = new URL(link)
    if (parsedUrl.hostname !== 'www.knowafest.com' && parsedUrl.hostname !== 'knowafest.com') {
      return false
    }

    if (!parsedUrl.pathname.includes('/explore/events/')) {
      return false
    }

    if (parsedUrl.pathname === '/explore/events' || parsedUrl.pathname === '/explore/events/') {
      return false
    }

    if (parsedUrl.hash) {
      return false
    }

    return true
  } catch {
    return false
  }
}

function isTechnicalEventTitle(title) {
  const normalized = title.toLowerCase()
  const technicalKeywords = [
    'hackathon',
    'ai',
    'ml',
    'machine learning',
    'developer',
    'coding',
    'code',
    'software',
    'tech',
    'cyber',
    'robot',
    'data',
    'iot',
    'cloud',
    'devops',
    'blockchain',
  ]

  return technicalKeywords.some((keyword) => normalized.includes(keyword))
}

function isKnowafestNoiseRow(title, link, organizer, city) {
  const normalizedTitle = title.toLowerCase().trim()
  const normalizedLink = link.toLowerCase()
  const normalizedOrganizer = organizer.toLowerCase().trim()
  const normalizedCity = city.toLowerCase()

  // Exclude noise rows: empty/invalid titles, section anchors, bad data markers
  if (normalizedTitle === 'these' || normalizedLink.includes('/explore/events#')) {
    return true
  }

  // Exclude entries with malformed location markdown or "The Iconic Meetings" (known bad organizer)
  if (normalizedCity.includes('http') || normalizedOrganizer === 'the iconic meetings') {
    return true
  }

  return false
}

function cleanMarkdownLinks(text) {
  if (!text) return text
  // Remove markdown link syntax: [text](url) → text
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
}

function parseKnowafestEvents(markdown) {
  const events = []
  const seenLinks = new Set()

  // Pattern 1: #### [title](url) followed by category, organizer/college, location, date
  // Format: #### [Event Title](url)
  //         Category text
  //         College/Institute Name
  //         City
  //         - Date
  const pattern1 = /####\s+\[([^\]]+)\]\((https?:\/\/[^\)]+)\)\s*\n+([^\n]*(?:symposium|fest|hackathon|competition|workshop|festival|challenge)[^\n]*)\s*\n+([^\n]+(?:college|institute|university|school)[^\n]*)\s*\n+([^\n]+)\s*\n*-\s*([^\n]+)/gi
  let match = pattern1.exec(markdown)
  
  while (match && events.length < 12) {
    const [, title, link, category, organizer, city, dateText] = match
    const normalizedTitle = title.trim()
    const normalizedLink = link.trim().replace('http://', 'https://')
    const normalizedOrganizer = organizer.trim()
    const normalizedCity = city.trim()
    const normalizedDate = dateText.trim()

    if (!normalizedTitle || normalizedTitle.startsWith('(') || normalizedTitle.startsWith('http')) {
      match = pattern1.exec(markdown)
      continue
    }

    if (!isValidKnowafestEventLink(normalizedLink)) {
      match = pattern1.exec(markdown)
      continue
    }

    if (isKnowafestNoiseRow(normalizedTitle, normalizedLink, normalizedOrganizer, normalizedCity)) {
      match = pattern1.exec(markdown)
      continue
    }

    if (!seenLinks.has(normalizedLink)) {
      seenLinks.add(normalizedLink)
      events.push({
        title: cleanMarkdownLinks(normalizedTitle),
        link: normalizedLink,
        organizer: cleanMarkdownLinks(normalizedOrganizer) || 'Event Organizer',
        city: cleanMarkdownLinks(normalizedCity) || 'Location TBD',
        date: normalizedDate || 'Date TBD',
        category: classifyExternalCategory(normalizedTitle),
        source: 'Knowafest',
      })
    }

    match = pattern1.exec(markdown)
  }

  // Pattern 2: More flexible - #### [title](url) with any organizer line containing college/institute/university
  if (events.length === 0) {
    const pattern2 = /####\s+\[([^\]]+)\]\((https?:\/\/[^\)]+)\)\s*\n+[^\n]*\n+([^\n]*(?:college|institute|university|school)[^\n]*)\s*\n+([^\n]+)\s*\n*-\s*([^\n]+)/gi
    let match2 = pattern2.exec(markdown)
    
    while (match2 && events.length < 12) {
      const [, title, link, organizer, city, dateText] = match2
      const normalizedTitle = title.trim()
      const normalizedLink = link.trim()
      const normalizedOrganizer = organizer.trim()
      const normalizedCity = city.trim()
      const normalizedDate = dateText.trim()

      if (!normalizedTitle || normalizedTitle.startsWith('(') || normalizedTitle.startsWith('http')) {
        match2 = pattern2.exec(markdown)
        continue
      }

      if (!isValidKnowafestEventLink(normalizedLink)) {
        match2 = pattern2.exec(markdown)
        continue
      }

      if (!seenLinks.has(normalizedLink)) {
        seenLinks.add(normalizedLink)
        events.push({
          title: cleanMarkdownLinks(normalizedTitle),
          link: normalizedLink,
          organizer: cleanMarkdownLinks(normalizedOrganizer) || 'Event Organizer',
          city: cleanMarkdownLinks(normalizedCity) || 'Location TBD',
          date: cleanMarkdownLinks(normalizedDate) || 'Date TBD',
          category: classifyExternalCategory(normalizedTitle),
          source: 'Knowafest',
        })
      }

      match2 = pattern2.exec(markdown)
    }
  }

  // Pattern 3: [title](url) with any surrounding college/institute context
  if (events.length === 0) {
    const pattern3 = /\[([^\]]+)\]\((https?:\/\/www\.knowafest\.com\/explore\/events\/[^\)]+)\)/g
    let match3 = pattern3.exec(markdown)
    
    while (match3 && events.length < 12) {
      const [, title, link] = match3
      const normalizedTitle = title.trim()
      const normalizedLink = link.trim()

      if (!normalizedTitle || normalizedTitle.startsWith('(') || normalizedTitle.startsWith('http')) {
        match3 = pattern3.exec(markdown)
        continue
      }

      if (!seenLinks.has(normalizedLink)) {
        seenLinks.add(normalizedLink)
        events.push({
          title: cleanMarkdownLinks(normalizedTitle),
          link: normalizedLink,
          organizer: 'Event Organizer',
          city: 'Online',
          date: 'Upcoming',
          category: classifyExternalCategory(normalizedTitle),
          source: 'Knowafest',
        })
      }

      match3 = pattern3.exec(markdown)
    }
  }

  return events
}

function EventFinderPage() {
  const categories = ['All', 'Tech', 'Cultural', 'Workshops', 'Sports']
  const [activeCategory, setActiveCategory] = useState('All')
  const [externalEvents, setExternalEvents] = useState([])
  const [externalEventsError, setExternalEventsError] = useState('')
  const [isLoadingExternalEvents, setIsLoadingExternalEvents] = useState(true)

  const events = useMemo(
    () => [
      {
        title: 'Future of AI Campus Summit',
        category: 'Tech',
        time: 'Apr 09, 10:00 AM',
        location: 'Innovation Auditorium',
        attendees: '340 going',
        description: 'Panel talks, startup demos, and live AI product showcases by student teams.',
      },
      {
        title: 'Midnight Coding Sprint',
        category: 'Workshops',
        time: 'Apr 11, 08:00 PM',
        location: 'Computer Lab Block C',
        attendees: '172 going',
        description: 'Hands-on sprint for web and ML projects with mentor walkthroughs every hour.',
      },
      {
        title: 'Inter-College Cultural Wave',
        category: 'Cultural',
        time: 'Apr 13, 05:30 PM',
        location: 'Open Air Theater',
        attendees: '520 going',
        description: 'Music, dance, and spoken word performances from 18 invited colleges.',
      },
      {
        title: 'Campus Sports Knockout',
        category: 'Sports',
        time: 'Apr 15, 07:00 AM',
        location: 'Central Sports Arena',
        attendees: '290 going',
        description: 'Fast-paced football and basketball knockout rounds with live commentary.',
      },
      {
        title: 'Startup Pitch Bootcamp',
        category: 'Tech',
        time: 'Apr 18, 02:00 PM',
        location: 'Entrepreneurship Cell',
        attendees: '136 going',
        description: 'Pitch prep, product feedback loops, and mock investor Q&A simulations.',
      },
      {
        title: 'Design Thinking Studio',
        category: 'Workshops',
        time: 'Apr 19, 11:30 AM',
        location: 'Creative Commons Hall',
        attendees: '96 going',
        description: 'Collaborative ideation workshop for solving real campus pain points.',
      },
    ],
    [],
  )

  const visibleEvents = useMemo(() => {
    if (activeCategory === 'All') {
      return events
    }

    return events.filter((event) => event.category === activeCategory)
  }, [activeCategory, events])

  const visibleExternalEvents = useMemo(() => {
    if (activeCategory === 'All') {
      return externalEvents
    }

    return externalEvents.filter((event) => event.category === activeCategory)
  }, [activeCategory, externalEvents])

  useEffect(() => {
    const loadExternalEvents = async () => {
      try {
        setIsLoadingExternalEvents(true)
        setExternalEventsError('')

        const knowafestResult = await fetch(KNOWAFEST_MARKDOWN_PROXY_URL)

        let knowafestEvents = []
        if (knowafestResult.ok) {
          const markdown = await knowafestResult.text()
          knowafestEvents = parseKnowafestEvents(markdown)
        }

        const parsedEvents = [...knowafestEvents]

        if (parsedEvents.length === 0) {
          throw new Error('No upcoming external events found right now.')
        }

        setExternalEvents(parsedEvents)
      } catch (error) {
        setExternalEventsError(error instanceof Error ? error.message : 'Unable to load external events right now.')
      } finally {
        setIsLoadingExternalEvents(false)
      }
    }

    loadExternalEvents()
  }, [])

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
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 transition duration-300 hover:border-cyan-300/55 hover:bg-cyan-300/10"
          >
            Back to Home
            <ChevronRight size={15} />
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16">
        <section>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-100">
            Event Discovery Engine
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            Event Finder
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Explore high-impact events, communities, and experiences happening across campus. Filter what matters,
            join faster, and never miss an opportunity.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-card backdrop-blur-xl md:p-6">
          <div className="mb-4 flex items-center gap-2 text-cyan-200">
            <Filter size={17} />
            <h2 className="font-display text-lg text-white">Filters</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
                  activeCategory === category
                    ? 'animate-pulseGlow border border-cyan-300/30 bg-cyan-300/15 text-cyan-100'
                    : 'border border-white/15 bg-white/5 text-slate-300 hover:border-cyan-300/35 hover:text-cyan-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {visibleEvents.map((event) => (
            <article
              key={event.title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-card backdrop-blur-xl transition duration-500 hover:-translate-y-1.5 hover:border-cyan-300/45"
            >
              <div className="absolute inset-0 -z-10 opacity-0 transition duration-500 group-hover:opacity-100">
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-300/15 blur-3xl" />
                <div className="absolute -bottom-12 left-0 h-28 w-28 rounded-full bg-indigo-400/15 blur-2xl" />
              </div>

              <div className="mb-3 inline-flex rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-100">
                {event.category}
              </div>
              <h3 className="font-display text-xl font-semibold text-white">{event.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{event.description}</p>

              <div className="mt-4 space-y-2 text-sm text-slate-200">
                <p className="flex items-center gap-2">
                  <CalendarClock size={15} className="text-cyan-300" />
                  {event.time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={15} className="text-indigo-300" />
                  {event.location}
                </p>
                <p className="flex items-center gap-2">
                  <Users size={15} className="text-violet-300" />
                  {event.attendees}
                </p>
              </div>

              <button
                type="button"
                className="mt-5 inline-flex items-center rounded-full border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition duration-300 hover:-translate-y-0.5 hover:saturate-150"
              >
                Join Event
              </button>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-slate-950/35 p-5 backdrop-blur-xl md:p-6">
          <div className="mb-3 flex items-center gap-2 text-amber-200">
            <Flame size={18} />
            <h2 className="font-display text-lg text-white">Trending This Week</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['AI Hack League', 'Founders Meet', 'Music Night', 'Data Analytics Sprint', 'Career Fair'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition duration-300 hover:border-cyan-300/45 hover:text-cyan-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2 text-cyan-200">
            <ExternalLink size={18} />
            <h2 className="font-display text-2xl font-semibold text-white">Upcoming External Events</h2>
          </div>

          {isLoadingExternalEvents ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
              <LoaderCircle size={16} className="animate-spin" />
                Loading events from Knowafest...
            </div>
          ) : null}

          {!isLoadingExternalEvents && externalEventsError ? (
            <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4 text-sm text-rose-100">
              {externalEventsError}
            </div>
          ) : null}

          {!isLoadingExternalEvents && !externalEventsError ? (
            <div className="grid gap-5 md:grid-cols-2">
              {visibleExternalEvents.map((event) => (
                <article
                  key={event.link}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-card backdrop-blur-xl"
                >
                  <div className="mb-3 inline-flex rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-100">
                    {event.category}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white">{event.title}</h3>
                  
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">Organizer</p>
                      <p className="mt-1 text-slate-300">{event.organizer}</p>
                    </div>

                    <div className="space-y-2 border-t border-white/10 pt-3">
                      <p className="flex items-center gap-2 text-slate-200">
                        <MapPin size={15} className="text-indigo-300 flex-shrink-0" />
                        <span>{event.city}</span>
                      </p>
                      <p className="flex items-center gap-2 text-slate-200">
                        <CalendarClock size={15} className="text-cyan-300 flex-shrink-0" />
                        <span>{event.date}</span>
                      </p>
                    </div>
                  </div>

                  <a
                    href={event.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition duration-300 hover:-translate-y-0.5 hover:saturate-150"
                  >
                    View Event
                    <ExternalLink size={14} />
                  </a>
                </article>
              ))}
            </div>
          ) : null}

          {!isLoadingExternalEvents && !externalEventsError && visibleExternalEvents.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
              No external events matched the selected filter.
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}

export default EventFinderPage
