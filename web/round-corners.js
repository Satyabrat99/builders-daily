const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = path.join(__dirname, 'public', 'favicon-bg');
const outputDir = path.join(__dirname, 'public', 'favicon-rounded');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png'));

async function processImages() {
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    
    // Get image dimensions
    const metadata = await sharp(inputPath).metadata();
    const size = metadata.width;
    
    // Calculate border radius (e.g., 20% of the size)
    const rx = Math.round(size * 0.22);
    const ry = Math.round(size * 0.22);
    
    // Create an SVG mask with rounded corners
    const roundedCorners = Buffer.from(
      `<svg><rect x="0" y="0" width="${size}" height="${size}" rx="${rx}" ry="${ry}"/></svg>`
    );
    
    try {
      await sharp(inputPath)
        .composite([{
          input: roundedCorners,
          blend: 'dest-in'
        }])
        .toFile(outputPath);
      console.log(`Processed ${file}`);
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  }
  
  // Copy non-png files
  const nonPngFiles = fs.readdirSync(inputDir).filter(f => !f.endsWith('.png'));
  for (const file of nonPngFiles) {
    fs.copyFileSync(path.join(inputDir, file), path.join(outputDir, file));
    console.log(`Copied ${file}`);
  }
}

processImages().catch(console.error);
