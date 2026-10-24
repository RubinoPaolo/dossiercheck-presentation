<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

const props = defineProps<{ frozen?: boolean, leaving?: boolean }>()
const { $clicks } = useSlideContext()
const clicks = computed(() => props.frozen ? 5 : unref($clicks) as number)
const active = useIsSlideActive()
const zoom = ref(false)
const closing = ref(false)
const jump = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
function clearTimers() { timers.splice(0).forEach(clearTimeout) }
watch(active, (a) => {
  clearTimers(); closing.value = false
  if (props.frozen) { jump.value = true; zoom.value = true; requestAnimationFrame(() => requestAnimationFrame(() => { jump.value = false })); return }
  if (!a) { zoom.value = false; return }
  if (clicks.value > 0) {
    jump.value = true; zoom.value = true
    requestAnimationFrame(() => requestAnimationFrame(() => { jump.value = false }))
    return
  }
  zoom.value = false
  later(450, () => { zoom.value = true })
}, { immediate: true })
watch(clicks, () => { if (!props.frozen) { clearTimers(); closing.value = false } })
onBeforeUnmount(clearTimers)
</script>

<template>
  <div class="stage hz" :class="[`k${clicks}`, { zoom, closing, jump, still: frozen, leaving: frozen && leaving, hl: zoom && clicks >= 1 && !closing }]">
    <h2 class="display heading">
      <span :class="{ on: !zoom || closing || (frozen && leaving) }">Automatic Analysis</span>
      <span :class="{ on: zoom && !closing && !(frozen && leaving) }">Inside the Harness</span>
    </h2>

    <div class="oldw"><AnalysisSlide frozen class="old" /></div>

    <div class="mech"><Mecha core="chest" /></div>

    <svg viewBox="0 0 1280 720" class="leaders">
      <path d="M392 330 H560" class="ld l-torso" />
      <path d="M440 300 H560" class="ld l-arms" />
      <path d="M352 372 H560" class="ld l-core" />
      <path d="M372 562 H560" class="ld l-legs" />
      <path d="M368 196 H560" class="ld l-head" />
    </svg>
    <p class="tag t-torso" style="top: 314px"><i class="sw" style="background: #0B2A5B" />Document intake</p>
    <p class="tag t-arms" style="top: 284px"><i class="sw" style="background: #F47B20" />Requirements</p>
    <p class="tag t-core" style="top: 356px"><i class="sw" style="background: #7FD3FF" />GPT-4o core</p>
    <p class="tag t-legs" style="top: 546px"><i class="sw" style="background: #1F5FD6" />Rules</p>
    <p class="tag t-head" style="top: 180px"><i class="sw" style="background: #C49A3E" />Output checks</p>

    <div class="panel" :class="{ on: zoom && clicks >= 1 && !closing }">

      <section class="p p1" :class="{ on: clicks === 1 }">
        <p class="ph"><b>1</b>Selected file versions</p>
        <div class="files">
          <div v-for="(f, k) in [['Protocol', 'v2', '#a3f9'], ['Consent form', 'v1', '#7c21'], ['Information sheet', 'v3', '#e04b']]" :key="k" class="fc" :style="{ '--k': `${k * 0.15}s` }">
            <svg viewBox="0 0 40 50" class="fi"><path d="M3 3 H27 L37 13 V47 H3 Z" /><path d="M27 3 V13 H37" /><path d="M9 21 h22 M9 28 h22 M9 35 h14" class="fl" /></svg>
            <p class="fn">{{ f[0] }} <span>{{ f[1] }}</span></p>
            <span class="hash">{{ f[2] }}</span>
          </div>
        </div>
        <p class="cap">DossierCheck takes the selected file versions, each identified by a hash.</p>
      </section>

      <section class="p p2" :class="{ on: clicks === 2 }">
        <p class="ph"><b>2</b>Extraction & classification</p>
        <div class="page"><i v-for="n in 8" :key="n" class="pl" :class="{ x: [2, 5].includes(n) }" :style="{ width: `${[86, 70, 90, 64, 82, 74, 88, 52][n - 1]}%` }" /><i class="scan" /></div>
        <div class="pass">
          <p class="psg" style="--k: 1.1s"><i class="pin" />“…followed for 12 months…”<span>Protocol · p. 4</span></p>
          <p class="psg" style="--k: 1.5s"><i class="pin" />“…a venous blood sample…”<span>Protocol · p. 6</span></p>
        </div>
        <div class="types">
          <span class="ty" style="--k: 2.1s"><i class="tfi" />Protocol</span>
          <span class="ty" style="--k: 2.25s"><i class="tfi" />Consent form</span>
          <span class="ty" style="--k: 2.4s"><i class="tfi" />Information sheet</span>
        </div>
        <p class="cap">Text and position of each passage; every file classified by type.</p>
      </section>

      <section class="p p3" :class="{ on: clicks === 3 }">
        <p class="ph"><b>3</b>Checks on each applicable requirement</p>
        <div class="lane rules">
          <p class="lh"><svg viewBox="0 0 32 32" class="gear"><circle cx="16" cy="16" r="5" /><path d="M16 3 v5 M16 24 v5 M3 16 h5 M24 16 h5 M7 7 l3.5 3.5 M21.5 21.5 L25 25 M7 25 l3.5 -3.5 M21.5 10.5 L25 7" /></svg>Deterministic rules</p>
          <p class="rr" style="--k: 1.2s">Consent form present<b class="ok">✓</b></p>
          <p class="rr" style="--k: 1.45s">Study identifier matches<b class="ko">✗</b></p>
        </div>
        <div class="lane model">
          <p class="lh"><i class="gchip">GPT-4o</i>Targeted calls</p>
          <span class="att"><b class="a1">attempt 1/2</b><b class="a2">attempt 2/2</b></span>
          <p class="ask" style="--k: 2.3s">Same study duration in both documents?</p>
          <div class="jwrap">
            <div class="jbad"><p>{ "outcome": "Fail",</p><p>&nbsp;&nbsp;"severity": "Med</p><span class="jerr">invalid format · same request repeated</span></div>
            <div class="json">
              <p><span>outcome</span><b class="fail">Fail</b></p>
              <p><span>severity</span><b>Medium</b></p>
              <p><span>evidence</span><b>Protocol p. 4 · Info sheet p. 2</b></p>
            </div>
          </div>
          <p class="jcap">Structured answer format: if it is not respected, the same request is repeated (at most 2 attempts)</p>
        </div>
      </section>

      <section class="p p4" :class="{ on: clicks === 4 }">
        <p class="ph"><b>4</b>Output verification</p>
        <div class="vf va">
          <p class="vt">Study duration differs between documents</p>
          <p class="vc" style="--k: .7s"><i class="vb ok">✓</i>Refers to a requirement</p>
          <p class="vc" style="--k: 1.1s"><i class="vb ok">✓</i>Carries its evidence <span>Protocol p. 4 · Info sheet p. 2</span></p>
          <span class="verdict ok" style="--k: 1.6s">→ Report</span>
        </div>
        <div class="vf vb2">
          <p class="vt">Blood sample type not stated</p>
          <p class="vc" style="--k: 2.4s"><i class="vb ok">✓</i>Refers to a requirement</p>
          <p class="vc" style="--k: 2.8s"><i class="vb ko">✗</i>Carries its evidence <span>none found</span></p>
          <span class="verdict ko" style="--k: 3.3s">Not reported</span>
        </div>
        <p class="cap">Every finding must refer to a requirement and carry its evidence.</p>
      </section>

      <section class="p p5" :class="{ on: clicks >= 5 }">
        <p class="big1">The model does not decide<br>what to read or when to stop.</p>
        <p class="big2">The procedure does.</p>
        <p class="cap">The main concept of the harness.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.jump, .jump * { transition: none !important; }
.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); z-index: 30; }
.heading span { position: absolute; left: 0; top: 0; white-space: nowrap; opacity: 0; transform: translateY(10px); transition: opacity .5s ease, transform .5s ease; }
.heading span.on { opacity: 1; transform: none; transition-delay: .3s; }
.heading span:first-child { position: relative; }

.oldw { position: absolute; inset: 0; z-index: 1; transition: opacity .6s ease; }
.old :deep(.heading) { opacity: 0; }
.zoom .old :deep(.mecha) { opacity: 0 !important; }
.zoom .oldw { opacity: 0; }
.zoom.closing .oldw { opacity: 1; transition: opacity .6s ease .7s; }
.mech { position: absolute; left: 560px; top: 222px; width: 320px; height: 400px; z-index: 6; transform-origin: 0 0; transition: transform 1.3s cubic-bezier(.6, 0, .3, 1); }
.zoom .mech { transform: translate(-470px, -110px) scale(1.375); }
.zoom.closing .mech { transform: none; }

.mech :deep(.part), .mech :deep(.core) { transition: opacity .45s ease, filter .45s ease !important; }
.hl .mech :deep(.part), .hl .mech :deep(.core) { opacity: .22; filter: grayscale(.8); }
.k1 .mech :deep(.torso), .k2 .mech :deep(.torso),
.k3 .mech :deep(.arml), .k3 .mech :deep(.armr), .k3 .mech :deep(.legs), .k3 .mech :deep(.core),
.k4 .mech :deep(.head), .k5 .mech :deep(.part), .k5 .mech :deep(.core) {
  opacity: 1; filter: drop-shadow(0 0 4px rgba(244, 123, 32, .9)) drop-shadow(0 0 12px rgba(244, 123, 32, .5)); }

.k3 .mech :deep(.legs) { transition-delay: .9s !important; }
.k3 .mech :deep(.core) { transition-delay: 2s !important; }
.k5 .mech :deep(.part), .k5 .mech :deep(.core) { filter: drop-shadow(0 0 4px rgba(31, 95, 214, .8)) drop-shadow(0 0 12px rgba(79, 184, 255, .5)); }
.closing .mech :deep(.part), .closing .mech :deep(.core) { opacity: 1 !important; filter: none !important; }

.leaders { position: absolute; inset: 0; width: 1280px; height: 720px; z-index: 7; pointer-events: none; }
.ld { fill: none; stroke: #0B2A5B; stroke-width: 2; stroke-dasharray: 3 4; opacity: 0; transition: opacity .35s ease; }
.tag { position: absolute; left: 566px; margin: 0; z-index: 8; display: flex; align-items: center; gap: 8px; padding: 5px 12px 5px 9px; border: 2px solid #0B2A5B; border-radius: 999px; background: #FFFFFF;
  font-family: var(--font-display); font-size: 15px; font-weight: 800; color: var(--ink); white-space: nowrap; opacity: 0; transform: translateX(-10px); transition: opacity .35s ease, transform .4s ease; }
.sw { width: 12px; height: 12px; border-radius: 3px; }
.k1 .t-torso, .k2 .t-torso, .k3 .t-arms, .k3 .t-legs, .k3 .t-core, .k4 .t-head,
.k1 .l-torso, .k2 .l-torso, .k3 .l-arms, .k3 .l-legs, .k3 .l-core, .k4 .l-head { opacity: 1; transform: none; }
.k3 .t-legs, .k3 .l-legs { transition-delay: .9s; } .k3 .t-core, .k3 .l-core { transition-delay: 2s; }
.closing .tag, .closing .ld { opacity: 0 !important; transition-delay: 0s !important; }

.panel { position: absolute; left: 734px; top: 128px; width: 490px; height: 524px; box-sizing: border-box; border: 2px solid #0B2A5B; border-radius: 18px; background: #FFFFFF; box-shadow: 0 12px 30px rgba(11, 42, 91, .1); z-index: 9;
  opacity: 0; transform: translateX(30px); transition: opacity .45s ease, transform .5s cubic-bezier(.3, 1.2, .5, 1); overflow: hidden; }
.panel.on { opacity: 1; transform: none; }
.p { position: absolute; inset: 0; padding: 22px 26px; opacity: 0; transition: opacity .3s ease; }
.p.on { opacity: 1; transition-delay: .2s; }
.ph { display: flex; align-items: center; gap: 10px; margin: 0; font-family: var(--font-display); font-size: 23px; font-weight: 800; color: var(--ink); }
.ph b { flex: none; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: #F47B20; color: #FFFFFF; font-size: 17px; }
.cap { position: absolute; left: 26px; right: 26px; bottom: 22px; margin: 0; font-size: 16px; line-height: 1.35; color: var(--mist); }
.fi { fill: #FFFFFF; stroke: #0B2A5B; stroke-width: 2.4; stroke-linejoin: round; }
.fi .fl { stroke: #B4C2DA; stroke-width: 3; stroke-linecap: round; }
@keyframes fin { to { opacity: 1; transform: none; } }
@keyframes stamp { to { opacity: 1; transform: none; } }

.files { display: flex; justify-content: space-between; margin-top: 56px; }
.fc { position: relative; width: 134px; display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0; transform: translateY(18px); }
.p1.on .fc { animation: fin .5s cubic-bezier(.3, 1.4, .5, 1) calc(.3s + var(--k)) both; }
.fc .fi { width: 64px; height: 80px; }
.fn { margin: 0; font-size: 15px; font-weight: 700; color: var(--ink); text-align: center; }
.fn span { color: #1F5FD6; }
.hash { padding: 4px 10px; border-radius: 8px; background: #0B2A5B; color: #7FE3F0; font-family: ui-monospace, monospace; font-size: 15px; font-weight: 700; opacity: 0; transform: scale(1.8) rotate(-8deg); }
.p1.on .hash { animation: stamp .5s cubic-bezier(.3, 1.6, .5, 1) calc(1.2s + var(--k)) both; }

.page { position: absolute; left: 26px; top: 84px; width: 150px; height: 196px; box-sizing: border-box; padding: 22px 16px; border: 2.5px solid #0B2A5B; border-radius: 6px; background: #FFFFFF; overflow: hidden; }
.pl { display: block; height: 5px; margin-bottom: 15px; border-radius: 3px; background: #D5DCE8; }
.pl.x { background: #FFD9B8; }
.scan { position: absolute; left: 0; right: 0; top: -20px; height: 20px; background: linear-gradient(rgba(79, 184, 255, 0), rgba(79, 184, 255, .55)); }
.p2.on .scan { animation: scanp 1.3s linear .3s both; }
@keyframes scanp { to { transform: translateY(216px); } }
.pass { position: absolute; left: 196px; top: 92px; right: 22px; display: flex; flex-direction: column; gap: 12px; }
.psg { position: relative; margin: 0; padding: 8px 10px 8px 26px; border: 2px solid #D5DCE8; border-radius: 10px; font-size: 14px; color: var(--ink); opacity: 0; transform: translateX(-40px); }
.psg span { display: block; margin-top: 2px; font-size: 12.5px; font-weight: 700; color: #C55A0E; }
.pin { position: absolute; left: 9px; top: 12px; width: 9px; height: 9px; border-radius: 50%; background: #F47B20; }
.p2.on .psg { animation: fin .55s cubic-bezier(.3, 1.3, .5, 1) var(--k) both; }
.types { position: absolute; left: 26px; right: 26px; top: 304px; display: flex; flex-wrap: wrap; gap: 10px; }
.ty { display: inline-flex; align-items: center; gap: 7px; padding: 7px 13px; border-radius: 999px; background: #E6EEFC; color: #1F5FD6; font-weight: 800; font-size: 15px; opacity: 0; transform: scale(.6); }
.tfi { width: 11px; height: 14px; border: 2px solid #1F5FD6; border-radius: 2px; }
.p2.on .ty { animation: stamp .45s cubic-bezier(.3, 1.6, .5, 1) var(--k) both; }

.p3 .ph { font-size: 21px; }
.lane { position: absolute; left: 26px; right: 26px; box-sizing: border-box; padding: 12px 14px; border-radius: 12px; opacity: 0; transform: translateY(12px); }
.rules { top: 76px; background: #F7F9FD; border: 2px solid #1F5FD6; }
.model { top: 214px; bottom: 22px; background: #F2F8FF; border: 2px solid #7FD3FF; }
.p3.on .rules { animation: fin .45s ease .9s both; }
.p3.on .model { animation: fin .45s ease 2s both; }
.lh { display: flex; align-items: center; gap: 8px; margin: 0 0 8px; font-weight: 800; font-size: 15px; color: var(--ink); }
.gear { width: 22px; height: 22px; fill: none; stroke: #0B2A5B; stroke-width: 2.4; stroke-linecap: round; }
.p3.on .gear { animation: spin 2s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.rr { display: flex; justify-content: space-between; margin: 6px 0 0; padding: 5px 10px; border-radius: 8px; background: #FFFFFF; font-size: 14.5px; color: var(--ink); opacity: 0; }
.p3.on .rr { animation: fin .4s ease var(--k) both; }
.rr b { font-size: 16px; } .rr .ok { color: #1F9D55; } .rr .ko { color: #D64545; }
.gchip { padding: 3px 9px; border-radius: 999px; background: #0B2A5B; color: #7FE3F0; font-style: normal; font-size: 13px; font-family: var(--font-display); }
.ask { margin: 4px 0 0; padding: 7px 10px; border-radius: 8px; border: 2px dashed #7FB0F0; background: #FFFFFF; font-size: 14.5px; color: var(--ink); opacity: 0; }
.p3.on .ask { animation: fin .45s ease var(--k) both; }
.lane.model { position: absolute; }
.att { position: absolute; right: 14px; top: 13px; font-family: ui-monospace, monospace; font-size: 12.5px; font-weight: 700; }
.att b { position: absolute; right: 0; top: 0; white-space: nowrap; padding: 2px 8px; border-radius: 999px; opacity: 0; }
.att .a1 { background: #FDE8E8; color: #D64545; } .att .a2 { background: #E6F6EC; color: #1F9D55; }
.p3.on .a1 { animation: fin .3s ease 2.9s both, out .3s ease 4.3s forwards; }
.p3.on .a2 { animation: fin .3s ease 4.4s both; }
@keyframes out { to { opacity: 0; } }
.jwrap { position: relative; height: 92px; margin-top: 10px; }
.jbad { position: absolute; inset: 0; box-sizing: border-box; padding: 9px 12px; border-radius: 10px; background: #2A1520; border: 2px solid #E25454; font-family: ui-monospace, monospace; font-size: 13.5px; color: #FFD0D0; opacity: 0; }
.jbad p { margin: 2px 0; }
.jerr { position: absolute; left: 12px; bottom: 8px; font-family: var(--font-body); font-size: 12.5px; font-weight: 800; color: #FF8A8A; }
.p3.on .jbad { animation: fin .35s ease 2.9s both, shake .4s ease 3.25s, out .35s ease 4.2s forwards; }
@keyframes shake { 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
.json { position: absolute; inset: 0; padding: 9px 12px; border-radius: 10px; background: #0B2A5B; font-family: ui-monospace, monospace; font-size: 13.5px; opacity: 0; transform: translateY(14px); }
.json p { display: flex; gap: 10px; margin: 2px 0; }
.json span { width: 72px; color: #8FB4E8; } .json b { color: #FFFFFF; font-weight: 700; } .json .fail { color: #FFB27A; }
.p3.on .json { animation: fin .5s cubic-bezier(.3, 1.3, .5, 1) 4.45s both; }
.jcap { margin: 8px 0 0; font-size: 13px; font-weight: 700; line-height: 1.3; color: #1F5FD6; opacity: 0; }
.p3.on .jcap { animation: fin .4s ease 4.9s both; }

.leaving .mech { animation: mechOut 1.3s cubic-bezier(.6, 0, .3, 1) .1s both; }
@keyframes mechOut { from { transform: translate(-470px, -110px) scale(1.375); } to { transform: none; } }
.leaving .oldw { animation: oldIn .6s ease .8s both; }
@keyframes oldIn { from { opacity: 0; } to { opacity: 1; } }
.leaving .panel { animation: panelOut .4s ease .1s both; }
@keyframes panelOut { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateX(30px); } }
.leaving .mech :deep(.part), .leaving .mech :deep(.core) { animation: unglow .6s ease .1s both; }
@keyframes unglow { from { filter: drop-shadow(0 0 4px rgba(31, 95, 214, .8)) drop-shadow(0 0 12px rgba(79, 184, 255, .5)); } to { filter: none; } }

.still .p5 .big1, .still .p5 .big2, .still .p5 .cap { animation: none !important; opacity: 1; transform: none; }

.vf { position: absolute; left: 26px; right: 26px; box-sizing: border-box; padding: 12px 16px; border: 2px solid #0B2A5B; border-radius: 14px; background: #FFFFFF; opacity: 0; transform: translateY(14px); }
.va { top: 80px; } .vb2 { top: 254px; }
.p4.on .va { animation: fin .45s ease .25s both; }
.p4.on .vb2 { animation: fin .45s ease 1.95s both, reject .5s ease 3.4s forwards; }
@keyframes reject { to { opacity: 1; transform: none; border-color: #E8B4B4; background: #FFF8F8; } }
.vt { margin: 0 0 8px; padding-right: 110px; font-family: var(--font-display); font-size: 17px; font-weight: 800; color: var(--ink); }
.vc { display: flex; align-items: center; gap: 9px; margin: 6px 0 0; font-size: 14.5px; color: var(--ink); opacity: 0; transform: translateX(-10px); }
.vc span { margin-left: auto; font-size: 12.5px; font-weight: 700; color: var(--mist); }
.p4.on .vc { animation: fin .35s ease var(--k) both; }
.vb { flex: none; display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; color: #FFFFFF; font-style: normal; font-weight: 800; font-size: 13px; }
.vb.ok { background: #1F9D55; } .vb.ko { background: #D64545; }
.verdict { position: absolute; right: 14px; top: 12px; padding: 3px 11px; border-radius: 999px; font-weight: 800; font-size: 13.5px; opacity: 0; transform: scale(1.6) rotate(-6deg); }
.verdict.ok { background: #E6F6EC; color: #1F9D55; } .verdict.ko { background: #FDE8E8; color: #D64545; }
.p4.on .verdict { animation: stamp .45s cubic-bezier(.3, 1.6, .5, 1) var(--k) both; }

.p5 { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 0 34px; }
.big1 { margin: 0; font-family: var(--font-display); font-size: 30px; font-weight: 700; line-height: 1.2; color: var(--mist); opacity: 0; transform: translateY(12px); }
.big2 { margin: 18px 0 0; font-family: var(--font-display); font-size: 38px; line-height: 1.1; white-space: nowrap; font-weight: 800; color: #F47B20; opacity: 0; transform: translateY(12px); }
.p5.on .big1 { animation: fin .55s ease .3s both; }
.p5.on .big2 { animation: fin .6s cubic-bezier(.3, 1.4, .5, 1) 1.4s both; }
.p5 .cap { opacity: 0; }
.p5.on .cap { animation: fin .4s ease 2.2s both; }
</style>
