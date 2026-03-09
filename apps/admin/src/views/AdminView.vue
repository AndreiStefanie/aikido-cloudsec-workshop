<script setup lang="ts">
import type { AdminChallengeSummary } from '@workshop/shared';
import { computed, onMounted, ref } from 'vue';

import ChallengeForm from '../components/ChallengeForm.vue';
import LoginPanel from '../components/LoginPanel.vue';
import ScenarioForm from '../components/ScenarioForm.vue';
import { useAdminStore } from '../stores/admin';

const adminStore = useAdminStore();
const selectedChallengeId = ref<string>('');

const selectedChallenge = computed<AdminChallengeSummary | null>(() => {
  return (
    adminStore.dashboard?.challenges.find(
      challenge => challenge.id === selectedChallengeId.value
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
}

async function saveScenario(input: {
  challengeId: string;
  payload: import('@workshop/shared').UpsertScenarioInput;
}) {
  await adminStore.saveScenario(input.challengeId, input.payload);
}

onMounted(async () => {
  if (adminStore.credentials) {
    try {
      await adminStore.loadDashboard();
      selectedChallengeId.value = adminStore.dashboard?.challenges[0]?.id ?? '';
    } catch {
      logout();
    }
  }
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
              <div class="badge badge-primary">Hosted by Aikido Security</div>
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

      <section class="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div class="space-y-6">
          <div class="card p-6">
            <div class="flex items-center justify-between">
              <h2 class="font-display text-2xl text-aikido-950">Challenges</h2>
              <button
                class="rounded-2xl bg-aikido-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5641d9]"
                @click="selectedChallengeId = ''"
              >
                New
              </button>
            </div>
            <div class="mt-4 space-y-3">
              <button
                v-for="challenge in adminStore.dashboard.challenges"
                :key="challenge.id"
                class="w-full rounded-2xl border px-4 py-4 text-left transition"
                :class="
                  selectedChallengeId === challenge.id
                    ? 'border-aikido-500 bg-aikido-50'
                    : 'border-slate-200 bg-slate-50 hover:border-aikido-500/30'
                "
                @click="selectedChallengeId = challenge.id"
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
              </button>
            </div>
          </div>

          <ChallengeForm
            :model-value="selectedChallenge"
            @submit="
              adminStore.saveChallenge(selectedChallenge?.id ?? null, $event)
            "
          />

          <ScenarioForm
            v-if="selectedChallenge"
            :challenge-id="selectedChallenge.id"
            @submit="saveScenario"
          />
        </div>

        <div class="card p-6">
          <h2 class="font-display text-2xl text-slate-900">
            Participant sessions
          </h2>
          <div
            class="mt-4 overflow-hidden rounded-3xl border border-slate-200"
          >
            <table
              class="min-w-full divide-y divide-slate-200 text-left text-sm"
            >
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
        </div>
      </section>

      <p v-if="adminStore.error" class="text-sm text-red-700">
        {{ adminStore.error }}
      </p>
    </div>
  </main>
</template>
