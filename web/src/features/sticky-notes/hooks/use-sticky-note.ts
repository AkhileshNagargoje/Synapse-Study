import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchStickyNote, fetchStickyNotes, getStickyNoteErrorMessage, saveStickyNote } from "./sticky-notes-api";
import type { StickyScopeType } from "../types/sticky-note";

export function useStickyNote(userId?: string, scopeType?: StickyScopeType, scopeId?: string) {
  return useQuery({
    queryKey: ["sticky-note", userId, scopeType, scopeId],
    queryFn: () => fetchStickyNote(userId!, scopeType!, scopeId),
    enabled: Boolean(userId && scopeType),
  });
}

export function useStickyNotes(userId?: string, scopeType?: StickyScopeType, scopeId?: string) {
  return useQuery({
    queryKey: ["sticky-notes", userId, scopeType, scopeId],
    queryFn: () => fetchStickyNotes(userId!, scopeType!, scopeId),
    enabled: Boolean(userId && scopeType),
  });
}

export function useSaveStickyNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string; scopeType: StickyScopeType; scopeId?: string; noteId?: string; content: string }) => saveStickyNote(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["sticky-note", variables.userId, variables.scopeType, variables.scopeId] });
      void queryClient.invalidateQueries({ queryKey: ["sticky-notes", variables.userId, variables.scopeType, variables.scopeId] });
    },
  });
}

export { getStickyNoteErrorMessage };
