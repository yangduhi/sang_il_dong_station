alter table if exists fact_living_zone_od_15min
  add column if not exists reference_sgg_cd text;

create index if not exists idx_living_zone_od_daily_aggregation_target
  on fact_living_zone_od_daily (aggregation_level, target_sgg_cd, service_date desc);

create index if not exists idx_living_zone_od_15min_aggregation_target
  on fact_living_zone_od_15min (aggregation_level, reference_sgg_cd, hour_bucket, service_date desc);
