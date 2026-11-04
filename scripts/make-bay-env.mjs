/**
 * Generates public/assets/bay-env.hdr — a 256×128 equirectangular Radiance
 * image for the homepage scene's environment light.
 *
 * Authored rather than downloaded so it is ours, tiny (~128 kB) and matched to
 * the palette: a warm low sun over a hazy horizon, pale Monterey sky above,
 * teal water below. Run with `node scripts/make-bay-env.mjs`.
 */
import { writeFileSync } from 'node:fs';

const W = 256;
const H = 128;

const clamp = (v) => Math.min(1, Math.max(0, v));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const scale = (c, k) => c.map((v) => v * k);

/** Radiance RGBE: shared exponent, 8 bits per channel. */
function encode(r, g, b) {
  const max = Math.max(r, g, b);
  if (max < 1e-6) return [0, 0, 0, 0];
  const exponent = Math.ceil(Math.log2(max));
  const f = 256 / 2 ** exponent;
  return [
    Math.min(255, Math.floor(r * f)),
    Math.min(255, Math.floor(g * f)),
    Math.min(255, Math.floor(b * f)),
    exponent + 128,
  ];
}

const SUN = (() => {
  const v = [0.62, 0.38, 0.68];
  const l = Math.hypot(...v);
  return v.map((x) => x / l);
})();

const SKY_LOW = [0.92, 0.95, 0.94]; // hazy horizon, almost white
const SKY_HIGH = [0.34, 0.56, 0.72]; // pale monterey blue
const WATER_NEAR = [0.18, 0.44, 0.46]; // sunlit shelf
const WATER_DEEP = [0.02, 0.10, 0.14]; // channel

const pixels = Buffer.alloc(W * H * 4);
let offset = 0;

for (let y = 0; y < H; y += 1) {
  // Equirect: rows run from the zenith to the nadir.
  const elevation = (0.5 - (y + 0.5) / H) * Math.PI;
  const up = Math.sin(elevation);
  const around = Math.cos(elevation);

  for (let x = 0; x < W; x += 1) {
    const azimuth = ((x + 0.5) / W) * Math.PI * 2 - Math.PI;
    const dir = [Math.cos(azimuth) * around, up, Math.sin(azimuth) * around];

    let color;
    if (up >= 0) {
      const t = Math.pow(up, 0.55);
      color = mix(SKY_LOW, SKY_HIGH, t);
    } else {
      // Light falls off quickly below the surface, then settles into deep water.
      const depth = Math.pow(-up, 0.45);
      color = mix(WATER_NEAR, WATER_DEEP, depth);
      // A soft caustic band just under the surface keeps reflections interesting.
      const band = Math.exp(-Math.pow((-up - 0.06) / 0.09, 2));
      color = color.map((v) => v + 0.05 * band);
    }

    const sun = Math.max(0, dir[0] * SUN[0] + dir[1] * SUN[1] + dir[2] * SUN[2]);
    const glow = Math.pow(sun, 6) * 0.35 + Math.pow(sun, 90) * 1.6;
    const disc = Math.pow(sun, 1200) * 9;
    color = color.map((v, i) => v + glow * [1, 0.82, 0.6][i] + disc * [1, 0.9, 0.72][i]);

    // Slight vertical bounce so the water is not perfectly flat.
    color = color.map((v, i) => v * (0.96 + 0.04 * Math.sin(azimuth * 3 + up * 2 + i)));

    const [r, g, b, e] = encode(clamp(color[0]), clamp(color[1]), clamp(color[2]));
    pixels[offset++] = r;
    pixels[offset++] = g;
    pixels[offset++] = b;
    pixels[offset++] = e;
  }
}

const header = `#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${H} +X ${W}\n`;
const out = Buffer.concat([Buffer.from(header, 'ascii'), pixels]);
writeFileSync(new URL('../public/assets/bay-env.hdr', import.meta.url), out);
console.log(`wrote public/assets/bay-env.hdr — ${W}×${H}, ${(out.length / 1024).toFixed(0)} kB`);
