<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const props = defineProps<{ frozen?: boolean, ns?: string }>()
const idp = (props.frozen ? 'd10f' : 'd10') + (props.ns ?? '')
const { $clicks } = useSlideContext()
const step = computed(() => props.frozen ? 4 : unref($clicks) as number)

const active = useIsSlideActive()
const phase = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }
watch(active, (a) => {
  clearTimers()
  if (props.frozen) { phase.value = 99; return }
  if (!a) { phase.value = 0; return }
  if (step.value > 0) { phase.value = 99; return }
  phase.value = 0
  const seq: [number, number][] = [[500, 1], [1250, 2], [1800, 3], [2500, 4], [3400, 5], [4400, 6], [5000, 7], [5200, 8], [6100, 9]]
  seq.forEach(([ms, p]) => later(ms, () => { phase.value = p }))
}, { immediate: true })
watch(step, () => { if (phase.value === 99) phase.value = 9 })
const ph = computed(() => phase.value === 99 ? 9 : phase.value)

const botState = computed(() => {
  const p = ph.value
  if (p <= 1) return 'here'
  if (p === 2) return 'out'
  if (p <= 4) return 'away'
  if (p <= 6) return 'in'
  return 'gone'
})

const exploded = ref(false)

const working = ref(false)
const seq: ReturnType<typeof setTimeout>[] = []
const at = (ms: number, fn: () => void) => seq.push(setTimeout(fn, ms))
watch(step, (s, prev) => {
  seq.splice(0).forEach(clearTimeout)
  exploded.value = false
  working.value = false
  if (s === 1 && prev === 0) { at(500, () => { exploded.value = true }); at(2100, () => { exploded.value = false }) }
  if (s === 4 && prev === 3) { at(2000, () => { working.value = true }); at(4100, () => { working.value = false }) }
})
onBeforeUnmount(() => { clearTimers(); seq.forEach(clearTimeout) })

const corona = Array.from({ length: 46 }, (_, i) => {
  const a = (i / 46) * Math.PI * 2 + ((i * 7) % 5) * 0.02
  const r = 152 + ((i * 13) % 7)
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: 3 + ((i * 11) % 6), c: i % 3 === 0 ? '#FFD23F' : i % 3 === 1 ? '#F47B20' : '#FFB12E', rot: (a * 180) / Math.PI }
})
const spots = [
  { x: -62, y: -64, r: 26 }, { x: 70, y: -48, r: 22 }, { x: -96, y: 30, r: 15 }, { x: 34, y: 66, r: 30 },
  { x: 92, y: 52, r: 18 }, { x: -40, y: 96, r: 16 }, { x: 8, y: -110, r: 12 },
]

const projects = [
  { name: 'POGE', ev: 'SFSF' },
  { name: 'FORZA', ev: 'SFSFSFS' },
  { name: 'PEDIGREE', ev: 'SFSFSSF' },
  { name: 'SCA7', ev: 'SFSF' },
  { name: 'Special MS Covid', ev: 'SFSFS' },
]
const TL_X = 270, TL_W = 900, ROW0 = 112, ROW_H = 34
const timeline = projects.map((p, r) => {
  const start = TL_X + 30 + r * 36
  const span = TL_W - 60 - r * 36
  const n = p.ev.length
  return {
    ...p,
    y: ROW0 + r * ROW_H,
    events: p.ev.split('').map((t, i) => {
      const x = start + (n === 1 ? 0 : (i * span) / (n - 1))
      return { t, x, d: 0.35 + ((x - TL_X) / TL_W) * 1.6 }
    }),
  }
})

const GATHER = { x: 470, y: 380 }

const BINDER = { x: 1088, y: 66 }
const fbFly = timeline.flatMap(p => p.events.filter(e => e.t === 'F').map(e => ({ x: e.x, y: p.y + 15, d: e.d + 0.35 })))
const LENS0 = 2.3, LENS_T = 1.5
const lensFly = timeline.flatMap(p => p.events.filter(e => e.t === 'S').map(e => ({ x: e.x, y: p.y + 15, d: LENS0 + ((e.x - 270) / 900) * LENS_T + 0.1 })))
const refCount = ref(0)
let raf = 0
function countTo(target: number, from: number, ms: number, delay: number) {
  const t0 = performance.now() + delay
  const tick = (t: number) => {
    const k = Math.min(1, Math.max(0, (t - t0) / ms))
    refCount.value = Math.round(from + (target - from) * (1 - (1 - k) ** 2))
    if (k < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}
watch([step, phase], ([s], old) => {
  cancelAnimationFrame(raf)
  const prev = old?.[0]
  if (s < 3) { refCount.value = 0; return }
  if (s === 3 && prev === 2 && phase.value !== 99) {
    refCount.value = 0
    countTo(318, 0, 1700, 700)
    setTimeout(() => countTo(602, 318, LENS_T * 1000 + 300, 0), (LENS0 + 0.2) * 1000)
  }
  else refCount.value = 602
}, { immediate: true })
onBeforeUnmount(() => cancelAnimationFrame(raf))

const flying = timeline.flatMap(p => p.events.filter(e => e.t === 'S').map(e => ({ x: e.x, y: p.y + 15 })))
const stacks = [
  { x: 1124, y: 524, eye: { x: 1000, y: 345 }, rx: 1118, ry: 418 },
  { x: 388, y: 524, eye: null, rx: 382, ry: 412 },
  { x: 754, y: 524, eye: { x: 640, y: 439 }, rx: 754, ry: 418 },
]
</script>

<template>
  <div class="stage" :class="[`e${ph}`, { z1: step === 1, z2: step === 2, z3: step >= 3, z4: step >= 4, zstill: phase === 99, zbusy: working }]">

    <AssistantSlide frozen class="old" />

    <h2 class="display heading">
      <span :class="{ on: ph === 0 }">A Contextual Assistant</span>
      <span :class="{ on: ph >= 1 && step === 0 }">Three Configurations</span>
      <span :class="{ on: step === 1 }">With and Without the Harness</span>
      <span :class="{ on: step === 2 }">Against the State of the Art</span>
      <span :class="{ on: step >= 3 }">Same Material, Same Task</span>
    </h2>

    <div class="podium pl" /><div class="podium pc" /><div class="podium pr" />
    <p class="plab l1">DossierCheck + GPT-4o</p>
    <p class="plab l2">GPT-4o <span>used directly</span></p>
    <p class="plab l3">GPT-5.6 Sol <span>used directly</span></p>

    <div class="gwrap">
      <svg viewBox="-80 -70 160 160" class="gsvg">
        <ellipse cx="0" cy="84" rx="40" ry="6" class="gshd" />
        <path d="M-34 62 H34 L40 84 H-40 Z" class="ped" />
        <g class="gcore">
          <circle r="38" class="halo" />
          <circle r="30" class="corec" />
          <text y="5" text-anchor="middle" class="coret">GPT-4o</text>
        </g>
      </svg>
    </div>

    <div class="swrap">
      <svg viewBox="-200 -200 400 400" class="ssvg">
        <defs>
          <radialGradient :id="`${idp}-sun`" cx="40%" cy="38%" r="70%">
            <stop offset="0" stop-color="#FFE873" />
            <stop offset=".45" stop-color="#FFC233" />
            <stop offset=".8" stop-color="#FF9A1F" />
            <stop offset="1" stop-color="#F06416" />
          </radialGradient>
          <radialGradient :id="`${idp}-glow`">
            <stop offset=".6" stop-color="#FFB12E" stop-opacity=".45" />
            <stop offset="1" stop-color="#FFB12E" stop-opacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="0" cy="190" rx="120" ry="12" class="sshd" />
        <circle r="196" :fill="`url(#${idp}-glow)`" class="sglow" />
        <g class="corona">
          <g v-for="(c, i) in corona" :key="i" :transform="`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${(c.rot + 90).toFixed(0)})`">
            <path :d="`M${-c.s} 0 A${c.s} ${c.s} 0 0 1 ${c.s} 0 A${c.s * 0.7} ${c.s * 0.55} 0 0 0 ${-c.s} 0 Z`" :fill="c.c" />
          </g>
        </g>
        <circle r="150" :fill="`url(#${idp}-sun)`" class="sbody" />
        <path d="M-138 -40 A146 146 0 0 1 40 -142" class="srim" />
        <circle r="150" class="sedge" />
        <g class="spots">
          <g v-for="(sp, i) in spots" :key="i" :transform="`translate(${sp.x} ${sp.y})`">
            <circle :r="sp.r" class="sp1" /><circle :r="sp.r * 0.62" class="sp2" /><circle :r="sp.r * 0.28" class="sp3" />
          </g>
          <circle cx="-88" cy="74" r="20" class="hot" /><circle cx="-88" cy="74" r="9" class="hot2" />
          <circle cx="58" cy="10" r="46" class="ringl" /><circle cx="-70" cy="-14" r="30" class="ringl" />
        </g>
        <g class="flares">
          <path d="M-120 -150 Q-170 -190 -205 -140" /><path d="M150 -120 Q205 -150 210 -90" /><path d="M170 110 Q215 150 175 190" /><path d="M-175 90 Q-225 120 -200 175" />
        </g>
        <path d="M-66 -54 L-26 -40 M66 -54 L26 -40" class="sbrow" />
        <path d="M-34 34 Q0 58 34 34" class="smouth" />
        <g class="seyes">
          <g class="se"><ellipse cx="-42" cy="-18" rx="13" ry="19" class="eyeS" /><circle cx="-38" cy="-24" r="4.5" class="eyeH" /></g>
          <g class="se"><ellipse cx="42" cy="-18" rx="13" ry="19" class="eyeS" /><circle cx="46" cy="-24" r="4.5" class="eyeH" /></g>
        </g>
      </svg>
    </div>

    <div class="mwrap">
      <Mecha :asm="ph >= 6" :head="ph >= 7" :core="ph >= 8 ? 'chest' : 'head'" :exploded="exploded" :glow="step === 1" :work="working" />
    </div>

    <div class="bot" :class="`b-${botState}`">
      <svg viewBox="-60 -60 120 150" class="botsvg">
        <g class="barm l"><rect x="-31" y="22" width="13" height="34" rx="6.5" class="gold" /><circle cx="-24.5" cy="59" r="6.5" class="navy" /></g>
        <g class="barm r"><rect x="18" y="22" width="13" height="34" rx="6.5" class="gold" /><circle cx="24.5" cy="59" r="6.5" class="navy" /></g>
        <path d="M-30 -20 Q-44 -44 -30 -52 Q-18 -42 -14 -30 Z" class="ear" /><path d="M30 -20 Q44 -44 30 -52 Q18 -42 14 -30 Z" class="ear" />
        <path d="M-42 4 Q-44 30 0 32 Q44 30 42 4 Q40 -4 0 -4 Q-40 -4 -42 4 Z" class="gold" />
        <path d="M-34 8 Q-36 -36 0 -36 Q36 -36 34 8 Q0 14 -34 8 Z" class="visor" />
        <path d="M-35 8 Q0 15 35 8" class="rim" />
        <rect x="-11" y="-42" width="22" height="6" rx="3" class="topl" />
        <ellipse cx="-12" cy="-10" rx="5" ry="7" class="eyeb" /><ellipse cx="12" cy="-10" rx="5" ry="7" class="eyeb" />
        <path d="M-6 2 q3 4 6 0 q3 4 6 0" class="mouth" />
        <text y="23" text-anchor="middle" class="htag">GPT-4o</text>
      </svg>
    </div>

    <div class="vs"><span>VS</span></div>

    <p class="cmpsub cs1">Same model: the harness is the only difference</p>
    <p class="cmpsub cs2">How does the harness compare with a much larger model?</p>
    <div class="cmpcap k1a"><b>DossierCheck + GPT-4o</b><span>rules, requirements and output checks guide the model</span></div>
    <div class="cmpcap k1b"><b>GPT-4o used directly</b><span>decides on its own what to read and when to stop</span></div>
    <div class="cmpcap k2a"><b>DossierCheck + GPT-4o</b><span>smaller model + harness</span></div>
    <div class="cmpcap k2b"><b>GPT-5.6 Sol used directly</b><span>much larger model, no harness</span></div>
    <span class="hchip hx1">Output checks</span><span class="hchip hx2">Requirements</span><span class="hchip hx3">Rules</span>
    <svg viewBox="0 0 1280 720" class="bolts">
      <path d="M640 250 L660 300 L646 304 L676 362" class="bolt b1" />
      <path d="M760 270 L742 318 L756 322 L728 380" class="bolt b2" />
    </svg>

    <div class="tl">
      <div v-for="(p, r) in timeline" :key="p.name" class="trow" :style="{ top: `${p.y}px`, '--r': `${r * 0.08}s` }">
        <span class="tname">{{ p.name }}</span>
        <i class="track" />
        <template v-for="(e, i) in p.events" :key="i">
          <span v-if="e.t === 'S'" class="ev sub" :style="{ left: `${e.x}px`, '--d': `${e.d}s` }"><i class="pkg" /><svg viewBox="0 0 16 20"><path d="M1 1 H11 L15 5 V19 H1 Z" /><path d="M4 9 h8 M4 13 h8" class="evl" /></svg></span>
          <span v-else class="ev fb" :style="{ left: `${e.x}px`, '--d': `${e.d}s` }"><svg viewBox="0 0 20 16"><path d="M2 2 H18 V11 H8 L4 15 V11 H2 Z" /></svg></span>
        </template>
      </div>
      <p class="legend"><span class="lg-s"><svg viewBox="0 0 16 20"><path d="M1 1 H11 L15 5 V19 H1 Z" /></svg>Submitted package</span><span class="lg-f"><svg viewBox="0 0 20 16"><path d="M2 2 H18 V11 H8 L4 15 V11 H2 Z" /></svg>Human feedback</span></p>
    </div>

    <div class="binder">
      <svg viewBox="0 0 40 44" class="bico"><rect x="6" y="2" width="30" height="40" rx="4" class="bb" /><rect x="2" y="8" width="8" height="5" rx="2" class="br" /><rect x="2" y="20" width="8" height="5" rx="2" class="br" /><rect x="2" y="32" width="8" height="5" rx="2" class="br" /><path d="M14 13 h16 M14 20 h16 M14 27 h11" class="bl" /></svg>
      <div><p class="bt">Ground Truth</p><p class="bn"><b>{{ refCount }}</b> problems</p></div>
      <p class="bsrc"><span class="sf">human feedback</span> + <span class="sm">manual inspection</span></p>
    </div>
    <i v-for="(f, k) in fbFly" :key="`fb${k}`" class="fbfly" :style="{ left: `${f.x - 9}px`, top: `${f.y - 7}px`, '--dx': `${BINDER.x - f.x}px`, '--dy': `${BINDER.y - f.y}px`, '--k': `${f.d}s` }"><svg viewBox="0 0 20 16"><path d="M2 2 H18 V11 H8 L4 15 V11 H2 Z" /></svg></i>
    <i v-for="(f, k) in lensFly" :key="`ld${k}`" class="ldot" :style="{ left: `${f.x - 5}px`, top: `${f.y - 5}px`, '--dx': `${BINDER.x - f.x}px`, '--dy': `${BINDER.y - f.y}px`, '--k': `${f.d}s` }" />
    <svg viewBox="0 0 60 60" class="lens3" :style="{ '--k': `${LENS0}s`, '--t': `${LENS_T}s` }"><circle cx="24" cy="24" r="16" /><line x1="36" y1="36" x2="54" y2="54" /></svg>

    <p class="task">Same packages, same task: find guideline issues and inconsistencies</p>

    <i v-for="(f, k) in flying" :key="`f${k}`" class="flypk" :style="{ left: `${f.x - 11}px`, top: `${f.y - 13}px`, '--dx': `${GATHER.x - f.x}px`, '--dy': `${GATHER.y - f.y}px`, '--k': `${(f.x - 270) / 900 * 0.5}s` }" />
    <div class="pile" :style="{ left: `${GATHER.x - 30}px`, top: `${GATHER.y - 34}px` }"><i /><i /><i /><i /></div>

    <div v-for="(t, k) in stacks" :key="`s${k}`" class="pile copy" :style="{ left: `${t.x - 30}px`, top: `${t.y - 34}px`, '--dx': `${GATHER.x - t.x}px`, '--dy': `${GATHER.y - t.y}px`, '--k': `${1.25 + k * 0.1}s` }">
      <i /><i /><i /><i /><span class="scanl" />
    </div>

    <svg viewBox="0 0 1280 720" class="beams4">
      <defs>
        <linearGradient :id="`${idp}-beam`" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4FB8FF" stop-opacity=".6" /><stop offset="1" stop-color="#4FB8FF" stop-opacity=".18" /></linearGradient>
        <linearGradient :id="`${idp}-sbeam`" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC233" stop-opacity=".65" /><stop offset="1" stop-color="#FFC233" stop-opacity=".2" /></linearGradient>
      </defs>
      <polygon :points="`${stacks[0].eye!.x - 6},${stacks[0].eye!.y} ${stacks[0].eye!.x + 6},${stacks[0].eye!.y} ${stacks[0].x + 30},${stacks[0].y - 34} ${stacks[0].x - 30},${stacks[0].y - 34}`" :fill="`url(#${idp}-beam)`" class="bm bm1" />
      <polygon :points="`${stacks[2].eye!.x - 20},${stacks[2].eye!.y} ${stacks[2].eye!.x + 20},${stacks[2].eye!.y} ${stacks[2].x + 30},${stacks[2].y - 34} ${stacks[2].x - 30},${stacks[2].y - 34}`" :fill="`url(#${idp}-sbeam)`" class="bm bm3" />
      <g class="readdots"><circle v-for="n in 5" :key="n" :cx="300" :cy="482" r="4" class="rd" :style="{ '--n': `${n * 0.18}s` }" /></g>
    </svg>

    <div v-for="(t, k) in stacks" :key="`r${k}`" class="rep4" :style="{ left: `${t.rx - 32}px`, top: `${t.ry - 23}px`, '--dy': `${t.y - t.ry}px`, '--k': `${4.2 + k * 0.18}s` }">
      <svg viewBox="0 0 64 46"><rect x="2" y="2" width="60" height="42" rx="4" class="eb" /><path d="M4 43 L27 24 M60 43 L37 24" class="el" /><path d="M3 4 L32 27 L61 4 Z" class="efl" /></svg>
      <b>?</b>
      <span>Report</span>
    </div>
  </div>
</template>

<style scoped>

.old :deep(.bot) { display: none; }
.old :deep(.chat), .old :deep(.who), .old :deep(.glabel), .old :deep(.ground), .old :deep(.links), .old :deep(.panel), .old :deep(.logo), .old :deep(.heading), .old :deep(.old) {
  transition: opacity .45s ease, transform .5s cubic-bezier(.5, 0, .7, .4) !important; }
.old :deep(.heading) { opacity: 0 !important; transition: none !important; }
.stage:not(.e0) .old :deep(.chat) { opacity: 0 !important; transform: translateY(30px) scale(.96) !important; }
.stage:not(.e0) .old :deep(.who), .stage:not(.e0) .old :deep(.glabel), .stage:not(.e0) .old :deep(.ground) { opacity: 0 !important; }
.stage:not(.e0) .old :deep(.panel), .stage:not(.e0) .old :deep(.logo) { opacity: 0 !important; transform: translateX(-40px) !important; }
.stage:not(.e0) .old :deep(.old) { opacity: 0 !important; }

.zstill, .zstill * { transition: none !important; }

.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 20; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .45s ease, transform .45s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .25s; }
.heading span:first-child { position: relative; transition: none; transform: none; }
.heading span:first-child:not(.on) { opacity: 0; transition: opacity .3s ease; }

.podium { position: absolute; top: 552px; height: 40px; box-sizing: border-box; border: 2.5px solid #0B2A5B; border-radius: 10px; background: linear-gradient(#F7F9FD, #E1E6EF); z-index: 2;
  opacity: 0; transform: translateY(30px); transition: opacity .4s ease, transform .5s cubic-bezier(.2, 1.4, .4, 1); }
.pl { left: 860px; width: 280px; } .pc { left: 220px; width: 160px; } .pr { left: 490px; width: 300px; }
.stage:is(.e3, .e4, .e5, .e6, .e7, .e8, .e9) .podium { opacity: 1; transform: none; }
.pc { transition-delay: .05s; } .pr { transition-delay: .12s; }
.z1 .podium, .z2 .podium { opacity: 0 !important; transform: translateY(20px) !important; transition-delay: 0s; }
.plab { position: absolute; top: 600px; margin: 0; text-align: center; font-family: var(--font-display); font-size: 19px; font-weight: 700; color: var(--ink); opacity: 0; transition: opacity .4s ease; z-index: 3; }
.plab span { display: block; font-family: var(--font-body, inherit); font-size: 13px; font-weight: 600; color: var(--mist); }
.l1 { left: 860px; width: 280px; } .l2 { left: 180px; width: 240px; } .l3 { left: 490px; width: 300px; }
.stage:is(.e3, .e4, .e5, .e6, .e7, .e8, .e9) .l2 { opacity: 1; transition-delay: .4s; }
.stage:is(.e4, .e5, .e6, .e7, .e8, .e9) .l3 { opacity: 1; transition-delay: .6s; }
.e9 .l1 { opacity: 1; }
.z1 .plab, .z2 .plab { opacity: 0 !important; transition-delay: 0s !important; }

.gwrap { position: absolute; left: 220px; top: 400px; width: 160px; height: 160px; z-index: 6; transform-origin: 80px 152px;
  opacity: 0; transform: scale(.3); transition: opacity .35s ease, transform .7s cubic-bezier(.2, 1.4, .4, 1); }
.stage:is(.e3, .e4, .e5, .e6, .e7, .e8, .e9) .gwrap { opacity: 1; transform: none; }
.z1 .gwrap { transform: translateX(130px) scale(1.6) !important; }
.z2 .gwrap { opacity: 0 !important; transform: scale(.5) !important; }
.z3 .gwrap { transform: scale(.85) !important; }
.gsvg { width: 100%; height: 100%; overflow: visible; }
.gshd { fill: #0B2A5B; opacity: .12; }
.ped { fill: #E1E6EF; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.gcore { animation: hover 2.8s ease-in-out infinite; }
@keyframes hover { 50% { transform: translateY(-6px); } }
.halo { fill: #7FD3FF; opacity: .35; transform-box: fill-box; transform-origin: center; animation: halo 1.6s ease-in-out infinite; }
@keyframes halo { 50% { transform: scale(1.18); opacity: .15; } }
.zbusy .halo { animation-duration: .5s; }
.corec { fill: #FFFFFF; stroke: #7FD3FF; stroke-width: 4; }
.coret { font-family: var(--font-display); font-size: 15px; font-weight: 800; fill: #0B2A5B; }

.swrap { position: absolute; left: 470px; top: 214px; width: 340px; height: 340px; z-index: 5; transform-origin: 170px 338px;
  opacity: 0; transform: translateY(-640px); }
.stage:is(.e4, .e5, .e6, .e7, .e8, .e9) .swrap { opacity: 1; transform: none; transition: transform .7s cubic-bezier(.6, 0, .9, .5), opacity .1s ease; }
.e4 .ssvg { animation: thud .5s ease-out .7s; }
@keyframes thud { 30% { transform: scaleY(.9) scaleX(1.06); } 60% { transform: scaleY(1.03); } }
.e4 .podium.pr { animation: shake .4s ease .7s; }
@keyframes shake { 25% { transform: translateY(4px); } 50% { transform: translateY(-2px); } 75% { transform: translateY(2px); } }
.z1 .swrap { opacity: 0 !important; transform: scale(.7) !important; transition: opacity .35s ease, transform .5s ease !important; }

.z2 .swrap { animation: grow 2.4s cubic-bezier(.5, 0, .2, 1) .2s both; }
@keyframes grow { 0% { opacity: 0; transform: translateX(-80px) scale(1.25); } 12% { opacity: 1; } 38% { transform: translateX(-80px) scale(1.25); } 100% { opacity: 1; transform: translateX(-93px) scale(1.45); } }
.zstill.z2 .swrap, .zstill.z2 .mwrap { animation-duration: 0s !important; animation-delay: 0s !important; }
.z3 .swrap { transform: scale(.62) !important; transition: transform .7s cubic-bezier(.5, 0, .3, 1), opacity .3s ease !important; }
.ssvg { width: 100%; height: 100%; overflow: visible; transform-origin: 50% 95%; }
.sshd { fill: #0B2A5B; opacity: .14; }
.sglow { transform-box: fill-box; transform-origin: center; animation: sglow 2.6s ease-in-out infinite; }
@keyframes sglow { 50% { transform: scale(1.06); opacity: .8; } }
.corona { animation: spinC 40s linear infinite; }
@keyframes spinC { to { transform: rotate(360deg); } }
.zbusy .corona { animation-duration: 12s; }
.sbody { stroke: none; }
.sedge { fill: none; stroke: #D9520F; stroke-width: 4; opacity: .55; }
.srim { fill: none; stroke: #FFF2A8; stroke-width: 6; stroke-linecap: round; opacity: .55; }
.sp1 { fill: #F47B20; opacity: .55; } .sp2 { fill: #E0531B; opacity: .6; } .sp3 { fill: #B53A10; opacity: .7; }
.hot { fill: #FFF4C2; opacity: .9; } .hot2 { fill: #F47B20; }
.ringl { fill: none; stroke: #FFE873; stroke-width: 4; opacity: .55; }
.seyes { transition: transform .5s ease; }
.se { transform-box: fill-box; transform-origin: center; animation: sblink 5s infinite 1s; }
@keyframes sblink { 0%, 94%, 100% { transform: scaleY(1); } 97% { transform: scaleY(.1); } }
.eyeS { fill: #0B2A5B; } .eyeH { fill: #FFFFFF; }
.z2 .seyes { transform: translate(22px, 14px); transition-delay: 1.4s; }

.sbrow, .smouth { fill: none; stroke: #0B2A5B; stroke-width: 8; stroke-linecap: round; opacity: 0; transition: opacity .3s ease .5s; }
.smouth { stroke-width: 6; }
.flares path { fill: none; stroke: #F47B20; stroke-width: 7; stroke-linecap: round; opacity: 0; }
@keyframes flare2 { 0% { opacity: 0; stroke-dasharray: 0 200; } 40% { opacity: .9; stroke-dasharray: 120 200; } 100% { opacity: 0; stroke-dasharray: 120 200; stroke-dashoffset: -120; } }
@keyframes roar { to { transform: scale(1.05); } }

.mwrap { position: absolute; left: 864px; top: 214px; width: 272px; height: 340px; z-index: 7; transform-origin: 136px 338px; transition: transform .7s cubic-bezier(.5, 0, .3, 1); }
.z1 .mwrap { transform: translateX(-170px) scale(1.12); }

.z2 .mwrap { animation: shrinkDC 2.4s cubic-bezier(.5, 0, .2, 1) .2s both; }
@keyframes shrinkDC { 0% { transform: translateX(-170px) scale(1.12); } 20%, 38% { transform: translateX(-130px) scale(1); } 100% { transform: translateX(-151px) scale(.5); } }
.z3 .mwrap { transform: scale(.72); }

.bot { position: absolute; left: 834px; top: 154px; width: 192px; height: 240px; z-index: 12; transform-origin: 96px 96px; }
.botsvg { width: 100%; height: 100%; overflow: visible; }
.b-out { transform: translate(0, -460px); transition: transform .55s cubic-bezier(.6, 0, .9, .4); }
.b-away { transform: translate(600px, 23.5px) scale(.53125); transition: none; }
.b-in { transform: translate(70px, 23.5px) scale(.53125); transition: transform 1s cubic-bezier(.2, 1.1, .4, 1); }
.b-gone { transform: translate(70px, 23.5px) scale(.53125); opacity: 0; transition: none; }
.gold { fill: #C49A3E; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.navy { fill: #0B2A5B; }
.ear { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.visor { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; }
.rim { fill: none; stroke: #DFF6FF; stroke-width: 2; stroke-linecap: round; }
.topl { fill: #DFF6FF; stroke: #0B2A5B; stroke-width: 1.5; }
.eyeb { fill: #7FE3F0; }
.mouth { fill: none; stroke: #7FE3F0; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.htag { font-family: var(--font-display); font-size: 8.5px; font-weight: 800; fill: #0B2A5B; }
.barm { transform-box: view-box; transition: transform .45s cubic-bezier(.3, 1.6, .5, 1); }
.barm.l { transform-origin: -24.5px 26px; transform: rotate(20deg); } .barm.r { transform-origin: 24.5px 26px; transform: rotate(-40deg); }
.e1 .barm.r { animation: wave .35s ease-in-out 0s 4 alternate both; }
@keyframes wave { from { transform: rotate(-120deg); } to { transform: rotate(-165deg); } }
.b-in .barm.l, .b-in .barm.r { transform: rotate(0); }
.e6 .barm { transform: scaleY(0) !important; transition-delay: .3s; }

.cmpsub { position: absolute; left: 72px; top: 92px; margin: 0; font-size: 19px; font-weight: 500; color: var(--mist); opacity: 0; transform: translateY(6px); transition: opacity .4s ease, transform .4s ease; z-index: 20; }
.z1 .cs1, .z2 .cs2 { opacity: 1; transform: none; transition-delay: .5s; }
.cmpcap { position: absolute; top: 572px; width: 300px; margin-left: -150px; text-align: center; opacity: 0; transform: translateY(8px); transition: opacity .4s ease, transform .4s ease; z-index: 9; }
.cmpcap b { display: block; font-family: var(--font-display); font-size: 19px; color: var(--ink); }
.cmpcap span { font-size: 13.5px; color: var(--mist); }
.k1a { left: 830px; } .k1b { left: 430px; } .k2a { left: 849px; } .k2b { left: 547px; }
.z1 .k1a, .z1 .k1b { opacity: 1; transform: none; transition-delay: .7s; }
.z2 .k2a, .z2 .k2b { opacity: 1; transform: none; transition-delay: 2.5s; }
.hchip { position: absolute; font-size: 12.5px; font-weight: 700; color: #1F5FD6; background: #EEF4FF; border: 1.5px solid #9DC2F5; border-radius: 999px; padding: 3px 10px; opacity: 0; transform: scale(.7); transition: opacity .3s ease, transform .35s cubic-bezier(.2, 1.6, .4, 1); z-index: 9; }
.hx1 { left: 992px; top: 196px; } .hx2 { left: 992px; top: 330px; } .hx3 { left: 992px; top: 470px; }
.z1 .hchip { opacity: 1; transform: none; }
.z1 .hx1 { transition-delay: .9s; } .z1 .hx2 { transition-delay: 1.05s; } .z1 .hx3 { transition-delay: 1.2s; }
.vs { position: absolute; left: 640px; top: 290px; width: 120px; height: 120px; display: grid; place-items: center; z-index: 8; opacity: 0; transform: scale(.3) rotate(-20deg); transition: opacity .25s ease, transform .45s cubic-bezier(.2, 1.8, .4, 1); }
.vs span { font-family: var(--font-display); font-size: 56px; font-weight: 800; font-style: italic; color: #FFFFFF; -webkit-text-stroke: 3px #0B2A5B; text-shadow: 4px 4px 0 #F47B20; }
@keyframes vshake { 25% { transform: translate(-3px, 2px) rotate(-3deg); } 75% { transform: translate(3px, -2px) rotate(3deg); } }
.bolts { position: absolute; inset: 0; width: 1280px; height: 720px; pointer-events: none; z-index: 8; }
.bolt { fill: none; stroke: #F47B20; stroke-width: 4; stroke-linejoin: round; stroke-linecap: round; opacity: 0; }
.z2 .b2 { animation-delay: 1.4s; }
@keyframes zap { 0% { opacity: 0; } 10%, 30% { opacity: 1; } 40%, 100% { opacity: 0; } }

.tl { position: absolute; inset: 0; pointer-events: none; z-index: 4; }
.trow { position: absolute; left: 0; width: 1280px; height: 30px; opacity: 0; transition: opacity .3s ease var(--r); }
.z3 .trow { opacity: 1; }
.tname { position: absolute; left: 70px; width: 186px; top: 6px; text-align: right; font-size: 14px; font-weight: 700; color: var(--ink); }
.track { position: absolute; left: 270px; width: 900px; top: 14px; height: 2px; background: #C9D2E0; transform: scaleX(0); transform-origin: 0 50%; transition: transform 1.9s cubic-bezier(.4, 0, .3, 1) var(--r); }
.z3 .track { transform: none; }
.ev { position: absolute; top: 0; width: 30px; height: 30px; margin-left: -15px; display: grid; place-items: center; opacity: 0; transform: scale(.4); transition: opacity .2s ease var(--d), transform .35s cubic-bezier(.2, 1.8, .4, 1) var(--d); }
.z3 .ev { opacity: 1; transform: none; }
.sub svg { width: 15px; height: 19px; } .sub svg path { fill: #FFFFFF; stroke: #1F5FD6; stroke-width: 1.8; stroke-linejoin: round; } .sub .evl { stroke: #9DB8EA; }
.pkg { position: absolute; inset: 1px; border: 1.5px dashed #1F5FD6; border-radius: 7px; opacity: 0; transition: opacity .3s ease calc(var(--d) + .5s); }
.z3 .pkg { opacity: 1; }
.fb svg { width: 19px; height: 15px; } .fb svg path { fill: #FFE3CC; stroke: #F47B20; stroke-width: 1.8; stroke-linejoin: round; }
.legend { position: absolute; left: 270px; top: 282px; margin: 0; display: flex; gap: 22px; font-size: 12.5px; font-weight: 600; color: var(--mist); opacity: 0; transition: opacity .3s ease 2.1s; }
.z3 .legend { opacity: 1; }
.legend span { display: flex; align-items: center; gap: 6px; }
.lg-s svg { width: 12px; height: 15px; } .lg-s path { fill: #FFFFFF; stroke: #1F5FD6; stroke-width: 1.8; }
.lg-f svg { width: 15px; height: 12px; } .lg-f path { fill: #FFE3CC; stroke: #F47B20; stroke-width: 1.8; }
.z4 .legend { opacity: 0; transition-delay: 0s; }

.task { position: absolute; left: 0; right: 0; top: 292px; margin: 0; text-align: center; font-family: var(--font-display); font-size: 19px; font-weight: 700; color: var(--ink); opacity: 0; transition: opacity .4s ease; z-index: 9; }
.z4 .task { opacity: 1; transition-delay: .7s; }

.z4 .trow { opacity: .3; transition-delay: .4s; }
.flypk { position: absolute; width: 22px; height: 26px; box-sizing: border-box; border: 1.5px dashed #1F5FD6; border-radius: 6px; background: #FFFFFF; z-index: 12; opacity: 0; pointer-events: none; }
.z4 .flypk { animation: gather .8s cubic-bezier(.5, 0, .4, 1) var(--k) both; }
@keyframes gather { 0% { opacity: 1; transform: none; } 85% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(.6); } }
.pile { position: absolute; width: 60px; height: 68px; z-index: 12; opacity: 0; pointer-events: none; }
.pile i { position: absolute; width: 44px; height: 54px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 4px; background: #FFFFFF;
  background-image: linear-gradient(#C9D2E0, #C9D2E0), linear-gradient(#C9D2E0, #C9D2E0), linear-gradient(#C9D2E0, #C9D2E0); background-size: 26px 3px, 26px 3px, 18px 3px; background-position: 8px 14px, 8px 22px, 8px 30px; background-repeat: no-repeat; }
.pile i:nth-child(1) { left: 0; top: 12px; } .pile i:nth-child(2) { left: 5px; top: 8px; } .pile i:nth-child(3) { left: 10px; top: 4px; } .pile i:nth-child(4) { left: 15px; top: 0; border-color: #1F5FD6; }
.z4 .pile:not(.copy) { animation: pileC 1.5s ease both .55s; }
@keyframes pileC { 0% { opacity: 0; transform: scale(.5); } 20%, 75% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0; transform: scale(1); } }
.z4 .pile.copy { animation: deal .8s cubic-bezier(.5, 0, .3, 1) var(--k) both; }
@keyframes deal { 0% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1.1); } 15% { opacity: 1; } 100% { opacity: 1; transform: none; } }
.scanl { position: absolute; left: 12px; width: 48px; top: 0; height: 5px; border-radius: 3px; background: #BFE6FF; box-shadow: 0 0 10px #4FB8FF; opacity: 0; }
.zbusy .scanl { animation: scanS .7s ease-in-out infinite alternate; }
.pile.copy:nth-of-type(odd) .scanl { animation-delay: .2s; }
@keyframes scanS { from { opacity: 1; transform: translateY(2px); } to { opacity: 1; transform: translateY(58px); } }
.beams4 { position: absolute; inset: 0; width: 1280px; height: 720px; pointer-events: none; z-index: 11; }
.bm { opacity: 0; transition: opacity .35s ease; }
.zbusy .bm { opacity: 1; }
.zbusy .bm1 { animation: flick 1s ease-in-out infinite alternate; }
.zbusy .bm3 { animation: flick 1.3s ease-in-out infinite alternate; }
@keyframes flick { to { opacity: .6; } }
.rd { fill: #4FB8FF; opacity: 0; }
.zbusy .rd { animation: readd 1s linear var(--n) infinite; }
@keyframes readd { 0% { opacity: 0; transform: translate(0, 0); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(88px, 40px); } }
.zbusy .ssvg { animation: flare .5s ease-in-out infinite alternate; }
@keyframes flare { to { filter: brightness(1.12); } }
.rep4 { position: absolute; width: 64px; height: 46px; z-index: 13; opacity: 0; pointer-events: none; }
.z4 .rep4 { animation: rise .7s cubic-bezier(.2, 1.4, .4, 1) var(--k) both; }
@keyframes rise { 0% { opacity: 0; transform: translateY(var(--dy)) scale(.6); } 30% { opacity: 1; } 100% { opacity: 1; transform: none; } }
.rep4 svg { width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 6px 10px rgba(11, 42, 91, .18)); }
.eb { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.el { fill: none; stroke: #C9D2E0; stroke-width: 2.5; stroke-linecap: round; }
.efl { fill: #E8EDF5; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }

.rep4 b { position: absolute; left: 18px; top: 12px; width: 28px; height: 28px; border-radius: 50%; background: radial-gradient(circle at 38% 34%, #FF9A4D, #F47B20 55%, #C9580B); border: 2px solid #0B2A5B; box-shadow: 0 0 0 3px rgba(244, 123, 32, .35); color: #FFFFFF; display: grid; place-items: center; font-family: var(--font-display); font-size: 16px; font-weight: 800; box-sizing: border-box; }
.z4 .rep4 b { animation: qbob 1.1s ease-in-out infinite alternate; }
@keyframes qbob { to { transform: scale(1.1) rotate(8deg); } }
.rep4 span { position: absolute; left: -10px; right: -10px; top: 50px; text-align: center; font-size: 12px; font-weight: 800; color: var(--ink); }
.zstill .flypk, .zstill .pile:not(.copy) { animation: none !important; opacity: 0 !important; }
.zstill .pile.copy, .zstill .rep4 { animation-duration: 0s !important; animation-delay: 0s !important; }

.binder { position: absolute; left: 1010px; top: 26px; width: 236px; height: 74px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 12px; background: #FFFFFF; z-index: 13;
  display: flex; align-items: center; gap: 10px; padding: 0 12px 14px; box-shadow: 0 8px 20px rgba(11, 42, 91, .1); opacity: 0; transform: translateY(-10px); transition: opacity .35s ease, transform .4s ease; }
.z3 .binder { opacity: 1; transform: none; transition-delay: .3s; }
.bico { width: 30px; height: 34px; flex: none; }
.bb { fill: #FFF1E6; stroke: #0B2A5B; stroke-width: 2.2; } .br { fill: #0B2A5B; } .bl { stroke: #F4B98A; stroke-width: 2.5; stroke-linecap: round; }
.bt { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: var(--mist); }
.bn { margin: 0; font-size: 13px; font-weight: 600; color: var(--mist); }
.bn b { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: #0B2A5B; font-variant-numeric: tabular-nums; }
.bsrc { position: absolute; left: 12px; right: 8px; bottom: 5px; margin: 0; font-size: 10.5px; font-weight: 600; color: var(--mist); white-space: nowrap; }
.sf { color: #C55A0E; } .sm { color: #1F5FD6; }
.z3 .binder { animation: bump .3s ease 1s 4 alternate; }
@keyframes bump { to { box-shadow: 0 8px 26px rgba(244, 123, 32, .35); } }
.fbfly { position: absolute; width: 18px; height: 14px; z-index: 12; opacity: 0; pointer-events: none; }
.fbfly svg { width: 100%; height: 100%; } .fbfly path { fill: #FFE3CC; stroke: #F47B20; stroke-width: 1.8; stroke-linejoin: round; }
.z3:not(.z4) .fbfly { animation: toBinder .75s cubic-bezier(.5, 0, .4, 1) var(--k) both; }
@keyframes toBinder { 0% { opacity: 0; transform: none; } 15% { opacity: 1; transform: translateY(-6px); } 85% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(.5); } }
.ldot { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: #1F5FD6; box-shadow: 0 0 8px rgba(31, 95, 214, .6); z-index: 12; opacity: 0; pointer-events: none; }
.z3:not(.z4) .ldot { animation: toBinder .75s cubic-bezier(.5, 0, .4, 1) var(--k) both; }
.lens3 { position: absolute; left: 0; top: 0; width: 46px; height: 46px; z-index: 13; opacity: 0; pointer-events: none; }
.lens3 circle { fill: rgba(255, 255, 255, .5); stroke: #0B2A5B; stroke-width: 4; } .lens3 line { stroke: #0B2A5B; stroke-width: 6; stroke-linecap: round; }
.z3:not(.z4) .lens3 { animation: lensSweep var(--t) ease-in-out var(--k) both; }
@keyframes lensSweep {
  0% { opacity: 0; transform: translate(260px, 100px); } 8% { opacity: 1; }
  20% { transform: translate(440px, 168px); } 40% { transform: translate(640px, 104px); } 60% { transform: translate(840px, 236px); } 80% { transform: translate(1020px, 136px); }
  92% { opacity: 1; } 100% { opacity: 0; transform: translate(1150px, 200px); }
}
.zstill .fbfly, .zstill .ldot, .zstill .lens3 { animation: none !important; opacity: 0 !important; }
</style>
