import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { projectApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  FolderKanban, Plus, Loader2, ArrowRight, X, Users, Calendar
} from 'lucide-react'

const statusColors = {
  ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  COMPLETED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ARCHIVED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', status: 'ACTIVE' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await projectApi.create(form)
      toast.success('Project created!')
      onCreated(data)
      onClose()
    } catch { toast.error('Failed to create project') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">New Project</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Project Name</label>
            <input className="input" placeholder="My Project" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="What is this project about?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Projects() {
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    projectApi.getAll().then(r => setProjects(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Projects</h1>
          <p className="section-sub">{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="glass p-16 text-center">
          <FolderKanban className="w-12 h-12 mx-auto mb-4 text-violet-400/50" />
          <p className="text-gray-400 font-medium mb-1">No projects yet</p>
          <p className="text-sm text-gray-600">
            {isAdmin ? 'Create your first project to get started.' : 'You haven\'t been added to any project yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/projects/${p.id}`}
                className="block glass p-5 hover:border-violet-500/30 hover:scale-[1.02] transition-all duration-300 group h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-violet-400" />
                  </div>
                  <span className={`badge border text-xs ${statusColors[p.status] || statusColors.ACTIVE}`}>{p.status}</span>
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors">{p.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{p.description || 'No description'}</p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {p.memberCount || 0} members</span>
                  <ArrowRight className="w-4 h-4 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={p => setProjects(prev => [p, ...prev])} />}
    </div>
  )
}
