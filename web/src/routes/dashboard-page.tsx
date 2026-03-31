import { BookOpen, CircleCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionCard } from "../components/ui/section-card";
import { useAuth } from "../features/auth/hooks/use-auth";
import { CreateSpaceForm } from "../features/spaces/components/create-space-form";
import { getSpacesErrorMessage, useSpaces } from "../features/spaces/hooks/use-spaces";
import { useSubjects } from "../features/subjects/hooks/use-subjects";
import { useTopics } from "../features/topics/hooks/use-topics";
import { percentLabel } from "../lib/format";

export function DashboardPage() {
  const { user } = useAuth();
  const { data: spaces = [], error, isLoading } = useSpaces(user?.id);
  const { data: subjects = [] } = useSubjects(user?.id);
  const { data: topics = [] } = useTopics(user?.id);

  const recentSubjects = subjects.slice(0, 3);
  const nextTopics = topics.slice(0, 3);
  const averageProgress = topics.length
    ? Math.round(topics.reduce((sum, topic) => sum + topic.progress_percent, 0) / topics.length)
    : 0;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <section className="rounded-[30px] bg-[#122117] px-5 py-6 text-[#fdf9f2] sm:px-7 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#f2d8ca]">Student dashboard</p>
            <h1 className="mt-4 display-title text-3xl sm:text-5xl">Know what to open next.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#efe6db]/84 sm:text-lg">
              Build your study flow through spaces, subjects, and topics. Generate packs where the work actually happens.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            <StatTile label="Spaces" value={spaces.length} />
            <StatTile label="Subjects" value={subjects.length} />
            <StatTile label="Topics" value={topics.length} />
            <StatTile label="Avg progress" value={`${averageProgress}%`} />
          </div>
        </div>
      </section>

      <div className="mt-6">
        <SectionCard title="Active spaces" subtitle="Your current study workspaces." action={<CreateSpaceForm compact />}>
          {error ? (
            <div className="rounded-[24px] bg-[#fff4e9] p-5 text-sm leading-7 text-[#8c4f29]">{getSpacesErrorMessage(error)}</div>
          ) : isLoading ? (
            <EmptyStateCard title="Loading spaces" description="Pulling your spaces and progress so you can jump back in." subtle />
          ) : spaces.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {spaces.map((space) => (
                <Link
                  key={space.id}
                  to={`/space/${space.id}`}
                  className="rounded-[26px] border border-[#122117]/10 bg-white/80 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.22em] text-[#6f7768]">{space.label ?? "Study workspace"}</p>
                      <h3 className="mt-2 display-title text-2xl sm:text-3xl">{space.name}</h3>
                    </div>
                    <div className="shrink-0 rounded-full bg-[#d4e4cf] px-3 py-1 text-sm font-semibold text-[#28452e]">
                      {percentLabel(space.progress_percent)}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#586254]">{space.focus_note ?? space.description ?? "Ready for subjects."}</p>
                  <div className="mt-5 h-2 rounded-full bg-[#ece4d8]">
                    <div className="h-full rounded-full bg-[#122117]" style={{ width: `${space.progress_percent}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <EmptyStateCard title="No spaces yet" description="Create your first space to organize subjects, topics, uploads, and study packs in one place." />
              <CreateSpaceForm />
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
        <SectionCard title="Topics in focus" subtitle="Open one and keep moving.">
          <div className="space-y-3">
            {nextTopics.length ? (
              nextTopics.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/topic/${topic.id}`}
                  className="flex items-center justify-between gap-3 rounded-[22px] border border-[#122117]/10 bg-white/78 px-4 py-4 transition hover:border-[#122117]/18"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[#122117]">{topic.title}</div>
                    <div className="mt-1 text-sm leading-6 text-[#6f7768]">{topic.summary ?? "Ready for a focused study session."}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold text-[#d86c40]">{topic.progress_percent}%</div>
                    <div className="text-xs text-[#6f7768]">open</div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyStateCard title="No topics yet" description="Add a topic inside a subject to get uploads, AI chat, and progress tracking." subtle compact />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Subject layer" subtitle="Jump back into the right subject layer.">
          <div className="space-y-3">
            {recentSubjects.length ? (
              recentSubjects.map((subject) => (
                <Link
                  key={subject.id}
                  to={`/subject/${subject.id}`}
                  className="block rounded-[22px] border border-[#122117]/10 bg-white/78 px-4 py-4 transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold">{subject.name}</span>
                    <span className="shrink-0 text-sm text-[#6f7768]">{subject.progress_percent}%</span>
                  </div>
                  <p className="mt-1 text-sm text-[#6f7768]">Open it to manage topics.</p>
                </Link>
              ))
            ) : (
              <EmptyStateCard title="No subjects yet" description="Once you create a space, add a subject to start structuring your study flow." subtle compact />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Workspace overview" subtitle="Small signals from the current workspace.">
          <div className="space-y-4">
            <PulseRow icon={BookOpen} label="Subjects created" value={String(subjects.length)} />
            <PulseRow icon={Sparkles} label="Topics active" value={String(topics.length)} />
            <PulseRow icon={CircleCheck} label="Study-ready spaces" value={String(spaces.length)} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[22px] bg-white/10 px-4 py-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.22em] text-[#f2d8ca]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function PulseRow({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[20px] bg-white/70 px-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-2xl bg-[#d4e4cf] p-2 text-[#28452e]">
          <Icon className="size-4" />
        </div>
        <span className="truncate text-sm text-[#586254]">{label}</span>
      </div>
      <span className="shrink-0 font-semibold text-[#122117]">{value}</span>
    </div>
  );
}

function EmptyStateCard({ title, description, subtle = false, compact = false }: { title: string; description: string; subtle?: boolean; compact?: boolean }) {
  return (
    <div className={subtle ? "rounded-[22px] bg-white/78 px-4 py-4 text-sm text-[#586254]" : "rounded-[24px] border border-dashed border-[#122117]/10 bg-white/82 p-5"}>
      <h3 className={compact ? "text-base font-semibold text-[#122117]" : "text-xl font-semibold text-[#122117]"}>{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[#586254]">{description}</p>
    </div>
  );
}
