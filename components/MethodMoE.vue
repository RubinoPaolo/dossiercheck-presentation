<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const experts = [23, 49, 75, 101]
const routes = [[0, 2], [1, 3], [0, 1], [2, 3], [1, 2]]
const IN = [34, 62], R = [112, 62], OUT = [362, 62]
const EX = 222
const t = ref(0)
let raf = 0, t0 = 0
const loop = (ts: number) => { if (!t0) t0 = ts; t.value = (ts - t0) / 1000; raf = requestAnimationFrame(loop) }
onMounted(() => (raf = requestAnimationFrame(loop)))
onBeforeUnmount(() => cancelAnimationFrame(raf))

const CYCLE = 1.6
const cycle = computed(() => Math.floor(t.value / CYCLE))
const phase = computed(() => (t.value % CYCLE) / CYCLE)
const active = computed(() => routes[cycle.value % routes.length])

function lerp(a: number[], b: number[], u: number) { return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u] }

const packets = computed(() => active.value.map(e => {
  const ey = experts[e]
  const path = [IN, R, [EX, ey], [EX + 60, ey], OUT]
  const p = Math.min(phase.value * 1.15, 1) * (path.length - 1)
  const i = Math.min(Math.floor(p), path.length - 2)
  return lerp(path[i], path[i + 1], p - i)
}))
</script>

<template>
  <svg viewBox="0 0 400 124">
    <g class="wires">
      <line :x1="IN[0]" :y1="IN[1]" :x2="R[0]" :y2="R[1]" />
      <template v-for="(y, i) in experts" :key="i">
        <line :x1="R[0]" :y1="R[1]" :x2="EX" :y2="y" :class="{ on: active.includes(i) }" />
        <line :x1="EX + 60" :y1="y" :x2="OUT[0]" :y2="OUT[1]" :class="{ on: active.includes(i) }" />
      </template>
    </g>
    <circle :cx="IN[0]" :cy="IN[1]" r="9" class="token" />
    <rect :x="R[0] - 13" :y="R[1] - 13" width="26" height="26" rx="4" :transform="`rotate(45 ${R[0]} ${R[1]})`" class="router" />
    <rect v-for="(y, i) in experts" :key="'e' + i" :x="EX" :y="y - 9" width="60" height="18" rx="4" class="expert" :class="{ on: active.includes(i) }" />
    <circle :cx="OUT[0]" :cy="OUT[1]" r="9" class="token out" />
    <circle v-for="(p, i) in packets" :key="'p' + i" :cx="p[0]" :cy="p[1]" r="4.5" class="packet" />
  </svg>
</template>

<style scoped>
svg { width: 100%; height: 100%; }
.wires line { stroke: #CFD7E4; stroke-width: 1.6; transition: stroke .3s; }
.wires line.on { stroke: #1F5FD6; }
.token { fill: #0B2A5B; }
.token.out { fill: none; stroke: #0B2A5B; stroke-width: 2; }
.router { fill: #F1F4F9; stroke: #5E6B85; stroke-width: 1.5; }
.expert { fill: #EEF3FB; stroke: #C9D2E0; stroke-width: 1.2; transition: fill .3s, stroke .3s; }
.expert.on { fill: #1F5FD6; stroke: #1F5FD6; }
.packet { fill: #F47B20; filter: drop-shadow(0 0 3px rgba(244,123,32,.6)); }
</style>
