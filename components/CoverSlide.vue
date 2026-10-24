<script setup lang="ts">

const pages = [0, 1, 2, 3, 4]
const PAGE_FILL = ['#AEB9CC', '#C3CCDB', '#D7DEE9', '#E9EDF4', '#FFFFFF']

const rows = Array.from({ length: 14 }, (_, i) => ({
  y: 70 + i * 26,
  w: 150 + ((i * 53) % 90),
  flag: [3, 8, 11].includes(i),
}))
</script>

<template>
  <div class="stage cover">
    <div class="teal" />

    <h1 class="title"><img src="/dossiercheck-logo-white.png" alt="DossierCheck"></h1>
    <p class="cvsub">AI-Assisted Document Review and Process Improvement in Clinical Research</p>
    <p class="course">Faculty of Information Engineering, Computer Science and Statistics<br>Department of Computer, Control and Management Engineering “Antonio Ruberti” (DIAG)<br>Master’s Degree in Management Engineering · Business Intelligence and Analytics</p>
    <p class="kind">Master’s Thesis</p>

    <img class="sap" src="/sapienza-banner.png" alt="Sapienza Università di Roma">
    <div class="people">
      <div><dt>Candidate</dt><dd>Paolo Rubino</dd><span>Student ID 1989954</span></div>
      <div><dt>Supervisor</dt><dd>Laura Palagi</dd></div>
      <div><dt>Co-supervisors</dt><dd>Silvia Romano<br>Giovanni Ristori</dd></div>
      <div><dt>External Co-supervisor</dt><dd>Marco Salvetti</dd></div>
    </div>
    <p class="year">Academic Year 2025/2026</p>

    <svg class="dossier" viewBox="0 0 420 520" aria-hidden="true">
      <defs>
        <linearGradient id="cv-scan" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#1F5FD6" stop-opacity="0" />
          <stop offset="1" stop-color="#1F5FD6" stop-opacity="0.35" />
        </linearGradient>
        <clipPath id="cv-front"><rect x="80" y="40" width="280" height="420" rx="6" /></clipPath>
        <filter id="cv-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity=".22" /></filter>
      </defs>
      <g filter="url(#cv-shadow)">
        <g v-for="p in pages" :key="p" :transform="`rotate(${(p - 4) * 3.2} 220 460) translate(${(4 - p) * -6} ${(4 - p) * 4})`">
          <rect x="80" y="40" width="280" height="420" rx="6" class="page" :style="{ fill: PAGE_FILL[p] }" />
        </g>
      </g>
      <g>
        <rect
          v-for="(r, i) in rows" :key="i"
          x="110" :y="r.y" :width="r.w" height="7" rx="3.5"
          :class="['row', { flag: r.flag }]"
          :style="{ animationDelay: `${(r.y - 40) / 480 * 4.6 - 0.28}s` }"
        />
      </g>
      <g clip-path="url(#cv-front)">
        <rect x="80" y="-40" width="280" height="80" fill="url(#cv-scan)" class="scanbar" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.cover { background: #822434; }
.teal { position: absolute; left: 0; top: 0; width: 1280px; height: 364px; background: #006778; clip-path: polygon(0 0, 100% 0, 100% 300px, 290px 300px, 290px 100%, 0 100%); }

.title { position: absolute; left: 40px; top: 52px; margin: 0; line-height: 0; }
.title img { display: block; width: 400px; }
.cvsub { opacity: 1 !important; position: absolute; left: 40px; top: 126px; margin: 0; max-width: 34ch; font-size: 22px; line-height: 1.3; color: #FFFFFF; }
.course { position: absolute; left: 40px; top: 212px; margin: 0; font-size: 15.5px; line-height: 1.5; font-weight: 600; color: rgba(255, 255, 255, .8); }
.kind { position: absolute; left: 40px; top: 300px; height: 64px; margin: 0; display: flex; align-items: center; font-family: var(--font-display); font-size: 26px; font-weight: 700; color: rgba(255, 255, 255, .78); }

.sap { position: absolute; left: 31px; top: 388px; height: 90px; }
.people { position: absolute; left: 40px; top: 516px; display: grid; grid-template-columns: repeat(4, auto); justify-content: start; gap: 34px; }
.people dt { font-size: 12.5px; color: rgba(255, 255, 255, .68); white-space: nowrap; }
.people dd { margin: 3px 0 0; font-size: 16px; font-weight: 600; line-height: 1.3; color: #FFFFFF; white-space: nowrap; }
.people span { display: block; margin-top: 2px; font-size: 12px; color: rgba(255, 255, 255, .68); white-space: nowrap; }
.year { position: absolute; left: 40px; top: 626px; margin: 0; font-size: 13px; color: rgba(255, 255, 255, .68); }

.dossier { position: absolute; left: 836px; top: 92px; width: 420px; height: 520px; overflow: visible; }
.page { stroke: #0B2A5B; stroke-opacity: .18; stroke-width: 1.2; }
.row { fill: #DDE3EC; animation: row 4.6s ease-in-out infinite; }
.row.flag { animation-name: rowflag; }
.scanbar { animation: scan 4.6s linear infinite; }
@keyframes scan { from { transform: translateY(0); } to { transform: translateY(480px); } }
@keyframes row { 0%, 100% { fill: #DDE3EC; } 6% { fill: #B9C4D6; } 14% { fill: #DDE3EC; } }
@keyframes rowflag { 0% { fill: #DDE3EC; } 6%, 80% { fill: #F47B20; } 100% { fill: #DDE3EC; } }
</style>
