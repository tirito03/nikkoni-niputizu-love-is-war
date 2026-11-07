import { Sparkles } from 'lucide-react'
import { useMemePopup } from './MemePopup'
import { passiveQuotes, personalityQuotes } from './catalog'

export function CharacterCard() {
  const { openPool } = useMemePopup()
  return <article className="glass character-card character-interactive">
    <button type="button" className="character-main" aria-label="Фембой-стратег — відкрити секретні дані" aria-haspopup="dialog" onClick={()=>openPool({context:'other-stat',key:'personality',title:'ОСОБИСТА СПРАВА ДЕНИСА',theme:'rpg',quotes:personalityQuotes})}>
      <div className="character-symbol">♡<span>LVL 18</span></div><h3>Фембой-стратег</h3><p>Клас: романтик далекої дії</p><div className="character-meta"><span>Стихія <b>Аніме</b></span><span>Рідкість <b className="pink">Легендарний ✦</b></span></div>
    </button>
    <button type="button" className="character-perk character-perk-button" aria-haspopup="dialog" onClick={()=>openPool({context:'other-stat',key:'passive',title:'ПАСИВНА ЗДІБНІСТЬ АКТИВОВАНА',theme:'anime',quotes:passiveQuotes})}><Sparkles size={18}/><span>Пасивна здібність<br/><b>«Лист від Віолети: броня −100»</b></span></button>
  </article>
}
