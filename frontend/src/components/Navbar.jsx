import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, CheckCheck, AlertCircle, ClipboardList, MessageCircle, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { notificationApi } from '../api/axios'
import { formatDistanceToNow, parseISO } from 'date-fns'

const typeIcon = {
  TASK_ASSIGNED: ClipboardList,
  DEADLINE_NEAR: AlertCircle,
  TASK_COMMENT: MessageCircle,
}

const typeColor = {
  TASK_ASSIGNED: 'text-violet-400',
  DEADLINE_NEAR: 'text-amber-400',
  TASK_COMMENT: 'text-indigo-400',
}

function NotifItem({ n, onRead }) {
  const Icon = typeIcon[n.type] || Bell
  const color = typeColor[n.type] || 'text-gray-400'
  const time = n.createdAt ? formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true }) : ''

  return (
    <button
      onClick={() => onRead(n.id)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${n.read ? 'opacity-50' : ''}`}
    >
      <div className={`mt-0.5 flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 leading-snug">{n.message}</p>
        <p className="text-xs text-gray-600 mt-0.5">{time}</p>
      </div>
      {!n.read && <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />}
    </button>
  )
}

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const pollRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationApi.getAll()
      setNotifications(data)
    } catch {}
  }, [])

  useEffect(() => {
    fetchNotifications()
    pollRef.current = setInterval(fetchNotifications, 30000)
    return () => clearInterval(pollRef.current)
  }, [fetchNotifications])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleRead = async (id) => {
    try {
      await notificationApi.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {}
  }

  return (
    <header className="h-14 bg-[#0d0d17] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1 lg:flex-none" />

      <div className="flex items-center gap-3">
        {/* Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(v => !v)}
            className="relative p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-violet-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#0d0d17] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                      <CheckCheck className="w-3.5 h-3.5" /> All read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Bell className="w-8 h-8 text-gray-700" />
                    <p className="text-xs text-gray-600">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <NotifItem key={n.id} n={n} onRead={handleRead} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <span className="text-sm text-gray-500 hidden sm:block">{user?.name}</span>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
          {initials}
        </div>
      </div>
    </header>
  )
}
