import {soundAssets} from './assetVersions'
export const soundIds = ['hit-machinegun','non-penetration','ricochet','hit','tank-shot','explosion','achievement','rpu-warning','snail-blessing','snail-curse','hit-pazik'] as const
export type SoundId = typeof soundIds[number]
export const soundLabels: Record<SoundId,string> = {
  'hit-machinegun':'ПОПАДАНИЕ В ПУЛЕМЁТ', 'non-penetration':'НЕ ПРОБИЛ',ricochet:'РИКОШЕТ',hit:'ПОПАДАНИЕ',
  'tank-shot':'Постріл — вибуховий аналог',explosion:'Вибух — запис феєрверка',achievement:'Нагорода — CC0-мелодія','rpu-warning':'РПУ / секретна реакція Равлика','snail-blessing':'Благословення Равлика','snail-curse':'Прокляття Равлика',
  'hit-pazik':'ПОПАДАНИЕ В ПАЗИК',
}
export const unavailableSounds:Partial<Record<SoundId,string>> = {}
export const soundPath = (id:SoundId) => `/sounds/${id}.mp3?v=${soundAssets[id].version}`
export const soundGain = (id:SoundId):number => soundAssets[id].gain
export type PrayerCategory = 'blessing'|'curse'|'absurd'|'legendary'
export type MemeEffect = 'impact'|'armor'|'sparks'|'glitch'|'glow'|'legendary'|'burst'|'none'
export function soundForText(text:string, category?:PrayerCategory):SoundId {
  if(text.toLocaleUpperCase('ru-RU').includes('ПОПАДАНИЕ В ПАЗИК'))return 'hit-pazik'
  if(category==='blessing')return 'snail-blessing'
  if(category==='legendary')return 'achievement'
  const normalized=text.toLocaleUpperCase('ru-RU')
  if(normalized.includes('ПОПАДАНИЕ В ПУЛЕМЁТ'))return 'hit-machinegun'
  if(normalized.includes('НЕ ПРОБИЛ'))return 'non-penetration'
  if(normalized.includes('РИКОШЕТ'))return 'ricochet'
  if(/РПУ.*(ПРИД|АКТИВ)/.test(normalized))return 'rpu-warning'
  if(normalized.includes('ПОПАДАНИЕ'))return 'hit'
  if(/ВЗРЫВ|ВИБУХ|БАБАХ/.test(normalized))return 'explosion'
  if(/ВЫСТРЕЛ|ПОСТРІЛ/.test(normalized))return 'tank-shot'
  return category==='curse'?'snail-curse':'hit'
}
export const effectForSound:Record<SoundId,MemeEffect> = {'hit-machinegun':'impact','non-penetration':'armor',ricochet:'sparks',hit:'impact','tank-shot':'impact',explosion:'burst',achievement:'legendary','rpu-warning':'glitch','snail-blessing':'glow','snail-curse':'glitch','hit-pazik':'impact'}
