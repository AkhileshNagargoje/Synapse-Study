export type UploadRecord = {
  id: string;
  user_id: string;
  space_id: string;
  subject_id: string;
  topic_id: string | null;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number | null;
  upload_level: "subject" | "topic";
  upload_status: "uploaded" | "processing" | "processed" | "failed";
  extracted_text: string | null;
  extracted_summary: string | null;
  created_at: string;
  updated_at: string;
};