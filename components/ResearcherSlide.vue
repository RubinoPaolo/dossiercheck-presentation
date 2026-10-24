<script setup lang="ts">
import { computed, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const step = computed(() => unref($clicks) as number)

const active = useIsSlideActive()
const arrived = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
watch(active, (a) => {
  clearTimeout(timer)
  arrived.value = false
  if (a) timer = setTimeout(() => (arrived.value = true), 60)
}, { immediate: true })

type Kind = 'virus' | 'bacterium' | 'cell'
const icons: { kind: Kind, x: number, y: number, s: number }[] = [
  { kind: 'virus', x: 300, y: 230, s: 1.15 },
  { kind: 'cell', x: 430, y: 350, s: 0.85 },
  { kind: 'bacterium', x: 250, y: 455, s: 1 },
  { kind: 'virus', x: 410, y: 560, s: 0.75 },
  { kind: 'bacterium', x: 160, y: 320, s: 0.7 },
  { kind: 'cell', x: 1000, y: 225, s: 1 },
  { kind: 'virus', x: 860, y: 370, s: 0.9 },
  { kind: 'bacterium', x: 1020, y: 470, s: 1.1 },
  { kind: 'virus', x: 1130, y: 330, s: 0.7 },
  { kind: 'cell', x: 880, y: 560, s: 0.8 },
]
function iconStyle(i: number) {
  const ic = icons[i]
  const side = ic.x < 640 ? -1 : 1
  let dx = 0, dur = 1.2, delay = 0
  if (!arrived.value) { dx = side * 700; dur = 0 }
  else if (step.value === 0) { dx = 0; dur = 5.5; delay = 1.2 + i * 0.12 }
  else if (step.value <= 2) { dx = side * 90; dur = 1.3; delay = 0.25 + (i % 5) * 0.05 }
  else { dx = -side * 70; dur = 4; delay = 1.4 + (i % 5) * 0.15 }
  return {

    opacity: arrived.value ? 0.55 + ic.s * 0.4 : 0,
    transform: `translate(${ic.x + dx}px, ${ic.y}px) scale(${ic.s * 1.7})`,
    transition: `transform ${dur}s cubic-bezier(.25, .8, .3, 1) ${delay}s, opacity 1.2s ease ${delay}s`,
  }
}

function facing(i: number) {
  const side = icons[i].x < 640 ? -1 : 1
  const towardCenter = -side
  const dir = (step.value === 1 || step.value === 2) ? side : towardCenter
  return { transform: `scaleX(${dir > 0 ? -1 : 1})` }
}

const puffs = [
  { x: 58, y: 146, t: 1.62 },
  { x: 60, y: 160, t: 2.12 },
  { x: 57, y: 174, t: 2.6 },
]
const puffDots = [
  { dx: -10, dy: -4, r: 5 }, { dx: -4, dy: 4, r: 6.5 }, { dx: 4, dy: -2, r: 4.5 },
  { dx: -14, dy: 6, r: 3.5 }, { dx: 0, dy: -9, r: 3.8 },
]

const papers = [
  { x: 6, y: 236, r: -14 }, { x: 98, y: 240, r: 12 }, { x: 52, y: 238, r: 3 },
  { x: -10, y: 196, r: 18 }, { x: 108, y: 200, r: -16 }, { x: 46, y: 196, r: -5 },
  { x: 14, y: 156, r: -22 }, { x: 96, y: 160, r: 20 }, { x: 54, y: 150, r: 8 },
]
</script>

<template>
  <div class="stage" :class="{ play: active, harsh: step >= 3 }">
    <h2 class="display heading">
      <span class="t1" :class="{ off: step >= 3 }">Imagine You are a Medical Researcher</span>
      <span class="t2" :class="{ on: step >= 3 }">…and the Harsh Reality</span>
    </h2>

    <div class="scene">

      <div v-for="(ic, i) in icons" :key="i" class="icon" :style="iconStyle(i)">
        <div class="drift" :style="{ animationDelay: `${-i * 1.3}s`, animationDuration: `${6 + (i % 4)}s` }">
          <div class="turn" :style="ic.kind === 'bacterium' ? facing(i) : undefined">
          <svg viewBox="-30 -30 60 60" class="bob" :class="{ swim: ic.kind === 'bacterium' }" :style="{ animationDelay: `${-i * 0.7}s` }">
            <g v-if="ic.kind === 'virus'" class="virus">
              <g class="spin">
                <g v-for="k in 8" :key="k" :transform="`rotate(${k * 45})`">
                  <line x1="0" y1="-14" x2="0" y2="-22" /><circle cx="0" cy="-23" r="3" />
                </g>
              </g>
              <circle r="14" />
              <circle cx="-4" cy="-5" r="3.5" class="shine" />
            </g>
            <g v-else-if="ic.kind === 'bacterium'" class="bacterium">
              <path d="M18 0 q5 -6 9 0 t9 0 t9 0" class="tail">
                <animate attributeName="d" dur=".55s" repeatCount="indefinite"
                  values="M18 0 q5 -6 9 0 t9 0 t9 0;M18 0 q5 6 9 0 t9 0 t9 0;M18 0 q5 -6 9 0 t9 0 t9 0" />
              </path>
              <rect x="-20" y="-9" width="40" height="18" rx="9" />
              <rect x="-14" y="-5" width="18" height="3" rx="1.5" class="shine" />
              <circle cx="-6" cy="3" r="2.2" class="dot" /><circle cx="6" cy="2" r="1.8" class="dot" />
            </g>
            <g v-else class="cell">
              <circle r="17" /><circle cx="3" cy="-2" r="6.5" class="nucleus" />
              <circle cx="-8" cy="7" r="1.8" class="dot" /><circle cx="9" cy="9" r="1.4" class="dot" />
            </g>
          </svg>
          </div>
        </div>
      </div>

      <div class="ground" />

      <div class="stand">

        <div class="pillar-shadow" :class="{ on: step >= 1 }" />

        <div class="pillar-clip">
          <svg viewBox="0 0 170 160" class="pillar" :class="{ up: step >= 1 }">
            <defs>
              <linearGradient id="shaftShade" x1="0" x2="1">
                <stop offset="0" stop-color="#FFFFFF" />
                <stop offset=".6" stop-color="#F4F7FC" />
                <stop offset="1" stop-color="#DFE6F2" />
              </linearGradient>
            </defs>
            <rect x="6" y="0" width="158" height="16" rx="3" class="cap" />
            <rect x="20" y="16" width="130" height="10" class="cap2" />
            <rect x="30" y="26" width="110" height="110" fill="url(#shaftShade)" class="shaft" />
            <line v-for="k in 4" :key="k" :x1="30 + k * 22" y1="32" :x2="30 + k * 22" y2="130" class="flute" />
            <rect x="16" y="136" width="138" height="10" class="cap2" />
            <rect x="4" y="146" width="162" height="14" rx="3" class="cap" />
          </svg>
        </div>

        <div class="hero" :class="{ up: step >= 1 }">
          <div class="halo" :class="{ on: step === 2 }" />
          <div class="pop-wrap">
            <svg viewBox="-110 -110 220 220" class="burst">
              <line v-for="k in 10" :key="k" x1="0" y1="-74" x2="0" y2="-94" :transform="`rotate(${k * 36 + 18})`" />
            </svg>

            <svg viewBox="0 0 160 270" class="figure" :class="`s${Math.min(step, 3)}`">
              <defs>
                <linearGradient id="coatShade" x1="0" x2="1">
                  <stop offset="0" stop-color="#FFFFFF" />
                  <stop offset=".62" stop-color="#FFFFFF" />
                  <stop offset="1" stop-color="#E4EAF4" />
                </linearGradient>
              </defs>

              <ellipse cx="80" cy="258" rx="38" ry="6" class="shadow" />

              <g class="land">
                <circle cx="44" cy="252" r="6" /><circle cx="36" cy="248" r="4" />
                <circle cx="116" cy="252" r="6" /><circle cx="124" cy="248" r="4" />
              </g>

              <g class="body">

                <rect x="62" y="204" width="13" height="48" rx="5" class="pants" />
                <rect x="85" y="204" width="13" height="48" rx="5" class="pants" />
                <path d="M54 256 Q55 247 68 248 L75 248 L75 257 Z" class="shoe" />
                <path d="M106 256 Q105 247 92 248 L85 248 L85 257 Z" class="shoe" />

                <path d="M54 104 Q80 94 106 104 L118 212 L42 212 Z" fill="url(#coatShade)" class="coat" />
                <path d="M74 100 L80 117 L86 100 Z" class="shirt" />
                <path d="M74 100 L67 148 M86 100 L93 148" class="lapel" />
                <line x1="80" y1="118" x2="80" y2="210" class="lapel thin" />
                <circle cx="80" cy="160" r="1.8" class="button" /><circle cx="80" cy="182" r="1.8" class="button" />
                <rect x="90" y="150" width="16" height="18" rx="2" class="pocket" />
                <rect x="96" y="140" width="3.5" height="15" rx="1.5" class="pen" />
                <rect x="58" y="120" width="14" height="10" rx="2" class="badge" />

                <g class="head">
                  <rect x="74" y="88" width="12" height="12" class="skin neck" />
                  <circle cx="80" cy="64" r="30" class="skin" />
                  <path d="M50 60 Q50 30 80 30 Q110 30 110 60 Q104 47 90 45 Q80 52 64 46 Q55 50 50 60 Z" class="hair" />
                  <circle cx="69" cy="66" r="8.5" class="glass" /><circle cx="91" cy="66" r="8.5" class="glass" />
                  <line x1="77.5" y1="66" x2="82.5" y2="66" class="glass" />
                  <ellipse cx="62" cy="77" rx="4.5" ry="2.5" class="cheek" /><ellipse cx="98" cy="77" rx="4.5" ry="2.5" class="cheek" />

                  <g v-if="step < 2" class="face">
                    <g class="eyes"><circle cx="69" cy="66" r="2.6" /><circle cx="91" cy="66" r="2.6" /></g>
                    <path d="M71 81 Q80 87 89 81" class="mouth" />
                  </g>
                  <g v-else-if="step === 2" class="face">
                    <path d="M65 67 Q69 62 73 67 M87 67 Q91 62 95 67" class="mouth" />
                    <path d="M69 79 Q80 92 91 79 Z" class="smile" />
                  </g>
                  <g v-else class="face">
                    <circle cx="69" cy="67" r="2.6" /><circle cx="91" cy="65" r="3.2" />
                    <path d="M62 53 L74 56 M86 52 L97 50" class="mouth" />
                    <path d="M70 84 q4 -4 7 0 t7 0 t6 0" class="mouth" />
                  </g>
                </g>

                <g class="arm left">
                  <g class="upper" style="transform-origin: 54px 112px">
                    <rect x="46.5" y="106" width="15" height="42" rx="7.5" class="sleeve" />
                    <g class="fore" style="transform-origin: 54px 144px">
                      <rect x="46.5" y="138" width="15" height="38" rx="7.5" class="sleeve" />
                      <line x1="47.5" y1="170" x2="60.5" y2="170" class="cuff" />
                      <circle cx="54" cy="180" r="7" class="skin" />
                    </g>
                  </g>
                </g>
                <g class="arm right">
                  <g class="upper" style="transform-origin: 106px 112px">
                    <rect x="98.5" y="106" width="15" height="42" rx="7.5" class="sleeve" />
                    <g class="fore" style="transform-origin: 106px 144px">
                      <rect x="98.5" y="138" width="15" height="38" rx="7.5" class="sleeve" />
                      <line x1="99.5" y1="170" x2="112.5" y2="170" class="cuff" />
                      <circle cx="106" cy="180" r="7" class="skin" />
                    </g>
                  </g>
                </g>
              </g>

              <g v-for="(p, i) in puffs" :key="'p' + i" class="puff" :style="{ '--t': `${p.t}s` }">
                <circle v-for="(d, j) in puffDots" :key="j" :cx="p.x + d.dx" :cy="p.y + d.dy" :r="d.r" :style="{ '--j': j }" />
              </g>
            </svg>

            <svg viewBox="-20 0 200 300" class="papers">
              <g
                v-for="(p, i) in papers" :key="i" class="paper"
                :style="{ '--x': `${p.x}px`, '--y': `${p.y}px`, '--r': `${p.r}deg`, animationDelay: `${0.5 + i * 0.16}s` }"
              >
                <rect x="0" y="0" width="58" height="72" rx="3" />
                <line x1="9" y1="14" x2="49" y2="14" /><line x1="9" y1="25" x2="49" y2="25" />
                <line x1="9" y1="36" x2="40" y2="36" /><line x1="9" y1="47" x2="46" y2="47" />
              </g>
            </svg>
            <span class="qmark">?</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 3; }
.heading span { display: inline-block; transition: opacity .5s ease, transform .5s ease; }
.t2 { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); }
.t1.off { opacity: 0; transform: translateY(-10px); }
.t2.on { opacity: 1; transform: none; transition-delay: .25s; animation: wobble .6s ease .25s; }
@keyframes wobble { 0%, 100% { transform: none; } 25% { transform: rotate(-1.5deg); } 75% { transform: rotate(1.5deg); } }

.scene { position: absolute; inset: 0; }
.icon, .pillar-clip, .figure { transition: filter 1.2s ease; }
.harsh .scene { animation: shake .7s cubic-bezier(.36, .07, .19, .97); }
.harsh .icon, .harsh .pillar-clip, .harsh .figure { filter: saturate(.15) brightness(.96); }
@keyframes shake {
  10%, 90% { transform: translate(-2px, 1px); }
  20%, 80% { transform: translate(5px, -2px); }
  30%, 50%, 70% { transform: translate(-8px, 2px); }
  40%, 60% { transform: translate(8px, -1px); }
}

.icon { position: absolute; left: -30px; top: -30px; width: 60px; height: 60px; }
.drift { width: 100%; height: 100%; animation: drift 7s ease-in-out infinite; }
@keyframes drift { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(6px, -4px); } 66% { transform: translate(-5px, 5px); } }
.bob { width: 100%; height: 100%; overflow: visible; animation: bob 4.2s ease-in-out infinite; }
@keyframes bob { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-8px) rotate(6deg); } }
.turn { width: 100%; height: 100%; transition: transform .45s cubic-bezier(.4, 0, .2, 1) .15s; }

.bob.swim { animation-name: swim; animation-duration: 1.1s; }
@keyframes swim { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-3px) rotate(3deg); } }
.spin { animation: spin 14s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.virus circle { fill: #FFE6D2; stroke: #F47B20; stroke-width: 2.2; }
.virus line { stroke: #F47B20; stroke-width: 2.2; stroke-linecap: round; }
.virus .shine, .bacterium .shine { fill: #FFFFFF; stroke: none; opacity: .85; }
.bacterium rect { fill: #DDE8FB; stroke: #1F5FD6; stroke-width: 2.2; }
.bacterium .tail { fill: none; stroke: #1F5FD6; stroke-width: 2; stroke-linecap: round; }
.bacterium .dot { fill: #1F5FD6; }
.cell circle { fill: #EEF2F8; stroke: #0B2A5B; stroke-width: 2; }
.cell .nucleus { fill: #9DB8EC; stroke: #1F5FD6; }
.cell .dot { fill: #9DB8EC; stroke: none; }

.ground { position: absolute; left: 180px; right: 180px; top: 650px; height: 2px; background: linear-gradient(90deg, transparent, #D5DCE8 20%, #D5DCE8 80%, transparent); }

.stand { position: absolute; inset: 0; transform: scale(1.22); transform-origin: 640px 650px; }
.pillar-shadow { position: absolute; left: 545px; top: 643px; width: 190px; height: 14px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,42,91,.18), rgba(11,42,91,0)); opacity: 0; transition: opacity 1s ease .3s; }
.pillar-shadow.on { opacity: 1; }
.pillar-clip { position: absolute; left: 555px; top: 490px; width: 170px; height: 160px; overflow: hidden; }
.pillar { width: 170px; height: 160px; transform: translateY(100%); transition: transform 1.1s cubic-bezier(.65, 0, .25, 1); }
.pillar.up { transform: none; }
.pillar .cap { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 2.5; }
.pillar .cap2 { fill: #EEF2F8; stroke: #0B2A5B; stroke-width: 2.5; }
.pillar .shaft { stroke: #0B2A5B; stroke-width: 2.5; }
.pillar .flute { stroke: #CDD6E4; stroke-width: 2; }

.hero { position: absolute; left: 540px; top: 361px; width: 200px; height: 305px; transition: transform 1.1s cubic-bezier(.65, 0, .25, 1); }
.hero.up { transform: translateY(-160px); }

.hero.up .pop-wrap { animation: settle .5s ease-out 1s; }
@keyframes settle { 0% { transform: scale(1, 1); } 40% { transform: scale(1.06, .94); } 100% { transform: scale(1, 1); } }

.pop-wrap { position: absolute; inset: 0; transform-origin: 50% 95%; }

.play .pop-wrap { animation: popIn .9s cubic-bezier(.3, .7, .4, 1) .2s both; }
@keyframes popIn {
  0% { transform: translateY(-30px) scale(.15, .15); opacity: 0; }
  35% { transform: translateY(-34px) scale(.88, 1.14); opacity: 1; }
  58% { transform: translateY(0) scale(1.14, .86); }
  76% { transform: translateY(-6px) scale(.96, 1.04); }
  100% { transform: none; }
}
.figure { position: absolute; left: 10px; top: 0; width: 180px; height: 304px; overflow: visible; }

.burst { position: absolute; left: -10px; top: 20px; width: 220px; height: 220px; overflow: visible; pointer-events: none; }
.burst line { stroke: #F47B20; stroke-width: 4; stroke-linecap: round; opacity: 0; transform-box: fill-box; }
.play .burst line { animation: burst .55s ease-out .55s both; }
@keyframes burst { 0% { opacity: 0; transform: scale(.6); } 30% { opacity: 1; } 100% { opacity: 0; transform: scale(1.3); } }

.shadow { fill: #0B2A5B; opacity: .12; transform-box: fill-box; transform-origin: center; }
.play .shadow { animation: shadowIn .9s ease .2s both; }
@keyframes shadowIn { 0%, 30% { opacity: 0; transform: scaleX(.3); } 58% { opacity: .16; transform: scaleX(1.15); } 100% { opacity: .12; transform: none; } }

.land circle { fill: #E4DED6; opacity: 0; transform-box: fill-box; transform-origin: center; }
.play .land circle { animation: land .7s ease-out .72s both; }
@keyframes land { 0% { opacity: 0; transform: scale(.3); } 30% { opacity: .9; } 100% { opacity: 0; transform: scale(1.5) translateY(-6px); } }

.pants, .shoe { fill: #0B2A5B; }
.skin { fill: #F5D3B8; stroke: #0B2A5B; stroke-width: 2.5; }
.neck { stroke: none; }
.cheek { fill: #F47B20; opacity: .18; }
.sleeve { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2.5; }
.cuff { stroke: #C9D2E0; stroke-width: 2; }
.coat { stroke: #0B2A5B; stroke-width: 3; stroke-linejoin: round; }
.shirt { fill: #1F5FD6; }
.lapel { fill: none; stroke: #0B2A5B; stroke-width: 2.2; stroke-linecap: round; }
.lapel.thin { stroke-width: 1.6; }
.button { fill: #0B2A5B; }
.pocket { fill: none; stroke: #0B2A5B; stroke-width: 2; }
.pen { fill: #F47B20; }
.badge { fill: #DDE8FB; stroke: #1F5FD6; stroke-width: 1.5; }
.hair { fill: #0B2A5B; }
.glass { fill: rgba(255,255,255,.35); stroke: #0B2A5B; stroke-width: 2.2; }
.face circle { fill: #0B2A5B; }
.face .mouth { fill: none; stroke: #0B2A5B; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
.face .smile { fill: #0B2A5B; }

.body { transform-box: view-box; transform-origin: 80px 256px; animation: breathe 3.6s ease-in-out infinite; }
@keyframes breathe { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.012); } }
.eyes { transform-box: view-box; transform-origin: 80px 66px; animation: blink 4.5s infinite; }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
.head { transform-box: view-box; transform-origin: 80px 96px; transition: transform .6s ease; }
.play .s0 .head { animation: nod .7s ease-in-out 2.95s; }
@keyframes nod { 0%, 100% { transform: rotate(0); } 40% { transform: rotate(-6deg) translateY(1px); } 70% { transform: rotate(3deg); } }
.s3 .head { transform: rotate(-5deg); }

.upper, .fore { transform-box: view-box; transition: transform .6s cubic-bezier(.3, 1.3, .5, 1); }
.s0 .left .upper { transform: rotate(6deg); }
.s0 .right .upper { transform: rotate(-6deg); }

.play .s0 .right .upper { animation: brushUpper 1.75s ease-in-out 1.1s both; }
.play .s0 .right .fore { animation: brushFore 1.75s ease-in-out 1.1s both; }
@keyframes brushUpper {
  0% { transform: rotate(-6deg); }
  14%, 86% { transform: rotate(26deg); }
  100% { transform: rotate(-6deg); }
}
@keyframes brushFore {
  0% { transform: rotate(0); }
  14% { transform: rotate(96deg); }
  30% { transform: rotate(38deg); }
  44% { transform: rotate(98deg); }
  58% { transform: rotate(36deg); }
  72% { transform: rotate(96deg); }
  86% { transform: rotate(34deg); }
  100% { transform: rotate(0); }
}

.s1 .left .upper { transform: rotate(32deg); }
.s1 .left .fore { transform: rotate(-70deg); }
.s1 .right .upper { transform: rotate(-32deg); }
.s1 .right .fore { transform: rotate(70deg); }

.s2 .left .upper { transform: rotate(150deg); }
.s2 .left .fore { transform: rotate(28deg); }
.s2 .right .upper { transform: rotate(-150deg); }
.s2 .right .fore { transform: rotate(-28deg); }

.s3 .left .upper { animation: flailL .45s ease-in-out infinite alternate; }
.s3 .left .fore { transform: rotate(45deg); }
.s3 .right .upper { animation: flailR .45s ease-in-out .15s infinite alternate; }
.s3 .right .fore { transform: rotate(-45deg); }
@keyframes flailL { from { transform: rotate(135deg); } to { transform: rotate(168deg); } }
@keyframes flailR { from { transform: rotate(-135deg); } to { transform: rotate(-168deg); } }

.puff circle { fill: #DCD5CB; opacity: 0; transform-box: fill-box; transform-origin: center; }
.play .s0 .puff circle { animation: puff 1s ease-out calc(var(--t) + var(--j) * .03s) both; }
@keyframes puff {
  0% { opacity: 0; transform: translate(0, 0) scale(.3); }
  18% { opacity: .95; }
  100% { opacity: 0; transform: translate(calc(-14px - var(--j) * 4px), calc(10px + var(--j) * 3px)) scale(1.7); }
}

.halo { position: absolute; left: -110px; top: -90px; width: 420px; height: 420px; border-radius: 50%; opacity: 0; pointer-events: none;
  background: radial-gradient(closest-side, rgba(31,95,214,.32), rgba(31,95,214,.10) 45%, rgba(31,95,214,0)); }
.halo.on { animation: halo 1.1s ease-out forwards; }
@keyframes halo { 0% { opacity: 0; transform: scale(.6); } 45% { opacity: 1; transform: scale(1.08); } 100% { opacity: .55; transform: scale(1); } }

.papers { position: absolute; left: 0; top: 0; width: 200px; height: 300px; overflow: visible; pointer-events: none; }
.paper { opacity: 0; transform: translate(var(--x), -700px) rotate(calc(var(--r) * -3)); }
.paper rect { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; }
.paper line { stroke: #C9D2E0; stroke-width: 3; stroke-linecap: round; }
.harsh .paper { animation: fall .8s cubic-bezier(.5, 0, .8, .4) both; }
@keyframes fall {
  0% { opacity: 1; transform: translate(calc(var(--x) + 40px), -700px) rotate(calc(var(--r) * -3)); }
  50% { transform: translate(calc(var(--x) - 20px), -300px) rotate(calc(var(--r) * 2)); }
  82% { opacity: 1; transform: translate(var(--x), calc(var(--y) + 6px)) rotate(var(--r)); }
  100% { opacity: 1; transform: translate(var(--x), var(--y)) rotate(var(--r)); }
}
.qmark { position: absolute; left: 150px; top: -12px; font-family: var(--font-display); font-weight: 800; font-size: 54px; color: #F47B20; opacity: 0; transform: scale(.4); }
.harsh .qmark { animation: qpop .5s cubic-bezier(.2, 1.6, .4, 1) 2.2s both, qbob 1.4s ease-in-out 2.7s infinite; }
@keyframes qpop { to { opacity: 1; transform: scale(1); } }
@keyframes qbob { 0%, 100% { transform: rotate(-8deg); opacity: 1; } 50% { transform: rotate(10deg) translateY(-4px); opacity: 1; } }

@media (prefers-reduced-motion: reduce) { .harsh .scene { animation: none; } }
</style>
