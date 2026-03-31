import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const env = loadEnv(path.join(__dirname, ".env.local"));
const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const model = env.GEMINI_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
const liveModel = env.GEMINI_LIVE_MODEL || process.env.GEMINI_LIVE_MODEL || "gemini-2.5-flash-native-audio-preview-12-2025";
const port = Number(env.PORT || process.env.PORT || 8787);
const host = env.HOST || process.env.HOST || "0.0.0.0";
const corsOrigin = env.CORS_ORIGIN || process.env.CORS_ORIGIN || "*";
const liveAi = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: "v1alpha" },
    })
  : null;

if (!apiKey) {
  console.warn("Gemini API key is missing. Add it to server/.env.local before generating study packs.");
}

const server = http.createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    writeJson(response, 200, { ok: true, model, liveModel, host, corsOrigin });
    return;
  }

  if (request.method === "POST" && request.url === "/api/live-token") {
    try {
      if (!apiKey || !liveAi) {
        writeJson(response, 500, { error: "Gemini API key is missing on the local AI server." });
        return;
      }

      const token = await liveAi.authTokens.create({
        config: {
          uses: 1,
          expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
          liveConnectConstraints: {
            model: liveModel,
            config: {
              responseModalities: ["AUDIO"],
              outputAudioTranscription: {},
              temperature: 0.5,
              sessionResumption: {},
            },
          },
          httpOptions: { apiVersion: "v1alpha" },
        },
      });

      writeJson(response, 200, { token: token.name, model: liveModel });
    } catch (error) {
      writeJson(response, 500, { error: error instanceof Error ? error.message : "Could not create a Gemini Live token." });
    }
    return;
  }

  if (request.method === "POST" && request.url === "/api/generate-study-pack") {
    try {
      if (!apiKey) {
        writeJson(response, 500, { error: "Gemini API key is missing on the local AI server." });
        return;
      }

      const body = await readJsonBody(request);
      const { topicTitle, topicSummary, fileName, mimeType, base64Data } = body ?? {};

      if (!topicTitle || !fileName || !mimeType || !base64Data) {
        writeJson(response, 400, { error: "topicTitle, fileName, mimeType, and base64Data are required." });
        return;
      }

      const prompt = [
        "You are an AI study companion for college students.",
        `Topic title: ${topicTitle}`,
        `Topic summary: ${topicSummary || "No summary provided."}`,
        `Uploaded file name: ${fileName}`,
        "Analyze the uploaded academic material and return only valid JSON.",
        "Use exactly these keys:",
        "overview, keyPoints, simpleExplanation, flashcards, quiz, viva, sourceNotes, extractedText, extractedSummary",
        "Rules:",
        "overview must be a short paragraph.",
        "keyPoints must be an array of 4 to 8 concise strings.",
        "simpleExplanation must explain the topic in easy student-friendly language.",
        "flashcards must be an array of 3 to 6 objects with front and back string fields.",
        "quiz must be an array of 3 to 5 short exam-style questions.",
        "viva must be an array of 3 to 5 viva-style oral questions.",
        "sourceNotes must be an array of 3 to 6 short extracted study notes.",
        "extractedText must contain the best clean text you can recover from the file.",
        "extractedSummary must be a 2 to 3 sentence extraction summary.",
        "Do not wrap the JSON in markdown fences.",
      ].join("\n");

      const result = await callGemini({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Data } }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
      });

      const rawText = extractResponseText(result);
      const parsed = safeJsonParse(rawText);

      if (!parsed) {
        writeJson(response, 502, { error: "Gemini returned a response, but it was not valid JSON.", rawText });
        return;
      }

      writeJson(response, 200, { model, pack: normalizePack(parsed) });
    } catch (error) {
      writeJson(response, 500, { error: error instanceof Error ? error.message : "Unexpected AI server error." });
    }
    return;
  }

  if (request.method === "POST" && request.url === "/api/topic-chat") {
    try {
      if (!apiKey) {
        writeJson(response, 500, { error: "Gemini API key is missing on the local AI server." });
        return;
      }

      const body = await readJsonBody(request);
      const { topicTitle, topicSummary, studyPack, extractedText, conversationHistory, question } = body ?? {};

      if (!topicTitle || !question) {
        writeJson(response, 400, { error: "topicTitle and question are required." });
        return;
      }

      const packSummary = summarizeStudyPack(studyPack);
      const historySummary = summarizeConversationHistory(conversationHistory);
      const prompt = [
        "You are a helpful personal study tutor for a college student.",
        "Answer only from the topic context when possible. If the context is weak, say that clearly and then help carefully.",
        `Topic: ${topicTitle}`,
        `Topic summary: ${topicSummary || "No summary provided."}`,
        "Saved study pack context:",
        packSummary || "No saved study pack yet.",
        "Extracted note text:",
        typeof extractedText === "string" && extractedText.trim() ? extractedText.trim() : "No extracted text yet.",
        "Recent conversation:",
        historySummary || "No prior conversation yet.",
        `Student question: ${question}`,
        "Reply in a friendly tutor tone.",
        "Keep it concise but useful.",
        "When helpful, use short bullets or steps.",
      ].join("\n\n");

      const result = await callGemini({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5 },
      });

      const answer = extractResponseText(result);
      writeJson(response, 200, { model, answer });
    } catch (error) {
      writeJson(response, 500, { error: error instanceof Error ? error.message : "Unexpected AI server error." });
    }
    return;
  }

  writeJson(response, 404, { error: "Not found." });
});

server.listen(port, host, () => {
  console.log(`Gemini study-pack server listening on http://${host}:${port}`);
});

async function callGemini(payload) {
  const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await geminiResponse.json();

  if (!geminiResponse.ok) {
    throw new Error(result?.error?.message || "Gemini request failed.");
  }

  return result;
}

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const text = fs.readFileSync(filePath, "utf8");
  const entries = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#")).map((line) => {
    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) return null;
    return [line.slice(0, equalsIndex).trim(), line.slice(equalsIndex + 1).trim()];
  }).filter(Boolean);
  return Object.fromEntries(entries);
}
function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", corsOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) {
        reject(new Error("Request body is too large for the local AI server."));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!body) { resolve({}); return; }
      try { resolve(JSON.parse(body)); } catch { reject(new Error("Invalid JSON body.")); }
    });
    request.on("error", reject);
  });
}
function extractResponseText(result) {
  const textPart = result?.candidates?.[0]?.content?.parts?.find((part) => typeof part?.text === "string");
  if (!textPart?.text) throw new Error("Gemini returned no text payload.");
  return textPart.text;
}
function safeJsonParse(rawText) {
  try { return JSON.parse(rawText); } catch {
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    try { return JSON.parse(cleaned); } catch { return null; }
  }
}
function normalizePack(payload) {
  return {
    overview: ensureString(payload.overview),
    keyPoints: ensureStringArray(payload.keyPoints, 4),
    simpleExplanation: ensureString(payload.simpleExplanation),
    flashcards: ensureFlashcards(payload.flashcards),
    quiz: ensureStringArray(payload.quiz, 3),
    viva: ensureStringArray(payload.viva, 3),
    sourceNotes: ensureStringArray(payload.sourceNotes, 3),
    extractedText: ensureString(payload.extractedText),
    extractedSummary: ensureString(payload.extractedSummary),
  };
}
function ensureString(value) { return typeof value === "string" ? value.trim() : ""; }
function ensureStringArray(value, fallbackCount) {
  if (!Array.isArray(value)) return Array.from({ length: fallbackCount }, (_, index) => `Study point ${index + 1}`);
  const list = value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
  return list.length ? list : Array.from({ length: fallbackCount }, (_, index) => `Study point ${index + 1}`);
}
function ensureFlashcards(value) {
  if (!Array.isArray(value)) return [{ front: "What is the main idea?", back: "Review the generated overview and source notes." }, { front: "What should I revise next?", back: "Start with the first key point and quiz questions." }];
  const cards = value.map((item) => ({ front: typeof item?.front === "string" ? item.front.trim() : "", back: typeof item?.back === "string" ? item.back.trim() : "" })).filter((item) => item.front && item.back);
  return cards.length ? cards : [{ front: "What is the main idea?", back: "Review the generated overview and source notes." }, { front: "What should I revise next?", back: "Start with the first key point and quiz questions." }];
}
function summarizeStudyPack(studyPack) {
  if (!studyPack || typeof studyPack !== "object") return "";
  const lines = [];
  if (typeof studyPack.overview === "string" && studyPack.overview.trim()) lines.push(`Overview: ${studyPack.overview.trim()}`);
  if (Array.isArray(studyPack.keyPoints) && studyPack.keyPoints.length) lines.push(`Key points: ${studyPack.keyPoints.join(" | ")}`);
  if (typeof studyPack.simpleExplanation === "string" && studyPack.simpleExplanation.trim()) lines.push(`Simple explanation: ${studyPack.simpleExplanation.trim()}`);
  if (Array.isArray(studyPack.sourceNotes) && studyPack.sourceNotes.length) lines.push(`Source notes: ${studyPack.sourceNotes.join(" | ")}`);
  return lines.join("\n");
}
function summarizeConversationHistory(history) {
  if (!Array.isArray(history)) return "";
  const lines = history
    .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string" && item.content.trim())
    .slice(-6)
    .map((item) => `${item.role === "user" ? "Student" : "Tutor"}: ${item.content.trim()}`);
  return lines.join("\n");
}



