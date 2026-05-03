import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { sessionApi, skillApi } from '../api/axios'
import toast from 'react-hot-toast'
import {
  Users, Clock, Trophy, Wifi, WifiOff, RefreshCw, Loader2,
  CheckCircle, BarChart3, Medal
} from 'lucide-react'

function formatTime(seconds) {
  if (!seconds) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function OnlineBadge({ online }) {
  return online
    ? <span className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="online-dot" />Online</span>
    : <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="offline-dot" />Offline</span>
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function AdminPanel() {
  const [memberStats, setMemberStats] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const [statsRes, lbRes] = await Promise.all([
        sessionApi.getMemberStats(),
        skillApi.getLeaderboard(),
      ])
      setMemberStats(statsRes.data)
      setLeaderboard(lbRes.data)
    } catch { if (isRefresh) toast.error('Failed to refresh') }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(() => load(false), 30000)
    return () => clearInterval(interval)
  }, [load])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>

  const onlineCount = memberStats.filter(m => m.online).length
  const totalWorkSeconds = memberStats.reduce((acc, m) => acc + (m.totalWorkingSeconds || 0), 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Admin Panel</h1>
          <p className="section-sub">Real-time team monitoring and management</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing} className="btn-secondary">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Members" value={memberStats.length} color="bg-violet-500/20 text-violet-400" />
        <StatCard icon={Wifi} label="Online Now" value={onlineCount} color="bg-emerald-500/20 text-emerald-400" />
        <StatCard icon={Clock} label="Total Hours Today" value={formatTime(totalWorkSeconds)} color="bg-indigo-500/20 text-indigo-400" />
        <StatCard icon={Trophy} label="Ranked Members" value={leaderboard.length} color="bg-amber-500/20 text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Member Activity */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            <h3 className="font-semibold text-white">Member Activity</h3>
          </div>
          {memberStats.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No members yet</p>
          ) : (
            <div className="space-y-3">
              {memberStats.map((m, i) => (
                <motion.div key={m.userId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${m.online ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-white/3'}`}>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {m.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{m.name}</p>
                    <p className="text-xs text-gray-500 truncate">{m.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <OnlineBadge online={m.online} />
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />{formatTime(m.totalWorkingSeconds)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-white">Skills Leaderboard</h3>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No test submissions yet</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                return (
                  <motion.div key={entry.userId} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl ${i < 3 ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-white/3'}`}>
                    <div className="w-8 text-center">
                      {medal ? <span className="text-lg">{medal}</span> : <span className="text-sm text-gray-500 font-bold">#{i + 1}</span>}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {entry.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{entry.name}</p>
                      <p className="text-xs text-gray-500">{entry.testsCompleted} test{entry.testsCompleted !== 1 ? 's' : ''} completed</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-amber-400">{entry.totalScore}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Online member detail */}
      {onlineCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white">Currently Online</h3>
            <span className="badge bg-emerald-500/20 text-emerald-400 ml-1">{onlineCount}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {memberStats.filter(m => m.online).map(m => (
              <div key={m.userId} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {m.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 online-dot" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{m.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatTime(m.totalWorkingSeconds)} today
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
