import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { dmApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Send, MessageCircle, Loader2, ShieldCheck, Search, Users } from 'lucide-react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

function formatTime(sentAt) {
  const date = typeof sentAt === 'string' ? parseISO(sentAt) : new Date(sentAt)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`
  return format(date, 'MMM d, HH:mm')
}

function Avatar({ name, role, size = 'md' }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const isAdmin = role === 'ADMIN'
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'
  return (
    <div className={`${sizeClass} rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 ${
      isAdmin ? 'bg-gradient-to-br from-violet-500 to-violet-700' : 'bg-gradient-to-br from-indigo-500 to-indigo-700'
    }`}>
      {initials}
    </div>
  )
}

export default function DirectMessages() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const lastIdRef = useRef(null)
  const pollRef = useRef(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await dmApi.getUsers()
      setUsers(data)
    } catch {} finally { setLoadingUsers(false) }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (!selectedUser) return
    setLoadingMsgs(true)
    setMessages([])
    lastIdRef.current = null
    clearInterval(pollRef.current)

    dmApi.getMessages(selectedUser.id).then(({ data }) => {
      setMessages(data)
      if (data.length > 0) lastIdRef.current = data[data.length - 1].id
      dmApi.markRead(selectedUser.id).then(() => {
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, unreadCount: 0 } : u))
      }).catch(() => {})
    }).catch(() => {}).finally(() => setLoadingMsgs(false))

    pollRef.current = setInterval(async () => {
      if (!lastIdRef.current) return
      try {
        const { data } = await dmApi.getMessages(selectedUser.id, lastIdRef.current)
        if (data.length > 0) {
          setMessages(prev => [...prev, ...data])
          lastIdRef.current = data[data.length - 1].id
          dmApi.markRead(selectedUser.id).catch(() => {})
          setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, unreadCount: 0 } : u))
        }
      } catch {}
    }, 4000)

    return () => clearInterval(pollRef.current)
  }, [selectedUser?.id])

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !selectedUser || sending) return
    setInput('')
    setSending(true)
    try {
      const { data } = await dmApi.sendMessage(selectedUser.id, text)
      setMessages(prev => [...prev, data])
      lastIdRef.current = data.id
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id ? { ...u, lastMessage: text, lastMessageTime: data.sentAt } : u
      ))
    } catch { toast.error('Failed to send') }
    finally { setSending(false); inputRef.current?.focus() }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const isMe = (senderId) => senderId === user?.id

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount
    if (a.lastMessageTime && b.lastMessageTime) return new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    if (a.lastMessageTime) return -1
    if (b.lastMessageTime) return 1
    return a.name?.localeCompare(b.name)
  })

  const totalUnread = users.reduce((s, u) => s + (u.unreadCount || 0), 0)

  return (
    <div className="max-w-5xl mx-auto flex h-[calc(100vh-8rem)] gap-4">
      {/* Left: user list */}
      <div className="glass w-72 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-bold text-white">Direct Messages</span>
            {totalUnread > 0 && (
              <span className="ml-auto text-xs bg-violet-500 text-white rounded-full px-1.5 py-0.5 font-semibold">
                {totalUnread}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {loadingUsers ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Users className="w-8 h-8 text-gray-700" />
              <p className="text-xs text-gray-600">No members found</p>
            </div>
          ) : filteredUsers.map(u => (
            <button
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                selectedUser?.id === u.id ? 'bg-violet-500/10 border-r-2 border-violet-500' : ''
              }`}
            >
              <Avatar name={u.name} role={u.role} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white truncate">{u.name}</span>
                  {u.role === 'ADMIN' && <ShieldCheck className="w-3 h-3 text-violet-400 flex-shrink-0" />}
                </div>
                {u.lastMessage ? (
                  <p className="text-xs text-gray-600 truncate">{u.lastMessage}</p>
                ) : (
                  <p className="text-xs text-gray-700 italic">No messages yet</p>
                )}
              </div>
              {u.unreadCount > 0 && (
                <span className="w-5 h-5 bg-violet-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0">
                  {u.unreadCount > 9 ? '9+' : u.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right: conversation */}
      <div className="glass flex-1 flex flex-col min-w-0">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-violet-400/50" />
            </div>
            <p className="text-gray-400 text-sm font-medium">Select a team member</p>
            <p className="text-gray-600 text-xs">Choose someone from the left to start a private conversation</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5 flex-shrink-0">
              <Avatar name={selectedUser.name} role={selectedUser.role} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">{selectedUser.name}</span>
                  {selectedUser.role === 'ADMIN' && (
                    <span className="flex items-center gap-0.5 text-xs text-violet-400">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">Private conversation</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <p className="text-gray-500 text-sm">No messages yet</p>
                  <p className="text-gray-600 text-xs">Say hello to {selectedUser.name}!</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map(msg => {
                    const mine = isMe(msg.sender?.id)
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-end gap-2 mb-1 ${mine ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className="w-7 flex-shrink-0">
                          {!mine && <Avatar name={msg.sender?.name} role={msg.sender?.role} size="sm" />}
                        </div>
                        <div className={`flex flex-col max-w-[70%] ${mine ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                            mine
                              ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-md'
                              : 'bg-white/8 text-gray-100 border border-white/8 rounded-bl-md'
                          }`}>
                            {msg.content}
                          </div>
                          <span className="text-xs text-gray-600 mt-0.5 px-1">
                            {formatTime(msg.sentAt)}
                          </span>
                        </div>
                        <div className="w-7 flex-shrink-0">
                          {mine && <Avatar name={user?.name} role={user?.role} size="sm" />}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5 flex items-end gap-3 flex-shrink-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${selectedUser.name}… (Enter to send)`}
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
          </>
        )}
      </div>
    </div>
  )
}
