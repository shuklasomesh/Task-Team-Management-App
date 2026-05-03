import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FolderKanban, CheckSquare, LogOut, Zap,
  Brain, Trophy, ShieldCheck, X, MessageSquare, MessageCircle
} from 'lucide-react'

const memberNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
  { to: '/chat', icon: MessageSquare, label: 'Team Chat' },
  { to: '/dm', icon: MessageCircle, label: 'Direct Messages' },
  { to: '/skills', icon: Brain, label: 'Skills & Tests' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
]

const adminExtra = [
  { to: '/admin', icon: ShieldCheck, label: 'Admin Panel' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'
  const navItems = isAdmin ? [...memberNav, ...adminExtra] : memberNav

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={[
        'fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300',
        'bg-[#0d0d17] border-r border-white/5',
        'lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Ethara</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isAdmin
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-violet-400' : 'bg-indigo-400'}`} />
            {isAdmin ? 'Administrator' : 'Member'}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-active' : 'nav-inactive'}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
