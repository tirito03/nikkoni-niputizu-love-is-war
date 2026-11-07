import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import {loadTestModule} from './helpers/load-test-module.mjs'
const {soundIds,soundPath,soundGain,unavailableSounds}=await loadTestModule('audio/sounds')
const manifest=JSON.parse(await fs.readFile('public/sounds/sources.json','utf8'))
const server=process.argv.find(arg=>arg.startsWith('--url='))?.slice(6)
assert.deepEqual(manifest.sounds.map(sound=>sound.id),[...soundIds])
for(const sound of manifest.sounds){
  if(sound.license==='CC0-1.0'){
    assert.equal(sound.originalWarThunder,false);assert.equal(sound.spokenRussian,false)
    assert(sound.sources.length&&sound.sources.every(source=>source.author&&source.sourcePage&&source.download&&source.files.length))
  }else{
    assert.equal(sound.license,'LicenseRef-UserProvided-Unverified')
    assert.equal(sound.originalWarThunder,null);assert.equal(sound.spokenRussian,null)
    assert(sound.sources.some(source=>source.origin==='user-provided local file'))
  }
  assert(Number.isFinite(sound.duration)&&sound.duration>0)
  assert(Number.isFinite(sound.peakDbfs))
  assert.equal(unavailableSounds[sound.id],undefined)
  const gain=soundGain(sound.id)
  assert(gain>0&&gain<=1)
  assert(sound.peakDbfs+20*Math.log10(gain)<=-2.98,'Playback gain provides peak headroom')
  const bytes=await fs.readFile('public'+sound.src)
  assert(bytes.length>1000);assert.equal(bytes.length,sound.bytes)
  assert(bytes.subarray(0,3).toString('ascii')==='ID3'||(bytes[0]===255&&(bytes[1]&224)===224),'MP3 signature required')
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sound.sha256)
  assert(soundPath(sound.id).includes(sound.sha256.slice(0,12)),'Playback URL must bypass stale asset cache')
  if(server){const response=await fetch(new URL(soundPath(sound.id),server));assert.equal(response.status,200);assert(response.headers.get('content-type')?.startsWith('audio/'));assert(bytes.equals(Buffer.from(await response.arrayBuffer())))}
  console.log(`OK ${sound.src} · ${sound.duration}s · ${sound.license}`)
}
console.log(`PASS ${manifest.sounds.length} installed local MP3 files, hashes, playback paths and headroom. User-provided files are not mislabeled as CC0.`)

const {voiceAsset}=await loadTestModule('easter-eggs/voiceAsset')
if(voiceAsset){
  const source=JSON.parse(await fs.readFile('public/sounds/clubochkom.source.json','utf8'))
  const relative=new URL(voiceAsset.src,'http://localhost').pathname
  const bytes=await fs.readFile('public'+relative)
  assert.equal(source.installed,true)
  assert.equal(bytes.length,source.bytes)
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),source.sha256)
  assert(voiceAsset.src.includes(source.sha256.slice(0,12)))
  assert(source.duration>0)
  if(server){const response=await fetch(new URL(voiceAsset.src,server));assert.equal(response.status,200);assert(response.headers.get('content-type')?.startsWith('audio/'));assert(bytes.equals(Buffer.from(await response.arrayBuffer())))}
  console.log(`PASS installed voice ${relative} · ${source.duration}s · verified bytes and versioned URL`)
}
