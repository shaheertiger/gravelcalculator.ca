/* Dependency-free PNG generator for og-image + icons (no native libs).
   Run: node gen-images.js  →  og-image.png, apple-touch-icon.png, favicon-32x32.png */
const fs = require("fs");
const zlib = require("zlib");

/* ---- CRC32 ---- */
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) { raw[y * (1 + w * 4)] = 0; rgba.copy(raw, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4); }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

/* ---- simple canvas ---- */
function canvas(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  const set = (x, y, r, g, b, a = 255) => {
    x = x | 0; y = y | 0; if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = (y * w + x) * 4;
    const af = a / 255, ia = 1 - af;
    buf[i] = r * af + buf[i] * ia; buf[i + 1] = g * af + buf[i + 1] * ia;
    buf[i + 2] = b * af + buf[i + 2] * ia; buf[i + 3] = Math.max(buf[i + 3], a);
  };
  return { w, h, buf, set,
    fill(r, g, b) { for (let i = 0; i < w * h; i++) { buf[i*4]=r; buf[i*4+1]=g; buf[i*4+2]=b; buf[i*4+3]=255; } },
    rect(x0, y0, rw, rh, r, g, b, a) { for (let y = y0; y < y0 + rh; y++) for (let x = x0; x < x0 + rw; x++) set(x, y, r, g, b, a); },
    circle(cx, cy, rad, r, g, b, a = 255) {
      for (let y = cy - rad; y <= cy + rad; y++) for (let x = cx - rad; x <= cx + rad; x++) {
        const d = Math.hypot(x - cx, y - cy); if (d <= rad) set(x, y, r, g, b, a * Math.min(1, rad - d + 1));
      }
    },
    png() { return encodePNG(w, h, buf); }
  };
}

/* ---- 5x7 pixel font ---- */
const FONT = {
  G:["01110","10001","10000","10111","10001","10001","01110"],
  R:["11110","10001","10001","11110","10100","10010","10001"],
  A:["01110","10001","10001","11111","10001","10001","10001"],
  V:["10001","10001","10001","10001","10001","01010","00100"],
  E:["11111","10000","10000","11110","10000","10000","11111"],
  L:["10000","10000","10000","10000","10000","10000","11111"],
  C:["01110","10001","10000","10000","10000","10001","01110"],
  U:["10001","10001","10001","10001","10001","10001","01110"],
  T:["11111","00100","00100","00100","00100","00100","00100"],
  O:["01110","10001","10001","10001","10001","10001","01110"],
  N:["10001","11001","10101","10011","10001","10001","10001"],
  S:["01111","10000","10000","01110","00001","00001","11110"],
  D:["11110","10001","10001","10001","10001","10001","11110"],
  ".":["00000","00000","00000","00000","00000","01100","01100"],
  " ":["00000","00000","00000","00000","00000","00000","00000"]
};
function text(c, str, x, y, scale, r, g, b) {
  let cx = x;
  for (const ch of str) {
    const glyph = FONT[ch]; if (!glyph) { cx += 6 * scale; continue; }
    for (let ry = 0; ry < 7; ry++) for (let rx = 0; rx < 5; rx++)
      if (glyph[ry][rx] === "1") c.rect(cx + rx * scale, y + ry * scale, scale, scale, r, g, b, 255);
    cx += 6 * scale;
  }
  return cx;
}
const textWidth = (str, scale) => str.length * 6 * scale - scale;

/* ---- og-image 1200x630 ---- */
(function () {
  const c = canvas(1200, 630);
  c.fill(31, 111, 67);               // brand green
  c.rect(0, 0, 1200, 12, 139, 195, 74, 255); // accent top bar
  c.rect(0, 618, 1200, 12, 205, 220, 57, 255); // accent bottom bar
  // gravel circle motif (top-right)
  c.circle(1010, 150, 70, 139, 195, 74); c.circle(1090, 240, 90, 205, 220, 57);
  c.circle(1110, 90, 55, 165, 214, 106); c.circle(960, 250, 45, 220, 232, 176);
  // title
  const t1 = "GRAVELCALCULATOR.CA";
  const s1 = 9; const w1 = textWidth(t1, s1);
  text(c, t1, (1200 - w1) / 2, 250, s1, 255, 255, 255);
  // subtitle
  const t2 = "GRAVEL TONNAGE AND COST CALCULATOR";
  const s2 = 5; const w2 = textWidth(t2, s2);
  text(c, t2, (1200 - w2) / 2, 370, s2, 205, 220, 57);
  fs.writeFileSync("og-image.png", c.png());
  console.log("wrote og-image.png 1200x630");
})();

/* ---- icon helper (rounded green tile + gravel circles) ---- */
function icon(size, file) {
  const c = canvas(size, size);
  c.fill(31, 111, 67);
  const u = size / 64;
  c.circle(20 * u, 40 * u, 9 * u, 139, 195, 74);
  c.circle(40 * u, 44 * u, 11 * u, 205, 220, 57);
  c.circle(44 * u, 24 * u, 8 * u, 165, 214, 106);
  c.circle(26 * u, 22 * u, 6 * u, 220, 232, 176);
  fs.writeFileSync(file, c.png());
  console.log("wrote " + file + " " + size + "x" + size);
}
icon(180, "apple-touch-icon.png");
icon(192, "icon-192.png");
icon(512, "icon-512.png");
icon(32, "favicon-32x32.png");
