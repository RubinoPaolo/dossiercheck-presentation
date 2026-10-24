<script setup lang="ts">

import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ i: number, on: boolean }>()

const round = ref(1)
let roundTimer: ReturnType<typeof setInterval> | undefined
watch(() => props.on, (on) => {
  clearInterval(roundTimer)
  round.value = 1
  if (on && props.i === 3) roundTimer = setInterval(() => { round.value = round.value >= 3 ? 1 : round.value + 1 }, 2400)
}, { immediate: true })
onBeforeUnmount(() => clearInterval(roundTimer))
</script>

<template>
  <div class="art" :class="{ on }">

      <svg v-if="i === 0" viewBox="0 0 230 150">
        <g v-for="k in 4" :key="k" :transform="`translate(${14 + (k - 1) * 52} 10)`">
          <template v-if="k !== 3"><rect width="40" height="52" rx="3" class="d" /><path d="M8 14 h24 M8 22 h24 M8 30 h16" class="l" /></template>
          <rect v-else width="40" height="52" rx="3" class="missing" />
        </g>
        <text x="135" y="44" text-anchor="middle" class="q">?</text>
        <g transform="translate(24 78)">
          <rect width="182" height="64" rx="5" class="d" />
          <text x="12" y="24" class="lbl">Name</text><rect x="62" y="12" width="108" height="16" rx="3" class="fld" />
          <text x="68" y="24" class="fval">Mario Rossi</text><path d="M155 20 l3.5 3.5 l6 -7" class="ftick" />
          <text x="12" y="50" class="lbl">Date</text><rect x="62" y="38" width="108" height="16" rx="3" class="fld empty" />
          <line x1="68" y1="41" x2="68" y2="51" class="cur" /><text x="76" y="50" class="fph">dd / mm / yyyy</text>
          <circle cx="182" cy="46" r="8" class="bang" /><text x="182" y="50" text-anchor="middle" class="bang-t">!</text>
        </g>
      </svg>

      <svg v-else-if="i === 1" viewBox="0 0 230 150">
        <g transform="translate(4 38)">
          <rect width="66" height="80" rx="3" class="d" /><text x="33" y="15" text-anchor="middle" class="tiny">Protocol</text>
          <text x="33" y="34" text-anchor="middle" class="lbl s">Visits</text>
          <text x="33" y="62" text-anchor="middle" class="big oldv">5</text>
          <text x="33" y="62" text-anchor="middle" class="big newv">6</text>
        </g>
        <path d="M72 68 Q110 22 148 22" class="arrow a1" /><path d="M72 78 Q110 80 148 80" class="arrow a2" /><path d="M72 88 Q110 138 148 132" class="arrow a3" />
        <g transform="translate(150 2)"><rect width="76" height="40" rx="3" class="d" /><text x="7" y="14" class="tiny">Consent form</text>
          <text x="7" y="32" class="val was w1">5 visits</text><text x="7" y="32" class="val now n1">6 visits</text></g>
        <g transform="translate(150 60)"><rect width="76" height="40" rx="3" class="d" /><text x="7" y="14" class="tiny">Info sheet</text>
          <text x="7" y="32" class="val was w2">5 visits</text><text x="7" y="32" class="val now n2">6 visits</text></g>
        <g transform="translate(150 112)" class="stale"><rect width="76" height="38" rx="3" class="d warn" /><text x="7" y="14" class="tiny">Budget</text>
          <text x="7" y="31" class="val">5 visits</text>
          <g class="bangs"><circle cx="74" cy="2" r="8" class="bang" /><text x="74" y="6" text-anchor="middle" class="bang-t">!</text></g></g>
      </svg>

      <svg v-else-if="i === 2" viewBox="0 0 230 150">
        <g class="scatter">
          <g class="drift d1" transform="translate(14 124)"><rect width="26" height="18" rx="2" class="mail" /><path d="M1 2 L13 10 L25 2" class="mailf" /></g>
          <g class="drift d2" transform="translate(186 122)"><path d="M0 8 a8 8 0 0 1 8 -8 h12 a8 8 0 0 1 8 8 v2 a8 8 0 0 1 -8 8 h-10 l-6 5 v-5 a8 8 0 0 1 -4 -7 z" class="bub" /></g>
          <g class="drift d3" transform="translate(100 124)"><path d="M6 14 l10 -10 a4 4 0 0 1 6 6 l-12 12 a2.5 2.5 0 0 1 -4 -4 l10 -10" class="clipi" /></g>
        </g>

        <g transform="translate(36 6)">
          <g class="lost"><rect width="46" height="32" rx="3" class="mail big-mail" /><path d="M1.5 2.5 L23 18 L44.5 2.5" class="mailf" /></g>
          <rect width="46" height="32" rx="3" class="ghost" />
          <text x="56" y="14" class="mlbl">Updated contract</text>
          <text x="56" y="29" class="notfound">Email not found</text>
        </g>

        <g transform="translate(14 64)">
          <rect width="160" height="22" rx="4" class="file" /><text x="10" y="15" class="fname">Protocol_v2_final.docx</text>
          <rect y="30" width="160" height="22" rx="4" class="file" /><text x="10" y="45" class="fname">Protocol_v2_FINAL.docx</text>
          <circle cx="186" cy="26" r="11" class="qbg" /><text x="186" y="31" text-anchor="middle" class="qm">?</text>
        </g>
      </svg>

      <svg v-else viewBox="0 0 230 150">
        <defs><marker id="d6-ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#1F5FD6" /></marker></defs>
        <g class="ring">
            <path d="M12.6 -50.5 A52 52 0 0 1 51.2 9" class="cyc" marker-end="url(#d6-ah)" />
            <path d="M37.4 36.1 A52 52 0 0 1 -33.4 39.8" class="cyc" marker-end="url(#d6-ah)" />
            <path d="M-50 14.3 A52 52 0 0 1 -17.8 -48.9" class="cyc" marker-end="url(#d6-ah)" /></g>
        <g transform="translate(115 74)">
          <text x="0" y="-4" text-anchor="middle" class="rlbl">Review round</text>
          <text :key="round" x="0" y="20" text-anchor="middle" class="rnum">{{ round }}</text>
        </g>
        <text x="115" y="12" text-anchor="middle" class="node">Correct</text>
        <text x="190" y="118" text-anchor="middle" class="node">Review</text>
        <g transform="translate(26 102)"><g class="hg"><path d="M0 0 h16 M0 24 h16 M1 0 q0 9 7 12 q-7 3 -7 12 M15 0 q0 9 -7 12 q7 3 7 12" class="hgl" /><path d="M4 21 h8 l-4 -5 z" class="sand" /></g><text x="8" y="40" text-anchor="middle" class="node">Wait</text></g>
      </svg>
  </div>
</template>

<style scoped>
.art { position: relative; }
.art svg { width: 100%; height: 100%; overflow: visible; }
.mail { fill: #FFFFFF; stroke: #1F5FD6; stroke-width: 2; }
.mailf { fill: none; stroke: #1F5FD6; stroke-width: 2; stroke-linejoin: round; }

.d { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; }
.d.warn { fill: #FFF1E6; stroke: #F47B20; }
.l { fill: none; stroke: #C9D2E0; stroke-width: 3; stroke-linecap: round; }
.tiny { font-size: 10px; font-weight: 700; fill: #0B2A5B; }

.missing { fill: #FFF6EE; stroke: #F47B20; stroke-width: 2.5; stroke-dasharray: 6 5; }
.art.on .missing { animation: blink 1.1s ease-in-out infinite; }
@keyframes blink { 50% { opacity: .3; } }
.q { font-family: var(--font-display); font-size: 26px; font-weight: 800; fill: #F47B20; }
.lbl { font-size: 12px; font-weight: 600; fill: #5E6B85; }
.fld { fill: #F4F8FF; stroke: #1F5FD6; stroke-width: 1.5; }
.fval { font-size: 11px; font-weight: 600; fill: #0B2A5B; }
.ftick { fill: none; stroke: #1F5FD6; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.fph { font-size: 10px; font-weight: 500; fill: #F4B98A; }
.fld.empty { fill: #FFF1E6; stroke: #F47B20; }
.cur { stroke: #F47B20; stroke-width: 2; }
.art.on .cur { animation: blink .8s steps(1) infinite; }

.lbl.s { font-size: 10px; }
.big { font-family: var(--font-display); font-size: 30px; font-weight: 800; }
.oldv { fill: #0B2A5B; }
.newv { fill: #F47B20; opacity: 0; }
.art.on .oldv { animation: vOut 3.2s ease infinite; }
.art.on .newv { animation: vIn 3.2s ease infinite; }
@keyframes vOut { 0%, 12% { opacity: 1; transform: none; } 20%, 100% { opacity: 0; transform: translateY(-8px); } }
@keyframes vIn { 0%, 14% { opacity: 0; transform: translateY(8px); } 22%, 100% { opacity: 1; transform: none; } }
.val { font-size: 12px; font-weight: 700; fill: #0B2A5B; }
.val.now { fill: #C55A0E; opacity: 0; }
.art.on .w1 { animation: wOut 3.2s ease infinite; } .art.on .n1 { animation: nIn 3.2s ease infinite; }
.art.on .w2 { animation: wOut 3.2s ease infinite; } .art.on .n2 { animation: nIn 3.2s ease infinite; }
@keyframes wOut { 0%, 52% { opacity: 1; } 58%, 100% { opacity: 0; } }
@keyframes nIn { 0%, 54% { opacity: 0; } 60%, 100% { opacity: 1; } }
.arrow { fill: none; stroke: #F47B20; stroke-width: 2.2; stroke-dasharray: 160; stroke-dashoffset: 160; }
.art.on .arrow { animation: drawA 3.2s ease-in-out infinite; }
.art.on .a3 { stroke: #B4BFD2; }
@keyframes drawA { 0%, 24% { stroke-dashoffset: 160; } 52%, 100% { stroke-dashoffset: 0; } }
.bang { fill: #F47B20; }
.bang-t { font-size: 12px; font-weight: 800; fill: #FFFFFF; }
.bangs { opacity: 0; }
.art.on .bangs { animation: bangIn 3.2s ease infinite; }
@keyframes bangIn { 0%, 58% { opacity: 0; } 64%, 100% { opacity: 1; } }
.art.on .stale { animation: shake 3.2s ease-in-out infinite; }
@keyframes shake { 0%, 60%, 100% { transform: translate(150px, 112px) rotate(0); } 66%, 78%, 90% { transform: translate(150px, 112px) rotate(-2.5deg); } 72%, 84% { transform: translate(150px, 112px) rotate(2.5deg); } }

.mag { fill: none; stroke: #0B2A5B; stroke-width: 2; stroke-linecap: round; }
.big-mail { stroke-width: 2.2; }
.mlbl { font-size: 12px; font-weight: 700; fill: #0B2A5B; }
.ghost { fill: none; stroke: #B4BFD2; stroke-width: 2; stroke-dasharray: 5 4; opacity: 0; }
.lost { transform-box: fill-box; transform-origin: center; }
.art.on .lost { animation: lose 3.6s ease-in-out infinite; }
.art.on .ghost { animation: ghost 3.6s ease infinite; }
@keyframes lose { 0%, 25% { opacity: 1; transform: none; } 55%, 92% { opacity: 0; transform: translate(10px, -6px) rotate(8deg) scale(.7); } 100% { opacity: 1; transform: none; } }
@keyframes ghost { 0%, 40% { opacity: 0; } 55%, 90% { opacity: 1; } 100% { opacity: 0; } }
.notfound { font-size: 12px; font-weight: 700; fill: #C55A0E; opacity: 0; }
.art.on .notfound { animation: nores 3.6s ease infinite; }
@keyframes nores { 0%, 48% { opacity: 0; } 56%, 90% { opacity: 1; } 100% { opacity: 0; } }
.file { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 1.8; }
.fname { font-size: 11.5px; font-weight: 600; fill: #0B2A5B; }
.qbg { fill: #F47B20; }
.qm { font-size: 14px; font-weight: 800; fill: #FFFFFF; }
.scatter { opacity: .55; }
.bub { fill: #FFFFFF; stroke: #1F5FD6; stroke-width: 2; }
.clipi { fill: none; stroke: #1F5FD6; stroke-width: 2; stroke-linecap: round; }
.art.on .d1 { animation: drift1 3s ease-in-out infinite alternate; }
.art.on .d2 { animation: drift2 3.4s ease-in-out infinite alternate; }
.art.on .d3 { animation: drift3 2.8s ease-in-out infinite alternate; }
@keyframes drift1 { to { transform: translate(8px, 128px) rotate(-8deg); } }
@keyframes drift2 { to { transform: translate(182px, 126px) rotate(6deg); } }
@keyframes drift3 { to { transform: translate(106px, 120px) rotate(-10deg); } }

.cyc { fill: none; stroke: #1F5FD6; stroke-width: 3; }
.head { fill: none; stroke: #1F5FD6; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.ring { transform-box: view-box; transform-origin: 0 0; transform: translate(115px, 74px); }
.art.on .ring { animation: ringspin 6s linear infinite; }
@keyframes ringspin { from { transform: translate(115px, 74px) rotate(0); } to { transform: translate(115px, 74px) rotate(360deg); } }
.rlbl { font-size: 11px; font-weight: 600; fill: #5E6B85; }
.rnum { font-family: var(--font-display); font-size: 26px; font-weight: 800; fill: #F47B20; animation: pop .4s cubic-bezier(.2, 1.6, .4, 1); transform-box: fill-box; transform-origin: center; }
@keyframes pop { from { transform: scale(.4); } to { transform: scale(1); } }
.node { font-size: 12px; font-weight: 700; fill: #0B2A5B; }
.hgl { fill: none; stroke: #C55A0E; stroke-width: 1.8; stroke-linecap: round; }
.sand { fill: #F47B20; }
.art.on .hg { animation: flip 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes flip { 0%, 75% { transform: rotate(0); } 100% { transform: rotate(180deg); } }
</style>
