export const campusKnowledge = {
  events: [
    {
      title: 'Future of AI Campus Summit',
      category: 'Tech',
      time: 'Apr 09, 10:00 AM',
      location: 'Innovation Auditorium',
      attendees: '340 going',
    },
    {
      title: 'Midnight Coding Sprint',
      category: 'Workshops',
      time: 'Apr 11, 08:00 PM',
      location: 'Computer Lab Block C',
      attendees: '172 going',
    },
    {
      title: 'Inter-College Cultural Wave',
      category: 'Cultural',
      time: 'Apr 13, 05:30 PM',
      location: 'Open Air Theater',
      attendees: '520 going',
    },
    {
      title: 'Campus Sports Knockout',
      category: 'Sports',
      time: 'Apr 15, 07:00 AM',
      location: 'Central Sports Arena',
      attendees: '290 going',
    },
    {
      title: 'Startup Pitch Bootcamp',
      category: 'Tech',
      time: 'Apr 18, 02:00 PM',
      location: 'Entrepreneurship Cell',
      attendees: '136 going',
    },
    {
      title: 'Design Thinking Studio',
      category: 'Workshops',
      time: 'Apr 19, 11:30 AM',
      location: 'Creative Commons Hall',
      attendees: '96 going',
    },
  ],
  opportunities: [
    {
      title: 'Frontend Developer Internship - Nexora Labs',
      type: 'Internships',
      deadline: 'Apr 18',
      mode: 'Remote',
    },
    {
      title: 'Women in STEM Merit Scholarship',
      type: 'Scholarships',
      deadline: 'Apr 20',
      mode: 'National',
    },
    {
      title: 'National Innovation Challenge 2026',
      type: 'Competitions',
      deadline: 'Apr 24',
      mode: 'Hybrid',
    },
    {
      title: 'Campus Tech Ambassador Program',
      type: 'Campus Roles',
      deadline: 'Apr 16',
      mode: 'On Campus',
    },
    {
      title: 'Data Analyst Internship - Vectra Insights',
      type: 'Internships',
      deadline: 'Apr 22',
      mode: 'Hybrid',
    },
    {
      title: 'Global Buildathon Student League',
      type: 'Competitions',
      deadline: 'Apr 27',
      mode: 'Online',
    },
  ],
  complaints: [
    {
      id: 'C-241',
      title: 'Library AC not working in East Wing',
      status: 'Open',
      owner: 'Facilities Team',
    },
    {
      id: 'C-238',
      title: 'Wi-Fi disconnects in Hostel Block B',
      status: 'In Progress',
      owner: 'Network Cell',
    },
    {
      id: 'C-229',
      title: 'Mess food quality concern',
      status: 'Resolved',
      owner: 'Mess Committee',
    },
    {
      id: 'C-224',
      title: 'Projector issue in Seminar Hall 2',
      status: 'In Progress',
      owner: 'Academic Ops',
    },
    {
      id: 'C-220',
      title: 'Water leakage near parking bay',
      status: 'Resolved',
      owner: 'Maintenance Team',
    },
  ],
  studyResources: [
    {
      title: 'Calculus Revision Sprint',
      subject: 'Mathematics',
      eta: '25 min',
    },
    {
      title: 'DSA Problem Ladder',
      subject: 'Programming',
      eta: '45 min',
    },
    {
      title: 'Digital Circuits Cheatsheet',
      subject: 'Electronics',
      eta: '18 min',
    },
    {
      title: 'Mechanics Crash Deck',
      subject: 'Physics',
      eta: '22 min',
    },
    {
      title: 'Object-Oriented Design Drill',
      subject: 'Programming',
      eta: '30 min',
    },
    {
      title: 'Probability Rapid Recap',
      subject: 'Mathematics',
      eta: '20 min',
    },
  ],
}

export function buildCampusContextPrompt() {
  const events = campusKnowledge.events
    .map((item) => `${item.title} | ${item.category} | ${item.time} | ${item.location}`)
    .join('\n')

  const opportunities = campusKnowledge.opportunities
    .map((item) => `${item.title} | ${item.type} | deadline ${item.deadline} | ${item.mode}`)
    .join('\n')

  const complaints = campusKnowledge.complaints
    .map((item) => `${item.id} | ${item.title} | ${item.status} | ${item.owner}`)
    .join('\n')

  const study = campusKnowledge.studyResources
    .map((item) => `${item.title} | ${item.subject} | ${item.eta}`)
    .join('\n')

  return [
    'Campus data context (use these exact items when asked):',
    'Events:',
    events,
    'Opportunities:',
    opportunities,
    'Complaints:',
    complaints,
    'Study resources:',
    study,
  ].join('\n')
}

export function getLocalGroundedReply(input) {
  const query = input.toLowerCase()

  const eventKeywordMap = {
    tech: 'Tech',
    workshop: 'Workshops',
    workshops: 'Workshops',
    cultural: 'Cultural',
    sports: 'Sports',
  }

  const pickedEventCategory = Object.entries(eventKeywordMap).find(([keyword]) => query.includes(keyword))?.[1]

  if (query.includes('upcoming event') || query.includes('events') || query.includes('event finder')) {
    const scopedEvents = pickedEventCategory
      ? campusKnowledge.events.filter((item) => item.category === pickedEventCategory)
      : campusKnowledge.events

    const list = scopedEvents
      .slice(0, 6)
      .map((item) => `- ${item.title} (${item.time}, ${item.location})`)
      .join('\n')

    const header = pickedEventCategory
      ? `Here are upcoming ${pickedEventCategory.toLowerCase()} events from Event Finder:`
      : 'Here are the upcoming events from Event Finder:'

    const tip = scopedEvents[0]
      ? `\n\nRecommended next step: start with ${scopedEvents[0].title} since it appears first in the current campus schedule.`
      : '\n\nI could not find a matching event category in current data. You can ask for all events.'

    return `${header}\n${list || '- No matching events right now'}${tip}`
  }

  if (query.includes('internship') || query.includes('scholarship') || query.includes('opportunit')) {
    const scoped = query.includes('internship')
      ? campusKnowledge.opportunities.filter((item) => item.type === 'Internships')
      : query.includes('scholarship')
        ? campusKnowledge.opportunities.filter((item) => item.type === 'Scholarships')
        : campusKnowledge.opportunities

    const list = scoped
      .map((item) => `- ${item.title} (${item.type}, deadline ${item.deadline})`)
      .join('\n')

    return `Based on the Opportunity Hub data, here are the best matches for your query:\n${list}\n\nTip: prioritize opportunities with the nearest deadline first.`
  }

  if (query.includes('complaint') || query.includes('issue') || query.includes('support')) {
    const list = campusKnowledge.complaints
      .map((item) => `- ${item.id}: ${item.title} [${item.status}]`)
      .join('\n')

    const openCount = campusKnowledge.complaints.filter((item) => item.status !== 'Resolved').length

    return `Here are the complaint updates currently shown:\n${list}\n\nCurrent support load insight: ${openCount} complaints still need active follow-up.`
  }

  if (query.includes('study') || query.includes('subject') || query.includes('revision')) {
    const subject = query.includes('math')
      ? 'Mathematics'
      : query.includes('program') || query.includes('dsa')
        ? 'Programming'
        : query.includes('electronic')
          ? 'Electronics'
          : query.includes('physics')
            ? 'Physics'
            : null

    const scoped = subject
      ? campusKnowledge.studyResources.filter((item) => item.subject === subject)
      : campusKnowledge.studyResources

    const list = scoped
      .map((item) => `- ${item.title} (${item.subject}, ${item.eta})`)
      .join('\n')

    return `Here is a focused study response from your Study Assistant data:\n${list}\n\nSuggested flow: begin with the shortest ETA item to build momentum.`
  }

  if (query.includes('what can you do') || query.includes('help me') || query.includes('how can you help')) {
    return 'I can answer using your CampusAI website data for: upcoming events, study resources, complaint status, and opportunity deadlines. Try asking: "Show upcoming tech events" or "Any internships with nearby deadlines?"'
  }

  return null
}
