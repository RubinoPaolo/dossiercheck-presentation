<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'
import fig from '../data/fig32.json'

const props = defineProps<{ frozen?: boolean }>()
const { $clicks } = useSlideContext()
const step = computed(() => props.frozen ? 1 : unref($clicks) as number)

const active = useIsSlideActive()
const phase = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }
watch(active, (a) => {
  clearTimers()
  if (props.frozen) { phase.value = 99; return }
  if (!a) { phase.value = 0; return }
  if (step.value > 0) { phase.value = 99; return }
  phase.value = 0
  ;[[400, 1], [1300, 2], [2000, 3], [4200, 4], [6400, 5]].forEach(([ms, p]) => later(ms, () => { phase.value = p }))
}, { immediate: true })
watch(step, () => { if (phase.value === 99) phase.value = 5 })
const ph = computed(() => phase.value === 99 ? 5 : phase.value)
onBeforeUnmount(clearTimers)

const Y0 = 500, K = 3.2
const yOf = (f: number) => Y0 - K * f
const COL = { gpt4o: 300, sol: 640, dc: 1000 } as const
type M = keyof typeof COL
const COLOR = { gpt4o: '#4FB8FF', sol: '#F47B20', dc: '#1F5FD6' } as const
const modes = fig.modes as Record<M, { f1: number, dx: number }[]>
const dots = (['gpt4o', 'dc', 'sol'] as M[]).flatMap(m => modes[m].map((p, i) => ({ m, i, x: COL[m] + p.dx * 40, y: yOf(p.f1) })))
const agg = fig.aggregateF1 as Record<M, number>
function quant(v: number[], q: number) {
  const s = [...v].sort((a, b) => a - b)
  const pos = (s.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos)
  return s[lo] + (s[hi] - s[lo]) * (pos - lo)
}
const boxes = (['gpt4o', 'sol', 'dc'] as M[]).map((m) => {
  const v = modes[m].map(p => p.f1)
  const q1 = quant(v, 0.25), q2 = quant(v, 0.5), q3 = quant(v, 0.75), iqr = q3 - q1
  const lo = Math.min(...v.filter(x => x >= q1 - 1.5 * iqr)), hi = Math.max(...v.filter(x => x <= q3 + 1.5 * iqr))
  return { m, x: COL[m], q1: yOf(q1), q2: yOf(q2), q3: yOf(q3), lo: yOf(lo), hi: yOf(hi) }
})

const T0 = { gpt4o: 0.9, dc: 0.9, sol: 0.9 } as const

const reports = [
  { m: 'gpt4o' as M, x0: 350, y0: 389 },
  { m: 'sol' as M, x0: 722, y0: 395 },
  { m: 'dc' as M, x0: 1086, y0: 395 },
]

const TIMES = { gpt4o: 53.5, dc: 145.0, sol: 524.3 } as const
const SD = { gpt4o: 32.3, dc: 71.5, sol: 88.2 } as const
const tnow = ref<Record<M, number>>({ gpt4o: 0, dc: 0, sol: 0 })
let raf = 0
function fmt(sec: number) {
  if (sec < 60) return `${sec.toFixed(1)} s`
  const m = Math.floor(sec / 60), s = Math.round(sec % 60)
  return `${m} min ${String(s).padStart(2, '0')} s`
}
watch([step, phase], ([s], old) => {
  cancelAnimationFrame(raf)
  const prev = old?.[0]
  if (props.frozen) { tnow.value = { ...TIMES }; return }
  if (s < 1) { tnow.value = { gpt4o: 0, dc: 0, sol: 0 }; return }
  if (prev === 0 && phase.value !== 99) {
    const t0 = performance.now() + 7700
    const tick = (t: number) => {
      const e = Math.max(0, (t - t0) / 1000) * 120
      tnow.value = { gpt4o: Math.min(e, TIMES.gpt4o), dc: Math.min(e, TIMES.dc), sol: Math.min(e, TIMES.sol) }
      if (e < TIMES.sol) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }
  else tnow.value = { ...TIMES }
}, { immediate: true })
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <div class="stage" :class="[`rph${ph}`, { rs1: step >= 1, rstill: phase === 99 }]">

    <EvalSlide frozen :ns="frozen ? 'x' : ''" class="old" />

    <h2 class="display heading">
      <span :class="{ on: ph === 0 }">Same Material, Same Task</span>
      <span :class="{ on: ph >= 1 }">Results</span>
    </h2>
    <p class="subt">F1 of each package against the 602 reference problems (balance of recall and precision)</p>

    <div class="chart">

    <svg viewBox="0 0 1280 720" class="axes">
      <g v-for="t in [0, 20, 40, 60, 80, 100]" :key="t" class="tick">
        <line :x1="180" :x2="1140" :y1="yOf(t)" :y2="yOf(t)" :class="t === 0 ? 'axb' : 'axg'" />
        <text :x="168" :y="yOf(t) + 5" text-anchor="end">{{ t }}</text>
      </g>
      <line x1="180" x2="180" :y1="yOf(100) - 10" :y2="yOf(0)" class="axb" />
      <text x="0" y="0" class="ylab" transform="translate(128 340) rotate(-90)" text-anchor="middle">Package F1 (%)</text>
    </svg>

    <svg viewBox="0 0 1280 720" class="boxes">
      <g v-for="b in boxes" :key="b.m" class="box" :class="`bx-${b.m}`">
        <line :x1="b.x" :x2="b.x" :y1="b.hi" :y2="b.q3" class="wh" /><line :x1="b.x" :x2="b.x" :y1="b.q1" :y2="b.lo" class="wh" />
        <line :x1="b.x - 16" :x2="b.x + 16" :y1="b.hi" :y2="b.hi" class="wh" /><line :x1="b.x - 16" :x2="b.x + 16" :y1="b.lo" :y2="b.lo" class="wh" />
        <rect :x="b.x - 46" :y="b.q3" width="92" :height="Math.max(2, b.q1 - b.q3)" rx="6" class="bxr" :style="{ stroke: COLOR[b.m] }" />
        <line :x1="b.x - 46" :x2="b.x + 46" :y1="b.q2" :y2="b.q2" class="med" :style="{ stroke: COLOR[b.m] }" />
      </g>
    </svg>

    <div v-for="d in dots" :key="`${d.m}${d.i}`" class="dot" :class="`d-${d.m}`" :style="{ left: `${d.x - 7}px`, top: `${d.y - 7}px`, '--fall': `${d.y - 200}px`, '--k': `${T0[d.m] + d.i * 0.07}s`, background: COLOR[d.m] }">
      <i class="dust a" /><i class="dust b" /><i class="dust c" />
    </div>

    <div class="agg a-gpt4o" :style="{ left: `${COL.gpt4o - 64}px`, top: `${yOf(agg.gpt4o)}px` }"><i /><b>F1 {{ agg.gpt4o.toFixed(1) }}%</b></div>
    <div class="agg a-dc" :style="{ left: `${COL.dc - 64}px`, top: `${yOf(agg.dc)}px` }"><i /><b>F1 {{ agg.dc.toFixed(2) }}%</b></div>
    <div class="agg a-sol" :style="{ left: `${COL.sol - 64}px`, top: `${yOf(agg.sol)}px` }"><i /><b>F1 {{ agg.sol.toFixed(2) }}%</b></div>
    <svg viewBox="0 0 1280 720" class="match">
      <path :d="`M${COL.sol + 64} ${yOf(agg.sol)} H${COL.dc - 64}`" class="mline" />
    </svg>
    <p class="mtext" :style="{ left: `${(COL.sol + COL.dc) / 2 - 120}px`, top: `${yOf(agg.dc) - 30}px` }">same aggregate F1</p>

    <div v-for="r in reports" :key="r.m" class="rpt" :class="`r-${r.m}`" :style="{ left: `${COL[r.m] - 32}px`, top: '150px', '--x0': `${r.x0 - (COL[r.m] - 32)}px`, '--y0': `${r.y0 - 150}px` }">
      <svg viewBox="0 0 64 46"><rect x="2" y="2" width="60" height="42" rx="4" class="eb" /><path d="M4 43 L27 24 M60 43 L37 24" class="el" /><path d="M3 4 L32 27 L61 4 Z" class="efl" /></svg>
      <b>?</b>
      <i class="crumb c1" /><i class="crumb c2" /><i class="crumb c3" />
    </div>

    </div>

    <div class="duo">
      <div class="duo-m"><Mecha /></div>
      <div class="duo-s"><Sun :uid="frozen ? 'r11f-duo' : 'r11-duo'" :look="-14" /></div>
      <p class="duo-l dl-m"><b>DossierCheck + GPT-4o</b>GPT-4o: ~200B parameters <sup>(1)</sup></p>
      <p class="duo-l dl-s"><b>GPT-5.6 Sol</b>~2T parameters <sup>(1)</sup></p>
    </div>

    <p class="ptag" :style="{ left: `${COL.gpt4o}px` }">~200B parameters <sup>(1)</sup></p>
    <p class="ptag big" :style="{ left: `${COL.sol}px` }">~2T parameters <sup>(1)</sup></p>
    <p class="ptag" :style="{ left: `${COL.dc}px` }">GPT-4o: ~200B parameters <sup>(1)</sup></p>
    <p class="fnote"><sup>(1)</sup> External estimates. GPT-4o ≈ 200B: Epoch AI, “Frontier language models have become much smaller”. GPT-5.6 Sol ≈ 2T: Eigenigma, “Estimating parameter counts of Claude 5 and GPT-5.6”.</p>

    <div class="stats">
      <p class="st-h">Spread across the 16 packages</p>
      <p class="st-r"><span>Std. deviation</span><b class="c-dc">16.0</b><i>vs</i><b class="c-sol">22.4 pp</b></p>
      <p class="st-r"><span>IQR</span><b class="c-dc">21.8</b><i>vs</i><b class="c-sol">27.2 pp</b></p>
      <p class="st-l"><b class="c-dc">DossierCheck</b> vs <b class="c-sol">Sol</b> · different packages, not repeated runs</p>
    </div>

    <p class="tlab">Mean analysis time (± SD)</p>
    <div v-for="m in (['gpt4o', 'sol', 'dc'] as M[])" :key="`w${m}`" class="watch" :class="[`w-${m}`, { done: tnow[m] >= TIMES[m] }]" :style="{ left: `${COL[m] - 74}px` }">
      <svg viewBox="0 0 44 50" class="sw"><rect x="18" y="1" width="8" height="5" rx="2" class="swk" /><circle cx="22" cy="28" r="19" class="swc" /><line x1="22" y1="28" x2="22" y2="13" class="swh" :style="{ transform: `rotate(${(tnow[m] / 60) * 360}deg)` }" /><circle cx="22" cy="28" r="2.5" class="swp" /></svg>
      <span class="wt"><b>{{ fmt(tnow[m]) }}</b><em>± {{ fmt(SD[m]) }} SD</em></span>
    </div>
    <p class="wnote">stopped early: opened 111 of 206 files</p>
  </div>
</template>

<style scoped>

.old { z-index: 0; }
.old :deep(.heading) { opacity: 0 !important; transition: none !important; }
.old :deep(.rep4) { display: none !important; }
.old :deep(.trow), .old :deep(.legend), .old :deep(.task), .old :deep(.pile), .old :deep(.podium), .old :deep(.gwrap), .old :deep(.swrap), .old :deep(.mwrap), .old :deep(.plab) {
  transition: opacity .45s ease, transform .8s cubic-bezier(.5, 0, .3, 1), top .8s cubic-bezier(.5, 0, .3, 1) !important; }
.stage:not(.rph0) .old :deep(.trow), .stage:not(.rph0) .old :deep(.legend), .stage:not(.rph0) .old :deep(.task), .stage:not(.rph0) .old :deep(.pile), .stage:not(.rph0) .old :deep(.podium) { opacity: 0 !important; }
.stage:not(.rph0) .old :deep(.gwrap) { transform: translateY(36px) scale(.45) !important; }
.stage:not(.rph0) .old :deep(.swrap) { transform: translateY(36px) scale(.22) !important; }
.stage:not(.rph0) .old :deep(.mwrap) { transform: translateY(36px) scale(.2) !important; }
.stage:not(.rph0) .old :deep(.plab) { top: 604px !important; }

.rs1 .old :deep(.swrap), .rs1 .old :deep(.mwrap), .rs1 .old :deep(.plab) { animation: hideIcon 4.4s ease .6s both; }
@keyframes hideIcon { 0%, 3% { opacity: 1; } 6%, 92% { opacity: 0; } 100% { opacity: 1; } }
.rstill .old :deep(.swrap), .rstill .old :deep(.mwrap), .rstill .old :deep(.plab) { animation: none !important; }

.rstill, .rstill * { transition: none !important; }

.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 20; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .45s ease, transform .45s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .25s; }
.heading span:first-child { position: relative; transition: none; transform: none; }
.heading span:first-child:not(.on) { opacity: 0; transition: opacity .3s ease; }
.subt { position: absolute; left: 72px; top: 92px; width: 900px; margin: 0; font-size: 16px; font-weight: 500; color: var(--mist); opacity: 0; transition: opacity .4s ease; z-index: 20; }
.stage:is(.rph2, .rph3, .rph4, .rph5) .subt { opacity: 1; }
.rs1 .subt { opacity: 0 !important; transition-delay: 7.2s !important; }

.axes, .boxes, .match { position: absolute; inset: 0; width: 1280px; height: 720px; pointer-events: none; }
.axes { z-index: 3; opacity: 0; transition: opacity .5s ease; }
.stage:is(.rph2, .rph3, .rph4, .rph5) .axes { opacity: 1; }
.axg { stroke: #E1E6EF; stroke-width: 1.5; stroke-dasharray: 4 6; }
.axb { stroke: #0B2A5B; stroke-width: 2.5; }
.tick text { font-size: 14px; font-weight: 600; fill: var(--mist); }
.ylab { font-size: 15px; font-weight: 700; fill: var(--ink); }

.dot { position: absolute; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #0B2A5B; box-sizing: border-box; z-index: 6; opacity: 0; }
.stage:is(.rph3, .rph4, .rph5) .d-gpt4o, .stage:is(.rph4, .rph5) .d-sol, .rph5 .d-dc { animation: drop .6s cubic-bezier(.5, 0, .9, .5) var(--k) both; }
@keyframes drop {
  0% { opacity: 0; transform: translateY(calc(-1 * var(--fall))); }
  10% { opacity: 1; }
  70% { opacity: 1; transform: none; }
  82% { transform: translateY(-6px) scaleY(1.05); }
  100% { opacity: 1; transform: none; }
}
.dust { position: absolute; left: 3px; top: 8px; width: 6px; height: 6px; border-radius: 50%; background: #C9D2E0; opacity: 0; }
.stage:is(.rph3, .rph4, .rph5) .d-gpt4o .dust, .stage:is(.rph4, .rph5) .d-sol .dust, .rph5 .d-dc .dust { animation: puff .55s ease-out calc(var(--k) + .42s) both; }
.dust.a { --px: -14px; } .dust.b { --px: 14px; } .dust.c { --px: 0px; --py: -10px; }
@keyframes puff { 0% { opacity: .9; transform: none; } 100% { opacity: 0; transform: translate(var(--px), var(--py, -4px)) scale(2.4); } }
.rstill .dot { animation: none !important; opacity: 1; }

.agg { position: absolute; width: 128px; height: 0; z-index: 7; opacity: 0; transition: opacity .35s ease; }
.agg i { position: absolute; left: 0; right: 0; top: -1.5px; border-top: 3px dashed #0B2A5B; }
.agg b { position: absolute; left: 136px; top: -13px; white-space: nowrap; font-family: var(--font-display); font-size: 18px; font-weight: 800; color: #0B2A5B; background: #FFFFFF; border: 2px solid #0B2A5B; border-radius: 8px; padding: 1px 8px; }
.a-gpt4o b { top: -30px; }
.stage:is(.rph3, .rph4, .rph5) .a-gpt4o { opacity: 1; transition-delay: 2s; }
.stage:is(.rph4, .rph5) .a-sol { opacity: 1; transition-delay: 2s; }
.rph5 .a-dc { opacity: 1; transition-delay: 2s; }
.a-sol b { left: -128px; top: -13px; }
.a-dc b { border-color: #1F5FD6; color: #1F5FD6; }
.a-sol b { border-color: #F47B20; color: #C55A0E; }
.match { z-index: 6; }
.mline { fill: none; stroke: #0B2A5B; stroke-width: 2.5; stroke-dasharray: 6 6; opacity: 0; transition: opacity .4s ease; }
.rs1 .mline { opacity: 1; transition-delay: .1s; animation: march 1s linear infinite; }
@keyframes march { to { stroke-dashoffset: -12; } }
.mtext { position: absolute; width: 240px; margin: 0; text-align: center; font-size: 14px; font-weight: 700; color: var(--ink); opacity: 0; transition: opacity .4s ease; z-index: 7; }
.rs1 .mtext { animation: mtext 5.2s ease .3s both; }
@keyframes mtext { 0% { opacity: 0; } 8%, 92% { opacity: 1; } 100% { opacity: 0; } }
.rstill .mtext { animation: none !important; opacity: 0; }

.rpt { position: absolute; width: 64px; height: 46px; z-index: 8; transform: translate(var(--x0), var(--y0)); transition: transform .8s cubic-bezier(.5, 0, .3, 1); }
.stage:not(.rph0) .rpt { transform: none; }
.rpt svg { width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 6px 10px rgba(11, 42, 91, .18)); }
.eb { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.el { fill: none; stroke: #C9D2E0; stroke-width: 2.5; stroke-linecap: round; }
.efl { fill: #E8EDF5; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; transform-box: view-box; transform-origin: 32px 4px; }
.rpt b { position: absolute; left: 18px; top: 12px; width: 28px; height: 28px; border-radius: 50%; background: radial-gradient(circle at 38% 34%, #FF9A4D, #F47B20 55%, #C9580B); border: 2px solid #0B2A5B; box-shadow: 0 0 0 3px rgba(244, 123, 32, .35); color: #FFFFFF; display: grid; place-items: center; font-family: var(--font-display); font-size: 16px; font-weight: 800; box-sizing: border-box; }
.crumb { position: absolute; left: 29px; top: 23px; width: 7px; height: 7px; border-radius: 2px; background: #D9620F; border: 1.5px solid #0B2A5B; opacity: 0; }
.c1 { --cx: -26px; --cy: -18px; } .c2 { --cx: 24px; --cy: -22px; } .c3 { --cx: 4px; --cy: -30px; }

.stage:is(.rph3, .rph4, .rph5) .r-gpt4o, .stage:is(.rph4, .rph5) .r-sol, .rph5 .r-dc { animation: envGo 2.2s ease both; }
.stage:is(.rph3, .rph4, .rph5) .r-gpt4o b, .stage:is(.rph4, .rph5) .r-sol b, .rph5 .r-dc b { animation: seal .5s cubic-bezier(.3, 0, .7, 1) both; }
.stage:is(.rph3, .rph4, .rph5) .r-gpt4o .crumb, .stage:is(.rph4, .rph5) .r-sol .crumb, .rph5 .r-dc .crumb { animation: crumb .6s ease-out .15s both; }
.stage:is(.rph3, .rph4, .rph5) .r-gpt4o .efl, .stage:is(.rph4, .rph5) .r-sol .efl, .rph5 .r-dc .efl { animation: flap .45s cubic-bezier(.4, 0, .4, 1) .4s both; }
@keyframes envGo { 0% { transform: none; opacity: 1; } 8% { transform: scale(1.12) rotate(-3deg); } 16% { transform: scale(.97) rotate(2deg); } 24%, 62% { transform: none; opacity: 1; } 100% { transform: translateY(-46px) scale(.8); opacity: 0; } }
@keyframes seal { 0% { transform: none; opacity: 1; } 35% { transform: scale(1.25); opacity: 1; } 100% { transform: translate(0, 34px) scale(.4) rotate(120deg); opacity: 0; } }
@keyframes crumb { 0% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translate(var(--cx), var(--cy)) rotate(200deg); } }
@keyframes flap { 0% { transform: none; } 100% { transform: scaleY(-1); } }
.rstill .rpt { animation: none !important; opacity: 0; }

.ptag { position: absolute; top: 644px; width: 260px; margin: 0 0 0 -130px; text-align: center; font-size: 13.5px; font-weight: 800; color: #1F5FD6; opacity: 0; transform: translateY(6px); transition: opacity .35s ease, transform .35s ease; z-index: 9; }
.ptag.big { color: #C55A0E; font-size: 16px; }
.ptag sup, .fnote sup { font-size: .7em; }
.rs1 .ptag { opacity: 1; transform: none; transition-delay: 4.9s; }

.chart { position: absolute; inset: 0; z-index: 2; transform-origin: 640px 140px; }
.rs1 .chart { animation: chartAway 4.4s cubic-bezier(.5, 0, .3, 1) .6s both; }
@keyframes chartAway { 0% { transform: none; } 16%, 82% { transform: translateY(-20px) scale(.5); } 100% { transform: none; } }
.duo { position: absolute; inset: 0; z-index: 4; pointer-events: none; opacity: 0; }
.rs1 .duo { animation: duoOn 4.4s ease .6s both; }
@keyframes duoOn { 0% { opacity: 0; } 5%, 90% { opacity: 1; } 100% { opacity: 0; } }
.duo-m { position: absolute; left: 440px; top: 450px; width: 128px; height: 160px; transform-origin: 64px 160px; }
.duo-s { position: absolute; left: 653.5px; top: 423.5px; width: 213px; height: 213px; transform-origin: 106.5px 186.5px; }
.rs1 .duo-m { animation: duoM 4.4s cubic-bezier(.5, 0, .3, 1) .6s both; }
.rs1 .duo-s { animation: duoS 4.4s cubic-bezier(.5, 0, .3, 1) .6s both; }
@keyframes duoM { 0% { transform: translate(496px, -22px) scale(.425); } 20%, 80% { transform: none; } 100% { transform: translate(496px, -22px) scale(.425); } }
@keyframes duoS { 0% { transform: translate(-120px, -31px) scale(.35); } 20% { transform: none; } 42%, 78% { transform: translateX(40px) scale(2); } 100% { transform: translate(-120px, -31px) scale(.35); } }
.duo-l { position: absolute; top: 618px; width: 280px; margin: 0 0 0 -140px; text-align: center; font-size: 14px; font-weight: 700; color: var(--mist); opacity: 0; }
.duo-l b { display: block; font-family: var(--font-display); font-size: 18px; color: var(--ink); }
.dl-m { left: 504px; } .dl-s { left: 800px; color: #C55A0E; }
.rs1 .duo-l { animation: duoL 4.4s ease .6s both; }
@keyframes duoL { 0%, 20% { opacity: 0; } 30%, 80% { opacity: 1; } 88%, 100% { opacity: 0; } }
.rstill .chart, .rstill .duo, .rstill .duo-m, .rstill .duo-s, .rstill .duo-l { animation: none !important; }
.fnote { position: absolute; left: 72px; right: 72px; top: 676px; margin: 0; font-size: 11.5px; line-height: 1.35; color: var(--mist); opacity: 0; transition: opacity .4s ease; z-index: 10; }
.rs1 .fnote { opacity: 1; transition-delay: 1.6s; }

.boxes { z-index: 5; }
.box { opacity: 0; transition: opacity .5s ease; }
.rs1 .box { opacity: 1; transition-delay: 5.4s; }
.rs1 .bx-sol { transition-delay: 5.6s; } .rs1 .bx-dc { transition-delay: 5.8s; }
.bxr { fill: rgba(255, 255, 255, .55); stroke-width: 3; }
.med { stroke-width: 4; }
.wh { stroke: #5E6B85; stroke-width: 2.5; }
.stats { position: absolute; left: 192px; top: 212px; width: 248px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 12px; background: #FFFFFF; padding: 10px 14px; z-index: 9;
  box-shadow: 0 10px 24px rgba(11, 42, 91, .1); opacity: 0; transform: translateY(10px); transition: opacity .4s ease, transform .4s ease; }
.rs1 .stats { opacity: 1; transform: none; transition-delay: 6s; }
.st-h { margin: 0 0 6px; font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--ink); }
.st-r { margin: 2px 0; display: flex; align-items: baseline; gap: 6px; font-size: 13px; font-weight: 600; color: var(--ink); }
.st-r span { flex: 1; }
.st-r b { font-family: var(--font-display); font-size: 17px; font-weight: 800; }
.st-r i { font-style: normal; font-size: 12px; color: var(--mist); }
.st-l { margin: 6px 0 0; font-size: 11px; line-height: 1.3; color: var(--mist); }
.c-dc { color: #1F5FD6 !important; } .c-sol { color: #C55A0E !important; }

.tlab { position: absolute; left: 72px; top: 92px; margin: 0; font-size: 16px; font-weight: 700; color: var(--ink); opacity: 0; transition: opacity .4s ease; z-index: 20; }
.rs1 .tlab { opacity: 1; transition-delay: 7.4s; }
.watch { position: absolute; top: 112px; width: 148px; display: flex; align-items: center; gap: 8px; z-index: 9; opacity: 0; transform: translateY(8px); transition: opacity .35s ease, transform .35s ease; }
.rs1 .watch { opacity: 1; transform: none; transition-delay: 7.5s; }
.sw { width: 40px; height: 46px; flex: none; }
.swk { fill: #0B2A5B; } .swc { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 3; } .swp { fill: #0B2A5B; }
.swh { stroke: #F47B20; stroke-width: 3; stroke-linecap: round; transform-box: view-box; transform-origin: 22px 28px; }
.wt { display: flex; flex-direction: column; line-height: 1.15; }
.watch em { font-style: normal; font-size: 13px; font-weight: 700; color: var(--mist); white-space: nowrap; opacity: 0; transition: opacity .3s ease; }
.watch.done em { opacity: 1; }
.watch b { font-family: var(--font-display); font-size: 19px; font-weight: 800; color: var(--ink); font-variant-numeric: tabular-nums; white-space: nowrap; }
.watch.done .swc { stroke-width: 3.5; }
.w-dc.done b { color: #1F5FD6; } .w-sol.done b { color: #C55A0E; } .w-gpt4o.done b { color: #5E6B85; }
.wnote { position: absolute; left: 180px; top: 160px; width: 240px; margin: 0; text-align: center; font-size: 12.5px; font-weight: 700; color: #C55A0E; opacity: 0; transition: opacity .35s ease; z-index: 9; }
.rs1 .wnote { opacity: 1; transition-delay: 8.4s; }
</style>
