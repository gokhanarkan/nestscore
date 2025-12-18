# NestScore

A property evaluation tool for London house hunters. Score, compare, and track properties with a consistent framework.

## Features

- **Structured Evaluation**: 37 questions across 10 categories (Location, Amenities, Safety, Building, Utilities, Internet, Energy, Interior, Outdoor, Legal)
- **Weighted Scoring**: Customise category weights to match your priorities
- **Side-by-Side Comparison**: Compare up to 4 properties with category breakdowns
- **Map View**: Visualise all properties with score-coloured markers and work location radius
- **Offline-First**: All data stored locally in IndexedDB, works without internet
- **UK Postcode Validation**: Automatic geocoding via Postcodes.io API
- **Export/Import**: JSON backup and CSV export for spreadsheet analysis

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: TanStack Router (file-based)
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Data**: Dexie.js (IndexedDB wrapper)
- **Maps**: React Leaflet with OpenStreetMap tiles
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
src/
├── components/
│   ├── scoring/          # Score gauge, category sections
│   ├── ui/               # shadcn/ui components
│   └── visualization/    # Radar chart
├── hooks/
│   ├── use-properties.ts # Property CRUD operations
│   └── use-settings.ts   # Settings management
├── lib/
│   ├── constants.ts      # Category definitions & questions
│   ├── db.ts             # Dexie database setup
│   ├── export.ts         # CSV export utilities
│   ├── postcode.ts       # UK postcode validation
│   ├── sample-data.ts    # Sample London properties
│   └── scoring.ts        # Scoring algorithm
├── routes/
│   ├── __root.tsx        # Root layout with navigation
│   ├── index.tsx         # Home page
│   ├── compare.tsx       # Property comparison
│   ├── map.tsx           # Map view
│   ├── settings.tsx      # Settings & data management
│   └── properties/
│       ├── index.tsx     # Property list
│       ├── new.tsx       # Add new property
│       └── $id.tsx       # Property detail & evaluation
└── types/
    └── index.ts          # TypeScript interfaces
```

## Scoring System

Each question has predefined options with scores (0-100). Category scores are averaged from their questions, then the overall score is a weighted average of category scores.

Default category weights:
- Location & Transport: 20%
- Local Amenities: 15%
- Safety & Crime: 15%
- Building & Structure: 15%
- Utilities & Services: 10%
- Internet & Connectivity: 10%
- Energy Efficiency: 5%
- Interior & Space: 5%
- Outdoor Space: 5%
- Legal & Financial: 0% (informational only)

Weights are user-configurable in Settings.

## Sample Data

Load 4 sample London properties from Settings to explore the app:
- Modern 2-Bed in Hackney (£525k)
- Victorian Flat in Islington (£675k)
- New Build in Stratford (£450k)
- Garden Flat in Brixton (£485k)

Each comes with all 37 questions pre-filled.

## Data Privacy

All property data is stored locally in your browser's IndexedDB. No data is sent to external servers (except postcode validation requests to Postcodes.io and map tile requests to OpenStreetMap).

## Scripts

```bash
bun run dev       # Start dev server
bun run build     # Type-check and build
bun run preview   # Preview production build
bun run lint      # Run ESLint
```

## Browser Support

Modern browsers with IndexedDB support (Chrome, Firefox, Safari, Edge).

## Licence

MIT
