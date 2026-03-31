import { FileStack, Gauge, Layers3, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { SectionCard } from "../components/ui/section-card";
import { useAuth } from "../features/auth/hooks/use-auth";
import { getSubjectsErrorMessage, useDeleteSubject, useSubjects, useUpdateSubject } from "../features/subjects/hooks/use-subjects";
import { CreateTopicForm } from "../features/topics/components/create-topic-form";
import { getTopicsErrorMessage, useTopics } from "../features/topics/hooks/use-topics";

export function SubjectPage() {
  const { subjectId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: subjects = [], error, isLoading } = useSubjects(user?.id);
  const subject = subjects.find((item) => item.id === subjectId);
  const { data: topics = [], error: topicsError, isLoading: topicsLoading } = useTopics(user?.id, subjectId);
  const deleteSubject = useDeleteSubject();
  const updateSubject = useUpdateSubject();
  const [nameDraft, setNameDraft] = useState("");
  const [codeDraft, setCodeDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");

  useEffect(() => {
    if (!subject) return;
    setNameDraft(subject.name);
    setCodeDraft(subject.code ?? "");
    setDescriptionDraft(subject.description ?? "");
  }, [subject]);

  if (error) return <div className="p-8 text-sm text-[#8c4f29]">{getSubjectsErrorMessage(error)}</div>;
  if (isLoading) return <div className="p-8 text-sm text-[#6f7768]">Loading your subject...</div>;
  if (!subject || !user) return <div className="p-8 text-sm text-[#6f7768]">No subject found for this route.</div>;

  const handleDeleteSubject = async () => {
    const confirmed = window.confirm(`Delete the subject \"${subject.name}\" and its topics?`);
    if (!confirmed) return;

    try {
      await deleteSubject.mutateAsync({ userId: user.id, subjectId: subject.id, spaceId: subject.space_id });
      navigate(`/space/${subject.space_id}`);
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : "Subject deletion failed.");
    }
  };

  const handleSaveSubject = async () => {
    try {
      await updateSubject.mutateAsync({
        userId: user.id,
        subjectId: subject.id,
        spaceId: subject.space_id,
        name: nameDraft,
        code: codeDraft,
        description: descriptionDraft,
      });
    } catch (saveError) {
      window.alert(getSubjectsErrorMessage(saveError));
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <section className="rounded-[30px] border border-[#122117]/10 bg-[#122117] px-5 py-6 text-[#fdf9f2] sm:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#f2d8ca]">Subject dashboard</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="display-title text-3xl sm:text-4xl">{subject.name}</h1>
            <p className="mt-2 text-sm leading-7 text-[#efe6db]/82">{subject.description ?? "Focused structure for topics, uploads, and study flow."}</p>
          </div>
          <div className="rounded-full bg-white/12 px-4 py-2 text-sm font-semibold">{subject.progress_percent}% complete</div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <SectionCard title="Topics" subtitle="Topics are the real study layer inside this subject." action={<CreateTopicForm spaceId={subject.space_id} subjectId={subject.id} compact />}>
          {topicsError ? (
            <div className="rounded-[24px] bg-[#fff4e9] p-5 text-sm leading-7 text-[#8c4f29]">{getTopicsErrorMessage(topicsError)}</div>
          ) : topicsLoading ? (
            <StateCard title="Loading topics" description="Fetching the topics in this subject so you can continue where you left off." subtle />
          ) : topics.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {topics.map((topic) => (
                <Link key={topic.id} to={`/topic/${topic.id}`} className="rounded-[24px] border border-[#122117]/10 bg-white/80 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.22em] text-[#6f7768]">Topic</p>
                      <h3 className="mt-2 text-xl font-semibold text-[#122117]">{topic.title}</h3>
                    </div>
                    <div className="shrink-0 rounded-full bg-[#d4e4cf] px-3 py-1 text-sm font-semibold text-[#28452e]">{topic.progress_percent}%</div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#586254]">{topic.summary ?? "Ready for uploads, AI study packs, and focused revision."}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <StateCard title="No topics yet" description="Create the first topic and this subject becomes a full study workspace with uploads, AI chat, and progress tracking." />
              <CreateTopicForm spaceId={subject.space_id} subjectId={subject.id} />
            </div>
          )}
        </SectionCard>

        <div className="grid gap-6">
          <SectionCard title="Edit subject" subtitle="Update the subject details here.">
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#122117]">Subject name</span>
                <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#122117]">Code</span>
                <input value={codeDraft} onChange={(event) => setCodeDraft(event.target.value)} className="w-full rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#122117]">Description</span>
                <textarea value={descriptionDraft} onChange={(event) => setDescriptionDraft(event.target.value)} rows={3} className="w-full resize-none rounded-2xl border border-[#122117]/10 bg-white/80 px-4 py-3 outline-none transition focus:border-[#122117]/25" />
              </label>
              <Button onClick={() => void handleSaveSubject()} disabled={updateSubject.isPending || !nameDraft.trim()}>
                {updateSubject.isPending ? "Saving subject..." : "Save subject"}
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Progress" subtitle="The key subject signals live here.">
            <InfoRow icon={Gauge} label="Subject completion" value={`${subject.progress_percent}%`} />
            <InfoRow icon={Layers3} label="Code" value={subject.code ?? "Not set"} />
            <InfoRow icon={FileStack} label="Topics ready" value={String(topics.length)} />
          </SectionCard>

          <SectionCard title="Uploads" subtitle="Uploads happen inside topics for better context.">
            <div className="rounded-[22px] bg-[#f6f0e4] px-4 py-4 text-sm leading-7 text-[#5e604f]">Open a topic to upload a PDF or image, then generate a saved study pack from there.</div>
          </SectionCard>

          <SectionCard title="Continue studying" subtitle="Open the next study layer in this subject.">
            {topics.length ? (
              <Link to={`/topic/${topics[0].id}`} className="block rounded-[24px] bg-[#d86c40] px-5 py-5 text-[#fff8f2]">
                <p className="text-xs uppercase tracking-[0.22em] text-[#ffe0d2]">Resume</p>
                <p className="mt-2 text-lg font-semibold">Open {topics[0].title}</p>
                <p className="mt-3 text-sm text-[#fff0e7]/84">Upload study material and generate the pack from there.</p>
              </Link>
            ) : (
              <div className="rounded-[24px] bg-[#d86c40] px-5 py-5 text-[#fff8f2]">
                <p className="text-xs uppercase tracking-[0.22em] text-[#ffe0d2]">Resume</p>
                <p className="mt-2 text-lg font-semibold">Create the first topic</p>
                <p className="mt-3 text-sm text-[#fff0e7]/84">That unlocks uploads, AI chat, and the study-pack workflow.</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Subject actions" subtitle="Manage this subject here.">
            <Button variant="ghost" onClick={() => void handleDeleteSubject()} disabled={deleteSubject.isPending} className="w-full justify-center text-[#8c4f29] hover:bg-[#fff4e9] hover:text-[#8c4f29]">
              <Trash2 className="mr-2 size-4" />
              {deleteSubject.isPending ? "Deleting subject..." : "Delete subject"}
            </Button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-[20px] bg-white/75 px-4 py-4 last:mb-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-2xl bg-[#d4e4cf] p-2 text-[#28452e]"><Icon className="size-4" /></div>
        <span className="truncate text-sm text-[#586254]">{label}</span>
      </div>
      <span className="shrink-0 font-semibold text-[#122117]">{value}</span>
    </div>
  );
}

function StateCard({ title, description, subtle = false }: { title: string; description: string; subtle?: boolean }) {
  return (
    <div className={subtle ? "rounded-[24px] bg-white/78 p-5" : "rounded-[24px] border border-dashed border-[#122117]/10 bg-white/82 p-5"}>
      <h3 className="text-lg font-semibold text-[#122117]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[#586254]">{description}</p>
    </div>
  );
}
