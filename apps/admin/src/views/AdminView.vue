<script setup lang="ts">
import type {
  AdminChallengeSummary,
  ChallengeDefinition,
  ScenarioDefinition,
} from '@workshop/shared';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import ChallengeForm from '../components/ChallengeForm.vue';
import LoginPanel from '../components/LoginPanel.vue';
import ScenarioForm from '../components/ScenarioForm.vue';
import { useAdminStore } from '../stores/admin';

const adminStore = useAdminStore();
const selectedChallengeId = ref<string>('');
const selectedScenarioId = ref<string>('');
const activeTab = ref<'content' | 'participants'>('content');
const challengeDialogOpen = ref(false);
const scenarioDialogOpen = ref(false);

const selectedChallenge = computed<AdminChallengeSummary | null>(() => {
  return (
    adminStore.dashboard?.challenges.find(
      challenge => challenge.id === selectedChallengeId.value
    ) ?? null
  );
});

const selectedChallengeDefinition = computed<ChallengeDefinition | null>(() => {
  return (
    adminStore.dashboard?.challengeDefinitions.find(
      challenge => challenge.id === selectedChallengeId.value
    ) ?? null
  );
});

const selectedScenario = computed<ScenarioDefinition | null>(() => {
  return (
    selectedChallengeDefinition.value?.scenarios.find(
      scenario => scenario.id === selectedScenarioId.value
    ) ?? null
  );
});

async function authenticate(username: string, password: string) {
  adminStore.setCredentials(username, password);
  await adminStore.loadDashboard();
  selectedChallengeId.value = adminStore.dashboard?.challenges[0]?.id ?? '';
}

function logout() {
  adminStore.clearCredentials();
  selectedChallengeId.value = '';
  selectedScenarioId.value = '';
  challengeDialogOpen.value = false;
  scenarioDialogOpen.value = false;
}

function openNewChallengeDialog() {
  selectedChallengeId.value = '';
  selectedScenarioId.value = '';
  challengeDialogOpen.value = true;
  scenarioDialogOpen.value = false;
}

function selectChallenge(challengeId: string) {
  selectedChallengeId.value = challengeId;
  selectedScenarioId.value = '';
  scenarioDialogOpen.value = false;
}

function openNewScenarioDialog() {
  selectedScenarioId.value = '';
  scenarioDialogOpen.value = true;
}

function openScenarioDialog(scenarioId: string) {
  selectedScenarioId.value = scenarioId;
  scenarioDialogOpen.value = true;
}

function closeDialogs() {
  challengeDialogOpen.value = false;
  scenarioDialogOpen.value = false;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeDialogs();
  }
}

async function saveChallenge(
  payload: import('@workshop/shared').UpsertChallengeInput
) {
  await adminStore.saveChallenge(selectedChallenge.value?.id ?? null, payload);
  challengeDialogOpen.value = false;
}

async function saveScenario(input: {
  challengeId: string;
  scenarioId: string | null;
  payload: import('@workshop/shared').UpsertScenarioInput;
}) {
  await adminStore.saveScenario(
    input.challengeId,
    input.scenarioId,
    input.payload
  );
  scenarioDialogOpen.value = false;
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown);

  if (adminStore.credentials) {
    try {
      await adminStore.loadDashboard();
      selectedChallengeId.value = adminStore.dashboard?.challenges[0]?.id ?? '';
    } catch {
      logout();
    }
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <main class="min-h-screen px-4 py-8 md:px-8">
    <LoginPanel
      v-if="
        !adminStore.credentials ||
        (!adminStore.dashboard && !adminStore.loading)
      "
      @submit="authenticate"
    />

    <div v-else-if="adminStore.dashboard" class="mx-auto max-w-7xl space-y-6">
      <header class="card p-8">
        <div
          class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <div
                class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600"
              >
                CloudSec Workshop
              </div>
            </div>
            <h1 class="mt-2 font-display text-4xl text-aikido-950">
              Admin dashboard
            </h1>
          </div>
          <div class="text-sm text-slate-700">
            <div>
              {{ adminStore.dashboard.sessions.length }} active or completed
              participant sessions
            </div>
            <button
              type="button"
              class="mt-3 rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:border-aikido-500/30"
              @click="logout"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <section class="card p-3">
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-2xl px-5 py-3 text-sm font-semibold transition"
            :class="
              activeTab === 'content'
                ? 'bg-aikido-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            "
            @click="activeTab = 'content'"
          >
            Challenges & scenarios
          </button>
          <button
            type="button"
            class="rounded-2xl px-5 py-3 text-sm font-semibold transition"
            :class="
              activeTab === 'participants'
                ? 'bg-aikido-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            "
            @click="activeTab = 'participants'"
          >
            Participant sessions
          </button>
        </div>
      </section>

      <section v-if="activeTab === 'content'" class="space-y-6">
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <h2 class="font-display text-2xl text-aikido-950">Challenges</h2>
            <button
              class="rounded-2xl bg-aikido-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5641d9]"
              @click="openNewChallengeDialog"
            >
              New
            </button>
          </div>
          <div class="mt-4 grid gap-3 xl:grid-cols-2">
            <button
              v-for="challenge in adminStore.dashboard.challenges"
              :key="challenge.id"
              class="w-full rounded-2xl border px-4 py-4 text-left transition"
              :class="
                selectedChallengeId === challenge.id
                  ? 'border-aikido-500 bg-aikido-50'
                  : 'border-slate-200 bg-slate-50 hover:border-aikido-500/30'
              "
              @click="selectChallenge(challenge.id)"
            >
              <div class="flex items-center justify-between gap-4">
                <div>
                  <div class="font-semibold text-slate-900">
                    {{ challenge.name }}
                  </div>
                  <div class="text-sm text-slate-600">
                    /{{ challenge.slug }} · code {{ challenge.joinCode }}
                  </div>
                </div>
                <div class="text-right text-sm text-slate-600">
                  <div>{{ challenge.participantCount }} players</div>
                  <div>{{ challenge.completedCount }} completed</div>
                </div>
              </div>
              <div
                v-if="selectedChallengeId === challenge.id"
                class="mt-4 flex justify-end"
              >
                <button
                  type="button"
                  class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-aikido-500/30"
                  @click.stop="challengeDialogOpen = true"
                >
                  Edit challenge
                </button>
              </div>
            </button>
          </div>
        </div>

        <div v-if="selectedChallengeDefinition" class="card p-6">
          <div class="flex items-center justify-between gap-4">
            <h2 class="font-display text-2xl text-slate-900">Scenarios</h2>
            <button
              type="button"
              class="rounded-2xl bg-mint-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
              @click="openNewScenarioDialog"
            >
              New
            </button>
          </div>
          <div class="mt-4 grid gap-3 xl:grid-cols-2">
            <button
              v-for="scenario in selectedChallengeDefinition.scenarios"
              :key="scenario.id"
              type="button"
              class="w-full rounded-2xl border px-4 py-4 text-left transition"
              :class="
                selectedScenarioId === scenario.id
                  ? 'border-mint-500 bg-mint-50'
                  : 'border-slate-200 bg-slate-50 hover:border-mint-500/30'
              "
              @click="openScenarioDialog(scenario.id)"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="font-semibold text-slate-900">
                    {{ scenario.order }}. {{ scenario.title }}
                  </div>
                  <div class="mt-1 text-sm text-slate-600">
                    {{ scenario.summary }}
                  </div>
                </div>
                <div
                  class="text-right text-xs uppercase tracking-[0.18em] text-slate-500"
                >
                  <div>{{ scenario.severityLabel }}</div>
                  <div class="mt-1">
                    {{ scenario.sla.status }} · {{ scenario.sla.days }} days
                  </div>
                </div>
              </div>
            </button>
            <p
              v-if="selectedChallengeDefinition.scenarios.length === 0"
              class="text-sm text-slate-500"
            >
              No scenarios yet.
            </p>
          </div>
        </div>
      </section>

      <div
        v-if="challengeDialogOpen"
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm"
        @click.self="closeDialogs"
      >
        <div class="w-full max-w-3xl">
          <ChallengeForm
            :model-value="selectedChallengeDefinition"
            @submit="saveChallenge"
            @cancel="closeDialogs"
          />
        </div>
      </div>

      <div
        v-if="scenarioDialogOpen && selectedChallenge"
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm"
        @click.self="closeDialogs"
      >
        <div class="max-h-[90vh] w-full max-w-5xl overflow-hidden">
          <ScenarioForm
            :challenge-id="selectedChallenge.id"
            :model-value="selectedScenario"
            @submit="saveScenario"
            @cancel="closeDialogs"
          />
        </div>
      </div>

      <section v-else-if="activeTab === 'participants'" class="card p-6">
        <div class="flex items-center justify-between gap-4">
          <h2 class="font-display text-2xl text-slate-900">
            Participant sessions
          </h2>
          <div class="text-sm text-slate-500">
            {{ adminStore.dashboard.sessions.length }} total sessions
          </div>
        </div>
        <div class="mt-4 overflow-hidden rounded-3xl border border-slate-200">
          <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead class="bg-slate-50 text-slate-700">
              <tr>
                <th class="px-4 py-3">Name</th>
                <th class="px-4 py-3">Challenge</th>
                <th class="px-4 py-3">Score</th>
                <th class="px-4 py-3">Progress</th>
                <th class="px-4 py-3">Updated</th>
                <th class="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              <tr
                v-for="session in adminStore.dashboard.sessions"
                :key="session.id"
              >
                <td class="px-4 py-3 font-semibold text-slate-900">
                  {{ session.participantName }}
                </td>
                <td class="px-4 py-3">{{ session.challengeName }}</td>
                <td class="px-4 py-3">{{ session.score }}</td>
                <td class="px-4 py-3">
                  {{
                    session.completedAt
                      ? 'Completed'
                      : `Scenario ${session.currentScenarioIndex + 1}`
                  }}
                </td>
                <td class="px-4 py-3">
                  {{ new Date(session.updatedAt).toLocaleString() }}
                </td>
                <td class="px-4 py-3">
                  <button
                    type="button"
                    class="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    @click="adminStore.revokeParticipantSession(session.id)"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p v-if="adminStore.error" class="text-sm text-red-700">
        {{ adminStore.error }}
      </p>
    </div>
  </main>
</template>
