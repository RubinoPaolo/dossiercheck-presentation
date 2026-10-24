<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const step = computed(() => unref($clicks) as number)

const active = useIsSlideActive()
const phase = ref(0)
const animate = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }
watch(active, (a) => {
  clearTimers()
  if (!a) { animate.value = false; phase.value = 0; return }
  if (step.value > 0) { animate.value = false; phase.value = 4; return }
  animate.value = false
  phase.value = 0
  later(400, () => { animate.value = true; phase.value = 1 })
  later(600, () => { phase.value = 2 })
  later(2300, () => { phase.value = 3 })
  later(2700, () => { phase.value = 4 })
}, { immediate: true })

const S = 0.7
const team = [
  { id: 'pi', x: 60, y: 420, cfg: {} },
  { id: 'coord', x: 168, y: 430, cfg: { outfit: 'sweater', outfitColor: '#1F5FD6', hair: 'long', hairColor: '#4A2E1F', skin: '#C68B62', glasses: false } },
  { id: 'team', x: 276, y: 420, cfg: { outfit: 'coat', hair: 'short', hairColor: '#6B3E26', skin: '#E0AC85', glasses: false } },
] as const
const office = { x: 930, y: 420, cfg: { outfit: 'sweater', outfitColor: '#F47B20', hair: 'bun', hairColor: '#1E1E2A', skin: '#F1C9A5', glasses: true } }

const LIST_X = 416, ROW_Y = 236, ROW_H = 54
const rows = reactive([
  { name: 'Protocol', v: 1, show: false, flash: 0, by: 'pi' },
  { name: 'Consent form', v: 1, show: false, flash: 0, by: 'coord' },
  { name: 'Information sheet', v: 1, show: false, flash: 0, by: 'team' },
])
const inHand = reactive<Record<string, string>>({ pi: '', coord: '', team: '' })
const happy = reactive<Record<string, boolean>>({ pi: false, coord: false, team: false })
const officePoint = ref(false)
const preview = ref(false)

const msgBox = ref(false)
const typing = ref<'' | 'office' | 'pi'>('')
const msgs = ref(0)

function teamPose(id: string) {
  if (step.value < 3) return 'rest'
  return inHand[id] ? 'hold' : 'rest'
}

interface Fly { id: number, x0: number, y0: number, x1: number, y1: number, label: string }
const flyers = ref<Fly[]>([])
const flyDone = new Map<number, () => void>()
const started = new Set<number>()
let fid = 0
function fly(who: string, row: number, label: string, done: () => void) {
  const p = team.find(t => t.id === who)!
  const id = ++fid
  flyDone.set(id, done)
  flyers.value.push({ id, x0: p.x + 56 * 1 - 15, y0: p.y + 85, x1: LIST_X + 10, y1: ROW_Y + row * ROW_H + 6, label })
}
function startFly(el: any, f: Fly) {
  if (!el || started.has(f.id)) return
  started.add(f.id)
  const mx = (f.x0 + f.x1) / 2, my = Math.min(f.y0, f.y1) - 120
  const a = (el as HTMLElement).animate([
    { transform: `translate(${f.x0}px, ${f.y0}px) rotate(-6deg)`, easing: 'cubic-bezier(.2, .6, .4, 1)' },
    { transform: `translate(${mx}px, ${my}px) rotate(10deg) scale(1.1)`, offset: 0.5, easing: 'cubic-bezier(.5, 0, .8, .6)' },
    { transform: `translate(${f.x1}px, ${f.y1}px) rotate(0deg) scale(.8)` },
  ], { duration: 900, fill: 'forwards' })
  a.onfinish = () => {
    flyers.value = flyers.value.filter(x => x.id !== f.id)
    flyDone.get(f.id)?.()
    flyDone.delete(f.id)
  }
}

const seqTimers: ReturnType<typeof setTimeout>[] = []
const at = (ms: number, fn: () => void) => seqTimers.push(setTimeout(fn, ms))
function resetWorkspace(final: boolean) {
  seqTimers.splice(0).forEach(clearTimeout)
  flyers.value = []
  rows.forEach((r, k) => { r.show = final; r.v = final && k === 0 ? 2 : 1 })
  for (const k of Object.keys(inHand)) { inHand[k] = ''; happy[k] = final }
  officePoint.value = false
  preview.value = final
  msgBox.value = final
  typing.value = ''
  msgs.value = final ? 2 : 0
}
function upload(who: string, row: number, label: string, then?: () => void) {
  inHand[who] = ''
  fly(who, row, label, () => {
    const r = rows[row]
    if (r.show) r.v = 2
    r.show = true
    r.flash++
    happy[who] = true
    then?.()
  })
}
watch([step, active], ([s, a], old) => {
  const prev = old?.[0]
  if (!a || s < 3) { resetWorkspace(false); return }
  if (prev !== 2) { resetWorkspace(true); return }
  resetWorkspace(false)
  inHand.pi = 'Protocol'; inHand.coord = 'Consent'; inHand.team = 'Info sheet'
  at(450, () => upload('pi', 0, 'Protocol'))
  at(950, () => upload('coord', 1, 'Consent'))
  at(1450, () => upload('team', 2, 'Info sheet'))
  at(2700, () => { happy.pi = false; inHand.pi = 'Protocol v2' })
  at(3300, () => upload('pi', 0, 'Protocol v2'))
  at(4500, () => { officePoint.value = true })
  at(4900, () => { preview.value = true })
  at(5400, () => { msgBox.value = true })
  at(5600, () => { officePoint.value = false; typing.value = 'office' })
  at(6250, () => { typing.value = ''; msgs.value = 1 })
  at(6400, () => { typing.value = 'pi' })
  at(6800, () => { typing.value = ''; msgs.value = 2; happy.pi = true })
}, { immediate: true })

onBeforeUnmount(() => { clearTimers(); seqTimers.forEach(clearTimeout) })
</script>

<template>
  <div class="stage" :class="[`ph${phase}`, { s1: step >= 1, s2: step >= 2, s3: step >= 3, anim: animate }]">
    <h2 class="display heading">
      <span :class="{ on: phase === 0 }">From Difficulties to Design</span>
      <span :class="{ on: phase >= 1 && step < 2 }">Designed Around Those Difficulties</span>
      <span :class="{ on: step >= 2 }">A Shared Workspace</span>
    </h2>

    <div v-if="phase < 3" class="prev"><DesignSlide frozen :merging="phase >= 1" /></div>

    <div class="logo" :class="{ on: phase >= 3 }">
      <img src="/dossiercheck-logo.png" alt="DossierCheck">
    </div>
    <p class="tagline" :class="{ on: phase >= 4 }">An application that assists research teams</p>

    <div class="pills">
      <div class="pill" style="--k: 0s">
        <svg viewBox="0 0 120 72">
          <rect x="34" y="6" width="46" height="60" rx="4" class="pg" />
          <path d="M42 18 h30 M42 28 h30 M42 48 h22" class="pl" /><path d="M42 38 h30" class="pl hot" />
          <g class="lensg"><circle cx="0" cy="0" r="11" class="lens" /><line x1="8" y1="8" x2="17" y2="17" class="lensh" /></g>
        </svg>
        <span>Find problems in advance</span>
      </div>
      <div class="pill" style="--k: .55s">
        <svg viewBox="0 0 120 72">
          <rect x="22" y="22" width="60" height="28" rx="6" class="issue" />
          <path d="M32 36 h28" class="issue-l" />
          <circle cx="94" cy="36" r="14" class="okc" /><path d="M87 36 l5 5 l9 -10" class="okt" />
          <circle cx="94" cy="36" r="14" class="bangc" /><text x="94" y="41.5" text-anchor="middle" class="bangt">!</text>
        </svg>
        <span>Support their resolution</span>
      </div>
      <div class="pill" style="--k: 1.1s">
        <svg viewBox="0 0 120 72">
          <path d="M28 26 Q28 22 32 22 H50 L55 27 H88 Q92 27 92 31 V64 Q92 68 88 68 H32 Q28 68 28 64 Z" class="fback" />
          <g class="drop d1"><rect x="40" y="0" width="22" height="28" rx="2" class="pg sm" /></g>
          <g class="drop d2"><rect x="50" y="0" width="22" height="28" rx="2" class="pg sm" /></g>
          <g class="drop d3"><rect x="60" y="0" width="22" height="28" rx="2" class="pg sm" /></g>
          <path d="M26 42 Q26 38 30 38 H90 Q94 38 94 42 V64 Q94 68 90 68 H30 Q26 68 26 64 Z" class="ffront" />
        </svg>
        <span>Manage the dossier</span>
      </div>
    </div>

    <div class="panel">
      <div class="phead"><span class="ws">Study workspace</span></div>
      <p class="plabel" style="left: 16px">Documents</p>
      <p class="plabel" style="left: 252px">Preview</p>
      <div class="list">
        <div v-for="(r, k) in rows" :key="r.name" class="row" :class="[{ on: r.show }, `by-${r.by}`]" :style="{ top: `${ROW_Y - 140 + k * ROW_H}px` }">
          <svg viewBox="0 0 24 30" class="ricon"><path d="M2 2 H16 L22 8 V28 H2 Z" /><path d="M6 13 h12 M6 18 h12 M6 23 h8" class="rl" /></svg>
          <span class="rname">{{ r.name }}</span>
          <span :key="`${r.v}-${r.flash}`" class="ver" :class="{ v2: r.v === 2 }">v{{ r.v }}</span>
          <i class="dotby" />
        </div>
        <div class="drop-hint" :style="{ top: `${ROW_Y - 140 + 3 * ROW_H}px` }">Upload files</div>
      </div>
      <div class="pv" :class="{ on: preview }">
        <div class="pvpage">
          <p class="pvt">Protocol <b>v2</b></p>
          <i v-for="n in 9" :key="n" class="pvl" :style="{ width: `${[92, 80, 88, 60, 90, 84, 72, 88, 50][n - 1]}%` }" />
        </div>
        <svg viewBox="0 0 40 24" class="eye"><path d="M2 12 Q20 -6 38 12 Q20 30 2 12 Z" /><circle cx="20" cy="12" r="5" /></svg>
        <span class="viewed">Viewed by the office</span>
      </div>
      <p class="plabel mlabel" :class="{ on: msgBox }" style="left: 16px">Messages</p>
      <div class="msgs" :class="{ on: msgBox }">
        <div class="msg office" :class="{ on: msgs >= 1 }"><b>Office</b>Protocol v2 received. Is the PI's CV coming too?</div>
        <div class="msg pi" :class="{ on: msgs >= 2 }"><b>PI</b>Uploading it today.</div>
      </div>
      <div class="pv-empty" :class="{ off: preview }">
        <svg viewBox="0 0 40 24" class="eye ghost"><path d="M2 12 Q20 -6 38 12 Q20 30 2 12 Z" /><circle cx="20" cy="12" r="5" /></svg>
      </div>
    </div>

    <div class="ground2" />
    <div v-for="(t, k) in team" :key="t.id" class="who left" :style="{ left: `${t.x}px`, top: `${t.y}px`, '--k': `${0.25 + k * 0.12}s` }">
      <Person v-bind="t.cfg" :pose="teamPose(t.id)" :mood="happy[t.id] ? 'happy' : 'neutral'" :uid="`d7-${t.id}`" :phase="k * 0.5" />
      <div v-if="inHand[t.id]" class="hdoc"><i /><i /><i /><span>{{ inHand[t.id].includes('v2') ? 'v2' : '' }}</span></div>
    </div>
    <div class="who right" :style="{ left: `${office.x}px`, top: `${office.y}px`, '--k': '.5s' }">
      <div class="mirror"><Person v-bind="office.cfg" :pose="officePoint ? 'point' : 'rest'" mood="neutral" uid="d7-office" /></div>
    </div>
    <div class="typing t-office" :class="{ on: typing === 'office' }"><i /><i /><i /></div>
    <div class="typing t-pi" :class="{ on: typing === 'pi' }"><i /><i /><i /></div>
    <p class="glabel left" style="left: 60px; width: 328px"><b>Research team</b><span>prepares the dossier</span></p>
    <p class="glabel right" style="left: 880px; width: 212px"><b>Clinical Trials Office</b><span>internal review</span></p>

    <div v-for="f in flyers" :key="f.id" :ref="(el) => startFly(el, f)" class="flydoc"><i /><i /><i /><span v-if="f.label.includes('v2')">v2</span></div>
  </div>
</template>

<style scoped>
.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 9; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .5s ease, transform .5s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .3s; }
.heading span:first-child { position: relative; }

.archive { position: absolute; inset: 0; pointer-events: none; }
.folder { position: absolute; top: 96px; width: 150px; }
.anim .folder { transition: opacity .4s ease var(--d), transform .5s ease var(--d); }
.anim .records { transition: opacity .4s ease; }
.stage:not(.ph0) .folder { opacity: 0; transform: translateY(-30px); }
.stage:not(.ph0) .records { opacity: 0; }
.folder svg { width: 150px; height: 118px; overflow: visible; }
.folder p { margin: 6px 0 0; text-align: center; font-size: 17px; font-weight: 700; color: var(--ink); white-space: nowrap; }
.folder .back { fill: #FFC08F; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.folder .front path { fill: #F47B20; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.folder .front { transform-box: view-box; transform-origin: 75px 114px; transform: scaleY(.62) skewX(-6deg); }
.pdoc { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; }
.pln { stroke: #C9D2E0; stroke-width: 3; stroke-linecap: round; }
.fmail { fill: #FFFFFF; stroke: #1F5FD6; stroke-width: 2; }
.fmailf { fill: none; stroke: #1F5FD6; stroke-width: 2; stroke-linejoin: round; }
.records { position: absolute; left: 0; right: 0; top: 250px; margin: 0; text-align: center; font-size: 16px; font-weight: 500; color: var(--mist); }

.card { position: absolute; width: 290px; height: 380px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 16px; background: #FFFFFF; box-shadow: 0 10px 26px rgba(11, 42, 91, .08); z-index: 5; }
.num { position: absolute; left: 16px; top: 16px; width: 38px; height: 38px; border-radius: 50%; background: #F47B20; color: #FFFFFF; display: grid; place-items: center;
  font-family: var(--font-display); font-weight: 700; font-size: 21px; }
.content { position: absolute; inset: 0; padding: 16px 18px 18px; display: flex; flex-direction: column; }
h3 { margin: 0 0 0 50px; min-height: 62px; display: flex; align-items: center; font-family: var(--font-display); font-size: 23px; font-weight: 700; line-height: 1.12; color: var(--ink); }
.art { flex: 1; margin-top: 10px; }
.ex { margin: 8px 0 0; font-size: 16.5px; line-height: 1.32; color: var(--mist); }

.prev { position: absolute; inset: 0; z-index: 4; }
.prev :deep(.heading) { display: none; }
.logo { position: absolute; left: 320px; top: 196px; width: 640px; z-index: 6; clip-path: inset(0 100% 0 0); transform-origin: 0 0;
  transition: transform .8s cubic-bezier(.5, 0, .3, 1); }
.logo img { display: block; width: 100%; }
.logo.on { clip-path: inset(-10px -10px -10px -10px); }
.s2 .logo { transform: translate(96px, -40px) scale(.25); transition-delay: 0s, .1s; }
.sweep { position: absolute; left: 300px; top: 176px; width: 26px; height: 140px; border-radius: 13px; opacity: 0; z-index: 7;
  background: linear-gradient(90deg, rgba(31, 95, 214, 0), rgba(31, 95, 214, .55), rgba(31, 95, 214, 0)); }
.sweep.on { animation: sweep .9s cubic-bezier(.5, 0, .4, 1) both; }
.stage:not(.anim) .sweep { display: none; }
@keyframes sweep { 0% { opacity: 1; transform: translateX(0); } 85% { opacity: 1; } 100% { opacity: 0; transform: translateX(660px); } }
.tagline { position: absolute; left: 0; right: 0; top: 318px; margin: 0; text-align: center; font-size: 24px; font-weight: 500; color: #33456B; opacity: 0; transform: translateY(8px); transition: opacity .5s ease, transform .5s ease; }
.tagline.on { opacity: 1; transform: none; }
.s2 .tagline { opacity: 0; transform: translateY(-10px); }

.pills { position: absolute; left: 175px; top: 392px; display: flex; gap: 15px; }
.pill { width: 300px; height: 168px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 16px; background: #FFFFFF; box-shadow: 0 10px 26px rgba(11, 42, 91, .08);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
  opacity: 0; transform: translateY(24px) scale(.95); transition: opacity .45s ease, transform .5s cubic-bezier(.2, 1.4, .4, 1); }
.s1 .pill { opacity: 1; transform: none; transition-delay: var(--k); }
.s2 .pill { opacity: 0; transform: translateY(30px); transition-delay: 0s; }
.pill svg { width: 150px; height: 90px; overflow: visible; }
.pill span { font-family: var(--font-display); font-size: 21px; font-weight: 700; color: var(--ink); }
.pg { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2.2; }
.pg.sm { stroke-width: 1.8; }
.pl { stroke: #C9D2E0; stroke-width: 3.5; stroke-linecap: round; }
.pl.hot { animation: hot 2.6s ease infinite; }
@keyframes hot { 0%, 40% { stroke: #C9D2E0; } 50%, 90% { stroke: #F47B20; } 100% { stroke: #C9D2E0; } }
.lensg { animation: lensmove 2.6s ease-in-out infinite; }
@keyframes lensmove { 0% { transform: translate(44px, 16px); } 45%, 90% { transform: translate(72px, 38px); } 100% { transform: translate(44px, 16px); } }
.lens { fill: rgba(31, 95, 214, .1); stroke: #1F5FD6; stroke-width: 3; }
.lensh { stroke: #1F5FD6; stroke-width: 4; stroke-linecap: round; }
.issue { fill: #FFF1E6; stroke: #F47B20; stroke-width: 2.2; animation: fixbox 2.8s ease infinite; }
.issue-l { stroke: #F47B20; stroke-width: 3.5; stroke-linecap: round; animation: fixline 2.8s ease infinite; }
@keyframes fixbox { 0%, 45% { fill: #FFF1E6; stroke: #F47B20; } 55%, 92% { fill: #EEF4FF; stroke: #1F5FD6; } 100% { fill: #FFF1E6; stroke: #F47B20; } }
@keyframes fixline { 0%, 45% { stroke: #F47B20; } 55%, 92% { stroke: #1F5FD6; } 100% { stroke: #F47B20; } }
.bangc { fill: #F47B20; animation: outA 2.8s ease infinite; } .bangt { font-size: 18px; font-weight: 800; fill: #FFFFFF; animation: outA 2.8s ease infinite; }
.okc { fill: #1F5FD6; animation: inA 2.8s ease infinite; } .okt { fill: none; stroke: #FFFFFF; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; animation: inA 2.8s ease infinite; }
@keyframes outA { 0%, 45% { opacity: 1; } 52%, 94% { opacity: 0; } 100% { opacity: 1; } }
@keyframes inA { 0%, 47% { opacity: 0; } 55%, 92% { opacity: 1; } 100% { opacity: 0; } }
.fback { fill: #FFC08F; stroke: #0B2A5B; stroke-width: 2.2; stroke-linejoin: round; }
.ffront { fill: #F47B20; stroke: #0B2A5B; stroke-width: 2.2; stroke-linejoin: round; }
.drop { opacity: 0; animation: dropin 3s ease-in infinite; }
.drop.d2 { animation-delay: .35s; } .drop.d3 { animation-delay: .7s; }
@keyframes dropin { 0% { opacity: 0; transform: translateY(-30px) rotate(-8deg); } 10% { opacity: 1; } 30%, 80% { opacity: 1; transform: translateY(24px) rotate(0); } 95%, 100% { opacity: 0; transform: translateY(24px); } }

.panel { position: absolute; left: 400px; top: 140px; width: 480px; height: 456px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 18px; background: #FFFFFF;
  box-shadow: 0 14px 34px rgba(11, 42, 91, .1); z-index: 4; opacity: 0; transform: translateY(20px) scale(.96); transition: opacity .5s ease, transform .6s cubic-bezier(.2, 1.2, .4, 1); }
.s2 .panel { opacity: 1; transform: none; transition-delay: .15s; }
.phead { position: absolute; left: 0; right: 0; top: 0; height: 56px; border-bottom: 2px solid #E1E6EF; display: flex; align-items: center; justify-content: flex-end; padding-right: 16px; }
.ws { font-size: 14px; font-weight: 700; color: #1F5FD6; background: #EEF4FF; border-radius: 999px; padding: 5px 12px; }
.plabel { position: absolute; top: 64px; margin: 0; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--mist); }
.list { position: absolute; left: 14px; top: 0; width: 222px; height: 100%; }
.row { position: absolute; left: 0; width: 222px; height: 46px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 10px; background: #FFFFFF;
  display: flex; align-items: center; gap: 8px; padding: 0 10px; opacity: 0; transform: scale(.8); transition: opacity .3s ease, transform .4s cubic-bezier(.2, 1.6, .4, 1); }
.row.on { opacity: 1; transform: none; }
.ricon { width: 20px; height: 26px; flex: none; }
.ricon path { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.ricon .rl { stroke: #B4C2DA; stroke-linecap: round; }
.rname { flex: 1; font-size: 14px; font-weight: 600; color: var(--ink); white-space: nowrap; }
.ver { font-size: 12px; font-weight: 800; color: #1F5FD6; background: #EEF4FF; border-radius: 6px; padding: 2px 7px; animation: verpop .45s cubic-bezier(.2, 1.8, .4, 1); }
.ver.v2 { color: #FFFFFF; background: #F47B20; }
@keyframes verpop { from { transform: scale(.3) rotate(-20deg); } to { transform: none; } }
.dotby { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.by-pi .dotby { background: #0B2A5B; } .by-coord .dotby { background: #1F5FD6; } .by-team .dotby { background: #6B3E26; }
.drop-hint { position: absolute; left: 0; width: 222px; height: 40px; box-sizing: border-box; border: 2px dashed #B4BFD2; border-radius: 10px; display: grid; place-items: center; font-size: 13px; font-weight: 600; color: var(--mist); }
.pv, .pv-empty { position: absolute; left: 252px; top: 88px; width: 212px; height: 350px; box-sizing: border-box; border-radius: 12px; }
.pv-empty { border: 2px dashed #D5DCE8; display: grid; place-items: center; transition: opacity .3s ease; }
.pv-empty.off { opacity: 0; }
.pv { opacity: 0; transform: scale(.4) translate(-120px, -260px); transform-origin: 0 0; transition: opacity .3s ease, transform .6s cubic-bezier(.2, 1.1, .4, 1); z-index: 1; }
.pv.on { opacity: 1; transform: none; }
.pvpage { position: absolute; inset: 0 0 34px 0; border: 2px solid #0B2A5B; border-radius: 10px; background: #FFFFFF; padding: 14px 14px 0; box-sizing: border-box; }
.pvt { margin: 0 0 12px; font-size: 15px; font-weight: 700; color: var(--ink); }
.pvt b { color: #F47B20; }
.pvl { display: block; height: 7px; border-radius: 4px; background: #DDE3EC; margin-bottom: 13px; }
.eye { width: 40px; height: 24px; }
.eye path { fill: #FFFFFF; stroke: #1F5FD6; stroke-width: 2.4; stroke-linejoin: round; }
.eye circle { fill: #1F5FD6; }
.pv .eye { position: absolute; right: -8px; top: -12px; background: #FFFFFF; border-radius: 12px; padding: 4px; box-shadow: 0 4px 10px rgba(11, 42, 91, .12); }
.pv.on .eye circle { animation: look 2.4s ease-in-out infinite; }
@keyframes look { 0%, 100% { transform: translateX(-3px); } 50% { transform: translateX(3px); } }
.eye.ghost path { stroke: #C9D2E0; } .eye.ghost circle { fill: #C9D2E0; }
.viewed { position: absolute; left: 0; right: 0; bottom: 0; text-align: center; font-size: 13px; font-weight: 700; color: #C55A0E; }

.mlabel { top: 308px; opacity: 0; transform: translateY(6px); transition: opacity .4s ease, transform .4s ease; }
.mlabel.on { opacity: 1; transform: none; }
.msgs { position: absolute; left: 14px; top: 326px; width: 222px; height: 112px; box-sizing: border-box; border-top: 2px solid #E1E6EF;
  opacity: 0; transition: opacity .4s ease; }
.msgs.on { opacity: 1; }
.msg { position: absolute; max-width: 186px; box-sizing: border-box; padding: 4px 9px 5px; border-radius: 10px; font-size: 12.5px; line-height: 1.22; font-weight: 500; color: var(--ink);
  opacity: 0; transform: translateY(8px) scale(.9); transition: opacity .3s ease, transform .45s cubic-bezier(.2, 1.5, .4, 1); }
.msg.on { opacity: 1; transform: none; }
.msg b { display: block; font-size: 10.5px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; margin-bottom: 1px; }
.msg.office { right: 0; top: 7px; background: #FFF1E6; border: 1.5px solid #F47B20; border-bottom-right-radius: 3px; transform-origin: 100% 100%; }
.msg.office b { color: #C55A0E; }
.msg.pi { left: 0; top: 68px; background: #EEF4FF; border: 1.5px solid #1F5FD6; border-bottom-left-radius: 3px; transform-origin: 0 100%; }
.msg.pi b { color: #1F5FD6; }
.typing { position: absolute; z-index: 8; display: flex; gap: 4px; padding: 8px 10px; background: #FFFFFF; border: 2px solid #0B2A5B; border-radius: 14px;
  opacity: 0; transform: scale(.6); transition: opacity .25s ease, transform .3s cubic-bezier(.2, 1.6, .4, 1); }
.typing.on { opacity: 1; transform: none; }
.typing i { width: 7px; height: 7px; border-radius: 50%; background: #F47B20; animation: tdot 1s ease-in-out infinite; }
.typing i:nth-child(2) { animation-delay: .15s; } .typing i:nth-child(3) { animation-delay: .3s; }
.t-office { left: 918px; top: 392px; border-bottom-right-radius: 3px; transform-origin: 100% 100%; }
.t-pi { left: 132px; top: 392px; border-bottom-left-radius: 3px; transform-origin: 0 100%; }
.t-pi i { background: #1F5FD6; }
@keyframes tdot { 0%, 60%, 100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-4px); opacity: 1; } }

.ground2 { position: absolute; left: 40px; right: 40px; top: 603px; height: 2px; background: linear-gradient(90deg, transparent, #D5DCE8 15%, #D5DCE8 85%, transparent); opacity: 0; transition: opacity .5s ease .2s; }
.s2 .ground2 { opacity: 1; }
.who { position: absolute; width: 112px; height: 189px; z-index: 6; opacity: 0; transition: opacity .4s ease, transform .8s cubic-bezier(.2, 1.1, .4, 1); }
.who.left { transform: translateX(-360px); }
.who.right { transform: translateX(380px); }
.s2 .who { opacity: 1; transform: none; transition-delay: var(--k); }
.mirror { width: 100%; height: 100%; transform: scaleX(-1); }
.hdoc { position: absolute; left: 41px; top: 82px; width: 30px; height: 38px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 3px; background: #FFFFFF; padding: 7px 5px 0; animation: grab .3s ease; }
.hdoc i, .flydoc i { display: block; height: 3px; border-radius: 2px; background: #B4C2DA; margin-bottom: 4px; }
.hdoc span, .flydoc span { position: absolute; right: -9px; top: -9px; font-size: 10px; font-weight: 800; color: #FFFFFF; background: #F47B20; border-radius: 6px; padding: 1px 4px; }
.hdoc span:empty { display: none; }
@keyframes grab { from { transform: scale(.4); opacity: 0; } to { transform: none; opacity: 1; } }
.flydoc { position: absolute; left: 0; top: 0; width: 30px; height: 38px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 3px; background: #FFFFFF; padding: 7px 5px 0; z-index: 10; box-shadow: 0 6px 14px rgba(11, 42, 91, .15); }
.glabel { position: absolute; top: 614px; margin: 0; text-align: center; opacity: 0; transition: opacity .5s ease; }
.s2 .glabel { opacity: 1; transition-delay: .8s; }
.glabel b { display: block; font-family: var(--font-display); font-size: 19px; color: var(--ink); }
.glabel span { font-size: 14px; color: var(--mist); }
</style>
