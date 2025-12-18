import type { Coordinates } from "@/types";

interface PostcodeResult {
  postcode: string;
  latitude: number;
  longitude: number;
  admin_district: string;
  region: string;
}

interface PostcodeResponse {
  status: number;
  result: PostcodeResult | null;
}

interface AutocompleteResponse {
  status: number;
  result: string[] | null;
}

export async function lookupPostcode(postcode: string): Promise<PostcodeResult | null> {
  try {
    const cleanPostcode = postcode.replace(/\s+/g, "").toUpperCase();
    const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);
    const data: PostcodeResponse = await response.json();

    if (data.status === 200 && data.result) {
      return data.result;
    }
    return null;
  } catch {
    return null;
  }
}

export async function autocompletePostcode(partial: string): Promise<string[]> {
  try {
    if (partial.length < 2) return [];
    const response = await fetch(`https://api.postcodes.io/postcodes/${partial}/autocomplete`);
    const data: AutocompleteResponse = await response.json();

    if (data.status === 200 && data.result) {
      return data.result;
    }
    return [];
  } catch {
    return [];
  }
}

export async function validatePostcode(postcode: string): Promise<boolean> {
  try {
    const cleanPostcode = postcode.replace(/\s+/g, "").toUpperCase();
    const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}/validate`);
    const data = await response.json();
    return data.result === true;
  } catch {
    return false;
  }
}

// Haversine formula for calculating distance between two points
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}
