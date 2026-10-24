<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const props = defineProps<{ frozen?: boolean }>()
const sfx = props.frozen ? 'f' : ''
const { $clicks } = useSlideContext()
const step = computed(() => props.frozen ? 4 : unref($clicks) as number)
const active = useIsSlideActive()

const en = ref(0)
const lp = ref(0)
type Scen = 'ref' | 'low' | 'fav' | 'mlo' | 'mhi' | 'clo' | 'chi'
const scen = ref<Scen>('ref')
const still = ref(false)
const emo = ref(2)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }

const SAVED = { low: 15.14, ref: 37.50, fav: 72.57, mlo: 24.79, mhi: 62.92, clo: 27.85, chi: 47.15 } as const
const hA = ref(0), hB = ref(0), hS = ref(37.5)
let raf = 0
function tween(target: { v: number }[], to: number[], ms: number) {
  cancelAnimationFrame(raf)
  const from = target.map(t => t.v), t0 = performance.now()
  const tick = (t: number) => {
    const k = Math.min(1, (t - t0) / ms), e = 1 - (1 - k) ** 3
    target.forEach((x, i) => { x.v = from[i] + (to[i] - from[i]) * e })
    if (k < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}
const cA = { get v() { return hA.value }, set v(x) { hA.value = x } }
const cB = { get v() { return hB.value }, set v(x) { hB.value = x } }
const cS = { get v() { return hS.value }, set v(x) { hS.value = x } }
function runCounters(now: boolean) {
  if (step.value >= 3) {
    if (now || step.value > 3) { hA.value = 178.85; hB.value = 141.35 }
    else { hA.value = 0; hB.value = 0; setTimeout(() => tween([cA, cB], [178.85, 141.35], 1600), 300) }
  }
  hS.value = 37.5
}
watch(scen, (s) => { if (step.value === 4 && !still.value) tween([cS], [SAVED[s]], 900) })
onBeforeUnmount(() => cancelAnimationFrame(raf))
const f2 = (x: number) => x.toFixed(2)

watch(active, (a) => {
  clearTimers()
  if (props.frozen) { en.value = 4; lp.value = 9; still.value = true; scen.value = 'ref'; hA.value = 178.85; hB.value = 141.35; hS.value = 37.5; return }
  if (!a) { en.value = 0; lp.value = 0; still.value = false; scen.value = 'ref'; return }
  if (step.value > 0) { en.value = 4; lp.value = 9; still.value = true; scen.value = 'ref'; runCounters(true); return }
  still.value = false; en.value = 0; lp.value = 0
  ;[[350, 1], [1100, 2], [1900, 3], [3300, 4]].forEach(([ms, p]) => later(ms, () => { en.value = p }))
  emo.value = 0
  later(3300 + 3800, () => { emo.value = 1 })
  later(3300 + 4100, () => { emo.value = 2 })
}, { immediate: true })

watch(step, (s) => {
  if (props.frozen || !active.value) return
  clearTimers()
  still.value = false
  en.value = 4
  lp.value = 0
  scen.value = 'ref'
  if (s === 2) { later(2000, () => { lp.value = 1 }); later(5800, () => { lp.value = 2 }) }
  if (s === 4) {
    later(3100, () => { lp.value = 1 })

    ;[[4100, 'mlo'], [5900, 'mhi'], [7700, 'ref'], [8700, 'clo'], [10300, 'chi'], [11900, 'ref'], [12900, 'low'], [14500, 'fav']]
      .forEach(([ms, sc]) => later(ms as number, () => { scen.value = sc as Scen }))
    later(16100, () => { scen.value = 'ref'; lp.value = 2 })
  }
  runCounters(false)
})
onBeforeUnmount(clearTimers)

const doc = computed(() => {
  const s = step.value
  if (s === 0) {
    if (en.value < 4) return { mood: 'happy', pose: 'akimbo' }
    if (still.value || emo.value === 2) return { mood: 'happy', pose: 'rest' }
    return emo.value === 1 ? { mood: 'worried', pose: 'rest' } : { mood: 'neutral', pose: 'rest' }
  }
  if (s === 1 || s === 2) return { mood: 'neutral', pose: 'clipboard' }
  if (s === 3) return { mood: 'happy', pose: 'rest' }
  if (lp.value === 0) return { mood: 'happy', pose: 'cheer' }
  if (['low', 'mlo', 'clo'].includes(scen.value)) return { mood: 'neutral', pose: 'rest' }
  if (['fav', 'mhi', 'chi'].includes(scen.value)) return { mood: 'happy', pose: 'cheer' }
  return { mood: 'happy', pose: 'akimbo' }
})

const bot = computed(() => {
  const s = step.value
  let p = { x: 236, y: 300, k: 0.72 }
  if (en.value === 0) p = { x: 222, y: 236, k: 0.6 }
  if (s === 2 && lp.value === 0) p = { x: 872, y: 280, k: 0.7 }
  if (s === 2 && lp.value === 1) p = { x: 595, y: 214, k: 0.62 }
  if (s === 4 && lp.value >= 1) p = { x: 1010, y: 162, k: 0.62 }
  return { transform: `translate(${p.x - 60}px, ${p.y - 60}px) scale(${p.k})` }
})

const PROJ = ['POGE', 'FORZA', 'PEDIGREE', 'SCA7', 'Special MS Covid']
const SX = [350, 545, 740, 935, 1125]
const HST = [
  { i: 'desk', a: 'Delivery', b: 'Mar 2024' },
  { i: 'comm', a: 'Committee', b: '22 May · suspended' },
  { i: 'mail', a: 'Response', b: 'protocol not amended' },
  { i: 'comm', a: 'Committee', b: '10 Jul · same issue' },
  { i: 'mail', a: 'Response', b: '10 Sep' },
]
const DST = [
  { i: 'scan', a: 'DossierCheck check', b: 'before delivery' },
  { i: 'comm', a: 'Committee', b: '22 May · other requests' },
  { i: 'mail', a: 'Response', b: 'other requests' },
  { i: 'comm', a: 'Committee', b: '10 Jul · other requests' },
  { i: 'mail', a: 'Response', b: '10 Sep' },
]

type B = { t: string, k: string, rep?: boolean }
const HB: B[][] = [
  [{ t: 'Organise', k: 'o' }],
  [{ t: 'Find', k: 'f' }, { t: 'Follow-up', k: 'u' }],
  [{ t: 'Correct', k: 'c' }],
  [{ t: 'Find', k: 'f', rep: true }, { t: 'Follow-up', k: 'u', rep: true }],
  [{ t: 'Correct', k: 'c' }, { t: 'Follow-up', k: 'u' }],
]
const DB: B[][] = [
  [{ t: 'Organise', k: 'o' }, { t: 'Analysis', k: 't' }, { t: 'Team check', k: 't' }, { t: 'Correct', k: 'c' }],
  [{ t: 'Follow-up', k: 'u' }],
  [{ t: 'Correct', k: 'c' }, { t: 'Confirm', k: 't' }],
  [{ t: 'Follow-up', k: 'u' }],
  [{ t: 'Reviewer check', k: 't' }],
]
const BW = 92, BH = 20

type Path = 'a' | 'd'
const TX = { a: 430, d: 650 } as const
const CW = 25, CH = 7, RH = 9, BASE = 612, TWW = 4 * CW + 3 * 2
const ORDER = [1, 0, 2, 3, 4]
const HRS = { a: [37.00, 29.38, 34.42, 36.10, 41.95], d: [29.50, 21.28, 24.73, 30.07, 35.77] }

const MIX: Record<Path, [string, number][]> = {
  a: [['o', 0.09], ['f', 0.342], ['u', 0.208], ['c', 0.36]],
  d: [['o', 0.114], ['f', 0.219], ['u', 0.117], ['c', 0.319], ['t', 0.231]],
}
function mixColor(path: Path, g: number) {
  const u = (g * 0.618034 + 0.13) % 1
  let acc = 0
  for (const [k, w] of MIX[path]) { acc += w; if (u < acc) return k }
  return 'c'
}
type TB = { x: number, y: number, k: string, p: number, li: number, row: number, rail: number, d: number, sx: number, sy: number }
function tower(path: Path, rail: B[]) {
  const bricks: TB[] = [], layers: { p: number, li: number, top: number, bot: number, h: number }[] = []
  let row = 0, g = 0
  ORDER.forEach((pi, li) => {
    const n = Math.round(HRS[path][pi]), r0 = row
    for (let j = 0; j < n; j++) {
      const rr = row + Math.floor(j / 4), c = j % 4, isRail = li === 0 && j < rail.length
      const x = TX[path] + c * (CW + 2), y = BASE - (rr + 1) * RH
      bricks.push({ x, y, k: isRail ? rail[j].k : mixColor(path, g++), p: pi, li, row: rr, rail: isRail ? j : -1,
        d: li === 0 ? 1.5 + j * 0.03 : 2.3 + (li - 1) * 0.75 + j * 0.012, sx: 300 + pi * 180 + 72 - x, sy: 164 - y })
    }
    row += Math.ceil(n / 4)
    layers.push({ p: pi, li, top: BASE - row * RH, bot: BASE - r0 * RH, h: HRS[path][pi] })
  })
  return { bricks, layers, rows: row }
}
const TA = tower('a', HB.flat()), TD = tower('d', DB.flat())

const CNT: Record<Path, Record<string, number>> = { a: { o: 16, f: 61, u: 37, c: 64 }, d: { o: 16, f: 31, u: 17, c: 45, t: 33 } }
const GRP = ['o', 'f', 'u', 'c', 't']
function recolor(tw: ReturnType<typeof tower>, path: Path) {
  const left = { ...CNT[path] }
  tw.bricks.filter(b => b.rail >= 0).forEach((b) => { left[b.k]-- })
  const pool: string[] = []
  GRP.forEach(k => { for (let i = 0; i < (left[k] ?? 0); i++) pool.push(k) })
  let seed = path === 'a' ? 7 : 11
  for (let i = pool.length - 1; i > 0; i--) { seed = (seed * 9301 + 49297) % 233280; const j = Math.floor(seed / 233280 * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]] }
  let q = 0
  tw.bricks.forEach((b) => { if (b.rail < 0) b.k = pool[q++] })

  const order = tw.bricks.map((b, i) => ({ b, i })).sort((u, v) => GRP.indexOf(u.b.k) - GRP.indexOf(v.b.k) || u.i - v.i)
  order.forEach(({ b }, k) => { (b as any).k2 = k; (b as any).x2 = TX[path] + (k % 4) * (CW + 2); (b as any).y2 = BASE - (Math.floor(k / 4) + 1) * RH })
  const groups = GRP.filter(k => CNT[path][k]).map((k) => {
    const ks = order.filter(o => o.b.k === k).map(o => (o.b as any).k2 as number)
    const a = Math.min(...ks), z = Math.max(...ks)
    return { k, top: BASE - (Math.floor(z / 4) + 1) * RH, bot: BASE - Math.floor(a / 4) * RH }
  })
  return { rows2: Math.ceil(tw.bricks.length / 4), groups }
}
const SA2 = recolor(TA, 'a'), SD2 = recolor(TD, 'd')
const topA2 = BASE - SA2.rows2 * RH, topD2 = BASE - SD2.rows2 * RH
const GNAME: Record<string, string> = { o: 'Organisation', f: 'Discovery', u: 'Follow-up', c: 'Correction', t: 'DossierCheck work' }
const GH: Record<Path, Record<string, number>> = { a: { o: 16.17, f: 61.10, u: 37.25, c: 64.33 }, d: { o: 16.17, f: 30.93, u: 16.58, c: 45.03, t: 32.63 } }
const GLAB = [...SA2.groups.map(g => ({ ...g, path: 'a' as Path })), ...SD2.groups.map(g => ({ ...g, path: 'd' as Path }))]
  .map(g => ({ ...g, name: g.path === 'd' && g.k === 'c' ? 'Assisted correction' : GNAME[g.k], h: GH[g.path][g.k] }))
const topA = BASE - TA.rows * RH, topD = BASE - TD.rows * RH
const TBR = [...TA.bricks.map(b => ({ ...b, path: 'a', gap: (b as any).k2 >= SD2.rows2 * 4 })), ...TD.bricks.map(b => ({ ...b, path: 'd', gap: false }))].filter(b => b.rail < 0) as (TB & { path: string, gap: boolean, k2: number, x2: number, y2: number })[]
const LAY = [...TA.layers.map(l => ({ ...l, path: 'a' as Path })), ...TD.layers.map(l => ({ ...l, path: 'd' as Path }))]

function railBricks(rows: B[][], y: number, tw: ReturnType<typeof tower>) {
  let n = 0
  const out: (B & { x: number, y: number, tx: number, ty: number, tx2: number, ty2: number, d3: number, d: number, d2: number })[] = []
  rows.forEach((r, si) => r.forEach((b, j) => {
    const slot = tw.bricks[n]
    const sl = slot as any
    out.push({ ...b, x: SX[si] - BW / 2, y: y - 30 - (j + 1) * (BH + 4), tx: slot.x, ty: slot.y, tx2: sl.x2, ty2: sl.y2, d3: 0.2 + sl.k2 * 0.006, d: si * 0.12 + j * 0.08, d2: 0.45 + n * 0.08 })
    n++
  }))
  return out
}
const BRK = [...railBricks(HB, 300, TA), ...railBricks(DB, 500, TD)]
const SCX = CW / BW, SCY = CH / BH
const fmt = (n: number) => n.toLocaleString('en-US')

const PUFF = [
  { x: SX[1], y: 300, t: 1.1 }, { x: SX[2], y: 300, t: 2.8 }, { x: SX[3], y: 300, t: 3.8 }, { x: SX[2], y: 300, t: 5.4 }, { x: SX[4], y: 300, t: 6.4 },
  { x: SX[1], y: 500, t: 2.15 }, { x: SX[2], y: 500, t: 2.72 }, { x: SX[3], y: 500, t: 3.29 }, { x: SX[4], y: 500, t: 3.86 },
]

const PRJ = [
  { n: 'POGE', a: 37.00, d: 29.50 }, { n: 'FORZA', a: 29.38, d: 21.28 }, { n: 'PEDIGREE', a: 34.42, d: 24.73 },
  { n: 'SCA7', a: 36.10, d: 30.07 }, { n: 'Special MS Covid', a: 41.95, d: 35.77 },
]
const BMAX = 190 / 41.95
const PXH = (topD2 - topA2) / 37.5
const tops = computed(() => step.value >= 3 ? { a: topA2, d: topD2 } : { a: topA, d: topD })
const blk = computed(() => {
  const h = (step.value >= 4 ? SAVED[scen.value] : 37.5) * PXH
  return { h, top: 560 - h }
})
const KNOB = { low: [-50, -50], ref: [0, 0], fav: [50, 50], mlo: [-50, 0], mhi: [50, 0], clo: [0, -50], chi: [0, 50] } as const
const knob = computed(() => KNOB[scen.value])
const KVAL = { low: ['×0.75', '−15%'], ref: ['×1.00', '−30%'], fav: ['×1.50', '−45%'], mlo: ['×0.75', '−30%'], mhi: ['×1.50', '−30%'], clo: ['×1.00', '−15%'], chi: ['×1.00', '−45%'] } as const

const kAct = computed(() => ['mlo', 'mhi'].includes(scen.value) ? 0 : ['clo', 'chi'].includes(scen.value) ? 1 : -1)
const KCAP: Record<Scen, string> = {
  ref: 'Reference scenario',
  mlo: 'Only manual search and follow-up time changes: 98.4 h of it in AS-IS, 47.5 h with DossierCheck',
  mhi: 'Only manual search and follow-up time changes: 98.4 h of it in AS-IS, 47.5 h with DossierCheck',
  clo: 'Only the speed-up of each correction changes',
  chi: 'Only the speed-up of each correction changes',
  low: 'Both together: Lower combined scenario',
  fav: 'Both together: Favourable combined scenario',
}
const approx = computed(() => step.value === 4 && ['mlo', 'mhi'].includes(scen.value))
const DIAL = [
  { t: 'How long manual searches and follow-ups take', s: 'shorter · reference · longer', v: ['×0.75', '×1.00', '×1.50'] },
  { t: 'How much faster each correction is', s: 'less · reference · more', v: ['−15%', '−30%', '−45%'] },
]
const rad = (a: number) => a * Math.PI / 180
const pt = (a: number, r: number) => ({ x: Math.sin(rad(a)) * r, y: -Math.cos(rad(a)) * r })
const ARC = (() => { const a = pt(-64, 41), b = pt(64, 41); return `M${a.x} ${a.y} A41 41 0 0 1 ${b.x} ${b.y}` })()

const CAP = [
  'FORZA: what would have happened with DossierCheck',
  'Every activity to find, correct and verify problems and to coordinate',
  'Each activity gets a duration: informed planning assumptions',
  'Estimated workload · reference scenario, by activity',
  'Net saving, including the work needed to use DossierCheck',
]
</script>

<template>
  <div class="stage" :class="[`en${en}`, `wk${step}`, `lp${lp}`, `sc-${scen}`, { wstill: still }]">

    <div v-if="!frozen" class="oldw"><AdvantagesSlide frozen class="old" /></div>

    <h2 class="display heading">
      <span :class="{ on: en === 0 }">Main Possible Advantages</span>
      <span :class="{ on: en >= 1 }">Estimated Workload</span>
    </h2>

    <div class="cap"><p v-for="(c, i) in CAP" :key="i" :class="{ on: en >= 2 && step === i }">{{ c }}</p></div>

    <div class="tabs">
      <div v-for="(p, i) in PROJ" :key="p" class="tab" :class="{ forza: i === 1 }" :style="{ left: `${300 + i * 180}px`, '--d': `${i * 0.08}s` }">
        <svg viewBox="0 0 48 38"><path d="M2 8 Q2 4 6 4 H18 L22 9 H42 Q46 9 46 13 V34 Q46 36 42 36 H6 Q2 36 2 32 Z" class="fd" /><path d="M2 14 H46" class="fdl" /></svg>
        <span>{{ p }}</span>
      </div>
    </div>

    <div class="rails">
      <svg viewBox="0 0 1280 720" class="lay">
        <defs>
          <g id="d13-desk"><rect x="-22" y="-2" width="44" height="6" rx="2" class="i-desk" /><path d="M-16 4 V18 M16 4 V18" class="i-ln" /><rect x="-14" y="-14" width="18" height="12" rx="2" class="i-paper" /><path d="M10 -2 V-14 L18 -20" class="i-ln" /></g>
          <g id="d13-comm"><path d="M-22 -10 L0 -22 L22 -10 Z" class="i-roof" /><rect x="-20" y="-10" width="40" height="4" class="i-wall" /><rect v-for="k in 4" :key="k" :x="-17 + (k - 1) * 10" y="-5" width="5" height="18" class="i-col" /><rect x="-22" y="13" width="44" height="5" class="i-wall" /></g>
          <g id="d13-mail"><rect x="-18" y="-12" width="36" height="26" rx="3" class="i-env" /><path d="M-17 -10 L0 3 L17 -10" class="i-ln" /></g>
          <g id="d13-scan"><circle cx="-4" cy="-4" r="11" class="i-lens" /><path d="M4 4 L14 14" class="i-ln thick" /></g>
        </defs>
        <g class="rail rh"><line x1="300" x2="1170" y1="300" y2="300" class="rl" /><text x="300" y="236" class="rname">Historical path</text></g>
        <g class="rail rd"><line x1="300" x2="1170" y1="500" y2="500" class="rl" /><text x="300" y="436" class="rname blue">With DossierCheck</text></g>
        <g v-for="(st, i) in HST" :key="`h${i}`" class="stn" :style="{ '--d': `${i * 0.12}s` }">
          <use :href="`#d13-${st.i}`" :x="SX[i]" :y="300 - 34" class="sico" />
          <circle :cx="SX[i]" cy="300" r="8" class="sdot" />
          <text :x="SX[i]" y="326" text-anchor="middle" class="sa">{{ st.a }}</text>
          <text :x="SX[i]" y="342" text-anchor="middle" class="sb">{{ st.b }}</text>
        </g>
        <g v-for="(st, i) in DST" :key="`d${i}`" class="stn" :style="{ '--d': `${0.3 + i * 0.12}s` }">
          <use :href="`#d13-${st.i}`" :x="SX[i]" :y="500 - 34" class="sico" />
          <circle :cx="SX[i]" cy="500" r="8" class="sdot blue" />
          <text :x="SX[i]" y="526" text-anchor="middle" class="sa">{{ st.a }}</text>
          <text :x="SX[i]" y="542" text-anchor="middle" class="sb">{{ st.b }}</text>
        </g>

        <path d="M928 286 C 900 214, 780 214, 750 280" class="loopa" /><path d="M744 266 l6 14 l10 -10" class="loopa tip" />
      </svg>
      <div class="stamp">Suspended</div>
      <div class="again">same issue, again · NfL sample</div>
      <div class="removed"><s>NfL sample · again</s><span>removed</span></div>
      <div class="tok th"><div class="tin"><svg viewBox="0 0 48 38"><path d="M2 8 Q2 4 6 4 H18 L22 9 H42 Q46 9 46 13 V34 Q46 36 42 36 H6 Q2 36 2 32 Z" class="fd" /><path d="M2 14 H46" class="fdl" /></svg><b class="bang">!</b><b class="okk">✓</b></div></div>
      <div class="tok td"><div class="tin"><svg viewBox="0 0 48 38"><path d="M2 8 Q2 4 6 4 H18 L22 9 H42 Q46 9 46 13 V34 Q46 36 42 36 H6 Q2 36 2 32 Z" class="fd" /><path d="M2 14 H46" class="fdl" /></svg><b class="bang">!</b><b class="okk">✓</b></div></div>
      <i v-for="(f, i) in PUFF" :key="`pf${i}`" class="puff" :style="{ left: `${f.x - 22}px`, top: `${f.y - 10}px`, '--t': `${f.t}s` }"><b /><b /><b /></i>
      <div class="donef dh">✓ corrections accepted</div>
      <div class="donef dd">✓ corrections accepted</div>
      <div class="laser" />
    </div>

    <div v-for="(b, i) in BRK" :key="`b${i}`" class="brk" :class="[`k-${b.k}`, { rep: b.rep }]" :style="{ left: `${b.x}px`, top: `${b.y}px`, '--d': `${b.d}s`, '--d2': `${b.d2}s`, '--tx': `${b.tx - b.x}px`, '--ty': `${b.ty - b.y}px`, '--tx2': `${b.tx2 - b.x}px`, '--ty2': `${b.ty2 - b.y}px`, '--hx': `${(b.tx + b.tx2) / 2 - b.x + ((i * 41) % 70) - 35}px`, '--hy': `${Math.min(b.ty, b.ty2) - b.y - 60 - ((i * 17) % 60)}px`, '--d3': `${b.d3}s`, '--scx': SCX, '--scy': SCY }"><span>{{ b.t }}</span></div>
    <div class="legend">
      <span><i class="k-f" />Find</span><span><i class="k-c" />Correct</span><span><i class="k-u" />Follow-up</span><span><i class="k-o" />Organise</span><span><i class="k-t" />DossierCheck work</span><em>1 brick ≈ 1 staff-hour</em>
    </div>

    <div class="price">
      <p class="pr-h">Planning assumptions <span>minutes per problem · Table 4.2</span></p>
      <div class="pr-r"><b>Inconsistent statement</b><span>Find 30</span><span>Correct 30 → 21</span><span>Follow-up 10</span><span>Check 5</span></div>
      <div class="pr-r"><b>Missing field</b><span>Find 8</span><span>Correct 10 → 7</span><span>Follow-up 6</span><span>Check 2</span></div>
      <p class="pr-n">informed by the reconstructed workflow and feedback from clinical staff</p>
    </div>

    <div class="towers">
      <div class="tbase" />
      <div v-for="(b, i) in TBR" :key="`t${i}`" class="tb" :class="[`k-${b.k}`, b.li === 0 ? 'f0' : 'fr', { gap: b.gap }]" :style="{ left: `${b.x}px`, top: `${b.y}px`, '--d': `${b.d}s`, '--sx': `${b.sx}px`, '--sy': `${b.sy}px`, '--dx2': `${b.x2 - b.x}px`, '--dy2': `${b.y2 - b.y}px`, '--hx': `${(b.x2 - b.x) * 0.5 + ((b.k2 * 37) % 70) - 35}px`, '--hy': `${Math.min(b.y, b.y2) - b.y - 40 - ((b.k2 * 13) % 70)}px`, '--rr': `${((b.k2 * 29) % 50) - 25}deg`, '--d3': `${0.15 + b.k2 * 0.007}s` }" />
      <template v-for="(l, i) in LAY" :key="`l${i}`">
        <div v-if="l.li > 0" class="lysep" :style="{ left: `${TX[l.path] - 3}px`, top: `${l.bot - 1}px`, '--d': `${2.3 + (l.li - 1) * 0.75}s` }" />
        <p class="lyl" :class="l.path" :style="{ left: `${TX[l.path] + TWW + 8}px`, top: `${(l.top + l.bot) / 2 - 15}px`, '--d': `${0.3 + l.li * 0.12}s`, '--dw': `${l.li === 0 ? 2.4 : 2.8 + (l.li - 1) * 0.75}s` }"><b>{{ PROJ[l.p] }}</b><i>{{ l.h.toFixed(2) }} h</i></p>
      </template>
      <p v-for="(g, i) in GLAB" :key="`g${i}`" class="glab" :class="[g.path, `g-${g.k}`]" :style="{ left: `${TX[g.path] + TWW + 8}px`, top: `${(g.top + g.bot) / 2 - 15}px`, '--d': `${1.3 + i * 0.06}s` }"><b>{{ g.name }}</b>{{ g.h.toFixed(1) }} h</p>
      <p class="tname" :style="{ left: `${TX.a + TWW / 2 - 75}px` }">AS-IS</p>
      <p class="tname blue" :style="{ left: `${TX.d + TWW / 2 - 75}px` }">With DossierCheck</p>
      <p class="ttot" :style="{ left: `${TX.a + TWW / 2 - 75}px`, top: `${tops.a - 32}px` }"><span class="mins">10,731 min</span><span class="hrs">{{ f2(hA) }} h</span></p>
      <p class="ttot blue" :style="{ left: `${TX.d + TWW / 2 - 75}px`, top: `${tops.d - 32}px` }"><span class="mins">8,481 min</span><span class="hrs">{{ f2(hB) }} h</span></p>
      <div class="gapline" :style="{ left: `${TX.a - 8}px`, width: `${TX.d + TWW - TX.a + 16}px`, top: `${topD2}px` }" />
      <div class="ghost" :style="{ left: `${TX.a - 2}px`, width: `${TWW + 4}px`, top: `${topA2 - 2}px`, height: `${topD2 - topA2 + 2}px` }" />
    </div>

    <div class="prj">
      <p class="pj-h">Per project · hours <span><i class="k-a" />AS-IS <i class="k-d" />With DossierCheck</span></p>
      <div v-for="(p, i) in PRJ" :key="p.n" class="pj-r" :style="{ '--d': `${0.5 + i * 0.12}s` }">
        <b>{{ p.n }}</b>
        <div class="pj-b"><i class="ba" :style="{ width: `${p.a * BMAX}px` }" /><em>{{ p.a.toFixed(2) }}</em></div>
        <div class="pj-b"><i class="bd" :style="{ width: `${p.d * BMAX}px` }" /><em>{{ p.d.toFixed(2) }}</em></div>
      </div>
    </div>

    <div class="saveb" :style="{ '--h': `${blk.h}px`, '--t': `${blk.top}px`, '--y0': `${topA2 - blk.top}px`, '--x0': `${TX.a - 226}px`, '--h0': `${topD2 - topA2}px` }">
      <p class="sv-top">staff-hours saved</p>
      <b>{{ approx ? '≈' : '' }}−{{ f2(hS) }} h</b>
      <span class="pct">≈21%</span>
    </div>
    <p class="svnote">Net of the work needed to use DossierCheck: analysis and reports 13.9 h · reviewer checks 5.22 h · confirmations 4.75 h</p>

    <div class="knobs">
      <p class="kn-h">What if the assumptions change?</p>
      <div v-for="(d, j) in DIAL" :key="`k${j}`" class="kn" :class="{ act: kAct === j, dim: kAct >= 0 && kAct !== j }">
        <svg viewBox="-66 -68 132 104">
          <defs>
            <radialGradient :id="`d13-cap${j}${sfx}`" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#FFFFFF" /><stop offset=".6" stop-color="#E6EBF3" /><stop offset="1" stop-color="#B9C4D6" /></radialGradient>
            <linearGradient :id="`d13-trk${j}${sfx}`" x1="0" x2="1"><stop offset="0" stop-color="#7FA8EE" /><stop offset=".5" stop-color="#1F5FD6" /><stop offset="1" stop-color="#F47B20" /></linearGradient>
          </defs>
          <path :d="ARC" class="ktrk" :stroke="`url(#d13-trk${j}${sfx})`" />
          <g v-for="(a, m) in [-50, 0, 50]" :key="m">
            <circle :cx="pt(a, 41).x" :cy="pt(a, 41).y" r="4.5" class="kdet" :class="{ on: knob[j] === a }" />
            <text :x="pt(a, 58).x + (a < 0 ? -7 : a > 0 ? 7 : 0)" :y="pt(a, 58).y + (a === 0 ? 2 : 4)" text-anchor="middle" class="kt" :class="{ on: knob[j] === a }">{{ d.v[m] }}</text>
          </g>
          <circle r="31" class="kring" />
          <g class="kptr" :style="{ transform: `rotate(${knob[j]}deg)` }">
            <circle r="28" :fill="`url(#d13-cap${j}${sfx})`" class="kcap" />
            <line v-for="q in 16" :key="q" :x1="pt(q * 22.5, 23).x" :y1="pt(q * 22.5, 23).y" :x2="pt(q * 22.5, 28).x" :y2="pt(q * 22.5, 28).y" class="kgrip" />
            <rect x="-3.5" y="-25" width="7" height="16" rx="3.5" class="knotch" />
          </g>
          <circle r="4" class="khub" />
        </svg>
        <b class="kval">{{ KVAL[scen][j] }}</b>
        <span>{{ d.t }}<em>{{ d.s }}</em></span>
      </div>
      <p class="kcap">{{ KCAP[scen] }}</p>
      <div class="kchips" :class="{ off: kAct >= 0 }"><b :class="{ on: scen === 'low' }">Lower</b><b :class="{ on: scen === 'ref' }">Reference</b><b :class="{ on: scen === 'fav' }">Favourable</b></div>
      <p class="kn-s">range 15.1–72.6 h · combined parameter scenarios (thesis, Table 4.5)</p>
    </div>

    <div class="ground" />
    <div class="doc"><Person v-bind="doc" :uid="`d13-doc${sfx}`" /></div>
    <p class="dlab"><b>Clinical researcher</b></p>

    <div class="bot" :class="{ bhappy: en === 0 || step === 3 || (step === 4 && !['low', 'mlo', 'clo'].includes(scen)), bwork: (step === 0 && en === 4) || step === 2 || (step === 4 && lp >= 1) }" :style="bot">
      <div class="bob">
        <svg viewBox="-60 -60 120 150" class="botsvg">
          <g class="barm l"><rect x="-31" y="22" width="13" height="34" rx="6.5" class="gold" /><circle cx="-24.5" cy="59" r="6.5" class="navy" /></g>
          <g class="barm r"><rect x="18" y="22" width="13" height="34" rx="6.5" class="gold" /><circle cx="24.5" cy="59" r="6.5" class="navy" /></g>
          <path d="M-30 -20 Q-44 -44 -30 -52 Q-18 -42 -14 -30 Z" class="ear" /><path d="M30 -20 Q44 -44 30 -52 Q18 -42 14 -30 Z" class="ear" />
          <path d="M-42 4 Q-44 30 0 32 Q44 30 42 4 Q40 -4 0 -4 Q-40 -4 -42 4 Z" class="gold" />
          <path d="M-34 8 Q-36 -36 0 -36 Q36 -36 34 8 Q0 14 -34 8 Z" class="visor" />
          <path d="M-35 8 Q0 15 35 8" class="rim" />
          <rect x="-11" y="-42" width="22" height="6" rx="3" class="topl" />
          <ellipse cx="-12" cy="-10" rx="5" ry="7" class="eyeb" /><ellipse cx="12" cy="-10" rx="5" ry="7" class="eyeb" />
          <path d="M-18 -8 Q-12 -17 -6 -8 M6 -8 Q12 -17 18 -8" class="eyh" />
          <path d="M-6 2 q3 4 6 0 q3 4 6 0" class="mouth" />
          <text y="23" text-anchor="middle" class="htag">GPT-4o</text>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>

.oldw { position: absolute; inset: 0; z-index: 0; transition: opacity .6s ease .35s; }
.stage:not(.en0) .oldw { opacity: 0; }
.old :deep(.heading), .old :deep(.doc), .old :deep(.dlab), .old :deep(.bot) { opacity: 0 !important; transition: none !important; }
.old :deep(.list) { transition: transform .6s cubic-bezier(.5, 0, .7, .4) !important; }
.stage:not(.en0) .old :deep(.list) { transform: translateX(420px) !important; }
.old :deep(.offc) { transition: transform .5s ease !important; }
.stage:not(.en0) .old :deep(.offc) { transform: translateX(160px) !important; }
.wstill, .wstill * { transition: none !important; }

.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 30; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .45s ease, transform .45s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .3s; }
.heading span:first-child { position: relative; transition: none; transform: none; }
.heading span:first-child:not(.on) { opacity: 0; transition: opacity .3s ease; }
.cap { position: absolute; left: 300px; top: 104px; width: 900px; height: 30px; z-index: 6; }
.cap p { position: absolute; inset: 0; margin: 0; font-size: 19px; font-weight: 700; color: #1F5FD6; opacity: 0; transform: translateY(8px); transition: opacity .35s ease, transform .35s ease; }
.cap p.on { opacity: 1; transform: none; transition-delay: .35s; }
.lay { position: absolute; inset: 0; width: 1280px; height: 720px; overflow: visible; }

.tabs { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
.tab { position: absolute; top: 146px; width: 168px; height: 36px; display: flex; align-items: center; gap: 8px; box-sizing: border-box; padding: 0 10px; border: 2px solid #C9D2E0; border-radius: 10px; background: #FFFFFF; opacity: 0; transform: translateY(-30px); transition: opacity .3s ease, transform .5s cubic-bezier(.3, 1.6, .5, 1), border-color .3s ease, box-shadow .3s ease; }
.tab svg { width: 26px; height: 21px; flex: none; }
.tab span { font-size: 13px; font-weight: 800; color: var(--ink); white-space: nowrap; }
.stage:is(.en2, .en3, .en4) .tab { opacity: 1; transform: none; transition-delay: var(--d); }
.stage:is(.en3, .en4) .tab.forza { border-color: #1F5FD6; box-shadow: 0 0 0 4px rgba(31, 95, 214, .18); }
.stage.wk2:is(.lp1, .lp2) .tab { opacity: 0; transition-delay: 3.4s; }
.stage.wk3 .tab, .stage.wk4 .tab, .stage.wstill.wk2 .tab { opacity: 0; transition-delay: 0s; }
.wk2.lp1 .tab:not(.forza) { animation: tabShake .2s ease-in-out .3s 6 alternate; }
@keyframes tabShake { to { transform: translateY(-4px) rotate(-2deg); } }
.fd { fill: #1F5FD6; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; } .fdl { stroke: #0B2A5B; stroke-width: 2; }

.rails { position: absolute; inset: 0; z-index: 2; transition: opacity .4s ease; }
.wk2 .rails, .wk3 .rails, .wk4 .rails { opacity: 0; }
.rl { stroke: #0B2A5B; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 880; stroke-dashoffset: 880; transition: stroke-dashoffset 1s cubic-bezier(.5, 0, .3, 1); }
.rd .rl { stroke: #1F5FD6; transition-delay: .25s; }
.stage:is(.en3, .en4) .rl { stroke-dashoffset: 0; }
.rname { font-family: var(--font-display); font-size: 15px; font-weight: 700; fill: var(--ink); opacity: 0; transition: opacity .3s ease .4s; } .rname.blue { fill: #1F5FD6; }
.stage:is(.en3, .en4) .rname { opacity: 1; }
.wk1 .rname, .wk1 .stamp, .wk1 .again, .wk1 .removed { opacity: 0 !important; transition: opacity .3s ease; }
.stn { opacity: 0; transform: translateY(8px); transition: opacity .3s ease, transform .4s cubic-bezier(.3, 1.6, .5, 1); }
.stage:is(.en3, .en4) .stn { opacity: 1; transform: none; transition-delay: calc(.6s + var(--d)); }
.sdot { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 3; } .sdot.blue { stroke: #1F5FD6; }
.sa { font-size: 13px; font-weight: 800; fill: var(--ink); } .sb { font-size: 11.5px; font-weight: 600; fill: var(--mist); }
.sico { transition: opacity .3s ease; }
.wk1 .sico, .wk2 .sico { opacity: .12; }
.i-desk { fill: #C49A3E; stroke: #0B2A5B; stroke-width: 2; } .i-ln { fill: none; stroke: #0B2A5B; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; } .i-ln.thick { stroke-width: 4; }
.i-paper { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 1.5; } .i-roof { fill: #E1E6EF; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.i-wall { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 1.8; } .i-col { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 1.5; }
.i-env { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; } .i-lens { fill: #DFF6FF; stroke: #1F5FD6; stroke-width: 3; }
.loopa { fill: none; stroke: #F47B20; stroke-width: 2.5; stroke-dasharray: 6 6; opacity: 0; }
.loopa.tip { stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; }
.en4.wk0 .loopa { animation: loopIn .4s ease 4.8s both, march 1s linear 4.8s infinite; }
.wstill .loopa, .wk1 .loopa { opacity: .9; }
@keyframes loopIn { to { opacity: .9; } }
@keyframes march { to { stroke-dashoffset: -12; } }
.stamp { position: absolute; left: 498px; top: 214px; padding: 1px 8px; border: 3px solid #C55A0E; border-radius: 6px; color: #C55A0E; background: rgba(255, 255, 255, .9); font-family: var(--font-display); font-size: 15px; font-weight: 800; text-transform: uppercase; transform: rotate(-10deg) scale(2); opacity: 0; z-index: 4; }
.en4.wk0 .stamp { animation: stampIn .25s ease-in 1.1s both; }
.wstill .stamp, .wk1 .stamp { opacity: 1; transform: rotate(-10deg); }
@keyframes stampIn { to { opacity: 1; transform: rotate(-10deg) scale(1); } }
.again { position: absolute; left: 860px; top: 214px; padding: 3px 10px; border-radius: 8px; background: #F47B20; border: 2px solid #0B2A5B; color: #FFFFFF; font-size: 12.5px; font-weight: 800; white-space: nowrap; opacity: 0; transform: scale(.4); z-index: 4; }
.en4.wk0 .again { animation: popIn .4s cubic-bezier(.3, 1.8, .5, 1) 3.8s both, wob .5s ease-in-out 4.2s 3 alternate; }
.wstill .again, .wk1 .again { opacity: 1; transform: none; }
@keyframes popIn { to { opacity: 1; transform: none; } }
@keyframes wob { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } }
.removed { position: absolute; left: 872px; top: 416px; display: flex; align-items: center; gap: 6px; opacity: 0; z-index: 4; }
.removed s { padding: 2px 8px; border-radius: 8px; border: 2px dashed #F47B20; color: #C55A0E; font-size: 12px; font-weight: 800; white-space: nowrap; text-decoration: none; background-image: linear-gradient(#0B2A5B, #0B2A5B); background-repeat: no-repeat; background-position: 0 50%; background-size: 0 2.5px; }
.removed span { font-size: 11.5px; font-weight: 800; color: #1F5FD6; opacity: 0; }
.en4.wk0 .removed { animation: popIn .3s ease 2.9s both; }
.en4.wk0 .removed s { animation: strikeIn .5s ease 3.35s both; }
.en4.wk0 .removed span { animation: popIn .3s ease 3.7s both; }
@keyframes strikeIn { to { background-size: 100% 2.5px; opacity: .55; } }
.wstill .removed, .wk1 .removed { opacity: 1; }
.wstill .removed s, .wk1 .removed s { background-size: 100% 2.5px; opacity: .55; }
.wstill .removed span, .wk1 .removed span { opacity: 1; }

.tok { position: absolute; width: 40px; height: 32px; z-index: 5; opacity: 0; }
.tin { position: relative; width: 100%; height: 100%; transform-origin: 50% 100%; }
.tin svg { width: 100%; height: 100%; }
.th { left: 330px; top: 266px; } .td { left: 330px; top: 466px; }
.bang { position: absolute; right: -6px; top: -8px; width: 18px; height: 18px; border-radius: 50%; background: #F47B20; border: 2px solid #0B2A5B; box-sizing: border-box; color: #FFFFFF; display: grid; place-items: center; font-size: 11px; font-weight: 800; }
.okk { position: absolute; right: -6px; top: -8px; width: 18px; height: 18px; border-radius: 50%; background: #FFFFFF; border: 2px solid #1F5FD6; box-sizing: border-box; color: #1F5FD6; display: grid; place-items: center; font-size: 11px; font-weight: 800; opacity: 0; transform: scale(0); }
.en3 .tok, .en4 .tok { opacity: 1; transition: opacity .3s ease 1.4s; }

.en4.wk0 .th { animation: runH 6.8s linear .2s both; }
@keyframes runH {
  0%, 4.41% { transform: none; animation-timing-function: cubic-bezier(.3, .6, .5, 1); }
  8.8% { transform: translate(98px, -46px); animation-timing-function: cubic-bezier(.5, 0, .7, .4); }
  13.24%, 29.41% { transform: translateX(195px); animation-timing-function: cubic-bezier(.3, .6, .5, 1); }
  33.8% { transform: translate(293px, -46px); animation-timing-function: cubic-bezier(.5, 0, .7, .4); }
  38.24%, 44.12% { transform: translateX(390px); animation-timing-function: cubic-bezier(.3, .6, .5, 1); }
  48.5% { transform: translate(488px, -46px); animation-timing-function: cubic-bezier(.5, 0, .7, .4); }
  52.94%, 67.65% { transform: translateX(585px); animation-timing-function: cubic-bezier(.3, .6, .5, 1); }
  72% { transform: translate(488px, -78px) rotate(-30deg); animation-timing-function: cubic-bezier(.5, 0, .7, .4); }
  76.47%, 79.41% { transform: translateX(390px); animation-timing-function: cubic-bezier(.3, .6, .5, 1); }
  85.3% { transform: translate(585px, -96px) rotate(8deg); animation-timing-function: cubic-bezier(.5, 0, .7, .4); }
  91.18%, 100% { transform: translateX(780px); } }
.en4.wk0 .th .tin { animation: squashH 6.8s linear .2s both; }
@keyframes squashH { 0%, 12.6% { transform: none; } 13.24% { transform: scale(1.2, .75); } 15.5%, 37.6% { transform: none; } 38.24% { transform: scale(1.2, .75); } 40.5%, 52.3% { transform: none; } 52.94% { transform: scale(1.2, .75); } 55.2%, 75.8% { transform: none; }
  76.47% { transform: scale(1.2, .75); } 78.7%, 90.5% { transform: none; } 91.18% { transform: scale(1.2, .75); } 93.5%, 100% { transform: none; } }
.en4.wk0 .th .bang { animation: bangLife 6.8s ease .2s both; }
@keyframes bangLife { 0%, 50% { transform: none; opacity: 1; } 53% { transform: scale(1.8) rotate(-12deg); } 56% { transform: scale(1.5) rotate(10deg); } 59%, 91% { transform: scale(1.5); opacity: 1; }
  94% { transform: translate(8px, -22px) scale(1.3) rotate(40deg); opacity: 1; } 100% { transform: translate(30px, 30px) scale(.4) rotate(160deg); opacity: 0; } }
.en4.wk0 .th .okk { animation: popIn .35s cubic-bezier(.3, 1.8, .5, 1) 6.7s both; }

.en4.wk0 .td { animation: runD 4s linear both; }
@keyframes runD {
  0%, 42.5% { transform: none; animation-timing-function: cubic-bezier(.3, .6, .5, 1); }
  48.1% { transform: translate(98px, -30px); animation-timing-function: cubic-bezier(.5, 0, .7, .4); }
  53.75%, 56.75% { transform: translateX(195px); animation-timing-function: cubic-bezier(.3, .6, .5, 1); }
  62.4% { transform: translate(293px, -30px); animation-timing-function: cubic-bezier(.5, 0, .7, .4); }
  68%, 71% { transform: translateX(390px); animation-timing-function: cubic-bezier(.3, .6, .5, 1); }
  76.6% { transform: translate(488px, -30px); animation-timing-function: cubic-bezier(.5, 0, .7, .4); }
  82.25%, 85.25% { transform: translateX(585px); animation-timing-function: cubic-bezier(.3, .6, .5, 1); }
  90.9% { transform: translate(683px, -30px); animation-timing-function: cubic-bezier(.5, 0, .7, .4); }
  96.5%, 100% { transform: translateX(780px); } }
.en4.wk0 .td .tin { animation: squashD 4s linear both; }
@keyframes squashD { 0%, 53% { transform: none; } 53.75% { transform: scale(1.15, .82); } 55.5%, 67.3% { transform: none; } 68% { transform: scale(1.15, .82); } 69.7%, 81.5% { transform: none; } 82.25% { transform: scale(1.15, .82); } 84%, 95.8% { transform: none; } 96.5% { transform: scale(1.15, .82); } 98.5%, 100% { transform: none; } }
.en4.wk0 .td .bang { animation: bangOff .5s ease 1.2s both; }
@keyframes bangOff { 40% { transform: translate(4px, -14px) rotate(20deg); opacity: 1; } 100% { transform: translate(30px, 40px) rotate(120deg) scale(.5); opacity: 0; } }
.en4.wk0 .td .okk { animation: popIn .35s cubic-bezier(.3, 1.8, .5, 1) 1.6s both; }
.wstill .th, .wk1 .th, .wstill .td, .wk1 .td { transform: translateX(780px); }
.wstill .bang, .wk1 .bang { opacity: 0; }
.wstill .okk, .wk1 .okk { opacity: 1; transform: none; }
.puff { position: absolute; width: 44px; height: 14px; z-index: 4; pointer-events: none; }
.puff b { position: absolute; bottom: 0; width: 9px; height: 9px; border-radius: 50%; background: #C9D2E0; opacity: 0; }
.puff b:nth-child(1) { left: 4px; --px: -12px; } .puff b:nth-child(2) { left: 18px; --px: 0px; } .puff b:nth-child(3) { left: 32px; --px: 12px; }
.en4.wk0 .puff b { animation: puff .55s ease-out var(--t) both; }
@keyframes puff { 0% { opacity: .9; transform: none; } 100% { opacity: 0; transform: translate(var(--px), -10px) scale(2.2); } }
.en4.wk0 .stn .sdot { animation: none; }
.donef { position: absolute; left: 1060px; padding: 3px 9px; border-radius: 8px; border: 2px solid #1F5FD6; background: #FFFFFF; color: #1F5FD6; font-size: 11.5px; font-weight: 800; white-space: nowrap; opacity: 0; transform: translateY(8px) scale(.6); z-index: 5; }
.dh { top: 226px; } .dd { top: 426px; }
.en4.wk0 .dd { animation: popIn .4s cubic-bezier(.3, 1.8, .5, 1) 4s both; }
.en4.wk0 .dh { animation: popIn .4s cubic-bezier(.3, 1.8, .5, 1) 6.9s both; }
.wstill .donef, .wk1 .donef { opacity: 1; transform: none; }
.wk1 .donef { opacity: 0 !important; transition: opacity .3s ease; }
.laser { position: absolute; left: 330px; top: 410px; width: 40px; height: 60px; background: linear-gradient(rgba(79, 184, 255, .6), rgba(79, 184, 255, .1)); clip-path: polygon(40% 0, 60% 0, 100% 100%, 0 100%); opacity: 0; z-index: 4; }
.en4.wk0 .laser { animation: laser 1.1s ease .4s both; }
@keyframes laser { 0% { opacity: 0; } 20%, 80% { opacity: 1; } 100% { opacity: 0; } }
.wk1 .tok { opacity: .25; }

.brk { position: absolute; width: 92px; height: 20px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 5px; color: #FFFFFF; display: grid; place-items: center; font-size: 11px; font-weight: 800; white-space: nowrap; z-index: 6; opacity: 0; transform: translateY(14px) scale(.6); transform-origin: 0 0; }
.brk span { transition: opacity .2s ease; }
.brk.rep { box-shadow: 0 0 0 3px rgba(244, 123, 32, .55); }
.k-f { background: #1F5FD6; } .k-c { background: #F47B20; } .k-u { background: #C49A3E; } .k-o { background: #A9B4C7; color: #0B2A5B !important; }
.k-t { background: repeating-linear-gradient(45deg, #FFFFFF 0 5px, #DCE8FF 5px 10px); color: #1F5FD6 !important; border-style: dashed !important; border-color: #1F5FD6 !important; }
.wk1 .brk { animation: brickIn .45s cubic-bezier(.3, 1.6, .5, 1) calc(.2s + var(--d)) both; }
@keyframes brickIn { to { opacity: 1; transform: none; } }

.wk2 .brk { opacity: 1; transform: none; animation: brickGo .8s cubic-bezier(.5, 0, .3, 1) var(--d2) both; }
.wk2 .brk span, .wk3 .brk span, .wk4 .brk span { opacity: 0; transition-delay: var(--d2); }
@keyframes brickGo { 0% { transform: none; } 45% { transform: translate(calc(var(--tx) * .5), calc(var(--ty) * .5 - 60px)) scale(.7, .7); } 100% { transform: translate(var(--tx), var(--ty)) scale(var(--scx), var(--scy)); } }
.wk2 .brk.rep, .wk3 .brk.rep, .wk4 .brk.rep { box-shadow: none; }
.wstill.wk2 .brk { opacity: 1; animation: none; transform: translate(var(--tx), var(--ty)) scale(var(--scx), var(--scy)); }
.wk3 .brk, .wk4 .brk { opacity: 1; transform: translate(var(--tx2), var(--ty2)) scale(var(--scx), var(--scy)); }
.wk3:not(.wstill) .brk { animation: resortR 1.3s cubic-bezier(.45, 0, .3, 1) var(--d3) both; }
@keyframes resortR {
  0% { transform: translate(var(--tx), var(--ty)) scale(var(--scx), var(--scy)); }
  40% { transform: translate(var(--hx), var(--hy)) rotate(-20deg) scale(calc(var(--scx) * 1.3), calc(var(--scy) * 1.3)); }
  86% { transform: translate(var(--tx2), calc(var(--ty2) + 3px)) scale(calc(var(--scx) * 1.08), calc(var(--scy) * .8)); }
  100% { transform: translate(var(--tx2), var(--ty2)) scale(var(--scx), var(--scy)); } }
.legend { position: absolute; left: 300px; top: 650px; display: flex; align-items: center; gap: 16px; z-index: 6; opacity: 0; transition: opacity .3s ease; }
.legend span { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: var(--ink); }
.legend i { display: inline-block; width: 18px; height: 12px; border: 2px solid #0B2A5B; border-radius: 3px; box-sizing: border-box; }
.legend em { font-style: normal; font-size: 12px; font-weight: 800; color: #1F5FD6; opacity: 0; transition: opacity .3s ease; }
.wk2 .legend em, .wk3 .legend em, .wk4 .legend em { opacity: 1; transition-delay: 1.4s; }
.wk1 .legend, .wk2 .legend, .wk3 .legend, .wk4 .legend { opacity: 1; transition-delay: .6s; }
.wk1 .legend { transition-delay: 1.2s; }

.price { position: absolute; left: 920px; top: 200px; width: 300px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 12px; background: #FFFFFF; padding: 9px 12px; box-shadow: 0 10px 22px rgba(11, 42, 91, .12); z-index: 7; opacity: 0; transform: translateX(-40px) scale(.6); transform-origin: 0 50%; transition: opacity .3s ease, transform .5s cubic-bezier(.3, 1.5, .5, 1); }
.wk2 .price { opacity: 1; transform: none; transition-delay: .5s; }
.wk3 .price { opacity: 0; transform: none; }
.wk4 .price { opacity: 0; transform: none; }
.pr-h { margin: 0 0 6px; font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--ink); }
.pr-h span { display: block; font-family: inherit; font-size: 11px; font-weight: 700; color: var(--mist); }
.pr-r { display: flex; flex-wrap: wrap; gap: 3px 5px; margin-bottom: 6px; }
.pr-r b { width: 100%; font-size: 12px; color: var(--ink); }
.pr-r span { font-size: 11px; font-weight: 700; color: #1F5FD6; background: #DCE8FF; border-radius: 5px; padding: 0 5px; }
.pr-n { margin: 2px 0 0; font-size: 10.5px; font-weight: 600; color: var(--mist); }

.towers { position: absolute; inset: 0; z-index: 5; pointer-events: none; }
.tbase { position: absolute; left: 400px; top: 612px; width: 400px; height: 4px; border-radius: 2px; background: #0B2A5B; opacity: 0; transition: opacity .3s ease; }
.wk2 .tbase, .wk3 .tbase, .wk4 .tbase { opacity: 1; transition-delay: .2s; }
.tb { position: absolute; width: 25px; height: 7px; box-sizing: border-box; border: 1.5px solid #0B2A5B; border-radius: 2px; opacity: 0; }
.tb.k-t { border-width: 1.5px; }
.wk2 .tb.f0 { animation: tbPop .35s cubic-bezier(.3, 1.8, .5, 1) var(--d) both; }
@keyframes tbPop { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: none; } }
.wk2 .tb.fr { animation: tbFall .6s cubic-bezier(.45, 0, .6, 1.25) var(--d) both; }
@keyframes tbFall { 0% { opacity: 0; transform: translate(var(--sx), var(--sy)) rotate(40deg) scale(.6); } 6%, 60% { opacity: 1; } 100% { opacity: 1; transform: none; } }
.wstill.wk2 .tb { opacity: 1; animation: none; transform: none; }
.wk3 .tb, .wk4 .tb { opacity: 1; animation: none; transform: translate(var(--dx2), var(--dy2)); transition: opacity .3s ease; }

.wk3:not(.wstill) .tb { animation: resort 1.3s cubic-bezier(.45, 0, .3, 1) var(--d3) both; }
@keyframes resort {
  0% { transform: none; }
  12% { transform: translateY(-6px) scale(1.15); }
  45% { transform: translate(var(--hx), var(--hy)) rotate(var(--rr)) scale(1.25); }
  86% { transform: translate(var(--dx2), calc(var(--dy2) + 3px)) scale(1.08, .8); }
  100% { transform: translate(var(--dx2), var(--dy2)); } }
.wk4 .tb.gap { opacity: .15; }

.wk4:not(.wstill) .tb.gap { animation: gapGlow 1.5s ease both; }
@keyframes gapGlow { 0% { opacity: 1; filter: none; } 30%, 55% { opacity: 1; filter: brightness(1.25) drop-shadow(0 0 4px #4FB8FF); transform: translate(var(--dx2), calc(var(--dy2) - 2px)); } 75% { opacity: .5; } 100% { opacity: .15; } }
.wk4 .brk { transition: none; }
.lysep { position: absolute; width: 112px; height: 0; border-top: 2px solid #FFFFFF; opacity: 0; z-index: 1; }
.wk2 .lysep { animation: popIn .2s ease var(--d) both; }
.wstill.wk2 .lysep { opacity: 1; transform: none; }
.wk3 .lysep, .wk4 .lysep { opacity: 0; }
.lyl { position: absolute; margin: 0; font-size: 11.5px; font-weight: 700; line-height: 14px; color: var(--mist); white-space: nowrap; opacity: 0; transform: translateX(-6px); }
.lyl b { display: block; color: var(--ink); font-size: 11.5px; }
.lyl.d b { color: #1F5FD6; }
.lyl i { font-style: normal; opacity: 0; transition: opacity .3s ease; }
.wk2 .lyl { animation: popIn .3s ease var(--dw) both; }
.wstill.wk2 .lyl { opacity: 1; transform: none; animation: none; }
.wk3 .lyl, .wk4 .lyl { opacity: 0; animation: none; transition: opacity .25s ease; }
.glab { position: absolute; margin: 0; font-size: 11.5px; font-weight: 700; line-height: 14px; color: var(--mist); white-space: nowrap; opacity: 0; transform: translateX(-6px); }
.glab b { display: block; color: var(--ink); }
.glab.d b { color: #1F5FD6; }
.wk3 .glab { animation: popIn .3s ease var(--d) both; }
.wk4 .glab, .wstill.wk3 .glab { opacity: 1; transform: none; animation: none; }
.tname { position: absolute; top: 620px; width: 150px; margin: 0; text-align: center; font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--ink); opacity: 0; transition: opacity .3s ease; }
.tname.blue { color: #1F5FD6; }
.wk2 .tname, .wk3 .tname, .wk4 .tname { opacity: 1; transition-delay: .3s; }
.ttot { position: absolute; width: 150px; height: 26px; transition: top .8s cubic-bezier(.5, 0, .3, 1) .3s; margin: 0; text-align: center; font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--ink); }
.ttot.blue { color: #1F5FD6; }
.ttot span { position: absolute; left: 0; right: 0; top: 0; opacity: 0; transition: opacity .3s ease, transform .3s ease; }
.wk2 .mins { opacity: 1; transition-delay: 5.6s; }
.wstill.wk2 .mins { opacity: 1; }
.wk3 .hrs, .wk4 .hrs { opacity: 1; transition-delay: .2s; }
.wk3 .mins { opacity: 0; transform: translateY(-14px); }
.gapline { position: absolute; height: 0; border-top: 2px dashed #1F5FD6; opacity: 0; transition: opacity .3s ease; }
.wk4 .gapline { opacity: .8; transition-delay: .3s; }
.ghost { position: absolute; box-sizing: border-box; border: 2px dashed #F47B20; border-radius: 3px; opacity: 0; transition: opacity .3s ease; }
.wk4 .ghost { opacity: 1; transition-delay: .5s; }

.prj { position: absolute; left: 920px; top: 200px; width: 300px; z-index: 6; opacity: 0; transition: opacity .3s ease; }
.wk3 .prj, .wk4.lp0 .prj { opacity: 1; transition-delay: .3s; }
.pj-h { margin: 0 0 8px; font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--ink); }
.pj-h span { display: block; font-family: inherit; font-size: 11px; font-weight: 700; color: var(--mist); }
.pj-h i { display: inline-block; width: 12px; height: 8px; border-radius: 2px; margin: 0 3px 0 6px; }
.k-a, .ba { background: #8C96A8; } .k-d, .bd { background: #1F5FD6; }
.pj-r { margin-bottom: 7px; }
.pj-r b { display: block; font-size: 12px; color: var(--ink); margin-bottom: 2px; }
.pj-b { display: flex; align-items: center; gap: 6px; height: 11px; margin-bottom: 2px; }
.pj-b i { display: block; height: 9px; border-radius: 2px; transform-origin: 0 50%; transform: scaleX(0); }
.pj-b em { font-style: normal; font-size: 10.5px; font-weight: 700; color: var(--mist); opacity: 0; }
.wk3 .pj-b i { animation: grow .7s cubic-bezier(.3, 1.2, .5, 1) var(--d) both; }
.wk3 .pj-b em { animation: popIn .3s ease calc(var(--d) + .5s) both; }
@keyframes grow { to { transform: scaleX(1); } }
.wk4 .pj-b i, .wstill.wk3 .pj-b i { transform: none; animation: none; }
.wk4 .pj-b em, .wstill.wk3 .pj-b em { opacity: 1; transform: none; animation: none; }

.saveb { position: absolute; left: 226px; top: var(--t); width: 132px; height: var(--h); box-sizing: border-box; border: 3px solid #0B2A5B; border-radius: 8px; background: linear-gradient(160deg, #4F8DF2, #1F5FD6); box-shadow: 0 0 0 5px rgba(31, 95, 214, .2), 0 0 30px rgba(79, 141, 242, .55); z-index: 8; opacity: 0; display: grid; place-items: center; color: #FFFFFF; transform-origin: 0 0; transition: top .8s cubic-bezier(.3, 1.3, .5, 1), height .8s cubic-bezier(.3, 1.3, .5, 1); }
.saveb b { font-family: var(--font-display); font-size: 22px; white-space: nowrap; font-weight: 800; line-height: 1; }
.sv-top { position: absolute; left: -10px; right: -10px; top: -44px; margin: 0; text-align: center; font-size: 12.5px; font-weight: 800; color: #1F5FD6; }
.pct { position: absolute; left: -10px; right: -10px; top: -26px; text-align: center; font-family: var(--font-display); font-size: 16px; font-weight: 800; color: #1F5FD6; opacity: 0; transition: opacity .3s ease; }

.wk4 .saveb { opacity: 1; animation: lift 2.4s cubic-bezier(.45, 0, .3, 1) .5s both, glow 1.6s ease-in-out 3s infinite alternate; }
@keyframes lift {
  0% { opacity: 0; transform: translate(var(--x0), var(--y0)) scale(.803, 1); }
  25% { opacity: 1; transform: translate(var(--x0), var(--y0)) scale(.803, 1); }
  32% { opacity: 1; transform: translate(var(--x0), calc(var(--y0) + 3px)) scale(.83, .96); }
  52% { transform: translate(var(--x0), calc(var(--y0) - 46px)) rotate(-4deg) scale(.9, 1); }
  100% { opacity: 1; transform: none; } }
.wk4:not(.wstill) .saveb > b, .wk4:not(.wstill) .saveb > .sv-top { animation: txtIn .4s ease 1.9s both; }
.wk4.sc-ref .pct { opacity: 1; }
.wk4.lp0.sc-ref:not(.wstill) .pct { transition-delay: 1.9s; }
@keyframes txtIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes glow { to { box-shadow: 0 0 0 8px rgba(31, 95, 214, .14), 0 0 44px rgba(79, 141, 242, .8); } }
.wstill.wk4 .saveb { animation: glow 1.6s ease-in-out infinite alternate; }
.svnote { position: absolute; left: 212px; top: 572px; width: 200px; margin: 0; font-size: 11px; font-weight: 600; line-height: 1.3; color: var(--mist); opacity: 0; transition: opacity .3s ease; z-index: 8; }
.wk4 .svnote { opacity: 1; transition-delay: 2.6s; }

.knobs { position: absolute; left: 920px; top: 196px; width: 300px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 14px; background: linear-gradient(#FFFFFF, #F7F9FD); padding: 10px 10px 10px; box-shadow: 0 12px 26px rgba(11, 42, 91, .14); z-index: 7; display: flex; flex-wrap: wrap; justify-content: space-around; opacity: 0; transform: translateY(-14px) scale(.9); transition: opacity .3s ease, transform .45s cubic-bezier(.3, 1.5, .5, 1); }
.wk4.lp1 .knobs, .wk4.lp2 .knobs, .wk4.lp9 .knobs { opacity: 1; transform: none; }
.kn-h { width: 100%; margin: 0; font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--ink); }
.kn { width: 138px; display: flex; flex-direction: column; align-items: center; }
.kn svg { width: 132px; height: 104px; overflow: visible; }
.ktrk { fill: none; stroke-width: 7; stroke-linecap: round; opacity: .35; }
.kdet { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; transition: fill .3s ease, r .3s ease; }
.kdet.on { fill: #F47B20; }
.kt { font-size: 11px; font-weight: 800; fill: var(--mist); transition: fill .3s ease; }
.kt.on { fill: var(--ink); }
.kring { fill: #0B2A5B; opacity: .12; transform: translateY(3px); }
.kptr { transition: transform .8s cubic-bezier(.3, 1.6, .5, 1); }
.kcap { stroke: #0B2A5B; stroke-width: 2.5; }
.kgrip { stroke: #8C96A8; stroke-width: 1.6; stroke-linecap: round; }
.knotch { fill: #F47B20; stroke: #0B2A5B; stroke-width: 1.5; }
.khub { fill: #0B2A5B; }
.kval { margin-top: -6px; padding: 1px 10px; border-radius: 9px; background: #0B2A5B; color: #FFFFFF; font-family: var(--font-display); font-size: 13px; font-weight: 800; }
.kn span { margin-top: 4px; font-size: 11px; font-weight: 800; line-height: 1.2; text-align: center; color: var(--ink); }
.kn span em { display: block; margin-top: 2px; font-style: normal; font-size: 9.5px; font-weight: 700; color: var(--mist); }
.kn { transition: opacity .35s ease, transform .35s cubic-bezier(.3, 1.5, .5, 1); border-radius: 12px; }
.kn.act { transform: scale(1.06); box-shadow: 0 0 0 3px rgba(244, 123, 32, .35); background: #FFF7F0; }
.kn.dim { opacity: .38; }
.kcap { width: 100%; min-height: 28px; margin: 6px 0 0; text-align: center; font-size: 11px; font-weight: 800; line-height: 1.3; color: #C55A0E; }
.kchips { transition: opacity .3s ease; } .kchips.off { opacity: .35; }

.wk4 .tb::after { content: ''; position: absolute; inset: -1.5px; border-radius: 2px; opacity: 0; pointer-events: none; }
.wk4:is(.sc-mlo, .sc-mhi) .tb:is(.k-f, .k-u)::after, .wk4:is(.sc-clo, .sc-chi) .tb.k-c::after { box-shadow: 0 0 0 1.5px #FFC233, 0 0 8px rgba(255, 194, 51, .95); animation: brkGlow .7s ease-in-out infinite alternate; }
@keyframes brkGlow { from { opacity: .25; } to { opacity: 1; } }
.wk4 .tb { transition: filter .35s ease; }
.wk4 .brk { transition: filter .35s ease; }
.wk4:is(.sc-mlo, .sc-mhi) :is(.tb, .brk):not(.k-f):not(.k-u), .wk4:is(.sc-clo, .sc-chi) :is(.tb, .brk):not(.k-c) { filter: grayscale(.85) opacity(.4); }
.wk4:is(.sc-mlo, .sc-mhi, .sc-clo, .sc-chi) .glab { transition: opacity .3s ease; }
.wk4:is(.sc-mlo, .sc-mhi) .glab:not(.g-f):not(.g-u), .wk4:is(.sc-clo, .sc-chi) .glab:not(.g-c) { opacity: .3 !important; }
.kchips { width: 100%; display: flex; justify-content: center; gap: 6px; margin-top: 8px; }
.kchips b { padding: 2px 9px; border-radius: 8px; border: 1.5px solid #C9D2E0; font-size: 11.5px; font-weight: 800; color: var(--mist); transition: background .3s ease, color .3s ease, border-color .3s ease; }
.kchips b.on { background: #1F5FD6; border-color: #1F5FD6; color: #FFFFFF; }
.kn-s { width: 100%; margin: 6px 0 0; text-align: center; font-size: 10.5px; font-weight: 600; color: var(--mist); }

.ground { position: absolute; left: 30px; width: 860px; top: 624px; height: 2px; background: #E1E6EF; z-index: 1; }
.doc { position: absolute; left: 130px; top: 350px; width: 160px; height: 270px; z-index: 7; transition: left 1s cubic-bezier(.4, 0, .3, 1); }
.stage:not(.en0) .doc { left: 40px; }
.dlab { position: absolute; left: 110px; top: 630px; width: 200px; margin: 0; text-align: center; font-size: 14px; color: var(--ink); z-index: 7; transition: left 1s cubic-bezier(.4, 0, .3, 1); }
.stage:not(.en0) .dlab { left: 20px; }
.bot { position: absolute; left: 0; top: 0; width: 120px; height: 150px; z-index: 12; transform-origin: 60px 60px; transition: transform 1s cubic-bezier(.5, -.2, .3, 1.15); }
.en4.wk0 .bot { animation: botScan 2.4s cubic-bezier(.5, -.2, .3, 1.15) .1s both; }
@keyframes botScan { 0% { transform: translate(176px, 240px) scale(.72); } 20%, 70% { transform: translate(290px, 330px) scale(.62); } 100% { transform: translate(176px, 240px) scale(.72); } }
.en0 .bot { transition: none; }
.bob { width: 100%; height: 100%; animation: bob 2.4s ease-in-out infinite; }
@keyframes bob { 50% { transform: translateY(-7px); } }
.botsvg { width: 100%; height: 100%; overflow: visible; }
.gold { fill: #C49A3E; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.navy { fill: #0B2A5B; }
.ear { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.visor { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; }
.rim { fill: none; stroke: #DFF6FF; stroke-width: 2; stroke-linecap: round; }
.topl { fill: #DFF6FF; stroke: #0B2A5B; stroke-width: 1.5; }
.eyeb { fill: #7FE3F0; transform-box: fill-box; transform-origin: 50% 50%; transition: transform .25s ease, opacity .2s ease; }
.eyh { fill: none; stroke: #7FE3F0; stroke-width: 3; stroke-linecap: round; opacity: 0; transition: opacity .2s ease; }
.bhappy .eyeb { opacity: 0; } .bhappy .eyh { opacity: 1; }
.bwork .eyeb { transform: scaleY(.5); }
.mouth { fill: none; stroke: #7FE3F0; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.htag { font-family: var(--font-display); font-size: 8.5px; font-weight: 800; fill: #0B2A5B; }
.barm { transform-box: view-box; transition: transform .45s cubic-bezier(.3, 1.6, .5, 1); }
.barm.l { transform-origin: -24.5px 26px; } .barm.r { transform-origin: 24.5px 26px; }
.en0 .barm.l { transform: rotate(150deg); } .en0 .barm.r { transform: rotate(-150deg); }
.bwork .barm.l { transform: rotate(60deg); }
.bwork .barm.r { animation: tap .5s ease-in-out infinite alternate; }
@keyframes tap { from { transform: rotate(-20deg); } to { transform: rotate(-70deg); } }
.wk3 .barm.l, .wk4.lp0 .barm.l { transform: rotate(150deg); } .wk3 .barm.r, .wk4.lp0 .barm.r { transform: rotate(-150deg); }
.wstill .barm, .wstill .bob { animation: none !important; }
</style>
