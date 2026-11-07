import { effectForSound, soundForText, type MemeEffect, type PrayerCategory, type SoundId } from '../audio/sounds'
export type MemeTheme='war'|'hoi4'|'anime'|'snail'|'rpg'
export type QuoteUse='rpg'|'prayer'|'popup'
export type QuoteDefinition={id:string;quote:string;comment:string;comments?:readonly string[];category:PrayerCategory;sound:SoundId;theme:MemeTheme;effect:MemeEffect;uses:QuoteUse[]}
export type MemeQuote=Pick<QuoteDefinition,'quote'|'comment'> & Partial<Omit<QuoteDefinition,'quote'|'comment'>>
type Options=Partial<Omit<QuoteDefinition,'quote'|'comment'>>
export function createMeme(quote:string,comment:string,options:Options={}):QuoteDefinition {
  let hash=2166136261
  for(let i=0;i<quote.length;i++)hash=Math.imul(hash^quote.charCodeAt(i),16777619)
  const category=options.category??'absurd',sound=options.sound??soundForText(quote,category)
  return {id:`meme-${(hash>>>0).toString(16)}`,quote,comment,category,sound,theme:options.theme??'rpg',effect:effectForSound[sound],uses:['rpg','popup'],...options}
}
export function withRandomComment<T extends MemeQuote>(meme:T,random:()=>number=Math.random):T {
  if(!meme.comments?.length)return meme
  const index=Math.max(0,Math.min(meme.comments.length-1,Math.floor(random()*meme.comments.length)))
  return {...meme,comment:meme.comments[index]}
}
