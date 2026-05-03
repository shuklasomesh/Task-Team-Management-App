import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { skillApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Trophy, Medal, Star, Loader2, TrendingUp } from 'lucide-react'

export default function Leaderboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    skillApi.getLeaderboard().then(r => setEntries(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>

  const myRank = entries.findIndex(e => e.userId === user?.id) + 1

  const podiumColors = [
    'from-amber-500/30 to-amber-600/10 border-amber-500/30 shadow-amber-500/10',
    'from-gray-400/20 to-gray-500/10 border-gray-400/20 shadow-gray-400/10',
    'from-orange-600/20 to-orange-700/10 border-orange-600/20 shadow-orange-500/10',
  ]

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="section-title">Leaderboard</h1>
        <p className="section-sub">Ranked by total test score across all skills</p>
      </div>

      {/* My rank banner */}
      {myRank > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="glass p-4 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border-violet-500/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">
            #{myRank}
          </div>
          <div>
            <p className="font-semibold text-white">Your Rank</p>
            <p className="text-sm text-gray-400">{entries[myRank - 1]?.totalScore || 0} points · {entries[myRank - 1]?.testsCompleted || 0} tests</p>
          </div>
          <div className="ml-auto">
            <Star className="w-5 h-5 text-violet-400" />
          </div>
        </motion.div>
      )}

      {entries.length === 0 ? (
        <div className="glass p-16 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-amber-400/30" />
          <p className="text-gray-400 mb-1">No scores yet</p>
          <p className="text-sm text-gray-600">Complete skill tests to appear on the leaderboard.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {entries.length >= 2 && (
            <div className="flex items-end justify-center gap-4 mb-2">
              {[entries[1], entries[0], entries[2]].filter(Boolean).map((entry, podiumI) => {
                const actualRank = entry === entries[0] ? 0 : entry === entries[1] ? 1 : 2
                const heights = ['h-32', 'h-40', 'h-28']
                return (
                  <motion.div key={entry.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: podiumI * 0.1 }}
                    className={`flex-1 max-w-[120px] glass bg-gradient-to-b ${podiumColors[actualRank]} flex flex-col items-center justify-end pb-4 rounded-2xl shadow-lg ${heights[actualRank]}`}>
                    <div className="text-2xl mb-1">{medals[actualRank]}</div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white mb-1.5">
                      {entry.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <p className="text-xs font-semibold text-white text-center px-1 truncate w-full text-center">{entry.name?.split(' ')[0]}</p>
                    <p className="text-xs text-amber-400 font-bold">{entry.totalScore}pts</p>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Full list */}
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const isMe = entry.userId === user?.id
              return (
                <motion.div key={entry.userId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`glass p-4 flex items-center gap-4 transition-all ${isMe ? 'border-violet-500/30 bg-violet-500/5' : 'hover:border-white/10'}`}>
                  <div className="w-8 text-center flex-shrink-0">
                    {i < 3
                      ? <span className="text-lg">{medals[i]}</span>
                      : <span className="text-sm font-bold text-gray-500">#{i + 1}</span>
                    }
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {entry.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {entry.name}
                      {isMe && <span className="ml-2 badge bg-violet-500/20 text-violet-400 text-xs">You</span>}
                    </p>
                    <p className="text-xs text-gray-500">{entry.testsCompleted} test{entry.testsCompleted !== 1 ? 's' : ''} completed</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-amber-400">{entry.totalScore}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
