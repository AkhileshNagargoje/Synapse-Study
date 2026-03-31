import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSpace, deleteSpace, fetchSpaces, getSpacesErrorMessage, updateSpace } from "./spaces-api";
import type { CreateSpaceInput } from "../types/space";

export function useSpaces(userId?: string) {
  return useQuery({
    queryKey: ["spaces", userId],
    queryFn: () => fetchSpaces(userId!),
    enabled: Boolean(userId),
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSpaceInput) => createSpace(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["spaces", variables.userId] });
    },
  });
}

export function useUpdateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string; spaceId: string; name: string; label?: string; focusNote?: string; description?: string }) => updateSpace(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["spaces", variables.userId] });
    },
  });
}

export function useDeleteSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string; spaceId: string }) => deleteSpace(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["spaces", variables.userId] });
      void queryClient.invalidateQueries({ queryKey: ["subjects", variables.userId, variables.spaceId] });
      void queryClient.invalidateQueries({ queryKey: ["subjects", variables.userId] });
      void queryClient.invalidateQueries({ queryKey: ["topics", variables.userId] });
    },
  });
}

export { getSpacesErrorMessage };
