# Live source check

- Checked at: `2026-03-31`
- Seoul daily ridership: `ok`
- MOLIT OD: `ok`

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
- Status: `ok`
- Source: `getDailyODUsageforGeneralBusesandUrbanRailways`
- Query params: `{'opr_ymd': '20250301', 'dptre_ctpv_cd': '11', 'dptre_sgg_cd': '11740', 'arvl_ctpv_cd': '11', 'arvl_sgg_cd': '11680'}`
- Total count: `115`
- Granularity: `sgg-filtered response with emd-level origin/destination fields`
- Station-level supported: `False`

```json
[
  {
    "opr_ymd": "20250301",
    "dow_cd": "7",
    "dow_nm": "토요일",
    "dptre_ctpv_cd": "11",
    "dptre_ctpv_nm": "서울특별시",
    "dptre_sgg_cd": "11740",
    "dptre_sgg_nm": "강동구",
    "dptre_emd_cd": "1174010100",
    "dptre_emd_nm": "명일동",
    "arvl_ctpv_cd": "11",
    "arvl_ctpv_nm": "서울특별시",
    "arvl_sgg_cd": "11680",
    "arvl_sgg_nm": "강남구",
    "arvl_emd_cd": "1168010100",
    "arvl_emd_nm": "역삼동",
    "trfvlm": 252,
    "pasg_hr_sum": 645331,
    "pasg_dstnc_sum": 3245523
  },
  {
    "opr_ymd": "20250301",
    "dow_cd": "7",
    "dow_nm": "토요일",
    "dptre_ctpv_cd": "11",
    "dptre_ctpv_nm": "서울특별시",
    "dptre_sgg_cd": "11740",
    "dptre_sgg_nm": "강동구",
    "dptre_emd_cd": "1174010100",
    "dptre_emd_nm": "명일동",
    "arvl_ctpv_cd": "11",
    "arvl_ctpv_nm": "서울특별시",
    "arvl_sgg_cd": "11680",
    "arvl_sgg_nm": "강남구",
    "arvl_emd_cd": "1168010300",
    "arvl_emd_nm": "개포동",
    "trfvlm": 22,
    "pasg_hr_sum": 72000,
    "pasg_dstnc_sum": 293825
  },
  {
    "opr_ymd": "20250301",
    "dow_cd": "7",
    "dow_nm": "토요일",
    "dptre_ctpv_cd": "11",
    "dptre_ctpv_nm": "서울특별시",
    "dptre_sgg_cd": "11740",
    "dptre_sgg_nm": "강동구",
    "dptre_emd_cd": "1174010100",
    "dptre_emd_nm": "명일동",
    "arvl_ctpv_cd": "11",
    "arvl_ctpv_nm": "서울특별시",
    "arvl_sgg_cd": "11680",
    "arvl_sgg_nm": "강남구",
    "arvl_emd_cd": "1168010400",
    "arvl_emd_nm": "청담동",
    "trfvlm": 56,
    "pasg_hr_sum": 145916,
    "pasg_dstnc_sum": 750932
  }
]
```

## MOLIT / OD 15-minute
- Status: `ok`
- Source: `getGeneralBusandUrbanRailwaysODUsageby15MinuteIntervals`
- Query params: `{'opr_ymd': '20250301', 'dptre_ctpv_cd': '11', 'dptre_sgg_cd': '11740', 'arvl_ctpv_cd': '11', 'arvl_sgg_cd': '11680', 'tzon': '07', 'qtrp': '1'}`
- Total count: `187`
- Granularity: `sgg-filtered response with emd-level origin/destination fields and 15-minute buckets`
- Station-level supported: `False`

```json
[
  {
    "opr_ymd": "20250301",
    "dow_cd": "7",
    "dow_nm": "토요일",
    "dptre_ctpv_cd": "11",
    "dptre_ctpv_nm": "서울특별시",
    "dptre_sgg_cd": "11740",
    "dptre_sgg_nm": "강동구",
    "dptre_emd_cd": "1174010100",
    "dptre_emd_nm": "명일동",
    "arvl_ctpv_cd": "11",
    "arvl_ctpv_nm": "서울특별시",
    "arvl_sgg_cd": "11680",
    "arvl_sgg_nm": "강남구",
    "arvl_emd_cd": "1168010100",
    "arvl_emd_nm": "역삼동",
    "tzon": "07",
    "qtrp": "45",
    "pasg_nope": 1,
    "pasg_cnt": 1,
    "avg_pasg_hr": 2041,
    "avg_pasg_dstnc": 10500
  },
  {
    "opr_ymd": "20250301",
    "dow_cd": "7",
    "dow_nm": "토요일",
    "dptre_ctpv_cd": "11",
    "dptre_ctpv_nm": "서울특별시",
    "dptre_sgg_cd": "11740",
    "dptre_sgg_nm": "강동구",
    "dptre_emd_cd": "1174010100",
    "dptre_emd_nm": "명일동",
    "arvl_ctpv_cd": "11",
    "arvl_ctpv_nm": "서울특별시",
    "arvl_sgg_cd": "11680",
    "arvl_sgg_nm": "강남구",
    "arvl_emd_cd": "1168010300",
    "arvl_emd_nm": "개포동",
    "tzon": "07",
    "qtrp": "00",
    "pasg_nope": 1,
    "pasg_cnt": 1,
    "avg_pasg_hr": 2181,
    "avg_pasg_dstnc": 12100
  },
  {
    "opr_ymd": "20250301",
    "dow_cd": "7",
    "dow_nm": "토요일",
    "dptre_ctpv_cd": "11",
    "dptre_ctpv_nm": "서울특별시",
    "dptre_sgg_cd": "11740",
    "dptre_sgg_nm": "강동구",
    "dptre_emd_cd": "1174010100",
    "dptre_emd_nm": "명일동",
    "arvl_ctpv_cd": "11",
    "arvl_ctpv_nm": "서울특별시",
    "arvl_sgg_cd": "11680",
    "arvl_sgg_nm": "강남구",
    "arvl_emd_cd": "1168010500",
    "arvl_emd_nm": "삼성동",
    "tzon": "07",
    "qtrp": "00",
    "pasg_nope": 1,
    "pasg_cnt": 1,
    "avg_pasg_hr": 2045,
    "avg_pasg_dstnc": 12600
  }
]
```
