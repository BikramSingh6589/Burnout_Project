
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'extension', 'icons');

if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 48, 128];

function drawIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background gradient (purple to indigo)
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, Math.max(2, size * 0.125));
    ctx.fill();
    
    // Draw flame/burst icon
    ctx.save();
    ctx.translate(size * 0.5, size * 0.52);
    
    // Main flame
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    const r = size * 0.22;
    ctx.moveTo(0, -r * 1.2);
    ctx.bezierCurveTo(r * 0.8, -r * 0.6, r * 0.9, r * 0.3, r * 0.5, r * 0.6);
    ctx.bezierCurveTo(r * 0.3, r * 0.9, -r * 0.3, r * 0.9, -r * 0.5, r * 0.6);
    ctx.bezierCurveTo(-r * 0.9, r * 0.3, -r * 0.8, -r * 0.6, 0, -r * 1.2);
    ctx.fill();
    
    // Inner flame
    ctx.fillStyle = '#fff5cc';
    ctx.beginPath();
    const ir = r * 0.6;
    ctx.moveTo(0, -ir * 1.1);
    ctx.bezierCurveTo(ir * 0.7, -ir * 0.5, ir * 0.8, ir * 0.2, ir * 0.4, ir * 0.5);
    ctx.bezierCurveTo(ir * 0.2, ir * 0.7, -ir * 0.2, ir * 0.7, -ir * 0.4, ir * 0.5);
    ctx.bezierCurveTo(-ir * 0.8, ir * 0.2, -ir * 0.7, -ir * 0.5, 0, -ir * 1.1);
    ctx.fill();
    
    ctx.restore();
    
    return canvas.toBuffer('image/png');
}

sizes.forEach(size => {
    const buffer = drawIcon(size);
    fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buffer);
    console.log(`Generated icon${size}.png`);
});

console.log('✅ All icons generated successfully!');
