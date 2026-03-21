<script setup lang="ts">
defineProps<{
  tone?: 'default' | 'mint';
}>();

defineEmits<{ click: [] }>();
</script>

<template>
  <button
    type="button"
    class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:text-slate-900"
    :class="
      tone === 'mint'
        ? 'hover:border-mint-500/30'
        : 'hover:border-aikido-500/30'
    "
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
