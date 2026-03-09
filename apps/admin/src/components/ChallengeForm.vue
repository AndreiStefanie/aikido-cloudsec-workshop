<script setup lang="ts">
import type {
  AdminChallengeSummary,
  UpsertChallengeInput,
} from '@workshop/shared';
import { reactive, watch } from 'vue';

const props = defineProps<{ modelValue?: AdminChallengeSummary | null }>();
const emit = defineEmits<{ submit: [payload: UpsertChallengeInput] }>();

const form = reactive<UpsertChallengeInput>({
  slug: '',
  name: '',
  description: '',
  joinCode: '',
  joinPassword: '',
  isActive: true,
});

watch(
  () => props.modelValue,
  value => {
    form.slug = value?.slug ?? '';
    form.name = value?.name ?? '';
    form.description = value ? `Workshop challenge for ${value.name}` : '';
    form.joinCode = value?.joinCode ?? '';
    form.joinPassword = '';
    form.isActive = value?.isActive ?? true;
  },
  { immediate: true }
);
</script>

<template>
  <form class="card p-6" @submit.prevent="emit('submit', { ...form })">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-2xl text-slate-900">
        {{ props.modelValue ? 'Edit challenge' : 'New challenge' }}
      </h2>
      <label
        class="flex items-center gap-2 text-sm font-semibold text-slate-700"
      >
        <input
          v-model="form.isActive"
          type="checkbox"
          class="rounded border-slate-300"
        />
        Active
      </label>
    </div>
    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Name</span>
        <input
          v-model="form.name"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          required
        />
      </label>
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Slug</span>
        <input
          v-model="form.slug"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          required
        />
      </label>
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Join code</span>
        <input
          v-model="form.joinCode"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          required
        />
      </label>
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Password</span>
        <input
          v-model="form.joinPassword"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
        />
      </label>
      <label class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">Description</span>
        <textarea
          v-model="form.description"
          rows="4"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          required
        />
      </label>
    </div>
    <button
      type="submit"
      class="mt-5 rounded-2xl bg-aikido-500 px-5 py-3 font-semibold text-white transition hover:bg-[#5641d9]"
    >
      Save challenge
    </button>
  </form>
</template>
