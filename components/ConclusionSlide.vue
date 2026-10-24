<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const props = defineProps<{ frozen?: boolean }>()
const sfx = props.frozen ? 'f' : ''
const { $clicks } = useSlideContext()
const step = computed(() => props.frozen ? 1 : unref($clicks) as number)
const active = useIsSlideActive()

const ce = ref(0)
const cl = ref(0)
const still = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }

watch(active, (a) => {
  clearTimers()
  if (props.frozen) { ce.value = 4; cl.value = 4; still.value = true; return }
  if (!a) { ce.value = 0; cl.value = 0; still.value = false; return }
  if (step.value > 0) { ce.value = 4; cl.value = 4; still.value = true; return }
  still.value = false; ce.value = 0; cl.value = 0
  ;[[300, 1], [900, 2], [1800, 3], [2700, 4]].forEach(([ms, p]) => later(ms, () => { ce.value = p }))
}, { immediate: true })

watch(step, (s) => {
  if (props.frozen || !active.value) return
  clearTimers()
  still.value = false
  ce.value = 4
  cl.value = 0
  if (s >= 1) [[200, 1], [1700, 2], [2900, 3], [3600, 4]].forEach(([ms, p]) => later(ms, () => { cl.value = p }))
})
onBeforeUnmount(clearTimers)

const doc = computed(() => {
  if (ce.value === 0) return { mood: 'happy', pose: 'cheer' }
  if (step.value >= 1 && cl.value === 1) return { mood: 'happy', pose: 'rest' }
  if (step.value >= 1 && cl.value >= 2) return { mood: 'happy', pose: 'cheer' }
  return { mood: 'happy', pose: 'rest' }
})
const patient = { outfit: 'sweater', outfitColor: '#7FA8EE', hair: 'grey', hairColor: '#C9CED8', skin: '#F1C9A5', glasses: true } as const

const bot = computed(() => {
  let p = { x: 580, y: 379, k: 0.7 }
  if (ce.value >= 3) p = { x: 885, y: 236, k: 0.66 }
  if (step.value >= 1 && cl.value >= 3) p = { x: 790, y: 226, k: 0.66 }
  return { transform: `translate(${p.x - 60}px, ${p.y - 60}px) scale(${p.k})` }
})

const PARTS = [
  { t: 'Applicable requirements', a: -90 }, { t: 'Structured analysis', a: -30 }, { t: 'Evidence and sources', a: 30 },
  { t: 'Human review', a: 90 }, { t: 'Shared workspace', a: 150 }, { t: 'Contextual assistant', a: 210 },
].map((p, i) => {
  const r = p.a * Math.PI / 180
  return { ...p, x: Math.cos(r) * 205, y: Math.sin(r) * 165, fx: Math.cos(r) * 700, fy: Math.sin(r) * 520, d: i * 0.22 }
})
const CAP = ['Organising AI around the workflow amplifies its capabilities', 'More time and expertise for research and patient care']
</script>

<template>
  <div class="stage" :class="[`ce${ce}`, `ck${step}`, `cl${cl}`, { cstill: still }]">
    <div v-if="!frozen" class="oldw"><FutureSlide frozen class="old" /></div>

    <h2 class="display heading">
      <span :class="{ on: ce === 0 }">Future Directions</span>
      <span :class="{ on: ce >= 1 }">Conclusion</span>
    </h2>
    <div class="cap"><p v-for="(c, i) in CAP" :key="i" :class="[{ on: ce >= 3 && step === i }, `cp${i}`]">{{ c }}</p></div>

    <div class="mech"><Mecha :asm="ce < 3" :head="ce < 3" core="chest" :exploded="ce >= 2" :glow="ce < 3" /></div>

    <div class="emb">
      <div class="halo" /><div class="rays" />
      <svg viewBox="-260 -220 520 440" class="wfring"><ellipse rx="205" ry="165" class="rpath" /></svg>
      <svg viewBox="0 0 240 240" class="chip">
        <defs><linearGradient :id="`d15-chip${sfx}`" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1F4FB0" /><stop offset="1" stop-color="#0B2A5B" /></linearGradient></defs>
        <g class="pins">
          <template v-for="k in 4" :key="k">
            <rect :x="72 + k * 19" y="44" width="6" height="22" rx="3" /><rect :x="72 + k * 19" y="174" width="6" height="22" rx="3" />
            <rect x="44" :y="72 + k * 19" width="22" height="6" rx="3" /><rect x="174" :y="72 + k * 19" width="22" height="6" rx="3" />
          </template>
        </g>
        <rect x="62" y="62" width="116" height="116" rx="22" :fill="`url(#d15-chip${sfx})`" stroke="#3B78E7" stroke-width="2.5" />
        <text x="120" y="137" text-anchor="middle" class="ai">AI</text>
        <path d="M152 82 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" class="spk" />
      </svg>
      <div v-for="(p, i) in PARTS" :key="i" class="part" :style="{ '--x': `${p.x}px`, '--y': `${p.y}px`, '--fx': `${p.fx}px`, '--fy': `${p.fy}px`, '--d': `${p.d}s` }">
        <i :class="i % 2 ? 'o' : 'b'" />{{ p.t }}
      </div>
    </div>

    <div class="pillar-clip">
      <svg viewBox="0 0 170 160" class="pillar">
        <defs><linearGradient :id="`d15-shaft${sfx}`" x1="0" x2="1"><stop offset="0" stop-color="#FFFFFF" /><stop offset=".6" stop-color="#F4F7FC" /><stop offset="1" stop-color="#DFE6F2" /></linearGradient></defs>
        <rect x="6" y="0" width="158" height="16" rx="3" class="cap1" />
        <rect x="20" y="16" width="130" height="10" class="cap2" />
        <rect x="30" y="26" width="110" height="110" :fill="`url(#d15-shaft${sfx})`" class="shaft" />
        <line v-for="k in 4" :key="k" :x1="30 + k * 22" y1="32" :x2="30 + k * 22" y2="130" class="flute" />
        <rect x="20" y="136" width="130" height="10" class="cap2" /><rect x="6" y="146" width="158" height="14" rx="3" class="cap1" />
      </svg>
    </div>
    <div class="glowd" />
    <div class="flask">
      <svg viewBox="0 0 220 180">
        <defs><clipPath :id="`d15-fl${sfx}`"><path d="M94 38 h32 v34 l34 62 a10 10 0 0 1 -9 15 h-82 a10 10 0 0 1 -9 -15 l34 -62 z" /></clipPath></defs>
        <g :clip-path="`url(#d15-fl${sfx})`">
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
      <b>Research</b>
    </div>
    <div class="pat"><Person v-bind="patient" mood="happy" :pose="cl >= 4 ? 'wave' : 'rest'" :uid="`d15-pat${sfx}`" /></div>
    <svg viewBox="0 0 40 36" class="heart"><path d="M20 34 C 4 22, 0 14, 4 8 C 8 2, 16 2, 20 9 C 24 2, 32 2, 36 8 C 40 14, 36 22, 20 34 Z" /></svg>
    <p class="patlab"><b>Patient care</b></p>

    <div class="ground" />
    <div class="doc"><div class="lift"><Person v-bind="doc" :uid="`d15-doc${sfx}`" /></div></div>
    <p class="dlab"><b>Clinical researcher</b></p>

    <div class="bot" :class="{ out: ce >= 3 }" :style="bot">
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
.oldw { position: absolute; inset: 0; z-index: 0; transition: opacity .6s ease .1s; }
.stage:not(.ce0) .oldw { opacity: 0; }
.old :deep(.heading), .old :deep(.doc), .old :deep(.dlab), .old :deep(.mech) { opacity: 0 !important; transition: none !important; }
.cstill, .cstill * { transition: none !important; }

.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 30; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .45s ease, transform .45s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .3s; }
.heading span:first-child { position: relative; transition: none; transform: none; }
.heading span:first-child:not(.on) { opacity: 0; transition: opacity .3s ease; }
.cap { position: absolute; left: 0; right: 0; top: 102px; height: 40px; z-index: 6; }
.cap p { position: absolute; inset: 0; margin: 0; text-align: center; font-size: 22px; font-weight: 700; color: #1F5FD6; opacity: 0; transform: translateY(8px); transition: opacity .4s ease, transform .4s ease; }
.cap p.cp1 { font-family: var(--font-display); font-size: 30px; color: var(--ink); }
.cap p.on { opacity: 1; transform: none; transition-delay: .35s; }
.ck1 .cap p.cp1.on { transition-delay: 3.4s; }

.mech { position: absolute; left: 468px; top: 330px; width: 224px; height: 280px; z-index: 5; transition: opacity .5s ease, transform .6s ease; }
.mech :deep(.core) { opacity: 0 !important; }
.stage:is(.ce3, .ce4) .mech { opacity: 0; transform: scale(1.3); }

.emb { position: absolute; left: 640px; top: 372px; width: 0; height: 0; z-index: 4; transition: transform 1s cubic-bezier(.5, 0, .3, 1); }
.ck1 .emb { transform: translate(400px, -128px) scale(.42); transition-delay: .2s; }
.halo { position: absolute; left: -180px; top: -180px; width: 360px; height: 360px; border-radius: 50%; background: radial-gradient(closest-side, rgba(31, 111, 235, .28) 0%, rgba(31, 111, 235, .09) 40%, rgba(31, 111, 235, 0) 100%); opacity: 0; transform: scale(.4); transition: opacity .6s ease, transform 1.6s cubic-bezier(.3, 1.2, .5, 1); }
.ce3 .halo { opacity: 1; transform: scale(.8); }
.ce4 .halo { opacity: 1; transform: scale(1.9); transition-delay: .3s; }
.rays { position: absolute; left: -150px; top: -150px; width: 300px; height: 300px; border-radius: 50%; background: repeating-conic-gradient(from 0deg, rgba(31, 111, 235, .10) 0deg 3deg, transparent 3deg 18deg); mask: radial-gradient(closest-side, transparent 35%, #000 50%, transparent 100%); -webkit-mask: radial-gradient(closest-side, transparent 35%, #000 50%, transparent 100%); animation: turn 40s linear infinite; opacity: 0; transition: opacity .6s ease, scale 1.6s ease; }
.ce3 .rays { opacity: 1; }
.ce4 .rays { opacity: 1; scale: 1.8; transition-delay: .3s; }
@keyframes turn { to { transform: rotate(360deg); } }
.chip { position: absolute; left: -100px; top: -100px; width: 200px; height: 200px; filter: drop-shadow(0 10px 24px rgba(31, 111, 235, .35)); opacity: 0; transform: translate(-60px, 90px) scale(.2); transition: opacity .3s ease, transform 1s cubic-bezier(.3, 1.3, .5, 1); }
.stage:is(.ce3, .ce4) .chip { opacity: 1; transform: none; }
.pins rect { fill: #3B78E7; }
.ai { font-family: var(--font-display); font-weight: 700; font-size: 54px; fill: #FFFFFF; letter-spacing: -1px; }
.spk { fill: #9DBCF5; animation: twinkle 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes twinkle { 0%, 100% { opacity: .5; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.15); } }
.wfring { position: absolute; left: -260px; top: -220px; width: 520px; height: 440px; overflow: visible; }
.rpath { fill: none; stroke: #1F5FD6; stroke-width: 3; stroke-dasharray: 8 8; opacity: 0; transition: opacity .5s ease 1.5s; }
.ce4 .rpath { opacity: .6; animation: march 1.2s linear infinite; }
@keyframes march { to { stroke-dashoffset: -16; } }
.part { position: absolute; left: 0; top: 0; width: 190px; height: 38px; margin: -19px 0 0 -95px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 8px; border: 2.5px solid #0B2A5B; border-radius: 10px; background: #FFFFFF; font-size: 13.5px; font-weight: 800; color: var(--ink); white-space: nowrap; box-shadow: 0 8px 18px rgba(11, 42, 91, .12); opacity: 0; transform: translate(var(--fx), var(--fy)) rotate(30deg); }
.part i { width: 14px; height: 14px; border-radius: 4px; border: 2px solid #0B2A5B; box-sizing: border-box; flex: none; }
.part i.b { background: #1F5FD6; } .part i.o { background: #F47B20; }
.ce4 .part { opacity: 1; transform: translate(var(--x), var(--y)); transition: opacity .3s ease calc(.2s + var(--d)), transform .8s cubic-bezier(.3, 1.4, .5, 1) calc(.2s + var(--d)); }
.ce4:not(.cstill) .part { animation: lock .35s ease calc(1s + var(--d)) both; }
@keyframes lock { 50% { box-shadow: 0 0 0 6px rgba(31, 95, 214, .3), 0 8px 18px rgba(11, 42, 91, .12); } }

.pillar-clip { position: absolute; left: 555px; top: 464px; width: 170px; height: 160px; overflow: hidden; z-index: 5; }
.pillar { width: 170px; height: 160px; transform: translateY(100%); transition: transform 1.1s cubic-bezier(.65, 0, .25, 1); }
.stage:is(.cl2, .cl3, .cl4) .pillar { transform: none; }
.cap1 { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 2.5; } .cap2 { fill: #EEF2F8; stroke: #0B2A5B; stroke-width: 2.5; }
.shaft { stroke: #0B2A5B; stroke-width: 2.5; } .flute { stroke: #CDD6E4; stroke-width: 2; }
.glowd { position: absolute; left: 500px; top: 150px; width: 280px; height: 320px; border-radius: 50%; background: radial-gradient(closest-side, rgba(31, 111, 235, .25), rgba(31, 111, 235, 0)); opacity: 0; z-index: 3; transition: opacity .8s ease; }
.stage:is(.cl3, .cl4) .glowd { opacity: 1; }
.flask { position: absolute; left: 300px; top: 400px; width: 200px; text-align: center; z-index: 4; opacity: 0; transform: translateY(30px) scale(.8); transition: opacity .4s ease, transform .6s cubic-bezier(.3, 1.5, .5, 1); }
.flask svg { width: 200px; height: 164px; }
.flask b { display: block; font-size: 15px; color: #1F5FD6; }
.stage:is(.cl3, .cl4) .flask { opacity: 1; transform: none; }
.glass { fill: none; stroke: #33456B; stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; }
.liquid { fill: #1F5FD6; opacity: .75; animation: slosh 3s ease-in-out infinite; }
@keyframes slosh { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.bubble { fill: #BFD3F6; animation: rise 2.2s ease-in infinite; }
@keyframes rise { from { transform: translateY(0); opacity: .9; } to { transform: translateY(-58px); opacity: 0; } }
.molecule { animation: float 5s ease-in-out infinite; transform-origin: 164px 50px; }
.molecule line { stroke: #6B97EC; stroke-width: 2; } .molecule circle { fill: #1F5FD6; } .molecule circle.alt { fill: #F47B20; }
@keyframes float { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-8px) rotate(14deg); } }
.pat { position: absolute; left: 830px; top: 352px; width: 160px; height: 270px; z-index: 4; opacity: 0; transform: translateY(40px); transition: opacity .3s ease, transform .5s cubic-bezier(.3, 1.5, .5, 1); }
.stage:is(.cl3, .cl4) .pat { opacity: 1; transform: none; transition-delay: .2s; }
.heart { position: absolute; left: 936px; top: 318px; width: 34px; height: 30px; z-index: 5; opacity: 0; }
.heart path { fill: #F47B20; stroke: #0B2A5B; stroke-width: 2; }
.stage:is(.cl3, .cl4) .heart { opacity: 1; animation: beat 1s ease-in-out .6s infinite; transition: opacity .3s ease .5s; }
@keyframes beat { 0%, 100% { transform: scale(1); } 30% { transform: scale(1.25); } 60% { transform: scale(.95); } }
.patlab { position: absolute; left: 810px; top: 630px; width: 200px; margin: 0; text-align: center; font-size: 14px; color: #1F5FD6; opacity: 0; transition: opacity .3s ease; }
.stage:is(.cl3, .cl4) .patlab { opacity: 1; transition-delay: .4s; }

.ground { position: absolute; left: 30px; width: 1220px; top: 624px; height: 2px; background: #E1E6EF; z-index: 1; }
.doc { position: absolute; left: 40px; top: 350px; width: 160px; height: 270px; z-index: 7; transition: left 1.4s cubic-bezier(.45, 0, .4, 1); }
.stage:is(.cl1, .cl2, .cl3, .cl4) .doc { left: 560px; }
.cl1 .doc { animation: walk .35s ease-in-out 4 alternate; }
@keyframes walk { to { transform: translateY(-6px); } }
.lift { width: 100%; height: 100%; transition: transform 1.1s cubic-bezier(.65, 0, .25, 1); }
.stage:is(.cl2, .cl3, .cl4) .lift { transform: translateY(-160px); }
.dlab { position: absolute; left: 20px; top: 630px; width: 200px; margin: 0; text-align: center; font-size: 14px; color: var(--ink); z-index: 7; transition: opacity .3s ease; }
.ck1 .dlab { opacity: 0; }
.bot { position: absolute; left: 0; top: 0; width: 120px; height: 150px; z-index: 12; transform-origin: 60px 60px; opacity: 0; transition: transform 1s cubic-bezier(.5, -.2, .3, 1.15), opacity .2s ease; }
.bot.out { opacity: 1; }
.bob { width: 100%; height: 100%; animation: bob 2.4s ease-in-out infinite; }
@keyframes bob { 50% { transform: translateY(-7px); } }
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
.barm { transform-box: view-box; transition: transform .45s cubic-bezier(.3, 1.6, .5, 1); }
.barm.l { transform-origin: -24.5px 26px; } .barm.r { transform-origin: 24.5px 26px; }
.stage:is(.cl3, .cl4) .barm.l { transform: rotate(150deg); } .stage:is(.cl3, .cl4) .barm.r { transform: rotate(-150deg); }
.cstill .barm, .cstill .bob { animation: none !important; }
</style>
