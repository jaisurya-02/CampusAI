import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Sparkles,
  FlipHorizontal,
  LoaderCircle,
  BookOpenCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { campusKnowledge } from '../data/campusKnowledge.js'

const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

const localDecks = {
  Mathematics: [
    {
      front: 'What is a limit?',
      back: 'A limit describes the value a function approaches as the input approaches a specific point.',
      hint: 'Think of approaching without necessarily touching.',
    },
    {
      front: 'What is a derivative?',
      back: 'A derivative measures the instantaneous rate of change of a function.',
      hint: 'Slope of the tangent line.',
    },
    {
      front: 'What is integration?',
      back: 'Integration is the process of finding the accumulated quantity or area under a curve.',
      hint: 'Reverse of differentiation in many cases.',
    },
  ],
  Programming: [
    {
      front: 'What is recursion?',
      back: 'Recursion is when a function calls itself to solve a smaller version of the same problem.',
      hint: 'Base case is essential.',
    },
    {
      front: 'What is a stack?',
      back: 'A stack is a LIFO data structure where the last inserted element is removed first.',
      hint: 'Push and pop operations.',
    },
    {
      front: 'What is a hash map?',
      back: 'A hash map stores key-value pairs and enables fast average-case lookups.',
      hint: 'Uses a hash function.',
    },
  ],
  Electronics: [
    {
      front: 'What is a logic gate?',
      back: 'A logic gate is a digital circuit that performs a Boolean operation on one or more inputs.',
      hint: 'AND, OR, NOT are examples.',
    },
    {
      front: 'What is a Karnaugh map?',
      back: 'A Karnaugh map is a visual tool for simplifying Boolean expressions.',
      hint: 'Used for minimization.',
    },
    {
      front: 'What is a flip-flop?',
      back: 'A flip-flop is a bistable circuit that stores one bit of data.',
      hint: 'Memory element.',
    },
  ],
  Physics: [
    {
      front: 'What is Newton’s second law?',
      back: 'Force equals mass times acceleration: F = ma.',
      hint: 'Relationship between force and motion.',
    },
    {
      front: 'What is momentum?',
      back: 'Momentum is the product of mass and velocity.',
      hint: 'p = mv',
    },
    {
      front: 'What is work?',
      back: 'Work is the energy transferred by a force acting through a distance.',
      hint: 'Force plus displacement.',
    },
  ],
}

function FlashcardModePage() {
  const [topic, setTopic] = useState('Programming')
  const [cardCount, setCardCount] = useState(8)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [deck, setDeck] = useState(localDecks.Programming)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [transitionState, setTransitionState] = useState(null)
  const transitionTimerRef = useRef(null)

  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  const subjectPresets = useMemo(
    () => campusKnowledge.studyResources.map((item) => item.subject).filter((subject, index, array) => array.indexOf(subject) === index),
    [],
  )

  const normalizeCards = (payload) => {
    const cards = Array.isArray(payload?.cards) ? payload.cards : []

    return cards
      .map((card) => ({
        front: String(card?.front || card?.question || '').trim(),
        back: String(card?.back || card?.answer || '').trim(),
        hint: String(card?.hint || '').trim(),
      }))
      .filter((card) => card.front && card.back)
  }

  const hasSufficientCardQuality = (cards) => {
    if (!cards.length) return false

    const qualityCount = cards.filter((card) => {
      const frontWords = card.front.split(/\s+/).filter(Boolean).length
      const backWords = card.back.split(/\s+/).filter(Boolean).length
      return frontWords >= 3 && backWords >= 6
    }).length

    return qualityCount >= Math.max(3, Math.ceil(cards.length * 0.7))
  }

  const parseResponse = (rawContent) => {
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

      throw new Error('invalid_flashcard_payload')
    }
  }

  const currentCard = deck[activeIndex]
  const progress = deck.length ? ((activeIndex + 1) / deck.length) * 100 : 0

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current)
      }
    }
  }, [])

  const clearCardTransition = () => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current)
      transitionTimerRef.current = null
    }

    setTransitionState(null)
  }

  const animateCardChange = (nextIndex, direction) => {
    if (!deck.length || nextIndex === activeIndex) {
      return
    }

    clearCardTransition()
    setIsFlipped(false)
    setTransitionState({ fromIndex: activeIndex, toIndex: nextIndex, direction, animate: false })

    requestAnimationFrame(() => {
      setTransitionState((current) => (current ? { ...current, animate: true } : current))
    })

    transitionTimerRef.current = setTimeout(() => {
      setActiveIndex(nextIndex)
      setTransitionState(null)
      transitionTimerRef.current = null
    }, 320)
  }

  const handlePreset = (subject) => {
    clearCardTransition()
    setTopic(subject)
    const presetDeck = localDecks[subject] || localDecks.Programming
    setDeck(presetDeck)
    setActiveIndex(0)
    setIsFlipped(false)
    setError('')
  }

  const generateFlashcards = async () => {
    if (!apiKey) {
      setError('Missing API key. Add VITE_GROQ_API_KEY in .env.local and restart the dev server.')
      return
    }

    if (!topic.trim()) {
      setError('Choose a topic first.')
      return
    }

    setIsGenerating(true)
    clearCardTransition()
    setError('')
    setIsFlipped(false)
    setActiveIndex(0)

    try {
      const requestFlashcards = async (strictMode = false) => {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: MODEL,
            temperature: strictMode ? 0.2 : 0.25,
            max_tokens: strictMode ? 950 : 700,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content:
                  'You are a study assistant. Return ONLY valid JSON with this exact schema and no extra text: {"title":"string","cards":[{"front":"string","back":"string","hint":"string"}]}. Rules: each front MUST be a complete question sentence (minimum 3 words), never one-word labels like "Definition". Each back must be a clear, self-contained explanation (minimum 1-2 full sentences). Keep answers concise but informative.',
              },
              {
                role: 'user',
                content: `Create ${cardCount} flashcards for the topic "${topic.trim()}". Make them concise, suitable for active recall, and avoid long explanations. If it is a programming topic, include definition, key idea, and code-oriented cards when relevant. If it is not programming-related, keep them concept-focused.${strictMode ? ' Rewrite weak cards so every question is complete and specific.' : ''}`,
              },
            ],
          }),
        })

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null)
          const apiMessage =
            response.status === 429
              ? 'Groq token limit reached for today. Try again later or use the preset decks for now.'
              : errorPayload?.error?.message || `Flashcard generation failed (${response.status})`
          throw new Error(apiMessage)
        }

        const data = await response.json()
        const rawText = data?.choices?.[0]?.message?.content?.trim()

        if (!rawText) {
          throw new Error('Empty AI response received.')
        }

        const parsed = parseResponse(rawText)
        return normalizeCards(parsed)
      }

      let generatedCards = await requestFlashcards(false)

      if (!hasSufficientCardQuality(generatedCards)) {
        generatedCards = await requestFlashcards(true)
      }

      if (!generatedCards.length || !hasSufficientCardQuality(generatedCards)) {
        throw new Error('AI returned incomplete cards. Please try again for a better deck.')
      }

      setDeck(generatedCards.slice(0, cardCount))
    } catch (generationError) {
      const message = generationError instanceof Error ? generationError.message : 'Could not generate flashcards.'
      setError(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const nextCard = () => {
    if (!deck.length) return
    const nextIndex = (activeIndex + 1) % deck.length
    animateCardChange(nextIndex, 1)
  }

  const previousCard = () => {
    if (!deck.length) return
    const nextIndex = (activeIndex - 1 + deck.length) % deck.length
    animateCardChange(nextIndex, -1)
  }

  const shuffleDeck = () => {
    clearCardTransition()
    const shuffled = [...deck].sort(() => Math.random() - 0.5)
    setDeck(shuffled)
    setActiveIndex(0)
    setIsFlipped(false)
  }

  const renderFlashcard = (card, flipped = false) => (
    <div
      className="relative min-h-[240px] rounded-[1.75rem] border border-white/10 bg-slate-950/45 transition-transform duration-500 ease-out [transform-style:preserve-3d]"
      style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
    >
      <div className="absolute inset-0 rounded-[1.75rem] p-5 [backface-visibility:hidden]">
        <div className="flex h-full flex-col justify-between gap-4">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-100">
              Question
            </p>
            <h3 className="font-display text-xl leading-tight text-white md:text-2xl">{card.front}</h3>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 rounded-[1.75rem] p-5 [backface-visibility:hidden]" style={{ transform: 'rotateY(180deg)' }}>
        <div className="flex h-full flex-col justify-between gap-4">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-emerald-200/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-100">
              Answer
            </p>
            <h3 className="font-display text-xl leading-tight text-white md:text-2xl">{card.back}</h3>
            {card.hint ? (
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                <span className="font-semibold text-cyan-100">Hint:</span> {card.hint}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
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
            AI Flashcard Mode
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            Flashcard Mode
          </h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Turn a topic into an active-recall flashcard deck. Use presets for quick revision or generate a custom deck from any subject.
          </p>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-card backdrop-blur-xl lg:col-span-2">
            <div className="mb-4 flex items-center gap-2 text-cyan-200">
              <BookOpenCheck size={17} />
              <h2 className="font-display text-lg text-white">Deck Builder</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-cyan-100">Topic / Subject</label>
                <input
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="Example: Recursion, Operating Systems, Photosynthesis"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cyan-100">Number of cards</label>
                <input
                  type="number"
                  min={4}
                  max={20}
                  value={cardCount}
                  onChange={(event) => setCardCount(Number(event.target.value || 8))}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {subjectPresets.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => handlePreset(subject)}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-100 transition hover:border-cyan-300/45 hover:text-cyan-100"
                >
                  {subject}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generateFlashcards}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? <LoaderCircle size={14} className="animate-spin" /> : <BookOpenCheck size={14} />}
                {isGenerating ? 'Generating Deck' : 'Generate Flashcards'}
              </button>

              <button
                type="button"
                onClick={shuffleDeck}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan-300/45"
              >
                <Shuffle size={14} className="text-cyan-300" />
                Shuffle Deck
              </button>
            </div>

            {error && <p className="mt-3 text-sm text-rose-200">{error}</p>}
            {!apiKey && <p className="mt-3 text-xs text-amber-200/90">Set VITE_GROQ_API_KEY in .env.local to enable AI flashcards.</p>}
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-xl">
            <h2 className="font-display text-lg text-white">How It Works</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Pick a topic or preset subject.</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Generate a deck of concise flashcards.</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Flip cards to test recall.</li>
              <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Shuffle for random revision.</li>
            </ul>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-950/35 p-5 backdrop-blur-xl md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Current Deck</p>
              <h2 className="font-display text-2xl text-white">{topic.trim() || 'Programming'}</h2>
            </div>
            <div className="text-sm text-slate-300">
              {deck.length ? `${activeIndex + 1} / ${deck.length}` : '0 / 0'}
            </div>
          </div>

          <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-indigo-500" style={{ width: `${progress}%` }} />
          </div>

          {currentCard ? (
            <article className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-slate-950/60 p-5 shadow-card backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-cyan-200">
                <span>{topic.trim() || 'Preset deck'}</span>
                <button
                  type="button"
                  onClick={() => setIsFlipped((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-slate-100 transition hover:border-cyan-300/45"
                >
                  <FlipHorizontal size={13} />
                  Flip Card
                </button>
              </div>

              <div className="mt-5 [perspective:1600px]">
                <div className="relative min-h-[240px] overflow-hidden rounded-[1.75rem]">
                  {transitionState ? (
                    <>
                      <div
                        className="absolute inset-0 transition-all duration-300 ease-out"
                        style={{
                          transform: `translateX(${transitionState.animate ? -transitionState.direction * 110 : 0}%)`,
                          opacity: transitionState.animate ? 0 : 1,
                        }}
                      >
                        {renderFlashcard(deck[transitionState.fromIndex], false)}
                      </div>

                      <div
                        className="absolute inset-0 transition-all duration-300 ease-out"
                        style={{
                          transform: `translateX(${transitionState.animate ? 0 : transitionState.direction * 110}%)`,
                          opacity: transitionState.animate ? 1 : 0,
                        }}
                      >
                        {renderFlashcard(deck[transitionState.toIndex], false)}
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0">{renderFlashcard(currentCard, isFlipped)}</div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={previousCard}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan-300/45"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={nextCard}
                    className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:saturate-150"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-slate-300">
              No cards available yet. Generate a deck to begin.
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default FlashcardModePage
