<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useIsSlideActive } from '@slidev/client'

const active = useIsSlideActive()
const ag = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }
watch(active, (a) => {
  clearTimers()
  ag.value = 0
  if (!a) return
  ;[[200, 1], [700, 2], [1250, 3], [1800, 4], [2350, 5], [2900, 6], [3450, 7], [4400, 8], [6300, 9]]
    .forEach(([ms, p]) => later(ms, () => { ag.value = p }))
}, { immediate: true })
onBeforeUnmount(clearTimers)

const Y0 = 172, DY = 88
const ITEMS = [
  { t: 'AI Today: A Powerful Tool', s: 'slides 2–3' },
  { t: 'The Problem: Preparing a Clinical Study Dossier', s: 'slides 4–7' },
  { t: 'DossierCheck: Shared Workspace, Automatic Analysis and Assistant', s: 'slides 8–10' },
  { t: 'Evaluation and Results', s: 'slides 11–12' },
  { t: 'Impact on the Process: Advantages and Estimated Workload', s: 'slides 13–14', me: true },
  { t: 'Future Directions and Conclusion', s: 'slides 15–16' },
].map((it, i) => ({ ...it, y: Y0 + i * DY }))

const bot = computed(() => {
  const a = ag.value
  let p = { x: 1260, y: 90, k: 0.5 }
  if (a >= 1) p = { x: 1120, y: 110, k: 0.5 }
  if (a >= 2 && a <= 7) p = { x: 104, y: ITEMS[a - 2].y - 4, k: 0.42 }
  if (a === 8) p = { x: 990, y: ITEMS[4].y - 8, k: 0.5 }
  if (a >= 9) p = { x: 104, y: ITEMS[0].y - 4, k: 0.42 }
  return { transform: `translate(${p.x - 60}px, ${p.y - 60}px) scale(${p.k})` }
})
</script>

<template>
  <div class="stage" :class="`ag${ag}`">
    <h2 class="display heading">Agenda</h2>

    <svg viewBox="0 0 1280 720" class="lay">
      <line x1="170" :y1="ITEMS[0].y" x2="170" :y2="ITEMS[5].y" class="track" />
      <line x1="170" :y1="ITEMS[0].y" x2="170" :y2="ITEMS[5].y" class="trace" :style="{ strokeDasharray: 5 * DY, strokeDashoffset: 5 * DY }" />
    </svg>

    <div v-for="(it, i) in ITEMS" :key="i" class="stop" :class="[`s${i + 1}`, { me: it.me }]" :style="{ top: `${it.y}px` }">
      <b class="num">{{ i + 1 }}</b>
      <div class="card">
        <p class="txt">{{ it.t }}</p>
        <span class="sl">{{ it.s }}</span>
      </div>
    </div>

    <div class="stamp" :style="{ top: `${ITEMS[4].y}px` }">
      <svg viewBox="0 0 40 40" class="ico">
        <g class="gear"><path d="M21.23 10.51 L24.25 10.63 L24.25 15.37 L21.23 15.49 L20.58 17.06 L22.63 19.28 L19.28 22.63 L17.06 20.58 L15.49 21.23 L15.37 24.25 L10.63 24.25 L10.51 21.23 L8.94 20.58 L6.72 22.63 L3.37 19.28 L5.42 17.06 L4.77 15.49 L1.75 15.37 L1.75 10.63 L4.77 10.51 L5.42 8.94 L3.37 6.72 L6.72 3.37 L8.94 5.42 L10.51 4.77 L10.63 1.75 L15.37 1.75 L15.49 4.77 L17.06 5.42 L19.28 3.37 L22.63 6.72 L20.58 8.94 Z" class="gr" /><circle cx="13" cy="13" r="7.4" class="gr" /><circle cx="13" cy="13" r="3.4" class="gh" /></g>
        <circle cx="26" cy="25" r="11" class="cw" /><path d="M26 18 V25 L31 28" class="ch" /><rect x="23.5" y="11" width="5" height="3" rx="1" class="ck" />
      </svg>
      <p><b>Management Engineering</b>analysis of the impact on process times</p>
      <i v-for="k in 6" :key="k" class="puff" :style="{ '--a': `${k * 60}deg` }" />
    </div>

    <div class="bot" :style="bot">
      <div class="bob">
        <svg viewBox="-60 -60 120 150" class="botsvg">
          <g class="barm l"><rect x="-31" y="22" width="13" height="34" rx="6.5" class="gold" /><circle cx="-24.5" cy="59" r="6.5" class="navy" /></g>
          <g class="barm r"><rect x="18" y="22" width="13" height="34" rx="6.5" class="gold" /><circle cx="24.5" cy="59" r="6.5" class="navy" /></g>
          <path d="M-30 -20 Q-44 -44 -30 -52 Q-18 -42 -14 -30 Z" class="ear" /><path d="M30 -20 Q44 -44 30 -52 Q18 -42 14 -30 Z" class="ear" />
          <path d="M-42 4 Q-44 30 0 32 Q44 30 42 4 Q40 -4 0 -4 Q-40 -4 -42 4 Z" class="gold" />
          <path d="M-34 8 Q-36 -36 0 -36 Q36 -36 34 8 Q0 14 -34 8 Z" class="visor" />
          <path d="M-35 8 Q0 15 35 8" class="rim" />
          <rect x="-11" y="-42" width="22" height="6" rx="3" class="topl" />
          <path d="M-18 -8 Q-12 -17 -6 -8 M6 -8 Q12 -17 18 -8" class="eyh" />
          <path d="M-6 2 q3 4 6 0 q3 4 6 0" class="mouth" />
          <text y="23" text-anchor="middle" class="htag">GPT-4o</text>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); opacity: 0; transform: translateY(10px); transition: opacity .45s ease, transform .45s ease; }
.stage:not(.ag0) .heading { opacity: 1; transform: none; }
.lay { position: absolute; inset: 0; width: 1280px; height: 720px; pointer-events: none; z-index: 1; }
.track { stroke: #E1E6EF; stroke-width: 4; stroke-linecap: round; stroke-dasharray: 2 10; }
.trace { stroke: #1F5FD6; stroke-width: 4; stroke-linecap: round; transition: stroke-dashoffset .55s linear; }
.ag3 .trace { stroke-dashoffset: 352 !important; } .ag4 .trace { stroke-dashoffset: 264 !important; }
.ag5 .trace { stroke-dashoffset: 176 !important; } .ag6 .trace { stroke-dashoffset: 88 !important; }
.stage:is(.ag7, .ag8, .ag9) .trace { stroke-dashoffset: 0 !important; }

.stop { position: absolute; left: 0; width: 1280px; height: 0; z-index: 3; }
.num { position: absolute; left: 150px; top: -20px; width: 40px; height: 40px; box-sizing: border-box; border-radius: 50%; background: #0B2A5B; border: 3px solid #FFFFFF; box-shadow: 0 0 0 2px #0B2A5B; color: #FFFFFF; display: grid; place-items: center; font-family: var(--font-display); font-size: 18px; font-weight: 800; transform: scale(0); }
.me .num { background: #F47B20; box-shadow: 0 0 0 2px #F47B20; }
.card { position: absolute; left: 214px; top: -31px; width: 940px; height: 62px; box-sizing: border-box; border: 2px solid #D5DCE8; border-radius: 12px; background: #FFFFFF; display: flex; align-items: center; padding: 0 20px; box-shadow: 0 6px 16px rgba(11, 42, 91, .06); opacity: 0; transform: translateX(60px); }
.me .card { border-color: #F47B20; background: #FFF7F0; }
.txt { margin: 0; flex: 1; font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--ink); white-space: nowrap; }
.sl { font-size: 13px; font-weight: 700; color: var(--mist); white-space: nowrap; }
.me .sl { visibility: hidden; }
.stop .num { transition: transform .45s cubic-bezier(.3, 1.8, .5, 1) .25s; }
.stop .card { transition: opacity .3s ease .3s, transform .6s cubic-bezier(.3, 1.4, .5, 1) .3s; }
.stage:is(.ag2, .ag3, .ag4, .ag5, .ag6, .ag7, .ag8, .ag9) .s1 :is(.num, .card), .stage:is(.ag3, .ag4, .ag5, .ag6, .ag7, .ag8, .ag9) .s2 :is(.num, .card),
.stage:is(.ag4, .ag5, .ag6, .ag7, .ag8, .ag9) .s3 :is(.num, .card), .stage:is(.ag5, .ag6, .ag7, .ag8, .ag9) .s4 :is(.num, .card),
.stage:is(.ag6, .ag7, .ag8, .ag9) .s5 :is(.num, .card), .stage:is(.ag7, .ag8, .ag9) .s6 :is(.num, .card) { transform: none; opacity: 1; }

.ag8 .s5 .card { animation: hit .5s cubic-bezier(.3, 1.6, .5, 1) .75s both; }
@keyframes hit { 30% { transform: translateY(5px) scale(1.01, .96); } }

.stamp { position: absolute; left: 864px; width: 260px; height: 0; z-index: 4; }
.stamp > svg, .stamp > p { opacity: 0; }
.stamp .ico { position: absolute; left: 0; top: -21px; width: 42px; height: 42px; }
.stamp p { position: absolute; left: 52px; top: -22px; margin: 0; font-size: 12.5px; font-weight: 700; line-height: 1.2; color: #C55A0E; white-space: nowrap; }
.stamp p b { display: block; font-family: var(--font-display); font-size: 17px; font-weight: 800; color: #F47B20; letter-spacing: .01em; }
.stage:is(.ag8, .ag9) .stamp > :is(svg, p) { opacity: 1; }
.ag8 .stamp > :is(svg, p) { animation: stampIn .5s cubic-bezier(.5, 0, .4, 1.4) .75s both; }
@keyframes stampIn { 0% { opacity: 0; transform: scale(2.2) rotate(-10deg); } 60% { opacity: 1; transform: scale(.94) rotate(1deg); } 100% { opacity: 1; transform: none; } }
.gr { fill: #F47B20; } .gh { fill: #FFF7F0; }
.gear { transform-box: view-box; transform-origin: 13px 13px; }
.ag9 .gear { animation: spin 6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.cw { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2.5; } .ch { fill: none; stroke: #F47B20; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; } .ck { fill: #0B2A5B; }
.puff { position: absolute; left: 120px; top: 0; width: 10px; height: 10px; margin: -5px; border-radius: 50%; background: #F9C79F; opacity: 0; }
.ag8 .puff { animation: puff .6s ease-out 1s both; }
@keyframes puff { 0% { opacity: 1; transform: rotate(var(--a)) translateY(0) scale(1); } 100% { opacity: 0; transform: rotate(var(--a)) translateY(-46px) scale(2); } }

.bot { position: absolute; left: 0; top: 0; width: 120px; height: 150px; z-index: 6; transform-origin: 60px 60px; transform: translate(1200px, 30px) scale(.5); transition: transform .5s cubic-bezier(.4, -.3, .4, 1.3); }
.ag1 .bot, .ag8 .bot, .ag9 .bot { transition: transform .9s cubic-bezier(.5, -.2, .35, 1.15); }
.bob { width: 100%; height: 100%; animation: bob 2.4s ease-in-out infinite; }
@keyframes bob { 50% { transform: translateY(-7px); } }
.stage:is(.ag2, .ag3, .ag4, .ag5, .ag6, .ag7) .bob { animation: hop .55s ease-out; }
@keyframes hop { 40% { transform: translateY(-12px) rotate(-6deg); } }

.ag8 .bob { animation: press .6s cubic-bezier(.5, 0, .4, 1) .55s both; }
@keyframes press { 0% { transform: none; } 35% { transform: translateY(-26px); } 60% { transform: translateY(10px) scale(1.06, .92); } 100% { transform: translateY(-4px); } }
.ag8 .barm.l { transform: rotate(20deg); } .ag8 .barm.r { transform: rotate(-20deg); }
.ag9 .barm.r { animation: wave .35s ease-in-out 4 alternate; }
@keyframes wave { from { transform: rotate(-120deg); } to { transform: rotate(-160deg); } }
.botsvg { width: 100%; height: 100%; overflow: visible; }
.gold { fill: #C49A3E; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.navy { fill: #0B2A5B; }
.ear { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.visor { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; }
.rim { fill: none; stroke: #DFF6FF; stroke-width: 2; stroke-linecap: round; }
.topl { fill: #DFF6FF; stroke: #0B2A5B; stroke-width: 1.5; }
.eyh { fill: none; stroke: #7FE3F0; stroke-width: 3; stroke-linecap: round; }
.mouth { fill: none; stroke: #7FE3F0; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.htag { font-family: var(--font-display); font-size: 8.5px; font-weight: 800; fill: #0B2A5B; }
.barm { transform-box: view-box; transition: transform .35s cubic-bezier(.3, 1.6, .5, 1); }
.barm.l { transform-origin: -24.5px 26px; } .barm.r { transform-origin: 24.5px 26px; }
</style>
