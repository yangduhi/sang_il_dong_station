# Known limitations

- `local/sample` mode is still the default runtime because it provides a deterministic fallback path.
- The verified public OD API is **area-based** (`시군구/읍면동`) and not station-based, so it cannot directly answer `상일동역 -> 도착역` questions.
- The current dashboard intentionally mixes `역 단위 승하차` and `생활권 기반 OD`, so users must not read the two sections as the same granularity.
- Live station-hourly ridership is not yet connected. The current live implementation prioritizes daily station ridership plus living-zone OD.
- Postgres migrations and seeds are present, but Postgres is not yet the primary runtime path.
