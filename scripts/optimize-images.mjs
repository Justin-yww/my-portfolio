#!/usr/bin/env node
/**
 * One-shot image optimization for the static portfolio.
 * Generates WebP variants + JPEG fallbacks, and rasterizes logo SVGs to PNG.
 */
import { readdir, unlink, mkdir, rm } from "node:fs/promises";
import { join, parse, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const IMG_DIR = join(__dirname, "..", "assets", "img");

const SKIP = new Set([
  "favicon-32.png",
  "apple-touch-icon.png",
  "img_logo.png",
]);

const PHOTO_WIDTHS = [400, 800, 1200];
const WEBP_QUALITY = 78;
const JPEG_QUALITY = 80;
const LOGO_WIDTH = 360;
const PROFILE_WIDTH = 560;

function baseName(filename) {
  return parse(filename).name;
}

async function optimizePhoto(srcPath, name, isProfile) {
  const widths = isProfile ? [PROFILE_WIDTH] : PHOTO_WIDTHS;
  const jpegW = isProfile ? PROFILE_WIDTH : 1200;

  for (const w of widths) {
    const out = join(IMG_DIR, `${name}-${w}.webp`);
    await sharp(srcPath)
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toFile(out);
    console.log(`  webp  ${name}-${w}.webp`);
  }

  // Write JPEG fallback to a distinct temp name first (macOS is
  // case-insensitive: Foo.JPG and Foo.jpg are the same path).
  const jpegName = `${name}.jpg`;
  const jpegOut = join(IMG_DIR, jpegName);
  const tmpOut = join(IMG_DIR, `${name}.opt.tmp.jpg`);
  await sharp(srcPath)
    .rotate()
    .resize({ width: jpegW, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(tmpOut);

  const { rename, unlink } = await import("node:fs/promises");
  // If source collides with destination on case-insensitive FS, remove
  // the source path only after the temp file exists, then rename temp.
  try {
    await unlink(jpegOut);
  } catch {
    /* may not exist under that exact casing */
  }
  await rename(tmpOut, jpegOut);
  console.log(`  jpeg  ${jpegName}`);
}

async function optimizeLogo(srcPath, name) {
  const out = join(IMG_DIR, `${name}.png`);
  await sharp(srcPath, { density: 144 })
    .resize({ width: LOGO_WIDTH, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(out);
  console.log(`  png   ${name}.png`);
}

async function main() {
  const files = await readdir(IMG_DIR);

  const photoSources = files.filter((file) => {
    if (SKIP.has(file)) return false;
    if (file.startsWith("logo-")) return false;
    if (/-\d+\.(webp|jpg|jpeg|png)$/i.test(file)) return false;
    if (/\.webp$/i.test(file)) return false;
    // Masters: profile.* or img_*.{jpeg,jpg,JPG,png}
    return (
      /^profile\.(jpe?g|png)$/i.test(file) ||
      /^img_.+\.(jpe?g|png)$/i.test(file)
    );
  });

  const logos = files.filter(
    (file) => file.startsWith("logo-") && file.endsWith(".svg")
  );

  console.log(`Optimizing ${photoSources.length} photos…`);
  const toRemove = [];

  for (const file of photoSources) {
    const clean = baseName(file);
    const srcPath = join(IMG_DIR, file);
    const isProfile = clean === "profile";

    console.log(`\n${file}`);
    try {
      await optimizePhoto(srcPath, clean, isProfile);
      // On case-insensitive FS, Foo.JPG and Foo.jpg are the same path —
      // do not delete the source after writing the .jpg fallback.
      const outJpg = `${clean}.jpg`;
      if (file.toLowerCase() !== outJpg.toLowerCase()) {
        toRemove.push(file);
      }
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
    }
  }

  console.log(`\nOptimizing ${logos.length} logos…`);
  for (const file of logos) {
    const clean = baseName(file);
    console.log(`\n${file}`);
    try {
      await optimizeLogo(join(IMG_DIR, file), clean);
      toRemove.push(file);
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
    }
  }

  console.log("\nCleaning original masters…");
  for (const file of toRemove) {
    try {
      await unlink(join(IMG_DIR, file));
      console.log(`  removed ${file}`);
    } catch {
      /* already gone */
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
