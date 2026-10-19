import { Banner, Button, Label, Ph } from '../components/ui'
export default function About() {
  return (<>
    <Banner k="landscape" title="About Sami Photography." sub="A passion for photography. A commitment to you." />
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:px-10">
      <div className="aspect-[3/4] max-h-[520px] overflow-hidden"><Ph k="portrait" label="Photographer placeholder" /></div>
      <div><Label>Our Story</Label><h2 className="font-serif text-3xl md:text-4xl">Turning Moments Into Lasting Memories</h2>
        <p className="mt-4 text-muted">Placeholder copy: describe your studio, your creative philosophy and what clients can expect. Replace with your own words.</p>
        <ul className="mt-6 space-y-2 text-sm">{['Creativity', 'Professionalism', 'Authenticity', 'Client Focus'].map((v) => <li key={v}><span className="text-gold">✓</span> {v}</li>)}</ul></div></section>
    <section className="bg-cream px-5 py-16 text-center"><h2 className="mb-6 font-serif text-3xl">Ready to talk about your project?</h2><Button to="/contact">Contact Us</Button></section>
  </>)
}
