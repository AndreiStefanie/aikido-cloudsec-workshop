<script setup lang="ts">
import {
  type ActionType,
  type ResourceContext,
  type ScenarioDefinition,
  type TeamType,
  teams,
} from '@workshop/shared';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import DialogCloseButton from './DialogCloseButton.vue';

const props = defineProps<{
  scenario: ScenarioDefinition;
  submitting?: boolean;
}>();

const selectedAction = defineModel<ActionType | null>('action');
const selectedOwner = defineModel<TeamType | null>('owner');
const selectedSnoozeReason = defineModel<string | null>('snoozeReason');
const selectedIgnoreFeedback = defineModel<string | null>('ignoreFeedback');

const actionLabels: Record<ActionType, string> = {
  fix: 'Fix it',
  snooze: 'Snooze it',
  ignore: 'Ignore it',
};

const severityClassMap: Record<ScenarioDefinition['severityLabel'], string> = {
  critical: 'border-[#FF4A3E]/30 bg-[#FF4A3E]/15 text-[#FF4A3E]',
  high: 'border-[#FF9715]/30 bg-[#FF9715]/15 text-[#FF9715]',
  medium: 'border-[#0090FF]/30 bg-[#0090FF]/15 text-[#0090FF]',
  low: 'border-[#00C07D]/30 bg-[#00C07D]/15 text-[#00C07D]',
};

const slaLabel = computed(() =>
  props.scenario.sla.status === 'overdue'
    ? `SLA overdue by ${props.scenario.sla.days} days`
    : `SLA due in ${props.scenario.sla.days} days`
);

const slaClass = computed(() =>
  props.scenario.sla.status === 'overdue'
    ? 'border-[#FF4A3E]/30 bg-[#FF4A3E]/15 text-[#FF4A3E]'
    : 'border-[#FF9715]/30 bg-[#FF9715]/15 text-[#FF9715]'
);

const ownerRequired = computed(() => selectedAction.value === 'fix');

const activeResource = ref<ResourceContext | null>(null);
const diagramOpen = ref(false);
const activeResourceRows = computed(
  () => activeResource.value?.detailRows ?? []
);
const activeResourceTags = computed(() => activeResource.value?.tags ?? []);
const detailRowsWithTags = computed(() => {
  const rows = [...activeResourceRows.value];

  if (activeResourceTags.value.length) {
    rows.unshift({
      field: 'Tags',
      value: activeResourceTags.value.join(', '),
    });
  }

  return rows;
});

function hasResourceDetails(resource: ResourceContext) {
  return Boolean(resource.detailRows?.length || resource.tags?.length);
}

function openDetails(resource: ResourceContext) {
  if (!hasResourceDetails(resource)) {
    return;
  }

  activeResource.value = resource;
}

function closeDetails() {
  activeResource.value = null;
}

function openDiagram() {
  if (!props.scenario.diagram) {
    return;
  }

  diagramOpen.value = true;
}

function closeDiagram() {
  diagramOpen.value = false;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') {
    return;
  }

  if (diagramOpen.value) {
    closeDiagram();
    return;
  }

  if (activeResource.value) {
    closeDetails();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <section class="panel p-6 md:p-8">
    <div>
      <div>
        <h2 class="font-display text-3xl text-white">
          {{ scenario.title }}
        </h2>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <span class="pill" :class="severityClassMap[scenario.severityLabel]">
          {{ scenario.severityLabel }}
        </span>
        <span class="pill" :class="slaClass">
          {{ slaLabel }}
        </span>
      </div>
      <div class="mt-6">
        <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
          Description
        </div>
        <p class="mt-3 text-sm leading-6 text-mist">
          {{ scenario.description }}
        </p>
      </div>
      <div class="mt-6">
        <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
          Remediation
        </div>
        <p class="mt-3 text-sm leading-6 text-mist">
          {{ scenario.remediation }}
        </p>
      </div>
      <div v-if="scenario.diagram" class="mt-6">
        <button
          type="button"
          class="text-sm font-semibold text-aikido-100 underline underline-offset-4 transition hover:text-white"
          @click="openDiagram"
        >
          View diagram
        </button>
      </div>
      <div class="mt-6">
        <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
          Cloud assets involved
        </div>
        <div class="mt-3 overflow-x-auto rounded-3xl border border-aikido-800">
          <table
            class="w-full min-w-[720px] divide-y divide-aikido-800 text-left text-sm"
          >
            <thead class="bg-aikido-950 text-mist/70">
              <tr>
                <th class="px-4 py-3">Name</th>
                <th class="px-4 py-3">Asset Type</th>
                <th class="px-4 py-3">Created At</th>
                <th class="px-4 py-3">Account</th>
                <th class="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-aikido-800 bg-aikido-900">
              <tr
                v-for="resource in props.scenario.resources"
                :key="resource.id"
              >
                <td class="px-4 py-3 font-semibold text-white">
                  {{ resource.name }}
                </td>
                <td class="px-4 py-3 text-mist">
                  {{ resource.assetTypeLabel ?? resource.type }}
                </td>
                <td class="px-4 py-3 text-mist">
                  {{ resource.createdAt ?? '—' }}
                </td>
                <td class="px-4 py-3 text-mist">
                  {{ resource.account ?? '—' }}
                </td>
                <td class="px-4 py-3">
                  <button
                    type="button"
                    class="font-semibold text-aikido-100 underline underline-offset-4 disabled:no-underline disabled:opacity-40"
                    :disabled="!hasResourceDetails(resource)"
                    @click="openDetails(resource)"
                  >
                    {{ resource.detailsLabel ?? 'View details' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-8">
        <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
          Choose action
        </div>
        <div class="mt-3 grid gap-3">
          <button
            v-for="label in Object.keys(actionLabels) as ActionType[]"
            :key="label"
            type="button"
            class="rounded-2xl border px-4 py-4 text-left transition"
            :class="
              selectedAction === label
                ? 'border-aikido-500 bg-aikido-500/12 text-white ring-1 ring-aikido-500/30'
                : 'border-aikido-800 bg-aikido-950 text-mist hover:border-aikido-500/40'
            "
            @click="selectedAction = label"
          >
            <div class="font-display text-lg">{{ actionLabels[label] }}</div>
          </button>
        </div>
      </div>

      <div v-if="ownerRequired" class="mt-8">
        <label class="text-xs uppercase tracking-[0.2em] text-mist/60"
          >Assign owner</label
        >
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <button
            v-for="team in teams"
            :key="team"
            type="button"
            class="rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition"
            :class="
              selectedOwner === team
                ? 'border-mint-500 bg-mint-500/12 text-white ring-1 ring-mint-500/30'
                : 'border-aikido-800 bg-aikido-950 text-mist hover:border-mint-500/35'
            "
            @click="selectedOwner = team"
          >
            {{ team }}
          </button>
        </div>
      </div>

      <div v-else-if="selectedAction === 'snooze'" class="mt-8">
        <div class="flex items-center gap-2">
          <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
            Snooze reason
          </div>
          <div class="group relative">
            <button
              type="button"
              class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-aikido-800 text-[11px] font-semibold text-mist/70 transition hover:border-aikido-500/30 hover:text-white focus:border-aikido-500/30 focus:text-white"
              aria-label="Explain snooze reason"
            >
              i
            </button>
            <div
              class="pointer-events-none absolute left-0 top-7 z-10 w-72 rounded-2xl border border-aikido-800 bg-aikido-950 px-3 py-2 text-left text-xs normal-case tracking-normal text-mist opacity-0 shadow-panel transition group-hover:opacity-100 group-focus-within:opacity-100"
            >
              This captures the compliance-facing justification for deferring
              remediation instead of addressing the issue immediately.
            </div>
          </div>
        </div>
        <div class="mt-3 grid gap-3">
          <button
            v-for="option in scenario.snoozeReasonOptions ?? []"
            :key="option"
            type="button"
            class="rounded-2xl border px-4 py-4 text-left transition"
            :class="
              selectedSnoozeReason === option
                ? 'border-mint-500 bg-mint-500/12 text-white ring-1 ring-mint-500/30'
                : 'border-aikido-800 bg-aikido-950 text-mist hover:border-mint-500/35'
            "
            @click="selectedSnoozeReason = option"
          >
            <div class="font-semibold text-white">
              {{ option }}
            </div>
          </button>
        </div>
      </div>

      <div
        v-else-if="
          selectedAction === 'ignore' && scenario.answer.action === 'ignore'
        "
        class="mt-8"
      >
        <div class="flex items-center gap-2">
          <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
            Vendor feedback
          </div>
          <div class="group relative">
            <button
              type="button"
              class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-aikido-800 text-[11px] font-semibold text-mist/70 transition hover:border-aikido-500/30 hover:text-white focus:border-aikido-500/30 focus:text-white"
              aria-label="Explain vendor feedback"
            >
              i
            </button>
            <div
              class="pointer-events-none absolute left-0 top-7 z-10 w-72 rounded-2xl border border-aikido-800 bg-aikido-950 px-3 py-2 text-left text-xs normal-case tracking-normal text-mist opacity-0 shadow-panel transition group-hover:opacity-100 group-focus-within:opacity-100"
            >
              This is your feedback to the vendor describing the
              capability/feature that would have reduced the noise and/or helped
              you to understand the issue quicker.
            </div>
          </div>
        </div>
        <div class="mt-3 grid gap-3">
          <button
            v-for="option in scenario.ignoreFeedbackOptions"
            :key="option"
            type="button"
            class="rounded-2xl border px-4 py-4 text-left transition"
            :class="
              selectedIgnoreFeedback === option
                ? 'border-mint-500 bg-mint-500/12 text-white ring-1 ring-mint-500/30'
                : 'border-aikido-800 bg-aikido-950 text-mist hover:border-mint-500/35'
            "
            @click="selectedIgnoreFeedback = option"
          >
            <div class="font-semibold text-white">
              {{ option }}
            </div>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="diagramOpen && scenario.diagram"
      class="fixed inset-0 z-50 flex items-center justify-center bg-[#010124]/72 px-4 backdrop-blur-md"
      @click.self="closeDiagram"
    >
      <div class="panel flex max-h-[85vh] w-full max-w-5xl flex-col p-6 md:p-8">
        <div class="flex items-start justify-end">
          <DialogCloseButton @click="closeDiagram" />
        </div>

        <div
          class="mt-4 flex min-h-0 items-center justify-center overflow-hidden rounded-3xl border border-aikido-800 bg-aikido-950 p-4"
        >
          <img
            :src="scenario.diagram.src"
            :alt="scenario.diagram.alt"
            class="block max-h-[calc(85vh-11rem)] w-auto max-w-full object-contain"
          />
        </div>
      </div>
    </div>

    <div
      v-if="activeResource"
      class="fixed inset-0 z-50 flex items-center justify-center bg-[#010124]/72 px-4 backdrop-blur-md"
      @click.self="closeDetails"
    >
      <div class="panel w-full max-w-3xl p-6 md:p-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
              Asset details
            </div>
            <h3 class="mt-2 font-display text-3xl text-white">
              {{ activeResource.name }}
            </h3>
          </div>
          <DialogCloseButton @click="closeDetails" />
        </div>

        <div class="mt-6 overflow-hidden rounded-3xl border border-aikido-800">
          <table
            class="min-w-full divide-y divide-aikido-800 text-left text-sm"
          >
            <tbody class="divide-y divide-aikido-800 bg-aikido-900">
              <tr v-for="row in detailRowsWithTags" :key="row.field">
                <th class="w-1/3 px-4 py-3 font-semibold text-white">
                  {{ row.field }}
                </th>
                <td class="px-4 py-3 text-mist">{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>
