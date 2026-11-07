import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Crosshair, Crown, FileLock2, Heart, HelpCircle, RefreshCw, Shield, ShieldAlert, ShieldCheck, Sparkles, Volume2, VolumeX, X } from 'lucide-react'
import { randomOther } from '../snail/memes'
import type { MemeQuote, MemeTheme } from './catalog'
import { createMeme, withRandomComment } from '../data/quoteModel'
import { soundForText, unavailableSounds } from '../audio/sounds'
import { useSnailEffects } from '../snail/SnailEffects'
import { allowsPopupAudio, type PopupAudioContext } from './popupAudio'
import './humor.css'
import './meme-effects.css'

type Result = { context?:PopupAudioContext; theme: MemeTheme; title: string; quote: MemeQuote; category?: string; tone?: string; buttonLabel?: string; onMore?: () => void; cooldownMs?: number; returnFocus?: HTMLElement | null; followUp?:MemeQuote; revealDelayMs?:number; actionLabel?:string }
type Pool = Omit<Result, 'quote' | 'onMore'> & { key: string; quotes: MemeQuote[] }
type PopupApi = { openPool: (pool: Pool) => void; showResult: (result: Result) => void; close: () => void }
const PopupContext = createContext<PopupApi | null>(null)
export function useMemePopup() { const api = useContext(PopupContext); if (!api) throw Error('Meme popup requires provider'); return api }
const icons = { war: Crosshair, hoi4: FileLock2, anime: Heart, snail: Sparkles, rpg: Shield }

export function MemePopupProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<(Result & { id: number }) | null>(null)
  const [cooling, setCooling] = useState(false)
  const count = useRef(0), previous = useRef(new Map<string, number>())
  const opener = useRef<HTMLElement | null>(null), panel = useRef<HTMLDivElement>(null), closeButton = useRef<HTMLButtonElement>(null)
  const activeRef = useRef(active); activeRef.current = active
  const reduced = useReducedMotion(), headingId = useId(), descriptionId = useId()
  const { pathname, hash } = useLocation()
  const {playSound,stopSounds,soundEnabled,toggleSound}=useSnailEffects()
  const close = useCallback(() => {stopSounds();setActive(null)}, [stopSounds])
  const showResult = useCallback((result: Result) => {
    // Existing full-screen easter eggs retain their own interface and focus trap.
    if (document.querySelector('[aria-modal="true"]:not(.meme-popup)')) return
    if (!activeRef.current) opener.current = result.returnFocus ?? document.activeElement as HTMLElement
    const sound=result.quote.sound??(result.theme==='anime'?'snail-blessing':soundForText(result.quote.quote))
    const selected=withRandomComment(result.quote)
    const quote=createMeme(selected.quote,selected.comment,{...selected,theme:result.theme,sound})
    setActive({ ...result,quote, id: ++count.current })
    stopSounds()
    if(allowsPopupAudio(result.context))playSound(sound)
  }, [playSound,stopSounds])
  const openPool = useCallback((pool: Pool) => {
    if (!pool.quotes.length) return
    const next = () => {
      const index = randomOther(pool.quotes.length, previous.current.get(pool.key) ?? -1)
      previous.current.set(pool.key, index)
      showResult({ ...pool, quote: pool.quotes[index], onMore: next })
    }
    next()
  }, [showResult])
  useEffect(close, [pathname, hash, close])
  const opened = active !== null
  useEffect(() => {
    if (!opened) return
    const root = document.getElementById('root'), wasInert = root?.inert ?? false, oldOverflow = document.body.style.overflow
    if (root) root.inert = true
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return }
      if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return
      const buttons = Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
      const first = buttons[0], last = buttons[buttons.length - 1]
      if (!buttons.includes(document.activeElement as HTMLButtonElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus() }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      if (root) root.inert = wasInert
      document.body.style.overflow = oldOverflow
      document.removeEventListener('keydown', onKey)
      if (opener.current?.isConnected) opener.current.focus({ preventScroll: true })
    }
  }, [opened, close])
  useEffect(() => {
    setCooling(Boolean(active?.cooldownMs))
    if (!active?.cooldownMs) return
    const timer = window.setTimeout(() => setCooling(false), active.cooldownMs)
    return () => window.clearTimeout(timer)
  }, [active?.id, active?.cooldownMs])
  useEffect(()=>{
    if(!active?.followUp)return
    closeButton.current?.focus({preventScroll:true})
    const id=active.id
    const timer=window.setTimeout(()=>setActive(current=>current?.id===id&&current.followUp?{...current,quote:current.followUp,followUp:undefined}:current),active.revealDelayMs??1500)
    return()=>window.clearTimeout(timer)
  },[active?.id,active?.followUp,active?.revealDelayMs])
  const categoryIcons = {blessing:ShieldCheck,curse:ShieldAlert,absurd:HelpCircle,legendary:Crown}
  const Icon = active?.theme==='snail' && active.tone && active.tone in categoryIcons ? categoryIcons[active.tone as keyof typeof categoryIcons] : icons[active?.theme ?? 'rpg']
  return <PopupContext.Provider value={{ openPool, showResult, close }}>{children}{active && createPortal(
    <motion.div className={`meme-popup-overlay meme-theme-${active.theme} meme-tone-${active.tone ?? 'default'} meme-effect-${active.quote.effect??'none'}`} initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .18 }} onClick={event => { if (event.target === event.currentTarget) close() }}>
      <motion.div className="meme-popup" ref={panel} role="dialog" aria-modal="true" aria-labelledby={headingId} aria-describedby={descriptionId} initial={{ y: reduced ? 0 : 16, scale: reduced ? 1 : .97 }} animate={{ y: 0, scale: 1 }} transition={{ duration: reduced ? 0 : .22 }}>
        <div className="meme-popup-bar"><span><Icon size={16}/> {active.title}</span><div className="meme-popup-actions"><button type="button" className="icon-button" aria-pressed={soundEnabled} aria-label={soundEnabled?'Вимкнути звук у повідомленні':'Увімкнути звук у повідомленні'} onClick={()=>{toggleSound();if(!soundEnabled&&allowsPopupAudio(active.context))playSound(active.quote.sound??soundForText(active.quote.quote))}}>{soundEnabled?<Volume2 size={17}/>:<VolumeX size={17}/>}</button><button type="button" className="icon-button" ref={closeButton} onClick={close} aria-label="Закрити мемне повідомлення"><X size={19}/></button></div></div>
        <div className="meme-popup-body"><span className="meme-popup-stamp">{active.category ?? ({war:'COMBAT REPORT',hoi4:'TOP SECRET',anime:'HEART SYSTEM',snail:'DIVINE MESSAGE',rpg:'CHARACTER LOG'}[active.theme])}</span>
          <motion.div key={`${active.id}:${active.quote.id}`} role="status" aria-live="polite" initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .2 }}><h2 id={headingId}>«{active.quote.quote}»</h2><p id={descriptionId}>{active.quote.comment}</p></motion.div>
          {!reduced&&active.quote.effect==='sparks'&&<div className="meme-sparks" key={active.id} aria-hidden="true">{Array.from({length:8},(_,i)=><motion.span key={i} initial={{x:0,y:0,opacity:0}} animate={{x:Math.cos(i*Math.PI/4)*95,y:Math.sin(i*Math.PI/4)*60,opacity:[0,1,0]}} transition={{duration:.45}}>✦</motion.span>)}</div>}
          {active.onMore && <button className="button meme-popup-more" type="button" disabled={cooling} onClick={active.onMore}><RefreshCw size={16}/>{active.buttonLabel ?? 'Ще одна цитата'}</button>}
          {!active.followUp&&active.actionLabel&&<button className="button meme-popup-more" type="button" onClick={close}><Shield size={16}/>{active.actionLabel}</button>}
          {active.quote.sound&&unavailableSounds[active.quote.sound]&&<small className="meme-popup-disclaimer" role="status">{unavailableSounds[active.quote.sound]}</small>}
          <small className="meme-popup-disclaimer">Локальна вигадана пародія. Статистика, бонуси й РПУ — лише меми, без впливу на ігри чи реальних перевірок.</small>
        </div>
      </motion.div>
    </motion.div>, document.body)}</PopupContext.Provider>
}
