<div align="center">

# Shockwave Halo

When you click or focus an input, a faint halo of light sweeps across the page and fades out—gently bending the page like a glass lens as it passes, with a trace of color split and a subtle glint on lines and borders. Supports both light and dark modes.

[简体中文](README.md) · **English**

[Live Demo](https://amasun.github.io/shockwave-halo/) · [Integrate Prompt](prompts/integrate-prompt.md) · [Build from Scratch](prompts/spec-prompt.md)

<p>
  <img src="https://img.shields.io/badge/WebGL2-GLSL_ES_3.00-4f6bff?style=flat-square&logo=webgl&logoColor=white" alt="WebGL2" />
  <img src="https://img.shields.io/badge/ES_Modules-Zero_Dependencies-12a26b?style=flat-square&logo=javascript&logoColor=white" alt="ES Modules" />
  <img src="https://img.shields.io/badge/Framework-Agnostic-8b5cf6?style=flat-square" alt="Framework Agnostic" />
  <img src="https://img.shields.io/badge/Theme-Light_%26_Dark-18181c?style=flat-square" alt="Light & Dark" />
  <img src="https://img.shields.io/badge/Version-v1.0.0-0f172a?style=flat-square" alt="v1.0.0" />
  <img src="https://img.shields.io/badge/License-MIT-64748b?style=flat-square" alt="MIT License" />
</p>

</div>

---

> [!TIP]
> **Try it live**: Open the [Shockwave Halo Demo](https://amasun.github.io/shockwave-halo/) and click the input pill at the bottom; use the top toolbar to switch origins, color palettes, light/dark themes, and reduced motion.

## What's Inside

Two **zero-dependency**, **framework-agnostic** ES modules (works with React, Vue, Svelte, or plain HTML):

| File | Role | Plain Summary |
|---|---|---|
| [`shockwave-halo.js`](shockwave-halo.js) | Core Halo | Drives the halo sweep, page bend, color split, and border glints; if a page snapshot isn't available, it gracefully falls back to color rings only |
| [`ai-pill.js`](ai-pill.js) | Optional Input | A pill-shaped AI input that springs open into a card with a turning metal highlight border |
| [`demo/index.html`](demo/index.html) | Full Demo | Interactive showcase with origin switching, 4 palettes (`Aurora` / `Halo` / `Frost` / `Spark`), light/dark mode, and reduced motion |

---

## Installation

Pick any of the three ways below:

### 1. CDN (no build tools needed)

```html
<script type="module">
  import { createShockwaveHalo } from 'https://cdn.jsdelivr.net/gh/amasun/shockwave-halo@v1.0.0/shockwave-halo.js';
  import { createAIPill } from 'https://cdn.jsdelivr.net/gh/amasun/shockwave-halo@v1.0.0/ai-pill.js'; // optional
</script>
```

### 2. npm (install from GitHub)

```bash
npm i github:amasun/shockwave-halo#v1.0.0 html-to-image
```

```js
import { createShockwaveHalo } from 'shockwave-halo';
import { createAIPill } from 'shockwave-halo/ai-pill';   // optional
import { toCanvas } from 'html-to-image';

const halo = createShockwaveHalo(area, {
  snapshot: (el, opts) => toCanvas(el, opts),
});
```

### 3. Copy the Files

Copy [`shockwave-halo.js`](shockwave-halo.js) (and optionally [`ai-pill.js`](ai-pill.js)) directly into your project. Both files have zero external dependencies.

---

## Let AI Wire It Up or Build It from Scratch

You don't need to read the shader math or figure out all the options yourself. The `prompts/` folder has two ready-to-use prompts—**just copy and paste one into Claude Code, Codex, Cursor, or any AI assistant**, and it will walk you through a few quick questions:

| Prompt | When to Use | What the AI Will Do |
|---|---|---|
| [Integrate Prompt](prompts/integrate-prompt.md) | **You already have a web app** and want to drop in the ready-made library | The AI inspects your app, asks about your trigger, origin, palette, and input, and wires the component in (React, Vue, Svelte, vanilla JS, Electron, Tauri) |
| [Build from Scratch](prompts/spec-prompt.md) | **You're building a native app** (iOS, Android, Flutter, Rust) or want to implement the effect yourself | Contains the full recipe—timing curves, color palettes, and rendering algorithms—so the AI can build it from scratch in your own tech stack |

---

## Quick Start

### Minimal Usage (3 steps)

```js
import { createShockwaveHalo } from './shockwave-halo.js';

const area = document.querySelector('#content');   // area the halo sweeps across (keep toolbars outside)
const input = document.querySelector('#ai-input');

const halo = createShockwaveHalo(area, { origin: input });
input.addEventListener('focus', () => halo.trigger());
```

> [!NOTE]
> To bend the page underneath, the halo needs `html-to-image` to take a snapshot: you can load it with a `<script>` tag (global `htmlToImage`), or do nothing and the component will automatically fetch `html-to-image@1.11.11` from jsDelivr when needed. If you use a bundler like Vite or Webpack, passing `snapshot` explicitly (as in the npm example above) is recommended.

### With the AI Pill Input

```js
import { createShockwaveHalo } from './shockwave-halo.js';
import { createAIPill } from './ai-pill.js';

const halo = createShockwaveHalo(area, { exclude: '.aip' });   // the pill animates, so keep it out of snapshots
const pill = createAIPill(area, {
  onTrigger: ({ opened }) => halo.trigger({ origin: pill.el, delay: opened ? 40 : 0 }),
  onSubmit: text => sendToAI(text),
});
```

### React / Vue / Svelte Example

```jsx
function useShockwaveHalo(ref, options) {
  const halo = useRef(null);
  useEffect(() => {
    halo.current = createShockwaveHalo(ref.current, options);
    return () => halo.current.destroy();
  }, []);
  return halo;
}

const area = useRef(null);
const halo = useShockwaveHalo(area, { exclude: '.ai-input' });

<main ref={area}>
  …
  <input className="ai-input" onFocus={() => halo.current.trigger()} />
</main>
```

Same pattern for Vue and Svelte: create the instance on mount and call `destroy()` on unmount.

### Running the Demo Locally

```bash
git clone https://github.com/amasun/shockwave-halo.git
cd shockwave-halo
python3 -m http.server 8788
```

Then open `http://localhost:8788/demo/` in your browser (browsers block ES modules over `file://`, so a local static server is required).

---

## API Reference

### `createShockwaveHalo(area, options)`

`area` is the container the halo sweeps across. The halo stays clipped inside it and matches its `border-radius` (make sure the container has `overflow: hidden`).

<details>
<summary><strong>Expand all configuration options</strong></summary>

| Option | Default | Description |
|---|---|---|
| `origin` | `'bottom'` | Where the halo starts: an `Element` (rises as an arc from the nearest edge if close to one, otherwise expands as a circle from its center), `{x, y}` (viewport coordinates, e.g. click position), or `'bottom' \| 'top' \| 'left' \| 'right' \| 'center'` |
| `palette` | `'Aurora'` | `'Aurora' \| 'Halo' \| 'Frost' \| 'Spark'`, or custom `{ dark: [[r,g,b]×4], light: [[r,g,b]×4] }` (4 rings from inside to outside) |
| `theme` | `'auto'` | `'auto'` follows `<html data-theme>` / `.dark` / system preference; also accepts `'light'`, `'dark'`, or a function returning either. Colors cross-fade smoothly when switching themes |
| `layers` | all `true` | `{ bend, split, bevel, glints }`: page bend, color split, edge glass refraction, and line glints (color rings are always on) |
| `bevelEdges` | `['left','right','bottom']` | Which edges act as glass bevels (exclude any edge sitting under a toolbar) |
| `duration` | `1000` | Sweep duration in ms |
| `ringWidth` | `110` | Width `w` of a single color ring (px) |
| `bendPx` | `7` | Lens bend strength (px) |
| `arcDepth` | ⅔ of edge length | How far beyond the edge the circle center sits when starting from an edge |
| `retrigger` | `'restart'` | What happens if triggered while running: `'restart'` or `'ignore'` |
| `reducedMotion` | `'auto'` | When reduced motion is enabled: turns off bend, split, bevel, and glints; the halo fades in and out in place at half strength (`600ms`) |
| `exclude` | `null` | CSS selector for elements skipped in snapshots (e.g. animating elements or elements sitting above the halo) |
| `svgLines` | `'[data-halo-line]'` | Selector for SVG strokes that glint. Only matching strokes light up by default, so icons stay untouched |
| `snapshot` | `'auto'` | `'auto'` (`html-to-image`), `false` (color rings only, no page bend), or custom `async (el, opts) => canvas` |
| `watch` | `true` | Automatically updates the snapshot during idle time when content inside `area` changes |
| `maxDpr` | `2` | Maximum pixel ratio for rendering |
| `zIndex` | `5` | Canvas `z-index`. Give elements that should sit on top of the halo (like an input) a higher `z-index` |
| `onStart` / `onEnd` | — | Callbacks when the sweep starts / ends |

</details>

#### Returned Instance

```js
halo.trigger({ origin?, delay? })  // start the halo, returns Promise<boolean>
halo.stop()                        // stop immediately
halo.invalidate()                  // mark page dirty to re-snapshot on idle (watch covers most cases)
halo.capture()                     // capture immediately, returns { ok, mode, ms }
halo.setOptions({ palette: 'Frost', layers: { split: false } })
halo.running                       // whether the animation is currently running
halo.mode                          // 'snapshot' | 'overlay' | 'overlay (scrolled)' | 'overlay (no WebGL2)'
halo.destroy()                     // clean up the canvas and listeners
halo.debugHold(0.2)                // debug: freeze sweep at t=0.2; pass null to resume
```

### `createAIPill(container, options)`

| Option | Default | Description |
|---|---|---|
| `placeholder` | `'Ask AI about this project'` | Input placeholder text |
| `shortcut` | `'k'` | Keyboard shortcut (`⌘K` / `Ctrl K`); pass `null` to disable |
| `model` / `mode` | `'Opus 5.5'` / `'Ask'` | Labels shown on the two picker buttons |
| `bottom` | `48` | Distance in pixels from the bottom of `container` |
| `onTrigger({ opened, reduced })` | — | Called when clicking or focusing the pill, pressing the shortcut, or clicking inside the opened input |
| `onSubmit(text)` / `onOpen` / `onClose` | — | Submit and open/close callbacks |

- **Returned instance**: `{ el, input, open(), close(), trigger(), reset(), isOpen, destroy() }`
- **Styling**: Override colors with CSS variables: `--aip-bg`, `--aip-text`, `--aip-muted`, `--aip-faint`, `--aip-line`, `--aip-accent`, `--aip-send`, `--aip-send-fg`, `--aip-shadow`. Automatically switches to dark styling when an ancestor has `[data-theme="dark"]` or `.dark`.

---

## How It Works & Performance

- **Zero idle cost**: When not running, the canvas stays hidden with no animation loop. It only takes a snapshot during browser idle time after content changes (`~60–200ms` on the main thread).
- **1-second GPU pass on trigger**: Reuses the cached snapshot (or grabs a fresh one if needed) and runs a 1-second shader. Pixels outside the halo band are transparent, showing the live page underneath.
- **Line glints without lighting up text**: Builds a separate black-and-white mask from each DOM border's position and width, so a `1px` border glints as `1px` while text and icons stay clean.

## Limitations

- **Requires WebGL2**: Without WebGL2, the halo falls back to color rings only (no page bend).
- **DOM cloning caveats**: `html-to-image` clones the DOM, so cross-origin images and fonts need to be same-origin or inlined, and `backdrop-filter` may look slightly different.
- **Scrolled containers fall back**: Cloning loses scroll offsets, so if `area` or a child element is scrolled, that trigger automatically falls back to color rings only. Attach the halo to a non-scrolling outer frame when possible.
- **Snapshot frozen during the sweep**: During the 1-second sweep, pixels inside the halo band come from the snapshot taken at trigger time. Any updates during that second won't appear inside the band (outside the band is unaffected).
