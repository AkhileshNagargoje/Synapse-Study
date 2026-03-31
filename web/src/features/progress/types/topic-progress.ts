export type RevisionStatus = "not_started" | "needs_revision" | "revised";
export type ConfidenceLevel = "low" | "medium" | "high";

export type TopicProgressRecord = {
  id: string;
  user_id: string;
  topic_id: string;
  progress_percent: number;
  confidence_level: ConfidenceLevel;
  is_studied: boolean;
  revision_status: RevisionStatus;
  last_reviewed_at: string | null;
  last_quiz_score: number | null;
  last_viva_score: number | null;
  created_at: string;
  updated_at: string;
};

export type UpsertTopicProgressInput = {
  userId: string;
  topicId: string;
  progressPercent: number;
  confidenceLevel: ConfidenceLevel;
  isStudied: boolean;
  revisionStatus: RevisionStatus;
  lastReviewedAt?: string | null;
};