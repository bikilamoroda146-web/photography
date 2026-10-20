import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, BriefcaseBusiness, CalendarDays, ChevronLeft, ChevronRight, CloudUpload, Image,
  LayoutDashboard, LogOut, Mail, Menu, Search, Settings, Tags, Users, X,
} from 'lucide-react'
import { endDemoAdminSession, getDemoAdminSession } from '../services/adminSessionService'

const navigation = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/photos', label: 'Photo Gallery', icon: Image },
  { to: '/admin/upload', label: 'Upload Photos', icon: CloudUpload },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/products', label: 'Products & services', icon: BriefcaseBusiness },
  { to: '/admin/inquiries', label: 'Customer Inquiries', icon: Mail },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]
const businessNavigation = [
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/admin/customers', label: 'Customers', icon: Users },
]

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const [adminSearch, setAdminSearch] = useState('')
  const openButton = useRef(null)
  const sidebar = useRef(null)
  const drawerWasOpen = useRef(false)
  const location = useLocation()
  const navigate = useNavigate()
  let session
  let sessionError = ''

  try {
    session = getDemoAdminSession()
  } catch (error) {
    sessionError = error.message || 'The admin demo session could not be read.'
  }

  useEffect(() => {
    if (!mobileOpen) {
      if (drawerWasOpen.current) openButton.current?.focus()
      drawerWasOpen.current = false
      return undefined
    }
    drawerWasOpen.current = true
    sidebar.current?.querySelector('a, button')?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        openButton.current?.focus()
        return
      }
      if (event.key === 'Tab') {
        const focusable = [...sidebar.current.querySelectorAll('a[href], button:not([disabled])')]
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  useEffect(() => setMobileOpen(false), [location.pathname])

  if (sessionError) return <main className="grid min-h-screen place-items-center px-5 text-center"><div className="max-w-md">
    <h1 className="font-serif text-2xl text-char">Admin demo unavailable</h1>
    <p role="alert" className="mt-3 text-sm leading-6 text-muted">{sessionError}</p>
    <Link to="/" className="mt-5 inline-block min-h-10 pt-2 text-xs uppercase tracking-wider underline underline-offset-4">Return to the public site</Link>
  </div></main>
  if (!session || session.role !== 'admin') return <Navigate to="/admin/signin" replace state={{ from: location.pathname }} />

  function signOut() {
    if (!window.confirm('Sign out of this simulated admin session?')) return
    try {
      endDemoAdminSession()
      navigate('/admin/signin', { replace: true })
    } catch (error) {
      setSignOutError(error.message || 'Unable to sign out.')
    }
  }

  return <div className="min-h-screen bg-ivory md:flex">
    {mobileOpen && <button type="button" aria-label="Close admin navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-rich/60 md:hidden" />}
    <aside ref={sidebar} id="admin-navigation" className={`fixed inset-y-0 left-0 z-50 w-[min(84vw,280px)] flex-col bg-char text-ivory transition-all duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${mobileOpen ? 'flex translate-x-0' : 'hidden md:flex'} ${collapsed ? 'md:w-[76px]' : 'md:w-60'}`}>
      <div className="flex min-h-[76px] items-center justify-between border-b border-white/10 px-5">
        <Link to="/admin" className={`leading-none ${collapsed ? 'md:sr-only' : ''}`} aria-label="SAMI admin overview">
          <span className="font-serif text-xl tracking-[.2em]">SAMI</span>
          <span className="mt-1 block text-[8px] tracking-[.25em] text-beige">STUDIO ADMIN</span>
        </Link>
        <span aria-hidden="true" className={`hidden h-9 w-9 place-items-center border border-gold/50 font-serif text-gold ${collapsed ? 'md:grid' : ''}`}>S</span>
        <button type="button" className="rounded-sm p-1 text-beige hover:text-ivory md:hidden" aria-label="Close navigation menu" onClick={() => setMobileOpen(false)}><X size={18} /></button>
      </div>
      <nav aria-label="Administration" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className={`px-3 pb-2 text-[9px] uppercase tracking-[.2em] text-muted ${collapsed ? 'md:sr-only' : ''}`}>Workspace</p>
        {navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} title={collapsed ? label : undefined}
          className={({ isActive }) => `flex min-h-11 items-center gap-3 border-l-2 px-3 text-sm transition ${collapsed ? 'md:justify-center md:px-2' : ''} ${isActive ? 'border-gold bg-white/[.07] text-gold' : 'border-transparent text-beige hover:bg-white/[.04] hover:text-ivory'}`}>
          <Icon aria-hidden="true" size={17} strokeWidth={1.6} /><span className={collapsed ? 'md:sr-only' : ''}>{label}</span>
        </NavLink>)}
        <p className={`mb-2 mt-7 border-t border-white/10 px-3 pb-1 pt-5 text-[9px] uppercase tracking-[.2em] text-muted ${collapsed ? 'md:sr-only' : ''}`}>Business</p>
        {businessNavigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} title={collapsed ? label : undefined}
          className={({ isActive }) => `flex min-h-11 items-center gap-3 border-l-2 px-3 text-sm transition ${collapsed ? 'md:justify-center md:px-2' : ''} ${isActive ? 'border-gold bg-white/[.07] text-gold' : 'border-transparent text-beige hover:bg-white/[.04] hover:text-ivory'}`}>
          <Icon aria-hidden="true" size={17} strokeWidth={1.6} /><span className={collapsed ? 'md:sr-only' : ''}>{label}</span>
        </NavLink>)}
      </nav>
      <div className="border-t border-white/10 px-3 py-4">
        {signOutError && <p role="alert" className={`mb-3 px-3 text-xs text-red-200 ${collapsed ? 'md:sr-only' : ''}`}>{signOutError}</p>}
        <button type="button" onClick={signOut} title={collapsed ? 'Sign out' : undefined} className={`flex min-h-11 w-full items-center gap-3 border-l-2 border-transparent px-3 text-sm text-beige transition hover:bg-white/[.04] hover:text-ivory ${collapsed ? 'md:justify-center md:px-2' : ''}`}>
          <LogOut aria-hidden="true" size={17} strokeWidth={1.6} /><span className={collapsed ? 'md:sr-only' : ''}>Sign Out</span>
        </button>
        <button type="button" onClick={() => setCollapsed((value) => !value)} className="mt-2 hidden min-h-10 w-full items-center justify-center gap-2 text-xs text-beige hover:bg-white/[.04] md:flex" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} />Collapse</>}
        </button>
      </div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-[#E5DED2] bg-[#FAF8F3]/95 px-4 backdrop-blur sm:px-7 lg:px-10">
        <div className="flex items-center gap-3">
          <button ref={openButton} type="button" className="grid h-10 w-10 place-items-center border border-beige text-char hover:border-gold md:hidden" aria-label="Open admin navigation" aria-expanded={mobileOpen} aria-controls="admin-navigation" onClick={() => setMobileOpen(true)}><Menu size={19} /></button>
          <div className="min-w-0"><p className="truncate text-[8px] uppercase tracking-[.2em] text-[#947346]">Sami Photography</p><p className="truncate text-xs font-medium text-char sm:text-sm">{navigation.find((item) => item.to === location.pathname)?.label || businessNavigation.find((item) => item.to === location.pathname)?.label || 'Studio administration'}</p></div>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4">
          <label className="relative hidden w-full max-w-xs md:block"><span className="sr-only">Search photos</span><Search aria-hidden="true" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Search your photos…" className="min-h-10 w-full border border-[#E5DED2] bg-white/70 pl-9 pr-3 text-xs text-char placeholder:text-muted/70 focus:border-[#B49668]" /></label>
          <button type="button" disabled aria-label="Notifications, preview only" title="Notifications are not connected" className="relative grid h-10 w-10 shrink-0 place-items-center border border-[#E5DED2] bg-white/60 text-char opacity-80"><Bell size={16} /><span aria-hidden="true" className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#B8874E] ring-2 ring-white" /></button>
          <div className="flex shrink-0 items-center gap-2 border-l border-[#E5DED2] pl-3 sm:pl-4"><span className="grid h-8 w-8 place-items-center rounded-full bg-char font-serif text-sm text-[#E7D6B7]">S</span><span className="hidden sm:block"><span className="block text-xs font-medium text-char">Studio Admin</span><span className="block text-[9px] text-muted">Administrator</span></span></div>
          <Link to="/" className="hidden min-h-10 items-center border-l border-[#E5DED2] pl-4 text-[10px] uppercase tracking-wider text-char hover:text-gold lg:flex">View site</Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
        <p className="mb-7 border-l-2 border-gold bg-cream px-3 py-2 text-xs leading-5 text-muted">
          Frontend demo only · Admin sessions and photo changes are stored in this browser, not shared or secure authorization. Uploaded image files use browser storage.
        </p>
        <Outlet context={{ pathname: location.pathname, adminSearch, setAdminSearch }} />
      </main>
    </div>
  </div>
}
