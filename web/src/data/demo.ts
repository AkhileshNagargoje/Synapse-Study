import type { Space, Subject, Topic } from "../types/study";

export const spaces: Space[] = [
  {
    id: "space-sem4",
    name: "Semester 4",
    label: "Current term workspace",
    progress: 64,
    focus: "Keep momentum on DBMS and OS before internals.",
    stickyNote: "Complete one viva round before Friday.",
    subjectIds: ["subject-dbms", "subject-os", "subject-toc"],
  },
  {
    id: "space-finals",
    name: "Finals Sprint",
    label: "High-intensity revision space",
    progress: 41,
    focus: "Use quick packs and quizzes for revision-heavy topics.",
    stickyNote: "Reduce backlog to 3 topics this week.",
    subjectIds: ["subject-cn", "subject-ai"],
  },
];

export const subjects: Subject[] = [
  { id: "subject-dbms", spaceId: "space-sem4", name: "Database Management Systems", code: "CS402", progress: 71, uploadCount: 12, continueTopicId: "topic-normalization", topicIds: ["topic-normalization", "topic-transactions"] },
  { id: "subject-os", spaceId: "space-sem4", name: "Operating Systems", code: "CS404", progress: 58, uploadCount: 8, continueTopicId: "topic-deadlocks", topicIds: ["topic-deadlocks", "topic-memory"] },
  { id: "subject-toc", spaceId: "space-sem4", name: "Theory of Computation", code: "CS406", progress: 43, uploadCount: 6, continueTopicId: "topic-pda", topicIds: ["topic-pda"] },
  { id: "subject-cn", spaceId: "space-finals", name: "Computer Networks", code: "CS408", progress: 36, uploadCount: 10, continueTopicId: "topic-routing", topicIds: ["topic-routing"] },
  { id: "subject-ai", spaceId: "space-finals", name: "Artificial Intelligence", code: "CS410", progress: 48, uploadCount: 7, continueTopicId: "topic-search", topicIds: ["topic-search"] },
];

export const topics: Topic[] = [
  {
    id: "topic-normalization",
    spaceId: "space-sem4",
    subjectId: "subject-dbms",
    title: "Normalization",
    summary: "Break large tables into dependency-safe relations without losing meaning or anomalies.",
    progress: 78,
    confidence: "medium",
    stickyNote: "Revise 3NF vs BCNF with one clean example.",
    extractedTextPreview: "Functional dependency notes mention partial dependency, transitive dependency, and decomposition examples for second and third normal forms.",
    assets: [
      { id: "asset-1", name: "unit-3-class-notes.pdf", type: "pdf", addedAt: "Today", status: "processed" },
      { id: "asset-2", name: "normalization-whiteboard.jpg", type: "image", addedAt: "Yesterday", status: "processed" }
    ],
    pack: {
      overview: "Normalization organizes attributes into well-structured relations so updates stay consistent and redundancy drops.",
      keyPoints: ["1NF removes repeating groups.", "2NF removes partial dependency.", "3NF removes transitive dependency.", "BCNF requires every determinant to be a candidate key."],
      simpleExplanation: "It is like splitting one messy notebook into smaller pages where each idea belongs in the right place.",
      flashcards: [
        { front: "What problem does 2NF solve?", back: "Partial dependency on part of a composite key." },
        { front: "Why is BCNF stricter than 3NF?", back: "Every determinant must be a candidate key." }
      ],
      quiz: ["Differentiate 2NF and 3NF with one example.", "Why can a table be in 3NF but still violate BCNF?"],
      viva: ["What is a transitive dependency?", "Explain lossy and lossless decomposition."],
      sourceNotes: ["Class notes show customer-order decomposition.", "Handwritten page says identify candidate keys before normalizing."]
    },
    aiActions: ["Explain BCNF like I am revising one night before the exam.", "Make a viva round from my uploaded notes.", "Find the weak point in my normalization understanding."]
  },
  {
    id: "topic-transactions",
    spaceId: "space-sem4",
    subjectId: "subject-dbms",
    title: "Transactions and Concurrency",
    summary: "How databases preserve correctness when many operations happen together.",
    progress: 63,
    confidence: "low",
    extractedTextPreview: "Notes cover ACID properties, serial schedules, conflict equivalence, and locks.",
    assets: [{ id: "asset-3", name: "acid-props.png", type: "image", addedAt: "2 days ago", status: "processed" }],
    pack: {
      overview: "Transactions bundle operations so they either fully succeed or fail without corrupting data.",
      keyPoints: ["ACID = Atomicity, Consistency, Isolation, Durability.", "Serializability checks whether concurrent execution is equivalent to a safe serial order."],
      simpleExplanation: "A transaction is like submitting an exam form: either every required detail is saved, or none of it should be.",
      flashcards: [{ front: "What does isolation protect against?", back: "Interference between concurrent transactions." }],
      quiz: ["What is conflict serializability?"],
      viva: ["Explain two-phase locking."],
      sourceNotes: ["Professor example uses bank transfer to show atomicity."]
    },
    aiActions: ["Ask me ACID viva questions one by one."]
  },
  {
    id: "topic-deadlocks",
    spaceId: "space-sem4",
    subjectId: "subject-os",
    title: "Deadlocks",
    summary: "Processes waiting on each other forever and how systems avoid or recover from it.",
    progress: 54,
    confidence: "medium",
    extractedTextPreview: "Circular wait, hold and wait, resource allocation graphs, Banker’s algorithm.",
    assets: [{ id: "asset-4", name: "deadlocks.pdf", type: "pdf", addedAt: "Today", status: "processed" }],
    pack: {
      overview: "Deadlock happens when processes block each other in a cycle and no one can move forward.",
      keyPoints: ["Four Coffman conditions are required for deadlock.", "Detection, prevention, avoidance, and recovery are the main strategies."],
      simpleExplanation: "Imagine four students each holding one notebook and waiting for the next notebook from someone else in the circle.",
      flashcards: [{ front: "Name one deadlock prevention strategy.", back: "Break hold-and-wait or circular wait." }],
      quiz: ["What does Banker’s algorithm check before allocation?"],
      viva: ["Why is starvation different from deadlock?"],
      sourceNotes: ["Resource allocation graph sketch included in uploaded PDF."]
    },
    aiActions: ["Explain Banker’s algorithm step by step."]
  },
  {
    id: "topic-memory",
    spaceId: "space-sem4",
    subjectId: "subject-os",
    title: "Memory Management",
    summary: "How operating systems allocate and protect memory efficiently.",
    progress: 62,
    confidence: "high",
    extractedTextPreview: "Paging, segmentation, virtual memory, page replacement notes.",
    assets: [],
    pack: { overview: "Memory management ensures every process gets the memory it needs while the system stays efficient.", keyPoints: ["Paging divides memory into fixed-size blocks.", "Virtual memory lets processes use more memory than physically available."], simpleExplanation: "It is like labeled lockers with a smart assistant that brings items in only when needed.", flashcards: [], quiz: [], viva: [], sourceNotes: [] },
    aiActions: ["Make a one-page revision sheet from this topic."]
  },
  {
    id: "topic-pda",
    spaceId: "space-sem4",
    subjectId: "subject-toc",
    title: "Pushdown Automata",
    summary: "Machines with stack memory used for context-free languages.",
    progress: 43,
    confidence: "low",
    extractedTextPreview: "Transition function, acceptance by final state, acceptance by empty stack.",
    assets: [],
    pack: { overview: "A PDA extends finite automata with stack memory to recognize languages that need nested structure tracking.", keyPoints: ["PDA is closely related to context-free grammars."], simpleExplanation: "It is like a machine carrying a stack of reminders it can push and pop while reading input.", flashcards: [], quiz: [], viva: [], sourceNotes: [] },
    aiActions: ["Convert this grammar explanation into an easy PDA story."]
  },
  {
    id: "topic-routing",
    spaceId: "space-finals",
    subjectId: "subject-cn",
    title: "Routing Algorithms",
    summary: "How packets find efficient paths through a network.",
    progress: 36,
    confidence: "medium",
    extractedTextPreview: "Distance vector vs link state notes, Bellman-Ford references, OSPF examples.",
    assets: [],
    pack: { overview: "Routing algorithms help routers build good path decisions using different network knowledge models.", keyPoints: ["Distance vector updates neighbors incrementally.", "Link state builds a full map before computing paths."], simpleExplanation: "One method asks neighbors for direction, the other studies the full map first.", flashcards: [], quiz: [], viva: [], sourceNotes: [] },
    aiActions: ["Compare distance vector and link state in a viva format."]
  },
  {
    id: "topic-search",
    spaceId: "space-finals",
    subjectId: "subject-ai",
    title: "Search Strategies",
    summary: "Core AI approaches for exploring states and finding solutions.",
    progress: 48,
    confidence: "medium",
    extractedTextPreview: "Uninformed search, heuristic search, A* and admissibility notes.",
    assets: [],
    pack: { overview: "Search strategies define how an AI explores possible states to reach a goal efficiently.", keyPoints: ["Breadth-first search is complete for finite branching.", "A* combines path cost and heuristic cost."], simpleExplanation: "Search is like choosing how to walk through a maze when you may or may not have a clue about the destination.", flashcards: [], quiz: [], viva: [], sourceNotes: [] },
    aiActions: ["Test me on admissible heuristics."]
  }
];

export const dashboardStickyNote = "Keep the app focused on what to study next, not only what exists.";
export const getSpaceById = (spaceId: string) => spaces.find((space) => space.id === spaceId);
export const getSubjectById = (subjectId: string) => subjects.find((subject) => subject.id === subjectId);
export const getTopicById = (topicId: string) => topics.find((topic) => topic.id === topicId);
export const getSubjectsForSpace = (spaceId: string) => subjects.filter((subject) => subject.spaceId === spaceId);
export const getTopicsForSubject = (subjectId: string) => topics.filter((topic) => topic.subjectId === subjectId);
export function getDashboardStats() {
  const totalSpaces = spaces.length;
  const totalSubjects = subjects.length;
  const totalTopics = topics.length;
  const averageProgress = Math.round(topics.reduce((sum, topic) => sum + topic.progress, 0) / totalTopics);
  return { totalSpaces, totalSubjects, totalTopics, averageProgress };
}

