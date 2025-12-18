import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Property } from "@/types";

export function useProperties() {
  return useLiveQuery(() => db.properties.orderBy("createdAt").reverse().toArray()) ?? [];
}

export function useProperty(id: number | undefined) {
  return useLiveQuery(() => (id ? db.properties.get(id) : undefined), [id]);
}

export async function addProperty(
  property: Omit<Property, "id" | "createdAt" | "updatedAt">
): Promise<number> {
  const now = new Date();
  const id = await db.properties.add({
    ...property,
    createdAt: now,
    updatedAt: now,
  } as Property);
  return id as number;
}

export async function updateProperty(
  id: number,
  updates: Partial<Omit<Property, "id" | "createdAt">>
): Promise<void> {
  await db.properties.update(id, { ...updates, updatedAt: new Date() });
}

export async function deleteProperty(id: number): Promise<void> {
  await db.properties.delete(id);
}
