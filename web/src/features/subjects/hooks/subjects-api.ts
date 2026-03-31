import { supabase } from "../../../integrations/supabase/client";
import type { CreateSubjectInput, SubjectRecord } from "../types/subject";

export async function fetchSubjects(userId: string, spaceId?: string) {
  let query = supabase
    .from("subjects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (spaceId) {
    query = query.eq("space_id", spaceId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as SubjectRecord[];
}

export async function createSubject(input: CreateSubjectInput) {
  const payload = {
    user_id: input.userId,
    space_id: input.spaceId,
    name: input.name,
    code: input.code?.trim() || null,
    description: input.description?.trim() || null,
  };

  const { data, error } = await supabase.from("subjects").insert(payload).select("*").single();

  if (error) throw error;
  return data as SubjectRecord;
}

export async function updateSubject(input: { userId: string; subjectId: string; name: string; code?: string; description?: string }) {
  const payload = {
    name: input.name,
    code: input.code?.trim() || null,
    description: input.description?.trim() || null,
  };

  const { data, error } = await supabase.from("subjects").update(payload).eq("user_id", input.userId).eq("id", input.subjectId).select("*").single();
  if (error) throw error;
  return data as SubjectRecord;
}

export async function deleteSubject(input: { userId: string; subjectId: string }) {
  const { error } = await supabase.from("subjects").delete().eq("user_id", input.userId).eq("id", input.subjectId);
  if (error) throw error;
}

export function getSubjectsErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong while loading subjects.";

  if (message.includes('relation "public.subjects" does not exist') || message.includes('relation "subjects" does not exist')) {
    return "Run the Phase 1 schema SQL in Supabase first so the subjects table exists.";
  }

  return message;
}
