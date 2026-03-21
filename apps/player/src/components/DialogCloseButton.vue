<script setup lang="ts">
defineEmits<{ click: [] }>();
</script>

<template>
  <button
    type="button"
    class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-aikido-800 bg-aikido-950 text-mist transition hover:border-aikido-500/30 hover:text-white"
    aria-label="Close dialog"
    @click="$emit('click')"
  >
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      class="h-5 w-5"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6l-12 12" />
    </svg>
  </button>
</template>
