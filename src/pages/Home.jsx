import { Link } from 'react-router-dom'
import { Banner, Button, Gallery, Label, Ph } from '../components/ui'
import { usePublicProjects, usePublicServices, usePublicSettings } from '../hooks/usePublicData'
export default function Home() {
  const { projects, error: projectError, loading: projectsLoading } = usePublicProjects()
  const { services, error: servicesError } = usePublicServices()
  const { settings, error: settingsError } = usePublicSettings()
  return (<>
    {settingsError && <p role="alert" className="border-b border-red-800/30 bg-red-50 px-5 py-3 text-center text-sm text-red-900">{settingsError}</p>}
    <Banner tall k="studio" title="Every Frame Tells a Story." sub="Capturing meaningful moments, creating timeless imagery, and bringing creative ideas to life through photography and digital services." />
    {settings.showPortfolio && <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
      <div className="mb-10 flex items-end justify-between"><div><Label>Featured Portfolio</Label><h2 className="font-serif text-3xl md:text-4xl">Real moments. Authentic stories.</h2></div>
        <Link to="/portfolio" className="text-xs uppercase tracking-widest hover:text-gold">View All Projects →</Link></div>
      {projectError ? <p role="alert" className="border border-red-800/30 bg-red-50 p-4 text-sm text-red-900">{projectError}</p>
        : projectsLoading ? <p role="status" className="border border-beige bg-cream/50 p-6 text-sm text-muted">Loading featured photographs…</p>
          : <Gallery items={projects.slice(0, 4)} onOpen={() => {}} />}
    </section>}
    {settings.showServices && <section className="bg-char py-20 text-ivory"><div className="mx-auto max-w-7xl px-5 md:px-10">
      <Label>Services</Label><h2 className="mb-10 font-serif text-3xl md:text-4xl">More than just photos.</h2>
      {servicesError ? <p role="alert" className="border border-red-200 p-4 text-sm text-red-100">{servicesError}</p> : <div className="grid gap-px bg-white/10 md:grid-cols-4">{services.map((s) => (
        <Link key={s.name} to={`/contact?service=${encodeURIComponent(s.name)}`} className="grp block bg-char">
          <div className="aspect-[4/3] overflow-hidden"><Ph k={s.k} img={s.img} label={`${s.name}: ${s.text}`} /></div>
          <div className="p-5"><h3 className="font-serif text-xl">{s.name}</h3><p className="mt-1 text-sm text-beige/80">{s.text}</p><span className="mt-3 inline-block text-xs uppercase tracking-widest text-gold">Learn More →</span></div>
        </Link>))}</div>}</div></section>
    }
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:px-10">
      <div className="aspect-[4/3] overflow-hidden"><Ph k="studio" label="Photographer holding a camera" /></div>
      <div><Label>Our Studio</Label><h2 className="font-serif text-3xl md:text-4xl">A Creative Space for Real Stories.</h2>
        <p className="mt-4 text-muted">{settings.description || "Replace this text with your studio's own introduction. Sami Photography is built around visual storytelling for individuals and brands."}</p>
        <div className="mt-6"><Button to="/about">Discover Our Story</Button></div></div></section>
    <section className="bg-cream py-20"><div className="mx-auto max-w-7xl px-5 md:px-10"><h2 className="mb-10 font-serif text-3xl">How It Works</h2>
      <div className="grid gap-8 md:grid-cols-3">{['Choose Your Service', 'Select Your Preferred Date', 'Send Your Inquiry'].map((t, i) => (
        <div key={t} className="border-t border-gold pt-4"><span className="font-serif text-2xl text-gold">0{i + 1}</span><p className="mt-1 font-serif text-xl">{t}</p></div>))}</div>
      <p className="mt-6 text-sm text-muted">Sending an inquiry does not confirm a booking.</p></div></section>
    <section className="relative overflow-hidden py-24 text-center text-ivory"><div className="absolute inset-0"><Ph k="event" label="People gathered beside a fountain" /></div><div className="absolute inset-0 bg-rich/60" />
      <div className="relative px-5"><h2 className="font-serif text-3xl md:text-5xl">Let's Create Something Beautiful Together.</h2>
        <p className="mx-auto mt-4 max-w-md text-beige">Have a photography session or creative project in mind? Get in touch to discuss your ideas.</p><div className="mt-8"><Button to="/contact">Contact Us</Button></div></div></section>
  </>)
}
