import { useId } from 'react'

export function SnailArt() {
  const id = useId().replaceAll(':', '')
  return <svg viewBox="0 0 1000 563" role="img" aria-label="Стилізований золотий вівтар Святого Равлика" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id={`${id}halo`}><stop stopColor="#93651b"/><stop offset=".65" stopColor="#322017"/><stop offset="1" stopColor="#140d1c"/></radialGradient><linearGradient id={`${id}gold`} x2=".8" y2="1"><stop stopColor="#fff1b1"/><stop offset=".5" stopColor="#dfad4c"/><stop offset="1" stopColor="#896024"/></linearGradient></defs>
    <path fill={`url(#${id}halo)`} d="M0 0h1000v563H0z"/>
    <g fill="none" stroke="#e8c66b"><circle cx="500" cy="245" r="175" opacity=".25"/><circle cx="500" cy="245" r="190" opacity=".1"/>{Array.from({length:12},(_,i)=><path key={i} d="M500 30v25" transform={`rotate(${i*30} 500 245)`} opacity=".5"/>)}</g>
    <g fill={`url(#${id}gold)`}><path d="M220 430h560v22H220zM255 452h490v22H255zM290 474h420v20H290z"/><path d="M280 220h27v210h-27zM693 220h27v210h-27z" opacity=".45"/><path d="M270 205h47v15h-47zM683 205h47v15h-47z"/><path d="M257 395h12v35h-12zM731 395h12v35h-12z"/><path d="M263 360c-15 20-15 30 0 32 15-2 15-12 0-32m474 0c-15 20-15 30 0 32 15-2 15-12 0-32"/></g>
    <path d="M370 362c25-23 64-35 130-35h74c8-48 39-64 65-43 20 16 11 58-9 77l49 22H366z" fill={`url(#${id}gold)`} stroke="#ffe9a2" strokeWidth="3"/>
    <circle cx="482" cy="267" r="92" fill={`url(#${id}gold)`} stroke="#ffedaa" strokeWidth="4"/><path d="M490 274c32 18 54-15 43-42-15-37-72-30-86 6-20 52 37 86 75 58 39-29 22-94-29-104" fill="none" stroke="#76511e" strokeWidth="10" strokeLinecap="round"/>
    <path d="M610 282l-8-47m34 52 15-47" stroke="#f1d47f" strokeWidth="9" strokeLinecap="round"/><circle cx="601" cy="229" r="11" fill="#fff0a1"/><circle cx="653" cy="235" r="11" fill="#fff0a1"/><path d="M603 320c8 9 21 11 31 3" fill="none" stroke="#755022" strokeWidth="4" strokeLinecap="round"/>
    <g fill="#ffe9a1"><path d="M353 146l5 15 15 5-15 5-5 15-5-15-15-5 15-5zM690 130l4 12 12 4-12 4-4 12-4-12-12-4 12-4zM766 299l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/></g>
    <text x="500" y="530" fill="#d7bc7e" fontSize="12" textAnchor="middle" letterSpacing="6">SANCTUS SNAIL / GRIND IS ETERNAL</text>
  </svg>
}
