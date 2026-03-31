import { useEffect, useRef, useState } from "react";
import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from "@google/genai";
import { getLiveTutorToken } from "../api/get-live-token";

export type LiveTutorMessage = {
  id: string;
  role: "assistant" | "user" | "system";
  content: string;
  status?: "streaming" | "final";
};

type LiveTutorContext = {
  topicTitle: string;
  topicSummary?: string | null;
  studyPack?: Record<string, unknown> | null;
  extractedText?: string | null;
};

export function useLiveTutorSession(context: LiveTutorContext) {
  const sessionRef = useRef<Session | null>(null);
  const assistantDraftRef = useRef("");
  const assistantMessageIdRef = useRef<string | null>(null);
  const kickoffPromptRef = useRef<string | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<LiveTutorMessage[]>([]);

  useEffect(() => () => {
    sessionRef.current?.close();
    sessionRef.current = null;
  }, []);

  const startSession = async () => {
    if (sessionRef.current || status === "connecting" || status === "connected") return;

    setError(null);
    setStatus("connecting");
    setMessages([{ id: createId("system"), role: "system", content: "Connecting live tutor...", status: "final" }]);
    kickoffPromptRef.current = buildTutorKickoff(context);

    try {
      const { token, model } = await getLiveTutorToken();
      const ai = new GoogleGenAI({
        apiKey: token,
        httpOptions: { apiVersion: "v1alpha" },
      });

      const session = await ai.live.connect({
        model,
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          temperature: 0.5,
        },
        callbacks: {
          onopen: () => {
            setMessages([{ id: createId("system"), role: "system", content: "Live tutor socket opened. Waiting for tutor setup...", status: "final" }]);
          },
          onmessage: (message) => {
            if (message.setupComplete) {
              setStatus("connected");
              setMessages([{ id: createId("system"), role: "system", content: "Live tutor is ready. It will ask one question at a time.", status: "final" }]);
              const kickoffPrompt = kickoffPromptRef.current;
              kickoffPromptRef.current = null;
              if (kickoffPrompt && sessionRef.current) {
                sessionRef.current.sendClientContent({
                  turns: [
                    {
                      role: "user",
                      parts: [{ text: kickoffPrompt }],
                    },
                  ],
                  turnComplete: true,
                });
              }
            }
            handleLiveMessage(message, setMessages, assistantDraftRef, assistantMessageIdRef);
          },
          onerror: (event) => {
            setError(event.message || "Live tutor connection failed.");
            setStatus("error");
          },
          onclose: () => {
            sessionRef.current = null;
            assistantDraftRef.current = "";
            assistantMessageIdRef.current = null;
            kickoffPromptRef.current = null;
            setStatus((currentStatus) => (currentStatus === "error" ? "error" : "idle"));
          },
        },
      });

      sessionRef.current = session;
    } catch (sessionError) {
      setStatus("error");
      setError(sessionError instanceof Error ? sessionError.message : "Could not start live tutor.");
    }
  };

  const sendMessage = async (text: string) => {
    const session = sessionRef.current;
    if (!session || status !== "connected") throw new Error("Start live tutor first.");

    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((current) => [...current, { id: createId("user"), role: "user", content: trimmed, status: "final" }]);
    session.sendClientContent({
      turns: [
        {
          role: "user",
          parts: [{ text: trimmed }],
        },
      ],
      turnComplete: true,
    });
  };

  const endSession = () => {
    sessionRef.current?.close();
    sessionRef.current = null;
    assistantDraftRef.current = "";
    assistantMessageIdRef.current = null;
    kickoffPromptRef.current = null;
    setStatus("idle");
  };

  return {
    status,
    error,
    messages,
    startSession,
    sendMessage,
    endSession,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
  };
}

function handleLiveMessage(
  message: LiveServerMessage,
  setMessages: React.Dispatch<React.SetStateAction<LiveTutorMessage[]>>,
  assistantDraftRef: React.MutableRefObject<string>,
  assistantMessageIdRef: React.MutableRefObject<string | null>,
) {
  const textChunk = extractLiveText(message);
  if (textChunk) {
    const nextDraft = mergeStreamText(assistantDraftRef.current, textChunk);
    assistantDraftRef.current = nextDraft;

    setMessages((current) => {
      const lastMessage = current[current.length - 1];
      if (lastMessage?.role === "assistant" && lastMessage.status === "streaming") {
        return [...current.slice(0, -1), { ...lastMessage, content: nextDraft }];
      }

      const nextId = assistantMessageIdRef.current ?? createId("assistant");
      assistantMessageIdRef.current = nextId;
      return [...current, { id: nextId, role: "assistant", content: nextDraft, status: "streaming" }];
    });
  }

  if (message.serverContent?.turnComplete && assistantDraftRef.current) {
    const finalText = assistantDraftRef.current.trim();
    assistantDraftRef.current = "";
    assistantMessageIdRef.current = null;

    setMessages((current) => {
      const lastMessage = current[current.length - 1];
      if (lastMessage?.role === "assistant") {
        return [...current.slice(0, -1), { ...lastMessage, content: finalText, status: "final" }];
      }
      return [...current, { id: createId("assistant"), role: "assistant", content: finalText, status: "final" }];
    });
  }
}

function extractLiveText(message: LiveServerMessage) {
  const transcription = message.serverContent?.outputTranscription?.text;
  if (typeof transcription === "string" && transcription) return transcription;

  const parts = message.serverContent?.modelTurn?.parts;
  if (!Array.isArray(parts)) return "";

  return parts
    .map((part) => {
      if (part?.text && !part.thought) return part.text;
      return "";
    })
    .join("");
}

function mergeStreamText(previous: string, incoming: string) {
  if (!previous) return incoming;
  if (!incoming) return previous;
  if (incoming.startsWith(previous)) return incoming;
  if (previous.startsWith(incoming)) return previous;
  if (previous.endsWith(incoming)) return previous;
  if (incoming.includes(previous)) return incoming;
  return `${previous}${incoming}`;
}

function buildTutorKickoff(context: LiveTutorContext) {
  const lines = [
    "You are a live personal study tutor for a college student.",
    "Stay focused on the current topic and ask one viva-style question at a time.",
    "After each student answer, give short feedback and ask the next question.",
    "If the student seems weak, simplify the explanation before continuing.",
    `Topic: ${context.topicTitle}`,
    `Topic summary: ${context.topicSummary || "No summary provided."}`,
    `Saved study pack: ${summarizeStudyPack(context.studyPack)}`,
    `Extracted note text: ${context.extractedText?.trim() || "No extracted text yet."}`,
    "Start now with a brief greeting and your first question.",
  ];

  return lines.join("\n\n");
}

function summarizeStudyPack(studyPack?: Record<string, unknown> | null) {
  if (!studyPack) return "No study pack yet.";

  const chunks: string[] = [];
  if (typeof studyPack.overview === "string" && studyPack.overview.trim()) chunks.push(`Overview: ${studyPack.overview.trim()}`);
  if (Array.isArray(studyPack.keyPoints) && studyPack.keyPoints.length) chunks.push(`Key points: ${studyPack.keyPoints.filter((item) => typeof item === "string").slice(0, 5).join(" | ")}`);
  if (typeof studyPack.simpleExplanation === "string" && studyPack.simpleExplanation.trim()) chunks.push(`Simple explanation: ${studyPack.simpleExplanation.trim()}`);
  if (Array.isArray(studyPack.viva) && studyPack.viva.length) chunks.push(`Viva prompts: ${studyPack.viva.filter((item) => typeof item === "string").slice(0, 3).join(" | ")}`);

  return chunks.join("\n") || "No study pack yet.";
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
