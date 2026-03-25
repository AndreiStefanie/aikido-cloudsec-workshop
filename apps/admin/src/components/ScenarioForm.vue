<script setup lang="ts">
import type { TeamType } from '@workshop/shared';
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
  description: '',
  severityLabel: 'medium' as UpsertScenarioInput['severityLabel'],
  slaStatus: 'overdue' as UpsertScenarioInput['sla']['status'],
  slaDays: 30,
  remediation: '',
  diagramSrc: '',
  diagramAlt: '',
  diagramTitle: '',
  resourcesJson: '[]',
  ownerOptionsText: '',
  snoozeReasonOptionsText: '',
  ignoreFeedbackOptionsText: '',
  answerAction: 'fix' as UpsertScenarioInput['answer']['action'],
  answerOwner: 'DevOps Team' as TeamType,
  answerSnoozeReason: '',
  answerIgnoreFeedback: '',
  securityLesson: '',
});

const formError = reactive({ message: '' });

watch(
  () => props.modelValue,
  value => {
    form.order = value?.order ?? 1;
    form.title = value?.title ?? '';
    form.description = value?.description ?? '';
    form.severityLabel = value?.severityLabel ?? 'medium';
    form.slaStatus = value?.sla.status ?? 'overdue';
    form.slaDays = value?.sla.days ?? 30;
    form.remediation = value?.remediation ?? '';
    form.diagramSrc = value?.diagram?.src ?? '';
    form.diagramAlt = value?.diagram?.alt ?? '';
    form.diagramTitle = value?.diagram?.title ?? '';
    form.resourcesJson = JSON.stringify(value?.resources ?? [], null, 2);
    form.ownerOptionsText = (value?.ownerOptions ?? []).join('\n');
    form.snoozeReasonOptionsText = (value?.snoozeReasonOptions ?? []).join(
      '\n'
    );
    form.ignoreFeedbackOptionsText = (value?.ignoreFeedbackOptions ?? []).join(
      '\n'
    );
    form.answerAction = value?.answer.action ?? 'fix';
    form.answerOwner = value?.answer.ownerTeam ?? 'DevOps Team';
    form.answerSnoozeReason = value?.answer.snoozeReason ?? '';
    form.answerIgnoreFeedback = value?.answer.ignoreFeedback ?? '';
    form.securityLesson = value?.securityLesson ?? '';
    formError.message = '';
  },
  { immediate: true }
);

function submit() {
  try {
    const resources = JSON.parse(form.resourcesJson);
    const ownerOptions = form.ownerOptionsText
      .split('\n')
      .map(option => option.trim())
      .filter(Boolean) as TeamType[];
    const snoozeReasonOptions = form.snoozeReasonOptionsText
      .split('\n')
      .map(option => option.trim())
      .filter(Boolean);
    const ignoreFeedbackOptions = form.ignoreFeedbackOptionsText
      .split('\n')
      .map(option => option.trim())
      .filter(Boolean);

    const hasDiagramFields = Boolean(
      form.diagramSrc.trim() ||
      form.diagramAlt.trim() ||
      form.diagramTitle.trim()
    );

    if (form.answerAction === 'ignore' && ignoreFeedbackOptions.length !== 3) {
      formError.message = 'Provide exactly 3 ignore feedback options.';
      return;
    }

    if (form.answerAction === 'fix' && ownerOptions.length < 1) {
      formError.message = 'Provide at least 1 owner option.';
      return;
    }

    if (
      hasDiagramFields &&
      (!form.diagramSrc.trim() || !form.diagramAlt.trim())
    ) {
      formError.message =
        'Provide both a diagram image path and alt text, or leave all diagram fields empty.';
      return;
    }

    if (form.answerAction === 'snooze' && snoozeReasonOptions.length !== 3) {
      formError.message = 'Provide exactly 3 snooze reason options.';
      return;
    }

    emit('submit', {
      challengeId: props.challengeId,
      scenarioId: props.modelValue?.id ?? null,
      payload: {
        order: Number(form.order),
        title: form.title,
        description: form.description,
        severityLabel: form.severityLabel,
        sla: {
          status: form.slaStatus,
          days: Number(form.slaDays),
        },
        remediation: form.remediation,
        diagram: hasDiagramFields
          ? {
              src: form.diagramSrc.trim(),
              alt: form.diagramAlt.trim(),
              title: form.diagramTitle.trim() || undefined,
            }
          : undefined,
        resources,
        ownerOptions: form.answerAction === 'fix' ? ownerOptions : [],
        snoozeReasonOptions:
          form.answerAction === 'snooze' ? snoozeReasonOptions : [],
        ignoreFeedbackOptions:
          form.answerAction === 'ignore' ? ignoreFeedbackOptions : [],
        securityLesson: form.securityLesson,
        answer: {
          action: form.answerAction,
          ownerTeam: form.answerAction === 'fix' ? form.answerOwner : undefined,
          snoozeReason:
            form.answerAction === 'snooze'
              ? form.answerSnoozeReason || undefined
              : undefined,
          ignoreFeedback:
            form.answerAction === 'ignore'
              ? form.answerIgnoreFeedback || undefined
              : undefined,
        },
      },
    });
    formError.message = '';
  } catch {
    formError.message = 'Resources must be valid JSON.';
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
        <span class="mb-2 block text-sm font-semibold">Description</span>
        <input
          v-model="form.description"
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
        <span class="mb-2 block text-sm font-semibold">Diagram image path</span>
        <input
          v-model="form.diagramSrc"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          placeholder="/scenario-diagrams/aws/bastion-prod.svg"
        />
      </label>
      <label class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">Diagram alt text</span>
        <input
          v-model="form.diagramAlt"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          placeholder="Private bastion host reachable only through the corporate VPN"
        />
      </label>
      <label class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">
          Diagram title (optional)
        </span>
        <input
          v-model="form.diagramTitle"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          placeholder="Private access path"
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
      <label v-if="form.answerAction === 'fix'" class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">Owner options</span>
        <textarea
          v-model="form.ownerOptionsText"
          rows="4"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          placeholder="One option per line"
        />
      </label>
      <label v-if="form.answerAction === 'snooze'" class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">
          Snooze reason options
        </span>
        <textarea
          v-model="form.snoozeReasonOptionsText"
          rows="4"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          placeholder="One option per line"
        />
      </label>
      <label v-if="form.answerAction === 'ignore'" class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">
          Ignore feedback options
        </span>
        <textarea
          v-model="form.ignoreFeedbackOptionsText"
          rows="4"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          placeholder="One option per line"
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
      <label v-if="form.answerAction === 'fix'" class="block">
        <span class="mb-2 block text-sm font-semibold">Correct owner</span>
        <select
          v-model="form.answerOwner"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
        >
          <option
            v-for="team in form.ownerOptionsText
              .split('\n')
              .map(option => option.trim())
              .filter(Boolean)"
            :key="team"
            :value="team"
          >
            {{ team }}
          </option>
        </select>
      </label>
      <label v-if="form.answerAction === 'snooze'" class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">
          Correct snooze reason
        </span>
        <input
          v-model="form.answerSnoozeReason"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          placeholder="Required when correct action is Snooze"
        />
      </label>
      <label v-if="form.answerAction === 'ignore'" class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">
          Correct vendor feedback
        </span>
        <input
          v-model="form.answerIgnoreFeedback"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
          placeholder="Required when correct action is Ignore"
        />
      </label>
      <label class="block md:col-span-2">
        <span class="mb-2 block text-sm font-semibold">Security lesson</span>
        <textarea
          v-model="form.securityLesson"
          rows="3"
          class="w-full rounded-2xl border-slate-200 px-4 py-3"
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
