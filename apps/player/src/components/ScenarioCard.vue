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

const ownerRequired = computed(() => selectedAction.value !== 'ignore');

const activeResource = ref<ResourceContext | null>(null);
const activeResourceRows = computed(
  () => activeResource.value?.detailRows ?? []
);
const activeResourceTags = computed(() => activeResource.value?.tags ?? []);

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

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && activeResource.value) {
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
          {{ scenario.summary }}
        </p>
      </div>
      <div class="mt-6">
        <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
          Remediation
        </div>
        <div class="surface-subtle mt-3 p-4">
          <p class="text-sm leading-6 text-mist">
            {{ scenario.remediation }}
          </p>
        </div>
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
                  {{ resource.account ?? resource.environment }}
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
              {{ activeResource.detailTitle ?? activeResource.name }}
            </h3>
          </div>
          <DialogCloseButton @click="closeDetails" />
        </div>

        <div
          v-if="activeResourceTags.length"
          class="mt-6 rounded-3xl border border-aikido-800 bg-aikido-950 p-4"
        >
          <div class="text-xs uppercase tracking-[0.2em] text-mist/60">
            Tags
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="tag in activeResourceTags"
              :key="tag"
              class="pill pill-muted"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="mt-6 overflow-hidden rounded-3xl border border-aikido-800">
          <table
            class="min-w-full divide-y divide-aikido-800 text-left text-sm"
          >
            <tbody class="divide-y divide-aikido-800 bg-aikido-900">
              <tr v-for="row in activeResourceRows" :key="row.field">
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
