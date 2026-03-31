# API response contracts

All major endpoints return:

```json
{
  "data": {},
  "meta": {
    "sourceNames": [],
    "grainLabel": "",
    "lastLoadedAt": "",
    "dateRange": { "from": "", "to": "" },
    "limitations": [],
    "queryEcho": {},
    "fallbackUsed": true
  }
}
```

Core endpoints:
- `/api/health`
- `/api/meta/zones`
- `/api/meta/stations`
- `/api/stations/[stationId]/overview`
- `/api/stations/[stationId]/hourly`
- `/api/od/origin-to-zone`
- `/api/od/zone-to-destination`
