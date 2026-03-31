import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL is not configured. Skipping migrations in local/sample mode.");
    return;
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const migrationDir = path.join(process.cwd(), "db", "migrations");
  const files = (await fs.readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationDir, file), "utf8");
    console.log(`Applying ${file}`);
    await client.query(sql);
  }

  const viewDir = path.join(process.cwd(), "db", "views");
  const viewFiles = (await fs.readdir(viewDir)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of viewFiles) {
    const sql = await fs.readFile(path.join(viewDir, file), "utf8");
    console.log(`Applying ${file}`);
    await client.query(sql);
  }

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
