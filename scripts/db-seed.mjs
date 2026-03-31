import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;

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
      insert into dim_zone (zone_id, zone_name, zone_group, sort_order)
      values ($1, $2, $3, $4)
      on conflict (zone_id) do update
      set zone_name = excluded.zone_name,
          zone_group = excluded.zone_group,
          sort_order = excluded.sort_order
      `,
      [row.zone_id, row.zone_name, row.zone_group, Number(row.sort_order)]
    );
  }
}

async function seedStations(client) {
  await client.query(
    `
    insert into dim_station (
      station_id, station_name, line_name, operator_name, address, city_do, sigungu, zone_id
    )
    values (
      'sangil-5-551', '상일동역', '5호선', '서울교통공사', '서울특별시 강동구 상일동',
      '서울특별시', '강동구', 'seoul-east-southeast'
    )
    on conflict (station_id) do update
    set station_name = excluded.station_name,
        line_name = excluded.line_name,
        operator_name = excluded.operator_name,
        address = excluded.address,
        city_do = excluded.city_do,
        sigungu = excluded.sigungu,
        zone_id = excluded.zone_id
    `
  );
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL is not configured. Skipping seed in local/sample mode.");
    return;
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await seedZones(client);
  await seedStations(client);
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
