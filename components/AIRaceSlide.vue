<script setup lang="ts">
import { computed, unref } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const step = computed(() => unref($clicks) as number)

const methods = [
  { key: 'moe', label: 'Mixture of Experts' },
  { key: 'kg', label: 'Knowledge Graphs' },
  { key: 'emb', label: 'Vector Embeddings' },
]

function methodStyle(i: number) {
  if (step.value >= 2) return { transform: `translate(${712 + i * 184}px, 104px) scale(.43)`, opacity: 1 }
  return {
    transform: `translate(830px, ${100 + i * 176}px) scale(1)`,
    opacity: step.value >= 1 ? 1 : 0,
    transitionDelay: step.value === 1 ? `${0.35 + i * 0.25}s` : '0s',
  }
}
</script>

<template>
  <div class="stage">
    <h2 class="display heading">AI is Accelerating Every Day</h2>

    <div class="chart-box" :class="{ side: step === 1, narrow: step >= 2 }">
      <AIRaceChart :step="step" />
    </div>

    <div
      v-for="(m, i) in methods" :key="m.key"
      class="method" :class="{ mini: step >= 2 }" :style="methodStyle(i)"
    >
      <div class="art">
        <MethodMoE v-if="m.key === 'moe'" />
        <MethodGraph v-else-if="m.key === 'kg'" />
        <MethodEmbed v-else />
      </div>
      <p class="label">{{ m.label }}</p>
    </div>

    <div class="blobs" :class="{ on: step >= 2 }">
      <LiquidBlobs />
    </div>
    <p class="display future-caption" :class="{ on: step >= 2 }">The future seems<br>so unpredictable</p>
  </div>
</template>

<style scoped>
.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); }

.chart-box {
  position: absolute; left: 200px; top: 110px; width: 880px;
  transform-origin: 0 50%;
  transition: transform 1s cubic-bezier(.65, 0, .25, 1);
}
.chart-box.side { transform: translate(-150px, 18px) scale(.8); }
.chart-box.narrow { transform: translate(-150px, 18px) scale(.72); }

.method {
  position: absolute; left: 0; top: 0; width: 400px;
  transform-origin: 0 0;
  transition: transform 1s cubic-bezier(.65, 0, .25, 1), opacity .7s ease;
}
.art { height: 124px; padding: 10px 14px; background: var(--surface); border: 1px solid #E1E6EF; border-radius: 14px; transition: border-radius 1s; }
.method.mini .art { border-radius: 26px; }
.label { margin: 10px 0 0 4px; font-size: 17px; font-weight: 500; color: var(--ink); white-space: nowrap; transition: font-size 1s cubic-bezier(.65, 0, .25, 1), margin 1s; }
.method.mini .label { font-size: 36px; margin-top: 14px; font-weight: 600; }

.blobs {
  position: absolute; left: 760px; top: 196px; width: 440px; height: 330px;
  opacity: 0; transform: scale(.6); transform-origin: 50% 40%;
  transition: opacity 1s ease .5s, transform 1.4s cubic-bezier(.2, .8, .2, 1) .5s;
}
.blobs.on { opacity: 1; transform: scale(1); }
.future-caption {
  position: absolute; left: 760px; width: 440px; top: 548px; margin: 0; text-align: center;
  font-size: 34px; line-height: 1.12; font-weight: 600; color: var(--ink);
  opacity: 0; transform: translateY(14px);
  transition: opacity .8s ease 1.2s, transform .8s cubic-bezier(.2, .8, .2, 1) 1.2s;
}
.future-caption.on { opacity: 1; transform: none; }
</style>
