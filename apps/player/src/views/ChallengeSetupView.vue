<script setup lang="ts">
import { useRouter } from 'vue-router';

import { ApiError } from '../api/client';
import WorkshopLockup from '../components/WorkshopLockup.vue';
import { useSessionStore } from '../stores/session';

const router = useRouter();
const sessionStore = useSessionStore();

async function startChallenge() {
  try {
    await sessionStore.join(
      sessionStore.joinDraft.joinCode,
      sessionStore.joinDraft.participantName
    );
    if (!sessionStore.bootstrap) {
      return;
    }

    router.push({
      name: 'play',
      params: { challengeSlug: sessionStore.bootstrap.challenge.slug },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      router.replace({ name: 'home' });
    }
    return;
  }
}
</script>

<template>
  <main class="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
    <div class="panel p-8 md:p-10">
      <div
        class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
      >
        <WorkshopLockup />
        <div class="surface-subtle px-4 py-3 text-sm text-mist">
          <div class="flex items-baseline gap-2">
            <span class="text-[10px] uppercase tracking-[0.18em] text-mist/60">
              Player
            </span>
            <span class="font-semibold text-white">
              {{ sessionStore.joinDraft.participantName || 'Unnamed player' }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <div
          class="text-xs font-semibold uppercase tracking-[0.18em] text-mist/70"
        >
          Challenge
        </div>
        <h1 class="mt-2 font-display text-4xl text-white md:text-5xl">
          AWS: Identity and Data Exposure
        </h1>

        <div class="mt-6 grid gap-4">
          <div class="surface-subtle p-5">
            <div class="pill pill-primary">Scenario 1</div>
            <div class="mt-3 font-semibold text-white">
              Legacy backup IAM user with unused credentials
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Decide whether an unused IAM user with broad AWS access should be
              fixed, snoozed, or ignored, and route it to the correct owner.
            </p>
          </div>
          <div class="surface-subtle p-5">
            <div class="pill pill-primary">Scenario 2</div>
            <div class="mt-3 font-semibold text-white">
              Vulnerable bastion host with limited exposure
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Assess whether severe but internally constrained infrastructure
              vulnerabilities are urgent, and assign ownership to the right
              shared platform team.
            </p>
          </div>
          <div class="surface-subtle p-5">
            <div class="pill pill-primary">Scenario 3</div>
            <div class="mt-3 font-semibold text-white">
              OpenSSH CVEs on a private internal host
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Decide whether a vulnerability finding with no public attack path
              should be ignored, and when the right answer is to improve the
              tooling rather than create another manual workflow.
            </p>
          </div>
        </div>

        <div class="surface-subtle mt-8 p-6">
          <div class="flex items-center gap-2">
            <div
              class="text-xs font-semibold uppercase tracking-[0.18em] text-mist/70"
            >
              Ready to start
            </div>
            <div class="group relative">
              <button
                type="button"
                class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-aikido-800 text-[11px] font-semibold text-mist/70 transition hover:border-aikido-500/30 hover:text-white focus:border-aikido-500/30 focus:text-white"
                aria-label="Explain scoring"
              >
                i
              </button>
              <div
                class="pointer-events-none absolute left-0 top-7 z-10 w-72 rounded-2xl border border-aikido-800 bg-aikido-950 px-3 py-2 text-left text-xs normal-case tracking-normal text-mist opacity-0 shadow-panel transition group-hover:opacity-100 group-focus-within:opacity-100"
              >
                Your answers are scored on prioritization, ownership, and streak
                accuracy.
              </div>
            </div>
          </div>

          <div class="mt-6 flex flex-col gap-3">
            <button
              type="button"
              class="w-full rounded-2xl bg-aikido-500 px-4 py-4 font-display text-lg text-white transition hover:bg-[#5641d9] disabled:opacity-50"
              :disabled="
                sessionStore.loading ||
                !sessionStore.joinDraft.participantName ||
                !sessionStore.joinDraft.joinCode
              "
              @click="startChallenge"
            >
              {{ sessionStore.loading ? 'Starting...' : 'Start challenge' }}
            </button>
            <button
              type="button"
              class="w-full rounded-2xl border border-aikido-800 bg-aikido-950 px-4 py-4 font-semibold text-mist transition hover:border-aikido-500/30"
              @click="router.push({ name: 'home' })"
            >
              Back
            </button>
          </div>

          <p v-if="sessionStore.error" class="mt-4 text-sm text-red-300">
            {{ sessionStore.error }}
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
