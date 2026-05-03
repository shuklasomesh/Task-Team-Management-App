import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, ArrowRight, Loader2, UserCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password.length < 6) { setErrors({ password: 'Min. 6 characters' }); return }
    setLoading(true)
    try {
      const data = await register(form)
      toast.success(`Welcome, ${data.name}!`)
      navigate('/dashboard')
    } catch (err) {
      const fieldErrors = err.response?.data?.errors
      if (fieldErrors) setErrors(fieldErrors)
      else toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (key, type, placeholder, label) => (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="input"
        value={form[key]}
        onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(err => ({ ...err, [key]: '' })) }}
        required
      />
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-violet-700/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Ethara</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Join your team on Ethara</p>
        </div>

        <div className="glass p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {field('name', 'text', 'John Doe', 'Full Name')}
            {field('email', 'email', 'you@example.com', 'Email')}

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className="input pr-11"
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(err => ({ ...err, password: '' })) }}
                  required
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <UserCheck className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-400">
                Admins can create projects, assign tasks, and manage the team. Members receive tasks and take skill tests.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                : <>Create account <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
