import type { Quest, QuestPreference } from "@/types/quest";

export const SAMPLE_QUESTS: Record<string, Omit<Quest, "id" | "generatedAt">> = {
  "park-still": {
    title: "The Canopy Pulse",
    tagline: "Find stillness under the oldest tree you can see.",
    durationMinutes: 10,
    environment: "park",
    energyLevel: "still",
    questType: "sensory",
    objective: "Ground your nervous system by resting beneath a tree canopy and tuning into wind rhythms.",
    sensoryAnchor: "Rest your palm against rough tree bark and feel temperature differences between shaded and sunlit sides.",
    steps: [
      "Walk gently until you find a tree with branches wider than your reach.",
      "Stand or sit beneath it. Close your eyes for 60 seconds and listen for three distinct wind rustles.",
      "Open your eyes and look directly up into the leaves. Track the movement of sunlight through the foliage.",
      "Take five deep breaths, matching your exhales to the swaying rhythm of the highest branch.",
    ],
    reflectionPrompt: "What did the tree's stillness teach your thoughts in this moment?",
    safetyTip: "Choose a dry, stable spot to sit and be mindful of low-hanging dead branches.",
    providerUsed: "sample-curated",
    isSample: true,
  },
  "park-gentle": {
    title: "Micro-Texture Wander",
    tagline: "Discover four completely different textures hidden in plain sight.",
    durationMinutes: 15,
    environment: "park",
    energyLevel: "gentle",
    questType: "scavenger",
    objective: "Shift visual attention from human speed down to microscopic nature scale.",
    sensoryAnchor: "Locate one dry leaf, one damp stone, one patch of moss, and one patch of grass.",
    steps: [
      "Stroll slowly along the path without checking your phone or rushing your pace.",
      "Find a fallen leaf with intact veins. Trace the vein structure with your fingertip.",
      "Search the base of a rock or bench for tiny velvety moss colonies.",
      "Close your eyes for 30 seconds and let the ambient park scents (cut grass, damp soil) fill your senses.",
    ],
    reflectionPrompt: "Which texture surprised your fingertips the most?",
    safetyTip: "Stay on established footpaths and leave growing flora undisturbed.",
    providerUsed: "sample-curated",
    isSample: true,
  },
  "forest-active": {
    title: "The Sylvan Horizon Scout",
    tagline: "Track the shifting scents and shadows of the forest floor.",
    durationMinutes: 25,
    environment: "forest",
    energyLevel: "active",
    questType: "micro_wonder",
    objective: "Engage cardiovascular vitality while observing ecosystem microclimates.",
    sensoryAnchor: "Notice the exact boundary where warm sun patches give way to cool damp forest shade.",
    steps: [
      "Begin with a brisk 5-minute uphill or winding walk to awaken your breath and heart rate.",
      "Pause at a trail bend. Spot three natural geometric patterns: spiral ferns, radial moss, or concentric bark rings.",
      "Breathe deeply through your nose to detect pine terpenes or damp earth humus.",
      "Walk the final stretch in complete silence, focusing only on the crunch beneath your shoes.",
    ],
    reflectionPrompt: "How did your breathing change between the uphill climb and the quiet pause?",
    safetyTip: "Watch for exposed roots and wet stones on uneven trail terrain.",
    providerUsed: "sample-curated",
    isSample: true,
  },
  "balcony-still": {
    title: "The Sky & Cloud Drift",
    tagline: "Turn your urban balcony or window into an observatory.",
    durationMinutes: 5,
    environment: "balcony",
    energyLevel: "still",
    questType: "micro_wonder",
    objective: "Decompress screen strain by softening your visual horizon.",
    sensoryAnchor: "Feel the ambient breeze on the back of your neck while softening your gaze toward the farthest cloud.",
    steps: [
      "Step out onto your balcony or open a window facing open sky.",
      "Pick the highest, farthest cloud or tree crown visible. Stare softly without blinking intensely for 45 seconds.",
      "Touch a potted plant's soil or leaf surface, observing moisture and temperature.",
      "Listen for one bird call cutting through urban background hum.",
    ],
    reflectionPrompt: "How does looking at the far horizon shift your mental spaciousness?",
    safetyTip: "Stand comfortably away from balcony railings and stay warm in cool breezes.",
    providerUsed: "sample-curated",
    isSample: true,
  },
  "neighborhood-curious": {
    title: "Sidewalk Cracks & Wild Greenery",
    tagline: "Celebrate the persistent nature fighting through urban concrete.",
    durationMinutes: 15,
    environment: "neighborhood",
    energyLevel: "curious",
    questType: "scavenger",
    objective: "Spot the resilience of pioneer plants thriving in urban micro-habitats.",
    sensoryAnchor: "Gently touch tiny clover, dandelion, or moss thriving between pavers.",
    steps: [
      "Walk down your street looking exclusively at the ground level and lower fences.",
      "Find three different plant species growing out of pavement cracks or brick crevices.",
      "Observe an ant or insect colony navigating the urban terrain.",
      "Look up at the overhead wires or rooflines to find a resting bird observer.",
    ],
    reflectionPrompt: "What does the tenacity of crack-dwelling greenery remind you about resilience?",
    safetyTip: "Keep your head up at pedestrian crosswalks and stay alert to vehicles.",
    providerUsed: "sample-curated",
    isSample: true,
  },
  "water-still": {
    title: "The Ripple Symphony",
    tagline: "Synchronize your breathing with moving water.",
    durationMinutes: 15,
    environment: "water",
    energyLevel: "still",
    questType: "sound_safari",
    objective: "Use the auditory rhythm of water to release cognitive fatigue.",
    sensoryAnchor: "Focus on the low-frequency lap of water against bank stones.",
    steps: [
      "Find a dry perch near the water edge, keeping safe clearance from slick banks.",
      "Close your eyes and count 10 distinct water splashes or rhythmic lap sounds.",
      "Open your eyes and track one floating leaf or ripple ring until it vanishes.",
      "Take slow, deep inhalations, noting the cool mineral freshness in the air.",
    ],
    reflectionPrompt: "What thoughts drifted away with the flow of the water?",
    safetyTip: "Stay well clear of slippery embankments and fast-flowing currents.",
    providerUsed: "sample-curated",
    isSample: true,
  },
};

export function getSampleQuest(pref: QuestPreference): Quest {
  const key = `${pref.environment}-${pref.energyLevel}`;
  const base = SAMPLE_QUESTS[key] || SAMPLE_QUESTS["park-still"];

  return {
    ...base,
    id: `sample-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    durationMinutes: pref.durationMinutes || base.durationMinutes,
    environment: pref.environment,
    energyLevel: pref.energyLevel,
    questType: pref.questType,
    generatedAt: new Date().toISOString(),
    providerUsed: "sample-curated",
    isSample: true,
  };
}

export function getSampleSceneQuest(params?: {
  durationMinutes?: number;
  environment?: QuestPreference["environment"];
  energyLevel?: QuestPreference["energyLevel"];
  questType?: QuestPreference["questType"];
}): Quest {
  const duration = params?.durationMinutes || 10;
  const env = params?.environment || "park";
  const energy = params?.energyLevel || "gentle";
  const questType = params?.questType || "sensory";

  return {
    id: `scene-sample-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: "Beyond the Snapshot",
    tagline: "Notice the living ecosystem extending past your camera frame.",
    durationMinutes: duration,
    environment: env,
    energyLevel: energy,
    questType: questType,
    objective:
      "Expand your awareness from the single captured snapshot to the living horizon around you.",
    sensoryAnchor:
      "Touch a natural surface near where you stood and feel the ambient air temperature.",
    steps: [
      "Put your phone away and stand exactly where you captured the snapshot.",
      "Turn 90 degrees away from the camera view and observe where that visual texture repeats.",
      "Take five unhurried breaths while tracking how natural light shifts across the nearest tree or surface.",
    ],
    reflectionPrompt:
      "What did you discover in the surrounding physical space that the camera snapshot completely missed?",
    safetyTip: "Stay on safe paths and never step backward without checking behind you.",
    sceneCue: "Living textures and daylight gradients extending past the camera frame.",
    confidence: "high",
    confidenceNote:
      "Curated tactile scene template grounded in mindful physical presence.",
    lookBeyondFrame:
      "Look 10 paces behind where you stood to observe how sound and wind shift outside the frame.",
    generatedAt: new Date().toISOString(),
    providerUsed: "sample-curated",
    isSample: true,
    isMultimodal: true,
  };
}
