<script setup lang="ts">
import type { ActionType, TeamType } from '@workshop/shared';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ApiError } from '../api/client';
import FeedbackPanel from '../components/FeedbackPanel.vue';
import ScenarioCard from '../components/ScenarioCard.vue';
import WorkshopLockup from '../components/WorkshopLockup.vue';
import { useSessionStore } from '../stores/session';

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();
const selectedAction = ref<ActionType | null>(null);
const selectedOwner = ref<TeamType | null>(null);
const submittingTransition = ref(false);

const streakLabel = computed(() => sessionStore.bootstrap?.session.streak ?? 0);

function scoreTone(totalDelta: number) {
  if (totalDelta >= 15) {
    return 'pill-success';
  }

  if (totalDelta >= 0) {
    return 'border-[#FF9715]/30 bg-[#FF9715]/15 text-[#FF9715]';
  }

  return 'border-[#FF4A3E]/30 bg-[#FF4A3E]/15 text-[#FF4A3E]';
}

function scoreTextTone(totalDelta: number) {
  if (totalDelta >= 15) {
    return 'text-mint-100';
  }

  if (totalDelta >= 0) {
    return 'text-[#FF9715]';
  }

  return 'text-[#FF4A3E]';
}

function componentTone(delta: number, positiveColor = 'text-mint-100') {
  if (delta > 0) {
    return positiveColor;
  }

  if (delta < 0) {
    return 'text-[#FF4A3E]';
  }

  return 'text-mist/70';
}

async function ensureSession() {
  const challengeSlug = route.params.challengeSlug as string;
  if (sessionStore.bootstrap?.challenge.slug === challengeSlug) {
    return;
  }

  const persisted = sessionStore.hydrateFromStorage();
  if (!persisted || persisted.challengeSlug !== challengeSlug) {
    router.replace({ name: 'home' });
    return;
  }

  await sessionStore.resume(challengeSlug, persisted.token);
}

function openLeaderboard() {
  if (!sessionStore.bootstrap) {
    return;
  }

  router.push({
    name: 'leaderboard',
    params: { challengeSlug: sessionStore.bootstrap.challenge.slug },
  });
}

async function continueAfterFeedback() {
  try {
    await sessionStore.continueAfterFeedback();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      router.replace({ name: 'home' });
    }
  }
}

async function submit() {
  if (
    !selectedAction.value ||
    (selectedAction.value !== 'ignore' && !selectedOwner.value)
  ) {
    return;
  }

  try {
    submittingTransition.value = true;
    await Promise.all([
      sessionStore.answer({
        action: selectedAction.value,
        ownerTeam:
          selectedAction.value === 'ignore' ? undefined : selectedOwner.value,
      }),
      new Promise(resolve => window.setTimeout(resolve, 1200)),
    ]);
    selectedAction.value = null;
    selectedOwner.value = null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      router.replace({ name: 'home' });
    }
    return;
  } finally {
    submittingTransition.value = false;
  }
}

onMounted(async () => {
  try {
    await ensureSession();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      router.replace({ name: 'home' });
      return;
    }

    router.replace({ name: 'home' });
  }
});
</script>

<template>
  <main
    v-if="sessionStore.bootstrap"
    class="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10"
  >
    <header
      class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
    >
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <WorkshopLockup />
          <button
            type="button"
            class="pill pill-muted transition hover:border-aikido-500/40"
            @click="openLeaderboard"
          >
            View leaderboard
          </button>
        </div>
        <h1 class="mt-4 font-display text-4xl text-white md:text-5xl">
          {{ sessionStore.bootstrap.challenge.name }}
        </h1>
      </div>
      <div class="surface-subtle px-4 py-3 text-sm text-mist">
        <div class="grid gap-x-5 gap-y-2 sm:grid-cols-2">
          <div class="flex items-baseline gap-2">
            <span class="text-[10px] uppercase tracking-[0.18em] text-mist/60">
              Player
            </span>
            <span class="font-semibold text-white">
              {{ sessionStore.bootstrap.session.participantName }}
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-[10px] uppercase tracking-[0.18em] text-mist/60">
              Score
            </span>
            <span class="font-semibold text-white">
              {{ sessionStore.bootstrap.session.score }}
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-[10px] uppercase tracking-[0.18em] text-mist/60">
              Scenario
            </span>
            <span class="font-semibold text-white">
              {{
                Math.min(
                  sessionStore.bootstrap.session.currentScenarioIndex + 1,
                  sessionStore.bootstrap.challenge.scenarioCount
                )
              }}
              / {{ sessionStore.bootstrap.challenge.scenarioCount }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] uppercase tracking-[0.18em] text-mist/60">
              Streak
            </span>
            <span class="pill pill-success !px-2.5 !py-0.5">
              {{ streakLabel }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <div class="space-y-6">
      <ScenarioCard
        v-if="sessionStore.bootstrap.currentScenario && !sessionStore.feedback"
        v-model:action="selectedAction"
        v-model:owner="selectedOwner"
        :scenario="sessionStore.bootstrap.currentScenario"
        :submitting="sessionStore.loading"
      />
      <button
        v-if="sessionStore.bootstrap.currentScenario && !sessionStore.feedback"
        type="button"
        class="w-full rounded-2xl bg-aikido-100 px-4 py-4 font-display text-lg text-aikido-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="
          !selectedAction ||
          (selectedAction !== 'ignore' && !selectedOwner) ||
          sessionStore.loading
        "
        @click="submit"
      >
        {{ sessionStore.loading ? 'Submitting...' : 'Lock in decision' }}
      </button>

      <div
        v-if="submittingTransition"
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#010124]/70 px-4"
      >
        <div class="panel w-full max-w-md p-8 text-center">
          <div
            class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-aikido-800 border-t-aikido-500"
          ></div>
          <div class="mt-5 font-display text-2xl text-white">
            Evaluating your decision
          </div>
          <div class="mt-2 text-sm text-mist">
            Checking prioritization, ownership, and streak.
          </div>
        </div>
      </div>

      <div
        v-if="sessionStore.feedback && !submittingTransition"
        class="fixed inset-0 z-40 flex items-center justify-center bg-[#010124]/72 px-4 backdrop-blur-md"
      >
        <div class="w-full max-w-3xl">
          <FeedbackPanel
            :result="sessionStore.feedback"
            :continuing="sessionStore.loading"
            @continue="continueAfterFeedback"
          />
        </div>
      </div>

      <section v-if="sessionStore.hasCompleted" class="panel p-8 text-center">
        <div class="pill pill-success">Challenge completed</div>
        <h2 class="mt-4 font-display text-4xl text-white">
          Final score {{ sessionStore.bootstrap.session.score }}
        </h2>
        <p class="mt-3 text-mist">
          You can reload later with the same device token, or start a new run
          with a different name.
        </p>
        <div class="surface-subtle mt-8 p-6 text-left">
          <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
            Scenario review
          </div>
          <div class="mt-4 space-y-3">
            <div
              v-for="review in sessionStore.bootstrap.completedReview"
              :key="review.scenarioId"
              class="rounded-2xl border border-aikido-800 bg-aikido-900 px-4 py-4"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="font-semibold text-white">
                    {{ review.title }}
                  </div>
                </div>
                <div
                  class="pill whitespace-nowrap"
                  :class="scoreTone(review.totalDelta)"
                >
                  {{ review.totalDelta >= 0 ? '+' : '' }}{{ review.totalDelta }}
                </div>
              </div>
              <div class="mt-4 text-xs uppercase tracking-[0.2em] text-mist/60">
                Learning
              </div>
              <div class="mt-2 text-sm text-mist">
                {{ review.securityLesson || review.explanation }}
              </div>
              <div class="mt-3 text-sm">
                <span :class="componentTone(review.actionScoreDelta)">
                  {{ review.actionScoreDelta >= 0 ? '+' : ''
                  }}{{ review.actionScoreDelta }} action
                </span>
                <span class="text-mist/50"> / </span>
                <span :class="componentTone(review.ownerScoreDelta)">
                  {{ review.ownerScoreDelta >= 0 ? '+' : ''
                  }}{{ review.ownerScoreDelta }} owner
                </span>
                <span class="text-mist/50"> / </span>
                <span :class="componentTone(review.streakBonusDelta)">
                  {{ review.streakBonusDelta >= 0 ? '+' : ''
                  }}{{ review.streakBonusDelta }} streak
                </span>
                <span v-if="review.streakBonusDelta >= 2" class="ml-1">🔥</span>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            class="rounded-2xl bg-aikido-500 px-5 py-3 font-semibold text-white hover:bg-[#5641d9]"
            @click="openLeaderboard"
          >
            Open leaderboard
          </button>
          <button
            type="button"
            class="rounded-2xl border border-aikido-800 bg-aikido-950 px-5 py-3 font-semibold text-mist hover:border-aikido-500/30"
            @click="router.push({ name: 'home' })"
          >
            Back to join screen
          </button>
        </div>
      </section>
    </div>
  </main>
</template>
