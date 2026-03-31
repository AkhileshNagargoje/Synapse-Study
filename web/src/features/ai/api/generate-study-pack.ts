import type { GeneratedStudyPack } from "../../study-packs/types/study-pack";

const apiBaseUrl = import.meta.env.VITE_GEMINI_API_URL || "http://127.0.0.1:8787";

export async function generateStudyPackFromFile(input: { topicTitle: string; topicSummary?: string | null; file: File; }) {
  const base64Data = await fileToBase64(input.file);
  const response = await fetch(`${apiBaseUrl}/api/generate-study-pack`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topicTitle: input.topicTitle,
      topicSummary: input.topicSummary,
      fileName: input.file.name,
      mimeType: input.file.type || inferMimeType(input.file.name),
      base64Data,
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error || "AI generation failed.");
  return payload as { model: string; pack: GeneratedStudyPack };
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") { reject(new Error("Could not read the uploaded file.")); return; }
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("Could not read the uploaded file."));
    reader.readAsDataURL(file);
  });
}

function inferMimeType(fileName: string) {
  return fileName.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg";
}