import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchStudyPack, getStudyPackErrorMessage, upsertStudyPack } from "./study-packs-api";
import type { StudyPackBody } from "../types/study-pack";

export function useStudyPack(userId?: string, topicId?: string) {
  return useQuery({
    queryKey: ["study-pack", userId, topicId],
    queryFn: () => fetchStudyPack(userId!, topicId!),
    enabled: Boolean(userId && topicId),
  });
}

export function useUpsertStudyPack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; topicId: string; uploadIds: string[]; packBody: StudyPackBody; modelName?: string }) => upsertStudyPack(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["study-pack", variables.userId, variables.topicId] });
    },
  });
}

export { getStudyPackErrorMessage };