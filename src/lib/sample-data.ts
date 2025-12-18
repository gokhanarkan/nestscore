import { db } from "./db";
import type { Property } from "@/types";

// Sample London properties with full assessment data
const sampleProperties: Omit<Property, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Modern 2-Bed in Hackney",
    postcode: "E8 1AB",
    address: "123 Mare Street, Hackney, London",
    price: 525000,
    agent: "Foxtons",
    coordinates: { lat: 51.5454, lng: -0.0553 },
    notes: "Great location, close to Victoria Park. Second floor flat with balcony. Recently refurbished with modern kitchen.",
    answers: {
      // Location & Transport
      tube_distance: "5_10",
      bus_access: true,
      train_access: true,
      night_transport: true,
      parking: "permit",
      // Local Amenities
      supermarket: true,
      restaurants: "many",
      gym: true,
      parks: "large",
      healthcare: true,
      // Safety & Crime
      area_safety: "safe",
      street_lighting: true,
      cctv: true,
      secure_entry: true,
      night_activity: true,
      // Building & Structure
      building_age: "modern",
      damp_issues: "none",
      noise_insulation: "good",
      natural_light: "excellent",
      lift: "no_needed",
      // Utilities & Services
      heating_type: "gas_central",
      boiler_age: "new",
      water_pressure: "excellent",
      bills_included: "none",
      // Internet & Connectivity
      broadband_speed: "gigabit",
      fibre_available: true,
      mobile_signal: "excellent",
      // Energy Efficiency
      epc_rating: "b",
      double_glazing: true,
      insulation: true,
      smart_meter: true,
      // Interior & Space
      layout: "good",
      storage: "adequate",
      kitchen_quality: "modern",
      bathroom_quality: "modern",
      furnished: "unfurnished",
      // Outdoor Space
      private_outdoor: "small_balcony",
      communal_garden: false,
      roof_terrace: false,
      // Legal & Financial
      lease_length: "over_90",
      service_charge: 1800,
      ground_rent: 250,
      council_tax_band: "c",
    },
  },
  {
    name: "Victorian Flat in Islington",
    postcode: "N1 2XY",
    address: "45 Upper Street, Islington, London",
    price: 675000,
    agent: "Dexters",
    coordinates: { lat: 51.5384, lng: -0.1025 },
    notes: "Stunning period features, high ceilings (3m), original fireplaces. Needs some updating but great bones. Top floor with lots of light.",
    answers: {
      // Location & Transport
      tube_distance: "under_5",
      bus_access: true,
      train_access: true,
      night_transport: true,
      parking: "permit",
      // Local Amenities
      supermarket: true,
      restaurants: "many",
      gym: true,
      parks: "small",
      healthcare: true,
      // Safety & Crime
      area_safety: "very_safe",
      street_lighting: true,
      cctv: false,
      secure_entry: true,
      night_activity: true,
      // Building & Structure
      building_age: "maintained",
      damp_issues: "none",
      noise_insulation: "average",
      natural_light: "excellent",
      lift: "no",
      // Utilities & Services
      heating_type: "gas_central",
      boiler_age: "good",
      water_pressure: "good",
      bills_included: "none",
      // Internet & Connectivity
      broadband_speed: "ultrafast",
      fibre_available: true,
      mobile_signal: "excellent",
      // Energy Efficiency
      epc_rating: "d",
      double_glazing: false,
      insulation: false,
      smart_meter: false,
      // Interior & Space
      layout: "excellent",
      storage: "ample",
      kitchen_quality: "basic",
      bathroom_quality: "good",
      furnished: "unfurnished",
      // Outdoor Space
      private_outdoor: "none",
      communal_garden: true,
      roof_terrace: false,
      // Legal & Financial
      lease_length: "80_90",
      service_charge: 1200,
      ground_rent: 150,
      council_tax_band: "d",
    },
  },
  {
    name: "New Build in Stratford",
    postcode: "E15 1BQ",
    address: "Olympic Village, Stratford, London",
    price: 450000,
    agent: "Knight Frank",
    coordinates: { lat: 51.5433, lng: -0.0137 },
    notes: "Brand new development near Westfield. 24hr concierge, gym and pool included. 15th floor with panoramic views of the Olympic Park.",
    answers: {
      // Location & Transport
      tube_distance: "under_5",
      bus_access: true,
      train_access: true,
      night_transport: true,
      parking: "private",
      // Local Amenities
      supermarket: true,
      restaurants: "many",
      gym: true,
      parks: "large",
      healthcare: true,
      // Safety & Crime
      area_safety: "very_safe",
      street_lighting: true,
      cctv: true,
      secure_entry: true,
      night_activity: true,
      // Building & Structure
      building_age: "new",
      damp_issues: "none",
      noise_insulation: "excellent",
      natural_light: "good",
      lift: "yes",
      // Utilities & Services
      heating_type: "communal",
      boiler_age: "new",
      water_pressure: "excellent",
      bills_included: "some",
      // Internet & Connectivity
      broadband_speed: "gigabit",
      fibre_available: true,
      mobile_signal: "excellent",
      // Energy Efficiency
      epc_rating: "a",
      double_glazing: true,
      insulation: true,
      smart_meter: true,
      // Interior & Space
      layout: "good",
      storage: "limited",
      kitchen_quality: "modern",
      bathroom_quality: "modern",
      furnished: "unfurnished",
      // Outdoor Space
      private_outdoor: "large_balcony",
      communal_garden: true,
      roof_terrace: true,
      // Legal & Financial
      lease_length: "over_90",
      service_charge: 3500,
      ground_rent: 400,
      council_tax_band: "c",
    },
  },
  {
    name: "Garden Flat in Brixton",
    postcode: "SW9 8QH",
    address: "78 Brixton Road, Brixton, London",
    price: 485000,
    agent: "Marsh & Parsons",
    coordinates: { lat: 51.4613, lng: -0.1156 },
    notes: "Ground floor conversion with private 40ft garden. Vibrant area, Brixton Village 5 min walk. Some noise from main road but double glazed.",
    answers: {
      // Location & Transport
      tube_distance: "5_10",
      bus_access: true,
      train_access: true,
      night_transport: true,
      parking: "street",
      // Local Amenities
      supermarket: true,
      restaurants: "many",
      gym: true,
      parks: "small",
      healthcare: true,
      // Safety & Crime
      area_safety: "mixed",
      street_lighting: true,
      cctv: false,
      secure_entry: false,
      night_activity: true,
      // Building & Structure
      building_age: "maintained",
      damp_issues: "minor",
      noise_insulation: "average",
      natural_light: "good",
      lift: "na",
      // Utilities & Services
      heating_type: "gas_central",
      boiler_age: "good",
      water_pressure: "good",
      bills_included: "none",
      // Internet & Connectivity
      broadband_speed: "ultrafast",
      fibre_available: true,
      mobile_signal: "good",
      // Energy Efficiency
      epc_rating: "c",
      double_glazing: true,
      insulation: true,
      smart_meter: false,
      // Interior & Space
      layout: "good",
      storage: "ample",
      kitchen_quality: "good",
      bathroom_quality: "good",
      furnished: "part",
      // Outdoor Space
      private_outdoor: "garden",
      communal_garden: false,
      roof_terrace: false,
      // Legal & Financial
      lease_length: "over_90",
      service_charge: 800,
      ground_rent: 100,
      council_tax_band: "b",
    },
  },
];

const SAMPLE_TAG = "__sample__";

export async function loadSampleProperties(): Promise<number> {
  const now = new Date();
  let count = 0;

  for (const property of sampleProperties) {
    await db.properties.add({
      ...property,
      notes: `${SAMPLE_TAG}\n${property.notes}`,
      createdAt: new Date(now.getTime() - count * 86400000), // Stagger creation dates
      updatedAt: now,
    } as Property);
    count++;
  }

  return count;
}

export async function removeSampleProperties(): Promise<number> {
  const allProperties = await db.properties.toArray();
  const samplesToRemove = allProperties.filter(
    (p) => p.notes?.startsWith(SAMPLE_TAG)
  );

  for (const sample of samplesToRemove) {
    if (sample.id) {
      await db.properties.delete(sample.id);
    }
  }

  return samplesToRemove.length;
}

export async function hasSampleProperties(): Promise<boolean> {
  const allProperties = await db.properties.toArray();
  return allProperties.some((p) => p.notes?.startsWith(SAMPLE_TAG));
}
