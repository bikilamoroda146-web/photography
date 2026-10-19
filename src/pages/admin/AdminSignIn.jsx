import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { startDemoAdminSession, getDemoAdminSession } from '../../services/adminSessionService'

export default function AdminSignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  let session
  try {
    session = getDemoAdminSession()
  } catch (storageError) {
    return <main className="grid min-h-screen place-items-center px-5 text-center"><div className="max-w-md">
      <h1 className="font-serif text-2xl">Admin demo unavailable</h1><p role="alert" className="mt-3 text-sm leading-6 text-muted">{storageError.message}</p>
      <Link to="/" className="mt-5 inline-block min-h-10 pt-2 text-xs uppercase tracking-wider underline underline-offset-4">Return to site</Link>
    </div></main>
  }
  if (session) return <Navigate to="/admin" replace />

  function beginDemo() {
    try {
      startDemoAdminSession()
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (startError) {
      setError(startError.message || 'The admin demo could not be started.')
    }
  }

  return <main className="grid min-h-screen place-items-center bg-char px-4 py-10 text-ivory">
    <section className="w-full max-w-md border border-beige/40 bg-ivory p-7 text-char sm:p-10">
      <Link to="/" className="font-serif text-xl tracking-[.2em]">SAMI</Link>
      <p className="mt-1 text-[9px] uppercase tracking-[.3em] text-muted">Studio administration</p>
      <h1 className="mt-7 font-serif text-3xl">Admin demo access</h1>
      <p className="mt-3 text-sm leading-6 text-muted">Start a separate simulated administrator session to preview the business dashboard. This demo has no real login or authorization.</p>
      <div className="mt-5 border-l-2 border-gold bg-cream px-4 py-3 text-xs leading-5 text-muted">Frontend prototype only · A browser-stored admin session is not secure and can be modified by a visitor. Production authorization must be enforced by a backend.</div>
      {error && <p role="alert" className="mt-4 border border-red-800/30 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
      <button type="button" onClick={beginDemo} className="mt-6 min-h-12 w-full bg-char px-5 py-3 text-xs uppercase tracking-widest text-ivory transition hover:bg-dark">Start simulated admin session</button>
      <Link to="/" className="mt-5 inline-flex min-h-10 items-center text-xs text-muted hover:text-gold">← Return to public site</Link>
    </section>
  </main>
}
