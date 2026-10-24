<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const step = computed(() => unref($clicks) as number)

const active = useIsSlideActive()
const phase = ref(0)
const animate = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }

const S = 1.22

const toLocal = (X: number, Y: number, s = 1) => ({ x: (X - 640) / S + 100 - 20 * s, y: (Y - 650) / S + 449 })

const titleIdx = computed(() => phase.value === 0 ? 0 : step.value >= 4 ? 2 : 1)
const titles = ['…and the Harsh Reality', 'Starting a New Study', 'The Study Dossier']

type Kind = 'virus' | 'bacterium' | 'cell'
const icons: { kind: Kind, x: number, y: number, s: number }[] = [
  { kind: 'virus', x: 300, y: 230, s: 1.15 }, { kind: 'cell', x: 430, y: 350, s: 0.85 },
  { kind: 'bacterium', x: 250, y: 455, s: 1 }, { kind: 'virus', x: 410, y: 560, s: 0.75 },
  { kind: 'bacterium', x: 160, y: 320, s: 0.7 }, { kind: 'cell', x: 1000, y: 225, s: 1 },
  { kind: 'virus', x: 860, y: 370, s: 0.9 }, { kind: 'bacterium', x: 1020, y: 470, s: 1.1 },
  { kind: 'virus', x: 1130, y: 330, s: 0.7 }, { kind: 'cell', x: 880, y: 560, s: 0.8 },
]
function iconStyle(i: number) {
  const ic = icons[i]
  const side = ic.x < 640 ? -1 : 1
  const dx = phase.value === 0 ? -side * 70 : side * 760
  return {
    opacity: phase.value === 0 ? 0.55 + ic.s * 0.4 : 0,
    transform: `translate(${ic.x + dx}px, ${ic.y}px) scale(${ic.s * 1.7})`,
    transition: animate.value ? `transform 1.6s cubic-bezier(.5, 0, .7, .4) ${0.5 + (i % 5) * 0.06}s, opacity .6s ease ${1.4 + (i % 5) * 0.06}s` : 'none',
  }
}
function facing(i: number) {
  const side = icons[i].x < 640 ? -1 : 1
  const dir = phase.value === 0 ? -side : side
  return { transform: `scaleX(${dir > 0 ? -1 : 1})` }
}

const blocks = [
  { name: 'Organization', sub: 'Sites, staff, timelines', kind: 'org', top: -14, rot: -2 },
  { name: 'Funding agreements', sub: 'Budgets and contracts', kind: 'fund', top: -74, rot: 2.5 },
  { name: 'Privacy forms', sub: 'Personal data and consent', kind: 'priv', top: -134, rot: -1.5 },
]
const falling = ref([false, false, false])
const landed = ref(0)
const released = ref(false)

function resetBlocks(full: boolean) {
  falling.value = [full, full, full]
  landed.value = full ? 3 : 0
}
const squash = computed(() => (step.value >= 2 && !released.value) ? 1 - 0.028 * landed.value : 1)
const towerDrop = computed(() => (1 - squash.value) * 255)
function blockStyle(i: number) {
  const b = blocks[i]
  if (step.value >= 3) {
    return {
      transform: `translateY(-820px) rotate(${b.rot * 4}deg)`,
      transition: `transform .7s cubic-bezier(.6, 0, .9, .5) ${0.75 + (2 - i) * 0.12}s`,
    }
  }
  if (falling.value[i]) {
    return { transform: `translateY(0) rotate(${b.rot}deg)`, transition: 'transform .45s cubic-bezier(.55, 0, .9, .45)' }
  }
  return { transform: `translateY(-760px) rotate(${b.rot * 3}deg)`, transition: 'none' }
}

const heroStyle = computed(() => ({
  transform: phase.value === 0 ? 'translate(530.2px, 102.2px) scale(1.22)' : 'translate(250px, 361px) scale(1)',
  transition: animate.value ? 'transform 1.2s cubic-bezier(.6, 0, .3, 1) .55s' : 'none',
}))
const mood = computed(() => {
  if (phase.value === 0) return 'confused'
  if (phase.value === 1) return 'neutral'
  if (step.value <= 1) return 'happy'
  if (step.value === 2) return 'worried'
  if (step.value === 3) return released.value ? 'neutral' : 'worried'
  return step.value >= 5 ? 'happy' : 'neutral'
})
const pose = computed(() => {
  if (phase.value === 0) return 'flail'
  if (step.value === 2 || (step.value === 3 && !released.value)) return 'carry'
  if (step.value >= 5) return 'point'
  return 'rest'
})
const sweat = computed(() => step.value >= 2 && landed.value >= 2 && !released.value)

const slide3Papers = [
  { x: 6, y: 236, r: -14 }, { x: 98, y: 240, r: 12 }, { x: 52, y: 238, r: 3 },
  { x: -10, y: 196, r: 18 }, { x: 108, y: 200, r: -16 }, { x: 46, y: 196, r: -5 },
  { x: 14, y: 156, r: -22 }, { x: 96, y: 160, r: 20 }, { x: 54, y: 150, r: 8 },
]
const pileStage = [
  { X: 452, Y: 556, r: -8 }, { X: 532, Y: 560, r: 6 }, { X: 492, Y: 548, r: -2 },
  { X: 470, Y: 520, r: 14 }, { X: 548, Y: 526, r: -12 }, { X: 506, Y: 512, r: 4 },
  { X: 486, Y: 486, r: -16 }, { X: 532, Y: 490, r: 10 }, { X: 508, Y: 470, r: -4 },
  { X: 470, Y: 446, r: 9 }, { X: 528, Y: 452, r: -11 }, { X: 500, Y: 432, r: 2 },
]
const blockDrops = [{ X: 305, Y: 354 }, { X: 305, Y: 294 }, { X: 305, Y: 234 }]
const paperCount = 12
const pile = (i: number) => toLocal(pileStage[i].X, pileStage[i].Y)
const papersHidden = ref(false)

function paperStyle(i: number) {
  const isNew = i >= 9
  let x = 0, y = 0, r = 0, s = 1, o = 1, delay = 0, dur = 0.9, ease = 'cubic-bezier(.5, 0, .3, 1)'
  if (isNew && step.value < 3) {
    const d = toLocal(blockDrops[i - 9].X, blockDrops[i - 9].Y, 0.6)
    x = d.x; y = d.y; s = 0.6; o = 0
  } else if (isNew && step.value === 3) {
    x = pile(i).x; y = pile(i).y; r = pileStage[i].r
    delay = 0.15 + (i - 9) * 0.2; dur = 0.7; ease = 'cubic-bezier(.45, 0, .7, .6)'
  } else if (phase.value === 0 && !isNew) {
    const p = slide3Papers[i]; x = p.x; y = p.y; r = p.r
  } else {
    x = pile(i).x; y = pile(i).y; r = pileStage[i].r
    delay = 0.05 + (8 - i) * 0.03; dur = 0.85; ease = 'cubic-bezier(.5, 0, .5, 1.2)'
  }
  if (step.value >= 4) { o = papersHidden.value ? 0 : 1; dur = 0 }
  const useTransition = (animate.value || step.value > 0) && dur > 0
  return {
    transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`,
    opacity: o,
    transition: useTransition ? `transform ${dur}s ${ease} ${delay}s, opacity .2s ease ${delay}s` : 'none',
  }
}

const FOLDER_X = 700, FOLDER_Y = 258
const SHEET_SCALE = 62 / (58 * S)
const sheets = Array.from({ length: paperCount }, (_, k) => ({ fx: 18 + ((k * 41) % 150), fy: 24 - k * 1.3 }))
const filled = ref(0)
const paperEls: (Element | null)[] = []
const folderEls: (Element | null)[] = []

function thump() {
  folderEls.forEach(el => el?.animate(
    [{ transform: 'none' }, { transform: 'scale(1.02, .95)' }, { transform: 'none' }],
    { duration: 220, easing: 'ease-out' },
  ))
}
function cancelFly() { paperEls.forEach(el => el?.getAnimations().forEach(a => a.cancel())) }
function flyIn() {
  cancelFly()
  filled.value = 0
  papersHidden.value = false
  const order = Array.from({ length: paperCount }, (_, i) => paperCount - 1 - i)
  order.forEach((i, k) => {
    const el = paperEls[i]
    if (!el) return
    const from = pile(i)
    const t = toLocal(FOLDER_X + sheets[k].fx, FOLDER_Y + sheets[k].fy, SHEET_SCALE)
    const mx = from.x + (t.x - from.x) * 0.45
    const my = Math.min(from.y, t.y) - 80
    const r0 = pileStage[i].r
    const anim = el.animate([
      { transform: `translate(${from.x}px, ${from.y}px) rotate(${r0}deg) scale(1)`, opacity: 1 },
      { transform: `translate(${mx}px, ${my}px) rotate(${r0 * 0.3 + (k % 2 ? 8 : -8)}deg) scale(.96)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${t.x}px, ${t.y}px) rotate(0deg) scale(${SHEET_SCALE})`, opacity: 1, offset: 0.98 },
      { transform: `translate(${t.x}px, ${t.y}px) rotate(0deg) scale(${SHEET_SCALE})`, opacity: 0 },
    ], { duration: 760, delay: 450 + k * 95, easing: 'cubic-bezier(.45, 0, .3, 1)', fill: 'forwards' })
    anim.onfinish = () => { filled.value = Math.max(filled.value, k + 1); thump() }
  })
}

const docs = [
  { name: 'Protocol', icon: 'protocol' },
  { name: 'Consent forms', icon: 'consent' },
  { name: 'Information sheets', icon: 'info' },
  { name: 'Administrative documentation', icon: 'admin' },
]

const barFill = computed(() => step.value >= 4 ? 90 : step.value >= 1 ? 33 : 0)

const roles = [
  { name: 'Ethics committee', x: 590, y: 78, pose: 'weigh', cfg: { outfit: 'suit', outfitColor: '#0B2A5B', tieColor: '#1F5FD6', hair: 'grey', hairColor: '#AEB6C4', skin: '#EBC2A0', glasses: true } },
  { name: 'Sponsor', x: 1080, y: 78, pose: 'sign', cfg: { outfit: 'suit', outfitColor: '#33456B', tieColor: '#F47B20', hair: 'short', hairColor: '#2B1D14', skin: '#8D5A3B', glasses: false } },
  { name: 'Study coordinator', x: 590, y: 440, pose: 'phone', cfg: { outfit: 'sweater', outfitColor: '#1F5FD6', hair: 'long', hairColor: '#4A2E1F', skin: '#C68B62', glasses: false } },
  { name: 'Clinical Trials Office', x: 1080, y: 440, pose: 'stamp', cfg: { outfit: 'sweater', outfitColor: '#F47B20', hair: 'bun', hairColor: '#1E1E2A', skin: '#F1C9A5', glasses: true } },
] as const
const HUB = { x: 880, y: 373 }
const ends = [...roles.map(r => ({ x: r.x + 65, y: r.y + 112 })), { x: 420, y: 500 }]
const links = ends.map((p, i) => ({ d: `M${HUB.x},${HUB.y} L${p.x},${p.y}`, i }))
const PERIOD = 3.2, GAP = 0.5
const reactDelay = (i: number) => `${i * GAP + PERIOD - 0.05}s`

const t5 = ref(0)
let raf = 0, t5start = 0
function tick(ts: number) {
  if (!t5start) t5start = ts
  t5.value = (ts - t5start) / 1000
  raf = requestAnimationFrame(tick)
}
const minis = computed(() => {
  const t = t5.value
  const out: { x: number, y: number, o: number, back: boolean, key: string }[] = []
  ends.forEach((e, i) => {
    for (const back of [false, true]) {
      const local = t - i * GAP - (back ? PERIOD / 2 : 0)
      if (local < 0) continue
      const p = (local % PERIOD) / PERIOD
      const u = back ? 1 - p : p
      const o = Math.min(1, p / 0.08, (1 - p) / 0.08)
      out.push({ x: HUB.x + (e.x - HUB.x) * u, y: HUB.y + (e.y - HUB.y) * u, o, back, key: `${i}-${back}` })
    }
  })
  return out
})

watch(active, (a) => {
  clearTimers()
  cancelAnimationFrame(raf)
  if (!a) { animate.value = false; phase.value = 0; return }
  if (step.value > 0) {
    animate.value = false; phase.value = 2
    resetBlocks(step.value >= 2); released.value = step.value >= 3
    filled.value = step.value >= 4 ? paperCount : 0
    papersHidden.value = step.value >= 4
    if (step.value >= 5) { t5start = 0; raf = requestAnimationFrame(tick) }
    return
  }
  animate.value = false
  phase.value = 0
  resetBlocks(false); released.value = false; filled.value = 0; papersHidden.value = false
  later(550, () => { animate.value = true; phase.value = 1 })
  later(2200, () => { phase.value = 2 })
}, { immediate: true })

watch(step, (s, prev) => {
  if (!active.value) return
  clearTimers()
  if (s < 2) { resetBlocks(false); released.value = false }
  if (s === 2) {
    resetBlocks(false); released.value = false
    ;[0.25, 1.05, 1.85].forEach((t, i) => {
      later(t * 1000, () => { const f = [...falling.value]; f[i] = true; falling.value = f })
      later(t * 1000 + 450, () => { landed.value = i + 1 })
    })
  }
  if (s === 3) {
    if (prev !== 2) resetBlocks(true)
    released.value = false
    later(1250, () => { released.value = true })
  }
  if (s >= 4) released.value = true
  if (s >= 4 && (prev ?? 0) < 4) flyIn()
  if (s < 4) { cancelFly(); filled.value = 0; papersHidden.value = false }
  cancelAnimationFrame(raf)
  if (s >= 5) { t5start = 0; raf = requestAnimationFrame(tick) }
})
onBeforeUnmount(() => { clearTimers(); cancelAnimationFrame(raf) })
</script>

<template>
  <div class="stage" :class="{ settled: phase >= 1 }">
    <h2 class="display heading">
      <span v-for="(t, i) in titles" :key="t" :class="{ on: titleIdx === i }">{{ t }}</span>
    </h2>

    <div v-for="(ic, i) in icons" :key="i" class="icon fade-color" :style="iconStyle(i)">
      <div class="turn" :style="ic.kind === 'bacterium' ? facing(i) : undefined">
        <svg viewBox="-30 -30 60 60" class="bob" :style="{ animationDelay: `${-i * 0.7}s` }">
          <g v-if="ic.kind === 'virus'" class="virus">
            <g v-for="k in 8" :key="k" :transform="`rotate(${k * 45})`"><line x1="0" y1="-14" x2="0" y2="-22" /><circle cx="0" cy="-23" r="3" /></g>
            <circle r="14" /><circle cx="-4" cy="-5" r="3.5" class="shine" />
          </g>
          <g v-else-if="ic.kind === 'bacterium'" class="bacterium">
            <path d="M18 0 q5 -6 9 0 t9 0 t9 0" class="tail">
              <animate attributeName="d" dur=".55s" repeatCount="indefinite" values="M18 0 q5 -6 9 0 t9 0 t9 0;M18 0 q5 6 9 0 t9 0 t9 0;M18 0 q5 -6 9 0 t9 0 t9 0" />
            </path>
            <rect x="-20" y="-9" width="40" height="18" rx="9" />
            <rect x="-14" y="-5" width="18" height="3" rx="1.5" class="shine" />
            <circle cx="-6" cy="3" r="2.2" class="bdot" /><circle cx="6" cy="2" r="1.8" class="bdot" />
          </g>
          <g v-else class="cell">
            <circle r="17" /><circle cx="3" cy="-2" r="6.5" class="nucleus" />
          </g>
        </svg>
      </div>
    </div>

    <div class="ground" />

    <div class="bar" :class="{ on: step >= 1 }">
      <p>Ready to start the study</p>
      <div class="track"><div class="barfill" :class="{ stuck: step >= 1 && step < 4 }" :style="{ width: `${barFill}%` }" /></div>
    </div>

    <svg class="links" viewBox="0 0 1280 720">
      <template v-if="step >= 5">
        <path v-for="l in links" :key="l.i" :d="l.d" class="link" :style="{ animationDelay: `${0.4 + l.i * 0.15}s, 0s` }" />
        <g v-for="m in minis" :key="m.key" :transform="`translate(${m.x} ${m.y})`" :opacity="m.o" class="mini" :class="{ back: m.back }">
          <rect x="-8" y="-10" width="16" height="20" rx="2" />
          <path d="M-4 -4 h8 M-4 0 h8 M-4 4 h5" />
        </g>
      </template>
    </svg>

    <div class="stand">
      <div class="pillar-clip fade-color">
        <svg viewBox="0 0 170 160" class="pillar" :class="{ down: phase >= 1, anim: animate }">
          <defs>
            <linearGradient id="shaftShade4" x1="0" x2="1">
              <stop offset="0" stop-color="#FFFFFF" /><stop offset=".6" stop-color="#F4F7FC" /><stop offset="1" stop-color="#DFE6F2" />
            </linearGradient>
          </defs>
          <rect x="6" y="0" width="158" height="16" rx="3" class="cap" />
          <rect x="20" y="16" width="130" height="10" class="cap2" />
          <rect x="30" y="26" width="110" height="110" fill="url(#shaftShade4)" class="shaft" />
          <line v-for="k in 4" :key="k" :x1="30 + k * 22" y1="32" :x2="30 + k * 22" y2="130" class="flute" />
          <rect x="16" y="136" width="138" height="10" class="cap2" />
          <rect x="4" y="146" width="162" height="14" rx="3" class="cap" />
        </svg>
      </div>
    </div>

    <div class="folder" :class="{ on: step >= 4, hub: step >= 5 }">
      <svg :ref="el => (folderEls[0] = el as Element)" viewBox="0 0 240 190" class="fsvg">
        <path d="M10 30 Q10 20 20 20 H88 L104 36 H220 Q230 36 230 46 V172 Q230 182 220 182 H20 Q10 182 10 172 Z" class="back" />
        <g v-for="(sh, k) in sheets.slice(0, filled)" :key="k" :transform="`translate(${sh.fx} ${sh.fy}) scale(${SHEET_SCALE * S})`" class="inner">
          <rect x="0" y="0" width="58" height="72" rx="3" />
          <line x1="9" y1="14" x2="49" y2="14" /><line x1="9" y1="25" x2="49" y2="25" />
        </g>
      </svg>
    </div>

    <div class="hero" :style="heroStyle">
      <div class="glow" :class="{ on: step === 1 }" />
      <div class="load" :style="{ transform: `scaleY(${squash})` }">
        <Person
          class="fade-color" :mood="mood" :pose="pose" :sweat="sweat" uid="pi"
          :class="{ react: step >= 5 }" :style="{ animationDelay: reactDelay(4) }"
        />
      </div>
      <div class="tower" :style="{ transform: `translateY(${towerDrop}px)` }">
        <div
          v-for="(b, i) in blocks" :key="b.name" class="block" :class="[b.kind, { thud: landed > i && step === 2 }]"
          :style="{ top: `${b.top}px`, ...blockStyle(i) }"
        >
          <span class="tile">
            <svg v-if="b.kind === 'org'" viewBox="0 0 32 32">
              <rect x="4" y="6" width="24" height="22" rx="3" class="w" /><path d="M4 12 h24 M10 3 v6 M22 3 v6" class="w" />
              <rect x="8" y="15" width="10" height="3" rx="1.5" class="wf" /><rect x="12" y="20" width="12" height="3" rx="1.5" class="wf" />
            </svg>
            <svg v-else-if="b.kind === 'fund'" viewBox="0 0 32 32">
              <ellipse cx="13" cy="24" rx="9" ry="3.5" class="w" /><ellipse cx="13" cy="19" rx="9" ry="3.5" class="w" /><ellipse cx="13" cy="14" rx="9" ry="3.5" class="w" />
              <circle cx="23" cy="10" r="6.5" class="wfc" /><path d="M25.5 7.5 a3.5 3.5 0 1 0 0 5 M19.5 9.3 h4.5 M19.5 11 h4.5" class="o" />
            </svg>
            <svg v-else viewBox="0 0 32 32">
              <path d="M7 3 h13 l6 6 v20 h-19 z" class="w" />
              <rect x="11.5" y="16" width="10" height="8" rx="1.5" class="wf" /><path d="M13.5 16 v-2.5 a3 3 0 0 1 6 0 v2.5" class="w" />
            </svg>
          </span>
          <span class="txt"><b>{{ b.name }}</b><small>{{ b.sub }}</small></span>
        </div>
      </div>
      <div class="pi-tag" :class="{ on: step >= 5 }">Principal investigator</div>
    </div>
    <span class="qmark" :class="{ off: phase >= 1 }">?</span>

    <div class="bubble" :class="{ on: phase >= 2 && step <= 1 }">
      <svg viewBox="0 0 40 48" class="flask">
        <path d="M14 4 h12 v12 l11 22 a4 4 0 0 1 -3.6 6 h-26.8 a4 4 0 0 1 -3.6 -6 l11 -22 z" class="glass" />
        <path d="M8.5 32 h23 l3.5 7 a3 3 0 0 1 -2.7 4 h-24.6 a3 3 0 0 1 -2.7 -4 z" class="liquid" />
        <circle cx="17" cy="36" r="2" class="bub" /><circle cx="24" cy="38" r="1.5" class="bub" />
      </svg>
      <span>New treatment</span>
      <i class="tail t1" /><i class="tail t2" />
    </div>

    <div
      v-for="(r, i) in roles" :key="r.name" class="role" :class="{ on: step >= 5 }"
      :style="{ left: `${r.x}px`, top: `${r.y}px`, '--d': `${0.25 + i * 0.22}s` }"
    >
      <div class="role-fig" :class="{ react: step >= 5 }" :style="{ animationDelay: reactDelay(i) }">
        <Person v-bind="r.cfg" :pose="r.pose" mood="neutral" :uid="`r${i}`" :phase="i * 0.45" />
        <span class="tick" :style="{ animationDelay: reactDelay(i) }">✓</span>
      </div>
      <p>{{ r.name }}</p>
    </div>

    <div class="stand paper-stand">
      <svg viewBox="-20 0 200 300" class="papers">
        <g v-for="i in paperCount" :key="i" :ref="el => (paperEls[i - 1] = el as Element)" class="paper" :style="paperStyle(i - 1)">
          <rect x="0" y="0" width="58" height="72" rx="3" />
          <line x1="9" y1="14" x2="49" y2="14" /><line x1="9" y1="25" x2="49" y2="25" />
          <line x1="9" y1="36" x2="40" y2="36" /><line x1="9" y1="47" x2="46" y2="47" />
        </g>
      </svg>
    </div>

    <div class="folder front-layer" :class="{ on: step >= 4, hub: step >= 5 }">
      <svg :ref="el => (folderEls[1] = el as Element)" viewBox="0 0 240 190" class="fsvg">
        <path d="M6 70 Q6 60 16 60 H224 Q234 60 234 70 V172 Q234 182 224 182 H16 Q6 182 6 172 Z" class="front" />
        <text x="120" y="130" text-anchor="middle" class="flabel">Study dossier</text>
      </svg>
    </div>

    <div class="docs">
      <div
        v-for="(d, i) in docs" :key="d.name" class="doc"
        :class="{ on: step === 4, gone: step >= 5 }"
        :style="{ '--d': `${2.05 + i * 0.5}s`, '--i': i }"
      >
        <svg viewBox="0 0 32 32" class="dicon">
          <path d="M7 3 h13 l6 6 v20 h-19 z" class="paperbg" />
          <template v-if="d.icon === 'protocol'"><path d="M11 13 h10 M11 17 h10 M11 21 h7" class="ln" /><rect x="11" y="1.5" width="10" height="4" rx="1.5" class="clip" /></template>
          <template v-else-if="d.icon === 'consent'"><path d="M11 13 h10 M11 17 h8" class="ln" /><path d="M10 24 q3 -4 5 0 t5 -1" class="sign" /></template>
          <template v-else-if="d.icon === 'info'"><circle cx="16.5" cy="18" r="6" class="infoc" /><path d="M16.5 17 v4" class="infoi" /><circle cx="16.5" cy="14.8" r=".9" fill="#FFFFFF" /></template>
          <template v-else><path d="M11 13 h10 M11 17 h7" class="ln" /><circle cx="19" cy="23" r="4.2" class="stampc" /></template>
        </svg>
        <span>{{ d.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 8; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .5s ease, transform .5s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .3s; }
.heading span:first-child { position: relative; }

.fade-color { filter: saturate(.15) brightness(.96); transition: filter 1s ease .6s; }
.settled .fade-color { filter: none; }

.icon { position: absolute; left: -30px; top: -30px; width: 60px; height: 60px; }
.turn { width: 100%; height: 100%; transition: transform .45s ease .3s; }
.bob { width: 100%; height: 100%; overflow: visible; animation: bob 4.2s ease-in-out infinite; }
@keyframes bob { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-8px) rotate(6deg); } }
.virus circle { fill: #FFE6D2; stroke: #F47B20; stroke-width: 2.2; }
.virus line { stroke: #F47B20; stroke-width: 2.2; stroke-linecap: round; }
.shine { fill: #FFFFFF !important; stroke: none !important; opacity: .85; }
.bacterium rect { fill: #DDE8FB; stroke: #1F5FD6; stroke-width: 2.2; }
.bacterium .tail { fill: none; stroke: #1F5FD6; stroke-width: 2; stroke-linecap: round; }
.bacterium .bdot { fill: #1F5FD6; }
.cell circle { fill: #EEF2F8; stroke: #0B2A5B; stroke-width: 2; }
.cell .nucleus { fill: #9DB8EC; stroke: #1F5FD6; }

.ground { position: absolute; left: 180px; right: 180px; top: 650px; height: 2px; background: linear-gradient(90deg, transparent, #D5DCE8 20%, #D5DCE8 80%, transparent); }

.stand { position: absolute; inset: 0; transform: scale(1.22); transform-origin: 640px 650px; pointer-events: none; }
.pillar-clip { position: absolute; left: 555px; top: 490px; width: 170px; height: 160px; overflow: hidden; }
.pillar { width: 170px; height: 160px; transform: none; }
.pillar.anim { transition: transform 1s cubic-bezier(.6, 0, .4, 1) .55s; }
.pillar.down { transform: translateY(100%); }
.pillar .cap { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 2.5; }
.pillar .cap2 { fill: #EEF2F8; stroke: #0B2A5B; stroke-width: 2.5; }
.pillar .shaft { stroke: #0B2A5B; stroke-width: 2.5; }
.pillar .flute { stroke: #CDD6E4; stroke-width: 2; }

.hero { position: absolute; left: 0; top: 0; width: 180px; height: 304px; transform-origin: 0 0; z-index: 3; }
.load { width: 100%; height: 100%; transform-origin: 50% 95%; transition: transform .35s cubic-bezier(.3, 1.6, .5, 1); }
.load > * { width: 100%; height: 100%; }
.tower { position: absolute; left: 0; top: 0; width: 180px; transition: transform .35s cubic-bezier(.3, 1.6, .5, 1); }
.block { position: absolute; left: -28px; width: 236px; height: 60px; display: flex; align-items: center; gap: 10px; padding: 0 12px 0 8px; box-sizing: border-box;
  border: 2px solid #0B2A5B; border-radius: 12px; background: #FFFFFF; transform-origin: 50% 100%; }
.block.org { background: #EEF3FD; box-shadow: 0 6px 0 #16479F; }
.block.fund { background: #FFF1E6; box-shadow: 0 6px 0 #C55A0E; }
.block.priv { background: #EDF0F6; box-shadow: 0 6px 0 #061A3A; }
.block.thud { animation: thud .35s ease-out; }
@keyframes thud { 0% { scale: 1 1; } 35% { scale: 1.04 .86; } 100% { scale: 1 1; } }
.tile { width: 42px; height: 42px; flex: none; border-radius: 10px; display: grid; place-items: center; }
.org .tile { background: #1F5FD6; }
.fund .tile { background: #F47B20; }
.priv .tile { background: #0B2A5B; }
.tile svg { width: 28px; height: 28px; }
.tile .w { fill: none; stroke: #FFFFFF; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.tile .wf { fill: #FFFFFF; }
.tile .wfc { fill: #FFFFFF; }
.tile .o { fill: none; stroke: #F47B20; stroke-width: 1.8; stroke-linecap: round; }
.txt { display: flex; flex-direction: column; line-height: 1.15; color: var(--ink); white-space: nowrap; }
.txt b { font-size: 18px; font-weight: 700; }
.txt small { font-size: 12.5px; color: var(--mist); }

.glow { position: absolute; left: -40px; top: -60px; width: 260px; height: 260px; border-radius: 50%; opacity: 0; pointer-events: none;
  background: radial-gradient(closest-side, rgba(31,95,214,.35), rgba(31,95,214,.1) 50%, rgba(31,95,214,0)); }
.glow.on { animation: glow 1.6s ease-out forwards; }
@keyframes glow { 0% { opacity: 0; transform: scale(.5); } 40% { opacity: 1; transform: scale(1.05); } 100% { opacity: .35; transform: scale(1); } }
.pi-tag { position: absolute; left: 50%; top: 300px; transform: translateX(-50%) scale(.4); opacity: 0; white-space: nowrap;
  font-size: 17px; font-weight: 600; color: var(--ink); background: #FFFFFF; border: 2px solid #F47B20; border-radius: 999px; padding: 4px 14px;
  transition: opacity .3s ease .15s, transform .5s cubic-bezier(.2, 1.6, .4, 1) .15s; }
.pi-tag.on { opacity: 1; transform: translateX(-50%) scale(1); }
.qmark { position: absolute; left: 701px; top: 87px; font-family: var(--font-display); font-weight: 800; font-size: 66px; line-height: 1; color: #F47B20; transform: rotate(-4deg); z-index: 4; transition: opacity .4s ease, transform .4s ease; }
.qmark.off { opacity: 0; transform: scale(.4); }

.bubble { position: absolute; left: 392px; top: 250px; display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: #FFFFFF; border: 2.5px solid #0B2A5B; border-radius: 22px;
  font-family: var(--font-display); font-weight: 600; font-size: 24px; color: var(--ink); opacity: 0; transform: scale(.3); transform-origin: 10% 100%;
  transition: opacity .3s ease, transform .5s cubic-bezier(.2, 1.5, .4, 1); z-index: 4; }
.bubble.on { opacity: 1; transform: none; }
.bubble .tail { position: absolute; border: 2.5px solid #0B2A5B; background: #FFFFFF; border-radius: 50%; }
.bubble .t1 { width: 16px; height: 16px; left: 14px; bottom: -24px; }
.bubble .t2 { width: 9px; height: 9px; left: 2px; bottom: -40px; }
.flask { width: 34px; height: 40px; }
.flask .glass { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2.4; stroke-linejoin: round; }
.flask .liquid { fill: #1F5FD6; opacity: .85; }
.flask .bub { fill: #FFFFFF; animation: rise 1.6s ease-in infinite; }
@keyframes rise { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-14px); opacity: 0; } }

.bar { position: absolute; left: 72px; top: 104px; width: 380px; opacity: 0; transform: translateY(-8px); transition: opacity .5s ease, transform .5s ease; }
.bar.on { opacity: 1; transform: none; }
.bar p { margin: 0 0 8px; font-size: 16px; font-weight: 500; color: var(--mist); }
.track { height: 12px; border-radius: 6px; background: #E8EDF5; overflow: hidden; }
.barfill { height: 100%; border-radius: 6px; background: linear-gradient(90deg, #1F5FD6, #4F8BF5); transition: width 1.2s cubic-bezier(.5, 0, .3, 1) .6s; }
.barfill.stuck { animation: stuck .35s ease-in-out 1.8s 2; }
@keyframes stuck { 0%, 100% { transform: translateX(0); } 30% { transform: translateX(3px); } 70% { transform: translateX(-2px); } }

.folder { position: absolute; left: 700px; top: 258px; width: 240px; height: 190px; opacity: 0; transform: scale(.5) translateY(30px); z-index: 1;
  transition: opacity .35s ease, transform .55s cubic-bezier(.2, 1.4, .4, 1); pointer-events: none; }
.folder.front-layer { z-index: 6; }
.folder.on { opacity: 1; transform: none; }
.folder.on.hub { transform: translate(60px, 20px); transition: transform .9s cubic-bezier(.6, 0, .3, 1) .2s; }
.fsvg { width: 100%; height: 100%; overflow: visible; transform-origin: 50% 100%; }
.folder .back { fill: #FFC08F; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.folder .front { fill: #F47B20; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.inner rect { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; }
.inner line { stroke: #C9D2E0; stroke-width: 3; stroke-linecap: round; }
.flabel { font-family: var(--font-display); font-weight: 700; font-size: 22px; fill: #FFFFFF; }

.docs { position: absolute; left: 972px; top: 214px; width: 250px; display: grid; gap: 12px; z-index: 7; }
.doc { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: #FFFFFF; border: 1.5px solid #E1E6EF; border-radius: 12px; box-shadow: 0 4px 14px rgba(11, 42, 91, .06);
  font-size: 17px; font-weight: 500; line-height: 1.2; color: var(--ink); opacity: 0; transform: translateX(-60px) scale(.8);
  transition: opacity .35s ease var(--d), transform .55s cubic-bezier(.2, 1.3, .4, 1) var(--d); }
.doc.on { opacity: 1; transform: none; }
.doc.gone { opacity: 0; transform: translate(-150px, calc(130px - var(--i) * 72px)) scale(.3); transition: opacity .3s ease calc(var(--i) * .06s + .25s), transform .55s ease-in calc(var(--i) * .06s); }
.dicon { width: 34px; height: 34px; flex: none; }
.paperbg { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 1.8; stroke-linejoin: round; }
.ln { stroke: #9DB0D3; stroke-width: 1.8; stroke-linecap: round; }
.clip { fill: #1F5FD6; }
.sign { fill: none; stroke: #F47B20; stroke-width: 1.8; stroke-linecap: round; }
.infoc { fill: #1F5FD6; }
.infoi { stroke: #FFFFFF; stroke-width: 2; stroke-linecap: round; }
.stampc { fill: none; stroke: #F47B20; stroke-width: 2; }

.role { position: absolute; width: 130px; opacity: 0; transform: scale(.2); transform-origin: 50% 90%;
  transition: opacity .25s ease var(--d), transform .6s cubic-bezier(.2, 1.6, .4, 1) var(--d); z-index: 2; }
.role.on { opacity: 1; transform: none; }
.role-fig { position: relative; width: 130px; height: 220px; }
.role p { margin: 4px 0 0; width: 220px; margin-left: -45px; text-align: center; font-size: 16px; font-weight: 600; color: var(--ink); }

.react { animation: hop 3.2s ease-out infinite; transform-origin: 50% 100%; }
@keyframes hop { 0% { transform: none; } 4% { transform: translateY(-7px) scale(1.02, .99); } 9% { transform: none; } 100% { transform: none; } }
.tick { position: absolute; right: 6px; top: -6px; width: 26px; height: 26px; border-radius: 50%; background: #1F5FD6; color: #FFFFFF; font-size: 15px; font-weight: 700;
  display: grid; place-items: center; opacity: 0; }
.role.on .tick { animation: tick 3.2s ease-out infinite; }
@keyframes tick { 0% { opacity: 0; transform: scale(.4); } 4% { opacity: 1; transform: scale(1.1); } 8%, 22% { opacity: 1; transform: scale(1); } 30%, 100% { opacity: 0; transform: scale(.9); } }

.links { position: absolute; inset: 0; width: 1280px; height: 720px; pointer-events: none; z-index: 0; }
.link { fill: none; stroke: #9DB8EC; stroke-width: 2.5; stroke-dasharray: 8 8; opacity: 0; animation: linkIn .5s ease forwards, flow 1.2s linear infinite; }
@keyframes linkIn { to { opacity: 1; } }
@keyframes flow { to { stroke-dashoffset: -16; } }
.mini rect { fill: #FFFFFF; stroke: #1F5FD6; stroke-width: 1.8; }
.mini path { stroke: #9DB8EC; stroke-width: 1.4; }
.mini.back rect { stroke: #F47B20; }
.mini.back path { stroke: #FFC08F; }

.paper-stand { z-index: 5; }
.papers { position: absolute; left: 540px; top: 201px; width: 200px; height: 300px; overflow: visible; }
.paper rect { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; }
.paper line { stroke: #C9D2E0; stroke-width: 3; stroke-linecap: round; }
</style>
