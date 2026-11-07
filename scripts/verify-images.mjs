import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'

const manifest = JSON.parse(await fs.readFile('src/data/images.json', 'utf8'))
const images = [manifest.hero, ...manifest.photos, ...manifest.scenes, manifest.turms, manifest.steamHistory, ...manifest.characters, ...Object.values(manifest.games)]
const available = (await fs.readdir('public/images')).filter(name => /^photo.*\.(png|jpe?g|webp|avif)$/i.test(name)).sort()
assert.deepEqual(manifest.photos.map(image => path.basename(image.src)).sort(), available, 'Gallery must include every photo… image')
for (const image of images) {
  const file = path.join('public', image.src)
  const bytes = await fs.readFile(file)
  const png = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  assert(png || jpeg, `Invalid PNG/JPEG: ${file}`)
  assert(image.width > 0 && image.height > 0, `Missing image dimensions: ${file}`)
  if (png) {
    assert.equal(bytes.readUInt32BE(16), image.width)
    assert.equal(bytes.readUInt32BE(20), image.height)
  }
  const serverUrl = process.argv.find(arg => arg.startsWith('--url='))?.slice(6)
  if (serverUrl) {
    const response = await fetch(new URL(image.src, serverUrl))
    assert.equal(response.status, 200, `${image.src} must return HTTP 200`)
    assert(response.headers.get('content-type')?.startsWith('image/'), `Invalid response type: ${image.src}`)
    const served = Buffer.from(await response.arrayBuffer())
    assert(bytes.equals(served), `Image changed or HTML fallback returned: ${image.src}`)
  }
  console.log(`OK ${image.src}`)
  if (image.srcSet) {
    const optimized = await fs.readFile(path.join('public', image.srcSet))
    assert.equal(optimized.toString('ascii', 0, 4), 'RIFF', `Invalid WebP: ${image.srcSet}`)
    assert.equal(optimized.toString('ascii', 8, 12), 'WEBP', `Invalid WebP: ${image.srcSet}`)
    if (serverUrl) {
      const response = await fetch(new URL(image.srcSet, serverUrl))
      assert.equal(response.status, 200, `${image.srcSet} must return HTTP 200`)
      assert(response.headers.get('content-type')?.startsWith('image/'), `Invalid response type: ${image.srcSet}`)
      assert(optimized.equals(Buffer.from(await response.arrayBuffer())), `Optimized image changed: ${image.srcSet}`)
    }
    console.log(`OK ${image.srcSet} (optimized)`)
  }
}
console.log(`Verified ${images.length} images: portrait, ${manifest.photos.length} photos, ${manifest.scenes.length} scenes, TURMS reward, 3 official Steam covers and 3 anime characters.`)
