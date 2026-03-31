import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTopicUploadRecord, fetchTopicUploads, getUploadsErrorMessage } from "./uploads-api";

export function useTopicUploads(userId?: string, topicId?: string) {
  return useQuery({
    queryKey: ["topic-uploads", userId, topicId],
    queryFn: () => fetchTopicUploads(userId!, topicId!),
    enabled: Boolean(userId && topicId),
  });
}

export function useCreateTopicUploadRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTopicUploadRecord,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["topic-uploads", variables.userId, variables.topicId] });
    },
  });
}

export { getUploadsErrorMessage };