<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const props = defineProps<{ frozen?: boolean }>()
const idp = props.frozen ? 'd9f' : 'd9'
const { $clicks } = useSlideContext()
const step = computed(() => props.frozen ? 3 : unref($clicks) as number)

const active = useIsSlideActive()
const phase = ref(0)

const harness = ref(false), hleave = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }
watch(active, (a) => {
  clearTimers()
  if (props.frozen) { phase.value = 9; return }
  if (!a) { phase.value = 0; harness.value = false; hleave.value = false; return }
  if (step.value > 0) { phase.value = 9; harness.value = false; return }
  phase.value = 0
  harness.value = true; hleave.value = true
  const H = 1500
  later(H, () => { harness.value = false })
  later(H + 500, () => { phase.value = 1 })
  later(H + 1200, () => { phase.value = 2 })
  later(H + 2300, () => { phase.value = 3 })
  later(H + 3300, () => { phase.value = 4 })
}, { immediate: true })

watch(step, () => { if (phase.value === 9) phase.value = 4 })
onBeforeUnmount(clearTimers)
const ph = computed(() => phase.value === 9 ? 4 : phase.value)

const coord = { outfit: 'sweater', outfitColor: '#1F5FD6', hair: 'long', hairColor: '#4A2E1F', skin: '#C68B62', glasses: false } as const
const office = { outfit: 'sweater', outfitColor: '#F47B20', hair: 'bun', hairColor: '#1E1E2A', skin: '#F1C9A5', glasses: true } as const

const PAIR = 214, VIEW = 404
const scroll = computed(() => Math.min(0, VIEW - step.value * PAIR))
</script>

<template>
  <div class="stage" :class="[`q${ph}`, { s1: step >= 1, s2: step >= 2, s3: step >= 3, still: phase === 9 }]">

    <AnalysisSlide frozen class="old" />

    <div v-if="harness" class="hzw"><HarnessSlide frozen :leaving="hleave" /></div>

    <h2 class="display heading">
      <span :class="{ on: ph === 0 }">Automatic Analysis</span>
      <span :class="{ on: ph >= 1 }">A Contextual Assistant</span>
    </h2>

    <div class="chat">
      <div class="chead">
        <svg viewBox="-46 -56 92 92" class="mini"><use :href="`#${idp}-head`" /></svg>
        <div><p class="ctitle">Chiedi al dossier</p><p class="csub">Answers from the dossier sources</p></div>
        <span class="ragb" title="Retrieval-Augmented Generation"><i />RAG</span>
      </div>
      <div class="view">
        <div class="msgs" :style="{ transform: `translateY(${scroll}px)` }">

          <div class="pair p1" :style="{ top: '0px' }">
            <p class="q">Where is the blood sampling described?</p>
            <div class="dots"><i /><i /><i /></div>
            <div class="a">
              <p>In the <b>Information sheet, p. 2</b>: a venous blood sample is taken to measure neurofilaments (NfL) in serum.</p>
              <div class="cites"><span class="cite c1"><i />Information sheet · p. 2</span></div>
            </div>
          </div>

          <div class="pair p2" :style="{ top: `${PAIR}px` }">
            <p class="q">If the participation period goes from 12 to 18 months, what else needs attention?</p>
            <div class="dots"><i /><i /><i /></div>
            <div class="a">
              <p>These passages describe the participation period and may need updating:</p>
              <div class="cites"><span class="cite warn c2"><i />Information sheet · p. 2</span><span class="cite warn c3"><i />Consent form · p. 1</span></div>
            </div>
          </div>

          <div class="pair p3" :style="{ top: `${PAIR * 2}px` }">
            <p class="q">Who is reviewing our dossier?</p>
            <div class="dots"><i /><i /><i /></div>
            <div class="a">
              <p>The delivered revision is reviewed by the Clinical Trials Office. You can contact:</p>
              <div class="contact">
                <span class="av"><i /></span>
                <span><b>Clinical Trials Office</b><em>Internal review · workspace participant</em></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="input"><span>Ask the dossier…</span><svg viewBox="0 0 16 16"><path d="M2 8 L14 2 L10 14 L8 9 Z" /></svg></div>
    </div>
    <p class="illus">Illustrative example</p>

    <svg viewBox="0 0 1280 720" class="links">
      <path d="M360 307 C 320 307, 320 350, 290 350" class="lk l1" />
      <path d="M360 497 C 318 497, 322 350, 290 350" class="lk l2" />
      <path d="M548 486 C 450 470, 340 300, 290 292" class="lk l3" />
    </svg>

    <div class="pvw">
      <p class="pvtitle">Information sheet · p. 2</p>
      <i class="pvline" style="width: 92%" /><i class="pvline" style="width: 80%" /><i class="pvline" style="width: 86%" />
      <p class="pvquote"><mark>…a venous blood sample will be taken to measure neurofilaments (NfL) in serum…</mark></p>
      <i class="pvline" style="width: 88%" /><i class="pvline" style="width: 64%" />
    </div>

    <div class="ground" />
    <div class="who coord">
      <Person v-bind="coord" pose="hold" :mood="step >= 1 ? 'happy' : 'neutral'" uid="d9-coord" />
      <div class="tab"><i /></div>
    </div>
    <p class="glabel gc"><b>Study coordinator</b><span>asks the dossier</span></p>
    <div class="who office">
      <Person v-bind="office" pose="cheer" mood="happy" uid="d9-office" />
    </div>
    <p class="glabel go"><b>Clinical Trials Office</b><span>the right person to ask</span></p>

    <div class="bot">
      <div class="bob">
        <svg viewBox="-60 -60 120 150" class="botsvg">
          <defs>
            <g :id="`${idp}-head`">
              <path d="M-30 -20 Q-44 -44 -30 -52 Q-18 -42 -14 -30 Z" class="ear" /><path d="M30 -20 Q44 -44 30 -52 Q18 -42 14 -30 Z" class="ear" />
              <path d="M-42 4 Q-44 30 0 32 Q44 30 42 4 Q40 -4 0 -4 Q-40 -4 -42 4 Z" class="gold" />
              <path d="M-34 8 Q-36 -36 0 -36 Q36 -36 34 8 Q0 14 -34 8 Z" class="visor" />
              <path d="M-35 8 Q0 15 35 8" class="rim" />
              <rect x="-11" y="-42" width="22" height="6" rx="3" class="topl" />
              <ellipse cx="-12" cy="-10" rx="5" ry="7" class="eyeb" /><ellipse cx="12" cy="-10" rx="5" ry="7" class="eyeb" />
              <path d="M-6 2 q3 4 6 0 q3 4 6 0" class="mouth" />
              <text y="23" text-anchor="middle" class="htag">GPT-4o</text>
            </g>
          </defs>
          <ellipse cx="0" cy="84" rx="26" ry="5" class="bshd" />
          <g class="barm l"><rect x="-31" y="22" width="13" height="34" rx="6.5" class="gold" /><circle cx="-24.5" cy="59" r="6.5" class="navy" /></g>
          <g class="barm r"><rect x="18" y="22" width="13" height="34" rx="6.5" class="gold" /><circle cx="24.5" cy="59" r="6.5" class="navy" /></g>
          <use :href="`#${idp}-head`" />
          <g class="lids"><rect x="-18" y="-18" width="12" height="7" class="lid" /><rect x="6" y="-18" width="12" height="7" class="lid" /></g>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>

.old :deep(.heading) { opacity: 0; }
.hzw { position: absolute; inset: 0; z-index: 50; }
.old :deep(.report), .old :deep(.strip), .old :deep(.callouts), .old :deep(.belt), .old :deep(.illus), .old :deep(.resp), .old :deep(.run) {
  transition: opacity .4s ease, transform .6s cubic-bezier(.5, 0, .7, .4) !important; }
.stage:not(.q0) .old :deep(.report) { opacity: 0 !important; transform: translateX(420px) !important; }
.stage:not(.q0) .old :deep(.strip), .stage:not(.q0) .old :deep(.callouts), .stage:not(.q0) .old :deep(.illus), .stage:not(.q0) .old :deep(.resp), .stage:not(.q0) .old :deep(.run) { opacity: 0 !important; }
.stage:not(.q0) .old :deep(.belt) { opacity: 0 !important; transform: scaleX(0) !important; }

.old :deep(.core) { transition: transform .9s cubic-bezier(.5, 0, .3, 1), opacity .25s ease .7s !important; }
.q2 .old :deep(.core), .q3 .old :deep(.core), .q4 .old :deep(.core) { transform: translateY(-120px) scale(.25) !important; opacity: 0 !important; }
.old :deep(.htag) { transition: opacity .3s ease .85s; }
.q2 .old :deep(.htag), .q3 .old :deep(.htag), .q4 .old :deep(.htag) { opacity: 1; }
.q2 .old :deep(.head .visor) { animation: charge .6s ease .8s; }
@keyframes charge { 50% { fill: #1F5FD6; } }

.old :deep(.legs), .old :deep(.arml), .old :deep(.armr), .old :deep(.torso) { transition: opacity .5s ease, transform .6s cubic-bezier(.5, 0, .7, .4), filter .4s ease !important; }
.q3 .old :deep(.legs), .q3 .old :deep(.arml), .q3 .old :deep(.armr), .q3 .old :deep(.torso),
.q4 .old :deep(.legs), .q4 .old :deep(.arml), .q4 .old :deep(.armr), .q4 .old :deep(.torso) { opacity: 0 !important; transform: translateY(50px) !important; filter: grayscale(1); transition-delay: .3s !important; }
.q3 .old :deep(.head), .q4 .old :deep(.head) { opacity: 0 !important; transition: none !important; }

.still, .still * { transition: none !important; }

.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 9; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .5s ease, transform .5s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .3s; }
.heading span:first-child { position: relative; transition: none; transform: none; }
.heading span:first-child:not(.on) { opacity: 0; transition: opacity .3s ease; }

.bot { position: absolute; left: 834px; top: 154px; width: 192px; height: 240px; z-index: 12; opacity: 0; transform-origin: 96px 96px; transform: translate(-210px, 42px) scale(.625); }
.q3 .bot, .q4 .bot { opacity: 1; transform: none; transition: transform 1s cubic-bezier(.5, -.2, .3, 1.15) .45s; }
.bob { width: 100%; height: 100%; }
.q4 .bob { animation: bob 2.4s ease-in-out infinite; }
@keyframes bob { 50% { transform: translateY(-7px); } }
.botsvg { width: 100%; height: 100%; overflow: visible; }
.gold { fill: #C49A3E; stroke: #0B2A5B; stroke-width: 2.5; stroke-linejoin: round; }
.navy { fill: #0B2A5B; }
.ear { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; stroke-linejoin: round; }
.visor { fill: #0B2A5B; stroke: #0B2A5B; stroke-width: 2; }
.rim { fill: none; stroke: #DFF6FF; stroke-width: 2; stroke-linecap: round; }
.topl { fill: #DFF6FF; stroke: #0B2A5B; stroke-width: 1.5; }
.eyeb { fill: #7FE3F0; }
.mouth { fill: none; stroke: #7FE3F0; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.htag { font-family: var(--font-display); font-size: 8.5px; font-weight: 800; fill: #0B2A5B; }
.bshd { fill: #0B2A5B; opacity: 0; transition: opacity .4s ease 1.2s; }
.q4 .bshd { opacity: .12; }
.lid { fill: #0B2A5B; transform-box: fill-box; transform-origin: 50% 0; transform: scaleY(0); }
.q4 .lid { animation: blink 3.6s ease infinite 1s; }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(0); } 95% { transform: scaleY(1); } }

.barm { transform-box: view-box; transform: scaleY(0); opacity: 0; transition: transform .45s cubic-bezier(.3, 1.6, .5, 1), opacity .2s ease; }
.barm.l { transform-origin: -24.5px 26px; } .barm.r { transform-origin: 24.5px 26px; }
.q3 .barm, .q4 .barm { transform: none; opacity: 1; transition-delay: 1.2s; }
.q4:not(.s1) .barm.r { animation: wave .5s ease-in-out 1.6s 4 alternate both; }
@keyframes wave { from { transform: rotate(-120deg); } to { transform: rotate(-160deg); } }
.s1:not(.s2) .barm.l { transform: rotate(80deg); transition-delay: 1.4s; }
.s1:not(.s2) .barm.r { animation: tap 1s ease-in-out 1.6s infinite alternate; }
@keyframes tap { from { transform: rotate(0); } to { transform: rotate(-20deg); } }
.s2:not(.s3) .barm.l { transform: rotate(125deg); transition-delay: 1.3s; }
.s2:not(.s3) .barm.r { transform: rotate(-125deg); transition-delay: 1.3s; }
.s3 .barm.l { transform: rotate(20deg); transition-delay: 1.3s; }
.s3 .barm.r { animation: present 1.2s ease-in-out 1.5s infinite alternate both; }
@keyframes present { from { transform: rotate(-30deg); } to { transform: rotate(-55deg); } }

.chat { position: absolute; left: 330px; top: 96px; width: 500px; height: 528px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 18px; background: #FFFFFF; z-index: 10;
  box-shadow: 0 14px 34px rgba(11, 42, 91, .1); overflow: hidden; opacity: 0; transform: translateY(20px) scale(.96); transition: opacity .45s ease, transform .55s cubic-bezier(.2, 1.2, .4, 1); }
.q4 .chat { opacity: 1; transform: none; }
.chead { position: absolute; left: 0; right: 0; top: 0; height: 58px; border-bottom: 2px solid #E1E6EF; display: flex; align-items: center; gap: 10px; padding: 0 16px; }
.mini { width: 40px; height: 40px; overflow: visible; }
.ctitle { margin: 0; font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--ink); line-height: 1.1; }
.csub { margin: 2px 0 0; font-size: 12px; font-weight: 600; color: var(--mist); }

.ragb { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; padding: 4px 11px; border-radius: 999px; background: #0B2A5B; color: #7FE3F0; font-family: var(--font-display); font-size: 14px; font-weight: 800; letter-spacing: .04em;
  opacity: 0; transform: scale(.6); transition: opacity .3s ease, transform .5s cubic-bezier(.3, 1.6, .5, 1); }
.ragb i { width: 8px; height: 8px; border-radius: 50%; background: #7FE3F0; box-shadow: 0 0 6px #7FE3F0; }
.q4 .ragb { opacity: 1; transform: none; transition-delay: 1.4s; }
.still .ragb { transition-delay: 0s; }
.view { position: absolute; left: 0; right: 0; top: 62px; height: 404px; overflow: hidden; }
.msgs { position: absolute; left: 0; right: 0; top: 0; transition: transform .6s cubic-bezier(.5, 0, .3, 1); }
.pair { position: absolute; left: 16px; right: 16px; height: 204px; }
.q { position: absolute; right: 0; top: 10px; max-width: 330px; margin: 0; padding: 9px 13px; border-radius: 14px 14px 4px 14px; background: #0B2A5B; color: #FFFFFF; font-size: 14px; font-weight: 600; line-height: 1.35;
  opacity: 0; clip-path: inset(0 100% 0 0); }
.dots { position: absolute; left: 0; top: 76px; display: flex; gap: 4px; padding: 10px 12px; border-radius: 12px; background: #EEF4FF; opacity: 0; }
.dots i { width: 7px; height: 7px; border-radius: 50%; background: #1F5FD6; animation: dot .9s ease-in-out infinite; }
.dots i:nth-child(2) { animation-delay: .15s; } .dots i:nth-child(3) { animation-delay: .3s; }
@keyframes dot { 50% { transform: translateY(-4px); opacity: .5; } }
.a { position: absolute; left: 0; top: 76px; width: 400px; box-sizing: border-box; padding: 10px 13px; border-radius: 14px 14px 14px 4px; background: #EEF4FF; border: 1.5px solid #CFE0FA;
  opacity: 0; transform: translateY(8px); }
.a p { margin: 0; font-size: 14px; line-height: 1.4; color: var(--ink); }
.cites { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.cite { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: #1F5FD6; background: #FFFFFF; border: 1.5px solid #1F5FD6; border-radius: 8px; padding: 3px 8px;
  opacity: 0; transform: scale(.7); }
.cite i { width: 9px; height: 11px; border: 1.5px solid currentColor; border-radius: 2px; box-sizing: border-box; }
.cite.warn { color: #C55A0E; border-color: #F47B20; }
.contact { display: flex; align-items: center; gap: 10px; margin-top: 8px; padding: 8px 10px; background: #FFFFFF; border: 1.5px solid #F47B20; border-radius: 10px; opacity: 0; transform: scale(.8); }
.contact b { display: block; font-size: 14px; color: var(--ink); }
.contact em { font-style: normal; font-size: 12px; color: var(--mist); }
.av { width: 34px; height: 34px; border-radius: 50%; background: #F47B20; border: 2px solid #0B2A5B; box-sizing: border-box; position: relative; overflow: hidden; flex: none; }
.av i { position: absolute; left: 8px; top: 6px; width: 14px; height: 14px; border-radius: 50%; background: #F1C9A5; box-shadow: 0 -6px 0 -1px #1E1E2A; }
.input { position: absolute; left: 14px; right: 14px; bottom: 14px; height: 40px; box-sizing: border-box; border: 2px solid #E1E6EF; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; font-size: 14px; color: #9AA4B8; }
.input svg { width: 16px; height: 16px; } .input path { fill: #1F5FD6; }

.s1 .p1 .q, .s2 .p2 .q, .s3 .p3 .q { animation: ask .8s steps(14) .1s forwards; }
@keyframes ask { 0% { opacity: 1; clip-path: inset(0 100% 0 0); } 100% { opacity: 1; clip-path: inset(0 0 0 0); } }
.s1 .p1 .dots, .s2 .p2 .dots, .s3 .p3 .dots { animation: dotsOn .6s ease 1s; }
@keyframes dotsOn { 0%, 100% { opacity: 0; } 15%, 85% { opacity: 1; } }
.s1 .p1 .a, .s2 .p2 .a, .s3 .p3 .a { opacity: 1; transform: none; transition: opacity .3s ease 1.55s, transform .35s ease 1.55s; }
.s1 .p1 .cite, .s2 .p2 .cite, .s3 .p3 .contact { opacity: 1; transform: none; transition: opacity .25s ease 1.9s, transform .35s cubic-bezier(.2, 1.7, .4, 1) 1.9s; }
.s2 .p2 .c3 { transition-delay: 2.05s; }

.s2 .p1 .q, .s3 .p2 .q, .s3 .p1 .q { animation: none; opacity: 1; clip-path: none; }
.s2 .p1 .a, .s3 .p1 .a, .s3 .p2 .a, .s2 .p1 .cite, .s3 .p1 .cite, .s3 .p2 .cite { opacity: 1; transform: none; transition: none; }
.still.s1 .p1 .q, .still.s2 .p2 .q, .still.s3 .p3 .q { animation: none !important; opacity: 1 !important; clip-path: none !important; }
.illus { position: absolute; left: 700px; top: 632px; margin: 0; font-size: 12px; font-weight: 700; color: #C55A0E; border: 1.5px dashed #F47B20; border-radius: 6px; padding: 2px 8px; opacity: 0; transition: opacity .3s ease; z-index: 10; }
.s2:not(.s3) .illus { opacity: 1; transition-delay: 1.6s; }

.links { position: absolute; inset: 0; width: 1280px; height: 720px; pointer-events: none; z-index: 11; }
.lk { fill: none; stroke: #1F5FD6; stroke-width: 2; stroke-dasharray: 5 5; opacity: 0; transition: opacity .3s ease; }
.lk.l2, .lk.l3 { stroke: #F47B20; }
.s1:not(.s2) .l1 { opacity: 1; transition-delay: 2.15s; animation: march 1s linear infinite; }
.s2:not(.s3) .l2, .s2:not(.s3) .l3 { opacity: 1; transition-delay: 2.25s; animation: march 1s linear infinite; }
@keyframes march { to { stroke-dashoffset: -10; } }

.old :deep(.row) { transition: background .3s ease, border-color .3s ease !important; }
.old :deep(.row)::after { content: 'to check'; position: absolute; right: 6px; bottom: -9px; font-size: 10px; font-weight: 800; color: #FFFFFF; background: #F47B20; border-radius: 5px; padding: 0 5px; opacity: 0; transition: opacity .3s ease; }
.s1:not(.s2) .old :deep(.row:nth-child(3)) { background: #EEF4FF; border-color: #1F5FD6; transition-delay: 2.2s !important; }
.s2:not(.s3) .old :deep(.row:nth-child(2)), .s2:not(.s3) .old :deep(.row:nth-child(3)) { background: #FFF1E6; border-color: #F47B20; transition-delay: 2.3s !important; }
.s2:not(.s3) .old :deep(.row:nth-child(2))::after, .s2:not(.s3) .old :deep(.row:nth-child(3))::after { opacity: 1; transition-delay: 2.4s; }

.pvw { position: absolute; left: 862px; top: 398px; width: 196px; height: 206px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 10px; background: #FFFFFF; padding: 10px 12px; z-index: 9;
  box-shadow: 0 10px 24px rgba(11, 42, 91, .12); opacity: 0; transform: scale(.6); transform-origin: 0 0; transition: opacity .3s ease, transform .45s cubic-bezier(.2, 1.4, .4, 1); }
.s1:not(.s2) .pvw { opacity: 1; transform: none; transition-delay: 2.3s; }
.pvtitle { margin: 0 0 8px; font-size: 11.5px; font-weight: 800; color: #1F5FD6; }
.pvline { display: block; height: 6px; border-radius: 3px; background: #DDE3EC; margin-bottom: 7px; }
.pvquote { margin: 4px 0 8px; font-size: 11.5px; line-height: 1.35; color: var(--ink); }
.pvquote mark { background: linear-gradient(90deg, #CFE0FA, #CFE0FA) no-repeat 0 0 / 0% 100%; color: inherit; transition: background-size .6s ease; }
.s1:not(.s2) .pvquote mark { background-size: 100% 100%; transition-delay: 2.7s; }

.ground { position: absolute; left: 850px; right: 30px; top: 603px; height: 2px; background: linear-gradient(90deg, transparent, #D5DCE8 15%, #D5DCE8 85%, transparent); opacity: 0; transition: opacity .4s ease; z-index: 5; }
.q4 .ground { opacity: 1; }
.who { position: absolute; top: 412px; width: 112px; height: 189px; z-index: 8; opacity: 0; transition: opacity .4s ease, transform .7s cubic-bezier(.2, 1.1, .4, 1); }
.coord { left: 1110px; transform: translateX(200px); }
.q4 .coord { opacity: 1; transform: none; transition-delay: .3s; }
.tab { position: absolute; left: 34px; top: 98px; width: 44px; height: 30px; box-sizing: border-box; border-radius: 4px; background: #0B2A5B; padding: 4px; }
.tab i { display: block; width: 100%; height: 100%; border-radius: 2px; background: #DDE8FB; }
.office { left: 900px; transform: translateY(30px); }
.s3 .office { opacity: 1; transform: none; transition-delay: 2.2s; }
.glabel { position: absolute; top: 612px; margin: 0; text-align: center; opacity: 0; transition: opacity .4s ease; z-index: 8; }
.glabel b { display: block; font-family: var(--font-display); font-size: 17px; color: var(--ink); }
.glabel span { font-size: 13px; color: var(--mist); }
.gc { left: 1076px; width: 180px; } .go { left: 866px; width: 180px; }
.q4 .gc { opacity: 1; transition-delay: .7s; }
.s3 .go { opacity: 1; transition-delay: 2.5s; }
</style>
