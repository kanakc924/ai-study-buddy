'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { getMe } from '@/services/api'

interface User { _id: string; name: string; email: string }
interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('study_buddy_token')
    if (stored) {
      setToken(stored)
      getMe().then(res => setUser(res.data)).catch(() => {
        localStorage.removeItem('study_buddy_token')
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (token: string, user: User) => {
    localStorage.setItem('study_buddy_token', token)
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('study_buddy_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
