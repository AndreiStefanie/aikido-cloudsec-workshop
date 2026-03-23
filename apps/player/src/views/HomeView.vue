<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

import WorkshopLockup from '../components/WorkshopLockup.vue';
import { useSessionStore } from '../stores/session';

const router = useRouter();
const sessionStore = useSessionStore();

const form = reactive({
  participantName: sessionStore.joinDraft.participantName,
  joinCode: sessionStore.joinDraft.joinCode,
});

const resumeExisting = async () => {
  const persisted = sessionStore.hydrateFromStorage();
  if (!persisted) {
    return;
  }

  try {
    await sessionStore.resume(persisted.challengeSlug, persisted.token);
    router.push({
      name: 'play',
      params: { challengeSlug: persisted.challengeSlug },
    });
  } catch {
    return;
  }
};

const submit = async () => {
  sessionStore.setJoinDraft({
    participantName: form.participantName,
    joinCode: form.joinCode.trim().toUpperCase(),
  });
  router.push({ name: 'challenge-setup' });
};

function dismissError() {
  sessionStore.error = '';
}
</script>

<template>
  <main
    class="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-4 md:px-8 md:py-6"
  >
    <section class="grid gap-4 lg:grid-cols-[0.95fr_0.9fr] lg:items-stretch">
      <div class="panel overflow-hidden p-6 md:p-7">
        <WorkshopLockup />
        <h1
          class="mt-4 max-w-lg font-display text-5xl leading-[0.95] text-white md:text-6xl"
        >
          Fix it, snooze it, ignore it
        </h1>
        <p class="mt-4 max-w-lg text-base leading-7 text-mist md:text-lg">
          Make the call on real cloud findings. Decide what matters, who owns
          it, and how your decisions stack up.
        </p>

        <div class="surface-subtle mt-5 p-4">
          <div
            class="text-xs font-semibold uppercase tracking-[0.18em] text-mist/70"
          >
            Current challenge
          </div>
          <div class="mt-2 font-display text-xl text-white md:text-2xl">
            AWS: Identity and Data Exposure
          </div>
          <p class="mt-2 max-w-lg text-sm leading-6 text-mist">
            Three AWS scenarios focused on prioritization and ownership under
            pressure.
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span class="pill pill-muted normal-case tracking-normal"
              >3 scenarios</span
            >
            <span class="pill pill-muted normal-case tracking-normal"
              >4 teams</span
            >
            <span class="pill pill-muted normal-case tracking-normal">AWS</span>
          </div>
        </div>
      </div>

      <div class="panel p-6 md:p-7">
        <h2 class="font-display text-3xl text-white">Join the workshop</h2>
        <p class="mt-2 text-sm leading-6 text-mist">
          Enter your workshop code and pick a unique name.
        </p>

        <form class="mt-4 space-y-3" @submit.prevent="submit">
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-mist"
              >Unique name</span
            >
            <input
              v-model="form.participantName"
              class="w-full rounded-2xl border-aikido-800 bg-aikido-950 px-4 py-3 text-white"
              placeholder="Captain Context"
              required
            />
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-mist"
              >Workshop code</span
            >
            <input
              v-model="form.joinCode"
              class="w-full rounded-2xl border-aikido-800 bg-aikido-950 px-4 py-3 uppercase text-white"
              placeholder="AWSLAB"
              required
            />
          </label>
          <button
            type="submit"
            class="w-full rounded-2xl bg-aikido-500 px-4 py-3 font-display text-lg text-white transition hover:bg-[#5641d9] disabled:opacity-50"
            :disabled="sessionStore.loading"
          >
            Continue
          </button>

          <div class="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="w-full rounded-2xl border border-aikido-800 bg-aikido-950 px-4 py-3 font-semibold text-mist transition hover:border-aikido-500/30"
              @click="resumeExisting"
            >
              Resume on this device
            </button>

            <a
              class="w-full rounded-2xl border border-aikido-800 bg-aikido-950 px-4 py-3 font-semibold text-mist transition hover:border-aikido-500/30"
              href="/leaderboard/aws-identity-and-data-exposure"
            >
              Open leaderboard
            </a>
          </div>
        </form>

        <p class="mt-4 text-xs uppercase tracking-[0.18em] text-mist/70">
          No personal data required.
        </p>
        <div
          v-if="sessionStore.error"
          class="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          <div>{{ sessionStore.error }}</div>
          <button
            type="button"
            class="mt-2 font-semibold text-red-100 underline underline-offset-4"
            @click="dismissError"
          >
            Dismiss
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
