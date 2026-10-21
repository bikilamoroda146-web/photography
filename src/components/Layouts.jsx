import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, LayoutDashboard, LogOut, Menu, Settings, UserRound, X } from 'lucide-react'
import { NAV, SITE } from '../data/data'
import CustomerAvatar from './CustomerAvatar'
import { usePublicServices, usePublicSettings } from '../hooks/usePublicData'
import { CUSTOMER_SESSION_CHANGED, endDemoSession, getCustomer, getDemoSession } from '../services/customerService'

function Navbar() {
  const [open, setOpen] = useState(false)
  const [auth, setAuth] = useState(() => {
    try {
      return { session: getDemoSession(), error: '' }
    } catch (error) {
      return { session: null, error: error.message || 'Customer session could not be read.' }
    }
  })
  const [signOutError, setSignOutError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const link = ({ isActive }) => `border-b pb-1 transition ${isActive ? 'border-gold text-gold' : 'border-transparent hover:border-beige'}`
  useEffect(() => {
    function refreshSession() {
      try {
        setAuth({ session: getDemoSession(), error: '' })
      } catch (error) {
        setAuth({ session: null, error: error.message || 'Customer session could not be read.' })
      }
    }
    window.addEventListener(CUSTOMER_SESSION_CHANGED, refreshSession)
    window.addEventListener('storage', refreshSession)
    return () => {
      window.removeEventListener(CUSTOMER_SESSION_CHANGED, refreshSession)
      window.removeEventListener('storage', refreshSession)
    }
  }, [])
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])
  useEffect(() => setOpen(false), [location.pathname])

  function signOut() {
    setSignOutError('')
    try {
      endDemoSession()
      setAuth({ session: null, error: '' })
      setOpen(false)
      navigate('/', { replace: true })
    } catch (error) {
      setSignOutError(error.message || 'Unable to sign out.')
    }
  }

  const desktopAuthLinks = auth.session
    ? <>
      <Link to="/dashboard/profile" state={{ editProfile: true }} aria-label="Open your profile editor" className="inline-flex rounded-full transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2">
        <CustomerAvatar email={auth.session.email} name="Customer" className="h-7 w-7 cursor-pointer text-xs" />
      </Link>
      <button type="button" onClick={signOut} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest hover:text-gold"><LogOut aria-hidden="true" size={16} />Sign Out</button>
    </>
    : <>
      <Link to="/signin" className="text-xs uppercase tracking-widest hover:text-gold">Sign In</Link>
      <Link to="/signup" className="text-xs uppercase tracking-widest hover:text-gold">Sign Up</Link>
      <Link to="/admin/signin" className="text-[10px] uppercase tracking-wider text-beige hover:text-gold">Studio Admin</Link>
    </>

  return (
    <header className="absolute inset-x-0 top-0 z-30 text-ivory">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
        <Link to="/" onClick={() => setOpen(false)} className="leading-none"><span className="font-serif text-2xl tracking-widest">SAMI</span><span className="block text-[8px] tracking-[.4em] text-beige">PHOTOGRAPHY</span></Link>
        <nav aria-label="Main" className="hidden gap-8 text-xs uppercase tracking-widest md:flex">
          {NAV.map(([p, l]) => <NavLink key={p} to={p} end className={link}>{l}</NavLink>)}</nav>
        <div className="hidden items-center gap-5 md:flex">{desktopAuthLinks}</div>
        <button type="button" className="-mr-2 grid min-h-11 min-w-11 place-items-center p-2 md:hidden" aria-expanded={open} aria-controls="mobile-public-navigation" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div id="mobile-public-navigation" className="fade bg-rich/95 px-5 pb-6 md:hidden">
        <nav aria-label="Mobile main" className="space-y-1">
          {NAV.map(([p, l]) => <NavLink key={p} to={p} end onClick={() => setOpen(false)} className={({ isActive }) => `block border-b py-3 text-sm uppercase tracking-widest ${isActive ? 'border-gold text-gold' : 'border-white/10 text-ivory'}`}>{l}</NavLink>)}
          {auth.session ? <>
            <Link to="/dashboard/profile" state={{ editProfile: true }} onClick={() => setOpen(false)} aria-label="Open your profile editor" className="flex min-h-11 w-11 items-center justify-center rounded-full border-b border-white/10 py-2 transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2">
              <CustomerAvatar email={auth.session.email} name="Customer" className="h-7 w-7 cursor-pointer text-xs" />
            </Link>
            <button type="button" onClick={signOut} className="flex w-full items-center gap-2 border-b border-white/10 py-3 text-left text-sm uppercase tracking-widest"><LogOut aria-hidden="true" size={16} />Sign Out</button>
          </> : <>
            <Link to="/signin" onClick={() => setOpen(false)} className="block border-b border-white/10 py-3 text-sm uppercase tracking-widest">Sign In</Link>
            <Link to="/signup" onClick={() => setOpen(false)} className="block border-b border-white/10 py-3 text-sm uppercase tracking-widest">Sign Up</Link>
            <Link to="/admin/signin" onClick={() => setOpen(false)} className="block border-b border-white/10 py-3 text-sm uppercase tracking-widest text-beige">Studio Admin</Link>
          </>}
        </nav>
      </div>}
      {(auth.error || signOutError) && <p role="alert" className="mx-auto max-w-7xl px-5 text-xs text-red-200 md:px-10">{auth.error || signOutError}</p>}
    </header>)
}
function Footer() {
  const { services, error: servicesError } = usePublicServices()
  const { settings } = usePublicSettings()
  return (
    <footer className="bg-rich text-beige">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 text-sm md:grid-cols-4 md:px-10">
        <div><p className="font-serif text-2xl tracking-widest text-ivory">SAMI</p><p className="text-[9px] tracking-[.4em]">PHOTOGRAPHY</p></div>
        <div><p className="mb-3 text-xs uppercase tracking-widest text-ivory">Explore</p>{NAV.map(([p, l]) => <Link key={p} to={p} className="block py-1 hover:text-gold">{l}</Link>)}</div>
        {settings.showServices && <div><p className="mb-3 text-xs uppercase tracking-widest text-ivory">Services</p>{servicesError ? <p role="alert" className="text-xs text-muted">Services could not be loaded.</p> : services.map((s) => <Link key={s.id} to={`/contact?service=${encodeURIComponent(s.name)}`} className="block py-1 hover:text-gold">{s.name}</Link>)}</div>}
        <div><p className="mb-3 text-xs uppercase tracking-widest text-ivory">Contact</p><p>{settings.contactEmail || SITE.email}</p><p className="mt-1">{settings.location || SITE.location}</p><p className="mt-3 text-muted">Social links: add yours in data.js</p></div>
      </div>
      <p className="border-t border-white/10 py-5 text-center text-xs text-muted">© {new Date().getFullYear()} Sami Photography. All rights reserved.</p>
    </footer>)
}
export const PublicLayout = () => <><Navbar /><main><Outlet /></main><Footer /></>

export function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const menuButton = useRef(null)
  const drawer = useRef(null)
  const drawerWasOpen = useRef(false)
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (!open) {
      if (drawerWasOpen.current) menuButton.current?.focus()
      drawerWasOpen.current = false
      return undefined
    }
    drawerWasOpen.current = true
    drawer.current?.querySelector('a, button')?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButton.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])
  let session
  try {
    session = getDemoSession()
  } catch (storageError) {
    return <main className="grid min-h-screen place-items-center px-5 text-center"><div><h1 className="font-serif text-2xl">Customer demo unavailable</h1><p role="alert" className="mt-3 max-w-md text-sm leading-6 text-muted">{storageError.message}</p><Link to="/" className="mt-5 inline-block text-xs uppercase tracking-wider underline underline-offset-4">Return to the public site</Link></div></main>
  }
  if (!session || session.role !== 'customer') return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  let customer
  try {
    customer = getCustomer(session.email)
  } catch (storageError) {
    return <main className="grid min-h-screen place-items-center px-5 text-center"><div><h1 className="font-serif text-2xl">Customer demo unavailable</h1><p role="alert" className="mt-3 max-w-md text-sm leading-6 text-muted">{storageError.message}</p><Link to="/" className="mt-5 inline-block text-xs uppercase tracking-wider underline underline-offset-4">Return to the public site</Link></div></main>
  }
  const items = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/bookings', label: 'My Bookings', icon: CalendarDays },
    { to: '/dashboard/bookings/new', label: 'Book a Session', icon: CalendarDays, end: true },
    { to: '/dashboard/profile', label: 'My Profile', icon: UserRound, end: true },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings, end: true },
  ]
  function signOut() {
    if (!window.confirm('Sign out of your customer session?')) return
    try {
      endDemoSession()
      navigate('/', { replace: true })
    } catch (signOutError) {
      setError(signOutError.message || 'Unable to sign out.')
    }
  }
  return (
    <div className="min-h-screen bg-ivory md:flex">
      {open && <button type="button" aria-label="Close navigation menu" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-rich/60 md:hidden" />}
      <aside ref={drawer} id="customer-navigation" className={`fixed inset-y-0 left-0 z-50 w-[min(82vw,280px)] flex-col bg-char text-ivory transition-transform duration-200 md:sticky md:top-0 md:h-screen md:w-60 md:translate-x-0 ${open ? 'flex translate-x-0' : 'hidden md:flex'}`}>
        <div className="border-b border-white/10 px-5 pb-5 pt-6">
          <div className="flex items-start justify-between"><Link to="/" onClick={() => setOpen(false)} className="leading-none"><span className="font-serif text-xl tracking-[.2em]">SAMI</span><span className="mt-1 block text-[8px] tracking-[.3em] text-beige">PHOTOGRAPHY & DIGITAL</span></Link>
            <button type="button" className="rounded-sm p-1 text-beige hover:text-ivory focus-visible:outline md:hidden" aria-label="Close navigation menu" onClick={() => setOpen(false)}><X size={18} /></button></div>
        </div>
        <div className="border-b border-white/10 px-5 py-5">
          <Link to="/dashboard/profile" state={{ editProfile: true }} aria-label="Edit your profile and profile photo" className="inline-flex rounded-full transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2" onClick={() => setOpen(false)}>
            <CustomerAvatar email={session.email} name={customer.name} className="h-10 w-10 cursor-pointer text-lg" />
          </Link>
          <p className="mt-3 truncate text-sm font-medium">{customer.name}</p><p className="mt-1 truncate text-xs text-beige">{session.email}</p>
        </div>
        <nav aria-label="Customer dashboard" className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-[9px] uppercase tracking-[.2em] text-muted">Workspace</p>
          {items.map(({ to, label, icon: Icon, end }) => {
            const active = to === '/dashboard/bookings'
              ? location.pathname.startsWith(to) && location.pathname !== '/dashboard/bookings/new'
              : end
                ? location.pathname === to
                : location.pathname === to || location.pathname.startsWith(`${to}/`)
            return <Link key={to} to={to} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)} className={`flex min-h-11 items-center gap-3 border-l-2 px-3 text-sm transition ${active ? 'border-gold bg-white/[.07] text-gold' : 'border-transparent text-beige hover:bg-white/[.04] hover:text-ivory'}`}>
              <Icon aria-hidden="true" size={17} strokeWidth={1.6} />{label}
            </Link>
          })}
        </nav>
        <div className="border-t border-white/10 px-3 py-4">
          {error && <p role="alert" className="mb-3 px-3 text-xs text-red-200">{error}</p>}
          <Link to="/" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 border-l-2 border-transparent px-3 text-sm text-beige transition hover:bg-white/[.04] hover:text-ivory"><ArrowLeft aria-hidden="true" size={17} strokeWidth={1.6} />Back to Website</Link>
          <button type="button" onClick={signOut} className="flex min-h-11 w-full items-center gap-3 border-l-2 border-transparent px-3 text-sm text-beige transition hover:bg-white/[.04] hover:text-ivory"><LogOut aria-hidden="true" size={17} strokeWidth={1.6} />Sign Out</button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex min-h-16 items-center justify-between border-b border-beige bg-ivory px-4 sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button ref={menuButton} type="button" className="grid h-10 w-10 place-items-center border border-beige text-char hover:border-gold md:hidden" aria-label="Open navigation menu" aria-expanded={open} aria-controls="customer-navigation" onClick={() => setOpen(true)}><Menu size={19} /></button>
            <span className="text-[10px] uppercase tracking-[.18em] text-muted">Customer dashboard</span>
          </div>
          <Link to="/dashboard/profile" state={{ editProfile: true }} aria-label={`Edit profile for ${customer.name}`} className="flex min-h-10 items-center gap-2 rounded-sm text-xs text-char hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2">
            <CustomerAvatar email={session.email} name={customer.name} className="h-8 w-8 text-sm text-char" />
            <span className="hidden text-right sm:block"><span className="block">{customer.name}</span><span className="block text-[10px] text-muted">{session.email}</span></span>
          </Link>
        </header>
        <main className="fade mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
          <p className="mb-7 border-l-2 border-gold bg-cream px-3 py-2 text-xs leading-5 text-muted">Frontend-only local accounts are not secure production authentication. Profiles, password hashes and bookings stay in this browser and are not shared across devices or browsers.</p>
          <Outlet />
        </main>
      </div>
    </div>)
}
