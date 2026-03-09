<script setup lang="ts">
import type { ScenarioDecisionResult } from '@workshop/shared';

defineProps<{
  result: ScenarioDecisionResult;
  continuing?: boolean;
}>();

defineEmits<{ continue: [] }>();
</script>

<template>
  <section class="panel p-6 text-sm text-mist">
    <div class="flex flex-wrap items-center gap-3">
      <span
        class="pill"
        :class="result.isActionCorrect ? 'pill-success' : 'pill-primary'"
      >
        {{ result.isActionCorrect ? 'Action correct' : 'Action missed' }}
      </span>
      <span
        class="pill"
        :class="result.isOwnerCorrect ? 'pill-success' : 'pill-muted'"
      >
        {{
          result.submittedAction === 'ignore'
            ? 'Owner skipped'
            : result.isOwnerCorrect
              ? 'Owner correct'
              : 'Owner differs'
        }}
      </span>
      <span class="pill pill-primary">Score {{ result.totalScore }}</span>
    </div>

    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <div class="surface-subtle p-4">
        <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
          Correct call
        </div>
        <div class="mt-2 text-lg font-bold text-white">
          {{ result.correctAction.toUpperCase() }} ·
          {{ result.correctOwnerTeam }}
        </div>
        <div class="mt-2">{{ result.explanation }}</div>
      </div>
      <div class="surface-subtle p-4">
        <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
          Impact reasoning
        </div>
        <div class="mt-2">{{ result.impact }}</div>
        <div class="mt-3 text-white">
          +{{ result.actionScoreDelta }} action / +{{
            result.ownerScoreDelta
          }}
          owner / +{{ result.streakBonusDelta }} streak
        </div>
      </div>
    </div>

    <div v-if="result.securityLesson" class="surface-subtle mt-4 p-4">
      <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
        Security lesson
      </div>
      <div class="mt-2">{{ result.securityLesson }}</div>
    </div>

    <button
      type="button"
      class="mt-6 w-full rounded-2xl bg-aikido-100 px-4 py-4 font-display text-lg text-aikido-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="continuing"
      @click="$emit('continue')"
    >
      {{ continuing ? 'Loading next scenario...' : 'Continue' }}
    </button>
  </section>
</template>
