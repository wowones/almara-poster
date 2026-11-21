export type Color = [number, number, number];

export function color(hex: string): Color {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

export function mix(a: Color, b: Color, t: number): Color {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function hash(x: number, y: number): number {
  let n = Math.imul(x ^ 0x45d9f3b, 374761393) ^ Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

export class Framebuffer {
  readonly scale = 3;
  readonly width = 3072;
  readonly data = new Uint8Array(this.width * this.width * 3);

  constructor(paper: Color) {
    for (let i = 0; i < this.data.length; i += 3) this.data.set(paper, i);
  }

  blend(x: number, y: number, c: Color, alpha = 1): void {
    if (x < 78 || x >= 2994 || y < 78 || y >= 2994) return;
    const i = (y * this.width + x) * 3;
    for (let k = 0; k < 3; k++) this.data[i + k] = Math.round(this.data[i + k] * (1 - alpha) + c[k] * alpha);
  }

  finish(): Uint8Array {
    const result = new Uint8Array(1024 * 1024 * 3);
    for (let y = 0; y < 1024; y++) {
      for (let x = 0; x < 1024; x++) {
        const inside = x >= 26 && x < 998 && y >= 26 && y < 998;
        const nx = (x - 512) / 486, ny = (y - 512) / 486;
        const vignette = inside ? 1 - 0.17 * Math.pow(Math.max(0, nx * nx * ny * ny), 1.15) : 1;
        const tooth = (hash(Math.floor(x / 2), Math.floor(y / 2)) - 0.5) * 7.2;
        const weave = (hash(Math.floor(x / 2), 733) - 0.5) * 1.1
          + (hash(811, Math.floor(y / 2)) - 0.5) * 0.7;
        const grain = inside ? tooth + weave : 0;
        for (let k = 0; k < 3; k++) {
          let sum = 0;
          for (let sy = 0; sy < 3; sy++) for (let sx = 0; sx < 3; sx++) sum += this.data[((y * 3 + sy) * this.width + x * 3 + sx) * 3 + k];
          result[(y * 1024 + x) * 3 + k] = Math.max(0, Math.min(255, Math.round(sum / 9 * vignette + grain)));
        }
      }
    }
    return result;
  }
}
