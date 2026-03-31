export type StudyPack = {
  overview: string;
  keyPoints: string[];
  simpleExplanation: string;
  flashcards: { front: string; back: string }[];
  quiz: string[];
  viva: string[];
  sourceNotes: string[];
};

export type TopicAsset = {
  id: string;
  name: string;
  type: "pdf" | "image";
  addedAt: string;
  status: "processed" | "processing";
};

export type Topic = {
  id: string;
  spaceId: string;
  subjectId: string;
  title: string;
  summary: string;
  progress: number;
  confidence: "low" | "medium" | "high";
  stickyNote?: string;
  extractedTextPreview: string;
  assets: TopicAsset[];
  pack: StudyPack;
  aiActions: string[];
};

export type Subject = {
  id: string;
  spaceId: string;
  name: string;
  code: string;
  progress: number;
  uploadCount: number;
  continueTopicId: string;
  topicIds: string[];
};

export type Space = {
  id: string;
  name: string;
  label: string;
  progress: number;
  focus: string;
  stickyNote?: string;
  subjectIds: string[];
};

