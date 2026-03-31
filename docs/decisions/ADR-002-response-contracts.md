# ADR-002: Structured response contracts

## Status
Accepted

## Decision

All read APIs return:

```json
{
  "data": {},
  "meta": {
    "sourceNames": [],
    "grainLabel": "",
    "lastLoadedAt": "",
    "dateRange": {
      "from": "",
      "to": ""
    },
    "limitations": [],
    "queryEcho": {}
  }
}
```

Errors return a typed envelope rather than free-form text.

## Consequences

- UI can reliably render limitations, freshness, and fallback state.
- Contract tests can validate both sample and live mode behavior.
