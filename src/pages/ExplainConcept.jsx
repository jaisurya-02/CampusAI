import { useState } from 'react'
import { BookOpenCheck, ChevronRight, Lightbulb, LoaderCircle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const LEVEL_RULES = {
  Beginner: {
    overviewWords: 90,
    breakdownItems: 6,
    mistakeItems: 4,
    quickChecks: 4,
    answerWords: 10,
    codeLines: 8,
  },
  Intermediate: {
    overviewWords: 130,
    breakdownItems: 8,
    mistakeItems: 5,
    quickChecks: 5,
    answerWords: 14,
    codeLines: 12,
  },
  Advanced: {
    overviewWords: 170,
    breakdownItems: 10,
    mistakeItems: 6,
    quickChecks: 6,
    answerWords: 18,
    codeLines: 16,
  },
}

function ExplainConceptPage() {
  const [concept, setConcept] = useState('')
  const [level, setLevel] = useState('Beginner')
  const [generatedExplanation, setGeneratedExplanation] = useState(null)
  const [expandedQuickCheck, setExpandedQuickCheck] = useState(null)
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  const leetcodeMap = [
    {
      keywords: ['recursion'],
      problem: 'Generate Parentheses',
      url: 'https://leetcode.com/problems/generate-parentheses/',
      reason: 'It uses recursive exploration and backtracking to build valid combinations.',
    },
    {
      keywords: ['binary search', 'searching'],
      problem: 'Binary Search',
      url: 'https://leetcode.com/problems/binary-search/',
      reason: 'It directly tests the divide-and-conquer idea behind binary search.',
    },
    {
      keywords: ['linked list', 'linkedlist'],
      problem: 'Reverse Linked List',
      url: 'https://leetcode.com/problems/reverse-linked-list/',
      reason: 'It reinforces pointer manipulation in linked lists.',
    },
    {
      keywords: ['stack'],
      problem: 'Valid Parentheses',
      url: 'https://leetcode.com/problems/valid-parentheses/',
      reason: 'It is a classic stack-based problem for matching and ordering.',
    },
    {
      keywords: ['queue'],
      problem: 'Implement Queue using Stacks',
      url: 'https://leetcode.com/problems/implement-queue-using-stacks/',
      reason: 'It helps you understand queue behavior through stack simulation.',
    },
    {
      keywords: ['tree', 'binary tree', 'bst', 'trie'],
      problem: 'Binary Tree Level Order Traversal',
      url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
      reason: 'It tests tree traversal and level-wise processing.',
    },
    {
      keywords: ['graph', 'dfs', 'bfs', 'graph traversal'],
      problem: 'Number of Islands',
      url: 'https://leetcode.com/problems/number-of-islands/',
      reason: 'It is a standard graph traversal problem using DFS or BFS.',
    },
    {
      keywords: ['hash', 'hash table', 'hashmap', 'hash map'],
      problem: 'Two Sum',
      url: 'https://leetcode.com/problems/two-sum/',
      reason: 'It is the go-to hashing problem for fast lookup patterns.',
    },
    {
      keywords: ['dp', 'dynamic programming'],
      problem: 'Climbing Stairs',
      url: 'https://leetcode.com/problems/climbing-stairs/',
      reason: 'It is a simple entry point to dynamic programming transitions.',
    },
    {
      keywords: ['greedy'],
      problem: 'Jump Game',
      url: 'https://leetcode.com/problems/jump-game/',
      reason: 'It tests greedy decision-making and reachability.',
    },
    {
      keywords: ['backtracking'],
      problem: 'Subsets',
      url: 'https://leetcode.com/problems/subsets/',
      reason: 'It is a clean backtracking problem for exploring choices.',
    },
    {
      keywords: ['heap', 'priority queue'],
      problem: 'Top K Frequent Elements',
      url: 'https://leetcode.com/problems/top-k-frequent-elements/',
      reason: 'It tests heap usage and frequency ordering.',
    },
  ]

  const isProgrammingConcept = (value) => {
    const query = value.toLowerCase()
    const keywords = [
      'programming',
      'code',
      'coding',
      'algorithm',
      'data structure',
      'datastructure',
      'array',
      'linked list',
      'stack',
      'queue',
      'tree',
      'graph',
      'recursion',
      'backtracking',
      'dp',
      'dynamic programming',
      'sorting',
      'searching',
      'binary search',
      'hash',
      'heap',
      'pointer',
      'linkedlist',
      'leetcode',
      'leetcode problem',
      'binary tree',
      'bst',
      'trie',
      'greedy',
      'graph traversal',
      'dfs',
      'bfs',
    ]

    return keywords.some((keyword) => query.includes(keyword))
  }

  const parseResponse = (rawContent) => {
    const cleaned = rawContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim()

    const escapeControlCharsInStrings = (value) => {
      let output = ''
      let inString = false
      let escaped = false

      for (const character of value) {
        if (inString) {
          if (escaped) {
            output += character
            escaped = false
            continue
          }

          if (character === '\\') {
            output += character
            escaped = true
            continue
          }

          if (character === '"') {
            output += character
            inString = false
            continue
          }

          if (character === '\n') {
            output += '\\n'
            continue
          }

          if (character === '\r') {
            output += '\\r'
            continue
          }

          if (character === '\t') {
            output += '\\t'
            continue
          }
        } else if (character === '"') {
          output += character
          inString = true
          continue
        }

        output += character
      }

      return output
    }

    try {
      return JSON.parse(cleaned)
    } catch {
      try {
        return JSON.parse(escapeControlCharsInStrings(cleaned))
      } catch {
        // fall through to brace-based recovery below
      }

      const firstBrace = cleaned.indexOf('{')
      const lastBrace = cleaned.lastIndexOf('}')

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const recovered = cleaned.slice(firstBrace, lastBrace + 1)
        try {
          return JSON.parse(escapeControlCharsInStrings(recovered))
        } catch {
          return JSON.parse(recovered)
        }
      }

      throw new Error('invalid_explanation_payload')
    }
  }

  const normalizeTextList = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (item && typeof item === 'object') {
            return String(item.question || item.prompt || item.text || item.value || '').trim()
          }

          return String(item).trim()
        })
        .filter(Boolean)
    }

    if (typeof value === 'string') {
      return value
        .split(/\n|;|\s(?=\d+\.)/)
        .map((item) => item.replace(/^[-*\d.\s]+/, '').trim())
        .filter(Boolean)
    }

    return []
  }

  const normalizeQuickCheckList = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (item && typeof item === 'object') {
            return {
              question: String(item.question || item.prompt || item.text || '').trim(),
              answer: String(item.answer || item.response || '').trim(),
            }
          }

          return {
            question: String(item).trim(),
            answer: '',
          }
        })
        .filter((item) => item.question)
    }

    if (typeof value === 'string') {
      return value
        .split(/\n|;|\s(?=\d+\.)/)
        .map((item) => item.replace(/^[-*\d.\s]+/, '').trim())
        .filter(Boolean)
        .map((item) => ({ question: item, answer: '' }))
    }

    return []
  }

  const normalizeExplanation = (payload) => ({
    title: String(payload?.title || 'Concept Explanation'),
    overview: String(payload?.overview || ''),
    simpleBreakdown: normalizeTextList(payload?.simpleBreakdown ?? payload?.breakdown ?? payload?.keyPoints),
    realWorldExample: String(payload?.realWorldExample || payload?.example || ''),
    analogy: String(payload?.analogy || ''),
    formulaOrRule: String(payload?.formulaOrRule || payload?.formula || ''),
    commonMistakes: normalizeTextList(payload?.commonMistakes ?? payload?.mistakes),
    quickCheck: normalizeQuickCheckList(payload?.quickCheck ?? payload?.quiz ?? payload?.recapQuestions),
    studyTip: String(payload?.studyTip || ''),
    suggestedLeetcodeProblem: String(
      payload?.suggestedLeetcodeProblem || payload?.leetcodeProblem || payload?.practiceProblem || '',
    ),
    suggestedLeetcodeUrl: String(payload?.suggestedLeetcodeUrl || payload?.leetcodeUrl || ''),
    sampleCode: String(payload?.sampleCode || payload?.codeSample || payload?.exampleCode || ''),
  })

  const getLeetcodeSuggestion = (value) => {
    const query = value.toLowerCase()

    return (
      leetcodeMap.find((entry) => entry.keywords.some((keyword) => query.includes(keyword))) || {
        problem: 'Two Sum',
        url: 'https://leetcode.com/problems/two-sum/',
        reason: 'It is a simple and widely applicable starting point for algorithmic practice.',
      }
    )
  }

  const generateExplanation = async () => {
    if (!concept.trim() || isGenerating) {
      return
    }

    if (!apiKey) {
      setError('Missing API key. Add VITE_GROQ_API_KEY in .env.local and restart the dev server.')
      return
    }

    setError('')
    setGeneratedExplanation(null)
    setIsGenerating(true)

    const programmingTopic = isProgrammingConcept(concept)
    const leetcodeSuggestion = programmingTopic ? getLeetcodeSuggestion(concept) : null
    const levelRule = LEVEL_RULES[level] || LEVEL_RULES.Beginner

    const hasLevelDepth = (result) => {
      const overviewWords = result.overview.split(/\s+/).filter(Boolean).length
      const quickAnswersLongEnough = result.quickCheck.every(
        (item) => item.answer.split(/\s+/).filter(Boolean).length >= levelRule.answerWords,
      )
      const codeLineCount = result.sampleCode
        ? result.sampleCode.split('\n').map((line) => line.trim()).filter(Boolean).length
        : 0

      return (
        overviewWords >= levelRule.overviewWords &&
        result.simpleBreakdown.length >= levelRule.breakdownItems &&
        result.commonMistakes.length >= levelRule.mistakeItems &&
        result.quickCheck.length >= levelRule.quickChecks &&
        quickAnswersLongEnough &&
        (!programmingTopic || codeLineCount >= levelRule.codeLines)
      )
    }

    const buildSystemPrompt = (strictMode) => {
      const depthRule = `Depth requirements for ${level} level: overview at least ${levelRule.overviewWords} words, simpleBreakdown at least ${levelRule.breakdownItems} points, commonMistakes at least ${levelRule.mistakeItems} points, quickCheck at least ${levelRule.quickChecks} question-answer pairs, each quickCheck answer at least ${levelRule.answerWords} words. ${programmingTopic ? `sampleCode must be at least ${levelRule.codeLines} non-empty lines.` : ''}`
      const strictRule = strictMode
        ? 'IMPORTANT: Do not return short output. Every section must satisfy depth requirements exactly.'
        : 'Try to provide full and rich content for all sections.'

      return `You are an expert teacher. Return ONLY valid JSON with this exact schema and no extra text: {"title":"string","overview":"string","simpleBreakdown":["string"],"realWorldExample":"string","analogy":"string","formulaOrRule":"string","commonMistakes":["string"],"quickCheck":[{"question":"string","answer":"string"}],"studyTip":"string","suggestedLeetcodeProblem":"string","suggestedLeetcodeUrl":"string","sampleCode":"string"}. Rules: tailor depth to learner level and keep structure strict. Every quickCheck item must include both a question and a short answer. ${programmingTopic ? 'Since topic is programming, include one relevant LeetCode problem, direct URL, and a runnable sampleCode snippet.' : 'Since topic is not programming, set suggestedLeetcodeProblem, suggestedLeetcodeUrl, and sampleCode to empty strings.'} ${depthRule} ${strictRule}`
    }

    const userPrompt = `${programmingTopic ? 'This is a programming/data-structures/algorithms topic.' : 'This is a general academic topic.'} Explain the concept "${concept.trim()}" for a ${level.toLowerCase()} learner. Include a complete and detailed study explanation, not a short summary. ${programmingTopic && leetcodeSuggestion ? `Use this LeetCode problem for the suggestion: ${leetcodeSuggestion.problem} (${leetcodeSuggestion.url}). Include a sample code snippet that illustrates the concept.` : 'Do not include a LeetCode practice problem or sample code.'} For quickCheck, return question/answer pairs that can be tapped to reveal the answer.`

    const requestExplanation = async (strictMode) => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: strictMode ? 0.2 : 0.25,
          max_tokens: 3800,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(strictMode),
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
        const apiMessage = errorPayload?.error?.message || `Concept explanation failed (${response.status})`
        throw new Error(apiMessage)
      }

      const data = await response.json()
      const rawText = data?.choices?.[0]?.message?.content?.trim()

      if (!rawText) {
        throw new Error('Empty AI response received.')
      }

      return rawText
    }

    const repairExplanationJson = async (brokenJson) => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0,
          max_tokens: 3800,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You repair malformed JSON. Return ONLY valid JSON and keep the same meaning/content. Output must follow this exact schema: {"title":"string","overview":"string","simpleBreakdown":["string"],"realWorldExample":"string","analogy":"string","formulaOrRule":"string","commonMistakes":["string"],"quickCheck":[{"question":"string","answer":"string"}],"studyTip":"string","suggestedLeetcodeProblem":"string","suggestedLeetcodeUrl":"string","sampleCode":"string"}. Do not add markdown or comments.',
            },
            {
              role: 'user',
              content: `Repair this malformed JSON:\n${brokenJson}`,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('Could not repair malformed explanation JSON.')
      }

      const data = await response.json()
      const repairedRaw = data?.choices?.[0]?.message?.content?.trim()

      if (!repairedRaw) {
        throw new Error('Empty JSON repair response.')
      }

      return repairedRaw
    }

    try {
      let rawText = await requestExplanation(false)
      let normalized

      try {
        normalized = normalizeExplanation(parseResponse(rawText))
      } catch {
        const repairedRaw = await repairExplanationJson(rawText)
        normalized = normalizeExplanation(parseResponse(repairedRaw))
      }

      if (!hasLevelDepth(normalized)) {
        rawText = await requestExplanation(true)
        try {
          normalized = normalizeExplanation(parseResponse(rawText))
        } catch {
          const repairedRaw = await repairExplanationJson(rawText)
          normalized = normalizeExplanation(parseResponse(repairedRaw))
        }
      }

      if (!normalized.overview || !normalized.simpleBreakdown.length) {
        throw new Error('AI response did not contain a usable explanation.')
      }

      if (!programmingTopic) {
        normalized.suggestedLeetcodeProblem = ''
        normalized.suggestedLeetcodeUrl = ''
        normalized.sampleCode = ''
      } else if (leetcodeSuggestion) {
        normalized.suggestedLeetcodeProblem = normalized.suggestedLeetcodeProblem || `${leetcodeSuggestion.problem} - ${leetcodeSuggestion.reason}`
        normalized.suggestedLeetcodeUrl = normalized.suggestedLeetcodeUrl || leetcodeSuggestion.url
      }

      setExpandedQuickCheck(null)
      setGeneratedExplanation(normalized)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Could not explain the concept.'
      setError(message)
    } finally {
      setIsGenerating(false)
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

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16">
        <section>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-100">
            AI Concept Explainer
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            Explain Concept
          </h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Type any topic or theory, choose your level, and get a structured explanation with examples, analogies,
            quick checks, and common mistakes.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-950/35 p-5 backdrop-blur-xl md:p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label htmlFor="concept" className="block text-sm font-semibold text-cyan-100">
                Concept or topic
              </label>
              <textarea
                id="concept"
                value={concept}
                onChange={(event) => setConcept(event.target.value)}
                rows={4}
                placeholder="Example: quicksort, recursion, binary search trees, photosynthesis"
                className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300/50"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <label className="block text-xs uppercase tracking-wide text-slate-300">Learner level</label>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

              <button
                type="button"
                onClick={generateExplanation}
                disabled={isGenerating || !concept.trim()}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? <LoaderCircle size={14} className="animate-spin" /> : <BookOpenCheck size={14} />}
                {isGenerating ? 'Explaining...' : 'Explain Concept'}
              </button>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-rose-200">{error}</p>}
          {!apiKey && <p className="mt-3 text-xs text-amber-200/90">Set VITE_GROQ_API_KEY in .env.local to enable AI explanation.</p>}
        </section>

        {generatedExplanation && (
          <section className="mt-8 grid gap-4 xl:grid-cols-12">
            <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-300/10 to-indigo-500/10 p-5 xl:col-span-8">
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
                <Lightbulb size={14} /> Main Idea
              </p>
              <h2 className="font-display text-2xl font-semibold text-white">{generatedExplanation.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">{generatedExplanation.overview}</p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 xl:col-span-4">
              <h3 className="font-display text-lg text-white">Formula or Rule</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">{generatedExplanation.formulaOrRule || 'Not provided.'}</p>
            </article>

            {generatedExplanation.sampleCode ? (
              <article className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 xl:col-span-12">
                <h3 className="font-display text-lg text-white">Sample Code</h3>
                <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm leading-relaxed text-slate-100">
                  <code>{generatedExplanation.sampleCode}</code>
                </pre>
              </article>
            ) : null}

            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 xl:col-span-7">
              <h3 className="font-display text-lg text-white">Simple Breakdown</h3>
              <ol className="mt-3 space-y-2 text-sm text-slate-200">
                {generatedExplanation.simpleBreakdown.map((item, index) => (
                  <li key={`breakdown-${index}`} className="rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                    {index + 1}. {item}
                  </li>
                ))}
              </ol>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 xl:col-span-5">
              <h3 className="font-display text-lg text-white">Real World Example</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">{generatedExplanation.realWorldExample || 'Not provided.'}</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-cyan-100">
                <span className="font-semibold">Analogy:</span> {generatedExplanation.analogy || 'Not provided.'}
              </div>
              {generatedExplanation.suggestedLeetcodeProblem ? (
                <div className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm text-emerald-100">
                  <span className="font-semibold">LeetCode practice:</span> {generatedExplanation.suggestedLeetcodeProblem}
                  {generatedExplanation.suggestedLeetcodeUrl ? (
                    <a
                      href={generatedExplanation.suggestedLeetcodeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200/30 bg-emerald-200/10 px-3 py-1.5 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-200/20"
                    >
                      Open LeetCode Problem
                      <ChevronRight size={13} />
                    </a>
                  ) : null}
                </div>
              ) : null}
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 xl:col-span-6">
              <h3 className="font-display text-lg text-white">Common Mistakes</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {generatedExplanation.commonMistakes.map((item, index) => (
                  <li key={`mistake-${index}`} className="rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                    • {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 xl:col-span-6">
              <h3 className="font-display text-lg text-white">Quick Check</h3>
              <ol className="mt-3 space-y-2 text-sm text-slate-200">
                {generatedExplanation.quickCheck.map((item, index) => (
                  <li key={`check-${index}`} className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/45">
                    <button
                      type="button"
                      onClick={() => setExpandedQuickCheck((current) => (current === index ? null : index))}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-white/5"
                    >
                      <span>
                        {index + 1}. {item.question || item}
                      </span>
                      <span className="text-xs text-cyan-200">{expandedQuickCheck === index ? 'Hide' : 'Show'}</span>
                    </button>
                    {expandedQuickCheck === index ? (
                      <div className="border-t border-white/10 px-3 py-2 text-sm text-cyan-100">
                        <span className="font-semibold text-white">Answer:</span>{' '}
                        {item.answer || 'No answer provided.'}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
              <p className="mt-4 rounded-2xl border border-cyan-200/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
                <span className="font-semibold">Study tip:</span> {generatedExplanation.studyTip || 'Review the concept in short cycles and test yourself.'}
              </p>
            </article>
          </section>
        )}
      </main>
    </div>
  )
}

export default ExplainConceptPage
