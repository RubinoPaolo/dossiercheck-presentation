<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const clusters = [
  { c: [62, 34], color: '#F47B20' },
  { c: [150, 52], color: '#1F5FD6' },
  { c: [86, 98], color: '#0B2A5B' },
]
const rnd = (s: number) => { const x = Math.sin(s * 999.7) * 43758.5453; return x - Math.floor(x) }
const pts = Array.from({ length: 21 }, (_, i) => {
  const k = i % 3
  const ang = rnd(i + 1) * Math.PI * 2, rad = 6 + rnd(i + 7) * 12
  return {
    color: clusters[k].color,
    home: [clusters[k].c[0] + Math.cos(ang) * rad, clusters[k].c[1] + Math.sin(ang) * rad],
    wild: [24 + rnd(i + 13) * 170, 14 + rnd(i + 29) * 98],
  }
})
const grouped = ref(false)
let id: ReturnType<typeof setInterval>
onMounted(() => { setTimeout(() => (grouped.value = true), 300); id = setInterval(() => (grouped.value = !grouped.value), 2600) })
onBeforeUnmount(() => clearInterval(id))
</script>

<template>
  <svg viewBox="0 0 400 124">
    <line x1="18" y1="118" x2="208" y2="118" class="axis" />
    <line x1="18" y1="118" x2="18" y2="6" class="axis" />
    <circle
      v-for="(p, i) in pts" :key="i" r="4.2" cx="0" cy="0" :fill="p.color" class="pt"
      :style="{ transform: `translate(${(grouped ? p.home : p.wild)[0]}px, ${(grouped ? p.home : p.wild)[1]}px)`, transitionDelay: `${(i % 7) * 40}ms` }"
    />
    <g class="vec">
      <text x="236" y="46">“consent form”</text>
      <path d="M258 58 v18" class="arrow" />
      <path d="M253 70 l5 7 l5 -7" class="arrow" />
      <text x="232" y="98" class="nums">[0.12, −0.48, 0.91, …]</text>
    </g>
  </svg>
</template>

<style scoped>
svg { width: 100%; height: 100%; }
.axis { stroke: #C9D2E0; stroke-width: 1.2; }
.pt { transition: transform 1.4s cubic-bezier(.6, 0, .2, 1); }
.vec text { fill: #0B2A5B; font-size: 14px; font-family: var(--font-body); }
.vec .nums { fill: #1F5FD6; font-size: 14px; font-weight: 500; }
.arrow { stroke: #5E6B85; stroke-width: 1.6; fill: none; }
</style>
