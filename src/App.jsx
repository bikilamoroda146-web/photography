import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { PublicLayout, DashboardLayout } from './components/Layouts'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import Services from './pages/Services'
import About from './pages/About'
import Contact from './pages/Contact'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import {
  BookingDetails, Bookings, BookSession, Dashboard, Profile, Settings,
} from './pages/Customer'
import AdminLayout from './layouts/AdminLayout'
import AdminSignIn from './pages/admin/AdminSignIn'
import PhotoStudio from './pages/admin/PhotoStudio'
import {
  AdminBookingDetails, AdminBookings, AdminCustomers, AdminInquiries,
  AdminOverview, AdminPortfolio, AdminServices, AdminSettings,
} from './pages/admin/AdminPages'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const name = pathname === '/' ? '' : pathname.slice(1, 2).toUpperCase() + pathname.slice(2) + ' · '
    document.title = name + 'Sami Photography'
  }, [pathname])
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} /><Route path="/portfolio" element={<Portfolio />} />
        <Route path="/services" element={<Services />} /><Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<div className="grid min-h-screen place-items-center text-center"><h1 className="font-serif text-4xl">Page not found</h1></div>} />
      </Route>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/admin/signin" element={<AdminSignIn />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="photos" element={<PhotoStudio />} />
        <Route path="upload" element={<PhotoStudio />} />
        <Route path="categories" element={<PhotoStudio />} />
        <Route path="business-overview" element={<AdminOverview />} />
        <Route path="products" element={<AdminServices />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="bookings/:bookingId" element={<AdminBookingDetails />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="portfolio" element={<AdminPortfolio />} />
        <Route path="inquiries" element={<AdminInquiries />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/bookings" element={<Bookings />} />
        <Route path="/dashboard/bookings/new" element={<BookSession />} />
        <Route path="/dashboard/bookings/:bookingId" element={<BookingDetails />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/dashboard/settings" element={<Settings />} />
      </Route>
    </Routes>)
}
