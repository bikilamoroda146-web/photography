import photographerImage from '../images/camera_man.jpg'
import eventImage from '../images/landscape.jpg'
import graphicDesignImage from '../images/graphic design.jpg'
import graphicArtworkImage from '../images/graphic.jpg'
import portraitImage from '../images/portrait.jpg'
import productImage from '../images/product.jpg'
import weddingImage from '../images/wedding.jpg'
import worshipEventImage from '../images/video_editing.jpg'

export const LOCAL_IMAGES = {
  studio: photographerImage,
  graphic: graphicArtworkImage,
  graphicDesigner: graphicDesignImage,
  event: eventImage,
  wedding: weddingImage,
  portrait: portraitImage,
  product: productImage,
  worship: worshipEventImage,
}

export const G = {
  portrait:'linear-gradient(160deg,#5a3d2b,#1a1210)', landscape:'linear-gradient(180deg,#e0a060,#3a4a5a 60%,#10161c)',
  event:'linear-gradient(160deg,#3a4350,#15191e)', wedding:'linear-gradient(160deg,#6b7a52,#1c2216)',
  product:'linear-gradient(160deg,#8a5a2a,#1a110a)', studio:'linear-gradient(160deg,#4a4a4a,#0f1010)' }
export const PROJECTS = [
  { id:1, title:'Portraits Together', cat:'Portraits', k:'portrait', ratio:'aspect-[3/4]', desc:'Two students pose together against a neutral backdrop.' },
  { id:2, title:'A Community Gathering', cat:'Events', k:'event', ratio:'aspect-[4/3]', desc:'A community gathers beside a fountain.' },
  { id:3, title:'Product Study', cat:'Products', k:'product', ratio:'aspect-square', desc:'Green headphones against a clean background.' },
  { id:4, title:'Photographer at Work', cat:'Other Projects', k:'studio', ratio:'aspect-[3/4]', desc:'A photographer holding a camera.' },
  { id:5, title:'Wedding Portrait', cat:'Weddings', k:'wedding', ratio:'aspect-[3/4]', desc:'A newlywed couple share a quiet moment.' },
  { id:6, title:'Worship Service', cat:'Events', k:'worship', ratio:'aspect-[4/3]', desc:'A worshipper raises her hands during a gathering.' },
  { id:7, title:'Graphic Design in Progress', cat:'Other Projects', k:'graphicDesigner', ratio:'aspect-[4/3]', desc:'A designer works at a desk with creative tools.' },
  { id:8, title:'Event Poster Design', cat:'Other Projects', k:'graphic', ratio:'aspect-[3/4]', desc:'A colorful event poster design.' },
]
export const SITE = { email:'hello@example.com (placeholder)', location:'Your city, country (placeholder)' }
export const NAV = [['/','Home'],['/portfolio','Portfolio'],['/services','Services'],['/about','About'],['/contact','Contact']]
