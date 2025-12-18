import pako from "pako";
import type { Property, Settings } from "@/types";

export interface ShareData {
  type: "settings" | "property" | "properties";
  version: number;
  data: SettingsShareData | PropertyShareData | PropertiesShareData;
}

export interface SettingsShareData {
  weights: Record<string, number>;
  workPostcode?: string;
}

export interface PropertyShareData {
  name: string;
  postcode: string;
  address: string;
  price: number;
  agent?: string;
  listingUrl?: string;
  answers: Record<string, string | boolean | number>;
  notes: string;
}

export interface PropertiesShareData {
  properties: PropertyShareData[];
}

const SHARE_VERSION = 1;

/**
 * Compress and encode data to a URL-safe base64 string
 */
export function encodeShareData(data: ShareData): string {
  try {
    const json = JSON.stringify(data);
    const compressed = pako.deflate(json);
    // Convert Uint8Array to base64
    const base64 = btoa(String.fromCharCode(...compressed));
    // Make URL-safe
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (e) {
    console.error("Failed to encode share data:", e);
    throw new Error("Failed to encode share data");
  }
}

/**
 * Decode and decompress a URL-safe base64 string to data
 */
export function decodeShareData(encoded: string): ShareData | null {
  try {
    // Restore standard base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }
    // Convert base64 to Uint8Array
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    // Decompress
    const decompressed = pako.inflate(bytes, { to: "string" });
    const data = JSON.parse(decompressed) as ShareData;

    // Validate version
    if (data.version > SHARE_VERSION) {
      console.warn("Share data version is newer than supported");
    }

    return data;
  } catch (e) {
    console.error("Failed to decode share data:", e);
    return null;
  }
}

/**
 * Create a shareable URL for settings (weights)
 */
export function createSettingsShareData(settings: Settings): ShareData {
  return {
    type: "settings",
    version: SHARE_VERSION,
    data: {
      weights: settings.weights,
      workPostcode: settings.workPostcode,
    } as SettingsShareData,
  };
}

/**
 * Create a shareable URL for a single property
 */
export function createPropertyShareData(property: Property): ShareData {
  return {
    type: "property",
    version: SHARE_VERSION,
    data: {
      name: property.name,
      postcode: property.postcode,
      address: property.address,
      price: property.price,
      agent: property.agent,
      listingUrl: property.listingUrl,
      answers: property.answers,
      notes: property.notes || "",
    } as PropertyShareData,
  };
}

/**
 * Create a shareable URL for multiple properties
 */
export function createPropertiesShareData(properties: Property[]): ShareData {
  return {
    type: "properties",
    version: SHARE_VERSION,
    data: {
      properties: properties.map((p) => ({
        name: p.name,
        postcode: p.postcode,
        address: p.address,
        price: p.price,
        agent: p.agent,
        listingUrl: p.listingUrl,
        answers: p.answers,
        notes: p.notes || "",
      })),
    } as PropertiesShareData,
  };
}

/**
 * Generate the full share URL
 */
export function generateShareUrl(data: ShareData): string {
  const encoded = encodeShareData(data);
  return `${window.location.origin}/share?data=${encoded}`;
}

/**
 * Check if the encoded data is too large for a QR code (max ~3KB)
 */
export function isDataTooLargeForQR(encoded: string): boolean {
  // QR codes can reliably hold about 2,953 bytes of alphanumeric data
  // But for URLs, we should stay under 2KB for broad compatibility
  return encoded.length > 2000;
}

/**
 * Estimate the size of the share data in bytes
 */
export function getEncodedSize(data: ShareData): number {
  const encoded = encodeShareData(data);
  return encoded.length;
}
