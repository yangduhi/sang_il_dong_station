create or replace view vw_station_trend_daily as
select
  service_date,
  station_id,
  ride_count,
  alight_count,
  total_count,
  source_name,
  loaded_at
from fact_station_daily;

create or replace view vw_station_hourly_profile as
select
  service_date,
  hour_bucket,
  station_id,
  ride_count,
  alight_count,
  source_name,
  loaded_at
from fact_station_hourly;

create or replace view vw_sangildong_origin_to_zone as
select
  f.service_date,
  z.zone_name,
  sum(f.passenger_count) as passenger_count
from fact_od_daily f
join dim_zone z on z.zone_id = f.destination_zone_id
where f.origin_station_id = 'sangil-5-551'
group by 1, 2;

create or replace view vw_zone_to_sangildong_destination as
select
  f.service_date,
  z.zone_name,
  sum(f.passenger_count) as passenger_count
from fact_od_daily f
join dim_zone z on z.zone_id = f.origin_zone_id
where f.destination_station_id = 'sangil-5-551'
group by 1, 2;
