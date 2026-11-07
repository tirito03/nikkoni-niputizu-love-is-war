import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BookOpen, LockKeyhole, Trophy, X } from 'lucide-react'
import images from '../data/images.json'
import { SiteImage } from '../SiteImage'
import { useSnailEffects } from '../snail/SnailEffects'
import './steam-library.css'

const STORAGE_KEY = 'nikkoni-history-library-v1'
const tooltip = 'HOI4 була лише початком. Далі історія пішла не за підручником'
const LibraryContext = createContext<{open:()=>void;revealed:boolean} | null>(null)
const readClicks = () => { try { const value=Number(localStorage.getItem(STORAGE_KEY)); return Number.isInteger(value) && value>=0 && value<=3 ? value : 0 } catch { return 0 } }
function useLibrary() { const context=useContext(LibraryContext); if(!context)throw Error('Secret library needs its provider'); return context }

export function SecretSteamLibraryProvider({children}:{children:ReactNode}) {
  const [visible,setVisible]=useState(false)
  const [clicks,setClicks]=useState(readClicks)
  const clickCount=useRef(clicks)
  const [errorVersion,setErrorVersion]=useState(0)
  const [storageFailed,setStorageFailed]=useState(false)
  const panel=useRef<HTMLDivElement>(null), closeButton=useRef<HTMLButtonElement>(null)
  const opener=useRef<HTMLElement|null>(null)
  const titleId=useId(), descriptionId=useId()
  const reduced=useReducedMotion()
  const {playNotification}=useSnailEffects()
  const {pathname,hash}=useLocation()
  useEffect(()=>setVisible(false),[pathname,hash])
  useEffect(()=>{
    if(!visible)return
    const overflow=document.body.style.overflow
    document.body.style.overflow='hidden'
    closeButton.current?.focus({preventScroll:true})
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setVisible(false);return}
      if(event.key!=='Tab'||event.ctrlKey||event.metaKey||event.altKey)return
      const buttons=Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[])
      const first=buttons[0],last=buttons[buttons.length-1]
      if(!buttons.includes(document.activeElement as HTMLButtonElement)){event.preventDefault();(event.shiftKey?last:first)?.focus()}
      else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
    }
    document.addEventListener('keydown',onKey)
    return ()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',onKey);if(opener.current?.isConnected)opener.current.focus({preventScroll:true})}
  },[visible])
  const open=()=>{opener.current=document.activeElement as HTMLElement;setErrorVersion(0);setVisible(true)}
  const investigate=()=>{
    clickCount.current=Math.min(3,clickCount.current+1)
    setClicks(clickCount.current);setErrorVersion(version=>version+1);playNotification()
    try{localStorage.setItem(STORAGE_KEY,String(clickCount.current))}catch{setStorageFailed(true)}
  }
  return <LibraryContext.Provider value={{open,revealed:clicks>0}}>{children}{createPortal(<AnimatePresence>{visible&&<motion.div className="steam-secret-overlay" initial={{opacity:reduced?1:0}} animate={{opacity:1}} exit={{opacity:0,pointerEvents:'none'}} transition={{duration:reduced?0:.15}} onClick={()=>setVisible(false)}>
    <motion.div className="steam-secret-panel" ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} initial={{y:reduced?0:14}} animate={{y:0}} transition={{duration:reduced?0:.2}} onClick={event=>event.stopPropagation()}>
      <div className="steam-secret-bar"><span>STEAM-STYLE / FICTIONAL LIBRARY</span><button className="icon-button" ref={closeButton} aria-label="Закрити секретну бібліотеку" onClick={()=>setVisible(false)}><X size={18}/></button></div>
      <div className="steam-secret-body"><span className="steam-secret-stamp">TOP SECRET</span><h2 id={titleId}>Секретна бібліотека <span>Дениса</span></h2><p className="steam-secret-fiction" id={descriptionId}>Вигаданий мем про персонажа сайту. Це не підтверджений список ігор, покупок чи інтересів реального Дениса. Доступу до його Steam немає.</p>
        <div className="steam-secret-games"><article className="steam-game-card"><SiteImage className="steam-game-cover" {...images.games.hoi4} alt="Hearts of Iron IV — офіційна обкладинка Steam" loading="lazy" decoding="async"/><div><h3>Hearts of Iron IV</h3><p>Історичний стратег</p></div></article><article className="steam-game-card"><SiteImage className="steam-game-cover" {...images.games.warThunder} alt="War Thunder — офіційна обкладинка Steam" loading="lazy" decoding="async"/><div><h3>War Thunder</h3><p>Вірний слуга Равлика</p></div></article><button className="steam-game-card steam-game-clickable" onClick={investigate} aria-label="Sex with Stalin — дослідити історичний інтерес"><SiteImage className="steam-game-cover" {...images.steamHistory} loading="lazy" decoding="async" alt="Офіційна обкладинка Sex with Stalin зі Steam: портрет у формі та назва гри, без відвертих сцен"/><div><h3>Sex with Stalin</h3><p>Історичний інтерес зайшов занадто далеко</p><small>Натисни, щоб розсекретити · 18+ · обкладинка Steam</small></div></button></div>
        {errorVersion>0&&<motion.section key={errorVersion} className="steam-system-error" role="status" aria-live="polite" initial={{opacity:reduced?1:0,y:reduced?0:5}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.2}}><h3 className={reduced?'':'steam-secret-glitch'}>УВАГА! ВИЯВЛЕНО НЕБЕЗПЕЧНИЙ РІВЕНЬ ЛЮБОВІ ДО ІСТОРІЇ XX СТОЛІТТЯ</h3><div className="steam-secret-chat">{[['Система','Денисе, навіщо тобі ця гра?'],['Денис','Це для вивчення історії'],['Система','Тоді чому в тебе закритий доступ до історії покупок?'],['Денис','ДЕРЖАВНА ТАЄМНИЦЯ']].map(([speaker,text],i)=><p key={i}><b>{speaker}</b><span>«{text}»</span></p>)}</div><SecretHistoryScale/></motion.section>}
        {clicks>=3&&<div className="steam-secret-achievement" role="status"><Trophy size={23}/><div><strong>ІСТОРИЧНИЙ РОМАНТИК</strong><p>Ти зайшов у Steam за стратегією, а вийшов із питаннями до власної історичної освіти.</p>{storageFailed&&<small>Досягнення працює в цій вкладці; сховище браузера недоступне.</small>}</div></div>}
        <p className="steam-secret-footer">Усі репліки й симпатії в цій сценці — абсурдна вигадка, не біографія чи твердження про сексуальне життя людини. Комедія про дивний вибір гри не виправдовує репресій та історичних злочинів. Жодних зовнішніх запитів або відкриття Steam.</p>
      </div>
    </motion.div>
  </motion.div>}</AnimatePresence>,document.body)}</LibraryContext.Provider>
}

export function SecretLibraryTrigger(){const {open}=useLibrary();return <details className="steam-secret-disclosure"><summary><LockKeyhole size={13}/> TOP SECRET / ЗАСЕКРЕЧЕНІ ФАЙЛИ</summary><button className="button ghost" aria-haspopup="dialog" onClick={open}><BookOpen size={16}/> Переглянути секретну бібліотеку Steam</button></details>}
export function SecretHistoryScale(){return <div className="steam-history-scale" title={tooltip}><div><span>Підозрілий інтерес до Сталіна</span><b>999<small>/100</small></b></div><div className="steam-history-track" role="img" aria-label="Підозрілий інтерес до Сталіна — 999 зі 100. Вигаданий абсурдний мем"><span/></div><p>{tooltip}</p><small>Вигадана шкала персонажа, не реальна характеристика людини.</small></div>}
export function UnlockedHistoryScale(){const {revealed}=useLibrary();return revealed?<SecretHistoryScale/>:null}
