import { useState } from 'react'
export default function useStored(key, initial) {
  const [v, setV] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) ?? initial } catch { return initial } })
  const set = (n) => { setV(n); try { localStorage.setItem(key, JSON.stringify(n)) } catch {} }
  return [v, set]
}
