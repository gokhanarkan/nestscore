import Dexie, { type EntityTable } from "dexie";
import type { Property, Settings } from "@/types";

const db = new Dexie("NestScoreDB") as Dexie & {
  properties: EntityTable<Property, "id">;
  settings: EntityTable<Settings, "id">;
};

db.version(1).stores({
  properties: "++id, name, postcode, createdAt",
  settings: "id",
});

export { db };

export const defaultSettings: Settings = {
  id: "user-settings",
  weights: {
    location: 20,
    amenities: 15,
    safety: 15,
    building: 15,
    utilities: 10,
    internet: 10,
    energy: 5,
    interior: 5,
    outdoor: 5,
    legal: 0,
  },
  theme: "system",
};

export async function getSettings(): Promise<Settings> {
  const settings = await db.settings.get("user-settings");
  if (!settings) {
    await db.settings.add(defaultSettings);
    return defaultSettings;
  }
  return settings;
}

export async function updateSettings(
  updates: Partial<Omit<Settings, "id">>
): Promise<void> {
  await db.settings.update("user-settings", updates);
}
