<script setup lang="ts">

withDefaults(defineProps<{ uid?: string, look?: number }>(), { uid: 'sun', look: 0 })
const corona = Array.from({ length: 46 }, (_, i) => {
  const a = (i / 46) * Math.PI * 2 + ((i * 7) % 5) * 0.02
  const r = 152 + ((i * 13) % 7)
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: 3 + ((i * 11) % 6), c: i % 3 === 0 ? '#FFD23F' : i % 3 === 1 ? '#F47B20' : '#FFB12E', rot: (a * 180) / Math.PI }
})
const spots = [
  { x: -62, y: -64, r: 26 }, { x: 70, y: -48, r: 22 }, { x: -96, y: 30, r: 15 }, { x: 34, y: 66, r: 30 },
  { x: 92, y: 52, r: 18 }, { x: -40, y: 96, r: 16 }, { x: 8, y: -110, r: 12 },
]
</script>

<template>
  <svg viewBox="-200 -200 400 400" class="ssvg">
    <defs>
      <radialGradient :id="`${uid}-body`" cx="40%" cy="38%" r="70%">
        <stop offset="0" stop-color="#FFE873" /><stop offset=".45" stop-color="#FFC233" /><stop offset=".8" stop-color="#FF9A1F" /><stop offset="1" stop-color="#F06416" />
      </radialGradient>
      <radialGradient :id="`${uid}-glow`">
        <stop offset=".6" stop-color="#FFB12E" stop-opacity=".45" /><stop offset="1" stop-color="#FFB12E" stop-opacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx="0" cy="190" rx="120" ry="12" class="sshd" />
    <circle r="196" :fill="`url(#${uid}-glow)`" class="sglow" />
    <g class="corona">
      <g v-for="(c, i) in corona" :key="i" :transform="`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${(c.rot + 90).toFixed(0)})`">
        <path :d="`M${-c.s} 0 A${c.s} ${c.s} 0 0 1 ${c.s} 0 A${c.s * 0.7} ${c.s * 0.55} 0 0 0 ${-c.s} 0 Z`" :fill="c.c" />
      </g>
    </g>
    <circle r="150" :fill="`url(#${uid}-body)`" />
    <path d="M-138 -40 A146 146 0 0 1 40 -142" class="srim" />
    <circle r="150" class="sedge" />
    <g v-for="(sp, i) in spots" :key="i" :transform="`translate(${sp.x} ${sp.y})`">
      <circle :r="sp.r" class="sp1" /><circle :r="sp.r * 0.62" class="sp2" /><circle :r="sp.r * 0.28" class="sp3" />
    </g>
    <circle cx="-88" cy="74" r="20" class="hot" /><circle cx="-88" cy="74" r="9" class="hot2" />
    <circle cx="58" cy="10" r="46" class="ringl" /><circle cx="-70" cy="-14" r="30" class="ringl" />
    <g class="seyes" :style="{ transform: `translate(${look}px, ${Math.abs(look) * 0.6}px)` }">
      <g class="se"><ellipse cx="-42" cy="-18" rx="13" ry="19" class="eyeS" /><circle cx="-38" cy="-24" r="4.5" class="eyeH" /></g>
      <g class="se"><ellipse cx="42" cy="-18" rx="13" ry="19" class="eyeS" /><circle cx="46" cy="-24" r="4.5" class="eyeH" /></g>
    </g>
  </svg>
</template>

<style scoped>
.ssvg { width: 100%; height: 100%; overflow: visible; }
.sshd { fill: #0B2A5B; opacity: .14; }
.sglow { transform-box: fill-box; transform-origin: center; animation: sglow 2.6s ease-in-out infinite; }
@keyframes sglow { 50% { transform: scale(1.06); opacity: .8; } }
.corona { animation: spinC 40s linear infinite; }
@keyframes spinC { to { transform: rotate(360deg); } }
.sedge { fill: none; stroke: #D9520F; stroke-width: 4; opacity: .55; }
.srim { fill: none; stroke: #FFF2A8; stroke-width: 6; stroke-linecap: round; opacity: .55; }
.sp1 { fill: #F47B20; opacity: .55; } .sp2 { fill: #E0531B; opacity: .6; } .sp3 { fill: #B53A10; opacity: .7; }
.hot { fill: #FFF4C2; opacity: .9; } .hot2 { fill: #F47B20; }
.ringl { fill: none; stroke: #FFE873; stroke-width: 4; opacity: .55; }
.seyes { transition: transform .6s ease; }
.se { transform-box: fill-box; transform-origin: center; animation: sblink 5s infinite 1s; }
@keyframes sblink { 0%, 94%, 100% { transform: scaleY(1); } 97% { transform: scaleY(.1); } }
.eyeS { fill: #0B2A5B; } .eyeH { fill: #FFFFFF; }
</style>
