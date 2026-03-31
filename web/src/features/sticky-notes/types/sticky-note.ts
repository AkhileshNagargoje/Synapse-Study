export type StickyScopeType = "student" | "space" | "topic";

export type StickyNoteRecord = {
  id: string;
  user_id: string;
  scope_type: StickyScopeType;
  scope_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};
