const apiBaseUrl = import.meta.env.VITE_GEMINI_API_URL || "http://127.0.0.1:8787";

export async function getLiveTutorToken() {
  const response = await fetch(`${apiBaseUrl}/api/live-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "Could not start live tutor.");
  }

  return payload as { token: string; model: string };
}
