import { useEffect, useId, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, CreditCard, Gift, Sparkles, X } from 'lucide-react'
import { SiteImage } from '../SiteImage'
import images from '../data/images.json'
import { SoundToggle, useSnailEffects } from './SnailEffects'
import './turms-drop.css'

type Stage = 'charging' | 'charged' | 'reveal' | 'reward'
type Props = { eventId: number | null; onClose: () => void; onAccept: () => void; onPrayAgain: () => void; fallbackFocus: RefObject<HTMLDivElement | null> }

export function TurmsDrop({ eventId, onClose, onAccept, onPrayAgain, fallbackFocus }: Props) {
  const [stage, setStage] = useState<Stage>('charging')
  const dialog = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const callbacks = useRef({onClose,onAccept,onPrayAgain})
  callbacks.current = {onClose,onAccept,onPrayAgain}
  const titleId = useId(), descriptionId = useId()
  const reduced = useReducedMotion()
  const { playReward } = useSnailEffects()
  const rewardSound = useRef(playReward)
  rewardSound.current = playReward
  const opened = eventId !== null

  useEffect(() => { if (eventId !== null) setStage('charging') }, [eventId])
  useEffect(() => {
    if (!opened) return
    const previousOverflow = document.body.style.overflow
    opener.current = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus({preventScroll:true})
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); callbacks.current.onClose(); return }
      if (event.key !== 'Tab' || event.ctrlKey || event.metaKey || event.altKey) return
      const buttons = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
      const first = buttons[0], last = buttons[buttons.length-1]
      if (!buttons.includes(document.activeElement as HTMLButtonElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus() }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown',onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown',onKey)
      if (opener.current?.isConnected && !(opener.current as HTMLButtonElement).disabled) opener.current.focus({preventScroll:true})
      else fallbackFocus.current?.focus({preventScroll:true})
    }
  }, [opened,fallbackFocus])
  useEffect(() => {
    if (eventId === null) return
    if (stage === 'reveal') rewardSound.current()
    if (stage === 'reward') { closeButton.current?.focus({preventScroll:true}); return }
    const next: Record<Exclude<Stage,'reward'>, Stage> = {charging:'charged',charged:'reveal',reveal:'reward'}
    const duration = {charging:1200,charged:650,reveal:750}
    const timer = window.setTimeout(() => setStage(next[stage]), reduced ? 100 : duration[stage])
    return () => window.clearTimeout(timer)
  }, [eventId,stage,reduced])

  return createPortal(<AnimatePresence>{opened && <motion.div className="turms-overlay" initial={{opacity:reduced ? 1 : 0}} animate={{opacity:1}} exit={{opacity:0,pointerEvents:'none'}} transition={{duration:reduced ? 0 : .18}}>
    <motion.div className={`turms-panel turms-stage-${stage}`} ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} initial={{y:reduced ? 0 : 16}} animate={{y:0}} transition={{duration:reduced ? 0 : .25}}>
      <div className="turms-topbar"><span>SAINT SNAIL / ПАРОДІЙНИЙ ДРОП · 4%</span><button type="button" className="icon-button" aria-label="Закрити нагороду TURMS" ref={closeButton} onClick={onClose}><X size={18}/></button></div>
      <div className="turms-content">
        <span className="turms-parody">УСЕ ВИГАДАНО · ЖОДНИХ ПЛАТЕЖІВ</span>
        <h2 id={titleId}>{stage === 'reward' ? 'Тобі випав TURMS!' : stage === 'reveal' ? 'РАВЛИК ВІДКРИВАЄ ДАР' : 'СВЯЩЕННА БУХГАЛТЕРІЯ'}</h2>
        <AnimatePresence mode="wait" initial={false}><motion.div key={`${eventId}:${stage}`} initial={{opacity:reduced ? 1 : 0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced ? 0 : .12}}>
          {(stage === 'charging' || stage === 'charged') && <div className="turms-charge" role="status" aria-live="polite"><div className="turms-meme-card"><CreditCard size={34}/><span>SNAIL BANK · БАНК УЯВИ</span><strong>−800 🐌</strong><small>РАВЛИКОМОНЕТИ · НЕ СПРАВЖНІ ГРОШІ</small></div><p>{stage === 'charging' ? 'ВИКОНУЄТЬСЯ СВЯЩЕННЕ СПИСАННЯ КОШТІВ...' : 'ФЕЙКОВЕ СПИСАННЯ УСПІШНЕ'}</p>{stage === 'charged' ? <span className="turms-charge-done"><Check size={17}/> Списано лише уявні монетки. Справжній баланс не змінено.</span> : <div className="turms-charge-progress" aria-hidden="true"><span/></div>}</div>}
          {stage === 'reveal' && <div className="turms-reveal" role="status"><Gift size={72}/><p>ЛЕГЕНДАРНИЙ ДРОП</p>{!reduced && <><motion.div className="turms-flare" aria-hidden="true" initial={{opacity:0,scale:.6}} animate={{opacity:[0,.6,0],scale:[.6,1.15,1.3]}} transition={{duration:.7}}/><div className="turms-particles" aria-hidden="true">{Array.from({length:16},(_,i)=><motion.span key={i} initial={{x:0,y:0,opacity:0,scale:.3}} animate={{x:Math.cos(i*Math.PI/8)*140,y:Math.sin(i*Math.PI/8)*100,opacity:[0,1,0],scale:[.3,1,.3]}} transition={{duration:.7,delay:i*.004}}>✦</motion.span>)}</div></>}</div>}
          {stage === 'reward' && <div className="turms-reward"><p className="turms-subtitle">Святий Равлик прийняв твою жертву</p><div className="turms-tank"><SiteImage src={images.turms.src} width={images.turms.width} height={images.turms.height} alt="Танк TURMS — надане зображення жартівливої нагороди"/><span>LEGENDARY MEME DROP</span></div><div className="turms-reward-meta"><span>РІДКІСТЬ: ПАФОСНА</span><span>ЦІНА: УЯВНА</span></div><p className="turms-joke">Денис уже звільняє місце в уявному ангарі. Трава за вікном знову перемогла побачення.</p><div className="turms-actions"><button type="button" className="button turms-accept" onClick={onAccept}><Gift size={17}/> Прийняти дар Равлика</button><button type="button" className="button ghost" onClick={onPrayAgain}><Sparkles size={17}/> Помолитися ще раз</button></div></div>}
        </motion.div></AnimatePresence>
        <p className="turms-disclaimer" id={descriptionId}>Це локальна жартівлива анімація: гроші не списуються, платіжних систем немає, справжню техніку у War Thunder не видаємо.</p><SoundToggle/>
      </div>
    </motion.div>
  </motion.div>}</AnimatePresence>,document.body)
}
