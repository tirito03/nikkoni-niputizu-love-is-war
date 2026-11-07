import assert from 'node:assert/strict'
import {loadTestModule} from './helpers/load-test-module.mjs'
const {LocalSoundPlayer}=await loadTestModule('audio/LocalSoundPlayer')
const {soundPath,soundGain}=await loadTestModule('audio/sounds')
const waiting=new Map(),played=[],errors=[]
let active=0,maxActive=0,created=0
class Context{
  state='suspended';currentTime=0
  constructor(){created++}
  createGain(){return {gain:{value:0,setValueAtTime(){}},connect(){}}}
  resume(){this.state='running';return Promise.resolve()}
  suspend(){this.state='suspended';return Promise.resolve()}
  close(){this.state='closed';return Promise.resolve()}
  decodeAudioData(){return Promise.resolve({})}
  createBufferSource(){let started=false;return {connect(){},disconnect(){},start(){started=true;active++;maxActive=Math.max(maxActive,active)},stop(){if(started){started=false;active--}}}}
}
globalThis.window={AudioContext:Context}
globalThis.fetch=url=>new Promise(resolve=>waiting.set(url,()=>resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(4)})))
const player=new LocalSoundPlayer(message=>{if(message)errors.push(message)},id=>played.push(id))
player.configure(false,.4)
await player.play('hit');assert.equal(created,0,'No autoplay or audio context while muted')
player.configure(true,.4);await player.unlock();assert.equal(active,0,'Enabling only unlocks audio')
const a=player.play('ricochet');await new Promise(resolve=>setImmediate(resolve))
const b=player.play('hit');await new Promise(resolve=>setImmediate(resolve))
waiting.get(soundPath('hit'))();await b
waiting.get(soundPath('ricochet'))();await a
assert.deepEqual(played,['hit'],'Late downloads must not start stale sounds')
assert.equal(active,1)
await player.play('ricochet');assert.equal(active,1);assert.equal(maxActive,1,'Only one source can play')
player.configure(false,.4);assert.equal(active,0,'Mute stops the current sound')
player.configure(true,0);await player.play('hit');assert.equal(active,0,'Zero volume is silent')
player.configure(true,.5)
const pending=player.play('explosion');await new Promise(resolve=>setImmediate(resolve))
player.stop();waiting.get(soundPath('explosion'))();await pending;assert.equal(active,0,'Closing cancels pending sounds')
await player.play('hit');assert.equal(active,1)
player.dispose();assert.equal(active,0)
assert.equal(errors.length,0)
const freshPlayer=new LocalSoundPlayer(message=>{if(message)errors.push(message)},id=>played.push(id))
freshPlayer.configure(true,.4)
const pazik=freshPlayer.play('hit-pazik');await new Promise(resolve=>setImmediate(resolve))
assert(waiting.has(soundPath('hit-pazik')),'Pazik requests its installed recording')
waiting.get(soundPath('hit-pazik'))();await pazik
assert.equal(played.at(-1),'hit-pazik','Pazik uses its exact file, without substitution')
assert(soundPath('hit-pazik').startsWith('/sounds/hit-pazik.mp3?v='))
for(const id of ['ricochet','hit-machinegun','hit-pazik'])assert(soundGain(id)>0&&soundGain(id)<=1,'Headroom never amplifies source files')
freshPlayer.dispose()
assert.equal(errors.length,0)
console.log('PASS muted-by-default, unlock without autoplay, cached files, single source, stale-download cancellation, zero volume, mute, close and disposal.')

const {allowsPopupAudio}=await loadTestModule('humor/popupAudio')
assert.equal(allowsPopupAudio(),false,'Unspecified popup context must be silent')
assert.equal(allowsPopupAudio('other'),false)
assert.equal(allowsPopupAudio('other-stat'),false)
assert.equal(allowsPopupAudio('prayer'),true)
assert.equal(allowsPopupAudio('war-thunder-stat'),true)
console.log('PASS popup audio defaults to silent; only prayer and war-thunder-stat allow sound, independent of quote metadata.')
