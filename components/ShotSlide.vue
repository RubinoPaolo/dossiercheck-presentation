<script setup lang="ts">

import { ref, watch } from 'vue'
import { useIsSlideActive } from '@slidev/client'
const zoom = ref('')
const zsize = ref<Record<string, string>>({})

function fit(e: Event) {
  const im = e.target as HTMLImageElement
  const k = Math.min(1240 / im.naturalWidth, 690 / im.naturalHeight)
  zsize.value = { width: `${Math.round(im.naturalWidth * k)}px`, height: `${Math.round(im.naturalHeight * k)}px` }
}
watch(useIsSlideActive(), () => { zoom.value = '' })
defineProps<{
  title: string
  shots: { src: string, label?: string }[]
}>()
</script>

<template>
  <div class="stage">
    <h2 class="display heading">{{ title }}</h2>
    <span class="tag"><i />App screenshot</span>
    <div class="row" :class="{ two: shots.length > 1 }">
      <figure v-for="s in shots" :key="s.src" class="shot">
        <p v-if="s.label" class="lab">{{ s.label }}</p>
        <div class="frame" @click="zoom = s.src"><img :src="s.src" :alt="s.label || title"></div>
      </figure>
    </div>
    <div class="zoom" :class="{ on: zoom }" @click="zoom = ''"><img v-if="zoom" :key="zoom" :src="zoom" alt="" :style="zsize" @load="fit"></div>
  </div>
</template>

<style scoped>
.stage { position: absolute; inset: 0; background: #FFFFFF; }
.heading { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 34px; font-weight: 600; color: var(--ink); white-space: nowrap; }
.tag { position: absolute; right: 72px; top: 50px; display: flex; align-items: center; gap: 7px; padding: 5px 12px; border-radius: 999px; background: #EEF4FF; color: #1F5FD6; font-size: 13px; font-weight: 700; }
.tag i { width: 8px; height: 8px; border-radius: 50%; background: #F47B20; }
.row { position: absolute; left: 72px; right: 72px; top: 112px; height: 560px; display: flex; align-items: center; justify-content: center; gap: 28px; }
.shot { margin: 0; display: flex; flex-direction: column; align-items: center; max-width: 100%; max-height: 100%; }
.two { align-items: flex-start; padding-top: 150px; box-sizing: border-box; }
.two .shot { flex: 1; min-width: 0; }
.lab { margin: 0 0 8px; align-self: flex-start; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--mist); }
.frame { cursor: zoom-in; border: 2px solid #0B2A5B; border-radius: 14px; overflow: hidden; background: #FFFFFF; box-shadow: 0 14px 34px rgba(11, 42, 91, .12); line-height: 0; }
.frame img { display: block; max-width: 100%; max-height: 556px; width: auto; height: auto; }
.two .frame img { width: 100%; max-height: none; }
.zoom { position: absolute; inset: 0; z-index: 300; display: grid; place-items: center; background: rgba(11, 42, 91, .55); opacity: 0; pointer-events: none; transition: opacity .25s ease; cursor: zoom-out; }
.zoom.on { opacity: 1; pointer-events: auto; }
.zoom img { border-radius: 12px; border: 2px solid #0B2A5B; background: #FFFFFF; box-shadow: 0 20px 50px rgba(0, 0, 0, .3); }
</style>
