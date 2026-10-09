import { z } from "zod";

export const EnvironmentOptions = [
  { id: "park", label: "Urban Park / Garden", icon: "Trees" },
  { id: "balcony", label: "Backyard / Balcony", icon: "Home" },
  { id: "forest", label: "Trail / Forested Area", icon: "Mountain" },
  { id: "neighborhood", label: "Neighborhood Sidewalk", icon: "Footprints" },
  { id: "water", label: "Waterside / Lake / Creek", icon: "Waves" },
] as const;

export type EnvironmentType = (typeof EnvironmentOptions)[number]["id"];

export const EnergyOptions = [
  { id: "still", label: "Mindful Stillness", description: "Seated or stationary observation" },
  { id: "gentle", label: "Gentle Stroll", description: "Slow, relaxed wandering" },
  { id: "curious", label: "Curious Explorer", description: "Active observing and searching" },
  { id: "active", label: "Brisk Movement", description: "Elevating heart rate & strides" },
] as const;

export type EnergyLevel = (typeof EnergyOptions)[number]["id"];

export const QuestTypeOptions = [
  { id: "sensory", label: "Sensory Grounding", description: "Engage touch, scent, and sound" },
  { id: "scavenger", label: "Micro Scavenger", description: "Spot patterns, textures, and tiny life" },
  { id: "micro_wonder", label: "Micro Wonder", description: "Marvel at intricate natural geometry" },
  { id: "sound_safari", label: "Sound Safari", description: "Listen beyond human noise" },
] as const;

export type QuestType = (typeof QuestTypeOptions)[number]["id"];

export const QuestPreferenceSchema = z.object({
  durationMinutes: z.number().int().min(3).max(60).default(15),
  environment: z.enum(["park", "balcony", "forest", "neighborhood", "water"]),
  energyLevel: z.enum(["still", "gentle", "curious", "active"]),
  questType: z.enum(["sensory", "scavenger", "micro_wonder", "sound_safari"]),
  customContext: z.string().max(150).optional().default(""),
});

export type QuestPreference = z.infer<typeof QuestPreferenceSchema>;

export const QUICK_START_PREFERENCE: QuestPreference = {
  durationMinutes: 5,
  environment: "neighborhood",
  energyLevel: "gentle",
  questType: "sensory",
  customContext: "Quick screen reset for student",
};

export const QuestResponseSchema = z.object({
  title: z.string().min(3).max(80),
  tagline: z.string().min(5).max(120),
  durationMinutes: z.number().int().min(3).max(60),
  objective: z.string().min(10).max(250),
  sensoryAnchor: z.string().min(10).max(200),
  steps: z.array(z.string().min(10).max(250)).min(3).max(5),
  reflectionPrompt: z.string().min(10).max(200),
  safetyTip: z.string().min(5).max(180),
});

export type QuestGeneratedData = z.infer<typeof QuestResponseSchema>;

export interface Quest extends QuestGeneratedData {
  id: string;
  environment: EnvironmentType;
  energyLevel: EnergyLevel;
  questType: QuestType;
  generatedAt: string;
  providerUsed: "gemma-cloud" | "gemma-local" | "sample-curated";
  isSample: boolean;
  modelName?: string;
  generationLatencyMs?: number;
}

export type CompletionStatus = "completed" | "partial" | "interrupted";

export interface QuestLog {
  id: string;
  questId: string;
  title: string;
  tagline: string;
  environment: EnvironmentType;
  completedAt: string;
  durationSeconds: number;
  plannedMinutes: number;
  reflectionText: string;
  preMoodRating: number; // 1 to 5
  postMoodRating: number; // 1 to 5
  completionStatus?: CompletionStatus;
  relevanceRating?: number; // 1 to 5
}

export interface UserStats {
  totalMissionsCompleted: number;
  totalOutdoorMinutes: number;
  currentStreak: number;
  lastCompletedDate: string | null;
}
