import type {
  AdminChallengeSummary,
  AdminDashboardResponse,
  ChallengeDefinition,
  CompletedScenarioReview,
  JoinChallengeInput,
  LeaderboardEntry,
  ParticipantSession,
  PlayerBootstrap,
  ScenarioDecisionInput,
  ScenarioDecisionResult,
  ScenarioDefinition,
  UpsertChallengeInput,
  UpsertScenarioInput,
} from '@workshop/shared';
import {
  fallbackIgnoreFeedbackOptions as defaultIgnoreFeedbackOptions,
  fallbackSnoozeReasonOptions as defaultSnoozeReasonOptions,
} from '@workshop/shared';
import crypto from 'node:crypto';

import { sanitizeName } from '../../lib/http.js';
import { seedChallenges } from '../challenges/seed.js';
import { scoreDecision } from './scoring.js';
import type { ChallengeRecord, Repository, SessionRecord } from './types.js';

function cloneChallenge(challenge: ChallengeDefinition): ChallengeRecord {
  return JSON.parse(JSON.stringify(challenge));
}

export class InMemoryRepository implements Repository {
  private challenges = new Map<string, ChallengeRecord>();
  private sessions = new Map<string, SessionRecord>();
  private sessionsByToken = new Map<string, string>();

  constructor() {
    seedChallenges.map(cloneChallenge).forEach(challenge => {
      this.challenges.set(challenge.id, challenge);
    });
  }

  async joinChallenge(input: JoinChallengeInput): Promise<PlayerBootstrap> {
    const challenge = this.findChallengeByJoinCode(input.joinCode);
    const participantName = sanitizeName(input.participantName);

    if (!participantName) {
      throw new Error('Participant name is required');
    }

    if (!challenge?.isActive) {
      throw new Error('Challenge is not available');
    }

    const existingSession = this.findSessionByParticipantName(
      challenge.id,
      participantName
    );
    if (existingSession) {
      if (
        input.existingToken &&
        existingSession.token === input.existingToken
      ) {
        existingSession.updatedAt = new Date().toISOString();
        return this.toBootstrap(challenge, existingSession);
      }

      throw new Error(
        'This name is already taken on another device. Resume on the original device or choose another name.'
      );
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const token = crypto.randomBytes(18).toString('base64url');
    const session: SessionRecord = {
      id,
      token,
      participantName,
      challengeId: challenge.id,
      createdAt: now,
      updatedAt: now,
      currentScenarioIndex: 0,
      score: 0,
      streak: 0,
      correctActions: 0,
      correctSecondary: 0,
      decisions: {},
    };

    this.sessions.set(id, session);
    this.sessionsByToken.set(token, id);

    return this.toBootstrap(challenge, session);
  }

  async resumeSession(
    token: string,
    challengeSlug: string
  ): Promise<PlayerBootstrap | null> {
    const session = this.findSessionByToken(token);
    const challenge = this.findChallengeBySlug(challengeSlug);

    if (!session || !challenge || session.challengeId !== challenge.id) {
      return null;
    }

    return this.toBootstrap(challenge, session);
  }

  async revokeSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    this.sessions.delete(sessionId);
    this.sessionsByToken.delete(session.token);
    return true;
  }

  async getCurrentScenario(token: string): Promise<ScenarioDefinition | null> {
    const session = this.findSessionByToken(token);
    if (!session) {
      return null;
    }

    const challenge = this.challenges.get(session.challengeId);
    return challenge?.scenarios[session.currentScenarioIndex] ?? null;
  }

  async submitDecision(
    token: string,
    input: ScenarioDecisionInput
  ): Promise<ScenarioDecisionResult | null> {
    const session = this.findSessionByToken(token);
    if (!session) {
      return null;
    }

    const challenge = this.challenges.get(session.challengeId);
    const scenario = challenge?.scenarios[session.currentScenarioIndex];
    if (!challenge || !scenario) {
      return null;
    }

    if (input.action === 'snooze') {
      if (!input.snoozeReason) {
        throw new Error('Snooze reason is required');
      }

      const snoozeReasonOptions = scenario.snoozeReasonOptions ?? [
        ...defaultSnoozeReasonOptions,
      ];

      if (!snoozeReasonOptions.includes(input.snoozeReason)) {
        throw new Error('Snooze reason is invalid');
      }
    }

    if (input.action === 'ignore') {
      if (!input.ignoreFeedback) {
        throw new Error('Ignore feedback is required');
      }

      const ignoreFeedbackOptions = scenario.ignoreFeedbackOptions.length
        ? scenario.ignoreFeedbackOptions
        : [...defaultIgnoreFeedbackOptions];

      if (!ignoreFeedbackOptions.includes(input.ignoreFeedback)) {
        throw new Error('Ignore feedback option is invalid');
      }
    }

    const breakdown = scoreDecision(scenario, input, session.streak);
    const nextScenarioIndex = session.currentScenarioIndex + 1;
    const challengeCompleted = nextScenarioIndex >= challenge.scenarios.length;

    session.score +=
      breakdown.actionScoreDelta +
      breakdown.secondaryScoreDelta +
      breakdown.streakBonusDelta;
    session.streak = breakdown.nextStreak;
    session.correctActions += input.action === scenario.answer.action ? 1 : 0;
    session.correctSecondary +=
      input.action === 'snooze'
        ? input.snoozeReason === scenario.answer.snoozeReason
          ? 1
          : 0
        : input.action === 'ignore'
          ? input.ignoreFeedback === scenario.answer.ignoreFeedback
            ? 1
            : 0
          : scenario.answer.ownerTeam &&
              input.ownerTeam === scenario.answer.ownerTeam
            ? 1
            : 0;
    session.currentScenarioIndex = nextScenarioIndex;
    session.updatedAt = new Date().toISOString();
    if (challengeCompleted) {
      session.completedAt = session.updatedAt;
    }

    const result: ScenarioDecisionResult = {
      scenarioId: scenario.id,
      submittedAction: input.action,
      submittedOwnerTeam: input.ownerTeam,
      submittedSnoozeReason: input.snoozeReason,
      submittedIgnoreFeedback: input.ignoreFeedback,
      correctAction: scenario.answer.action,
      correctOwnerTeam: scenario.answer.ownerTeam,
      correctSnoozeReason: scenario.answer.snoozeReason,
      correctIgnoreFeedback: scenario.answer.ignoreFeedback,
      actionScoreDelta: breakdown.actionScoreDelta,
      secondaryScoreDelta: breakdown.secondaryScoreDelta,
      streakBonusDelta: breakdown.streakBonusDelta,
      resultingStreak: session.streak,
      totalScore: session.score,
      isActionCorrect: input.action === scenario.answer.action,
      isOwnerCorrect:
        input.action === 'fix' &&
        Boolean(scenario.answer.ownerTeam) &&
        input.ownerTeam === scenario.answer.ownerTeam,
      isSnoozeReasonCorrect:
        input.action === 'snooze' &&
        input.snoozeReason === scenario.answer.snoozeReason,
      isIgnoreFeedbackCorrect:
        input.action === 'ignore' &&
        input.ignoreFeedback === scenario.answer.ignoreFeedback,
      securityLesson: scenario.securityLesson,
      nextScenarioIndex,
      challengeCompleted,
    };

    session.decisions[scenario.id] = result;
    return result;
  }

  async getLeaderboard(challengeSlug: string): Promise<LeaderboardEntry[]> {
    const challenge = this.findChallengeBySlug(challengeSlug);
    if (!challenge) {
      return [];
    }

    return Array.from(this.sessions.values())
      .filter(
        session => session.challengeId === challenge.id && session.completedAt
      )
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        return (
          new Date(left.completedAt ?? 0).getTime() -
          new Date(right.completedAt ?? 0).getTime()
        );
      })
      .slice(0, 20)
      .map((session, index) => ({
        rank: index + 1,
        participantName: session.participantName,
        score: session.score,
        completedAt: session.completedAt as string,
      }));
  }

  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    const challenges: AdminChallengeSummary[] = Array.from(
      this.challenges.values()
    ).map(challenge => {
      const challengeSessions = Array.from(this.sessions.values()).filter(
        session => session.challengeId === challenge.id
      );

      return {
        id: challenge.id,
        slug: challenge.slug,
        name: challenge.name,
        joinCode: challenge.joinCode,
        isActive: challenge.isActive,
        scenarioCount: challenge.scenarios.length,
        participantCount: challengeSessions.length,
        completedCount: challengeSessions.filter(session => session.completedAt)
          .length,
      };
    });

    const sessions = Array.from(this.sessions.values())
      .sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() -
          new Date(left.updatedAt).getTime()
      )
      .map(session => ({
        id: session.id,
        participantName: session.participantName,
        challengeId: session.challengeId,
        challengeName:
          this.challenges.get(session.challengeId)?.name ?? 'Unknown',
        challengeSlug: this.challenges.get(session.challengeId)?.slug ?? '',
        score: session.score,
        currentScenarioIndex: session.currentScenarioIndex,
        completedAt: session.completedAt,
        updatedAt: session.updatedAt,
      }));

    const challengeDefinitions = Array.from(this.challenges.values())
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(challenge => cloneChallenge(challenge));

    return { challenges, sessions, challengeDefinitions };
  }

  async upsertChallenge(
    challengeId: string | null,
    input: UpsertChallengeInput
  ): Promise<ChallengeDefinition> {
    const existing = challengeId ? this.challenges.get(challengeId) : undefined;
    const challenge: ChallengeDefinition = {
      id: existing?.id ?? crypto.randomUUID(),
      scenarios: existing?.scenarios ?? [],
      ...input,
    };

    this.challenges.set(challenge.id, cloneChallenge(challenge));
    return challenge;
  }

  async upsertScenario(
    challengeId: string,
    scenarioId: string | null,
    input: UpsertScenarioInput
  ): Promise<ScenarioDefinition> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const existingIndex = challenge.scenarios.findIndex(
      scenario => scenario.id === scenarioId
    );
    const scenario: ScenarioDefinition = {
      id: scenarioId ?? crypto.randomUUID(),
      ...input,
    };

    if (existingIndex >= 0) {
      challenge.scenarios.splice(existingIndex, 1, scenario);
    } else {
      challenge.scenarios.push(scenario);
    }

    challenge.scenarios.sort((left, right) => left.order - right.order);
    return scenario;
  }

  private findChallengeBySlug(slug: string) {
    return Array.from(this.challenges.values()).find(
      challenge => challenge.slug === slug
    );
  }

  private findSessionByToken(token: string) {
    const sessionId = this.sessionsByToken.get(token);
    return sessionId ? (this.sessions.get(sessionId) ?? null) : null;
  }

  private findChallengeByJoinCode(joinCode: string) {
    const normalizedJoinCode = joinCode.trim().toUpperCase();
    return Array.from(this.challenges.values()).find(
      challenge => challenge.joinCode.toUpperCase() === normalizedJoinCode
    );
  }

  private findSessionByParticipantName(
    challengeId: string,
    participantName: string
  ) {
    const normalizedParticipantName = participantName.toLowerCase();
    return Array.from(this.sessions.values()).find(
      session =>
        session.challengeId === challengeId &&
        session.participantName.toLowerCase() === normalizedParticipantName
    );
  }

  private async toBootstrap(
    challenge: ChallengeDefinition,
    session: ParticipantSession
  ): Promise<PlayerBootstrap> {
    return {
      challenge: {
        id: challenge.id,
        slug: challenge.slug,
        name: challenge.name,
        description: challenge.description,
        joinCode: challenge.joinCode,
        isActive: challenge.isActive,
        scenarioCount: challenge.scenarios.length,
      },
      session,
      currentScenario: challenge.scenarios[session.currentScenarioIndex],
      leaderboard: await this.getLeaderboard(challenge.slug),
      completedReview: challenge.scenarios.flatMap<CompletedScenarioReview>(
        scenario => {
          const decision = (session as SessionRecord).decisions[scenario.id];
          if (!decision) {
            return [];
          }

          return [
            {
              scenarioId: scenario.id,
              title: scenario.title,
              submittedAction: decision.submittedAction,
              submittedOwnerTeam: decision.submittedOwnerTeam ?? undefined,
              submittedSnoozeReason:
                decision.submittedSnoozeReason ?? undefined,
              submittedIgnoreFeedback:
                decision.submittedIgnoreFeedback ?? undefined,
              correctAction: decision.correctAction,
              correctOwnerTeam: decision.correctOwnerTeam ?? undefined,
              correctSnoozeReason: decision.correctSnoozeReason ?? undefined,
              correctIgnoreFeedback:
                decision.correctIgnoreFeedback ?? undefined,
              actionScoreDelta: decision.actionScoreDelta,
              secondaryScoreDelta: decision.secondaryScoreDelta,
              streakBonusDelta: decision.streakBonusDelta,
              totalDelta:
                decision.actionScoreDelta +
                decision.secondaryScoreDelta +
                decision.streakBonusDelta,
              securityLesson: decision.securityLesson,
            },
          ];
        }
      ),
    };
  }
}
