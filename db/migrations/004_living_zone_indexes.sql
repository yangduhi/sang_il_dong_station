create index if not exists idx_living_zone_od_daily_lookup
  on fact_living_zone_od_daily (direction, aggregation_level, service_date desc);

create index if not exists idx_living_zone_od_daily_target_zone
  on fact_living_zone_od_daily (target_zone_id, service_date desc);

create index if not exists idx_living_zone_od_15min_lookup
  on fact_living_zone_od_15min (direction, aggregation_level, service_date desc, hour_bucket);

create index if not exists idx_living_zone_od_15min_reference_zone
  on fact_living_zone_od_15min (reference_zone_id, service_date desc, hour_bucket);
