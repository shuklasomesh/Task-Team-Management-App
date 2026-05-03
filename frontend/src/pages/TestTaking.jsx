import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { skillApi } from '../api/axios'
import toast from 'react-hot-toast'
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Loader2, Send } from 'lucide-react'

function Timer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); onExpire(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [onExpire])

  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  const isLow = remaining < 60

  return (
    <div className={`flex items-center gap-2 font-mono text-lg font-bold ${isLow ? 'text-red-400 animate-pulse' : 'text-white'}`}>
      <Clock className="w-5 h-5" />
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  )
}

export default function TestTaking() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [test, setTest] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [answers, setAnswers] = useState({})
  const [currentQ, setCurrentQ] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const start = async () => {
      try {
        const [testRes, startRes] = await Promise.all([
          skillApi.getTest(id),
          skillApi.startTest(id),
        ])
        setTest(testRes.data)
        setSubmission(startRes.data)
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to start test'
        toast.error(msg)
        navigate('/skills')
      } finally {
        setLoading(false)
      }
    }
    start()
  }, [id, navigate])

  const handleSubmit = useCallback(async () => {
    if (!submission) return
    setSubmitting(true)
    try {
      const { data } = await skillApi.submitTest(submission.id, answers)
      setResult(data)
    } catch { toast.error('Failed to submit test') }
    finally { setSubmitting(false) }
  }, [submission, answers])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
  if (!test) return null

  const questions = test.questions || []
  const q = questions[currentQ]
  const answered = Object.keys(answers).length
  const progress = (answered / questions.length) * 100

  if (result) {
    const pct = result.percentage || 0
    const passed = pct >= 60
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-10 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            {passed
              ? <CheckCircle className="w-10 h-10 text-emerald-400" />
              : <AlertTriangle className="w-10 h-10 text-red-400" />
            }
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{passed ? 'Well done!' : 'Keep practicing!'}</h2>
          <p className="text-gray-400 mb-8">{passed ? 'You passed the test.' : 'You can review and try again.'}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass p-4">
              <div className="text-2xl font-bold text-white">{result.score}</div>
              <div className="text-xs text-gray-500 mt-1">Score</div>
            </div>
            <div className="glass p-4">
              <div className="text-2xl font-bold text-white">{result.maxScore}</div>
              <div className="text-xs text-gray-500 mt-1">Max Score</div>
            </div>
            <div className="glass p-4">
              <div className={`text-2xl font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{pct.toFixed(0)}%</div>
              <div className="text-xs text-gray-500 mt-1">Percentage</div>
            </div>
          </div>

          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={`h-full rounded-full ${passed ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`}
            />
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/leaderboard')} className="btn-primary">View Leaderboard</button>
            <button onClick={() => navigate('/skills')} className="btn-secondary">Back to Skills</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="glass p-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white">{test.title}</h2>
          <p className="text-xs text-gray-500">{test.skill?.name}</p>
        </div>
        {test?.timeLimitMinutes && (
          <Timer seconds={test.timeLimitMinutes * 60} onExpire={handleSubmit} />
        )}
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Question {currentQ + 1} of {questions.length}</span>
          <span>{answered} answered</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge bg-violet-500/20 text-violet-400 border border-violet-500/30">Q{currentQ + 1}</span>
            <span className="text-xs text-gray-500">{q?.points} point{q?.points !== 1 ? 's' : ''}</span>
          </div>
          <p className="text-white text-lg font-medium mb-6 leading-relaxed">{q?.questionText}</p>

          <div className="space-y-3">
            {q?.options?.map(opt => {
              const selected = answers[q.id] === opt.id
              return (
                <button key={opt.id} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selected
                      ? 'bg-violet-500/20 border-violet-500/50 text-white'
                      : 'bg-white/3 border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/20'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected ? 'border-violet-400 bg-violet-400' : 'border-gray-600'}`}>
                      {selected && <div className="w-full h-full rounded-full bg-white scale-50" />}
                    </div>
                    {opt.optionText}
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0} className="btn-secondary">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {/* Question dots */}
        <div className="flex gap-1.5 flex-wrap justify-center">
          {questions.map((qq, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                i === currentQ ? 'bg-violet-600 text-white' :
                answers[qq.id] ? 'bg-emerald-500/30 text-emerald-400' : 'bg-white/10 text-gray-400'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>

        {currentQ < questions.length - 1 ? (
          <button onClick={() => setCurrentQ(p => p + 1)} className="btn-primary">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Submit</>}
          </button>
        )}
      </div>
    </div>
  )
}
