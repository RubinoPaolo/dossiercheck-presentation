<script setup lang="ts">

import { useSlideContext } from '@slidev/client'
const { $page } = useSlideContext()
</script>

<template>
  <div v-if="$page > 1" class="slide-num">{{ $page - 1 }}</div>
</template>

<style scoped>
.slide-num { position: absolute; right: 28px; bottom: 14px; z-index: 200; font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--mist); font-variant-numeric: tabular-nums; pointer-events: none; }
</style>
