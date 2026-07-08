import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue } from './authContext'
import { isSupabaseConfigured, supabase } from './supabaseClient'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }

    let isMounted = true
    let subscription: { unsubscribe: () => void } | null = null

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) {
          return
        }
        setSession(data.session)
      })
      .catch((error) => {
        console.error('Failed to load session in AuthProvider:', error)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    try {
      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!isMounted) {
          return
        }
        setSession(nextSession)
        setIsLoading(false)
      })
      subscription = sub
    } catch (error) {
      console.error('Failed to register auth state listener in AuthProvider:', error)
      if (isMounted) {
        setTimeout(() => {
          if (isMounted) {
            setIsLoading(false)
          }
        }, 0)
      }
    }

    return () => {
      isMounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isConfigured: isSupabaseConfigured,
      signIn: async (email: string, password: string) => {
        if (!isSupabaseConfigured) {
          return 'Supabase environment variables are not configured.'
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        return error?.message ?? null
      },
      signUp: async (email: string, password: string) => {
        if (!isSupabaseConfigured) {
          return 'Supabase environment variables are not configured.'
        }

        const { error } = await supabase.auth.signUp({ email, password })

        return error?.message ?? null
      },
      signOut: async () => {
        await supabase.auth.signOut()
      },
    }),
    [isLoading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
