import fs from "node:fs";
import path from "node:path";
import jpeg from "jpeg-js";

const publicDir = path.join(process.cwd(), "public");

// 1. Flood Inundation Pair
try {
  const riverRaw = fs.readFileSync(path.join(publicDir, "sentinel2_sample.png"));
  const riverDecoded = jpeg.decode(riverRaw, { useTArray: true });
  const w = riverDecoded.width;
  const h = riverDecoded.height;

  // Clone for post-flood
  const postFloodBuf = Buffer.from(riverDecoded.data);

  // We detect river and low-lying floodplain and expand water inundation
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = postFloodBuf[idx];
      const g = postFloodBuf[idx + 1];
      const b = postFloodBuf[idx + 2];

      // Water condition in Sentinel-2 or low-lying basin
      const isWater = b > r && b > 60 && g < 150;
      // Proximity to river meandering belt (central horizontal/diagonal swath)
      const dx = x / w;
      const dy = y / h;
      const riverPath = 0.45 + 0.15 * Math.sin(dx * 6) + 0.08 * Math.cos(dx * 12);
      const distToRiver = Math.abs(dy - riverPath);

      // Flood expansion zone
      if (distToRiver < 0.14 || isWater) {
        // Deep muddy/silty floodwater inundation
        const blend = Math.max(0, 1 - distToRiver / 0.14);
        const floodR = Math.round(25 + 15 * Math.sin(x * 0.05));
        const floodG = Math.round(55 + 20 * Math.cos(y * 0.05));
        const floodB = Math.round(95 + 30 * Math.sin((x + y) * 0.03));

        postFloodBuf[idx] = Math.round(r * (1 - blend * 0.85) + floodR * (blend * 0.85));
        postFloodBuf[idx + 1] = Math.round(g * (1 - blend * 0.85) + floodG * (blend * 0.85));
        postFloodBuf[idx + 2] = Math.round(b * (1 - blend * 0.85) + floodB * (blend * 0.85));
      } else if (distToRiver < 0.22) {
        // Waterlogged soil / reduced NDVI zone
        const dampBlend = (0.22 - distToRiver) / 0.08;
        postFloodBuf[idx] = Math.round(r * (1 - dampBlend * 0.3) + 40 * dampBlend * 0.3);
        postFloodBuf[idx + 1] = Math.round(g * (1 - dampBlend * 0.4) + 60 * dampBlend * 0.4);
        postFloodBuf[idx + 2] = Math.round(b * (1 - dampBlend * 0.2) + 75 * dampBlend * 0.2);
      }
    }
  }

  const floodPostJpeg = jpeg.encode({ data: postFloodBuf, width: w, height: h }, 85);
  fs.writeFileSync(path.join(publicDir, "flood_post.jpg"), floodPostJpeg.data);

  // Pre-flood is the pristine river basin
  fs.copyFileSync(path.join(publicDir, "sentinel2_sample.png"), path.join(publicDir, "flood_pre.jpg"));
  console.log("Flood pair created successfully.");
} catch (err) {
  console.error("Flood pair error:", err);
}

// 2. Wildfire Burn Scar Pair
try {
  const wildfireRaw = fs.readFileSync(path.join(publicDir, "forest_wildfire.png"));
  const wildfireDecoded = jpeg.decode(wildfireRaw, { useTArray: true });
  const w = wildfireDecoded.width;
  const h = wildfireDecoded.height;

  // Pre-fire: Healthy lush green unburned forest canopy
  const preFireBuf = Buffer.from(wildfireDecoded.data);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = preFireBuf[idx];
      const g = preFireBuf[idx + 1];
      const b = preFireBuf[idx + 2];

      // If pixel looks charred or burned (dark reddish/brown or charcoal)
      const isBurned = (r > g && r > 50) || (r < 60 && g < 60 && b < 60);

      if (isBurned) {
        // Restore to dense forest canopy texture
        const noise = ((Math.sin(x * 0.15) * Math.cos(y * 0.15) + 1) * 0.5);
        const forestR = Math.round(35 + 25 * noise);
        const forestG = Math.round(110 + 45 * noise);
        const forestB = Math.round(45 + 20 * noise);

        preFireBuf[idx] = forestR;
        preFireBuf[idx + 1] = forestG;
        preFireBuf[idx + 2] = forestB;
      }
    }
  }

  const preFireJpeg = jpeg.encode({ data: preFireBuf, width: w, height: h }, 85);
  fs.writeFileSync(path.join(publicDir, "forest_pre.jpg"), preFireJpeg.data);
  fs.copyFileSync(path.join(publicDir, "forest_wildfire.png"), path.join(publicDir, "forest_post.jpg"));
  console.log("Wildfire pair created successfully.");
} catch (err) {
  console.error("Wildfire pair error:", err);
}

// 3. Seasonal Cropland Phenology Pair
try {
  const cropRaw = fs.readFileSync(path.join(publicDir, "sentinel2_hd.jpg"));
  const cropDecoded = jpeg.decode(cropRaw, { useTArray: true });
  // Crop to square 1200x1200
  const w = 1200;
  const h = 1200;
  const origW = cropDecoded.width;

  const postCropBuf = Buffer.alloc(w * h * 4);
  const preCropBuf = Buffer.alloc(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = (y * origW + x) * 4;
      const dstIdx = (y * w + x) * 4;

      const r = cropDecoded.data[srcIdx];
      const g = cropDecoded.data[srcIdx + 1];
      const b = cropDecoded.data[srcIdx + 2];

      postCropBuf[dstIdx] = r;
      postCropBuf[dstIdx + 1] = g;
      postCropBuf[dstIdx + 2] = b;
      postCropBuf[dstIdx + 3] = 255;

      // Early season (pre-growth): dry arable soil / tilled fields
      // Shift verdant green chlorophyll to golden arable loam/soil
      const isGreen = g > r && g > 70;
      if (isGreen) {
        const soilR = Math.min(255, Math.round(r * 1.5 + 40));
        const soilG = Math.round(g * 0.75 + 15);
        const soilB = Math.round(b * 0.6 + 10);
        preCropBuf[dstIdx] = soilR;
        preCropBuf[dstIdx + 1] = soilG;
        preCropBuf[dstIdx + 2] = soilB;
      } else {
        preCropBuf[dstIdx] = r;
        preCropBuf[dstIdx + 1] = g;
        preCropBuf[dstIdx + 2] = b;
      }
      preCropBuf[dstIdx + 3] = 255;
    }
  }

  const preCropJpeg = jpeg.encode({ data: preCropBuf, width: w, height: h }, 85);
  const postCropJpeg = jpeg.encode({ data: postCropBuf, width: w, height: h }, 85);

  fs.writeFileSync(path.join(publicDir, "crop_pre.jpg"), preCropJpeg.data);
  fs.writeFileSync(path.join(publicDir, "crop_post.jpg"), postCropJpeg.data);
  console.log("Crop phenology pair created successfully.");
} catch (err) {
  console.error("Crop phenology error:", err);
}
