import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, Users, BarChart3, Shield, ArrowRight,
  Brain, Trophy, Clock, Star, ChevronRight, MessageSquare
} from 'lucide-react'

const features = [
  { icon: Users, title: 'Team Collaboration', desc: 'Manage members, assign tasks, and track real-time activity across your entire team.', color: 'violet' },
  { icon: MessageSquare, title: 'Built-in Team Chat', desc: 'Admin and members communicate directly inside the platform — no external tools needed. Messages update live every 4 seconds.', color: 'indigo' },
  { icon: Brain, title: 'Skills & Testing', desc: 'Create skill assessments in Java, Python, Math and more. Members get tested and ranked automatically.', color: 'pink' },
  { icon: Trophy, title: 'Performance Leaderboard', desc: 'Gamified leaderboard based on test scores helps admins assign tasks to the right people.', color: 'amber' },
  { icon: Clock, title: 'Session Tracking', desc: 'Real-time session monitoring shows exactly who is online and how long they have been working.', color: 'emerald' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Comprehensive stats on task completion, team velocity, and project health at a glance.', color: 'cyan' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Granular admin and member roles ensure the right people have the right permissions.', color: 'violet' },
]


const colorMap = {
  violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-400',
  indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/20 text-indigo-400',
  amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400',
  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
  pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/20 text-pink-400',
  cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20 text-cyan-400',
}

function FloatingOrb({ className }) {
  return <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Ambient background */}
      <FloatingOrb className="w-96 h-96 bg-violet-600 top-0 left-1/4 -translate-x-1/2" />
      <FloatingOrb className="w-80 h-80 bg-indigo-600 top-1/3 right-0 translate-x-1/2" />
      <FloatingOrb className="w-64 h-64 bg-violet-800 bottom-1/4 left-0 -translate-x-1/2" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Ethara</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm px-4 py-2 rounded-xl font-medium text-gray-300 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-4 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-8 uppercase tracking-wider">
            <Star className="w-3 h-3" />
            Intelligent Team Management Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Build teams that
            <br />
            <span className="gradient-text">actually ship.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Ethara combines project management, skill assessments, and real-time session tracking
            into one powerful platform — so admins always know who's working and who's best for the job.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary px-8 py-3 text-base">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-3 text-base">
              Sign in
            </Link>
          </div>
        </motion.div>

      </section>

      {/* Dashboard preview mockup */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative z-10 max-w-5xl mx-auto px-6 mb-24"
      >
        <div className="glass p-1 rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/10">
          <div className="bg-[#111118] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center px-3">
                <span className="text-xs text-gray-500">app.ethara.io/dashboard</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Active Tasks', value: '24', color: 'text-violet-400' },
                { label: 'Team Members', value: '8', color: 'text-indigo-400' },
                { label: 'Tests Taken', value: '47', color: 'text-amber-400' },
                { label: 'Online Now', value: '5', color: 'text-emerald-400' },
              ].map(item => (
                <div key={item.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 bg-white/5 rounded-xl p-3 border border-white/5 h-24 flex flex-col justify-between">
                <div className="text-xs text-gray-400 font-medium">Task Completion</div>
                <div className="flex items-end gap-1 h-12">
                  {[40, 65, 55, 80, 75, 90, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-violet-600 to-violet-400/50 rounded-sm"
                      style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5 h-24">
                <div className="text-xs text-gray-400 font-medium mb-2">Online Members</div>
                {['Alex K.', 'Maria S.', 'John D.'].map((name, i) => (
                  <div key={i} className="flex items-center gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-gray-300">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything your team needs</h2>
          <p className="text-gray-400 max-w-xl mx-auto">From task assignment to skill testing — Ethara gives admins complete visibility and control.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`glass p-6 bg-gradient-to-br ${colorMap[f.color].split(' ')[0]} ${colorMap[f.color].split(' ')[1]} border ${colorMap[f.color].split(' ')[2]} hover:scale-[1.02] transition-all duration-300`}
            >
              <f.icon className={`w-6 h-6 mb-4 ${colorMap[f.color].split(' ')[3]}`} />
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Chat Feature Highlight */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass p-8 md:p-12 bg-gradient-to-br from-indigo-600/10 to-violet-600/5 border-indigo-500/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-5 uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5" /> New Feature
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Your entire team,<br />
                <span className="gradient-text">one conversation.</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                No Slack, no WhatsApp, no switching apps. Ethara's built-in Team Chat keeps admin and members connected directly inside the platform with live message updates.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                {['Messages update every 4 seconds — no refresh needed', 'Admin messages are clearly highlighted', 'Full message history for the team', 'Works alongside tasks and projects'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Chat mockup */}
            <div className="glass p-4 bg-black/20 space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-1">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="text-sm font-semibold text-white">Team Chat</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Live
                </span>
              </div>
              {[
                { name: 'Alex K.', role: 'ADMIN', msg: 'Hey team, please check the new design tasks I assigned. Priority is high this sprint!', mine: false, time: '09:14' },
                { name: 'Maria S.', role: 'MEMBER', msg: 'On it! Just saw them. Starting with the dashboard component now.', mine: false, time: '09:16' },
                { name: 'You', role: 'MEMBER', msg: "I'll handle the API integration part. Will update status by EOD.", mine: true, time: '09:18' },
                { name: 'Alex K.', role: 'ADMIN', msg: 'Great! Let me know if you need unblocking. 🚀', mine: false, time: '09:19' },
              ].map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.mine ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${m.role === 'ADMIN' ? 'bg-violet-600' : 'bg-indigo-600'}`}>
                    {m.name[0]}
                  </div>
                  <div className={`max-w-[75%] ${m.mine ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!m.mine && <span className="text-xs text-gray-500 mb-1 ml-1">{m.name}{m.role === 'ADMIN' ? ' · Admin' : ''}</span>}
                    <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${m.mine ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm' : 'bg-white/8 text-gray-200 border border-white/8 rounded-bl-sm'}`}>
                      {m.msg}
                    </div>
                    <span className="text-xs text-gray-600 mt-0.5 px-1">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 text-center pb-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass max-w-2xl mx-auto p-12 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border-violet-500/20"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to level up your team?</h2>
          <p className="text-gray-400 mb-8">Join teams that use Ethara to ship faster, test smarter, and collaborate better.</p>
          <Link to="/register" className="btn-primary px-10 py-3 text-base">
            Create free account <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer / Credits */}
      <footer className="relative z-10 border-t border-white/5 pt-10 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass p-8 text-center mb-6 bg-gradient-to-br from-violet-600/5 to-indigo-600/5">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Created by</p>
            <h3 className="text-xl font-bold text-white mb-0.5">Somesh Shukla</h3>
            <p className="text-sm text-gray-400 mb-1">Final Year Student at Acropolis Institute Of Technology And Research</p>
            <p className="text-base font-semibold gradient-text mb-5">Java AI Developer</p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <a href="mailto:someshshukla263@gmail.com"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-violet-400 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                someshshukla263@gmail.com
              </a>
              <a href="tel:9179682083"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-violet-400 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                9179682083
              </a>
              <a href="https://in.linkedin.com/in/somesh-shuklaa" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-violet-400 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
              <span className="text-xs text-gray-600">Projects:</span>
              <a href="http://shikshasync.in" target="_blank" rel="noopener noreferrer"
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2">
                shikshasynnc.in
              </a>
              <a href="http://dharmsetu.org.in" target="_blank" rel="noopener noreferrer"
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2">
                dharmsetu.org.in
              </a>
            </div>
          </div>
          <p className="text-center text-gray-600 text-sm">© 2025 Ethara. Built for modern teams.</p>
        </div>
      </footer>
    </div>
  )
}
