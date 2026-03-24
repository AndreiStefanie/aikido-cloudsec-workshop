<script setup lang="ts">
import type { LeaderboardEntry } from '@workshop/shared';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { fetchLeaderboard } from '../api/player';
import WorkshopLockup from '../components/WorkshopLockup.vue';

const route = useRoute();
const router = useRouter();
const entries = ref<LeaderboardEntry[]>([]);
const loading = ref(false);
const error = ref('');
const challengeName = computed(() =>
  route.params.challengeSlug === 'aws-identity-and-data-exposure'
    ? 'Cloud Village @RSAC 2026'
    : String(route.params.challengeSlug)
);

async function loadLeaderboard() {
  loading.value = true;
  error.value = '';
  try {
    entries.value = await fetchLeaderboard(
      route.params.challengeSlug as string
    );
  } catch (loadError) {
    error.value =
      loadError instanceof Error
        ? loadError.message
        : 'Unable to load leaderboard';
  } finally {
    loading.value = false;
  }
}

watch(() => route.params.challengeSlug, loadLeaderboard);

onMounted(loadLeaderboard);
</script>

<template>
  <main class="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
    <header
      class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
    >
      <div>
        <WorkshopLockup />
        <h1 class="mt-4 font-display text-4xl text-white md:text-5xl">
          Leaderboard
        </h1>
        <p class="mt-2 text-lg text-white">{{ challengeName }}</p>
        <p class="mt-2 text-mist">
          See how attendees stack up after finishing the challenge.
        </p>
      </div>
      <button
        type="button"
        class="rounded-2xl border border-aikido-800 bg-aikido-950 px-5 py-3 font-semibold text-mist hover:border-aikido-500/30"
        @click="router.push({ name: 'home' })"
      >
        Back to join screen
      </button>
    </header>

    <div v-if="loading" class="panel p-8 text-mist">Loading leaderboard...</div>
    <div v-else-if="error" class="panel p-8 text-red-300">{{ error }}</div>
    <div v-else class="panel p-6">
      <ol class="space-y-3">
        <li
          v-for="entry in entries"
          :key="`${entry.participantName}-${entry.completedAt}`"
          class="surface-subtle flex items-center justify-between px-4 py-4"
        >
          <div>
            <div class="font-display text-2xl text-white">
              {{ entry.rank }}. {{ entry.participantName }}
            </div>
            <div class="mt-1 text-sm text-mist/70">
              Completed {{ new Date(entry.completedAt).toLocaleString() }}
            </div>
          </div>
          <div class="pill pill-primary text-base">{{ entry.score }} pts</div>
        </li>
      </ol>

      <p v-if="entries.length === 0" class="text-mist">
        No completed runs yet.
      </p>
    </div>
  </main>
</template>
