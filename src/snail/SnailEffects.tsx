import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { ShieldAlert, Volume2, VolumeX, X } from 'lucide-react'
import { randomOther, rpuMessages } from './memes'
import './snail.css'

const SOUND_KEY = 'nikkoni-snail-sound-v1'
type Effects = { soundEnabled: boolean; soundNotice: string; toggleSound: () => void; triggerRpu: () => void; playNotification: () => void; playReward: () => void }
const EffectsContext = createContext<Effects | null>(null)
export function useSnailEffects() {
  const context = useContext(EffectsContext)
  if (!context) throw Error('Snail effects require their provider')
  return context
}

export function SnailEffectsProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(() => { try { return localStorage.getItem(SOUND_KEY) === 'on' } catch { return false } })
  const [soundNotice, setSoundNotice] = useState('')
  const [alertId, setAlertId] = useState(0)
  const [visible, setVisible] = useState(false)
  const audio = useRef<AudioContext | null>(null)
  const activeTone = useRef<OscillatorNode | null>(null)
  const soundAllowed = useRef(soundEnabled)
  const lastAlarm = useRef(0)
  const reduced = useReducedMotion()
  useEffect(() => () => { void audio.current?.close().catch(() => {}); audio.current = null }, [])
  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(() => setVisible(false), 4200)
    return () => window.clearTimeout(timer)
  }, [visible, alertId])
  const playAlarm = async (kind: 'alert' | 'reward' = 'alert') => {
    // Short synthesized sound; no audio download, autoplay or permanent loop.
    if (Date.now() - lastAlarm.current < 900) return
    lastAlarm.current = Date.now()
    try {
      if (!window.AudioContext) { setSoundNotice('Цей браузер не підтримує звуки. Візуальні ефекти працюють.'); return }
      const context = audio.current ?? new AudioContext()
      audio.current = context
      await context.resume()
      if (!soundAllowed.current) return
      const start = context.currentTime
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(440, start)
      oscillator.frequency.setValueAtTime(kind === 'reward' ? 554.37 : 330, start + .16)
      oscillator.frequency.setValueAtTime(kind === 'reward' ? 659.25 : 440, start + .32)
      if (kind === 'reward') oscillator.frequency.setValueAtTime(880, start + .43)
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(.045, start + .025)
      gain.gain.setValueAtTime(.045, start + .4)
      gain.gain.linearRampToValueAtTime(0, start + .55)
      oscillator.connect(gain); gain.connect(context.destination)
      activeTone.current = oscillator
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); if (activeTone.current === oscillator) activeTone.current = null }
      oscillator.start(start); oscillator.stop(start + .56)
      setSoundNotice('')
    } catch { setSoundNotice('Браузер не дозволив звук. Спробуй вимкнути й знову увімкнути його.') }
  }
  const toggleSound = () => {
    const next = !soundEnabled
    soundAllowed.current = next
    setSoundEnabled(next)
    try { localStorage.setItem(SOUND_KEY, next ? 'on' : 'off') } catch { /* Preference still works for this visit. */ }
    if (next) void playAlarm()
    else {
      // Stop the tone rather than pausing it, so unmuting cannot resume an old alarm.
      if (activeTone.current) { activeTone.current.stop(); activeTone.current.disconnect(); activeTone.current = null }
      void audio.current?.suspend().catch(() => {}); setSoundNotice('')
    }
  }
  const triggerRpu = () => {
    setAlertId(id => id + 1); setVisible(true)
    if (soundEnabled) void playAlarm()
  }
  const playNotification = () => { if (soundAllowed.current) void playAlarm() }
  const playReward = () => { if (soundAllowed.current) void playAlarm('reward') }
  return <EffectsContext.Provider value={{soundEnabled,soundNotice,toggleSound,triggerRpu,playNotification,playReward}}>{children}<AnimatePresence>{visible && <motion.aside className="rpu-toast" role="status" aria-live="polite" initial={{opacity:reduced ? 1 : 0,y:reduced ? 0 : -8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:reduced ? 0 : .2}}><ShieldAlert size={24}/><div><strong className={reduced ? '' : 'rpu-glitch'} key={alertId}>РПУ АКТИВОВАНО</strong><p>Равлик спостерігає. Це мем, а не реальна механіка War Thunder.</p></div><button className="icon-button" aria-label="Закрити попередження РПУ" onClick={() => setVisible(false)}><X size={17}/></button></motion.aside>}</AnimatePresence></EffectsContext.Provider>
}

export function SoundToggle() {
  const {soundEnabled,soundNotice,toggleSound} = useSnailEffects()
  return <div className="snail-sound-control"><button className="button ghost" onClick={toggleSound} aria-pressed={soundEnabled}>{soundEnabled ? <Volume2 size={15}/> : <VolumeX size={15}/>}Звук: {soundEnabled ? 'увімкнено' : 'вимкнено'}</button>{soundNotice && <p role="status">{soundNotice}</p>}</div>
}

export function RpuIndicator({ compact = false }: { compact?: boolean }) {
  const [message, setMessage] = useState(-1)
  const [automatic, setAutomatic] = useState(true)
  const container = useRef<HTMLDivElement>(null)
  const inView = useInView(container)
  const {triggerRpu} = useSnailEffects()
  useEffect(() => {
    if (!automatic || !inView) return
    const timer = window.setInterval(() => { if (!document.hidden) setMessage(previous => randomOther(rpuMessages.length, previous)) }, 18000)
    return () => window.clearInterval(timer)
  }, [automatic,inView])
  return <div className={`rpu-indicator${compact ? ' rpu-compact' : ''}`} ref={container}><div className="rpu-status"><ShieldAlert size={17}/><strong>РПУ: АКТИВОВАНО</strong><span>ПАРОДІЯ</span></div><p className="rpu-message" aria-live="off">{message < 0 ? 'Уявний режим персонального пригнічення. Реальність покинула матч.' : rpuMessages[message]}</p><div className="rpu-buttons"><button onClick={() => { setMessage(previous => randomOther(rpuMessages.length,previous)); triggerRpu() }}>Перевірити РПУ</button><button onClick={() => setAutomatic(value => !value)} aria-pressed={automatic}>Автофрази: {automatic ? 'увімкнено' : 'вимкнено'}</button></div><p className="rpu-disclaimer">РПУ — мем про уявну систему, а не доведена механіка. Жодного впливу на War Thunder.</p></div>
}
