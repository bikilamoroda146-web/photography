// Replace gradients with real images: set `img` on a project/service and render it in <Ph/>.
export const G = {
  portrait:'linear-gradient(160deg,#5a3d2b,#1a1210)', landscape:'linear-gradient(180deg,#e0a060,#3a4a5a 60%,#10161c)',
  event:'linear-gradient(160deg,#3a4350,#15191e)', wedding:'linear-gradient(160deg,#6b7a52,#1c2216)',
  product:'linear-gradient(160deg,#8a5a2a,#1a110a)', studio:'linear-gradient(160deg,#4a4a4a,#0f1010)' }
export const PROJECTS = [
  { id:1, title:'Quiet Light', cat:'Portraits', k:'portrait', ratio:'aspect-[3/4]', desc:'Natural-light portrait session.' },
  { id:2, title:'Above the Ridge', cat:'Landscapes', k:'landscape', ratio:'aspect-[4/3]', desc:'Dawn over the highlands.' },
  { id:3, title:'City in Motion', cat:'Events', k:'event', ratio:'aspect-[3/5]', desc:'Street-level storytelling.' },
  { id:4, title:'Golden Hour', cat:'Weddings', k:'wedding', ratio:'aspect-square', desc:'A couple, a trail, last light.' },
  { id:5, title:'Still Life', cat:'Products', k:'product', ratio:'aspect-[4/3]', desc:'Product photography in warm tones.' },
  { id:6, title:'Edge of the Sea', cat:'Landscapes', k:'landscape', ratio:'aspect-[3/4]', desc:'Coastline at dusk.' } ]
export const SITE = { email:'hello@example.com (placeholder)', location:'Your city, country (placeholder)' }
export const NAV = [['/','Home'],['/portfolio','Portfolio'],['/services','Services'],['/about','About'],['/contact','Contact']]
