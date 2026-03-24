<script setup lang="ts">
import type { ScenarioDecisionResult } from '@workshop/shared';

function scoreDelta(result: ScenarioDecisionResult) {
  return (
    result.actionScoreDelta + result.ownerScoreDelta + result.streakBonusDelta
  );
}

function scoreTone(result: ScenarioDecisionResult) {
  if (result.actionScoreDelta > 0) {
    return 'pill-success';
  }

  if (scoreDelta(result) >= 0) {
    return 'border-[#FF9715]/30 bg-[#FF9715]/15 text-[#FF9715]';
  }

  return 'border-[#FF4A3E]/30 bg-[#FF4A3E]/15 text-[#FF4A3E]';
}

function scoreTextTone(result: ScenarioDecisionResult) {
  if (result.actionScoreDelta > 0) {
    return 'text-mint-100';
  }

  if (scoreDelta(result) >= 0) {
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

function secondaryLabel(result: ScenarioDecisionResult) {
  return result.correctAction === 'ignore' ? 'vendor' : 'owner';
}

defineProps<{
  result: ScenarioDecisionResult;
  continuing?: boolean;
}>();

defineEmits<{ continue: [] }>();
</script>

<template>
  <section
    class="panel max-h-[85vh] overflow-y-auto p-6 text-sm text-mist md:p-7"
  >
    <div class="flex flex-wrap items-center gap-3">
      <span
        class="pill"
        :class="result.isActionCorrect ? 'pill-success' : 'pill-primary'"
      >
        {{ result.isActionCorrect ? 'Action correct' : 'Action missed' }}
      </span>
      <span
        class="pill"
        :class="
          result.correctAction === 'ignore'
            ? result.isIgnoreFeedbackCorrect
              ? 'pill-success'
              : 'pill-muted'
            : result.isOwnerCorrect
              ? 'pill-success'
              : 'pill-muted'
        "
      >
        {{
          result.correctAction === 'ignore'
            ? result.isIgnoreFeedbackCorrect
              ? 'Vendor feedback correct'
              : 'Vendor feedback differs'
            : result.isOwnerCorrect
              ? 'Owner correct'
              : 'Owner differs'
        }}
      </span>
      <span class="pill" :class="scoreTone(result)">
        Score {{ scoreDelta(result) >= 0 ? '+' : '' }}{{ scoreDelta(result) }}
      </span>
    </div>

    <div class="surface-subtle mt-6 p-4 md:p-5">
      <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
        Security lesson
      </div>
      <div class="mt-3 text-base leading-7 text-mist">
        {{ result.securityLesson }}
      </div>
      <div
        v-if="result.correctAction === 'ignore' && result.correctIgnoreFeedback"
        class="mt-4 text-sm text-mist"
      >
        Correct vendor feedback: {{ result.correctIgnoreFeedback }}
      </div>
      <div class="mt-4 text-sm" :class="scoreTextTone(result)">
        <span :class="componentTone(result.actionScoreDelta)">
          {{ result.actionScoreDelta >= 0 ? '+' : ''
          }}{{ result.actionScoreDelta }} action
        </span>
        <span class="text-mist/50"> / </span>
        <span :class="componentTone(result.ownerScoreDelta)">
          {{ result.ownerScoreDelta >= 0 ? '+' : ''
          }}{{ result.ownerScoreDelta }} {{ secondaryLabel(result) }}
        </span>
        <span class="text-mist/50"> / </span>
        <span :class="componentTone(result.streakBonusDelta)">
          {{ result.streakBonusDelta >= 0 ? '+' : ''
          }}{{ result.streakBonusDelta }} streak
        </span>
        <span v-if="result.streakBonusDelta >= 2" class="ml-1">🔥</span>
      </div>
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
