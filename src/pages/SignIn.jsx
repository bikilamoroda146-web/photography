import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { EMAIL_RE, Field, inputCls } from '../components/ui'
import { G } from '../data/data'
import { startDemoSession } from '../services/customerService'

export default function SignIn() {
  const nav = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  function onSubmit(e) {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) return setErr('Enter a valid email address.')
    setBusy(true)
    setErr('')
    try {
      startDemoSession(email)
      nav(location.state?.from || '/dashboard', { replace: true })
    } catch (error) {
      setErr(error.message || 'The demo session could not be started.')
      setBusy(false)
    }
  }
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10" style={{ background: G.landscape }}>
      <div className="fade w-full max-w-sm border border-beige/50 bg-ivory p-8 text-center sm:p-10">
        <p className="font-serif text-2xl tracking-widest">SAMI</p><h1 className="mt-4 font-serif text-2xl">Welcome Back.</h1>
        <p className="mt-2 text-xs leading-5 text-muted">Start a simulated customer session to explore your dashboard. Try <strong>demo@example.com</strong> to view sample bookings. This is not secure authentication.</p>
        <form className="mt-6 space-y-4 text-left" onSubmit={onSubmit} noValidate>
          <Field id="si-email" label="Email address"><input id="si-email" type="email" autoComplete="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err} /></Field>
          {err && <p role="alert" className="text-xs text-red-700">{err}</p>}
          <button type="submit" disabled={busy} className="min-h-11 w-full bg-gold py-3 text-xs uppercase tracking-widest text-rich hover:bg-beige disabled:opacity-60">{busy ? 'Starting demo…' : 'Continue to demo dashboard'}</button>
        </form>
        <Link to="/" className="mt-5 inline-block min-h-10 pt-3 text-xs text-muted hover:text-gold">← Back to site</Link>
      </div></main>)
}
