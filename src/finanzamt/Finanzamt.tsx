import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ScanLine, X } from 'lucide-react'
import './finanzamt.css'

const FinanzamtContext = createContext<(() => void) | null>(null)
export function useFinanzamt() {
  const open = useContext(FinanzamtContext)
  if (!open) throw Error('Finanzamt easter egg requires its provider')
  return open
}

export function FinanzamtProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [audited, setAudited] = useState(false)
  const closeButton = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()
  const { pathname, hash } = useLocation()
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => { setVisible(false) }, [pathname, hash])
  useEffect(() => {
    if (!visible) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus({preventScroll:true})
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setVisible(false) }
      if (event.key !== 'Tab' || event.ctrlKey || event.metaKey || event.altKey) return
      const buttons = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
      const first = buttons[0], last = buttons[buttons.length - 1]
      if (!buttons.includes(document.activeElement as HTMLButtonElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus() }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
      if (returnFocus.current?.isConnected) returnFocus.current.focus({preventScroll:true})
    }
  }, [visible])
  const open = () => {
    returnFocus.current = document.activeElement as HTMLElement
    setAudited(false); setVisible(true)
  }
  return <FinanzamtContext.Provider value={open}>{children}<AnimatePresence>{visible && <motion.div className="finanzamt-overlay" initial={{opacity:reduced ? 1 : 0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced ? 0 : .15}} onClick={() => setVisible(false)}>
    <motion.div className="finanzamt-panel" ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} initial={{y:reduced ? 0 : 14}} animate={{y:0}} transition={{duration:reduced ? 0 : .2}} onClick={event => event.stopPropagation()}>
      <div className="finanzamt-topline"><span>FINANZAMT.exe / ПАСХАЛКУ ЗНАЙДЕНО</span><button className="icon-button" ref={closeButton} aria-label="Закрити повідомлення Finanzamt" onClick={() => setVisible(false)}><X size={18}/></button></div>
      <div className="finanzamt-scan" aria-hidden="true"><ScanLine size={37}/><span>800 €</span><div className="finanzamt-scan-beam"/></div>
      <span className="finanzamt-parody">ПАРОДІЯ НА СИСТЕМНЕ СПОВІЩЕННЯ</span><h2 id={titleId}>Finanzamt помітив <span>твій мем.</span></h2>
      <p className="finanzamt-detected">Виявлено заявлений дохід: <strong>800 €/год</strong>.</p><p className="finanzamt-status">Статус: Денис наговорив зайвого.</p>
      <div className="finanzamt-chat"><p><b>Денис</b><span>«Та моя мама стільки за годину заробляє». Я взагалі-то про самокат…</span></p><p><b>Finanzamt.exe</b><span>Зрозуміло. Відкриваємо таблицю «Круасани, фігурки та необережні цитати».</span></p></div>
      {audited ? <div className="finanzamt-punchline" role="status" aria-live="polite"><ScanLine size={20}/><p>Денис, ми просто хотіли дізнатися, де купити самокат.</p><small>Денис: «Фух. А я вже сховав манґу в графу “витрати”».</small></div> : <button className="button finanzamt-audit" onClick={() => setAudited(true)}><ScanLine size={17}/> Почати податкову перевірку</button>}
      <p className="finanzamt-disclaimer" id={descriptionId}>Це жарт за мотивами цитати Дениса, а не справжній державний документ чи відомості про доходи родини. Ніяких перевірок, збору даних або зв’язку з податковою.</p>
    </motion.div>
  </motion.div>}</AnimatePresence></FinanzamtContext.Provider>
}

export function FinanzamtText({ text }: { text: string }) {
  const open = useFinanzamt()
  const parts = text.split(/(800\s*€)/g)
  return <>{parts.map((part,index) => /^800\s*€$/.test(part) ? <button type="button" key={index} className="finanzamt-inline" onClick={open} aria-label="800 євро — відкрити пасхалку Finanzamt" aria-haspopup="dialog" title="Обережно: Finanzamt читає цей чат">{part}</button> : part)}</>
}

export function FinanzamtSceneTrigger() {
  const open = useFinanzamt()
  return <button type="button" className="finanzamt-scene-trigger" onClick={open} aria-label="800 євро на самокаті — відкрити пасхалку Finanzamt" aria-haspopup="dialog"><ScanLine size={15}/>800 €</button>
}
