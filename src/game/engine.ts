import { endings, episodes, episodeById, historyAside, type Choice, type EndingId, type Flag, type Metric } from './story'

export type Metrics = Record<Metric, number>
export type HistoryEntry = { speaker: string; text: string; episode: string }
export type Run = { nodeId: string; lineIndex: number; phase: 'dialogue' | 'choice' | 'reaction' | 'ending'; pendingChoice: string | null; metrics: Metrics; flags: Flag[]; history: HistoryEntry[]; ending: EndingId | null }
export type Action = { type: 'advance' } | { type: 'choose'; choiceId: string } | { type: 'historyAside'; choiceId: string }
export type Session = { run: Run; actions: Action[]; seen: string[]; unlocked: EndingId[]; legacyRoute: boolean }
export const SAVE_KEY = 'nikkoni-love-is-war-v1'
export const initialRun = (): Run => ({ nodeId: 'room', lineIndex: 0, phase: 'dialogue', pendingChoice: null, metrics: { affection: 20, trust: 20, outside: 3 }, flags: [], history: [], ending: null })
export const newSession = (): Session => ({ run: initialRun(), actions: [], seen: [], unlocked: [], legacyRoute: false })
export const currentReadId = (run: Run) => run.phase === 'dialogue' ? `${run.nodeId}:${run.lineIndex}` : run.phase === 'reaction' ? `${run.nodeId}:reaction:${run.pendingChoice}` : null
const clamp = (value: number) => Math.max(0, Math.min(100, value))
function resolveEnding(run: Run, choice: Choice): EndingId {
  if (choice.ending) return choice.ending
  if (choice.resolve === 'secret') return run.flags.includes('scooterMeme') && run.flags.includes('humor') && run.metrics.trust >= 40 ? 'secret' : 'bad'
  const ready = run.metrics.affection >= 55 && run.metrics.trust >= 55 && run.metrics.outside >= 40
  if (!ready) return 'bad'
  if (choice.resolve === 'date' && run.flags.includes('snailBlessed')) return 'snail'
  if (choice.resolve === 'true' && run.metrics.affection >= 70 && run.metrics.trust >= 75 && ['respect', 'humor', 'interest', 'sincere', 'agreement'].every(flag => run.flags.includes(flag as Flag))) return 'true'
  return 'good'
}

export function transition(session: Session, action: Action): Session {
  const before = session.run
  // An already-open pre-update tab may still hold the version-1 state in memory.
  const legacyRoute = session.legacyRoute ?? true
  const episode = episodeById[before.nodeId]
  if (!episode || before.phase === 'ending') return session
  if (action.type === 'historyAside') {
    if (before.flags.includes('historyAsideDone')) return session
    const choice = historyAside.choices.find(item => item.id === action.choiceId)
    if (!choice) return session
    const metrics = { ...before.metrics, affection:clamp(before.metrics.affection+choice.effects.affection), trust:clamp(before.metrics.trust+choice.effects.trust) }
    const run: Run = { ...before, metrics, flags:[...before.flags,'historyAsideDone'], history:[...before.history,{speaker:'Денис',text:historyAside.line,episode:historyAside.title},{speaker:'Ти',text:choice.text,episode:historyAside.title},{speaker:'Денис',text:choice.reaction,episode:historyAside.title}] }
    return { ...session, run, actions:[...session.actions,action], legacyRoute }
  }
  let run: Run
  let readId: string | null = null
  if (action.type === 'choose') {
    if (before.phase !== 'choice') return session
    const choice = episode.choices.find(item => item.id === action.choiceId)
    if (!choice) return session
    const metrics = { ...before.metrics }
    for (const key of Object.keys(metrics) as Metric[]) metrics[key] = clamp(metrics[key] + (choice.effects[key] ?? 0))
    run = { ...before, phase: 'reaction', pendingChoice: choice.id, metrics, flags: [...new Set([...before.flags, ...choice.flags ?? []])], history: [...before.history, { speaker: 'Ти', text: choice.text, episode: episode.title }] }
  } else if (before.phase === 'dialogue') {
    const line = episode.lines[before.lineIndex]
    if (!line) return session
    readId = currentReadId(before)
    const more = before.lineIndex + 1 < episode.lines.length
    run = { ...before, phase: more ? 'dialogue' : 'choice', lineIndex: more ? before.lineIndex + 1 : before.lineIndex, history: [...before.history, { ...line, episode: episode.title }] }
  } else if (before.phase === 'reaction') {
    const choice = episode.choices.find(item => item.id === before.pendingChoice)
    if (!choice) return session
    readId = currentReadId(before)
    const history = [...before.history, { speaker: 'Денис', text: choice.reaction, episode: episode.title }]
    if (choice.next) run = { ...before, nodeId: legacyRoute && before.nodeId === 'scooter' && choice.next === 'snail' ? 'date' : choice.next, phase: 'dialogue', lineIndex: 0, pendingChoice: null, history }
    else run = { ...before, phase: 'ending', ending: resolveEnding(before, choice), history }
  } else return session
  return { run, actions: [...session.actions, action], seen: readId ? [...new Set([...session.seen, readId])] : session.seen, unlocked: run.ending ? [...new Set([...session.unlocked, run.ending])] : session.unlocked, legacyRoute }
}

// Skipping advances known dialogue only; it never makes a choice for the player.
export function skipRead(session: Session): Session {
  let next = session
  for (let step = 0; step < 50; step++) {
    const id = currentReadId(next.run)
    if (!id || !next.seen.includes(id)) break
    const updated = transition(next, { type: 'advance' })
    if (updated === next) break
    next = updated
  }
  return next
}

export const restart = (session: Session): Session => ({ ...newSession(), seen: session.seen, unlocked: session.unlocked })
const validReadIds = new Set(episodes.flatMap(episode => [...episode.lines.map((_, index) => `${episode.id}:${index}`), ...episode.choices.map(choice => `${episode.id}:reaction:${choice.id}`)]))
export function serialize(session: Session): string { return JSON.stringify({ version: 2, actions: session.actions, seen: session.seen, unlocked: session.unlocked, legacyRoute: session.legacyRoute ?? true }) }
export function parseSave(raw: string | null): Session | null {
  if (!raw || raw.length > 64000) return null
  try {
    const data = JSON.parse(raw)
    if (!data || ![1,2].includes(data.version) || (data.version === 2 && typeof data.legacyRoute !== 'boolean') || !Array.isArray(data.actions) || data.actions.length > 100 || !Array.isArray(data.seen) || data.seen.length > validReadIds.size || !Array.isArray(data.unlocked) || data.unlocked.length > Object.keys(endings).length) return null
    if (!data.seen.every((id: unknown) => typeof id === 'string' && validReadIds.has(id)) || !data.unlocked.every((id: unknown) => typeof id === 'string' && Object.hasOwn(endings, id))) return null
    let session: Session = { ...newSession(), seen: [...new Set<string>(data.seen)], unlocked: [...new Set<EndingId>(data.unlocked)], legacyRoute: data.version === 1 || data.legacyRoute }
    for (const action of data.actions) {
      if (!action || !['advance','choose','historyAside'].includes(action.type) || (action.type !== 'advance' && typeof action.choiceId !== 'string')) return null
      const next = transition(session, action)
      if (next === session) return null
      session = next
    }
    return session
  } catch { return null }
}
