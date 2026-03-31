import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTopic, deleteTopic, fetchTopicById, fetchTopics, getTopicsErrorMessage, updateTopic } from "./topics-api";
import type { CreateTopicInput } from "../types/topic";

export function useTopics(userId?: string, subjectId?: string) {
  return useQuery({
    queryKey: ["topics", userId, subjectId],
    queryFn: () => fetchTopics(userId!, subjectId),
    enabled: Boolean(userId),
  });
}

export function useTopic(userId?: string, topicId?: string) {
  return useQuery({
    queryKey: ["topic", userId, topicId],
    queryFn: () => fetchTopicById(userId!, topicId!),
    enabled: Boolean(userId && topicId),
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTopicInput) => createTopic(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["topics", variables.userId, variables.subjectId] });
      void queryClient.invalidateQueries({ queryKey: ["topics", variables.userId] });
      void queryClient.invalidateQueries({ queryKey: ["topic", variables.userId] });
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; topicId: string; subjectId: string; title: string; summary?: string }) => updateTopic(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["topic", variables.userId, variables.topicId] });
      void queryClient.invalidateQueries({ queryKey: ["topics", variables.userId, variables.subjectId] });
      void queryClient.invalidateQueries({ queryKey: ["topics", variables.userId] });
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; topicId: string; subjectId: string }) => deleteTopic(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["topics", variables.userId, variables.subjectId] });
      void queryClient.invalidateQueries({ queryKey: ["topics", variables.userId] });
      void queryClient.invalidateQueries({ queryKey: ["topic", variables.userId, variables.topicId] });
      void queryClient.invalidateQueries({ queryKey: ["study-pack", variables.userId, variables.topicId] });
      void queryClient.invalidateQueries({ queryKey: ["topic-chat", variables.userId, variables.topicId] });
      void queryClient.invalidateQueries({ queryKey: ["topic-uploads", variables.userId, variables.topicId] });
      void queryClient.invalidateQueries({ queryKey: ["topic-progress", variables.userId, variables.topicId] });
    },
  });
}

export { getTopicsErrorMessage };
