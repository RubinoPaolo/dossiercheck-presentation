<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const clicks = computed(() => unref($clicks) as number)
const SC = [0, 0, 1, 2, 3, 3, 4]
const step = computed(() => SC[Math.min(clicks.value, 6)])
const active = useIsSlideActive()

const live = ref(false)
const entering = ref(false)
const botIn = ref(false)
const beaming = ref(false)
const arrived = ref(false)
const stretch = ref(false)
const amazed = ref(false)
const ping = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }

const N = 12
const SP = { A: { x: 452, y: 494 }, B: { x: 566, y: 494 }, C: { x: 300, y: 494 } } as const
type Pile = keyof typeof SP
const piles = reactive<Record<Pile, number[]>>({ A: [], B: [], C: [] })
const flying = reactive<Record<number, boolean>>({})
const slow = reactive<Record<number, boolean>>({})
const tick = ref(0)
function pos(i: number) {
  const pl = (['A', 'B', 'C'] as Pile[]).find(k => piles[k].includes(i)) ?? 'A'
  const k = piles[pl].indexOf(i)
  const p = SP[pl]
  return { x: p.x + (((i * 29) % 9) - 4), y: p.y - k * 8, r: (((i * 37) % 7) - 3) * 0.6 }
}
const from = reactive<Record<number, { x: number, y: number }>>({})
function sheetStyle(i: number) {
  const p = pos(i)
  const st: Record<string, string> = { transform: `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg)` }
  if (flying[i] && from[i]) {
    st['--fx'] = `${from[i].x}px`; st['--fy'] = `${from[i].y}px`
    st['--mx'] = `${(from[i].x + p.x) / 2 + 10}px`; st['--my'] = `${Math.min(from[i].y, p.y) - 96}px`
    st['--tx'] = `${p.x}px`; st['--ty'] = `${p.y}px`
  }
  return st
}

function moveTop(to: Pile, how: 'fly' | 'slow' | 'none') {
  const i = piles.A[piles.A.length - 1]
  if (i === undefined) return
  const p = pos(i)
  piles.A.pop(); piles[to].push(i)
  if (how === 'fly') {
    from[i] = { x: p.x, y: p.y }; flying[i] = true
    later(900, () => { flying[i] = false; tick.value++ })
  }
  else if (how === 'slow') { slow[i] = true; later(1300, () => { slow[i] = false }) }
}
function reset(c: number, b: number) {
  piles.A.splice(0, piles.A.length, ...Array.from({ length: N }, (_, k) => k)); piles.B.splice(0); piles.C.splice(0)
  Object.keys(flying).forEach(k => delete flying[+k]); Object.keys(slow).forEach(k => delete slow[+k])
  for (let k = 0; k < c; k++) moveTop('C', 'none')
  for (let k = 0; k < b; k++) moveTop('B', 'none')
}

function tiredLoop(first = 1200) {
  if (piles.C.length >= 3) return
  later(first, () => { moveTop('C', 'slow'); tiredLoop(2300) })
}

function enterStep(c: number, fresh: boolean) {
  clearTimers()
  live.value = fresh
  beaming.value = false
  stretch.value = false
  amazed.value = c === 2 && !fresh
  arrived.value = c >= 4 && (!fresh || c >= 5)
  if (c >= 1) botIn.value = true
  if (!fresh) {
    entering.value = false
    const [cc, bb] = c === 0 ? [0, 0] : c === 1 ? [2, 0] : c === 2 ? [3, 4] : [3, N - 3]
    reset(cc, bb)
    if (c === 0) botIn.value = false
    if (c <= 1) tiredLoop()
    return
  }
  if (c === 1) {

    entering.value = true
    later(1500, () => { entering.value = false })
    tiredLoop(900)
  }
  else if (c === 2) {

    if (piles.C.length < 4) later(250, () => moveTop('C', 'slow'))
    later(650, () => { beaming.value = true })
    for (let k = 0; k < 4; k++) later(1000 + k * 420, () => moveTop('B', 'fly'))
    later(1000 + 4 * 420 + 300, () => { beaming.value = false })
    later(1500, () => { amazed.value = true })
  }
  else if (c === 3) {

    later(150, () => { beaming.value = true })
    const left = piles.A.length
    for (let k = 0; k < left; k++) later(450 + k * 240, () => moveTop('B', 'fly'))
    later(450 + left * 240 + 300, () => { beaming.value = false })
    later(900, () => { stretch.value = true })
    later(2300, () => { stretch.value = false })
  }
  else if (c === 4) {
    later(2500, () => { arrived.value = true })
    later(3300, () => { ping.value++ })
  }
}
watch(active, (a) => {
  clearTimers()
  if (!a) { botIn.value = false; entering.value = false; live.value = false; return }
  enterStep(clicks.value, false)
}, { immediate: true })
watch(clicks, (c, old) => { if (active.value) enterStep(c, old === c - 1) })
onBeforeUnmount(clearTimers)

const mood = computed(() => clicks.value <= 1 ? 'tired' : clicks.value === 2 ? (amazed.value ? 'amazed' : 'tired') : 'happy')
const pose = computed(() => {
  if (clicks.value <= 1 || (clicks.value === 2 && !amazed.value)) return 'tired'
  if (step.value >= 3) return arrived.value ? 'lab' : 'rest'
  if (stretch.value) return 'cheer'
  return 'rest'
})
const STARS = [[40, 40], [92, 28], [150, 60], [214, 34], [60, 100], [196, 118], [120, 124], [232, 156], [30, 150], [168, 92]]
</script>

<template>
  <div class="stage nd" :class="[`s${step}`, `c${clicks}`, { live, bot: botIn, entering, arrived, dos: clicks >= 5 }]">
    <h2 class="display heading">
      <span :class="{ on: clicks < 6 }">AI as a Powerful Tool</span>
      <span :class="{ on: clicks >= 6 }">My Thesis: DossierCheck</span>
    </h2>

    <div class="scene">

      <div class="winhalo night" /><div class="winhalo day" />
      <svg viewBox="0 0 1280 720" class="shaft"><defs>
        <linearGradient id="nd-shn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E8FD8" stop-opacity=".16" /><stop offset="1" stop-color="#6E8FD8" stop-opacity="0" /></linearGradient>
        <linearGradient id="nd-shd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD27A" stop-opacity=".42" /><stop offset="1" stop-color="#FFD27A" stop-opacity="0" /></linearGradient>
      </defs>
        <path d="M344 316 H576 L760 612 H452 Z" fill="url(#nd-shn)" class="shn" />
        <path d="M344 316 H576 L760 612 H452 Z" fill="url(#nd-shd)" class="shd" />
      </svg>
      <svg viewBox="0 0 260 220" class="window">
        <defs>
          <linearGradient id="nd-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#081F45" /><stop offset="1" stop-color="#1F4FB0" /></linearGradient>
          <linearGradient id="nd-dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B4A9E" /><stop offset=".55" stop-color="#E77A6A" /><stop offset="1" stop-color="#FFC27A" /></linearGradient>
          <linearGradient id="nd-day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EC0FF" /><stop offset="1" stop-color="#DDF0FF" /></linearGradient>
          <clipPath id="nd-glass"><rect x="14" y="14" width="232" height="192" rx="6" /></clipPath>
        </defs>
        <g clip-path="url(#nd-glass)">
          <rect width="260" height="220" fill="url(#nd-night)" />
          <rect width="260" height="220" fill="url(#nd-dawn)" class="sky-dawn" />
          <rect width="260" height="220" fill="url(#nd-day)" class="sky-day" />
          <g class="stars"><circle v-for="(st, k) in STARS" :key="k" :cx="st[0]" :cy="st[1]" :r="k % 3 ? 1.5 : 2.3" :style="{ '--k': `${k * 0.09}s`, animationDelay: `${k * 0.37}s` }" /></g>
          <g class="moon"><path d="M186 46 A26 26 0 1 0 206 88 A20 20 0 1 1 186 46 Z" fill="#FFF4D6" /></g>
          <g class="sun">
            <g class="rays"><path v-for="k in 12" :key="k" d="M0 -40 V-52" :transform="`rotate(${k * 30})`" /></g>
            <circle r="34" fill="#FFD25A" opacity=".3" /><circle r="25" fill="#FFC23A" />
          </g>
          <path d="M14 196 Q70 166 120 184 T246 174 V206 H14 Z" class="hill" />
          <path d="M14 206 Q90 186 160 196 T246 192 V206 Z" class="hill2" />
        </g>
        <rect x="14" y="14" width="232" height="192" rx="6" class="frame" />
        <path d="M130 14 V206 M14 110 H246" class="bars" />
        <rect x="4" y="204" width="252" height="12" rx="4" class="sill" />
      </svg>

      <svg viewBox="0 0 110 150" class="chair"><rect x="8" y="4" width="94" height="120" rx="18" /><rect x="22" y="18" width="66" height="70" rx="12" class="pad" /></svg>
      <div class="worker"><div class="walk"><Person :mood="mood" :pose="pose" uid="nd-w" /></div></div>

      <svg viewBox="0 0 480 130" class="desk">
        <path d="M14 2 H466 L478 24 H2 Z" class="top" />
        <rect x="8" y="24" width="464" height="102" rx="4" class="front" />
        <path d="M24 60 H456 M24 96 H456" class="groove" />
        <circle cx="240" cy="42" r="3.5" class="knob" /><circle cx="240" cy="78" r="3.5" class="knob" />
      </svg>

      <div class="lamphalo" />
      <svg viewBox="0 0 1280 720" class="cone"><defs>
        <linearGradient id="nd-cone" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#FFD98A" stop-opacity=".55" /><stop offset="1" stop-color="#FFD98A" stop-opacity="0" /></linearGradient>
      </defs><path d="M332 386 L366 400 L560 490 L268 490 Z" fill="url(#nd-cone)" /></svg>
      <svg viewBox="0 0 170 200" class="lamp">
        <defs>
          <radialGradient id="nd-inner" cx=".5" cy=".9" r=".7"><stop offset="0" stop-color="#FFF6D8" /><stop offset="1" stop-color="#FFC66B" /></radialGradient>
          <linearGradient id="nd-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#28477E" /><stop offset="1" stop-color="#0B2A5B" /></linearGradient>
        </defs>
        <ellipse cx="44" cy="190" rx="38" ry="8" fill="#0B2A5B" opacity=".14" />
        <path d="M12 188 Q12 172 44 170 Q76 172 76 188 Z" fill="url(#nd-base)" stroke="#0B2A5B" stroke-width="2.5" stroke-linejoin="round" />
        <path d="M44 172 L62 98" class="arm" /><path d="M50 170 L67 102" class="spring" />
        <path d="M62 98 L128 64" class="arm" /><path d="M66 104 L130 72" class="spring" />
        <circle cx="62" cy="98" r="6" class="joint" /><circle cx="44" cy="170" r="5" class="joint" /><circle cx="128" cy="64" r="5.5" class="joint" />
        <g transform="rotate(38 128 64)">
          <path d="M118 58 L138 58 L156 96 L100 96 Z" class="shade" />
          <ellipse cx="128" cy="96" rx="28" ry="6" fill="url(#nd-inner)" class="mouth" />
          <circle cx="128" cy="92" r="7" class="bulb" />
        </g>
      </svg>

      <i v-for="i in N" :key="i" class="sheet" :class="{ fly: flying[i - 1], slow: slow[i - 1], inb: piles.B.includes(i - 1) }" :style="sheetStyle(i - 1)" />

      <svg viewBox="0 0 150 118" class="dossier">
        <path d="M6 18 Q6 10 14 10 H54 L64 20 H136 Q144 20 144 28 V108 Q144 114 136 114 H14 Q6 114 6 108 Z" class="dback" />
        <rect x="26" y="12" width="44" height="50" rx="3" class="dpage" /><rect x="76" y="16" width="44" height="46" rx="3" class="dpage" />
        <path d="M3 44 Q3 38 9 38 H141 Q147 38 147 44 V108 Q147 114 141 114 H9 Q3 114 3 108 Z" class="dfront" />
        <path d="M60 76 l8 8 l16 -18" class="dtick" />
      </svg>
      <div class="doslabel"><b>No-profit clinical studies</b><span>Sant'Andrea University Hospital</span></div>
      <div class="today">
        <svg viewBox="0 0 24 24" class="tdi"><path d="M15 3 A9 9 0 1 0 21 15 A7 7 0 1 1 15 3 Z" /></svg>
        <svg viewBox="0 0 24 24" class="tdi"><circle cx="12" cy="12" r="9" /><path d="M12 7 V12 L15.5 14" /></svg>
        <span><b>Today:</b> slow and repetitive</span>
      </div>
      <div class="stamp" :class="{ on: clicks === 2 || clicks === 3 }"><span :key="tick">✓</span></div>

      <svg viewBox="0 0 470 200" class="bench">
        <g transform="translate(36 6)" class="rack">
          <rect x="0" y="62" width="82" height="16" rx="3" class="rk" />
          <g v-for="(c, k) in ['#7FD3FF', '#F47B20', '#9EE6A8', '#7FD3FF']" :key="k" :transform="`translate(${10 + k * 18} 14)`">
            <rect x="0" y="0" width="10" height="56" rx="5" class="tube" /><rect x="1.5" :y="24 + (k % 2) * 10" width="7" :height="30 - (k % 2) * 10" rx="3.5" :fill="c" />
          </g>
        </g>
        <g transform="translate(226 0)" class="micro">
          <path d="M0 82 H74" class="mb" /><path d="M18 82 V66 H56 V82" class="mp" />
          <path d="M44 66 Q60 40 46 18" class="mpl" /><rect x="14" y="44" width="38" height="8" rx="3" class="mp" />
          <path d="M22 22 L44 6 L52 16 L30 32 Z" class="mp" /><path d="M14 26 L24 18" class="mpl" />
          <circle cx="58" cy="52" r="6" class="mk" /><circle cx="33" cy="38" r="4" class="ml" />
        </g>
        <g transform="translate(366 22)">
          <path d="M14 0 V18 L2 52 Q0 58 8 58 H36 Q44 58 42 52 L30 18 V0" class="flask" /><path d="M7 40 H37 L42 52 Q44 58 36 58 H8 Q0 58 2 52 Z" class="liq" />
          <circle cx="18" cy="48" r="2.5" class="bub" /><circle cx="27" cy="44" r="2" class="bub b2" />
        </g>
        <path d="M10 82 H460 L468 102 H2 Z" class="btop" />
        <rect x="8" y="102" width="454" height="96" rx="4" class="bfront" />
        <path d="M160 102 V198 M310 102 V198" class="bline" /><path d="M140 140 v20 M180 140 v20 M290 140 v20 M330 140 v20" class="bhandle" />
      </svg>
      <div class="floor" />
    </div>

    <svg viewBox="0 0 1280 720" class="beam" :class="{ on: beaming }"><defs>
      <linearGradient id="nd-beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FE3F0" stop-opacity=".75" /><stop offset="1" stop-color="#7FE3F0" stop-opacity=".08" /></linearGradient>
    </defs><path d="M694 424 L716 424 L560 492 L440 492 Z" fill="url(#nd-beam)" /></svg>
    <div class="botpos">
      <div class="botenter">
        <div class="botspin">
          <div class="botfly">
            <i class="thrust" />
            <svg viewBox="-60 -60 120 150" class="botsvg">
              <g class="barm l"><rect x="-31" y="22" width="13" height="34" rx="6.5" class="gold" /><circle cx="-24.5" cy="59" r="6.5" class="navy" /></g>
              <g class="barm r"><rect x="18" y="22" width="13" height="34" rx="6.5" class="gold" /><circle cx="24.5" cy="59" r="6.5" class="navy" /></g>
              <path d="M-30 -20 Q-44 -44 -30 -52 Q-18 -42 -14 -30 Z" class="ear" /><path d="M30 -20 Q44 -44 30 -52 Q18 -42 14 -30 Z" class="ear" />
              <path d="M-42 4 Q-44 30 0 32 Q44 30 42 4 Q40 -4 0 -4 Q-40 -4 -42 4 Z" class="gold" />
              <path d="M-34 8 Q-36 -36 0 -36 Q36 -36 34 8 Q0 14 -34 8 Z" class="visor" />
              <path d="M-35 8 Q0 15 35 8" class="rim" />
              <rect x="-11" y="-42" width="22" height="6" rx="3" class="topl" />
              <g class="beyes"><path d="M-18 -8 Q-12 -17 -6 -8 M6 -8 Q12 -17 18 -8" class="eyh" /></g>
              <path d="M-6 2 q3 4 6 0 q3 4 6 0" class="mouth2" />
              <text y="23" text-anchor="middle" class="htag">GPT-4o</text>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="bubble" :class="{ on: ping > 0 && clicks === 4 }"><b>Report ready</b><span>3 issues found</span></div>

    <div class="finlogo"><img src="/dossiercheck-logo.png" alt="DossierCheck"></div>
    <div class="sweep" />
    <p class="fincap">An app powered by a harnessed AI</p>
  </div>
</template>

<style scoped>
.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 20; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .5s ease, transform .5s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .3s; }
.heading span:first-child { position: relative; }

.scene { position: absolute; inset: 0; transition: opacity .8s ease, filter .8s ease; }
.s4 .scene { opacity: .16; filter: blur(1.5px) saturate(.5); }

.window { position: absolute; left: 330px; top: 96px; width: 260px; height: 220px; z-index: 1; }
.frame { fill: none; stroke: #0B2A5B; stroke-width: 4; }
.bars { stroke: #0B2A5B; stroke-width: 4; }
.sill { fill: #E9EEF6; stroke: #0B2A5B; stroke-width: 3; }
.hill { fill: #0E2B5E; transition: fill 2s ease 1s; } .hill2 { fill: #0A2350; transition: fill 2s ease 1s; }
.s2 .hill, .s3 .hill, .s4 .hill { fill: #8CC77A; } .s2 .hill2, .s3 .hill2, .s4 .hill2 { fill: #6FB062; }
.sky-dawn, .sky-day { opacity: 0; }
.s3 .sky-day, .s4 .sky-day, .s2:not(.live) .sky-day { opacity: 1; }
.live.s2 .sky-dawn { animation: dawn 3s ease-in-out both; }
@keyframes dawn { 0% { opacity: 0; } 35%, 55% { opacity: 1; } 100% { opacity: 0; } }
.live.s2 .sky-day { animation: day 3s ease-in-out both; }
@keyframes day { 0%, 45% { opacity: 0; } 100% { opacity: 1; } }
.stars circle { fill: #FFFFFF; animation: twinkle 2.6s ease-in-out infinite; transition: opacity .5s ease var(--k); }
@keyframes twinkle { 50% { opacity: .3; } }
.s2 .stars circle, .s3 .stars circle, .s4 .stars circle { opacity: 0; }
.moon { transform-box: view-box; }
.live.s2 .moon { animation: moonset 2.2s cubic-bezier(.5, 0, .7, 1) both; }
@keyframes moonset { 0% { transform: none; } 50% { transform: translate(28px, 46px); } 100% { transform: translate(44px, 150px); opacity: 0; } }
.s2:not(.live) .moon, .s3 .moon, .s4 .moon { opacity: 0; }
.sun { transform: translate(40px, 250px); }
.live.s2 .sun { animation: sunrise 2.8s cubic-bezier(.3, .6, .35, 1) .5s both; }
@keyframes sunrise { 0% { transform: translate(40px, 250px); } 55% { transform: translate(64px, 120px); } 100% { transform: translate(84px, 68px); } }
.s2:not(.live) .sun, .s3 .sun, .s4 .sun { transform: translate(84px, 68px); }
.rays path { stroke: #FFC23A; stroke-width: 3; stroke-linecap: round; }
.rays { animation: spin 14s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.winhalo { position: absolute; left: 196px; top: 0; width: 528px; height: 430px; border-radius: 50%; z-index: 0; pointer-events: none; transition: opacity 2.4s ease .6s; }
.winhalo.night { background: radial-gradient(closest-side, rgba(31, 79, 176, .26), rgba(31, 79, 176, 0)); }
.winhalo.day { background: radial-gradient(closest-side, rgba(255, 196, 80, .4), rgba(255, 196, 80, 0)); opacity: 0; }
.s2 .winhalo.night, .s3 .winhalo.night, .s4 .winhalo.night { opacity: 0; }
.s2 .winhalo.day, .s3 .winhalo.day, .s4 .winhalo.day { opacity: 1; }
.shaft { position: absolute; inset: 0; width: 1280px; height: 720px; z-index: 1; pointer-events: none; }
.shn, .shd { transition: opacity 2.4s ease .6s; } .shd { opacity: 0; }
.s2 .shn, .s3 .shn, .s4 .shn { opacity: 0; } .s2 .shd, .s3 .shd, .s4 .shd { opacity: 1; }

.chair { position: absolute; left: 345px; top: 352px; width: 110px; height: 150px; z-index: 3; transition: transform .9s cubic-bezier(.3, 1.3, .5, 1) .15s; }
.chair rect { fill: #1F5FD6; stroke: #0B2A5B; stroke-width: 3; }
.chair .pad { fill: #4F8BF5; stroke: none; }
.s2 .chair, .s3 .chair, .s4 .chair { transform: translateX(-46px) rotate(-6deg); }
.worker { position: absolute; left: 320px; top: 304px; width: 160px; height: 270px; z-index: 4; transition: transform .7s cubic-bezier(.3, 1.3, .5, 1); }
.s1 .worker { transform: translateY(-4px); }
.s2 .worker { transform: translateY(-16px); }
.s3 .worker, .s4 .worker { transform: translate(520px, -16px); transition: transform 2.3s cubic-bezier(.45, 0, .35, 1) .2s; }
.walk { width: 100%; height: 100%; }
.live.s3 .walk { animation: walk .34s ease-in-out .25s 6 alternate; }
@keyframes walk { from { transform: translateY(0) rotate(-2deg); } to { transform: translateY(-6px) rotate(2deg); } }

.desk { position: absolute; left: 200px; top: 486px; width: 480px; height: 130px; z-index: 6; overflow: visible; }
.desk .top { fill: #E9EEF6; stroke: #0B2A5B; stroke-width: 3; stroke-linejoin: round; }
.desk .front { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 3; }
.desk .groove { stroke: #D5DCE8; stroke-width: 2; }
.desk .knob { fill: #0B2A5B; }
.lamp { position: absolute; left: 204px; top: 298px; width: 170px; height: 200px; z-index: 7; overflow: visible; }
.lamp .arm { fill: none; stroke: #0B2A5B; stroke-width: 6; stroke-linecap: round; }
.lamp .spring { fill: none; stroke: #8C96A8; stroke-width: 2; stroke-dasharray: 3 3; }
.lamp .joint { fill: #F47B20; stroke: #0B2A5B; stroke-width: 2.5; }
.lamp .shade { fill: #F47B20; stroke: #0B2A5B; stroke-width: 3; stroke-linejoin: round; }
.lamp .mouth { stroke: #0B2A5B; stroke-width: 2; transition: fill .3s; }
.lamp .bulb { fill: #FFFBEA; transition: fill .3s; }
.s2 .lamp .mouth, .s3 .lamp .mouth, .s4 .lamp .mouth { fill: #E9EEF6; }
.s2 .lamp .bulb, .s3 .lamp .bulb, .s4 .lamp .bulb { fill: #C9D2E0; }
.lamphalo { position: absolute; left: 230px; top: 330px; width: 420px; height: 260px; border-radius: 50%; z-index: 5; pointer-events: none;
  background: radial-gradient(closest-side, rgba(255, 200, 90, .55), rgba(255, 200, 90, 0)); animation: breathe 3.2s ease-in-out infinite; }
@keyframes breathe { 50% { opacity: .85; } }
.cone { position: absolute; inset: 0; width: 1280px; height: 720px; z-index: 5; pointer-events: none; }
.s2 .lamphalo, .s3 .lamphalo, .s4 .lamphalo, .s2 .cone, .s3 .cone, .s4 .cone { opacity: 0; animation: none; }
.live.s2 .lamphalo, .live.s2 .cone { animation: off .7s steps(1) 1.4s both; }
@keyframes off { 0% { opacity: 1; } 20% { opacity: .2; } 35% { opacity: .9; } 55% { opacity: .1; } 70% { opacity: .5; } 85%, 100% { opacity: 0; } }
.live.s2 .lamp .mouth, .live.s2 .lamp .bulb { transition-delay: 2s; }

.sheet { position: absolute; left: 0; top: 0; width: 84px; height: 9px; box-sizing: border-box; background: #FFFFFF; border: 2px solid #0B2A5B; border-radius: 2px; z-index: 8; overflow: hidden; }
.sheet.slow { z-index: 9; transition: transform 1.2s cubic-bezier(.45, 0, .55, 1); }
.sheet.fly { z-index: 11; animation: arc .9s cubic-bezier(.45, 0, .4, 1) both; }
.sheet.fly::before { content: ''; position: absolute; left: 6px; right: 6px; top: 10px; height: 30px; background: repeating-linear-gradient(to bottom, #B4C2DA 0 3px, transparent 3px 7px); }
.sheet.fly::after { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 8px; background: linear-gradient(rgba(127, 227, 240, 0), rgba(127, 227, 240, .9)); animation: scan .9s linear both; }
@keyframes arc {
  0% { transform: translate(var(--fx), var(--fy)); width: 84px; height: 9px; }
  18% { width: 50px; height: 62px; }
  50% { transform: translate(var(--mx), var(--my)) rotate(-8deg); width: 50px; height: 62px; box-shadow: 0 10px 20px rgba(11, 42, 91, .18); }
  82% { width: 50px; height: 62px; }
  92% { transform: translate(var(--tx), calc(var(--ty) - 4px)); width: 84px; height: 9px; }
  100% { transform: translate(var(--tx), var(--ty)); width: 84px; height: 9px; }
}
@keyframes scan { 0%, 25% { transform: translateY(-8px); opacity: 0; } 30% { opacity: 1; } 70% { transform: translateY(62px); opacity: 1; } 75%, 100% { opacity: 0; } }
.stamp { position: absolute; left: 594px; top: 404px; width: 36px; height: 36px; z-index: 12; opacity: 0; }
.stamp.on { opacity: 1; }
.stamp span { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: #1F5FD6; color: #FFFFFF; font-weight: 800; font-size: 20px; box-shadow: 0 4px 10px rgba(31, 95, 214, .3);
  animation: stampin 1s cubic-bezier(.3, 1.6, .5, 1) both; }
@keyframes stampin { 0% { transform: scale(1.9) rotate(-25deg); opacity: 0; } 25% { transform: scale(.9) rotate(4deg); opacity: 1; } 40% { transform: scale(1.05); } 70% { transform: none; opacity: 1; } 100% { transform: translateY(-12px); opacity: 0; } }

.dos .sheet.inb { opacity: 0; transition: opacity .45s ease .25s; }
.dossier { position: absolute; left: 540px; top: 398px; width: 130px; height: 102px; z-index: 9; overflow: visible; opacity: 0; transform: scale(.4) translateY(30px); transform-origin: 50% 100%;
  transition: opacity .3s ease, transform .3s ease; }
.dos .dossier { opacity: 1; transform: none; transition: opacity .35s ease .3s, transform .6s cubic-bezier(.3, 1.6, .5, 1) .3s; }
.dback { fill: #FFC08F; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.dpage { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; }
.dfront { fill: #F47B20; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.dtick { fill: none; stroke: #FFFFFF; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
.doslabel { position: absolute; left: 392px; top: 330px; width: 258px; box-sizing: border-box; padding: 9px 14px; z-index: 9; display: flex; flex-direction: column; gap: 1px;
  border: 2px solid #0B2A5B; border-radius: 12px; background: #FFFFFF; box-shadow: 0 8px 20px rgba(11, 42, 91, .1);
  opacity: 0; transform: translateY(10px); transition: opacity .3s ease, transform .3s ease; }
.doslabel::after { content: ''; position: absolute; left: 196px; bottom: -11px; width: 16px; height: 16px; background: #FFFFFF; border-right: 2px solid #0B2A5B; border-bottom: 2px solid #0B2A5B; transform: rotate(45deg); }
.doslabel b { font-family: var(--font-display); font-size: 17px; font-weight: 800; color: var(--ink); }
.doslabel span { font-size: 14px; font-weight: 600; color: #C55A0E; }
.dos .doslabel { opacity: 1; transform: none; transition: opacity .4s ease .75s, transform .5s cubic-bezier(.3, 1.4, .5, 1) .75s; }
.today { position: absolute; left: 196px; top: 398px; z-index: 9; display: flex; align-items: center; gap: 6px; padding: 7px 14px 7px 10px; border-radius: 999px; background: #0B2A5B; color: #FFFFFF; font-size: 15px; box-shadow: 0 6px 16px rgba(11, 42, 91, .25); opacity: 0; transform: translateY(10px) scale(.9); transition: opacity .3s ease, transform .3s ease; }
.c5 .today { opacity: 1; transform: none; transition: opacity .4s ease, transform .5s cubic-bezier(.3, 1.4, .5, 1); }
.today b { font-weight: 800; }
.tdi { width: 20px; height: 20px; fill: none; stroke: #FFE7A3; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.live.c5 .today { transition-delay: 1.2s; }

.bench { position: absolute; left: 686px; top: 404px; width: 470px; height: 200px; z-index: 6; overflow: visible; }
.btop { fill: #E6EEFC; stroke: #0B2A5B; stroke-width: 3; stroke-linejoin: round; }
.bfront { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 3; }
.bline { stroke: #D5DCE8; stroke-width: 2; } .bhandle { stroke: #0B2A5B; stroke-width: 3; stroke-linecap: round; }
.rk { fill: #E9EEF6; stroke: #0B2A5B; stroke-width: 2.5; }
.tube { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; }
.mb { stroke: #0B2A5B; stroke-width: 5; stroke-linecap: round; }
.mp { fill: #E9EEF6; stroke: #0B2A5B; stroke-width: 3; stroke-linejoin: round; }
.mpl { fill: none; stroke: #0B2A5B; stroke-width: 6; stroke-linecap: round; }
.mk { fill: #F47B20; stroke: #0B2A5B; stroke-width: 2; transform-box: fill-box; transform-origin: center; }
.arrived .mk { animation: knob 1.1s ease-in-out infinite alternate; }
@keyframes knob { to { transform: rotate(90deg) scale(1.1); } }
.ml { fill: #7FD3FF; stroke: #0B2A5B; stroke-width: 1.5; }
.arrived .ml { animation: lens 1.8s ease-in-out infinite; }
@keyframes lens { 50% { fill: #FFFFFF; } }
.flask { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 3; stroke-linejoin: round; }
.liq { fill: #7FD3FF; opacity: .8; }
.bub { fill: #FFFFFF; animation: bubb 1.6s ease-in infinite; }
.bub.b2 { animation-delay: .7s; }
@keyframes bubb { 0% { transform: translateY(0); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-14px); opacity: 0; } }
.floor { position: absolute; left: 80px; right: 80px; top: 612px; height: 2px; z-index: 2; background: linear-gradient(90deg, transparent, #D5DCE8 15%, #D5DCE8 85%, transparent); }

.botpos { position: absolute; left: 0; top: 0; width: 0; height: 0; z-index: 12; transform: translate(780px, 330px); opacity: 0; transition: transform 1s cubic-bezier(.4, 0, .25, 1); }
.bot .botpos { opacity: 1; }
.s1 .botpos, .s2 .botpos, .s3 .botpos { transform: translate(706px, 380px); transition-duration: .65s; }
.s4 .botpos { transform: translate(640px, 236px); transition-duration: 1.2s; }
.entering .botenter { animation: flyin 1.5s cubic-bezier(.35, 0, .3, 1) both; }
@keyframes flyin {
  0% { transform: translate(700px, -260px) rotate(-18deg); }
  45% { transform: translate(330px, -250px) rotate(-22deg); }
  78% { transform: translate(-30px, 18px) rotate(-6deg) scale(1); }
  88% { transform: translate(6px, -4px) rotate(5deg) scale(1.08, .92); }
  100% { transform: none; }
}
.live.s4 .botspin { animation: spinin 1.2s cubic-bezier(.4, 0, .25, 1) both; }
@keyframes spinin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
.botfly { position: absolute; left: -40px; top: -50px; width: 80px; height: 100px; animation: hover 1.8s ease-in-out infinite alternate; transition: transform 1.2s cubic-bezier(.3, 1.3, .5, 1); }
@keyframes hover { from { translate: 0 -5px; } to { translate: 0 5px; } }
.s4 .botfly { transform: scale(2.2); }
.s4 .thrust { opacity: 0; animation: none; }
.thrust { position: absolute; left: 24px; top: 80px; width: 32px; height: 20px; border-radius: 50%; background: radial-gradient(closest-side, rgba(127, 227, 240, .8), rgba(127, 227, 240, 0)); animation: thr .18s ease-in-out infinite alternate; }
@keyframes thr { from { transform: scale(.8, .7); opacity: .6; } to { transform: scale(1.1, 1.2); opacity: 1; } }
.botsvg { position: relative; width: 100%; height: 100%; overflow: visible; }
.gold { fill: #C49A3E; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.navy { fill: #0B2A5B; }
.ear { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.visor { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; }
.rim { fill: none; stroke: #DFF6FF; stroke-width: 2; stroke-linecap: round; }
.topl { fill: #DFF6FF; stroke: #0B2A5B; stroke-width: 1.5; }
.eyh { fill: none; stroke: #7FE3F0; stroke-width: 3; stroke-linecap: round; }
.beyes { transform-box: view-box; transform-origin: 0 -12px; animation: bblink 3.8s infinite; }
@keyframes bblink { 0%, 90%, 100% { transform: scaleY(1); } 94% { transform: scaleY(.15); } }
.mouth2 { fill: none; stroke: #7FE3F0; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.htag { font-family: var(--font-display); font-size: 8.5px; font-weight: 800; fill: #0B2A5B; }
.barm { transform-box: view-box; transition: transform .5s cubic-bezier(.3, 1.4, .5, 1); }
.barm.l { transform-origin: -24.5px 26px; } .barm.r { transform-origin: 24.5px 26px; }
.s0.bot:not(.entering) .barm.r { animation: bwave .45s ease-in-out 3 alternate; }
@keyframes bwave { from { transform: rotate(-120deg); } to { transform: rotate(-165deg); } }
.s1 .barm.l, .s2 .barm.l { animation: work .5s ease-in-out infinite alternate; }
.s1 .barm.r, .s2 .barm.r { animation: work .5s ease-in-out .25s infinite alternate; }
@keyframes work { from { transform: rotate(20deg); } to { transform: rotate(55deg); } }
.s4 .barm.r { transform: rotate(-150deg); } .s4 .barm.l { transform: rotate(150deg); }

.beam { position: absolute; inset: 0; width: 1280px; height: 720px; z-index: 10; pointer-events: none; opacity: 0; transition: opacity .3s ease .1s; }
.beam path { transform-box: view-box; transform-origin: 705px 424px; transform: scaleY(0); transition: transform .35s ease-in; }
.beam.on path { transform: none; transition: transform .4s cubic-bezier(.3, 1.2, .5, 1); }
.beam.on { opacity: 1; animation: pulse .5s ease-in-out .4s infinite alternate; }
@keyframes pulse { from { opacity: .65; } to { opacity: 1; } }

.bubble { position: absolute; left: 716px; top: 244px; width: 176px; box-sizing: border-box; padding: 10px 14px; border: 2px solid #1F5FD6; border-radius: 14px; background: #FFFFFF; box-shadow: 0 8px 20px rgba(31, 95, 214, .15); z-index: 14;
  display: flex; flex-direction: column; gap: 2px; opacity: 0; transform: scale(.5); transform-origin: 14px 100%; transition: opacity .3s ease, transform .5s cubic-bezier(.3, 1.6, .5, 1); }

.bubble::before, .bubble::after { content: ''; position: absolute; clip-path: polygon(34% 0, 100% 0, 0 100%); }
.bubble::before { left: 6px; bottom: -26px; width: 30px; height: 28px; background: #1F5FD6; }
.bubble::after { left: 10px; bottom: -20px; width: 23px; height: 22px; background: #FFFFFF; }
.bubble.on { opacity: 1; transform: none; transition-delay: .15s; }
.bubble b { font-family: var(--font-display); font-size: 16px; color: #1F5FD6; }
.bubble span { font-size: 14px; color: var(--ink); }

.finlogo { position: absolute; left: 400px; top: 388px; width: 480px; z-index: 15; clip-path: inset(0 100% 0 0); }
.finlogo img { display: block; width: 100%; }
.s4 .finlogo { clip-path: inset(-10px -10px -10px -10px); transition: clip-path .9s cubic-bezier(.5, 0, .4, 1) 1.1s; }
.sweep { position: absolute; left: 384px; top: 372px; width: 24px; height: 108px; border-radius: 12px; opacity: 0; z-index: 16; pointer-events: none;
  background: linear-gradient(90deg, rgba(31, 95, 214, 0), rgba(31, 95, 214, .55), rgba(31, 95, 214, 0)); }
.live.s4 .sweep { animation: sweep .9s cubic-bezier(.5, 0, .4, 1) 1.1s both; }
@keyframes sweep { 0% { opacity: 0; transform: translateX(0); } 8% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; transform: translateX(500px); } }
.fincap { position: absolute; left: 0; right: 0; top: 478px; margin: 0; text-align: center; z-index: 15; font-size: 24px; font-weight: 600; color: #33456B;
  opacity: 0; transform: translateY(10px); transition: opacity .5s ease, transform .5s ease; }
.s4 .fincap { opacity: 1; transform: none; transition-delay: 2s; }
</style>
