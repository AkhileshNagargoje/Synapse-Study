export type ChatRole = "user" | "assistant" | "system";

export type ChatThreadRecord = {
  id: string;
  user_id: string;
  topic_id: string;
  title: string | null;
  mode: "normal" | "live_tutor";
  created_at: string;
  updated_at: string;
};

export type ChatMessageRecord = {
  id: string;
  thread_id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type TopicChatRecord = {
  thread: ChatThreadRecord | null;
  messages: ChatMessageRecord[];
};
