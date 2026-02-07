# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

- `npm install` — install dependencies
- `npm run dev` — start Vite dev server on localhost:3000
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build locally

There are no test or lint commands configured.

## Architecture

Single-page React app (React 19, TypeScript, Vite) that bulk-edits Onshape part properties via CSV upload. No backend — all Onshape API calls happen directly from the browser using HMAC-SHA256 authentication.

### Workflow

1. User enters Onshape API keys (access + secret) in `OnshapeConfig`
2. User either uploads a CSV or downloads all parts from their Onshape account
3. User maps CSV columns to Onshape properties via dropdowns in `DataTable`
4. User clicks Sync — each row updates in parallel via `Promise.allSettled()`

### Key Files

- **`App.tsx`** — Main component, holds all application state (headers, parsedRows, columnMap, onshapeConfig, sync status)
- **`services/onshapeService.ts`** — Onshape API integration: fetches documents/elements/metadata, updates part properties
- **`utils/onshapeAPI.ts`** — HMAC-SHA256 request signing using Web Crypto API
- **`utils/csvParser.ts`** — CSV parsing (basic comma-split, no quoted value handling)
- **`constants.ts`** — Onshape property names, property ID map, and the identifier column name
- **`types.ts`** — Core types: `ParsedRow`, `ColumnMap`, `OnshapeConfig`, `UpdateStatus` enum

### Onshape API Details

Authentication uses HMAC-SHA256 signatures (nonce + date + method + path). The property ID map in `constants.ts` maps human-readable names (Name, Description, Part Number, Revision, State) to Onshape's internal property IDs. Only these five properties are updatable via the metadata endpoint — Material, Weight, etc. are read-only or require different APIs.

### Styling

Tailwind CSS loaded via CDN in `index.html`. Dark theme (gray-900 background). No local Tailwind config — classes used directly in components.
