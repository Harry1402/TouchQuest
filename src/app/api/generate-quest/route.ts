import { NextResponse } from "next/server";
import { QuestPreferenceSchema } from "@/types/quest";
import { generateGemmaQuest } from "@/lib/gemma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parseResult = QuestPreferenceSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid quest preferences submitted",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Sanitize customContext to prevent prompt injection or excessive length
    const preference = parseResult.data;
    if (preference.customContext) {
      preference.customContext = preference.customContext
        .replace(/[<>{}\\]/g, "")
        .trim()
        .slice(0, 120);
    }

    const quest = await generateGemmaQuest(preference);

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
  } catch (error) {
    console.error("API Error in /api/generate-quest:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate quest. Please try again.",
      },
      { status: 500 }
    );
  }
}
