import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { authApi, sessionApi } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const heartbeatRef = useRef(null)

  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    sessionApi.heartbeat().catch(() => {})
    heartbeatRef.current = setInterval(() => {
      sessionApi.heartbeat().catch(() => {})
    }, 30000)
  }, [])

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
  }, [])

  useEffect(() => {
    if (user) startHeartbeat()
    return () => stopHeartbeat()
  }, [user, startHeartbeat, stopHeartbeat])

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const register = useCallback(async (credentials) => {
    const { data } = await authApi.register(credentials)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const logout = useCallback(async () => {
    stopHeartbeat()
    try { await sessionApi.logout() } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [stopHeartbeat])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
