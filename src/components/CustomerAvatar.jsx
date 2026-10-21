import { useEffect, useState } from 'react'
import { useCustomerAvatar } from '../hooks/useCustomerAvatar'

export default function CustomerAvatar({ email, name, className = '', imageSrc }) {
  const avatar = useCustomerAvatar(email)
  const src = imageSrc === undefined ? avatar.src : imageSrc
  const [broken, setBroken] = useState(false)
  useEffect(() => setBroken(false), [src])
  return src && !broken
    ? <img src={src} alt={`${name || 'Customer'} profile`} onError={() => setBroken(true)} className={`rounded-full border border-gold/50 object-cover ${className}`} />
    : <span aria-hidden="true" className={`grid place-items-center rounded-full border border-gold/50 bg-white/5 font-serif text-gold ${className}`}>{(name || 'Customer').charAt(0).toUpperCase()}</span>
}
