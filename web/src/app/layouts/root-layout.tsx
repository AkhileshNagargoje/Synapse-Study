import { useMemo, useState } from "react";
import { LogOut, Menu, NotebookPen, Search, Sparkles, Tags, X } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../features/auth/hooks/use-auth";
import { getStickyNoteErrorMessage, useSaveStickyNote, useStickyNotes } from "../../features/sticky-notes/hooks/use-sticky-note";
import { useSpaces } from "../../features/spaces/hooks/use-spaces";
import { useSubjects } from "../../features/subjects/hooks/use-subjects";
import { useTopics } from "../../features/topics/hooks/use-topics";
import { cn } from "../../lib/utils";

export function RootLayout() {
  const { isConfigured, signOut, user } = useAuth();
  const { data: spaces = [], isLoading } = useSpaces(user?.id);
  const { data: subjects = [] } = useSubjects(user?.id);
  const { data: topics = [] } = useTopics(user?.id);
  const { data: stickyNotes = [], error: stickyError } = useStickyNotes(user?.id, "student");
  const saveStickyNote = useSaveStickyNote();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceQuery, setWorkspaceQuery] = useState("");
  const [noteDraft, setNoteDraft] = useState("");

  const closeSidebar = () => setSidebarOpen(false);
  const normalizedQuery = workspaceQuery.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return {
        spaces: spaces.slice(0, 6),
        subjects: [],
        topics: [],
      };
    }

    const includes = (value?: string | null) => value?.toLowerCase().includes(normalizedQuery);

    return {
      spaces: spaces
        .filter((space) => includes(space.name) || includes(space.label) || includes(space.description) || includes(space.focus_note))
        .slice(0, 6),
      subjects: subjects
        .filter((subject) => includes(subject.name) || includes(subject.code) || includes(subject.description))
        .slice(0, 6),
      topics: topics
        .filter((topic) => includes(topic.title) || includes(topic.summary))
        .slice(0, 8),
    };
  }, [normalizedQuery, spaces, subjects, topics]);

  const hasSearchResults = searchResults.spaces.length || searchResults.subjects.length || searchResults.topics.length;

  const handleSaveStudentNote = async () => {
    if (!user || !noteDraft.trim()) return;

    try {
      await saveStickyNote.mutateAsync({
        userId: user.id,
        scopeType: "student",
        content: noteDraft,
      });
      setNoteDraft("");
    } catch (saveError) {
      window.alert(getStickyNoteErrorMessage(saveError));
    }
  };

  return (
    <div className="app-grid min-h-screen px-3 py-3 text-[#122117] sm:px-5 sm:py-4 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1500px] gap-4 lg:min-h-[calc(100vh-2rem)] lg:grid-cols-[320px_minmax(0,1fr)]">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="glass-panel sticky top-3 z-30 flex items-center justify-between rounded-[22px] px-4 py-3 lg:hidden"
        >
          <span className="inline-flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[#122117] text-[#fdf9f2] shadow-lg shadow-[#122117]/10">
              <Sparkles className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-[#122117]">Synapse Study</span>
              <span className="block text-xs text-[#556158]">Open navigation</span>
            </span>
          </span>
          <Menu className="size-5 text-[#122117]" />
        </button>

        <div className={cn("fixed inset-0 z-40 bg-[#122117]/28 backdrop-blur-sm transition duration-200 lg:hidden", sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")} onClick={closeSidebar} />

        <aside
          className={cn(
            "glass-panel fixed inset-y-3 left-3 z-50 flex w-[min(86vw,360px)] flex-col rounded-[32px] p-5 transition duration-200 sm:left-5 sm:inset-y-4 lg:static lg:w-auto lg:translate-x-0 lg:p-6",
            sidebarOpen ? "translate-x-0" : "-translate-x-[115%] lg:translate-x-0",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <Link to="/" className="inline-flex items-center gap-3" onClick={closeSidebar}>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#122117] text-[#fdf9f2] shadow-lg shadow-[#122117]/10">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="display-title text-2xl leading-none text-[#122117]">Synapse Study</p>
                <p className="mt-1 text-sm text-[#556158]">AI study companion</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#7a857a]">Created by Akhilesh Nagargoje</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeSidebar}
                className="rounded-full border border-[#122117]/12 bg-white/85 p-2 text-[#122117] transition hover:bg-white lg:hidden"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  void signOut();
                }}
                className="rounded-full border border-[#122117]/12 bg-white/85 p-2 text-[#122117] transition hover:bg-white"
                aria-label="Log out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[20px] border border-[#122117]/10 bg-white/80 px-4 py-3 text-sm text-[#4b574f]">
            <div className="truncate font-semibold text-[#122117]">{user?.email ?? "Signed in"}</div>
            <div className="mt-1 text-[#556158]">{isConfigured ? "Connected and ready." : "Add Supabase env keys to go live."}</div>
          </div>

          <div className="mt-6 rounded-[24px] border border-[#122117]/12 bg-white/82 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#cedfcc] p-2 text-[#1f3825]">
                <NotebookPen className="size-4" />
              </div>
              <div>
                <div className="font-semibold text-[#122117]">Notes</div>
                <div className="text-xs text-[#556158]">Add one note, save it, then add another below.</div>
              </div>
            </div>

            <textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              rows={4}
              className="mt-4 w-full resize-none rounded-[20px] border border-[#d9d4c8] bg-[#fffaf2] px-4 py-4 text-sm leading-7 text-[#122117] placeholder:text-[#7a7f72] outline-none transition focus:border-[#d86c40]/45 focus:ring-2 focus:ring-[#d86c40]/10"
              placeholder="Write a note and save it..."
            />
            <div className="mt-3 flex flex-wrap gap-3">
              <Button onClick={() => void handleSaveStudentNote()} disabled={saveStickyNote.isPending || !noteDraft.trim()} className="w-full bg-[#d86c40] text-[#fff8f2] hover:bg-[#c86035]">
                {saveStickyNote.isPending ? "Saving note..." : "Add note"}
              </Button>
            </div>
            {stickyError ? <div className="mt-3 rounded-[18px] bg-[#fff1e8] px-4 py-3 text-sm text-[#8c4f29]">{getStickyNoteErrorMessage(stickyError)}</div> : null}

            <div className="mt-4 space-y-3">
              {stickyNotes.length ? (
                stickyNotes.map((note) => (
                  <div key={note.id} className="rounded-[20px] border border-[#d7e2d1] bg-[#f6fbf2] px-4 py-3 shadow-sm shadow-[#122117]/[0.03]">
                    <div className="text-sm leading-7 text-[#122117]">{note.content}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-[20px] border border-[#d9d4c8] bg-[#fffaf2] px-4 py-3 text-sm text-[#556158]">No saved notes yet.</div>
              )}
            </div>
          </div>

          <div className="mt-6 flex min-h-0 flex-1 flex-col rounded-[24px] border border-[#122117]/12 bg-white/78 p-4">
            <label className="flex items-center gap-3 rounded-[20px] border border-[#122117]/10 bg-white px-4 py-3 text-sm font-medium text-[#122117]">
              <Search className="size-4 text-[#c7633a]" />
              <input
                value={workspaceQuery}
                onChange={(event) => setWorkspaceQuery(event.target.value)}
                placeholder="Search workspace, subject, topic..."
                className="w-full bg-transparent text-[#122117] outline-none placeholder:text-[#6a746c]"
              />
            </label>

            <div className="mt-4 min-h-0 space-y-4 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="rounded-2xl border border-[#122117]/10 bg-white px-3 py-4 text-sm text-[#556158]">Loading your spaces...</div>
              ) : normalizedQuery ? (
                hasSearchResults ? (
                  <>
                    {searchResults.spaces.length ? (
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#556158]">Workspaces</div>
                        <div className="space-y-3">
                          {searchResults.spaces.map((space) => (
                            <Link
                              key={space.id}
                              to={`/space/${space.id}`}
                              onClick={closeSidebar}
                              className="block rounded-2xl border border-[#122117]/10 bg-white px-3 py-3 transition hover:border-[#122117]/20 hover:shadow-sm"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="truncate font-medium text-[#122117]">{space.name}</span>
                                <span className="shrink-0 text-xs font-medium text-[#556158]">{space.progress_percent}%</span>
                              </div>
                              <div className="mt-1 text-xs text-[#556158]">{space.label ?? space.focus_note ?? "Workspace"}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {searchResults.subjects.length ? (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#556158]">
                          <Tags className="size-3.5" />
                          Subjects
                        </div>
                        <div className="space-y-3">
                          {searchResults.subjects.map((subject) => (
                            <Link
                              key={subject.id}
                              to={`/subject/${subject.id}`}
                              onClick={closeSidebar}
                              className="block rounded-2xl border border-[#122117]/10 bg-white px-3 py-3 transition hover:border-[#122117]/20 hover:shadow-sm"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="truncate font-medium text-[#122117]">{subject.name}</span>
                                <span className="shrink-0 text-xs font-medium text-[#556158]">{subject.progress_percent}%</span>
                              </div>
                              <div className="mt-1 text-xs text-[#556158]">{subject.code ?? subject.description ?? "Subject"}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {searchResults.topics.length ? (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#556158]">
                          <Sparkles className="size-3.5" />
                          Topics
                        </div>
                        <div className="space-y-3">
                          {searchResults.topics.map((topic) => (
                            <Link
                              key={topic.id}
                              to={`/topic/${topic.id}`}
                              onClick={closeSidebar}
                              className="block rounded-2xl border border-[#122117]/10 bg-white px-3 py-3 transition hover:border-[#122117]/20 hover:shadow-sm"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="truncate font-medium text-[#122117]">{topic.title}</span>
                                <span className="shrink-0 text-xs font-medium text-[#556158]">{topic.progress_percent}%</span>
                              </div>
                              <div className="mt-1 text-xs text-[#556158]">{topic.summary ?? "Topic"}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="rounded-2xl border border-[#122117]/10 bg-white px-3 py-4 text-sm leading-7 text-[#556158]">No matching workspace content found.</div>
                )
              ) : spaces.length ? (
                spaces.slice(0, 6).map((space) => (
                  <Link
                    key={space.id}
                    to={`/space/${space.id}`}
                    onClick={closeSidebar}
                    className="block rounded-2xl border border-[#122117]/10 bg-white px-3 py-3 transition hover:border-[#122117]/20 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-medium text-[#122117]">{space.name}</span>
                      <span className="shrink-0 text-xs font-medium text-[#556158]">{space.progress_percent}%</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-[#e3ddd2]">
                      <div className="h-full rounded-full bg-[#122117]" style={{ width: `${space.progress_percent}%` }} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-[#122117]/10 bg-white px-3 py-4 text-sm leading-7 text-[#556158]">No workspaces yet. Create your first one from the dashboard.</div>
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0 overflow-hidden rounded-[28px] border border-[#122117]/10 bg-[#fffaf2]/70 shadow-[0_22px_80px_rgba(18,33,23,0.09)] sm:rounded-[32px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

