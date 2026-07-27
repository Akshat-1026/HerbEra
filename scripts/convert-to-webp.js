import sharp from "sharp";
import { readdir } from "fs/promises";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const imagesDir = join(__dirname, "..", "frontend", "public", "images");
const quality = 80;

async function convert() {
  const files = await readdir(imagesDir);
  const jpgs = files.filter((f) => /\.jpe?g$/i.test(f));

  console.log(`Found ${jpgs.length} JPG images to convert...\n`);

  for (const file of jpgs) {
    const input = join(imagesDir, file);
    const output = join(imagesDir, file.replace(/\.jpe?g$/i, ".webp"));

    try {
      const before = (await import("fs")).statSync(input).size;
      await sharp(input).webp({ quality }).toFile(output);
      const after = (await import("fs")).statSync(output).size;
      const saved = ((1 - after / before) * 100).toFixed(1);
      console.log(`${file} -> ${file.replace(/\.jpe?g$/i, ".webp")} (${saved}% smaller)`);
    } catch (err) {
      console.error(`Failed: ${file} - ${err.message}`);
    }
  }

  console.log("\nDone! WebP images created alongside originals.");
}

convert();
