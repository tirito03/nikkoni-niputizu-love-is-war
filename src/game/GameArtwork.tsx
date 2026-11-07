import { useId } from 'react'
import images from '../data/images.json'
import { SiteImage } from '../SiteImage'
import type { Art } from './story'
import { SnailArt } from '../snail/SnailArt'

export function GameArtwork({ art }: { art: Art }) {
  const gradient = useId().replaceAll(':', '')
  if (art === 'snail') return <SnailArt/>
  const existing = images.scenes.find(scene => scene.id === art)
  if (existing) return <SiteImage src={existing.src} alt={existing.alt} width={existing.width} height={existing.height} decoding="async"/>
  const titles = { strategy: 'Стилізована стратегічна мапа кооперативної кампанії', anime: 'Стилізована полиця манґи, лист і зіркові лайтстіки', letter: 'Лист із сердечком — початок справжньої історії Nikkoni Niputizu' }
  return <svg viewBox="0 0 1000 563" role="img" aria-label={titles[art as keyof typeof titles]} xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id={gradient}><stop stopColor={art === 'letter' ? '#713054' : '#4a306d'}/><stop offset="1" stopColor="#171020"/></radialGradient></defs>
    <path fill={`url(#${gradient})`} d="M0 0h1000v563H0z"/>
    <g fill="none" stroke="#e6a2d0" opacity=".12"><circle cx="500" cy="280" r="225"/><circle cx="500" cy="280" r="195"/><path d="M0 140h1000M0 280h1000M0 420h1000M250 0v563M500 0v563M750 0v563"/></g>
    {art === 'strategy' && <g><path d="M300 140l80-30 50 60 60-35 110 40 80 100-50 58-20 108-100-33-50 29-80-78-100-35 40-85z" fill="#b386d129" stroke="#c59fdf" strokeWidth="2"/>
      <path d="M385 210l195 30-50 110-145-140m195 30 45 70" stroke="#eea3d3" strokeWidth="3" strokeDasharray="10 9" fill="none"/>
      {[ [385,210], [580,240], [530,350], [625,310] ].map(([x,y]) => <g key={x}><circle cx={x} cy={y} r="13" fill="#e8a8d5"/><circle cx={x} cy={y} r="25" fill="none" stroke="#e8a8d5" opacity=".5"/></g>)}
      <text x="500" y="485" textAnchor="middle" fill="#e7c1eb" fontSize="19" letterSpacing="6">CO-OP CAMPAIGN / HOI4</text></g>}
    {art === 'anime' && <g><path d="M195 375h610v16H195z" fill="#a571a6"/>{[0,1,2,3,4,5].map(i => <g key={i}><rect x={235+i*50} y={205+(i%2)*18} width="36" height={170-(i%2)*18} rx="4" fill={['#9c76ac','#bd87a6','#7466a0'][i%3]}/><path d={`M${245+i*50} 240h16m-16 100h16`} stroke="#eac4dd" opacity=".6"/></g>)}<path d="M590 230h140v95H590z" fill="#d9b6d2"/><path d="M590 230l70 55 70-55" fill="none" stroke="#85547c" strokeWidth="3"/><path d="M690 130l13 33 35 3-26 24 7 35-29-18-29 18 7-35-26-24 35-3z" fill="#efabd5"/><path d="M655 375l-12-37m69 37 11-37" stroke="#e5b3e2" strokeWidth="10" strokeLinecap="round"/><text x="500" y="470" textAnchor="middle" fill="#e7c1eb" fontSize="19" letterSpacing="5">REI · VIOLET · AI / OSHI NO KO</text></g>}
    {art === 'letter' && <g><path d="M295 205l205-85 205 85v200H295z" fill="#d69bc3" stroke="#fac9e5" strokeWidth="2"/><path d="M335 150h330v210H335z" fill="#f0d0df"/><path d="M385 190h225m-225 30h185m-185 30h210" stroke="#b17b9e" strokeWidth="4" strokeLinecap="round" opacity=".6"/><path d="M295 205l205 150 205-150v200H295z" fill="#bd7aa9"/><path d="M295 405l155-120m255 120L550 285" fill="none" stroke="#efb8d7" strokeWidth="2"/><path d="M500 355c-65-42-50-76-24-64 17-33 70-17 24 64" fill="#fbc2dc"/><text x="500" y="480" textAnchor="middle" fill="#f5c5e2" fontSize="21" letterSpacing="6">NIKKONI NIPUTIZU / TRUE LOVE</text><g fill="#f3c4df"><path d="M230 150l5 15 15 5-15 5-5 15-5-15-15-5 15-5z"/><path d="M770 340l5 15 15 5-15 5-5 15-5-15-15-5 15-5z"/></g></g>}
  </svg>
}
