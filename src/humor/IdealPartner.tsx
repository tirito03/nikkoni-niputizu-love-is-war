import { BookOpen, Coffee, Compass, Crosshair, Gamepad2, Heart, Map, Shield, Sparkles, Sprout, Star } from 'lucide-react'
import { SiteImage } from '../SiteImage'
import images from '../data/images.json'
import { useMemePopup } from './MemePopup'
import { compatibilityQuotes } from './catalog'

const criteria = [
  [Heart,'Не ревнує до Віолети Евергарден (або хоча б приховує це).'],
  [Gamepad2,'Знає, що «ще один бій» у War Thunder — це мінімум дві години.'],
  [Map,'Не питає, навіщо Денису 400 дивізій у HOI4.'],
  [Star,'Може відрізнити Хошіно Ай від Рей Аянамі.'],
  [Shield,'Не викликає Finanzamt після згадки 800 €.'],
  [BookOpen,'Готова вислухати лекцію про геополітику XX століття.'],
  [Crosshair,'Розуміє, що «ПОПАДАНИЕ В ПУЛЕМЁТ» — це особиста трагедія.'],
  [Sparkles,'Не заважає молитві Святому Равлику.'],
  [Sprout,'Здатна витягнути Дениса з кімнати хоча б один раз на тиждень.'],
  [Compass,'Має почуття гумору й власні інтереси.'],
] as const

export function IdealPartner() {
  const {openPool}=useMemePopup()
  // Existing photo 04: a smile outdoors. Change this reference to swap the photo.
  const portrait=images.photos[3]
  return <div className="waifu-panel waifu-recruitment">
    <div className="waifu-art waifu-photo"><SiteImage {...portrait} alt="Усміхнений Денис на вулиці — фото для секції ідеальної половинки" loading="lazy" decoding="async"/><div className="waifu-photo-shade" aria-hidden="true"/><span className="waifu-photo-heart heart-a" aria-hidden="true">♡</span><span className="waifu-photo-heart heart-b" aria-hidden="true">♡</span><div className="waifu-photo-caption"><span>PLAYER 01 / ШУКАЄ CO-OP</span><strong>Вийшов надвір.<br/>Є фотодоказ.</strong><p>Трава поруч. Герой тримається.</p></div></div>
    <div className="waifu-content"><div className="section-label">05 / КОСПЛЕЙ НЕ Є ВИМОГОЮ</div><h2>Ідеальна <span>половинка</span></h2><p className="waifu-vacancy">Вакансія відкрита. Конкуренція з аніме-персонажами критична.</p><p>Денис шукає людину, яка зможе конкурувати з Віолетою Евергарден, пережити 800 годин HOI4 і не запитувати, чому він знову молиться Равлику.</p>
      <ul className="waifu-list waifu-meme-list">{criteria.map(([Icon,text])=><li key={text}><Icon size={16}/><span>{text}</span></li>)}</ul>
      <div className="partner-status"><span className="favorite-role">СТАТУС ПОШУКУ ПОЛОВИНКИ</span><p>Кандидатів знайдено: <b>???</b></p><span className="partner-competition-label">Конкуренція:</span><ul><li>Віолета Евергарден <b>критична</b></li><li>Хошіно Ай <b>неможливо перемогти</b></li><li>HOI4 <b>99%</b></li><li>War Thunder <b>100%</b></li><li>Реальний світ <b>очікує підключення</b></li></ul><div className="partner-chance"><span>Ймовірність успішного побачення: <b>3%</b></span><div role="meter" aria-label="Ймовірність успішного побачення — жартівлива статистика" aria-valuemin={0} aria-valuemax={100} aria-valuenow={3}><span/></div></div><small>Суто жартівлива статистика. Це не прогноз і не оцінка реальних людей.</small></div>
      <button type="button" className="button primary partner-check" aria-haspopup="dialog" onClick={()=>openPool({key:'compatibility',title:'МЕМНИЙ ТЕСТ СУМІСНОСТІ',theme:'anime',quotes:compatibilityQuotes,buttonLabel:'Перевірити ще раз'})}><Coffee size={18}/>Перевірити сумісність із Денисом</button>
      <div className="waifu-bottom">Головний критерій: <b>бути собою.</b><Heart size={16}/></div>
    </div>
  </div>
}
