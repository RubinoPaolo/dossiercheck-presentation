<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const props = defineProps<{ frozen?: boolean }>()
const sfx = props.frozen ? 'f' : ''
const { $clicks } = useSlideContext()
const step = computed(() => props.frozen ? 8 : unref($clicks) as number)
const active = useIsSlideActive()

const entry = ref(0)
const sub = ref(0)

const gst = ref(0)
const still = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }

watch(active, (a) => {
  clearTimers()
  if (props.frozen) { entry.value = 2; sub.value = 2; gst.value = 6; still.value = true; return }
  if (!a) { entry.value = 0; sub.value = 0; gst.value = 0; still.value = false; return }
  if (step.value > 0) { entry.value = 2; sub.value = 2; gst.value = step.value === 7 ? 1 : step.value === 8 ? 6 : 0; still.value = true; return }
  still.value = false; entry.value = 0; sub.value = 0
  later(350, () => { entry.value = 1 })
  later(1700, () => { entry.value = 2 })
}, { immediate: true })

watch(step, (s) => {
  if (props.frozen || !active.value) return
  clearTimers()
  entry.value = 2
  still.value = false
  sub.value = 0
  gst.value = 0
  if (s === 0) return
  if (s >= 7) {
    sub.value = 2
    gst.value = 1
    if (s === 8) GST.forEach(([ms, g]) => later(ms, () => { gst.value = g }))
    return
  }
  const t = PMS[s]
  later(t, () => { sub.value = 1 })
  later(t + HMS[s], () => { sub.value = 2 })
})
onBeforeUnmount(clearTimers)

const PMS = [0, 2800, 3600, 3600, 2800, 3000, 3800]
const HMS = [0, 2800, 2800, 3800, 3200, 2800, 2800]

type Look = [string, string]
const DOC: Look[][] = [
  [['neutral', 'rest'], ['neutral', 'rest'], ['happy', 'rest']],
  [['worried', 'despair'], ['neutral', 'rest'], ['happy', 'cheer']],
  [['worried', 'flail'], ['neutral', 'rest'], ['happy', 'cheer']],
  [['confused', 'phone'], ['neutral', 'sign'], ['happy', 'akimbo']],
  [['confused', 'hold'], ['neutral', 'rest'], ['happy', 'hold']],
  [['worried', 'phone'], ['neutral', 'rest'], ['happy', 'cheer']],
  [['worried', 'despair'], ['neutral', 'rest'], ['happy', 'akimbo']],
]
const GST = [[500, 2], [3700, 3], [7100, 4], [9800, 5], [12000, 6]]
const doc = computed(() => {
  const s = step.value
  if (s >= 7) return gst.value >= 6 ? { mood: 'happy', pose: 'akimbo' } : gst.value >= 2 ? { mood: 'happy', pose: 'rest' } : { mood: 'neutral', pose: 'rest' }
  if (s === 0) return { mood: entry.value >= 2 ? 'happy' : 'neutral', pose: 'rest' }
  const [mood, pose] = DOC[s][sub.value]
  return { mood, pose, sweat: sub.value === 0 }
})

const office = { outfit: 'sweater', outfitColor: '#F47B20', hair: 'bun', hairColor: '#1E1E2A', skin: '#F1C9A5', glasses: true } as const
const OFF: Record<number, { x: number, from: number, look: Look[] }> = {
  3: { x: 712, from: 0, look: [['confused', 'akimbo'], ['neutral', 'rest'], ['happy', 'cheer']] },
  5: { x: 690, from: 1, look: [['neutral', 'rest'], ['happy', 'rest'], ['happy', 'cheer']] },
  6: { x: 730, from: 0, look: [['confused', 'flail'], ['neutral', 'rest'], ['happy', 'cheer']] },
}
const off = computed(() => {
  const o = OFF[step.value]
  if (!o) return { on: false, x: 712, mood: 'neutral', pose: 'rest' }
  const [mood, pose] = o.look[sub.value]
  return { on: sub.value >= o.from, x: o.x, mood, pose }
})

const HOME = { x: 334, y: 352, k: 0.8 }
const HELP = [HOME, { x: 600, y: 222, k: 0.72 }, { x: 430, y: 430, k: 0.75 }, { x: 800, y: 300, k: 0.7 }, { x: 744, y: 250, k: 0.72 }, { x: 560, y: 300, k: 0.75 }, { x: 570, y: 412, k: 0.72 }]
const bot = computed(() => {
  let p = HOME
  if (entry.value === 0) p = { x: 1000, y: 532.3, k: 0.17 }
  else if (step.value >= 7) p = GBOT[gst.value] ?? HOME
  else if (step.value > 0 && sub.value === 1) p = HELP[step.value]
  else if (step.value === 3 && sub.value === 2) p = { x: 470, y: 540, k: 0.75 }
  return { transform: `translate(${p.x - 60}px, ${p.y - 60}px) scale(${p.k})` }
})

const CARDS = [
  { h: 'Synopsis · p. 1' }, { h: 'Protocol · p. 2' },
  { h: 'Protocol · p. 4', pick: true, pre: '…with a follow-up of ', val: '12 months', post: ' after enrolment…' },
  { h: 'Protocol · p. 7' }, { h: 'Consent form · p. 1' },
  { h: 'Information sheet · p. 2', pick: true, pre: '…your participation will last ', val: '18 months', post: ' in total…' },
  { h: 'Information sheet · p. 5' }, { h: 'Budget · p. 1' },
]
function cardStyle(i: number) {
  const c = CARDS[i]
  const ph = step.value === 1 ? sub.value : 0
  let t = `translate(${660 + i * 2}px, ${384 - i * 9}px) rotate(${i % 2 ? 2 : -2}deg) scale(.5)`
  let o = 1, d = 0
  if (ph === 1) { t = `translate(${364 + i * 58}px, ${292 + Math.abs(i - 3.5) * 12}px) rotate(${(i - 3.5) * 6}deg) scale(.45)`; d = i * 0.05 }
  if (ph === 2) {
    if (c.pick) t = i === 2 ? 'translate(392px, 226px) scale(.95)' : 'translate(650px, 232px) scale(.95)'
    else { t = `translate(${364 + i * 58}px, ${360 + Math.abs(i - 3.5) * 12}px) rotate(${(i - 3.5) * 6}deg) scale(.35)`; o = 0 }
  }
  const x = 364 + i * 58
  return { transform: t, opacity: o, transitionDelay: `${d}s`, zIndex: c.pick && ph === 2 ? 3 : 1, '--g': `${0.75 + ((x + 40 - 350) / 470) * 1.3}s` }
}

const COLS = ['#1F5FD6', '#0B2A5B', '#7FA8EE', '#C49A3E', '#E1E6EF', '#F47B20']
const BINDERS = [0, 1, 2].flatMap(r => [0, 1, 2, 3, 4, 5].map(k => ({ x: 622 + k * 38 + (r === 1 ? 4 : 0), y: 310 + r * 98, w: 32, c: COLS[(k + r * 2) % 6], t: r === 1 && k === 3 })))
BINDERS.forEach((b) => { if (b.t) b.c = '#F47B20' })

const GHOSTS = [
  { x: 520, y: 476, t: 'Sponsor?', p: 'M300 468 C 360 300, 420 560, 470 430 S 520 380, 506 410' },
  { x: 650, y: 436, t: 'CRO?', p: 'M300 468 C 400 330, 500 540, 570 360 S 640 330, 636 368' },
  { x: 790, y: 476, t: 'Committee?', p: 'M300 468 C 460 620, 560 260, 700 430 S 780 380, 776 410' },
]

const HEAP = Array.from({ length: 16 }, (_, i) => ({ x: 640 + ((i * 37) % 170), y: 540 + ((i * 23) % 56) - Math.floor(i / 6) * 14, r: ((i * 47) % 50) - 25, d: i < 7 ? i * 0.12 : 1.5 + (i - 7) * 0.09 }))
const VERS = [
  { a: '20 Jan · v1', b: 'documents delivered' },
  { a: 'Office request', b: 'linked to v1' },
  { a: '30 Jan · v2', b: 'compared with v1' },
]

const GX0 = 444, PW = 206, GK = PW / 150
const GROW = [{ t: 'Organise', k: 'o' }, { t: 'Find', k: 'f' }, { t: 'Follow-up', k: 'u' }, { t: 'Correct', k: 'c' }, { t: 'DossierCheck work', k: 't' }]
const GY = (r: number) => 228 + r * 50
const PH = [{ a: 'H03', b: 'first package · Mar 2024' }, { a: 'H04', b: 'after 22 May opinion' }, { a: 'H05', b: 'after 10 Jul opinion' }]
type GS = [number, number] | null
type GB = { r: number, p: number, s: GS[], rep?: boolean, lab?: string }

const GB0: GB[] = []
function gb(r: number, p: number, st: Record<number, GS>, extra: Partial<GB> = {}) {
  const out: GS[] = []; let cur: GS = null
  for (let i = 0; i <= 6; i++) { if (i in st) cur = st[i]; out.push(cur) }
  GB0.push({ r, p, s: out, ...extra })
}

for (let p = 0; p < 3; p++) gb(0, p, { 0: null, 1: [0, 14] })

gb(1, 0, { 1: [14, 56], 2: null }); gb(1, 1, { 1: [14, 34], 2: [100, 8] }); gb(1, 2, { 1: [14, 44], 2: null })

gb(2, 0, { 1: [72, 18], 3: null }); gb(2, 0, { 1: [134, 12], 3: null })
gb(2, 1, { 1: [50, 16], 3: [110, 10] }); gb(2, 1, { 1: [66, 20], 3: null }, { rep: true }); gb(2, 1, { 1: [124, 12], 3: null })
gb(2, 2, { 1: [60, 14], 3: [100, 10] }); gb(2, 2, { 1: [74, 22], 3: null }, { rep: true }); gb(2, 2, { 1: [136, 12], 3: [134, 10] })

gb(3, 0, { 1: [92, 40], 3: [40, 40], 4: [40, 28] }); gb(3, 1, { 1: [88, 34], 3: [40, 34], 4: [40, 24] }); gb(3, 2, { 1: [98, 36], 3: [40, 36], 4: [40, 25] })
gb(3, 2, { 1: null, 3: [112, 12], 4: [112, 9] })

for (let p = 0; p < 3; p++) {
  gb(4, p, { 1: null, 2: [14, 12] }, { lab: 'A' })
  gb(4, p, { 1: null, 2: [27, 12] }, { lab: 'T' })
  gb(4, p, { 1: null, 3: [86, 12] }, { lab: 'R' })
}
gb(4, 0, { 1: null, 4: [70, 10] }, { lab: 'C' }); gb(4, 1, { 1: null, 4: [66, 10] }, { lab: 'C' }); gb(4, 2, { 1: null, 4: [67, 10] }, { lab: 'C' }); gb(4, 2, { 1: null, 4: [122, 10] }, { lab: 'C' })
const GBARS = GB0.map((b, i) => ({ ...b, i }))
function gbStyle(b: GB) {
  const g = gst.value, cur = b.s[g], prev = b.s[Math.max(0, g - 1)]
  const geo = cur ?? prev ?? [0, 0]
  const x = GX0 + b.p * PW + geo[0] * GK
  return { left: `${x}px`, top: `${GY(b.r) - 12}px`, width: `${geo[1] * GK}px`, '--dl': `${(x - GX0) * 0.0034 + 2.15}s` }
}
const gOn = (b: GB) => !!b.s[gst.value]

const GBOT: Record<number, { x: number, y: number, k: number }> = {
  1: { x: 222, y: 236, k: 0.6 }, 2: { x: 560, y: 220, k: 0.5 }, 3: { x: 760, y: 266, k: 0.5 },
  4: { x: 610, y: 318, k: 0.5 }, 5: { x: 1090, y: 470, k: 0.5 }, 6: { x: 222, y: 236, k: 0.6 },
}

const GHOT: Record<number, number[]> = { 2: [0], 3: [1], 4: [2, 3], 5: [4, 5] }
const GNOTE = [
  { g: 2, t: '① Find: 28 manual investigations → 2', y: 0 },
  { g: 3, t: '② Corrected before delivery: 19 repeated requests removed', y: 0 },
  { g: 4, t: '③④ Correction −30% (assumption) + confirmation runs', y: 0 },
  { g: 5, t: '⑤⑥ Coordination, traceability: not in the hours', y: 0 },
]

const GTOT = [29.38, 29.38, 27.07, 22.93, 21.28, 21.28, 21.28]
const GW = 520
const dcW = computed(() => GW * GTOT[Math.max(gst.value, 1)] / GTOT[0])
const dcLab = computed(() => gst.value >= 4 ? '21.28 h' : `≈${GTOT[gst.value].toFixed(1)} h`)
const dcSave = computed(() => gst.value >= 4 ? '−8.10 h' : gst.value === 3 ? '≈−6.5 h' : '≈−2.3 h')

const ADV = [
  { t: 'Faster issue identification', d: 'flagged at the exact passage' },
  { t: 'Earlier detection and correction', d: 'corrected before submission' },
  { t: 'More efficient correction', d: 'assisted, checked before delivery' },
  { t: 'Easier access to information', d: 'answers that cite the source' },
  { t: 'Clearer coordination', d: 'the right person, at once' },
  { t: 'Better traceability and continuity', d: 'one shared record over time' },
]
const CAP = [
  ['', ''],
  ['Reading every page by hand…', 'Issues flagged in minutes, at the exact passage'],
  ['Found late, corrected at a high cost…', 'Caught early, while it is cheap to correct'],
  ['The same correction, round after round…', 'Corrected once, with the information at hand'],
  ['Looking for one detail in the dossier…', 'Answers that cite their source'],
  ['Who should I ask?', 'Straight to the right person'],
  ['PEDIGREE: the same documents sent twice', 'One shared record, from one review to the next'],
]
</script>

<template>
  <div class="stage" :class="[`ent${entry}`, `tale${step}`, ['kprob', 'khelp', 'kdone'][sub], { kstill: still }]">

    <div v-if="!frozen" class="oldw"><ResultsSlide frozen class="old" /></div>

    <h2 class="display heading">
      <span :class="{ on: entry === 0 }">Results</span>
      <span :class="{ on: entry >= 1 }">Main Possible Advantages</span>
    </h2>

    <div class="mbody"><Mecha :head="false" /></div>

    <div class="list">
      <div v-for="(a, i) in ADV" :key="i" class="slot" :class="{ got: step >= i + 1, solved: step > i + 1 || (step === i + 1 && sub === 2), hot: step === 8 && (GHOT[gst] ?? []).includes(i), nq: step >= 8 && gst >= 5 && i >= 4 }">
        <span class="num">{{ i + 1 }}</span>
        <svg viewBox="0 0 32 32" class="ic">
          <g v-if="i === 0"><circle cx="13" cy="13" r="8" class="icl" /><path d="M19 19 L27 27" class="icl" /></g>
          <g v-else-if="i === 1"><path d="M5 26 Q16 24 27 6" class="icl dash" /><circle cx="8" cy="25" r="3.5" class="icf" /><path d="M24 6 V2 M24 2 h5 l-1.5 2 l1.5 2 h-5" class="icl" /></g>
          <g v-else-if="i === 2"><path d="M6 26 L8 19 L21 6 L26 11 L13 24 Z" class="icl" /><path d="M18 9 L23 14" class="icl" /></g>
          <g v-else-if="i === 3"><path d="M4 6 H28 V20 H14 L8 26 V20 H4 Z" class="icl" /><path d="M9 11 h14 M9 15 h9" class="icl" /></g>
          <g v-else-if="i === 4"><circle cx="7" cy="16" r="4" class="icl" /><circle cx="25" cy="16" r="4" class="icf" /><path d="M12 16 H19 M16 12 L20 16 L16 20" class="icl" /></g>
          <g v-else><path d="M3 16 H29" class="icl" /><circle cx="8" cy="16" r="3.5" class="icf" /><circle cx="16" cy="16" r="3.5" class="icf" /><circle cx="24" cy="16" r="3.5" class="icl wh" /></g>
        </svg>
        <p class="stx"><b>{{ a.t }}</b><span>{{ a.d }}</span></p>
        <svg viewBox="0 0 24 24" class="tick"><circle cx="12" cy="12" r="11" /><path d="M7 12.5 L10.5 16 L17 8.5" /></svg>
      </div>
    </div>

    <div class="cap">
      <p v-for="(c, i) in CAP" :key="i" class="cp" :class="`cp${i}`"><span class="cprob">{{ c[0] }}</span><span class="cdone">{{ c[1] }}</span></p>
    </div>

    <div class="scn s1">

      <div class="readpg">
        <div v-for="n in 4" :key="n" class="leaf" :style="{ '--n': n }"><i v-for="r in 7" :key="r" :style="{ width: `${60 + ((n * 13 + r * 17) % 36)}%` }" /></div>
      </div>
      <div class="hglass"><svg viewBox="0 0 40 56"><path d="M6 4 H34 M6 52 H34" class="hgf" /><path d="M9 4 Q9 22 20 28 Q31 22 31 4 Z M9 52 Q9 34 20 28 Q31 34 31 52 Z" class="hgb" /><path d="M12 8 H28 Q27 18 20 24 Q13 18 12 8 Z" class="sandt" /><path d="M11 50 Q20 40 29 50 Z" class="sandb" /><line x1="20" y1="27" x2="20" y2="48" class="sandf" /></svg></div>

      <div v-for="(c, i) in CARDS" :key="i" class="pcard" :class="{ pk: c.pick }" :style="cardStyle(i)">
        <p class="pc-h">{{ c.h }}</p>
        <i class="pl" style="width: 86%" /><i class="pl" style="width: 72%" />
        <p v-if="c.pick" class="pc-t">{{ c.pre }}<mark>{{ c.val }}</mark>{{ c.post }}</p>
        <i v-else class="pl" style="width: 80%" />
        <i class="pl" style="width: 90%" /><i class="pl" style="width: 64%" /><i class="pl" style="width: 78%" />
      </div>
      <div class="sweep" />
      <svg viewBox="0 0 1280 720" class="lay over">
        <path d="M572 352 C 600 330, 622 330, 650 352" class="neq" />
      </svg>
      <div class="neqb">≠</div>
      <div class="fchip"><i>Inconsistency</i><b>Study duration differs between documents</b><em>Illustrative example</em></div>
    </div>

    <div class="scn s2">
      <svg viewBox="0 0 1280 720" class="lay">
        <line x1="380" x2="860" y1="596" y2="596" class="road" />

        <g class="bld">
          <rect x="388" y="548" width="74" height="8" rx="3" class="desk" /><path d="M396 556 V594 M454 556 V594" class="deskl" />
          <path d="M440 548 V528 L452 518" class="lamp" /><path d="M446 512 L462 520 L454 528 Z" class="lamph" />
          <rect x="398" y="532" width="26" height="16" rx="2" class="paper" />
        </g>

        <g class="bld">
          <rect x="584" y="514" width="76" height="82" rx="4" class="wall" />
          <rect v-for="w in 6" :key="w" :x="594 + ((w - 1) % 3) * 22" :y="526 + Math.floor((w - 1) / 3) * 22" width="14" height="14" rx="2" class="win" />
          <rect x="612" y="570" width="20" height="26" rx="2" class="door" />
          <line x1="622" y1="514" x2="622" y2="482" class="pole" />
        </g>

        <g class="bld">
          <path d="M760 520 L815 492 L870 520 Z" class="roof" />
          <rect x="764" y="520" width="102" height="8" class="wall" />
          <rect v-for="k in 5" :key="k" :x="770 + (k - 1) * 21" y="530" width="10" height="56" rx="2" class="col" />
          <rect x="758" y="586" width="114" height="10" rx="2" class="wall" />
          <line x1="815" y1="492" x2="815" y2="462" class="pole" />
        </g>
        <text x="425" y="616" text-anchor="middle" class="stl">Research team</text>
        <text x="622" y="616" text-anchor="middle" class="stl">Office review</text>
        <text x="815" y="616" text-anchor="middle" class="stl">Committee</text>
      </svg>
      <div class="flag fg1" /><div class="flag fg2" />

      <div class="gauge">
        <svg viewBox="0 0 160 96">
          <defs><linearGradient :id="`d12-gg${sfx}`" x1="0" x2="1"><stop offset="0" stop-color="#1F5FD6" /><stop offset=".55" stop-color="#FFC233" /><stop offset="1" stop-color="#F47B20" /></linearGradient></defs>
          <path d="M16 84 A64 64 0 0 1 144 84" class="garc" :stroke="`url(#d12-gg${sfx})`" />
          <g class="needle"><line x1="80" y1="84" x2="80" y2="34" /><circle cx="80" cy="84" r="7" /></g>
        </svg>
        <b>Effort to correct</b><span>qualitative, after Stecklein et al.</span>
      </div>

      <div v-for="k in 6" :key="`rw${k}`" class="rework" :style="{ left: `${k <= 2 ? 650 + k * 10 : 840 + (k - 3) * 9}px`, top: `${k <= 2 ? 560 - k * 10 : 566 - (k - 2) * 9}px`, '--d': `${k <= 2 ? 0.9 + k * 0.15 : 1.9 + k * 0.12}s` }" />
      <div class="fold">
        <svg viewBox="0 0 48 38"><path d="M2 8 Q2 4 6 4 H18 L22 9 H42 Q46 9 46 13 V34 Q46 36 42 36 H6 Q2 36 2 32 Z" class="fd" /><path d="M2 14 H46" class="fdl" /></svg>
        <span class="flaw">!</span><span class="fok">✓</span>
      </div>
      <div class="kstamp">Returned</div>
      <div class="bugx"><svg viewBox="-20 -20 40 40"><path d="M-12 -4 L-19 -10 M-13 4 L-20 4 M-11 11 L-17 17 M12 -4 L19 -10 M13 4 L20 4 M11 11 L17 17" class="bleg" /><ellipse cx="0" cy="3" rx="12" ry="13" class="bbody" /><text y="8" text-anchor="middle" class="bx">!</text></svg></div>
      <i v-for="k in 6" :key="`sp${k}`" class="spark" :style="{ '--a': `${k * 60}deg` }" />
      <div class="rewind"><i /><i /><i /></div>
    </div>

    <div class="scn s3">

      <div class="round"><span>Review round</span><b class="r1">1</b><b class="r2">2</b><b class="r3">3</b></div>
      <div class="vfile vf1">Info_sheet_v2.docx</div>
      <div class="vfile vf2">Info_sheet_v3_final.docx</div>
      <div class="vfile vf3">Info_sheet_v3_FINAL2.docx</div>
      <div class="ppf"><svg viewBox="0 0 48 38"><path d="M2 8 Q2 4 6 4 H18 L22 9 H42 Q46 9 46 13 V34 Q46 36 42 36 H6 Q2 36 2 32 Z" class="fd" /><path d="M2 14 H46" class="fdl" /></svg></div>
      <div class="still3">Still inconsistent</div>

      <div class="cmpw">
        <p class="cw-h">Compare with the protocol</p>
        <div class="cw-cols">
          <div class="cw-c"><p>Protocol · p. 4</p><i style="width: 80%" /><span>follow-up of <mark class="okm">12 months</mark></span><i style="width: 70%" /></div>
          <div class="cw-c"><p>Information sheet · p. 2</p><i style="width: 76%" /><span>participation lasts <mark class="bad">18 months</mark><mark class="fix">12 months</mark></span><i style="width: 66%" /></div>
        </div>
        <div class="askd"><b>Ask the dossier</b> Where else is the duration stated? <span class="srcd">Synopsis · p. 1</span></div>
        <div class="chk"><span class="chk-l">DossierCheck check</span><i class="chk-b"><em /></i><span class="chk-ok">✓ passed</span></div>
        <p class="cw-n">Illustrative example</p>
      </div>
      <div class="okstamp">Accepted</div>
      <p class="s3note">Workload model: correction time −30% on average (assumption, thesis §4.3.1)</p>
    </div>

    <div class="scn s4">
      <div class="ask">Is a blood sample planned?</div>
      <svg viewBox="0 0 1280 720" class="lay">
        <rect x="612" y="300" width="244" height="300" rx="8" class="shelf" />
        <path d="M612 396 H856 M612 494 H856" class="shelfl" />
        <g v-for="(b, i) in BINDERS" :key="i" class="bnd" :class="[`bn${i}`, { tgt: b.t }]" :style="{ '--d': `${(i * 0.37) % 1.4}s` }">
          <rect :x="b.x" :y="b.y" :width="b.w" height="80" rx="4" :fill="b.c" class="bnr" />
          <rect :x="b.x + 4" :y="b.y + 12" :width="b.w - 8" height="22" rx="2" class="bnl" />
        </g>
      </svg>
      <i v-for="k in 5" :key="`lf${k}`" class="loosep" :style="{ left: `${640 + k * 38}px`, '--d': `${k * 0.42}s`, '--r': `${k % 2 ? 24 : -30}deg` }" />
      <div class="flyb"><span>Info sheet</span></div>
      <div class="ipage"><p>Information sheet · p. 2</p><i style="width: 84%" /><span>…a <mark>venous blood sample</mark> will be taken to measure neurofilaments (NfL) in serum…</span><i style="width: 70%" /></div>
      <div class="ans"><b>Yes:</b> a venous blood sample, to measure neurofilaments (NfL) in serum.<span class="src">Information sheet · p. 2</span></div>
      <svg viewBox="0 0 1280 720" class="lay over"><path d="M640 262 C 620 300, 600 330, 590 350" class="lnk2" /></svg>
    </div>

    <div class="scn s5">
      <div class="ask a5">Who is reviewing our dossier?</div>
      <svg viewBox="0 0 1280 720" class="lay">
        <g v-for="(g, i) in GHOSTS" :key="i" class="ghost">
          <circle :cx="g.x" :cy="g.y - 52" r="18" class="gh" /><path :d="`M${g.x - 28} ${g.y + 30} Q${g.x - 28} ${g.y - 28} ${g.x} ${g.y - 28} Q${g.x + 28} ${g.y - 28} ${g.x + 28} ${g.y + 30} Z`" class="gh" />
          <text :x="g.x" :y="g.y + 52" text-anchor="middle" class="ghq">{{ g.t }}</text>
          <path :d="g.p" class="tangle" :style="{ '--d': `${i * 0.25}s` }" />
        </g>
        <path d="M300 468 C 420 380, 560 380, 690 430" class="sarr" />
      </svg>
      <div v-for="(g, i) in GHOSTS" :key="`m${i}`" class="mail" :style="{ offsetPath: `path('${g.p}')`, '--d': `${i * 0.5}s` }"><i /></div>
      <div class="ring"><svg viewBox="0 0 40 40"><path d="M8 30 Q4 26 8 22 L12 18 Q14 16 16 18 L19 21 Q21 23 19 25 L17 27 Q21 31 25 27 L27 25 Q29 23 31 25 L34 28 Q36 30 34 32 L30 36 Q26 40 22 36 Z" class="rph" /><path d="M24 6 Q32 6 34 14 M24 1 Q37 1 39 14" class="rwav" /></svg></div>
      <div class="ccard"><p>From the dossier</p><b>Clinical Trials Office</b><span>reviews our dossier · contact</span></div>
      <div class="msg" />
    </div>

    <div class="scn s6">
      <div class="heap">
        <div v-for="(e, i) in HEAP" :key="i" class="hm" :style="{ left: `${e.x}px`, top: `${e.y}px`, transform: `rotate(${e.r}deg)`, '--d': `${e.d}s` }"><svg viewBox="0 0 42 28"><rect x="1.5" y="1.5" width="39" height="25" rx="3" class="eb" /><path d="M3 3 L21 16 L39 3" class="efl" /></svg></div>
      </div>
      <div class="env e20"><svg viewBox="0 0 64 46"><rect x="2" y="2" width="60" height="42" rx="4" class="eb" /><path d="M3 4 L32 27 L61 4" class="efl" /></svg><p><b>20 Jan</b>documents sent</p></div>
      <div class="lost">not found</div>
      <div class="env e30"><svg viewBox="0 0 64 46"><rect x="2" y="2" width="60" height="42" rx="4" class="eb" /><path d="M3 4 L32 27 L61 4" class="efl" /></svg><p><b>30 Jan</b>sent again</p></div>
      <p class="tsrc">PEDIGREE correspondence (thesis, §4.2.2): the 20 January email could not be found.</p>
      <div class="rec">
        <p class="rec-h">Shared dossier record <span>team · office</span></p>
        <div class="tl">
          <div v-for="(v, i) in VERS" :key="i" class="vcard" :class="`vc${i}`"><b>{{ v.a }}</b><span>{{ v.b }}</span><em><i class="dot-t" /><i class="dot-o" /></em></div>
        </div>
      </div>
      <svg viewBox="0 0 1280 720" class="lay over"><path d="M300 470 C 330 400, 380 360, 430 334" class="share" /><path d="M770 462 C 772 400, 740 360, 700 334" class="share" /></svg>
    </div>

    <div class="gantt" :class="[`g${gst}`, { kst: still }]">
      <div class="gpanel" />
      <p class="gtitle">FORZA · H03 → H05 <span>how each advantage changes the review work</span></p>
      <div v-for="(p, i) in PH" :key="`ph${i}`" class="gph" :style="{ left: `${GX0 + i * PW}px`, '--dl': `${1.25 + i * 0.15}s` }"><b>{{ p.a }}</b><span>{{ p.b }}</span></div>
      <p class="gend" :style="{ left: `${GX0 + 3 * PW - 4}px` }">accepted<br>10 Sep</p>
      <div v-for="(r, i) in GROW" :key="`gr${i}`" class="grl" :class="{ dcr: r.k === 't' }" :style="{ top: `${GY(i) - 12}px`, '--dl': `${1.35 + i * 0.09}s` }"><i :class="`k-${r.k}`" /><span>{{ r.t }}</span></div>
      <div v-for="i in 5" :key="`gt${i}`" class="gtrack" :style="{ top: `${GY(i - 1)}px`, left: `${GX0}px`, width: `${3 * PW}px`, '--dl': `${1.55 + i * 0.07}s` }" />
      <div class="gnow" :style="{ left: `${GX0}px`, '--w': `${3 * PW}px` }" />
      <div v-for="i in 3" :key="`dv${i}`" class="gdel" :style="{ left: `${GX0 + (i - 1) * PW + (gst >= 3 ? 82 : gst === 2 ? 40 : 14) * GK}px` }"><span>delivery</span></div>
      <div v-for="b in GBARS" :key="`gb${b.i}`" class="gbar" :class="[`k-${GROW[b.r].k}`, { on: gOn(b), rep: b.rep }]" :style="gbStyle(b)"><span v-if="b.lab" class="glab">{{ b.lab }}</span></div>
      <i v-for="k in 6" :key="`gz${k}`" class="gzap" :style="{ '--a': `${k * 60}deg` }" />
      <div class="gnotes">
        <p v-for="(n, i) in GNOTE" :key="`gn${i}`" :class="{ on: gst >= n.g, cur: gst === n.g }">{{ n.t }}</p>
      </div>
      <div class="gtot">
        <div class="gtr ga"><span class="gl">AS-IS</span><i class="gbt"><b>29.38 h</b></i></div>
        <div class="gtr gd"><span class="gl">With DossierCheck</span><i class="gbt" :style="{ width: `${dcW}px` }"><b>{{ dcLab }}</b></i><i class="ggap" :style="{ left: `${136 + dcW}px`, width: `${GW - dcW}px` }" /><span class="gsv"><b>{{ dcSave }}</b><em v-if="gst >= 4">−27.6%</em></span></div>
        <p class="gtl">total staff time incl. DossierCheck work · ≈ intermediate values estimated (average task times)</p>
      </div>
      <p class="gsrc"><b>A</b> analysis · <b>T</b> team check · <b>R</b> reviewer check · <b>C</b> confirmation run &nbsp;·&nbsp; counts and totals from the thesis (§4.3.3.2, Table 4.3) · bar lengths schematic</p>
    </div>

    <div class="ground" />
    <div class="doc"><Person v-bind="doc" :uid="`d12-doc${sfx}`" /></div>
    <p class="dlab"><b>Clinical researcher</b></p>
    <div class="offc" :class="{ on: off.on }" :style="{ left: `${off.x}px` }"><Person v-bind="office" :mood="off.mood" :pose="off.pose" :uid="`d12-office${sfx}`" /></div>
    <p class="olab" :class="{ on: off.on }" :style="{ left: `${off.x}px` }"><b>Clinical Trials Office</b></p>

    <div class="bot" :style="bot">
      <div class="bob">
        <svg viewBox="-60 -60 120 150" class="botsvg">
          <ellipse cx="0" cy="84" rx="26" ry="5" class="bshd" />
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
          <g class="lids"><rect x="-18" y="-18" width="12" height="7" class="lid" /><rect x="6" y="-18" width="12" height="7" class="lid" /></g>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>

.oldw { position: absolute; inset: 0; z-index: 0; transition: opacity .6s ease; }
.stage:not(.ent0) .oldw { opacity: 0; }
.old :deep(.heading) { opacity: 0 !important; transition: none !important; }
.kstill, .kstill * { transition: none !important; }

.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 30; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .45s ease, transform .45s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .3s; }
.heading span:first-child { position: relative; transition: none; transform: none; }
.heading span:first-child:not(.on) { opacity: 0; transition: opacity .3s ease; }

.mbody { position: absolute; left: 864px; top: 214px; width: 272px; height: 340px; z-index: 5; transform-origin: 136px 338px; transform: translateY(36px) scale(.2); transition: opacity .5s ease .5s, filter .4s ease, transform .6s cubic-bezier(.5, 0, .7, .4) .5s; }
.stage:not(.ent0) .mbody { filter: grayscale(1); opacity: 0; transform: translateY(60px) scale(.2); }

.gantt { position: absolute; inset: 0; z-index: 7; pointer-events: none; }
.gantt > * { opacity: 0; transition: opacity .4s ease; }
.gantt:not(.g0) > .gpanel, .gantt:not(.g0) > .gtitle, .gantt:not(.g0) > .gph, .gantt:not(.g0) > .gend, .gantt:not(.g0) > .grl, .gantt:not(.g0) > .gtrack, .gantt:not(.g0) > .gsrc, .gantt:not(.g0) > .gbar, .gantt:not(.g0) > .gnotes, .gantt:not(.g0) > .gtot { opacity: 1; }
.gpanel { position: absolute; left: 300px; top: 104px; width: 820px; height: 560px; box-sizing: border-box; border: 2px solid #D5DCE8; border-radius: 16px; background: #FFFFFF; box-shadow: 0 12px 28px rgba(11, 42, 91, .08); transform-origin: 50% 0; }
.gtitle { position: absolute; left: 320px; top: 116px; margin: 0; font-family: var(--font-display); font-size: 19px; font-weight: 800; color: var(--ink); }
.gtitle span { display: block; font-family: var(--font-body); font-size: 12.5px; font-weight: 600; color: var(--mist); }
.gph { position: absolute; top: 168px; width: 206px; height: 286px; box-sizing: border-box; padding-left: 6px; border-left: 2px dashed #C9D2E0; }
.gph b { display: block; font-size: 14px; font-weight: 800; color: #1F5FD6; } .gph span { font-size: 11.5px; font-weight: 600; color: var(--mist); }
.gend { position: absolute; top: 168px; margin: 0; font-size: 11.5px; font-weight: 800; color: #1F5FD6; text-align: right; transform: translateX(-100%); }
.grl { position: absolute; left: 318px; width: 120px; display: flex; align-items: flex-start; gap: 7px; font-size: 13.5px; font-weight: 800; color: var(--ink); line-height: 1.1; }
.grl i { width: 12px; height: 12px; margin-top: 3px; border-radius: 3px; flex: none; }
.grl em { display: block; margin-top: 3px; font-style: normal; font-size: 9.5px; font-weight: 700; line-height: 1.3; color: var(--mist); }
.grl.dcr { color: #1F5FD6; }
.gdel { position: absolute; top: 204px; width: 0; height: 230px; border-left: 2px dashed #0B2A5B; opacity: 0 !important; transition: opacity .4s ease .3s, left .8s cubic-bezier(.5, 0, .3, 1) !important; }
.gdel span { position: absolute; left: -24px; top: 248px; width: 48px; text-align: center; font-size: 9.5px; font-weight: 800; color: #0B2A5B; text-transform: uppercase; letter-spacing: .04em; }
.gantt:not(.g0) .gdel { opacity: .5 !important; }
.gantt.g1:not(.kst) .gdel { transition-delay: 4.3s !important; }
.gtrack { position: absolute; height: 2px; margin-top: -1px; background: #EDF0F6; }
.k-f { background: #1F5FD6; } .k-c { background: #F47B20; } .k-u { background: #C49A3E; } .k-o { background: #A9B4C7; }
.k-t { background: #DCE8FF; border: 2px dashed #1F5FD6; box-sizing: border-box; }

.gbar { position: absolute; height: 24px; border-radius: 6px; display: grid; place-items: center; box-shadow: inset 0 0 0 1.5px rgba(11, 42, 91, .25); transform-origin: 0 50%; transition: left .8s cubic-bezier(.5, 0, .3, 1), width .8s cubic-bezier(.5, 0, .3, 1), opacity .45s ease, transform .45s ease; }
.gbar.k-t { box-shadow: none; }
.gbar:not(.on) { opacity: 0 !important; transform: scale(.4, .2); }
.gbar.rep { background: repeating-linear-gradient(135deg, #C49A3E 0 5px, #E8D3A6 5px 10px); }
.g1 .gbar { transition: none; }
.g1:not(.kst) .gbar.on { animation: gIn .45s cubic-bezier(.3, 1.4, .5, 1) var(--dl) both; }
@keyframes gIn { from { transform: scaleX(0); opacity: 0; } to { transform: none; opacity: 1; } }
.glab { font-size: 11px; font-weight: 800; color: #1F5FD6; opacity: 0; transition: opacity .3s ease .5s; }
.gbar.on .glab { opacity: 1; }

.gnow { position: absolute; top: 166px; width: 3px; height: 290px; background: #F47B20; box-shadow: 0 0 8px rgba(244, 123, 32, .6); }
.g1:not(.kst) .gnow { animation: gNow 2.4s cubic-bezier(.4, 0, .6, 1) 2.1s both; }
@keyframes gNow { 0% { opacity: 0; transform: none; } 8% { opacity: 1; } 92% { opacity: 1; } 100% { opacity: 0; transform: translateX(var(--w)); } }

.gzap { position: absolute; width: 7px; height: 7px; margin: -3.5px; border-radius: 50%; background: #FFC233; }
.g2 .gzap { left: 560px; top: 278px; } .g3 .gzap { left: 760px; top: 326px; } .g4 .gzap { left: 610px; top: 378px; } .g5 .gzap { left: 1090px; top: 530px; }
.gantt:is(.g2, .g3, .g4, .g5) .gzap { animation: gZap .55s ease-out .6s 2 both; }
@keyframes gZap { 0% { opacity: 1; transform: rotate(var(--a)) translateY(0); } 100% { opacity: 0; transform: rotate(var(--a)) translateY(-26px) scale(.3); } }
.gnotes { position: absolute; left: 320px; top: 480px; width: 780px; display: grid; grid-template-columns: 1fr 1fr; column-gap: 20px; }
.gnotes p { margin: 0 0 4px; font-size: 13px; font-weight: 700; color: var(--mist); opacity: 0; transform: translateX(-10px); transition: opacity .35s ease .5s, transform .35s ease .5s, color .3s ease; }
.gnotes p.on { opacity: 1; transform: none; } .gnotes p.cur { color: #1F5FD6; }
.gtot { position: absolute; left: 320px; top: 538px; width: 780px; }
.gtr { position: relative; display: flex; align-items: center; height: 36px; margin-bottom: 4px; }
.gl { width: 136px; flex: none; font-size: 14px; font-weight: 800; color: var(--ink); }
.gd .gl { color: #1F5FD6; }
.gbt { position: relative; display: flex; align-items: center; justify-content: flex-end; height: 32px; width: 520px; padding-right: 12px; box-sizing: border-box; border-radius: 8px; font-style: normal; transform-origin: 0 50%; }
.ga .gbt { background: #5E6B85; }
.gbt b { font-family: var(--font-display); font-size: 19px; color: #FFFFFF; text-shadow: 0 1px 2px rgba(11, 42, 91, .4); }
.gd .gbt { background: #1F5FD6; transition: width 1.1s cubic-bezier(.6, 0, .2, 1) .7s; }
.gd .gbt b { white-space: nowrap; }
.gd { opacity: 0; transition: opacity .4s ease; }
.gantt:is(.g2, .g3, .g4, .g5, .g6) .gd { opacity: 1; }
.ggap { position: absolute; top: 2px; height: 32px; box-sizing: border-box; border: 2px dashed #1F5FD6; border-left: none; border-radius: 0 8px 8px 0; background: repeating-linear-gradient(135deg, rgba(31, 95, 214, .1) 0 6px, rgba(31, 95, 214, 0) 6px 12px); transition: left 1.1s cubic-bezier(.6, 0, .2, 1) .7s, width 1.1s cubic-bezier(.6, 0, .2, 1) .7s; }
.gsv { position: absolute; left: 662px; top: 0; height: 36px; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.gsv b { font-family: var(--font-display); font-size: 19px; color: #1F5FD6; } .gsv em { font-style: normal; font-size: 13px; font-weight: 800; color: #1F5FD6; }
.gantt:is(.g2, .g3, .g4, .g5):not(.kst) .gsv { animation: gsvPop .5s cubic-bezier(.3, 1.8, .5, 1) 1.6s both; }
@keyframes gsvPop { 0% { transform: scale(.7); opacity: .3; } }
.g6 .gsv { margin-left: -4px; padding: 2px 7px; border-radius: 8px; background: #1F5FD6; transition: background .3s ease; }
.g6 .gsv b, .g6 .gsv em { color: #FFFFFF; }
.gtl { margin: 0 0 0 136px; font-size: 11px; font-weight: 600; color: var(--mist); }

.g1:not(.kst) .gpanel { animation: gpReveal 1s cubic-bezier(.65, 0, .25, 1) .45s both; }
@keyframes gpReveal { from { clip-path: inset(0 100% 0 0 round 16px); transform: translateY(10px); } to { clip-path: inset(0 0 0 0 round 16px); transform: none; } }
.g1:not(.kst) .gtitle { animation: gUp .5s ease 1.05s both; }
.g1:not(.kst) .gph { animation: gDrop .5s cubic-bezier(.3, 1.5, .5, 1) var(--dl) both; }
.g1:not(.kst) .gend { animation: gUp .4s ease 1.85s both; }
.g1:not(.kst) .grl { animation: gSlide .45s cubic-bezier(.3, 1.4, .5, 1) var(--dl) both; }
.g1:not(.kst) .gtrack { transform-origin: 0 50%; animation: gTrack .6s ease var(--dl) both; }
.g1:not(.kst) .gsrc { animation: gUp .4s ease 2s both; }
.g1:not(.kst) .ga { animation: gUp .45s ease 4.5s both; }
.g1:not(.kst) .ga .gbt { animation: gTot 1s cubic-bezier(.3, 1.1, .5, 1) 4.6s both; }
.g1:not(.kst) .gtl { animation: gUp .4s ease 5.2s both; }
@keyframes gUp { from { opacity: 0; transform: translateY(8px); } }
@keyframes gDrop { from { opacity: 0; transform: translateY(-14px); } }
@keyframes gSlide { from { opacity: 0; transform: translateX(-16px); } }
@keyframes gTrack { from { transform: scaleX(0); } }
@keyframes gTot { from { transform: scaleX(0); } }
.gsrc { position: absolute; left: 320px; top: 644px; margin: 0; font-size: 11px; white-space: nowrap; font-weight: 600; color: var(--mist); }

.list { position: absolute; left: 884px; top: 112px; width: 336px; z-index: 6; opacity: 0; transform: translateX(30px); transition: opacity .45s ease, transform .45s ease; }
.ent2 .list { opacity: 1; transform: none; transition-delay: .2s; }
.slot { position: relative; height: 72px; margin-bottom: 10px; box-sizing: border-box; border: 2px dashed #C9D2E0; border-radius: 14px; background: rgba(247, 249, 253, .7); display: flex; align-items: center; gap: 10px; padding: 0 12px 0 10px; transition: border-color .3s ease, background .3s ease, box-shadow .3s ease; }
.num { flex: none; width: 26px; height: 26px; border-radius: 50%; background: #E1E6EF; color: #FFFFFF; display: grid; place-items: center; font-family: var(--font-display); font-size: 14px; font-weight: 800; transition: background .3s ease; }
.ic { flex: none; width: 26px; height: 26px; opacity: 0; transform: scale(.4); transition: opacity .3s ease, transform .45s cubic-bezier(.3, 1.6, .5, 1); }
.icl { fill: none; stroke: #1F5FD6; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
.icl.dash { stroke: #F47B20; stroke-dasharray: 3 3; } .icl.wh { fill: #FFFFFF; }
.icf { fill: #F47B20; stroke: #0B2A5B; stroke-width: 1.6; }
.stx { flex: 1; min-width: 0; margin: 0; opacity: 0; transform: translateX(-6px); transition: opacity .3s ease, transform .3s ease; }
.stx b { display: block; font-family: var(--font-display); font-size: 15px; font-weight: 700; line-height: 1.15; color: var(--ink); }
.stx span { display: block; white-space: nowrap; font-size: 12px; font-weight: 600; color: var(--mist); margin-top: 2px; }
.tick { flex: none; width: 24px; height: 24px; opacity: 0; transform: scale(0); transition: opacity .2s ease, transform .4s cubic-bezier(.3, 1.8, .5, 1); }
.tick circle { fill: #1F5FD6; } .tick path { fill: none; stroke: #FFFFFF; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
.slot.got { border: 2px solid #1F5FD6; background: #FFFFFF; box-shadow: 0 8px 18px rgba(31, 95, 214, .12); animation: slotPop .5s cubic-bezier(.3, 1.6, .5, 1) .3s both; }
.slot.got .num { background: #1F5FD6; }
.slot.got .ic, .slot.got .stx { opacity: 1; transform: none; transition-delay: .35s; }
.slot.solved .tick { opacity: 1; transform: none; transition-delay: .2s; }
@keyframes slotPop { 0% { transform: scale(1); } 40% { transform: scale(1.05); } 100% { transform: scale(1); } }
.kstill .slot.got { animation: none; }

.cap { position: absolute; left: 340px; top: 112px; width: 540px; height: 34px; z-index: 6; }
.cp { position: absolute; inset: 0; margin: 0; text-align: center; font-size: 19px; font-weight: 700; }
.cp span { position: absolute; left: 0; right: 0; top: 0; opacity: 0; transform: translateY(8px); transition: opacity .35s ease, transform .35s ease; }
.cprob { color: #C55A0E; } .cdone { color: #1F5FD6; }
.tale1 .cp1 .cprob, .tale2 .cp2 .cprob, .tale3 .cp3 .cprob, .tale4 .cp4 .cprob, .tale5 .cp5 .cprob, .tale6 .cp6 .cprob { opacity: 1; transform: none; transition-delay: .35s; }
.kdone .cp .cprob { opacity: 0 !important; transform: translateY(-8px) !important; transition-delay: 0s !important; }
.tale1.kdone .cp1 .cdone, .tale2.kdone .cp2 .cdone, .tale3.kdone .cp3 .cdone, .tale4.kdone .cp4 .cdone, .tale5.kdone .cp5 .cdone, .tale6.kdone .cp6 .cdone { opacity: 1; transform: none; transition-delay: .2s; }

.scn { position: absolute; inset: 0; z-index: 4; opacity: 0; pointer-events: none; transition: opacity .35s ease; }
.tale1 .s1, .tale2 .s2, .tale3 .s3, .tale4 .s4, .tale5 .s5, .tale6 .s6 { opacity: 1; transition-delay: .3s; }
.lay { position: absolute; inset: 0; width: 1280px; height: 720px; overflow: visible; }
.lay.over { z-index: 3; }

.readpg { position: absolute; left: 298px; top: 404px; width: 100px; height: 128px; perspective: 500px; }
.leaf { position: absolute; inset: 0; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 4px; background: #FFFFFF; padding: 12px 10px; transform-origin: 0 50%; backface-visibility: hidden; box-shadow: 0 4px 10px rgba(11, 42, 91, .12); }
.leaf i { display: block; height: 5px; border-radius: 3px; background: #DDE3EC; margin-bottom: 8px; }
.tale1.kprob .leaf { animation: flip 2.4s ease-in-out calc(var(--n) * -.6s) infinite; }
@keyframes flip { 0%, 55% { transform: none; } 80%, 100% { transform: rotateY(-170deg); opacity: .2; } }
.tale1:not(.kprob) .readpg { opacity: 0; transform: translateY(20px); transition: opacity .3s ease, transform .3s ease; }
.hglass { position: absolute; left: 190px; top: 292px; width: 40px; height: 56px; opacity: 0; transition: opacity .3s ease; }
.hglass svg { width: 100%; height: 100%; }
.tale1.kprob .hglass { opacity: 1; transition-delay: .4s; animation: hgTurn 2.4s ease-in-out .4s infinite; }
@keyframes hgTurn { 0%, 80% { transform: none; } 100% { transform: rotate(180deg); } }
.hgf { stroke: #0B2A5B; stroke-width: 4; stroke-linecap: round; } .hgb { fill: rgba(223, 246, 255, .6); stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.sandt, .sandb { fill: #F4B66B; } .sandf { stroke: #F4B66B; stroke-width: 2; stroke-dasharray: 3 3; animation: march .6s linear infinite; }

.pcard { position: absolute; left: 0; top: 0; width: 190px; height: 240px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 8px; background: #FFFFFF; padding: 14px 14px; transform-origin: 0 0; box-shadow: 0 6px 14px rgba(11, 42, 91, .12); transition: transform .85s cubic-bezier(.4, 1.15, .4, 1), opacity .4s ease, box-shadow .3s ease, border-color .3s ease; }
.pc-h { margin: 0 0 12px; font-size: 13px; font-weight: 800; color: var(--ink); white-space: nowrap; }
.pl { display: block; height: 6px; border-radius: 3px; background: #DDE3EC; margin-bottom: 10px; }
.pc-t { margin: 2px 0 10px; font-size: 13.5px; font-weight: 600; line-height: 1.35; color: var(--ink); }
.pc-t mark { background: transparent; color: inherit; border-radius: 4px; padding: 0 3px; transition: background .3s ease; white-space: nowrap; }
.khelp .pk, .kdone .pk { border-color: #F47B20; }
.khelp .pk { animation: pickGlow .5s ease var(--g) both; }
@keyframes pickGlow { 0% { box-shadow: 0 6px 14px rgba(11, 42, 91, .12); } 40% { box-shadow: 0 0 0 10px rgba(244, 123, 32, .45), 0 0 36px 10px rgba(244, 123, 32, .5); } 100% { box-shadow: 0 0 0 4px rgba(244, 123, 32, .35), 0 8px 20px rgba(244, 123, 32, .3); } }
.kdone .pk { box-shadow: 0 0 0 4px rgba(244, 123, 32, .25), 0 12px 26px rgba(11, 42, 91, .14); }
.kdone .pk mark { background: #FFD9B8; transition-delay: .7s; }
.sweep { position: absolute; left: 350px; top: 268px; width: 46px; height: 250px; border-radius: 23px; background: linear-gradient(90deg, rgba(79, 184, 255, 0), rgba(79, 184, 255, .55), rgba(79, 184, 255, 0)); opacity: 0; }
.tale1.khelp .sweep { animation: sweep 1.3s cubic-bezier(.45, 0, .55, 1) .75s both; }
@keyframes sweep { 0% { opacity: 0; transform: none; } 10%, 90% { opacity: 1; } 100% { opacity: 0; transform: translateX(470px); } }
.neq { fill: none; stroke: #F47B20; stroke-width: 3; stroke-dasharray: 6 6; opacity: 0; }
.kdone .s1 .neq { opacity: 1; transition: opacity .3s ease 1s; animation: march 1s linear infinite; }
.neqb { position: absolute; left: 596px; top: 312px; width: 30px; height: 30px; border-radius: 50%; background: #F47B20; border: 2px solid #0B2A5B; color: #FFFFFF; display: grid; place-items: center; font-family: var(--font-display); font-size: 18px; font-weight: 800; z-index: 4; opacity: 0; transform: scale(0); }
.tale1.kdone .neqb { animation: okPop .4s cubic-bezier(.3, 1.8, .5, 1) 1.2s both; }
.fchip { position: absolute; left: 392px; top: 164px; width: 440px; box-sizing: border-box; display: flex; align-items: center; gap: 8px; padding: 7px 12px; border: 2px solid #F47B20; border-radius: 12px; background: #FFFFFF; box-shadow: 0 8px 18px rgba(11, 42, 91, .1); opacity: 0; transform: translateY(-10px); transition: opacity .35s ease, transform .45s cubic-bezier(.3, 1.6, .5, 1); }
.fchip i { font-style: normal; font-size: 11px; font-weight: 800; color: #FFFFFF; background: #F47B20; border-radius: 5px; padding: 1px 6px; }
.fchip b { flex: 1; font-size: 14px; color: var(--ink); }
.fchip em { font-style: normal; font-size: 10.5px; font-weight: 700; color: var(--mist); white-space: nowrap; }
.kdone .s1 .fchip { opacity: 1; transform: none; transition-delay: 1.4s; }

.road { stroke: #0B2A5B; stroke-width: 3; stroke-linecap: round; }
.desk { fill: #C49A3E; stroke: #0B2A5B; stroke-width: 2; } .deskl { stroke: #0B2A5B; stroke-width: 3; stroke-linecap: round; }
.lamp { fill: none; stroke: #0B2A5B; stroke-width: 2.5; stroke-linecap: round; } .lamph { fill: #F47B20; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.paper { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 1.5; }
.wall { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 2.5; } .win { fill: #DCE8FF; stroke: #0B2A5B; stroke-width: 1.5; } .door { fill: #1F5FD6; stroke: #0B2A5B; stroke-width: 2; }
.roof { fill: #E1E6EF; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; } .col { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; }
.pole { stroke: #0B2A5B; stroke-width: 2.5; stroke-linecap: round; }
.stl { font-size: 13px; font-weight: 700; fill: var(--ink); }
.flag { position: absolute; width: 24px; height: 15px; border-radius: 2px 4px 4px 2px; background: #A9B4C7; border: 2px solid #0B2A5B; box-sizing: border-box; transform-origin: 0 50%; animation: wavef 1.2s ease-in-out infinite alternate; transition: background .3s ease; }
.fg1 { left: 623px; top: 481px; } .fg2 { left: 816px; top: 461px; }
@keyframes wavef { to { transform: skewY(-8deg) scaleX(.9); } }
.tale2.kdone .fg1 { background: #1F5FD6; transition-delay: 1s; } .tale2.kdone .fg2 { background: #1F5FD6; transition-delay: 1.9s; }
.tale2.kprob .fg2 { background: #F47B20; transition-delay: 2.1s; }
.gauge { position: absolute; left: 640px; top: 176px; width: 170px; text-align: center; }
.gauge svg { width: 160px; height: 96px; overflow: visible; }
.garc { fill: none; stroke-width: 12; stroke-linecap: round; }
.needle line { stroke: #0B2A5B; stroke-width: 4; stroke-linecap: round; } .needle circle { fill: #0B2A5B; }
.needle { transform-box: view-box; transform-origin: 80px 84px; transform: rotate(-72deg); transition: transform .6s cubic-bezier(.3, 1.4, .5, 1); }
.tale2.kprob .needle { animation: needleUp 3.2s ease .3s both; }
@keyframes needleUp { 0%, 14% { transform: rotate(-72deg); } 26%, 40% { transform: rotate(-12deg); } 58%, 100% { transform: rotate(66deg); } }
.tale2.kdone .needle { animation: needleCalm 1.4s ease-in-out infinite alternate; }
@keyframes needleCalm { from { transform: rotate(-74deg); } to { transform: rotate(-60deg); } }
.gauge b { display: block; margin-top: -4px; font-size: 13.5px; color: var(--ink); } .gauge span { display: block; font-size: 10.5px; font-weight: 600; color: var(--mist); }
.rework { position: absolute; width: 22px; height: 28px; border: 2px solid #0B2A5B; border-radius: 3px; background: #FFF4EA; box-sizing: border-box; opacity: 0; transform: translateY(-30px) rotate(-10deg); }
.tale2.kprob .rework { animation: reworkIn .35s cubic-bezier(.3, 1.6, .5, 1) var(--d) both; }
@keyframes reworkIn { to { opacity: 1; transform: none; } }
.fold { position: absolute; left: 402px; top: 508px; width: 48px; height: 38px; z-index: 3; }
.fold svg { width: 100%; height: 100%; overflow: visible; }
.fd { fill: #1F5FD6; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; } .fdl { stroke: #0B2A5B; stroke-width: 2; }
.flaw { position: absolute; left: 26px; top: 14px; width: 18px; height: 18px; border-radius: 50%; background: #F47B20; border: 2px solid #0B2A5B; box-sizing: border-box; color: #FFFFFF; display: grid; place-items: center; font-size: 11px; font-weight: 800; transform-origin: 50% 50%; }
.fok { position: absolute; left: 24px; top: -10px; width: 22px; height: 22px; border-radius: 50%; background: #FFFFFF; border: 2px solid #1F5FD6; box-sizing: border-box; color: #1F5FD6; display: grid; place-items: center; font-size: 13px; font-weight: 800; opacity: 0; transform: scale(0); }
.tale2.kprob .fold { animation: foldBad 3.2s cubic-bezier(.45, 0, .55, 1) .3s both; }
.tale2.kprob .flaw { animation: flawGrow 3.2s ease .3s both; }
@keyframes foldBad {
  0% { transform: none; } 12% { transform: translate(98px, -70px) rotate(10deg); } 22%, 34% { transform: translate(197px, 50px); }
  46% { transform: translate(294px, -50px) rotate(10deg); } 56%, 70% { transform: translate(390px, 50px); }
  82% { transform: translate(200px, -130px) rotate(-200deg); } 94% { transform: translate(8px, -12px) rotate(-350deg); } 100% { transform: rotate(-360deg); } }
@keyframes flawGrow { 0%, 18% { transform: scale(1); } 34% { transform: scale(1.7); } 56%, 100% { transform: scale(2.5); } }
.tale2.khelp .flaw { animation: flawOut .4s ease .9s both; }
@keyframes flawOut { to { transform: scale(0); opacity: 0; } }
.tale2.khelp .fok, .tale2.kdone .fok { animation: okPop .4s cubic-bezier(.3, 1.8, .5, 1) 2s both; }
.tale2.kdone .fok { animation-delay: 0s; } .tale2.kdone .flaw { opacity: 0; }
.tale2.kdone .fold { animation: foldGood 2.4s cubic-bezier(.45, 0, .55, 1) .2s both; }
@keyframes foldGood { 0% { transform: none; } 20% { transform: translate(98px, -70px) rotate(8deg); } 38%, 48% { transform: translate(197px, 50px); } 70% { transform: translate(294px, -50px) rotate(8deg); } 90%, 100% { transform: translate(390px, 50px); } }
.kstamp { position: absolute; left: 744px; top: 430px; padding: 2px 10px; border: 3px solid #C55A0E; border-radius: 6px; color: #C55A0E; background: rgba(255, 255, 255, .85); font-family: var(--font-display); font-size: 18px; font-weight: 800; text-transform: uppercase; transform: rotate(-12deg) scale(2.2); opacity: 0; z-index: 4; }
.tale2.kprob .kstamp { animation: stampIn .25s ease-in 2.1s both; }
@keyframes stampIn { to { opacity: 1; transform: rotate(-12deg) scale(1); } }
.bugx { position: absolute; left: 410px; top: 504px; width: 34px; height: 34px; opacity: 0; z-index: 4; }
.bugx svg { width: 100%; height: 100%; overflow: visible; }
.bbody { fill: #F47B20; stroke: #0B2A5B; stroke-width: 2.5; } .bleg { stroke: #0B2A5B; stroke-width: 2.5; stroke-linecap: round; }
.bx { font-family: var(--font-display); font-size: 14px; font-weight: 800; fill: #FFFFFF; }
.tale2.khelp .bugx { animation: bugOut 1.4s ease .9s both; }
@keyframes bugOut { 0% { opacity: 0; transform: none; } 15% { opacity: 1; transform: translateY(-18px); } 30% { transform: translate(6px, -40px) rotate(15deg); } 45% { transform: translate(-6px, -48px) rotate(-15deg); } 60% { transform: translate(6px, -50px) rotate(15deg); } 80% { opacity: 1; transform: translate(0, -52px) scale(1.1); } 100% { opacity: 0; transform: translate(0, -52px) scale(0); } }
.tale2.khelp .bugx svg { animation: wriggle .12s linear infinite alternate; }
@keyframes wriggle { to { transform: rotate(8deg); } }
.spark { position: absolute; left: 425px; top: 470px; width: 8px; height: 8px; border-radius: 50%; background: #FFC233; opacity: 0; }
.tale2.khelp .spark { animation: spark .5s ease-out 2.1s both; }
@keyframes spark { 0% { opacity: 1; transform: rotate(var(--a)) translateY(0); } 100% { opacity: 0; transform: rotate(var(--a)) translateY(-34px) scale(.4); } }
.rewind { position: absolute; left: 400px; top: 470px; width: 420px; height: 90px; opacity: 0; }
.rewind i { display: block; height: 3px; margin: 14px 0; border-radius: 2px; background: linear-gradient(90deg, rgba(31, 95, 214, .5), rgba(31, 95, 214, 0)); }
.tale2.khelp .rewind { animation: rewind .5s ease-out both; }
@keyframes rewind { 0% { opacity: 1; transform: translateX(80px); } 100% { opacity: 0; transform: translateX(-120px); } }
.beam2 { display: none; }

.round { position: absolute; left: 520px; top: 176px; display: flex; align-items: center; gap: 8px; padding: 4px 12px; border: 2px solid #C55A0E; border-radius: 10px; background: #FFFFFF; opacity: 0; transition: opacity .3s ease; }
.round span { font-size: 13px; font-weight: 700; color: #C55A0E; }
.round { padding-right: 34px !important; }
.round b { position: absolute; right: 10px; top: 2px; width: 18px; font-family: var(--font-display); font-size: 20px; color: #C55A0E; text-align: center; }
.round .r2, .round .r3 { opacity: 0; }
.tale3.kprob .round { opacity: 1; transition-delay: .2s; }
.tale3.kprob .r1 { animation: rOut .2s ease 1.35s both; }
.tale3.kprob .r2 { animation: rIn .25s ease 1.35s both, rOut .2s ease 2.35s both; }
.tale3.kprob .r3 { animation: rIn .25s ease 2.35s both; }
@keyframes rIn { from { opacity: 0; transform: translateY(10px) scale(1.4); } to { opacity: 1; transform: none; } }
@keyframes rOut { to { opacity: 0; transform: translateY(-10px); } }
.vfile { position: absolute; padding: 3px 8px; border: 1.5px solid #0B2A5B; border-radius: 6px; background: #FFFFFF; font-size: 11px; font-weight: 700; color: var(--ink); white-space: nowrap; box-shadow: 0 4px 10px rgba(11, 42, 91, .1); opacity: 0; transition: opacity .3s ease; }
.vf1 { left: 110px; top: 300px; } .vf2 { left: 220px; top: 258px; } .vf3 { left: 92px; top: 216px; }
.tale3.kprob .vfile { opacity: 1; animation: floaty 1.6s ease-in-out infinite alternate; }
.tale3.kprob .vf1 { transition-delay: .5s; } .tale3.kprob .vf2 { transition-delay: 1.4s; animation-delay: -.5s; } .tale3.kprob .vf3 { transition-delay: 2.4s; animation-delay: -1s; }
@keyframes floaty { to { transform: translateY(-8px) rotate(-3deg); } }
.ppf { position: absolute; left: 290px; top: 452px; width: 48px; height: 38px; z-index: 5; opacity: 0; }
.ppf svg { width: 100%; height: 100%; }
.tale3.kprob .ppf { opacity: 1; animation: pingpong 3.3s ease-in-out .2s both; }
@keyframes pingpong { 0% { transform: none; } 7% { transform: translate(210px, -80px) rotate(12deg); } 15% { transform: translate(430px, 0); } 22% { transform: translate(210px, -60px) rotate(-12deg); } 30% { transform: none; }
  37% { transform: translate(210px, -80px) rotate(12deg); } 45% { transform: translate(430px, 0); } 52% { transform: translate(210px, -60px) rotate(-12deg); } 60% { transform: none; }
  67% { transform: translate(210px, -80px) rotate(12deg); } 75% { transform: translate(430px, 0); } 82% { transform: translate(210px, -60px) rotate(-12deg); } 90%, 100% { transform: none; } }
.still3 { position: absolute; left: 600px; top: 340px; padding: 2px 8px; border-radius: 6px; background: #C55A0E; color: #FFFFFF; font-size: 12px; font-weight: 800; white-space: nowrap; opacity: 0; z-index: 6; }
.tale3.kprob .still3 { animation: flash3 3.3s linear .2s both; }
@keyframes flash3 { 0%, 15% { opacity: 0; transform: translateY(6px); } 17%, 26% { opacity: 1; transform: none; } 28%, 45% { opacity: 0; } 47%, 56% { opacity: 1; } 58%, 75% { opacity: 0; } 77%, 86% { opacity: 1; } 88%, 100% { opacity: 0; } }
.tale3.kdone .ppf { opacity: 1; animation: once 1.1s ease-in-out .5s both; }
@keyframes once { 0% { transform: none; opacity: 0; } 10% { opacity: 1; } 50% { transform: translate(215px, -24px) rotate(10deg); } 100% { transform: translate(430px, 0); opacity: 1; } }
.cmpw { position: absolute; left: 326px; top: 166px; width: 366px; box-sizing: border-box; border: 2px solid #1F5FD6; border-radius: 14px; background: #FFFFFF; padding: 10px 12px; box-shadow: 0 12px 26px rgba(31, 95, 214, .14); opacity: 0; transform: scale(.85) translateY(10px); transition: opacity .35s ease, transform .5s cubic-bezier(.3, 1.4, .5, 1); z-index: 5; }
.tale3.khelp .cmpw { opacity: 1; transform: none; transition-delay: .5s; }
.tale3.kdone .cmpw { opacity: 1; transform: none; }
.tale3.kdone .bad { text-decoration: line-through; color: #8C96A8; }
.tale3.kdone .fix { display: inline; background: #DCE8FF; color: #1F5FD6; font-weight: 800; margin-left: 3px; }
.tale3.kdone .okm { background: #DCE8FF; }
.tale3.kdone .askd, .tale3.kdone .chk, .tale3.kdone .chk-ok { opacity: 1; transform: none; }
.tale3.kdone .chk-b em { width: 100%; }
.cw-h { margin: 0 0 8px; font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--ink); }
.cw-cols { display: flex; gap: 10px; }
.cw-c { flex: 1; border: 1.5px solid #C9D2E0; border-radius: 8px; padding: 7px 9px; }
.cw-c p { margin: 0 0 6px; font-size: 11.5px; font-weight: 800; color: var(--ink); }
.cw-c i { display: block; height: 5px; border-radius: 3px; background: #DDE3EC; margin-bottom: 6px; }
.cw-c span { display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; line-height: 1.35; color: var(--ink); }
.cw-c mark { background: transparent; color: inherit; border-radius: 3px; padding: 0 2px; white-space: nowrap; transition: background .3s ease; }
.tale3.khelp .okm { background: #DCE8FF; transition-delay: 1.1s; }
.tale3.khelp .bad { background: #FFD9B8; transition-delay: 1.1s; }
.fix { display: none; }
.tale3.khelp .bad { animation: strike .01s linear 2.3s both; }
@keyframes strike { to { text-decoration: line-through; color: #8C96A8; background: transparent; } }
.tale3.khelp .fix { display: inline; background: #DCE8FF; color: #1F5FD6; font-weight: 800; margin-left: 3px; animation: fixIn .35s cubic-bezier(.3, 1.6, .5, 1) 2.3s both; }
@keyframes fixIn { from { opacity: 0; } to { opacity: 1; } }
.askd { margin-top: 8px; padding: 6px 9px; border-radius: 8px; background: #F7F9FD; border: 1.5px dashed #1F5FD6; font-size: 12px; font-weight: 600; color: var(--ink); opacity: 0; transform: translateY(6px); transition: opacity .3s ease, transform .3s ease; }
.askd b { color: #1F5FD6; margin-right: 4px; }
.srcd { display: inline-block; margin-left: 4px; font-size: 11px; font-weight: 800; color: #1F5FD6; background: #DCE8FF; border-radius: 5px; padding: 0 6px; }
.tale3.khelp .askd { opacity: 1; transform: none; transition-delay: 1.6s; }
.chk { margin-top: 8px; display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; color: var(--ink); opacity: 0; transition: opacity .3s ease; }
.chk-b { flex: 1; height: 8px; border-radius: 4px; background: #E1E6EF; overflow: hidden; }
.chk-b em { display: block; height: 100%; width: 0; background: #1F5FD6; }
.chk-ok { color: #1F5FD6; opacity: 0; }
.tale3.khelp .chk { opacity: 1; transition-delay: 2.6s; }
.tale3.khelp .chk-b em { animation: fill 0.7s ease 2.7s both; }
@keyframes fill { to { width: 100%; } }
.tale3.khelp .chk-ok { animation: fixIn .3s ease 3.4s both; }
.cw-n { margin: 6px 0 0; text-align: right; font-size: 10.5px; font-weight: 700; color: var(--mist); }
.okstamp { position: absolute; left: 600px; top: 500px; padding: 2px 10px; border: 3px solid #1F5FD6; border-radius: 6px; color: #1F5FD6; background: rgba(255, 255, 255, .9); font-family: var(--font-display); font-size: 18px; font-weight: 800; text-transform: uppercase; transform: rotate(-10deg) scale(2.2); opacity: 0; z-index: 6; }
.tale3.kdone .okstamp { animation: stampOk .25s ease-in 1.4s both; }
@keyframes stampOk { to { opacity: 1; transform: rotate(-10deg) scale(1); } }
.s3note { position: absolute; left: 326px; top: 436px; width: 366px; margin: 0; text-align: center; font-size: 11.5px; font-weight: 600; color: var(--mist); opacity: 0; transition: opacity .3s ease; }
.tale3.kdone .s3note { opacity: 1; transition-delay: 1.8s; }

.ask { position: absolute; left: 262px; top: 236px; padding: 10px 14px; border: 2px solid #0B2A5B; border-radius: 16px 16px 16px 4px; background: #FFFFFF; font-size: 15px; font-weight: 700; color: var(--ink); white-space: nowrap; box-shadow: 0 8px 18px rgba(11, 42, 91, .1); z-index: 5; }
.shelf { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 3; } .shelfl { stroke: #0B2A5B; stroke-width: 3; }
.bnr { stroke: #0B2A5B; stroke-width: 2; } .bnl { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 1.2; }
.tale4.kprob .bnd { animation: rummage .45s ease-in-out var(--d) infinite alternate; }
@keyframes rummage { 0%, 40% { transform: none; } 100% { transform: translateY(-14px) rotate(-4deg); } }
.bnd { transform-box: fill-box; transform-origin: 50% 100%; transition: opacity .3s ease, filter .3s ease; }
.tale4.khelp .bnd.tgt { animation: tgtGlow .5s ease .9s both; }
@keyframes tgtGlow { to { filter: drop-shadow(0 0 6px #4FB8FF) drop-shadow(0 0 12px #4FB8FF); } }
.tale4.khelp .bnd.tgt, .tale4.kdone .bnd.tgt { opacity: 0; transition-delay: 1.3s; }
.loosep { position: absolute; top: 300px; width: 22px; height: 28px; border: 2px solid #0B2A5B; border-radius: 3px; background: #FFFFFF; box-sizing: border-box; opacity: 0; }
.tale4.kprob .loosep { animation: fall 1.6s ease-in var(--d) infinite; }
@keyframes fall { 0% { opacity: 1; transform: none; } 50% { transform: translate(-30px, 140px) rotate(var(--r)); } 100% { opacity: 0; transform: translate(10px, 290px) rotate(calc(var(--r) * -2)); } }
.flyb { position: absolute; left: 726px; top: 398px; width: 38px; height: 80px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 4px; background: #F47B20; opacity: 0; display: grid; place-items: center; z-index: 5; }
.flyb span { writing-mode: vertical-rl; transform: rotate(180deg); font-size: 9px; font-weight: 800; color: #FFFFFF; }
.tale4.khelp .flyb { animation: flyb 1.2s cubic-bezier(.4, 0, .3, 1) 1.2s both; }
@keyframes flyb { 0% { opacity: 1; transform: none; } 70% { opacity: 1; transform: translate(-250px, -60px) rotate(90deg) scale(1.5); } 100% { opacity: 0; transform: translate(-250px, -60px) rotate(90deg) scale(1.7); } }
.ipage { position: absolute; left: 410px; top: 300px; width: 250px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 8px; background: #FFFFFF; padding: 10px 12px; box-shadow: 0 10px 22px rgba(11, 42, 91, .12); opacity: 0; transform: translateY(30px) scale(.6); transition: opacity .35s ease, transform .5s cubic-bezier(.3, 1.5, .5, 1); z-index: 4; }
.ipage p { margin: 0 0 6px; font-size: 12px; font-weight: 800; color: var(--ink); }
.ipage i { display: block; height: 5px; border-radius: 3px; background: #DDE3EC; margin-bottom: 6px; }
.ipage span { display: block; margin-bottom: 6px; font-size: 12.5px; font-weight: 600; line-height: 1.35; color: var(--ink); }
.ipage mark { background: #FFD9B8; color: inherit; border-radius: 3px; padding: 0 2px; }
.tale4.khelp .ipage, .tale4.kdone .ipage { opacity: 1; transform: none; transition-delay: 2.2s; }
.tale4.kdone .ipage { transition-delay: 0s; }
.ans { position: absolute; left: 540px; top: 166px; width: 310px; box-sizing: border-box; border: 2px solid #1F5FD6; border-radius: 16px 16px 4px 16px; background: #FFFFFF; padding: 10px 14px; font-size: 14px; font-weight: 600; line-height: 1.35; color: var(--ink); box-shadow: 0 10px 22px rgba(31, 95, 214, .14); opacity: 0; transform: translateY(10px) scale(.9); transition: opacity .35s ease, transform .45s cubic-bezier(.3, 1.5, .5, 1); z-index: 5; }
.ans b { color: #1F5FD6; }
.src { display: inline-block; margin-top: 6px; font-size: 12px; font-weight: 800; color: #1F5FD6; background: #DCE8FF; border-radius: 6px; padding: 1px 8px; }
.tale4.kdone .ans { opacity: 1; transform: none; transition-delay: .2s; }
.lnk2 { fill: none; stroke: #1F5FD6; stroke-width: 3; stroke-dasharray: 6 6; opacity: 0; }
.tale4.kdone .lnk2 { opacity: 1; transition: opacity .3s ease .6s; animation: march 1s linear infinite; }

.a5 { top: 226px; }
.gh { fill: #E1E6EF; stroke: #A9B4C7; stroke-width: 2; } .ghq { font-size: 13px; font-weight: 800; fill: #8C96A8; }
.tangle { fill: none; stroke: #A9B4C7; stroke-width: 2.5; stroke-dasharray: 6 6; }
.tale5.kprob .tangle { animation: march 1s linear var(--d) infinite; }
.ghost { transition: opacity .4s ease, transform .4s ease; }
.tale5.khelp .ghost, .tale5.kdone .ghost { opacity: 0; }
.mail { position: absolute; left: 0; top: 0; width: 20px; height: 14px; offset-rotate: 0deg; opacity: 0; }
.mail i { display: block; width: 100%; height: 100%; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 2px; background: #FFFFFF; }
.tale5.kprob .mail { animation: mailGo 1.5s ease-in-out var(--d) infinite alternate; }
@keyframes mailGo { 0% { offset-distance: 0%; opacity: 1; } 100% { offset-distance: 100%; opacity: 1; } }
.ring { position: absolute; left: 244px; top: 300px; width: 34px; height: 34px; opacity: 0; }
.ring svg { width: 100%; height: 100%; overflow: visible; }
.rph { fill: #1F5FD6; stroke: #0B2A5B; stroke-width: 2; } .rwav { fill: none; stroke: #F47B20; stroke-width: 2.5; stroke-linecap: round; }
.tale5.kprob .ring { opacity: 1; animation: buzz .12s linear infinite alternate; }
@keyframes buzz { from { transform: rotate(-8deg); } to { transform: rotate(8deg); } }
.sarr { fill: none; stroke: #1F5FD6; stroke-width: 4; stroke-linecap: round; stroke-dasharray: 460; stroke-dashoffset: 460; }
.tale5.khelp .sarr, .tale5.kdone .sarr { stroke-dashoffset: 0; transition: stroke-dashoffset .9s ease 1.3s; }
.ccard { position: absolute; left: 420px; top: 176px; width: 250px; box-sizing: border-box; border: 2px solid #F47B20; border-radius: 12px; background: #FFFFFF; padding: 8px 12px; box-shadow: 0 10px 22px rgba(11, 42, 91, .12); opacity: 0; transform: translateY(12px) scale(.9); transition: opacity .3s ease, transform .45s cubic-bezier(.3, 1.5, .5, 1); z-index: 5; }
.ccard p { margin: 0; font-size: 11px; font-weight: 800; color: #C55A0E; text-transform: uppercase; letter-spacing: .04em; }
.ccard b { display: block; font-family: var(--font-display); font-size: 17px; color: var(--ink); }
.ccard span { font-size: 12px; font-weight: 600; color: var(--mist); }
.tale5.khelp .ccard, .tale5.kdone .ccard { opacity: 1; transform: none; transition-delay: .8s; }
.tale5.khelp .a5, .tale5.kdone .a5 { opacity: 0; transition: opacity .3s ease; }
.msg { position: absolute; left: 0; top: 0; width: 14px; height: 14px; border-radius: 50%; background: #F47B20; border: 2px solid #0B2A5B; box-sizing: border-box; offset-path: path('M300 468 C 420 380, 560 380, 690 430'); opacity: 0; }
.tale5.kdone .msg { animation: mailGo 1s ease-in-out .3s infinite alternate; }

.heap { position: absolute; inset: 0; transition: opacity .4s ease; }
.hm { position: absolute; width: 42px; height: 28px; opacity: 0; }
.hm svg { width: 100%; height: 100%; overflow: visible; }
.tale6.kprob .hm { animation: hmIn .35s ease-in var(--d) both; }
@keyframes hmIn { from { opacity: 0; translate: 0 -120px; } to { opacity: 1; translate: 0 0; } }
.tale6.khelp .heap, .tale6.kdone .heap { opacity: 0; }
.env { position: absolute; width: 56px; height: 40px; z-index: 5; opacity: 0; }
.env svg { width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 4px 8px rgba(11, 42, 91, .14)); }
.eb { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; } .efl { fill: none; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.env p { position: absolute; left: -40px; right: -40px; top: -40px; margin: 0; text-align: center; font-size: 12px; font-weight: 600; color: var(--mist); }
.env p b { display: block; font-size: 14px; color: var(--ink); }
.e20 { left: 300px; top: 440px; } .e30 { left: 300px; top: 440px; }
.tale6.kprob .e20 { animation: e20 1.4s ease-in-out .3s both; }
@keyframes e20 { 0% { opacity: 1; transform: none; } 50% { opacity: 1; transform: translate(200px, -150px) rotate(-8deg); } 85% { opacity: 1; transform: translate(400px, 90px) rotate(20deg); } 100% { opacity: 0; transform: translate(410px, 110px) rotate(24deg) scale(.7); } }
.tale6.kprob .e30 { animation: e30 1.2s ease-in-out 2.4s both; }
@keyframes e30 { 0% { opacity: 0; transform: none; } 6% { opacity: 1; } 50% { opacity: 1; transform: translate(220px, -130px) rotate(8deg); } 100% { opacity: 1; transform: translate(420px, -20px); } }
.lost { position: absolute; left: 744px; top: 330px; padding: 2px 8px; border-radius: 6px; background: #C55A0E; color: #FFFFFF; font-size: 12px; font-weight: 800; white-space: nowrap; opacity: 0; z-index: 6; }
.tale6.kprob .lost { animation: okPop .3s cubic-bezier(.3, 1.8, .5, 1) 1.9s both; }
.tsrc { position: absolute; left: 360px; top: 168px; width: 500px; margin: 0; text-align: center; font-size: 12.5px; font-weight: 600; color: var(--mist); opacity: 0; transition: opacity .3s ease; }
.tale6.kprob .tsrc { opacity: 1; transition-delay: 1s; }
.rec { position: absolute; left: 368px; top: 176px; width: 404px; box-sizing: border-box; border: 2px solid #1F5FD6; border-radius: 14px; background: #FFFFFF; padding: 10px 14px 12px; box-shadow: 0 12px 26px rgba(31, 95, 214, .14); opacity: 0; transform: translateY(14px) scale(.9); transition: opacity .35s ease, transform .5s cubic-bezier(.3, 1.4, .5, 1); z-index: 5; }
.tale6.khelp .rec, .tale6.kdone .rec { opacity: 1; transform: none; transition-delay: .4s; }
.tale6.kdone .rec { transition-delay: 0s; }
.rec-h { margin: 0 0 10px; display: flex; justify-content: space-between; align-items: baseline; font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--ink); }
.rec-h span { font-family: inherit; font-size: 11.5px; font-weight: 700; color: var(--mist); }
.tl { position: relative; display: flex; gap: 10px; }
.tl::before { content: ''; position: absolute; left: 10px; right: 10px; top: 50%; height: 3px; background: #C9D2E0; border-radius: 2px; }
.vcard { position: relative; flex: 1; box-sizing: border-box; border: 2px solid #1F5FD6; border-radius: 10px; background: #FFFFFF; padding: 6px 8px; opacity: 0; transform: translateY(-24px) rotate(-6deg); transition: opacity .25s ease, transform .45s cubic-bezier(.3, 1.8, .5, 1), box-shadow .3s ease; }
.vcard b { display: block; font-size: 13px; color: var(--ink); } .vcard span { display: block; font-size: 11.5px; font-weight: 600; color: var(--mist); }
.vcard em { position: absolute; right: 6px; top: 6px; display: flex; gap: 3px; }
.vcard em i { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid #0B2A5B; }
.dot-t { background: #1F5FD6; } .dot-o { background: #F47B20; }
.tale6.khelp .vcard, .tale6.kdone .vcard { opacity: 1; transform: none; }
.tale6.khelp .vc0 { transition-delay: 1s; } .tale6.khelp .vc1 { transition-delay: 1.5s; } .tale6.khelp .vc2 { transition-delay: 2s; }
.tale6.kdone .vc0 { box-shadow: 0 0 0 4px rgba(31, 95, 214, .25), 0 0 18px rgba(31, 95, 214, .35); transition-delay: .5s; }
.share { fill: none; stroke: #1F5FD6; stroke-width: 3; stroke-dasharray: 6 6; opacity: 0; }
.tale6.kdone .share { opacity: 1; transition: opacity .3s ease .3s; animation: march 1s linear infinite; }

@keyframes march { to { stroke-dashoffset: -12; } }
@keyframes okPop { to { opacity: 1; transform: none; } }

.offc { position: absolute; top: 352px; width: 160px; height: 270px; z-index: 4; opacity: 0; transform: translateY(40px); transition: transform .5s cubic-bezier(.3, 1.5, .5, 1), opacity .3s ease, left 0s; }
.offc.on { opacity: 1; transform: none; transition-delay: .3s; }
.olab { position: absolute; top: 630px; width: 200px; margin: 0 0 0 -20px; text-align: center; font-size: 14px; color: var(--ink); opacity: 0; transition: opacity .3s ease; }
.olab.on { opacity: 1; transition-delay: .6s; }

.eyeb { transform-box: fill-box; transform-origin: 50% 50%; transition: transform .25s ease, opacity .2s ease; }
.eyh { fill: none; stroke: #7FE3F0; stroke-width: 3; stroke-linecap: round; opacity: 0; transition: opacity .2s ease; }
.khelp:not(.tale0) .eyeb { transform: scaleY(.5); }
.kdone:not(.tale0) .eyeb { opacity: 0; }
.kdone:not(.tale0) .eyh { opacity: 1; }

.ground { position: absolute; left: 72px; width: 800px; top: 624px; height: 2px; background: #E1E6EF; opacity: 0; transition: opacity .4s ease; z-index: 2; }
.ent2 .ground { opacity: 1; }
.doc { position: absolute; left: 130px; top: 350px; width: 160px; height: 270px; z-index: 8; opacity: 0; transform: translateX(-260px); transition: transform 1s cubic-bezier(.3, 1.1, .5, 1), opacity .3s ease; }
.ent2 .doc { opacity: 1; transform: none; }
.dlab { position: absolute; left: 110px; top: 630px; width: 200px; margin: 0; text-align: center; font-size: 14px; color: var(--ink); opacity: 0; transition: opacity .3s ease; z-index: 8; }
.ent2 .dlab { opacity: 1; transition-delay: .8s; }

.bot { position: absolute; left: 0; top: 0; width: 120px; height: 150px; z-index: 12; transform-origin: 60px 60px; transition: transform 1s cubic-bezier(.5, -.2, .3, 1.15); }
.ent0 .bot { transition: none; }
.bob { width: 100%; height: 100%; }
.ent2 .bob { animation: bob 2.4s ease-in-out infinite; }
@keyframes bob { 50% { transform: translateY(-7px); } }
.botsvg { width: 100%; height: 100%; overflow: visible; }
.gold { fill: #C49A3E; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.navy { fill: #0B2A5B; }
.ear { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.visor { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; }
.rim { fill: none; stroke: #DFF6FF; stroke-width: 2; stroke-linecap: round; }
.topl { fill: #DFF6FF; stroke: #0B2A5B; stroke-width: 1.5; }
.eyeb { fill: #7FE3F0; }
.mouth { fill: none; stroke: #7FE3F0; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.htag { font-family: var(--font-display); font-size: 8.5px; font-weight: 800; fill: #0B2A5B; }
.bshd { fill: #0B2A5B; opacity: 0; }
.lid { fill: #0B2A5B; transform-box: fill-box; transform-origin: 50% 0; transform: scaleY(0); }
.ent2 .lid { animation: blink 3.6s ease infinite 1s; }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(0); } 95% { transform: scaleY(1); } }
.barm { transform-box: view-box; transform: scaleY(0); opacity: 0; transition: transform .45s cubic-bezier(.3, 1.6, .5, 1), opacity .2s ease; }
.barm.l { transform-origin: -24.5px 26px; } .barm.r { transform-origin: 24.5px 26px; }
.stage:not(.ent0) .barm { transform: none; opacity: 1; transition-delay: .9s; }

.ent2.tale0 .barm.r { animation: wave .5s ease-in-out .4s 4 alternate both; }
@keyframes wave { from { transform: rotate(-120deg); } to { transform: rotate(-160deg); } }

.khelp .barm.l { transform: rotate(60deg); transition-delay: .5s; }
.khelp .barm.r { animation: tap .5s ease-in-out .9s infinite alternate; }
@keyframes tap { from { transform: rotate(-20deg); } to { transform: rotate(-70deg); } }

.kdone:not(.tale0) .barm.l { transform: rotate(150deg); transition-delay: .2s; }
.kdone:not(.tale0) .barm.r { transform: rotate(-150deg); transition-delay: .2s; }
.kdone:not(.tale0) .bob { animation: hop .5s ease-in-out 2 alternate; }
@keyframes hop { to { transform: translateY(-16px); } }
.kstill .barm, .kstill .bob { animation: none !important; }
.slot { transition: border-color .3s ease, background .3s ease, box-shadow .3s ease, translate .35s cubic-bezier(.3, 1.5, .5, 1), opacity .3s ease; }
.slot.got.hot { translate: -12px 0; border-color: #1F5FD6; box-shadow: 0 0 0 5px rgba(31, 95, 214, .22), 0 12px 24px rgba(31, 95, 214, .22); }
.slot.nq:not(.hot) { opacity: .5; }
.tale7 .list, .tale8 .list { left: 1136px; width: 84px; transition-delay: .15s; }
.tale7 .slot, .tale8 .slot { padding: 0; justify-content: center; gap: 0; }
.tale7 .slot .stx, .tale8 .slot .stx, .tale7 .slot .tick, .tale8 .slot .tick { display: none; }
.tale7 .slot .num, .tale8 .slot .num { position: absolute; left: -9px; top: -9px; }
.list { transition: opacity .45s ease, transform .45s ease, left .6s cubic-bezier(.5, 0, .3, 1), width .6s cubic-bezier(.5, 0, .3, 1); }
</style>
