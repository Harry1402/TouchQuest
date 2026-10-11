import { NextResponse } from "next/server";
import { z } from "zod";
import { generateSceneQuest } from "@/lib/gemma-vision";

const SceneRequestSchema = z.object({
  imageBase64: z
    .string()
    .min(100, "Image data is too short")
    // Max 3.5MB base64 string (~2.5MB binary)
    .max(3_500_000, "Image exceeds maximum allowed upload size (2.5MB)"),
  durationMinutes: z.number().int().min(3).max(60).optional().default(10),
  environment: z
    .enum(["park", "balcony", "forest", "neighborhood", "water"])
    .optional()
    .default("park"),
  energyLevel: z
    .enum(["still", "gentle", "curious", "active"])
    .optional()
    .default("gentle"),
  questType: z
    .enum(["sensory", "scavenger", "micro_wonder", "sound_safari"])
    .optional()
    .default("sensory"),
  userConsentRemote: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parseResult = SceneRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid scene request data",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      imageBase64,
      durationMinutes,
      environment,
      energyLevel,
      questType,
      userConsentRemote,
    } = parseResult.data;

    const quest = await generateSceneQuest({
      imageBase64,
      durationMinutes,
      environment,
      energyLevel,
      questType,
      userConsentRemote,
    });

    return NextResponse.json(
      {
        success: true,
        quest,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Scene quest generation failed";
    console.error("API Error in /api/generate-scene-quest:", message);

    const isConsent = message.includes("consent");
    const isUnavailable = message.includes("not configured") || message.includes("unavailable");

    const status = isConsent ? 403 : isUnavailable ? 503 : 500;
    const code = isConsent
      ? "CONSENT_REQUIRED"
      : isUnavailable
        ? "VISION_UNAVAILABLE"
        : "MODEL_ERROR";

    return NextResponse.json(
      {
        success: false,
        error: message,
        code,
      },
      { status }
    );
  }
}
