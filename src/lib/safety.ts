import type { QuestGeneratedData } from "@/types/quest";

export const SAFETY_SYSTEM_PROMPT = `
CRITICAL SAFETY & LEAVE-NO-TRACE PRINCIPLES:
1. Never direct the user to trespass on private property, climb fences, or access restricted sites.
2. Never instruct the user to eat, taste, or ingest any wild plant, berry, mushroom, or flora.
3. Never encourage touching, handling, or cornering wildlife, reptiles, stinging insects, or unknown marine life.
4. Never suggest walking onto busy roads, train tracks, active highways, or precarious drop-offs.
5. Respect living nature: instruct observing with eyes and gentle touch only on sturdy elements (e.g. tree bark, smooth stones, fallen dry leaves). Do not rip leaves off living plants or damage moss beds.
6. Provide an actionable, reassuring safety reminder tailored to the quest environment.
`;

const HAZARD_PATTERNS = [
  /\b(eat|taste|ingest|consume|bite|swallow|chew)\b/i,
  /\b(trespass|private property|hop fence|climb over fence)\b/i,
  /\b(cross highway|busy traffic|railroad|train tracks)\b/i,
  /\b(touch snake|pick up insect|catch squirrel|pet wild)\b/i,
  /\b(mushroom foraging|eat mushroom|eat berry)\b/i,
  /\b(cliff edge|jump down|swim in rapids)\b/i,
  /\b(poison ivy|poison oak|poison sumac)\b/i,
  /\b(pluck leaves|rip leaves|pluck living|destroy flora)\b/i,
];

export function checkQuestSafety(
  quest: QuestGeneratedData & { sceneCue?: string; lookBeyondFrame?: string }
): { safe: boolean; reason?: string } {
  const combinedText = [
    quest.title,
    quest.objective,
    quest.sensoryAnchor,
    quest.sceneCue || "",
    quest.lookBeyondFrame || "",
    ...quest.steps,
    quest.safetyTip,
  ].join(" ");

  for (const pattern of HAZARD_PATTERNS) {
    if (pattern.test(combinedText)) {
      return {
        safe: false,
        reason: `Hazardous suggestion detected matching pattern: ${pattern.toString()}`,
      };
    }
  }

  return { safe: true };
}
