import { prayers, randomOther } from './memes'

export const TURMS_CHANCE = 0.04
export type PrayerOutcome = { kind: 'turms' } | { kind: 'ordinary'; index: number }

// The rare roll is independent on every click; it never changes the real game.
export function rollPrayer(previous: number, random = Math.random): PrayerOutcome {
  if (random() < TURMS_CHANCE) return { kind: 'turms' }
  return { kind: 'ordinary', index: randomOther(prayers.length, previous, random) }
}
