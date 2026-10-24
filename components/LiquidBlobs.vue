<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const t = ref(0)
let raf = 0, t0 = 0
const loop = (ts: number) => { if (!t0) t0 = ts; t.value = (ts - t0) / 1000; raf = requestAnimationFrame(loop) }
onMounted(() => (raf = requestAnimationFrame(loop)))
onBeforeUnmount(() => cancelAnimationFrame(raf))

function blob(cx: number, cy: number, r: number, seed: number, time: number) {
  const N = 9
  const p = Array.from({ length: N }, (_, i) => {
    const a = i / N * Math.PI * 2
    const k = 1 + 0.13 * Math.sin(2 * a + time * 0.8 + seed) + 0.09 * Math.sin(3 * a - time * 1.1 + seed * 2) + 0.05 * Math.sin(5 * a + time * 0.6)
    return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]
  })

  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`
  for (let i = 0; i < N; i++) {
    const p0 = p[(i - 1 + N) % N], p1 = p[i], p2 = p[(i + 1) % N], p3 = p[(i + 2) % N]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d + 'Z'
}
const a = computed(() => blob(150 + Math.sin(t.value * 0.4) * 8, 170 + Math.cos(t.value * 0.5) * 10, 104, 0.3, t.value))
const b = computed(() => blob(290 + Math.cos(t.value * 0.35) * 10, 210 + Math.sin(t.value * 0.45) * 8, 84, 2.1, t.value * 1.15))
</script>

<template>
  <svg viewBox="0 0 420 380">
    <defs>
      <linearGradient id="blobA" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1F5FD6" />
        <stop offset="1" stop-color="#5B8DEF" />
      </linearGradient>
      <linearGradient id="blobB" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFA24D" />
        <stop offset="1" stop-color="#F2611D" />
      </linearGradient>
      <filter id="blobGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="18" /></filter>
    </defs>
    <path :d="a" fill="url(#blobA)" filter="url(#blobGlow)" opacity=".22" />
    <path :d="b" fill="url(#blobB)" filter="url(#blobGlow)" opacity=".22" />
    <path :d="a" fill="url(#blobA)" opacity=".92" />
    <path :d="b" fill="url(#blobB)" opacity=".82" />
  </svg>
</template>

<style scoped>
svg { width: 100%; height: 100%; overflow: visible; }
</style>
