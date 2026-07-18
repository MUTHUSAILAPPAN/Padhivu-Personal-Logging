# Padhivu

**Padhivu** (Tamil for *Record* / *Log*) is a local-first personal logging PWA designed to give you complete ownership of your data. The source of truth for all logged entries, tasks, memories, and collections is a standard Excel workbook (`.xlsx`) stored locally on your device.

---

## Architecture: Local-First & Single File Source of Truth

Unlike traditional applications that persist logs to cloud databases or servers, Padhivu operates **purely in the client browser environment**.

```
┌──────────────────┐               ┌────────────────────┐
│                  │  Load File    │                    │
│  Excel Workbook  ├──────────────>│  Padhivu UI (PWA)  │
│  (.xlsx on disk) │               │  (React Memory)    │
│                  │<──────────────┤                    │
└──────────────────┘  Save/Export  └────────────────────┘
```

### Key Pillars
- **Zero Server Footprint**: No servers, no APIs, no analytics tracking, and no external tracking telemetry.
- **Excel as Database**: SheetJS (`xlsx`) parses and serializes data tables (Daily Logs, Expenses, Tasks, Memories, Collections) from worksheets directly.
- **Session-Based Lifespan**: Data lives in React component state / transient browser storage during active usage. To persist changes permanently, users download the updated workbook file to overwrite their local source of truth.
- **Offline Capabilities**: Full PWA offline caching powered by `vite-plugin-pwa`.

---

## Directory Structure

We use a feature-based folder architecture to isolate components, logic, and models by module:

```
src/
 ├── assets/          # Static logos, graphics, and styles
 ├── components/
 │    ├── layout/     # Shared layouts (AppShell, LandingPage, NotFoundPage)
 │    └── ui/         # Reusable accessible UI components (Buttons, Inputs)
 ├── features/        # Feature domains containing views and components
 │    ├── dashboard/  # Main hub and analytics summaries
 │    ├── daily-log/  # Reflected daily records
 │    ├── expenses/   # Personal financial logs
 │    ├── tasks/      # Checklists and priorities
 │    ├── memories/   # Journaling and memories
 │    ├── collections/# Curated logs (books, movies, routines)
 │    └── modules/    # User-defined custom tracking schemas
 ├── hooks/           # Shared React custom hooks
 ├── routes/          # Router definitions (React Router v6+)
 ├── services/        # Service clients (SheetJS parser, LocalStorage trackers)
 │    ├── workbook/   # Workbook parser/converter routines
 │    ├── analytics/  # Trend computation algorithms
 │    └── storage/    # Browser storage helpers
 ├── types/           # System-wide TypeScript type definitions
 └── utils/           # Auxiliary formatting/date functions
```

---

## Technology Stack

- **Core Framework**: React 18 with TypeScript and Vite
- **Styling**: Tailwind CSS v4 (configured via theme variables in `src/index.css` and `@tailwindcss/vite`)
- **Routing**: React Router (`react-router-dom`)
- **Excel Utilities**: SheetJS (`xlsx`) for parsing/exporting sheets
- **Icons**: Lucide React
- **Validation**: React Hook Form & Zod
- **Analytics & Graphs**: Recharts & date-fns
- **Offline Support**: `vite-plugin-pwa`

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
Clone the repository and install dependencies:
```bash
npm install
```

### Running Locally (Development)
Start the Vite local dev server:
```bash
npm run dev
```

### Building for Production
Verify compilation and package the client-side bundle:
```bash
npm run build
```
This builds static assets under the `dist/` directory, which can be deployed to any static host (GitHub Pages, Netlify, Vercel, or hosted locally offline).
