import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { skillApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Brain, Plus, X, Loader2, Code2, Calculator, Cpu, Database,
  Globe, ChevronRight, Clock, CheckCircle, Trash2, PlusCircle, MinusCircle
} from 'lucide-react'

const SKILL_ICONS = { Code2, Calculator, Cpu, Database, Globe, Brain }
const SKILL_COLORS = ['violet', 'indigo', 'amber', 'emerald', 'pink', 'cyan']
const iconColorMap = {
  violet: 'bg-violet-500/20 text-violet-400 border-violet-500/20',
  indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
  pink: 'bg-pink-500/20 text-pink-400 border-pink-500/20',
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
}

function CreateSkillModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', icon: 'Brain', color: 'violet' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await skillApi.create(form)
      toast.success('Skill created!')
      onCreated(data)
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create skill') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">New Skill</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Skill Name</label>
            <input className="input" placeholder="e.g. Java Programming" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} placeholder="What does this skill cover?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Icon</label>
            <select className="input" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}>
              {Object.keys(SKILL_ICONS).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2">
              {SKILL_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                  className={`w-7 h-7 rounded-lg border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ background: `var(--color-${c}, #8b5cf6)` }}>
                  <div className={`w-full h-full rounded-md ${c === 'violet' ? 'bg-violet-500' : c === 'indigo' ? 'bg-indigo-500' : c === 'amber' ? 'bg-amber-500' : c === 'emerald' ? 'bg-emerald-500' : c === 'pink' ? 'bg-pink-500' : 'bg-cyan-500'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function CreateTestModal({ skills, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', skillId: skills[0]?.id || '', timeLimitMinutes: 30,
    questions: [{ questionText: '', questionType: 'MCQ', points: 1, options: [{ optionText: '', correct: false }, { optionText: '', correct: false }] }]
  })
  const [loading, setLoading] = useState(false)

  const addQuestion = () => setForm(p => ({
    ...p,
    questions: [...p.questions, { questionText: '', questionType: 'MCQ', points: 1, options: [{ optionText: '', correct: false }, { optionText: '', correct: false }] }]
  }))

  const removeQuestion = i => setForm(p => ({ ...p, questions: p.questions.filter((_, idx) => idx !== i) }))

  const updateQuestion = (i, key, val) => setForm(p => ({
    ...p,
    questions: p.questions.map((q, idx) => idx === i ? { ...q, [key]: val } : q)
  }))

  const addOption = qi => setForm(p => ({
    ...p,
    questions: p.questions.map((q, idx) => idx === qi ? { ...q, options: [...q.options, { optionText: '', correct: false }] } : q)
  }))

  const removeOption = (qi, oi) => setForm(p => ({
    ...p,
    questions: p.questions.map((q, idx) => idx === qi ? { ...q, options: q.options.filter((_, i) => i !== oi) } : q)
  }))

  const updateOption = (qi, oi, key, val) => setForm(p => ({
    ...p,
    questions: p.questions.map((q, qIdx) => qIdx !== qi ? q : {
      ...q,
      options: q.options.map((o, oIdx) => oIdx !== oi ? (key === 'correct' ? { ...o, correct: false } : o) : { ...o, [key]: val })
    })
  }))

  const handleSubmit = async e => {
    e.preventDefault()
    for (const q of form.questions) {
      if (q.questionType === 'MCQ' && !q.options.some(o => o.correct)) {
        toast.error('Each MCQ question must have at least one correct answer')
        return
      }
    }
    setLoading(true)
    try {
      const { data } = await skillApi.createTest({ ...form, skillId: parseInt(form.skillId) })
      toast.success('Test created!')
      onCreated(data)
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create test') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-2xl p-6 my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Create Test</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Test Title</label>
              <input className="input" placeholder="e.g. Java Basics" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Skill</label>
              <select className="input" value={form.skillId} onChange={e => setForm(p => ({ ...p, skillId: e.target.value }))}>
                {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Description</label>
              <input className="input" placeholder="Optional" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="label">Time Limit (minutes)</label>
              <input type="number" min={1} max={180} className="input" value={form.timeLimitMinutes} onChange={e => setForm(p => ({ ...p, timeLimitMinutes: parseInt(e.target.value) }))} required />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Questions ({form.questions.length})</label>
              <button type="button" onClick={addQuestion} className="btn-ghost text-xs gap-1">
                <PlusCircle className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>
            <div className="space-y-4">
              {form.questions.map((q, qi) => (
                <div key={qi} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-violet-400">Q{qi + 1}</span>
                    {form.questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-300">
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <input className="input" placeholder="Question text" value={q.questionText} onChange={e => updateQuestion(qi, 'questionText', e.target.value)} required />
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <select className="input" value={q.questionType} onChange={e => updateQuestion(qi, 'questionType', e.target.value)}>
                          <option value="MCQ">Multiple Choice</option>
                          <option value="TRUE_FALSE">True / False</option>
                        </select>
                      </div>
                      <div className="w-24">
                        <input type="number" min={1} max={10} className="input" placeholder="Points" value={q.points} onChange={e => updateQuestion(qi, 'points', parseInt(e.target.value))} />
                      </div>
                    </div>

                    {q.questionType === 'TRUE_FALSE' ? (
                      <div className="flex gap-3">
                        {['True', 'False'].map((opt, oi) => (
                          <label key={opt} className={`flex items-center gap-2 flex-1 p-3 rounded-xl cursor-pointer border transition-all ${q.options[oi]?.correct ? 'border-violet-500/40 bg-violet-500/10' : 'border-white/10 bg-white/3'}`}>
                            <input type="radio" name={`tf-${qi}`} checked={q.options[oi]?.correct || false}
                              onChange={() => {
                                updateOption(qi, 0, 'optionText', 'True')
                                updateOption(qi, 1, 'optionText', 'False')
                                const opts = [{ optionText: 'True', correct: opt === 'True' }, { optionText: 'False', correct: opt === 'False' }]
                                setForm(p => ({ ...p, questions: p.questions.map((qq, i) => i === qi ? { ...qq, options: opts } : qq) }))
                              }}
                              className="accent-violet-500" />
                            <span className="text-sm text-white">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input type="radio" name={`correct-${qi}`} checked={opt.correct}
                              onChange={() => updateOption(qi, oi, 'correct', true)}
                              className="accent-violet-500 flex-shrink-0" title="Mark as correct" />
                            <input className="input flex-1 text-sm py-2" placeholder={`Option ${oi + 1}`} value={opt.optionText}
                              onChange={e => setForm(p => ({ ...p, questions: p.questions.map((qq, qi2) => qi2 !== qi ? qq : { ...qq, options: qq.options.map((o, oi2) => oi2 !== oi ? o : { ...o, optionText: e.target.value }) }) }))} required />
                            {q.options.length > 2 && (
                              <button type="button" onClick={() => removeOption(qi, oi)} className="text-red-400 hover:text-red-300 flex-shrink-0">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {q.options.length < 6 && (
                          <button type="button" onClick={() => addOption(qi)} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-1">
                            <Plus className="w-3 h-3" /> Add option
                          </button>
                        )}
                        <p className="text-xs text-gray-600">Select the radio button next to the correct answer</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Test'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Skills() {
  const { isAdmin } = useAuth()
  const [skills, setSkills] = useState([])
  const [tests, setTests] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateSkill, setShowCreateSkill] = useState(false)
  const [showCreateTest, setShowCreateTest] = useState(false)
  const [tab, setTab] = useState('skills')

  const load = async () => {
    try {
      const [sRes, tRes] = await Promise.all([skillApi.getAll(), skillApi.getTests()])
      setSkills(sRes.data)
      setTests(tRes.data)
      if (!isAdmin) {
        const mRes = await skillApi.getMySubmissions()
        setSubmissions(mRes.data)
      }
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const completedTestIds = new Set(submissions.filter(s => s.status === 'COMPLETED').map(s => s.test?.id))

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>

  const SkillIcon = ({ name }) => {
    const Ic = SKILL_ICONS[name] || Brain
    return <Ic className="w-5 h-5" />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Skills & Tests</h1>
          <p className="section-sub">{isAdmin ? 'Manage skills and create assessments' : 'Take tests and improve your ranking'}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setShowCreateSkill(true)} className="btn-secondary"><Plus className="w-4 h-4" /> Skill</button>
            <button onClick={() => setShowCreateTest(true)} disabled={skills.length === 0} className="btn-primary"><Plus className="w-4 h-4" /> Test</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit border border-white/10">
        {['skills', 'tests'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'skills' ? (
        skills.length === 0 ? (
          <div className="glass p-16 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-violet-400/30" />
            <p className="text-gray-400">{isAdmin ? 'Create your first skill to get started.' : 'No skills available yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill, i) => {
              const colorClass = iconColorMap[skill.color] || iconColorMap.violet
              const skillTests = tests.filter(t => t.skill?.id === skill.id)
              return (
                <motion.div key={skill.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass p-5 hover:border-violet-500/30 hover:scale-[1.02] transition-all duration-300">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${colorClass}`}>
                    <SkillIcon name={skill.icon} />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{skill.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{skill.description}</p>
                  <p className="text-xs text-gray-600">{skillTests.length} test{skillTests.length !== 1 ? 's' : ''} available</p>
                </motion.div>
              )
            })}
          </div>
        )
      ) : (
        tests.length === 0 ? (
          <div className="glass p-16 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-violet-400/30" />
            <p className="text-gray-400">{isAdmin ? 'Create your first test.' : 'No tests available yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tests.map((test, i) => {
              const completed = completedTestIds.has(test.id)
              const inProgress = submissions.find(s => s.testId === test.id && s.status === 'IN_PROGRESS')
              return (
                <motion.div key={test.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`glass p-5 hover:border-violet-500/30 transition-all ${completed ? 'border-emerald-500/20' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white mb-0.5">{test.title}</h3>
                      <p className="text-xs text-gray-500">{test.skill?.name}</p>
                    </div>
                    {completed && <span className="badge bg-emerald-500/20 text-emerald-400 text-xs"><CheckCircle className="w-3 h-3" /> Done</span>}
                  </div>
                  {test.description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{test.description}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{test.timeLimitMinutes}m</span>
                      <span>{test.questionCount || 0} questions</span>
                    </div>
                    {!isAdmin && (
                      <Link
                        to={`/skills/test/${test.id}`}
                        className={completed ? 'btn-secondary text-xs py-1.5' : 'btn-primary text-xs py-1.5'}
                      >
                        {completed ? 'Review' : inProgress ? 'Continue' : 'Start Test'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )
      )}

      {showCreateSkill && <CreateSkillModal onClose={() => setShowCreateSkill(false)} onCreated={s => setSkills(p => [s, ...p])} />}
      {showCreateTest && <CreateTestModal skills={skills} onClose={() => setShowCreateTest(false)} onCreated={t => setTests(p => [t, ...p])} />}
    </div>
  )
}
