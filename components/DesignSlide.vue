<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const props = defineProps<{ frozen?: boolean, merging?: boolean }>()
const { $clicks } = useSlideContext()
const step = computed(() => props.frozen ? (props.merging ? 5 : 4) : unref($clicks) as number)
const active = useIsSlideActive()
const phase = ref(0)
const animate = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }
watch(active, (a) => {
  clearTimers()
  if (props.frozen) { phase.value = 3; animate.value = true; return }
  if (!a) { animate.value = false; phase.value = 0; return }
  if (step.value > 0) { animate.value = false; phase.value = 3; requestAnimationFrame(() => requestAnimationFrame(() => { animate.value = true })); return }
  animate.value = false
  phase.value = 0
  later(450, () => { animate.value = true; phase.value = 1 })
  later(800, () => { phase.value = 2 })
  later(1700, () => { phase.value = 3 })
}, { immediate: true })
onBeforeUnmount(clearTimers)

const BIG = { w: 290, h: 380, y: 178 }
const bigX = (i: number) => 39 + i * (BIG.w + 14)

const ROW = { x: 110, w: 360, h: 100, y0: 150, dy: 116 }
const rowY = (i: number) => ROW.y0 + i * ROW.dy
const COMP = { x: 590, w: 580 }

const cards = [
  { title: 'Incomplete documentation', example: 'Document lists and administrative forms to complete' },
  { title: 'Inconsistencies across documents', example: 'Illustrative example: the protocol moves from 5 to 6 visits, the budget still counts 5' },
  { title: 'Fragmented information and unclear versions', example: 'An updated contract had to be resent: the earlier email could not be found' },
  { title: 'Repeated checking and coordination', example: 'Each correction can bring another review and another wait' },
]
const comps = [
  { t: 'Required documents and completeness', d: 'Identifies the documents and information the study requires, and checks that they are complete' },
  { t: 'Cross-document comparison', d: 'Compares related information across files and highlights conflicting statements, with references to the passages' },
  { t: 'Shared dossier workspace', d: 'Documents, version history, and requests and responses linked to the study' },
  { t: 'Support for successive reviews', d: 'Traceable findings, version comparisons, and an assistant that helps users understand issues and find information' },
]

function cardStyle(i: number) {
  const row = phase.value >= 2
  return {
    left: `${row ? ROW.x : bigX(i)}px`,
    top: `${row ? rowY(i) : BIG.y}px`,
    width: `${row ? ROW.w : BIG.w}px`,
    height: `${row ? ROW.h : BIG.h}px`,
    transition: animate.value ? `left .8s cubic-bezier(.6, 0, .3, 1) ${i * 0.07}s, top .8s cubic-bezier(.6, 0, .3, 1) ${i * 0.07}s, width .8s cubic-bezier(.6, 0, .3, 1) ${i * 0.07}s, height .8s cubic-bezier(.6, 0, .3, 1) ${i * 0.07}s, opacity .4s ease, border-color .35s ease, box-shadow .35s ease` : 'none',
  }
}

const LOGO = { x: 320, y: 196, w: 640, h: 99 }
function compStyle(i: number) {
  const cx = COMP.x + COMP.w / 2, cy = rowY(i) + ROW.h / 2
  const tx = LOGO.x + LOGO.w / 2 - cx + (i - 1.5) * 90, ty = LOGO.y + LOGO.h / 2 - cy
  return { top: `${rowY(i)}px`, '--tx': `${tx}px`, '--ty': `${ty}px`, '--m': `${i * 0.07}s` }
}
</script>

<template>
  <div class="stage" :class="[`ph${phase}`, { anim: animate, merge: step >= 5 }]">
    <h2 class="display heading">
      <span :class="{ on: phase === 0 }">Four Recurring Difficulties</span>
      <span :class="{ on: phase >= 1 }">From Difficulties to Design</span>
    </h2>

    <p class="colh" :style="{ left: `${ROW.x}px`, width: `${ROW.w}px` }">Difficulty</p>
    <p class="colh" :style="{ left: `${COMP.x}px`, width: `${COMP.w}px` }">Design choice</p>

    <svg viewBox="0 0 1280 720" class="arrows">
      <g v-for="i in 4" :key="i" :class="{ on: step >= i }">
        <path :d="`M${ROW.x + ROW.w + 12} ${rowY(i - 1) + ROW.h / 2} H${COMP.x - 18}`" class="ar" />
        <path :d="`M${COMP.x - 28} ${rowY(i - 1) + ROW.h / 2 - 9} L${COMP.x - 17} ${rowY(i - 1) + ROW.h / 2} L${COMP.x - 28} ${rowY(i - 1) + ROW.h / 2 + 9}`" class="ah" />
      </g>
    </svg>

    <div
      v-for="(c, i) in cards" :key="c.title" class="card"
      :class="{ cur: step === i + 1 }" :style="cardStyle(i)"
    >
      <span class="num">{{ i + 1 }}</span>
      <div class="content">
        <h3>{{ c.title }}</h3>
        <DifficultyArt class="art" :i="i" :on="true" />
        <p class="ex">{{ c.example }}</p>
      </div>
    </div>

    <div
      v-for="(c, i) in comps" :key="c.t" class="comp" :class="{ on: step >= i + 1 }"
      :style="{ ...compStyle(i), left: `${COMP.x}px`, width: `${COMP.w}px`, height: `${ROW.h}px` }"
    >
      <svg viewBox="0 0 48 48" class="ic">
        <template v-if="i === 0">
          <rect x="11" y="6" width="26" height="36" rx="3" /><path d="M16 15 l2.5 2.5 l4 -5 M16 25 l2.5 2.5 l4 -5 M16 35 l2.5 2.5 l4 -5 M26 15.5 h6 M26 25.5 h6 M26 35.5 h6" />
        </template>
        <template v-else-if="i === 1">
          <rect x="4" y="9" width="16" height="22" rx="2" /><rect x="28" y="17" width="16" height="22" rx="2" />
          <path d="M8 16 h8 M8 21 h8 M32 24 h8 M32 29 h8" /><path d="M16 21 C 22 21 26 29 32 29" class="lk" /><circle cx="24" cy="25" r="3" class="dot" />
        </template>
        <template v-else-if="i === 2">
          <path d="M6 16 L24 7 L42 16 L24 25 Z" /><path d="M6 23 L24 32 L42 23" /><path d="M6 30 L24 39 L42 30" />
          <circle cx="37" cy="37" r="8" class="clk" /><path d="M37 32.5 V37 L40 39" class="clkh" />
        </template>
        <template v-else>
          <rect x="5" y="5" width="24" height="32" rx="3" /><path d="M10 13 l2 2 l3.5 -4 M10 21 l2 2 l3.5 -4 M10 29 l2 2 l3.5 -4 M19 13.5 h5 M19 21.5 h5 M19 29.5 h5" />
          <path d="M26 30 h17 v11 h-8 l-5 4 v-4 h-4 Z" class="bub" /><path d="M30 35.5 h.2 M34.5 35.5 h.2 M39 35.5 h.2" class="dots" />
        </template>
      </svg>
      <div class="ct">
        <p class="cn">{{ c.t }}</p>
        <p class="cd">{{ c.d }}</p>
      </div>
    </div>

    <div class="logo"><img src="/dossiercheck-logo.png" alt="DossierCheck"></div>
    <div class="sweep" />
  </div>
</template>

<style scoped>
.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 9; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .5s ease, transform .5s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .3s; }
.heading span:first-child { position: relative; }
.stage:not(.anim) .heading span { transition: none; }

.colh { position: absolute; top: 112px; margin: 0; font-size: 13px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--mist);
  opacity: 0; transform: translateY(6px); transition: opacity .45s ease, transform .45s ease; }
.ph3 .colh { opacity: 1; transform: none; }
.merge .colh { opacity: 0; transition-delay: 0s; }

.arrows { position: absolute; inset: 0; width: 1280px; height: 720px; pointer-events: none; z-index: 4; }
.ar { fill: none; stroke: #F47B20; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 110; stroke-dashoffset: 110; transition: stroke-dashoffset .45s ease; }
.ah { fill: none; stroke: #F47B20; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; opacity: 0; transition: opacity .2s ease; }
.arrows g.on .ar { stroke-dashoffset: 0; }
.arrows g.on .ah { opacity: 1; transition-delay: .35s; }
.arrows g { transition: opacity .4s ease; }
.merge .arrows g { opacity: 0; }
.stage:not(.anim) .ar, .stage:not(.anim) .ah { transition: none; }

.card { position: absolute; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 16px; background: #FFFFFF; box-shadow: 0 10px 26px rgba(11, 42, 91, .08); z-index: 5; overflow: hidden; }
.card.cur { border-color: #F47B20; box-shadow: 0 0 0 5px rgba(244, 123, 32, .16), 0 10px 26px rgba(11, 42, 91, .08); }
.merge .card { opacity: .0; }
.num { position: absolute; left: 16px; top: 16px; width: 38px; height: 38px; border-radius: 50%; background: #F47B20; color: #FFFFFF; display: grid; place-items: center;
  font-family: var(--font-display); font-weight: 700; font-size: 21px; transition: top .8s cubic-bezier(.6, 0, .3, 1); }
.content { position: absolute; left: 0; top: 0; width: 290px; height: 380px; box-sizing: border-box; padding: 16px 18px 18px; display: flex; flex-direction: column; transition: width .8s cubic-bezier(.6, 0, .3, 1), padding .8s cubic-bezier(.6, 0, .3, 1); }
h3 { margin: 0 0 0 50px; min-height: 62px; display: flex; align-items: center; font-family: var(--font-display); font-size: 23px; font-weight: 700; line-height: 1.12; color: var(--ink); transition: font-size .8s cubic-bezier(.6, 0, .3, 1); }
.art { flex: 1; margin-top: 10px; transition: opacity .3s ease; }
.ex { margin: 8px 0 0; font-size: 16.5px; line-height: 1.32; color: var(--mist); transition: opacity .3s ease; }
.stage:not(.ph0) .art, .stage:not(.ph0) .ex { opacity: 0; }
.ph2 .num, .ph3 .num { top: 29px; }
.ph2 .content, .ph3 .content { width: 360px; padding-top: 17px; }
.ph2 h3, .ph3 h3 { font-size: 20px; }
.stage:not(.anim) .num, .stage:not(.anim) .content, .stage:not(.anim) h3, .stage:not(.anim) .art, .stage:not(.anim) .ex { transition: none; }

.comp { position: absolute; box-sizing: border-box; display: flex; align-items: center; gap: 18px; padding: 0 22px 0 18px; z-index: 5;
  border: 2px solid #1F5FD6; border-radius: 16px; background: #FFFFFF; box-shadow: 0 10px 26px rgba(31, 95, 214, .1);
  opacity: 0; transform: translateX(-26px) scale(.96); transition: opacity .4s ease .4s, transform .55s cubic-bezier(.3, 1.4, .5, 1) .4s; }
.comp.on { opacity: 1; transform: none; }
.merge .comp { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(.14); transition: transform .75s cubic-bezier(.6, 0, .3, 1) calc(.25s + var(--m)), opacity .3s ease calc(.75s + var(--m)); }
.stage:not(.anim) .comp { transition: none; }
.ic { width: 56px; height: 56px; flex: none; fill: none; stroke: #1F5FD6; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.ic .tagf { fill: #F47B20; stroke: #F47B20; } .ic .tagt { fill: #FFFFFF; stroke: none; font-family: var(--font-display); font-size: 8px; font-weight: 800; }
.ic .lk { stroke: #F47B20; } .ic .dot { fill: #F47B20; stroke: none; }
.ic .bub { fill: #E6EEFC; } .ic .dots { stroke-width: 3; }
.ic .clk { fill: #FFFFFF; stroke: #F47B20; } .ic .clkh { stroke: #F47B20; }
.ic .sev { fill: #F47B20; stroke: #F47B20; } .ic .sevm { stroke: #FFFFFF; stroke-width: 2.6; }
.ct { min-width: 0; }
.cn { margin: 0; font-family: var(--font-display); font-size: 21px; font-weight: 800; color: #1F5FD6; }
.cd { margin: 3px 0 0; font-size: 15.5px; line-height: 1.3; color: var(--ink); }

.logo { position: absolute; left: 320px; top: 196px; width: 640px; z-index: 6; clip-path: inset(0 100% 0 0); }
.logo img { display: block; width: 100%; }
.merge .logo { clip-path: inset(-10px -10px -10px -10px); transition: clip-path .9s cubic-bezier(.5, 0, .4, 1) .85s; }
.sweep { position: absolute; left: 300px; top: 176px; width: 26px; height: 140px; border-radius: 13px; opacity: 0; z-index: 7; pointer-events: none;
  background: linear-gradient(90deg, rgba(31, 95, 214, 0), rgba(31, 95, 214, .55), rgba(31, 95, 214, 0)); }
.merge.anim .sweep { animation: sweep .9s cubic-bezier(.5, 0, .4, 1) .85s both; }
@keyframes sweep { 0% { opacity: 0; transform: translateX(0); } 8% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; transform: translateX(660px); } }
.stage:not(.anim) .logo { transition: none; }
</style>
