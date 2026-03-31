import { FolderOpen, MoreHorizontal, NotebookPen, TimerReset, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { SectionCard } from "../components/ui/section-card";
import { useAuth } from "../features/auth/hooks/use-auth";
import { CreateSubjectForm } from "../features/subjects/components/create-subject-form";
import { getSubjectsErrorMessage, useSubjects } from "../features/subjects/hooks/use-subjects";
import { getSpacesErrorMessage, useDeleteSpace, useSpaces, useUpdateSpace } from "../features/spaces/hooks/use-spaces";
import { getStickyNoteErrorMessage, useSaveStickyNote, useStickyNote } from "../features/sticky-notes/hooks/use-sticky-note";

export function SpacePage() {
  const { spaceId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: spaces = [], error, isLoading } = useSpaces(user?.id);
  const { data: subjects = [], error: subjectsError, isLoading: subjectsLoading } = useSubjects(user?.id, spaceId);
  const { data: stickyNote, error: stickyError } = useStickyNote(user?.id, "space", spaceId);
  const saveStickyNote = useSaveStickyNote();
  const updateSpace = useUpdateSpace();
  const deleteSpace = useDeleteSpace();
  const space = spaces.find((item) => item.id === spaceId);
  const [noteDraft, setNoteDraft] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [labelDraft, setLabelDraft] = useState("");
  const [focusDraft, setFocusDraft] = useState("");

  useEffect(() => {
    setNoteDraft(stickyNote?.content ?? "");
  }, [stickyNote?.content]);

  useEffect(() => {
    if (!space) return;
    setNameDraft(space.name);
    setLabelDraft(space.label ?? "");
    setFocusDraft(space.focus_note ?? space.description ?? "");
  }, [space]);

  if (error) return <div className="p-8 text-sm text-[#8c4f29]">{getSpacesErrorMessage(error)}</div>;
  if (isLoading) return <div className="p-8 text-sm text-[#6f7768]">Loading your space...</div>;
  if (!space || !user) return <div className="p-8 text-sm text-[#6f7768]">No space found for this route.</div>;

  const handleDeleteSpace = async () => {
    const confirmed = window.confirm(`Delete workspace "${space.name}"? This will also remove its subjects and topics.`);
    if (!confirmed) return;

    try {
      await deleteSpace.mutateAsync({ userId: user.id, spaceId: space.id });
      navigate("/");
    } catch (deleteError) {
      window.alert(getSpacesErrorMessage(deleteError));
    }
  };

  const handleSaveNote = async () => {
    try {
      await saveStickyNote.mutateAsync({
        userId: user.id,
        scopeType: "space",
        scopeId: space.id,
        noteId: stickyNote?.id,
        content: noteDraft,
      });
    } catch (saveError) {
      window.alert(getStickyNoteErrorMessage(saveError));
    }
  };

  const handleSaveSpace = async () => {
    try {
      await updateSpace.mutateAsync({
        userId: user.id,
        spaceId: space.id,
        name: nameDraft,
        label: labelDraft,
        focusNote: focusDraft,
        description: focusDraft,
      });
    } catch (saveError) {
      window.alert(getSpacesErrorMessage(saveError));
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
        <SectionCard title="Subjects" subtitle="Everything inside this workspace." action={<CreateSubjectForm spaceId={space.id} compact />}>
          {subjectsError ? (
            <div className="rounded-[24px] bg-[#fff4e9] p-5 text-sm leading-7 text-[#8c4f29]">{getSubjectsErrorMessage(subjectsError)}</div>
          ) : subjectsLoading ? (
            <StateCard title="Loading subjects" description="Fetching the subjects inside this space so you can jump back in." subtle />
          ) : subjects.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  to={`/subject/${subject.id}`}
                  className="rounded-[24px] border border-[#122117]/10 bg-white/80 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.22em] text-[#6f7768]">{subject.code ?? "Subject"}</p>
                      <h3 className="mt-2 text-xl font-semibold text-[#122117]">{subject.name}</h3>
                    </div>
                    <div className="shrink-0 rounded-full bg-[#d4e4cf] px-3 py-1 text-sm font-semibold text-[#28452e]">{subject.progress_percent}%</div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#586254]">{subject.description ?? "Ready for topics."}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <StateCard title="No subjects yet" description="Create the first subject to start organizing topics, uploads, and study packs inside this space." />
              <CreateSubjectForm spaceId={space.id} />
            </div>
          )}
        </SectionCard>

        <div className="grid gap-6">
          <SectionCard title="Edit workspace" subtitle="Update the workspace details here.">
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#122117]">Workspace name</span>
                <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#122117]">Short label</span>
                <input value={labelDraft} onChange={(event) => setLabelDraft(event.target.value)} className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#122117]">Focus note</span>
                <textarea value={focusDraft} onChange={(event) => setFocusDraft(event.target.value)} rows={3} className="w-full resize-none rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25" />
              </label>
              <Button onClick={() => void handleSaveSpace()} disabled={updateSpace.isPending || !nameDraft.trim()}>
                {updateSpace.isPending ? "Saving workspace..." : "Save workspace"}
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Progress" subtitle="Simple space-level signals.">
            <MetricRow icon={FolderOpen} label="Label" value={space.label ?? "Study workspace"} />
            <MetricRow icon={TimerReset} label="Completion" value={`${space.progress_percent}%`} />
            <MetricRow icon={NotebookPen} label="Focus note" value={space.focus_note ? "Added" : "Not yet"} />
          </SectionCard>

          <SectionCard title="Sticky note" subtitle="Keep one quick note for this workspace.">
            <textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              rows={5}
              className="w-full resize-none rounded-[22px] border border-[#122117]/10 bg-white/82 px-4 py-4 text-sm leading-7 outline-none transition focus:border-[#122117]/25"
              placeholder="Exam reminder, unit priority, weak subject list..."
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => void handleSaveNote()} disabled={saveStickyNote.isPending || !noteDraft.trim()}>
                {saveStickyNote.isPending ? "Saving note..." : "Save note"}
              </Button>
            </div>
            {stickyError ? <div className="mt-4 rounded-[22px] bg-[#fff4e9] px-4 py-3 text-sm text-[#8c4f29]">{getStickyNoteErrorMessage(stickyError)}</div> : null}
          </SectionCard>

          <SectionCard title="Continue" subtitle="Open the next study layer.">
            {subjects.length ? (
              <Link to={`/subject/${subjects[0].id}`} className="block rounded-[24px] bg-[#122117] px-5 py-5 text-[#fdf9f2]">
                <p className="text-xs uppercase tracking-[0.22em] text-[#f2d8ca]">Open subject</p>
                <p className="mt-2 text-lg font-semibold">{subjects[0].name}</p>
                <p className="mt-3 text-sm text-[#efe6db]/80">Move from subject into topics and study packs.</p>
              </Link>
            ) : (
              <StateCard title="Add the first subject" description="That unlocks the next layer of your study structure." dark />
            )}
          </SectionCard>

          <SectionCard title="Workspace actions" subtitle="Manage this workspace here.">
            <button
              type="button"
              onClick={() => void handleDeleteSpace()}
              disabled={deleteSpace.isPending}
              className="flex w-full items-center justify-between gap-3 rounded-[22px] border border-[#d86c40]/18 bg-[#fff4e9] px-4 py-4 text-left text-sm font-medium text-[#a44628] transition hover:bg-[#ffe8db] disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-3">
                <span className="rounded-2xl bg-white/70 p-2 text-[#a44628]"><Trash2 className="size-4" /></span>
                {deleteSpace.isPending ? "Deleting workspace..." : "Delete workspace"}
              </span>
              <MoreHorizontal className="size-4 shrink-0" />
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ icon: Icon, label, value }: { icon: typeof FolderOpen; label: string; value: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-[20px] bg-white/72 px-4 py-4 last:mb-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-2xl bg-[#d4e4cf] p-2 text-[#28452e]">
          <Icon className="size-4" />
        </div>
        <span className="truncate text-sm text-[#586254]">{label}</span>
      </div>
      <span className="max-w-[50%] shrink-0 text-right font-semibold text-[#122117]">{value}</span>
    </div>
  );
}

function StateCard({ title, description, subtle = false, dark = false }: { title: string; description: string; subtle?: boolean; dark?: boolean }) {
  if (dark) {
    return (
      <div className="rounded-[24px] bg-[#122117] px-5 py-5 text-[#fdf9f2]">
        <p className="text-lg font-semibold">{title}</p>
        <p className="mt-3 text-sm leading-7 text-[#efe6db]/80">{description}</p>
      </div>
    );
  }

  return (
    <div className={subtle ? "rounded-[24px] bg-white/78 p-5" : "rounded-[24px] border border-dashed border-[#122117]/10 bg-white/82 p-5"}>
      <h3 className="text-lg font-semibold text-[#122117]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[#586254]">{description}</p>
    </div>
  );
}
