const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { processImage } = require("D:\\malazone (2)\\malazone\\utils\\imageProcessor.js");

(async () => {
  const input = await sharp({
    create: { width: 1600, height: 1000, channels: 3, background: { r: 200, g: 220, b: 240 } },
  }).png().toBuffer();

  const url = await processImage(input, {
    watermark: { name: "ተስፋዬ አበበ / Tesfaye Abebe", brand: "MALAZONE", opacity: 0.1 },
  });
  const outPath = path.join("D:\\malazone (2)\\malazone\\public", url);
  console.log("url:", url);
  console.log("exists:", fs.existsSync(outPath));
  const meta = await sharp(outPath).metadata();
  console.log("format:", meta.format, "w:", meta.width, "h:", meta.height);

  const plain = await processImage(input);
  console.log("plain url:", plain);

  fs.unlinkSync(outPath);
  fs.unlinkSync(path.join("D:\\malazone (2)\\malazone\\public", plain));
  console.log("cleaned up");
})().catch((e) => { console.error("FAILED:", e); process.exit(1); });