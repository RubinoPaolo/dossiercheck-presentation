<script setup lang="ts">

withDefaults(defineProps<{
  asm?: boolean
  head?: boolean
  core?: 'head' | 'chest'
  exploded?: boolean
  glow?: boolean
  guard?: boolean
  work?: boolean
}>(), { asm: true, head: true, core: 'chest', exploded: false, glow: false, guard: false, work: false })
</script>

<template>
  <svg viewBox="0 0 320 400" class="mecha" :class="{ asm, hd: head, cc: core === 'chest', exp: exploded, glow, guard, work }">

    <g class="part legs">
      <path d="M116 266 H204 L198 294 H122 Z" class="navy" />
      <path d="M122 292 H156 L152 344 H126 Z" class="blue" /><path d="M164 292 H198 L194 344 H168 Z" class="blue" />
      <path d="M118 350 H158 L156 386 H122 Z" class="blue dk" /><path d="M162 350 H202 L198 386 H164 Z" class="blue dk" />
      <path d="M128 360 h22 M170 360 h22" class="hl" />
      <rect x="106" y="382" width="56" height="16" rx="6" class="navy" /><rect x="158" y="382" width="56" height="16" rx="6" class="navy" />
      <g class="gear" style="transform-origin: 139px 346px"><circle cx="139" cy="346" r="12" class="teeth" /><circle cx="139" cy="346" r="6.5" class="hub" /></g>
      <g class="gear rev" style="transform-origin: 181px 346px"><circle cx="181" cy="346" r="12" class="teeth" /><circle cx="181" cy="346" r="6.5" class="hub" /></g>
    </g>

    <g class="part arml">
      <path d="M70 58 L94 50 L102 140 L76 150 Z" class="orange dk" />
      <g class="limb" style="transform-origin: 75px 150px">
        <rect x="58" y="148" width="34" height="62" rx="10" class="orange dk" />
        <g class="fore" style="transform-origin: 75px 208px">
          <path d="M52 206 H98 L94 268 H56 Z" class="orange" /><path d="M62 222 h26 M62 234 h26 M62 246 h18" class="plate" />
          <rect x="58" y="266" width="36" height="28" rx="8" class="navy" />
        </g>
      </g>
      <path d="M46 132 Q46 100 80 98 Q112 98 116 124 L110 156 Q84 168 52 158 Z" class="orange" /><path d="M58 126 Q80 112 104 124" class="hl w" />
    </g>
    <g class="part armr">
      <path d="M250 58 L226 50 L218 140 L244 150 Z" class="orange dk" />
      <g class="limb" style="transform-origin: 245px 150px">
        <rect x="228" y="148" width="34" height="62" rx="10" class="orange dk" />
        <g class="fore" style="transform-origin: 245px 208px">
          <path d="M222 206 H268 L264 268 H226 Z" class="orange" /><path d="M232 222 h26 M232 234 h26 M232 246 h18" class="plate" />
          <rect x="226" y="266" width="36" height="28" rx="8" class="navy" />
        </g>
      </g>
      <path d="M274 132 Q274 100 240 98 Q208 98 204 124 L210 156 Q236 168 268 158 Z" class="orange" /><path d="M262 126 Q240 112 216 124" class="hl w" />
    </g>

    <g class="part torso">
      <path d="M104 112 H216 L208 196 L192 240 H128 L112 196 Z" class="navy" />
      <path d="M116 120 H156 L150 150 H120 Z M204 120 H164 L170 150 H200 Z" class="plateb" />
      <rect x="130" y="238" width="60" height="12" rx="4" class="navy" /><rect x="126" y="252" width="68" height="14" rx="4" class="navy" />
      <path d="M134 244 h52 M130 259 h60" class="seam" />
    </g>
    <g class="core">
      <circle cx="160" cy="190" r="34" class="halo" />
      <circle cx="160" cy="190" r="28" class="corec" />
      <text x="160" y="195" text-anchor="middle" class="coret">GPT-4o</text>
    </g>

    <g class="part head">
      <rect x="148" y="98" width="24" height="16" rx="4" class="navy" />
      <g transform="translate(160 70)">
        <path d="M-30 -20 Q-44 -44 -30 -52 Q-18 -42 -14 -30 Z" class="ear" /><path d="M30 -20 Q44 -44 30 -52 Q18 -42 14 -30 Z" class="ear" />
        <path d="M-42 4 Q-44 30 0 32 Q44 30 42 4 Q40 -4 0 -4 Q-40 -4 -42 4 Z" class="gold" />
        <path d="M-34 8 Q-36 -36 0 -36 Q36 -36 34 8 Q0 14 -34 8 Z" class="visor" />
        <path d="M-35 8 Q0 15 35 8" class="rim" />
        <rect x="-11" y="-42" width="22" height="6" rx="3" class="topl" />
        <ellipse cx="-12" cy="-10" rx="5" ry="7" class="eyeb" /><ellipse cx="12" cy="-10" rx="5" ry="7" class="eyeb" />
        <path d="M-6 2 q3 4 6 0 q3 4 6 0" class="mouth" />
        <path d="M-21 -23 L-5 -17 M21 -23 L5 -17" class="brow" />
        <text y="23" text-anchor="middle" class="htag">GPT-4o</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.mecha { width: 100%; height: 100%; overflow: visible; }
.navy { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.blue { fill: #1F5FD6; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; } .blue.dk { fill: #174CB0; }
.orange { fill: #F47B20; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; } .orange.dk { fill: #D9661A; }
.gold { fill: #C49A3E; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.plateb { fill: #2A4C8F; }
.plate { fill: none; stroke: rgba(255, 255, 255, .85); stroke-width: 2.6; stroke-linecap: round; }
.hl { fill: none; stroke: rgba(255, 255, 255, .35); stroke-width: 3; stroke-linecap: round; }
.hl.w { stroke: rgba(255, 255, 255, .45); }
.seam { stroke: rgba(255, 255, 255, .25); stroke-width: 2; }
.teeth { fill: none; stroke: #F7F9FD; stroke-width: 5; stroke-dasharray: 4 3.4; }
.hub { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 2; }
.gear { transform-box: view-box; animation: gspin 2.4s linear infinite paused; }
.gear.rev { animation-direction: reverse; }
.guard .gear, .work .gear { animation-play-state: running; }
@keyframes gspin { to { transform: rotate(360deg); } }
.ear { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.visor { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; }
.rim { fill: none; stroke: #DFF6FF; stroke-width: 2; stroke-linecap: round; }
.topl { fill: #DFF6FF; stroke: #0B2A5B; stroke-width: 1.5; }
.eyeb { fill: #7FE3F0; transition: fill .3s ease; }
.guard .eyeb, .work .eyeb { fill: #E6FBFF; }
.mouth { fill: none; stroke: #7FE3F0; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.htag { font-family: var(--font-display); font-size: 8.5px; font-weight: 800; fill: #0B2A5B; opacity: 1; transition: opacity .3s ease; }
.cc .htag { opacity: 0; }
.coret { font-family: var(--font-display); font-size: 14px; font-weight: 800; fill: #0B2A5B; }
.corec { fill: #FFFFFF; stroke: #7FD3FF; stroke-width: 4; }
.halo { fill: #7FD3FF; opacity: .35; transform-box: fill-box; transform-origin: center; animation: halo 1.6s ease-in-out infinite; }
@keyframes halo { 50% { transform: scale(1.18); opacity: .15; } }

.part { transform-box: view-box; transition: transform .6s cubic-bezier(.2, 1.35, .4, 1), opacity .3s ease, filter .4s ease; }
.legs, .arml, .armr, .torso { opacity: 0; }
.legs { transform: translateY(240px); }
.arml { transform: translateX(-280px) rotate(-25deg); transform-origin: 80px 130px; }
.armr { transform: translateX(280px) rotate(25deg); transform-origin: 240px 130px; }
.torso { transform: scale(.6); transform-origin: 160px 190px; }
.asm .legs, .asm .arml, .asm .armr, .asm .torso { opacity: 1; transform: none; }
.asm .legs { transition-delay: 0s; } .asm .torso { transition-delay: .15s; } .asm .arml { transition-delay: .35s; } .asm .armr { transition-delay: .5s; }
.head { opacity: 0; transition: none; }
.hd .head { opacity: 1; }

.core { transform-box: view-box; transform-origin: 160px 190px; transform: translateY(-120px) scale(.25); opacity: 0; transition: transform .9s cubic-bezier(.5, 0, .3, 1), opacity .25s ease; }
.cc .core { transform: none; opacity: 1; }

.exp .legs { transform: translateY(18px); transition-delay: 0s; }
.exp .arml { transform: translateX(-20px); transition-delay: 0s; }
.exp .armr { transform: translateX(20px); transition-delay: 0s; }
.exp .head { transform: translateY(-18px); transition: transform .6s cubic-bezier(.2, 1.35, .4, 1); }
.hd .head { transition: transform .6s cubic-bezier(.2, 1.35, .4, 1); }
.exp .torso { transform: none; }
.glow .legs, .glow .arml, .glow .armr, .glow .torso, .glow .head { filter: drop-shadow(0 0 3px #4FB8FF) drop-shadow(0 0 7px rgba(79, 184, 255, .7)); }

.limb, .fore { transform-box: view-box; transition: transform .5s cubic-bezier(.3, 1.4, .5, 1); }

.guard .arml .limb { transform: rotate(40deg); }
.guard .arml .fore { transform: rotate(128deg); transition-delay: .08s; }
.guard .armr .limb { transform: rotate(-40deg); animation: punchU 1.8s ease-in-out 1.2s infinite; }
.guard .armr .fore { transform: rotate(-128deg); transition-delay: .08s; animation: punchF 1.8s ease-in-out 1.2s infinite; }
@keyframes punchU { 0%, 55%, 100% { transform: rotate(-40deg); } 65%, 75% { transform: rotate(-88deg); } }
@keyframes punchF { 0%, 55%, 100% { transform: rotate(-128deg); } 65%, 75% { transform: rotate(-4deg); } }
.guard { animation: boxer .55s ease-in-out .6s infinite alternate; }
@keyframes boxer { from { transform: translateY(0) rotate(0); } to { transform: translateY(6px) rotate(1.5deg); } }
.brow { fill: none; stroke: #7FE3F0; stroke-width: 3; stroke-linecap: round; opacity: 0; transition: opacity .3s ease; }
.guard .brow { opacity: 1; }
.guard .eyeb { transform: scaleY(.7); transform-box: fill-box; transform-origin: center; }
</style>
