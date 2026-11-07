import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, Heart, History, RotateCcw, Shield, SkipForward, Sparkles, Trophy } from 'lucide-react'
import { GameArtwork } from './GameArtwork'
import { HistoryAside } from '../steam/HistoryAside'
import { FinanzamtSceneTrigger, FinanzamtText } from '../finanzamt/Finanzamt'
import { currentReadId, newSession, parseSave, restart, SAVE_KEY, serialize, skipRead, transition, type Action } from './engine'
import { endings, episodeById, episodes, type EndingId } from './story'
import './game.css'
import { RpuIndicator, SoundToggle, useSnailEffects } from '../snail/SnailEffects'

function loadSession() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    const saved = parseSave(raw)
    return { session: saved ?? newSession(), notice: raw && !saved ? 'Старе збереження не вдалося прочитати. Розпочато нову арку.' : saved?.legacyRoute ? 'Стару арку відновлено без змін. Випробування Равлика з’явиться після початку нової арки; відкриті кінцівки залишаться.' : saved ? 'Твою арку відновлено з цього браузера.' : 'Прогрес зберігається лише в цьому браузері.' }
  } catch { return { session: newSession(), notice: 'Сховище браузера недоступне. Можна грати, але прогрес збережеться лише до закриття сторінки.' } }
}

export function DatingGame() {
  const [loaded] = useState(loadSession)
  const [session, setSession] = useState(loaded.session)
  const [saveNotice, setSaveNotice] = useState(loaded.notice)
  const [confirmRestart, setConfirmRestart] = useState(false)
  const reduced = useReducedMotion()
  const { triggerRpu } = useSnailEffects()
  const { run } = session
  const episode = episodeById[run.nodeId]
  const ending = run.ending ? endings[run.ending] : null
  const reaction = episode.choices.find(choice => choice.id === run.pendingChoice)
  const line = run.phase === 'reaction' ? { speaker: 'Денис', text: reaction?.reaction ?? '' } : episode.lines[run.lineIndex]
  const readId = currentReadId(run)
  const canSkip = !!readId && session.seen.includes(readId)
  const index = episodes.findIndex(item => item.id === episode.id)
  const act = (action: Action) => {
    if (action.type === 'choose' && run.phase === 'choice' && episode.choices.find(choice => choice.id === action.choiceId)?.event === 'rpu') triggerRpu()
    setSession(current => transition(current, action))
  }
  useEffect(() => {
    try { localStorage.setItem(SAVE_KEY, serialize(session)) }
    catch { setSaveNotice('Автозбереження недоступне. Гра працює, але після закриття сторінки новий прогрес може зникнути.') }
  }, [session])

  return <main className="shell dating-game">
    <div className="game-breadcrumb"><Link to="/"><ArrowLeft size={15}/> До анкети Дениса</Link><span>VISUAL NOVEL · 18+ · {episodes.length} ЕПІЗОДІВ</span></div>
    <div className="game-page-title"><div className="section-label">LOVE IS WAR / ТВОЯ РОМАНТИЧНА КАМПАНІЯ</div><h1>Чи зможеш ти витягнути Дениса<br/>{' '}<span>з кімнати на побачення?</span></h1><p>Вибирай відповіді, знаходь спільну мову й відкривай кінцівки. Знання аніме необов’язкові. Щирість дуже бажана.</p></div>
    <div className="novel-layout"><section className="novel-main glass" aria-label="Симулятор побачень">
      <div className="novel-topline"><span>{ending ? ending.subtitle : episode.eyebrow}</span><span>{ending ? 'АРКУ ЗАВЕРШЕНО' : `${index + 1} / ${episodes.length}`}</span></div>
      <div className="game-art-frame"><AnimatePresence mode="wait" initial={false}><motion.div className="game-art" key={ending?.art ?? episode.art} initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.3 }}><GameArtwork art={ending?.art ?? episode.art}/></motion.div></AnimatePresence>{!ending && episode.id === 'scooter' && <FinanzamtSceneTrigger/>}<span className="game-art-note">{['strategy','anime','letter','snail'].includes(ending?.art ?? episode.art) ? 'СТИЛІЗОВАНА ІЛЮСТРАЦІЯ' : 'ЗГЕНЕРОВАНИЙ АРТ'}</span></div>
      {ending ? <div className="ending-content" aria-live="polite"><span className="ending-emblem"><Trophy size={24}/></span><span className="section-label">{ending.subtitle}</span><h2>{ending.title}</h2><blockquote>«{ending.line}»<cite>— Денис</cite></blockquote><p>{ending.text}</p><div className="ending-hint"><Sparkles size={16}/><span>{ending.hint}</span></div><button className="button primary" onClick={() => { setSession(current => restart(current)); setConfirmRestart(false) }}><RotateCcw size={17}/> Зіграти ще раз</button><p className="game-fiction">Усі події, показники й діалоги гри — комедійна вигадка за мотивами анкети.</p></div> : <div className="dialogue-area">
        <div className="dialogue-title"><h2><FinanzamtText text={episode.title}/></h2><span>{run.phase === 'choice' ? 'ТВІЙ ХІД' : run.phase === 'reaction' ? 'РЕАКЦІЯ НА ТВІЙ ВИБІР' : `${run.lineIndex + 1} / ${episode.lines.length}`}</span></div>
        {episode.id === 'snail' && <div className="snail-trial-note">Жодного реального РПУ чи бонусів у War Thunder. Вибір змінює лише вигадані показники цієї visual novel.</div>}
        <AnimatePresence mode="wait" initial={false}><motion.div key={`${run.nodeId}:${run.phase}:${run.lineIndex}:${run.pendingChoice}`} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.12 }}>
          {run.phase === 'choice' ? <div className="novel-choices"><p>Що відповіси Денису?</p>{episode.choices.map((choice, choiceIndex) => <button key={choice.id} onClick={() => act({ type: 'choose', choiceId: choice.id })}><span>{String(choiceIndex + 1).padStart(2,'0')}</span>{choice.text}<ArrowRight size={15}/></button>)}</div> : <div className="dialogue-bubble" aria-live="polite" aria-atomic="true"><span className="dialogue-speaker">{line.speaker}</span><p><FinanzamtText text={line.text}/></p></div>}
        </motion.div></AnimatePresence>
        <div className="novel-controls"><button className="button ghost" disabled={!canSkip} onClick={() => setSession(skipRead)} title={canSkip ? 'Пропустити вже прочитані репліки до нового тексту або вибору' : 'Доступно, коли ця репліка вже прочитана в попередній арці'}><SkipForward size={16}/> Пропустити прочитане</button>{run.phase !== 'choice' && <button className="button primary" onClick={() => act({type:'advance'})}>{run.phase === 'reaction' ? 'Продовжити' : 'Далі'}<ArrowRight size={16}/></button>}</div>
      </div>}
    </section><aside className="novel-sidebar">
      <div className="glass game-meters"><div className="section-label">ПУЛЬС РОМАНТИКИ</div>{[{key:'affection' as const,label:'Симпатія',icon:Heart},{key:'trust' as const,label:'Довіра',icon:Shield},{key:'outside' as const,label:'Бажання вийти',icon:ArrowRight}].map(({key,label,icon:Icon}) => <div className="game-meter" key={key}><div><span><Icon size={14}/>{label}</span><b>{run.metrics[key]}<small>/100</small></b></div><div className="stat-track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={run.metrics[key]}><motion.div initial={false} animate={{width:`${run.metrics[key]}%`}} transition={{duration:reduced ? 0 : .35}}/></div></div>)}<p>Вигадані показники. Кожен вибір змінює вашу спільну арку.</p></div>
      <details className="glass novel-history"><summary><History size={16}/> Історія реплік <span>{run.history.length}</span></summary><div className="history-log">{run.history.length ? run.history.map((entry,i) => <div key={i}><small>{entry.episode}</small><b>{entry.speaker}</b><p>{entry.text}</p></div>) : <p>Тут з’являться прочитані репліки й твої відповіді.</p>}</div></details>
      <details className="glass ending-collection"><summary><Trophy size={16}/> Колекція кінцівок <span>{session.unlocked.length} / {Object.keys(endings).length}</span></summary><div>{(Object.entries(endings) as [EndingId, typeof endings[EndingId]][]).map(([id,item],i) => <div key={id} className={session.unlocked.includes(id) ? 'ending-unlocked' : 'ending-locked'}>{session.unlocked.includes(id) ? <Check size={15}/> : <span>◇</span>}<span>{session.unlocked.includes(id) ? item.title : `Невідкрита кінцівка ${String(i+1).padStart(2,'0')}`}</span></div>)}</div></details>
      <HistoryAside session={session} onChoose={id=>act({type:'historyAside',choiceId:id})}/><RpuIndicator compact/><SoundToggle/>
      <div className="game-save-note" role="status">{saveNotice}</div>
      {!ending && <div className="restart-area">{confirmRestart ? <div><p>Почати арку заново? Відкриті кінцівки та прочитані репліки залишаться.</p><button className="button ghost" onClick={() => { setSession(current => restart(current)); setConfirmRestart(false) }}>Так, нова арка</button><button className="button ghost" onClick={() => setConfirmRestart(false)}>Продовжити цю</button></div> : <button className="button ghost" onClick={() => setConfirmRestart(true)}><RotateCcw size={15}/> Почати заново</button>}</div>}
    </aside></div>
  </main>
}
