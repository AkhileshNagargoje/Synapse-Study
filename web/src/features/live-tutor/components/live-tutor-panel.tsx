import { useState, type KeyboardEvent } from "react";
import { Radio, Send, Sparkles, StopCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { useLiveTutorSession } from "../hooks/use-live-tutor-session";

type LiveTutorPanelProps = {
  topicTitle: string;
  topicSummary?: string | null;
  studyPack?: Record<string, unknown> | null;
  extractedText?: string | null;
  onTutorTurn?: () => void | Promise<void>;
};

export function LiveTutorPanel({ topicTitle, topicSummary, studyPack, extractedText, onTutorTurn }: LiveTutorPanelProps) {
  const [draft, setDraft] = useState("");
  const liveTutor = useLiveTutorSession({ topicTitle, topicSummary, studyPack, extractedText });

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !liveTutor.isConnected) return;

    await liveTutor.sendMessage(trimmed);
    setDraft("");
    await onTutorTurn?.();
  };

  const handleDraftKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (!draft.trim() || !liveTutor.isConnected) return;
    void handleSend();
  };

  return (
    <div className="rounded-[24px] border border-[#122117]/10 bg-white/82 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-[#122117]">
            <Radio className="size-4 text-[#d86c40]" />
            Live tutor beta
          </div>
          <p className="mt-2 text-sm leading-6 text-[#586254]">Starts a guided viva-style session for this topic. Gemini Live now streams tutor audio behind the scenes and we show the live transcription in the panel.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={liveTutor.status} />
          {liveTutor.isConnected || liveTutor.isConnecting ? (
            <Button variant="ghost" onClick={liveTutor.endSession} className="text-[#8c4f29] hover:bg-[#fff4e9] hover:text-[#8c4f29]">
              <StopCircle className="mr-2 size-4" />
              End live tutor
            </Button>
          ) : (
            <Button onClick={() => void liveTutor.startSession()}>
              <Sparkles className="mr-2 size-4" />
              Start live tutor
            </Button>
          )}
        </div>
      </div>

      {liveTutor.error ? <div className="mt-4 rounded-[22px] bg-[#fff4e9] px-4 py-3 text-sm text-[#8c4f29]">{liveTutor.error}</div> : null}

      <div className="mt-4 space-y-3 rounded-[24px] bg-[#f6f0e4] p-4">
        {liveTutor.messages.length ? liveTutor.messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "rounded-[20px] px-4 py-4 text-sm leading-7",
              message.role === "assistant"
                ? "bg-[#122117] text-[#fdf9f2]"
                : message.role === "user"
                  ? "bg-white text-[#122117]"
                  : "bg-[#eef4ea] text-[#364033]",
            )}
          >
            <div className="mb-2 text-xs uppercase tracking-[0.22em] opacity-70">
              {message.role === "assistant" ? "Live tutor" : message.role === "user" ? "You" : "Session"}
            </div>
            <div>{message.content}</div>
          </div>
        )) : <div className="rounded-[20px] bg-white px-4 py-4 text-sm text-[#586254]">Start live tutor to begin a guided viva-style session for this topic.</div>}
      </div>

      <div className="mt-4 rounded-[24px] border border-[#122117]/10 bg-white/86 p-4">
        <label className="block text-sm font-medium text-[#122117]">Answer the live tutor</label>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleDraftKeyDown}
          rows={3}
          className="mt-3 w-full resize-none rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25"
          placeholder="Write your answer or ask the tutor to explain more simply..."
          disabled={!liveTutor.isConnected}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => void handleSend()} disabled={!liveTutor.isConnected || !draft.trim()}>
            <Send className="mr-2 size-4" />
            Send to live tutor
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "idle" | "connecting" | "connected" | "error" }) {
  const label = status === "connected" ? "Connected" : status === "connecting" ? "Connecting" : status === "error" ? "Error" : "Ready";

  return (
    <div className={cn(
      "rounded-full px-3 py-1 text-sm font-semibold",
      status === "connected"
        ? "bg-[#d4e4cf] text-[#28452e]"
        : status === "connecting"
          ? "bg-[#f6f0e4] text-[#8c4f29]"
          : status === "error"
            ? "bg-[#fff4e9] text-[#8c4f29]"
            : "bg-white text-[#586254]",
    )}>
      {label}
    </div>
  );
}





