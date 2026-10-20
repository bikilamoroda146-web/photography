import { Banner, Button, Ph } from '../components/ui'
import { usePublicServices, usePublicSettings } from '../hooks/usePublicData'
export default function Services() {
  const { services, error: servicesError } = usePublicServices()
  const { settings, error: settingsError } = usePublicSettings()
  return (<>
    <Banner k="studio" title="Our Services" sub="Professional photography and digital services for your personal and business needs." />
    {settingsError && <p role="alert" className="border-b border-red-800/30 bg-red-50 px-5 py-3 text-center text-sm text-red-900">{settingsError}</p>}
    {servicesError ? <p role="alert" className="mx-auto max-w-3xl px-5 py-16 text-center text-sm text-red-900">{servicesError}</p>
      : !settings.showServices ? <p className="mx-auto max-w-3xl px-5 py-16 text-center text-muted">Services are not currently displayed.</p>
        : services.length ? services.map((s, i) => (
      <section key={s.name} className={i % 2 ? 'bg-char text-ivory' : ''}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-10">
          <div className={`aspect-[4/3] overflow-hidden ${i % 2 ? 'md:order-2' : ''}`}><Ph k={s.k} img={s.img} label={`${s.name}: ${s.text}`} /></div>
          <div><h2 className="font-serif text-3xl md:text-4xl">{s.name}</h2><p className={`mt-4 ${i % 2 ? 'text-beige' : 'text-muted'}`}>{s.text}</p>
            <div className="mt-6"><Button to={`/contact?service=${encodeURIComponent(s.name)}`}>Inquire</Button></div></div>
        </div></section>
        )) : <p className="mx-auto max-w-3xl px-5 py-16 text-center text-muted">There are no active services to display right now.</p>}
  </>)
}
