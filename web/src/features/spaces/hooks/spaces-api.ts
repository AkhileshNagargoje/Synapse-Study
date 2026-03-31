import { supabase } from "../../../integrations/supabase/client";
import type { CreateSpaceInput, SpaceRecord } from "../types/space";

export async function fetchSpaces(userId: string) {
  const { data, error } = await supabase
    .from("spaces")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SpaceRecord[];
}

export async function createSpace(input: CreateSpaceInput) {
  const payload = {
    user_id: input.userId,
    name: input.name,
    label: input.label?.trim() || null,
    focus_note: input.focusNote?.trim() || null,
    description: input.description?.trim() || null,
  };

  const { data, error } = await supabase.from("spaces").insert(payload).select("*").single();

  if (error) throw error;
  return data as SpaceRecord;
}

export async function updateSpace(input: { userId: string; spaceId: string; name: string; label?: string; focusNote?: string; description?: string }) {
  const payload = {
    name: input.name,
    label: input.label?.trim() || null,
    focus_note: input.focusNote?.trim() || null,
    description: input.description?.trim() || null,
  };

  const { data, error } = await supabase.from("spaces").update(payload).eq("user_id", input.userId).eq("id", input.spaceId).select("*").single();
  if (error) throw error;
  return data as SpaceRecord;
}

export async function deleteSpace(input: { userId: string; spaceId: string }) {
  const { error } = await supabase
    .from("spaces")
    .delete()
    .eq("user_id", input.userId)
    .eq("id", input.spaceId);

  if (error) throw error;
}

export function getSpacesErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong while loading spaces.";

  if (message.includes('relation "public.spaces" does not exist') || message.includes('relation "spaces" does not exist')) {
    return "Run the Phase 1 schema SQL in Supabase first so the spaces table exists.";
  }

  if (message.includes("violates foreign key constraint") || message.includes("profiles")) {
    return "Your profile row is missing. Sign out and log back in after the schema is applied.";
  }

  return message;
}
