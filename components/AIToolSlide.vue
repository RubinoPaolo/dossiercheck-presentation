<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const step = computed(() => unref($clicks) as number)

const words = [
  { t: 'AI', row: 0 }, { t: 'is', row: 0 }, { t: 'a', row: 0 },
  { t: 'Powerful', row: 1 }, { t: 'Tool!', row: 1 },
]
const BASE = 76
const TITLE = 34 / BASE
const GAP = 0.3 * BASE
const ROW_Y = [92, 548]
const wordEls = ref<HTMLElement[]>([])
const widths = ref<number[]>(words.map(w => w.t.length * BASE * 0.5))

function measure() {
  const w = wordEls.value.map(el => el.offsetWidth)
  if (w.length === words.length && w.every(x => x > 0)) widths.value = w
}
onMounted(() => { measure(); document.fonts?.ready.then(measure) })

const wordPos = computed(() => {
  const w = widths.value
  const rowWidth = (r: number) => words.reduce((acc, wd, i) => wd.row === r ? acc + w[i] + GAP : acc, -GAP)
  const cursor = [640 - rowWidth(0) / 2, 640 - rowWidth(1) / 2]
  let titleX = 72
  return words.map((wd, i) => {
    const big = { x: cursor[wd.row], y: ROW_Y[wd.row], s: 1 }
    cursor[wd.row] += w[i] + GAP
    const small = { x: titleX, y: 40, s: TITLE }
    titleX += (w[i] + GAP) * TITLE
    const p = step.value >= 1 ? small : big
    return { transform: `translate(${p.x}px, ${p.y}px) scale(${p.s})` }
  })
})

const active = useIsSlideActive()
watch(active, a => { if (a) nextTick(() => requestAnimationFrame(measure)) }, { immediate: true })

const todos = ['Draft the protocol', 'Prepare consent forms', 'Update information sheet', 'Align document versions']

const reps = ref(1)
let id: ReturnType<typeof setInterval>
onMounted(() => (id = setInterval(() => (reps.value = reps.value >= 99 ? 1 : reps.value + 1), 900)))
onBeforeUnmount(() => clearInterval(id))
</script>

<template>
  <div class="stage" :class="{ play: active }">
    <h2 class="display title" aria-label="AI is a Powerful Tool!">
      <span
        v-for="(wd, i) in words" :key="wd.t" class="word" :style="wordPos[i]"
      ><span ref="wordEls" class="pop" :style="{ animationDelay: `${0.7 + i * 0.38}s` }">{{ wd.t }}</span></span>
    </h2>

    <div class="emblem" :class="{ up: step >= 1 }">
      <div class="halo" />
      <div class="rays" />
      <svg viewBox="0 0 240 240" class="chip">
        <defs>
          <linearGradient id="chipFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#1F4FB0" />
            <stop offset="1" stop-color="#0B2A5B" />
          </linearGradient>
        </defs>
        <g class="pins">
          <template v-for="k in 4" :key="k">
            <rect :x="72 + k * 19" y="44" width="6" height="22" rx="3" />
            <rect :x="72 + k * 19" y="174" width="6" height="22" rx="3" />
            <rect x="44" :y="72 + k * 19" width="22" height="6" rx="3" />
            <rect x="174" :y="72 + k * 19" width="22" height="6" rx="3" />
          </template>
        </g>
        <rect x="62" y="62" width="116" height="116" rx="22" fill="url(#chipFill)" stroke="#3B78E7" stroke-width="2.5" />
        <text x="120" y="137" text-anchor="middle" class="ai">AI</text>
        <path d="M152 82 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" class="spark" />
      </svg>
    </div>

    <div class="row">

      <figure class="item" :class="{ on: step >= 1 }">
        <div class="art">
          <ul class="todo">
            <li v-for="(t, i) in todos" :key="t" :style="{ '--d': `${0.6 + i * 0.55}s` }">
              <svg viewBox="0 0 24 24" class="box">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M6.5 12.5 l3.6 3.6 l7.5 -8" pathLength="1" class="tick" />
              </svg>
              <span>{{ t }}</span>
            </li>
          </ul>
        </div>
        <figcaption>Increase effectiveness</figcaption>
      </figure>

      <figure class="item" :class="{ on: step >= 2 }">
        <div class="art">
          <svg viewBox="0 0 220 180" class="loop">
            <g class="spin">
              <path d="M110 22 a68 68 0 1 1 -58.9 34" class="arc" />
              <path d="M55.6 48.2 L56.2 61.2 L44 54.2 Z" class="arrowhead" />
            </g>
            <g class="docs">
              <g v-for="k in 3" :key="k" :class="`doc d${k}`">
                <rect x="84" y="62" width="52" height="64" rx="5" />
                <line x1="93" y1="78" x2="127" y2="78" /><line x1="93" y1="89" x2="127" y2="89" />
                <line x1="93" y1="100" x2="120" y2="100" /><line x1="93" y1="111" x2="124" y2="111" />
              </g>
            </g>
          </svg>
          <span class="reps">×{{ reps }}</span>
        </div>
        <figcaption>Relieve tedious, repetitive tasks</figcaption>
      </figure>

      <figure class="item" :class="{ on: step >= 3 }">
        <div class="art">
          <svg viewBox="0 0 220 180" class="lab">
            <defs>
              <clipPath id="flaskClip"><path d="M94 38 h32 v34 l34 62 a10 10 0 0 1 -9 15 h-82 a10 10 0 0 1 -9 -15 l34 -62 z" /></clipPath>
            </defs>
            <g clip-path="url(#flaskClip)">
              <rect x="40" y="100" width="140" height="60" class="liquid" />
              <circle v-for="b in 6" :key="b" :cx="88 + b * 8" cy="148" :r="2 + (b % 3)" class="bubble" :style="{ animationDelay: `${b * 0.37}s` }" />
            </g>
            <path d="M94 38 h32 v34 l34 62 a10 10 0 0 1 -9 15 h-82 a10 10 0 0 1 -9 -15 l34 -62 z" class="glass" />
            <line x1="88" y1="38" x2="132" y2="38" class="glass" />
            <g class="molecule">
              <line x1="156" y1="30" x2="178" y2="44" /><line x1="178" y1="44" x2="174" y2="70" /><line x1="156" y1="30" x2="150" y2="56" />
              <circle cx="156" cy="30" r="7" /><circle cx="178" cy="44" r="5" class="alt" /><circle cx="174" cy="70" r="6" /><circle cx="150" cy="56" r="4.5" class="alt" />
            </g>
          </svg>
        </div>
        <figcaption>Focus on what truly matters</figcaption>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.emblem {
  position: absolute; left: 50%; top: 50%; width: 300px; height: 300px;
  transform: translate(-50%, -50%) scale(1.25);
  transition: transform 1.1s cubic-bezier(.65, 0, .25, 1);
}
.play .emblem { animation: emblemIn 1.2s cubic-bezier(.2, .8, .2, 1) both; }

.title { position: absolute; inset: 0; margin: 0; pointer-events: none; }
.word {
  position: absolute; left: 0; top: 0; transform-origin: 0 0;
  font-size: 76px; line-height: 1; font-weight: 700; color: var(--ink); white-space: nowrap;
  transition: transform 1.1s cubic-bezier(.65, 0, .25, 1);
}
.pop { display: inline-block; }
.play .pop { animation: pop .75s cubic-bezier(.2, 1.4, .4, 1) both; }
@keyframes pop {
  from { opacity: 0; transform: scale(.35); filter: blur(4px); }
  to { opacity: 1; transform: scale(1); filter: none; }
}
.emblem.up { transform: translate(-50%, -105%) scale(.6); }
@keyframes emblemIn { from { opacity: 0; filter: blur(8px); } to { opacity: 1; filter: none; } }
.halo {
  position: absolute; inset: -60%; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(31,111,235,.28) 0%, rgba(31,111,235,.09) 40%, rgba(31,111,235,0) 100%);
  animation: breathe 4s ease-in-out infinite;
}
.rays {
  position: absolute; inset: -35%; border-radius: 50%;
  background: repeating-conic-gradient(from 0deg, rgba(31,111,235,.10) 0deg 3deg, transparent 3deg 18deg);
  mask: radial-gradient(closest-side, transparent 35%, #000 50%, transparent 100%);
  -webkit-mask: radial-gradient(closest-side, transparent 35%, #000 50%, transparent 100%);
  animation: turn 40s linear infinite;
}
@keyframes breathe { 0%, 100% { opacity: .75; transform: scale(.95); } 50% { opacity: 1; transform: scale(1.05); } }
@keyframes turn { to { transform: rotate(360deg); } }
.chip { position: relative; width: 100%; height: 100%; filter: drop-shadow(0 10px 24px rgba(31,111,235,.35)); }
.pins rect { fill: #3B78E7; }
.ai { font-family: var(--font-display); font-weight: 700; font-size: 54px; fill: #fff; letter-spacing: -1px; }
.spark { fill: #9DBCF5; animation: twinkle 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes twinkle { 0%, 100% { opacity: .5; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.15); } }

.row { position: absolute; left: 96px; right: 96px; top: 330px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
.item { margin: 0; opacity: 0; transform: translateY(24px); transition: opacity .8s ease, transform .8s cubic-bezier(.2, .8, .2, 1); }
.item.on { opacity: 1; transform: none; }
.art { position: relative; height: 230px; background: var(--surface); border: 1px solid #E1E6EF; border-radius: 16px; display: grid; place-items: center; overflow: hidden; }
figcaption { margin-top: 16px; font-size: 22px; font-weight: 500; text-align: center; color: var(--ink); }

.todo { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
.todo li { display: flex; align-items: center; gap: 14px; font-size: 17px; color: #33456B; }
.box { width: 26px; height: 26px; flex: none; }
.box rect { fill: none; stroke: #B4BFD2; stroke-width: 2; transition: stroke .3s; }
.tick { fill: none; stroke: #1F5FD6; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; }
.todo li span { position: relative; transition: color .4s; }
.item.on .tick { animation: tick .45s ease-out var(--d) forwards; }
@keyframes tick { to { stroke-dashoffset: 0; } }

.loop { width: 230px; height: 190px; }
.arc { fill: none; stroke: #1F5FD6; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
.spin { transform-box: view-box; transform-origin: 110px 90px; animation: turn 3.6s linear infinite; }
.arrowhead { fill: #1F5FD6; stroke: #1F5FD6; stroke-width: 2; stroke-linejoin: round; }
.doc rect { fill: #F1F4F9; stroke: #5E6B85; stroke-width: 1.5; }
.doc line { stroke: #B4BFD2; stroke-width: 3; stroke-linecap: round; }
.d1 { transform: translate(-8px, 6px); opacity: .45; }
.d2 { transform: translate(-4px, 3px); opacity: .7; }
.d3 { animation: shuffle .9s cubic-bezier(.6, 0, .3, 1) infinite; }
@keyframes shuffle { 0% { transform: translate(40px, -6px); opacity: 0; } 35%, 70% { transform: none; opacity: 1; } 100% { transform: translate(-8px, 6px); opacity: .45; } }
.reps { position: absolute; right: 18px; bottom: 12px; font-family: var(--font-display); font-weight: 600; font-size: 22px; color: #F47B20; font-variant-numeric: tabular-nums; }

.lab { width: 230px; height: 190px; }
.glass { fill: none; stroke: #33456B; stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; }
.liquid { fill: #1F5FD6; opacity: .75; animation: slosh 3s ease-in-out infinite; }
@keyframes slosh { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.bubble { fill: #BFD3F6; animation: rise 2.2s ease-in infinite; }
@keyframes rise { from { transform: translateY(0); opacity: .9; } to { transform: translateY(-58px); opacity: 0; } }
.molecule { animation: float 5s ease-in-out infinite; transform-origin: 164px 50px; }
.molecule line { stroke: #6B97EC; stroke-width: 2; }
.molecule circle { fill: #1F5FD6; }
.molecule circle.alt { fill: #F47B20; }
@keyframes float { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-8px) rotate(14deg); } }
</style>
