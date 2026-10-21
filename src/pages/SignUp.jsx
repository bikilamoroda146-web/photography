import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { EMAIL_RE, Field, inputCls } from '../components/ui'
import { G } from '../data/data'
import { registerCustomer } from '../services/customerService'

export default function SignUp() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => ({ ...current, [field]: '', form: '' }))
    }
  }

  async function onSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Enter your full name.'
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    else if (!EMAIL_RE.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (form.phone.trim().length > 40) nextErrors.phone = 'Phone number must be 40 characters or fewer.'
    if (form.password.length < 8 || form.password.length > 128) nextErrors.password = 'Use a password between 8 and 128 characters.'
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setBusy(true)
    try {
      await registerCustomer(form)
      navigate('/signin', { replace: true, state: { registered: true, email: form.email.trim().toLowerCase() } })
    } catch (error) {
      setErrors({ form: error.message || 'Your account could not be created.' })
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10" style={{ background: G.landscape }}>
      <section className="fade w-full max-w-lg border border-beige/50 bg-ivory p-7 sm:p-10">
        <div className="text-center">
          <p className="font-serif text-2xl tracking-widest">SAMI</p>
          <h1 className="mt-4 font-serif text-2xl">Create Your Account.</h1>
          <p className="mt-2 text-xs leading-5 text-muted">Your account and profile are stored in this browser only. This frontend-only sign-up is not secure production authentication.</p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <Field id="su-name" label="Full name" error={errors.name}>
            <input id="su-name" type="text" autoComplete="name" required maxLength={100} className={inputCls} value={form.name}
              onChange={update('name')} aria-invalid={!!errors.name} />
          </Field>
          <Field id="su-email" label="Email address" error={errors.email}>
            <input id="su-email" type="email" autoComplete="email" required className={inputCls} value={form.email}
              onChange={update('email')} aria-invalid={!!errors.email} />
          </Field>
          <Field id="su-phone" label="Phone number (optional)" error={errors.phone}>
            <input id="su-phone" type="tel" autoComplete="tel" maxLength={40} className={inputCls} value={form.phone}
              onChange={update('phone')} aria-invalid={!!errors.phone} />
          </Field>
          <Field id="su-password" label="Password" error={errors.password}>
            <div className="relative">
              <input id="su-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={128}
                className={`${inputCls} pr-12`} value={form.password} onChange={update('password')} aria-invalid={!!errors.password} />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted hover:text-char">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <span className="mt-1 block text-xs text-muted">Use 8–128 characters.</span>
          </Field>
          <Field id="su-confirm-password" label="Confirm password" error={errors.confirmPassword}>
            <div className="relative">
              <input id="su-confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required
                className={`${inputCls} pr-12`} value={form.confirmPassword} onChange={update('confirmPassword')}
                aria-invalid={!!errors.confirmPassword} />
              <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)}
                aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted hover:text-char">
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </Field>
          {errors.form && <p role="alert" className="border border-red-800/30 bg-red-50 p-3 text-xs text-red-800">{errors.form}</p>}
          <button type="submit" disabled={busy} className="min-h-11 w-full bg-gold py-3 text-xs uppercase tracking-widest text-rich hover:bg-beige disabled:opacity-60">
            {busy ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-muted">Already have an account? <Link to="/signin" className="font-medium text-char underline underline-offset-4 hover:text-gold">Sign in</Link></p>
        <div className="text-center"><Link to="/" className="mt-4 inline-block min-h-10 pt-3 text-xs text-muted hover:text-gold">← Back to site</Link></div>
      </section>
    </main>
  )
}
