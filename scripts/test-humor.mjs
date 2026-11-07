import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {loadTestModule} from './helpers/load-test-module.mjs'
const {warThunderQuotes,statPools,compatibilityQuotes,passiveQuotes,allMemeQuotes,hitPazik}=await loadTestModule('humor/catalog')
const {withRandomComment}=await loadTestModule('data/quoteModel')
const {prayerMessages,prayers,legacyPrayers,randomOther}=await loadTestModule('snail/memes')
const {soundIds,soundForText,unavailableSounds}=await loadTestModule('audio/sounds')
const required=['ПОПАДАНИЕ В ПУЛЕМЁТ','НЕ ПРОБИЛ','РИКОШЕТ','ПОПАДАНИЕ','РПУ ПРИДЁТ','УЛИТКА, ЗА ЧТО?!','ЕЩЁ ОДИН БОЙ И СПАТЬ','СНАРЯД НЕ НАНЁС УРОНА','РАЗВЕДКА','ГДЕ МОЙ УРОН?!','БАЛАНС ПО-ГАЙДЖИНОВСКИ','ПРЕМИУМ НЕ ПОМОГ','МИНУС 500 000 СЕРЕБРА','Я ЖЕ ПОПАЛ!','ЭТО НЕ БАГ, ЭТО МЕХАНИКА']
for(const quote of required)assert(warThunderQuotes.some(entry=>entry.quote===quote),quote)
assert(warThunderQuotes.length>=55,'Previous 35 plus at least 20 new War Thunder memes')
assert.equal(statPools.length,8)
for(const pool of [warThunderQuotes,...statPools.map(pool=>pool.quotes),compatibilityQuotes,passiveQuotes,prayerMessages]){
  assert(pool.length>=6)
  assert.equal(new Set(pool.map(entry=>entry.quote)).size,pool.length,'A different index must also mean a different quote')
  for(const entry of pool)assert(entry.quote.trim()&&entry.comment.trim(),'Each quote needs a comment')
  for(let previous=0;previous<pool.length;previous++)for(const random of [0,.2,.5,.99])assert.notEqual(pool[randomOther(pool.length,previous,()=>random)].quote,pool[previous].quote)
}
assert(prayerMessages.length>=30)
for(const category of ['blessing','curse','absurd','legendary'])assert(prayerMessages.some(entry=>entry.category===category))
for(const quote of legacyPrayers)assert(prayers.includes(quote),'Original prayers are preserved')
for(const quote of JSON.parse(await fs.readFile('scripts/fixtures/prayers-v1.json','utf8')))assert(prayers.includes(quote),'All previous 44 prayer results are preserved')
for(const quote of warThunderQuotes){
  assert(prayerMessages.includes(quote),'Prayer reuses the canonical War Thunder object')
  assert(statPools[1].quotes.includes(quote),'RPG reuses the same canonical object')
  assert.deepEqual(quote.uses,['rpg','prayer','popup'])
}
assert.equal(new Set(allMemeQuotes.map(quote=>quote.id)).size,allMemeQuotes.length)
for(const quote of allMemeQuotes){assert(quote.id&&quote.comment&&quote.category&&quote.theme&&quote.effect&&quote.uses.length);assert(soundIds.includes(quote.sound))}
for(const [text,sound] of [['ПОПАДАНИЕ В ПУЛЕМЁТ','hit-machinegun'],['НЕ ПРОБИЛ','non-penetration'],['РИКОШЕТ','ricochet'],['ПОПАДАНИЕ','hit'],['РПУ ПРИДЁТ','rpu-warning']])assert.equal(prayerMessages.find(quote=>quote.quote===text)?.sound,sound)
assert.equal(hitPazik.category,'absurd')
assert.equal(hitPazik.sound,'hit-pazik')
assert.equal(hitPazik.effect,'impact')
assert.equal(soundForText(hitPazik.quote),'hit-pazik','Specific Pazik mapping must precede generic hit mapping')
assert.equal(unavailableSounds['hit-pazik'],undefined,'User-supplied Pazik recording is installed')
assert.equal(hitPazik.comments.length,5)
assert.equal(new Set(hitPazik.comments).size,5)
for(let i=0;i<5;i++)assert.equal(withRandomComment(hitPazik,()=>(i+.5)/5).comment,hitPazik.comments[i])
assert.equal(withRandomComment(warThunderQuotes[0]),warThunderQuotes[0],'Existing quotes stay unchanged')
assert.equal(hitPazik.comment,hitPazik.comments[0],'Random comments never mutate the canonical quote')
assert(warThunderQuotes.includes(hitPazik)&&statPools[1].quotes.includes(hitPazik)&&prayerMessages.includes(hitPazik))
console.log(`PASS ${warThunderQuotes.length} War Thunder memes; 8 independent stat pools; ${prayerMessages.length} categorized prayers; unique quotes, comments and non-repeats; original prayers preserved.`)
