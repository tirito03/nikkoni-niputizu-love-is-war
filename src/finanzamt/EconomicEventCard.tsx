import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, ScanLine, Shield, Sparkles, Trash2, Trophy, X } from 'lucide-react'
import { randomOther } from '../snail/memes'
import './economic-event.css'

const ACHIEVEMENT_KEY = 'nikkoni-tax-consultant-v1'
const jobs = [
  'Вакансій немає. Навіть вигаданий HR не бачив трудового договору.',
  'Для працевлаштування потрібен дозвіл Великого Равлика.',
  'Ваше резюме передано в податкову. Випадково.',
  '800 € на годину? Навіть калькулятор попросив перерву.',
]
type Stage = 'closed' | 'quote' | 'connecting' | 'ready' | 'dossier' | 'deleting'
function readAchievement() {
  try { return localStorage.getItem(ACHIEVEMENT_KEY) === 'unlocked' } catch { return false }
}

export function EconomicEventCard() {
  const [stage, setStage] = useState<Stage>('closed')
  const [job, setJob] = useState(-1)
  const [lawyer, setLawyer] = useState(false)
  const [vacancy, setVacancy] = useState(false)
  const [achieved, setAchieved] = useState(readAchievement)
  const [achievementNotice, setAchievementNotice] = useState(false)
  const [storageFailed, setStorageFailed] = useState(false)
  const priceClicks = useRef(0)
  const dialog = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const card = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()
  const reduced = useReducedMotion()
  const navigate = useNavigate()
  const opened = stage !== 'closed'
  const dossierMode = ['connecting','ready','dossier','deleting'].includes(stage)

  useEffect(() => {
    if (!opened) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus({preventScroll:true})
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setStage('closed'); return }
      if (event.key !== 'Tab' || event.ctrlKey || event.metaKey || event.altKey) return
      const buttons = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
      const first = buttons[0], last = buttons[buttons.length-1]
      if (!buttons.includes(document.activeElement as HTMLButtonElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus() }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown',onKey)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown',onKey)
      if (opener.current?.isConnected) opener.current.focus({preventScroll:true})
    }
  }, [opened])
  useEffect(() => {
    if (stage === 'quote' || stage === 'dossier') {
      dialog.current?.scrollTo({top:0,behavior:'instant'})
      heading.current?.focus({preventScroll:true})
    }
    if (stage === 'connecting') {
      const timer = window.setTimeout(() => setStage('ready'), reduced ? 0 : 1100)
      return () => window.clearTimeout(timer)
    }
    if (stage === 'ready') {
      const timer = window.setTimeout(() => setStage('dossier'), reduced ? 0 : 550)
      return () => window.clearTimeout(timer)
    }
    if (stage === 'deleting') {
      const timer = window.setTimeout(() => { setStage('closed'); navigate('/') }, reduced ? 0 : 850)
      return () => window.clearTimeout(timer)
    }
  }, [stage,reduced,navigate])
  useEffect(() => {
    if (!achievementNotice) return
    const timer = window.setTimeout(() => setAchievementNotice(false), 5500)
    return () => window.clearTimeout(timer)
  }, [achievementNotice])

  const countPrice = () => {
    priceClicks.current = Math.min(5,priceClicks.current+1)
    if (priceClicks.current === 5 && !achieved) {
      setAchieved(true); setAchievementNotice(true)
      try { localStorage.setItem(ACHIEVEMENT_KEY,'unlocked') } catch { setStorageFailed(true) }
    }
  }
  const openQuote = () => {
    opener.current = document.activeElement as HTMLElement
    countPrice(); setJob(-1); setLawyer(false); setVacancy(false); setStage('quote')
  }
  const report = () => {
    priceClicks.current = 0
    setLawyer(false); setVacancy(false); setStage('connecting')
  }

  return <>
    <button type="button" ref={card} className="glass economic-card" onClick={openQuote} aria-haspopup="dialog" aria-label="800 євро — відкрити легендарну економічну подію"><span>800 €</span><Sparkles size={25} aria-hidden="true"/></button>
    {createPortal(<>
      <AnimatePresence>{opened && <motion.div className="economic-overlay" initial={{opacity:reduced ? 1 : 0}} animate={{opacity:1}} exit={{opacity:0,pointerEvents:'none'}} transition={{duration:reduced ? 0 : .15}} onClick={() => setStage('closed')}>
        <motion.div ref={dialog} className={`economic-panel${dossierMode ? ' economic-dossier-mode' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} initial={{y:reduced ? 0 : 14}} animate={{y:0}} transition={{duration:reduced ? 0 : .2}} onClick={event => event.stopPropagation()}>
          <div className="economic-topbar"><span>{dossierMode ? 'FINANZAMT / MEME PROTOCOL' : 'NIKKONI / SECRET ECONOMY'}</span><button type="button" className="icon-button" ref={closeButton} aria-label="Закрити економічну пасхалку" onClick={() => setStage('closed')}><X size={18}/></button></div>
          <div className="economic-body"><span className="economic-parody">ЛОКАЛЬНА ВИГАДАНА ПАРОДІЯ</span><h2 id={titleId} ref={heading} tabIndex={-1}>{dossierMode ? 'FINANZAMT: СПРАВА №800' : 'ЛЕГЕНДАРНА ЕКОНОМІЧНА ПОДІЯ'}</h2>
            <AnimatePresence mode="wait" initial={false}><motion.div key={stage} initial={{opacity:reduced ? 1 : 0,y:reduced ? 0 : 5}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:reduced ? 0 : .12}}>
              {stage === 'quote' && <>
                <button type="button" className="economic-hourly" onClick={countPrice} aria-label="800 євро за годину — дослідити цитату">800 <span>€/год</span><Sparkles size={20} aria-hidden="true"/></button>
                <blockquote className="economic-quote">«Так вона стільки за годину заробляє».</blockquote>
                <p className="economic-origin">Усе почалося з обговорення електросамоката. Закінчилося міжнародною фінансовою загадкою.</p>
                <p className="economic-origin">Далі — окреме вигадане оголошення про роботу. Воно не стосується професії чи доходів Дениса та його родичів.</p>
                <div className="economic-alert"><h3><ScanLine size={17}/> FINANZAMT ALERT</h3><ul><li>800 €/год? Цікаво. А можна уточнити назву професії?</li><li>У нашій базі вакансій таких зарплат немає. Навіть у розділі 18+.</li></ul></div>
                <div className="economic-actions"><button type="button" className="button ghost" onClick={() => setStage('closed')}>Закрити справу</button><button type="button" className="button economic-report" onClick={report}>Розпочати розслідування</button><button type="button" className="button ghost economic-job" onClick={() => { priceClicks.current=0; setJob(previous=>randomOther(jobs.length,previous)) }}>Я теж хочу таку роботу</button></div>
                <div className="economic-job-answer" role="status" aria-live="polite">{job >= 0 ? jobs[job] : ''}</div>
              </>}
              {(stage === 'connecting' || stage === 'ready') && <div className="economic-scanning" role="status" aria-live="polite"><span className={stage === 'ready' ? 'economic-scan-symbol is-ready' : 'economic-scan-symbol'}>{stage === 'ready' ? <Check size={42}/> : <ScanLine size={42}/>}</span><p>{stage === 'ready' ? 'ДОСЬЄ СФОРМОВАНО' : 'ВСТАНОВЛЮЄМО ЗВ’ЯЗОК ІЗ FINANZAMT...'}</p><div className="economic-scan-track" aria-hidden="true"><span/></div><small>Імітація зв’язку. Жодні дані нікуди не надсилаються.</small></div>}
              {stage === 'dossier' && <>
                <span className="economic-ready"><Check size={14}/> ДОСЬЄ СФОРМОВАНО</span>
                <dl className="economic-dossier">{[
                  ['Підозріла вакансія','800 €/год.'],['Галузь','Послуги преміумкласу.'],['Категорія оголошення','18+.'],['Опис роботи','Конфіденційно.'],['Дрескод','Під питанням.'],['Податкова декларація','Не знайдена в мемній базі.'],['Висновок','«Ми шукали бухгалтера, а потрапили не в той розділ вакансій».'],
                ].map(([label,value])=><div key={label}><dt>{label}:</dt><dd>{value}</dd></div>)}</dl>
                <p className={reduced ? 'economic-verdict' : 'economic-verdict economic-glitch'}>FINANZAMT ХОЧЕ ПОБАЧИТИ ТРУДОВИЙ ДОГОВІР</p><p className="economic-scooter-punchline">Вакансія вигадана. Кадрова паніка — теж. До реальних людей це досьє стосунку не має.</p>
                <motion.div className="economic-stamp" initial={reduced ? false : {scale:1.25,opacity:0,rotate:0}} animate={{scale:1,opacity:1,rotate:-8}} transition={{duration:reduced ? 0 : .35}}>MEME CASE</motion.div>
                <div className="economic-actions economic-dossier-actions"><button type="button" className="button economic-report" onClick={() => setVacancy(true)}>Переглянути вакансію</button><button type="button" className="button economic-destroy" onClick={() => setStage('deleting')}><Trash2 size={16}/> Знищити докази</button><button type="button" className="button ghost" onClick={() => setLawyer(true)}><Shield size={16}/> Викликати адвоката Равлика</button><button type="button" className="button ghost" onClick={() => setStage('quote')}>Повернутися до цитати</button></div>
                {vacancy && <div className="economic-lawyer economic-vacancy" role="status"><p>УВАГА! Вам має бути 18+, щоб дізнатися, чому німецька податкова так нервує.</p><small>Це весь «секрет вакансії»: локальна сатира, без реального оголошення чи переходу на інший сайт.</small></div>}
                {lawyer && <div className="economic-lawyer" role="status"><p>Святий Равлик Gaijin ознайомився зі справою. Для продовження захисту необхідно придбати преміумтехніку.</p><small>Це мемна репліка. Купувати нічого не потрібно.</small></div>}
              </>}
              {stage === 'deleting' && <div className="economic-deleting" role="status"><Trash2 size={42}/><p>Знищуємо уявні докази…</p><div className="economic-shred" aria-hidden="true">{Array.from({length:7},(_,i)=><span key={i} style={{animationDelay:`${i*.035}s`}}/>)}</div><small>Папку «Брат, повір» перетворено на конфеті. Повертаємося на головну.</small></div>}
            </motion.div></AnimatePresence>
            {achieved && <div className="economic-achievement" role="status"><Trophy size={19}/><div><strong>Податковий консультант Nikkoni Niputizu</strong><p>Ти знаєш про ці 800 € більше, ніж Finanzamt.</p>{storageFailed && <small>Сховище браузера недоступне: досягнення залишиться лише до закриття сторінки.</small>}</div></div>}
            <p className="economic-disclaimer" id={descriptionId}>Уся перевірка — вигадана пародія на легендарну цитату. Це не справжній державний документ і не відомості про доходи чи заняття реальних людей. Жодних зовнішніх запитів або надсилання даних.</p>
          </div>
        </motion.div>
      </motion.div>}</AnimatePresence>
      <AnimatePresence>{achievementNotice && <motion.aside className="economic-achievement-toast" role="status" initial={{opacity:reduced ? 1 : 0,y:reduced ? 0 : -8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:reduced ? 0 : .2}}><Trophy size={23}/><div><strong>Податковий консультант Nikkoni Niputizu</strong><p>Ти знаєш про ці 800 € більше, ніж Finanzamt.</p></div><button type="button" className="icon-button" aria-label="Приховати досягнення" onClick={() => setAchievementNotice(false)}><X size={16}/></button></motion.aside>}</AnimatePresence>
    </>,document.body)}
  </>
}
