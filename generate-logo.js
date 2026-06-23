
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const ICON_DIR = path.join(__dirname, 'extension', 'icons');

if (!fs.existsSync(ICON_DIR)) {
  fs.mkdirSync(ICON_DIR, { recursive: true });
}

const sizes = [16, 48, 128];

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#4f46e5');
  gradient.addColorStop(0.5, '#7c3aed');
  gradient.addColorStop(1, '#8b5cf6');
  
  // Rounded rectangle background
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Draw lightning bolt icon
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  
  const centerX = size / 2;
  const centerY = size / 2;
  const boltWidth = size * 0.35;
  const boltHeight = size * 0.5;
  
  ctx.beginPath();
  ctx.moveTo(centerX + boltWidth * 0.15, centerY - boltHeight * 0.45);
  ctx.lineTo(centerX - boltWidth * 0.35, centerY);
  ctx.lineTo(centerX - boltWidth * 0.05, centerY);
  ctx.lineTo(centerX - boltWidth * 0.15, centerY + boltHeight * 0.45);
  ctx.lineTo(centerX + boltWidth * 0.35, centerY);
  ctx.lineTo(centerX + boltWidth * 0.05, centerY);
  ctx.closePath();
  ctx.fill();
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(ICON_DIR, `icon${size}.png`), buffer);
  console.log(`✅ Generated icon${size}.png`);
}

sizes.forEach(generateIcon);
console.log('\n🎉 All icons generated successfully!');
