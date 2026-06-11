import type { Sentiment } from "../../models/Journal.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export class SentimentError extends Error {
  statusCode = 500;

  constructor(message: string) {
    super(message);
  }
}

/**
 * Analyzes journal text sentiment using Groq AI
 * Returns: "positive" | "negative" | "neutral"
 * Fallback: "neutral" on any error
 */
export const analyzeSentiment = async (text: string): Promise<Sentiment> => {
  console.log("[SentimentService] Starting sentiment analysis...");
  console.log("[SentimentService] GROQ_API_KEY configured:", !!GROQ_API_KEY);
  console.log("[SentimentService] GROQ_MODEL:", GROQ_MODEL);
  
  if (!GROQ_API_KEY) {
    console.error("[SentimentService] GROQ_API_KEY not configured in environment variables");
    console.error("[SentimentService] Please set GROQ_API_KEY in your .env file");
    return "neutral";
  }

  try {
    console.log("[SentimentService] Calling Groq API...");
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a sentiment analyzer. Analyze the given text and respond with ONLY ONE WORD: positive, negative, or neutral. Do not include any explanation, punctuation, or additional text.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.1,
        max_tokens: 10,
      }),
    });

    console.log("[SentimentService] Groq API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SentimentService] Groq API error: ${response.status} ${response.statusText}`);
      console.error(`[SentimentService] Error response:`, errorText);
      return "neutral";
    }

    const data = await response.json();
    console.log("[SentimentService] Groq API response data:", JSON.stringify(data, null, 2));
    
    const sentiment = data.choices?.[0]?.message?.content?.trim().toLowerCase();
    console.log("[SentimentService] Extracted sentiment:", sentiment);

    if (sentiment === "positive" || sentiment === "negative" || sentiment === "neutral") {
      console.log("[SentimentService] Successfully analyzed sentiment:", sentiment);
      return sentiment;
    }

    console.error(`[SentimentService] Invalid sentiment from Groq: ${sentiment}`);
    return "neutral";
  } catch (error) {
    console.error("[SentimentService] Error calling Groq API:", error);
    return "neutral";
  }
};
