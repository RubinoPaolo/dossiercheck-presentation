<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const step = computed(() => unref($clicks) as number)

const active = useIsSlideActive()
const phase = ref(0)
const animate = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }

const DOC_W = 262, DOC_H = 330, DOC_GAP = 18, DOC_Y = 226
const docX = (i: number) => 89 + i * (DOC_W + DOC_GAP)
const docs = [
  { name: 'Protocol', by: 'By the principal investigator', icon: 'protocol', pre: 'Sample size: ', post: '', lines: [92, 70, 84, 0, 88, 64, 78], speed: 0.16 },
  { name: 'Consent forms', by: 'By the study coordinator', icon: 'consent', pre: '', post: ' participants', lines: [80, 90, 58, 0, 86, 72, 50], speed: 0.22 },
  { name: 'Information sheets', by: 'By the research team', icon: 'info', pre: 'Enrolling ', post: ' people', lines: [88, 62, 90, 0, 74, 84, 60], speed: 0.19 },
  { name: 'Administrative documentation', by: 'Supplied by the sponsor', icon: 'admin', pre: 'Budget: ', post: ' × €$£', lines: [70, 86, 76, 0, 90, 58, 82], speed: 0.25 },
]
const FIELD_LINE = 3
const lineY = (k: number) => 104 + k * 29

const R = 130 / 180
const cast = [
  { id: 'pi', doc: 0, from: { x: 250, y: 361, s: 1 }, pose4: 'point', cfg: {} },
  { id: 'ethics', doc: -1, exitX: -260, from: { x: 590, y: 78, s: R }, pose4: 'weigh', cfg: { outfit: 'suit', outfitColor: '#0B2A5B', tieColor: '#1F5FD6', hair: 'grey', hairColor: '#AEB6C4', skin: '#EBC2A0', glasses: true } },
  { id: 'sponsor', doc: 3, from: { x: 1080, y: 78, s: R }, pose4: 'sign', cfg: { outfit: 'suit', outfitColor: '#33456B', tieColor: '#F47B20', hair: 'short', hairColor: '#2B1D14', skin: '#8D5A3B', glasses: false } },
  { id: 'privacy', doc: 1, from: { x: 590, y: 440, s: R }, pose4: 'phone', cfg: { outfit: 'sweater', outfitColor: '#1F5FD6', hair: 'long', hairColor: '#4A2E1F', skin: '#C68B62', glasses: false } },
  { id: 'admin', doc: -1, exitX: 1420, from: { x: 1080, y: 440, s: R }, pose4: 'stamp', cfg: { outfit: 'sweater', outfitColor: '#F47B20', hair: 'bun', hairColor: '#1E1E2A', skin: '#F1C9A5', glasses: true } },
  { id: 'team', doc: 2, from: { x: -260, y: 300, s: R }, pose4: 'rest', cfg: { outfit: 'coat', hair: 'short', hairColor: '#6B3E26', skin: '#E0AC85', glasses: false } },
] as const
const labels4 = [
  { t: 'Ethics committee', x: 545, y: 302 }, { t: 'Sponsor', x: 1035, y: 302 },
  { t: 'Study coordinator', x: 545, y: 664 }, { t: 'Clinical Trials Office', x: 1035, y: 664 },
]
const AV = 0.62
const slot = (d: number) => ({ x: docX(d) + DOC_W / 2 - 90 * AV, y: DOC_Y - 98, s: AV })

const updated = ref([true, false, false, false])
const day = ref(1)
const dayFinal = ref(false)
const chasing = ref(false)
const flights = ref<{ key: string, from: number, to: number }[]>([])

function castStyle(c: typeof cast[number]) {
  let p: { x: number, y: number, s: number }
  if (phase.value === 0) p = c.from
  else if (c.doc < 0) p = { x: (c as any).exitX ?? 1420, y: c.from.y, s: c.from.s }
  else if (c.id === "pi" && step.value >= 3) p = { x: 200, y: 280, s: 1 }
  else p = slot(c.doc)
  const fade = step.value >= 3 && c.id !== 'pi'
  return {
    transform: `translate(${p.x}px, ${p.y}px) scale(${p.s})`,
    opacity: fade ? 0 : 1,
    zIndex: c.id === 'pi' && step.value >= 3 ? 6 : 2,
    transition: animate.value || step.value > 0
      ? `transform ${step.value >= 3 ? 1.1 : 1.15}s cubic-bezier(.6, 0, .3, 1) ${phase.value === 1 ? 0.35 + cast.indexOf(c) * 0.08 : 0.15}s, opacity .5s ease`
      : 'none',
  }
}
function castMood(c: typeof cast[number]) {
  if (phase.value === 0) return c.id === 'pi' ? 'happy' : 'neutral'
  if (step.value >= 3) return 'worried'
  if (c.id === 'pi') return chasing.value && !updated.value.every(Boolean) ? 'worried' : 'neutral'
  if (chasing.value) return updated.value[c.doc] ? 'happy' : 'worried'
  return 'neutral'
}
function castPose(c: typeof cast[number]) {
  if (phase.value === 0) return c.pose4
  if (c.id === 'pi' && step.value >= 3) return 'despair'
  return 'rest'
}

function value(d: number) {
  if (step.value < 2) return '120'
  if (d === 0) return '150'
  return updated.value[d] ? '150' : '120'
}
function fieldState(d: number) {
  if (step.value < 1) return ''
  if (step.value === 1) return 'hl'
  if (d === 0) return 'edited'
  return value(d) === '150' ? 'fixed' : 'warn'
}
function linkState(d: number) {
  if (step.value < 1) return ''
  if (step.value === 1) return 'hl'
  return value(d) === value(d + 1) ? 'hl' : 'warn'
}

const worries = [
  [], ['folder', 'phone'], ['people', 'calendar'], ['invoice', 'calendar'],
]

const piles = [
  { x: 112, y: 502, base: 6, n: 11 },
  { x: 452, y: 502, base: 8, n: 14 },
  { x: 590, y: 650, base: 9, n: 15 },
  { x: 0, y: 650, base: 5, n: 9 },
]

const careShare = computed(() => step.value >= 3 ? 40 : 78)

function finalState() {
  updated.value = [true, true, true, true]; day.value = 9; chasing.value = true; dayFinal.value = true
}
function resetState() {
  updated.value = [true, false, false, false]; day.value = 1; chasing.value = false; dayFinal.value = false
}

watch(active, (a) => {
  clearTimers()
  if (!a) { animate.value = false; phase.value = 0; return }
  if (step.value > 0) {
    animate.value = false; phase.value = 2
    finalState()
    return
  }
  animate.value = false
  phase.value = 0
  resetState()
  later(500, () => { animate.value = true; phase.value = 1 })
  later(1900, () => { phase.value = 2 })
}, { immediate: true })

const CHASE_AT = 1.4
const UPDATE_AT = [0, 2.0, 3.2, 4.4].map(t => t + CHASE_AT)
const DAYS = [1, 4, 6, 9]
watch(step, (s, prev) => {
  if (!active.value) return
  clearTimers()
  flights.value = []
  if (s < 2) resetState()
  if (s === 2 && (prev ?? 0) < 2) {
    resetState()
    later(CHASE_AT * 1000, () => { chasing.value = true })
    for (let d = 1; d <= 3; d++) {
      const u = UPDATE_AT[d] * 1000
      later(u - 1500, () => { flights.value = [...flights.value, { key: `o${d}`, from: 0, to: d }] })
      later(u - 750, () => { flights.value = [...flights.value, { key: `b${d}`, from: d, to: 0 }] })
      later(u, () => { const up = [...updated.value]; up[d] = true; updated.value = up; day.value = DAYS[d] })
    }
    later(UPDATE_AT[3] * 1000 + 450, () => { dayFinal.value = true })
  }
  if (s === 2 && (prev ?? 0) > 2) finalState()
  if (s >= 3) finalState()
})
onBeforeUnmount(clearTimers)

const head = (d: number) => ({ x: docX(d) + DOC_W / 2, y: DOC_Y - 62 })
function flightStyle(f: { from: number, to: number }) {
  const a = head(f.from), b = head(f.to)
  return { '--x0': `${a.x}px`, '--y0': `${a.y}px`, '--x1': `${b.x}px`, '--y1': `${b.y}px` }
}
</script>

<template>
  <div class="stage" :class="{ out: phase >= 1, ready: phase >= 2, focus: step >= 3 }">
    <h2 class="display heading">
      <span :class="{ on: phase === 0 }">The Study Dossier</span>
      <span :class="{ on: phase >= 1 && step < 3 }">Keeping the Dossier Consistent</span>
      <span :class="{ on: step >= 3 }">Time Taken From Research and Care</span>
    </h2>

    <div class="ground" />

    <div class="bar4">
      <p>Ready to start the study</p>
      <div class="track"><div class="barfill" /></div>
    </div>
    <svg class="links4" viewBox="0 0 1280 720">
      <path v-for="(e, i) in [[655, 190], [1145, 190], [655, 552], [1145, 552], [420, 500]]" :key="i" :d="`M880,373 L${e[0]},${e[1]}`" />
    </svg>
    <p v-for="l in labels4" :key="l.t" class="label4" :style="{ left: `${l.x}px`, top: `${l.y}px` }">{{ l.t }}</p>
    <div class="pi-tag4">Principal investigator</div>
    <div class="folder4">
      <svg viewBox="0 0 240 190">
        <path d="M10 30 Q10 20 20 20 H88 L104 36 H220 Q230 36 230 46 V172 Q230 182 220 182 H20 Q10 182 10 172 Z" class="back" />
        <g v-for="k in 12" :key="k" :transform="`translate(${18 + (((k - 1) * 41) % 150)} ${24 - (k - 1) * 1.3}) scale(1.069)`" class="inner">
          <rect x="0" y="0" width="58" height="72" rx="3" /><line x1="9" y1="14" x2="49" y2="14" /><line x1="9" y1="25" x2="49" y2="25" />
        </g>
        <path d="M6 70 Q6 60 16 60 H224 Q234 60 234 70 V172 Q234 182 224 182 H16 Q6 182 6 172 Z" class="front" />
        <text x="120" y="130" text-anchor="middle" class="flabel">Study dossier</text>
      </svg>
    </div>

    <div v-for="c in cast" :key="c.id" class="actor" :style="castStyle(c)">
      <Person v-bind="c.cfg" :pose="castPose(c)" :mood="castMood(c)" :sweat="c.id === 'pi' && step >= 3" :uid="`c5-${c.id}`" :phase="cast.indexOf(c) * 0.45" />
    </div>

    <div
      v-for="(d, i) in docs" :key="d.name" class="doc"
      :style="{ left: `${docX(i)}px`, top: `${DOC_Y}px`, '--i': i, '--dx': `${880 - docX(i) - DOC_W / 2}px`, '--dy': `${373 - DOC_Y - DOC_H / 2}px` }"
    >
      <header>
        <svg viewBox="0 0 32 32" class="dicon">
          <path d="M7 3 h13 l6 6 v20 h-19 z" class="paperbg" />
          <template v-if="d.icon === 'protocol'"><path d="M11 13 h10 M11 17 h10 M11 21 h7" class="ln" /><rect x="11" y="1.5" width="10" height="4" rx="1.5" class="clip" /></template>
          <template v-else-if="d.icon === 'consent'"><path d="M11 13 h10 M11 17 h8" class="ln" /><path d="M10 24 q3 -4 5 0 t5 -1" class="sign" /></template>
          <template v-else-if="d.icon === 'info'"><circle cx="16.5" cy="18" r="6" class="infoc" /><path d="M16.5 17 v4" class="infoi" /><circle cx="16.5" cy="14.8" r=".9" fill="#FFFFFF" /></template>
          <template v-else><path d="M11 13 h10 M11 17 h7" class="ln" /><circle cx="19" cy="23" r="4.2" class="stampc" /></template>
        </svg>
        <span>{{ d.name }}</span>
      </header>
      <p class="by">{{ d.by }}</p>
      <template v-for="(w, k) in d.lines" :key="k">
        <i v-if="k !== FIELD_LINE" class="tline" :style="{ top: `${lineY(k)}px`, '--w': `${w}%`, '--t': `${0.15 + k * d.speed}s` }" />
        <div v-else class="field" :class="fieldState(i)" :style="{ top: `${lineY(k) - 9}px`, '--t': `${0.15 + k * d.speed}s` }">
          <span>{{ d.pre }}<b :key="value(i)" class="num">{{ value(i) }}</b>{{ d.post }}</span>
          <i v-if="i === 0 && step === 2 && !chasing" class="caret" />
          <em v-if="fieldState(i) === 'warn'" class="badge">!</em>
          <svg v-if="fieldState(i) === 'warn' && chasing" viewBox="0 0 20 24" class="hourglass">
            <path d="M4 2 h12 M4 22 h12 M5 2 q0 7 5 10 q-5 3 -5 10 M15 2 q0 7 -5 10 q5 3 5 10" />
            <path d="M7 19 h6 l-3 -4 z" class="sand" />
          </svg>
          <em v-if="fieldState(i) === 'fixed'" class="check">✓</em>
        </div>
      </template>
    </div>

    <svg class="chain" viewBox="0 0 1280 720">
      <path
        v-for="i in 3" :key="i" :class="linkState(i - 1)"
        :d="`M${docX(i - 1) + DOC_W - 16},${DOC_Y + lineY(FIELD_LINE)} C${docX(i - 1) + DOC_W + 10},${DOC_Y + lineY(FIELD_LINE) - 40} ${docX(i) - 10},${DOC_Y + lineY(FIELD_LINE) - 40} ${docX(i) + 16},${DOC_Y + lineY(FIELD_LINE)}`"
      />
    </svg>

    <div
      v-for="d in [1, 2, 3]" :key="`w${d}`" class="worry" :class="{ on: step === 2 && chasing && !updated[d] }"
      :style="{ left: `${docX(d) + DOC_W / 2 + 40}px`, top: `${DOC_Y - 124}px`, '--d': `${(d - 1) * 0.15}s` }"
    >
      <svg v-for="w in worries[d]" :key="w" viewBox="0 0 24 24" class="wicon">
        <template v-if="w === 'folder'"><path d="M3 7 h7 l2 2 h9 v11 h-18 z" /></template>
        <template v-else-if="w === 'phone'"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18 h2" /></template>
        <template v-else-if="w === 'people'"><circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M2 20 q6 -8 12 0 M10 20 q6 -8 12 0" /></template>
        <template v-else-if="w === 'calendar'"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10 h18 M8 3 v4 M16 3 v4" /></template>
        <template v-else><path d="M6 2 h12 v20 l-3 -2 l-3 2 l-3 -2 l-3 2 z" /><path d="M9 8 h6 M9 12 h6" /></template>
      </svg>
      <i class="tail" />
    </div>

    <div v-for="f in flights" :key="f.key" class="mail" :style="flightStyle(f)">
      <div class="arc">
        <svg viewBox="0 0 28 20"><rect x="1" y="1" width="26" height="18" rx="2.5" /><path d="M1.5 2 L14 11 L26.5 2" /></svg>
      </div>
    </div>

    <div class="days" :class="{ on: step === 2 && chasing, final: dayFinal && step === 2 }">
      <i :key="`ring${day}`" class="ring" />
      <svg viewBox="0 0 24 24" class="cal"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10 h18 M8 3 v4 M16 3 v4" /></svg>
      <span>Day <b :key="day">{{ day }}</b></span>
      <svg v-for="k in 4" :key="`pg${k}`" viewBox="0 0 20 22" class="page" :style="{ '--k': k }"><rect x="1" y="1" width="18" height="20" rx="2" /><path d="M1 7 h18" /></svg>
    </div>
    <p class="days-note" :class="{ on: dayFinal && step === 2 }">9 days to change one number</p>
    <span class="illustrative" :class="{ on: step === 2 && chasing }">Illustrative example</span>

    <div class="desk-scene" :class="{ on: step >= 3 }">
      <svg viewBox="0 0 110 150" class="chair"><rect x="8" y="4" width="94" height="120" rx="18" /><rect x="22" y="18" width="66" height="70" rx="12" class="pad" /></svg>
      <svg viewBox="0 0 470 170" class="desk">
        <path d="M14 2 H456 L468 26 H2 Z" class="top" />
        <rect x="8" y="26" width="454" height="132" rx="4" class="front" />
        <path d="M24 60 H446 M24 108 H446" class="groove" />
        <circle cx="235" cy="44" r="3.5" class="knob" /><circle cx="235" cy="88" r="3.5" class="knob" /><circle cx="235" cy="132" r="3.5" class="knob" />
        <path d="M150 6 H214 L220 20 H144 Z" class="sheet" />
        <path d="M156 10 H208 M154 15 H200" class="writing" />
      </svg>
      <div v-for="(pl, pi) in piles" :key="pi" class="pile" :style="{ left: `${pl.x}px`, top: `${pl.y}px` }">
        <i
          v-for="k in pl.n" :key="k" class="ps"
          :class="{ late: k > pl.base }"
          :style="{ bottom: `${(k - 1) * 9}px`, '--o': `${((k * 29 + pi * 7) % 9) - 4}px`, '--r': `${((k * 37 + pi * 11) % 7) - 3}deg`, '--t': `${0.9 + (k - pl.base) * 0.55 + pi * 0.2}s` }"
        />
      </div>
    </div>

    <div class="dayplan" :class="{ on: step >= 3 }">
      <div class="dp-head">
        <svg viewBox="0 0 40 40" class="clock">
          <circle cx="20" cy="20" r="17" /><line x1="20" y1="20" x2="20" y2="9" class="hand h1" /><line x1="20" y1="20" x2="28" y2="20" class="hand h2" /><circle cx="20" cy="20" r="2" class="pin" />
        </svg>
        <span>A doctor's working day</span>
      </div>
      <div class="dp-icons" :style="{ width: `${careShare}%` }">
        <svg v-for="k in 3" :key="k" viewBox="0 0 32 32" class="cicon" :class="`c${k}`">
          <template v-if="k === 1"><path d="M12 4 h8 v8 l7 13 a3 3 0 0 1 -3 4 h-16 a3 3 0 0 1 -3 -4 l7 -13 z" /><path d="M8 21 h16" /></template>
          <template v-else-if="k === 2"><path d="M16 27 C4 19 4 9 10 7 C13 6 15 8 16 10 C17 8 19 6 22 7 C28 9 28 19 16 27 Z" /><path d="M9 16 h4 l2 -3 l2 6 l2 -3 h4" /></template>
          <template v-else><circle cx="16" cy="10" r="5" /><path d="M6 28 q10 -14 20 0" /><path d="M16 17 v6 M13 20 h6" /></template>
        </svg>
      </div>
      <div class="dp-bar">
        <div class="seg care" :style="{ width: `${careShare}%` }" />
        <div class="seg paper" />
      </div>
      <div class="dp-legend">
        <span class="lg care"><i />Research and patient care</span>
        <span class="lg paper"><i />Paperwork</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 8; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .5s ease, transform .5s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .3s; }
.heading span:first-child { position: relative; }

.ground { position: absolute; left: 180px; right: 180px; top: 650px; height: 2px; background: linear-gradient(90deg, transparent, #D5DCE8 20%, #D5DCE8 80%, transparent); transition: opacity .6s; }
.ready:not(.focus) .ground { opacity: 0; }

.bar4 { position: absolute; left: 72px; top: 104px; width: 380px; transition: opacity .4s ease; }
.bar4 p { margin: 0 0 8px; font-size: 16px; font-weight: 500; color: var(--mist); }
.bar4 .track { height: 12px; border-radius: 6px; background: #E8EDF5; overflow: hidden; }
.bar4 .barfill { width: 90%; height: 100%; border-radius: 6px; background: linear-gradient(90deg, #1F5FD6, #4F8BF5); }
.links4 { position: absolute; inset: 0; width: 1280px; height: 720px; pointer-events: none; transition: opacity .3s ease; }
.links4 path { fill: none; stroke: #9DB8EC; stroke-width: 2.5; stroke-dasharray: 8 8; }
.label4 { position: absolute; width: 220px; margin: 0; text-align: center; font-size: 16px; font-weight: 600; color: var(--ink); transition: opacity .3s ease; }
.pi-tag4 { position: absolute; left: 340px; top: 661px; transform: translateX(-50%); white-space: nowrap; font-size: 17px; font-weight: 600; color: var(--ink); background: #FFFFFF; border: 2px solid #F47B20; border-radius: 999px; padding: 4px 14px; transition: opacity .3s ease; }
.out .bar4, .out .links4, .out .label4, .out .pi-tag4 { opacity: 0; }
.folder4 { position: absolute; left: 760px; top: 278px; width: 240px; height: 190px; z-index: 1; transform-origin: 50% 60%; transition: opacity .4s ease .55s, transform .5s ease .5s; }
.out .folder4 { opacity: 0; transform: scale(1.15); }
.folder4 svg { width: 100%; height: 100%; overflow: visible; }
.folder4 .back { fill: #FFC08F; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.folder4 .front { fill: #F47B20; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.folder4 .inner rect { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; }
.folder4 .inner line { stroke: #C9D2E0; stroke-width: 3; stroke-linecap: round; }
.flabel { font-family: var(--font-display); font-weight: 700; font-size: 22px; fill: #FFFFFF; }

.actor { position: absolute; left: 0; top: 0; width: 180px; height: 304px; transform-origin: 0 0; }

.doc { position: absolute; width: 262px; height: 330px; box-sizing: border-box; background: #FFFFFF; border: 2px solid #0B2A5B; border-radius: 14px;
  box-shadow: 0 8px 22px rgba(11, 42, 91, .08); z-index: 3;
  opacity: 0; transform: translate(var(--dx), var(--dy)) scale(.15) rotate(calc(var(--i) * 6deg - 9deg)); }
.out .doc { opacity: 1; transform: none; transition: opacity .25s ease calc(.5s + var(--i) * .1s), transform .9s cubic-bezier(.2, 1.15, .4, 1) calc(.5s + var(--i) * .1s); }
.focus .doc { opacity: 0; transform: translateY(80px) scale(.9); transition: opacity .5s ease calc(var(--i) * .05s), transform .7s ease-in calc(var(--i) * .05s); }
.doc header { display: flex; align-items: center; gap: 10px; padding: 12px 16px 0; font-size: 16px; font-weight: 700; line-height: 1.15; color: var(--ink); height: 50px; box-sizing: border-box; }
.doc .by { margin: 2px 16px 0; font-size: 13px; font-weight: 500; color: var(--mist); }
.dicon { width: 30px; height: 30px; flex: none; }
.paperbg { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 1.8; stroke-linejoin: round; }
.ln { stroke: #9DB0D3; stroke-width: 1.8; stroke-linecap: round; }
.clip { fill: #1F5FD6; }
.sign { fill: none; stroke: #F47B20; stroke-width: 1.8; stroke-linecap: round; }
.infoc { fill: #1F5FD6; }
.infoi { stroke: #FFFFFF; stroke-width: 2; stroke-linecap: round; }
.stampc { fill: none; stroke: #F47B20; stroke-width: 2; }

.tline { position: absolute; left: 18px; height: 8px; width: 0; border-radius: 4px; background: #DDE3EC; }
.ready .tline { width: calc(var(--w) * .82); transition: width .5s ease-out var(--t); }
.field { position: absolute; left: 12px; right: 12px; height: 28px; display: flex; align-items: center; padding: 0 8px; border-radius: 7px; box-sizing: border-box;
  font-size: 15px; font-weight: 600; color: var(--ink); white-space: nowrap; opacity: 0; border-left: 3px solid transparent;
  transition: background .4s ease, border-color .4s ease, color .4s ease; }
.ready .field { opacity: 1; transition: opacity .4s ease var(--t), background .4s ease, border-color .4s ease; }
.field.hl, .field.fixed { background: #E6EEFC; border-left-color: #1F5FD6; }
.field.edited { background: #E6EEFC; border-left-color: #1F5FD6; }
.field.edited .num { color: #F47B20; animation: typeIn .5s steps(3) .35s both; }
@keyframes typeIn { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
.field.warn { background: #FFEBDD; border-left-color: #F47B20; }
.field.warn .num { color: #C55A0E; background: #FFD3B0; border-radius: 4px; padding: 0 3px; animation: pulse 1s ease-in-out infinite alternate; }
@keyframes pulse { from { background: #FFD3B0; } to { background: #FFE6D2; } }
.field.fixed .num { color: #1F5FD6; animation: pop .4s cubic-bezier(.2, 1.6, .4, 1); }
@keyframes pop { from { transform: scale(.4); display: inline-block; } to { transform: scale(1); } }
.num { display: inline-block; font-weight: 800; }
.caret { width: 2px; height: 18px; margin-left: 2px; background: #F47B20; animation: caret .8s steps(1) infinite; }
@keyframes caret { 50% { opacity: 0; } }
.badge { margin-left: auto; width: 20px; height: 20px; border-radius: 50%; background: #F47B20; color: #FFFFFF; font-style: normal; font-size: 14px; font-weight: 800;
  display: grid; place-items: center; animation: pop .4s cubic-bezier(.2, 1.6, .4, 1) both; }
.check { margin-left: auto; width: 20px; height: 20px; border-radius: 50%; background: #1F5FD6; color: #FFFFFF; font-style: normal; font-size: 12px; font-weight: 800;
  display: grid; place-items: center; animation: pop .4s cubic-bezier(.2, 1.6, .4, 1) both; }
.hourglass { width: 16px; height: 20px; margin-left: 6px; animation: flip 1.6s ease-in-out infinite; }
.hourglass path { fill: none; stroke: #C55A0E; stroke-width: 1.8; stroke-linecap: round; }
.hourglass .sand { fill: #F47B20; stroke: none; }
@keyframes flip { 0%, 70% { transform: rotate(0); } 100% { transform: rotate(180deg); } }

.chain { position: absolute; inset: 0; width: 1280px; height: 720px; pointer-events: none; z-index: 4; }
.chain path { fill: none; stroke: #1F5FD6; stroke-width: 2.4; stroke-dasharray: 6 6; stroke-linecap: round; opacity: 0; transition: opacity .4s ease, stroke .4s ease; }
.chain path.hl { opacity: 1; animation: flow 1s linear infinite; }
.chain path.warn { opacity: 1; stroke: #F47B20; animation: flow .5s linear infinite; }
.focus .chain path { opacity: 0; }
@keyframes flow { to { stroke-dashoffset: -12; } }

.worry { position: absolute; display: flex; gap: 6px; padding: 8px 10px; background: #FFFFFF; border: 2px solid #0B2A5B; border-radius: 14px; z-index: 5;
  opacity: 0; transform: scale(.3); transform-origin: 0 100%; transition: opacity .25s ease, transform .4s cubic-bezier(.2, 1.5, .4, 1); }
.worry.on { opacity: 1; transform: none; transition-delay: var(--d); }
.worry .tail { position: absolute; left: -9px; bottom: -6px; width: 10px; height: 10px; border: 2px solid #0B2A5B; background: #FFFFFF; border-radius: 50%; }
.wicon { width: 26px; height: 26px; }
.wicon path, .wicon rect, .wicon circle { fill: none; stroke: #0B2A5B; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.worry.on .wicon:nth-child(2) { animation: jiggle 1.2s ease-in-out infinite; }
@keyframes jiggle { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-10deg); } 75% { transform: rotate(10deg); } }

.mail { position: absolute; left: -16px; top: -12px; z-index: 6; pointer-events: none; animation: mailX .75s cubic-bezier(.45, 0, .55, 1) both; }
@keyframes mailX { from { transform: translate(var(--x0), var(--y0)); opacity: 1; } 90% { opacity: 1; } to { transform: translate(var(--x1), var(--y1)); opacity: 0; } }
.mail .arc { animation: mailY .75s cubic-bezier(.3, 0, .7, 1) both; }
@keyframes mailY { 0% { transform: translateY(0); } 50% { transform: translateY(-70px); } 100% { transform: translateY(0); } }
.mail svg { width: 32px; height: 23px; }
.mail rect { fill: #FFFFFF; stroke: #1F5FD6; stroke-width: 2; }
.mail path { fill: none; stroke: #1F5FD6; stroke-width: 2; stroke-linejoin: round; }

.days { position: absolute; left: 50%; top: 596px; display: flex; align-items: center; gap: 10px; padding: 8px 18px; background: #FFFFFF; border: 2px solid #0B2A5B; border-radius: 999px;
  font-family: var(--font-display); font-size: 24px; font-weight: 600; color: var(--ink); z-index: 5;
  opacity: 0; transform: translate(-50%, 12px); transition: opacity .4s ease, transform .4s ease; }
.days.on { opacity: 1; transform: translate(-50%, 0); }
.days b { display: inline-block; min-width: 1ch; color: #F47B20; animation: pop .45s cubic-bezier(.2, 1.6, .4, 1); }
.days { transition: opacity .4s ease, transform .55s cubic-bezier(.2, 1.5, .4, 1), background .4s ease, color .4s ease, border-color .4s ease; }

.days .ring { position: absolute; inset: -2px; border-radius: 999px; border: 2px solid #F47B20; opacity: 0; pointer-events: none; }
.days.on .ring { animation: dayRing .7s ease-out; }
@keyframes dayRing { from { opacity: .9; transform: scale(1); } to { opacity: 0; transform: scale(1.45, 1.9); } }

.days.final { transform: translate(-50%, 0) scale(1.7); background: #F47B20; border-color: #F47B20; color: #FFFFFF; animation: daysShake .5s ease .5s; }
.days.final b { color: #FFFFFF; }
.days.final .cal rect, .days.final .cal path { stroke: #FFFFFF; }
@keyframes daysShake { 0%, 100% { rotate: 0deg; } 25% { rotate: -4deg; } 75% { rotate: 4deg; } }
.days .page { position: absolute; left: 14px; top: 6px; width: 18px; height: 20px; opacity: 0; pointer-events: none; }
.days .page rect { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 1.5; }
.days .page path { stroke: #F47B20; stroke-width: 2; }
.days.final .page { animation: pageFly 1.1s cubic-bezier(.2, .6, .4, 1) calc(.15s + var(--k) * .12s) both; }
@keyframes pageFly {
  0% { opacity: 1; transform: translate(0, 0) rotate(0); }
  100% { opacity: 0; transform: translate(calc(-60px + var(--k) * 30px), -70px) rotate(calc(var(--k) * 40deg - 100deg)); }
}
.days-note { position: absolute; left: 0; right: 0; top: 678px; margin: 0; text-align: center; font-family: var(--font-display); font-size: 22px; font-weight: 600; color: #C55A0E;
  opacity: 0; transform: translateY(8px); transition: opacity .4s ease .45s, transform .4s ease .45s; z-index: 5; }
.days-note.on { opacity: 1; transform: none; }
.illustrative { position: absolute; right: 89px; top: 606px; padding: 6px 14px; border: 2px dashed #F47B20; border-radius: 10px; background: #FFF6EE;
  font-size: 18px; font-weight: 700; color: #C55A0E; z-index: 5; opacity: 0; transition: opacity .4s ease; }
.illustrative.on { opacity: 1; }
.cal { width: 24px; height: 24px; }
.cal rect, .cal path { fill: none; stroke: #0B2A5B; stroke-width: 2; stroke-linecap: round; }

.desk-scene { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .5s ease .4s; }
.desk-scene.on { opacity: 1; }
.chair { position: absolute; left: 236px; top: 374px; width: 110px; height: 150px; z-index: 5; }
.chair rect { fill: #1F5FD6; stroke: #0B2A5B; stroke-width: 3; }
.chair .pad { fill: #4F8BF5; stroke: none; }
.desk { position: absolute; left: 96px; top: 488px; width: 470px; height: 170px; z-index: 7; overflow: visible; }
.desk .top { fill: #E9EEF6; stroke: #0B2A5B; stroke-width: 3; stroke-linejoin: round; }
.desk .front { fill: #F7F9FD; stroke: #0B2A5B; stroke-width: 3; }
.desk .groove { stroke: #D5DCE8; stroke-width: 2; }
.desk .knob { fill: #0B2A5B; }
.desk .sheet { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 1.6; stroke-linejoin: round; }
.desk .writing { fill: none; stroke: #9DB0D3; stroke-width: 1.6; stroke-linecap: round; }
.pile { position: absolute; width: 90px; z-index: 8; }
.ps { position: absolute; left: var(--o); width: 84px; height: 9px; box-sizing: border-box; background: #FFFFFF; border: 2px solid #0B2A5B; border-radius: 2px; transform: rotate(var(--r)); }
.ps.late { opacity: 0; }
.desk-scene.on .ps.late { animation: psDrop .5s cubic-bezier(.5, 0, .8, .5) var(--t) forwards; }
@keyframes psDrop { 0% { opacity: 1; transform: translateY(-420px) rotate(calc(var(--r) * 6)); } 85% { opacity: 1; transform: translateY(3px) rotate(var(--r)); } 100% { opacity: 1; transform: rotate(var(--r)); } }

.dayplan { position: absolute; left: 640px; top: 250px; width: 560px; z-index: 5; opacity: 0; transform: translateX(40px); transition: opacity .5s ease .5s, transform .6s ease .5s; }
.dayplan.on { opacity: 1; transform: none; }
.dp-head { display: flex; align-items: center; gap: 12px; font-family: var(--font-display); font-size: 26px; font-weight: 600; color: var(--ink); margin-bottom: 14px; }
.clock { width: 40px; height: 40px; }
.clock circle { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2.5; }
.clock .pin { fill: #0B2A5B; stroke: none; }
.hand { stroke: #F47B20; stroke-width: 2.5; stroke-linecap: round; transform-origin: 20px 20px; }
.dayplan.on .h1 { animation: spin 1.6s linear infinite; }
.dayplan.on .h2 { animation: spin .4s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.dp-icons { display: flex; justify-content: center; gap: 28px; height: 44px; margin-bottom: 8px; transition: width 2.6s cubic-bezier(.4, 0, .3, 1) 1s; }
.cicon { width: 38px; height: 38px; }
.cicon path, .cicon circle { fill: none; stroke: #1F5FD6; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.dayplan.on .c3 { animation: vanish .5s ease 1.7s forwards; }
.dayplan.on .c2 { animation: vanish .5s ease 2.5s forwards; }
@keyframes vanish { to { opacity: .12; transform: scale(.7); } }
.dp-bar { display: flex; height: 64px; border-radius: 14px; overflow: hidden; border: 2px solid #0B2A5B; }
.seg { display: flex; align-items: center; padding: 0 18px; box-sizing: border-box; font-size: 18px; font-weight: 600; white-space: nowrap; overflow: hidden; }
.seg.care { background: #1F5FD6; color: #FFFFFF; transition: width 2.6s cubic-bezier(.4, 0, .3, 1) 1s; }
.seg.paper { flex: 1; background: #F47B20; color: #FFFFFF; justify-content: flex-end; }
.dp-legend { display: flex; justify-content: space-between; margin-top: 12px; font-size: 18px; font-weight: 600; }
.lg { display: flex; align-items: center; gap: 8px; }
.lg i { width: 14px; height: 14px; border-radius: 4px; }
.lg.care { color: #1F5FD6; } .lg.care i { background: #1F5FD6; }
.lg.paper { color: #C55A0E; } .lg.paper i { background: #F47B20; }
</style>
