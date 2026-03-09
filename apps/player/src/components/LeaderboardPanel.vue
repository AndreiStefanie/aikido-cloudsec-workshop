<script setup lang="ts">
import type { LeaderboardEntry } from '@workshop/shared';

defineProps<{ entries: LeaderboardEntry[] }>();
</script>

<template>
  <aside class="panel p-5 text-sm text-mist">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-lg text-white">Leaderboard</h2>
      <span class="pill pill-primary">Live</span>
    </div>

    <ol class="mt-4 space-y-3">
      <li
        v-for="entry in entries"
        :key="`${entry.participantName}-${entry.completedAt}`"
        class="surface-subtle flex items-center justify-between px-4 py-3"
      >
        <div>
          <div class="font-semibold text-white">
            {{ entry.rank }}. {{ entry.participantName }}
          </div>
          <div class="text-xs text-mist/70">
            {{ new Date(entry.completedAt).toLocaleTimeString() }}
          </div>
        </div>
        <div class="text-base font-extrabold text-aikido-100">
          {{ entry.score }}
        </div>
      </li>
    </ol>
  </aside>
</template>
