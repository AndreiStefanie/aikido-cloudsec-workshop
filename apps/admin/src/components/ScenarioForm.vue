<script setup lang="ts">
import { teams } from '@workshop/shared';
import type { ScenarioDefinition, UpsertScenarioInput } from '@workshop/shared';
import { reactive, watch } from 'vue';

import DialogCloseButton from './DialogCloseButton.vue';

const props = defineProps<{
  challengeId: string;
  modelValue?: ScenarioDefinition | null;
}>();
const emit = defineEmits<{
  submit: [
    {
      challengeId: string;
      scenarioId: string | null;
      payload: UpsertScenarioInput;
    },
  ];
  cancel: [];
}>();

const form = reactive({
  order: 1,
  title: '',
  summary: '',
  severityLabel: 'medium' as UpsertScenarioInput['severityLabel'],
  slaStatus: 'overdue' as UpsertScenarioInput['sla']['status'],
  slaDays: 30,
  remediation: '',
  resourcesJson: '[]',
  answerAction: 'fix' as UpsertScenarioInput['answer']['action'],
  answerOwner: 'DevOps Team' as UpsertScenarioInput['answer']['ownerTeam'],
  rationale: '',
  impact: '',
  securityLesson: '',
  alternativesJson: '{}',
});

const formError = reactive({ message: '' });

watch(
  () => props.modelValue,
  value => {
    form.order = value?.order ?? 1;
    form.title = value?.title ?? '';
    form.summary = value?.summary ?? '';
    form.severityLabel = value?.severityLabel ?? 'medium';
    form.slaStatus = value?.sla.status ?? 'overdue';
    form.slaDays = value?.sla.days ?? 30;
    form.remediation = value?.remediation ?? '';
    form.resourcesJson = JSON.stringify(value?.resources ?? [], null, 2);
    form.answerAction = value?.answer.action ?? 'fix';
    form.answerOwner = value?.answer.ownerTeam ?? 'DevOps Team';
    form.rationale = value?.answer.rationale ?? '';
    form.impact = value?.answer.impact ?? '';
    form.securityLesson = value?.securityLesson ?? '';
    form.alternativesJson = JSON.stringify(value?.alternatives ?? {}, null, 2);
    formError.message = '';
  },
  { immediate: true }
);

function submit() {
  try {
    const resources = JSON.parse(form.resourcesJson);
    const alternatives = JSON.parse(form.alternativesJson);

    emit('submit', {
      challengeId: props.challengeId,
      scenarioId: props.modelValue?.id ?? null,
      payload: {
        order: Number(form.order),
        title: form.title,
        summary: form.summary,
        severityLabel: form.severityLabel,
        sla: {
          status: form.slaStatus,
          days: Number(form.slaDays),
        },
        remediation: form.remediation,
        resources,
        securityLesson: form.securityLesson || undefined,
        answer: {
          action: form.answerAction,
          ownerTeam: form.answerOwner,
          rationale: form.rationale,
          impact: form.impact,
        },
        alternatives,
      },
    });
    formError.message = '';
  } catch {
    formError.message = 'Resources and alternatives must be valid JSON.';
  }
}
</script>

<template>
  <form class="card max-h-[85vh] overflow-y-auto p-6" @submit.prevent="submit">
    <div class="flex items-center justify-between gap-4">
      <h2 class="font-display text-2xl text-slate-900">
        {{ props.modelValue ? 'Edit scenario' : 'New scenario' }}
      </h2>
      <div class="flex items-center gap-4">
        <div class="text-sm text-slate-500">
          {{
            props.modelValue ? props.modelValue.title : 'Create a new scenario'
          }}
        </div>
        <DialogCloseButton tone="mint" @click="emit('cancel')" />
      </div>
    </div>

    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Order</span>
        <input
          v-model="form.order"
          type="number"
          min="1"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          required
        />
      </label>
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Title</span>
        <input
          v-model="form.title"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          required
        />
      </label>
      <label class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">Summary</span>
        <input
          v-model="form.summary"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          required
        />
      </label>
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Severity</span>
        <select
          v-model="form.severityLabel"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </label>
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">SLA status</span>
        <select
          v-model="form.slaStatus"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
        >
          <option value="overdue">Overdue</option>
          <option value="due_soon">Due soon</option>
        </select>
      </label>
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">SLA days</span>
        <input
          v-model="form.slaDays"
          type="number"
          min="0"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          required
        />
      </label>
      <label class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">Remediation</span>
        <textarea
          v-model="form.remediation"
          rows="4"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          required
        />
      </label>
      <label class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">Resources JSON</span>
        <textarea
          v-model="form.resourcesJson"
          rows="12"
          class="w-full rounded-2xl border-slate-200 px-4 py-3 font-mono text-sm"
          required
        />
      </label>
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Correct action</span>
        <select
          v-model="form.answerAction"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
        >
          <option value="fix">Fix</option>
          <option value="snooze">Snooze</option>
          <option value="ignore">Ignore</option>
        </select>
      </label>
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Correct owner</span>
        <select
          v-model="form.answerOwner"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
        >
          <option v-for="team in teams" :key="team" :value="team">
            {{ team }}
          </option>
        </select>
      </label>
      <label class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">Rationale</span>
        <textarea
          v-model="form.rationale"
          rows="3"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          required
        />
      </label>
      <label class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">Impact</span>
        <textarea
          v-model="form.impact"
          rows="3"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          required
        />
      </label>
      <label class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">Security lesson</span>
        <textarea
          v-model="form.securityLesson"
          rows="3"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
        />
      </label>
      <label class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">Alternatives JSON</span>
        <textarea
          v-model="form.alternativesJson"
          rows="6"
          class="w-full rounded-2xl border-slate-200 px-4 py-3 font-mono text-sm"
          required
        />
      </label>
    </div>

    <p v-if="formError.message" class="mt-4 text-sm text-red-700">
      {{ formError.message }}
    </p>

    <button
      type="submit"
      class="mt-5 rounded-2xl bg-mint-500 px-5 py-3 font-semibold text-white transition hover:brightness-95"
    >
      {{ props.modelValue ? 'Save scenario' : 'Create scenario' }}
    </button>
  </form>
</template>
