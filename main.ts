import { chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { renderScene } from './src/scene.ts';
import { encodePNG } from './src/png.ts';

const output = process.env.MAKEFUN_OUTPUT_DIR || '/output';
mkdirSync(output, { recursive: true, mode: 0o755 });
const pixels = renderScene();
const png = encodePNG(1024, 1024, pixels);
if (png.length > 1_048_576) throw new Error(`PNG exceeds the bounty cap: ${png.length} bytes`);
const destination = join(output, 'entry.png');
writeFileSync(destination, png, { mode: 0o644 });
chmodSync(destination, 0o644);
console.log(`ALMARA: ${png.length} bytes; sha256 ${createHash('sha256').update(png).digest('hex')}`);
