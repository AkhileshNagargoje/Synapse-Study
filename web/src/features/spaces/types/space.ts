export type SpaceRecord = {
  id: string;
  user_id: string;
  name: string;
  label: string | null;
  description: string | null;
  progress_percent: number;
  focus_note: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateSpaceInput = {
  userId: string;
  name: string;
  label?: string;
  focusNote?: string;
  description?: string;
};