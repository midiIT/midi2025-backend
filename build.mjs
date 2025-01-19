import * as esbuild from "esbuild";
import { copyFile, rm, writeFile } from "node:fs/promises";

await esbuild.build({
  entryPoints: ["src/app.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "dist/bundle.js",
  packages: "external",
});

await rm("dist/database.sqlite", { force: true });
await copyFile("package.json", "dist/package.json");
await copyFile("pm2.config.cjs", "dist/pm2.config.cjs");

await writeFile(
  "dist/start_backend.sh",
  `#!/bin/sh
echo "Installing dependencies..."
npm install --omit=dev
echo "Starting the backend..."
pm2 start pm2.config.cjs
`,
);

await writeFile(
  "dist/.env",
  `NODE_ENV=production
PORT=8000
WEATHER_API_KEY=81279801d34470e5dbb037fabe491c60
`,
);

console.log("Build completed successfully");
