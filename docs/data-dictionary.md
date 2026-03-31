# Data dictionary

## Local/sample fixture fields

| source | field | type | meaning | target |
|---|---|---|---|---|
| ridership | serviceDate | string | service date | fact_station_daily.service_date |
| ridership | rideCount | integer | boardings | fact_station_daily.ride_count |
| ridership | alightCount | integer | alightings | fact_station_daily.alight_count |
| od | zoneName | string | analysis zone label | dim_zone.zone_name |
| od | passengerCount | integer | OD passenger volume | fact_od_daily.passenger_count |
| od | sharePct | number | share in view model | read model only |
| station_meta | stationId | string | canonical station id | dim_station.station_id |
| station_meta | operatorName | string | line operator | dim_station.operator_name |

## Contract-first meta fields

| field | meaning |
|---|---|
| sourceNames | data sources used for the response |
| grainLabel | station / zone / mixed-grain label |
| lastLoadedAt | freshest load timestamp |
| dateRange | effective time range |
| limitations | known caveats surfaced to API and UI |
| queryEcho | parsed query inputs |
