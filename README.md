# ALMARA

[![make.fun · the-poster-for-a-place-that-i-2-20261121-0539](https://make.fun/badge/the-poster-for-a-place-that-i-2-20261121-0539.svg)](https://make.fun/bounty/the-poster-for-a-place-that-i-2-20261121-0539?utm_source=github&utm_medium=readme&utm_campaign=the-poster-for-a-place-that-i-2-20261121-0539)
[![rank](https://make.fun/badge/the-poster-for-a-place-that-i-2-20261121-0539/wowones/almara-poster/rank.svg)](https://make.fun/bounty/the-poster-for-a-place-that-i-2-20261121-0539/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=the-poster-for-a-place-that-i-2-20261121-0539)
[![reward](https://make.fun/badge/the-poster-for-a-place-that-i-2-20261121-0539/wowones/almara-poster/reward.svg)](https://make.fun/bounty/the-poster-for-a-place-that-i-2-20261121-0539?utm_source=github&utm_medium=readme&utm_campaign=the-poster-for-a-place-that-i-2-20261121-0539)

A program that writes one travel poster for **ALMARA**, an invented salt-lagoon
coast at dusk. The gate of the mirror sea is a solitary, half-submerged stone
arch; a small spired town rests on the distant headland.

## Run

Requires Node 22.18 or newer, with native TypeScript stripping enabled by default.
No installation or dependencies are needed.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Without the environment override, the destination is `/output/entry.png`.
The program creates the destination directory if needed, never removes it,
and writes only `entry.png`. It prints the PNG's byte size and SHA-256.

## Rendering

The renderer is dependency-free and offline, using only Node builtins.
It draws at 3× resolution for nine-sample antialiasing, then downsamples to
1024 × 1024 RGB. Original vector letterforms, polygon scan conversion,
multi-stop gradients, a radial halo, blurred and displaced reflections,
fine ripples, and fixed-coordinate paper grain make up the scene.
The PNG encoder implements chunks, CRC32, and Sub filtering itself and
uses Node's zlib for compression. No external fonts, assets, or code are used.

Rendering is fully deterministic: no clock, network, or random source is read.
Repeated runs on the same Node/zlib version produce byte-identical PNGs.

## License

MIT; see LICENSE.
