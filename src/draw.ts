import { Framebuffer, mix } from './framebuffer.ts';
import type { Color } from './framebuffer.ts';

export type Point = [number, number];

export class Draw {
  readonly fb: Framebuffer;
  constructor(fb: Framebuffer) { this.fb = fb; }

  shape(contours: Point[][], c: Color, alpha = 1): void {
    const all = contours.flat();
    const ymin = Math.max(78, Math.floor(Math.min(...all.map(p => p[1])) * 3));
    const ymax = Math.min(2993, Math.ceil(Math.max(...all.map(p => p[1])) * 3));
    for (let y = ymin; y <= ymax; y++) {
      const scan = (y + 0.5) / 3, crossings: number[] = [];
      for (const points of contours) for (let j = 0; j < points.length; j++) {
        const a = points[j], b = points[(j + 1) % points.length];
        if ((a[1] <= scan && b[1] > scan) || (b[1] <= scan && a[1] > scan)) crossings.push(a[0] + (scan - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
      crossings.sort((a, b) => a - b);
      for (let j = 0; j + 1 < crossings.length; j += 2) {
        const left = Math.max(78, Math.ceil(crossings[j] * 3 - 0.5));
        const right = Math.min(2994, Math.ceil(crossings[j + 1] * 3 - 0.5));
        for (let x = left; x < right; x++) this.fb.blend(x, y, c, alpha);
      }
    }
  }

  tintShape(contours: Point[][], tint: Color, amount = 0.26, multiply = 0.72): void {
    const all = contours.flat();
    const ymin = Math.max(78, Math.floor(Math.min(...all.map(p => p[1])) * 3));
    const ymax = Math.min(2993, Math.ceil(Math.max(...all.map(p => p[1])) * 3));
    for (let y = ymin; y <= ymax; y++) {
      const scan = (y + 0.5) / 3, crossings: number[] = [];
      for (const points of contours) for (let j = 0; j < points.length; j++) {
        const a = points[j], b = points[(j + 1) % points.length];
        if ((a[1] <= scan && b[1] > scan) || (b[1] <= scan && a[1] > scan)) crossings.push(a[0] + (scan - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
      crossings.sort((a, b) => a - b);
      for (let j = 0; j + 1 < crossings.length; j += 2) {
        const left = Math.max(78, Math.ceil(crossings[j] * 3 - 0.5));
        const right = Math.min(2994, Math.ceil(crossings[j + 1] * 3 - 0.5));
        for (let x = left; x < right; x++) {
          const i = (y * this.fb.width + x) * 3;
          for (let k = 0; k < 3; k++) {
            const shaded = this.fb.data[i + k] * multiply;
            this.fb.data[i + k] = Math.round(shaded * (1 - amount) + tint[k] * amount);
          }
        }
      }
    }
  }

  gradientShape(contours: Point[][], top: number, bottom: number, stops: [number, Color][]): void {
    const all = contours.flat();
    const ymin = Math.max(78, Math.floor(Math.min(...all.map(p => p[1])) * 3));
    const ymax = Math.min(2993, Math.ceil(Math.max(...all.map(p => p[1])) * 3));
    for (let y = ymin; y <= ymax; y++) {
      const scan = (y + 0.5) / 3, crossings: number[] = [];
      for (const points of contours) for (let j = 0; j < points.length; j++) {
        const a = points[j], b = points[(j + 1) % points.length];
        if ((a[1] <= scan && b[1] > scan) || (b[1] <= scan && a[1] > scan)) crossings.push(a[0] + (scan - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
      crossings.sort((a, b) => a - b);
      const t = Math.max(0, Math.min(1, (scan - top) / (bottom - top)));
      let j = 0;
      while (j < stops.length - 2 && t > stops[j + 1][0]) j++;
      const a = stops[j], b = stops[j + 1];
      const c = mix(a[1], b[1], Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0]))));
      for (let i = 0; i + 1 < crossings.length; i += 2) {
        const left = Math.max(78, Math.ceil(crossings[i] * 3 - 0.5));
        const right = Math.min(2994, Math.ceil(crossings[i + 1] * 3 - 0.5));
        for (let x = left; x < right; x++) this.fb.blend(x, y, c);
      }
    }
  }

  polygon(points: Point[], c: Color, alpha = 1): void { this.shape([points], c, alpha); }

  rect(x: number, y: number, w: number, h: number, c: Color, alpha = 1): void {
    this.polygon([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], c, alpha);
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, c: Color, alpha = 1): void {
    const points: Point[] = [];
    for (let i = 0; i < 160; i++) { const t = i * Math.PI / 80; points.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]); }
    this.polygon(points, c, alpha);
  }

  line(points: Point[], width: number, c: Color, alpha = 1): void {
    for (let j = 1; j < points.length; j++) {
      const a = points[j - 1], b = points[j], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (!len) continue;
      const dx = -(b[1] - a[1]) / len * width / 2, dy = (b[0] - a[0]) / len * width / 2;
      this.polygon([[a[0] + dx, a[1] + dy], [b[0] + dx, b[1] + dy], [b[0] - dx, b[1] - dy], [a[0] - dx, a[1] - dy]], c, alpha);
    }
  }

  curve(a: Point, control: Point, b: Point, width: number, c: Color, alpha = 1): void {
    const points: Point[] = [];
    for (let i = 0; i <= 28; i++) {
      const t = i / 28, u = 1 - t;
      points.push([u * u * a[0] + 2 * u * t * control[0] + t * t * b[0], u * u * a[1] + 2 * u * t * control[1] + t * t * b[1]]);
    }
    this.line(points, width, c, alpha);
  }

  gradient(top: number, bottom: number, stops: [number, Color][]): void {
    for (let y = Math.ceil(top * 3); y < bottom * 3; y++) {
      const t = (y / 3 - top) / (bottom - top);
      let j = 0;
      while (j < stops.length - 2 && t > stops[j + 1][0]) j++;
      const a = stops[j], b = stops[j + 1];
      const c = mix(a[1], b[1], Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0]))));
      for (let x = 78; x < 2994; x++) this.fb.blend(x, y, c);
    }
  }

  glow(cx: number, cy: number, rx: number, ry: number, c: Color, alpha: number): void {
    for (let y = Math.max(78, Math.floor((cy - ry) * 3)); y < Math.min(2994, (cy + ry) * 3); y++) {
      for (let x = Math.max(78, Math.floor((cx - rx) * 3)); x < Math.min(2994, (cx + rx) * 3); x++) {
        const radius = Math.hypot((x / 3 - cx) / rx, (y / 3 - cy) / ry);
        if (radius < 1) this.fb.blend(x, y, c, alpha * Math.pow(1 - radius * radius, 2));
      }
    }
  }
}
