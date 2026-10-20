import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Banner, EMAIL_RE, Field, inputCls } from '../components/ui'
import { SITE } from '../data/data'
import { usePublicServices, usePublicSettings } from '../hooks/usePublicData'
import { createInquiry } from '../services/inquiryService'

export default function Contact() {
  const [params] = useSearchParams()
  const { services, error: servicesError } = usePublicServices()
  const { settings, error: settingsError } = usePublicSettings()
  const [f, setF] = useState({ name: '', email: '', phone: '', service: params.get('service') || '', date: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  function onSubmit(e) {
    e.preventDefault()
    const n = {}
    if (!f.name.trim()) n.name = 'Please enter your name.'
    if (!f.email.trim()) n.email = 'Email is required.'; else if (!EMAIL_RE.test(f.email)) n.email = 'Enter a valid email address.'
    if (!services.some((service) => service.name === f.service)) n.service = 'Choose an active service.'
    if (!f.message.trim()) n.message = 'Please add a message.'
    setErrors(n)
    if (Object.keys(n).length) return
    setSubmitError('')
    try { createInquiry(f); setStatus('done') } catch (error) { setSubmitError(error.message || 'Your inquiry could not be saved.'); setStatus('error') }
  }
  return (<>
    <Banner k="event" title="Let's Talk About Your Project." sub="Tell us what you have in mind." />
    <section className="mx-auto grid max-w-5xl gap-10 px-5 py-14 md:grid-cols-3 md:px-10">
      {(servicesError || settingsError) && <p role="alert" className="border border-red-800/30 bg-red-50 p-3 text-sm text-red-900 md:col-span-3">{servicesError || settingsError}</p>}
      <div><h2 className="mb-4 font-serif text-2xl">Get in Touch</h2><p className="text-sm text-muted">{settings.contactEmail || SITE.email}</p><p className="mt-2 text-sm text-muted">{settings.location || SITE.location}</p></div>
      <form className="space-y-4 md:col-span-2" onSubmit={onSubmit} noValidate>
        {status === 'done' && <p role="status" className="border border-gold bg-cream p-4 text-sm">Demo only: your inquiry is saved in this browser and was not emailed or sent to a server.</p>}
        {status === 'error' && <p role="alert" className="border border-red-700 p-4 text-sm text-red-700">{submitError}</p>}
        <Field id="name" label="Full Name" error={errors.name}><input id="name" className={inputCls} value={f.name} onChange={set('name')} aria-invalid={!!errors.name} required /></Field>
        <Field id="email" label="Email Address" error={errors.email}><input id="email" type="email" className={inputCls} value={f.email} onChange={set('email')} aria-invalid={!!errors.email} required /></Field>
        <Field id="phone" label="Phone Number (optional)"><input id="phone" type="tel" className={inputCls} value={f.phone} onChange={set('phone')} /></Field>
        <Field id="service" label="Service Type" error={errors.service}><select id="service" className={inputCls} value={f.service} onChange={set('service')}><option value="">Select a service</option>{services.map((s) => <option key={s.id}>{s.name}</option>)}</select></Field>
        <Field id="date" label="Preferred Date (optional)"><input id="date" type="date" className={inputCls} value={f.date} onChange={set('date')} /></Field>
        <Field id="message" label="Message" error={errors.message}><textarea id="message" rows="5" className={inputCls} value={f.message} onChange={set('message')} required /></Field>
        <button type="submit" className="bg-gold px-8 py-3 text-xs uppercase tracking-widest text-rich hover:bg-beige">Save Inquiry</button>
      </form></section>
  </>)
}
