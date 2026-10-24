<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useIsSlideActive } from '@slidev/client'

const props = defineProps<{ step: number }>()

const X0 = 70, X1 = 840, Y0 = 30, Y1 = 455
const YEAR0 = 2019, YEAR1 = 2029
const TODAY = 2026.79
const VMAX = 140
const xOf = (yr: number) => X0 + (yr - YEAR0) / (YEAR1 - YEAR0) * (X1 - X0)
const yOf = (v: number) => Y1 - v / VMAX * (Y1 - Y0)
const todayX = xOf(TODAY)

const labs = [
  { name: 'OpenAI', short: 'OA', color: '#10A37F', pts: [[2019, 8], [2020.5, 14], [2022, 27], [2023, 41], [2024, 53], [2025, 70], [2025.9, 84], [TODAY, 96]] },
  { name: 'Anthropic', short: 'An', color: '#D97757', pts: [[2021.3, 4], [2022, 9], [2023, 30], [2024, 50], [2025, 70], [2025.9, 80], [TODAY, 85]] },
  { name: 'Google DeepMind', short: 'G', color: '#4285F4', pts: [[2019, 11], [2020.5, 16], [2022, 23], [2023, 34], [2024, 46], [2025, 60], [2025.9, 68], [TODAY, 74]] },
  { name: 'xAI', short: 'x', color: '#2B2F36', pts: [[2023.4, 5], [2024, 30], [2025, 50], [2025.9, 58], [TODAY, 63]] },
]

function valueAt(pts: number[][], yr: number) {
  if (yr <= pts[0][0]) return pts[0][1]
  for (let i = 0; i < pts.length - 1; i++) {
    const [xa, ya] = pts[i], [xb, yb] = pts[i + 1]
    if (yr <= xb) {
      const p0 = pts[Math.max(0, i - 1)], p3 = pts[Math.min(pts.length - 1, i + 2)]
      const h = xb - xa
      const m0 = (yb - p0[1]) / (xb - p0[0]) * h
      const m1 = (p3[1] - ya) / (p3[0] - xa) * h
      const t = (yr - xa) / h, t2 = t * t, t3 = t2 * t
      return (2 * t3 - 3 * t2 + 1) * ya + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * yb + (t3 - t2) * m1
    }
  }
  return pts[pts.length - 1][1]
}

const now = ref(0)
const futureT = ref(0)
let raf = 0, start = 0, futureStart = 0
const active = useIsSlideActive()

function loop(ts: number) {
  if (!start) start = ts
  now.value = (ts - start) / 1000
  if (props.step >= 2) {
    if (!futureStart) futureStart = ts
    futureT.value = (ts - futureStart) / 1000
  } else {
    futureStart = 0
    futureT.value = 0
  }
  raf = requestAnimationFrame(loop)
}
function play() { cancelAnimationFrame(raf); start = 0; futureStart = 0; raf = requestAnimationFrame(loop) }
function stop() { cancelAnimationFrame(raf) }
watch(active, a => (a ? play() : stop()), { immediate: true })
onBeforeUnmount(stop)

const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const RACE_DELAY = 0.7, RACE_DUR = 3.4
const raceP = computed(() => ease(Math.min(1, Math.max(0, (now.value - RACE_DELAY) / RACE_DUR))))
const cutYear = computed(() => YEAR0 + raceP.value * (TODAY - YEAR0))

const curves = computed(() => labs.map(l => {
  const first = l.pts[0][0]
  const end = cutYear.value
  if (end <= first) return { ...l, d: '', hx: 0, hy: 0, visible: false }
  let d = ''
  for (let yr = first; yr < end; yr += 0.04) d += `${d ? 'L' : 'M'}${xOf(yr).toFixed(1)},${yOf(valueAt(l.pts, yr)).toFixed(1)}`
  const hx = xOf(end), hy = yOf(valueAt(l.pts, end))
  d += `L${hx.toFixed(1)},${hy.toFixed(1)}`
  return { ...l, d, hx, hy, visible: true }
}))

const spread = [
  [46, 6], [52, -2], [44, 4], [40, -4],
]
const futureP = computed(() => ease(Math.min(1, futureT.value / 1.8)))
const futurePaths = computed(() => {
  const t = futureT.value
  const span = (YEAR1 - TODAY) * futureP.value
  return labs.map((l, i) => {
    const v0 = valueAt(l.pts, TODAY)
    const hiEnd = spread[i][0] + Math.sin(t * 0.9 + i * 1.7) * 7 + Math.sin(t * 0.43 + i) * 4
    const loEnd = spread[i][1] + Math.sin(t * 0.7 + i * 2.3 + 1) * 5
    const hi: string[] = [], lo: string[] = []
    for (let k = 0; k <= 32; k++) {
      const u = k / 32
      const x = xOf(TODAY + u * span).toFixed(1)
      const uu = u * futureP.value
      hi.push(`${x},${yOf(Math.min(v0 + hiEnd * Math.pow(uu, 1.7), VMAX + 4)).toFixed(1)}`)
      lo.push(`${x},${yOf(v0 + loEnd * Math.pow(uu, 0.8)).toFixed(1)}`)
    }
    return {
      color: l.color,
      hi: 'M' + hi.join('L'),
      lo: 'M' + lo.join('L'),
      band: 'M' + hi.join('L') + 'L' + lo.slice().reverse().join('L') + 'Z',
    }
  })
})
const years = [2019, 2021, 2023, 2025, 2027, 2029]
</script>

<template>
  <div class="chart">
    <svg viewBox="0 0 880 520" class="svg">
      <defs>
        <linearGradient id="futureStroke" x1="0" x2="1">
          <stop offset="0" stop-color="#1F5FD6" stop-opacity="0.9" />
          <stop offset="1" stop-color="#8FA9E8" stop-opacity="0.25" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <g class="grid">
        <line v-for="v in [35, 70, 105, 140]" :key="v" :x1="X0" :x2="X1" :y1="yOf(v)" :y2="yOf(v)" />
        <line :x1="X0" :x2="X1" :y1="Y1" :y2="Y1" class="axis" />
        <text v-for="y in years" :key="y" :x="xOf(y)" :y="Y1 + 26" text-anchor="middle">{{ y }}</text>
        <text :x="X0 - 18" :y="(Y0 + Y1) / 2" text-anchor="middle" :transform="`rotate(-90 ${X0 - 18} ${(Y0 + Y1) / 2})`">Model performance</text>
      </g>

      <rect :x="todayX" :y="Y0" :width="X1 - todayX" :height="Y1 - Y0" class="future-zone" />

      <g class="today" :class="{ on: now > 0.1 }">
        <line :x1="todayX" :x2="todayX" :y1="Y0 - 6" :y2="Y1" />
        <text :x="todayX" :y="Y0 - 12" text-anchor="middle">Today</text>
      </g>

      <g v-if="step >= 2" class="futures">
        <g v-for="f in futurePaths" :key="f.color">
          <path :d="f.band" :fill="f.color" class="band" />
          <path :d="f.hi" :stroke="f.color" class="branch" />
          <path :d="f.lo" :stroke="f.color" class="branch" />
        </g>
      </g>

      <g v-for="c in curves" :key="c.name">
        <template v-if="c.visible">
          <path :d="c.d" :stroke="c.color" class="glow" filter="url(#glow)" />
          <path :d="c.d" :stroke="c.color" class="curve" />
          <g :transform="`translate(${c.hx} ${c.hy})`">
            <circle r="15" :fill="c.color" class="head" />
            <text class="head-label" text-anchor="middle" dy="5" :style="{ fill: '#FFFFFF' }">{{ c.short }}</text>
          </g>
        </template>
      </g>
    </svg>

    <ul class="legend" :class="{ on: raceP > 0.05 }">
      <li v-for="l in labs" :key="l.name"><span :style="{ background: l.color }" />{{ l.name }}</li>
    </ul>
    <p class="note">Illustrative trajectories</p>
  </div>
</template>

<style scoped>
.chart { position: relative; width: 100%; height: 100%; }
.svg { width: 100%; height: auto; overflow: visible; }
.grid line { stroke: var(--line); stroke-width: 1; }
.grid .axis { stroke: #B4BFD2; }
.grid text { fill: var(--mist); font-size: 14px; font-family: var(--font-body); }
.future-zone { fill: #1F5FD6; opacity: 0.04; }
.today line { stroke: var(--today); stroke-width: 2.5; }
.today text { fill: var(--today); font-size: 15px; font-weight: 600; font-family: var(--font-body); }
.today { opacity: 0; transition: opacity .6s ease; }
.today.on { opacity: 1; }
.curve { fill: none; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
.glow { fill: none; stroke-width: 8; opacity: .18; }
.head { stroke: #FFFFFF; stroke-width: 3; }
.head-label { font-family: var(--font-body); font-weight: 600; font-size: 13px; }
.futures .band { opacity: .08; stroke: none; }
.futures .branch { fill: none; stroke-width: 2; stroke-dasharray: 6 6; opacity: .75; }
.legend { position: absolute; left: 70px; bottom: -6px; display: flex; gap: 22px; margin: 0; padding: 0; list-style: none; font-size: 14px; color: #33456B; opacity: 0; transition: opacity .6s; }
.legend.on { opacity: 1; }
.legend li { display: flex; align-items: center; gap: 8px; }
.legend span { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.note { position: absolute; right: 40px; bottom: -6px; margin: 0; font-size: 12px; color: #8A94AB; font-style: italic; }
</style>
