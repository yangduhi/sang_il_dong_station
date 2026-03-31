const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
const endpoints = [
  "/api/health",
  "/api/meta/zones",
  "/api/stations/sangil-5-551/overview",
  "/api/od/origin-to-zone?stationName=%EC%83%81%EC%9D%BC%EB%8F%99%EC%97%AD"
];

async function main() {
  for (const endpoint of endpoints) {
    const response = await fetch(`${baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Smoke check failed for ${endpoint}: ${response.status}`);
    }
    const body = await response.json();
    console.log(`${endpoint} -> ok (${Object.keys(body).join(", ")})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
