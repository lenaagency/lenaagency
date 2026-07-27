/**
 * Export brand SVGs to PNG for email signatures.
 * Usage: node brand/export-pngs.mjs
 */
import { createRequire } from "module";
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "png");
mkdirSync(outDir, { recursive: true });

const jobs = [
  { file: "logo-email.svg", name: "logo-email", width: 360, density: 2 },
  { file: "logo-email.svg", name: "logo-email@2x", width: 720, density: 2 },
  { file: "logo-horizontal.svg", name: "logo-horizontal", width: 480, density: 2 },
  { file: "logo-horizontal-en.svg", name: "logo-horizontal-en", width: 420, density: 2 },
  { file: "logo-mark.svg", name: "logo-mark", width: 200, density: 2 },
  { file: "logo-mark.svg", name: "logo-mark-64", width: 64, density: 2 },
  { file: "logo-mark-coral.svg", name: "logo-mark-coral", width: 200, density: 2 },
  { file: "logo-mark-coral.svg", name: "logo-mark-coral-64", width: 64, density: 2 },
];

for (const job of jobs) {
  const svg = readFileSync(join(__dirname, job.file));
  const out = join(outDir, `${job.name}.png`);
  await sharp(svg, { density: 144 })
    .resize(job.width)
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log("wrote", out);
}

// Also copy email logo into public for hosting after deploy
const publicBrand = join(__dirname, "..", "public", "brand");
mkdirSync(publicBrand, { recursive: true });
for (const name of ["logo-email.png", "logo-mark-64.png", "logo-mark-coral-64.png"]) {
  const src = join(outDir, name);
  const dest = join(publicBrand, name);
  writeFileSync(dest, readFileSync(src));
  console.log("public", dest);
}

console.log("Done.");
