import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import {execFileSync} from 'node:child_process'
import {loadTestModule} from './helpers/load-test-module.mjs'
const {ScrollVoiceGate,VOICE_SESSION_KEY}=await loadTestModule('easter-eggs/scrollVoiceGate')
const {AudioFocus}=await loadTestModule('audio/AudioFocus')
const memory=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)}}
for(const random of [0,.3,.5,1]){
  const storage=memory();let calls=0
  const gate=new ScrollVoiceGate(storage,()=>{calls++;return random})
  assert.equal(gate.reach(1,true),false,'No popup before a user scroll gesture')
  gate.begin();gate.begin();assert.equal(calls,1,'Choose the random scroll point once')
  const target=.25+random*.55
  assert.equal(gate.reach(target-.00001,true),false)
  assert.equal(gate.reach(1,false),false,'Never activate in /game')
  assert.equal(gate.reach(1,true,true),false,'Form or modal defers showing without consuming the encounter')
  assert.equal(gate.reach(target,true),true)
  assert.equal(storage.getItem(VOICE_SESSION_KEY),'seen')
  assert.equal(gate.reach(1,true),false,'Never repeat after closing or blocking')
  const reload=new ScrollVoiceGate(storage,()=>0);reload.begin()
  assert.equal(reload.reach(1,true),false,'Session guard survives a reload')
}
const broken={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}
const fallback=new ScrollVoiceGate(broken,()=>0);fallback.begin()
assert.equal(fallback.reach(1,true),true);assert.equal(fallback.reach(1,true),false)

const events=[]
const focus=new AudioFocus(()=>events.push('builtin-stop'))
const releaseOld=focus.claimExternal(()=>events.push('old-voice-pause'))
const releaseNew=focus.claimExternal(()=>events.push('new-voice-pause'))
releaseOld();focus.beforeBuiltin()
assert.deepEqual(events,['builtin-stop','builtin-stop','old-voice-pause','new-voice-pause'],'Meme playback pauses voice; old release cannot detach the new voice')
releaseNew();focus.stopAll()
assert.equal(events.at(-1),'builtin-stop')
assert.equal(events.filter(event=>event==='new-voice-pause').length,1)

// Exercise manual-file detection in an isolated directory, never in public/sounds.
const fixture=await fs.mkdtemp('work/voice-asset-test-')
await fs.mkdir(path.join(fixture,'public/sounds'),{recursive:true})
await fs.mkdir(path.join(fixture,'src/easter-eggs'),{recursive:true})
const sync=()=>execFileSync(process.execPath,[path.resolve('scripts/sync-voice-asset.mjs')],{cwd:fixture,stdio:'pipe'})
const generated=()=>fs.readFile(path.join(fixture,'src/easter-eggs/voiceAsset.ts'),'utf8')
sync();assert((await generated()).includes('=null'))
await fs.copyFile('public/sounds/achievement.mp3',path.join(fixture,'public/sounds/clubochkom.mp3'))
sync();assert.match(await generated(),/\/sounds\/clubochkom\.mp3\?v=[a-f0-9]{12}/)
await fs.writeFile(path.join(fixture,'public/sounds/clubochkom.mp3'),'not an mp3')
assert.throws(sync,'Invalid or empty files must not become playable assets')
console.log('PASS scroll-only activation, 25–80% boundaries, once per session, game/form/modal exclusion, blocked storage fallback, coordinated audio focus and manual asset detection.')
