<script setup lang="ts">

import { computed } from 'vue'

type Mood = 'neutral' | 'happy' | 'worried' | 'confused' | 'sleepy' | 'tired' | 'amazed'
type Pose = 'rest' | 'akimbo' | 'cheer' | 'flail' | 'hold' | 'carry' | 'stamp' | 'sign' | 'weigh' | 'lock' | 'point' | 'clipboard' | 'desk' | 'despair' | 'phone' | 'wave' | 'doze' | 'lab' | 'tired'
type Outfit = 'coat' | 'suit' | 'sweater'
type Hair = 'short' | 'grey' | 'long' | 'bun'

const props = withDefaults(defineProps<{
  mood?: Mood
  pose?: Pose
  outfit?: Outfit
  outfitColor?: string
  tieColor?: string
  hair?: Hair
  hairColor?: string
  skin?: string
  glasses?: boolean
  sweat?: boolean
  uid?: string
  phase?: number
}>(), {
  mood: 'neutral', pose: 'rest', outfit: 'coat', outfitColor: '#FFFFFF', tieColor: '#F47B20',
  hair: 'short', hairColor: '#0B2A5B', skin: '#F5D3B8', glasses: true, sweat: false, uid: 'p', phase: 0,
})

const torsoEnd = computed(() => props.outfit === 'coat' ? 212 : 198)
const torsoPath = computed(() => {
  const w = props.outfit === 'coat' ? [118, 42] : [112, 48]
  return `M54 104 Q80 94 106 104 L${w[0]} ${torsoEnd.value} L${w[1]} ${torsoEnd.value} Z`
})
const sleeveFill = computed(() => props.outfit === 'coat' ? '#FFFFFF' : props.outfitColor)
const shadeId = computed(() => `shade-${props.uid}`)
const holdsPaper = computed(() => props.pose === 'stamp' || props.pose === 'sign')
const threeQ = computed(() => props.pose === 'clipboard')
</script>

<template>
  <svg viewBox="0 0 160 270" class="person" :class="[`pose-${pose}`]" :style="{ '--ph': `${-phase}s` }">
    <defs>
      <linearGradient :id="shadeId" x1="0" x2="1">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0" />
        <stop offset=".62" stop-color="#FFFFFF" stop-opacity="0" />
        <stop offset="1" stop-color="#0B2A5B" stop-opacity=".12" />
      </linearGradient>
    </defs>

    <ellipse cx="80" cy="258" rx="38" ry="6" class="shd" />

    <g v-if="pose === 'sign' && outfit !== 'coat'" class="case">
      <rect x="112" y="226" width="40" height="28" rx="4" fill="#8A5A2B" class="ink" />
      <path d="M124 226 V220 H140 V226" fill="none" class="ink" />
      <line x1="112" y1="236" x2="152" y2="236" stroke="#5E3B1A" stroke-width="2" />
    </g>

    <g class="body">

      <path v-if="hair === 'long'" d="M48 64 Q44 28 80 28 Q116 28 112 64 L116 112 Q100 108 96 96 L64 96 Q60 108 44 112 Z" :fill="hairColor" />

      <rect x="62" y="196" width="13" height="56" rx="5" class="pants" />
      <rect x="85" y="196" width="13" height="56" rx="5" class="pants" />
      <path d="M54 256 Q55 247 68 248 L75 248 L75 257 Z" class="shoe" />
      <path d="M106 256 Q105 247 92 248 L85 248 L85 257 Z" class="shoe" />

      <path :d="torsoPath" :fill="outfitColor" class="torso" />
      <path :d="torsoPath" :fill="`url(#${shadeId})`" />

      <template v-if="outfit === 'coat'">
        <path d="M74 100 L80 117 L86 100 Z" fill="#1F5FD6" />
        <path d="M74 100 L67 148 M86 100 L93 148" class="ln2" />
        <line x1="80" y1="118" x2="80" y2="210" class="ln2 thin" />
        <circle cx="80" cy="160" r="1.8" class="dt" /><circle cx="80" cy="182" r="1.8" class="dt" />
        <rect x="90" y="150" width="16" height="18" rx="2" class="pocket" />
        <rect x="96" y="140" width="3.5" height="15" rx="1.5" fill="#F47B20" />
        <rect x="58" y="120" width="14" height="10" rx="2" class="badge" />
      </template>
      <template v-else-if="outfit === 'suit'">
        <path d="M72 100 L80 124 L88 100 Z" fill="#FFFFFF" />
        <path d="M78 104 L82 104 L84 134 L80 140 L76 134 Z" :fill="tieColor" />
        <path d="M72 100 L70 150 M88 100 L90 150" class="ln2 light" />
      </template>
      <template v-else>
        <path d="M70 101 Q80 112 90 101" class="ln2 light" />
        <line x1="50" y1="190" x2="110" y2="190" class="ln2 light" />
      </template>

      <g class="head">
        <rect x="74" y="88" width="12" height="12" :fill="skin" />
        <ellipse v-if="threeQ" cx="52" cy="68" rx="5.5" ry="7" :fill="skin" class="ol" />
        <circle cx="80" cy="64" r="30" :fill="skin" class="ol" />
        <path v-if="hair === 'short'" d="M50 60 Q50 30 80 30 Q110 30 110 60 Q104 47 90 45 Q80 52 64 46 Q55 50 50 60 Z" :fill="hairColor" />
        <path v-else-if="hair === 'grey'" d="M50 64 Q48 44 58 42 Q60 52 66 50 M110 64 Q112 44 102 42 Q100 52 94 50 M60 40 Q80 30 100 40 Q90 38 80 40 Q70 38 60 40 Z" :fill="hairColor" :stroke="hairColor" stroke-width="5" stroke-linejoin="round" />
        <path v-else-if="hair === 'long'" d="M50 62 Q48 30 80 30 Q112 30 110 62 Q100 44 84 42 Q72 50 56 50 Q52 54 50 62 Z" :fill="hairColor" />
        <template v-else-if="hair === 'bun'">
          <circle cx="80" cy="27" r="11" :fill="hairColor" />
          <path d="M50 60 Q50 32 80 32 Q110 32 110 60 Q100 46 80 46 Q60 46 50 60 Z" :fill="hairColor" />
        </template>

        <g :transform="threeQ ? 'translate(7 3)' : undefined">
        <template v-if="glasses">
          <circle cx="69" cy="66" r="8.5" class="glass" /><circle cx="91" cy="66" r="8.5" class="glass" />
          <line x1="77.5" y1="66" x2="82.5" y2="66" class="glass" />
        </template>
        <ellipse cx="62" cy="77" rx="4.5" ry="2.5" class="cheek" /><ellipse cx="98" cy="77" rx="4.5" ry="2.5" class="cheek" />

        <g v-if="mood === 'neutral'" class="face">
          <g class="eyes"><circle cx="69" cy="66" r="2.6" /><circle cx="91" cy="66" r="2.6" /></g>
          <path d="M71 81 Q80 87 89 81" class="st" />
        </g>
        <g v-else-if="mood === 'happy'" class="face">
          <path d="M65 67 Q69 62 73 67 M87 67 Q91 62 95 67" class="st" />
          <path d="M69 79 Q80 92 91 79 Z" class="fl" />
        </g>
        <g v-else-if="mood === 'worried'" class="face">
          <g class="eyes"><circle cx="69" cy="67" r="2.6" /><circle cx="91" cy="67" r="2.6" /></g>
          <path d="M62 55 L73 52 M87 52 L98 55" class="st" />
          <path d="M72 85 Q80 80 88 85" class="st" />
        </g>
        <g v-else-if="mood === 'amazed'" class="face">
          <g class="eyes"><circle cx="69" cy="66" r="3.6" /><circle cx="91" cy="66" r="3.6" /><circle cx="70.2" cy="64.8" r="1.1" fill="#FFFFFF" /><circle cx="92.2" cy="64.8" r="1.1" fill="#FFFFFF" /></g>
          <path d="M62 56 Q69 51 75 55 M85 55 Q91 51 98 56" class="st" />
          <ellipse cx="80" cy="83" rx="4.5" ry="5.5" class="fl" />
        </g>
        <g v-else-if="mood === 'tired'" class="face">
          <g class="eyes"><circle cx="69" cy="68" r="2.4" /><circle cx="91" cy="68" r="2.4" /></g>
          <path d="M63.5 64.5 Q69 62 74.5 64.5 M85.5 64.5 Q91 62 96.5 64.5" class="st lid" />
          <path d="M65 73.5 Q69 75.5 73 73.5 M87 73.5 Q91 75.5 95 73.5" class="st bags" />
          <path d="M73 84 Q80 82 87 84" class="st" />
        </g>
        <g v-else-if="mood === 'sleepy'" class="face sleepy">
          <path d="M64 67 Q69 71 74 67 M86 67 Q91 71 96 67" class="st" />
          <path d="M63 63 L75 64 M85 64 L97 63" class="st lid" />
          <ellipse cx="80" cy="83" rx="3.5" ry="2.2" class="fl yawn" />
        </g>
        <g v-else class="face">
          <circle cx="69" cy="67" r="2.6" /><circle cx="91" cy="65" r="3.2" />
          <path d="M62 53 L74 56 M86 52 L97 50" class="st" />
          <path d="M70 84 q4 -4 7 0 t7 0 t6 0" class="st" />
        </g>
        </g>

        <path v-if="sweat" d="M112 50 q5 8 0 12 q-5 -4 0 -12 Z" class="sweat" />
      </g>

      <g v-if="holdsPaper" class="held-paper">
        <rect x="70" y="160" width="34" height="40" rx="2.5" fill="#FFFFFF" class="ink" />
        <path d="M76 170 h22 M76 177 h22 M76 184 h15" class="paper-ln" />
        <circle v-if="pose === 'stamp'" cx="90" cy="186" r="7" class="stamp-mark" />
        <path v-if="pose === 'sign'" d="M75 193 q4 -6 7 0 t7 -1 t8 -3" pathLength="1" class="signature" />
      </g>

      <g v-if="pose === 'weigh'" class="read-doc">
        <rect x="76" y="110" width="30" height="38" rx="2.5" fill="#FFFFFF" class="ink" />
        <path d="M82 119 h18 M82 126 h18 M82 133 h12" class="paper-ln" />
      </g>

      <g class="arm left">
        <g class="upper" style="transform-origin: 54px 112px">
          <rect x="46.5" y="106" width="15" height="42" rx="7.5" :fill="sleeveFill" class="ol" />
          <g class="fore" style="transform-origin: 54px 144px">
            <rect x="46.5" y="138" width="15" height="38" rx="7.5" :fill="sleeveFill" class="ol" />
            <circle cx="54" cy="180" r="7" :fill="skin" class="ol" />
          </g>
        </g>
      </g>
      <g class="arm right">
        <g class="upper" style="transform-origin: 106px 112px">
          <rect x="98.5" y="106" width="15" height="42" rx="7.5" :fill="sleeveFill" class="ol" />
          <g class="fore" style="transform-origin: 106px 144px">
            <rect x="98.5" y="138" width="15" height="38" rx="7.5" :fill="sleeveFill" class="ol" />

            <g v-if="pose === 'stamp'" transform="translate(106 182) rotate(-33)">
              <circle cx="0" cy="-10" r="6" fill="#FFFFFF" class="ink" />
              <rect x="-3.5" y="-6" width="7" height="9" fill="#FFFFFF" class="ink" />
              <rect x="-10" y="3" width="20" height="7" rx="1.5" fill="#F47B20" class="ink" />
            </g>

            <g v-if="pose === 'sign' || pose === 'desk' || pose === 'tired'" transform="translate(104 184) rotate(-12)">
              <rect x="-2.5" y="-4" width="5" height="18" rx="1.5" fill="#0B2A5B" />
              <path d="M-2.5 14 L0 19 L2.5 14 Z" fill="#F47B20" />
            </g>

            <g v-if="pose === 'phone'" transform="translate(106 180) rotate(205)">
              <rect x="-6" y="-26" width="12" height="28" rx="3" fill="#0B2A5B" />
              <rect x="-4" y="-22" width="8" height="15" rx="1" fill="#4F8BF5" />
            </g>

            <g v-if="pose === 'weigh'" transform="translate(106 182) rotate(130)">
              <line x1="0" y1="-4" x2="0" y2="14" class="beam" />
              <g class="beam-tilt" style="transform-origin: 0px 14px">
                <line x1="-22" y1="14" x2="22" y2="14" class="beam" />
                <path d="M-22 14 L-29 28 M-22 14 L-15 28 M22 14 L15 28 M22 14 L29 28" class="chain" />
                <path d="M-31 28 Q-22 36 -13 28 Z M13 28 Q22 36 31 28 Z" class="tray" />
              </g>
            </g>

            <g v-if="pose === 'lab'" transform="translate(106 182) rotate(174)">
              <g class="lab-tube">
                <rect x="-6" y="-46" width="12" height="48" rx="6" fill="#FFFFFF" stroke="#0B2A5B" stroke-width="2.4" />
                <rect x="-4" y="-22" width="8" height="22" rx="4" class="lab-liq" />
                <circle cx="0" cy="-8" r="1.8" class="lab-bub" /><circle cx="1.5" cy="-14" r="1.3" class="lab-bub" style="animation-delay: .5s" />
                <rect x="-7.5" y="-50" width="15" height="6" rx="2" fill="#F47B20" stroke="#0B2A5B" stroke-width="2" />
              </g>
            </g>
            <circle cx="106" cy="180" r="7" :fill="skin" class="ol" />
          </g>
        </g>
      </g>

      <g v-if="pose === 'clipboard'" class="clipboard" transform="translate(13 2) rotate(-38 108 148)">
        <rect x="78" y="128" width="60" height="40" rx="3" fill="#E8955A" class="ink" />
        <rect x="129" y="132" width="4" height="32" rx="2" fill="#F2B27F" />
        <rect x="135" y="141" width="6" height="14" rx="2" fill="#0B2A5B" />
        <path d="M86 138 h30 M86 146 h34 M86 154 h24" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity=".7" />
      </g>

      <g v-if="pose === 'clipboard'" class="hands-front">
        <g class="arm left">
          <g class="upper" style="transform-origin: 54px 112px">
            <g class="fore" style="transform-origin: 54px 144px">
              <g v-if="pose === 'clipboard'" transform="translate(54 180) rotate(66)">
              <rect x="-2.5" y="-6" width="5" height="18" rx="1.5" fill="#F47B20" class="ink thin" />
              <path d="M-2.5 12 L0 17 L2.5 12 Z" fill="#0B2A5B" />
            </g>
              <circle cx="54" cy="180" r="7" :fill="skin" class="ol" />
            </g>
          </g>
        </g>
        <g class="arm right">
          <g class="upper" style="transform-origin: 106px 112px">
            <g class="fore" style="transform-origin: 106px 144px">
              <circle cx="106" cy="180" r="7" :fill="skin" class="ol" />
            </g>
          </g>
        </g>
      </g>

      <g v-if="pose === 'phone'">
        <path d="M124 52 q6 6 0 12 M130 48 q9 10 0 20" class="talk" />
        <rect x="70" y="152" width="22" height="28" rx="2" fill="#FFFFFF" class="ink" />
        <path d="M74 160 h14 M74 166 h14 M74 172 h9" class="paper-ln" />
      </g>

      <g v-if="pose === 'lock'" class="item" transform="translate(80 166)">
        <circle r="24" class="ring" />
        <path d="M0 -22 L20 -14 Q20 10 0 22 Q-20 10 -20 -14 Z" fill="#DDE8FB" class="ink" />
        <rect x="-7" y="-3" width="14" height="11" rx="2" fill="#1F5FD6" />
        <path d="M-4.5 -3 V-7 A4.5 4.5 0 0 1 4.5 -7 V-3" fill="none" class="ink shackle" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.person { width: 100%; height: 100%; overflow: visible; }
.shd { fill: #0B2A5B; opacity: .12; }
.pants, .shoe { fill: #0B2A5B; }
.ol { stroke: #0B2A5B; stroke-width: 2.5; }
.torso { stroke: #0B2A5B; stroke-width: 3; stroke-linejoin: round; }
.ln2 { fill: none; stroke: #0B2A5B; stroke-width: 2.2; stroke-linecap: round; }
.ln2.thin { stroke-width: 1.6; }
.ln2.light { stroke: rgba(255,255,255,.55); }
.dt { fill: #0B2A5B; }
.pocket { fill: none; stroke: #0B2A5B; stroke-width: 2; }
.badge { fill: #DDE8FB; stroke: #1F5FD6; stroke-width: 1.5; }
.glass { fill: rgba(255,255,255,.35); stroke: #0B2A5B; stroke-width: 2.2; }
.cheek { fill: #F47B20; opacity: .18; }
.face circle { fill: #0B2A5B; }
.face .st { fill: none; stroke: #0B2A5B; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
.face .fl { fill: #0B2A5B; }
.ink.thin { stroke-width: 1.4; }
.ink { stroke: #0B2A5B; stroke-width: 2.2; stroke-linejoin: round; stroke-linecap: round; }
.paper-ln { fill: none; stroke: #B4C2DA; stroke-width: 2; stroke-linecap: round; }
.beam { stroke: #F47B20; stroke-width: 3; stroke-linecap: round; }
.chain { fill: none; stroke: #F47B20; stroke-width: 1.4; }
.tray { fill: #FFE3CC; stroke: #F47B20; stroke-width: 2; stroke-linejoin: round; }
.sweat { fill: #9DC2F5; stroke: #1F5FD6; stroke-width: 1.4; animation: drip 1.4s ease-in infinite; transform-box: fill-box; }
@keyframes drip { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(16px); opacity: 0; } }

.body { transform-box: view-box; transform-origin: 80px 256px; animation: breathe 3.6s ease-in-out infinite; }
@keyframes breathe { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.012); } }
.eyes { transform-box: view-box; transform-origin: 80px 66px; animation: blink 4.5s infinite; }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
.head { transform-box: view-box; transform-origin: 80px 96px; transition: transform .6s ease; }

.upper, .fore { transform-box: view-box; transition: transform .6s cubic-bezier(.3, 1.3, .5, 1); }
.pose-rest .left .upper { transform: rotate(6deg); }
.pose-rest .right .upper { transform: rotate(-6deg); }
.pose-akimbo .left .upper { transform: rotate(32deg); }
.pose-akimbo .left .fore { transform: rotate(-70deg); }
.pose-akimbo .right .upper { transform: rotate(-32deg); }
.pose-akimbo .right .fore { transform: rotate(70deg); }
.pose-cheer .left .upper { transform: rotate(150deg); }
.pose-cheer .left .fore { transform: rotate(28deg); }
.pose-cheer .right .upper { transform: rotate(-150deg); }
.pose-cheer .right .fore { transform: rotate(-28deg); }
.pose-hold .left .upper, .pose-lock .left .upper { transform: rotate(-12deg); }
.pose-hold .left .fore, .pose-lock .left .fore { transform: rotate(-38deg); }
.pose-hold .right .upper, .pose-lock .right .upper { transform: rotate(12deg); }
.pose-hold .right .fore, .pose-lock .right .fore { transform: rotate(38deg); }
.pose-flail .head { transform: rotate(-5deg); }
.pose-flail .left .upper { animation: flailL .45s ease-in-out infinite alternate; }
.pose-flail .left .fore { transform: rotate(45deg); }
.pose-flail .right .upper { animation: flailR .45s ease-in-out .15s infinite alternate; }
.pose-flail .right .fore { transform: rotate(-45deg); }
@keyframes flailL { from { transform: rotate(135deg); } to { transform: rotate(168deg); } }
@keyframes flailR { from { transform: rotate(-135deg); } to { transform: rotate(-168deg); } }

.pose-carry .left .upper { transform: rotate(168deg); }
.pose-carry .left .fore { transform: rotate(14deg); }
.pose-carry .right .upper { transform: rotate(-168deg); }
.pose-carry .right .fore { transform: rotate(-14deg); }

.pose-stamp .left .upper { transform: rotate(-10deg); }
.pose-stamp .left .fore { transform: rotate(-5deg); }
.pose-stamp .right .upper { animation: stampU 1.6s cubic-bezier(.5, 0, .5, 1) var(--ph) infinite; }
.pose-stamp .right .fore { animation: stampF 1.6s cubic-bezier(.5, 0, .5, 1) var(--ph) infinite; }
@keyframes stampU { 0%, 40% { transform: rotate(25deg); } 52%, 68% { transform: rotate(8deg); } 100% { transform: rotate(25deg); } }
@keyframes stampF { 0%, 40% { transform: rotate(105deg); } 52%, 68% { transform: rotate(25deg); } 100% { transform: rotate(105deg); } }
.stamp-mark { fill: none; stroke: #F47B20; stroke-width: 2.4; opacity: 0; animation: mark 1.6s linear var(--ph) infinite; }
@keyframes mark { 0%, 51% { opacity: 0; } 53%, 88% { opacity: 1; } 100% { opacity: 0; } }

.pose-phone .right .upper { transform: rotate(-113deg); }
.pose-phone .right .fore { transform: rotate(-107deg); }
.pose-phone .left .upper { transform: rotate(-12deg); }
.pose-phone .left .fore { transform: rotate(-30deg); }
.pose-phone .head { animation: talk 1.8s ease-in-out var(--ph) infinite alternate; }
@keyframes talk { from { transform: rotate(-3deg); } to { transform: rotate(2deg); } }
.talk { fill: none; stroke: #1F5FD6; stroke-width: 2.2; stroke-linecap: round; animation: waves 1.2s ease-in-out var(--ph) infinite; }
@keyframes waves { 0%, 100% { opacity: .2; } 50% { opacity: 1; } }
.pose-despair .left .upper { transform: rotate(150deg); }
.pose-despair .left .fore { transform: rotate(50deg); }
.pose-despair .right .upper { transform: rotate(-150deg); }
.pose-despair .right .fore { transform: rotate(-50deg); }
.pose-despair .head { animation: despair 2.6s ease-in-out var(--ph) infinite alternate; }
@keyframes despair { from { transform: rotate(-4deg) translateY(2px); } to { transform: rotate(4deg) translateY(2px); } }
.pose-desk .head { transform: rotate(5deg) translateY(3px); }

.pose-doze .left .upper { transform: rotate(-10deg); }
.pose-doze .left .fore { transform: rotate(-5deg); }
.pose-doze .right .upper { transform: rotate(10deg); }
.pose-doze .right .fore { transform: rotate(5deg); }
.pose-doze .head { animation: doze 3.4s ease-in var(--ph) infinite; }
@keyframes doze { 0% { transform: rotate(0); } 70% { transform: rotate(9deg) translateY(5px); } 76% { transform: rotate(9deg) translateY(5px); } 82% { transform: rotate(-2deg); } 100% { transform: rotate(0); } }

.pose-tired .left .upper { transform: rotate(-10deg); }
.pose-tired .left .fore { transform: rotate(-5deg); }
.pose-tired .right .upper { animation: writeU 3.2s ease-in-out var(--ph) infinite alternate; }
.pose-tired .right .fore { animation: write 1.4s ease-in-out var(--ph) infinite alternate; }
.pose-tired .head { animation: tiredH 4.2s ease-in-out var(--ph) infinite; }
@keyframes tiredH { 0%, 100% { transform: rotate(4deg) translateY(3px); } 55% { transform: rotate(9deg) translateY(6px); } 70% { transform: rotate(7deg) translateY(5px); } }

.pose-lab .left .upper { transform: rotate(-12deg); }
.pose-lab .left .fore { transform: rotate(-30deg); }
.pose-lab .right .upper { transform: rotate(-150deg); }
.pose-lab .right .fore { transform: rotate(-24deg); }
.pose-lab .head { animation: labH 3s ease-in-out var(--ph) infinite alternate; }
@keyframes labH { from { transform: rotate(5deg); } to { transform: rotate(10deg) translateY(-1px); } }
.lab-tube { transform-box: fill-box; transform-origin: 50% 100%; animation: swirl 1.6s ease-in-out var(--ph) infinite alternate; }
@keyframes swirl { from { transform: rotate(-14deg); } to { transform: rotate(14deg); } }
.lab-liq { animation: liq 3.2s ease-in-out infinite; }
@keyframes liq { 0%, 100% { fill: #7FD3FF; } 50% { fill: #9EE6A8; } }
.lab-bub { fill: #FFFFFF; animation: bubb2 1.2s ease-in infinite; }
@keyframes bubb2 { 0% { transform: translateY(0); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-14px); opacity: 0; } }
.bags { stroke: #B08D7A; stroke-width: 1.6; }
.sleepy .yawn { transform-box: fill-box; transform-origin: center; animation: yawn 5.2s ease-in-out infinite; }
@keyframes yawn { 0%, 55%, 100% { transform: scale(1); } 65%, 78% { transform: scale(1.9, 3); } }
.pose-desk .left .upper { transform: rotate(-10deg); }
.pose-desk .left .fore { transform: rotate(-5deg); }
.pose-desk .right .upper { animation: writeU 1.3s ease-in-out var(--ph) infinite alternate; }
.pose-desk .right .fore { animation: write .26s ease-in-out var(--ph) infinite alternate; }
.pose-sign .left .upper { transform: rotate(-10deg); }
.pose-sign .left .fore { transform: rotate(-5deg); }
.pose-sign .right .upper { animation: writeU 1.3s ease-in-out var(--ph) infinite alternate; }
.pose-sign .right .fore { animation: write .26s ease-in-out var(--ph) infinite alternate; }
@keyframes writeU { from { transform: rotate(1deg); } to { transform: rotate(9deg); } }
@keyframes write { from { transform: rotate(6deg); } to { transform: rotate(16deg); } }
.signature { fill: none; stroke: #1F5FD6; stroke-width: 2; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; animation: sign 2.6s ease-in-out var(--ph) infinite; }
@keyframes sign { 0% { stroke-dashoffset: 1; } 60%, 90% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 0; opacity: 0; } }

.pose-weigh .left .upper { transform: rotate(-25deg); }
.pose-weigh .left .fore { transform: rotate(-95deg); }
.pose-weigh .right .upper { transform: rotate(-150deg); }
.pose-weigh .right .fore { transform: rotate(20deg); }
.beam-tilt { animation: tilt 2.4s ease-in-out var(--ph) infinite alternate; }
@keyframes tilt { from { transform: rotate(-12deg); } to { transform: rotate(12deg); } }
.pose-weigh .head { animation: read 2.4s ease-in-out var(--ph) infinite alternate; }
@keyframes read { from { transform: rotate(4deg); } to { transform: rotate(-3deg); } }

.shackle { animation: shackle 2s ease-in-out var(--ph) infinite; }
@keyframes shackle { 0%, 30% { transform: translateY(-4px); } 42%, 100% { transform: none; } }
.ring { fill: none; stroke: #1F5FD6; stroke-width: 2; opacity: 0; transform-box: fill-box; transform-origin: center; animation: ring 2s ease-out var(--ph) infinite; }
@keyframes ring { 0%, 40% { opacity: 0; transform: scale(.8); } 45% { opacity: .7; } 100% { opacity: 0; transform: scale(1.6); } }

.pose-clipboard .head { transform: rotate(4deg); }
.pose-clipboard .right .upper { transform: rotate(-57deg); }
.pose-clipboard .right .fore { transform: rotate(76deg); }
.pose-clipboard .left .upper { animation: clipU 1.4s ease-in-out var(--ph) infinite alternate; }
.pose-clipboard .left .fore { animation: clipF .28s ease-in-out var(--ph) infinite alternate; }
@keyframes clipU { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } }
@keyframes clipF { from { transform: rotate(-90deg); } to { transform: rotate(-80deg); } }

.pose-wave .left .upper { transform: rotate(150deg); }
.pose-wave .left .fore { animation: waveF .45s ease-in-out var(--ph) infinite alternate; }
.pose-wave .right .upper { transform: rotate(-8deg); }
.pose-wave .head { animation: waveH 1.8s ease-in-out var(--ph) infinite alternate; }
@keyframes waveF { from { transform: rotate(4deg); } to { transform: rotate(48deg); } }
@keyframes waveH { from { transform: rotate(-3deg); } to { transform: rotate(4deg); } }

.pose-point .left .upper { transform: rotate(32deg); }
.pose-point .left .fore { transform: rotate(-70deg); }
.pose-point .right .upper { transform: rotate(-100deg); }
.pose-point .right .fore { animation: pointF 1.1s ease-in-out var(--ph) infinite alternate; }
@keyframes pointF { from { transform: rotate(-6deg); } to { transform: rotate(-22deg); } }
</style>
