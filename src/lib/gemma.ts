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
  const ollamaUrl = process.env.OLLAMA_BASE_URL;
  const apiKey = process.env.GEMMA_API_KEY;
  const baseUrl = process.env.GEMMA_API_BASE_URL;
  const model = process.env.GEMMA_MODEL || "gemma2-9b-it";
  const ollamaModel = process.env.OLLAMA_MODEL || "gemma2:2b";

  // Prioritize local Ollama if configured
  if (ollamaUrl) {
    return {
      baseUrl: ollamaUrl,
      model: ollamaModel,
      provider: "ollama",
    };
  }

  if (apiKey) {
    let resolvedModel = model || "gemini-3.8-flash";
    if (
      resolvedModel.includes("gemma2") ||
      resolvedModel.includes("gemini-2.0") ||
      resolvedModel.includes("llama")
    ) {
      resolvedModel = "gemini-3.8-flash";
    }
    return {
      apiKey,
      baseUrl: baseUrl || "https://generativelanguage.googleapis.com/v1beta/openai",
      model: resolvedModel,
      provider: "cloud",
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

export function normalizeParsedQuest(
  parsed: Record<string, unknown>,
  preference: QuestPreference
): QuestGeneratedData {
  const title =
    typeof parsed.title === "string" && parsed.title.trim()
      ? parsed.title.trim().slice(0, 100)
      : "The Mindful Outdoor Expedition";

  const tagline =
    typeof parsed.tagline === "string" && parsed.tagline.trim()
      ? parsed.tagline.trim().slice(0, 150)
      : "Step outside and reconnect with the natural world around you.";

  const durationMinutes =
    typeof parsed.durationMinutes === "number" && !isNaN(parsed.durationMinutes)
      ? Math.max(3, Math.min(60, Math.round(parsed.durationMinutes)))
      : preference.durationMinutes;

  const objective =
    typeof parsed.objective === "string" && parsed.objective.trim()
      ? parsed.objective.trim().slice(0, 300)
      : "Engage your senses and pause screen time by observing living outdoor textures.";

  const sensoryAnchor =
    typeof parsed.sensoryAnchor === "string" && parsed.sensoryAnchor.trim()
      ? parsed.sensoryAnchor.trim().slice(0, 250)
      : "Feel the ambient outdoor breeze or touch the cool surface of a natural element.";

  // Resilient steps extraction (handles arrays, single strings, and multi-line strings)
  let rawSteps: string[] = [];
  if (Array.isArray(parsed.steps)) {
    rawSteps = parsed.steps
      .map((s) => (typeof s === "string" ? s.trim() : String(s).trim()))
      .filter((s) => s.length > 0);
  } else if (typeof parsed.steps === "string") {
    rawSteps = parsed.steps
      .split(/\r?\n/)
      .map((s) => s.replace(/^\s*\d+[\.\)]\s*/, "").trim())
      .filter((s) => s.length > 0);
  }

  // Ensure at least 3 distinct steps for a rewarding outdoor experience
  if (rawSteps.length === 0) {
    rawSteps = [
      "Step outside and take a slow, unhurried walk to the nearest open outdoor space.",
      "Stand still for two minutes and notice three distinct sounds in the landscape.",
      "Find a natural texture—soil, bark, or foliage—and touch it with gentle attention.",
    ];
  } else if (rawSteps.length === 1) {
    rawSteps.push("Pause for 60 seconds with closed eyes and listen to distant natural sounds.");
    rawSteps.push("Take three slow deep breaths before heading back, feeling renewed.");
  } else if (rawSteps.length === 2) {
    rawSteps.push("Take three slow deep breaths, matching your exhales to the natural surroundings.");
  }

  const reflectionPrompt =
    typeof parsed.reflectionPrompt === "string" && parsed.reflectionPrompt.trim()
      ? parsed.reflectionPrompt.trim().slice(0, 250)
      : "What subtle detail in nature did you notice that you normally miss?";

  const safetyTip =
    typeof parsed.safetyTip === "string" && parsed.safetyTip.trim()
      ? parsed.safetyTip.trim().slice(0, 250)
      : "Stay on safe designated paths and leave natural flora undisturbed.";

  return {
    title,
    tagline,
    durationMinutes,
    objective,
    sensoryAnchor,
    steps: rawSteps.slice(0, 6),
    reflectionPrompt,
    safetyTip,
  };
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
      generationNotice: "Running in Curated Sample Mode. Start Ollama ('ollama run gemma2:2b') for dynamic on-device quests.",
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

IMPORTANT: Provide exactly 3 or 4 clear steps in the "steps" array.
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
        signal: AbortSignal.timeout(45000),
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
    const normalized = normalizeParsedQuest(parsed, preference);
    const validated: QuestGeneratedData = QuestResponseSchema.parse(normalized);

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
  } catch (error: unknown) {
    console.error("Gemma quest generation fallback triggered:", error);
    const sample = getSampleQuest(preference);
    const isNetworkError =
      error instanceof Error &&
      (error.message.includes("fetch failed") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("timeout") ||
        error.message.includes("AbortError"));

    const notice =
      config.provider === "ollama" && isNetworkError
        ? `Could not reach Ollama at ${config.baseUrl}. Make sure Ollama is running ('ollama run ${config.model}'). Showing offline sample quest.`
        : "Showing curated offline nature quest.";

    return {
      ...sample,
      modelName: "sample-curated",
      generationLatencyMs: Date.now() - startTime,
      generationNotice: notice,
    };
  }
}
