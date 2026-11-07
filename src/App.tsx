import React, { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowUpRight, Check, ChevronLeft, ChevronRight, Gamepad2, Heart, MapPin, Menu, MessageCircle, Plus, Sparkles, X } from 'lucide-react'
import images from './data/images.json'
import { SiteImage } from './SiteImage'
import { ScenePreview } from './ScenePreview'
import { ProfileExtras } from './ProfileExtras'
import { RpgStats } from './RpgStats'
import { DatingGame } from './game/DatingGame'
import { SnailEffectsProvider, HeaderSoundControl } from './snail/SnailEffects'
import { FinanzamtProvider } from './finanzamt/Finanzamt'
import { SecretSteamLibraryProvider } from './steam/SecretSteamLibrary'
import './styles.css'
import './profile-extras.css'
import './media-cards.css'
import { MemePopupProvider } from './humor/MemePopup'
import { CharacterCard } from './humor/CharacterCard'
import { IdealPartner } from './humor/IdealPartner'
import { MigFavoriteCard } from './easter-eggs/MigFavoriteCard'
import { ScrollVoiceMessage } from './easter-eggs/ScrollVoiceMessage'

const photos = images.photos.map((image, index) => ({
  ...image,
  title: ['Головний герой поза лобі', 'Рідкісний кадр', 'Денис cinematic universe'][index % 3] + ' · ' + String(index + 1).padStart(2, '0'),
  caption: 'Денис · фото ' + String(index + 1).padStart(2, '0'),
}))

const favorites = [
  { symbol: '◇', name: 'Рей Аянамі', anime: 'Євангеліон', role: 'Стара легенда', description: 'Перша велика класика. Почесне місце в серці, довічна прописка в лорі. Архівувати? Ні. Внести до ЮНЕСКО.', gameNote: 'Рей Аянамі охороняє архів старої легенди. Без поваги до класики вихід із кімнати не погоджено.' },
  { symbol: '✉', name: 'Віолета Еверґарден', anime: 'Violet Evergarden', role: 'Нова емоційна слабкість', description: 'Нова велика любов Дениса. Один лист — і фембой-стратег перетворюється на тактичну калюжку почуттів.', gameNote: 'Віолета Еверґарден — нова емоційна слабкість. Лист із запрошенням на каву завдає критичного удару по самотності.' },
  { symbol: '✦', name: 'Хошіно Ай', anime: 'Oshi no Ko / «Зоряне дитя»', role: 'Ідол серця', description: 'Окремий VIP-сектор у серці. Внутрішній фан-клуб Дениса вже розмахався уявними лайтстіками. Зупинити неможливо.', gameNote: 'Хошіно Ай — ідол серця. Уявні лайтстіки готові, а от Денис до виходу надвір — ще ні.' },
]

const heroStats = [
  { label: 'Повага до Рей — старої легенди', value: 100, note: 'Класика має імунітет до патчів і нових захоплень.' },
  { label: 'Емоційна слабкість до Віолети', value: 100, note: 'Нова велика любов. Захист від почуттів: 0.' },
  { label: 'Фанатський режим: Хошіно Ай', value: 100, note: 'Ідол серця. Лайтстіки споживають усю ману.' },
  { label: 'Культовість Oshi no Ko', value: 100, note: 'Це аніме для Дениса — культурна конституція кімнати.' },
  { label: 'Стратегія романтичного наступу', value: 91, note: 'У HOI IV є план. На «привіт» — екран завантаження.' },
  { label: 'Готовність вийти на побачення', value: 12, note: 'Кава кличе. Oshi no Ko шепоче: «Ще серію».' },
]

function Favorites({ game = false }: { game?: boolean }) {
  const reduced = useReducedMotion()
  return <div className={`favorites-grid${game ? ' game-favorites' : ''}`}>
    {favorites.map((item, index) => <motion.article whileHover={reduced ? {} : { y: -5 }} className={`glass favorite-card favorite-illustrated favorite-portrait-${index}`} key={item.name}>
      <div className="favorite-media"><SiteImage {...images.characters[index]} alt={`${item.name} — офіційне промозображення`} loading="lazy" decoding="async"/></div>
      <div className="favorite-copy">
      <span className="favorite-role">{item.role}</span>
      <h3>{item.name}</h3><p className="favorite-anime">{item.anime}</p>
      <p>{game ? item.gameNote : item.description}</p>
      </div>
    </motion.article>)}
    {!game&&<MigFavoriteCard/>}
  </div>
}

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  return <motion.div className={className} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.6 }}>{children}</motion.div>
}

function Header() {
  const [open, setOpen] = useState(false)
  return <header className="site-header"><div className="shell nav"><Link to="/" className="brand" aria-label="На головну"><span className="brand-icon">N<span>♡</span></span><span>NIKKONI<span className="brand-sub">LOVE IS WAR</span></span></Link><nav aria-label="Головна навігація" className={open ? 'nav-links mobile-open' : 'nav-links'}><a href="/#about" onClick={() => setOpen(false)}>Хто цей хлопець?</a><a href="/#stats" onClick={() => setOpen(false)}>Характеристики</a><a href="/#gallery" onClick={() => setOpen(false)}>Галерея</a><Link to="/game" onClick={() => setOpen(false)}>Симулятор <span className="tiny-badge">PLAY</span></Link></nav><HeaderSoundControl/><a className="nav-cta" href="/#apply">Познайомитись <Heart size={15}/></a><button className="menu-button icon-button" onClick={() => setOpen(!open)} aria-label={open ? 'Закрити меню' : 'Відкрити меню'} aria-expanded={open}>{open ? <X/> : <Menu/>}</button></div></header>
}

function Home() {
  const reduced = useReducedMotion()
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (selected === null) return
    lastFocus.current = document.activeElement as HTMLElement
    closeRef.current?.focus()
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
      if (event.key === 'ArrowRight') setSelected(i => i === null ? null : (i + 1) % photos.length)
      if (event.key === 'ArrowLeft') setSelected(i => i === null ? null : (i + photos.length - 1) % photos.length)
      if (event.key === 'Tab') {
        const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.lightbox button'))
        const first = buttons[0], last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = old; document.removeEventListener('keydown', onKey); lastFocus.current?.focus() }
  }, [selected !== null])
  return <>
    <main>
      <section className="hero shell">
        <div className="hero-copy"><Reveal><div className="eyebrow"><span className="status-dot"/> СЕРЦЕ ВІЛЬНЕ. КІМНАТА ЗАЙНЯТА.</div><h1>NIKKONI<br/><span>NIPUTIZU</span><span className="hero-star">✳</span></h1><div className="hero-name">Денис, 18 <span className="name-rule"/><span className="location"><MapPin size={15}/> Німеччина</span></div><p className="hero-description">Твій майбутній хлопець.<br/>Якщо зможеш відірвати його від <span>аніме.</span></p><div className="hero-aliases">ТАКОЖ ВІДОМИЙ ЯК <span>Пеніс</span><span>Пісюняра</span></div><p className="hero-aside">Народжений у Старокостянтинові. Призначений для великого кохання. Або ще однієї катки.</p><div className="hero-actions"><a className="button primary" href="#apply"><Heart size={18}/> Почати нашу арку <ArrowUpRight size={18}/></a><a className="text-link" href="#about">Спочатку розвідка <ArrowDown size={16}/></a></div><div className="hero-tags"><span><Sparkles size={13}/> Anime enjoyer</span><span><Gamepad2 size={13}/> Стратег кохання</span><span>♡ Фембой</span></div></Reveal></div>
        <Reveal className="hero-visual"><div className="portrait-frame"><div className="portrait-top"><span>PLAYER 01 / DENYS</span><span>SSR ✦</span></div><SiteImage className="hero-portrait" src={images.hero.src} alt="Денис — головний портрет" width={images.hero.width} height={images.hero.height} fetchPriority="high"/><div className="portrait-grid"/><span className="vertical-text">A NEW LOVE STORY IS LOADING</span><div className="portrait-caption"><span className="status-dot"/> У пошуку своєї людини <Heart size={16}/></div><div className="placeholder-note">NIKKONI NIPUTIZU · БЕЗ ФІЛЬТРІВ</div></div><div className="floating-note note-one"><span>恋</span> Love is war.<br/><b>Я поки в лобі.</b></div><div className="floating-note note-two"><Heart size={19}/> Рідкісний дроп<span>1 на весь сервер</span></div><div className="orbit-mark">✧</div></Reveal>
        <div className="hero-bottom"><span>SCROLL TO DISCOVER</span><ArrowDown size={14}/><span>ОБЕРЕЖНО: ВИСОКИЙ РІВЕНЬ ЛОРУ</span></div>
      </section>
      <div className="ticker" aria-hidden="true"><div>LOVE IS WAR <span>✦</span> РЕЙ — СТАРА ЛЕГЕНДА <span>✦</span> ВІОЛЕТА — НОВА СЛАБКІСТЬ <span>✦</span> АЙ — ІДОЛ СЕРЦЯ <span>✦</span> OSHI NO KO — КУЛЬТ КІМНАТИ <span>✦</span></div></div>

      <section id="about" className="shell section about"><Reveal><div className="section-label">01 / ЗНАЙОМСТВО З ПЕРСОНАЖЕМ</div><h2>Трохи лору.<br/>{' '}<span>Дуже багато Дениса.</span></h2><p className="section-intro">Не загадковий. Просто в навушниках.</p></Reveal><Reveal className="about-content"><div className="quote-mark">“</div><p className="bio-lead">Зі Старокостянтинова — у Німеччину.<br/>Із катки — в емоційний урон від аніме.</p><p>Знайомся, це Денис. 18 років, фембой за самовизначенням, колекціонер фігурок і манґи. Народився у Старокостянтинові, зараз живе в Німеччині й іноді приїжджає в Україну. В аніме-серці — ціла рада директорок: Рей Аянамі з «Євангеліону» — стара любов і легендарна класика; Віолета Еверґарден — нова велика любов та емоційна слабкість; Хошіно Ай — ідол серця з окремою фан-зоною.</p><p>Oshi no Ko / «Зоряне дитя» для нього — культове аніме. Обговорення може початися з «мені дуже подобається», а закінчитися засіданням фан-клубу на кухні. Полиця з фігурками вже просить окремий поштовий індекс.</p><p>У Hearts of Iron IV він будує стратегії, у War Thunder керує технікою. А тут шукає людину, з якою можна разом подивитися аніме й нарешті обрати, що замовити на вечерю. Це вже рівень складності «експерт».</p><div className="alias-row"><span>У ТИТРАХ ТАКОЖ:</span><span>Nikkoni Niputizu</span><span>Пеніс</span><span>Пісюняра</span></div><blockquote className="bio-quote">«Так вона стільки за годину заробляє».<cite>— легендарна жартівлива цитата Дениса про маму й самокат за 800 €; не відомості про реальні доходи родини.</cite></blockquote><div className="bio-note"><Heart size={17}/> За всіма нікнеймами — хлопець, який хоче бути комусь своїм.</div></Reveal></section>

      <section id="favorites" className="shell section" aria-labelledby="favorites-heading">
        <Reveal className="section-heading"><div><div className="section-label">02 / УЛЮБЛЕНІ АНІМЕ ТА ПЕРСОНАЖІ</div><h2 id="favorites-heading">Аніме-ієрархія <span>серця Дениса</span></h2></div><p className="section-side">ТРИ ЛЮБОВІ. ОДИН ДЕНИС. ПАТЧ СЕРЦЯ ВСТАНОВЛЕНО.</p></Reveal>
        <Reveal><Favorites/><div className="fandom-note"><Sparkles size={19}/><p><b>Oshi no Ko / «Зоряне дитя» — культове аніме Дениса.</b><br/>Хошіно Ай — ідол серця, але любов до самого аніме має власний VIP-абонемент. «Євангеліон» залишається класикою, а Violet Evergarden відкриває нову емоційну арку.</p></div></Reveal>
      </section>

      <section id="stats" className="shell section"><Reveal className="section-heading"><div><div className="section-label">03 / БІЛД ДЛЯ СТОСУНКІВ</div><h2>Характеристики <span>героя</span></h2></div><div className="stats-side"><span className="section-side">БАЛАНСУ НЕ БУЛО. Є ХАРИЗМА.</span><p className="stats-click-hint">Натисни на характеристику, щоб розкрити секретні дані</p></div></Reveal><div className="stats-layout"><Reveal><CharacterCard/></Reveal><Reveal><RpgStats legacy={heroStats}/></Reveal></div></section>

      <section id="gallery" className="shell section"><Reveal className="section-heading"><div><div className="section-label">04 / ФОТОДОКАЗИ ІСНУВАННЯ</div><h2>Денис <span>у кадрі</span></h2></div><p className="section-side">СПРАВЖНІ ФОТО. ТОЙ САМИЙ ЛЕГЕНДАРНИЙ ДЕНИС.</p></Reveal><div className="gallery">{photos.map((photo, i) => <Reveal key={photo.src}><button className="gallery-item" onClick={() => setSelected(i)} aria-label={`Відкрити: ${photo.title}`}><div className="gallery-image"><SiteImage src={photo.src} alt={photo.caption} width={photo.width} height={photo.height} loading="lazy" decoding="async"/><span className="photo-number">{String(i + 1).padStart(2, '0')}</span><span className="photo-expand"><Plus size={22}/></span></div><div className="gallery-caption"><h3>{photo.title}</h3><ArrowUpRight size={19}/></div><p>{photo.caption}</p></button></Reveal>)}</div></section>

      <ProfileExtras/>

      <section id="waifu" className="shell section"><Reveal><IdealPartner/></Reveal></section>

      <section className="shell game-section"><Reveal><Link to="/game" className="game-banner"><span className="game-icon"><Gamepad2 size={33}/></span><div><span className="section-label">ПОВНОЦІННА VISUAL NOVEL · 7 КІНЦІВОК</span><h2>Чи зможеш ти витягнути Дениса<br/>з кімнати на побачення?</h2><p>Шість епізодів, симпатія, довіра й самокат за 800 €. Рей береже класику, Віолета атакує почуття, Ай вмикає фан-режим. Почати гру →</p></div><span className="game-arrow"><ArrowUpRight size={29}/></span></Link></Reveal></section>

      <section id="apply" className="shell section apply-section"><Reveal className="apply-intro"><div className="section-label">06 / ПОЧАТОК ВАШОЇ АРКИ</div><h2>Зроби перший хід.<br/><span>Він ще обирає діалог.</span></h2><p>Велике кохання починається з маленького «привіт». Або зі спільної ненависті до невдалого матчмейкінгу.</p><div className="apply-sticker"><MessageCircle size={26}/><div>Шанс на взаємність?<br/><b>Точно вищий, ніж дроп потрібної фігурки.</b></div></div><span className="big-heart" aria-hidden="true">♡</span></Reveal><Reveal className="glass form-card"><div className="form-heading"><span>НОВЕ ЗНАЙОМСТВО</span><Heart size={18}/></div><form onSubmit={event => { event.preventDefault(); setSubmitted(true) }} onChange={() => submitted && setSubmitted(false)}><div className="form-row"><label>Як тебе звати?<input name="name" placeholder="Ім’я головної героїні / героя" required maxLength={60} autoComplete="given-name"/></label><label className="age-field">Твій вік<input name="age" type="number" placeholder="18+" required min={18} max={120}/></label></div><label>Де тебе знайти?<input name="contact" placeholder="@твій_нік або email" required maxLength={150}/></label><label>Твій перший хід<textarea name="message" placeholder="Привіт! Кава, прогулянка й обговорення Oshi no Ko?" required minLength={5} maxLength={1500} rows={4}/></label><label className="checkbox-label"><input type="checkbox" required/> <span>Мені є 18. Рей поважаю як класику, про Віолету й Ай лор прочитано.</span></label><button className="button primary submit-button" type="submit">{submitted ? <Check size={18}/> : <Heart size={18}/>} {submitted ? 'Заявку сформовано' : 'Сформувати заявку'} <ArrowUpRight size={18}/></button><p className="form-notice">Демо-форма: дані не надсилаються й не зберігаються.</p><AnimatePresence>{submitted && <motion.div className="success-message" role="status" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>♡ Перший хід готовий! Це лише попередній перегляд: Денис ще не отримав заявку. Після оновлення сторінки введені дані зникнуть.</motion.div>}</AnimatePresence></form></Reveal></section>
    </main>
    <AnimatePresence>{selected !== null && <motion.div className="lightbox" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setSelected(null)}><div className="lightbox-panel" role="dialog" aria-modal="true" aria-label={photos[selected].title} onClick={e => e.stopPropagation()}><button ref={closeRef} className="icon-button lightbox-close" aria-label="Закрити фото" onClick={() => setSelected(null)}><X/></button><div className="lightbox-image"><AnimatePresence mode="wait" initial={false}><motion.div key={photos[selected].src} initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.15 }}><SiteImage src={photos[selected].src} alt={photos[selected].caption} width={photos[selected].width} height={photos[selected].height}/></motion.div></AnimatePresence></div><div className="lightbox-controls"><button className="icon-button" aria-label="Попереднє фото" onClick={() => setSelected((selected + photos.length - 1) % photos.length)}><ChevronLeft/></button><div><h3>{photos[selected].title}</h3><p>{photos[selected].caption} · {selected + 1} / {photos.length}</p></div><button className="icon-button" aria-label="Наступне фото" onClick={() => setSelected((selected + 1) % photos.length)}><ChevronRight/></button></div></div></motion.div>}</AnimatePresence>
  </>
}

function Game() {
  return <><DatingGame/><section className="shell game-archive">
    <details><summary>Аніме-ієрархія: нагадування про лор Дениса</summary><Favorites game/><div className="fandom-note"><Sparkles size={19}/><p><b>Oshi no Ko / «Зоряне дитя» — культове аніме й головний охоронець кнопки «Ще серію».</b><br/>Рей — стара легенда, Віолета — нова велика симпатія, Хошіно Ай — ідол серця.</p></div></details>
    <details><summary>Переглянути всі наявні сюжетні арти</summary><ScenePreview/></details>
  </section></>
}
function ScrollToRoute() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'auto' })
    else window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])
  return null
}
function NotFound() { return <main className="coming-soon shell"><h1>404</h1><p>Ця арка ще не написана.</p><Link className="button primary" to="/">До анкети Дениса <ArrowUpRight size={18}/></Link></main> }
function Footer() { return <footer className="shell footer"><Link className="footer-brand" to="/">NIKKONI NIPUTIZU<span>LOVE IS WAR. АЛЕ МОЖНА Й БЕЗ ВІЙНИ.</span></Link><p>Гумористична анкета · 18+<br/>Зроблено з ♡ та легким крінжем.</p><a href="/#apply">Твоя арка починається тут <ArrowUpRight size={15}/></a></footer> }
export default function App() {
  return <BrowserRouter><SnailEffectsProvider><MemePopupProvider><FinanzamtProvider><SecretSteamLibraryProvider><ScrollToRoute/><Header/><ScrollVoiceMessage/><Routes><Route path="/" element={<Home/>}/><Route path="/game" element={<Game/>}/><Route path="*" element={<NotFound/>}/></Routes><Footer/></SecretSteamLibraryProvider></FinanzamtProvider></MemePopupProvider></SnailEffectsProvider></BrowserRouter>
}
