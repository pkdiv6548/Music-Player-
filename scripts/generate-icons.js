import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPNG(width, height, isMaskable = false) {
  // Create an uncompressed RGBA buffer
  // width x height x 4 bytes
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);
  const cx = width / 2;
  const cy = height / 2;
  const outerR = (width / 2) * (isMaskable ? 0.75 : 0.85);

  let rawIdx = 0;
  for (let y = 0; y < height; y++) {
    rawData[rawIdx++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: #0b0d14
      let r = 11;
      let g = 13;
      let b = 20;
      let a = 255;

      // Glow effect in center
      const glowFactor = Math.max(0, 1 - dist / (width * 0.6));
      r = Math.min(255, r + Math.round(59 * glowFactor * 0.6));
      g = Math.min(255, g + Math.round(130 * glowFactor * 0.5));
      b = Math.min(255, b + Math.round(246 * glowFactor * 0.7));

      // Central sound wave bars
      const nx = (x - cx) / (width * 0.35); // -1 to 1
      const ny = (y - cy) / (height * 0.35); // -1 to 1

      // 6 soundwave bars
      const barDefs = [
        { x: -0.6, h: 0.35, color: [56, 189, 248] },
        { x: -0.35, h: 0.65, color: [99, 102, 241] },
        { x: -0.1, h: 0.95, color: [129, 140, 248] },
        { x: 0.15, h: 0.75, color: [168, 85, 247] },
        { x: 0.4, h: 0.45, color: [6, 182, 212] },
        { x: 0.65, h: 0.2, color: [59, 130, 246] }
      ];

      for (const bar of barDefs) {
        if (Math.abs(nx - bar.x) < 0.08 && Math.abs(ny) < bar.h) {
          r = bar.color[0];
          g = bar.color[1];
          b = bar.color[2];
        }
      }

      // Outer ring
      if (Math.abs(dist - outerR) < width * 0.015 && y <= cy) {
        r = 56;
        g = 189;
        b = 248;
      }

      rawData[rawIdx++] = r;
      rawData[rawIdx++] = g;
      rawData[rawIdx++] = b;
      rawData[rawIdx++] = a;
    }
  }

  // Compress rawData with deflate
  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(len + 12);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  chunk.writeUInt32BE(crc >>> 0, len + 8);
  return chunk;
}

// Simple CRC32 implementation for standard PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180, false));
fs.writeFileSync(path.join(outDir, 'favicon.ico'), createPNG(64, 64, false));

console.log('PNG Icons successfully generated in public/ directory!');
