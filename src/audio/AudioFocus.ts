// Coordinates user-initiated voice playback with the existing meme player.
export class AudioFocus {
  private external:(()=>void)|null=null
  constructor(private stopBuiltin:()=>void){}
  beforeBuiltin(){const stop=this.external;this.external=null;stop?.()}
  stopAll(){this.stopBuiltin();this.beforeBuiltin()}
  claimExternal(stop:()=>void){
    this.stopAll();this.external=stop
    return ()=>{if(this.external===stop)this.external=null}
  }
}
