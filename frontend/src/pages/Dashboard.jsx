import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
  FolderKanban, CheckSquare, AlertTriangle, TrendingUp, ArrowRight, Loader2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const statusColors = {
  TODO: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  IN_REVIEW: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  DONE: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
}

const priorityColors = {
  LOW: 'bg-gray-500/20 text-gray-400',
  MEDIUM: 'bg-blue-500/20 text-blue-400',
  HIGH: 'bg-amber-500/20 text-amber-400',
  URGENT: 'bg-red-500/20 text-red-400',
}

const BAR_COLORS = ['#8b5cf6', '#6366f1', '#f59e0b', '#10b981']

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }} className="stat-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value ?? '—'}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.get().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
    </div>
  )

  const taskStatusData = data?.tasksByStatus
    ? Object.entries(data.tasksByStatus).map(([name, value]) => ({ name: name.replace('_', ' '), value }))
    : []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="section-title">Good {greeting}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="section-sub">Here's what's happening with your team today.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderKanban} label="Projects" value={data?.totalProjects} color="bg-violet-500/20 text-violet-400" delay={0.05} />
        <StatCard icon={CheckSquare} label="Tasks" value={data?.totalTasks} color="bg-indigo-500/20 text-indigo-400" delay={0.1} />
        <StatCard icon={TrendingUp} label="Completed" value={data?.completedTasks} color="bg-emerald-500/20 text-emerald-400" delay={0.15} />
        <StatCard icon={AlertTriangle} label="Overdue" value={data?.overdueTasks} color="bg-red-500/20 text-red-400" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {taskStatusData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass p-5">
            <h3 className="font-semibold text-white mb-4">Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={taskStatusData} barSize={32}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(139,92,246,0.05)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {taskStatusData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`glass p-5 ${taskStatusData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Tasks</h3>
            <Link to="/tasks" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {data?.recentTasks?.length > 0 ? (
            <div className="space-y-2">
              {data.recentTasks.slice(0, 6).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                  <span className={`badge text-xs ${statusColors[task.status] || statusColors.TODO}`}>
                    {task.status?.replace('_', ' ')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 truncate">{task.projectName}</p>
                  </div>
                  <span className={`badge text-xs ${priorityColors[task.priority] || ''}`}>{task.priority}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-600">
              <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No tasks yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {data?.recentProjects?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Active Projects</h3>
            <Link to="/projects" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.recentProjects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`}
                className="p-4 rounded-xl bg-white/3 hover:bg-white/5 border border-white/5 hover:border-violet-500/20 transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white text-sm group-hover:text-violet-300 transition-colors truncate flex-1">{p.name}</h4>
                  <span className="badge bg-emerald-500/20 text-emerald-400 text-xs ml-2 flex-shrink-0">{p.status}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{p.description || 'No description'}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
