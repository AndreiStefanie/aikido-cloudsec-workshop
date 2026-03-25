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
        <div
          class="surface-subtle w-full px-4 py-3 text-sm text-mist md:w-auto"
        >
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
        <h1
          class="mt-2 font-display text-3xl leading-tight text-white sm:text-4xl md:text-5xl"
        >
          Cloud Village @RSAC 2026
        </h1>

        <div class="mt-5 grid gap-3 sm:mt-6 sm:gap-4">
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 1</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              IAM user created for backup tasks but never used
            </div>
            <p class="mt-2 text-sm leading-6 text-mist sm:text-sm">
              Decide whether an unused IAM user with broad AWS access should be
              fixed, snoozed, or ignored, and route it to the correct owner.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 2</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              Bastion host with critical CVEs
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Seeing critical CVEs is alarming, but are they always urgent to
              fix?
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 3</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              EC2 instance with vulnerable OpenSSH
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Should all CVEs be treated equally? Or does the environment change
              their priority?
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 4</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              Lambda function with overly permissive execution role
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              We've seen this before: a Lambda function that must interact with
              a few AWS services is given admin permissions because it's the
              easy way to get it working.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 5</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              IAM role allowing access from an external AWS account
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
              At least they are not stored in code, right? Still, cloud
              providers offer great integrations with their secrets management
              services.
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 7</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              Public Kubernetes dashboard
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Worst case is that attackers see how much CPU your Kubernetes pods
              use, right? Well, remember those secrets provided as environment
              variables?
            </p>
          </div>
          <div class="surface-subtle p-4 sm:p-5">
            <div class="pill pill-primary">Scenario 8</div>
            <div class="mt-3 text-lg font-semibold leading-snug text-white">
              Azure Storage presumably allowing public network access
            </div>
            <p class="mt-2 text-sm leading-6 text-mist">
              Cloud providers constantly evolve their services, and sometimes
              they introduce higher-level features that are very easy to deploy
              across multiple resources, but this might not be obvious when
              starting from the resource itself.
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
