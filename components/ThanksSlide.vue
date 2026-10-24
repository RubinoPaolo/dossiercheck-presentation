<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useIsSlideActive } from '@slidev/client'

const active = useIsSlideActive()
const te = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }
watch(active, (a) => {
  clearTimers()
  if (!a) { te.value = 0; return }
  te.value = 0
  ;[[300, 1], [1700, 2], [4600, 3]].forEach(([ms, p]) => later(ms, () => { te.value = p }))
}, { immediate: true })
onBeforeUnmount(clearTimers)

const doc = computed(() => te.value === 0 ? { mood: 'happy', pose: 'cheer' } : te.value >= 3 ? { mood: 'happy', pose: 'wave' } : { mood: 'happy', pose: 'rest' })

const HUM = [
  { k: 'coord', x: 300, cfg: { outfit: 'sweater', outfitColor: '#1F5FD6', hair: 'long', hairColor: '#4A2E1F', skin: '#C68B62', glasses: false }, ph: 0.2 },
  { k: 'sponsor', x: 400, cfg: { outfit: 'suit', outfitColor: '#33456B', tieColor: '#F47B20', hair: 'short', hairColor: '#2B1D14', skin: '#8D5A3B', glasses: false }, ph: 0.55 },
  { k: 'office', x: 500, cfg: { outfit: 'sweater', outfitColor: '#F47B20', hair: 'bun', hairColor: '#1E1E2A', skin: '#F1C9A5', glasses: true }, ph: 0.1 },
  { k: 'team', x: 780, cfg: { outfit: 'coat', hair: 'short', hairColor: '#6B3E26', skin: '#E0AC85', glasses: false }, ph: 0.4 },
  { k: 'spec', x: 880, cfg: { outfit: 'suit', outfitColor: '#0B2A5B', tieColor: '#1F5FD6', hair: 'grey', hairColor: '#AEB6C4', skin: '#EBC2A0', glasses: true }, ph: 0.7 },
  { k: 'patient', x: 980, cfg: { outfit: 'sweater', outfitColor: '#7FA8EE', hair: 'grey', hairColor: '#C9CED8', skin: '#F1C9A5', glasses: true }, ph: 0.3 },
].map(h => ({ ...h, d: 0.15 + (Math.abs(h.x - 640) / 100 - 1.4) * 0.22 }))
</script>

<template>
  <div class="stage" :class="`te${te}`">
    <div class="oldw"><ConclusionSlide frozen class="old" /></div>

    <div class="top">
      <img src="/dossiercheck-logo.png" alt="DossierCheck" class="logo">
      <h1 class="display thx">Thank You for the Attention!</h1>
      <p class="name">Paolo Rubino</p>
    </div>

    <div class="ground" />

    <div class="pillar-clip">
      <svg viewBox="0 0 170 160" class="pillar">
        <defs><linearGradient id="d16-shaft" x1="0" x2="1"><stop offset="0" stop-color="#FFFFFF" /><stop offset=".6" stop-color="#F4F7FC" /><stop offset="1" stop-color="#DFE6F2" /></linearGradient></defs>
        <rect x="6" y="0" width="158" height="16" rx="3" class="cap1" />
        <rect x="20" y="16" width="130" height="10" class="cap2" />
        <rect x="30" y="26" width="110" height="110" fill="url(#d16-shaft)" class="shaft" />
        <line v-for="k in 4" :key="k" :x1="30 + k * 22" y1="32" :x2="30 + k * 22" y2="130" class="flute" />
        <rect x="20" y="136" width="130" height="10" class="cap2" /><rect x="6" y="146" width="158" height="14" rx="3" class="cap1" />
      </svg>
    </div>

    <div class="who sun" style="--d: 1.25s"><div class="dance"><Sun uid="d16-sun" :look="0" /></div><i class="puff" /></div>
    <div class="who sph" style="--d: 1.05s">
      <div class="dance"><svg viewBox="-80 -70 160 160">
        <ellipse cx="0" cy="84" rx="40" ry="6" class="gshd" /><path d="M-34 62 H34 L40 84 H-40 Z" class="ped" />
        <g class="gcore"><circle r="38" class="ghalo" /><circle r="30" class="gcorec" /><text y="5" text-anchor="middle" class="gcoret">GPT-4o</text></g>
        <g class="geyes"><circle cx="-10" cy="-14" r="3" /><circle cx="10" cy="-14" r="3" /></g><path d="M-8 14 Q0 21 8 14" class="gsmile" />
      </svg></div><i class="puff" />
    </div>
    <div class="who mec" style="--d: 1.15s"><div class="dance"><Mecha :asm="te >= 2" :head="te >= 2" core="chest" /></div><i class="puff" /></div>

    <div v-for="h in HUM" :key="h.k" class="who hum" :style="{ left: `${h.x - 56}px`, '--d': `${h.d}s` }">
      <div class="dance"><Person v-bind="h.cfg" mood="happy" :pose="te >= 3 ? 'wave' : 'rest'" :phase="h.ph" :uid="`d16-${h.k}`" /></div><i class="puff" />
    </div>
    <div class="doc"><div class="lift"><Person v-bind="doc" uid="d16-doc" /></div></div>

    <p class="credits">
      <span class="cr"><span class="crl">Storyboard &amp; Creative Direction</span><b>Paolo Rubino</b></span>
      <i class="crs" />
      <span class="cr"><span class="crl">Animations</span><b>Claude</b><span class="crn">(Anthropic)</span></span>
    </p>

    <div class="botw">
      <div class="botfly">
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
.stage:not(.te0) .oldw { opacity: 0; }
.old :deep(.doc), .old :deep(.bot), .old :deep(.pillar-clip), .old :deep(.dlab) { opacity: 0 !important; transition: none !important; }

.top { position: absolute; left: 0; right: 0; top: 34px; text-align: center; z-index: 20; }
.logo { display: block; margin: 0 auto; height: 52px; opacity: 0; transform: translateY(-14px); transition: opacity .4s ease, transform .5s ease; }
.thx { margin: 12px 0 0; font-size: 54px; font-weight: 700; color: var(--ink); opacity: 0; transform: scale(.85); transition: opacity .4s ease, transform .6s cubic-bezier(.3, 1.6, .5, 1); }
.name { margin: 8px 0 0; font-family: var(--font-display); font-size: 24px; font-weight: 600; color: #1F5FD6; opacity: 0; transition: opacity .4s ease; }
.stage:not(.te0) .logo { opacity: 1; transform: none; transition-delay: .4s; }
.stage:not(.te0) .thx { opacity: 1; transform: none; transition-delay: .6s; }
.stage:not(.te0) .name { opacity: 1; transition-delay: 1s; }

.credits { position: absolute; left: 0; right: 0; top: 648px; margin: 0; display: flex; justify-content: center; align-items: center; gap: 22px; z-index: 20; opacity: 0; transform: translateY(10px); transition: opacity .7s ease, transform .7s ease; }
.te3 .credits { opacity: 1; transform: none; transition-delay: 1.2s; }
.cr { display: inline-flex; align-items: baseline; gap: 9px; white-space: nowrap; }
.crl { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--mist); }
.cr b { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--ink); }
.crn { font-size: 13px; font-weight: 600; color: var(--mist); }
.crs { width: 6px; height: 6px; border-radius: 50%; background: #F47B20; }

.ground { position: absolute; left: 30px; width: 1220px; top: 624px; height: 2px; background: #E1E6EF; z-index: 1; }
.pillar-clip { position: absolute; left: 555px; top: 464px; width: 170px; height: 160px; overflow: hidden; z-index: 5; }
.pillar { width: 170px; height: 160px; transition: transform 1.1s cubic-bezier(.65, 0, .25, 1) .2s; }
.stage:not(.te0) .pillar { transform: translateY(100%); }
.cap1 { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 2.5; } .cap2 { fill: #EEF2F8; stroke: #0B2A5B; stroke-width: 2.5; }
.shaft { stroke: #0B2A5B; stroke-width: 2.5; } .flute { stroke: #CDD6E4; stroke-width: 2; }
.doc { position: absolute; left: 560px; top: 350px; width: 160px; height: 270px; z-index: 8; }
.lift { width: 100%; height: 100%; transform: translateY(-160px); transition: transform 1.1s cubic-bezier(.65, 0, .25, 1) .2s; }
.stage:not(.te0) .lift { transform: none; }

.who { position: absolute; z-index: 6; opacity: 0; transform-origin: 50% 100%; }
.who .dance { width: 100%; height: 100%; transform-origin: 50% 100%; }
.te2 .who, .te3 .who { animation: popIn .55s cubic-bezier(.3, 1.6, .5, 1) var(--d) both; }
@keyframes popIn { 0% { opacity: 0; transform: translateY(-60px) scale(.6, 1.3); } 60% { opacity: 1; transform: translateY(0) scale(1.15, .85); } 100% { opacity: 1; transform: none; } }
.puff { position: absolute; left: 50%; bottom: -4px; width: 60px; height: 14px; margin-left: -30px; border-radius: 50%; background: radial-gradient(closest-side, rgba(201, 210, 224, .9), rgba(201, 210, 224, 0)); opacity: 0; }
.te2 .puff, .te3 .puff { animation: puff .6s ease-out calc(var(--d) + .3s) both; }
@keyframes puff { 0% { opacity: 1; transform: scale(.4); } 100% { opacity: 0; transform: scale(2.2, 1.4); } }
.hum { top: 435px; width: 112px; height: 189px; }
.sun { left: 28px; top: 452px; width: 156px; height: 156px; }
.sph { left: 160px; top: 506px; width: 112px; height: 112px; }
.mec { left: 1040px; top: 430px; width: 156px; height: 195px; }
.sph svg { width: 100%; height: 100%; overflow: visible; }
.gshd { fill: #0B2A5B; opacity: .12; } .ped { fill: #E1E6EF; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.ghalo { fill: #7FD3FF; opacity: .35; transform-box: fill-box; transform-origin: center; animation: ghalo 1.6s ease-in-out infinite; }
@keyframes ghalo { 50% { transform: scale(1.18); opacity: .15; } }
.gcorec { fill: #FFFFFF; stroke: #7FD3FF; stroke-width: 4; }
.gcoret { font-family: var(--font-display); font-size: 13px; font-weight: 800; fill: #0B2A5B; }
.geyes circle { fill: #0B2A5B; } .gsmile { fill: none; stroke: #0B2A5B; stroke-width: 2.5; stroke-linecap: round; }
.gcoret { transform: translateY(2px); }
.geyes, .gsmile { opacity: 0; transition: opacity .3s ease; }
.te3 .geyes, .te3 .gsmile { opacity: 1; }
.te3 .gcoret { opacity: 0; transition: opacity .3s ease; }

.te3 .sun .dance { animation: hop .6s ease-in-out infinite alternate; }
.te3 .sun :deep(.se:nth-child(2)) { animation: wink 2.4s ease-in-out .4s infinite !important; }
@keyframes wink { 0%, 60%, 100% { transform: scaleY(1); } 70%, 85% { transform: scaleY(.12); } }
.te3 .sph .dance { animation: hop .45s ease-in-out .2s infinite alternate; }
@keyframes hop { from { transform: translateY(0) scale(1); } to { transform: translateY(-14px) scale(1.03, .97); } }
.te3 .mec :deep(.armr .limb) { transform: rotate(-150deg) !important; transition: transform .5s cubic-bezier(.3, 1.4, .5, 1); }
.te3 .mec :deep(.armr .fore) { animation: mwave .5s ease-in-out infinite alternate !important; }
@keyframes mwave { from { transform: rotate(-25deg); } to { transform: rotate(25deg); } }
.te3 .mec .dance { animation: sway 1.2s ease-in-out infinite alternate; }
@keyframes sway { from { transform: rotate(-2deg); } to { transform: rotate(2deg); } }

.botw { position: absolute; left: 640px; top: 300px; width: 0; height: 0; z-index: 14; }
.botfly { position: absolute; left: -40px; top: -50px; width: 80px; height: 100px; opacity: 0; transform: translate(150px, -64px); }
.stage:not(.te0) .botfly { opacity: 1; animation: loop 5.5s ease-in-out 1.6s infinite; }
@keyframes loop { 0% { transform: translate(150px, -64px); } 25% { transform: translate(380px, 10px) rotate(12deg); } 50% { transform: translate(0, 40px) rotate(-360deg); } 75% { transform: translate(-380px, 10px) rotate(-372deg); } 100% { transform: translate(150px, -64px) rotate(-360deg); } }
.te0 .botfly { opacity: 1; transform: translate(150px, -64px); }
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
.barm { transform-box: view-box; }
.barm.l { transform-origin: -24.5px 26px; transform: rotate(150deg); } .barm.r { transform-origin: 24.5px 26px; }
.stage:not(.te0) .barm.r { animation: bwave .4s ease-in-out infinite alternate; }
@keyframes bwave { from { transform: rotate(-130deg); } to { transform: rotate(-170deg); } }
.te0 .barm.r { transform: rotate(-150deg); }
</style>
