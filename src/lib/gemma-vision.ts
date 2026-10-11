import type {
  Quest,
  EnvironmentType,
  EnergyLevel,
  QuestType,
  SceneQuestGeneratedData,
} from "@/types/quest";
import { SceneQuestResponseSchema } from "@/types/quest";
import { checkQuestSafety, SAFETY_SYSTEM_PROMPT } from "@/lib/safety";
import { cleanJsonText } from "@/lib/gemma";
import { getSampleSceneQuest } from "@/lib/sample-quests";

export interface VisionModelConfig {
  provider: "ollama" | "hosted" | "unavailable";
  model: string;
  baseUrl?: string;
  apiKey?: string;
  isLocal: boolean;
}

export function getVisionConfig(): VisionModelConfig {
  const ollamaUrl = process.env.OLLAMA_BASE_URL;
  const visionModel = process.env.GEMMA_VISION_MODEL;
  const apiKey = process.env.GEMMA_VISION_API_KEY || process.env.GEMMA_API_KEY;
  const hostedBaseUrl =
    process.env.GEMMA_VISION_BASE_URL ||
    process.env.GEMMA_API_BASE_URL ||
    "https://generativelanguage.googleapis.com/v1beta/openai";

  // If local Ollama is configured, prioritize local vision
  if (ollamaUrl) {
    return {
      provider: "ollama",
      model: visionModel || "gemma3:4b",
      baseUrl: ollamaUrl,
      isLocal: true,
    };
  }

  // If hosted vision API key is provided
  if (apiKey) {
    let resolvedModel = visionModel || "gemini-3.8-flash";
    if (
      resolvedModel.includes("gemma2") ||
      resolvedModel.includes("gemini-2.0") ||
      resolvedModel.includes("llama")
    ) {
      resolvedModel = "gemini-3.8-flash";
    }
    return {
      provider: "hosted",
      model: resolvedModel,
      baseUrl: hostedBaseUrl,
      apiKey,
      isLocal: false,
    };
  }

  return {
    provider: "unavailable",
    model: visionModel || "gemini-3.8-flash",
    isLocal: false,
  };
}

export interface GenerateSceneQuestParams {
  imageBase64: string; // Base64 encoded JPEG / PNG
  durationMinutes?: number;
  environment?: EnvironmentType;
  energyLevel?: EnergyLevel;
  questType?: QuestType;
  userConsentRemote?: boolean;
}

export function normalizeParsedSceneQuest(
  parsed: Record<string, unknown>,
  duration = 10
): SceneQuestGeneratedData {
  const sceneCue =
    typeof parsed.sceneCue === "string" && parsed.sceneCue.trim()
      ? parsed.sceneCue.trim().slice(0, 300)
      : "Visual boundary between living foliage and nearby ground surfaces.";

  const validConf = ["low", "medium", "high"];
  const confidence =
    typeof parsed.confidence === "string" && validConf.includes(parsed.confidence.toLowerCase())
      ? (parsed.confidence.toLowerCase() as "low" | "medium" | "high")
      : "medium";

  const confidenceNote =
    typeof parsed.confidenceNote === "string"
      ? parsed.confidenceNote.trim().slice(0, 250)
      : "";

  const title =
    typeof parsed.title === "string" && parsed.title.trim()
      ? parsed.title.trim().slice(0, 100)
      : "Beyond the Snapshot";

  const tagline =
    typeof parsed.tagline === "string" && parsed.tagline.trim()
      ? parsed.tagline.trim().slice(0, 150)
      : "Notice what continues outside the edge of your frame.";

  const durationMinutes =
    typeof parsed.durationMinutes === "number" && !isNaN(parsed.durationMinutes)
      ? Math.max(3, Math.min(60, Math.round(parsed.durationMinutes)))
      : duration;

  const objective =
    typeof parsed.objective === "string" && parsed.objective.trim()
      ? parsed.objective.trim().slice(0, 300)
      : "Expand your awareness from the single camera capture to the full living landscape around you.";

  const sensoryAnchor =
    typeof parsed.sensoryAnchor === "string" && parsed.sensoryAnchor.trim()
      ? parsed.sensoryAnchor.trim().slice(0, 250)
      : "Touch a natural surface near the captured scene and feel its temperature.";

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

  if (rawSteps.length === 0) {
    rawSteps = [
      "Put your phone away and stand exactly where you captured the snapshot.",
      "Turn 90 degrees away from the camera view and find where that visual pattern repeats.",
      "Take five unhurried breaths while observing how the light shifts across that surface.",
    ];
  } else if (rawSteps.length === 1) {
    rawSteps.push("Turn around 180 degrees and look for an opposing texture in the landscape.");
    rawSteps.push("Pause for 60 seconds with closed eyes and listen to ambient outdoor sounds.");
  } else if (rawSteps.length === 2) {
    rawSteps.push("Take three slow breaths, letting your eyes relax away from the screen.");
  }

  const lookBeyondFrame =
    typeof parsed.lookBeyondFrame === "string" && parsed.lookBeyondFrame.trim()
      ? parsed.lookBeyondFrame.trim().slice(0, 300)
      : "Look 10 meters past where you took the photo to find where this natural pattern extends.";

  const reflectionPrompt =
    typeof parsed.reflectionPrompt === "string" && parsed.reflectionPrompt.trim()
      ? parsed.reflectionPrompt.trim().slice(0, 250)
      : "What did you notice in the surrounding space that the camera snapshot completely missed?";

  const safetyTip =
    typeof parsed.safetyTip === "string" && parsed.safetyTip.trim()
      ? parsed.safetyTip.trim().slice(0, 250)
      : "Keep eyes on your walking path; never step backward into uneven terrain.";

  return {
    sceneCue,
    confidence,
    confidenceNote,
    title,
    tagline,
    durationMinutes,
    objective,
    sensoryAnchor,
    steps: rawSteps.slice(0, 6),
    lookBeyondFrame,
    reflectionPrompt,
    safetyTip,
  };
}

export async function generateSceneQuest(
  params: GenerateSceneQuestParams
): Promise<Quest> {
  const startTime = Date.now();
  const config = getVisionConfig();

  if (config.provider === "unavailable") {
    throw new Error(
      "Multimodal vision model is not configured. Please configure local Ollama (GEMMA_VISION_MODEL=gemma3:4b) or a vision API key in .env.local."
    );
  }

  if (config.provider === "hosted" && params.userConsentRemote === false) {
    throw new Error(
      "Remote image processing requires explicit user consent. Please confirm transmission or use local Ollama."
    );
  }

  // Clean base64 string
  let cleanBase64 = params.imageBase64.trim();
  if (cleanBase64.includes(",")) {
    cleanBase64 = cleanBase64.split(",")[1];
  }

  const duration = params.durationMinutes || 10;
  const env = params.environment || "park";

  const systemPrompt = `You are TouchQuest's "Look Once. See More" vision guide for the Hacktoberfest 2026 Touch Grass challenge.
You analyze ONE camera snapshot of a user's outdoor surroundings. Your job is NOT species identification or building a photo encyclopedia.
Your principle is: "Let AI help people notice the world. Then get out of their way."

Focus on visual relationships present in the snapshot:
- Natural forms beside human-made structures
- Light and shadow patterns
- Textures, bark, foliage, stone, soil, water
- Movement and stillness
- Contrasts between surfaces

CRITICAL: The quest MUST push the user to explore BEYOND the original picture frame into the physical world.
Acknowledge uncertainty: set "confidence" to "low", "medium", or "high". If ambiguous, describe what is visible and offer a safe observation.

You must return ONLY a valid JSON object matching this exact structure:
{
  "sceneCue": "Concise 1-2 sentence visual observation grounded in the photo (e.g. 'Lichen expanding across weathered concrete')",
  "confidence": "high",
  "confidenceNote": "Clear view of textured surface in natural daylight",
  "title": "Short poetic title (3-7 words)",
  "tagline": "Brief 1-sentence teaser",
  "durationMinutes": ${duration},
  "objective": "Clear purpose of this nature interaction outside the screen",
  "sensoryAnchor": "One specific tactile/sound anchor (e.g. 'Press palm to shaded bark')",
  "steps": [
    "Step 1: Put phone in pocket and turn 90 degrees away from where you took this photo",
    "Step 2: instruction",
    "Step 3: instruction"
  ],
  "lookBeyondFrame": "Specific action requiring observation of what lies outside or behind the snapshot",
  "reflectionPrompt": "Mindful question (e.g. 'What did you notice that the camera missed?')",
  "safetyTip": "Practical safety tip"
}

${SAFETY_SYSTEM_PROMPT}
No preamble, no markdown formatting outside JSON.`;

  try {
    let rawContent = "";
    const providerLabel = config.isLocal ? "gemma-local-vision" : "gemma-cloud-vision";

    if (config.provider === "ollama") {
      const response = await fetch(`${config.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: "user",
              content: systemPrompt,
              images: [cleanBase64],
            },
          ],
          format: "json",
          stream: false,
          options: { temperature: 0.5, num_predict: 900 },
        }),
        signal: AbortSignal.timeout(45000),
      });

      if (!response.ok) {
        let errorDetail = response.statusText;
        try {
          const errJson = await response.json();
          if (errJson?.error) {
            errorDetail = errJson.error;
          }
        } catch {
          // ignore
        }
        throw new Error(
          `Ollama vision request failed (${response.status}): ${errorDetail}`
        );
      }

      const json = await response.json();
      rawContent = json.message?.content || "";
    } else {
      // Hosted OpenAI-compatible vision endpoint
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
            {
              role: "user",
              content: [
                { type: "text", text: systemPrompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${cleanBase64}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.5,
          max_tokens: 900,
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!response.ok) {
        throw new Error(
          `Hosted vision API failed (${response.status}): ${response.statusText}`
        );
      }

      const json = await response.json();
      rawContent = json.choices?.[0]?.message?.content || "";
    }

    const cleaned = cleanJsonText(rawContent);
    const parsed = JSON.parse(cleaned);
    const normalized = normalizeParsedSceneQuest(parsed, duration);
    const validated: SceneQuestGeneratedData = SceneQuestResponseSchema.parse(normalized);

    // Safety verification
    const safetyCheck = checkQuestSafety(validated);
    if (!safetyCheck.safe) {
      throw new Error(`Vision safety scanner notice: ${safetyCheck.reason}`);
    }

    return {
      ...validated,
      id: `quest-scene-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      environment: env,
      energyLevel: params.energyLevel || "gentle",
      questType: params.questType || "sensory",
      generatedAt: new Date().toISOString(),
      providerUsed: providerLabel,
      isSample: false,
      modelName: config.model,
      generationLatencyMs: Date.now() - startTime,
      isMultimodal: true,
      sceneCue: validated.sceneCue,
      confidence: validated.confidence,
      confidenceNote: validated.confidenceNote,
      lookBeyondFrame: validated.lookBeyondFrame,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.warn("Gemma Vision generation fallback triggered:", errorMsg);

    const fallback = getSampleSceneQuest({
      durationMinutes: duration,
      environment: env,
      energyLevel: params.energyLevel,
      questType: params.questType,
    });

    let notice = "Showing curated offline nature quest.";
    if (config.provider === "ollama") {
      if (errorMsg.includes("not found")) {
        notice = `Ollama model '${config.model}' is not pulled yet. Run 'ollama pull ${config.model}' in your terminal for live vision inference. Showing curated offline quest.`;
      } else if (
        errorMsg.includes("fetch failed") ||
        errorMsg.includes("ECONNREFUSED") ||
        errorMsg.includes("timeout") ||
        errorMsg.includes("AbortError")
      ) {
        notice = `Could not reach Ollama at ${config.baseUrl}. Make sure Ollama is running ('ollama run ${config.model}'). Showing curated offline quest.`;
      }
    } else {
      notice =
        "Showing curated nature quest (Cloud Demo Mode). For live on-device vision, run locally with Ollama Gemma 3.";
    }

    return {
      ...fallback,
      modelName: "sample-curated-vision",
      generationLatencyMs: Date.now() - startTime,
      generationNotice: notice,
    };
  }
}
