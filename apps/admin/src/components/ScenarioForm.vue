<script setup lang="ts">
import { teams } from '@workshop/shared';
import type {
  ActionType,
  TeamType,
  UpsertScenarioInput,
} from '@workshop/shared';
import { reactive } from 'vue';

const props = defineProps<{ challengeId: string }>();
const emit = defineEmits<{
  submit: [{ challengeId: string; payload: UpsertScenarioInput }];
}>();

const form = reactive({
  order: 1,
  title: '',
  summary: '',
  findingType: '',
  severityLabel: 'medium',
  exploitability: 'possible',
  slaStatus: 'overdue',
  slaDays: 30,
  description: '',
  resourceName: '',
  resourceType: 'Kubernetes',
  resourceEnvironment: 'production',
  resourceExposure: 'internal',
  ownerHint: 'DevOps Team' as TeamType,
  answerAction: 'fix' as ActionType,
  answerOwner: 'DevOps Team' as TeamType,
  rationale: '',
  impact: '',
});

function submit() {
  emit('submit', {
    challengeId: props.challengeId,
    payload: {
      order: Number(form.order),
      title: form.title,
      summary: form.summary,
      findingType: form.findingType,
      severityLabel: form.severityLabel as UpsertScenarioInput['severityLabel'],
      exploitability:
        form.exploitability as UpsertScenarioInput['exploitability'],
      sla: {
        status: form.slaStatus as UpsertScenarioInput['sla']['status'],
        days: Number(form.slaDays),
      },
      description: form.description,
      resources: [
        {
          id: crypto.randomUUID(),
          name: form.resourceName,
          type: form.resourceType as UpsertScenarioInput['resources'][number]['type'],
          environment: form.resourceEnvironment,
          ownerHints: [form.ownerHint],
          exposure:
            form.resourceExposure as UpsertScenarioInput['resources'][number]['exposure'],
        },
      ],
      answer: {
        action: form.answerAction,
        ownerTeam: form.answerOwner,
        rationale: form.rationale,
        impact: form.impact,
      },
      alternatives: {},
    },
  });
}
</script>

<template>
  <form class="card p-6" @submit.prevent="submit">
    <h2 class="font-display text-2xl text-slate-900">Add scenario</h2>
    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Order</span>
        <input
          v-model="form.order"
          type="number"
          min="1"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
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
        <span class="mb-2 block text-sm font-semibold">Finding type</span>
        <input
          v-model="form.findingType"
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
      <label class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">Description</span>
        <textarea
          v-model="form.description"
          rows="4"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          required
        />
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
        />
      </label>
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Resource name</span>
        <input
          v-model="form.resourceName"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          required
        />
      </label>
      <label class="block">
        <span class="mb-2 block text-sm font-semibold">Owner hint</span>
        <select
          v-model="form.ownerHint"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
        >
          <option v-for="team in teams" :key="team" :value="team">
            {{ team }}
          </option>
        </select>
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
    </div>
    <button
      type="submit"
      class="mt-5 rounded-2xl bg-mint-500 px-5 py-3 font-semibold text-white transition hover:brightness-95"
    >
      Create scenario
    </button>
  </form>
</template>
