import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { Settings2, ShieldAlert, Volume2, VolumeX, X } from 'lucide-react'
import { randomOther, rpuMessages } from './memes'
import { LocalSoundPlayer } from '../audio/LocalSoundPlayer'
import { AudioFocus } from '../audio/AudioFocus'
import { soundLabels, type SoundId } from '../audio/sounds'
import './snail.css'
import '../audio/audio-controls.css'

const SOUND_KEY='nikkoni-snail-sound-v1', VOLUME_KEY='nikkoni-snail-volume-v1'
export function readVolume(){try{const raw=localStorage.getItem(VOLUME_KEY);if(raw===null)return .4;const value=Number(raw);return Number.isFinite(value)?Math.max(0,Math.min(1,value)):.4}catch{return .4}}
type Effects={soundEnabled:boolean;soundNotice:string;volume:number;lastSound:SoundId|null;setVolume:(value:number)=>void;toggleSound:()=>void;triggerRpu:()=>void;playNotification:()=>void;playReward:()=>void;playSound:(id:SoundId)=>void;stopSounds:()=>void;claimAudio:(pause:()=>void)=>()=>void}
const EffectsContext=createContext<Effects|null>(null)
export function useSnailEffects(){const context=useContext(EffectsContext);if(!context)throw Error('Snail effects require their provider');return context}
export function SnailEffectsProvider({children}:{children:ReactNode}){
  const [soundEnabled,setSoundEnabled]=useState(()=>{try{return localStorage.getItem(SOUND_KEY)==='on'}catch{return false}})
  const [volume,setVolumeState]=useState(readVolume)
  const [soundNotice,setSoundNotice]=useState('')
  const [lastSound,setLastSound]=useState<SoundId|null>(null)
  const [alertId,setAlertId]=useState(0),[visible,setVisible]=useState(false)
  const player=useRef<LocalSoundPlayer|null>(null)
  if(!player.current)player.current=new LocalSoundPlayer(setSoundNotice,setLastSound)
  const audioFocus=useRef<AudioFocus|null>(null)
  if(!audioFocus.current)audioFocus.current=new AudioFocus(()=>player.current?.stop())
  const enabledRef=useRef(soundEnabled),volumeRef=useRef(volume)
  enabledRef.current=soundEnabled;volumeRef.current=volume
  const reduced=useReducedMotion(),{pathname}=useLocation()
  useEffect(()=>{player.current!.configure(soundEnabled,volume)},[soundEnabled,volume])
  useEffect(()=>()=>{audioFocus.current?.stopAll();player.current?.dispose()},[])
  useEffect(()=>{audioFocus.current?.stopAll()},[pathname])
  useEffect(()=>{const stopHidden=()=>{if(document.hidden)audioFocus.current?.stopAll()};document.addEventListener('visibilitychange',stopHidden);return()=>document.removeEventListener('visibilitychange',stopHidden)},[])
  useEffect(()=>{if(!visible)return;const timer=window.setTimeout(()=>setVisible(false),4200);return()=>window.clearTimeout(timer)},[visible,alertId])
  const playSound=useCallback((id:SoundId)=>{audioFocus.current?.beforeBuiltin();void player.current?.play(id)},[])
  const stopSounds=useCallback(()=>audioFocus.current?.stopAll(),[])
  const claimAudio=useCallback((pause:()=>void)=>audioFocus.current!.claimExternal(pause),[])
  const toggleSound=()=>{const next=!enabledRef.current;enabledRef.current=next;setSoundEnabled(next);player.current!.configure(next,volumeRef.current);try{localStorage.setItem(SOUND_KEY,next?'on':'off')}catch{};if(next)void player.current!.unlock();else {audioFocus.current?.stopAll();setSoundNotice('')}}
  const setVolume=(value:number)=>{const next=Number.isFinite(value)?Math.max(0,Math.min(1,value)):.4;volumeRef.current=next;setVolumeState(next);if(next===0)audioFocus.current?.stopAll();player.current!.configure(enabledRef.current,next);try{localStorage.setItem(VOLUME_KEY,String(next))}catch{}}
  const triggerRpu=()=>{setAlertId(id=>id+1);setVisible(true);playSound('rpu-warning')}
  const playNotification=()=>playSound('hit')
  const playReward=()=>playSound('achievement')
  return <EffectsContext.Provider value={{soundEnabled,soundNotice,volume,lastSound,setVolume,toggleSound,triggerRpu,playNotification,playReward,playSound,stopSounds,claimAudio}}>{children}<AnimatePresence>{visible&&<motion.aside className="rpu-toast" role="status" aria-live="polite" initial={{opacity:reduced?1:0,y:reduced?0:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:reduced?0:.2}}><ShieldAlert size={24}/><div><strong className={reduced?'':'rpu-glitch'} key={alertId}>РПУ АКТИВОВАНО</strong><p>Равлик спостерігає. Це мем, а не реальна механіка War Thunder.</p></div><button className="icon-button" aria-label="Закрити попередження РПУ" onClick={()=>{setVisible(false);stopSounds()}}><X size={17}/></button></motion.aside>}</AnimatePresence></EffectsContext.Provider>
}
function VolumeSettings(){
  const {volume,setVolume,soundEnabled,soundNotice,lastSound,playSound}=useSnailEffects(),id=useId()
  return <div className="volume-settings"><label htmlFor={id}>Гучність <b>{Math.round(volume*100)}%</b></label><input id={id} type="range" min="0" max="100" step="1" value={Math.round(volume*100)} onChange={event=>setVolume(Number(event.target.value)/100)} aria-label="Гучність звукових ефектів"/><button type="button" disabled={!soundEnabled||volume===0} onClick={()=>playSound('snail-blessing')}>Перевірити звук</button><small>Локальні аудіофайли. Джерела та походження — за посиланням нижче.</small><a href="/sounds/credits.html" target="_blank" rel="noopener noreferrer">Джерела та ліцензії аудіо ↗</a>{lastSound&&<output className="last-sound">Останній ефект: {soundLabels[lastSound]}</output>}{soundNotice&&<p role="status">{soundNotice}</p>}</div>
}
export function SoundToggle(){
  const {soundEnabled,soundNotice,toggleSound}=useSnailEffects()
  return <div className="snail-sound-control"><button type="button" className="button ghost" onClick={toggleSound} aria-pressed={soundEnabled}>{soundEnabled?<Volume2 size={15}/>:<VolumeX size={15}/>}Звук: {soundEnabled?'увімкнено':'вимкнено'}</button><details className="sound-settings"><summary>Гучність і джерела</summary><VolumeSettings/></details>{soundNotice&&<p role="status">{soundNotice}</p>}</div>
}
export function HeaderSoundControl(){
  const {soundEnabled,toggleSound}=useSnailEffects()
  return <div className="header-sound"><button type="button" className="icon-button" onClick={toggleSound} aria-pressed={soundEnabled} aria-label={soundEnabled?'Вимкнути звукові ефекти':'Увімкнути звукові ефекти'} title={soundEnabled?'Звук увімкнено':'Звук вимкнено'}>{soundEnabled?<Volume2 size={17}/>:<VolumeX size={17}/>}</button><details className="header-sound-menu"><summary aria-label="Налаштування гучності"><Settings2 size={14}/></summary><VolumeSettings/></details></div>
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
