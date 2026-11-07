import assert from 'node:assert/strict'
import {loadTestModule} from './helpers/load-test-module.mjs'
const {rollPrayer,TURMS_CHANCE,SNAIL_SECRET_CHANCE}=await loadTestModule('snail/prayer')
const {prayers}=await loadTestModule('snail/memes')
const sequence=(...values)=>{let i=0;return()=>values[Math.min(i++,values.length-1)]}
assert.equal(TURMS_CHANCE,.04)
assert.equal(rollPrayer(-1,()=>0).kind,'turms')
assert.equal(rollPrayer(-1,()=>.0399999).kind,'turms')
assert.equal(rollPrayer(-1,()=>.04).kind,'ordinary')
assert.equal(rollPrayer(-1,()=>.999999).kind,'ordinary')
let rare=0
for(let i=0;i<10000;i++) {
  let calls=0
  const outcome=rollPrayer(-1,()=>calls++ === 0 ? (i+.5)/10000 : .5)
  if(outcome.kind==='turms') rare++
  else assert(outcome.index>=0 && outcome.index<prayers.length)
}
assert.equal(rare,400,'Exactly 4% of an evenly spaced probability grid must be rare')
const {prayerPools,activePrayerIndexes,pickPrayerPool}=await loadTestModule('snail/prayerPools')
assert.deepEqual(prayerPools.map(pool=>[pool.id,pool.weight,pool.indexes.length]),[['cult',65,16],['snail',20,10],['absurd',15,6]])
assert.equal(new Set(activePrayerIndexes).size,32,'No duplicate quotes across weighted groups')
assert(activePrayerIndexes.every(index=>index>=0&&index<prayers.length))
for(let previous=0;previous<prayers.length;previous++) {
  for(const category of [0,.6499999,.65,.8499999,.85,.9999999])for(const pick of [0,.2,.5,.9,.999999]) {
    const outcome=rollPrayer(previous,sequence(.5,.5,category,pick))
    assert.equal(outcome.kind,'ordinary')
    assert(activePrayerIndexes.includes(outcome.index),'Inactive author jokes never enter prayer')
    assert.notEqual(outcome.index,previous,'Ordinary prayers must not repeat immediately')
  }
}
for(const [value,id] of [[0,'cult'],[.64999999,'cult'],[.65,'snail'],[.84999999,'snail'],[.85,'absurd'],[.9999999,'absurd']])assert.equal(pickPrayerPool(()=>value).id,id)
// The previous result must not redistribute category weights, including when it is in that category.
for(const previous of [-1,...activePrayerIndexes]){
  const totals={cult:0,snail:0,absurd:0}
  for(let i=0;i<10000;i++){
    const result=rollPrayer(previous,sequence(.5,.5,(i+.5)/10000,.37))
    const pool=prayerPools.find(pool=>pool.indexes.includes(result.index))
    assert(pool);totals[pool.id]++
  }
  assert.deepEqual(totals,{cult:6500,snail:2000,absurd:1500})
}
for(const phrase of ['Святий Равлик почув твою молитву','Недостатньо донату','РПУ активовано','Попадання без шкоди','Равлик спостерігає','Ще 500 годин гринду']) assert(prayers.some(prayer=>prayer.includes(phrase)))
assert.equal(SNAIL_SECRET_CHANCE,.03)
assert.equal(rollPrayer(-1,sequence(.9,.0299999)).kind,'snail-secret')
assert.equal(rollPrayer(-1,sequence(.9,.03,.5)).kind,'ordinary')
assert.equal(rollPrayer(-1,sequence(0,0)).kind,'turms','TURMS wins when both independent rolls succeed')
const counts={turms:0,'snail-secret':0,ordinary:0}
for(let tank=0;tank<100;tank++)for(let secret=0;secret<100;secret++)counts[rollPrayer(-1,sequence((tank+.5)/100,(secret+.5)/100,.5)).kind]++
assert.deepEqual(counts,{turms:400,'snail-secret':288,ordinary:9312},'4% TURMS, independent 3% secret roll, TURMS priority')
let offset=0
for(const pool of prayerPools){
  const category=(offset+pool.weight/2)/100
  for(let local=0;local<pool.indexes.length;local++){
    const result=rollPrayer(-1,sequence(.5,.5,category,(local+.5)/pool.indexes.length))
    assert.equal(result.kind,'ordinary');assert.equal(result.index,pool.indexes[local],'Every active meme is reachable')
  }
  offset+=pool.weight
}
for(const text of ['ПОПАДАНИЕ В ПУЛЕМЁТ','ПОПАДАНИЕ В ПАЗИК','НЕ ПРОБИЛ','РИКОШЕТ','ПОПАДАНИЕ','РПУ ПРИДЁТ','УЛИТКА, ЗА ЧТО?!','ГДЕ МОЙ УРОН?!','ЕЩЁ ОДИН БОЙ И СПАТЬ'])assert(prayerPools[0].indexes.some(index=>prayers[index]===text))
console.log(`PASS 32 active prayers (16 cult / 10 snail / 6 absurd); exact 65/20/15 category weights with and without a previous result; no immediate repeats. Shared catalog kept: ${prayers.length}. TURMS 4%, secret roll 3% and TURMS priority unchanged.`)
