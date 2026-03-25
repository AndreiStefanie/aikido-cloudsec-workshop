export const actions = ['fix', 'snooze', 'ignore'] as const;
export type ActionType = (typeof actions)[number];

export const teams = [
  'DevOps Team',
  'Application Team',
  'Security Team',
  'Cloud Platform Team',
] as const;
export type TeamType = (typeof teams)[number];

export const fallbackSnoozeReasonOptions = [
  'Remediation should be deferred until the next scheduled maintenance window because the current context does not justify immediate disruption.',
  'This finding should be snoozed until the owning team confirms whether the affected resource is still actively used in production.',
  'The issue is real, but the current exposure and operational context support documenting a temporary exception while remediation is planned.',
] as const;

export const fallbackIgnoreFeedbackOptions = [
  'Suppress findings like this automatically when the effective attack path is already blocked by compensating controls.',
  'Add richer context so non-actionable findings can be identified earlier without a manual review.',
  'Recognize when newer platform-native controls already cover the reported issue and suppress the finding accordingly.',
] as const;

export type ResourceType =
  | 'Container'
  | 'CodeRepository'
  | 'Kubernetes'
  | 'Serverless'
  | 'VirtualMachine'
  | 'Database'
  | 'Storage'
  | 'Identity';

export interface ResourceContext {
  id: string;
  name: string;
  type: ResourceType;
  assetTypeLabel?: string;
  createdAt?: string;
  tags?: string[];
  account?: string;
  detailsLabel?: string;
  detailRows?: ScenarioDetailRow[];
}

export interface ScenarioDetailRow {
  field: string;
  value: string;
}

export interface ScenarioAnswer {
  action: ActionType;
  ownerTeam?: TeamType;
  snoozeReason?: string;
  ignoreFeedback?: string;
}

export interface ScenarioSla {
  status: 'overdue' | 'due_soon';
  days: number;
}

export interface ScenarioDiagram {
  src: string;
  alt: string;
  title?: string;
}

export interface ScenarioDefinition {
  id: string;
  order: number;
  title: string;
  description: string;
  severityLabel: 'low' | 'medium' | 'high' | 'critical';
  sla: ScenarioSla;
  remediation: string;
  diagram?: ScenarioDiagram;
  resources: ResourceContext[];
  securityLesson: string;
  ownerOptions?: TeamType[];
  snoozeReasonOptions?: string[];
  ignoreFeedbackOptions: string[];
  answer: ScenarioAnswer;
}

export interface ChallengeDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  joinCode: string;
  isActive: boolean;
  scenarios: ScenarioDefinition[];
}

export interface ParticipantSession {
  id: string;
  token: string;
  participantName: string;
  challengeId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  currentScenarioIndex: number;
  score: number;
  streak: number;
  correctActions: number;
  correctSecondary: number;
}

export interface ScenarioDecisionInput {
  action: ActionType;
  ownerTeam?: TeamType | null;
  snoozeReason?: string;
  ignoreFeedback?: string;
}

export interface ScenarioDecisionResult {
  scenarioId: string;
  submittedAction: ActionType;
  submittedOwnerTeam?: TeamType | null;
  submittedSnoozeReason?: string;
  submittedIgnoreFeedback?: string;
  correctAction: ActionType;
  correctOwnerTeam?: TeamType;
  correctSnoozeReason?: string;
  correctIgnoreFeedback?: string;
  actionScoreDelta: number;
  secondaryScoreDelta: number;
  streakBonusDelta: number;
  resultingStreak: number;
  totalScore: number;
  isActionCorrect: boolean;
  isOwnerCorrect: boolean;
  isSnoozeReasonCorrect: boolean;
  isIgnoreFeedbackCorrect: boolean;
  securityLesson: string;
  nextScenarioIndex: number;
  challengeCompleted: boolean;
}

export interface CompletedScenarioReview {
  scenarioId: string;
  title: string;
  submittedAction: ActionType;
  submittedOwnerTeam?: TeamType;
  submittedSnoozeReason?: string;
  submittedIgnoreFeedback?: string;
  correctAction: ActionType;
  correctOwnerTeam?: TeamType;
  correctSnoozeReason?: string;
  correctIgnoreFeedback?: string;
  actionScoreDelta: number;
  secondaryScoreDelta: number;
  streakBonusDelta: number;
  totalDelta: number;
  securityLesson: string;
}

export interface LeaderboardEntry {
  rank: number;
  participantName: string;
  score: number;
  completedAt: string;
}

export interface PlayerBootstrap {
  challenge: Omit<ChallengeDefinition, 'scenarios'> & {
    scenarioCount: number;
  };
  session: ParticipantSession;
  currentScenario?: ScenarioDefinition;
  leaderboard: LeaderboardEntry[];
  completedReview: CompletedScenarioReview[];
}

export interface JoinChallengeInput {
  joinCode: string;
  participantName: string;
  existingToken?: string;
}

export interface ResumeSessionInput {
  token: string;
  challengeSlug: string;
}

export interface AdminChallengeSummary {
  id: string;
  slug: string;
  name: string;
  joinCode: string;
  isActive: boolean;
  scenarioCount: number;
  participantCount: number;
  completedCount: number;
}

export interface AdminSessionSummary {
  id: string;
  participantName: string;
  challengeId: string;
  challengeName: string;
  challengeSlug: string;
  score: number;
  currentScenarioIndex: number;
  completedAt?: string;
  updatedAt: string;
}

export interface AdminDashboardResponse {
  challenges: AdminChallengeSummary[];
  sessions: AdminSessionSummary[];
  challengeDefinitions: ChallengeDefinition[];
}

export interface UpsertChallengeInput {
  slug: string;
  name: string;
  description: string;
  joinCode: string;
  isActive: boolean;
}

export interface UpsertScenarioInput {
  order: number;
  title: string;
  description: string;
  severityLabel: ScenarioDefinition['severityLabel'];
  sla: ScenarioSla;
  remediation: string;
  diagram?: ScenarioDiagram;
  resources: ResourceContext[];
  securityLesson: string;
  ownerOptions?: TeamType[];
  snoozeReasonOptions?: string[];
  ignoreFeedbackOptions: string[];
  answer: ScenarioAnswer;
}
