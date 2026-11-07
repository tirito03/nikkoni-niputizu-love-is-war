import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { historyAside } from '../game/story'
import type { Session } from '../game/engine'
import { useSnailEffects } from '../snail/SnailEffects'
import './steam-library.css'

export function HistoryAside({session,onChoose}:{session:Session;onChoose:(id:string)=>void}) {
  const [alert,setAlert]=useState(false)
  const reduced=useReducedMotion()
  const {playNotification}=useSnailEffects()
  const selected=session.actions.find(action=>action.type==='historyAside')
  const answer=selected&&selected.type==='historyAside'?historyAside.choices.find(choice=>choice.id===selected.choiceId):null
  const finished=session.run.phase==='ending'
  useEffect(()=>{if(!alert)return;const timer=window.setTimeout(()=>setAlert(false),1000);return()=>window.clearTimeout(timer)},[alert])
  useEffect(()=>{setAlert(false)},[session.run.nodeId])
  const choose=(id:string)=>{
    if(answer||finished)return
    const choice=historyAside.choices.find(item=>item.id===id)
    if(!choice)return
    onChoose(id)
    if(choice.compromised){setAlert(true);playNotification()}
  }
  return <><details className="history-aside"><summary>Секретна розмова про історію · необов’язково</summary><div className="history-aside-body"><p><b>Денис:</b> «{historyAside.line}».</p>{answer?<p className="history-aside-reaction" role="status"><b>Денис:</b> «{answer.reaction}»</p>:finished?<p>Арку завершено. Розмову можна відкрити в наступному проходженні.</p>:<div className="history-aside-choices">{historyAside.choices.map(choice=><button key={choice.id} onClick={()=>choose(choice.id)}>{choice.text}</button>)}</div>}<p className="history-aside-note">Вигаданий необов’язковий діалог, не дані про реальну бібліотеку чи сексуальне життя Дениса. Можна не відкривати. Невеликий бонус симпатії надається один раз за арку.</p></div></details>{createPortal(<AnimatePresence>{alert&&<motion.div className="history-compromat" role="status" initial={{opacity:reduced?1:0,y:reduced?0:-5}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:reduced?0:.1}}>ІСТОРИЧНИЙ КОМПРОМАТ РОЗКРИТО</motion.div>}</AnimatePresence>,document.body)}</>
}
