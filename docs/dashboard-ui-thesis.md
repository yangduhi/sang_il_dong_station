# Dashboard UI Thesis

## Scope

This document captures the Stage 8 dashboard UI direction for the Sangil-dong Station analytical desk. The surface is treated as an operator-facing analytical workspace, not a marketing landing page.

## Visual thesis

Nocturnal transit control room: deep navy structure, pale map light, disciplined typography, and one bright teal signal used to mark activity and readiness.

## Content plan

1. Command header
   Station identity, operating scope, fallback state, freshness, and current granularity are shown before any chart.
2. Map-first workspace
   The OD map is the dominant visual anchor. Mode switching and corridor inspection happen alongside the map, not in disconnected summary cards.
3. Evidence band
   Ridership trend and data-quality contract sit side by side so flow interpretation and data trust can be checked in the same scan.
4. Operating guide
   Hourly pattern and reading guidance close the page with concrete interpretation rules instead of promotional copy.

## Interaction thesis

- A short staged entrance reveal gives the page presence without slowing scanning.
- The outbound / inbound OD mode switch changes the emotional center of the page by recoloring and rerouting the map arcs.
- Continuous but restrained sweep and pulse motion keep the map surface feeling live while preserving readability on desktop and mobile.

## Implementation notes

- Typography uses `Noto Sans KR` for UI copy and `Space Grotesk` for display hierarchy.
- Hero-card patterns were removed in favor of one command header plus section-level analytical panels.
- OD inspection moved closer to the map through a dedicated side rail with selected-flow stats and top-corridor controls.
- Utility copy now favors orientation, scope, freshness, and cautions over aspirational dashboard language.

## Verification snapshot

Verified on 2026-03-31 (Asia/Seoul) with:

- `npx pnpm@10.8.1 lint`
- `npx pnpm@10.8.1 typecheck`
- `npx pnpm@10.8.1 test`
- `.\.venv\Scripts\python.exe -m pytest`
- `npx pnpm@10.8.1 build`
- `powershell -ExecutionPolicy Bypass -File .\scripts\preflight.ps1`
- `powershell -ExecutionPolicy Bypass -File .\scripts\verify.ps1`
- `npx pnpm@10.8.1 test:e2e`

All commands passed after updating the browser test to match the new command-header heading.

## Open risks

- The OD map still relies on fallback polygon placement for non-curated granularities, so future `sgg` expansion may need denser label management.
- Google font delivery is now part of the runtime build path; if the deployment environment restricts external font fetches, a local font strategy may be needed.
- The page intentionally exposes grain mismatch and fallback status, but operators still need data literacy around station-grain ridership versus living-zone OD.
