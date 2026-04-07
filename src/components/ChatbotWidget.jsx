import { useMemo, useState } from 'react'
import { Bot, LoaderCircle, MessageCircle, SendHorizontal, X } from 'lucide-react'
import { buildCampusContextPrompt, getLocalGroundedReply } from '../data/campusKnowledge.js'

const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi! I am your CampusAI assistant. Ask me about events, academics, internships, or campus support.',
    },
  ])

  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  const hasApiKey = Boolean(apiKey)

  const conversationForApi = useMemo(
    () =>
      messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    [messages],
  )

  const campusContextPrompt = useMemo(() => buildCampusContextPrompt(), [])

  const sendMessage = async (event) => {
    event.preventDefault()

    if (!input.trim() || isSending) {
      return
    }

    if (!hasApiKey) {
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: 'Missing API key. Add VITE_GROQ_API_KEY in .env.local and restart the dev server.' },
      ])
      return
    }

    const userMessage = { role: 'user', content: input.trim() }
    const nextMessages = [...messages, userMessage]
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    setMessages(nextMessages)
    setInput('')
    setIsSending(true)

    const localReply = getLocalGroundedReply(userMessage.content)
    if (localReply) {
      await wait(900)
      setMessages((current) => [...current, { role: 'assistant', content: localReply }])
      setIsSending(false)
      return
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.5,
          max_tokens: 500,
          messages: [
            {
              role: 'system',
              content:
                'You are CampusAI, a concise and helpful college assistant. Think through the user question internally, then answer clearly in short actionable points. Use only the campus data context provided. If requested information is not in that context, clearly say it is not available in the current website data and suggest asking about available modules.',
            },
            {
              role: 'system',
              content: campusContextPrompt,
            },
            ...conversationForApi,
            userMessage,
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('Groq API request failed')
      }

      const data = await response.json()
      const assistantText = data?.choices?.[0]?.message?.content?.trim()

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: assistantText || 'I could not generate a response. Please try again.',
        },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'I could not connect right now. Please check your API key and network, then try again.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3">
      {isOpen ? (
        <section className="w-[92vw] max-w-sm overflow-hidden rounded-3xl border border-cyan-200/25 bg-slate-950/80 shadow-glow backdrop-blur-xl">
          <header className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2 text-cyan-100">
              <Bot size={17} />
              <p className="font-display text-sm font-semibold tracking-wide">CampusAI Chat</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-white/15 p-1.5 text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200"
              aria-label="Close chat"
            >
              <X size={14} />
            </button>
          </header>

          <div className="h-80 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((message, index) => (
              <article
                key={`message-${index}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'ml-auto border border-cyan-300/40 bg-cyan-300/20 text-cyan-50'
                    : 'border border-white/10 bg-white/5 text-slate-100'
                }`}
              >
                {message.content}
              </article>
            ))}
            {isSending && (
              <article className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                <LoaderCircle size={14} className="animate-spin" />
                <span>CampusAI is thinking</span>
                <span className="thinking-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </article>
            )}
          </div>

          <form onSubmit={sendMessage} className="border-t border-white/10 p-3">
            <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-slate-900/70 p-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={2}
                placeholder="Ask about campus events, study plans, or opportunities..."
                className="h-14 flex-1 resize-none border-none bg-transparent px-2 text-sm text-slate-100 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-300/20 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <SendHorizontal size={16} />
              </button>
            </div>
            {!hasApiKey && (
              <p className="mt-2 text-xs text-amber-200/90">
                API key missing. Set VITE_GROQ_API_KEY in .env.local
              </p>
            )}
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="chat-launcher group relative inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-slate-950/80 px-4 py-2.5 text-sm font-semibold text-white shadow-glow backdrop-blur-xl transition duration-300 hover:-translate-y-1"
      >
        <span className="chat-launcher-ripple" aria-hidden="true" />
        <span className="chat-launcher-orb" aria-hidden="true">
          <span className="chat-launcher-orb-core" />
        </span>
        <MessageCircle size={16} className="relative z-10 text-cyan-100 transition group-hover:scale-110" />
        <span className="relative z-10">AI Chat</span>
        <span className="chat-launcher-dot" aria-hidden="true" />
      </button>
    </div>
  )
}

export default ChatbotWidget
