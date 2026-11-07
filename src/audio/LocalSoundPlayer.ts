import { soundPath, soundGain, unavailableSounds, type SoundId } from './sounds'

export class LocalSoundPlayer {
  private context:AudioContext|null=null
  private gain:GainNode|null=null
  private source:AudioBufferSourceNode|null=null
  private buffers=new Map<SoundId,Promise<AudioBuffer>>()
  private generation=0
  private enabled=false
  private volume=.4
  private headroom=1
  constructor(private onError:(message:string)=>void,private onPlayed:(id:SoundId)=>void){}
  configure(enabled:boolean,volume:number){
    this.enabled=enabled
    this.volume=Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):.4
    if(this.gain&&this.context)this.gain.gain.setValueAtTime(enabled?this.volume*this.headroom:0,this.context.currentTime)
    if(!enabled||this.volume===0)this.stop()
    if(!enabled&&this.context)void this.context.suspend().catch(()=>{})
  }
  private getContext(){
    if(!this.context||this.context.state==='closed'){
      const Constructor=window.AudioContext??(window as Window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext
      if(!Constructor)throw Error('Audio unavailable')
      this.context=new Constructor()
      this.gain=this.context.createGain()
      this.gain.gain.value=this.enabled?this.volume*this.headroom:0
      this.gain.connect(this.context.destination)
    }
    return this.context
  }
  async unlock(){
    if(!this.enabled)return
    try{await this.getContext().resume();this.onError('')}
    catch{this.onError('Браузер не дозволив звук. Натисни перемикач ще раз або перевір налаштування звуку вкладки.')}
  }
  stop(){
    this.generation++
    const current=this.source;this.source=null
    if(current){try{current.stop()}catch{/* Already finished. */}current.disconnect()}
  }
  async play(id:SoundId){
    if(!this.enabled||this.volume===0)return
    this.stop()
    if(unavailableSounds[id]){this.onError(unavailableSounds[id]!);return}
    const request=this.generation
    try{
      const context=this.getContext()
      // Called from a user gesture; resume before any network await for mobile browsers.
      await context.resume()
      let buffer=this.buffers.get(id)
      if(!buffer){
        buffer=fetch(soundPath(id)).then(response=>{if(!response.ok)throw Error('Sound missing');return response.arrayBuffer()}).then(bytes=>context.decodeAudioData(bytes))
        this.buffers.set(id,buffer)
        void buffer.catch(()=>{if(this.buffers.get(id)===buffer)this.buffers.delete(id)})
      }
      const decoded=await buffer
      if(request!==this.generation||!this.enabled||this.volume===0||context.state==='closed')return
      this.headroom=soundGain(id)
      this.gain!.gain.setValueAtTime(this.volume*this.headroom,context.currentTime)
      const source=context.createBufferSource()
      source.buffer=decoded;source.connect(this.gain!)
      source.onended=()=>{source.disconnect();if(this.source===source)this.source=null}
      this.source=source
      source.start()
      this.onError('');this.onPlayed(id)
    }catch{
      if(request===this.generation&&this.enabled)this.onError('Ефект не відтворився. Перевір звук вкладки або спробуй ще раз. Візуальні жарти продовжують працювати.')
    }
  }
  dispose(){this.stop();this.enabled=false;this.buffers.clear();void this.context?.close().catch(()=>{});this.context=null;this.gain=null}
}
