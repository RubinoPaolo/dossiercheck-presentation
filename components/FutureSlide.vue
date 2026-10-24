<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const props = defineProps<{ frozen?: boolean }>()
const sfx = props.frozen ? 'f' : ''
const { $clicks } = useSlideContext()
const step = computed(() => props.frozen ? 1 : unref($clicks) as number)
const active = useIsSlideActive()

const fe = ref(0)
const lc = ref(0)
const still = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }

watch(active, (a) => {
  clearTimers()
  if (props.frozen) { fe.value = 10; lc.value = 7; still.value = true; return }
  if (!a) { fe.value = 0; lc.value = 0; still.value = false; return }
  if (step.value > 0) { fe.value = 10; lc.value = 7; still.value = true; return }
  still.value = false; fe.value = 0; lc.value = 0
  ;[[300, 1], [1200, 2], [1700, 3], [2900, 4], [4000, 5], [5600, 6], [6800, 7], [8000, 8], [8750, 9], [9100, 10]]
    .forEach(([ms, p]) => later(ms, () => { fe.value = p }))
}, { immediate: true })

watch(step, (s) => {
  if (props.frozen || !active.value) return
  clearTimers()
  still.value = false
  fe.value = 10
  lc.value = 0
  if (s >= 1) [[200, 1], [1500, 2], [2400, 3], [3300, 4], [4000, 5], [5000, 6], [5800, 7]].forEach(([ms, p]) => later(ms, () => { lc.value = p }))
})
onBeforeUnmount(clearTimers)

const bot = computed(() => {
  let p = { x: 1010, y: 162, k: 0.62 }
  if (fe.value >= 2) p = { x: 580, y: 236, k: 0.7 }
  if (fe.value === 6) p = { x: 520, y: 352, k: 0.52 }
  if (fe.value === 7) p = { x: 640, y: 352, k: 0.52 }
  if (fe.value >= 8) p = { x: 580, y: 379, k: 0.7 }
  return { transform: `translate(${p.x - 60}px, ${p.y - 60}px) scale(${p.k})` }
})
const doc = computed(() => {
  if (fe.value === 0) return { mood: 'happy', pose: 'akimbo' }
  if (step.value >= 1 && lc.value >= 6) return { mood: 'happy', pose: 'cheer' }
  return { mood: 'happy', pose: 'rest' }
})
const spec = { outfit: 'suit', outfitColor: '#0B2A5B', tieColor: '#1F5FD6', hair: 'grey', hairColor: '#AEB6C4', skin: '#EBC2A0', glasses: true } as const

const NOW = [{ t: 'Guideline issue', c: 'g' }, { t: 'Inconsistency', c: 'i' }, { t: 'Missing information', c: 'm' }]
  .map((n, i) => { const y = 286 + i * 46; return { ...n, y, p: `M562 452 C 520 452, 500 ${y + 17}, 454 ${y + 17}` } })
const FUT = [{ y: 300 }, { y: 400 }].map(f => ({ ...f, p: `M598 452 C 650 452, 680 ${f.y + 38}, 724 ${f.y + 38}`, s: `M968 ${f.y + 38} C 1010 ${f.y + 38}, 1040 470, 1072 486` }))
const CABLE = 'M1000 205 C 900 202, 840 202, 790 205 C 700 212, 660 260, 640 300 S 590 420, 582 448'
const LOCAL = 'M410 524 C 470 524, 520 480, 566 464'
const CAP = ['Extending the checks beyond documentary requirements', 'Better harnesses · smaller models · run locally']
</script>

<template>
  <div class="stage" :class="[`fe${fe}`, `fk${step}`, `lc${lc}`, { fstill: still }]">

    <div v-if="!frozen" class="oldw"><WorkloadSlide frozen class="old" /></div>

    <h2 class="display heading">
      <span :class="{ on: fe === 0 }">Estimated Workload</span>
      <span :class="{ on: fe >= 1 }">Future Directions</span>
    </h2>
    <div class="cap"><p v-for="(c, i) in CAP" :key="i" :class="{ on: fe >= 2 && step === i }">{{ c }}</p></div>

    <div class="saved"><p>staff-hours saved</p><span>≈21%</span><b>−37.50 h</b></div>
    <i v-for="k in 5" :key="`sp${k}`" class="spark pk" :style="{ '--a': `${k * 72}deg` }" />

    <i v-for="k in 3" :key="`cw${k}`" class="callw" :style="{ '--d': `${k * 0.22}s` }" />

    <svg viewBox="0 0 1280 720" class="lay">
      <path v-for="(n, i) in NOW" :key="`ln${i}`" :d="n.p" class="clink" :style="{ '--d': `${i * 0.3}s` }" />
      <path v-for="(f, i) in FUT" :key="`lf${i}`" :d="f.p" class="clink new" :style="{ '--d': `${i * 0.35}s` }" />
      <path v-for="(f, i) in FUT" :key="`ls${i}`" :d="f.s" class="slink" :style="{ '--d': `${i * 0.25}s` }" />
      <path :d="CABLE" class="cable ext" />
      <path d="M1000 205 C 900 202, 840 202, 790 205" class="cable half h1" />
      <path d="M790 205 C 700 212, 660 260, 640 300 S 590 420, 582 448" class="cable half h2" />
      <path :d="LOCAL" class="cable loc" />
    </svg>

    <i v-for="(n, i) in NOW" :key="`pz${i}`" class="pulse now" :style="{ offsetPath: `path('${n.p}')`, '--d': `${i * 0.3}s` }" />
    <i v-for="(f, i) in FUT" :key="`pq${i}`" class="pulse spc" :style="{ offsetPath: `path('${f.s}')`, '--d': `${i * 0.6}s` }" />
    <i v-for="k in 3" :key="`pc${k}`" class="pulse ext" :style="{ offsetPath: `path('${CABLE}')`, '--d': `${k * 0.45}s` }" />
    <i v-for="k in 3" :key="`pl${k}`" class="pulse loc" :style="{ offsetPath: `path('${LOCAL}')`, '--d': `${k * 0.4}s` }" />

    <p class="nowlab">Today</p>
    <div v-for="(n, i) in NOW" :key="`n${i}`" class="chk now" :class="n.c" :style="{ top: `${n.y}px`, '--d': `${0.35 + i * 0.3}s` }"><i />{{ n.t }}</div>

    <p class="futlab">Next</p>
    <div class="chk fut f1" :style="{ top: `${FUT[0].y}px`, '--d': '0s' }">
      <svg viewBox="0 0 244 76" class="draft"><rect x="2" y="2" width="240" height="72" rx="11" /></svg>
      <p class="ft"><em>+</em>Methodological consistency</p>
      <svg viewBox="0 0 200 30" class="meth">
        <path d="M30 11 H90" class="mline l1" /><path d="M110 11 H170" class="mline l2" />
        <circle cx="20" cy="11" r="8" class="mn n1" /><circle cx="100" cy="11" r="8" class="mn n2" /><circle cx="180" cy="11" r="8" class="mn n3" />
        <text x="20" y="29" text-anchor="middle">objectives</text><text x="100" y="29" text-anchor="middle">procedures</text><text x="180" y="29" text-anchor="middle">outcomes</text>
      </svg>
    </div>
    <div class="chk fut f2" :style="{ top: `${FUT[1].y}px`, '--d': '.45s' }">
      <svg viewBox="0 0 244 76" class="draft"><rect x="2" y="2" width="240" height="72" rx="11" /></svg>
      <p class="ft"><em>+</em>Scientific and ethical concerns</p>
      <svg viewBox="0 0 200 30" class="scales">
        <line x1="100" y1="6" x2="100" y2="26" class="sbar" /><path d="M88 27 H112" class="sbar" />
        <g class="beam"><line x1="66" y1="8" x2="134" y2="8" class="sbar" /><path d="M66 8 L58 19 H74 Z M134 8 L126 19 H142 Z" class="pan" /></g>
        <text x="28" y="19" text-anchor="middle">evidence</text><text x="172" y="19" text-anchor="middle">judgement</text>
      </svg>
    </div>

    <div class="mech">
      <Mecha :asm="fe >= 3" :head="fe >= 9" core="chest" :glow="lc >= 3" />
      <i v-for="k in 3" :key="`du${k}`" class="dust" :class="`u${k}`" />
      <div class="gwave" />
    </div>

    <div class="armor">
      <div class="plate pl1"><svg viewBox="0 0 48 36"><rect x="2" y="2" width="44" height="32" rx="9" /><circle cx="12" cy="18" r="3" class="bolt" /><circle cx="36" cy="18" r="3" class="bolt" /></svg></div>
      <div class="plate pl2"><svg viewBox="0 0 48 36"><rect x="2" y="2" width="44" height="32" rx="9" /><circle cx="12" cy="18" r="3" class="bolt" /><circle cx="36" cy="18" r="3" class="bolt" /></svg></div>
      <i v-for="k in 7" :key="`wa${k}`" class="wsp a" :style="{ '--a': `${k * 51}deg`, '--d': `${(k % 3) * 0.12}s` }" />
      <i v-for="k in 7" :key="`wb${k}`" class="wsp b" :style="{ '--a': `${k * 51}deg`, '--d': `${(k % 3) * 0.12}s` }" />
    </div>
    <div class="clickr" />
    <p class="mlab"><b>DossierCheck</b></p>

    <div class="spec"><Person v-bind="spec" :pose="fe >= 10 ? 'clipboard' : 'rest'" mood="happy" :uid="`d14-spec${sfx}`" /></div>
    <p class="speclab"><b>Specialist review</b>decisions stay with qualified people</p>

    <div class="cloud"><svg viewBox="0 0 180 90"><path d="M40 78 a28 28 0 0 1 -4 -56 a36 36 0 0 1 68 -8 a26 26 0 0 1 44 20 a22 22 0 0 1 -6 44 Z" class="cl" /></svg><b>External provider</b></div>
    <div class="snap"><i v-for="k in 8" :key="k" :style="{ '--a': `${k * 45}deg` }" /><b /></div>
    <div class="server">
      <svg viewBox="0 0 110 150">
        <rect x="6" y="4" width="98" height="142" rx="8" class="srv" />
        <g v-for="k in 4" :key="k" :class="`bay b${k}`"><rect x="16" :y="16 + (k - 1) * 31" width="78" height="22" rx="4" class="bayr" /><circle cx="28" :cy="27 + (k - 1) * 31" r="3.5" class="led" /><path :d="`M40 ${27 + (k - 1) * 31} h44`" class="slot" /></g>
      </svg>
      <b>Local server</b><span>in the hospital</span>
      <i v-for="k in 3" :key="`sd${k}`" class="dust" :class="`u${k}`" />
    </div>
    <div class="core2"><div class="cring" /><div class="cdisc"><span class="c1">GPT-4o</span><span class="c2">smaller<br>model</span></div></div>
    <p class="note">Directions from the thesis (§5.3) and the speech: not measured results.</p>

    <div class="ground" />
    <div class="doc"><Person v-bind="doc" :uid="`d14-doc${sfx}`" /></div>
    <p class="dlab"><b>Clinical researcher</b></p>

    <div class="bot" :class="{ gone: fe >= 9 }" :style="bot">
      <div class="bob">
        <svg viewBox="-60 -60 120 150" class="botsvg">
          <g class="barm l"><rect x="-31" y="22" width="13" height="34" rx="6.5" class="gold" /><circle cx="-24.5" cy="59" r="6.5" class="navy" /></g>
          <g class="barm r"><rect x="18" y="22" width="13" height="34" rx="6.5" class="gold" /><circle cx="24.5" cy="59" r="6.5" class="navy" />
            <g class="wr" transform="translate(24.5 62)"><path d="M0 0 V22" class="wrs" /><path d="M-8 22 a9 9 0 1 0 16 0 l-4 6 h-8 z" class="wrh" /></g>
          </g>
          <path d="M-30 -20 Q-44 -44 -30 -52 Q-18 -42 -14 -30 Z" class="ear" /><path d="M30 -20 Q44 -44 30 -52 Q18 -42 14 -30 Z" class="ear" />
          <path d="M-42 4 Q-44 30 0 32 Q44 30 42 4 Q40 -4 0 -4 Q-40 -4 -42 4 Z" class="gold" />
          <path d="M-34 8 Q-36 -36 0 -36 Q36 -36 34 8 Q0 14 -34 8 Z" class="visor" />
          <path d="M-35 8 Q0 15 35 8" class="rim" />
          <rect x="-11" y="-42" width="22" height="6" rx="3" class="topl" />
          <ellipse cx="-12" cy="-10" rx="5" ry="7" class="eyeb" /><ellipse cx="12" cy="-10" rx="5" ry="7" class="eyeb" />
          <path d="M-18 -8 Q-12 -17 -6 -8 M6 -8 Q12 -17 18 -8" class="eyh" />
          <path d="M-6 2 q3 4 6 0 q3 4 6 0" class="mouth" />
          <text y="23" text-anchor="middle" class="htag">GPT-4o</text>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>

.oldw { position: absolute; inset: 0; z-index: 0; transition: opacity .6s ease .2s; }
.stage:not(.fe0) .oldw { opacity: 0; }
.old :deep(.heading), .old :deep(.doc), .old :deep(.dlab), .old :deep(.bot), .old :deep(.saveb) { opacity: 0 !important; transition: none !important; animation: none !important; }
.fstill, .fstill * { transition: none !important; }

.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 30; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .45s ease, transform .45s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .3s; }
.heading span:first-child { position: relative; transition: none; transform: none; }
.heading span:first-child:not(.on) { opacity: 0; transition: opacity .3s ease; }
.cap { position: absolute; left: 300px; top: 104px; width: 900px; height: 30px; z-index: 6; }
.cap p { position: absolute; inset: 0; margin: 0; font-size: 19px; font-weight: 700; color: #1F5FD6; opacity: 0; transform: translateY(8px); transition: opacity .35s ease, transform .35s ease; }
.cap p.on { opacity: 1; transform: none; transition-delay: .35s; }
.lay { position: absolute; inset: 0; width: 1280px; height: 720px; overflow: visible; z-index: 3; pointer-events: none; }
@keyframes spark { 0% { opacity: 1; transform: rotate(var(--a)) translateY(0); } 100% { opacity: 0; transform: rotate(var(--a)) translateY(-30px) scale(.3); } }
@keyframes march { to { stroke-dashoffset: -12; } }

.saved { position: absolute; left: 226px; top: 479px; width: 132px; height: 81px; box-sizing: border-box; border: 3px solid #0B2A5B; border-radius: 8px; background: linear-gradient(160deg, #4F8DF2, #1F5FD6); box-shadow: 0 0 0 5px rgba(31, 95, 214, .2), 0 0 30px rgba(79, 141, 242, .55); z-index: 9; display: grid; place-items: center; color: #FFFFFF; transform-origin: 0 0; }
.saved b { font-family: var(--font-display); font-size: 22px; font-weight: 800; white-space: nowrap; }
.saved p { position: absolute; left: -10px; right: -10px; top: -44px; margin: 0; text-align: center; font-size: 12.5px; font-weight: 800; color: #1F5FD6; }
.saved span { position: absolute; left: -10px; right: -10px; top: -26px; text-align: center; font-family: var(--font-display); font-size: 16px; font-weight: 800; color: #1F5FD6; }
.stage:not(.fe0) .saved { animation: pocket 1.1s cubic-bezier(.5, 0, .4, 1) .2s both; }
@keyframes pocket { 0% { transform: none; opacity: 1; } 30% { transform: translate(-6px, -24px) rotate(-6deg); opacity: 1; } 100% { transform: translate(-90px, 30px) scale(.08); opacity: 0; } }
.saved p, .saved span { transition: opacity .2s ease; }
.stage:not(.fe0) .saved p, .stage:not(.fe0) .saved span { opacity: 0; }
.fstill .saved { display: none; }
.spark { position: absolute; width: 7px; height: 7px; border-radius: 50%; background: #FFC233; opacity: 0; z-index: 9; }
.pk { left: 136px; top: 506px; }
.stage:not(.fe0):not(.fstill) .pk { animation: spark .5s ease-out 1.25s both; }

.callw { position: absolute; left: 520px; top: 400px; width: 120px; height: 120px; border-radius: 50%; border: 3px solid #7FD3FF; opacity: 0; z-index: 2; }
.stage:is(.fe2, .fe3):not(.fstill) .callw { animation: callw .9s ease-out var(--d) both; }
@keyframes callw { 0% { opacity: .9; transform: scale(.2); } 100% { opacity: 0; transform: scale(2.4); } }

.mech { position: absolute; left: 468px; top: 330px; width: 224px; height: 280px; z-index: 5; }
.stage:is(.fe0, .fe1, .fe2) .mech { opacity: 0; }
.fe3:not(.fstill) .mech { animation: thud .5s cubic-bezier(.3, 1.6, .5, 1) .75s both; }
@keyframes thud { 40% { transform: translateY(6px) scale(1.03, .96); } }
.dust { position: absolute; bottom: -6px; width: 40px; height: 14px; border-radius: 50%; background: radial-gradient(closest-side, rgba(201, 210, 224, .95), rgba(201, 210, 224, 0)); opacity: 0; }
.mech .u1 { left: 40px; } .mech .u2 { left: 92px; } .mech .u3 { left: 144px; }
.fe3:not(.fstill) .mech .dust { animation: dust .7s ease-out .85s both; }
@keyframes dust { 0% { opacity: 1; transform: scale(.4); } 100% { opacity: 0; transform: translateY(-6px) scale(2.4, 1.6); } }
.mlab { position: absolute; left: 480px; top: 630px; width: 200px; margin: 0; text-align: center; font-size: 14px; color: #1F5FD6; opacity: 0; transition: opacity .3s ease; }
.stage:not(.fe0):not(.fe1):not(.fe2) .mlab { opacity: 1; transition-delay: .8s; }
.stage:is(.lc2, .lc3, .lc4, .lc5, .lc6, .lc7) .mech :deep(.core) { opacity: 0 !important; transition: opacity .1s ease !important; }

.fe9:not(.fstill) .mech { animation: dock .45s cubic-bezier(.3, 1.6, .5, 1) both; }
@keyframes dock { 35% { transform: translateY(7px) scale(1.04, .95); } }
.clickr { position: absolute; left: 540px; top: 388px; width: 80px; height: 34px; border-radius: 50%; border: 3px solid #7FE3F0; opacity: 0; z-index: 13; pointer-events: none; }
.fe9:not(.fstill) .clickr { animation: clickRing .55s ease-out both; }
@keyframes clickRing { 0% { opacity: 1; transform: scale(.4); } 100% { opacity: 0; transform: scale(2.1); } }
.gwave { position: absolute; left: -20px; top: -10px; width: 264px; height: 300px; border-radius: 40%; border: 3px solid #4FB8FF; opacity: 0; pointer-events: none; }
.lc3:not(.fstill) .gwave { animation: gwave 1s ease-out both; }
@keyframes gwave { 0% { opacity: .9; transform: scale(.7); } 100% { opacity: 0; transform: scale(1.25); } }

.armor { position: absolute; left: 468px; top: 330px; width: 224px; height: 280px; z-index: 6; pointer-events: none; }
.plate { position: absolute; top: 70px; width: 48px; height: 36px; }
.pl1 { left: 30px; } .pl2 { left: 146px; }
.plate svg { width: 100%; height: 100%; overflow: visible; }
.plate rect { fill: rgba(220, 232, 255, 0); stroke: #1F5FD6; stroke-width: 3; stroke-dasharray: 7 5; opacity: 0; }
.bolt { fill: #0B2A5B; opacity: 0; transform-box: fill-box; transform-origin: 50% 50%; }
.stage:is(.fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .plate rect { opacity: 1; transition: opacity .4s ease .6s; }
.stage:not(.fstill):is(.fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .plate rect { animation: march .9s linear infinite; }
.stage:is(.fe6, .fe7, .fe8, .fe9, .fe10) .pl1 rect, .stage:is(.fe7, .fe8, .fe9, .fe10) .pl2 rect { fill: rgba(220, 232, 255, .95); transition: fill .8s ease .3s; }
.stage:is(.fe6, .fe7, .fe8, .fe9, .fe10) .pl1 .bolt, .stage:is(.fe7, .fe8, .fe9, .fe10) .pl2 .bolt { opacity: 1; }
.fe6:not(.fstill) .pl1 .bolt, .fe7:not(.fstill) .pl2 .bolt { animation: boltIn .9s ease-out .25s both; }
@keyframes boltIn { 0% { opacity: 0; transform: scale(2) rotate(0); } 30% { opacity: 1; } 100% { opacity: 1; transform: scale(1) rotate(540deg); } }
.fe6:not(.fstill) .pl1, .fe7:not(.fstill) .pl2 { animation: rattle .12s linear .35s 6; }
@keyframes rattle { 50% { transform: translate(1px, -1px) rotate(1.5deg); } }
.stage:is(.lc3, .lc4, .lc5, .lc6, .lc7) .plate rect { stroke: #4FB8FF; fill: #E6F6FF; filter: drop-shadow(0 0 6px #7FD3FF); transition: stroke .4s ease, fill .4s ease; }
.wsp { position: absolute; top: 88px; width: 6px; height: 6px; border-radius: 50%; background: #FFC233; opacity: 0; }
.wsp.a { left: 52px; } .wsp.b { left: 168px; }
.fe6:not(.fstill) .wsp.a, .fe7:not(.fstill) .wsp.b { animation: spark .4s ease-out calc(.35s + var(--d)) 3 both; }

.chk { position: absolute; box-sizing: border-box; border-radius: 10px; font-weight: 800; color: var(--ink); white-space: nowrap; z-index: 4; }
.chk.now { left: 236px; width: 218px; height: 34px; display: flex; align-items: center; gap: 8px; padding: 0 12px; border: 2px solid #0B2A5B; background: #FFFFFF; font-size: 13.5px; opacity: 0; transform: perspective(400px) rotateY(-75deg); transform-origin: 100% 50%; }
.chk.now i { width: 12px; height: 12px; border-radius: 3px; flex: none; }
.chk.g i { background: #1F5FD6; } .chk.i i { background: #F47B20; } .chk.m i { background: #0B2A5B; }
.stage:is(.fe4, .fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .chk.now { opacity: 1; transform: none; transition: opacity .2s ease calc(var(--d) + .4s), transform .6s cubic-bezier(.3, 1.5, .5, 1) calc(var(--d) + .4s); }
.fe4:not(.fstill) .chk.now { animation: lit .8s ease calc(var(--d) + .6s) both; }
@keyframes lit { 0% { box-shadow: 0 0 0 0 rgba(79, 184, 255, 0); } 40% { box-shadow: 0 0 0 6px rgba(79, 184, 255, .45), 0 0 22px rgba(79, 184, 255, .6); } 100% { box-shadow: 0 0 0 0 rgba(79, 184, 255, 0); } }
.chk.fut { left: 724px; width: 244px; height: 76px; color: #1F5FD6; transform: translateX(40px); opacity: 0; }
.stage:is(.fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .chk.fut { opacity: 1; transform: none; transition: opacity .25s ease var(--d), transform .6s cubic-bezier(.3, 1.4, .5, 1) var(--d); }
.draft { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.draft rect { fill: #F7F9FD; stroke: #1F5FD6; stroke-width: 2.5; stroke-dasharray: 7 5; }
.stage:not(.fstill):is(.fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .draft rect { animation: march 1s linear infinite; }
.ft { position: relative; margin: 8px 0 0 10px; display: flex; align-items: center; gap: 8px; font-size: 14px; }
.ft em { font-style: normal; width: 20px; height: 20px; border-radius: 50%; background: #F47B20; color: #FFFFFF; display: grid; place-items: center; font-size: 15px; font-weight: 800; transform: scale(0) rotate(-180deg); }
.stage:is(.fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .ft em { transform: none; transition: transform .5s cubic-bezier(.3, 1.8, .5, 1) calc(var(--d) + .45s); }
.meth, .scales { position: relative; display: block; width: 200px; height: 30px; margin: 4px 0 0 22px; overflow: visible; }
.meth text, .scales text { font-size: 9.5px; font-weight: 700; fill: var(--mist); }

.mn { fill: #FFFFFF; stroke: #1F5FD6; stroke-width: 2.5; transform-box: fill-box; transform-origin: 50% 50%; }
.mline { fill: none; stroke: #F47B20; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 60; stroke-dashoffset: 60; }
.stage:is(.fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .mn { fill: #DCE8FF; }
.stage:is(.fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .mline { stroke-dashoffset: 0; }
.fe5:not(.fstill) .mn { animation: nodeOn .45s cubic-bezier(.3, 1.8, .5, 1) both; }
.fe5:not(.fstill) .n1 { animation-delay: .8s; } .fe5:not(.fstill) .n2 { animation-delay: 1.3s; } .fe5:not(.fstill) .n3 { animation-delay: 1.8s; }
@keyframes nodeOn { 0% { transform: scale(0); fill: #FFFFFF; } 60% { transform: scale(1.35); fill: #F47B20; } 100% { transform: scale(1); fill: #DCE8FF; } }
.fe5:not(.fstill) .mline { transition: stroke-dashoffset .45s ease; } .fe5:not(.fstill) .l1 { transition-delay: 1.05s; } .fe5:not(.fstill) .l2 { transition-delay: 1.55s; }
.stage:is(.fe6, .fe7, .fe8, .fe9, .fe10):not(.fstill) .mn { animation: nodePing 3s ease-in-out infinite; }
.stage:is(.fe6, .fe7, .fe8, .fe9, .fe10):not(.fstill) .n2 { animation-delay: .3s; } .stage:is(.fe6, .fe7, .fe8, .fe9, .fe10):not(.fstill) .n3 { animation-delay: .6s; }
@keyframes nodePing { 0%, 70%, 100% { fill: #DCE8FF; transform: none; } 80% { fill: #F47B20; transform: scale(1.2); } }
.sbar { stroke: #1F5FD6; stroke-width: 2.5; stroke-linecap: round; } .pan { fill: #DCE8FF; stroke: #1F5FD6; stroke-width: 2; stroke-linejoin: round; }
.beam { transform-box: view-box; transform-origin: 100px 8px; }
.stage:is(.fe5, .fe6, .fe7, .fe8, .fe9, .fe10):not(.fstill) .beam { animation: weigh 2.4s ease-in-out 1.2s infinite alternate; }
@keyframes weigh { from { transform: rotate(-9deg); } to { transform: rotate(9deg); } }
.nowlab, .futlab { position: absolute; margin: 0; font-size: 12px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; opacity: 0; transition: opacity .3s ease; }
.nowlab { left: 236px; top: 264px; color: var(--mist); } .futlab { left: 724px; top: 278px; color: #F47B20; }
.stage:is(.fe4, .fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .nowlab { opacity: 1; }
.stage:is(.fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .futlab { opacity: 1; }
.clink { fill: none; stroke: #8C96A8; stroke-width: 2; stroke-dasharray: 200; stroke-dashoffset: 200; }
.stage:is(.fe4, .fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .clink:not(.new) { stroke-dashoffset: 0; transition: stroke-dashoffset .5s ease var(--d); }
.clink.new { stroke: #1F5FD6; stroke-dasharray: 5 6; stroke-dashoffset: 0; opacity: 0; transition: opacity .4s ease; }
.stage:is(.fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .clink.new { opacity: 1; transition-delay: calc(.2s + var(--d)); }
.stage:not(.fstill):is(.fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .clink.new { animation: march 1s linear infinite; }
.slink { fill: none; stroke: #F47B20; stroke-width: 2.5; stroke-dasharray: 5 6; opacity: 0; transition: opacity .4s ease; }
.fe10 .slink { opacity: 1; transition-delay: calc(.7s + var(--d)); }
.fe10:not(.fstill) .slink { animation: march 1s linear infinite; }
.pulse { position: absolute; left: 0; top: 0; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; opacity: 0; z-index: 4; offset-rotate: 0deg; pointer-events: none; }
.pulse.now { background: #4FB8FF; box-shadow: 0 0 10px #4FB8FF; }
.fe4:not(.fstill) .pulse.now { animation: travel .5s ease-in var(--d) both; }
@keyframes travel { 0% { offset-distance: 0%; opacity: 1; } 90% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }
.pulse.spc { background: #F47B20; }
.fe10:not(.fstill) .pulse.spc { animation: travel 1.2s ease-in-out calc(1.1s + var(--d)) infinite; }
.spec { position: absolute; left: 1060px; top: 352px; width: 160px; height: 270px; z-index: 4; opacity: 0; transform: translateX(260px); transition: transform 1.1s cubic-bezier(.3, 1.1, .5, 1), opacity .3s ease; }
.fe10 .spec { opacity: 1; transform: none; }
.fe10:not(.fstill) .spec :deep(svg) { animation: walkin .28s ease-in-out 4 alternate; }
@keyframes walkin { to { transform: translateY(-7px); } }
.speclab { position: absolute; left: 1040px; top: 630px; width: 200px; margin: 0; text-align: center; font-size: 11.5px; font-weight: 600; color: var(--mist); opacity: 0; transition: opacity .3s ease; }
.speclab b { display: block; font-size: 14px; color: var(--ink); }
.fe10 .speclab { opacity: 1; transition-delay: .8s; }
.note { position: absolute; left: 300px; top: 660px; margin: 0; font-size: 11.5px; font-weight: 600; color: var(--mist); opacity: 0; transition: opacity .3s ease; }
.stage:is(.fe5, .fe6, .fe7, .fe8, .fe9, .fe10) .note { opacity: 1; }

.cloud { position: absolute; left: 990px; top: 142px; width: 180px; height: 90px; z-index: 4; opacity: 0; transform: translate(70px, -30px) scale(.8); transition: opacity .4s ease, transform .9s cubic-bezier(.3, 1.3, .5, 1); }
.cloud svg { width: 100%; height: 100%; overflow: visible; }
.cl { fill: #F7F9FD; stroke: #8C96A8; stroke-width: 3; stroke-linejoin: round; }
.cloud b { position: absolute; left: 0; right: 0; top: 42px; text-align: center; font-size: 12.5px; font-weight: 800; color: #5E6B85; }
.stage:is(.lc1, .lc2, .lc3, .lc4, .lc5) .cloud { opacity: 1; transform: none; }
.stage:is(.lc1, .lc2, .lc3, .lc4, .lc5):not(.fstill) .cloud svg { animation: cbob 2.4s ease-in-out infinite alternate; }
@keyframes cbob { to { transform: translateY(-6px); } }
.stage:is(.lc6, .lc7) .cloud { opacity: 0; transform: translate(160px, -90px) scale(.55) rotate(8deg); transition: opacity 1s ease .4s, transform 1.4s cubic-bezier(.5, 0, .7, .4) .1s; }
.cable { fill: none; stroke-width: 3; stroke-linecap: round; }
.cable.ext { stroke: #8C96A8; stroke-dasharray: 640; stroke-dashoffset: 640; transition: stroke-dashoffset .8s ease .4s; }
.stage:is(.lc1, .lc2, .lc3, .lc4, .lc5) .cable.ext { stroke-dashoffset: 0; }
.stage:is(.lc6, .lc7) .cable.ext { opacity: 0; transition: none; }
.lc5:not(.fstill) .cable.ext { animation: tense .12s linear .5s 4; }
@keyframes tense { 50% { transform: translate(1px, 1px); } }
.cable.half { stroke: #8C96A8; opacity: 0; transform-box: fill-box; }
.lc6:not(.fstill) .h1 { transform-origin: 100% 50%; animation: whipA 1.1s cubic-bezier(.2, .8, .4, 1) both; }
.lc6:not(.fstill) .h2 { transform-origin: 100% 100%; animation: whipB 1.1s cubic-bezier(.4, 0, .8, .5) both; }
@keyframes whipA { 0% { opacity: 1; transform: none; } 30% { transform: translate(14px, -8px) rotate(-5deg); } 100% { opacity: 0; transform: translate(60px, -40px) rotate(-10deg); } }
@keyframes whipB { 0% { opacity: 1; transform: none; } 25% { transform: rotate(-6deg); } 100% { opacity: 0; transform: translate(-10px, 80px) rotate(14deg); } }
.pulse.ext { background: #FFC233; box-shadow: 0 0 8px #FFC233; }
.stage:is(.lc1, .lc2):not(.fstill) .pulse.ext { animation: travel 1.3s linear calc(1s + var(--d)) infinite; }
.cable.loc { stroke: #1F5FD6; stroke-width: 4; stroke-dasharray: 200; stroke-dashoffset: 200; transition: stroke-dashoffset .6s ease .2s; }
.lc7 .cable.loc { stroke-dashoffset: 0; }
.pulse.loc { background: #4FB8FF; box-shadow: 0 0 8px #4FB8FF; }
.lc7:not(.fstill) .pulse.loc { animation: travel 1.1s linear calc(.8s + var(--d)) infinite; }
.snap { position: absolute; left: 790px; top: 205px; width: 0; height: 0; z-index: 6; }
.snap i { position: absolute; width: 8px; height: 8px; margin: -4px; border-radius: 50%; background: #FFC233; opacity: 0; }
.snap b { position: absolute; left: -22px; top: -22px; width: 44px; height: 44px; border-radius: 50%; background: radial-gradient(closest-side, #FFF6C8, rgba(255, 194, 51, 0)); opacity: 0; }
.lc6:not(.fstill) .snap i { animation: spark .55s ease-out both; }
.lc6:not(.fstill) .snap b { animation: flash .4s ease-out both; }
@keyframes flash { 0% { opacity: 1; transform: scale(.3); } 100% { opacity: 0; transform: scale(1.8); } }
.server { position: absolute; left: 300px; top: 456px; width: 110px; z-index: 4; text-align: center; opacity: 0; transform: translateY(50px) scale(.7, 1.2); transform-origin: 50% 100%; transition: opacity .2s ease, transform .55s cubic-bezier(.3, 1.6, .5, 1); }
.server svg { width: 110px; height: 150px; }
.server b { display: block; margin-top: -2px; font-size: 13px; color: #1F5FD6; } .server span { font-size: 11px; font-weight: 600; color: var(--mist); }
.server .u1 { left: 0; bottom: 30px; } .server .u2 { left: 36px; bottom: 30px; } .server .u3 { left: 72px; bottom: 30px; }
.lc4:not(.fstill) .server .dust { animation: dust .7s ease-out .25s both; }
.srv { fill: #0B2A5B; } .bayr { fill: #2A4C8F; transition: fill .3s ease; } .slot { stroke: #5E7FBF; stroke-width: 3; stroke-linecap: round; }
.led { fill: #5E6B85; transition: fill .2s ease; }
.stage:is(.lc4, .lc5, .lc6, .lc7) .server { opacity: 1; transform: none; }
.stage:is(.lc5, .lc6, .lc7) .led { fill: #7FE3F0; }
.stage:is(.lc5, .lc6, .lc7):not(.fstill) .led { animation: led .6s ease-in-out infinite alternate; }
.stage:is(.lc5, .lc6, .lc7) .b2 .led { animation-delay: .15s; } .stage:is(.lc5, .lc6, .lc7) .b3 .led { animation-delay: .3s; } .stage:is(.lc5, .lc6, .lc7) .b4 .led { animation-delay: .45s; }
.stage:is(.lc5, .lc6, .lc7) .b1 .bayr { fill: #1F5FD6; transition-delay: .7s; }
.lc5:not(.fstill) .server { animation: gulp .4s cubic-bezier(.3, 1.6, .5, 1) .75s both; }
@keyframes gulp { 40% { transform: scale(1.06, .94); } }
@keyframes led { to { fill: #1F5FD6; } }

.core2 { position: absolute; left: 580px; top: 463px; width: 0; height: 0; z-index: 8; opacity: 0; transition: transform .9s cubic-bezier(.4, 1.4, .5, 1), opacity .3s ease; }
.cring { position: absolute; left: -32px; top: -32px; width: 64px; height: 64px; border-radius: 50%; background: #7FD3FF; opacity: .35; animation: cring 1.6s ease-in-out infinite; }
@keyframes cring { 50% { transform: scale(1.18); opacity: .15; } }
.cdisc { position: absolute; left: -27px; top: -27px; width: 54px; height: 54px; box-sizing: border-box; border-radius: 50%; background: #FFFFFF; border: 4px solid #7FD3FF; display: grid; place-items: center; }
.cdisc span { grid-area: 1 / 1; font-family: var(--font-display); font-size: 11px; font-weight: 800; line-height: 1; text-align: center; color: #0B2A5B; transition: opacity .3s ease; }
.c2 { opacity: 0; font-size: 9px !important; }
.stage:is(.lc3, .lc4, .lc5) .c1 { opacity: 0; } .stage:is(.lc3, .lc4, .lc5) .c2 { opacity: 1; }
.stage:is(.lc2, .lc3, .lc4) .core2 { opacity: 1; }
.lc2 .core2 { transform: translate(-40px, -200px) scale(1.35); }
.lc3 .core2, .lc4 .core2 { transform: translate(-40px, -200px) scale(.8); }
.lc3:not(.fstill) .cdisc { animation: squeeze .6s ease both; }
@keyframes squeeze { 30% { transform: scale(1.25, .7); } 60% { transform: scale(.85, 1.15); } }
.lc5 .core2 { opacity: 1; animation: intoServer .85s cubic-bezier(.5, 0, .5, 1) both; }
@keyframes intoServer { 0% { transform: translate(-40px, -200px) scale(.8); } 55% { transform: translate(-140px, -230px) scale(.7); } 100% { transform: translate(-225px, 20px) scale(.3); opacity: 0; } }
.lc6 .core2, .lc7 .core2 { opacity: 0; }

.ground { position: absolute; left: 30px; width: 1220px; top: 624px; height: 2px; background: #E1E6EF; z-index: 1; }
.doc { position: absolute; left: 40px; top: 350px; width: 160px; height: 270px; z-index: 7; }
.dlab { position: absolute; left: 20px; top: 630px; width: 200px; margin: 0; text-align: center; font-size: 14px; color: var(--ink); z-index: 7; }
.bot { position: absolute; left: 0; top: 0; width: 120px; height: 150px; z-index: 12; transform-origin: 60px 60px; transition: transform .9s cubic-bezier(.5, -.2, .35, 1.15); }
.fe0 .bot { transition: none; }
.fe6 .bot, .fe7 .bot { transition: transform .7s cubic-bezier(.4, -.3, .4, 1.3); }

.fe8 .bot { transition: transform .75s cubic-bezier(.6, -.5, .5, 1); }
.bot.gone { opacity: 0; transition: none; }
.bob { width: 100%; height: 100%; animation: bob 2.4s ease-in-out infinite; }
.stage:is(.fe8, .fe9, .fe10) .bob { animation: none; }
@keyframes bob { 50% { transform: translateY(-7px); } }
.botsvg { width: 100%; height: 100%; overflow: visible; }
.gold { fill: #C49A3E; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.navy { fill: #0B2A5B; }
.ear { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.visor { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; }
.rim { fill: none; stroke: #DFF6FF; stroke-width: 2; stroke-linecap: round; }
.topl { fill: #DFF6FF; stroke: #0B2A5B; stroke-width: 1.5; }
.eyeb { fill: #7FE3F0; opacity: 0; }
.eyh { fill: none; stroke: #7FE3F0; stroke-width: 3; stroke-linecap: round; }

.stage:is(.fe6, .fe7) .eyeb { opacity: 1; } .stage:is(.fe6, .fe7) .eyh { opacity: 0; }
.mouth { fill: none; stroke: #7FE3F0; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.htag { font-family: var(--font-display); font-size: 8.5px; font-weight: 800; fill: #0B2A5B; }
.wrs { stroke: #8C96A8; stroke-width: 4; stroke-linecap: round; } .wrh { fill: #C9D2E0; stroke: #0B2A5B; stroke-width: 1.8; stroke-linejoin: round; }
.wr { opacity: 0; transition: opacity .2s ease; }
.stage:is(.fe5, .fe6, .fe7) .wr { opacity: 1; }
.barm { transform-box: view-box; transition: transform .45s cubic-bezier(.3, 1.6, .5, 1); }
.barm.l { transform-origin: -24.5px 26px; } .barm.r { transform-origin: 24.5px 26px; }
.fe0 .barm.l { transform: rotate(60deg); }
.fe0 .barm.r { animation: tap .5s ease-in-out infinite alternate; }
@keyframes tap { from { transform: rotate(-20deg); } to { transform: rotate(-70deg); } }

.stage:is(.fe2, .fe3) .barm.l { animation: callL .25s ease-in-out infinite alternate; }
.stage:is(.fe2, .fe3) .barm.r { animation: callR .25s ease-in-out infinite alternate; }
@keyframes callL { from { transform: rotate(130deg); } to { transform: rotate(165deg); } }
@keyframes callR { from { transform: rotate(-130deg); } to { transform: rotate(-165deg); } }
.fe2 .bob { animation: callM .3s ease-in-out infinite alternate; }
@keyframes callM { to { transform: translateY(-10px) rotate(6deg); } }

.fe5 .barm.r { transform: rotate(-120deg); }
.stage:is(.fe6, .fe7) .barm.r { animation: screw .3s ease-in-out .35s infinite alternate; }
@keyframes screw { from { transform: rotate(-5deg); } to { transform: rotate(-60deg); } }
.stage:is(.fe6, .fe7) .barm.l { transform: rotate(35deg); }
.stage:is(.fe6, .fe7) .bob { animation: effort .12s ease-in-out .35s infinite alternate; }
@keyframes effort { to { transform: translate(1px, 1.5px); } }

.fe8 .barm.l { transform: rotate(10deg); } .fe8 .barm.r { transform: rotate(-10deg); }
.fstill .barm, .fstill .bob { animation: none !important; }
</style>
