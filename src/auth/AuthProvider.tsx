import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue } from './authContext'
import { isSupabaseConfigured, supabase } from './supabaseClient'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return
      }

      setSession(data.session)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
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
