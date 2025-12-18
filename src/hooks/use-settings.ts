import { useLiveQuery } from "dexie-react-hooks";
import { db, defaultSettings, updateSettings as dbUpdateSettings } from "@/lib/db";
import type { Settings } from "@/types";

export function useSettings() {
  const settings = useLiveQuery(() => db.settings.get("user-settings"));
  return settings ?? defaultSettings;
}

export async function updateSettings(
  updates: Partial<Omit<Settings, "id">>
): Promise<void> {
  await dbUpdateSettings(updates);
}
