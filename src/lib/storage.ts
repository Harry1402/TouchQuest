import { QuestLog, UserStats } from "@/types/quest";

const STORAGE_KEYS = {
  HISTORY: "touchquest_history",
  STATS: "touchquest_stats",
};

const DEFAULT_STATS: UserStats = {
  totalMissionsCompleted: 0,
  totalOutdoorMinutes: 0,
  currentStreak: 0,
  lastCompletedDate: null,
};

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStats(): UserStats {
  if (!isClient()) return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) return DEFAULT_STATS;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read user stats from localStorage:", e);
    return DEFAULT_STATS;
  }
}

export function getHistory(): QuestLog[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const list: QuestLog[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error("Failed to read quest history from localStorage:", e);
    return [];
  }
}

export function saveQuestCompletion(
  entry: Omit<QuestLog, "id">
): { newStats: UserStats; savedLog: QuestLog } {
  const currentStats = getStats();
  const currentHistory = getHistory();

  const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const savedLog: QuestLog = { ...entry, id };

  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  let newStreak = currentStats.currentStreak;

  if (!currentStats.lastCompletedDate) {
    newStreak = 1;
  } else if (currentStats.lastCompletedDate !== todayStr) {
    const lastDate = new Date(currentStats.lastCompletedDate);
    const currentDate = new Date(todayStr);
    const diffDays = Math.round(
      (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
    );

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const durationMin = Math.round(entry.durationSeconds / 60) || entry.plannedMinutes;

  const newStats: UserStats = {
    totalMissionsCompleted: currentStats.totalMissionsCompleted + 1,
    totalOutdoorMinutes: currentStats.totalOutdoorMinutes + durationMin,
    currentStreak: newStreak,
    lastCompletedDate: todayStr,
  };

  if (isClient()) {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
      localStorage.setItem(
        STORAGE_KEYS.HISTORY,
        JSON.stringify([savedLog, ...currentHistory])
      );
    } catch (e) {
      console.error("Failed to persist to localStorage:", e);
    }
  }

  return { newStats, savedLog };
}

export function exportJournalAsMarkdown(logs: QuestLog[]): string {
  if (logs.length === 0) return "# TouchQuest Journal\n\nNo quests logged yet.";

  let md = "# 🌿 TouchQuest — Nature Reflections Journal\n\n";
  md += `Exported on: ${new Date().toLocaleDateString()}\n\n---\n\n`;

  for (const log of logs) {
    const dateFormatted = new Date(log.completedAt).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    md += `### ${log.title}\n`;
    md += `*${log.tagline}*\n\n`;
    md += `- **Date**: ${dateFormatted}\n`;
    md += `- **Environment**: ${log.environment}\n`;
    md += `- **Duration**: ${Math.round(log.durationSeconds / 60)} minutes\n`;
    md += `- **Completion**: ${log.completionStatus || "completed"}\n`;
    if (log.relevanceRating) {
      md += `- **Surroundings Relevance**: ${log.relevanceRating}/5\n`;
    }
    md += `- **Mood Shift**: ${log.preMoodRating}/5 → ${log.postMoodRating}/5\n\n`;
    if (log.reflectionText) {
      md += `> **Reflection**: "${log.reflectionText}"\n\n`;
    }
    md += "---\n\n";
  }

  return md;
}
