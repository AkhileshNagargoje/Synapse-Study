import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { BookText, BrainCircuit, CircleDashed, Files, MessageSquareMore, Sparkles, StickyNote, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { LiveTutorPanel } from "../features/live-tutor/components/live-tutor-panel";
import { SectionCard } from "../components/ui/section-card";
import { askTopicQuestion } from "../features/ai/api/topic-chat";
import { useSaveTopicChatExchange, useTopicChat, getChatErrorMessage } from "../features/chat/hooks/use-topic-chat";
import { generateStudyPackFromFile } from "../features/ai/api/generate-study-pack";
import { useAuth } from "../features/auth/hooks/use-auth";
import { useTopicProgress, useUpsertTopicProgress } from "../features/progress/hooks/use-topic-progress";
import type { ConfidenceLevel, RevisionStatus } from "../features/progress/types/topic-progress";
import { getStickyNoteErrorMessage, useSaveStickyNote, useStickyNote } from "../features/sticky-notes/hooks/use-sticky-note";
import { useStudyPack, useUpsertStudyPack } from "../features/study-packs/hooks/use-study-pack";
import type { StudyPackBody } from "../features/study-packs/types/study-pack";
import { getTopicsErrorMessage, useDeleteTopic, useTopic, useUpdateTopic } from "../features/topics/hooks/use-topics";
import { getUploadsErrorMessage, useCreateTopicUploadRecord, useTopicUploads } from "../features/uploads/hooks/use-topic-uploads";
import { confidenceTone } from "../lib/format";
import { calculateChatProgress, calculateManualProgress, calculatePackProgress, deriveActivityScore, deriveMasteryScore, getDefaultTopicProgress } from "../lib/progress";
import { cn } from "../lib/utils";

const tabs = [
  { id: "pack", label: "Study pack", icon: BookText },
  { id: "uploads", label: "Uploads", icon: Files },
  { id: "chat", label: "AI chat", icon: MessageSquareMore },
  { id: "progress", label: "Progress", icon: CircleDashed },
] as const;

type TopicTab = (typeof tabs)[number]["id"];

export function TopicPage() {
  const { topicId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: topic, error, isLoading } = useTopic(user?.id, topicId);
  const { data: studyPack, error: packError, isLoading: packLoading } = useStudyPack(user?.id, topicId);
  const { data: uploads = [], error: uploadsError, isLoading: uploadsLoading } = useTopicUploads(user?.id, topicId);
  const { data: topicProgress } = useTopicProgress(user?.id, topicId);
  const { data: topicChat, error: topicChatError, isLoading: topicChatLoading } = useTopicChat(user?.id, topicId);
  const { data: stickyNote, error: stickyError } = useStickyNote(user?.id, "topic", topicId);
  const createUploadRecord = useCreateTopicUploadRecord();
  const upsertStudyPack = useUpsertStudyPack();
  const upsertTopicProgress = useUpsertTopicProgress();
  const saveTopicChatExchange = useSaveTopicChatExchange();
  const saveStickyNote = useSaveStickyNote();
  const updateTopic = useUpdateTopic();
  const deleteTopic = useDeleteTopic();
  const [activeTab, setActiveTab] = useState<TopicTab>("pack");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [manualConfidence, setManualConfidence] = useState<ConfidenceLevel>("medium");
  const [manualRevision, setManualRevision] = useState<RevisionStatus>("not_started");
  const [manualStudied, setManualStudied] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [titleDraft, setTitleDraft] = useState("");
  const [summaryDraft, setSummaryDraft] = useState("");

  useEffect(() => {
    if (!topicProgress) return;
    setManualConfidence(topicProgress.confidence_level);
    setManualRevision(topicProgress.revision_status);
    setManualStudied(topicProgress.is_studied);
  }, [topicProgress]);

  useEffect(() => {
    setNoteDraft(stickyNote?.content ?? "");
  }, [stickyNote?.content]);

  useEffect(() => {
    if (!topic) return;
    setTitleDraft(topic.title);
    setSummaryDraft(topic.summary ?? "");
  }, [topic]);

  const generation = useMutation({
    mutationFn: async () => {
      if (!user || !topic || !selectedFile) throw new Error("Choose a file first so Gemini has study material to analyze.");

      const generated = await generateStudyPackFromFile({ topicTitle: topic.title, topicSummary: topic.summary, file: selectedFile });

      const uploadRecord = await createUploadRecord.mutateAsync({
        userId: user.id,
        spaceId: topic.space_id,
        subjectId: topic.subject_id,
        topicId: topic.id,
        fileName: selectedFile.name,
        mimeType: selectedFile.type || inferMimeType(selectedFile.name),
        fileSizeBytes: selectedFile.size,
        extractedText: generated.pack.extractedText,
        extractedSummary: generated.pack.extractedSummary,
      });

      const packBody: StudyPackBody = {
        overview: generated.pack.overview,
        keyPoints: generated.pack.keyPoints,
        simpleExplanation: generated.pack.simpleExplanation,
        flashcards: generated.pack.flashcards,
        quiz: generated.pack.quiz,
        viva: generated.pack.viva,
        sourceNotes: generated.pack.sourceNotes,
      };

      await upsertStudyPack.mutateAsync({ userId: user.id, topicId: topic.id, uploadIds: [uploadRecord.id], packBody, modelName: generated.model });

      const currentProgress = topicProgress ?? getDefaultTopicProgress(topic.id, user.id);
      await upsertTopicProgress.mutateAsync({
        userId: user.id,
        topicId: topic.id,
        progressPercent: calculatePackProgress(currentProgress.progress_percent),
        confidenceLevel: currentProgress.confidence_level,
        isStudied: currentProgress.is_studied,
        revisionStatus: currentProgress.revision_status,
        lastReviewedAt: new Date().toISOString(),
      });

      return generated;
    },
    onSuccess: () => {
      setServerMessage("Study pack generated and saved.");
      setSelectedFile(null);
      setActiveTab("pack");
    },
    onError: (mutationError) => {
      setServerMessage(mutationError instanceof Error ? mutationError.message : "AI generation failed.");
    },
  });

  const savedMessages = topicChat?.messages ?? [];
  const conversationHistory = useMemo(
    () => savedMessages
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({ role: message.role as "user" | "assistant", content: message.content })),
    [savedMessages],
  );

  const chat = useMutation({
    mutationFn: async (question: string) => {
      if (!topic || !user) throw new Error("Topic context is missing.");

      const result = await askTopicQuestion({
        topicTitle: topic.title,
        topicSummary: topic.summary,
        studyPack: studyPack?.pack_body ?? null,
        extractedText: uploads[0]?.extracted_text ?? null,
        conversationHistory,
        question,
      });

      await saveTopicChatExchange.mutateAsync({
        userId: user.id,
        topicId: topic.id,
        topicTitle: topic.title,
        question,
        answer: result.answer,
        modelName: result.model,
      });

      const currentProgress = topicProgress ?? getDefaultTopicProgress(topic.id, user.id);
      await upsertTopicProgress.mutateAsync({
        userId: user.id,
        topicId: topic.id,
        progressPercent: calculateChatProgress(currentProgress.progress_percent),
        confidenceLevel: currentProgress.confidence_level,
        isStudied: currentProgress.is_studied,
        revisionStatus: currentProgress.revision_status,
        lastReviewedAt: new Date().toISOString(),
      });

      return result;
    },
    onSuccess: () => {
      setChatInput("");
      setServerMessage("Topic chat saved for this topic.");
    },
    onError: (mutationError) => {
      setServerMessage(mutationError instanceof Error ? mutationError.message : "Topic chat failed.");
    },
  });

  const packBody = studyPack?.pack_body;
  const extractedPreview = useMemo(() => uploads[0]?.extracted_summary ?? uploads[0]?.extracted_text ?? null, [uploads]);

  if (error) return <div className="p-8 text-sm text-[#8c4f29]">{getTopicsErrorMessage(error)}</div>;
  if (isLoading) return <div className="p-8 text-sm text-[#6f7768]">Loading your topic...</div>;
  if (!topic || !user) return <div className="p-8 text-sm text-[#6f7768]">No topic found for this route.</div>;

  const progressState = topicProgress ?? getDefaultTopicProgress(topic.id, user.id);
  const displayedProgress = progressState.progress_percent || topic.progress_percent;
  const displayedConfidence = progressState.confidence_level || topic.confidence_level;
  const activityScore = deriveActivityScore({
    hasUploads: uploads.length > 0,
    hasStudyPack: Boolean(studyPack),
    hasReview: Boolean(progressState.last_reviewed_at),
    overallProgress: displayedProgress,
  });
  const masteryScore = deriveMasteryScore({ overallProgress: displayedProgress, activityScore });

  const handleSaveProgress = async () => {
    const nextProgress = calculateManualProgress({
      currentProgress: displayedProgress,
      hasUploads: uploads.length > 0,
      hasStudyPack: Boolean(studyPack),
      isStudied: manualStudied,
      confidenceLevel: manualConfidence,
      revisionStatus: manualRevision,
    });

    try {
      await upsertTopicProgress.mutateAsync({
        userId: user.id,
        topicId: topic.id,
        progressPercent: nextProgress,
        confidenceLevel: manualConfidence,
        isStudied: manualStudied,
        revisionStatus: manualRevision,
        lastReviewedAt: new Date().toISOString(),
      });
      setServerMessage("Progress updated for this topic.");
    } catch (progressError) {
      setServerMessage(progressError instanceof Error ? progressError.message : "Progress update failed.");
    }
  };

  const handleSaveTopic = async () => {
    try {
      await updateTopic.mutateAsync({
        userId: user.id,
        topicId: topic.id,
        subjectId: topic.subject_id,
        title: titleDraft,
        summary: summaryDraft,
      });
      setServerMessage("Topic details updated.");
    } catch (saveError) {
      setServerMessage(getTopicsErrorMessage(saveError));
    }
  };

  const handleDeleteTopic = async () => {
    const confirmed = window.confirm(`Delete the topic "${topic.title}" and all its saved study data?`);
    if (!confirmed) return;

    try {
      await deleteTopic.mutateAsync({ userId: user.id, topicId: topic.id, subjectId: topic.subject_id });
      navigate(`/subject/${topic.subject_id}`);
    } catch (deleteError) {
      setServerMessage(deleteError instanceof Error ? deleteError.message : "Topic deletion failed.");
    }
  };

  const handleLiveTutorTurn = async () => {
    try {
      await upsertTopicProgress.mutateAsync({
        userId: user.id,
        topicId: topic.id,
        progressPercent: calculateChatProgress(displayedProgress),
        confidenceLevel: progressState.confidence_level,
        isStudied: progressState.is_studied,
        revisionStatus: progressState.revision_status,
        lastReviewedAt: new Date().toISOString(),
      });
    } catch { }
  };

  const handleTopicChatKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (!chatInput.trim() || chat.isPending || saveTopicChatExchange.isPending || upsertTopicProgress.isPending) return;
    void chat.mutate(chatInput.trim());
  };

  const handleSaveNote = async () => {
    try {
      await saveStickyNote.mutateAsync({
        userId: user.id,
        scopeType: "topic",
        scopeId: topic.id,
        noteId: stickyNote?.id,
        content: noteDraft,
      });
      setServerMessage("Sticky note saved for this topic.");
    } catch (saveError) {
      setServerMessage(getStickyNoteErrorMessage(saveError));
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <section className="rounded-[30px] bg-gradient-to-br from-[#122117] via-[#173123] to-[#28452e] px-6 py-6 text-[#fdf9f2] shadow-[0_30px_70px_rgba(18,33,23,0.18)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.32em] text-[#d8e5d3]">Topic workspace</p>
            <h1 className="mt-3 display-title text-4xl sm:text-5xl">{topic.title}</h1>
            <p className="mt-3 text-base text-[#edf4ea]/82">{topic.summary ?? "Upload a PDF or image and generate a study pack."}</p>
          </div>
          <div className="rounded-[26px] bg-white/10 px-5 py-4 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.22em] text-[#d8e5d3]">Confidence</div>
            <div className="mt-2 text-lg font-semibold">{confidenceTone(displayedConfidence)}</div>
            <div className="mt-1 text-sm text-[#edf4ea]/76">Progress {displayedProgress}%</div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                activeTab === tab.id ? "bg-[#122117] text-[#fdf9f2] shadow-lg shadow-[#122117]/10" : "glass-panel text-[#122117]",
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="grid gap-6">
          {activeTab === "pack" ? (
            packLoading ? (
              <SectionCard title="Study pack" subtitle="Loading saved content.">
                <p className="text-sm text-[#586254]">Loading study pack...</p>
              </SectionCard>
            ) : packBody ? (
              <>
                <SectionCard title="Overview" subtitle="High-level understanding.">
                  <p className="leading-7 text-[#364033]">{packBody.overview}</p>
                </SectionCard>
                <SectionCard title="Key points" subtitle="Fast revision bullets.">
                  <div className="grid gap-3">
                    {packBody.keyPoints.map((point) => (
                      <div key={point} className="rounded-[22px] bg-white/72 px-4 py-4 text-sm text-[#364033]">{point}</div>
                    ))}
                  </div>
                </SectionCard>
                <SectionCard title="Simple explanation" subtitle="Quick clarity.">
                  <p className="leading-7 text-[#364033]">{packBody.simpleExplanation}</p>
                </SectionCard>
                <SectionCard title="Flashcards, quiz, and viva" subtitle="Practice from the saved pack.">
                  <div className="grid gap-4 md:grid-cols-3">
                    <MiniList title="Flashcards" items={packBody.flashcards.map((card) => `${card.front} -> ${card.back}`)} />
                    <MiniList title="Quiz" items={packBody.quiz} />
                    <MiniList title="Viva" items={packBody.viva} />
                  </div>
                </SectionCard>
                <SectionCard title="Source notes" subtitle="Grounding from the uploaded material.">
                  <MiniList title="Extracted notes" items={packBody.sourceNotes} />
                </SectionCard>
              </>
            ) : (
              <SectionCard title="Study pack" subtitle="Generate one from the uploads tab.">
                <div className="rounded-[24px] bg-white/78 p-5 text-sm leading-7 text-[#586254]">No saved study pack yet. Upload one file and generate it from the `Uploads` tab.</div>
              </SectionCard>
            )
          ) : null}

          {activeTab === "uploads" ? (
            <>
              <SectionCard title="Upload and generate" subtitle="Upload one file to build this topic study pack.">
                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[24px] border border-dashed border-[#122117]/12 bg-white/75 p-5">
                    <label className="block text-sm font-medium text-[#122117]">Choose PDF or image</label>
                    <input type="file" accept="application/pdf,image/*" className="mt-3 block w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 text-sm text-[#122117]" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
                    <p className="mt-3 text-sm text-[#586254]">{selectedFile ? `Ready: ${selectedFile.name}` : "Pick one handwritten note image or PDF."}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button onClick={() => void generation.mutate()} disabled={!selectedFile || generation.isPending || createUploadRecord.isPending || upsertStudyPack.isPending || upsertTopicProgress.isPending}>
                        {generation.isPending || createUploadRecord.isPending || upsertStudyPack.isPending || upsertTopicProgress.isPending ? "Generating..." : studyPack ? "Regenerate pack" : "Generate study pack"}
                      </Button>
                      {selectedFile ? <Button variant="ghost" onClick={() => setSelectedFile(null)}>Clear file</Button> : null}
                    </div>
                  </div>
                  <div className="rounded-[24px] bg-[#f6f0e4] p-5 text-sm leading-7 text-[#586254]">Gemini extracts the file, creates the study pack, and saves the result under this topic.</div>
                </div>
                {serverMessage ? <div className="mt-4 rounded-[22px] bg-[#fff4e9] px-4 py-3 text-sm text-[#8c4f29]">{serverMessage}</div> : null}
                {packError ? <div className="mt-4 rounded-[22px] bg-[#fff4e9] px-4 py-3 text-sm text-[#8c4f29]">{String(packError)}</div> : null}
              </SectionCard>

              <SectionCard title="Saved uploads" subtitle="Files already processed for this topic.">
                {uploadsError ? <div className="rounded-[24px] bg-[#fff4e9] p-5 text-sm text-[#8c4f29]">{getUploadsErrorMessage(uploadsError)}</div> : uploadsLoading ? <div className="rounded-[24px] bg-white/78 p-5 text-sm text-[#586254]">Loading uploads...</div> : uploads.length ? <div className="space-y-3">{uploads.map((asset) => <div key={asset.id} className="flex items-center justify-between rounded-[22px] border border-[#122117]/10 bg-white/78 px-4 py-4"><div><div className="font-semibold text-[#122117]">{asset.file_name}</div><div className="mt-1 text-sm text-[#6f7768]">{asset.mime_type} added {new Date(asset.created_at).toLocaleString()}</div></div><div className="rounded-full bg-[#d4e4cf] px-3 py-1 text-sm font-semibold text-[#28452e]">{asset.upload_status}</div></div>)}</div> : <div className="rounded-[24px] bg-white/78 p-5 text-sm text-[#586254]">No uploads yet.</div>}
                {extractedPreview ? <div className="mt-5 rounded-[24px] bg-[#f6f0e4] p-4 text-sm text-[#586254]">Extracted preview: {extractedPreview}</div> : null}
              </SectionCard>
            </>
          ) : null}

          {activeTab === "chat" ? (
            <SectionCard title="AI chat" subtitle="Ask doubts from this topic's saved context.">
              <div className="space-y-4">
                <div className="rounded-[24px] bg-[#122117] p-5 text-[#fdf9f2]">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#d8e5d3]"><BrainCircuit className="size-4 text-[#d86c40]" />Topic-first tutor mode</div>
                  <p className="mt-3 text-sm leading-6 text-[#edf4ea]/82">Answers use the topic title, saved study pack, extracted upload text, and recent saved conversation.</p>
                </div>
                {topicChatError ? <div className="rounded-[22px] bg-[#fff4e9] px-4 py-3 text-sm text-[#8c4f29]">{getChatErrorMessage(topicChatError)}</div> : null}
                <LiveTutorPanel
                  topicTitle={topic.title}
                  topicSummary={topic.summary}
                  studyPack={studyPack?.pack_body ?? null}
                  extractedText={uploads[0]?.extracted_text ?? null}
                  onTutorTurn={handleLiveTutorTurn}
                />
                <div className="space-y-3">
                  {topicChatLoading ? <div className="rounded-[24px] bg-white/78 p-5 text-sm leading-7 text-[#586254]">Loading saved chat...</div> : savedMessages.length ? savedMessages.map((message) => <div key={message.id} className={cn("rounded-[22px] px-4 py-4 text-sm leading-7", message.role === "user" ? "bg-[#122117] text-[#fdf9f2]" : "bg-white/78 text-[#364033]")}><div className="mb-2 text-xs uppercase tracking-[0.22em] opacity-70">{message.role === "user" ? "You" : "Synapse AI"}</div><div>{message.content}</div></div>) : <div className="rounded-[24px] bg-white/78 p-5 text-sm leading-7 text-[#586254]">Ask one doubt from this topic to start the saved tutor thread.</div>}
                </div>
                <div className="rounded-[24px] border border-[#122117]/10 bg-white/82 p-4">
                  <label className="block text-sm font-medium text-[#122117]">Ask from this topic</label>
                  <textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={handleTopicChatKeyDown} rows={3} className="mt-3 w-full resize-none rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25" placeholder="Explain this topic in simpler words..." />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button onClick={() => void chat.mutate(chatInput.trim())} disabled={!chatInput.trim() || chat.isPending || saveTopicChatExchange.isPending || upsertTopicProgress.isPending}>
                      {chat.isPending || saveTopicChatExchange.isPending || upsertTopicProgress.isPending ? "Thinking..." : "Ask AI"}
                    </Button>
                  </div>
                  {chat.isError ? <div className="mt-4 rounded-[22px] bg-[#fff4e9] px-4 py-3 text-sm text-[#8c4f29]">{chat.error instanceof Error ? chat.error.message : "Topic chat failed."}</div> : null}
                </div>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === "progress" ? (
            <SectionCard title="Progress" subtitle="Evidence-based progress, not click-based progress.">
              <div className="grid gap-4 md:grid-cols-3">
                <ProgressTile label="Overall progress" value={`${displayedProgress}%`} note="Main topic progress" />
                <ProgressTile label="Activity" value={`${activityScore}%`} note="Uploads and real study actions" />
                <ProgressTile label="Mastery" value={`${masteryScore}%`} note="Understanding and self-check signals" />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#122117]">Confidence</span>
                  <select value={manualConfidence} onChange={(event) => setManualConfidence(event.target.value as ConfidenceLevel)} className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#122117]">Revision status</span>
                  <select value={manualRevision} onChange={(event) => setManualRevision(event.target.value as RevisionStatus)} className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25">
                    <option value="not_started">Not started</option>
                    <option value="needs_revision">Needs revision</option>
                    <option value="revised">Revised</option>
                  </select>
                </label>
              </div>
              <label className="mt-4 flex items-center gap-3 rounded-[20px] bg-white/74 px-4 py-4 text-sm text-[#364033]">
                <input type="checkbox" checked={manualStudied} onChange={(event) => setManualStudied(event.target.checked)} className="size-4 rounded border-[#122117]/20" />
                Mark this topic as studied
              </label>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => void handleSaveProgress()} disabled={upsertTopicProgress.isPending}>{upsertTopicProgress.isPending ? "Saving..." : "Save progress"}</Button>
              </div>
              <div className="mt-4 rounded-[22px] bg-[#f6f0e4] px-4 py-4 text-sm text-[#586254]">Passive clicks do not drive progress. The score moves from real actions like uploads, pack generation, topic chat, and manual confidence or revision updates.</div>
            </SectionCard>
          ) : null}
        </div>

        <div className="grid gap-6 self-start">
          <SectionCard title="Edit topic" subtitle="Update the topic details here.">
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#122117]">Topic title</span>
                <input value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#122117]">Short summary</span>
                <textarea value={summaryDraft} onChange={(event) => setSummaryDraft(event.target.value)} rows={3} className="w-full resize-none rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25" />
              </label>
              <Button onClick={() => void handleSaveTopic()} disabled={updateTopic.isPending || !titleDraft.trim()}>
                {updateTopic.isPending ? "Saving topic..." : "Save topic"}
              </Button>
            </div>
          </SectionCard>
          <SectionCard title="Topic pulse" subtitle="Compact context.">
            <QuickLine icon={Sparkles} label="Uploads" value={String(uploads.length)} />
            <QuickLine icon={BookText} label="Pack ready" value={studyPack ? "Yes" : "No"} />
            <QuickLine icon={MessageSquareMore} label="Saved chat" value={savedMessages.length ? `${savedMessages.length} messages` : "Ready"} />
          </SectionCard>
          <SectionCard title="Sticky note" subtitle="Keep one concept note for this topic.">
            <div className="rounded-[24px] border border-[#122117]/10 bg-white/78 p-4">
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[#122117]"><StickyNote className="size-4 text-[#d86c40]" />Quick note</div>
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                rows={5}
                className="w-full resize-none rounded-[20px] border border-[#122117]/10 bg-white/90 px-4 py-4 text-sm leading-7 outline-none transition focus:border-[#122117]/25"
                placeholder="Important formula, tricky concept, viva point..."
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => void handleSaveNote()} disabled={saveStickyNote.isPending || !noteDraft.trim()}>
                  {saveStickyNote.isPending ? "Saving note..." : "Save note"}
                </Button>
              </div>
              {stickyError ? <div className="mt-4 rounded-[22px] bg-[#fff4e9] px-4 py-3 text-sm text-[#8c4f29]">{getStickyNoteErrorMessage(stickyError)}</div> : null}
            </div>
          </SectionCard>
          <SectionCard title="What is ready" subtitle="Study flow">
            <div className="rounded-[24px] bg-[#eef4ea] p-4 text-sm leading-7 text-[#364033]">This topic supports uploads, saved study-pack generation, persistent AI chat, sticky notes, and progress tracking.</div>
          </SectionCard>
          <SectionCard title="Topic actions" subtitle="Manage this topic here.">
            <Button variant="ghost" onClick={() => void handleDeleteTopic()} disabled={deleteTopic.isPending} className="w-full justify-center text-[#8c4f29] hover:bg-[#fff4e9] hover:text-[#8c4f29]">
              <Trash2 className="mr-2 size-4" />
              {deleteTopic.isPending ? "Deleting topic..." : "Delete topic"}
            </Button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-[24px] bg-white/74 p-4"><h3 className="font-semibold text-[#122117]">{title}</h3><ul className="mt-3 space-y-2 text-sm text-[#586254]">{items.length ? items.map((item) => <li key={item}>- {item}</li>) : <li>- Ready for generated content</li>}</ul></div>;
}

function ProgressTile({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="rounded-[24px] bg-white/78 p-5"><p className="text-sm text-[#6f7768]">{label}</p><p className="mt-2 text-xl font-semibold text-[#122117]">{value}</p><p className="mt-2 text-sm text-[#586254]">{note}</p></div>;
}

function QuickLine({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: string }) {
  return <div className="mb-3 flex items-center justify-between rounded-[20px] bg-white/74 px-4 py-4 last:mb-0"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#d4e4cf] p-2 text-[#28452e]"><Icon className="size-4" /></div><span className="text-sm text-[#586254]">{label}</span></div><span className="font-semibold text-[#122117]">{value}</span></div>;
}

function inferMimeType(fileName: string) { return fileName.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"; }



