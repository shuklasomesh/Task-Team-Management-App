import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { taskApi, commentApi, userApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  CheckSquare, AlertTriangle, Filter, X, Loader2,
  MessageSquare, Send, Trash2, ShieldCheck
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

const STATUSES = ['TODO', 'IN_REVIEW', 'DONE']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const statusColors = {
  TODO: 'bg-gray-500/20 text-gray-400',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
  IN_REVIEW: 'bg-amber-500/20 text-amber-400',
  DONE: 'bg-emerald-500/20 text-emerald-400',
}

const priorityColors = {
  LOW: 'bg-gray-500/20 text-gray-400',
  MEDIUM: 'bg-blue-500/20 text-blue-400',
  HIGH: 'bg-amber-500/20 text-amber-400',
  URGENT: 'bg-red-500/20 text-red-400',
}

function renderContent(text) {
  const parts = text.split(/(@\S+)/g)
  return parts.map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className="text-violet-400 font-medium">{part}</span>
      : part
  )
}

function CommentsModal({ task, onClose }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const textareaRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    commentApi.getComments(task.id)
      .then(r => setComments(r.data))
      .catch(() => toast.error('Failed to load comments'))
      .finally(() => setLoading(false))
    userApi.getAll().then(r => setAllUsers(r.data)).catch(() => {})
  }, [task.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  const handleInput = (e) => {
    const val = e.target.value
    setText(val)
    const cursor = e.target.selectionStart
    const before = val.slice(0, cursor)
    const atMatch = before.match(/@(\w*)$/)
    if (atMatch) {
      setMentionQuery(atMatch[1].toLowerCase())
      setShowMentions(true)
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (name) => {
    const cursor = textareaRef.current?.selectionStart ?? text.length
    const before = text.slice(0, cursor)
    const after = text.slice(cursor)
    const atMatch = before.match(/@(\w*)$/)
    const newText = atMatch
      ? before.slice(0, before.length - atMatch[0].length) + `@${name} ` + after
      : before + `@${name} ` + after
    setText(newText)
    setShowMentions(false)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const mentionSuggestions = allUsers.filter(u =>
    u.id !== user?.id && u.name?.toLowerCase().includes(mentionQuery)
  ).slice(0, 5)

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return
    setSubmitting(true)
    try {
      const { data } = await commentApi.addComment(task.id, text.trim())
      setComments(prev => [...prev, data])
      setText('')
      setShowMentions(false)
    } catch { toast.error('Failed to post comment') }
    finally { setSubmitting(false); textareaRef.current?.focus() }
  }

  const handleDelete = async (commentId) => {
    try {
      await commentApi.deleteComment(task.id, commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch { toast.error('Failed to delete comment') }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey && !showMentions) { e.preventDefault(); handleSubmit() }
    if (e.key === 'Escape') setShowMentions(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass w-full max-w-lg flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-0.5">
              <MessageSquare className="w-4 h-4 text-violet-400 flex-shrink-0" />
              <h2 className="text-base font-bold text-white truncate">Comments</h2>
            </div>
            <p className="text-xs text-gray-500 truncate">{task.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <MessageSquare className="w-8 h-8 text-gray-700" />
              <p className="text-xs text-gray-600">No comments yet. Start the discussion!</p>
            </div>
          ) : (
            comments.map(c => {
              const isOwn = c.author?.id === user?.id
              const initials = c.author?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
              const isAdmin = c.author?.role === 'ADMIN'
              return (
                <div key={c.id} className="flex gap-3 group">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5 ${
                    isAdmin ? 'bg-gradient-to-br from-violet-500 to-violet-700' : 'bg-gradient-to-br from-indigo-500 to-indigo-700'
                  }`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-300">{c.author?.name}</span>
                      {isAdmin && (
                        <span className="flex items-center gap-0.5 text-xs text-violet-400">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      )}
                      <span className="text-xs text-gray-700">
                        {c.createdAt ? format(parseISO(c.createdAt), 'MMM d, HH:mm') : ''}
                      </span>
                      {isOwn && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed break-words">
                      {renderContent(c.content)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 flex-shrink-0">
          <div className="relative">
            {showMentions && mentionSuggestions.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#0d0d17] border border-white/10 rounded-xl overflow-hidden shadow-xl z-10">
                {mentionSuggestions.map(u => (
                  <button
                    key={u.id}
                    onMouseDown={e => { e.preventDefault(); insertMention(u.name) }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-left transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <span className="text-sm text-gray-200">{u.name}</span>
                    {u.role === 'ADMIN' && <ShieldCheck className="w-3 h-3 text-violet-400 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment… (@name to mention)"
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm resize-none outline-none max-h-24 leading-relaxed"
                style={{ scrollbarWidth: 'none' }}
              />
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:from-violet-500 hover:to-indigo-500 transition-all active:scale-95"
              >
                {submitting
                  ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  : <Send className="w-3.5 h-3.5 text-white" />
                }
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function EditModal({ task, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate || ''
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await taskApi.update(task.id, { ...form, dueDate: form.dueDate || null })
      toast.success('Task updated!')
      onSaved()
      onClose()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Edit Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editTask, setEditTask] = useState(null)
  const [commentsTask, setCommentsTask] = useState(null)
  const [filter, setFilter] = useState({ status: 'ALL', priority: 'ALL', overdue: false })

  const fetchTasks = () => {
    taskApi.getMyTasks().then(r => setTasks(r.data)).catch(() => toast.error('Failed to load tasks')).finally(() => setLoading(false))
  }

  useEffect(() => { fetchTasks() }, [])

  const filtered = tasks.filter(t => {
    if (filter.status !== 'ALL' && t.status !== filter.status) return false
    if (filter.priority !== 'ALL' && t.priority !== filter.priority) return false
    if (filter.overdue && !t.overdue) return false
    return true
  })

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskApi.updateStatus(taskId, status)
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
      toast.success('Status updated')
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this task?')) return
    try {
      await taskApi.delete(id)
      setTasks(prev => prev.filter(t => t.id !== id))
      toast.success('Task deleted')
    } catch { toast.error('Failed to delete') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>

  const overdueCount = tasks.filter(t => t.overdue).length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="section-title">My Tasks</h1>
        <p className="section-sub">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          {overdueCount > 0 && <span className="text-red-400 ml-2">· {overdueCount} overdue</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="glass p-4 flex items-center gap-4 flex-wrap">
        <Filter className="w-4 h-4 text-gray-500" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status:</span>
          <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-violet-500">
            <option value="ALL">All</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Priority:</span>
          <select value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
            className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-violet-500">
            <option value="ALL">All</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input type="checkbox" checked={filter.overdue} onChange={e => setFilter(f => ({ ...f, overdue: e.target.checked }))}
            className="rounded accent-violet-500" />
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Overdue only
        </label>
        {(filter.status !== 'ALL' || filter.priority !== 'ALL' || filter.overdue) && (
          <button onClick={() => setFilter({ status: 'ALL', priority: 'ALL', overdue: false })}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Clear</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="glass p-16 text-center">
          <CheckSquare className="w-12 h-12 mx-auto mb-4 text-violet-400/30" />
          <p className="text-gray-400">{tasks.length === 0 ? 'No tasks assigned to you yet.' : 'No tasks match your filters.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task, i) => (
            <motion.div key={task.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className={`glass p-4 flex items-center gap-4 hover:border-violet-500/20 transition-all ${task.overdue ? 'border-red-500/20' : ''}`}>
              {task.overdue && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-white'} truncate`}>{task.title}</p>
                <Link to={`/projects/${task.project?.id}`} className="text-xs text-violet-400/70 hover:text-violet-400 transition-colors">
                  {task.project?.name}
                </Link>
              </div>
              <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
                className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                {!STATUSES.includes(task.status) && <option value={task.status}>{task.status.replace('_', ' ')}</option>}
              </select>
              <span className={`badge text-xs hidden sm:inline-flex ${priorityColors[task.priority] || ''}`}>{task.priority}</span>
              {task.dueDate && (
                <span className={`text-xs hidden md:block ${task.overdue ? 'text-red-400 font-medium' : 'text-gray-500'}`}>
                  {format(parseISO(task.dueDate), 'MMM d')}
                </span>
              )}
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setCommentsTask(task)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  title="Comments"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Comments</span>
                </button>
                <button onClick={() => setEditTask(task)} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Edit</button>
                <button onClick={() => handleDelete(task.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Del</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {editTask && <EditModal task={editTask} onClose={() => setEditTask(null)} onSaved={fetchTasks} />}
      <AnimatePresence>
        {commentsTask && <CommentsModal task={commentsTask} onClose={() => setCommentsTask(null)} />}
      </AnimatePresence>
    </div>
  )
}
