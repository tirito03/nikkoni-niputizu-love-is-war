export type PopupAudioContext = 'prayer' | 'war-thunder-stat' | 'other-stat' | 'other'

// A quote's sound metadata never grants permission to play outside these entry points.
export function allowsPopupAudio(context:PopupAudioContext='other'):boolean {
  return context==='prayer'||context==='war-thunder-stat'
}
