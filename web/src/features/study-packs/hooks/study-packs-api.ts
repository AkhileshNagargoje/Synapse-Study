import { supabase } from "../../../integrations/supabase/client";
import type { StudyPackBody, StudyPackRecord } from "../types/study-pack";

export async function fetchStudyPack(userId: string, topicId: string) {
  const { data, error } = await supabase.from("study_packs").select("*").eq("user_id", userId).eq("topic_id", topicId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, source_upload_ids: Array.isArray(data.source_upload_ids) ? data.source_upload_ids : [], pack_body: (data.pack_body ?? {}) as StudyPackBody } as StudyPackRecord;
}

export async function upsertStudyPack(input: { userId: string; topicId: string; uploadIds: string[]; packBody: StudyPackBody; modelName?: string; }) {
  const payload = { user_id: input.userId, topic_id: input.topicId, source_upload_ids: input.uploadIds, pack_body: input.packBody, generation_status: "ready", model_name: input.modelName ?? null };
  const { data, error } = await supabase.from("study_packs").upsert(payload, { onConflict: "topic_id" }).select("*").single();
  if (error) throw error;
  return { ...data, source_upload_ids: Array.isArray(data.source_upload_ids) ? data.source_upload_ids : [], pack_body: (data.pack_body ?? {}) as StudyPackBody } as StudyPackRecord;
}

export function getStudyPackErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong while loading the study pack.";
}