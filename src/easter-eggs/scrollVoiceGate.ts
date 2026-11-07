export const VOICE_SESSION_KEY='nikkoni-scroll-voice-v1'
type StorageLike=Pick<Storage,'getItem'|'setItem'>
export class ScrollVoiceGate {
  private seen=false
  private target:number|null=null
  constructor(private storage:StorageLike|null,private random:()=>number=Math.random){
    try{this.seen=storage?.getItem(VOICE_SESSION_KEY)==='seen'}catch{/* Use memory when storage is blocked. */}
  }
  begin(){if(!this.seen&&this.target===null)this.target=.25+Math.max(0,Math.min(1,this.random()))*.55}
  reach(progress:number,home:boolean,blocked=false){
    if(this.seen||this.target===null||!home||blocked||!Number.isFinite(progress)||progress<this.target)return false
    this.seen=true
    try{this.storage?.setItem(VOICE_SESSION_KEY,'seen')}catch{/* Keep the in-memory session guard. */}
    return true
  }
}
