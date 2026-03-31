import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTopicChat, getChatErrorMessage, saveTopicChatExchange } from "./chat-api";

export function useTopicChat(userId?: string, topicId?: string) {
  return useQuery({
    queryKey: ["topic-chat", userId, topicId],
    queryFn: () => fetchTopicChat(userId!, topicId!),
    enabled: Boolean(userId && topicId),
  });
}

export function useSaveTopicChatExchange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      userId: string;
      topicId: string;
      topicTitle: string;
      question: string;
      answer: string;
      modelName?: string | null;
    }) => saveTopicChatExchange(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["topic-chat", variables.userId, variables.topicId] });
    },
  });
}

export { getChatErrorMessage };
