import fs from "node:fs";
import path from "node:path";

const nextDir = path.join(process.cwd(), ".next");

try {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log("Removed .next build cache");
} catch (error) {
  console.warn("Failed to remove .next build cache", error);
}
