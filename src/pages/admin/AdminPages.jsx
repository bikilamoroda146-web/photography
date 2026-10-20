import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowDownUp, ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, Check,
  Eye, FileUp, Image, Mail, Plus, Search, SlidersHorizontal, Trash2, Users,
} from 'lucide-react'
import { Ph } from '../../components/ui'
import { bookingEvents, getAllBookings, updateBookingDetails, updateBookingStatus } from '../../services/bookingService'
import { getStoredCustomers } from '../../services/customerService'
import { DEMO_DATA_CHANGED } from '../../services/demoStorage'
import { getServices, saveService, deleteService } from '../../services/serviceService'
import { getPortfolioProjects, savePortfolioProject, deletePortfolioProject, PORTFOLIO_CATEGORIES } from '../../services/portfolioService'
import { getInquiries, updateInquiryStatus, INQUIRY_STATUSES } from '../../services/inquiryService'
import { getAdminSettings, saveAdminSettings } from '../../services/adminSettingsService'
import { isUploadedImage, prepareImageUpload } from '../../utils/imageUpload'
import { usePhotoLibrary } from '../../hooks/usePhotoLibrary'

const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected']
const SERVICES_IMAGE_KEYS = ['portrait', 'wedding', 'event', 'landscape', 'product', 'studio', 'graphic', 'graphicDesigner', 'worship']
const fieldClass = 'min-h-11 w-full border border-beige bg-ivory px-3 py-2.5 text-sm text-char placeholder:text-muted/80'
const buttonClass = 'inline-flex min-h-10 items-center justify-center gap-2 border border-beige px-3 py-2 text-xs uppercase tracking-wider text-char transition hover:border-gold hover:bg-cream focus-visible:outline-gold'
const primaryButtonClass = 'inline-flex min-h-10 items-center justify-center gap-2 bg-char px-4 py-2 text-xs uppercase tracking-wider text-ivory transition hover:bg-dark'

const dateLabel = (value, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
  if (!value) return 'Not provided'
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value)
  return Number.isNaN(date.getTime()) ? 'Not available' : new Intl.DateTimeFormat('en', options).format(date)
}

function Heading({ eyebrow = 'Studio admin', title, children, action }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 border-b border-beige pb-5 sm:flex-row sm:items-end">
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[.24em] text-gold">{eyebrow}</p>
      <h1 className="font-serif text-3xl leading-tight text-char sm:text-4xl">{title}</h1>
      {children && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{children}</p>}
    </div>
    {action}
  </div>
}

function Feedback({ children, error = false }) {
  return <p role={error ? 'alert' : 'status'} className={`mb-5 border px-4 py-3 text-sm ${error ? 'border-red-800/30 bg-red-50 text-red-900' : 'border-gold/50 bg-cream text-char'}`}>{children}</p>
}

function EmptyState({ title, description, action }) {
  return <div className="border border-dashed border-beige bg-white/40 px-5 py-10 text-center">
    <p className="font-serif text-xl text-char">{title}</p>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
    {action}
  </div>
}

function Badge({ status }) {
  const styles = {
    Pending: 'border-gold/50 bg-gold/10 text-[#76592d]',
    New: 'border-gold/50 bg-gold/10 text-[#76592d]',
    Active: 'border-emerald-800/30 bg-emerald-800/5 text-emerald-900',
    Published: 'border-emerald-800/30 bg-emerald-800/5 text-emerald-900',
    Inactive: 'border-muted/30 bg-dark/5 text-muted',
    Unpublished: 'border-muted/30 bg-dark/5 text-muted',
    Confirmed: 'border-emerald-800/30 bg-emerald-800/5 text-emerald-900',
    'In Progress': 'border-blue-900/20 bg-blue-900/5 text-blue-900',
    Completed: 'border-char/20 bg-char/5 text-char',
    Resolved: 'border-char/20 bg-char/5 text-char',
    Cancelled: 'border-muted/30 bg-dark/5 text-muted',
    Rejected: 'border-red-800/25 bg-red-800/5 text-red-900',
  }
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[.1em] ${styles[status] || styles.Pending}`}>
    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{status}
  </span>
}

function useAdminBookings() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    function refresh() {
      try {
        setBookings(getAllBookings())
        setError('')
      } catch (loadError) {
        setError(loadError.message || 'Bookings could not be loaded.')
      } finally {
        setLoading(false)
      }
    }
    refresh()
    window.addEventListener(bookingEvents.changed, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(bookingEvents.changed, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return { bookings, error, loading }
}

function useAdminCollection(loader) {
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    function refresh() {
      try {
        setRecords(loader())
        setError('')
      } catch (loadError) {
        setError(loadError.message || 'Records could not be loaded.')
      } finally {
        setLoading(false)
      }
    }
    refresh()
    window.addEventListener(DEMO_DATA_CHANGED, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(DEMO_DATA_CHANGED, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [loader])
  return { records, error, loading }
}

const loadServices = () => getServices()
const loadPortfolio = () => getPortfolioProjects()
const loadInquiries = () => getInquiries()

function customerForBooking(booking, storedCustomers = []) {
  const customer = storedCustomers.find((item) => (item.accountEmail || item.email).toLowerCase() === (booking.customerEmail || '').toLowerCase())
  const email = booking.contactEmail || customer?.email || booking.customerEmail || ''
  return {
    name: booking.customerName || customer?.name || email || 'Customer',
    email,
    phone: booking.contactPhone || customer?.phone || '',
    accountEmail: booking.customerEmail || customer?.accountEmail || customer?.email || email,
  }
}

function loadCustomerRows(bookings) {
  const stored = getStoredCustomers()
  const customers = new Map()
  for (const customer of stored) customers.set((customer.accountEmail || customer.email).toLowerCase(), customer)
  for (const booking of bookings) {
    const accountEmail = (booking.customerEmail || booking.contactEmail || '').toLowerCase()
    if (!accountEmail) continue
    const saved = customers.get(accountEmail)
    const details = customerForBooking(booking, stored)
    customers.set(accountEmail, {
      name: saved?.name || details.name,
      email: booking.contactEmail || saved?.email || accountEmail,
      accountEmail,
      phone: saved?.phone || details.phone,
    })
  }
  return [...customers.values()].map((customer) => {
    const accountEmail = customer.accountEmail || customer.email
    const matches = bookings.filter((booking) => (booking.customerEmail || booking.contactEmail || '').toLowerCase() === accountEmail.toLowerCase())
    const mostRecent = matches.map((booking) => booking.submittedAt).filter(Boolean).sort().at(-1) || ''
    return { ...customer, accountEmail, count: matches.length, mostRecent, bookings: matches }
  }).sort((a, b) => a.name.localeCompare(b.name))
}

function DataTable({ children, className = '' }) {
  return <div className={`overflow-x-auto border border-beige bg-ivory ${className}`}><table className="w-full text-left text-sm">{children}</table></div>
}

function TableHead({ children }) {
  return <thead className="border-b border-beige bg-cream text-[10px] uppercase tracking-[.14em] text-muted"><tr>{children}</tr></thead>
}

function TableCell({ children, className = '' }) {
  return <td className={`px-4 py-3.5 align-middle ${className}`}>{children}</td>
}

export function AdminOverview() {
  const { bookings, error: bookingError, loading } = useAdminBookings()
  const { records: inquiries, error: inquiryError } = useAdminCollection(loadInquiries)
  const { records: services, error: serviceError, loading: servicesLoading } = useAdminCollection(loadServices)
  const { photos, error: photoError, loading: photosLoading } = usePhotoLibrary()
  const total = bookings.length
  const pending = bookings.filter((booking) => booking.status === 'Pending').length
  const confirmed = bookings.filter((booking) => booking.status === 'Confirmed').length
  const completed = bookings.filter((booking) => booking.status === 'Completed').length
  let customerCount = 0
  let customerError = ''
  try {
    customerCount = loadCustomerRows(bookings).length
  } catch (loadError) {
    customerError = loadError.message || 'Customer records could not be loaded.'
  }
  const recent = bookings.slice().sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 5)
  const upcoming = bookings.filter((booking) => booking.status === 'Confirmed' && booking.preferredDate && booking.preferredDate >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.preferredDate.localeCompare(b.preferredDate)).slice(0, 5)
  const recentInquiries = inquiries.slice(0, 4)
  const chartMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() - (5 - index))
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    return {
      key,
      label: new Intl.DateTimeFormat('en', { month: 'short' }).format(date),
      count: bookings.filter((booking) => typeof booking.submittedAt === 'string'
        && booking.submittedAt.slice(0, 7) === key).length,
    }
  })
  const chartMaximum = Math.max(1, ...chartMonths.map((month) => month.count))
  const dashboardErrors = [bookingError, inquiryError, serviceError, photoError, customerError]
    .filter(Boolean)

  return <div>
    <Heading title="Studio dashboard">An at-a-glance view of customer bookings, portfolio activity, and studio offerings.</Heading>
    {dashboardErrors.length > 0 && <Feedback error>{dashboardErrors.join(' ')}</Feedback>}
    <section aria-label="Studio metrics" className="mb-8 grid grid-cols-2 border-l border-t border-beige sm:grid-cols-3 xl:grid-cols-6">
      {[
        ['Booking requests', total, loading],
        ['Pending requests', pending, loading],
        ['Confirmed sessions', confirmed, loading],
        ['Customers', customerCount, loading],
        ['Photo library', photos.length, photosLoading],
        ['Products & services', services.length, servicesLoading],
      ].map(([label, count, isLoading]) =>
        <div key={label} className="min-h-24 border-b border-r border-beige bg-white/30 px-4 py-4 sm:px-5">
          <p className="text-[10px] uppercase tracking-[.13em] text-muted">{label}</p>
          <p className="mt-2 font-serif text-3xl text-char">{isLoading ? '—' : count}</p>
        </div>)}
    </section>
    <section aria-labelledby="booking-trends-title" className="mb-8 border border-beige bg-white/50 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-[10px] uppercase tracking-[.18em] text-gold">Studio activity</p><h2 id="booking-trends-title" className="mt-1 font-serif text-xl text-char">Booking requests over six months</h2></div>
        <Link to="/admin/bookings" className="inline-flex min-h-10 items-center gap-1 text-[10px] uppercase tracking-wider hover:text-gold">Manage bookings<ArrowRight size={14} /></Link>
      </div>
      {loading ? <p role="status" className="py-8 text-sm text-muted">Loading booking activity…</p> : <div role="img" aria-label={`Booking requests by month: ${chartMonths.map((month) => `${month.label} ${month.count}`).join(', ')}`} className="mt-6">
        <div className="grid h-40 grid-cols-6 items-end gap-3 border-b border-l border-beige px-2 sm:h-52 sm:gap-6 sm:px-5">
          {chartMonths.map((month) => <div key={month.key} className="flex h-full flex-col justify-end">
            <span className="mb-2 text-center text-xs text-muted">{month.count}</span>
            <div className="mx-auto w-full max-w-12 bg-[#C6A16A]" style={{ height: `${Math.max(3, (month.count / chartMaximum) * 76)}%` }} />
          </div>)}
        </div>
        <div aria-hidden="true" className="grid grid-cols-6 gap-3 px-2 pt-2 text-center text-[10px] uppercase tracking-wider text-muted sm:gap-6 sm:px-5">
          {chartMonths.map((month) => <span key={month.key}>{month.label}</span>)}
        </div>
      </div>}
    </section>
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,.8fr)]">
      <section>
        <div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-serif text-xl text-char">Recent Booking Requests</h2><Link to="/admin/bookings" className="inline-flex min-h-10 items-center gap-1 text-[10px] uppercase tracking-wider hover:text-gold">All bookings<ArrowRight size={14} /></Link></div>
        {loading ? <p role="status" className="py-8 text-sm text-muted">Loading booking requests…</p> : recent.length ? <DataTable>
          <TableHead><th className="px-4 py-3 font-medium">Reference / Customer</th><th className="px-4 py-3 font-medium">Service</th><th className="px-4 py-3 font-medium">Requested</th><th className="px-4 py-3 font-medium">Submitted</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3" /></TableHead>
          <tbody className="divide-y divide-beige">
            {recent.map((booking) => {
              const customer = customerForBooking(booking)
              return <tr key={booking.id} className="hover:bg-cream/40">
                <TableCell><span className="block text-[10px] text-muted">{booking.reference}</span><span className="mt-1 block font-medium">{customer.name}</span></TableCell>
                <TableCell>{booking.service}</TableCell><TableCell className="whitespace-nowrap">{dateLabel(booking.preferredDate)}</TableCell>
                <TableCell className="whitespace-nowrap">{dateLabel(booking.submittedAt)}</TableCell><TableCell><Badge status={booking.status} /></TableCell>
                <TableCell><Link className="inline-flex min-h-10 items-center text-xs hover:text-gold" to={`/admin/bookings/${booking.id}`}>Details</Link></TableCell>
              </tr>
            })}
          </tbody>
        </DataTable> : <EmptyState title="No booking requests yet" description="New customer booking requests will appear here when submitted through the shared demo store." />}
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="font-serif text-xl text-char">Upcoming Confirmed Sessions</h2><Link to="/admin/bookings?status=Confirmed" className="text-[10px] uppercase tracking-wider hover:text-gold">View all</Link></div>
        {upcoming.length ? <ul className="divide-y divide-beige border-y border-beige">
          {upcoming.map((booking) => <li key={booking.id} className="flex items-start justify-between gap-3 py-4">
            <div><p className="text-sm font-medium">{booking.service}</p><p className="mt-1 text-xs text-muted">{customerForBooking(booking).name} · {booking.reference}</p></div>
            <time className="shrink-0 text-xs text-muted">{dateLabel(booking.preferredDate, { month: 'short', day: 'numeric' })}</time>
          </li>)}
        </ul> : <p className="border-y border-beige py-6 text-sm text-muted">There are no upcoming confirmed sessions.</p>}
        <div className="mt-8 flex items-center justify-between gap-3"><h2 className="font-serif text-xl text-char">Recent Inquiries</h2><Link to="/admin/inquiries" className="text-[10px] uppercase tracking-wider hover:text-gold">View all</Link></div>
        {recentInquiries.length ? <ul className="mt-2 divide-y divide-beige border-y border-beige">
          {recentInquiries.map((inquiry) => <li key={inquiry.id} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0"><p className="truncate text-sm font-medium">{inquiry.name}</p><p className="mt-1 truncate text-xs text-muted">{inquiry.service} · {inquiry.reference}</p></div><Badge status={inquiry.status} />
          </li>)}
        </ul> : <p className="mt-2 border-y border-beige py-5 text-sm text-muted">No customer inquiries have been recorded.</p>}
      </section>
    </div>
    <section className="mt-9">
      <h2 className="mb-3 font-serif text-xl text-char">Quick Actions</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['/admin/bookings?status=Pending', 'View Pending Bookings', CalendarDays],
          ['/admin/products', 'Manage Products & Services', BriefcaseBusiness],
          ['/admin/photos', 'Manage Photo Gallery', Image],
          ['/admin/customers', 'View Customers', Users],
          ['/admin/portfolio', 'Manage Portfolio', Image],
          ['/admin/inquiries', 'View Customer Inquiries', Mail],
        ].map(([to, title, Icon]) => <Link key={to} to={to} className="flex min-h-14 items-center gap-3 border border-beige bg-white/30 px-4 text-sm transition hover:border-gold hover:bg-cream">
          <Icon aria-hidden="true" size={17} className="text-gold" />{title}<ArrowRight aria-hidden="true" size={14} className="ml-auto text-muted" />
        </Link>)}
      </div>
    </section>
  </div>
}

function BookingCard({ booking }) {
  const customer = customerForBooking(booking)
  return <li className="space-y-3 border-b border-beige py-4">
    <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] text-muted">{booking.reference}</p><h2 className="mt-1 font-medium">{customer.name}</h2></div><Badge status={booking.status} /></div>
    <p className="text-sm text-char">{booking.service}</p>
    <div className="grid grid-cols-2 gap-3 text-xs text-muted"><p><span className="block uppercase tracking-wider">Session</span><span className="mt-1 block text-char">{dateLabel(booking.preferredDate)} {booking.preferredTime}</span></p><p><span className="block uppercase tracking-wider">Submitted</span><span className="mt-1 block text-char">{dateLabel(booking.submittedAt)}</span></p></div>
    <Link to={`/admin/bookings/${booking.id}`} className="inline-flex min-h-10 items-center gap-2 text-xs uppercase tracking-wider hover:text-gold">View details<ArrowRight size={14} /></Link>
  </li>
}

export function AdminBookings() {
  const { bookings, error, loading } = useAdminBookings()
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(params.get('status') || 'All statuses')
  const [service, setService] = useState('All services')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sort, setSort] = useState('earliest')
  const services = [...new Set(bookings.map((booking) => booking.service).filter(Boolean))].sort()
  const filtered = useMemo(() => bookings.filter((booking) => {
    const customer = customerForBooking(booking)
    const q = query.trim().toLowerCase()
    return (!q || `${customer.name} ${booking.reference} ${customer.email}`.toLowerCase().includes(q))
      && (status === 'All statuses' || booking.status === status)
      && (service === 'All services' || booking.service === service)
      && (!fromDate || booking.preferredDate >= fromDate)
      && (!toDate || booking.preferredDate <= toDate)
  }).sort((a, b) => sort === 'latest' ? b.preferredDate.localeCompare(a.preferredDate) : a.preferredDate.localeCompare(b.preferredDate)), [bookings, query, status, service, fromDate, toDate, sort])
  const clearFilters = () => { setQuery(''); setStatus('All statuses'); setService('All services'); setFromDate(''); setToDate(''); setSort('earliest') }

  return <div>
    <Heading title="Bookings">Search, review and manage customer requests. Changes are shared with the customer demo view in this browser.</Heading>
    {error && <Feedback error>{error}</Feedback>}
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(190px,1.5fr)_repeat(5,minmax(120px,1fr))_auto]">
      <label className="relative block"><span className="sr-only">Search name, email or booking reference</span><Search aria-hidden="true" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} className={`${fieldClass} pl-9`} placeholder="Name, email or reference" /></label>
      <label><span className="sr-only">Filter by booking status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className={fieldClass}><option>All statuses</option>{STATUSES.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span className="sr-only">Filter by service</span><select value={service} onChange={(event) => setService(event.target.value)} className={fieldClass}><option>All services</option>{services.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span className="sr-only">Session date from</span><input aria-label="Session date from" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className={fieldClass} /></label>
      <label><span className="sr-only">Session date to</span><input aria-label="Session date to" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className={fieldClass} /></label>
      <label className="relative block"><span className="sr-only">Sort by session date</span><ArrowDownUp aria-hidden="true" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><select value={sort} onChange={(event) => setSort(event.target.value)} className={`${fieldClass} pl-9`}><option value="earliest">Session: earliest</option><option value="latest">Session: latest</option></select></label>
      <button type="button" onClick={clearFilters} className={buttonClass}><SlidersHorizontal size={14} />Clear</button>
    </div>
    {loading ? <p role="status" className="py-10 text-center text-sm text-muted">Loading bookings…</p>
      : filtered.length ? <>
        <p className="mb-3 text-xs text-muted">{filtered.length} matching {filtered.length === 1 ? 'booking' : 'bookings'}</p>
        <DataTable className="hidden md:block">
          <TableHead><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Session date</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></TableHead>
          <tbody className="divide-y divide-beige">{filtered.map((booking) => {
            const customer = customerForBooking(booking)
            return <tr key={booking.id} className="hover:bg-cream/40"><TableCell className="whitespace-nowrap text-xs">{booking.reference}</TableCell><TableCell><span className="block font-medium">{customer.name}</span><span className="mt-1 block text-xs text-muted">{customer.email}</span></TableCell><TableCell>{booking.service}</TableCell><TableCell className="whitespace-nowrap">{dateLabel(booking.preferredDate)}</TableCell><TableCell className="whitespace-nowrap">{dateLabel(booking.submittedAt)}</TableCell><TableCell><Badge status={booking.status} /></TableCell><TableCell><Link to={`/admin/bookings/${booking.id}`} className="inline-flex min-h-10 items-center gap-1 text-xs hover:text-gold">Details<ArrowRight size={13} /></Link></TableCell></tr>
          })}</tbody>
        </DataTable>
        <ul className="divide-y divide-beige border-y border-beige md:hidden">{filtered.map((booking) => <BookingCard key={booking.id} booking={booking} />)}</ul>
      </> : bookings.length ? <EmptyState title="No matching bookings" description="Adjust your search or filters to find another booking." action={<button type="button" onClick={clearFilters} className="mt-4 text-xs uppercase tracking-wider underline underline-offset-4">Clear filters</button>} />
        : <EmptyState title="No booking requests yet" description="Customer booking requests will appear here once created in the shared demo store." />}
  </div>
}

export function AdminBookingDetails() {
  const { bookingId } = useParams()
  const { bookings, error, loading } = useAdminBookings()
  const [feedback, setFeedback] = useState('')
  const [actionError, setActionError] = useState('')
  const [details, setDetails] = useState({ preferredDate: '', preferredTime: '', location: '', notes: '' })
  const booking = bookings.find((item) => item.id === bookingId)
  const customer = booking ? customerForBooking(booking) : null
  useEffect(() => {
    if (!booking) return
    setDetails({
      preferredDate: booking.preferredDate || '',
      preferredTime: booking.preferredTime || '',
      location: booking.location || '',
      notes: booking.notes || '',
    })
  }, [booking?.id])
  const statusHistory = Array.isArray(booking?.statusHistory) && booking.statusHistory.length
    ? booking.statusHistory
    : booking?.status === 'Pending' ? [{ status: 'Pending', changedAt: booking.submittedAt }] : []
  const actions = booking?.status === 'Pending'
    ? [['Confirmed', 'Confirm request'], ['Rejected', 'Reject request'], ['Cancelled', 'Cancel request']]
    : booking?.status === 'Confirmed' ? [['Completed', 'Mark completed'], ['Cancelled', 'Cancel booking']] : []

  function update(status, label) {
    if (!window.confirm(`${label}? This simulated action will update the booking status.`)) return
    try {
      updateBookingStatus(booking.id, status)
      setFeedback(`${booking.reference} updated to ${status}. This change is saved in the browser demo store.`)
      setActionError('')
    } catch (error) {
      setActionError(error.message || 'The booking status could not be updated.')
      setFeedback('')
    }
  }

  function saveDetails(event) {
    event.preventDefault()
    try {
      updateBookingDetails(booking.id, details)
      setFeedback(`${booking.reference} details saved and visible to the customer.`)
      setActionError('')
    } catch (saveError) {
      setActionError(saveError.message || 'The booking details could not be saved.')
      setFeedback('')
    }
  }

  if (loading) return <p role="status" className="py-10 text-sm text-muted">Loading booking details…</p>
  if (error) return <Feedback error>{error}</Feedback>
  if (!booking) return <div><Heading title="Booking not found">This request is unavailable or may have been removed from the demo store.</Heading><Link to="/admin/bookings" className={buttonClass}><ArrowLeft size={14} />Back to bookings</Link></div>

  return <div className="max-w-4xl">
    <Link to="/admin/bookings" className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs uppercase tracking-wider text-muted hover:text-char"><ArrowLeft size={14} />Back to bookings</Link>
    <Heading eyebrow={`Booking reference · ${booking.reference}`} title={booking.service} action={<Badge status={booking.status} />}>
      Booking submitted {dateLabel(booking.submittedAt)}.
    </Heading>
    {feedback && <Feedback>{feedback}</Feedback>}{actionError && <Feedback error>{actionError}</Feedback>}
    <section className="grid gap-x-8 sm:grid-cols-2">
      {[
        ['Customer', customer.name], ['Email', customer.email], ['Phone', customer.phone || 'Not provided'],
        ['Requested session date', dateLabel(booking.preferredDate)], ['Preferred time', booking.preferredTime || 'No preference provided'],
        ['Location or venue', booking.location || 'Not provided'], ['Service type', booking.service],
        ['Submission date', dateLabel(booking.submittedAt)],
      ].map(([label, value]) => <div key={label} className="border-b border-beige py-4"><h2 className="text-[10px] uppercase tracking-[.15em] text-muted">{label}</h2><p className="mt-2 break-words text-sm text-char">{value}</p></div>)}
      <div className="border-b border-beige py-5 sm:col-span-2"><h2 className="text-[10px] uppercase tracking-[.15em] text-muted">Customer message</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-char">{booking.message || 'No message provided.'}</p></div>
      <div className="border-b border-beige py-5 sm:col-span-2"><h2 className="text-[10px] uppercase tracking-[.15em] text-muted">Status history</h2>
        {statusHistory.length ? <ol className="mt-3 space-y-2 text-sm">{statusHistory.map((entry, index) =>
          <li key={`${entry.status}-${entry.changedAt}-${index}`} className="flex flex-wrap items-center gap-2"><Badge status={entry.status} /><span className="text-xs text-muted">{dateLabel(entry.changedAt, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span></li>)}</ol>
          : <p className="mt-2 text-sm text-muted">No status changes have been recorded for this demo booking.</p>}
      </div>
      <div className="border-b border-beige py-5 sm:col-span-2"><h2 className="text-[10px] uppercase tracking-[.15em] text-muted">Booking detail updates</h2>
        {Array.isArray(booking.detailsHistory) && booking.detailsHistory.length
          ? <ol className="mt-3 space-y-2">{booking.detailsHistory.slice().reverse().map((entry, index) =>
            <li key={`${entry.changedAt}-${index}`} className="text-sm"><p className="text-char">Updated: {Array.isArray(entry.fields) ? entry.fields.join(', ') : 'Booking details'}</p><p className="mt-1 text-xs text-muted">{dateLabel(entry.changedAt, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p></li>)}</ol>
          : <p className="mt-2 text-sm text-muted">No booking detail changes have been recorded.</p>}
      </div>
    </section>
    <section className="mt-8 border border-beige bg-ivory p-4 sm:p-6">
      <h2 className="font-serif text-2xl">Update booking details</h2>
      <p className="mt-2 text-sm text-muted">Saved changes and studio notes will appear in the customer’s booking details and dashboard activity.</p>
      <form onSubmit={saveDetails} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-xs uppercase tracking-wider">Requested session date<input type="date" value={details.preferredDate} onChange={(event) => setDetails({ ...details, preferredDate: event.target.value })} className={`${fieldClass} mt-1`} /></label>
        <label className="block text-xs uppercase tracking-wider">Preferred time<input type="time" value={details.preferredTime} onChange={(event) => setDetails({ ...details, preferredTime: event.target.value })} className={`${fieldClass} mt-1`} /></label>
        <label className="block text-xs uppercase tracking-wider sm:col-span-2">Location or venue<input maxLength={500} value={details.location} onChange={(event) => setDetails({ ...details, location: event.target.value })} className={`${fieldClass} mt-1`} /></label>
        <label className="block text-xs uppercase tracking-wider sm:col-span-2">Studio notes for customer<textarea maxLength={2000} rows="4" value={details.notes} onChange={(event) => setDetails({ ...details, notes: event.target.value })} className={`${fieldClass} mt-1`} /></label>
        <div className="sm:col-span-2"><button type="submit" className={primaryButtonClass}>Save booking updates</button></div>
      </form>
    </section>
    {actions.length ? <section className="mt-6">
      <h2 className="mb-3 font-serif text-xl">Booking actions</h2>
      <div className="flex flex-wrap gap-3">{actions.map(([status, label]) => <button type="button" key={status} onClick={() => update(status, label)} className={status === 'Rejected' || status === 'Cancelled' ? buttonClass : primaryButtonClass}>{status === 'Confirmed' || status === 'Completed' ? <Check size={14} /> : null}{label}</button>)}</div>
      <p className="mt-3 text-xs leading-5 text-muted">Only valid status transitions are enabled. No booking record is deleted.</p>
    </section> : <p className="mt-6 text-sm text-muted">This booking is in a final status and cannot be changed.</p>}
  </div>
}

export function AdminCustomers() {
  const { bookings, error: bookingError, loading } = useAdminBookings()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name')
  const [selected, setSelected] = useState('')
  let customers = []
  let customerError = ''
  try {
    customers = loadCustomerRows(bookings)
  } catch (error) {
    customerError = error.message || 'Customer records could not be loaded.'
  }
  const filtered = customers.filter((customer) => `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === 'recent' ? b.mostRecent.localeCompare(a.mostRecent) : sort === 'bookings' ? b.count - a.count : a.name.localeCompare(b.name))
  const current = customers.find((customer) => customer.accountEmail === selected)

  return <div>
    <Heading title="Customers">Customer records are derived from the shared demo profiles and booking history.</Heading>
    {(bookingError || customerError) && <Feedback error>{bookingError || customerError}</Feedback>}
    <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(220px,1fr)_200px]">
      <label className="relative block"><span className="sr-only">Search customers</span><Search aria-hidden="true" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input className={`${fieldClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email or phone" /></label>
      <label><span className="sr-only">Sort customer list</span><select className={fieldClass} value={sort} onChange={(event) => setSort(event.target.value)}><option value="name">Sort: customer name</option><option value="recent">Sort: recent booking</option><option value="bookings">Sort: booking count</option></select></label>
    </div>
    {current && <section className="mb-6 border border-gold/50 bg-cream/60 p-4 sm:p-5" aria-label={`Details for ${current.name}`}>
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-wider text-gold">Customer details</p><h2 className="mt-1 font-serif text-2xl">{current.name}</h2></div><button type="button" onClick={() => setSelected('')} className={buttonClass}>Close details</button></div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><p><span className="block text-[10px] uppercase text-muted">Email</span>{current.email || 'Not provided'}</p><p><span className="block text-[10px] uppercase text-muted">Phone</span>{current.phone || 'Not provided'}</p><p><span className="block text-[10px] uppercase text-muted">Booking count</span>{current.count}</p></div>
      <h3 className="mt-5 font-serif text-lg">Booking history</h3>
      {current.bookings.length ? <ul className="mt-2 divide-y divide-beige border-y border-beige">{current.bookings.slice().sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).map((booking) =>
        <li key={booking.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm">{booking.reference} · {booking.service}</p><p className="mt-1 text-xs text-muted">{dateLabel(booking.preferredDate)} · submitted {dateLabel(booking.submittedAt)}</p></div><Link to={`/admin/bookings/${booking.id}`} className="text-xs uppercase tracking-wider hover:text-gold">View booking</Link></li>)}</ul>
        : <p className="mt-2 text-sm text-muted">No booking history is available.</p>}
    </section>}
    {loading ? <p role="status" className="py-8 text-sm text-muted">Loading customers…</p> : filtered.length ? <>
      <p className="mb-3 text-xs text-muted">{filtered.length} customers</p>
      <DataTable className="hidden sm:block">
        <TableHead><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Bookings</th><th className="px-4 py-3">Most recent booking</th><th className="px-4 py-3" /></TableHead>
        <tbody className="divide-y divide-beige">{filtered.map((customer) => <tr key={customer.accountEmail} className="hover:bg-cream/40"><TableCell className="font-medium">{customer.name}</TableCell><TableCell>{customer.email || 'Not provided'}</TableCell><TableCell>{customer.phone || 'Not provided'}</TableCell><TableCell>{customer.count}</TableCell><TableCell>{dateLabel(customer.mostRecent)}</TableCell><TableCell><button type="button" onClick={() => setSelected(customer.accountEmail)} className="inline-flex min-h-10 items-center gap-1 text-xs hover:text-gold"><Eye size={14} />Details</button></TableCell></tr>)}</tbody>
      </DataTable>
      <ul className="divide-y divide-beige border-y border-beige sm:hidden">{filtered.map((customer) => <li key={customer.accountEmail} className="py-4">
        <div className="flex items-start justify-between gap-3"><div><p className="font-medium">{customer.name}</p><p className="mt-1 break-all text-xs text-muted">{customer.email || 'Not provided'}</p></div><span className="text-xs text-muted">{customer.count} bookings</span></div>
        <p className="mt-2 text-xs text-muted">{customer.phone || 'Phone not provided'} · latest {dateLabel(customer.mostRecent)}</p>
        <button type="button" onClick={() => setSelected(customer.accountEmail)} className="mt-2 inline-flex min-h-10 items-center gap-2 text-xs uppercase tracking-wider hover:text-gold"><Eye size={14} />Customer details</button>
      </li>)}</ul>
    </> : <EmptyState title={query ? 'No matching customers' : 'No customer records yet'} description={query ? 'Try a different search term.' : 'Customers will appear here when they submit a booking or create a demo customer profile.'} />}
  </div>
}

function Dialog({ title, onClose, children, wide = false }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    dialog.showModal()
    return () => { if (dialog.open) dialog.close() }
  }, [])
  return <dialog ref={dialogRef} aria-labelledby="admin-dialog-title" onCancel={(event) => { event.preventDefault(); onClose() }}
    className={`m-auto max-h-[92dvh] w-[min(94vw,640px)] overflow-y-auto border border-beige bg-ivory p-0 text-char shadow-xl backdrop:bg-rich/60 ${wide ? 'max-w-3xl' : ''}`}>
    <div className="flex items-start justify-between gap-4 border-b border-beige px-5 py-4 sm:px-7">
      <h2 id="admin-dialog-title" className="font-serif text-2xl">{title}</h2>
      <button type="button" onClick={onClose} className={buttonClass}>Close</button>
    </div>
    <div className="px-5 py-5 sm:px-7">{children}</div>
  </dialog>
}

function ImageUploadField({ id, value, onChange, onLoadingChange }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function chooseImage(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setLoading(true)
    onLoadingChange(true)
    setError('')
    try {
      onChange(await prepareImageUpload(file, 1200))
    } catch (uploadError) {
      setError(uploadError.message || 'The selected image could not be prepared.')
    } finally {
      setLoading(false)
      onLoadingChange(false)
    }
  }

  return <div>
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor={id} className="inline-flex min-h-10 cursor-pointer items-center gap-2 border border-beige px-3 py-2 text-xs uppercase tracking-wider transition hover:border-gold">
        <FileUp aria-hidden="true" size={14} />{loading ? 'Preparing photo…' : 'Upload photo'}
      </label>
      <input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} disabled={loading} className="sr-only" />
      {value && <button type="button" onClick={() => { onChange(''); setError('') }} className="inline-flex min-h-10 items-center gap-2 border border-beige px-3 py-2 text-xs uppercase tracking-wider transition hover:border-char"><Trash2 aria-hidden="true" size={13} />Remove photo</button>}
    </div>
    <p className="mt-2 text-xs text-muted">JPEG, PNG, or WebP · up to 10 MB. Resized and saved in this browser.</p>
    {error && <p role="alert" className="mt-2 text-xs text-red-800">{error}</p>}
  </div>
}

const emptyService = { name: '', description: '', imageRef: 'studio', active: true }
export function AdminServices() {
  const { records: services, error, loading } = useAdminCollection(loadServices)
  const [editing, setEditing] = useState(null)
  const [preview, setPreview] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [actionError, setActionError] = useState('')
  const [imageLoading, setImageLoading] = useState(false)

  function save(event) {
    event.preventDefault()
    try {
      saveService(editing)
      setEditing(null)
      setFeedback('Service saved in the browser demo store.')
      setActionError('')
    } catch (saveError) {
      setActionError(saveError.message || 'The service could not be saved.')
    }
  }
  function remove(service) {
    if (!window.confirm(`Delete “${service.name}” from the available services? Historical bookings will remain unchanged.`)) return
    try {
      deleteService(service.id)
      setFeedback('Service removed from the active catalogue. Historical bookings were not changed.')
      setActionError('')
    } catch (deleteError) {
      setActionError(deleteError.message || 'The service could not be deleted.')
    }
  }

  return <div>
    <Heading title="Services" action={<button type="button" onClick={() => setEditing({ ...emptyService })} className={primaryButtonClass}><Plus size={15} />Add service</button>}>
      Manage the public service catalogue. Deactivating or removing a service does not alter historical booking records.
    </Heading>
    {error && <Feedback error>{error}</Feedback>}{feedback && <Feedback>{feedback}</Feedback>}{actionError && <Feedback error>{actionError}</Feedback>}
    {loading ? <p role="status" className="py-8 text-sm text-muted">Loading services…</p> : services.length ? <DataTable>
      <TableHead><th className="px-4 py-3">Service</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></TableHead>
      <tbody className="divide-y divide-beige">{services.map((service) => <tr key={service.id} className="hover:bg-cream/40">
        <TableCell className="min-w-44 font-medium">{service.name}</TableCell><TableCell className="min-w-52 max-w-lg text-muted">{service.description}</TableCell><TableCell><Badge status={service.active ? 'Active' : 'Inactive'} /></TableCell>
        <TableCell><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setPreview(service)} className={buttonClass}><Eye size={13} />View</button><button type="button" onClick={() => setEditing({ ...service })} className={buttonClass}>Edit</button>
          <button type="button" onClick={() => { try { saveService({ ...service, active: !service.active }); setFeedback(`Service ${service.active ? 'deactivated' : 'activated'} in this browser.`); setActionError('') } catch (saveError) { setActionError(saveError.message || 'Could not update service.') } }} className={buttonClass}>{service.active ? 'Deactivate' : 'Activate'}</button>
          <button type="button" onClick={() => remove(service)} className={buttonClass}>Delete</button></div></TableCell>
      </tr>)}</tbody>
    </DataTable> : <EmptyState title="No services configured" description="Add a service to make it available in the public and customer-facing service selectors." action={<button type="button" onClick={() => setEditing({ ...emptyService })} className={`${primaryButtonClass} mt-4`}>Add service</button>} />}
    {editing && <Dialog title={editing.id ? 'Edit service' : 'Add service'} onClose={() => setEditing(null)}>
      <form onSubmit={save} className="space-y-4">
        {actionError && <Feedback error>{actionError}</Feedback>}
        <label className="block text-xs uppercase tracking-wider">Service name<input autoFocus required maxLength={100} value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className={`${fieldClass} mt-1 normal-case tracking-normal`} /></label>
        <label className="block text-xs uppercase tracking-wider">Description<textarea required rows="4" maxLength={500} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} className={`${fieldClass} mt-1 normal-case tracking-normal`} /></label>
        <label className="block text-xs uppercase tracking-wider">Image reference or image URL<input value={isUploadedImage(editing.imageRef) ? '' : editing.imageRef} onChange={(event) => setEditing({ ...editing, imageRef: event.target.value })} placeholder="studio or https://…" className={`${fieldClass} mt-1 normal-case tracking-normal`} /></label>
        <ImageUploadField id="service-image-upload" value={isUploadedImage(editing.imageRef) ? editing.imageRef : ''} onChange={(imageRef) => setEditing((current) => current && ({ ...current, imageRef: imageRef || 'studio' }))} onLoadingChange={setImageLoading} />
        <div className="aspect-[4/3] overflow-hidden border border-beige"><Ph k={SERVICES_IMAGE_KEYS.includes(editing.imageRef) ? editing.imageRef : 'studio'} img={/^https?:\/\//i.test(editing.imageRef) || isUploadedImage(editing.imageRef) ? editing.imageRef : ''} label={`${editing.name || 'Service'} image preview`} /></div>
        <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={editing.active} onChange={(event) => setEditing({ ...editing, active: event.target.checked })} className="h-4 w-4 accent-[#C6A16A]" />Available on the public site</label>
        <div className="flex flex-wrap justify-end gap-3 border-t border-beige pt-4"><button type="button" onClick={() => setEditing(null)} className={buttonClass}>Cancel</button><button type="submit" disabled={imageLoading} className={`${primaryButtonClass} disabled:cursor-wait disabled:opacity-60`}>Save service</button></div>
      </form>
    </Dialog>}
    {preview && <Dialog title={preview.name} onClose={() => setPreview(null)}>
      <div className="aspect-[4/3] overflow-hidden"><Ph k={SERVICES_IMAGE_KEYS.includes(preview.imageRef) ? preview.imageRef : 'studio'} img={/^https?:\/\//i.test(preview.imageRef) || isUploadedImage(preview.imageRef) ? preview.imageRef : ''} label={preview.name} /></div>
      <p className="mt-4 text-sm leading-6 text-muted">{preview.description}</p><p className="mt-3 text-xs text-muted">Status: {preview.active ? 'Active' : 'Inactive'}</p>
    </Dialog>}
  </div>
}

const emptyProject = { title: '', category: PORTFOLIO_CATEGORIES[0], imageRef: 'studio', imageUrl: '', description: '', published: false }
export function AdminPortfolio() {
  const { records: projects, error, loading } = useAdminCollection(loadPortfolio)
  const [editing, setEditing] = useState(null)
  const [preview, setPreview] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [actionError, setActionError] = useState('')
  const [imageLoading, setImageLoading] = useState(false)

  function save(event) {
    event.preventDefault()
    try {
      savePortfolioProject(editing)
      setEditing(null)
      setFeedback('Portfolio project saved in this browser. Public gallery content is synchronized.')
      setActionError('')
    } catch (saveError) {
      setActionError(saveError.message || 'The project could not be saved.')
    }
  }
  function remove(project) {
    if (!window.confirm(`Delete “${project.title}” from the portfolio? This cannot be undone in this browser demo.`)) return
    try {
      deletePortfolioProject(project.id)
      setFeedback('Portfolio project removed from this browser demo.')
      setActionError('')
    } catch (deleteError) {
      setActionError(deleteError.message || 'The project could not be deleted.')
    }
  }
  function togglePublication(project) {
    try {
      savePortfolioProject({ ...project, published: !project.published })
      setFeedback(`Project ${project.published ? 'unpublished' : 'published'} in the public gallery.`)
      setActionError('')
    } catch (saveError) {
      setActionError(saveError.message || 'The publication status could not be changed.')
    }
  }

  return <div>
    <Heading title="Portfolio" action={<button type="button" onClick={() => setEditing({ ...emptyProject })} className={primaryButtonClass}><Plus size={15} />Add project</button>}>
      Published projects appear in the public gallery. Uploaded photos are resized and stored in this browser demo.
    </Heading>
    {error && <Feedback error>{error}</Feedback>}{feedback && <Feedback>{feedback}</Feedback>}{actionError && <Feedback error>{actionError}</Feedback>}
    {loading ? <p role="status" className="py-8 text-sm text-muted">Loading portfolio…</p> : projects.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => <article key={project.id} className="border border-beige bg-white/30">
        <div className="aspect-[4/3] overflow-hidden"><Ph k={project.imageRef} img={project.imageUrl} label={`${project.title} preview`} /></div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wider text-gold">{project.category}</p><h2 className="mt-1 font-serif text-xl">{project.title}</h2></div><Badge status={project.published ? 'Published' : 'Unpublished'} /></div>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setPreview(project)} className={buttonClass}><Eye size={13} />Preview</button><button type="button" onClick={() => setEditing({ ...project })} className={buttonClass}>Edit</button>
            <button type="button" onClick={() => togglePublication(project)} className={buttonClass}>{project.published ? 'Unpublish' : 'Publish'}</button><button type="button" onClick={() => remove(project)} className={buttonClass}>Delete</button></div>
        </div>
      </article>)}
    </div> : <EmptyState title="No portfolio projects" description="Add a project to start building the public gallery." action={<button type="button" onClick={() => setEditing({ ...emptyProject })} className={`${primaryButtonClass} mt-4`}>Add project</button>} />}
    {editing && <Dialog title={editing.id ? 'Edit project' : 'Add project'} onClose={() => setEditing(null)} wide>
      <form onSubmit={save} className="grid gap-5 md:grid-cols-2">
        {actionError && <div className="md:col-span-2"><Feedback error>{actionError}</Feedback></div>}
        <div className="space-y-4">
          <label className="block text-xs uppercase tracking-wider">Project title<input autoFocus required maxLength={100} value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} className={`${fieldClass} mt-1 normal-case tracking-normal`} /></label>
          <label className="block text-xs uppercase tracking-wider">Category<select required value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })} className={`${fieldClass} mt-1 normal-case tracking-normal`}>{PORTFOLIO_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="block text-xs uppercase tracking-wider">Short description<textarea required maxLength={300} rows="3" value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} className={`${fieldClass} mt-1 normal-case tracking-normal`} /></label>
          <label className="block text-xs uppercase tracking-wider">Image URL (optional)<input type="url" value={isUploadedImage(editing.imageUrl) ? '' : editing.imageUrl} onChange={(event) => setEditing({ ...editing, imageUrl: event.target.value })} placeholder="https://…" className={`${fieldClass} mt-1 normal-case tracking-normal`} /></label>
          <ImageUploadField id="portfolio-image-upload" value={isUploadedImage(editing.imageUrl) ? editing.imageUrl : ''} onChange={(imageUrl) => setEditing((current) => current && ({ ...current, imageUrl }))} onLoadingChange={setImageLoading} />
          <label className="block text-xs uppercase tracking-wider">Preview fallback<select value={editing.imageRef} onChange={(event) => setEditing({ ...editing, imageRef: event.target.value })} className={`${fieldClass} mt-1 normal-case tracking-normal`}>{SERVICES_IMAGE_KEYS.map((key) => <option key={key}>{key}</option>)}</select></label>
          <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={editing.published} onChange={(event) => setEditing({ ...editing, published: event.target.checked })} className="h-4 w-4 accent-[#C6A16A]" />Published in public gallery</label>
        </div>
        <div><p className="mb-2 text-xs uppercase tracking-wider">Image preview</p><div className="aspect-[4/3] overflow-hidden border border-beige"><Ph k={editing.imageRef} img={editing.imageUrl} label="Selected project image preview" /></div><p className="mt-2 text-xs leading-5 text-muted">If the image URL is empty or fails to load, the selected preview image is used.</p></div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-beige pt-4 md:col-span-2"><button type="button" onClick={() => setEditing(null)} className={buttonClass}>Cancel</button><button type="submit" disabled={imageLoading} className={`${primaryButtonClass} disabled:cursor-wait disabled:opacity-60`}>Save project</button></div>
      </form>
    </Dialog>}
    {preview && <Dialog title={preview.title} onClose={() => setPreview(null)} wide>
      <div className="mx-auto aspect-[4/3] max-h-[55vh] max-w-2xl overflow-hidden"><Ph k={preview.imageRef} img={preview.imageUrl} label={preview.title} /></div>
      <p className="mt-4 text-[10px] uppercase tracking-wider text-gold">{preview.category} · {preview.published ? 'Published' : 'Unpublished'}</p><p className="mt-2 text-sm leading-6 text-muted">{preview.description}</p>
    </Dialog>}
  </div>
}

export function AdminInquiries() {
  const { records: inquiries, error, loading } = useAdminCollection(loadInquiries)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [actionError, setActionError] = useState('')
  const filtered = inquiries.filter((inquiry) => (!query || `${inquiry.name} ${inquiry.email} ${inquiry.reference} ${inquiry.service}`.toLowerCase().includes(query.trim().toLowerCase()))
    && (status === 'All statuses' || inquiry.status === status))

  function changeStatus(inquiry, next) {
    try {
      updateInquiryStatus(inquiry.id, next)
      setFeedback(`${inquiry.reference} updated to ${next}. No email was sent.`)
      setActionError('')
      if (selected?.id === inquiry.id) setSelected({ ...inquiry, status: next })
    } catch (updateError) {
      setActionError(updateError.message || 'The inquiry status could not be updated.')
    }
  }
  function clear() { setQuery(''); setStatus('All statuses') }

  return <div>
    <Heading title="Customer Inquiries">Review messages submitted through the public contact form. Replies are not sent from this demo.</Heading>
    {error && <Feedback error>{error}</Feedback>}{feedback && <Feedback>{feedback}</Feedback>}{actionError && <Feedback error>{actionError}</Feedback>}
    <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(220px,1fr)_200px_auto]">
      <label className="relative block"><span className="sr-only">Search inquiries</span><Search aria-hidden="true" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input className={`${fieldClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, service or reference" /></label>
      <label><span className="sr-only">Filter inquiry status</span><select className={fieldClass} value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{INQUIRY_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></label>
      <button type="button" onClick={clear} className={buttonClass}><SlidersHorizontal size={14} />Clear filters</button>
    </div>
    {loading ? <p role="status" className="py-8 text-sm text-muted">Loading inquiries…</p> : filtered.length ? <>
      <DataTable className="hidden md:block"><TableHead><th className="px-4 py-3">Reference / Customer</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Related service</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></TableHead>
        <tbody className="divide-y divide-beige">{filtered.map((inquiry) => <tr key={inquiry.id} className="hover:bg-cream/40"><TableCell><span className="block text-xs text-muted">{inquiry.reference}</span><span className="mt-1 block font-medium">{inquiry.name}</span></TableCell><TableCell>{inquiry.email}</TableCell><TableCell>{inquiry.service}</TableCell><TableCell className="whitespace-nowrap">{dateLabel(inquiry.submittedAt)}</TableCell><TableCell><Badge status={inquiry.status} /></TableCell><TableCell><button type="button" onClick={() => setSelected(inquiry)} className="inline-flex min-h-10 items-center gap-1 text-xs hover:text-gold"><Eye size={14} />Details</button></TableCell></tr>)}</tbody>
      </DataTable>
      <ul className="divide-y divide-beige border-y border-beige md:hidden">{filtered.map((inquiry) => <li key={inquiry.id} className="space-y-2 py-4">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] text-muted">{inquiry.reference}</p><h2 className="mt-1 font-medium">{inquiry.name}</h2></div><Badge status={inquiry.status} /></div><p className="text-sm">{inquiry.service}</p><p className="break-all text-xs text-muted">{inquiry.email} · {dateLabel(inquiry.submittedAt)}</p>
        <button type="button" onClick={() => setSelected(inquiry)} className="inline-flex min-h-10 items-center gap-2 text-xs uppercase tracking-wider hover:text-gold"><Eye size={14} />View inquiry</button>
      </li>)}</ul>
    </> : <EmptyState title={query || status !== 'All statuses' ? 'No matching inquiries' : 'No inquiries received'} description={query || status !== 'All statuses' ? 'Try a different search term or clear your filters.' : 'Customer messages submitted on the public contact page will be listed here.'} action={(query || status !== 'All statuses') && <button type="button" onClick={clear} className="mt-4 text-xs uppercase tracking-wider underline underline-offset-4">Clear filters</button>} />}
    {selected && <Dialog title={`Inquiry · ${selected.reference}`} onClose={() => setSelected(null)}>
      {actionError && <Feedback error>{actionError}</Feedback>}
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-serif text-xl">{selected.name}</h3><Badge status={selected.status} /></div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">{[['Email address', selected.email], ['Phone', selected.phone || 'Not provided'], ['Related service', selected.service], ['Preferred date', dateLabel(selected.preferredDate)], ['Submitted', dateLabel(selected.submittedAt)]].map(([label, value]) =>
        <div key={label}><dt className="text-[10px] uppercase tracking-wider text-muted">{label}</dt><dd className="mt-1 break-words text-sm">{value}</dd></div>)}</dl>
      <div className="mt-5 border-t border-beige pt-4"><h3 className="text-[10px] uppercase tracking-wider text-muted">Message</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{selected.message}</p></div>
      <label className="mt-5 block text-xs uppercase tracking-wider">Inquiry status<select value={selected.status} onChange={(event) => changeStatus(selected, event.target.value)} className={`${fieldClass} mt-1 normal-case tracking-normal`}>{INQUIRY_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></label>
      <p className="mt-3 text-xs leading-5 text-muted">Status updates are saved in this browser only. Changing status does not send an email.</p>
    </Dialog>}
  </div>
}

export function AdminSettings() {
  const [form, setForm] = useState(() => getAdminSettings())
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  function update(key, value) { setForm((current) => ({ ...current, [key]: value })); setFeedback('') }
  function submit(event) {
    event.preventDefault()
    try {
      setForm(saveAdminSettings(form))
      setFeedback('Business settings saved in this browser demo.')
      setError('')
    } catch (saveError) {
      setError(saveError.message || 'Settings could not be saved.')
      setFeedback('')
    }
  }
  return <div className="max-w-3xl">
    <Heading title="Settings">Configure public-facing display preferences. These values are stored locally in this demo browser.</Heading>
    {feedback && <Feedback>{feedback}</Feedback>}{error && <Feedback error>{error}</Feedback>}
    <form onSubmit={submit} className="space-y-6">
      <section className="space-y-4 border-b border-beige pb-6">
        <h2 className="font-serif text-xl">Business profile</h2>
        <label className="block text-xs uppercase tracking-wider">Business display name<input required maxLength="120" value={form.businessName} onChange={(event) => update('businessName', event.target.value)} className={`${fieldClass} mt-1 normal-case tracking-normal`} /></label>
        <label className="block text-xs uppercase tracking-wider">Business description<textarea rows="4" maxLength="1000" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Add a short description when ready" className={`${fieldClass} mt-1 normal-case tracking-normal`} /></label>
        <label className="block text-xs uppercase tracking-wider">Contact email placeholder<input type="email" value={form.contactEmail} onChange={(event) => update('contactEmail', event.target.value)} placeholder="Not configured" className={`${fieldClass} mt-1 normal-case tracking-normal`} /><span className="mt-1 block text-xs normal-case tracking-normal text-muted">No contact email is pre-filled or assumed.</span></label>
        <label className="block text-xs uppercase tracking-wider">Location placeholder<input value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Not configured" className={`${fieldClass} mt-1 normal-case tracking-normal`} /></label>
      </section>
      <section className="space-y-3 border-b border-beige pb-6">
        <h2 className="font-serif text-xl">Public website preferences</h2>
        <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={form.showPortfolio} onChange={(event) => update('showPortfolio', event.target.checked)} className="h-4 w-4 accent-[#C6A16A]" />Show portfolio section</label>
        <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={form.showServices} onChange={(event) => update('showServices', event.target.checked)} className="h-4 w-4 accent-[#C6A16A]" />Show services section</label>
      </section>
      <button type="submit" className={primaryButtonClass}>Save settings</button>
    </form>
    <p className="mt-7 border-l-2 border-gold bg-cream px-4 py-3 text-xs leading-5 text-muted">Production settings require backend persistence and authorization. Public customers cannot change administrator permissions through these preferences.</p>
  </div>
}
