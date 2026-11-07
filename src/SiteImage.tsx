import { useState, type ImgHTMLAttributes } from 'react'

// Never substitute an unrelated photo when a source file fails to load.
export function SiteImage({ src, alt, onError, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSource, setFailedSource] = useState<string>()
  if (failedSource === src) return <div className={`image-error ${props.className ?? ''}`} role="status"><span>Зображення не завантажилося</span><small>{src}</small></div>
  return <img {...props} src={src} alt={alt} onError={event => { setFailedSource(src); onError?.(event) }}/>
}
