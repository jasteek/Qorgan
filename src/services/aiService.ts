// src/services/aiService.ts
/**
 * Service to handle communications with OpenAI API via our backend proxy
 */

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function processAIRequest(messages: ChatMessage[], isEmergency: boolean): Promise<string> {
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        isEmergency,
        language: localStorage.getItem("qorgan_lang") || "ru"
      })
    });
    
    const data = await res.json();
    return data.message;
  } catch (error) {
    console.error("AI fetch failed:", error);
    // Ultimate fallback if backend is down
    return "Связь потеряна. Пожалуйста, звоните 112.";
  }
}
