import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { useAuth } from '../auth/authContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button } from '../components/ui/Button'

interface AuthPageProps {
  mode: 'login' | 'signup'
}

export default function AuthPage({ mode }: AuthPageProps) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const location = useLocation()
  const { isConfigured, signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fromPath = typeof location.state?.from?.pathname === 'string' ? location.state.from.pathname : '/dashboard'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setStatusMessage(null)

    if (!email.trim() || password.length < 6) {
      setErrorMessage('Enter an email and a password with at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    const authError = isSignup ? await signUp(email.trim(), password) : await signIn(email.trim(), password)
    setIsSubmitting(false)

    if (authError) {
      setErrorMessage(authError)
      return
    }

    if (isSignup) {
      setStatusMessage('Account created. Check your email if confirmation is enabled, then log in.')
      return
    }

    navigate(fromPath, { replace: true })
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 pt-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background font-black">S</div>
          <span className="text-xl font-bold tracking-tight">StudySpark</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl place-items-center px-6 py-12">
        <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-purple">
              {isSignup ? 'Create account' : 'Welcome back'}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
              {isSignup ? 'Sign up for StudySpark.' : 'Log in to StudySpark.'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              {isSignup
                ? 'Use email and password to create your student workspace.'
                : 'Use your email and password to continue your study workspace.'}
            </p>
          </div>

          {!isConfigured && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm font-medium leading-6 text-red-500">
              Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Email</span>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 focus-within:ring-2 focus-within:ring-purple/20">
                <Mail size={18} className="shrink-0 text-purple" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
                  placeholder="student@example.com"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-foreground">Password</span>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 focus-within:ring-2 focus-within:ring-purple/20">
                <LockKeyhole size={18} className="shrink-0 text-purple" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </label>

            {errorMessage && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm font-medium leading-6 text-red-500">
                {errorMessage}
              </div>
            )}

            {statusMessage && (
              <div className="rounded-xl border border-teal/20 bg-teal/5 p-4 text-sm font-medium leading-6 text-teal">
                {statusMessage}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting || !isConfigured} className="w-full gap-2">
              {isSubmitting ? (isSignup ? 'Creating account' : 'Logging in') : isSignup ? 'Create Account' : 'Log In'}
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
            <Link
              to={isSignup ? '/login' : '/signup'}
              state={location.state}
              className="font-semibold text-purple hover:underline"
            >
              {isSignup ? 'Log in' : 'Sign up'}
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}
