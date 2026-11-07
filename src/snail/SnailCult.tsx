import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { SnailArt } from './SnailArt'
import { prayerCategoryNames, prayerMessages } from './memes'
import { secretSnailIntro, secretSnailResult } from '../data/quotes'
import { useMemePopup } from '../humor/MemePopup'
import { rollPrayer } from './prayer'
import { TurmsDrop } from './TurmsDrop'
import { RpuIndicator, SoundToggle, useSnailEffects } from './SnailEffects'

export function SnailCult() {
  const [prayerId, setPrayerId] = useState(0)
  const previousPrayer = useRef(-1)
  const [busy, setBusy] = useState(false)
  const reduced = useReducedMotion()
  const [dropId, setDropId] = useState<number|null>(null)
  const resultFocus = useRef<HTMLDivElement>(null)
  const locked = useRef(false)
  const sequence = useRef(0)
  const handoffTimer = useRef<number | undefined>(undefined)
  const { playNotification } = useSnailEffects()
  const { showResult, close:closePopup } = useMemePopup()
  useEffect(()=>()=>window.clearTimeout(handoffTimer.current),[])
  const pray = () => {
    if (locked.current) return
    locked.current = true
    const id = ++sequence.current
    const outcome = rollPrayer(previousPrayer.current)
    setPrayerId(id)
    setBusy(true)
    if (outcome.kind === 'turms') {
      closePopup()
      setDropId(id); playNotification()
    } else if(outcome.kind==='snail-secret'){
      setDropId(null)
      showResult({context:'prayer',theme:'snail',title:'СЕКРЕТНА РЕАКЦІЯ РАВЛИКА · 3%',quote:secretSnailIntro,followUp:secretSnailResult,revealDelayMs:1500,category:'РПУ / ВИГАДАНА СИСТЕМА',tone:'curse',actionLabel:'Прийняти свою долю',returnFocus:resultFocus.current})
    } else {
      previousPrayer.current=outcome.index
      const message=prayerMessages[outcome.index]
      setDropId(null)
      showResult({context:'prayer',theme:'snail',title:'ВІДПОВІДЬ СВЯТОГО РАВЛИКА',quote:message,category:prayerCategoryNames[message.category],tone:message.category,buttonLabel:'Помолитися ще раз',onMore:pray,cooldownMs:reduced?250:1100,returnFocus:resultFocus.current})
    }
  }
  const closeDrop = () => { setDropId(null); setBusy(false); locked.current=false }
  const afterDrop = (next:()=>void) => {
    closeDrop()
    // Let the retained TURMS exit finish before another modal can appear.
    locked.current=true
    const finish=()=>{
      if(document.querySelector('.turms-overlay')){handoffTimer.current=window.setTimeout(finish,50);return}
      locked.current=false;next()
    }
    handoffTimer.current=window.setTimeout(finish,reduced?0:180)
  }
  const acceptDrop = () => afterDrop(()=>showResult({context:'prayer',theme:'snail',title:'ДАР РАВЛИКА ПРИЙНЯТО',quote:{sound:'achievement',effect:'legendary',category:'legendary',quote:'Дар Равлика прийнято: TURMS у твоєму уявному ангарі.',comment:'Жодних грошей чи справжньої техніки не переміщено.'},category:'ЛЕГЕНДАРНИЙ МЕМНИЙ ДРОП',tone:'legendary',buttonLabel:'Помолитися ще раз',onMore:pray,returnFocus:resultFocus.current}))
  const prayAgain = () => afterDrop(pray)
  useEffect(() => {
    if (!busy || dropId !== null) return
    const timer = window.setTimeout(() => { setBusy(false); locked.current=false }, reduced ? 250 : 1100)
    return () => window.clearTimeout(timer)
  }, [busy,reduced,dropId])
  return <><section className="shell section snail-cult" id="snail" aria-labelledby="snail-heading"><div className="section-heading"><div><div className="section-label">WAR THUNDER / СВЯЩЕННИЙ ВІДДІЛ ГРИНДУ</div><h2 id="snail-heading">Культ <span>Святого Равлика</span></h2></div><span className="snail-community-label">НЕОФІЦІЙНИЙ МЕМНИЙ ВІВТАР</span></div><p className="section-intro">Равлик — мемний символ Gaijin Entertainment. Денис прийшов за благословенням на пробиття, а отримав підписку на «ще один бій».</p>
    <div className="snail-layout"><div className="snail-altar glass"><div className={`altar-art${busy && !reduced ? ' altar-blessing' : ''}`}><SnailArt/>{!reduced && busy && <div className="blessing-particles" key={prayerId} aria-hidden="true">{Array.from({length:12},(_,i)=><motion.span key={i} initial={{opacity:0,x:0,y:0,scale:.4}} animate={{opacity:[0,1,0],x:Math.cos(i*Math.PI/6)*135,y:-55-Math.sin(i*Math.PI/6)*100,scale:[.4,1,.2]}} transition={{duration:1,delay:i*.015}}>✦</motion.span>)}</div>}</div><div className="altar-content"><span className="favorite-role">IN SNAIL WE GRIND</span><h3>Пожертвуй хвилину. Отримай вічність.</h3><button className="button altar-pray" disabled={busy} onClick={pray}><Sparkles size={18}/>{busy ? 'Равлик читає звернення…' : 'Помолитися Равлику'}</button><div className="prayer-result prayer-idle" ref={resultFocus} tabIndex={-1}><p>Золота мушля чекає. Донат не потрібен — тут навіть благословення вигадані.</p></div><p className="snail-disclaimer">Усі «бонуси», відмови й знижки — лише жарти. Немає платежів, донату чи реального впливу на War Thunder.</p></div></div><aside className="snail-sidebar"><RpuIndicator/><div className="glass grass-card"><span aria-hidden="true">♧</span><h3>Торкнутися трави?</h3><p>Денис боїться торкнутися трави: раптом це новий тип броні, а в нього немає таблиці пробиття?</p><p>План побачення: спочатку тротуар. Газон — після навчального бою.</p><span className="grass-tag">ТРАВА: 100% · ВІДВАГА: 3%</span></div><SoundToggle/></aside></div>
  </section><TurmsDrop eventId={dropId} onClose={closeDrop} onAccept={acceptDrop} onPrayAgain={prayAgain} fallbackFocus={resultFocus}/></>
}
