export { prayers, prayerMessages, prayerCategoryNames, legacyPrayers } from '../data/quotes'
export type { PrayerMessage } from '../data/quotes'
export type { PrayerCategory } from '../audio/sounds'
export const rpuMessages = [
  'РПУ підвищено до 200%.', 'Рикошет від картонної броні.', 'Попадання без шкоди.',
  'Тебе знищили через 12 секунд після появи.', 'Равлик спостерігає.',
  'Сьогодні Gaijin вирішила, що перемог достатньо.',
]
export function randomOther(length: number, previous: number, random = Math.random): number {
  if (length <= 1) return 0
  const value = Math.max(0, Math.min(0.999999999, random()))
  if (previous < 0 || previous >= length) return Math.floor(value * length)
  const index = Math.floor(value * (length - 1))
  return index >= previous ? index + 1 : index
}
