# Live source check

- Checked at: `2026-03-31`
- Seoul daily ridership: `ok`
- MOLIT OD: `not_yet_verified`

## Seoul daily ridership
- Source: `CardSubwayStatsNew`
- Probe date used: `20260327`
- Row count: `618`
- Line 5 rows: `56`
- Sangil-dong station found: `True`

```json
[
  {
    "USE_YMD": "20260327",
    "SBWY_ROUT_LN_NM": "5호선",
    "SBWY_STNS_NM": "상일동",
    "GTON_TNOPE": "17354",
    "GTOFF_TNOPE": "16224",
    "REG_YMD": "20260330"
  }
]
```

## MOLIT / OD
- Status: `not_yet_verified`
- Reason: The repository has not implemented a callable endpoint test for the MOLIT/data.go.kr OD API yet. Public STCIS docs currently expose a 15-minute regional OD dev endpoint, not a confirmed station-level OD contract for this project.
- Service key present: `True`
