import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  QuestPreferenceSchema,
  QUICK_START_PREFERENCE,
  QuestResponseSchema,
  SceneQuestResponseSchema,
} from "@/types/quest";
import type { QuestGeneratedData } from "@/types/quest";
import { checkQuestSafety } from "@/lib/safety";
import { cleanJsonText, normalizeParsedQuest } from "@/lib/gemma";
import { normalizeParsedSceneQuest } from "@/lib/gemma-vision";
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

  describe("Zod Quest Schema Validation & Normalization", () => {
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

    test("rejects payload with empty fields or out-of-range duration", () => {
      const invalidPayload = {
        title: "",
        tagline: "",
        durationMinutes: 0,
        objective: "",
        sensoryAnchor: "",
        steps: [],
        reflectionPrompt: "",
        safetyTip: "",
      };

      assert.throws(() => {
        QuestResponseSchema.parse(invalidPayload);
      });
    });

    test("normalizes compact model output with 1 step into a complete 3-step quest", () => {
      const compactModelOutput = {
        title: "Tree Observation",
        tagline: "Look closely at a tree",
        durationMinutes: 5,
        objective: "Notice subtle leaf details",
        sensoryAnchor: "Touch tree bark",
        steps: ["Walk to the nearest tree"],
        reflectionPrompt: "What did you see?",
        safetyTip: "Watch your footing",
      };

      const normalized = normalizeParsedQuest(compactModelOutput, QUICK_START_PREFERENCE);
      assert.ok(normalized.steps.length >= 3);
      const validated = QuestResponseSchema.parse(normalized);
      assert.equal(validated.title, "Tree Observation");
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

  describe("Multimodal Scene Quest & Look Beyond Frame", () => {
    test("validates conforming SceneQuestResponseSchema payload", () => {
      const validScene = {
        sceneCue: "Moss expanding along shaded limestone steps next to an asphalt walkway.",
        confidence: "high",
        confidenceNote: "Clear natural light on textured stone surface",
        title: "The Limestone Seam",
        tagline: "Follow where mineral meets botanical life.",
        durationMinutes: 10,
        objective: "Notice how living moss colonies colonize human-quarried limestone.",
        sensoryAnchor: "Rest fingertips against cool damp moss carpet",
        steps: [
          "Put phone in pocket and turn 90 degrees away from where you took this photo.",
          "Walk 15 paces along the stone boundary.",
          "Find another seam where moisture collects and observe its micro-flora.",
        ],
        lookBeyondFrame: "Find where this stone path leads into the unpaved tree line.",
        reflectionPrompt: "What did you notice that the camera frame cut off?",
        safetyTip: "Watch for slippery moss on damp steps.",
      };

      const validated = SceneQuestResponseSchema.parse(validScene);
      assert.equal(validated.title, "The Limestone Seam");
      assert.equal(validated.confidence, "high");
      assert.ok(validated.lookBeyondFrame.length > 5);
      assert.equal(validated.steps.length, 3);
    });

    test("normalizes compact vision output and pads steps cleanly", () => {
      const rawVisionOutput = {
        sceneCue: "Cracked pavement with dandelion roots",
        confidence: "medium",
        title: "Pavement Pioneers",
        tagline: "Life between the cracks",
        durationMinutes: 10,
        objective: "Trace the resilience of urban flora",
        sensoryAnchor: "Touch warm asphalt edge",
        steps: ["Look at the crack in the sidewalk"],
        lookBeyondFrame: "Look across the street for a tree breaking through curb stones",
        reflectionPrompt: "What did the camera miss?",
        safetyTip: "Stay on sidewalks",
      };

      const normalized = normalizeParsedSceneQuest(rawVisionOutput, 10);
      assert.ok(normalized.steps.length >= 3);
      const validated = SceneQuestResponseSchema.parse(normalized);
      assert.equal(validated.title, "Pavement Pioneers");
      assert.equal(validated.confidence, "medium");
    });

    test("runs Leave-No-Trace safety scanner on scene quest", () => {
      const unsafeSceneQuest = {
        sceneCue: "Poison ivy patch near trail fence",
        confidence: "medium",
        confidenceNote: "",
        title: "Vine Touching Quest",
        tagline: "Explore the wild leaves",
        durationMinutes: 5,
        objective: "Touch the oily leaves of the three-leaf vine to feel its texture.",
        sensoryAnchor: "Rub leaves on fingers",
        steps: [
          "Walk to the vine",
          "Pluck three leaves from the vine",
          "Crush leaves between fingers",
        ],
        lookBeyondFrame: "Search for more vines to pick",
        reflectionPrompt: "How did it feel?",
        safetyTip: "Be mindful",
      };

      const safetyResult = checkQuestSafety(unsafeSceneQuest);
      assert.equal(safetyResult.safe, false);
    });
  });
});
