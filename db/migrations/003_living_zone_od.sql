create table if not exists fact_living_zone_od_daily (
  service_date date not null,
  direction text not null,
  focus_ctpv_cd text not null,
  focus_sgg_cd text not null,
  focus_emd_name text not null,
  aggregation_level text not null,
  target_zone_id text references dim_zone(zone_id),
  target_label text not null,
  target_ctpv_cd text,
  target_sgg_cd text,
  top_context_label text not null,
  passenger_count integer not null,
  share_pct numeric(6,2) not null default 0,
  source_name text not null,
  is_verified_snapshot boolean not null default false,
  loaded_at timestamptz not null default now(),
  primary key (service_date, direction, aggregation_level, target_label, source_name)
);

create table if not exists fact_living_zone_od_15min (
  service_date date not null,
  direction text not null,
  focus_ctpv_cd text not null,
  focus_sgg_cd text not null,
  focus_emd_name text not null,
  aggregation_level text not null,
  reference_zone_id text references dim_zone(zone_id),
  reference_label text not null,
  hour_bucket text not null,
  passenger_count integer not null,
  source_name text not null,
  is_verified_snapshot boolean not null default false,
  loaded_at timestamptz not null default now(),
  primary key (service_date, direction, aggregation_level, reference_label, hour_bucket, source_name)
);
