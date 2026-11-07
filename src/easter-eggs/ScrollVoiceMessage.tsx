import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Ban, Mic, Pause, Play, X } from 'lucide-react'
import { SiteImage } from '../SiteImage'
import images from '../data/images.json'
import { useSnailEffects } from '../snail/SnailEffects'
import { ScrollVoiceGate } from './scrollVoiceGate'
import { voiceAsset } from './voiceAsset'
import './scroll-voice.css'

const formatTime=(time:number)=>Number.isFinite(time)?`${Math.floor(time/60)}:${String(Math.floor(time%60)).padStart(2,'0')}`:'—:—'
const bars=[12,22,15,30,18,26,36,20,32,14,25,35,17,29,21,38,26,15,31,20,34,13,24,30,17,36,22,14]

export function VoiceMessageWindow({src,onClose,onBlock}:{src:string|null;onClose:()=>void;onBlock:()=>void}){
  const {soundEnabled,volume,claimAudio}=useSnailEffects()
  const audio=useRef<HTMLAudioElement>(null),release=useRef<(()=>void)|null>(null),request=useRef(0)
  const [playing,setPlaying]=useState(false),[current,setCurrent]=useState(0),[duration,setDuration]=useState(NaN),[listened,setListened]=useState(false),[error,setError]=useState('')
  const reduced=useReducedMotion()
  const pause=useCallback(()=>{request.current++;audio.current?.pause();setPlaying(false);release.current?.();release.current=null},[])
  useEffect(()=>{const element=audio.current;return()=>{request.current++;element?.pause();release.current?.()}},[src])
  useEffect(()=>{
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){pause();onClose()}}
    document.addEventListener('keydown',escape)
    return()=>document.removeEventListener('keydown',escape)
  },[pause,onClose])
  useEffect(()=>{if(audio.current)audio.current.volume=volume;if(!soundEnabled||volume===0)pause()},[soundEnabled,volume,pause])
  const toggle=async()=>{
    const element=audio.current
    if(!element||!soundEnabled||volume===0)return
    if(!element.paused){pause();return}
    release.current=claimAudio(pause)
    const ticket=++request.current
    setError('')
    try{await element.play();if(ticket!==request.current)element.pause()}
    catch{if(ticket===request.current){pause();setError('Не вдалося відтворити запис. Спробуй ще раз.')}}
  }
  const progress=Number.isFinite(duration)&&duration>0?current/duration:0
  return <motion.aside className={`voice-message${playing&&!reduced?' voice-playing':''}`} aria-label="Голосове повідомлення від Nikkoni Niputizu" initial={{opacity:reduced?1:0,y:reduced?0:15}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:8}} transition={{duration:reduced?0:.22}}>
    <div className="voice-kicker" role="status">НОВЕ ПОВІДОМЛЕННЯ ВІД ЛЕГЕНДИ</div>
    <div className="voice-top"><SiteImage src={images.photos[1].src} width={44} height={44} alt="Аватарка Дениса"/><div><strong>Nikkoni Niputizu</strong><small><Mic size={11}/> Голосове повідомлення · мем</small></div><button className="voice-close" type="button" aria-label="Закрити голосове повідомлення" onClick={()=>{pause();onClose()}}><X size={17}/></button></div>
    <p className="voice-text">Денис 300 метрів від вас. Куплю вам преміум акаунт поки моя мама буде під столом готувати вам омлет</p>
    <div className="voice-player"><button className="voice-play" type="button" aria-label={playing?'Призупинити голосове повідомлення':'Відтворити голосове повідомлення'} onClick={toggle} disabled={!src||!soundEnabled||volume===0}>{playing?<Pause size={18}/>:<Play size={18}/>}</button><div className="voice-track"><div className="voice-wave" aria-hidden="true">{bars.map((height,i)=><span key={i} style={{height,animationDelay:`${i%7*.07}s`,background:i/bars.length<=progress?'#79c6e9':undefined}}/>)}</div><input type="range" min="0" max={Number.isFinite(duration)?duration:0} value={current} step="0.1" disabled={!src||!Number.isFinite(duration)} aria-label="Позиція голосового повідомлення" onChange={event=>{if(audio.current){audio.current.currentTime=Number(event.target.value);setCurrent(audio.current.currentTime)}}}/><div className="voice-time"><span>{formatTime(current)}</span><span>{formatTime(duration)}</span></div></div></div>
    {!src?<small className="voice-status">Оригінальний запис ще не додано.</small>:!soundEnabled?<small className="voice-status">Увімкни звук через перемикач у шапці сайту.</small>:volume===0?<small className="voice-status">Підвищ гучність у налаштуваннях звуку.</small>:null}
    {error&&<small className="voice-status" role="status">{error}</small>}
    {listened&&<button type="button" className="voice-block" onClick={()=>{pause();onBlock()}}><Ban size={13}/> Заблокувати цього персонажа</button>}
    {src&&<audio ref={audio} src={src} preload="metadata" onLoadedMetadata={event=>setDuration(event.currentTarget.duration)} onTimeUpdate={event=>setCurrent(event.currentTarget.currentTime)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>{pause();setListened(true)}} onError={()=>{pause();setError('Аудіофайл недоступний. Повідомлення можна закрити.')}}/>}
  </motion.aside>
}

export function ScrollVoiceMessage(){
  const {pathname}=useLocation()
  const [shown,setShown]=useState(false),[suppressed,setSuppressed]=useState(false),[blockedNotice,setBlockedNotice]=useState(false)
  const gate=useRef<ScrollVoiceGate|null>(null),noticeTimer=useRef<number|undefined>(undefined)
  if(!gate.current){let storage:Storage|null=null;try{storage=sessionStorage}catch{/* In-memory fallback. */}gate.current=new ScrollVoiceGate(storage)}
  useEffect(()=>()=>window.clearTimeout(noticeTimer.current),[])
  useEffect(()=>{if(pathname!=='/')setShown(false)},[pathname])
  useEffect(()=>{
    if(pathname!=='/')return
    let frame=0
    const obstructed=()=>{
      const form=document.getElementById('apply')?.getBoundingClientRect()
      return Boolean(document.querySelector('[aria-modal="true"]')||(form&&form.top<innerHeight&&form.bottom>0))
    }
    const check=()=>{
      frame=0
      const blocked=obstructed();setSuppressed(blocked)
      const length=document.documentElement.scrollHeight-innerHeight
      if(length>0&&gate.current!.reach(scrollY/length,true,blocked))setShown(true)
    }
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(check)}
    const begin=(event:Event)=>{
      if(event.target instanceof Element&&event.target.closest('input,textarea,select,[contenteditable="true"]'))return
      if(event instanceof KeyboardEvent&&!['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))return
      gate.current!.begin()
    }
    const observer=new MutationObserver(scroll)
    observer.observe(document.body,{childList:true})
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('wheel',begin,{passive:true});window.addEventListener('touchmove',begin,{passive:true});window.addEventListener('keydown',begin)
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',scroll);window.removeEventListener('wheel',begin);window.removeEventListener('touchmove',begin);window.removeEventListener('keydown',begin)}
  },[pathname])
  const active=shown&&pathname==='/'&&!suppressed
  const block=()=>{setShown(false);setBlockedNotice(true);window.clearTimeout(noticeTimer.current);noticeTimer.current=window.setTimeout(()=>setBlockedNotice(false),1000)}
  return createPortal(<><AnimatePresence>{active&&<VoiceMessageWindow src={voiceAsset?.src??null} onClose={()=>setShown(false)} onBlock={block}/>}</AnimatePresence>{blockedNotice&&pathname==='/'&&<div className="voice-block-toast" role="status">Неможливо заблокувати. Денис має преміум акаунт</div>}</>,document.body)
}
