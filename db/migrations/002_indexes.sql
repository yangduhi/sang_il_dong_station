create index if not exists idx_fact_station_daily_station_date on fact_station_daily (station_id, service_date);
create index if not exists idx_fact_station_hourly_station_date on fact_station_hourly (station_id, service_date, hour_bucket);
create index if not exists idx_fact_od_daily_origin_station_date on fact_od_daily (origin_station_id, service_date);
create index if not exists idx_fact_od_daily_destination_station_date on fact_od_daily (destination_station_id, service_date);
create index if not exists idx_fact_od_daily_origin_zone_date on fact_od_daily (origin_zone_id, service_date);
create index if not exists idx_fact_od_daily_destination_zone_date on fact_od_daily (destination_zone_id, service_date);
