<script setup lang="ts">
import { reactive } from 'vue';

const emit = defineEmits<{ submit: [username: string, password: string] }>();
const form = reactive({ username: '', password: '' });
</script>

<template>
  <section class="card mx-auto max-w-md p-8">
    <div class="badge badge-primary">Aikido CloudSec Workshops</div>
    <h1 class="mt-4 font-display text-3xl text-aikido-950">Admin Panel</h1>
    <form
      class="mt-6 space-y-4"
      @submit.prevent="emit('submit', form.username, form.password)"
    >
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Username</span>
        <input
          v-model="form.username"
          class="w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
        />
      </label>
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Password</span>
        <input
          v-model="form.password"
          type="password"
          class="w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
        />
      </label>
      <button
        type="submit"
        class="w-full rounded-2xl bg-aikido-500 px-4 py-3 font-semibold text-white transition hover:bg-[#5641d9]"
      >
        Login
      </button>
    </form>
  </section>
</template>
