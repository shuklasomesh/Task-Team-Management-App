import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Send, MessageSquare, Loader2, ShieldCheck } from 'lucide-react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'

function formatMsgTime(sentAt) {
  const date = typeof sentAt === 'string' ? parseISO(sentAt) : new Date(sentAt)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`
  return format(date, 'MMM d, HH:mm')
}

function formatDayLabel(sentAt) {
  const date = typeof sentAt === 'string' ? parseISO(sentAt) : new Date(sentAt)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

function Avatar({ name, role }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const isAdmin = role === 'ADMIN'
  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
      isAdmin ? 'bg-gradient-to-br from-violet-500 to-violet-700' : 'bg-gradient-to-br from-indigo-500 to-indigo-700'
    }`}>
      {initials}
    </div>
  )
}

function DayDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-white/5" />
      <span className="text-xs text-gray-600 font-medium px-2">{label}</span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  )
}

export default function Chat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const lastIdRef = useRef(null)
  const inputRef = useRef(null)
  const pollRef = useRef(null)

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  const loadInitial = useCallback(async () => {
    try {
      const { data } = await chatApi.getMessages()
      setMessages(data)
      if (data.length > 0) lastIdRef.current = data[data.length - 1].id
    } catch {}
    finally { setLoading(false) }
  }, [])

  const pollNew = useCallback(async () => {
    if (!lastIdRef.current) return
    try {
      const { data } = await chatApi.getMessages(lastIdRef.current)
      if (data.length > 0) {
        setMessages(prev => [...prev, ...data])
        lastIdRef.current = data[data.length - 1].id
      }
    } catch {}
  }, [])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  useEffect(() => {
    if (!loading) scrollToBottom(false)
  }, [loading, scrollToBottom])

  useEffect(() => {
    pollRef.current = setInterval(pollNew, 4000)
    return () => clearInterval(pollRef.current)
  }, [pollNew])

  useEffect(() => {
    if (messages.length > 0) scrollToBottom()
  }, [messages.length, scrollToBottom])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setSending(true)
    try {
      const { data } = await chatApi.sendMessage(text)
      setMessages(prev => [...prev, data])
      lastIdRef.current = data.id
    } catch {}
    finally { setSending(false); inputRef.current?.focus() }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // Group messages by sender for consecutive bubble grouping
  const grouped = messages.reduce((acc, msg, i) => {
    const prev = messages[i - 1]
    const isSameSender = prev?.sender?.id === msg.sender?.id
    const prevTime = prev ? parseISO(prev.sentAt) : null
    const currTime = parseISO(msg.sentAt)
    const withinMinute = prevTime && (currTime - prevTime) < 60000

    acc.push({ ...msg, showAvatar: !isSameSender || !withinMinute, showDayLabel: !prev || formatDayLabel(msg.sentAt) !== formatDayLabel(prev.sentAt) })
    return acc
  }, [])

  const isMe = (senderId) => senderId === user?.id

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="glass p-4 mb-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center border border-violet-500/20">
          <MessageSquare className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h1 className="font-bold text-white text-sm">Team Chat</h1>
          <p className="text-xs text-gray-500">All members • updates every 4s</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="online-dot" /> Live
        </div>
      </div>

      {/* Messages */}
      <div className="glass flex-1 overflow-y-auto p-4 space-y-0.5 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-violet-400/50" />
            </div>
            <p className="text-gray-500 text-sm">No messages yet.</p>
            <p className="text-gray-600 text-xs">Say something to your team!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {grouped.map((msg) => {
              const mine = isMe(msg.sender?.id)
              return (
                <div key={msg.id}>
                  {msg.showDayLabel && <DayDivider label={formatDayLabel(msg.sentAt)} />}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-end gap-2 mb-1 ${mine ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar — only show if first in a group */}
                    <div className="w-8 flex-shrink-0">
                      {msg.showAvatar && !mine && <Avatar name={msg.sender?.name} role={msg.sender?.role} />}
                    </div>

                    <div className={`flex flex-col max-w-[70%] ${mine ? 'items-end' : 'items-start'}`}>
                      {/* Sender name on first of group */}
                      {msg.showAvatar && !mine && (
                        <div className="flex items-center gap-1.5 mb-1 ml-1">
                          <span className="text-xs font-semibold text-gray-300">{msg.sender?.name}</span>
                          {msg.sender?.role === 'ADMIN' && (
                            <span className="flex items-center gap-0.5 text-xs text-violet-400">
                              <ShieldCheck className="w-3 h-3" /> Admin
                            </span>
                          )}
                        </div>
                      )}

                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                        mine
                          ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-md'
                          : 'bg-white/8 text-gray-100 border border-white/8 rounded-bl-md'
                      }`}>
                        {msg.content}
                      </div>
                      <span className={`text-xs text-gray-600 mt-1 px-1 ${mine ? 'text-right' : 'text-left'}`}>
                        {formatMsgTime(msg.sentAt)}
                      </span>
                    </div>

                    {/* My avatar */}
                    <div className="w-8 flex-shrink-0">
                      {msg.showAvatar && mine && <Avatar name={user?.name} role={user?.role} />}
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="glass mt-3 p-3 flex items-end gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm resize-none outline-none max-h-32 py-1.5 leading-relaxed"
          style={{ scrollbarWidth: 'none' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:from-violet-500 hover:to-indigo-500 transition-all active:scale-95"
        >
          {sending
            ? <Loader2 className="w-4 h-4 text-white animate-spin" />
            : <Send className="w-4 h-4 text-white" />
          }
        </button>
      </div>
    </div>
  )
}
