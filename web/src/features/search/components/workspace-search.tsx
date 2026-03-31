import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Search, Sparkles, Tags } from "lucide-react";
import type { SpaceRecord } from "../../spaces/types/space";
import type { SubjectRecord } from "../../subjects/types/subject";
import type { TopicRecord } from "../../topics/types/topic";

export function WorkspaceSearch({
  spaces,
  subjects,
  topics,
}: {
  spaces: SpaceRecord[];
  subjects: SubjectRecord[];
  topics: TopicRecord[];
}) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return {
        spaces: spaces.slice(0, 3),
        subjects: subjects.slice(0, 3),
        topics: topics.slice(0, 4),
        hasQuery: false,
      };
    }

    const includes = (value?: string | null) => value?.toLowerCase().includes(normalizedQuery);

    return {
      spaces: spaces.filter((space) => includes(space.name) || includes(space.label) || includes(space.description) || includes(space.focus_note)).slice(0, 4),
      subjects: subjects.filter((subject) => includes(subject.name) || includes(subject.code) || includes(subject.description)).slice(0, 4),
      topics: topics.filter((topic) => includes(topic.title) || includes(topic.summary)).slice(0, 6),
      hasQuery: true,
    };
  }, [normalizedQuery, spaces, subjects, topics]);

  const hasMatches = results.spaces.length || results.subjects.length || results.topics.length;

  return (
    <div>
      <div className="rounded-[24px] border border-[#122117]/10 bg-white/82 px-4 py-4">
        <label className="flex items-center gap-3 text-sm font-medium text-[#122117]">
          <span className="rounded-2xl bg-[#d4e4cf] p-2 text-[#28452e]">
            <Search className="size-4" />
          </span>
          Search across spaces, subjects, and topics
        </label>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search laws of motion, physics, sem2..."
          className="mt-4 w-full rounded-2xl border border-[#122117]/10 bg-white/90 px-4 py-3 text-sm outline-none transition focus:border-[#122117]/25"
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ResultGroup
          title="Spaces"
          icon={FolderOpen}
          emptyLabel={results.hasQuery ? "No matching spaces." : "Search or open a recent workspace."}
          items={results.spaces.map((space) => ({
            id: space.id,
            title: space.name,
            detail: space.label ?? space.focus_note ?? "Workspace",
            href: `/space/${space.id}`,
            meta: `${space.progress_percent}%`,
          }))}
        />
        <ResultGroup
          title="Subjects"
          icon={Tags}
          emptyLabel={results.hasQuery ? "No matching subjects." : "Your recent subjects will appear here."}
          items={results.subjects.map((subject) => ({
            id: subject.id,
            title: subject.name,
            detail: subject.code ?? subject.description ?? "Subject",
            href: `/subject/${subject.id}`,
            meta: `${subject.progress_percent}%`,
          }))}
        />
        <ResultGroup
          title="Topics"
          icon={Sparkles}
          emptyLabel={results.hasQuery ? "No matching topics." : "Topics are the fastest way back into study mode."}
          items={results.topics.map((topic) => ({
            id: topic.id,
            title: topic.title,
            detail: topic.summary ?? "Topic",
            href: `/topic/${topic.id}`,
            meta: `${topic.progress_percent}%`,
          }))}
        />
      </div>

      {results.hasQuery && !hasMatches ? (
        <div className="mt-5 rounded-[22px] bg-[#fff4e9] px-4 py-4 text-sm text-[#8c4f29]">
          No results found for "{query.trim()}".
        </div>
      ) : null}
    </div>
  );
}

function ResultGroup({
  title,
  icon: Icon,
  items,
  emptyLabel,
}: {
  title: string;
  icon: typeof FolderOpen;
  items: Array<{ id: string; title: string; detail: string; href: string; meta: string }>;
  emptyLabel: string;
}) {
  return (
    <div className="rounded-[24px] bg-white/76 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[#d4e4cf] p-2 text-[#28452e]">
          <Icon className="size-4" />
        </div>
        <div className="font-semibold text-[#122117]">{title}</div>
      </div>

      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => (
            <Link key={item.id} to={item.href} className="block rounded-[20px] border border-[#122117]/10 bg-[#fffaf2] px-4 py-4 transition hover:border-[#122117]/18 hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-[#122117]">{item.title}</div>
                  <div className="mt-1 text-sm leading-6 text-[#586254]">{item.detail}</div>
                </div>
                <div className="shrink-0 text-sm font-semibold text-[#d86c40]">{item.meta}</div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-[20px] bg-[#fffaf2] px-4 py-4 text-sm text-[#6f7768]">{emptyLabel}</div>
        )}
      </div>
    </div>
  );
}
