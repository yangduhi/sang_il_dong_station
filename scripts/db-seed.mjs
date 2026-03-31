import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";
import { createPgConfig } from "./create-pg-config.mjs";
import { loadScriptEnv } from "./load-env.mjs";

const { Client } = pg;

loadScriptEnv();

function csvToRows(csv) {
  const [headerLine, ...dataLines] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  return dataLines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
}

async function seedZones(client) {
  const csv = await fs.readFile(path.join(process.cwd(), "db", "seeds", "zone_mapping.csv"), "utf8");
  const rows = csvToRows(csv);
  for (const row of rows) {
    await client.query(
      `
      insert into public.dim_zone (zone_id, zone_name, zone_group, sort_order)
      values ($1, $2, $3, $4)
      on conflict (zone_id) do update
      set zone_name = excluded.zone_name,
          zone_group = excluded.zone_group,
          sort_order = excluded.sort_order
      `,
      [row.zone_id, row.zone_name, row.zone_group, Number(row.sort_order)]
    );
  }
  return rows.length;
}

async function seedStations(client) {
  await client.query(
    `
    insert into public.dim_station (
      station_id, station_name, line_name, operator_name, address, city_do, sigungu, zone_id
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8)
    on conflict (station_id) do update
    set station_name = excluded.station_name,
        line_name = excluded.line_name,
        operator_name = excluded.operator_name,
        address = excluded.address,
        city_do = excluded.city_do,
        sigungu = excluded.sigungu,
        zone_id = excluded.zone_id
    `,
    [
      "sangil-5-551",
      "상일동역",
      "5호선",
      "서울교통공사",
      "서울특별시 강동구 상일동",
      "서울특별시",
      "강동구",
      "seoul-east-southeast"
    ]
  );
  return 1;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL is not configured. Skipping seed in local/sample mode.");
    return;
  }

  const client = new Client(createPgConfig(process.env.DATABASE_URL));
  await client.connect();
  const zoneCount = await seedZones(client);
  const stationCount = await seedStations(client);
  await client.end();
  console.log(`Seeded ${zoneCount} zone mappings and ${stationCount} station row.`);
}

main().catch((error) => {
  console.error(`DB seed failed: ${error.message}`);
  process.exit(1);
});
