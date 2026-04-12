import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");
const exts = new Set([".js", ".css", ".svg", ".html"]);

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return listFiles(full);
      return full;
    })
  );
  return files.flat();
}

async function compressFile(filePath) {
  const buf = await fs.readFile(filePath);
  const gz = zlib.gzipSync(buf, { level: 9 });
  const br = zlib.brotliCompressSync(buf, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
    },
  });

  await fs.writeFile(`${filePath}.gz`, gz);
  await fs.writeFile(`${filePath}.br`, br);
}

async function main() {
  const files = await listFiles(distDir);
  const targets = files.filter((f) => exts.has(path.extname(f)) && !f.endsWith(".gz") && !f.endsWith(".br"));

  await Promise.all(targets.map(compressFile));
  console.log(`Precompressed ${targets.length} files with gzip and brotli`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
