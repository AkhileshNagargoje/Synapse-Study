import { supabase } from "../../../integrations/supabase/client";
import type { CreateTopicInput, TopicRecord } from "../types/topic";

export async function fetchTopics(userId: string, subjectId?: string) {
  let query = supabase.from("topics").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
  if (subjectId) query = query.eq("subject_id", subjectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as TopicRecord[];
}

export async function fetchTopicById(userId: string, topicId: string) {
  const { data, error } = await supabase.from("topics").select("*").eq("user_id", userId).eq("id", topicId).maybeSingle();
  if (error) throw error;
  return (data ?? null) as TopicRecord | null;
}

export async function createTopic(input: CreateTopicInput) {
  const payload = {
    user_id: input.userId,
    space_id: input.spaceId,
    subject_id: input.subjectId,
    title: input.title,
    summary: input.summary?.trim() || null,
  };
  const { data, error } = await supabase.from("topics").insert(payload).select("*").single();
  if (error) throw error;
  return data as TopicRecord;
}

export async function updateTopic(input: { userId: string; topicId: string; title: string; summary?: string }) {
  const payload = {
    title: input.title,
    summary: input.summary?.trim() || null,
  };

  const { data, error } = await supabase.from("topics").update(payload).eq("user_id", input.userId).eq("id", input.topicId).select("*").single();
  if (error) throw error;
  return data as TopicRecord;
}

export async function deleteTopic(input: { userId: string; topicId: string }) {
  const { error } = await supabase.from("topics").delete().eq("user_id", input.userId).eq("id", input.topicId);
  if (error) throw error;
}

export function getTopicsErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong while loading topics.";
  if (message.includes('relation "public.topics" does not exist') || message.includes('relation "topics" does not exist')) {
    return "Run the Phase 1 schema SQL in Supabase first so the topics table exists.";
  }
  return message;
}
