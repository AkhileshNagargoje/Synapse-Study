import { supabase } from "../../../integrations/supabase/client";
import type { StickyNoteRecord, StickyScopeType } from "../types/sticky-note";

export async function fetchStickyNote(userId: string, scopeType: StickyScopeType, scopeId?: string) {
  let query = supabase
    .from("sticky_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("scope_type", scopeType)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (scopeId) {
    query = query.eq("scope_id", scopeId);
  } else {
    query = query.is("scope_id", null);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return (data ?? null) as StickyNoteRecord | null;
}

export async function fetchStickyNotes(userId: string, scopeType: StickyScopeType, scopeId?: string) {
  let query = supabase
    .from("sticky_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("scope_type", scopeType)
    .order("updated_at", { ascending: false });

  if (scopeId) {
    query = query.eq("scope_id", scopeId);
  } else {
    query = query.is("scope_id", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as StickyNoteRecord[];
}

export async function saveStickyNote(input: { userId: string; scopeType: StickyScopeType; scopeId?: string; noteId?: string; content: string }) {
  const trimmed = input.content.trim();

  if (input.noteId) {
    const { data, error } = await supabase
      .from("sticky_notes")
      .update({ content: trimmed })
      .eq("id", input.noteId)
      .eq("user_id", input.userId)
      .select("*")
      .single();

    if (error) throw error;
    return data as StickyNoteRecord;
  }

  const { data, error } = await supabase
    .from("sticky_notes")
    .insert({
      user_id: input.userId,
      scope_type: input.scopeType,
      scope_id: input.scopeId ?? null,
      content: trimmed,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as StickyNoteRecord;
}

export function getStickyNoteErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong while loading the note.";
}
