<script setup lang="ts">
import { useRouter } from 'vue-router';

import { ApiError } from '../api/client';
import WorkshopLockup from '../components/WorkshopLockup.vue';
import { useSessionStore } from '../stores/session';

const router = useRouter();
const sessionStore = useSessionStore();

async function startChallenge() {
  try {
    await sessionStore.join(
      sessionStore.joinDraft.joinCode,
      sessionStore.joinDraft.participantName
    );
    if (!sessionStore.bootstrap) {
      return;
    }

    router.push({
      name: 'play',
      params: { challengeSlug: sessionStore.bootstrap.challenge.slug },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      router.replace({ name: 'home' });
    }
    return;
  }
}
</script>

<template>
  <main class="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-8 md:px-8 md:py-10">
    <div class="panel p-5 sm:p-6 md:p-10">
      <div
        class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
      >
        <WorkshopLockup />
        <div class="surface-subtle w-full px-4 py-3 text-sm text-mist md:w-auto">
          <div class="flex items-baseline gap-2">
            <span class="text-[10px] uppercase tracking-[0.18em] text-mist/60">
              Player
            </span>
            <span class="font-semibold text-white">
              {{ sessionStore.joinDraft.participantName || 'Unnamed player' }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <div
          class="text-xs font-semibold uppercase tracking-[0.18em] text-mist/70"
        >
          Challenge
        </div>
        <h1 class="mt-2 font-display text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
          Cloud Village @RSAC 2026
        </h1>

        <div class="mt-5 grid gap-3 sm:mt-6 sm:gap-4">
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 1</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              Legacy backup IAM user with unused credentials
            </div>
            <p class="mt-2 text-sm leading-6 text-mist sm:text-sm">
              Decide whether an unused IAM user with broad AWS access should be
              fixed, snoozed, or ignored, and route it to the correct owner.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 2</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              Vulnerable bastion host with limited exposure
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Assess whether severe but internally constrained infrastructure
              vulnerabilities are urgent, and assign ownership to the right
              shared platform team.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 3</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              OpenSSH CVEs on a private internal host
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Decide whether a vulnerability finding with no public attack path
              should be ignored, and when the right answer is to improve the
              tooling rather than create another manual workflow.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 4</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              Lambda function with an overly broad execution role
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Decide whether a file-processing Lambda that runs on S3 uploads
              should keep account-wide administrator permissions, and route the
              remediation to the team that owns the workflow.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 5</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              External-account trust on an IAM role
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Decide whether a cross-account IAM role trusted by an AWS account
              outside the organization is risky, or whether it is a legitimate
              third-party security integration that should be ignored with
              better tooling context.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 6</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              Secrets stored in Azure Functions app settings
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Decide whether plaintext secrets in Function App environment
              variables should be remediated immediately, and recognize that
              Key Vault references are a simple way to improve both security
              and traceability.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 7</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              Public Kubernetes dashboard exposing cloud credentials
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Decide how urgently to respond when a publicly reachable
              Kubernetes dashboard allows attackers to inspect workloads and
              recover reusable AWS credentials from a running pod.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 8</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              Azure Storage public access finding covered by a perimeter control
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Decide whether an Azure Storage account with public network access
              still enabled is actually exposed, or whether an enforced Network
              Security Perimeter already supersedes the older control and makes
              the right answer to ignore with better tooling context.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 9</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              NLB logging finding already covered by a newer AWS path
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Decide whether a Network Load Balancer truly lacks access logs, or
              whether AWS CloudWatch Logs is already being used through the new
              NLB logging integration and the right answer is to ignore with
              better vendor coverage.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 10</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              IMDSv1 on an internet-facing EC2 workload
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Decide how urgently to respond when an internet-facing EC2
              application allows SSRF-style request forgery, still permits
              IMDSv1, and the attached role can read sensitive S3 data.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 11</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              Public EBS snapshot with active downstream dependencies
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Decide whether a publicly shared EBS snapshot should be fixed
              immediately, or whether the right call is to first understand who
              still depends on that sharing model and schedule the migration
              safely.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 12</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              Broad S3 access mitigated by restricted KMS decrypt
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Decide whether a broadly readable S3 bucket is an urgent incident,
              or whether SSE-KMS plus tightly scoped decrypt permissions lower
              the immediate risk enough to schedule the cleanup rather than
              treating it like open plaintext data.
            </p>
          </div>
        </div>

        <div class="surface-subtle mt-6 p-4 sm:mt-8 sm:p-6">
          <div class="flex items-center gap-2">
            <div
              class="text-xs font-semibold uppercase tracking-[0.18em] text-mist/70"
            >
              Ready to start
            </div>
            <div class="group relative">
              <button
                type="button"
                class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-aikido-800 text-[11px] font-semibold text-mist/70 transition hover:border-aikido-500/30 hover:text-white focus:border-aikido-500/30 focus:text-white"
                aria-label="Explain scoring"
              >
                i
              </button>
              <div
                class="pointer-events-none absolute left-0 top-7 z-10 w-72 rounded-2xl border border-aikido-800 bg-aikido-950 px-3 py-2 text-left text-xs normal-case tracking-normal text-mist opacity-0 shadow-panel transition group-hover:opacity-100 group-focus-within:opacity-100"
              >
                Your answers are scored on prioritization, ownership, and streak
                accuracy.
              </div>
            </div>
          </div>

          <div class="mt-6 flex flex-col gap-3">
            <button
              type="button"
              class="w-full rounded-2xl bg-aikido-500 px-4 py-4 font-display text-lg text-white transition hover:bg-[#5641d9] disabled:opacity-50"
              :disabled="
                sessionStore.loading ||
                !sessionStore.joinDraft.participantName ||
                !sessionStore.joinDraft.joinCode
              "
              @click="startChallenge"
            >
              {{ sessionStore.loading ? 'Starting...' : 'Start challenge' }}
            </button>
            <button
              type="button"
              class="w-full rounded-2xl border border-aikido-800 bg-aikido-950 px-4 py-4 font-semibold text-mist transition hover:border-aikido-500/30"
              @click="router.push({ name: 'home' })"
            >
              Back
            </button>
          </div>

          <p v-if="sessionStore.error" class="mt-4 text-sm text-red-300">
            {{ sessionStore.error }}
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
