import { Crosshair, FileLock2 } from 'lucide-react'
import { useMemePopup } from './MemePopup'
import { statPools, warThunderQuotes } from './catalog'

export function GameMemeButton({ game }: { game:'war'|'hoi4' }) {
  const {openPool}=useMemePopup()
  const Icon=game==='war'?Crosshair:FileLock2
  return <button type="button" className="game-meme-button" aria-haspopup="dialog" onClick={()=>openPool({key:`career:${game}`,title:game==='war'?'WAR THUNDER / БОЙОВИЙ МЕМ':'HOI4 / ТАЄМНИЙ ПРОТОКОЛ',theme:game,quotes:game==='war'?warThunderQuotes:[...statPools[0].quotes,...statPools[4].quotes]})}><Icon size={15}/>{game==='war'?'Перехопити бойовий мем':'Розсекретити протокол HOI4'}</button>
}
