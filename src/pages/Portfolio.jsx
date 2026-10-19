import { useEffect, useState } from 'react'
import { Banner, Gallery, Ph } from '../components/ui'
import { usePublicProjects, usePublicSettings } from '../hooks/usePublicData'
import { PORTFOLIO_CATEGORIES } from '../services/portfolioService'
export default function Portfolio() {
  const [cat, setCat] = useState('All')
  const [openId, setOpenId] = useState(null)
  const { projects, error } = usePublicProjects()
  const { settings, error: settingsError } = usePublicSettings()
  const items = projects.filter((p) => cat === 'All' || p.cat === cat)
  const idx = items.findIndex((p) => p.id === openId)
  const cur = items[idx]
  const step = (d) => setOpenId(items[(idx + d + items.length) % items.length].id)
  useEffect(() => {
    if (openId == null) return
    const onKey = (e) => { if (e.key === 'Escape') setOpenId(null); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  return (<>
    <Banner k="landscape" title="Our Portfolio" sub="A collection of moments, places and stories." />
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-10">
      {(settingsError || error) && <p role="alert" className="mb-5 border border-red-800/30 bg-red-50 p-3 text-sm text-red-900">{settingsError || error}</p>}
      {!settings.showPortfolio ? <p className="py-10 text-center text-muted">The portfolio is not currently displayed.</p> : <>
      <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter by category">{['All', ...PORTFOLIO_CATEGORIES].map((c) => (
        <button type="button" key={c} aria-pressed={cat === c} onClick={() => setCat(c)} className={`border px-4 py-2 text-xs uppercase tracking-widest transition ${cat === c ? 'border-char bg-char text-ivory' : 'border-beige hover:border-gold'}`}>{c}</button>))}</div>
      <Gallery key={cat} items={items} onOpen={setOpenId} />
      </>}
    </section>
    {cur && <div role="dialog" aria-modal="true" aria-label={cur.title} className="fade fixed inset-0 z-50 flex flex-col items-center justify-center bg-rich/95 p-4">
      <button type="button" autoFocus aria-label="Close" onClick={() => setOpenId(null)} className="absolute right-4 top-4 p-2 text-3xl text-ivory">✕</button>
      <div className="aspect-[4/3] max-h-[65vh] w-full max-w-xl overflow-hidden"><Ph k={cur.k} img={cur.img} label={cur.title} /></div>
      <div className="mt-5 text-center text-ivory"><p className="text-[10px] uppercase tracking-widest text-gold">{cur.cat}</p><p className="font-serif text-2xl">{cur.title}</p><p className="text-sm text-beige">{cur.desc}</p></div>
      <div className="mt-5 flex gap-4">{[['‹ Prev', -1], ['Next ›', 1]].map(([l, d]) => <button type="button" key={l} onClick={() => step(d)} className="border border-white/30 px-5 py-3 text-xs uppercase tracking-widest text-ivory">{l}</button>)}</div>
    </div>}
  </>)
}
