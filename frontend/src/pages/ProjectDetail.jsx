import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { projectApi, taskApi, userApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Plus, Users, ArrowLeft, Trash2, Edit2, UserPlus, UserMinus, Loader2, X
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
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

function TaskModal({ task, projectId, members, onClose, onSaved }) {
  const isEdit = !!task
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate || '',
    assigneeId: task?.assignee?.id || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, projectId, assigneeId: form.assigneeId ? parseInt(form.assigneeId) : null, dueDate: form.dueDate || null }
      if (isEdit) await taskApi.update(task.id, payload)
      else await taskApi.create(payload)
      toast.success(isEdit ? 'Task updated!' : 'Task created!')
      onSaved()
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save task') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" placeholder="Task title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} placeholder="Optional description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className="label">Assignee</label>
              <select className="input" value={form.assigneeId} onChange={e => setForm(p => ({ ...p, assigneeId: e.target.value }))}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Update' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [addMemberForm, setAddMemberForm] = useState({ userId: '', projectRole: 'MEMBER' })
  const [addingMember, setAddingMember] = useState(false)
  const [activeFilter, setActiveFilter] = useState('ALL')

  const fetchAll = async () => {
    try {
      const [projRes, taskRes, usersRes] = await Promise.all([
        projectApi.getById(id),
        taskApi.getProjectTasks(id),
        userApi.getAll(),
      ])
      setProject(projRes.data)
      setTasks(taskRes.data)
      setAllUsers(usersRes.data)
    } catch { toast.error('Failed to load project') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [id])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
  if (!project) return <div className="text-center py-12 text-gray-500">Project not found</div>

  const members = project?.members || []
  const memberIds = members.map(m => m.id)
  const nonMembers = allUsers.filter(u => !memberIds.includes(u.id))
  const isOwner = project?.owner?.id === user?.id

  const filteredTasks = activeFilter === 'ALL' ? tasks : tasks.filter(t => t.status === activeFilter)
  const tasksByStatus = STATUSES.reduce((acc, s) => { acc[s] = tasks.filter(t => t.status === s); return acc }, {})

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskApi.updateStatus(taskId, status)
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
    } catch { toast.error('Failed to update status') }
  }

  const handleDeleteTask = async taskId => {
    if (!window.confirm('Delete this task?')) return
    try {
      await taskApi.delete(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      toast.success('Task deleted')
    } catch { toast.error('Failed to delete task') }
  }

  const handleAddMember = async () => {
    if (!addMemberForm.userId) return
    setAddingMember(true)
    try {
      await projectApi.addMember(id, { userId: parseInt(addMemberForm.userId), projectRole: addMemberForm.projectRole })
      toast.success('Member added!')
      setShowAddMember(false)
      setAddMemberForm({ userId: '', projectRole: 'MEMBER' })
      fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member') }
    finally { setAddingMember(false) }
  }

  const handleRemoveMember = async memberId => {
    if (memberId === project.owner?.id) { toast.error('Cannot remove project owner'); return }
    try {
      await projectApi.removeMember(id, memberId)
      toast.success('Member removed')
      fetchAll()
    } catch { toast.error('Failed to remove member') }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/projects" className="text-sm text-gray-500 hover:text-violet-400 flex items-center gap-1 mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Projects
          </Link>
          <h1 className="section-title">{project.name}</h1>
          {project.description && <p className="section-sub max-w-2xl">{project.description}</p>}
        </div>
        <span className={`badge flex-shrink-0 ${
          project.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
          project.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
        }`}>{project.status}</span>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{tasks.length} tasks</span>
        <span>·</span>
        <span className="text-emerald-400">{tasks.filter(t => t.status === 'DONE').length} done</span>
        <span>·</span>
        <span>{members.length} members</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Tasks area */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {['ALL', ...STATUSES].map(s => (
                <button key={s} onClick={() => setActiveFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeFilter === s ? 'bg-violet-600 text-white' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                  }`}>
                  {s === 'ALL' ? 'All' : s.replace('_', ' ')}
                  <span className="ml-1 opacity-60">({s === 'ALL' ? tasks.length : tasksByStatus[s]?.length || 0})</span>
                </button>
              ))}
            </div>
            {(isAdmin || isOwner) && (
              <button onClick={() => setShowTaskModal(true)} className="btn-primary flex-shrink-0">
                <Plus className="w-4 h-4" /> Task
              </button>
            )}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="glass p-12 text-center">
              <p className="text-gray-500 text-sm mb-3">
                {activeFilter !== 'ALL' ? `No tasks with status "${activeFilter.replace('_', ' ')}"` : 'No tasks yet'}
              </p>
              {activeFilter === 'ALL' && (isAdmin || isOwner) && (
                <button onClick={() => setShowTaskModal(true)} className="btn-primary">
                  <Plus className="w-4 h-4" /> Add First Task
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTasks.map((task, i) => (
                <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="glass p-4 hover:border-violet-500/20 transition-all group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={`text-sm font-medium flex-1 ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-white'}`}>{task.title}</p>
                    {(isAdmin || isOwner) && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => setEditTask(task)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                          <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button onClick={() => handleDeleteTask(task.id)} className="p-1 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                  {task.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>}
                  <div className="flex gap-2 mb-3">
                    <span className={`badge text-xs ${priorityColors[task.priority]}`}>{task.priority}</span>
                    {task.overdue && <span className="badge text-xs bg-red-500/20 text-red-400">Overdue</span>}
                    {task.dueDate && <span className="text-xs text-gray-500">{format(parseISO(task.dueDate), 'MMM d')}</span>}
                  </div>
                  {task.assignee && (
                    <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-white/5">
                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs text-white font-bold">
                        {task.assignee.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-500">{task.assignee.name}</span>
                    </div>
                  )}
                  <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
                    className="w-full text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer">
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="glass p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" /> Members
              </h3>
              {(isOwner || isAdmin) && (
                <button onClick={() => setShowAddMember(true)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <UserPlus className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs text-white font-bold">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.projectRole}</p>
                    </div>
                  </div>
                  {(isOwner || isAdmin) && member.id !== project.owner?.id && (
                    <button onClick={() => handleRemoveMember(member.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded-lg transition-all">
                      <UserMinus className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {showAddMember && nonMembers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                <select className="input text-sm" value={addMemberForm.userId} onChange={e => setAddMemberForm(p => ({ ...p, userId: e.target.value }))}>
                  <option value="">Select user</option>
                  {nonMembers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <select className="input text-sm" value={addMemberForm.projectRole} onChange={e => setAddMemberForm(p => ({ ...p, projectRole: e.target.value }))}>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddMember(false)} className="btn-ghost text-xs flex-1 justify-center">Cancel</button>
                  <button onClick={handleAddMember} disabled={!addMemberForm.userId || addingMember} className="btn-primary text-xs flex-1 justify-center">
                    {addingMember ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="glass p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Progress</h3>
            <div className="space-y-2">
              {STATUSES.map(s => (
                <div key={s} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{s.replace('_', ' ')}</span>
                  <span className={`badge text-xs ${statusColors[s]}`}>{tasksByStatus[s]?.length || 0}</span>
                </div>
              ))}
            </div>
            {tasks.length > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Completion</span>
                  <span>{Math.round((tasksByStatus.DONE?.length || 0) / tasks.length * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${(tasksByStatus.DONE?.length || 0) / tasks.length * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showTaskModal && <TaskModal projectId={parseInt(id)} members={members} onClose={() => setShowTaskModal(false)} onSaved={fetchAll} />}
      {editTask && <TaskModal task={editTask} projectId={parseInt(id)} members={members} onClose={() => setEditTask(null)} onSaved={fetchAll} />}
    </div>
  )
}
