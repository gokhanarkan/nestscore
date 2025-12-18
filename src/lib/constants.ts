import type { Category } from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "location",
    name: "Location & Transport",
    icon: "MapPin",
    defaultWeight: 20,
    questions: [
      {
        id: "tube_distance",
        label: "Distance to nearest Tube station",
        type: "select",
        critical: true,
        options: [
          { value: "under_5", label: "Under 5 min walk", score: 100 },
          { value: "5_10", label: "5-10 min walk", score: 80 },
          { value: "10_15", label: "10-15 min walk", score: 60 },
          { value: "15_20", label: "15-20 min walk", score: 40 },
          { value: "over_20", label: "Over 20 min walk", score: 20 },
        ],
      },
      {
        id: "bus_access",
        label: "Bus stop within 5 min walk",
        type: "boolean",
      },
      {
        id: "train_access",
        label: "Overground/National Rail nearby",
        type: "boolean",
      },
      {
        id: "night_transport",
        label: "Night Tube/bus available",
        type: "boolean",
      },
      {
        id: "parking",
        label: "Parking availability",
        type: "select",
        options: [
          { value: "private", label: "Private parking included", score: 100 },
          { value: "permit", label: "Permit parking available", score: 70 },
          { value: "street", label: "Street parking only", score: 40 },
          { value: "none", label: "No parking", score: 20 },
        ],
      },
    ],
  },
  {
    id: "amenities",
    name: "Local Amenities",
    icon: "Store",
    defaultWeight: 15,
    questions: [
      {
        id: "supermarket",
        label: "Supermarket within 10 min walk",
        type: "boolean",
        critical: true,
      },
      {
        id: "restaurants",
        label: "Restaurants & cafes nearby",
        type: "select",
        options: [
          { value: "many", label: "Many options", score: 100 },
          { value: "some", label: "Some options", score: 70 },
          { value: "few", label: "Limited options", score: 40 },
          { value: "none", label: "None nearby", score: 10 },
        ],
      },
      {
        id: "gym",
        label: "Gym/fitness center nearby",
        type: "boolean",
      },
      {
        id: "parks",
        label: "Parks or green spaces",
        type: "select",
        options: [
          { value: "large", label: "Large park nearby", score: 100 },
          { value: "small", label: "Small park/garden nearby", score: 70 },
          { value: "distant", label: "Parks but not walkable", score: 30 },
          { value: "none", label: "No green spaces", score: 0 },
        ],
      },
      {
        id: "healthcare",
        label: "GP/medical facilities nearby",
        type: "boolean",
      },
    ],
  },
  {
    id: "safety",
    name: "Safety & Crime",
    icon: "Shield",
    defaultWeight: 15,
    questions: [
      {
        id: "area_safety",
        label: "How safe does the area feel?",
        type: "select",
        critical: true,
        options: [
          { value: "very_safe", label: "Very safe", score: 100 },
          { value: "safe", label: "Generally safe", score: 75 },
          { value: "mixed", label: "Mixed feelings", score: 50 },
          { value: "concerns", label: "Some concerns", score: 25 },
          { value: "unsafe", label: "Feels unsafe", score: 0 },
        ],
      },
      {
        id: "street_lighting",
        label: "Good street lighting",
        type: "boolean",
      },
      {
        id: "cctv",
        label: "CCTV in building/area",
        type: "boolean",
      },
      {
        id: "secure_entry",
        label: "Secure building entry",
        type: "boolean",
      },
      {
        id: "night_activity",
        label: "Area active at night (positive presence)",
        type: "boolean",
      },
    ],
  },
  {
    id: "building",
    name: "Building & Structure",
    icon: "Building2",
    defaultWeight: 15,
    questions: [
      {
        id: "building_age",
        label: "Building condition/age",
        type: "select",
        options: [
          { value: "new", label: "New build (< 5 years)", score: 100 },
          { value: "modern", label: "Modern (5-20 years)", score: 85 },
          { value: "maintained", label: "Older but well maintained", score: 70 },
          { value: "dated", label: "Dated but functional", score: 50 },
          { value: "poor", label: "Needs significant work", score: 20 },
        ],
      },
      {
        id: "damp_issues",
        label: "Any signs of damp/mould",
        type: "select",
        critical: true,
        options: [
          { value: "none", label: "None visible", score: 100 },
          { value: "minor", label: "Minor issues", score: 50 },
          { value: "significant", label: "Significant issues", score: 0 },
        ],
      },
      {
        id: "noise_insulation",
        label: "Noise insulation quality",
        type: "select",
        options: [
          { value: "excellent", label: "Excellent", score: 100 },
          { value: "good", label: "Good", score: 75 },
          { value: "average", label: "Average", score: 50 },
          { value: "poor", label: "Poor", score: 25 },
        ],
      },
      {
        id: "natural_light",
        label: "Natural light",
        type: "select",
        options: [
          { value: "excellent", label: "Bright & sunny", score: 100 },
          { value: "good", label: "Good natural light", score: 75 },
          { value: "average", label: "Average", score: 50 },
          { value: "poor", label: "Dark/limited light", score: 25 },
        ],
      },
      {
        id: "lift",
        label: "Lift available (if applicable)",
        type: "select",
        options: [
          { value: "yes", label: "Yes", score: 100 },
          { value: "no_needed", label: "No, but ground/1st floor", score: 80 },
          { value: "no", label: "No, higher floor", score: 30 },
          { value: "na", label: "N/A (house)", score: 100 },
        ],
      },
    ],
  },
  {
    id: "utilities",
    name: "Utilities & Services",
    icon: "Zap",
    defaultWeight: 10,
    questions: [
      {
        id: "heating_type",
        label: "Heating system",
        type: "select",
        options: [
          { value: "gas_central", label: "Gas central heating", score: 100 },
          { value: "electric", label: "Electric heating", score: 60 },
          { value: "storage", label: "Storage heaters", score: 50 },
          { value: "heat_pump", label: "Heat pump", score: 95 },
          { value: "communal", label: "Communal heating", score: 75 },
        ],
      },
      {
        id: "boiler_age",
        label: "Boiler condition",
        type: "select",
        options: [
          { value: "new", label: "New (< 5 years)", score: 100 },
          { value: "good", label: "Good condition", score: 75 },
          { value: "old", label: "Older but working", score: 50 },
          { value: "unknown", label: "Unknown", score: 40 },
        ],
      },
      {
        id: "water_pressure",
        label: "Water pressure",
        type: "select",
        options: [
          { value: "excellent", label: "Excellent", score: 100 },
          { value: "good", label: "Good", score: 75 },
          { value: "average", label: "Average", score: 50 },
          { value: "poor", label: "Poor", score: 25 },
        ],
      },
      {
        id: "bills_included",
        label: "Bills included in rent",
        type: "select",
        options: [
          { value: "all", label: "All bills included", score: 100 },
          { value: "some", label: "Some bills included", score: 70 },
          { value: "none", label: "No bills included", score: 50 },
        ],
      },
    ],
  },
  {
    id: "internet",
    name: "Internet & Connectivity",
    icon: "Wifi",
    defaultWeight: 10,
    questions: [
      {
        id: "broadband_speed",
        label: "Available broadband speed",
        type: "select",
        critical: true,
        options: [
          { value: "gigabit", label: "Gigabit (1000+ Mbps)", score: 100 },
          { value: "ultrafast", label: "Ultrafast (100-1000 Mbps)", score: 90 },
          { value: "superfast", label: "Superfast (30-100 Mbps)", score: 70 },
          { value: "standard", label: "Standard (10-30 Mbps)", score: 40 },
          { value: "slow", label: "Slow (< 10 Mbps)", score: 10 },
        ],
      },
      {
        id: "fibre_available",
        label: "Full fibre (FTTP) available",
        type: "boolean",
      },
      {
        id: "mobile_signal",
        label: "Mobile signal strength indoors",
        type: "select",
        options: [
          { value: "excellent", label: "Excellent", score: 100 },
          { value: "good", label: "Good", score: 75 },
          { value: "average", label: "Average", score: 50 },
          { value: "poor", label: "Poor", score: 25 },
        ],
      },
    ],
  },
  {
    id: "energy",
    name: "Energy Efficiency",
    icon: "Leaf",
    defaultWeight: 5,
    questions: [
      {
        id: "epc_rating",
        label: "EPC Rating",
        type: "select",
        options: [
          { value: "a", label: "A", score: 100 },
          { value: "b", label: "B", score: 85 },
          { value: "c", label: "C", score: 70 },
          { value: "d", label: "D", score: 55 },
          { value: "e", label: "E", score: 40 },
          { value: "f", label: "F", score: 20 },
          { value: "g", label: "G", score: 0 },
        ],
      },
      {
        id: "double_glazing",
        label: "Double/triple glazing",
        type: "boolean",
      },
      {
        id: "insulation",
        label: "Good insulation",
        type: "boolean",
      },
      {
        id: "smart_meter",
        label: "Smart meter installed",
        type: "boolean",
      },
    ],
  },
  {
    id: "interior",
    name: "Interior & Space",
    icon: "Sofa",
    defaultWeight: 5,
    questions: [
      {
        id: "layout",
        label: "Layout/floor plan",
        type: "select",
        options: [
          { value: "excellent", label: "Excellent, well designed", score: 100 },
          { value: "good", label: "Good, functional", score: 75 },
          { value: "average", label: "Average", score: 50 },
          { value: "awkward", label: "Awkward/poor", score: 25 },
        ],
      },
      {
        id: "storage",
        label: "Storage space",
        type: "select",
        options: [
          { value: "ample", label: "Ample storage", score: 100 },
          { value: "adequate", label: "Adequate", score: 70 },
          { value: "limited", label: "Limited", score: 40 },
          { value: "minimal", label: "Minimal/none", score: 10 },
        ],
      },
      {
        id: "kitchen_quality",
        label: "Kitchen quality",
        type: "select",
        options: [
          { value: "modern", label: "Modern, well equipped", score: 100 },
          { value: "good", label: "Good condition", score: 75 },
          { value: "basic", label: "Basic but functional", score: 50 },
          { value: "poor", label: "Needs updating", score: 25 },
        ],
      },
      {
        id: "bathroom_quality",
        label: "Bathroom quality",
        type: "select",
        options: [
          { value: "modern", label: "Modern, well finished", score: 100 },
          { value: "good", label: "Good condition", score: 75 },
          { value: "basic", label: "Basic but functional", score: 50 },
          { value: "poor", label: "Needs updating", score: 25 },
        ],
      },
      {
        id: "furnished",
        label: "Furnishing",
        type: "select",
        options: [
          { value: "furnished_good", label: "Furnished (good quality)", score: 90 },
          { value: "furnished_basic", label: "Furnished (basic)", score: 70 },
          { value: "part", label: "Part furnished", score: 60 },
          { value: "unfurnished", label: "Unfurnished", score: 50 },
        ],
      },
    ],
  },
  {
    id: "outdoor",
    name: "Outdoor Space",
    icon: "Trees",
    defaultWeight: 5,
    questions: [
      {
        id: "private_outdoor",
        label: "Private outdoor space",
        type: "select",
        options: [
          { value: "garden", label: "Private garden", score: 100 },
          { value: "large_balcony", label: "Large balcony/terrace", score: 85 },
          { value: "small_balcony", label: "Small balcony", score: 60 },
          { value: "juliet", label: "Juliet balcony only", score: 30 },
          { value: "none", label: "None", score: 10 },
        ],
      },
      {
        id: "communal_garden",
        label: "Communal garden access",
        type: "boolean",
      },
      {
        id: "roof_terrace",
        label: "Roof terrace access",
        type: "boolean",
      },
    ],
  },
  {
    id: "legal",
    name: "Legal & Financial",
    icon: "FileText",
    defaultWeight: 0,
    questions: [
      {
        id: "lease_length",
        label: "Lease length (if leasehold)",
        type: "select",
        options: [
          { value: "over_90", label: "Over 90 years", score: 100 },
          { value: "80_90", label: "80-90 years", score: 70 },
          { value: "70_80", label: "70-80 years", score: 40 },
          { value: "under_70", label: "Under 70 years", score: 10 },
          { value: "freehold", label: "Freehold", score: 100 },
        ],
      },
      {
        id: "service_charge",
        label: "Service charge (annual)",
        type: "slider",
        min: 0,
        max: 5000,
        step: 100,
        unit: "£",
      },
      {
        id: "ground_rent",
        label: "Ground rent (annual)",
        type: "slider",
        min: 0,
        max: 1000,
        step: 50,
        unit: "£",
      },
      {
        id: "council_tax_band",
        label: "Council tax band",
        type: "select",
        options: [
          { value: "a", label: "Band A", score: 100 },
          { value: "b", label: "Band B", score: 90 },
          { value: "c", label: "Band C", score: 80 },
          { value: "d", label: "Band D", score: 70 },
          { value: "e", label: "Band E", score: 60 },
          { value: "f", label: "Band F", score: 50 },
          { value: "g", label: "Band G", score: 40 },
          { value: "h", label: "Band H", score: 30 },
        ],
      },
    ],
  },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
