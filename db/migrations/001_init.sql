create table if not exists dim_zone (
  zone_id text primary key,
  zone_name text not null,
  zone_group text not null,
  sort_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dim_station (
  station_id text primary key,
  station_name text not null,
  line_name text not null,
  operator_name text not null,
  lat double precision,
  lng double precision,
  address text,
  city_do text,
  sigungu text,
  zone_id text references dim_zone(zone_id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dim_station_source_map (
  source_name text not null,
  source_station_code text,
  source_station_name text not null,
  source_line_name text,
  station_id text not null references dim_station(station_id),
  confidence numeric(5,2) not null default 1.00,
  note text,
  primary key (source_name, source_station_name, station_id)
);

create table if not exists fact_station_daily (
  service_date date not null,
  station_id text not null references dim_station(station_id),
  ride_count integer not null,
  alight_count integer not null,
  total_count integer not null,
  source_name text not null,
  loaded_at timestamptz not null default now(),
  primary key (service_date, station_id, source_name)
);

create table if not exists fact_station_hourly (
  service_date date not null,
  hour_bucket text not null,
  station_id text not null references dim_station(station_id),
  ride_count integer not null,
  alight_count integer not null,
  source_name text not null,
  loaded_at timestamptz not null default now(),
  primary key (service_date, hour_bucket, station_id, source_name)
);

create table if not exists fact_station_type_daily (
  service_date date not null,
  station_id text not null references dim_station(station_id),
  passenger_type text not null,
  ride_count integer not null,
  alight_count integer,
  transfer_in_count integer,
  source_name text not null,
  loaded_at timestamptz not null default now(),
  primary key (service_date, station_id, passenger_type, source_name)
);

create table if not exists fact_od_daily (
  service_date date not null,
  origin_key text not null,
  destination_key text not null,
  origin_type text not null,
  destination_type text not null,
  origin_station_id text references dim_station(station_id),
  destination_station_id text references dim_station(station_id),
  origin_zone_id text references dim_zone(zone_id),
  destination_zone_id text references dim_zone(zone_id),
  mode text not null,
  passenger_count integer not null,
  source_name text not null,
  grain_label text not null,
  loaded_at timestamptz not null default now(),
  primary key (service_date, origin_key, destination_key, source_name)
);

create table if not exists etl_job_runs (
  run_id text primary key,
  job_name text not null,
  source_name text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  status text not null,
  rows_extracted integer not null default 0,
  rows_transformed integer not null default 0,
  rows_loaded integer not null default 0,
  checksum text,
  params_json jsonb not null default '{}'::jsonb,
  error_message text
);

create table if not exists quarantine_station_unmatched (
  occurred_at timestamptz not null default now(),
  source_name text not null,
  raw_station_name text not null,
  raw_line_name text,
  raw_operator_name text,
  reason text not null,
  payload_json jsonb not null default '{}'::jsonb
);

create table if not exists quarantine_invalid_rows (
  occurred_at timestamptz not null default now(),
  source_name text not null,
  stage text not null,
  reason text not null,
  payload_json jsonb not null default '{}'::jsonb
);
