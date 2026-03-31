import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSubject, deleteSubject, fetchSubjects, getSubjectsErrorMessage, updateSubject } from "./subjects-api";
import type { CreateSubjectInput } from "../types/subject";

export function useSubjects(userId?: string, spaceId?: string) {
  return useQuery({
    queryKey: ["subjects", userId, spaceId],
    queryFn: () => fetchSubjects(userId!, spaceId),
    enabled: Boolean(userId),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSubjectInput) => createSubject(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["subjects", variables.userId, variables.spaceId] });
      void queryClient.invalidateQueries({ queryKey: ["subjects", variables.userId] });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string; subjectId: string; spaceId: string; name: string; code?: string; description?: string }) => updateSubject(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["subjects", variables.userId, variables.spaceId] });
      void queryClient.invalidateQueries({ queryKey: ["subjects", variables.userId] });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string; subjectId: string; spaceId: string }) => deleteSubject(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["subjects", variables.userId, variables.spaceId] });
      void queryClient.invalidateQueries({ queryKey: ["subjects", variables.userId] });
      void queryClient.invalidateQueries({ queryKey: ["topics", variables.userId] });
      void queryClient.invalidateQueries({ queryKey: ["topic", variables.userId] });
    },
  });
}

export { getSubjectsErrorMessage };
