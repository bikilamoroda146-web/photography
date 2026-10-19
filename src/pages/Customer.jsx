import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowDownUp, ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, ImagePlus,
  Mail, MapPin, Phone, Search, SlidersHorizontal,
} from 'lucide-react'
import { EMAIL_RE, Field, inputCls } from '../components/ui'
import useBookings from '../hooks/useBookings'
import { usePublicServices } from '../hooks/usePublicData'
import {
  cancelBooking, createBooking,
} from '../services/bookingService'
import {
  endDemoSession, getCustomer, getDemoSession, getDemoSettings, saveCustomer, saveDemoSettings,
} from '../services/customerService'

const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected']
const now = new Date()
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
const dateLabel = (value, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
  if (!value) return 'Date not selected'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime()) ? 'Date not available' : new Intl.DateTimeFormat('en', options).format(date)
}
const submittedLabel = (value) => value
  ? (() => {
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? 'Date not available'
      : new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
  })()
  : 'Date not available'

function PageHeading({ eyebrow, title, children }) {
  return <div className="mb-8 border-b border-beige pb-6">
    <p className="mb-2 text-[10px] uppercase tracking-[.24em] text-gold">{eyebrow}</p>
    <h1 className="font-serif text-3xl leading-tight text-char sm:text-4xl">{title}</h1>
    {children && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{children}</p>}
  </div>
}

function Status({ value }) {
  const styles = {
    Pending: 'border-gold/50 bg-gold/10 text-[#76592d]',
    Confirmed: 'border-emerald-800/30 bg-emerald-800/5 text-emerald-900',
    Completed: 'border-char/20 bg-char/5 text-char',
    Cancelled: 'border-muted/30 bg-dark/5 text-muted',
    Rejected: 'border-red-800/25 bg-red-800/5 text-red-900',
  }
  return <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[.12em] ${styles[value] || styles.Pending}`}>
    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{value}
  </span>
}

function EmptyState({ title = 'No bookings yet.', description = 'Start planning your next photography session.', action = 'Explore Services', to = '/services' }) {
  return <div className="border border-dashed border-beige bg-ivory px-5 py-12 text-center">
    <CalendarDays aria-hidden="true" className="mx-auto mb-4 h-6 w-6 text-gold" />
    <h2 className="font-serif text-2xl text-char">{title}</h2>
    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
    <Link to={to} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 bg-char px-5 py-3 text-[11px] uppercase tracking-[.16em] text-ivory transition hover:bg-dark">
      {action}<ArrowRight aria-hidden="true" size={14} />
    </Link>
  </div>
}

function Feedback({ children, error = false }) {
  return <p role={error ? 'alert' : 'status'} className={`border px-4 py-3 text-sm ${error ? 'border-red-800/30 bg-red-50 text-red-900' : 'border-gold/50 bg-cream text-char'}`}>{children}</p>
}

function BookingRows({ bookings }) {
  return <>
    <div className="hidden overflow-x-auto border border-beige bg-ivory md:block">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-beige bg-cream text-[10px] uppercase tracking-[.16em] text-muted">
          <tr><th className="px-5 py-4 font-medium">Reference / Service</th><th className="px-5 py-4 font-medium">Preferred date</th><th className="px-5 py-4 font-medium">Submitted</th><th className="px-5 py-4 font-medium">Status</th><th className="px-5 py-4"><span className="sr-only">Details</span></th></tr>
        </thead>
        <tbody className="divide-y divide-beige">
          {bookings.map((booking) => <tr key={booking.id} className="transition hover:bg-cream/50">
            <td className="px-5 py-4"><span className="block text-[10px] tracking-wider text-muted">{booking.reference}</span><span className="mt-1 block font-medium text-char">{booking.service}</span></td>
            <td className="px-5 py-4 text-muted">{dateLabel(booking.preferredDate)}</td>
            <td className="px-5 py-4 text-muted">{submittedLabel(booking.submittedAt)}</td>
            <td className="px-5 py-4"><Status value={booking.status} /></td>
            <td className="px-5 py-4 text-right"><Link aria-label={`View ${booking.reference}`} to={`/dashboard/bookings/${booking.id}`} className="inline-flex min-h-10 items-center gap-2 text-xs uppercase tracking-wider text-char hover:text-gold">Details<ArrowRight aria-hidden="true" size={14} /></Link></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    <ul className="divide-y divide-beige border-y border-beige bg-ivory md:hidden">
      {bookings.map((booking) => <li key={booking.id} className="space-y-3 py-4">
        <div className="flex items-start justify-between gap-3"><div><span className="text-[10px] tracking-wider text-muted">{booking.reference}</span><h2 className="mt-1 font-serif text-lg text-char">{booking.service}</h2></div><Status value={booking.status} /></div>
        <div className="grid grid-cols-2 gap-3 text-xs"><div><span className="block uppercase tracking-wider text-muted">Preferred date</span><span className="mt-1 block">{dateLabel(booking.preferredDate)}</span></div><div><span className="block uppercase tracking-wider text-muted">Submitted</span><span className="mt-1 block">{submittedLabel(booking.submittedAt)}</span></div></div>
        <Link to={`/dashboard/bookings/${booking.id}`} className="inline-flex min-h-10 items-center gap-2 text-xs uppercase tracking-wider text-char hover:text-gold">View details<ArrowRight aria-hidden="true" size={14} /></Link>
      </li>)}
    </ul>
  </>
}

export function Dashboard() {
  const session = getDemoSession()
  const customer = getCustomer(session.email)
  const { bookings, loading, error } = useBookings(session.email)
  const now = new Date()
  const upcoming = bookings.filter((booking) => ['Pending', 'Confirmed'].includes(booking.status) && booking.preferredDate && new Date(`${booking.preferredDate}T23:59:59`) >= now)
    .sort((a, b) => a.preferredDate.localeCompare(b.preferredDate))
  const counts = {
    total: bookings.length,
    upcoming: upcoming.length,
    pending: bookings.filter((booking) => booking.status === 'Pending').length,
    completed: bookings.filter((booking) => booking.status === 'Completed').length,
  }

  return <div>
    <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-[10px] uppercase tracking-[.24em] text-gold">Your studio account</p>
        <h1 className="font-serif text-3xl leading-tight text-char sm:text-4xl">Welcome back, {customer.name}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Manage your photography sessions and booking requests in one place.</p></div>
      <Link to="/dashboard/bookings/new" className="inline-flex min-h-11 w-fit items-center gap-2 bg-char px-5 py-3 text-[11px] uppercase tracking-[.16em] text-ivory transition hover:bg-dark">Book a Session<ArrowRight aria-hidden="true" size={14} /></Link>
    </div>
    {error && <Feedback error>{error}</Feedback>}
    <section aria-label="Booking summary" className="mb-10 grid grid-cols-2 border-l border-t border-beige sm:grid-cols-4">
      {[['Total Bookings', counts.total], ['Upcoming Sessions', counts.upcoming], ['Pending Requests', counts.pending], ['Completed Sessions', counts.completed]].map(([label, number]) =>
        <div key={label} className="min-h-24 border-b border-r border-beige bg-ivory px-4 py-4 sm:px-5"><p className="font-serif text-3xl text-char">{loading ? '—' : number}</p><p className="mt-1 text-[9px] uppercase tracking-[.14em] text-muted sm:text-[10px]">{label}</p></div>)}
    </section>
    {loading ? <p role="status" className="py-8 text-sm text-muted">Loading your bookings…</p> : bookings.length === 0
      ? <EmptyState />
      : <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="upcoming-heading">
          <div className="mb-4 flex items-center justify-between border-b border-beige pb-3"><h2 id="upcoming-heading" className="font-serif text-2xl text-char">Upcoming Sessions</h2><Link to="/dashboard/bookings" className="text-[10px] uppercase tracking-wider text-muted hover:text-char">All bookings</Link></div>
          {upcoming.length ? <ul className="divide-y divide-beige border-y border-beige">
            {upcoming.slice(0, 3).map((booking) => <li key={booking.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
              <div><p className="font-serif text-lg text-char">{booking.service}</p><p className="mt-1 text-xs text-muted">{dateLabel(booking.preferredDate)}{booking.preferredTime ? ` · ${booking.preferredTime}` : ''}</p></div>
              <div className="flex items-center justify-between gap-4"><Status value={booking.status} /><Link to={`/dashboard/bookings/${booking.id}`} className="inline-flex min-h-10 items-center gap-2 text-xs uppercase tracking-wider hover:text-gold">View details<ArrowRight aria-hidden="true" size={14} /></Link></div>
            </li>)}
          </ul> : <p className="border-y border-beige py-6 text-sm text-muted">There are no upcoming sessions. You can review past and closed requests in My Bookings.</p>}
        </section>
        <section aria-labelledby="activity-heading">
          <div className="mb-4 border-b border-beige pb-3"><h2 id="activity-heading" className="font-serif text-2xl text-char">Recent Activity</h2></div>
          <ul className="divide-y divide-beige border-y border-beige">
            {bookings.slice(0, 4).map((booking) => <li key={booking.id} className="flex gap-3 py-4">
              <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center border border-beige text-gold"><Clock3 aria-hidden="true" size={14} /></span>
              <div><p className="text-sm text-char">{booking.status === 'Pending' ? 'Request submitted' : `Request ${booking.status.toLowerCase()}`} · {booking.service}</p><p className="mt-1 text-xs text-muted">{submittedLabel(booking.submittedAt)}</p></div>
            </li>)}
          </ul>
        </section>
      </div>}
  </div>
}

export function Bookings() {
  const session = getDemoSession()
  const { bookings, loading, error } = useBookings(session.email)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [sort, setSort] = useState('newest')
  const filtered = useMemo(() => bookings.filter((booking) => {
    const matchesQuery = `${booking.service} ${booking.reference}`.toLowerCase().includes(query.trim().toLowerCase())
    return matchesQuery && (status === 'All statuses' || booking.status === status)
  }).sort((a, b) => sort === 'oldest'
    ? new Date(a.preferredDate || a.submittedAt) - new Date(b.preferredDate || b.submittedAt)
    : new Date(b.preferredDate || b.submittedAt) - new Date(a.preferredDate || a.submittedAt)), [bookings, query, status, sort])

  return <div>
    <PageHeading eyebrow="Your account" title="My Bookings">Review your requests, session details and booking status.</PageHeading>
    <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(220px,1fr)_190px_160px_auto]">
      <label className="relative block"><span className="sr-only">Search by service or reference</span><Search aria-hidden="true" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputCls} pl-9`} placeholder="Search service or reference" /></label>
      <label><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className={inputCls}><option>All statuses</option>{STATUSES.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="relative block"><span className="sr-only">Sort by date</span><ArrowDownUp aria-hidden="true" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><select value={sort} onChange={(event) => setSort(event.target.value)} className={`${inputCls} pl-9`}><option value="newest">Date: newest</option><option value="oldest">Date: oldest</option></select></label>
      <button type="button" onClick={() => { setQuery(''); setStatus('All statuses'); setSort('newest') }} className="inline-flex min-h-11 items-center justify-center gap-2 border border-beige px-4 text-xs uppercase tracking-wider hover:border-gold"><SlidersHorizontal aria-hidden="true" size={14} />Clear filters</button>
    </div>
    {error && <Feedback error>{error}</Feedback>}
    {loading ? <p role="status" className="py-12 text-center text-sm text-muted">Loading your bookings…</p>
      : filtered.length ? <><p className="mb-3 text-xs text-muted">{filtered.length} {filtered.length === 1 ? 'booking' : 'bookings'}</p><BookingRows bookings={filtered} /></>
        : bookings.length ? <div className="border border-dashed border-beige bg-ivory px-5 py-10 text-center"><h2 className="font-serif text-xl">No matching bookings.</h2><p className="mt-2 text-sm text-muted">Try another search or clear the selected filters.</p><button type="button" onClick={() => { setQuery(''); setStatus('All statuses') }} className="mt-4 text-xs uppercase tracking-wider underline underline-offset-4">Clear search and status</button></div>
          : <EmptyState />}
  </div>
}

export function BookingDetails() {
  const { bookingId } = useParams()
  const session = getDemoSession()
  const { bookings, loading, error } = useBookings(session.email)
  const booking = bookings.find((item) => item.id === bookingId) || null
  const [actionError, setActionError] = useState('')

  function cancel() {
    if (!window.confirm('Cancel this pending request? This demo action cannot be undone.')) return
    try {
      cancelBooking(booking.id, session.email)
      setActionError('')
    } catch (cancelError) {
      setActionError(cancelError.message || 'The request could not be cancelled.')
    }
  }

  if (loading) return <p role="status" className="py-12 text-sm text-muted">Loading booking details…</p>
  if (error) return <Feedback error>{error}</Feedback>
  if (!booking) return <div><PageHeading eyebrow="Your account" title="Booking not found">This booking is unavailable or does not belong to your account.</PageHeading><Link to="/dashboard/bookings" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider"><ArrowLeft size={14} />Back to bookings</Link></div>

  return <div className="max-w-3xl">
    <Link to="/dashboard/bookings" className="mb-6 inline-flex min-h-10 items-center gap-2 text-xs uppercase tracking-wider text-muted hover:text-char"><ArrowLeft aria-hidden="true" size={14} />Back to bookings</Link>
    <PageHeading eyebrow={`Booking reference · ${booking.reference}`} title={booking.service}>
      <span className="mt-3 inline-flex"><Status value={booking.status} /></span>
    </PageHeading>
    {actionError && <div className="mb-5"><Feedback error>{actionError}</Feedback></div>}
    <section className="grid gap-x-8 sm:grid-cols-2">
      <Detail label="Requested session date" value={dateLabel(booking.preferredDate)} icon={<CalendarDays size={16} />} />
      <Detail label="Request submitted" value={submittedLabel(booking.submittedAt)} icon={<Clock3 size={16} />} />
      <Detail label="Preferred time" value={booking.preferredTime || 'No preference provided'} icon={<Clock3 size={16} />} />
      <Detail label="Location or venue" value={booking.location || 'To be discussed'} icon={<MapPin size={16} />} />
      <div className="border-y border-beige py-5 sm:col-span-2"><h2 className="text-[10px] uppercase tracking-[.16em] text-muted">Your message</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-char">{booking.message || 'No message provided.'}</p></div>
      <div className="border-b border-beige py-5 sm:col-span-2"><h2 className="text-[10px] uppercase tracking-[.16em] text-muted">Studio notes</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-char">{booking.notes || 'There are no additional notes for this request.'}</p></div>
    </section>
    {booking.status === 'Pending' && <div className="mt-7 flex flex-wrap items-center gap-4"><button type="button" onClick={cancel} className="min-h-11 border border-char px-5 text-xs uppercase tracking-wider transition hover:bg-char hover:text-ivory">Cancel pending request</button><p className="text-xs text-muted">Only requests awaiting review can be cancelled.</p></div>}
    <div className="mt-8 border-l-2 border-gold bg-cream px-4 py-3 text-sm leading-6 text-muted">A request remains pending until the studio contacts you. This page does not confirm a session.</div>
  </div>
}

function Detail({ label, value, icon }) {
  return <div className="border-b border-beige py-5"><h2 className="flex items-center gap-2 text-[10px] uppercase tracking-[.16em] text-muted">{icon}{label}</h2><p className="mt-2 text-sm text-char">{value}</p></div>
}

export function BookSession() {
  const session = getDemoSession()
  const customer = getCustomer(session.email)
  const { services, error: servicesError } = usePublicServices()
  const [form, setForm] = useState({ name: customer.name, email: customer.email, phone: customer.phone || '', service: '', date: '', time: '', location: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [submittedBooking, setSubmittedBooking] = useState(null)
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Please enter your full name.'
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    else if (!EMAIL_RE.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (!form.service || !services.some((service) => service.name === form.service)) nextErrors.service = 'Choose an active service.'
    if (!form.date) nextErrors.date = 'Choose your preferred date.'
    else if (form.date < today) nextErrors.date = 'Choose today or a future date.'
    if (!form.message.trim()) nextErrors.message = 'Please tell us a little about your request.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setStatus('loading')
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350))
      const created = createBooking({
        service: form.service,
        contactEmail: form.email.trim(),
        contactPhone: form.phone.trim(),
        preferredDate: form.date,
        preferredTime: form.time,
        location: form.location.trim(),
        message: form.message.trim(),
        customerName: form.name.trim(),
      })
      setSubmittedBooking(created)
      setStatus('done')
    } catch (submitError) {
      setStatus('error')
      setErrors({ form: submitError.message || 'Your request could not be saved. Please try again.' })
    }
  }

  return <div className="max-w-3xl">
    <PageHeading eyebrow="New inquiry" title="Book a Session">Share your plans and preferred date. The studio will contact you to discuss availability and next steps.</PageHeading>
    <Feedback>Frontend demonstration only: this request is saved in this browser and is not sent to the studio. No prices or automatic confirmation are provided.</Feedback>
    {servicesError && <div className="mt-4"><Feedback error>{servicesError}</Feedback></div>}
    {status === 'done' && submittedBooking && <div className="mt-4"><div className="border border-emerald-900/25 bg-ivory p-5"><div className="flex items-center gap-2 text-sm font-medium text-emerald-900"><Check size={16} />Your request has been saved.</div><p className="mt-2 text-sm text-muted">Reference: <strong className="text-char">{submittedBooking.reference}</strong> · Status: <strong className="text-char">Pending</strong></p><Link to={`/dashboard/bookings/${submittedBooking.id}`} className="mt-3 inline-flex min-h-10 items-center gap-2 text-xs uppercase tracking-wider hover:text-gold">View request details<ArrowRight size={14} /></Link></div></div>}
    {errors.form && <div className="mt-4"><Feedback error>{errors.form}</Feedback></div>}
    <form onSubmit={submit} noValidate className="mt-7 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="booking-name" label="Full name" error={errors.name}><input id="booking-name" autoComplete="name" required className={inputCls} value={form.name} onChange={set('name')} aria-invalid={!!errors.name} /></Field>
        <Field id="booking-email" label="Email address" error={errors.email}><input id="booking-email" type="email" autoComplete="email" required className={inputCls} value={form.email} onChange={set('email')} aria-invalid={!!errors.email} /></Field>
        <Field id="booking-phone" label="Phone number (optional)"><input id="booking-phone" type="tel" autoComplete="tel" className={inputCls} value={form.phone} onChange={set('phone')} /></Field>
        <Field id="booking-service" label="Service type" error={errors.service}><select id="booking-service" required className={inputCls} value={form.service} onChange={set('service')} aria-invalid={!!errors.service}><option value="">Select a service</option>{services.map((service) => <option key={service.id}>{service.name}</option>)}</select></Field>
        <Field id="booking-date" label="Preferred date" error={errors.date}><input id="booking-date" type="date" min={today} required className={inputCls} value={form.date} onChange={set('date')} aria-invalid={!!errors.date} /></Field>
        <Field id="booking-time" label="Preferred time (optional)"><input id="booking-time" type="time" className={inputCls} value={form.time} onChange={set('time')} /></Field>
        <div className="sm:col-span-2"><Field id="booking-location" label="Location or venue (optional)"><input id="booking-location" className={inputCls} value={form.location} onChange={set('location')} /></Field></div>
        <div className="sm:col-span-2"><Field id="booking-message" label="Additional message" error={errors.message}><textarea id="booking-message" rows="5" required className={inputCls} value={form.message} onChange={set('message')} aria-invalid={!!errors.message} placeholder="Tell us what you have in mind…" /></Field></div>
      </div>
      <div className="flex flex-wrap items-center gap-4"><button type="submit" disabled={status === 'loading'} className="inline-flex min-h-11 items-center gap-2 bg-char px-6 text-xs uppercase tracking-[.14em] text-ivory transition hover:bg-dark disabled:cursor-wait disabled:opacity-60">{status === 'loading' ? 'Saving request…' : 'Send booking request'}<ArrowRight aria-hidden="true" size={14} /></button><p className="text-xs text-muted">A request does not reserve or confirm a session.</p></div>
    </form>
  </div>
}

export function Profile() {
  const session = getDemoSession()
  const savedCustomer = getCustomer(session.email)
  const [form, setForm] = useState(savedCustomer)
  const [editing, setEditing] = useState(false)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  function save(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Please enter your full name.'
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    else if (!EMAIL_RE.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (form.image.trim()) {
      try {
        const imageUrl = new URL(form.image.trim())
        if (!['http:', 'https:'].includes(imageUrl.protocol)) nextErrors.image = 'Use a valid web image URL.'
      } catch {
        nextErrors.image = 'Use a valid web image URL.'
      }
    }
    setErrors(nextErrors)
    setFeedback('')
    if (Object.keys(nextErrors).length) return
    try {
      saveCustomer(session.email, { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), image: form.image.trim() })
      setForm({ ...form, name: form.name.trim(), phone: form.phone.trim(), image: form.image.trim() })
      setEditing(false)
      setFeedback('Your profile changes have been saved in this browser.')
    } catch (saveError) {
      setErrors({ form: saveError.message || 'Your profile could not be saved.' })
    }
  }

  function cancelEdit() {
    setForm(getCustomer(session.email))
    setErrors({})
    setFeedback('')
    setEditing(false)
  }

  return <div className="max-w-2xl">
    <PageHeading eyebrow="Your account" title="My Profile">Keep your contact details up to date so the studio can follow up on your requests.</PageHeading>
    <div className="mb-6 flex items-center gap-4 border-b border-beige pb-6">
      {form.image ? <img src={form.image} alt="" className="h-16 w-16 rounded-full border border-beige object-cover" /> : <span aria-hidden="true" className="grid h-16 w-16 place-items-center rounded-full border border-gold/50 bg-cream font-serif text-2xl text-char">{(form.name || 'C').charAt(0).toUpperCase()}</span>}
      <div><p className="font-serif text-xl text-char">{form.name}</p><p className="text-sm text-muted">{form.email}</p></div>
    </div>
    {feedback && <div className="mb-5"><Feedback>{feedback}</Feedback></div>}
    {errors.form && <div className="mb-5"><Feedback error>{errors.form}</Feedback></div>}
    {!editing ? <div className="space-y-4">
      <Detail label="Full name" value={form.name || 'Not provided'} icon={<ImagePlus size={16} />} />
      <Detail label="Email address" value={form.email} icon={<Mail size={16} />} />
      <Detail label="Phone number" value={form.phone || 'Not provided'} icon={<Phone size={16} />} />
      <button type="button" onClick={() => { setEditing(true); setFeedback('') }} className="mt-5 min-h-11 bg-char px-5 text-xs uppercase tracking-wider text-ivory hover:bg-dark">Edit profile</button>
    </div> : <form onSubmit={save} noValidate className="space-y-5">
      <Field id="profile-name" label="Full name" error={errors.name}><input id="profile-name" autoComplete="name" required className={inputCls} value={form.name} onChange={set('name')} aria-invalid={!!errors.name} /></Field>
      <Field id="profile-email" label="Email address" error={errors.email}><input id="profile-email" type="email" autoComplete="email" required className={inputCls} value={form.email} onChange={set('email')} aria-invalid={!!errors.email} /><span className="mt-1 block text-xs text-muted">Your demo sign-in email is not changed by editing this contact field.</span></Field>
      <Field id="profile-phone" label="Phone number (optional)"><input id="profile-phone" type="tel" autoComplete="tel" className={inputCls} value={form.phone || ''} onChange={set('phone')} /></Field>
      <Field id="profile-image" label="Profile image URL (optional)" error={errors.image}><input id="profile-image" type="url" className={inputCls} value={form.image || ''} onChange={set('image')} placeholder="https://example.com/portrait.jpg" aria-invalid={!!errors.image} /></Field>
      <div className="flex flex-wrap gap-3"><button type="submit" className="min-h-11 bg-char px-5 text-xs uppercase tracking-wider text-ivory hover:bg-dark">Save changes</button><button type="button" onClick={cancelEdit} className="min-h-11 border border-beige px-5 text-xs uppercase tracking-wider hover:border-char">Cancel editing</button></div>
    </form>}
  </div>
}

export function Settings() {
  const session = getDemoSession()
  const customer = getCustomer(session.email)
  const [settings, setSettings] = useState(() => getDemoSettings(session.email))
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  function update(key, value) {
    const next = { ...settings, [key]: value }
    setSettings(next)
    try {
      saveDemoSettings(session.email, next)
      setFeedback('Preferences saved in this browser.')
      setError('')
    } catch (saveError) {
      setError(saveError.message || 'Your preferences could not be saved.')
      setFeedback('')
    }
  }

  function signOut() {
    if (!window.confirm('Sign out of this demo customer session?')) return
    try {
      endDemoSession()
      window.location.assign('/')
    } catch (signOutError) {
      setError(signOutError.message || 'Unable to sign out.')
    }
  }

  return <div className="max-w-2xl">
    <PageHeading eyebrow="Your account" title="Settings">Manage local notification preferences and view your demo account information.</PageHeading>
    {feedback && <div className="mb-5"><Feedback>{feedback}</Feedback></div>}
    {error && <div className="mb-5"><Feedback error>{error}</Feedback></div>}
    <section>
      <h2 className="mb-3 font-serif text-xl text-char">Notification preferences</h2>
      <p className="mb-4 text-sm text-muted">These choices are saved in this browser only. They do not send notifications.</p>
      <label className="flex min-h-14 items-center justify-between gap-4 border-y border-beige py-3"><span className="text-sm">Email notifications</span><input type="checkbox" checked={!!settings.emailNotifications} onChange={(event) => update('emailNotifications', event.target.checked)} className="h-4 w-4 accent-[#C6A16A]" /></label>
      <label className="flex min-h-14 items-center justify-between gap-4 border-b border-beige py-3"><span className="text-sm">SMS notifications</span><input type="checkbox" checked={!!settings.smsNotifications} onChange={(event) => update('smsNotifications', event.target.checked)} className="h-4 w-4 accent-[#C6A16A]" /></label>
    </section>
    <section className="mt-10">
      <h2 className="mb-3 font-serif text-xl text-char">Account information</h2>
      <div className="border-y border-beige"><Detail label="Customer name" value={customer.name} icon={<ImagePlus size={16} />} /><Detail label="Demo sign-in email" value={session.email} icon={<Mail size={16} />} /></div>
      <p className="mt-3 text-xs leading-5 text-muted">This is a frontend demonstration session, not secure authentication. Account access and password changes require backend authentication.</p>
    </section>
    <section className="mt-10 border-t border-beige pt-6">
      <h2 className="font-serif text-xl text-char">Sign out</h2><p className="mt-2 text-sm text-muted">End this demo session on this browser.</p>
      <button type="button" onClick={signOut} className="mt-4 min-h-11 border border-char px-5 text-xs uppercase tracking-wider text-char transition hover:bg-char hover:text-ivory">Sign out</button>
    </section>
  </div>
}
