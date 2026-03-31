import type { ConfidenceLevel, RevisionStatus, TopicProgressRecord } from "../features/progress/types/topic-progress";

export function getDefaultTopicProgress(topicId: string, userId: string) {
  const now = new Date().toISOString();
  return {
    id: `local-${topicId}`,
    user_id: userId,
    topic_id: topicId,
    progress_percent: 0,
    confidence_level: "medium" as ConfidenceLevel,
    is_studied: false,
    revision_status: "not_started" as RevisionStatus,
    last_reviewed_at: null,
    last_quiz_score: null,
    last_viva_score: null,
    created_at: now,
    updated_at: now,
  } satisfies TopicProgressRecord;
}

export function calculatePackProgress(currentProgress: number) {
  return clamp(Math.max(currentProgress, 20), 0, 100);
}

export function calculateChatProgress(currentProgress: number) {
  return clamp(Math.min(45, Math.max(currentProgress, 20) + 6), 0, 100);
}

export function calculateManualProgress(options: {
  currentProgress: number;
  hasUploads: boolean;
  hasStudyPack: boolean;
  isStudied: boolean;
  confidenceLevel: ConfidenceLevel;
  revisionStatus: RevisionStatus;
}) {
  const floor = (options.hasUploads ? 8 : 0) + (options.hasStudyPack ? 14 : 0);
  const studiedBonus = options.isStudied ? 12 : 0;
  const confidenceBonus = options.confidenceLevel === "high" ? 12 : options.confidenceLevel === "medium" ? 6 : 0;
  const revisionBonus = options.revisionStatus === "revised" ? 10 : options.revisionStatus === "needs_revision" ? 3 : 0;
  return clamp(Math.max(options.currentProgress, floor + studiedBonus + confidenceBonus + revisionBonus), 0, 100);
}

export function deriveActivityScore(options: { hasUploads: boolean; hasStudyPack: boolean; hasReview: boolean; overallProgress: number; }) {
  let score = 0;
  if (options.hasUploads) score += 12;
  if (options.hasStudyPack) score += 16;
  if (options.hasReview) score += 6;
  if (options.overallProgress >= 25) score += 6;
  return clamp(score, 0, 40);
}

export function deriveMasteryScore(options: { overallProgress: number; activityScore: number; }) {
  const mastery = Math.round((options.overallProgress - options.activityScore * 0.3) / 0.7);
  return clamp(mastery, 0, 100);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}