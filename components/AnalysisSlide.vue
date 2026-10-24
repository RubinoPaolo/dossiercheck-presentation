<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const props = defineProps<{ frozen?: boolean }>()
const idp = props.frozen ? 'd8f' : 'd8'
const { $clicks } = useSlideContext()
const step = computed(() => props.frozen ? 4 : unref($clicks) as number)

const active = useIsSlideActive()
const phase = ref(0)
const jump = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }
function jumpNow() {
  jump.value = true
  nextTick(() => requestAnimationFrame(() => requestAnimationFrame(() => { jump.value = false })))
}
watch(active, (a) => {
  clearTimers()
  if (props.frozen) { phase.value = 4; return }
  if (!a) { phase.value = 0; return }
  if (step.value > 0) { jumpNow(); phase.value = 4; return }
  phase.value = 0
  later(500, () => { phase.value = 1 })
  later(1100, () => { phase.value = 2 })
  later(1900, () => { phase.value = 3 })
  later(2700, () => { phase.value = 4 })
}, { immediate: true })

const team = [
  { id: 'pi', x: 60, y: 420, cfg: {} },
  { id: 'coord', x: 168, y: 430, cfg: { outfit: 'sweater', outfitColor: '#1F5FD6', hair: 'long', hairColor: '#4A2E1F', skin: '#C68B62', glasses: false } },
  { id: 'team', x: 276, y: 420, cfg: { outfit: 'coat', hair: 'short', hairColor: '#6B3E26', skin: '#E0AC85', glasses: false } },
] as const
const office = { x: 930, y: 420, cfg: { outfit: 'sweater', outfitColor: '#F47B20', hair: 'bun', hairColor: '#1E1E2A', skin: '#F1C9A5', glasses: true } }
const rows = [
  { name: 'Protocol', v: 2, by: 'pi' },
  { name: 'Consent form', v: 1, by: 'coord' },
  { name: 'Information sheet', v: 1, by: 'team' },
]

const conds = [
  { t: 'Interventional study', v: true },
  { t: 'Biological samples', v: true },
  { t: 'Minors involved', v: false },
]
const reqs = [
  { t: 'Protocol', ok: true },
  { t: 'Participant information and consent', ok: true },
  { t: 'Biological sample identified', ok: true },
  { t: 'Insurance certificate', ok: true },
  { t: 'Consent for minors', ok: false },
]

const EYE = { x: 720, y: 282 }
const types = {
  guide: 'Guideline issue',
  incon: 'Inconsistency',
  miss: 'Missing information',
} as const
const short = { guide: 'Guidelines', incon: 'Inconsistencies', miss: 'Missing info' } as const
type T = keyof typeof types
const findings: { type: T, title: string, docs: string }[] = [
  { type: 'guide', title: 'Data protection section missing', docs: 'Consent form' },
  { type: 'incon', title: 'Study duration: 12 months vs 18 months', docs: 'Protocol · Information sheet' },
  { type: 'miss', title: 'Blood sample: sample type not stated', docs: 'Protocol' },
  { type: 'incon', title: 'Number of visits: 6 vs 5', docs: 'Protocol · Information sheet' },
  { type: 'miss', title: 'Signature and date fields left blank', docs: 'Consent form' },
]
const REPORT = { x: 900, y: 110 }
const ROW0 = 100, ROW_H = 70
const EXPAND = 1

const beltOn = ref(false)
const shown = ref(0)
const sparks = ref<{ id: number, k: number }[]>([])
let sid = 0
const seq: ReturnType<typeof setTimeout>[] = []
const at = (ms: number, fn: () => void) => seq.push(setTimeout(fn, ms))
watch([step, active], ([s, a0], old) => {
  const a = a0 || props.frozen
  seq.splice(0).forEach(clearTimeout)
  sparks.value = []
  const prev = old?.[0]
  if (!a) { beltOn.value = false; shown.value = 0; return }
  const fresh = prev === s - 1 && !jump.value

  if (s === 2 || s === 3) {
    if (s === 2 && fresh) at(2300, () => { beltOn.value = true })
    else beltOn.value = true
  }
  else beltOn.value = false

  if (s < 3) { shown.value = 0; return }
  if (s === 3 && fresh) {
    shown.value = 0
    findings.forEach((_, k) => {
      at(500 + k * 850, () => { sparks.value.push({ id: ++sid, k }) })
      at(1100 + k * 850, () => { shown.value = k + 1 })
    })
  }
  else shown.value = findings.length
}, { immediate: true })
onBeforeUnmount(() => { clearTimers(); seq.forEach(clearTimeout) })

const counts = computed(() => {
  const c: Record<T, number> = { guide: 0, incon: 0, miss: 0 }
  findings.slice(0, shown.value).forEach(f => c[f.type]++)
  return c
})
function sparkStyle(k: number) {
  const tx = REPORT.x + 40, ty = REPORT.y + ROW0 + k * ROW_H + 26
  return { '--dx': `${tx - EYE.x}px`, '--dy': `${ty - EYE.y}px`, left: `${EYE.x - 6}px`, top: `${EYE.y - 6}px` }
}
</script>

<template>
  <div class="stage" :class="[`p${phase}`, { s1: step >= 1, s2: step >= 2, s3: step >= 3, s4: step >= 4, jump, fz: frozen, belton: beltOn }]">
    <h2 class="display heading">
      <span :class="{ on: phase === 0 }">A Shared Workspace</span>
      <span :class="{ on: phase >= 1 }">Automatic Analysis</span>
    </h2>

    <div class="ground2" />
    <div v-for="(t, k) in team" :key="t.id" class="who left" :style="{ left: `${t.x}px`, top: `${t.y}px`, '--k': `${k * 0.06}s` }">
      <Person v-bind="t.cfg" pose="rest" mood="happy" :uid="`d8-${t.id}`" :phase="k * 0.5" />
    </div>
    <div class="who right" :style="{ left: `${office.x}px`, top: `${office.y}px`, '--k': '0s' }">
      <div class="mirror"><Person v-bind="office.cfg" pose="rest" mood="neutral" uid="d8-office" /></div>
    </div>
    <p class="glabel" style="left: 60px; width: 328px"><b>Research team</b><span>prepares the dossier</span></p>
    <p class="glabel" style="left: 880px; width: 212px"><b>Clinical Trials Office</b><span>internal review</span></p>

    <div class="panel">
      <div class="phead"><span class="ws">Study workspace</span></div>
      <p class="plabel docs">Documents</p>
      <p class="plabel prev">Preview</p>
      <div class="list">
        <div v-for="(r, k) in rows" :key="r.name" class="row" :class="`by-${r.by}`" :style="{ top: `${96 + k * 54}px`, '--k': `${k * 0.25}s` }">
          <svg viewBox="0 0 24 30" class="ricon"><path d="M2 2 H16 L22 8 V28 H2 Z" /><path d="M6 13 h12 M6 18 h12 M6 23 h8" class="rl" /></svg>
          <span class="rname">{{ r.name }}</span>
          <span class="ver" :class="{ v2: r.v === 2 }">v{{ r.v }}</span>
          <i class="dotby" />
          <svg viewBox="0 0 20 20" class="idok"><circle cx="10" cy="10" r="9" /><path d="M5.5 10.5 l3 3 l6 -7" /></svg>
        </div>
        <div class="drop-hint" :style="{ top: `${96 + 3 * 54}px` }">Upload files</div>
      </div>
      <p class="plabel mlabel">Messages</p>
      <div class="msgs">
        <div class="msg office"><b>Office</b>Protocol v2 received. Is the PI's CV coming too?</div>
        <div class="msg pi"><b>PI</b>Uploading it today.</div>
      </div>
      <div class="pv">
        <div class="pvpage">
          <p class="pvt">Protocol <b>v2</b></p>
          <i v-for="n in 9" :key="n" class="pvl" :style="{ width: `${[92, 80, 88, 60, 90, 84, 72, 88, 50][n - 1]}%` }" />
        </div>
        <svg viewBox="0 0 40 24" class="eye"><path d="M2 12 Q20 -6 38 12 Q20 30 2 12 Z" /><circle cx="20" cy="12" r="5" /></svg>
        <span class="viewed">Viewed by the office</span>
      </div>
      <button class="run"><svg viewBox="0 0 12 12"><path d="M3 1.5 L10 6 L3 10.5 Z" /></svg><span class="rlab"><span class="rl1">Run analysis</span><span class="rl2">Analysis running</span></span></button>
      <p class="dlabel">Dossier</p>
    </div>
    <div class="logo"><img src="/dossiercheck-logo.png" alt="DossierCheck"></div>

    <div class="setup">
      <div class="col cg">
        <p class="colh">Guidelines</p>
        <div class="gdoc"><i /><i /><i /><i /><i /><i /></div>
        <p class="gname">Official checklist<span>v. 2024</span></p>
      </div>
      <span class="op">+</span>
      <div class="col cc">
        <p class="colh">Study conditions</p>
        <div v-for="(c, k) in conds" :key="c.t" class="cpill" :class="{ yes: c.v }" :style="{ '--k': `${0.55 + k * 0.1}s` }">
          <span>{{ c.t }}</span><b>{{ c.v ? 'yes' : 'no' }}</b>
        </div>
        <span class="sysTag proposed"><i class="sysI" />Proposed by DossierCheck</span>
        <span class="stamp"><svg viewBox="0 0 12 12"><path d="M2.5 6.3 l2.4 2.4 l4.8 -5.2" /></svg>Confirmed by the team</span>
      </div>
      <span class="op">→</span>
      <div class="col cr">
        <p class="colh">Applicable requirements</p>
        <div v-for="(r, k) in reqs" :key="r.t" class="req" :class="{ na: !r.ok }" :style="{ '--k': `${1.35 + k * 0.09}s` }">
          <i class="rb"><svg viewBox="0 0 10 10"><path d="M2 5.2 l2 2 l4 -4.6" /></svg></i><span>{{ r.t }}</span><em v-if="!r.ok">N/A</em>
        </div>
        <p class="reqFoot"><b>4 of 5 apply</b><span class="sysTag found"><i class="sysI" />Recognised automatically</span></p>
      </div>
      <i class="scanbar sb1" /><i class="scanbar sb2" />
    </div>

    <div class="strip">
      <span><b>Checklist</b> v. 2024</span><i />
      <span>Conditions <b>confirmed</b></span><i />
      <span><b>4 requirements</b> apply</span>
    </div>
    <div v-for="k in 4" :key="`chip${k}`" class="chip" :style="{ left: `${690 + (k - 1) * 30}px`, top: `${150 + (k - 1) * 24}px`, '--k': `${2.6 + k * 0.1}s`, '--tx': `${20 - (k - 1) * 30}px`, '--ty': `${330 - (k - 1) * 24}px` }"><svg viewBox="0 0 30 38"><path d="M2 2 H20 L28 10 V36 H2 Z" class="cp" /><path d="M20 2 V10 H28" class="cf" /><path d="M7 15 h16 M7 20 h16 M7 25 h10" class="cl" /><circle cx="22" cy="30" r="5.5" class="cc" /><path d="M19.6 30.2 l1.7 1.7 l3.1 -3.4" class="ck2" /></svg></div>

    <div class="bay"><span>Analysis engine</span></div>
    <svg viewBox="0 0 320 400" class="mecha">

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
        <rect x="58" y="148" width="34" height="62" rx="10" class="orange dk" />
        <path d="M52 206 H98 L94 268 H56 Z" class="orange" /><path d="M62 222 h26 M62 234 h26 M62 246 h18" class="plate" />
        <rect x="58" y="266" width="36" height="28" rx="8" class="navy" />
        <path d="M46 132 Q46 100 80 98 Q112 98 116 124 L110 156 Q84 168 52 158 Z" class="orange" /><path d="M58 126 Q80 112 104 124" class="hl w" />
      </g>
      <g class="part armr">
        <path d="M250 58 L226 50 L218 140 L244 150 Z" class="orange dk" />
        <rect x="228" y="148" width="34" height="62" rx="10" class="orange dk" />
        <path d="M222 206 H268 L264 268 H226 Z" class="orange" /><path d="M232 222 h26 M232 234 h26 M232 246 h18" class="plate" />
        <rect x="226" y="266" width="36" height="28" rx="8" class="navy" />
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
          <text y="23" text-anchor="middle" class="htag">GPT-4o</text>
        </g>
      </g>
    </svg>
    <div class="callouts">
      <p class="co c-head" style="top: 266px"><i class="sw-gold" />Output checks</p>
      <p class="co c-arm" style="top: 330px"><i class="sw-orange" />Requirements</p>
      <p class="co c-core" style="top: 398px"><i class="sw-core" />GPT-4o core</p>
      <p class="co c-leg" style="top: 466px"><i class="sw-blue" />Rules</p>
      <svg viewBox="0 0 1280 720" class="leaders">
        <path d="M548 278 H690" /><path d="M548 342 H612" /><path d="M548 410 H690" /><path d="M548 478 H600 L684 560" />
      </svg>
    </div>

    <div class="belt">
      <div class="band" />
      <i v-for="k in 12" :key="k" class="roller" :style="{ left: `${(k - 1) * 50 + 8}px` }" />
    </div>
    <div class="cargo">
      <div v-for="k in 5" :key="k" class="bdoc" :style="{ '--k': `${(k - 1) * -1.2}s` }"><i /><i /><i /><i /></div>
    </div>

    <svg viewBox="0 0 1280 720" class="laser">
      <defs>
        <linearGradient :id="`${idp}-laser`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#4FB8FF" stop-opacity=".55" />
          <stop offset="1" stop-color="#4FB8FF" stop-opacity=".16" />
        </linearGradient>
      </defs>
      <polygon :points="`${EYE.x - 14},${EYE.y} ${EYE.x + 14},${EYE.y} 800,604 610,604`" :fill="`url(#${idp}-laser)`" class="cone" />
      <rect x="606" y="560" width="6" height="48" rx="3" class="sweepl" />
    </svg>

    <div class="report">
      <div class="rhead"><span class="rtitle">Analysis report</span><span class="rcount">{{ shown }} findings</span></div>
      <div class="counters">
        <span v-for="(label, t) in types" :key="t" class="cnt" :class="`t-${t}`"><i />{{ short[t] }}<b :key="counts[t]">{{ counts[t] }}</b></span>
      </div>
      <div class="flist">
        <div v-for="(f, k) in findings" :key="f.title" class="frow" :class="[`t-${f.type}`, { on: k < shown, pick: k === EXPAND }]" :style="{ top: `${ROW0 + k * ROW_H}px`, '--away': k < EXPAND ? '-90px' : '320px' }">
          <span class="lbl">{{ types[f.type] }}</span>
          <p class="ft">{{ f.title }}</p>
                  </div>
      </div>

      <div class="fx" :style="{ '--y0': `${ROW0 + EXPAND * ROW_H - 48}px` }">
        <div class="fxin">
          <p class="r" style="--r: .25s"><span class="lbl t-incon">Inconsistency</span><span class="fail">Fail</span></p>
          <p class="fxt r" style="--r: .35s">Study duration differs between documents</p>
          <p class="fxd r" style="--r: .45s"><span>Protocol · p. 4</span><span>Information sheet · p. 2</span></p>
          <p class="fh r" style="--r: .6s">Explanation</p>
          <p class="fxx r" style="--r: .7s">The two documents describe the same study period with different durations.</p>
          <p class="fh r" style="--r: .9s">Evidence</p>
          <blockquote class="ev r" style="--r: 1s"><b>Protocol, p. 4</b>“…each participant will be followed for <mark>12 months</mark> after enrolment…”</blockquote>
          <blockquote class="ev r" style="--r: 1.15s"><b>Information sheet, p. 2</b>“…your participation in the study will last <mark>18 months</mark>…”</blockquote>
          <p class="fdec r" style="--r: 1.35s">Reviewer decision <span>to be assessed</span></p>
        </div>
      </div>
    </div>
    <div v-for="sp in sparks" :key="sp.id" class="spark" :style="sparkStyle(sp.k)" />
    <p class="illus">Illustrative example</p>
    <p class="resp">The verification of reports and the scientific, ethical, and clinical decisions remain the responsibility of the individuals in charge.</p>
  </div>
</template>

<style scoped>
.jump, .jump * { transition: none !important; }
.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 9; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .5s ease, transform .5s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .3s; }
.heading span:first-child { position: relative; }

.ground2 { position: absolute; left: 40px; right: 40px; top: 603px; height: 2px; background: linear-gradient(90deg, transparent, #D5DCE8 15%, #D5DCE8 85%, transparent); transition: opacity .5s ease; }
.who { position: absolute; width: 112px; height: 189px; z-index: 6; transition: opacity .4s ease var(--k), transform .7s cubic-bezier(.5, 0, .7, .4) var(--k); }
.mirror { width: 100%; height: 100%; transform: scaleX(-1); }
.glabel { position: absolute; top: 614px; margin: 0; text-align: center; transition: opacity .4s ease; }
.glabel b { display: block; font-family: var(--font-display); font-size: 19px; color: var(--ink); }
.glabel span { font-size: 14px; color: var(--mist); }
.stage:not(.p0) .who.left { opacity: 0; transform: translateX(-360px); }
.stage:not(.p0) .who.right { opacity: 0; transform: translateX(380px); }
.stage:not(.p0) .glabel, .stage:not(.p0) .ground2 { opacity: 0; }

.panel { position: absolute; left: 400px; top: 140px; width: 480px; height: 456px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 18px; background: #FFFFFF;
  box-shadow: 0 14px 34px rgba(11, 42, 91, .1); z-index: 4; transition: left .8s cubic-bezier(.6, 0, .3, 1), top .8s cubic-bezier(.6, 0, .3, 1), width .8s cubic-bezier(.6, 0, .3, 1), height .8s cubic-bezier(.6, 0, .3, 1); }
.p2 .panel, .p3 .panel, .p4 .panel { left: 40px; top: 112px; width: 262px; height: 500px; }
.phead { position: absolute; left: 0; right: 0; top: 0; height: 56px; border-bottom: 2px solid #E1E6EF; display: flex; align-items: center; justify-content: flex-end; padding-right: 16px; }
.ws { font-size: 14px; font-weight: 700; color: #1F5FD6; background: #EEF4FF; border-radius: 999px; padding: 5px 12px; transition: opacity .3s ease; }
.stage:not(.p0) .ws { opacity: 0; }
.plabel { position: absolute; top: 64px; margin: 0; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--mist); transition: opacity .3s ease; }
.plabel.docs { left: 16px; } .plabel.prev { left: 252px; }
.stage:not(.p0) .plabel.prev { opacity: 0; }
.stage:not(.p0):not(.p1) .plabel.docs { opacity: 0; }
.list { position: absolute; left: 14px; top: 0; width: 230px; height: 100%; }
.row { position: absolute; left: 0; width: 230px; height: 46px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 10px; background: #FFFFFF;
  display: flex; align-items: center; gap: 8px; padding: 0 10px; transition: width .6s cubic-bezier(.5, 0, .3, 1); }
.p0 .row, .p1 .row, .p0 .drop-hint { width: 222px; }
.ricon { width: 20px; height: 26px; flex: none; }
.ricon path { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.ricon .rl { stroke: #B4C2DA; stroke-linecap: round; }
.rname { flex: 1; font-size: 14px; font-weight: 600; color: var(--ink); white-space: nowrap; }
.ver { font-size: 12px; font-weight: 800; color: #1F5FD6; background: #EEF4FF; border-radius: 6px; padding: 2px 7px; }
.ver.v2 { color: #FFFFFF; background: #F47B20; }
.dotby { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.by-pi .dotby { background: #0B2A5B; } .by-coord .dotby { background: #1F5FD6; } .by-team .dotby { background: #6B3E26; }
.idok { position: absolute; right: -9px; top: -9px; width: 20px; height: 20px; opacity: 0; transform: scale(.3); transition: opacity .25s ease, transform .35s cubic-bezier(.2, 1.8, .4, 1); }
.idok circle { fill: #1F5FD6; } .idok path { fill: none; stroke: #FFFFFF; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.p3 .idok, .p4 .idok { opacity: 1; transform: none; transition-delay: calc(.35s + var(--k)); }
.p3 .row { animation: idscan .5s ease calc(.3s + var(--k)); }
@keyframes idscan { 50% { background: #EEF4FF; border-color: #1F5FD6; } }
.drop-hint { position: absolute; left: 0; width: 230px; height: 40px; box-sizing: border-box; border: 2px dashed #B4BFD2; border-radius: 10px; display: grid; place-items: center; font-size: 13px; font-weight: 600; color: var(--mist); transition: opacity .3s ease; }
.stage:not(.p0) .drop-hint { opacity: 0; }
.mlabel { left: 16px; top: 308px; }
.msgs { position: absolute; left: 14px; top: 326px; width: 222px; height: 112px; box-sizing: border-box; border-top: 2px solid #E1E6EF; transition: opacity .3s ease; }
.stage:not(.p0) .mlabel, .stage:not(.p0) .msgs { opacity: 0; }
.msg { position: absolute; max-width: 186px; box-sizing: border-box; padding: 4px 9px 5px; border-radius: 10px; font-size: 12.5px; line-height: 1.22; font-weight: 500; color: var(--ink); }
.msg b { display: block; font-size: 10.5px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; margin-bottom: 1px; }
.msg.office { right: 0; top: 7px; background: #FFF1E6; border: 1.5px solid #F47B20; border-bottom-right-radius: 3px; }
.msg.office b { color: #C55A0E; }
.msg.pi { left: 0; top: 68px; background: #EEF4FF; border: 1.5px solid #1F5FD6; border-bottom-left-radius: 3px; }
.msg.pi b { color: #1F5FD6; }
.pv { position: absolute; left: 252px; top: 88px; width: 212px; height: 350px; transition: opacity .3s ease; }
.stage:not(.p0) .pv { opacity: 0; }
.pvpage { position: absolute; inset: 0 0 34px 0; border: 2px solid #0B2A5B; border-radius: 10px; background: #FFFFFF; padding: 14px 14px 0; box-sizing: border-box; }
.pvt { margin: 0 0 12px; font-size: 15px; font-weight: 700; color: var(--ink); }
.pvt b { color: #F47B20; }
.pvl { display: block; height: 7px; border-radius: 4px; background: #DDE3EC; margin-bottom: 13px; }
.eye { position: absolute; right: -8px; top: -12px; width: 40px; height: 24px; background: #FFFFFF; border-radius: 12px; padding: 4px; box-shadow: 0 4px 10px rgba(11, 42, 91, .12); }
.eye path { fill: #FFFFFF; stroke: #1F5FD6; stroke-width: 2.4; stroke-linejoin: round; }
.eye circle { fill: #1F5FD6; }
.viewed { position: absolute; left: 0; right: 0; bottom: 0; text-align: center; font-size: 13px; font-weight: 700; color: #C55A0E; }
.run { position: absolute; left: 14px; right: 14px; bottom: 16px; height: 46px; border: 0; border-radius: 12px; background: #1F5FD6; color: #FFFFFF; font: 700 16px var(--font-body, inherit);
  display: flex; align-items: center; justify-content: center; gap: 8px; opacity: 0; transform: translateY(10px); transition: opacity .3s ease .5s, transform .3s ease .5s, background .3s ease; }
.run svg { width: 12px; height: 12px; } .run path { fill: #FFFFFF; }
.rlab { display: grid; } .rlab span { grid-area: 1 / 1; text-align: center; }
.rl2 { opacity: 0; }
.p2 .run, .p3 .run, .p4 .run { opacity: 1; transform: none; }
.s1 .run { animation: press .4s ease 2.15s; background: #0B2A5B; transition-delay: 0s, 0s, 2.3s; }
.s1 .rl1 { opacity: 0; transition: opacity .2s ease 2.3s; }
.s1 .rl2 { opacity: 1; transition: opacity .2s ease 2.4s; }
.s2 .run { animation: none; }
@keyframes press { 40% { transform: scale(.92); } }
.dlabel { position: absolute; left: 16px; top: 64px; margin: 0; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #1F5FD6; opacity: 0; transition: opacity .3s ease .6s; }
.p2 .dlabel, .p3 .dlabel, .p4 .dlabel { opacity: 1; }
.logo { position: absolute; left: 416px; top: 156px; width: 160px; z-index: 5; transition: left .8s cubic-bezier(.6, 0, .3, 1), top .8s cubic-bezier(.6, 0, .3, 1); }
.logo img { display: block; width: 100%; }
.p2 .logo, .p3 .logo, .p4 .logo { left: 56px; top: 128px; }

.setup { position: absolute; left: 322px; top: 96px; width: 550px; height: 236px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 14px; background: #FFFFFF; padding: 12px 14px; z-index: 9;
  display: flex; align-items: flex-start; gap: 6px; overflow: hidden;
  box-shadow: 0 12px 30px rgba(11, 42, 91, .1); opacity: 0; transform: translateY(-14px); transition: opacity .35s ease, transform .45s cubic-bezier(.2, 1.3, .4, 1); }
.s1 .setup { opacity: 1; transform: none; animation: collapse .4s cubic-bezier(.5, 0, .7, .4) 2.55s forwards; }
.stage.s2 .setup { animation: none; opacity: 0; transition: none; }
@keyframes collapse { to { opacity: 0; transform: translateY(-50px) scale(.85); } }
.col { display: flex; flex-direction: column; }
.cg { width: 92px; align-items: center; } .cc { width: 176px; } .cr { width: 214px; }
.colh { margin: 0 0 10px; font-size: 11px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--mist); white-space: nowrap; align-self: stretch; }
.cg .colh { text-align: center; }
.op { align-self: center; margin-top: 10px; font-family: var(--font-display); font-size: 24px; font-weight: 800; color: #B4BFD2; }
.gdoc { width: 62px; height: 80px; box-sizing: border-box; border: 2.5px solid #0B2A5B; border-radius: 5px; background: #FFFFFF; padding: 12px 9px 0; box-shadow: 4px 4px 0 #E1E6EF; }
.gdoc i { display: block; height: 4px; border-radius: 2px; background: #B4C2DA; margin-bottom: 6px; }
.gdoc i:nth-child(2n) { width: 70%; }
.gname { margin: 10px 0 0; text-align: center; font-size: 12.5px; font-weight: 700; color: var(--ink); line-height: 1.2; }
.gname span { display: block; font-size: 11px; color: var(--mist); }
.cpill { display: flex; align-items: center; justify-content: space-between; gap: 8px; white-space: nowrap; height: 28px; margin-bottom: 6px; padding: 0 10px; box-sizing: border-box; border: 1.5px dashed #C9D2E0; border-radius: 8px;
  font-size: 12px; font-weight: 600; color: #9AA4B8; transition: border-color .25s ease var(--k), background .25s ease var(--k), color .25s ease var(--k); }
.cpill b { font-size: 12px; opacity: 0; transition: opacity .2s ease var(--k); }
.s1 .cpill { border: 1.5px solid #C9D2E0; color: var(--ink); background: #F7F9FD; }
.s1 .cpill b { opacity: 1; color: var(--mist); }
.s1 .cpill.yes { border-color: #1F5FD6; background: #EEF4FF; }
.s1 .cpill.yes b { color: #1F5FD6; }
.sysTag { display: inline-flex; align-self: flex-start; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; color: #1F5FD6; background: #EEF4FF; border-radius: 999px; padding: 2px 8px 2px 4px; white-space: nowrap;
  opacity: 0; transform: scale(.7); transition: opacity .25s ease, transform .3s cubic-bezier(.2, 1.6, .4, 1); }
.sysI { width: 12px; height: 12px; border-radius: 3px; background: linear-gradient(135deg, #0B2A5B 0 55%, #C49A3E 55%); }
.s1 .proposed { opacity: 1; transform: none; transition-delay: .9s; }
.stamp { display: inline-flex; align-self: flex-start; align-items: center; gap: 5px; margin-top: 8px; white-space: nowrap; font-size: 11.5px; font-weight: 800; color: #0B2A5B; border: 2px solid #0B2A5B; border-radius: 8px; padding: 3px 8px;
  opacity: 0; transform: scale(1.6) rotate(-6deg); transition: opacity .15s ease, transform .3s cubic-bezier(.3, 1.5, .5, 1); }
.stamp svg { width: 12px; height: 12px; } .stamp path { fill: none; stroke: #0B2A5B; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.s1 .stamp { opacity: 1; transform: rotate(-3deg); transition-delay: 1.1s; }
.req { display: flex; align-items: center; gap: 6px; height: 24px; font-size: 11.5px; font-weight: 600; color: #9AA4B8; white-space: nowrap; transition: color .25s ease var(--k), opacity .25s ease var(--k); }
.rb { width: 14px; height: 14px; border-radius: 4px; border: 2px solid #C9D2E0; box-sizing: border-box; flex: none; display: grid; place-items: center; transition: background .25s ease var(--k), border-color .25s ease var(--k); }
.rb svg { width: 10px; height: 10px; opacity: 0; transition: opacity .2s ease var(--k); } .rb path { fill: none; stroke: #FFFFFF; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.req em { margin-left: auto; font-style: normal; font-size: 10px; font-weight: 800; color: var(--mist); background: #EEF2F8; border-radius: 4px; padding: 0 5px; opacity: 0; transition: opacity .25s ease var(--k); }
.s1 .req:not(.na) { color: #0B2A5B; }
.s1 .req:not(.na) .rb { background: #1F5FD6; border-color: #1F5FD6; }
.s1 .req:not(.na) .rb svg { opacity: 1; }
.s1 .req.na { opacity: .5; text-decoration: line-through; }
.s1 .req.na em { opacity: 1; }
.reqFoot { margin: 8px 0 0; display: flex; align-items: center; justify-content: space-between; gap: 6px; white-space: nowrap; font-size: 12px; color: var(--ink); opacity: 0; transition: opacity .25s ease; }
.s1 .reqFoot { opacity: 1; transition-delay: 1.85s; }
.s1 .found { opacity: 1; transform: none; transition-delay: 1.95s; }
.scanbar { position: absolute; top: 6px; bottom: 6px; width: 16px; border-radius: 8px; background: linear-gradient(90deg, rgba(31, 95, 214, 0), rgba(31, 95, 214, .45), rgba(31, 95, 214, 0)); opacity: 0; pointer-events: none; }
.sb1 { left: 120px; } .sb2 { left: 330px; }
.s1 .sb1 { animation: scanh1 .55s ease-in-out .4s; }
.s1 .sb2 { animation: scanh2 .6s ease-in-out 1.25s; }
.stage.s2 .scanbar { animation: none; }
@keyframes scanh1 { 0% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translateX(190px); } }
@keyframes scanh2 { 0% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translateX(214px); } }
.strip { position: absolute; left: 322px; top: 100px; width: 550px; height: 40px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 12px; background: #FFFFFF;
  display: flex; align-items: center; justify-content: space-around; font-size: 13px; color: var(--mist); opacity: 0; transform: translateY(8px); transition: opacity .4s ease, transform .4s ease; z-index: 5; }
.strip b { color: var(--ink); }
.strip i { width: 6px; height: 6px; border-radius: 50%; background: #C9D2E0; }
.s1 .strip { opacity: 1; transform: none; transition-delay: 2.85s; }
.chip { position: absolute; width: 30px; height: 38px; opacity: 0; z-index: 8; pointer-events: none; filter: drop-shadow(0 3px 4px rgba(11, 42, 91, .2)); }
.chip svg { width: 100%; height: 100%; overflow: visible; }
.cp { fill: #1F5FD6; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.cf { fill: #6FA0F0; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.cl { fill: none; stroke: rgba(255, 255, 255, .9); stroke-width: 2.2; stroke-linecap: round; }
.cc { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 1.5; }
.ck2 { fill: none; stroke: #1F5FD6; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.s1 .chip { animation: chipfall .9s cubic-bezier(.5, 0, .6, 1) var(--k) both; }
.jump .chip { animation: none; }

.fz .chip { animation: none; }
@keyframes chipfall { 0% { opacity: 0; } 12% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(.8) rotate(20deg); } }

.bay { position: absolute; left: 570px; top: 230px; width: 300px; height: 368px; box-sizing: border-box; border: 2.5px dashed #B4BFD2; border-radius: 22px; background: rgba(247, 249, 253, .7);
  opacity: 0; transition: opacity .4s ease; z-index: 1; }
.bay span { position: absolute; left: 0; right: 0; top: 14px; text-align: center; font-size: 13px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--mist); }
.s1 .bay { opacity: 1; transition-delay: 2.5s; }
.s2 .bay { opacity: 0; transition-delay: .2s; }
.mecha { position: absolute; left: 560px; top: 222px; width: 320px; height: 400px; overflow: visible; z-index: 6; }
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
.gear { transform-box: view-box; }
.s2 .gear { animation: gspin 2.4s linear infinite; }
.s2 .gear.rev { animation-direction: reverse; }
.s4 .gear { animation-play-state: paused; }
@keyframes gspin { to { transform: rotate(360deg); } }
.visor { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; }
.htag { font-family: var(--font-display); font-size: 8.5px; font-weight: 800; fill: #0B2A5B; opacity: 0; }
.ear { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.rim { fill: none; stroke: #DFF6FF; stroke-width: 2; stroke-linecap: round; }
.topl { fill: #DFF6FF; stroke: #0B2A5B; stroke-width: 1.5; }
.mouth { fill: none; stroke: #7FE3F0; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.eyeb { fill: #7FE3F0; }
.s2 .eyeb { animation: eglow 1.4s ease-in-out infinite alternate 2s; }
@keyframes eglow { to { fill: #D6F1FF; } }
.coret { font-family: var(--font-display); font-size: 14px; font-weight: 800; fill: #0B2A5B; }
.corec { fill: #FFFFFF; stroke: #7FD3FF; stroke-width: 4; }
.halo { fill: #7FD3FF; opacity: .35; transform-box: fill-box; transform-origin: center; }
.s2 .halo { animation: halo 1.6s ease-in-out infinite; }
@keyframes halo { 50% { transform: scale(1.18); opacity: .15; } }
.part, .core { transform-box: view-box; transition: transform .6s cubic-bezier(.2, 1.35, .4, 1), opacity .3s ease; opacity: 0; }
.core { transform-origin: 160px 190px; transform: scale(.2); }
.torso { transform: scale(.6); transform-origin: 160px 190px; }
.legs { transform: translateY(240px); }
.arml { transform: translateX(-280px) rotate(-25deg); transform-origin: 80px 130px; }
.armr { transform: translateX(280px) rotate(25deg); transform-origin: 240px 130px; }
.head { transform: translateY(-280px); }
.s2 .core { opacity: 1; transform: none; transition-delay: .1s; }
.s2 .torso { opacity: 1; transform: none; transition-delay: .45s; }
.s2 .legs { opacity: 1; transform: none; transition-delay: .8s; }
.s2 .arml { opacity: 1; transform: none; transition-delay: 1.15s; }
.s2 .armr { opacity: 1; transform: none; transition-delay: 1.3s; }
.s2 .head { opacity: 1; transform: none; transition-delay: 1.65s; }
.belton .mecha { animation: bob 2.6s ease-in-out infinite; }
@keyframes bob { 50% { transform: translateY(-3px); } }
.callouts .co { position: absolute; left: 330px; width: 210px; margin: 0; display: flex; align-items: center; justify-content: flex-end; gap: 8px; font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--ink);
  opacity: 0; transform: translateX(-10px); transition: opacity .4s ease, transform .4s ease; z-index: 7; }
.co i { width: 12px; height: 12px; border-radius: 4px; flex: none; order: 2; }
.sw-gold { background: #C49A3E; } .sw-orange { background: #F47B20; } .sw-blue { background: #1F5FD6; } .sw-core { background: #FFFFFF; border: 3px solid #7FD3FF; box-sizing: border-box; }
.s2 .c-core { opacity: 1; transform: none; transition-delay: .4s; }
.s2 .c-leg { opacity: 1; transform: none; transition-delay: 1.05s; }
.s2 .c-arm { opacity: 1; transform: none; transition-delay: 1.45s; }
.s2 .c-head { opacity: 1; transform: none; transition-delay: 1.9s; }
.leaders { position: absolute; inset: 0; width: 1280px; height: 720px; pointer-events: none; z-index: 7; }
.leaders path { fill: none; stroke: #9AA7BE; stroke-width: 1.5; stroke-dasharray: 3 3; opacity: 0; transition: opacity .4s ease; }
.s2 .leaders path { opacity: 1; transition-delay: 2s; }

.belt { position: absolute; left: 304px; top: 600px; width: 596px; height: 26px; opacity: 0; transform: scaleX(0); transform-origin: 0 50%; transition: opacity .3s ease, transform .6s cubic-bezier(.5, 0, .3, 1); z-index: 7; }
.p4 .belt { opacity: 1; transform: none; }
.band { position: absolute; inset: 0; border: 2.5px solid #0B2A5B; border-radius: 13px; background: repeating-linear-gradient(90deg, #E1E6EF 0 10px, #F7F9FD 10px 20px); background-size: 20px 100%; animation: band .6s linear infinite paused; }
@keyframes band { to { background-position: 20px 0; } }
.roller { position: absolute; top: 6px; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #5E6B85; box-sizing: border-box; background: conic-gradient(#5E6B85 0 25%, transparent 0 50%, #5E6B85 0 75%, transparent 0); animation: roll .6s linear infinite paused; }
@keyframes roll { to { transform: rotate(360deg); } }
.cargo { position: absolute; left: 0; top: 0; opacity: 0; transition: opacity .3s ease .4s; z-index: 8; }
.p4 .cargo { opacity: 1; }
.stage.s4 .cargo { opacity: 0; transition-delay: 0s; }
.bdoc { position: absolute; left: 0; top: 0; width: 34px; height: 44px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 3px; background: #FFFFFF; padding: 7px 6px 0;
  animation: ride 6s linear var(--k) infinite paused; }
.bdoc i { display: block; height: 3px; border-radius: 2px; background: #B4C2DA; margin-bottom: 4px; }
.belton .band, .belton .roller, .belton .bdoc { animation-play-state: running; }
@keyframes ride {
  0% { transform: translate(312px, 556px); opacity: 0; } 4% { opacity: 1; }
  92% { transform: translate(842px, 556px); opacity: 1; }
  100% { transform: translate(890px, 556px) scale(.6); opacity: 0; }
}
.laser { position: absolute; inset: 0; width: 1280px; height: 720px; pointer-events: none; z-index: 9; opacity: 0; transition: opacity .4s ease; }
.belton .laser { opacity: 1; transition-delay: .3s; }
.cone { animation: flick 1.6s ease-in-out infinite alternate; }
@keyframes flick { to { opacity: .7; } }
.sweepl { fill: #BFE6FF; opacity: .9; animation: sweepl 1.4s ease-in-out infinite alternate; }
@keyframes sweepl { to { transform: translateX(186px); } }

.report { position: absolute; left: 900px; top: 110px; width: 350px; height: 480px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 16px; background: #FFFFFF;
  box-shadow: 0 14px 34px rgba(11, 42, 91, .1); z-index: 8; overflow: hidden; opacity: 0; transform: translateX(30px); transition: opacity .45s ease, transform .55s cubic-bezier(.2, 1.2, .4, 1); }
.s3 .report { opacity: 1; transform: none; }
.rhead { display: flex; align-items: center; justify-content: space-between; height: 46px; padding: 0 16px; border-bottom: 2px solid #E1E6EF; }
.rtitle { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--ink); }
.rcount { font-size: 12px; font-weight: 700; color: #1F5FD6; background: #EEF4FF; border-radius: 999px; padding: 3px 10px; }
.counters { display: flex; justify-content: space-between; gap: 4px; padding: 10px 12px; border-bottom: 2px solid #E1E6EF; }
.cnt { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: var(--mist); white-space: nowrap; }
.cnt i { width: 9px; height: 9px; border-radius: 3px; }
.cnt b { min-width: 16px; text-align: center; font-size: 12px; color: #FFFFFF; border-radius: 5px; padding: 0 3px; animation: pop .35s cubic-bezier(.2, 1.8, .4, 1); }
@keyframes pop { from { transform: scale(.4); } to { transform: none; } }
.t-guide .lbl, .lbl.t-guide, .cnt.t-guide i, .cnt.t-guide b { background: #1F5FD6; }
.t-incon .lbl, .lbl.t-incon, .cnt.t-incon i, .cnt.t-incon b { background: #F47B20; }
.t-miss .lbl, .lbl.t-miss, .cnt.t-miss i, .cnt.t-miss b { background: #0B2A5B; }
.flist { position: absolute; inset: 0; transition: opacity .35s ease; }
.frow { position: absolute; left: 12px; right: 12px; height: 56px; box-sizing: border-box; border: 2px solid #E1E6EF; border-left-width: 5px; border-radius: 10px; padding: 0 12px; background: #FFFFFF; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 4px;
  opacity: 0; transform: translateX(40px); transition: opacity .3s ease, transform .4s cubic-bezier(.2, 1.4, .4, 1), top .6s cubic-bezier(.5, 0, .25, 1), height .6s cubic-bezier(.5, 0, .25, 1), border-color .3s ease; }
.frow > * { transition: opacity .2s ease; }
.frow.t-guide { border-left-color: #1F5FD6; } .frow.t-incon { border-left-color: #F47B20; } .frow.t-miss { border-left-color: #0B2A5B; }
.frow.on { opacity: 1; transform: none; }
.lbl { display: inline-block; font-size: 10px; font-weight: 800; letter-spacing: .03em; color: #FFFFFF; border-radius: 5px; padding: 1px 6px; }
.ft { margin: 0; max-width: 100%; line-height: 1.2; font-size: 13px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fd { margin: 1px 0 0; font-size: 11px; color: var(--mist); }
.s4 .frow:not(.pick) { opacity: 0; transform: translateY(var(--away)); transition: opacity .3s ease, transform .5s cubic-bezier(.5, 0, .7, .4); }
.s4 .frow.pick { justify-content: flex-start; padding-top: 9px; top: 58px !important; height: 410px; border-color: #F47B20; border-left-color: #F47B20; transition-delay: .15s; }
.s4 .frow.pick > * { opacity: 0; transition-delay: .6s; }
.counters { transition: opacity .3s ease; }
.s4 .counters { opacity: 0; }
.fx { position: absolute; left: 17px; right: 14px; top: 60px; bottom: 14px; overflow: hidden; opacity: 0; pointer-events: none; transition: opacity .2s ease; }
.s4 .fx { opacity: 1; transition-delay: .7s; }
.fxin { padding: 12px 14px; }
.r { opacity: 0; transform: translateY(6px); transition: opacity .35s ease, transform .35s ease; margin: 0; }
.s4 .r { opacity: 1; transform: none; transition-delay: calc(.5s + var(--r)); }
.fxin > p:first-child { display: flex; gap: 8px; align-items: center; }
.fail { font-size: 11px; font-weight: 800; color: #FFFFFF; background: #C55A0E; border-radius: 5px; padding: 1px 7px; }
.fxt { margin-top: 6px; font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--ink); line-height: 1.2; }
.fxd { margin-top: 6px; display: flex; gap: 6px; flex-wrap: wrap; }
.fxd span { font-size: 11px; font-weight: 700; color: #1F5FD6; background: #EEF4FF; border-radius: 5px; padding: 2px 7px; }
.fh { margin-top: 8px; font-size: 10.5px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: var(--mist); }
.fxx { margin-top: 2px; font-size: 13px; line-height: 1.35; color: var(--ink); }
.ev { margin: 4px 0 0; padding: 5px 9px; border-left: 3px solid #1F5FD6; background: #F4F8FF; border-radius: 0 8px 8px 0; font-size: 12px; line-height: 1.3; color: #33456B; }
.ev b { display: block; font-size: 10.5px; color: #1F5FD6; }
.ev mark { background: linear-gradient(90deg, #FFD3AE, #FFD3AE) no-repeat 0 0 / 0% 100%; color: inherit; font-weight: 700; border-radius: 3px; padding: 0 2px; transition: background-size .6s ease; }
.s4 .ev mark { background-size: 100% 100%; transition-delay: 2.1s; }
.fdec { margin-top: 8px; display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border: 2px dashed #B4BFD2; border-radius: 10px; font-size: 12.5px; font-weight: 700; color: var(--ink); }
.fdec span { font-size: 11.5px; color: #1F5FD6; background: #EEF4FF; border-radius: 6px; padding: 2px 8px; }
.spark { position: absolute; width: 12px; height: 12px; border-radius: 50%; background: #7FD3FF; border: 2px solid #1F5FD6; box-sizing: border-box; z-index: 11; pointer-events: none;
  animation: spark .6s cubic-bezier(.4, 0, .6, 1) forwards; box-shadow: 0 0 10px rgba(79, 184, 255, .8); }
@keyframes spark { 0% { transform: scale(.3); opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) scale(1); opacity: .2; } }
.illus { position: absolute; left: 1100px; top: 600px; margin: 0; font-size: 12px; font-weight: 700; color: #C55A0E; border: 1.5px dashed #F47B20; border-radius: 6px; padding: 2px 8px; opacity: 0; transition: opacity .4s ease; }
.s3 .illus { opacity: 1; transition-delay: .6s; }
.resp { position: absolute; left: 0; right: 0; top: 664px; margin: 0; text-align: center; font-size: 15px; font-weight: 500; font-style: italic; color: var(--mist); opacity: 0; transition: opacity .5s ease; }
.s4 .resp { opacity: 1; transition-delay: 1.8s; }
</style>
