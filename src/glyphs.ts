import { Draw } from './draw.ts';
import type { Point } from './draw.ts';
import type { Color } from './framebuffer.ts';

type Glyph = { width: number; paths: Point[][] };

// Original narrow roman capitals: wedge serifs, hairlines and tapered stems.
const glyphs: Record<string, Glyph> = {
  A: { width: 0.64, paths: [
    [[0,1],[0,0.975],[0.065,0.95],[0.302,0],[0.352,0],[0.594,0.95],[0.64,0.975],[0.64,1],[0.394,1],[0.394,0.975],[0.461,0.951],[0.394,0.68],[0.157,0.68],[0.094,0.951],[0.161,0.975],[0.161,1]],
    [[0.168,0.638],[0.383,0.638],[0.277,0.202]],
  ] },
  L: { width: 0.53, paths: [
    [[0,0],[0.268,0],[0.268,0.025],[0.197,0.047],[0.197,0.953],[0.386,0.953],[0.497,0.785],[0.53,0.785],[0.51,1],[0,1],[0,0.975],[0.066,0.951],[0.066,0.048],[0,0.025]],
  ] },
  M: { width: 0.8, paths: [
    [[0,0],[0.207,0],[0.424,0.722],[0.635,0],[0.8,0],[0.8,0.025],[0.734,0.048],[0.734,0.951],[0.8,0.975],[0.8,1],[0.536,1],[0.536,0.975],[0.602,0.951],[0.602,0.235],[0.379,1],[0.349,1],[0.112,0.219],[0.112,0.95],[0.186,0.975],[0.186,1],[0,1],[0,0.975],[0.068,0.95],[0.068,0.048],[0,0.025]],
  ] },
  R: { width: 0.65, paths: [
    [[0,0],[0.35,0],[0.462,0.018],[0.54,0.07],[0.581,0.15],[0.594,0.25],[0.574,0.35],[0.521,0.423],[0.414,0.476],[0.477,0.516],[0.526,0.609],[0.608,0.94],[0.65,0.978],[0.65,1],[0.478,1],[0.449,0.951],[0.356,0.596],[0.317,0.529],[0.264,0.505],[0.197,0.505],[0.197,0.951],[0.263,0.975],[0.263,1],[0,1],[0,0.975],[0.065,0.951],[0.065,0.049],[0,0.025]],
    [[0.197,0.045],[0.197,0.459],[0.3,0.459],[0.382,0.44],[0.428,0.395],[0.451,0.318],[0.453,0.198],[0.432,0.115],[0.389,0.066],[0.32,0.045]],
  ] },
};

export function title(draw: Draw, text: string, baseline: number, cap: number, c: Color, alpha = 1): void {
  const tracking = cap * 0.09;
  const width = [...text].reduce((sum, letter) => sum + glyphs[letter].width * cap, 0)
    + (text.length - 1) * tracking - [...text].slice(0, -1).filter((letter, i) => `${letter}${text[i + 1]}` === 'AL' || `${letter}${text[i + 1]}` === 'LM').length * cap * 0.04;
  let x = (1024 - width) / 2;
  for (let i = 0; i < text.length; i++) {
    const letter = text[i];
    const glyph = glyphs[letter];
    draw.shape(glyph.paths.map(path => path.map(([px, py]): Point => [x + px * cap, baseline - cap + py * cap])), c, alpha);
    const pair = `${letter}${text[i + 1] ?? ''}`;
    x += glyph.width * cap + (i < text.length - 1 ? tracking - ((pair === 'AL' || pair === 'LM') ? cap * 0.04 : 0) : 0);
  }
}

// Original monoline small capitals for the place's epithet, in a 0.56 em cell.
const smallGlyphs: Record<string, Point[][]> = {
  T: [[[0,0],[0.56,0]],[[0.28,0],[0.28,1]]],
  H: [[[0,0],[0,1]],[[0.56,0],[0.56,1]],[[0,0.49],[0.56,0.49]]],
  E: [[[0.56,0],[0,0],[0,1],[0.56,1]],[[0,0.49],[0.46,0.49]]],
  G: [[[0.54,0.15],[0.45,0.03],[0.16,0.03],[0.02,0.18],[0.02,0.82],[0.16,0.97],[0.47,0.97],[0.55,0.86],[0.55,0.54],[0.32,0.54]]],
  A: [[[0,1],[0.28,0],[0.56,1]],[[0.12,0.61],[0.44,0.61]]],
  O: [[[0.16,0.02],[0.41,0.02],[0.55,0.18],[0.55,0.82],[0.41,0.98],[0.16,0.98],[0.01,0.82],[0.01,0.18],[0.16,0.02]]],
  F: [[[0,1],[0,0],[0.56,0]],[[0,0.47],[0.45,0.47]]],
  M: [[[0,1],[0,0],[0.28,0.59],[0.56,0],[0.56,1]]],
  I: [[[0.13,0],[0.43,0]],[[0.28,0],[0.28,1]],[[0.13,1],[0.43,1]]],
  R: [[[0,1],[0,0],[0.36,0],[0.53,0.12],[0.53,0.35],[0.36,0.49],[0,0.49]],[[0.29,0.49],[0.56,1]]],
  S: [[[0.53,0.14],[0.42,0.02],[0.15,0.02],[0.02,0.15],[0.02,0.36],[0.15,0.47],[0.41,0.53],[0.54,0.65],[0.54,0.84],[0.40,0.98],[0.14,0.98],[0.01,0.85]]],
};

export function subtitle(draw: Draw, text: string, baseline: number, cap: number, c: Color, alpha = 0.8): void {
  const tracking=0.34*cap;
  const advance=(letter: string) => (letter===' '?0.24:0.56)*cap;
  const width=[...text].reduce((sum,letter)=>sum+advance(letter),0)+(text.length-1)*tracking;
  const left=(1024-width)/2;
  let x=left;
  for(const letter of text) {
    if(letter!==' ') for(const stroke of smallGlyphs[letter]) {
      draw.line(stroke.map(([px,py]): Point=>[x+px*cap,baseline-cap+py*cap]),1.25,c,alpha);
    }
    x+=advance(letter)+tracking;
  }
  const ruleY=baseline-cap*0.48;
  draw.line([[left-82,ruleY],[left-22,ruleY]],1,c,alpha);
  draw.line([[left+width+22,ruleY],[left+width+82,ruleY]],1,c,alpha);
}
