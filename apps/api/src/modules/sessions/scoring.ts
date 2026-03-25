import type {
  ActionType,
  ScenarioDecisionInput,
  ScenarioDefinition,
} from '@workshop/shared';

import type { ScoreBreakdown } from './types.js';

function actionDelta(submitted: ActionType, expected: ActionType) {
  if (submitted === expected) {
    return 10;
  }

  const harmlessMismatch =
    (submitted === 'fix' && expected === 'snooze') ||
    (submitted === 'snooze' && expected === 'fix');

  return harmlessMismatch ? 0 : -5;
}

export function scoreDecision(
  scenario: ScenarioDefinition,
  decision: ScenarioDecisionInput,
  currentStreak: number
): ScoreBreakdown {
  const actionScoreDelta = actionDelta(decision.action, scenario.answer.action);
  const isActionCorrect = decision.action === scenario.answer.action;
  const ownerRelevant = decision.action === 'fix';
  const snoozeReasonRelevant = decision.action === 'snooze';
  const ignoreFeedbackRelevant =
    decision.action === 'ignore' && scenario.answer.action === 'ignore';
  const secondaryScoreDelta =
    ownerRelevant &&
    scenario.answer.ownerTeam &&
    decision.ownerTeam === scenario.answer.ownerTeam
      ? 5
      : snoozeReasonRelevant &&
          scenario.answer.snoozeReason &&
          decision.snoozeReason === scenario.answer.snoozeReason
        ? 5
        : ignoreFeedbackRelevant &&
            decision.ignoreFeedback === scenario.answer.ignoreFeedback
          ? 5
          : 0;
  const nextStreak = isActionCorrect ? currentStreak + 1 : 0;
  const streakBonusDelta = isActionCorrect ? nextStreak : 0;

  return {
    actionScoreDelta,
    secondaryScoreDelta,
    streakBonusDelta,
    nextStreak,
  };
}
