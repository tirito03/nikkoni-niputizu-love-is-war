import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import images from './data/images.json'
import { SiteImage } from './SiteImage'

export function ScenePreview() {
  const [current, setCurrent] = useState(0)
  const reduced = useReducedMotion()
  const scene = images.scenes[current]
  const duration = reduced ? 0 : 0.45
  return <section className="scene-preview glass" aria-labelledby="scene-preview-heading">
    <div className="scene-preview-heading"><div><span className="section-label">ГАЛЕРЕЯ СЮЖЕТНИХ АРТІВ</span><h2 id="scene-preview-heading">Три сцени. <span>Одна романтична місія.</span></h2></div><span className="scene-art-label">ЗГЕНЕРОВАНІ АРТИ</span></div>
    <div className="scene-stage">
      {images.scenes.map((item, index) => <motion.div className="scene-layer" key={item.id} initial={false} animate={{ opacity: index === current ? 1 : 0 }} transition={{ duration }} aria-hidden={index !== current}>
        <SiteImage src={item.src} alt={item.alt} width={item.width} height={item.height} decoding="async"/>
      </motion.div>)}
    </div>
    <div className="scene-tabs" role="group" aria-label="Обрати ілюстрацію">{images.scenes.map((item, index) => <button key={item.id} type="button" aria-pressed={index === current} onClick={() => setCurrent(index)}><span>0{index + 1}</span>{item.title}</button>)}</div>
    <div className="scene-story"><button className="icon-button" type="button" aria-label="Попередня сцена" onClick={() => setCurrent((current + images.scenes.length - 1) % images.scenes.length)}><ChevronLeft/></button>
      <div className="scene-description" aria-live="polite" aria-atomic="true"><AnimatePresence mode="wait" initial={false}><motion.div key={scene.id} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: duration / 2 }}><span className="section-label">{scene.label}</span><h3>{scene.title}</h3><p>{scene.description}</p></motion.div></AnimatePresence></div>
      <button className="icon-button" type="button" aria-label="Наступна сцена" onClick={() => setCurrent((current + 1) % images.scenes.length)}><ChevronRight/></button>
    </div>
    <p className="scene-preview-note">Це окрема галерея ілюстрацій. Перемикання артів не змінює проходження. Для сюжетного вибору повернися до діалогу вище.</p>
  </section>
}
