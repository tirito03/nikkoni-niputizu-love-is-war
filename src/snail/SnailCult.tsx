import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { SnailArt } from './SnailArt'
import { prayers } from './memes'
import { rollPrayer } from './prayer'
import { TurmsDrop } from './TurmsDrop'
import { RpuIndicator, SoundToggle, useSnailEffects } from './SnailEffects'

export function SnailCult() {
  const [prayer, setPrayer] = useState<{index:number;id:number;text:string|null}>({index:-1,id:0,text:null})
  const [busy, setBusy] = useState(false)
  const reduced = useReducedMotion()
  const [dropId, setDropId] = useState<number|null>(null)
  const resultFocus = useRef<HTMLDivElement>(null)
  const locked = useRef(false)
  const sequence = useRef(0)
  const { playNotification } = useSnailEffects()
  const pray = () => {
    if (locked.current) return
    locked.current = true
    const id = ++sequence.current
    const outcome = rollPrayer(prayer.index)
    setBusy(true)
    if (outcome.kind === 'turms') {
      setPrayer(previous=>({...previous,id,text:'Тобі випав TURMS! Святий Равлик поповнив твій уявний ангар. Це лише жарт.'}))
      setDropId(id); playNotification()
    } else {
      setPrayer({index:outcome.index,id,text:null}); setDropId(null)
    }
  }
  const closeDrop = () => { setDropId(null); setBusy(false); locked.current=false }
  const acceptDrop = () => {
    setPrayer(previous=>({...previous,text:'Дар Равлика прийнято: TURMS у твоєму уявному ангарі. Жодних грошей чи справжньої техніки не переміщено.'}))
    closeDrop()
  }
  const prayAgain = () => { locked.current=false; setDropId(null); pray() }
  useEffect(() => {
    if (!busy || dropId !== null) return
    const timer = window.setTimeout(() => { setBusy(false); locked.current=false }, reduced ? 250 : 1100)
    return () => window.clearTimeout(timer)
  }, [busy,reduced,dropId])
  return <><section className="shell section snail-cult" id="snail" aria-labelledby="snail-heading"><div className="section-heading"><div><div className="section-label">WAR THUNDER / СВЯЩЕННИЙ ВІДДІЛ ГРИНДУ</div><h2 id="snail-heading">Культ <span>Святого Равлика</span></h2></div><span className="snail-community-label">НЕОФІЦІЙНИЙ МЕМНИЙ ВІВТАР</span></div><p className="section-intro">Равлик — мемний символ Gaijin Entertainment. Денис прийшов за благословенням на пробиття, а отримав підписку на «ще один бій».</p>
    <div className="snail-layout"><div className="snail-altar glass"><div className={`altar-art${busy && !reduced ? ' altar-blessing' : ''}`}><SnailArt/>{!reduced && busy && <div className="blessing-particles" key={prayer.id} aria-hidden="true">{Array.from({length:12},(_,i)=><motion.span key={i} initial={{opacity:0,x:0,y:0,scale:.4}} animate={{opacity:[0,1,0],x:Math.cos(i*Math.PI/6)*135,y:-55-Math.sin(i*Math.PI/6)*100,scale:[.4,1,.2]}} transition={{duration:1,delay:i*.015}}>✦</motion.span>)}</div>}</div><div className="altar-content"><span className="favorite-role">IN SNAIL WE GRIND</span><h3>Пожертвуй хвилину. Отримай вічність.</h3><button className="button altar-pray" disabled={busy} onClick={pray}><Sparkles size={18}/>{busy ? 'Равлик читає звернення…' : 'Помолитися Равлику'}</button><div className="prayer-result" ref={resultFocus} tabIndex={-1} role="status" aria-live="polite" aria-atomic="true"><AnimatePresence mode="wait" initial={false}><motion.p key={prayer.id} initial={{opacity:reduced ? 1 : 0,y:reduced ? 0 : 5}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:reduced ? 0 : .18}}>{prayer.text ?? (prayer.index < 0 ? 'Золота мушля чекає. Донат не потрібен — тут навіть благословення вигадані.' : prayers[prayer.index])}</motion.p></AnimatePresence></div><p className="snail-disclaimer">Усі «бонуси», відмови й знижки — лише жарти. Немає платежів, донату чи реального впливу на War Thunder.</p></div></div><aside className="snail-sidebar"><RpuIndicator/><div className="glass grass-card"><span aria-hidden="true">♧</span><h3>Торкнутися трави?</h3><p>Денис боїться торкнутися трави: раптом це новий тип броні, а в нього немає таблиці пробиття?</p><p>План побачення: спочатку тротуар. Газон — після навчального бою.</p><span className="grass-tag">ТРАВА: 100% · ВІДВАГА: 3%</span></div><SoundToggle/></aside></div>
  </section><TurmsDrop eventId={dropId} onClose={closeDrop} onAccept={acceptDrop} onPrayAgain={prayAgain} fallbackFocus={resultFocus}/></>
}
