const apiBaseUrl = import.meta.env.VITE_GEMINI_API_URL || "http://127.0.0.1:8787";

export async function askTopicQuestion(input: {
  topicTitle: string;
  topicSummary?: string | null;
  studyPack?: Record<string, unknown> | null;
  extractedText?: string | null;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  question: string;
}) {
  const response = await fetch(`${apiBaseUrl}/api/topic-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "Topic chat failed.");
  }

  return payload as { model: string; answer: string };
}
