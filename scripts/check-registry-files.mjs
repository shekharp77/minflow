import { existsSync, readFileSync, statSync } from "node:fs";

const REGISTRY_FILE = "registry.json";
const failures = [];

const registry = JSON.parse(readFileSync(REGISTRY_FILE, "utf8"));

for (const item of registry.items ?? []) {
  for (const file of item.files ?? []) {
    const path = file.path;
    if (typeof path !== "string") continue;
    if (!existsSync(path) || !statSync(path).isFile()) {
      failures.push(`${item.name}: ${path}`);
    }
  }
}

if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log("All registry file paths exist.");
