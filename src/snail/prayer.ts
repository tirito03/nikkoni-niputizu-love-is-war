import { randomOther } from './memes'
import { pickPrayerPool } from './prayerPools'

export const TURMS_CHANCE = 0.04
export const SNAIL_SECRET_CHANCE = 0.03
export type PrayerOutcome = { kind: 'turms' } | { kind:'snail-secret' } | { kind: 'ordinary'; index: number }

// The rare roll is independent on every click; it never changes the real game.
export function rollPrayer(previous: number, random = Math.random): PrayerOutcome {
  const turms=random()<TURMS_CHANCE
  const secret=random()<SNAIL_SECRET_CHANCE
  if(turms)return {kind:'turms'}
  if(secret)return {kind:'snail-secret'}
  const pool=pickPrayerPool(random)
  // Exclude the previous quote inside its selected pool without changing category weights.
  const previousInPool=pool.indexes.indexOf(previous)
  const next=randomOther(pool.indexes.length,previousInPool,random)
  return { kind: 'ordinary', index: pool.indexes[next] }
}
