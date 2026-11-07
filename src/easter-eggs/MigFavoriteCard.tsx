import { motion, useReducedMotion } from 'motion/react'
import { Plane } from 'lucide-react'
import { SiteImage } from '../SiteImage'
import images from '../data/images.json'

export function MigFavoriteCard(){
  const reduced=useReducedMotion()
  return <motion.article className="glass favorite-card favorite-illustrated favorite-mig" whileHover={reduced?{}:{y:-5}}>
    <div className="favorite-media"><SiteImage {...images.mig29} alt="Реальний МіГ-29 Повітряних сил Бангладеш у польоті, фото Md Shaifuzzaman Ayon" loading="lazy" decoding="async"/></div>
    <div className="favorite-copy"><span className="favorite-role"><Plane size={14}/> НОВА ЛЮБОВ / ФОРСАЖ УВІМКНЕНО</span><h3>МіГ-29</h3><p className="favorite-anime">Єдина любов, яка має форсаж</p><p>Віолета пише листи. Хошіно Ай підкорює серця. А МіГ-29 просто вмикає форсаж — і Денис уже в пісюна каменный.</p><ul className="mig-jokes"><li>Замість романтичного побачення — бойовий виліт.</li><li>Його ідеал має два двигуни.</li><li>War Thunder подарувала Денису новий тип романтики.</li></ul><small className="mig-credit">Фото: <a href="https://commons.wikimedia.org/wiki/File:264,_Bangladesh_Air_Force_MiG-29_blue_scheme_aircraft_in_flight,_2018.jpg" target="_blank" rel="noreferrer">Md Shaifuzzaman Ayon / Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>. Зменшено розмір.</small></div>
  </motion.article>
}
