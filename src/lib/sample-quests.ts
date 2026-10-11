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

export const SCENE_SAMPLE_QUESTS = [
  {
    title: "Shadow Weave & Canopy Edge",
    tagline: "Track how sunlight perforates foliage outside your frame.",
    sceneCue: "Interlocking branch patterns and dappled sunlight filtering through overhead canopy.",
    objective: "Expand your awareness from the single captured snapshot to the living horizon around you.",
    sensoryAnchor: "Press your palm to a patch of ground where light meets shade to feel the micro-climate difference.",
    steps: [
      "Put your phone in your pocket and stand exactly where you captured the snapshot.",
      "Look straight upward through the canopy gaps to track the direction of high-altitude clouds.",
      "Take five slow breaths while watching how wind rustles the highest leaves.",
    ],
    lookBeyondFrame: "Look 15 paces away toward where the shadow edge dissolves into full sunlight.",
    reflectionPrompt: "How does the temperature of shaded bark compare to the air on your cheeks?",
    safetyTip: "Stay on safe paths and keep eyes clear of low-hanging branches.",
  },
  {
    title: "Weathered Strata & Earth Flow",
    tagline: "Notice the transition between compacted earth and wild vegetative drift.",
    sceneCue: "Fine grains of topsoil, fallen bark fragments, and mineral edges on the ground plane.",
    objective: "Notice micro-textures beneath your feet that human eyes normally overlook while hurrying.",
    sensoryAnchor: "Pick up a pinch of dry earth or a fallen pebble and feel its weight and grit between your fingers.",
    steps: [
      "Lower your phone and remain still for 60 seconds listening to grounding outdoor sounds.",
      "Trace 10 paces along the natural contour of the terrain to find where rain water drains.",
      "Examine three distinct fallen elements (a seed pod, a dried twig, a leaf skeleton).",
    ],
    lookBeyondFrame: "Look 20 meters ahead to find where the ground plane rises into the nearest hill or rise.",
    reflectionPrompt: "What does the layering of fallen organic matter teach you about patience?",
    safetyTip: "Watch your footing on loose gravel and uneven soil edges.",
  },
  {
    title: "Pioneer Greenery & Stone Crevices",
    tagline: "Observe the tenacious green life colonizing brick, asphalt, and concrete seams.",
    sceneCue: "Hardened human-made masonry fractured by micro-moss and resilient wild shoots.",
    objective: "Celebrate the persistent strength of nature flourishing in unexpected micro-habitats.",
    sensoryAnchor: "Gently stroke the soft moss cushion with your fingertip, noting how moist it stays.",
    steps: [
      "Put your phone away and turn 90 degrees away from the wall or stone.",
      "Search along the seam for the tiniest flowering sprout or pioneer lichen colony.",
      "Take three slow breaths, observing how life reclaims stone surfaces over decades.",
    ],
    lookBeyondFrame: "Turn 180 degrees away to identify the nearest mature source tree feeding these airborne spores.",
    reflectionPrompt: "Where in your own life can you find growth inside narrow crevices?",
    safetyTip: "Stay on designated footpaths and be mindful of curbs and vehicles.",
  },
  {
    title: "Wind Currents Across Leaf Margins",
    tagline: "Observe subtle plant motion that a still photograph freezes in place.",
    sceneCue: "Flexing stems and fluttering leaf margins responding to local air currents.",
    objective: "Shift visual attention from static pixels to real-time kinetic nature choreography.",
    sensoryAnchor: "Close your eyes and turn your face until you pinpoint the exact compass direction of the prevailing breeze.",
    steps: [
      "Put your phone away and watch a single branch tip for two full minutes without looking away.",
      "Count the distinct gusts that arrive, noting the delay between sound and branch flex.",
      "Take four long inhalations, matching the tempo of your chest to the waving branches.",
    ],
    lookBeyondFrame: "Scan 20 meters into the distance to see which taller tree crown is swaying in sync with this spot.",
    reflectionPrompt: "How does matching your breath to moving foliage quiet internal urgency?",
    safetyTip: "Keep footing stable while watching high overhead tree movement.",
  },
  {
    title: "The Living Bark Topography",
    tagline: "Explore the deep ridges, lichen maps, and micro-forests on tree trunks.",
    sceneCue: "Vertical fissure lines, lichen crusts, and rough organic armor on a woody trunk.",
    objective: "Connect tactile touch directly to the living biological column supporting canopy life.",
    sensoryAnchor: "Rest both hands flat against the trunk and feel the structural thickness and coolness of the wood.",
    steps: [
      "Step forward until your chest is within arm's reach of the nearest trunk.",
      "Trace one continuous bark furrow with your eyes from ground level as high as you can see.",
      "Notice three color variations hidden within the bark (ash gray, olive green, rusted ochre).",
    ],
    lookBeyondFrame: "Look downward toward the root flare to see how wide the tree anchors into the earth.",
    reflectionPrompt: "What protective armor do you carry that shields your own inner vitality?",
    safetyTip: "Inspect bark with gentle eyes before touching; leave resting insects undisturbed.",
  },
  {
    title: "Liquid Mirrors & Edge Riparian",
    tagline: "Notice how sky and foliage reflect off damp pebbles and water edges.",
    sceneCue: "Luminous liquid sheen, damp gravel, and mirrored sky fragments.",
    objective: "Observe natural reflection, surface tension, and light refraction along boundaries.",
    sensoryAnchor: "Hover your hands inches above the damp surface to feel the cool evaporative draft.",
    steps: [
      "Step back two paces to a secure, completely dry observation point.",
      "Observe five distinct ripples or reflections crossing the surface without reaching for your screen.",
      "Inhale slowly through your nose, noting mineral and aquatic scent nuances.",
    ],
    lookBeyondFrame: "Look along the shoreline or drainage contour to discover where dragonflies or birds land.",
    reflectionPrompt: "How does the calm surface reflect the sky more clearly when the water is still?",
    safetyTip: "Maintain safe distance from slick banks and sudden water drop-offs.",
  },
];

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

  // Pick dynamically from diverse pool
  const template =
    SCENE_SAMPLE_QUESTS[Math.floor(Math.random() * SCENE_SAMPLE_QUESTS.length)];

  return {
    id: `scene-sample-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: template.title,
    tagline: template.tagline,
    durationMinutes: duration,
    environment: env,
    energyLevel: energy,
    questType: questType,
    objective: template.objective,
    sensoryAnchor: template.sensoryAnchor,
    steps: template.steps,
    reflectionPrompt: template.reflectionPrompt,
    safetyTip: template.safetyTip,
    sceneCue: template.sceneCue,
    confidence: "high",
    confidenceNote: "Curated tactile scene grounded in mindful physical presence.",
    lookBeyondFrame: template.lookBeyondFrame,
    generatedAt: new Date().toISOString(),
    providerUsed: "sample-curated",
    isSample: true,
    isMultimodal: true,
  };
}
