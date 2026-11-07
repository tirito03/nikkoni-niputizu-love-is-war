import { motion, useReducedMotion } from 'motion/react'
import { UnlockedHistoryScale } from './steam/SecretSteamLibrary'
import { useMemePopup } from './humor/MemePopup'
import { statPools } from './humor/catalog'
type Stat = { id?:string; label: string; value: number | null; note: string; reaction?: string }
const stats: Stat[] = [
  { id:'hoi4', label:'Залежність від HOI4', value:99, note:'Одна кампанія. П’ять історичних епох. Нуль відповідей у чаті.', reaction:'Генштаб повідомляє: 1% свободи зарезервовано під каву з тобою.' },
  { id:'war-thunder', label:'Стійкість до гринду War Thunder', value:100, note:'«Ще один бій» — одиниця вимірювання вічності.', reaction:'Пісюняра дослідив новий танк. Технологія «взутися» досі заблокована.' },
  { id:'anime', label:'Любов до аніме', value:100, note:'Манґа й фігурки — фізичні носії цієї операційної системи.', reaction:'Серце розширене: Рей — легенда, Віолета — слабкість, Хошіно Ай — ідол.' },
  { id:'outside', label:'Шанс вийти на вулицю', value:3, note:'Натисни: можливо, саме сьогодні вийде патч.', reaction:'Помилка 800: маршрут до кави перехоплено Міністерством самокатів.' },
  { id:'geopolitics', label:'Знання геополітики', value:95, note:'Переговори про побачення потребують карти й круасана.', reaction:'Денис пропонує пакт про взаємну симпатію та ненапад на полицю.' },
  { id:'romance', label:'Романтична компетентність', value:null, note:'Даних недостатньо. Потрібне польове дослідження в кафе.', reaction:'Код 418: фембой заварює чай. Серце ще обирає репліку.' },
  { id:'violet', label:'Захист від чарівності Віолети', value:0, note:'Один лист. Броні немає. Є почуття.', reaction:'Критичний урон від Віолети Еверґарден. Nikkoni Niputizu перетворився на калюжку.' },
  { id:'ai', label:'Стійкість до Хошіно Ай', value:0, note:'Ідол серця. Oshi no Ko вмикає фанатський режим.', reaction:'Уявні лайтстіки активовано. Пеніс урочисто оголосив себе міністерством фанатизму.' },
]

export function RpgStats({ legacy }: { legacy: Stat[] }) {
  const reduced = useReducedMotion()
  const { openPool } = useMemePopup()
  const renderStat = (stat: Stat, i: number, primary = false) => <div className="stat interactive-stat" key={stat.label}>
    <button className="stat-title" onClick={() => openPool({context:primary&&stat.id==='war-thunder'?'war-thunder-stat':'other-stat',key:`stat:${stat.label}`,title:stat.label,...(primary ? statPools[i] : {theme:'anime',quotes:[{quote:stat.reaction ?? stat.note,comment:'Додатковий запис аніме-паспорта героя.'},...statPools[2].quotes]})})} title={stat.note} aria-haspopup="dialog"><span>{stat.label}</span><b>{stat.value === null ? '???' : stat.value}<small>{stat.value === null ? 'невідомо' : '/100'}</small></b></button>
    <div className="stat-track" role={stat.value === null ? 'img' : 'meter'} aria-label={stat.value === null ? `${stat.label}: невідомо` : stat.label} aria-valuemin={stat.value === null ? undefined : 0} aria-valuemax={stat.value === null ? undefined : 100} aria-valuenow={stat.value ?? undefined} aria-valuetext={stat.value === null ? undefined : `${stat.value} зі 100`}><motion.div initial={{width:reduced ? `${stat.value ?? 40}%` : 0}} whileInView={{width:`${stat.value ?? 40}%`}} viewport={{once:true}} transition={{duration:reduced ? 0 : .8,delay:reduced ? 0 : i*.035}} className={stat.value === null ? 'unknown-stat' : ''}/></div><p>{stat.note}</p>
  </div>
  return <div className="glass stat-card">{stats.map((stat,i)=>renderStat(stat,i,true))}<details className="legacy-stats"><summary>Аніме-паспорт героя · ще {legacy.length} характеристик</summary><div>{legacy.map((stat,i)=>renderStat(stat,i))}</div></details><UnlockedHistoryScale/><p className="stats-disclaimer">* Усі характеристики — жартівливі та вигадані. Почуття не діляться на відсотки.</p></div>
}
