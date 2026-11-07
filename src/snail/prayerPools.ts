import { prayerMessages } from '../data/quotes'

// Prayer-only selection. The complete shared catalog stays available to RPG and other sections.
const indexes = new Map(prayerMessages.map((message,index)=>[message.quote,index]))
const select = (quotes:readonly string[]) => quotes.map(quote=>{
  const index=indexes.get(quote)
  if(index===undefined)throw Error(`Unknown prayer quote: ${quote}`)
  return index
})

export const prayerPools = [
  {id:'cult',weight:65,indexes:select([
    'ПОПАДАНИЕ В ПУЛЕМЁТ','ПОПАДАНИЕ В ПАЗИК','НЕ ПРОБИЛ','РИКОШЕТ','ПОПАДАНИЕ',
    'РПУ ПРИДЁТ','УЛИТКА, ЗА ЧТО?!','ГДЕ МОЙ УРОН?!','ЕЩЁ ОДИН БОЙ И СПАТЬ',
    'СНАРЯД НЕ НАНЁС УРОНА','РАЗВЕДКА','БАЛАНС ПО-ГАЙДЖИНОВСКИ','ПРЕМИУМ НЕ ПОМОГ',
    'МИНУС 500 000 СЕРЕБРА','Я ЖЕ ПОПАЛ!','ЭТО НЕ БАГ, ЭТО МЕХАНИКА',
  ])},
  {id:'snail',weight:20,indexes:select([
    'Святий Равлик почув твою молитву. +10% до пробиття.',
    'Недостатньо донату. Молитву відхилено.',
    'Равлик благословив тебе на 500 годин гринду.',
    'Твій снаряд зник. Равлик так вирішив.',
    'Равлик спостерігає. Денис удає, що не бачить трави за вікном.',
    'РПУ тимчасово пішло у відпустку.',
    'Благословення на побачення після матчу.',
    'Прокляття вічного ремонту гусениці.',
    'Равлик благословив твою кнопку виходу',
    'Рідкісне диво: Денис погодився на прогулянку.',
  ])},
  {id:'absurd',weight:15,indexes:select([
    'Равлик запросив довідку від Finanzamt.',
    'Небесна канцелярія переплутала молитву з заявкою на побачення.',
    'Замість благословення надіслано круасан.',
    'Молитву прийнято у форматі HOI4-save.',
    'Диспетчер Равлика пішов дивитися Oshi no Ko',
    'Твою молитву прийняла манґа на полиці',
  ])},
] as const

export type PrayerPoolId = typeof prayerPools[number]['id']
export const activePrayerIndexes = prayerPools.flatMap(pool=>pool.indexes)

export function pickPrayerPool(random:()=>number=Math.random){
  const value=Math.max(0,Math.min(.999999999,random()))*100
  let boundary=0
  for(const pool of prayerPools){boundary+=pool.weight;if(value<boundary)return pool}
  return prayerPools[prayerPools.length-1]
}
