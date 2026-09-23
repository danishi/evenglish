// Even Hub 用のアプリアイコン（24x24 / 1ビット白黒）を生成する。
// ガイドライン: 全ピクセルが完全な白か黒、点灯ピクセルは必ず 2x2 ブロックの一部。
// そのため 12x12 のドット絵を 2 倍に拡大して書き出す。
// 使い方: node scripts/make-icon.mjs  → assets/icon.png
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// '#' = 点灯（白）、'.' = 消灯（黒）。吹き出しの中に英語の "E"。
const ART = [
  '.##########.',
  '#..........#',
  '#...####...#',
  '#...#......#',
  '#...###....#',
  '#...#......#',
  '#...####...#',
  '#..........#',
  '.##########.',
  '..##........',
  '..#.........',
  '............',
];

const SCALE = 2;
const size = ART.length * SCALE;
if (ART.some((row) => row.length !== ART.length)) throw new Error('ART must be square');

// 1ビットグレースケールの行データ（各行の先頭にフィルタ種別 0）
const rowBytes = Math.ceil(size / 8);
const raw = Buffer.alloc((rowBytes + 1) * size);
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    if (ART[Math.floor(y / SCALE)][Math.floor(x / SCALE)] === '#') {
      raw[y * (rowBytes + 1) + 1 + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(size, 0);
ihdr.writeUInt32BE(size, 4);
ihdr[8] = 1; // bit depth
ihdr[9] = 0; // grayscale
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0)),
]);

writeFileSync(new URL('../assets/icon.png', import.meta.url), png);
console.log(`assets/icon.png (${size}x${size}) を書き出しました`);
