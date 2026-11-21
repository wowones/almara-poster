import { Framebuffer, color, hash, mix } from './framebuffer.ts';
import { Draw } from './draw.ts';
import type { Point } from './draw.ts';
import { title } from './glyphs.ts';

const cream = color('#fdf1d8'), stone = color('#312043'), gold = color('#ffc48f');

function arch(draw: Draw): void {
  const silhouette: Point[] = [[332,640],[350,606],[365,432]];
  for (let i = 0; i <= 96; i++) {
    const t = Math.PI + i / 96 * Math.PI;
    silhouette.push([512 + 147 * Math.cos(t),432 + 132 * Math.sin(t)]);
  }
  silhouette.push([674,606],[692,640]);
  const opening: Point[] = [[437,640],[437,439]];
  for (let i = 0; i <= 72; i++) {
    const t = Math.PI + i / 72 * Math.PI;
    opening.push([512 + 75 * Math.cos(t),439 + 75 * Math.sin(t)]);
  }
  opening.push([587,640]);

  // The opening is the actual, shaded view of the sky and sun behind the stone.
  draw.gradientShape([opening],364,640,[[0,color('#403047')],[0.42,color('#513b57')],[0.78,color('#725066')],[1,color('#896371')]]);
  draw.shape([silhouette,opening],stone);

  // A continuous, quiet edge light separates the crown; the left edge catches the sunset.
  draw.line([...silhouette,silhouette[0]],2.1,gold,0.58);
  const outerLeft: Point[] = [[332,640],[350,606],[365,432]];
  for (let i = 0; i <= 48; i++) {
    const t = Math.PI + i / 48 * Math.PI / 2;
    outerLeft.push([512 + 147 * Math.cos(t),432 + 132 * Math.sin(t)]);
  }
  draw.line(outerLeft,2.2,gold,0.83);
  const innerLeft: Point[] = [[437,640],[437,439]];
  for (let i = 0; i <= 40; i++) {
    const t = Math.PI + i / 40 * Math.PI / 2;
    innerLeft.push([512 + 75 * Math.cos(t),439 + 75 * Math.sin(t)]);
  }
  draw.line(innerLeft,2.4,gold,0.88);
  draw.line([[437,548],[587,548]],3.1,color('#211a32'),0.94);
  draw.line([[485,375],[485,636]],2.5,color('#241b35'),0.88);
  draw.line([[539,375],[539,636]],2.5,color('#241b35'),0.88);

  // Radial voussoir joints and fine, dark courses make the gateway feel carved.
  for (let j = 1; j < 12; j++) {
    const t = Math.PI + j / 12 * Math.PI;
    draw.line([[512 + 81 * Math.cos(t),439 + 81 * Math.sin(t)],[512 + 141 * Math.cos(t),432 + 127 * Math.sin(t)]],1.25,color('#21182f'),0.62);
  }
  for (const y of [466,506,550,596,628]) {
    const edge = y <= 606 ? 365 - (y - 432) * 15 / 174 : 350 - (y - 606) * 18 / 34;
    draw.line([[edge + 4,y],[434,y + 1]],1.5,color('#21182f'),0.7);
    draw.line([[590,y + 2],[1024 - edge - 4,y + 3]],1.5,color('#21182f'),0.72);
    draw.line([[edge + 8,y + 2],[421,y + 3]],0.8,gold,0.16);
  }
}

function town(draw: Draw): void {
  const land = color('#51415b');
  draw.polygon([[655,610],[692,600],[726,585],[761,579],[794,583],[829,570],[875,566],[918,580],[964,579],[998,568],[998,629],[655,629]], land);
  for (let j = 0; j < 16; j++) {
    const x = 735 + j * 16;
    const base = 585 - (j > 5 ? 6 : 0);
    const h = 12 + hash(j,13) * 30;
    const w = 4 + hash(j,14) * 5;
    draw.rect(x, base - h, w, h + 12, land);
    draw.polygon([[x - 1,base - h],[x + w / 2,base - h - 10 - hash(j,16) * 8],[x + w + 1,base - h]], land);
    if (j % 3 === 0) draw.rect(x + w / 2 - 1, base - h + 7, 2, 3, color('#ffd49e'), 0.92);
  }
  draw.line([[729,606],[812,598],[888,597],[997,598]], 0.8, gold, 0.25);
}

function boat(draw: Draw, x: number, y: number, size: number): void {
  const ink = color('#39283e');
  draw.polygon([[x - size,y],[x + size,y],[x + size * 0.55,y + size * 0.22],[x - size * 0.6,y + size * 0.22]], ink);
  draw.line([[x,y],[x,y - size * 1.8]], 1, ink);
  draw.polygon([[x - 1,y - size * 1.65],[x - size * 0.64,y - 2],[x - 1,y - 3]], cream, 0.82);
  draw.line([[x - size * 1.5,y + size * 0.34],[x + size * 1.5,y + size * 0.34]], 0.7, gold, 0.65);
}

function boatReflection(draw: Draw, x: number, y: number, size: number): void {
  const ink = color('#44334c');
  draw.polygon([[x-size,y+1],[x+size,y+1],[x+size*0.45,y+size*0.15],[x-size*0.5,y+size*0.15]],ink,0.38);
  draw.polygon([[x-0.7,y+1],[x+0.7,y+1],[x+0.7,y+size*0.86],[x,y+size*1.05],[x-0.7,y+size*0.82]],ink,0.30);
  for (let j = 0; j < 4; j++) {
    if (j === 1 || j === 3) continue;
    const spread = size * (0.35 + j * 0.13);
    draw.line([[x-spread,y+size*(0.28+j*0.2)],[x+spread,y+size*(0.28+j*0.2)]],0.8,ink,0.23);
  }
}

export function renderScene(): Uint8Array {
  const fb = new Framebuffer(color('#f3e7cf'));
  const draw = new Draw(fb);
  draw.gradient(26, 640, [[0,color('#2a1f45')],[0.36,color('#6b3c5e')],[0.69,color('#c26179')],[0.94,color('#ffb271')],[1,color('#ecc294')]]);
  draw.glow(500,585,360,310,color('#ffbd7f'),0.58);
  draw.ellipse(500,585,200,200,color('#ffe0ac'));
  draw.glow(500,585,225,225,color('#fff0cd'),0.12);
  for (let y = 560; y < 640; y++) {
    const a = Math.exp(-Math.pow((y - 611) / 29,2)) * 0.28;
    draw.rect(26,y,972,1,color('#ffe2b5'),a);
  }
  town(draw);
  // A glassy, almost invisible tidal shelf joins the far coast to the lagoon.
  for (let y = 620; y < 640; y++) {
    draw.rect(26,y,972,1,color('#d4a28f'),(y - 620) / 20 * 0.55);
  }
  arch(draw);
  // Capture the scene before the water, then reflect it with a horizontal blur.
  const reflected = fb.data.slice();
  draw.gradient(640,998,[[0,color('#d4a28f')],[0.43,color('#9a6e83')],[1,color('#463a60')]]);
  for (let y = 1920; y < 2994; y++) {
    const py = y / 3;
    const sy = Math.max(78, Math.floor((640 - (py - 640) * 0.91) * 3));
    const offset = Math.sin(py * 0.26) * (0.5 + (py - 640) * 0.009) + Math.sin(py * 0.83) * 0.65;
    const opacity = 0.71 - (py - 640) / 358 * 0.25;
    for (let x = 78; x < 2994; x++) {
      const sx = Math.max(84,Math.min(2987,Math.round(x + offset * 3)));
      const c: [number,number,number] = [0,0,0];
      for (let k = 0; k < 3; k++) {
        for (const dx of [-6,-3,0,3,6]) c[k] += reflected[(sy * 3072 + sx + dx) * 3 + k] / 5;
        c[k] *= 0.80;
      }
      fb.blend(x,y,c,opacity);
    }
  }
  draw.glow(506,820,175,290,color('#ffc58c'),0.16);
  // Dark, feathered contact under both flared feet, with waterline breaks.
  for (let k = 0; k < 7; k++) {
    const a = 0.58 * (1 - k / 8);
    const y = 638 + k;
    draw.rect(323,y,121,1,color('#21192e'),a);
    draw.rect(580,y,121,1,color('#21192e'),a);
  }
  for (const y of [642,645,648,651]) {
    draw.line([[405,y],[435,y]],0.9,cream,0.22);
    draw.line([[589,y+1],[618,y+1]],0.9,cream,0.20);
  }

  boatReflection(draw,217,686,13);
  boatReflection(draw,300,650,7);
  boatReflection(draw,139,735,9);
  for (const [x,y,size] of [[217,686,13],[300,650,7],[139,735,9]]) {
    draw.line([[x-size*1.7,y+2],[x-size*2.7,y+5]],0.8,gold,0.35);
    draw.line([[x+size*1.7,y+2],[x+size*2.7,y+5]],0.8,gold,0.35);
  }

  // Broken gold path of reflected sunlight, spread by a fixed row hash.
  for (let j = 0; j < 90; j++) {
    const t = j / 89;
    const y = 643 + t * 349;
    const half = 95 + 70 * t;
    const x = 500 + (hash(j,33) - 0.5) * half * 2;
    const length = 6 + hash(j,44) * (18 + 22 * (1-t));
    const alpha = (0.08 + 0.64 * Math.pow(1-t,1.45)) * (0.54 + hash(j,55) * 0.46);
    const width = 0.65 + hash(j,66) * 1.05;
    draw.line([[x-length/2,y],[x+length/2,y]],width,mix(gold,cream,0.28+hash(j,77)*0.45),alpha);
  }
  for (let j = 0; j < 36; j++) {
    const t = j / 35, y = 645 + Math.pow(t,1.65) * 336;
    const width = 16 + t * 95;
    const x = 501 + (hash(j,9) - 0.5) * (110 + t * 135);
    draw.line([[x - width,y],[x + width,y]],0.65 + t * 0.65,mix(gold,cream,0.2),0.15 + hash(j,11) * 0.2);
    const side = j % 2 === 0 ? 155 : 805;
    const shift = (hash(j,12) - 0.5) * 190;
    draw.line([[side + shift,y + 4],[side + shift + 35 + t * 100,y + 4]],0.5 + t * 0.6,cream,0.10);
    if (j % 3 === 0) draw.line([[x - width * 0.8,y + 2.5],[x + width * 0.7,y + 2.5]],0.8,color('#5a4667'),0.25);
  }
  draw.ellipse(399,642,59,2.1,color('#332641'),0.25);
  draw.ellipse(629,642,56,2.1,color('#332641'),0.25);
  boat(draw,217,686,13);
  boat(draw,300,650,7);
  boat(draw,139,735,9);
  for (const [x,y,s] of [[760,331,10],[797,314,7],[268,344,8]]) {
    draw.curve([x-s,y],[x-s*0.4,y-5],[x,y],1.2,color('#432a4f'),0.65);
    draw.curve([x,y],[x+s*0.5,y-4],[x+s,y+1],1.2,color('#432a4f'),0.65);
  }
  title(draw,'ALMARA',296,150,color('#281c3b'),0.17);
  title(draw,'ALMARA',292,150,cream);
  draw.line([[38,38],[986,38],[986,986],[38,986],[38,38]],2,cream,0.72);
  return fb.finish();
}
