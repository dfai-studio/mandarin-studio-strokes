# Mandarin Studio stroke data

Stroke-order data used by the [Mandarin Studio](https://dfai-studio.app/) app for
its character writing practice, published here as the Arphic Public License
requires for modified versions.

## Source

The data is derived from [Make Me a Hanzi](https://github.com/skishore/makemeahanzi)
by Shaunak Kishore, as packaged in the npm module
[`hanzi-writer-data`](https://www.npmjs.com/package/hanzi-writer-data) 2.0.1.
Make Me a Hanzi's graphics data is in turn derived from fonts by Arphic
Technology and is distributed under the Arphic Public License
([`ARPHICPL.TXT`](ARPHICPL.TXT)).

## Changes made by Mandarin Studio (18 November 2026)

- limited to the characters that occur in the course (HSK 1 to HSK 7–9)
- split into one file per HSK level: `S1.hzs` … `S7.hzs` (S7 = HSK 7–9)
- stored as gzip-compressed JSON; outlines and medians are unchanged

[`pack_strokes.mjs`](pack_strokes.mjs) is the exact script that produced the
files: `node pack_strokes.mjs <path to hanzi-writer-data/package>`.

## Format

Each `.hzs` file is gzip-compressed JSON:

```json
{ "notice": "...", "level": 1, "chars": { "你": [[ "<SVG path of stroke 1>", ... ], [[x1, y1, x2, y2, ...], ...]] } }
```

Per character: the stroke outlines as SVG path strings and the stroke medians
as flat coordinate lists, in a 1024 × 1024 box with the y axis pointing up and
the baseline at y = 900 (the Make Me a Hanzi convention). Stroke order is the
array order.

## License

Arphic Public License, see [`ARPHICPL.TXT`](ARPHICPL.TXT). You may copy,
modify and redistribute this data under the same license. It comes without any
warranty.
