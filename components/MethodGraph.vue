<script setup lang="ts">

const nodes = [
  { id: 'Study', x: 200, y: 62, main: true },
  { id: 'Protocol', x: 70, y: 28 },
  { id: 'Drug', x: 78, y: 98 },
  { id: 'Site', x: 196, y: 112 },
  { id: 'Consent', x: 322, y: 26 },
  { id: 'Patient', x: 330, y: 98 },
]
const edges = [[0, 1], [0, 2], [0, 3], [0, 4], [4, 5], [3, 5], [1, 2]]
const n = (i: number) => nodes[i]
</script>

<template>
  <svg viewBox="0 0 400 124">
    <line
      v-for="([a, b], i) in edges" :key="i"
      :x1="n(a).x" :y1="n(a).y" :x2="n(b).x" :y2="n(b).y"
      class="edge" pathLength="1" :style="{ animationDelay: `${i * 0.35}s` }"
    />
    <g v-for="(nd, i) in nodes" :key="nd.id" class="node" :style="{ animationDelay: `${i * 0.3}s` }">
      <circle :cx="nd.x" :cy="nd.y" :r="nd.main ? 11 : 7" :class="{ main: nd.main }" />
      <text :x="nd.x" :y="nd.y + (nd.y > 62 ? 22 : -14)" text-anchor="middle">{{ nd.id }}</text>
    </g>
  </svg>
</template>

<style scoped>
svg { width: 100%; height: 100%; overflow: visible; }
.edge { stroke: #1F5FD6; stroke-width: 1.6; stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw 6s ease-in-out infinite; }
@keyframes draw { 0% { stroke-dashoffset: 1; opacity: 1; } 30%, 85% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }
.node circle { fill: #EEF3FB; stroke: #6B97EC; stroke-width: 1.6; }
.node circle.main { fill: #1F5FD6; stroke: #BFD3F6; }
.node { animation: pulse 3s ease-in-out infinite; transform-box: fill-box; }
@keyframes pulse { 0%, 100% { opacity: .75; } 50% { opacity: 1; } }
text { fill: #33456B; font-size: 12px; font-family: var(--font-body); }
</style>
