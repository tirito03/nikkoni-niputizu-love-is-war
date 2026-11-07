import { motion, useReducedMotion } from 'motion/react'
import { BookOpen, Heart } from 'lucide-react'
import { GameMemeButton } from './humor/GameMemeButton'
import { SiteImage } from './SiteImage'
import images from './data/images.json'
import { SnailCult } from './snail/SnailCult'
import { EconomicEventCard } from './finanzamt/EconomicEventCard'
import { SecretLibraryTrigger } from './steam/SecretSteamLibrary'

export function ProfileExtras() {
  const reduced = useReducedMotion()
  return <>
    <section className="shell section profile-extra" id="gaming"><div className="section-label">БОНУСНИЙ ЛОР / ІГРИ</div><h2>Геймерська кар’єра <span>Дениса</span></h2><p className="section-intro">Два фронти. Одне крісло. Побачення просить перемир’я.</p><div className="career-grid">
      <motion.article className="glass career-card" whileHover={reduced ? {} : {y:-5}}><SiteImage className="career-cover" {...images.games.hoi4} alt="Hearts of Iron IV — офіційна обкладинка Steam" loading="lazy" decoding="async"/><span className="favorite-role">ГЛОБАЛЬНИЙ СТРАТЕГ · НЕСКІНЧЕННА КАМПАНІЯ</span><h3>Hearts of Iron IV</h3><p>Історія, геополітика, військові кампанії та стратегічне планування. Щоб запросити Дениса на каву, бажано підготувати логістику, резервний круасан і пакт про ненапад на вільний вечір.</p><div className="career-perk">Пасивна здібність: «Збережуся — і ще один історичний поворот».</div><GameMemeButton game="hoi4"/></motion.article>
      <motion.article className="glass career-card" whileHover={reduced ? {} : {y:-5}}><SiteImage className="career-cover" {...images.games.warThunder} alt="War Thunder — офіційна обкладинка Steam" loading="lazy" decoding="async"/><span className="favorite-role">ТАНКИ · ЛІТАКИ · СВЯЩЕННИЙ ГРИНД</span><h3>War Thunder</h3><p>Денис любить військову техніку й прокачування. Коли він каже «ще один бій», десь старіє календар. Стратегія побачення: дочекатися завершення матчу й не дати кнопці «В бій!» перехопити ініціативу.</p><div className="career-perk">Рідкісний трофей: хлопець, який сам зняв навушники.</div><GameMemeButton game="war"/></motion.article>
    </div><SecretLibraryTrigger/></section>
    <SnailCult/>
    <section className="shell section profile-extra" id="collection"><div className="section-label">МУЗЕЙ КІМНАТНОГО ЗНАЧЕННЯ</div><h2>Манґа, фігурки <span>й трохи святого місця</span></h2><div className="collection-panel glass"><div className="collection-visual" aria-hidden="true"><div className="book-spines">{['N','I','K','K','O','N','I'].map((letter,i)=><span key={i}>{letter}</span>)}</div><div className="shelf-figure">✦<span>♡</span></div><div className="shelf-line"/></div><div><BookOpen size={24}/><h3>Полиця — не меблі. Це емоційна інфраструктура.</h3><p>Денис колекціонує манґу й фігурки. Рей має місце почесної легенди, Віолета отримала нову емоційну арку, а Хошіно Ай очолює фан-сектор Oshi no Ko. Усе це чудово співіснує. Вільне місце — вже ні.</p><p className="collection-rule"><Heart size={15}/> Можна не поділяти всі захоплення. Поважати їх — найкращий спосіб почати знайомство.</p></div></div></section>
    <section className="shell section profile-extra" id="memes"><div className="section-label">АРХІВ ЛЕГЕНДАРНОГО КРІНЖУ</div><h2>Цитати, меми <span>й економіка кохання</span></h2><div className="meme-grid"><EconomicEventCard/><div className="meme-side"><article className="glass"><span className="favorite-role">ВИГАДАНА РЕПЛІКА ЗА МОТИВАМИ АНКЕТИ</span><blockquote>«Я не ігнорую. Я стратегічно перегруповую відповідь».</blockquote><p>Підпис: Nikkoni Niputizu. Печатка: навушники.</p></article><article className="glass"><span className="favorite-role">АБСУРДНИЙ ФАКТ ІЗ МЕМНОГО ВСЕСВІТУ</span><blockquote>Пеніс і Пісюняра — один хлопець. Просто два рівні доступу до лору.</blockquote><p>Романтична компетентність невідома. Харизму помічено.</p></article></div></div></section>
  </>
}
