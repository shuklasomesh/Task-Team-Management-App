import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, Zap, Camera, AlertCircle, ArrowRight,
  Loader2, Mic, MicOff, CheckCircle, RotateCcw
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PASSPHRASES = [
  ['secure', 'team', 'access', 'granted'],
  ['verify', 'my', 'voice', 'now'],
  ['ethara', 'login', 'confirm', 'identity'],
  ['speak', 'clear', 'to', 'proceed'],
  ['authenticate', 'with', 'voice', 'today'],
  ['confirm', 'your', 'identity', 'please'],
]

function pickPhrase() {
  return PASSPHRASES[Math.floor(Math.random() * PASSPHRASES.length)]
}

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z\s]/g, '').trim()
}

function matchScore(spoken, expected) {
  const spokenWords = normalize(spoken).split(/\s+/)
  const expectedWords = expected.map(w => w.toLowerCase())
  let hits = 0
  for (const word of expectedWords) {
    if (spokenWords.some(s => s === word || s.startsWith(word.slice(0, 4)))) hits++
  }
  return hits / expectedWords.length
}

// Step indicator
function StepDot({ n, current, done }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
        done ? 'bg-emerald-500 text-white' :
        current ? 'bg-violet-600 text-white ring-2 ring-violet-400/40' :
        'bg-white/10 text-gray-500'
      }`}>
        {done ? <CheckCircle className="w-4 h-4" /> : n}
      </div>
    </div>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cameraGranted, setCameraGranted] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [voiceGranted, setVoiceGranted] = useState(false)
  const [voiceError, setVoiceError] = useState(null)
  const [listening, setListening] = useState(false)
  const [spokenText, setSpokenText] = useState('')
  const [passphrase] = useState(pickPhrase)
  const [step, setStep] = useState('camera') // camera | voice | form

  // ── Camera ──────────────────────────────────────────────────
  const requestCamera = useCallback(async () => {
    setCameraLoading(true)
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      setCameraGranted(true)
      setStep('voice')
    } catch (err) {
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access.'
          : 'Could not access camera. Check your device.'
      )
    } finally { setCameraLoading(false) }
  }, [])

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [])

  // ── Voice ───────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setVoiceError('Speech recognition not supported in this browser. Use Chrome.')
      return
    }
    setVoiceError(null)
    setSpokenText('')
    const rec = new SR()
    rec.lang = 'en-US'
    rec.continuous = false
    rec.interimResults = false
    rec.maxAlternatives = 3

    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    rec.onerror = (e) => {
      setListening(false)
      if (e.error === 'not-allowed') setVoiceError('Microphone permission denied.')
      else if (e.error === 'no-speech') setVoiceError('No speech detected. Please try again.')
      else setVoiceError('Could not capture voice. Please try again.')
    }
    rec.onresult = (e) => {
      const candidates = Array.from(e.results[0]).map(r => r.transcript)
      const best = candidates[0]
      setSpokenText(best)
      const score = Math.max(...candidates.map(c => matchScore(c, passphrase)))
      if (score >= 0.75) {
        setTimeout(() => { setVoiceGranted(true); setStep('form') }, 500)
      } else {
        setVoiceError(`Heard: "${best}". Score too low — try again.`)
      }
    }
    recognitionRef.current = rec
    rec.start()
  }, [passphrase])

  // ── Login submit ────────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(form)
      toast.success(`Welcome back, ${data.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  const stepIdx = step === 'camera' ? 1 : step === 'voice' ? 2 : 3

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-700/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Ethara</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Complete verification to sign in</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <StepDot n={1} current={stepIdx === 1} done={stepIdx > 1} />
          <div className={`h-px w-8 transition-colors ${stepIdx > 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />
          <StepDot n={2} current={stepIdx === 2} done={stepIdx > 2} />
          <div className={`h-px w-8 transition-colors ${stepIdx > 2 ? 'bg-emerald-500' : 'bg-white/10'}`} />
          <StepDot n={3} current={stepIdx === 3} done={false} />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mb-5 px-4">
          <span className={stepIdx >= 1 ? 'text-violet-400' : ''}>Camera</span>
          <span className={stepIdx >= 2 ? 'text-violet-400' : ''}>Voice</span>
          <span className={stepIdx >= 3 ? 'text-violet-400' : ''}>Login</span>
        </div>

        <div className="glass p-8">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Camera ── */}
            {step === 'camera' && (
              <motion.div key="camera" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="text-center">
                <div className="relative mx-auto mb-6 w-44 h-32 rounded-2xl overflow-hidden bg-black/50 border-2 border-violet-500/30 flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraGranted ? 'opacity-100' : 'opacity-0'}`} />
                  {!cameraGranted && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Camera className="w-9 h-9 text-violet-400 opacity-60" />
                      <span className="text-xs text-gray-500">Camera preview</span>
                    </div>
                  )}
                  {cameraGranted && (
                    <motion.div
                      className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent"
                      animate={{ top: ['10%', '90%', '10%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-violet-400 rounded-tl" />
                  <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-violet-400 rounded-tr" />
                  <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-violet-400 rounded-bl" />
                  <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-violet-400 rounded-br" />
                </div>
                <h3 className="font-semibold text-white mb-1">Step 1 — Camera Verification</h3>
                <p className="text-sm text-gray-400 mb-5">Allow camera access to verify your presence.</p>
                {cameraError && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-left">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-300">{cameraError}</p>
                  </div>
                )}
                <button onClick={requestCamera} disabled={cameraLoading} className="btn-primary w-full justify-center">
                  {cameraLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Requesting...</> : <><Camera className="w-4 h-4" /> Enable Camera</>}
                </button>
                {cameraError && (
                  <button onClick={() => { setCameraError(null); setStep('voice') }} className="btn-ghost w-full justify-center mt-2 text-xs">
                    Skip (not recommended)
                  </button>
                )}
              </motion.div>
            )}

            {/* ── STEP 2: Voice ── */}
            {step === 'voice' && (
              <motion.div key="voice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                <h3 className="font-semibold text-white mb-1">Step 2 — Voice Verification</h3>
                <p className="text-sm text-gray-400 mb-5">Read the passphrase below clearly into your microphone.</p>

                {/* Passphrase display */}
                <div className="bg-black/30 border border-violet-500/20 rounded-2xl p-5 mb-5">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">Say this phrase:</p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {passphrase.map((word, i) => (
                      <span key={i} className={`px-3 py-1.5 rounded-lg font-mono font-semibold text-base transition-all ${
                        voiceGranted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        listening ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 animate-pulse' :
                        'bg-white/10 text-white border border-white/10'
                      }`}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mic button */}
                <div className="flex flex-col items-center gap-4 mb-4">
                  <button
                    onClick={listening ? undefined : startListening}
                    disabled={voiceGranted}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      listening
                        ? 'bg-red-500 shadow-lg shadow-red-500/40 scale-110'
                        : voiceGranted
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40'
                        : 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-500/30 hover:scale-105'
                    }`}
                  >
                    {voiceGranted
                      ? <CheckCircle className="w-7 h-7 text-white" />
                      : listening
                      ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                          <MicOff className="w-7 h-7 text-white" />
                        </motion.div>
                      : <Mic className="w-7 h-7 text-white" />
                    }
                  </button>
                  <p className="text-xs text-gray-500">
                    {voiceGranted ? '✓ Voice verified' : listening ? 'Listening… speak now' : 'Tap the mic to start'}
                  </p>
                </div>

                {/* Waveform animation while listening */}
                {listening && (
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-violet-400 rounded-full"
                        animate={{ height: [4, Math.random() * 24 + 8, 4] }}
                        transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.07 }}
                      />
                    ))}
                  </div>
                )}

                {/* Result feedback */}
                {spokenText && !voiceGranted && (
                  <div className="text-xs text-gray-500 mb-3">
                    Heard: <span className="text-white font-mono">"{spokenText}"</span>
                  </div>
                )}

                {voiceError && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-left">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-red-300">{voiceError}</p>
                    </div>
                    <button onClick={startListening} className="text-violet-400 hover:text-violet-300 flex-shrink-0">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Skip option */}
                <button onClick={() => setStep('form')} className="btn-ghost w-full justify-center text-xs mt-1">
                  Skip voice verification
                </button>
              </motion.div>
            )}

            {/* ── STEP 3: Login form ── */}
            {step === 'form' && (
              <motion.form key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit}>
                {/* Verification badges */}
                <div className="flex gap-2 mb-5">
                  <div className="flex-1 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-300">Camera ✓</span>
                    <div className="ml-auto w-10 h-7 rounded-lg overflow-hidden border border-emerald-500/30">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs ${
                    voiceGranted
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                  }`}>
                    <Mic className="w-3 h-3" />
                    {voiceGranted ? 'Voice ✓' : 'Voice —'}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <input type="email" placeholder="you@example.com" className="input" value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input pr-11"
                        value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-6">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            )}

          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          No account?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
