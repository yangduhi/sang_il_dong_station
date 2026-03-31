create or replace view vw_living_zone_od_daily_latest as
select
  service_date,
  direction,
  focus_ctpv_cd,
  focus_sgg_cd,
  focus_emd_name,
  aggregation_level,
  target_zone_id,
  target_label,
  target_ctpv_cd,
  target_sgg_cd,
  top_context_label,
  passenger_count,
  share_pct,
  source_name,
  is_verified_snapshot,
  loaded_at
from (
  select
    *,
    row_number() over (
      partition by service_date, direction, aggregation_level, target_label
      order by is_verified_snapshot asc, loaded_at desc
    ) as row_rank
  from fact_living_zone_od_daily
) ranked
where row_rank = 1;

create or replace view vw_living_zone_od_15min_latest as
select
  service_date,
  direction,
  focus_ctpv_cd,
  focus_sgg_cd,
  focus_emd_name,
  aggregation_level,
  reference_zone_id,
  reference_label,
  hour_bucket,
  passenger_count,
  source_name,
  is_verified_snapshot,
  loaded_at,
  reference_sgg_cd
from (
  select
    *,
    row_number() over (
      partition by service_date, direction, aggregation_level, reference_label, hour_bucket
      order by is_verified_snapshot asc, loaded_at desc
    ) as row_rank
  from fact_living_zone_od_15min
) ranked
where row_rank = 1;
