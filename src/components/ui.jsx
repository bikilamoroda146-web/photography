import { Link } from 'react-router-dom'
import { useState } from 'react'
import { G, LOCAL_IMAGES } from '../data/data'
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const inputCls = 'w-full border border-beige bg-ivory px-3 py-3 text-sm focus:border-gold'
export const Ph = ({ k, label, img, priority = false, position }) => {
  const [brokenSrc, setBrokenSrc] = useState('')
  const src = img || LOCAL_IMAGES[k]
  return <div role="img" aria-label={label} className="ph relative h-full w-full overflow-hidden" style={{ background: G[k] || G.studio }}>
    {src && brokenSrc !== src && <img src={src} alt="" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" className="absolute inset-0 h-full w-full object-cover" style={position ? { objectPosition: position } : undefined} onError={() => setBrokenSrc(src)} />}
  </div>
}
export const Button = ({ to, solid = true, children }) => (
  <Link to={to} className={`inline-block px-6 py-3 text-xs uppercase tracking-widest transition ${solid ? 'bg-gold text-rich hover:bg-beige' : 'border border-ivory/50 text-ivory hover:border-gold hover:text-gold'}`}>{children}</Link>)
export const Label = ({ children }) => <p className="mb-3 text-[11px] uppercase tracking-[.25em] text-gold">{children}</p>
export const Field = ({ id, label, error, children }) => (
  <div><label htmlFor={id} className="mb-1 block text-xs uppercase tracking-widest">{label}</label>{children}
    {error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}</div>)
export const Banner = ({ k, title, sub, tall }) => (
  <section className={`relative flex items-end overflow-hidden text-ivory ${tall ? 'min-h-[88vh]' : 'min-h-[44vh]'}`}>
    <div className="absolute inset-0"><Ph k={k} label={`${title} banner`} priority position={k === 'event' ? '50% 62%' : '50% 30%'} /></div>
    <div className="absolute inset-0 bg-gradient-to-t from-rich/80 via-rich/30 to-rich/50" />
    <div className="fade relative mx-auto w-full max-w-7xl px-5 pb-14 pt-32 md:px-10">
      {tall && <Label>SAMI PHOTOGRAPHY & DIGITAL SERVICES</Label>}
      <h1 className={`font-serif leading-[1.05] ${tall ? 'max-w-2xl text-5xl md:text-7xl' : 'text-4xl md:text-6xl'}`}>{title}</h1>
      <p className="mt-4 max-w-lg text-beige">{sub}</p>
      {tall && <div className="mt-8 flex flex-wrap gap-3"><Button to="/portfolio">Explore Portfolio</Button><Button to="/contact" solid={false}>Book a Session</Button></div>}
    </div></section>)
export function Gallery({ items, onOpen }) {
  if (!items.length) return <p className="py-20 text-center text-muted">No projects in this category yet.</p>
  return (<div className="columns-2 gap-3 md:columns-3 md:gap-4">{items.map((p) => (
    <button type="button" key={p.id} onClick={() => onOpen(p.id)} className="grp fade mb-3 block w-full break-inside-avoid text-left md:mb-4">
      <div className={`overflow-hidden ${p.ratio}`}><Ph k={p.k} img={p.img} label={`${p.title}: ${p.desc}`} /></div>
      <span className="mt-2 block text-[10px] uppercase tracking-widest text-gold">{p.cat}</span><span className="font-serif">{p.title}</span>
    </button>))}</div>)
}
