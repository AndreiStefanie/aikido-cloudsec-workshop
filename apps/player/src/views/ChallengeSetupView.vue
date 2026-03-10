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
  <main class="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
    <div class="panel p-8 md:p-10">
      <WorkshopLockup />

      <div class="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div
            class="text-xs font-semibold uppercase tracking-[0.18em] text-mist/70"
          >
            Challenge
          </div>
          <h1 class="mt-2 font-display text-4xl text-white md:text-5xl">
            AWS: Identity and Data Exposure
          </h1>
          <p class="mt-4 max-w-2xl text-base leading-7 text-mist">
            This challenge focuses on AWS-specific cloud security
            decision-making, covering IAM hygiene and infrastructure
            vulnerability context.
          </p>

          <div class="mt-6 grid gap-4">
            <div class="surface-subtle p-5">
              <div class="pill pill-primary">Scenario 1</div>
              <div class="mt-3 font-semibold text-white">
                Legacy backup IAM user with unused credentials
              </div>
              <p class="mt-2 text-sm leading-6 text-mist">
                Decide whether an unused IAM user with broad AWS access should
                be fixed, snoozed, or ignored, and route it to the correct
                owner.
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
          </div>
        </div>

        <div class="surface-subtle p-6">
          <div
            class="text-xs font-semibold uppercase tracking-[0.18em] text-mist/70"
          >
            Ready to start
          </div>
          <div class="mt-3 text-2xl font-display text-white">
            {{ sessionStore.joinDraft.participantName || 'Unnamed player' }}
          </div>
          <p class="mt-2 text-sm leading-6 text-mist">
            Join code
            <span class="font-semibold text-white">{{
              sessionStore.joinDraft.joinCode || 'Not provided'
            }}</span
            >. Your answers are scored on prioritization, ownership, and streak
            accuracy.
          </p>

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
          </div>

          <p v-if="sessionStore.error" class="mt-4 text-sm text-red-300">
            {{ sessionStore.error }}
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
