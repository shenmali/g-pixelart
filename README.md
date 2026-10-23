# Pixelart

Pixelart turns images into pixel art in your browser. Adjust pixel size, choose from built-in or custom palettes, apply dithering, and export sharp PNGs, sprite sheets, or tilesets. Batch processing and video conversion are also available.

**[Open Pixelart](https://www.gamesai.me/g-pixelart/editor/)** · [Documentation](https://www.gamesai.me/g-pixelart/docs/) · [Examples](https://www.gamesai.me/g-pixelart/examples/)

## Run locally

Use Node 22 or newer:

```bash
npm ci
npm run dev
```

Open `http://localhost:8080/g-pixelart/`. `npm test` builds the static site and runs the Node test suite; `npm run build:site` writes the publishable site to `_site/`.

## Use the engine from this repository

The project is not published to npm. After cloning and running `npm ci`, import its source module in Node or a bundler:

```js
import { createPixelator } from './lib/index.js';

const px = await createPixelator();
const result = await px.process({ width, height, data }, {
  size: { width: 128 },
  palette: { source: 'builtin', id: 'pico-8' },
  dither: { method: 'floyd-steinberg', strength: 0.8 },
});
```

The built site also serves a self-contained browser module at [`lib/g-pixelart.bundle.esm.js`](https://www.gamesai.me/g-pixelart/lib/g-pixelart.bundle.esm.js) and a script build at [`lib/g-pixelart.min.js`](https://www.gamesai.me/g-pixelart/lib/g-pixelart.min.js). Video processing remains available in the editor and the `lib/video.js` entry.

## License and attribution

This project adapts MIT-licensed source code. The original copyright and permission notice are retained in [LICENSE](LICENSE). ShaderMate's MIT notice is in [SHADERMATE-LICENSE.txt](SHADERMATE-LICENSE.txt). Bundled fonts retain their license notices in `lib/editor/styles/fonts/`. Pixelart is maintained in the [Shenmali repository](https://github.com/shenmali/g-pixelart).
