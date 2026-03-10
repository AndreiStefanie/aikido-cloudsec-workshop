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
    class="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-4 py-10 md:px-8"
  >
    <section class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div class="panel overflow-hidden p-8 md:p-10">
        <WorkshopLockup />
        <h1
          class="mt-6 max-w-2xl font-display text-5xl leading-none text-white md:text-7xl"
        >
          Fix it, snooze it, ignore it
        </h1>
        <p class="mt-6 max-w-2xl text-base leading-7 text-mist md:text-lg">
          Prioritize real cloud findings under pressure. Decide what actually
          matters, who owns it, and see how your calls stack up on the
          leaderboard.
        </p>

        <div class="mt-6 surface-subtle p-5">
          <div
            class="text-xs font-semibold uppercase tracking-[0.18em] text-mist/70"
          >
            Current challenge
          </div>
          <div class="mt-2 font-display text-2xl text-white">
            AWS: Identity and Data Exposure
          </div>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-mist">
            Two AWS scenarios focused on IAM hygiene, vulnerability context, and
            remediation ownership.
          </p>
        </div>

        <div class="mt-8 grid gap-4 md:grid-cols-3">
          <div class="surface-subtle p-4">
            <div class="text-3xl font-extrabold text-aikido-100">2</div>
            <div class="mt-2 text-sm text-mist">
              scenarios currently loaded in the workshop
            </div>
          </div>
          <div class="surface-subtle p-4">
            <div class="text-3xl font-extrabold text-aikido-100">4</div>
            <div class="mt-2 text-sm text-mist">
              teams to route ownership correctly
            </div>
          </div>
          <div class="surface-subtle p-4">
            <div class="text-3xl font-extrabold text-aikido-100">AWS</div>
            <div class="mt-2 text-sm text-mist">
              current focus: IAM hygiene and infrastructure risk context
            </div>
          </div>
        </div>
      </div>

      <div class="panel p-8 md:p-10">
        <h2 class="font-display text-3xl text-white">Join the workshop</h2>
        <form class="mt-6 space-y-4" @submit.prevent="submit">
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-mist"
              >Unique name</span
            >
            <input
              v-model="form.participantName"
              class="w-full rounded-2xl border-aikido-800 bg-aikido-950 px-4 py-4 text-white"
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
              class="w-full rounded-2xl border-aikido-800 bg-aikido-950 px-4 py-4 uppercase text-white"
              placeholder="AWSLAB"
              required
            />
          </label>
          <button
            type="submit"
            class="w-full rounded-2xl bg-aikido-500 px-4 py-4 font-display text-lg text-white transition hover:bg-[#5641d9] disabled:opacity-50"
            :disabled="sessionStore.loading"
          >
            Continue
          </button>

          <button
            type="button"
            class="w-full rounded-2xl border border-aikido-800 bg-aikido-950 px-4 py-4 font-semibold text-mist transition hover:border-aikido-500/30"
            @click="resumeExisting"
          >
            Resume on this device
          </button>

          <button
            type="button"
            class="w-full rounded-2xl border border-aikido-800 bg-aikido-950 px-4 py-4 font-semibold text-mist transition hover:border-aikido-500/30"
            @click="
              router.push({
                name: 'leaderboard',
                params: { challengeSlug: 'aws-identity-and-data-exposure' },
              })
            "
          >
            Open leaderboard
          </button>
        </form>

        <p class="mt-6 text-xs uppercase tracking-[0.18em] text-mist/70">
          Join with your workshop code. No personal data required.
        </p>
        <div
          v-if="sessionStore.error"
          class="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
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
