<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const step = computed(() => unref($clicks) as number)

const active = useIsSlideActive()
const phase = ref(0)
const focus = ref(false)
const animate = ref(false)
const fly = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }
watch(active, (a) => {
  clearTimers()
  focus.value = false
  if (!a) { animate.value = false; fly.value = false; phase.value = 0; return }
  if (step.value > 0) { animate.value = false; fly.value = true; phase.value = 2; return }
  animate.value = false
  fly.value = false
  phase.value = 0
  later(500, () => { animate.value = true; phase.value = 1 })
  later(1250, () => { fly.value = true })
  later(2300, () => { phase.value = 2 })
  later(6700, () => { focus.value = true })
}, { immediate: true })
onBeforeUnmount(clearTimers)

const piles = [
  { x: 112, y: 502, n: 11 }, { x: 452, y: 502, n: 14 }, { x: 590, y: 650, n: 15 }, { x: 0, y: 650, n: 9 },
]
const sheets = piles.flatMap((pl, pi) => Array.from({ length: pl.n }, (_, i) => {
  const k = i + 1
  return {
    x: pl.x + (((k * 29 + pi * 7) % 9) - 4),
    y: pl.y - (k - 1) * 9 - 9,
    r: ((k * 37 + pi * 11) % 7) - 3,
  }
}))

const projects = ['POGE', 'FORZA', 'PEDIGREE', 'SCA7', 'Special MS Covid']
const FOLDER_W = 180, FOLDER_Y = 330
const folderX = (i: number) => 130 + i * 210

const ITEMS = [
  { k: 'prot', t: 'Protocols', svg: '<path d="M6 2.5 h8.5 l4 4 V21.5 H6 Z"/><path d="M14.5 2.5 V6.5 H18.5"/><path d="M9 11 h7 M9 14.5 h7 M9 18 h4.5"/>' },
  { k: 'cons', t: 'Consent forms', svg: '<path d="M6 2.5 h8.5 l4 4 V21.5 H6 Z"/><path d="M14.5 2.5 V6.5 H18.5"/><path d="M9 10 h7"/><path d="M8.5 17.5 q1.5 -3 3 0 t3 0 q1 -1.5 2 0"/>' },
  { k: 'guide', t: 'Guidelines and checklists', svg: '<rect x="4.5" y="3.5" width="15" height="18" rx="2"/><path d="M8 9 l1.5 1.5 l2.5 -3 M8 15 l1.5 1.5 l2.5 -3 M14 9.5 h2.5 M14 15.5 h2.5"/>' },
  { k: 'mail', t: 'Emails', svg: '<rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M3 6.5 L12 13 L21 6.5"/>' },
  { k: 'opin', t: 'Committee opinions', svg: '<circle cx="12" cy="9" r="5.5"/><path d="M9 14 L7.5 21 L12 18.5 L16.5 21 L15 14"/><path d="M10 9 l1.5 1.5 l2.5 -3"/>' },
  { k: 'req', t: 'Review requests and responses', svg: '<path d="M3 5 h11 v7 h-6 l-3 3 v-3 h-2 Z"/><path d="M14 9 h7 v7 h-2 v3 l-3 -3 h-6 v-3"/>' },
]
const FAN = ITEMS.map((_, k) => -40 + k * 16)

const BIG_I = 2, PIVOT = { x: 640, y: 552 }, BIG_R = 272, BIG_A = [-74, -45, -15, 15, 45, 74]
const BIG = ITEMS.map((_, k) => {
  const a = BIG_A[k] * Math.PI / 180
  return { x: Math.round(BIG_R * Math.sin(a)), y: Math.round(-BIG_R * Math.cos(a)), r: Math.round(BIG_A[k] * 0.15) }
})

function sheetStyle(i: number) {
  const s = sheets[i]
  if (phase.value === 0) return { transform: `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg)`, opacity: 1, transition: 'none' }
  const st = (i % 17) * 0.012
  if (!fly.value) {

    const lx = s.x + 20 + (((i * 53) % 23) - 11) * 3
    const ly = s.y - 90 - ((i * 31) % 7) * 14
    const lr = (((i * 47) % 13) - 6) * 4
    return { transform: `translate(${lx}px, ${ly}px) rotate(${lr}deg)`, opacity: 1, transition: `transform .6s cubic-bezier(.2, .9, .3, 1) ${st}s, width .45s ease ${st}s, height .45s ease ${st}s` }
  }
  const f = i % 5
  const tx = folderX(f) + FOLDER_W / 2 - 23, ty = FOLDER_Y + 4
  return {
    transform: `translate(${tx}px, ${ty}px) rotate(${(i % 2 ? 1 : -1) * 12}deg) scale(.55)`,
    opacity: 0,
    transition: animate.value
      ? `transform .8s cubic-bezier(.5, 0, .3, 1) ${st * 2}s, opacity .18s ease ${0.66 + st * 2}s, width .45s ease, height .45s ease`
      : 'none',
  }
}

const SLOT_W = 290, SLOT_GAP = 14, SLOT_Y = 178
const slotX = (i: number) => 39 + i * (SLOT_W + SLOT_GAP)
const cards = [
  { title: 'Incomplete documentation', example: 'Document lists and administrative forms to complete' },
  { title: 'Inconsistencies across documents', example: 'Illustrative example: the protocol moves from 5 to 6 visits, the budget still counts 5' },
  { title: 'Fragmented information and unclear versions', example: 'An updated contract had to be resent: the earlier email could not be found' },
  { title: 'Repeated checking and coordination', example: 'Each correction can bring another review and another wait' },
]

</script>

<template>
  <div class="stage" :class="{ out: phase >= 1, ready: phase >= 2, probs: step >= 1 }">
    <h2 class="display heading">
      <span :class="{ on: phase === 0 }">Time Taken From Research and Care</span>
      <span :class="{ on: phase >= 1 }">Four Recurring Difficulties</span>
    </h2>

    <div class="ground" />
    <div class="old">
      <svg viewBox="0 0 110 150" class="chair"><rect x="8" y="4" width="94" height="120" rx="18" /><rect x="22" y="18" width="66" height="70" rx="12" class="pad" /></svg>
      <div class="pi"><Person pose="despair" mood="worried" :sweat="true" uid="d6-pi" /></div>
      <svg viewBox="0 0 470 170" class="desk">
        <path d="M14 2 H456 L468 26 H2 Z" class="top" />
        <rect x="8" y="26" width="454" height="132" rx="4" class="front" />
        <path d="M24 60 H446 M24 108 H446" class="groove" />
        <circle cx="235" cy="44" r="3.5" class="knob" /><circle cx="235" cy="88" r="3.5" class="knob" /><circle cx="235" cy="132" r="3.5" class="knob" />
        <path d="M150 6 H214 L220 20 H144 Z" class="sheet" />
        <path d="M156 10 H208 M154 15 H200" class="writing" />
      </svg>
      <div class="dayplan">
        <div class="dp-head">
          <svg viewBox="0 0 40 40" class="clock"><circle cx="20" cy="20" r="17" /><line x1="20" y1="20" x2="20" y2="9" class="hand h1" /><line x1="20" y1="20" x2="28" y2="20" class="hand h2" /><circle cx="20" cy="20" r="2" class="pin" /></svg>
          <span>A doctor's working day</span>
        </div>
        <div class="dp-icons" style="width: 40%">
          <svg viewBox="0 0 32 32" class="cicon"><path d="M12 4 h8 v8 l7 13 a3 3 0 0 1 -3 4 h-16 a3 3 0 0 1 -3 -4 l7 -13 z" /><path d="M8 21 h16" /></svg>
          <svg viewBox="0 0 32 32" class="cicon faded"><path d="M16 27 C4 19 4 9 10 7 C13 6 15 8 16 10 C17 8 19 6 22 7 C28 9 28 19 16 27 Z" /><path d="M9 16 h4 l2 -3 l2 6 l2 -3 h4" /></svg>
          <svg viewBox="0 0 32 32" class="cicon faded"><circle cx="16" cy="10" r="5" /><path d="M6 28 q10 -14 20 0" /><path d="M16 17 v6 M13 20 h6" /></svg>
        </div>
        <div class="dp-bar"><div class="seg care" style="width: 40%" /><div class="seg paper" /></div>
        <div class="dp-legend"><span class="lg care"><i />Research and patient care</span><span class="lg paper"><i />Paperwork</span></div>
      </div>
    </div>

    <i v-for="(s, i) in sheets" :key="i" class="ps" :class="{ page: phase >= 1 }" :style="sheetStyle(i)" />

    <p class="dlabel" :class="{ on: phase >= 2 }">The data I analysed</p>
    <p class="real" :class="{ on: phase >= 2 }"><b>Real clinical projects</b>provided by Sant’Andrea University Hospital<i />2018–2026</p>
    <div
      v-for="(p, i) in projects" :key="p" class="folder" :class="{ on: phase >= 1, lift: focus && i === BIG_I, dim: focus && i !== BIG_I }"
      :style="{ left: `${folderX(i)}px`, top: `${FOLDER_Y}px`, '--d': `${0.55 + i * 0.08}s`, '--o': `${0.2 + i * 0.25}s` }"
    >

      <span
        v-for="(it, k) in ITEMS" :key="it.k" class="fc"
        :style="{ '--a': `${FAN[k]}deg`, '--fd': `calc(var(--o) + ${0.5 + k * 0.06}s)` }"
      ><svg viewBox="0 0 24 24" class="fci" v-html="it.svg" /></span>
      <svg viewBox="0 0 150 118" class="fsvg">
        <path d="M6 18 Q6 10 14 10 H54 L64 20 H136 Q144 20 144 28 V108 Q144 114 136 114 H14 Q6 114 6 108 Z" class="back" />
        <g class="front"><path d="M3 44 Q3 38 9 38 H141 Q147 38 147 44 V108 Q147 114 141 114 H9 Q3 114 3 108 Z" /></g>
      </svg>
      <p>{{ p }}</p>
    </div>

    <div class="bigfan" :class="{ on: focus }">
      <div
        v-for="(it, k) in ITEMS" :key="it.k" class="bc"
        :style="{ left: `${PIVOT.x + BIG[k].x - 56}px`, top: `${PIVOT.y + BIG[k].y - 52}px`, '--x': `${-BIG[k].x}px`, '--y': `${-BIG[k].y}px`, '--r': `${BIG[k].r}deg`, '--k': `${0.3 + k * 0.08}s` }"
      >
        <svg viewBox="0 0 24 24" class="bci" v-html="it.svg" />
        <p>{{ it.t }}</p>
      </div>
    </div>

    <svg viewBox="0 0 60 60" class="lens" :class="{ on: phase >= 2 && step === 0 }">
      <circle cx="24" cy="24" r="17" /><line x1="37" y1="37" x2="54" y2="54" />
    </svg>

    <div
      v-for="(c, i) in cards" :key="c.title" class="card" :class="[`c${i + 1}`, { slot: phase >= 2, on: step >= i + 1 }]"
      :style="{ left: `${slotX(i)}px`, top: `${SLOT_Y}px`, '--d': `${0.25 + i * 0.07}s`, '--od': i === 0 ? '.55s' : '0s' }"
    >
      <span class="num">{{ i + 1 }}</span>
      <div class="content">
        <h3>{{ c.title }}</h3>
        <DifficultyArt class="art" :i="i" :on="step >= i + 1" />
        <p class="ex">{{ c.example }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 9; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .5s ease, transform .5s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .3s; }
.heading span:first-child { position: relative; }

.ground { position: absolute; left: 180px; right: 180px; top: 650px; height: 2px; background: linear-gradient(90deg, transparent, #D5DCE8 20%, #D5DCE8 80%, transparent); transition: opacity .5s ease .3s; }
.out .ground { opacity: 0; }

.old { position: absolute; inset: 0; transition: opacity .5s ease .15s; }
.out .old { opacity: 0; }
.chair { position: absolute; left: 236px; top: 374px; width: 110px; height: 150px; z-index: 5; }
.chair rect { fill: #1F5FD6; stroke: #0B2A5B; stroke-width: 3; }
.chair .pad { fill: #4F8BF5; stroke: none; }
.pi { position: absolute; left: 200px; top: 280px; width: 180px; height: 304px; z-index: 6; }
.desk { position: absolute; left: 96px; top: 488px; width: 470px; height: 170px; z-index: 7; overflow: visible; }
.desk .top { fill: #E9EEF6; stroke: #0B2A5B; stroke-width: 3; stroke-linejoin: round; }
.desk .front { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 3; }
.desk .groove { stroke: #D5DCE8; stroke-width: 2; }
.desk .knob { fill: #0B2A5B; }
.desk .sheet { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 1.6; stroke-linejoin: round; }
.desk .writing { fill: none; stroke: #9DB0D3; stroke-width: 1.6; stroke-linecap: round; }
.dayplan { position: absolute; left: 640px; top: 250px; width: 560px; z-index: 5; }
.dp-head { display: flex; align-items: center; gap: 12px; font-family: var(--font-display); font-size: 26px; font-weight: 600; color: var(--ink); margin-bottom: 14px; }
.clock { width: 40px; height: 40px; }
.clock circle { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2.5; }
.clock .pin { fill: #0B2A5B; stroke: none; }
.hand { stroke: #F47B20; stroke-width: 2.5; stroke-linecap: round; transform-origin: 20px 20px; }
.h1 { animation: spin 1.6s linear infinite; }
.h2 { animation: spin .4s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.dp-icons { display: flex; justify-content: center; gap: 28px; height: 44px; margin-bottom: 8px; }
.cicon { width: 38px; height: 38px; }
.cicon path, .cicon circle { fill: none; stroke: #1F5FD6; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.cicon.faded { opacity: .12; transform: scale(.7); }
.dp-bar { display: flex; height: 64px; border-radius: 14px; overflow: hidden; border: 2px solid #0B2A5B; }
.seg.care { background: #1F5FD6; }
.seg.paper { flex: 1; background: #F47B20; }
.dp-legend { display: flex; justify-content: space-between; margin-top: 12px; font-size: 18px; font-weight: 600; }
.lg { display: flex; align-items: center; gap: 8px; }
.lg i { width: 14px; height: 14px; border-radius: 4px; }
.lg.care { color: #1F5FD6; } .lg.care i { background: #1F5FD6; }
.lg.paper { color: #C55A0E; } .lg.paper i { background: #F47B20; }

.ps { position: absolute; left: 0; top: 0; width: 84px; height: 9px; box-sizing: border-box; background: #FFFFFF; border: 2px solid #0B2A5B; border-radius: 2px; z-index: 8; transform-origin: 50% 50%; }

.ps::before { content: ''; position: absolute; left: 6px; right: 6px; top: 9px; height: 26px; opacity: 0; transition: opacity .3s ease .15s;
  background: repeating-linear-gradient(to bottom, #B4C2DA 0 3px, transparent 3px 7px); border-radius: 2px; }
.ps::after { content: ''; position: absolute; right: -2px; top: -2px; width: 11px; height: 11px; opacity: 0; transition: opacity .3s ease .15s;
  background: linear-gradient(225deg, #F7F9FD 50%, #C9D2E0 50%); border-left: 2px solid #0B2A5B; border-bottom: 2px solid #0B2A5B; box-sizing: border-box; border-bottom-left-radius: 2px; }
.ps.page { width: 46px; height: 58px; border-radius: 3px; box-shadow: 0 4px 10px rgba(11, 42, 91, .12); }
.ps.page::before, .ps.page::after { opacity: 1; }

.folder { position: absolute; width: 180px; opacity: 0; transform: scale(.4) translateY(20px); z-index: 7;
  transition: opacity .35s ease var(--d), transform .55s cubic-bezier(.2, 1.4, .4, 1) var(--d); }
.folder.on { opacity: 1; transform: none; }
.folder .fsvg { width: 180px; height: 141.6px; overflow: visible; }
.folder p { margin: 6px 0 0; text-align: center; font-size: 19px; font-weight: 700; color: var(--ink); white-space: nowrap; }

.fc { position: absolute; left: 71px; top: 50px; width: 38px; height: 48px; box-sizing: border-box; z-index: -1; display: grid; place-items: center;
  background: #FFFFFF; border: 2px solid #0B2A5B; border-radius: 5px; box-shadow: 0 3px 8px rgba(11, 42, 91, .12);
  opacity: 0; transform: rotate(calc(var(--a) * .2)) translateY(-6px) scale(.4); transition: opacity .3s ease var(--fd), transform .6s cubic-bezier(.3, 1.45, .5, 1) var(--fd); }
.ready .fc { opacity: 1; transform: rotate(var(--a)) translateY(-112px); }
.fci { width: 25px; height: 25px; fill: none; stroke: #1F5FD6; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.folder.on.lift { transform: translateY(150px); transition: opacity .4s ease, transform .8s cubic-bezier(.5, 0, .3, 1); }
.folder.on.dim { opacity: .1; transition: opacity .6s ease, transform .6s ease; }
.lift .fc { opacity: 0; transition: opacity .25s ease .2s, transform .4s ease; }
.bigfan { position: absolute; inset: 0; pointer-events: none; z-index: 8; transition: opacity .35s ease, transform .45s cubic-bezier(.5, 0, .5, 1); }
.bc { position: absolute; width: 112px; height: 104px; box-sizing: border-box; padding: 12px 8px 8px; display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: #FFFFFF; border: 2px solid #0B2A5B; border-radius: 10px; box-shadow: 0 8px 20px rgba(11, 42, 91, .12);
  opacity: 0; transform: translate(var(--x), var(--y)) scale(.2); transition: opacity .3s ease, transform .3s ease; }
.bigfan.on .bc { opacity: 1; transform: rotate(var(--r)); transition: opacity .35s ease var(--k), transform .7s cubic-bezier(.3, 1.35, .5, 1) var(--k); }
.bci { width: 36px; height: 36px; flex: none; fill: none; stroke: #1F5FD6; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.bc p { margin: 0; text-align: center; font-size: 13px; font-weight: 700; line-height: 1.15; color: var(--ink); }
.probs .folder, .probs .dlabel, .probs .bigfan, .probs .real { opacity: 0 !important; transform: translateY(-36px) !important; transition: opacity .35s ease, transform .45s cubic-bezier(.5, 0, .5, 1) !important; }
.probs .folder { transition-delay: calc(var(--o) * .2) !important; }
.folder .back { fill: #FFC08F; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.folder .front path { fill: #F47B20; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.folder .front { transform-box: view-box; transform-origin: 75px 114px; transition: transform .5s cubic-bezier(.3, 1.4, .5, 1) var(--o); }
.ready .folder .front { transform: scaleY(.62) skewX(-6deg); }
.peek { transform: translateY(26px); transition: transform .5s cubic-bezier(.3, 1.4, .5, 1) var(--o); }
.ready .peek { transform: translateY(0); }
.pdoc { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; }
.pln { stroke: #C9D2E0; stroke-width: 3; stroke-linecap: round; }
.mail { fill: #FFFFFF; stroke: #1F5FD6; stroke-width: 2; }
.mailf { fill: none; stroke: #1F5FD6; stroke-width: 2; stroke-linejoin: round; }
.dlabel { position: absolute; left: 0; right: 0; top: 132px; margin: 0; text-align: center; font-size: 14px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--mist); opacity: 0; transition: opacity .5s ease .2s, transform .45s ease; }
.dlabel.on { opacity: 1; }
.real { position: absolute; left: 0; right: 0; top: 158px; margin: 0; display: flex; justify-content: center; align-items: center; gap: 12px; font-size: 18px; color: var(--mist);
  opacity: 0; transform: translateY(10px); transition: opacity .5s ease .35s, transform .5s ease .35s; }
.real.on { opacity: 1; transform: none; }
.real b { padding: 6px 14px; border-radius: 999px; background: #FFE9D8; color: #C55A0E; font-weight: 800; }
.real i { width: 5px; height: 5px; border-radius: 50%; background: #B4BFD2; }

.lens { position: absolute; left: 0; top: 0; width: 64px; height: 64px; opacity: 0; z-index: 9; transform: translate(150px, 130px); }
.lens circle { fill: rgba(255,255,255,.45); stroke: #0B2A5B; stroke-width: 4; }
.lens line { stroke: #0B2A5B; stroke-width: 6; stroke-linecap: round; }
.lens.on { animation: scan 2s cubic-bezier(.45, 0, .55, 1) 2.2s both; }
@keyframes scan {
  0% { opacity: 0; transform: translate(90px, 386px) rotate(-10deg); }
  10% { opacity: 1; }
  25% { transform: translate(300px, 356px) rotate(4deg); }
  50% { transform: translate(560px, 386px) rotate(-6deg); }
  75% { transform: translate(820px, 356px) rotate(4deg); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translate(1110px, 386px) rotate(-4deg); }
}

.card { position: absolute; width: 290px; height: 380px; box-sizing: border-box; border: 2px dashed #B4BFD2; border-radius: 16px; background: transparent;
  opacity: 0; transform: translateY(24px); transition: opacity .4s ease, transform .5s ease, background .4s ease, border-color .4s ease, box-shadow .4s ease; }
.probs .card { opacity: 1; transform: none; transition-delay: var(--d); }
.card.on { border: 2px solid #0B2A5B; background: #FFFFFF; box-shadow: 0 10px 26px rgba(11, 42, 91, .08); transition-delay: var(--od); }
.num { position: absolute; left: 16px; top: 16px; width: 38px; height: 38px; border-radius: 50%; background: #E8EDF5; color: var(--mist); display: grid; place-items: center;
  font-family: var(--font-display); font-weight: 700; font-size: 21px; transition: background .4s ease var(--od), color .4s ease var(--od); }
.card.on .num { background: #F47B20; color: #FFFFFF; }
.content { position: absolute; inset: 0; padding: 16px 18px 18px; display: flex; flex-direction: column; opacity: 0; transform: scale(.96); transition: opacity .45s ease calc(var(--od) + .1s), transform .45s ease calc(var(--od) + .1s); }
.card.on .content { opacity: 1; transform: none; }
h3 { margin: 0 0 0 50px; min-height: 62px; display: flex; align-items: center; font-family: var(--font-display); font-size: 23px; font-weight: 700; line-height: 1.12; color: var(--ink); }
.art { flex: 1; margin-top: 10px; }
.ex { margin: 8px 0 0; font-size: 16.5px; line-height: 1.32; color: var(--mist); }

</style>
