# Transformation rules

- Normalize station references to a canonical `station_id`.
- Preserve `grainLabel` instead of assuming station-to-station OD.
- Keep raw evidence separate from processed read-model fixtures.
- Route unmatched records to quarantine rather than silently dropping them.
- Expose fallback mode in API `meta` and UI quality panels.
