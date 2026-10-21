import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { EMAIL_RE, Field, inputCls } from '../components/ui'
import { G } from '../data/data'
import { signInCustomer } from '../services/customerService'

export default function SignIn() {
  const nav = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    if (!EMAIL_RE.test(email.trim())) {
      setErr('Enter a valid email address.')
      return
    }
    if (!password) {
      setErr('Enter your password.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      await signInCustomer(email, password)
      nav(location.state?.from || '/dashboard', { replace: true })
    } catch (error) {
      setErr(error.message || 'Unable to sign in.')
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10" style={{ background: G.landscape }}>
      <div className="fade w-full max-w-sm border border-beige/50 bg-ivory p-8 text-center sm:p-10">
        <p className="font-serif text-2xl tracking-widest">SAMI</p>
        <h1 className="mt-4 font-serif text-2xl">Welcome Back.</h1>
        {location.state?.registered && <p role="status" className="mt-4 border border-gold bg-cream p-3 text-left text-xs leading-5">Your account was created. Sign in with your email and password.</p>}
        <p className="mt-2 text-xs leading-5 text-muted">Sign in to manage your bookings and profile. Accounts are saved in this browser only; this is not secure production authentication.</p>
        <form className="mt-6 space-y-4 text-left" onSubmit={onSubmit} noValidate>
          <Field id="si-email" label="Email address">
            <input id="si-email" type="email" autoComplete="email" required className={inputCls} value={email}
              onChange={(event) => { setEmail(event.target.value); setErr('') }}
              aria-invalid={!!err && !EMAIL_RE.test(email.trim())} />
          </Field>
          <Field id="si-password" label="Password">
            <div className="relative">
              <input id="si-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
                className={`${inputCls} pr-12`} value={password}
                onChange={(event) => { setPassword(event.target.value); setErr('') }}
                aria-invalid={!!err && !password} />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted hover:text-char">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </Field>
          {err && <p role="alert" className="text-xs text-red-700">{err}</p>}
          <button type="submit" disabled={busy} className="min-h-11 w-full bg-gold py-3 text-xs uppercase tracking-widest text-rich hover:bg-beige disabled:opacity-60">
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="mt-5 text-xs text-muted">New to Sami Photography? <Link to="/signup" className="font-medium text-char underline underline-offset-4 hover:text-gold">Create an account</Link></p>
        <Link to="/" className="mt-5 inline-block min-h-10 pt-3 text-xs text-muted hover:text-gold">← Back to site</Link>
      </div>
    </main>
  )
}
