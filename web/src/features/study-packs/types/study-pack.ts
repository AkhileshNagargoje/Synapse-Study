export type Flashcard = { front: string; back: string; };

export type StudyPackBody = {
  overview: string;
  keyPoints: string[];
  simpleExplanation: string;
  flashcards: Flashcard[];
  quiz: string[];
  viva: string[];
  sourceNotes: string[];
};

export type GeneratedStudyPack = StudyPackBody & {
  extractedText: string;
  extractedSummary: string;
};

export type StudyPackRecord = {
  id: string;
  user_id: string;
  topic_id: string;
  source_upload_ids: string[];
  pack_body: StudyPackBody;
  generation_status: "draft" | "generating" | "ready" | "failed";
  model_name: string | null;
  created_at: string;
  updated_at: string;
};