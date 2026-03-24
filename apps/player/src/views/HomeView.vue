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
    class="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-4 py-6 md:px-8 md:py-8"
  >
    <section class="panel p-6 md:p-8">
      <WorkshopLockup />
      <h1
        class="mt-4 max-w-2xl font-display text-4xl leading-[0.95] text-white md:text-5xl"
      >
        Fix it, snooze it, ignore it
      </h1>
      <p class="mt-4 max-w-2xl text-base leading-7 text-mist md:text-lg">
        Make the call on real cloud findings. Decide what matters, who owns it,
        and how your decisions stack up.
      </p>

      <div class="mt-8">
        <h2 class="font-display text-3xl text-white">Join the workshop</h2>
        <p class="mt-2 text-sm leading-6 text-mist">
          Pick an unique name, find the code, and join the workshop.
        </p>

        <form class="mt-4 space-y-3" @submit.prevent="submit">
          <label class="mb-4 block">
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
              class="w-full rounded-2xl border-aikido-800 bg-aikido-950 px-4 py-3 text-white"
              placeholder="Finding this is part of the workshop"
              required
            />
            <p class="mt-2 text-sm leading-6 text-mist/80">
              You will probably need this:
              <a
                class="font-semibold text-aikido-100 underline underline-offset-4 hover:text-white"
                href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-metadata-security-credentials.html"
                target="_blank"
                rel="noreferrer"
              >
                AWS instance metadata credentials docs
              </a>
            </p>
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
