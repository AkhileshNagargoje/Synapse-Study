import { supabase } from "../../../integrations/supabase/client";
import type { UploadRecord } from "../types/upload";

export async function fetchTopicUploads(userId: string, topicId: string) {
  const { data, error } = await supabase.from("uploads").select("*").eq("user_id", userId).eq("topic_id", topicId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as UploadRecord[];
}

export async function createTopicUploadRecord(input: { userId: string; spaceId: string; subjectId: string; topicId: string; fileName: string; mimeType: string; fileSizeBytes: number; extractedText: string; extractedSummary: string; }) {
  const syntheticPath = `inline/${input.topicId}/${Date.now()}-${slugify(input.fileName)}`;
  const payload = {
    user_id: input.userId,
    space_id: input.spaceId,
    subject_id: input.subjectId,
    topic_id: input.topicId,
    file_name: input.fileName,
    storage_path: syntheticPath,
    mime_type: input.mimeType,
    file_size_bytes: input.fileSizeBytes,
    upload_level: "topic",
    upload_status: "processed",
    extracted_text: input.extractedText,
    extracted_summary: input.extractedSummary,
  };
  const { data, error } = await supabase.from("uploads").insert(payload).select("*").single();
  if (error) throw error;
  return data as UploadRecord;
}

export function getUploadsErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong while loading uploads.";
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}