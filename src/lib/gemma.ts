import type {
  Quest,
  QuestPreference,
  QuestGeneratedData,
} from "@/types/quest";
import { QuestResponseSchema } from "@/types/quest";
import { checkQuestSafety, SAFETY_SYSTEM_PROMPT } from "@/lib/safety";
import { getSampleQuest } from "@/lib/sample-quests";

interface GemmaConfig {
  apiKey?: string;
  baseUrl?: string;
  model: string;
  provider: "cloud" | "ollama" | "fallback";
}

export function getGemmaConfig(): GemmaConfig {
  const apiKey = process.env.GEMMA_API_KEY;
  const baseUrl = process.env.GEMMA_API_BASE_URL;
  const model = process.env.GEMMA_MODEL || "gemma2-9b-it";
  const ollamaUrl = process.env.OLLAMA_BASE_URL;

  if (apiKey) {
    return {
      apiKey,
      baseUrl: baseUrl || "https://api.groq.com/openai/v1", // Default fast hosted provider if url omitted
      model,
      provider: "cloud",
    };
  }

  if (ollamaUrl) {
    return {
      baseUrl: ollamaUrl,
      model: process.env.OLLAMA_MODEL || "gemma2:9b",
      provider: "ollama",
    };
  }

  return {
    model: "sample-curated",
    provider: "fallback",
  };
}

export function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  // Strip ```json and ``` markdown code blocks if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  // Find outermost { and }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

export async function generateGemmaQuest(
  preference: QuestPreference
): Promise<Quest> {
  const startTime = Date.now();
  const config = getGemmaConfig();

  // If no API key or Ollama configured, return high-fidelity curated sample
  if (config.provider === "fallback") {
    const sample = getSampleQuest(preference);
    return {
      ...sample,
      modelName: "sample-curated",
      generationLatencyMs: Math.max(5, Date.now() - startTime),
    };
  }

  const systemPrompt = `You are TouchQuest, a mindful nature guide for Hacktoberfest 2026's "Touch Grass" challenge.
Your goal is to craft a hyper-focused, tactile, screen-free outdoor mission.
You must return ONLY a valid JSON object matching this exact structure:
{
  "title": "Short poetic title (3-8 words)",
  "tagline": "Brief 1-sentence poetic teaser",
  "durationMinutes": ${preference.durationMinutes},
  "objective": "Clear, grounded 1-2 sentence purpose of this nature interaction",
  "sensoryAnchor": "One specific tactile/sound/visual anchor (e.g. 'Press your thumb against wet soil')",
  "steps": [
    "Step 1: instruction",
    "Step 2: instruction",
    "Step 3: instruction",
    "Step 4: instruction"
  ],
  "reflectionPrompt": "One mindful question to ponder at the end",
  "safetyTip": "Practical safety reminder for the user's terrain"
}

${SAFETY_SYSTEM_PROMPT}
No commentary, no preamble, no markdown formatting outside the JSON object.`;

  const userPrompt = `Generate a ${preference.durationMinutes}-minute outdoor nature quest.
Environment: ${preference.environment}
Energy Level: ${preference.energyLevel}
Quest Focus: ${preference.questType}
${preference.customContext ? `User custom mood/context note: "${preference.customContext}"` : ""}`;

  try {
    let rawContent = "";
    const providerLabel: "gemma-cloud" | "gemma-local" =
      config.provider === "ollama" ? "gemma-local" : "gemma-cloud";

    if (config.provider === "ollama") {
      const response = await fetch(`${config.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: false,
          format: "json",
          options: { temperature: 0.7, num_predict: 800 },
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.statusText}`);
      }

      const json = await response.json();
      rawContent = json.message?.content || "";
    } else {
      // Cloud OpenAI-compatible endpoint (Groq / OpenRouter / Hugging Face / Google AI Studio)
      const endpoint = `${config.baseUrl!.replace(/\/$/, "")}/chat/completions`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 800,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`Gemma Cloud API failed: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      rawContent = json.choices?.[0]?.message?.content || "";
    }

    const cleaned = cleanJsonText(rawContent);
    const parsed = JSON.parse(cleaned);
    const validated: QuestGeneratedData = QuestResponseSchema.parse(parsed);

    // Run safety verification
    const safetyCheck = checkQuestSafety(validated);
    if (!safetyCheck.safe) {
      console.warn("Safety check triggered on model response:", safetyCheck.reason);
      const sample = getSampleQuest(preference);
      return {
        ...sample,
        modelName: "sample-curated",
        generationLatencyMs: Date.now() - startTime,
      };
    }

    return {
      ...validated,
      id: `quest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      environment: preference.environment,
      energyLevel: preference.energyLevel,
      questType: preference.questType,
      generatedAt: new Date().toISOString(),
      providerUsed: providerLabel,
      isSample: false,
      modelName: config.model,
      generationLatencyMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error("Gemma quest generation fallback triggered:", error);
    const sample = getSampleQuest(preference);
    return {
      ...sample,
      modelName: "sample-curated",
      generationLatencyMs: Date.now() - startTime,
    };
  }
}
