export type SubjectRecord = {
  id: string;
  user_id: string;
  space_id: string;
  name: string;
  code: string | null;
  description: string | null;
  progress_percent: number;
  created_at: string;
  updated_at: string;
};

export type CreateSubjectInput = {
  userId: string;
  spaceId: string;
  name: string;
  code?: string;
  description?: string;
};