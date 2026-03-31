import { supabase } from "../../../integrations/supabase/client";
import type { ChatMessageRecord, ChatThreadRecord, TopicChatRecord } from "../types/chat";

export async function fetchTopicChat(userId: string, topicId: string) {
  const { data: thread, error: threadError } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .eq("mode", "normal")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (threadError) throw threadError;
  if (!thread) return { thread: null, messages: [] } satisfies TopicChatRecord;

  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("thread_id", thread.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (messagesError) throw messagesError;

  return {
    thread: thread as ChatThreadRecord,
    messages: (messages ?? []).map(normalizeMessage),
  } satisfies TopicChatRecord;
}

export async function saveTopicChatExchange(input: {
  userId: string;
  topicId: string;
  topicTitle: string;
  question: string;
  answer: string;
  modelName?: string | null;
}) {
  const thread = await ensureTopicThread(input.userId, input.topicId, input.topicTitle, input.question);

  const payload = [
    {
      thread_id: thread.id,
      user_id: input.userId,
      role: "user",
      content: input.question,
      metadata: {},
    },
    {
      thread_id: thread.id,
      user_id: input.userId,
      role: "assistant",
      content: input.answer,
      metadata: input.modelName ? { model: input.modelName } : {},
    },
  ];

  const { error: insertError } = await supabase.from("chat_messages").insert(payload);
  if (insertError) throw insertError;

  const nextTitle = thread.title?.trim() ? thread.title : buildThreadTitle(input.question);
  const { error: updateError } = await supabase
    .from("chat_threads")
    .update({ title: nextTitle })
    .eq("id", thread.id)
    .eq("user_id", input.userId);

  if (updateError) throw updateError;

  return thread.id;
}

export function getChatErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong while loading the saved chat.";
}

async function ensureTopicThread(userId: string, topicId: string, topicTitle: string, question: string) {
  const { data: existing, error: existingError } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .eq("mode", "normal")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing as ChatThreadRecord;

  const { data, error } = await supabase
    .from("chat_threads")
    .insert({
      user_id: userId,
      topic_id: topicId,
      mode: "normal",
      title: buildThreadTitle(question) || `${topicTitle} chat`,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ChatThreadRecord;
}

function normalizeMessage(message: Record<string, unknown>) {
  return {
    ...(message as ChatMessageRecord),
    metadata: typeof message.metadata === "object" && message.metadata ? (message.metadata as Record<string, unknown>) : {},
  } satisfies ChatMessageRecord;
}

function buildThreadTitle(question: string) {
  const cleaned = question.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Topic chat";
  return cleaned.length > 60 ? `${cleaned.slice(0, 57)}...` : cleaned;
}
