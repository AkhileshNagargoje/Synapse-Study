import { supabase } from "../../../integrations/supabase/client";
import type { TopicProgressRecord, UpsertTopicProgressInput } from "../types/topic-progress";

export async function fetchTopicProgress(userId: string, topicId: string) {
  const { data, error } = await supabase
    .from("topic_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as TopicProgressRecord | null;
}

export async function upsertTopicProgress(input: UpsertTopicProgressInput) {
  const payload = {
    user_id: input.userId,
    topic_id: input.topicId,
    progress_percent: input.progressPercent,
    confidence_level: input.confidenceLevel,
    is_studied: input.isStudied,
    revision_status: input.revisionStatus,
    last_reviewed_at: input.lastReviewedAt ?? null,
  };

  const { data, error } = await supabase
    .from("topic_progress")
    .upsert(payload, { onConflict: "topic_id" })
    .select("*")
    .single();

  if (error) throw error;

  const { error: topicError } = await supabase
    .from("topics")
    .update({
      progress_percent: input.progressPercent,
      confidence_level: input.confidenceLevel,
    })
    .eq("user_id", input.userId)
    .eq("id", input.topicId);

  if (topicError) throw topicError;

  return data as TopicProgressRecord;
}

export function getTopicProgressErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong while loading topic progress.";

  if (message.includes('relation "public.topic_progress" does not exist') || message.includes('relation "topic_progress" does not exist')) {
    return "Run the Phase 1 schema SQL in Supabase first so topic progress exists.";
  }

  return message;
}