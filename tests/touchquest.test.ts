import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  QuestPreferenceSchema,
  QUICK_START_PREFERENCE,
  QuestResponseSchema,
} from "@/types/quest";
import type { QuestGeneratedData } from "@/types/quest";
import { checkQuestSafety } from "@/lib/safety";
import { cleanJsonText } from "@/lib/gemma";
import { getSampleQuest } from "@/lib/sample-quests";

describe("TouchQuest Core Tests", () => {
  describe("Quick-Start Configuration", () => {
    test("QUICK_START_PREFERENCE adheres to QuestPreferenceSchema", () => {
      const parsed = QuestPreferenceSchema.parse(QUICK_START_PREFERENCE);
      assert.equal(parsed.durationMinutes, 5);
      assert.equal(parsed.environment, "neighborhood");
      assert.equal(parsed.energyLevel, "gentle");
      assert.equal(parsed.questType, "sensory");
    });
  });

  describe("Zod Quest Schema Validation", () => {
    test("validates complete, conformant quest JSON", () => {
      const validPayload = {
        title: "Sidewalk Lichen Whisper",
        tagline: "Uncover miniature stone ecosystems on your immediate block",
        durationMinutes: 5,
        objective: "Locate one patch of lichen on stone or brick and study its fractal perimeter.",
        sensoryAnchor: "Rest fingertips against cool brick surface",
        steps: [
          "Step 1: Step out the front door and stop by the nearest stone, asphalt, or masonry wall.",
          "Step 2: Inspect the surface for pale green, silver, or golden crustose patches.",
          "Step 3: Press your palm to the masonry. Feel the temperature shift from indoors.",
          "Step 4: Take three quiet breaths before turning back inside.",
        ],
        reflectionPrompt: "What unnoticed survivor is thriving right outside your entryway?",
        safetyTip: "Stay on public sidewalks; watch for bicycle traffic.",
      };

      const validated = QuestResponseSchema.parse(validPayload);
      assert.equal(validated.title, "Sidewalk Lichen Whisper");
      assert.equal(validated.steps.length, 4);
    });

    test("rejects payload missing mandatory steps or with out-of-range duration", () => {
      const invalidPayload = {
        title: "Too Short",
        tagline: "Short",
        durationMinutes: 1, // min is 3
        objective: "Too short",
        sensoryAnchor: "Short",
        steps: ["Only one step"], // min is 3
        reflectionPrompt: "Short",
        safetyTip: "Tip",
      };

      assert.throws(() => {
        QuestResponseSchema.parse(invalidPayload);
      });
    });
  });

  describe("Safety Scanner & Leave-No-Trace", () => {
    test("flags forbidden ingestion recommendations", () => {
      const toxicQuest: QuestGeneratedData = {
        title: "Berry Tasting Quest",
        tagline: "Forage the wild shrubs",
        durationMinutes: 5,
        objective: "Walk to the bushes and eat berries you discover on the path.",
        sensoryAnchor: "Taste the sourness",
        steps: [
          "Walk past the courtyard",
          "Identify red berries",
          "Bite and chew slowly to savor the flavor",
        ],
        reflectionPrompt: "How did it taste?",
        safetyTip: "Only pick clean berries",
      };

      const result = checkQuestSafety(toxicQuest);
      assert.equal(result.safe, false);
      assert.ok(result.reason?.includes("Hazardous suggestion"));
    });

    test("flags trespassing and dangerous boundary crossing", () => {
      const trespassQuest: QuestGeneratedData = {
        title: "Beyond the Fence",
        tagline: "Explore forbidden grounds",
        durationMinutes: 5,
        objective: "Climb over fence into the adjacent empty lot.",
        sensoryAnchor: "Cold iron wire",
        steps: [
          "Approach boundary",
          "Hop fence quietly onto private property",
          "Search for hidden wildflowers",
        ],
        reflectionPrompt: "What did you feel?",
        safetyTip: "Be quick",
      };

      const result = checkQuestSafety(trespassQuest);
      assert.equal(result.safe, false);
    });

    test("passes legitimate, mindful outdoor observation", () => {
      const mindfulQuest: QuestGeneratedData = {
        title: "Breeze & Canopy Texture",
        tagline: "Notice subtle tree movements against the sky",
        durationMinutes: 5,
        objective: "Stand beneath a neighborhood tree and trace wind patterns through outer leaves.",
        sensoryAnchor: "Feel wind chill against your cheekbones",
        steps: [
          "Step into the nearest patch of open air.",
          "Find a deciduous tree or street sapling.",
          "Focus your gaze upward for 60 seconds without moving.",
          "Notice which branches move first when gusts arrive.",
        ],
        reflectionPrompt: "Did the air feel warmer or cooler than you anticipated?",
        safetyTip: "Stay safely on pedestrian walk areas.",
      };

      const result = checkQuestSafety(mindfulQuest);
      assert.equal(result.safe, true);
    });
  });

  describe("JSON Extraction & Fallback Resilience", () => {
    test("cleans markdown fences from raw LLM output", () => {
      const raw = "```json\n{\"title\": \"Test Quest\"}\n```";
      const cleaned = cleanJsonText(raw);
      assert.equal(cleaned, "{\"title\": \"Test Quest\"}");
    });

    test("sample quest generator provides valid instant fallback for quick-start", () => {
      const quest = getSampleQuest(QUICK_START_PREFERENCE);
      assert.ok(quest.title.length > 0);
      assert.equal(quest.durationMinutes, 5);
      assert.equal(quest.isSample, true);
      assert.equal(quest.providerUsed, "sample-curated");
      const validated = QuestResponseSchema.parse(quest);
      assert.ok(validated);
    });
  });
});
