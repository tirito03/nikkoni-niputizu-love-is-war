import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
const output = path.resolve('work/prayer-tests')
await fs.mkdir(output,{recursive:true})
for(const name of ['memes','prayer']) {
  const source = await fs.readFile(`src/snail/${name}.ts`,'utf8')
  const compiled = ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replaceAll("'./memes'","'./memes.mjs'")
  await fs.writeFile(path.join(output,`${name}.mjs`),compiled)
}
const { rollPrayer, TURMS_CHANCE } = await import(pathToFileURL(path.join(output,'prayer.mjs')).href)
const { prayers } = await import(pathToFileURL(path.join(output,'memes.mjs')).href)
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
for(let previous=0;previous<prayers.length;previous++) {
  for(const pick of [0,.2,.5,.9,.999999]) {
    let calls=0
    const outcome=rollPrayer(previous,()=>calls++ === 0 ? .5 : pick)
    assert.equal(outcome.kind,'ordinary')
    assert.notEqual(outcome.index,previous,'Ordinary prayers must not repeat immediately')
  }
}
for(const phrase of ['Святий Равлик почув твою молитву','Недостатньо донату','РПУ активовано','Попадання без шкоди','Равлик спостерігає','Ще 500 годин гринду']) assert(prayers.some(prayer=>prayer.includes(phrase)))
console.log('PASS probability boundary, 400/10000 rare outcomes, ordinary non-repeats, all required ordinary jokes.')
