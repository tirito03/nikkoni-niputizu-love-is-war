import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
const root=path.resolve(`work/module-tests-${process.pid}`)
const files=['easter-eggs/voiceAsset','easter-eggs/scrollVoiceGate','audio/AudioFocus','audio/assetVersions','audio/sounds','audio/LocalSoundPlayer','data/quoteModel','data/extraMemes','data/quotes','humor/popupAudio','humor/catalog','snail/memes','snail/prayerPools','snail/prayer']
const compiled=(async()=>{
  for(const file of files){
    const code=ts.transpileModule(await fs.readFile(`src/${file}.ts`,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/(from\s*['"])(\.[^'"]+)(['"])/g,'$1$2.mjs$3')
    const output=path.join(root,file+'.mjs')
    await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,code)
  }
})()
export async function loadTestModule(file){await compiled;return import(pathToFileURL(path.join(root,file+'.mjs')).href)}
