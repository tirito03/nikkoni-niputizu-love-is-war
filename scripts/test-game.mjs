import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const target = path.resolve('work/game-tests')
await fs.mkdir(target, { recursive: true })
for (const name of ['story','engine']) {
  const source = await fs.readFile(`src/game/${name}.ts`,'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText.replaceAll("'./story'", "'./story.mjs'")
  await fs.writeFile(path.join(target, `${name}.mjs`), compiled)
}
const engine = await import(pathToFileURL(path.join(target,'engine.mjs')).href)
const story = await import(pathToFileURL(path.join(target,'story.mjs')).href)
const { newSession, transition, parseSave, serialize, skipRead, restart, currentReadId } = engine
const { episodes, episodeById, endings } = story
const legacyFixtures=JSON.parse(await fs.readFile('scripts/fixtures/legacy-v1.json','utf8'))
let checks = 0
function check(label, run) { run(); checks++; console.log(`PASS ${label}`) }
function toDecision(session) {
  let current = session
  for(let n=0;n<40;n++) {
    if(current.run.phase === 'choice' || current.run.phase === 'ending') return current
    const next = transition(current,{type:'advance'})
    assert.notEqual(next,current,'Dialogue progression must not get stuck')
    current=next
  }
  throw Error('Dialogue loop detected')
}
function play(ids) {
  let session=newSession()
  for(const id of ids) {
    session=toDecision(session)
    assert.equal(session.run.phase,'choice')
    const next=transition(session,{type:'choose',choiceId:id})
    assert.notEqual(next,session,`Choice ${id} must exist`)
    session=transition(next,{type:'advance'})
  }
  return session
}

check('Every episode has 2–4 choices, valid links, reactions and a terminal result',()=>{
  assert.equal(episodes.length,6)
  for(const episode of episodes) {
    assert(episode.choices.length>=2 && episode.choices.length<=4)
    assert(episode.lines.length>=2)
    assert.equal(new Set(episode.choices.map(choice=>choice.id)).size,episode.choices.length)
    for(const choice of episode.choices) {
      assert(choice.reaction.length>0)
      assert.equal(Number(!!choice.next)+Number(!!choice.ending)+Number(!!choice.resolve),1)
      if(choice.next)assert(episodeById[choice.next])
      if(choice.ending)assert(endings[choice.ending])
    }
  }
})

const reached=new Map()
let paths=0
function explore(start, choices=[]) {
  const session=toDecision(start)
  for(const metric of Object.values(session.run.metrics))assert(metric>=0 && metric<=100)
  assert.deepEqual(parseSave(serialize(session)),session,'Every decision/end must round-trip through storage')
  if(session.run.phase==='ending') {
    paths++
    reached.set(session.run.ending,choices)
    assert(session.unlocked.includes(session.run.ending))
    return
  }
  assert(choices.length<=episodes.length,'Story should be finite')
  for(const choice of episodeById[session.run.nodeId].choices)explore(transition(session,{type:'choose',choiceId:choice.id}),[...choices,choice.id])
}
check('Explore every dialogue path; seven distinct endings, bounded meters, restorable progress',()=>{
  explore(newSession())
  assert.deepEqual([...reached.keys()].sort(),Object.keys(endings).sort())
  assert.equal(new Set(Object.values(endings).map(ending=>ending.art)).size,7,'Each ending must have its own illustration')
})
check('A player without anime knowledge can reach Good and True endings',()=>{
  assert.equal(play(['pause','curious','treaty','budget','walk','cafe']).run.ending,'good')
  assert.equal(play(['corridor','curious','treaty','budget','walk','nikkoni']).run.ending,'true')
})
check('Secret ending requires a previous scooter joke, not just the final reply',()=>{
  assert.equal(play(['corridor','curious','treaty','invoice','walk','summit']).run.ending,'secret')
  assert.equal(play(['corridor','curious','treaty','budget','walk','summit']).run.ending,'bad')
})
check('Trust and sympathy gates prevent an unearned romantic ending',()=>{
  assert.equal(play(['grind','reiOnly','dismiss','demand','walk','nikkoni']).run.ending,'bad')
})
check('Invalid and rapid repeated choices cannot apply effects twice',()=>{
  const initial=newSession()
  assert.equal(transition(initial,{type:'choose',choiceId:'pause'}),initial)
  const decision=toDecision(initial)
  assert.equal(transition(decision,{type:'choose',choiceId:'not-a-choice'}),decision)
  const reaction=transition(decision,{type:'choose',choiceId:'corridor'})
  assert.equal(transition(reaction,{type:'choose',choiceId:'corridor'}),reaction)
  assert.deepEqual(parseSave(serialize(reaction)),reaction,'Restore exact mid-reaction state')
})
check('Replay keeps read dialogue and unlocked endings; skip never chooses automatically',()=>{
  const won=play(['corridor','curious','treaty','budget','walk','nikkoni'])
  const fresh=restart(won)
  assert.equal(fresh.run.history.length,0)
  assert.deepEqual(fresh.unlocked,['true'])
  assert(fresh.seen.includes(currentReadId(fresh.run)))
  const skipped=skipRead(fresh)
  assert.equal(skipped.run.phase,'choice')
  assert.equal(skipped.run.nodeId,'room')
  assert.deepEqual(skipped.run.metrics,newSession().run.metrics)
  assert.equal(skipRead(skipped),skipped)
  assert.deepEqual(parseSave(serialize(skipped)),skipped)
  assert.equal(skipRead(newSession()).actions.length,0)
})
check('Corrupt, oversized, stale and impossible saves fail safely',()=>{
  for(const raw of [null,'{','null','{}','a'.repeat(65000),JSON.stringify({version:3,actions:[],seen:[],unlocked:[]}),JSON.stringify({version:1,actions:[{type:'choose',choiceId:'pause'}],seen:[],unlocked:[]}),JSON.stringify({version:1,actions:[],seen:['fake'],unlocked:[]}),JSON.stringify({version:1,actions:[],seen:[],unlocked:['__proto__']})]) assert.equal(parseSave(raw),null)
})
check('Snail ending follows all six episodes and requires blessing plus enough mutual interest',()=>{
  assert.equal(play(['pause','curious','treaty','budget','glory','cafe']).run.ending,'snail')
  assert.equal(play(['pause','curious','treaty','budget','walk','cafe']).run.ending,'good')
  assert.equal(play(['grind','reiOnly','dismiss','demand','glory','cafe']).run.ending,'bad')
  assert.equal(play(['corridor','curious','treaty','invoice','glory','summit']).run.ending,'secret')
  assert.equal(play(['corridor','curious','treaty','budget','glory','nikkoni']).run.ending,'true')
})
check('RPU reply is a fictional event with a distinct reaction and sympathy effect',()=>{
  const before=play(['pause','curious','treaty','budget'])
  const decision=toDecision(before)
  assert.equal(decision.run.nodeId,'snail')
  assert.equal(episodeById.snail.choices.length,3)
  const selected=transition(decision,{type:'choose',choiceId:'denyRpu'})
  assert.equal(selected.run.metrics.affection,decision.run.metrics.affection-4)
  assert(selected.run.flags.includes('rpuTriggered'))
  assert.equal(episodeById.snail.choices.find(choice=>choice.id==='denyRpu').event,'rpu')
  assert.deepEqual(parseSave(serialize(selected)),selected)
})
check('Real version-1 saves retain every previous ending and mid-dialogue state after migration',()=>{
  for(const fixture of legacyFixtures) {
    const migrated=parseSave(fixture.raw)
    assert(migrated,fixture.label)
    assert.equal(migrated.legacyRoute,true)
    for(const key of ['nodeId','phase','lineIndex','pendingChoice','metrics','flags','ending']) assert.deepEqual(migrated.run[key],fixture.expected[key],fixture.label+':'+key)
    assert.deepEqual(migrated.unlocked,fixture.expected.unlocked)
    assert.deepEqual(parseSave(serialize(migrated)),migrated,'Migration must survive a second refresh')
    const replay=restart(migrated)
    assert.equal(replay.legacyRoute,false)
    assert.deepEqual(replay.unlocked,migrated.unlocked)
  }
})
check('Optional history dialogue changes sympathy once without moving or blocking the story',()=>{
  for(const choice of story.historyAside.choices){
    const initial=newSession()
    const selected=transition(initial,{type:'historyAside',choiceId:choice.id})
    assert.equal(selected.run.nodeId,initial.run.nodeId)
    assert.equal(selected.run.phase,initial.run.phase)
    assert.equal(selected.run.lineIndex,initial.run.lineIndex)
    assert.equal(selected.run.metrics.affection,initial.run.metrics.affection+choice.effects.affection)
    assert.equal(selected.run.history.length,3)
    assert(selected.run.flags.includes('historyAsideDone'))
    assert.equal(transition(selected,{type:'historyAside',choiceId:choice.id}),selected)
    assert.deepEqual(parseSave(serialize(selected)),selected)
    assert.equal(toDecision(selected).run.phase,'choice')
  }
  const fresh=newSession()
  assert.equal(transition(fresh,{type:'historyAside',choiceId:'not-real'}),fresh)
  const ended=play(['unplug'])
  assert.equal(transition(ended,{type:'historyAside',choiceId:'historySecret'}),ended)
})
console.log(`Validated ${paths} complete paths and ${checks} checks. All endings: ${[...reached.keys()].join(', ')}.`)
