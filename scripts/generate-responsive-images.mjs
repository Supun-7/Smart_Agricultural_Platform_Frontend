import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const inputDir = path.join(projectRoot, "src/assets/slides");
const outputDir = path.join(inputDir, "generated");

const TARGETS = [
  { suffix: "mobile", width: 960 },
  { suffix: "desktop", width: 1920 },
];

const FORMATS = ["jpg", "webp", "avif"];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function cleanGenerated(dir) {
  try {
    const files = await fs.readdir(dir);
    await Promise.all(files.map((f) => fs.rm(path.join(dir, f), { force: true })));
  } catch {
    // Directory may not exist on first run.
  }
}

async function buildVariant(inputPath, baseName, target, format) {
  const outName = `${baseName}-${target.suffix}.${format}`;
  const outPath = path.join(outputDir, outName);

  const pipeline = sharp(inputPath).rotate().resize({ width: target.width, withoutEnlargement: true });

  if (format === "jpg") {
    await pipeline.jpeg({ quality: 72, mozjpeg: true }).toFile(outPath);
  } else if (format === "webp") {
    await pipeline.webp({ quality: 70 }).toFile(outPath);
  } else if (format === "avif") {
    await pipeline.avif({ quality: 52 }).toFile(outPath);
  }
}

async function main() {
  await ensureDir(outputDir);
  await cleanGenerated(outputDir);

  const files = await fs.readdir(inputDir);
  const sourceJpgs = files.filter((f) => /\.(jpe?g)$/i.test(f));

  for (const file of sourceJpgs) {
    const inputPath = path.join(inputDir, file);
    const baseName = path.parse(file).name;

    for (const target of TARGETS) {
      for (const format of FORMATS) {
        await buildVariant(inputPath, baseName, target, format);
      }
    }
  }

  console.log(`Generated responsive slide assets in ${path.relative(projectRoot, outputDir)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
