import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTopicProgress, getTopicProgressErrorMessage, upsertTopicProgress } from "./topic-progress-api";
import type { UpsertTopicProgressInput } from "../types/topic-progress";

export function useTopicProgress(userId?: string, topicId?: string) {
  return useQuery({
    queryKey: ["topic-progress", userId, topicId],
    queryFn: () => fetchTopicProgress(userId!, topicId!),
    enabled: Boolean(userId && topicId),
  });
}

export function useUpsertTopicProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertTopicProgressInput) => upsertTopicProgress(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["topic-progress", variables.userId, variables.topicId] });
      void queryClient.invalidateQueries({ queryKey: ["topic", variables.userId, variables.topicId] });
      void queryClient.invalidateQueries({ queryKey: ["topics", variables.userId] });
    },
  });
}

export { getTopicProgressErrorMessage };