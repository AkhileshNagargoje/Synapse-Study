export type TopicRecord = {
  id: string;
  user_id: string;
  space_id: string;
  subject_id: string;
  title: string;
  summary: string | null;
  status: "active" | "archived";
  progress_percent: number;
  confidence_level: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
};

export type CreateTopicInput = {
  userId: string;
  spaceId: string;
  subjectId: string;
  title: string;
  summary?: string;
};