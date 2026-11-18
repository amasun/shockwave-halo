<div align="center">

# Shockwave Halo

**Lens-bending light halo for web UIs** — When you click or focus an input, a faint halo sweeps across the page and fades out, gently bending content like a glass lens with subtle color split and border glints. **Zero dependencies, framework-agnostic, and zero idle cost.**

[简体中文](README.zh-CN.md) · **English**

[Live Demo](https://amasun.github.io/shockwave-halo/) · [Best Practices](#best-practices) · [Integrate Prompt](#integrate-prompt) · [Build from Scratch](#build-from-scratch)

<p>
  <img src="https://img.shields.io/badge/WebGL2-GLSL_ES_3.00-4f6bff?style=flat-square&logo=webgl&logoColor=white" alt="WebGL2" />
  <img src="https://img.shields.io/badge/ES_Modules-Zero_Dependencies-12a26b?style=flat-square&logo=javascript&logoColor=white" alt="ES Modules" />
  <img src="https://img.shields.io/badge/Framework-Agnostic-8b5cf6?style=flat-square" alt="Framework Agnostic" />
  <img src="https://img.shields.io/badge/Theme-Light_%26_Dark-18181c?style=flat-square" alt="Light & Dark" />
  <img src="https://img.shields.io/badge/Version-v1.0.0-0f172a?style=flat-square" alt="v1.0.0" />
  <img src="https://img.shields.io/badge/License-MIT-64748b?style=flat-square" alt="MIT License" />
  <a href="https://x.com/Claude202309"><img src="https://img.shields.io/badge/X-@Claude202309-000000?style=flat-square&logo=x&logoColor=white" alt="X" /></a>
  <a href="https://www.xiaohongshu.com/user/profile/5c094b50f7e8b948da476607"><img src="https://img.shields.io/badge/RedNote-Profile-ff2442?style=flat-square&logo=xiaohongshu&logoColor=white" alt="RedNote" /></a>
</p>

</div>

---

> [!TIP]
> **Interactive Demo**: Open the [Shockwave Halo Demo](https://amasun.github.io/shockwave-halo/) and click the input pill at the bottom; use the top toolbar to switch origins, color palettes, light/dark themes, and reduced motion.

## What's Inside

Two **zero-dependency**, **framework-agnostic** ES modules (works with React, Vue, Svelte, or plain HTML):

| File | Role | Summary |
|---|---|---|
| [`shockwave-halo.js`](shockwave-halo.js) | Core Halo | Drives the halo sweep, lens bend, color split, and border glints; falls back gracefully to color rings only when a snapshot isn't available |
| [`ai-pill.js`](ai-pill.js) | Optional Input | Pill-shaped AI input that springs open into a card with a turning metal highlight border |
| [`demo/index.html`](demo/index.html) | Full Demo | Interactive showcase with origin switching, 7 palettes, light/dark mode, and reduced motion |

---

## Installation

Pick any of the three ways below, or hand the one-liner directly to your AI coding agent.

### 1. npm (install from GitHub)

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

### 2. CDN (no build tools needed)

```html
<script type="module">
  import { createShockwaveHalo } from 'https://cdn.jsdelivr.net/gh/amasun/shockwave-halo@v1.0.0/shockwave-halo.js';
  import { createAIPill } from 'https://cdn.jsdelivr.net/gh/amasun/shockwave-halo@v1.0.0/ai-pill.js'; // optional
</script>
```

### 3. Copy the Files

Copy [`shockwave-halo.js`](shockwave-halo.js) (and optionally [`ai-pill.js`](ai-pill.js)) directly into your project. Both files have zero external dependencies.

> [!NOTE]
> **Tell your coding agent**: Using Cursor, Claude Code, or Codex? You can just say:  
> *"Add shockwave-halo from https://github.com/amasun/shockwave-halo to my main content container, trigger the `Aurora` halo when focusing or clicking the AI input, and keep toolbars clear."*  
> Need finer control? See [Let AI Wire It Up or Build It from Scratch](#let-ai-wire-it-up-or-build-it-from-scratch) below.

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
  onTrigger: ({ delay }) => halo.trigger({ origin: pill.el, delay }),
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

## Triggers & Built-in Palettes

### 1. Origins (`origin`)

| Value | Sweep Shape | Typical Usage |
|---|---|---|
| **DOM Element** (e.g. `input`) | Rises as a wide arc from the nearest edge when close to an edge; expands as a circle from its center otherwise | `origin: inputEl` (adapts automatically) |
| **Viewport Point** `{ x, y }` | Expands radially from the clicked point | `halo.trigger({ origin: { x: e.clientX, y: e.clientY } })` |
| **Preset Edge / Center** | `'bottom'` / `'top'` / `'left'` / `'right'` rises from an edge; `'center'` expands from the middle | `origin: 'bottom'` (default) |

### 2. Seven Built-in Palettes (`palette`)

Each palette is tuned separately for **dark mode** (brighter, more saturated) and **light mode** (softer, airy), blending four rings from inside to outside:

| Palette | Color Progression (inside → outside) | Best For |
|---|---|---|
| **`Aurora`** (default) | Blue → Violet → Pink → Peach | General AI assistants & modern web apps |
| **`Halo`** | Orange → Amber → Gold → Warm White | Warm brand tones, low-sun lens feel |
| **`Frost`** | Mint → Aqua → Lime → Ice White | Data dashboards & crisp developer tools |
| **`Spark`** | Violet → Lavender → Gold → Warm Yellow | Creative tools, highlights & inspiration moments |
| **`Ocean`** | Deep Blue → Cyan → Sky → Crisp White | Tech dashboards, blue-toned minimal workspaces |
| **`Rose`** | Rose → Blush Pink → Coral → Soft Peach | Design tools, expressive feedback & consumer apps |
| **`Silver`** | Slate Silver → Mist → Platinum → Crisp White | Monochrome UIs, hardware-inspired minimal accents |

You can also pass a custom palette: `{ dark: [[r,g,b]×4], light: [[r,g,b]×4] }`.

---

## Best Practices

> **Use the halo like punctuation, not decoration.** Because it bends the page underneath, it carries strong visual weight—save it for moments worth noticing, and keep the rest of the interface quiet.

| ✅ Use it for | ❌ Avoid using it for |
|---|---|
| **Waking up AI / Search**: clicking or focusing the input (`⌘K`) | **Passive micro-interactions**: hover states, dropdowns, tooltips |
| **Milestones & Confirmations**: submitting, publishing, AI starting/finishing a reply | **Routine list actions**: checking items, pagination, filtering, row edits |
| **Focus Mode Switches**: entering review, checkout, or full-screen mode | **Loading indicators**: the sweep lasts 1 second and isn't a spinner |

---

## API Reference

### `createShockwaveHalo(area, options)`

`area` is the container the halo sweeps across. The halo stays clipped inside it and matches its `border-radius` (make sure the container has `overflow: hidden`).

<details>
<summary><strong>Expand all configuration options</strong></summary>

| Option | Default | Description |
|---|---|---|
| `origin` | `'bottom'` | Where the halo starts: an `Element`, `{x, y}` (viewport coordinates), or `'bottom' \| 'top' \| 'left' \| 'right' \| 'center'` |
| `palette` | `'Aurora'` | `'Aurora' \| 'Halo' \| 'Frost' \| 'Spark' \| 'Ocean' \| 'Rose' \| 'Silver'`, or custom `{ dark: [[r,g,b]×4], light: [[r,g,b]×4] }` |
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
| `ignoreOutside` | `null` | Selector: clicks on matching elements outside the pill (e.g. a toolbar) do not close it |
| `onTrigger({ opened, reduced, delay })` | — | Called when clicking or focusing the pill, pressing the shortcut, or clicking inside the opened input |
| `onSubmit(text)` / `onOpen` / `onClose` | — | Submit and open/close callbacks |

- **Returned instance**: `{ el, input, open(), close(), trigger(), reset(), isOpen, destroy() }`
- **Styling**: Override colors with CSS variables: `--aip-bg`, `--aip-text`, `--aip-muted`, `--aip-faint`, `--aip-line`, `--aip-accent`, `--aip-send`, `--aip-send-fg`, `--aip-shadow`. Automatically switches to dark styling when an ancestor has `[data-theme="dark"]` or `.dark`.

---

## How It Works & Graceful Degradation

- **Zero idle cost**: When not running, the canvas stays hidden with no `requestAnimationFrame` loop. It only captures a snapshot during browser idle time after content changes (`~60–200ms` on the main thread).
- **Single-pass rendering & crisp line glints**: Reuses the cached snapshot and runs a 1-second fragment shader where pixels outside the halo band are transparent. A separate black-and-white border mask ensures a `1px` border glints as `1px` while text and icons stay untouched.
- **Cross-browser compatibility & graceful fallback**:
  - Uses `html-to-image` by default for broad browser support (and can plug into upcoming APIs like `HTML-in-Canvas` via a custom `snapshot` function).
  - Automatically falls back to **color-ring overlay only** (without page bending) if WebGL2 is unavailable, cross-origin assets aren't inlined, or `area` / a descendant is scrolled—so nothing ever breaks (attach to a non-scrolling outer frame when possible).
  - During the 1-second sweep, pixels inside the halo band come from the snapshot taken at trigger time; areas outside the band remain live.

---

## Let AI Wire It Up or Build It from Scratch

You don't need to read the shader math or figure out all the options yourself. Copy one of the quick example prompts below to **Claude Code, Codex, or Cursor**, or expand the full prompt blocks right here.

**Example prompts:**
- *"My blog uses a dark theme. Add shockwave-halo with the `Frost` palette, triggered only when someone clicks or focuses the search bar."*
- *"We have both a marketing site and a logged-in dashboard. Check where shockwave-halo fits—add it to key landing page CTAs and leave the dashboard tables untouched."*
- *"I'm building a SwiftUI iOS app. Implement the same shockwave halo effect in Metal following the Build from Scratch spec below."*

### Integrate Prompt

> Best for: **You already have a web app** (React, Vue, Svelte, vanilla HTML, Electron, Tauri) and want to drop in the ready-made library.

<details>
<summary><strong>Click to expand & copy the Integrate Prompt</strong></summary>

```text
Add the shockwave halo from https://github.com/amasun/shockwave-halo to my web app: when the AI input is clicked or focused, a faint halo of light sweeps across the page's content area from the input and fades out, bending the page a few pixels as it passes. Use the library as it is; do not copy its shader into my code. Do not change what the page does or how it looks at rest.

First read the library's README (https://github.com/amasun/shockwave-halo#readme) for the full API. Then look at my app and tell me, in a short list:
- the AI input (or whatever should trigger the halo), and what opens or focuses it;
- the content area the halo should cover: a non-scrolling element that holds the page under the toolbars, its corner radius, and whether it has `overflow: hidden`;
- any toolbars, and which edges of that area sit under one;
- how dark mode is switched (`<html data-theme>`, a `.dark` class, or something else);
- my framework and bundler.

Then ask me, one at a time, offering the default each time:
1. Trigger: focusing or clicking the AI input (default), a keyboard shortcut, sending a message, the AI starting to answer, or something else; and re-trigger while running: restart (default) or ignore.
2. Origin: the AI input (default), the point that was clicked, the middle of the area, or an edge.
3. Palette: Aurora (default), Halo, Frost, Spark, or my brand colors (then derive four rings inside to outside, with a brighter dark version and a softer light version).
4. Layers: bend, color split, edge refraction and line glints are all on by default; ask whether to turn any off.
5. Input: keep my AI input as it is (default), or replace it with the library's `ai-pill.js`.

Wait for my go-ahead, then integrate it:
- Install: `npm i github:amasun/shockwave-halo#v1.0.0 html-to-image`, then `import { createShockwaveHalo } from 'shockwave-halo'` and pass `snapshot: (el, opts) => toCanvas(el, opts)` with `toCanvas` from `html-to-image`. Without a bundler, import from `https://cdn.jsdelivr.net/gh/amasun/shockwave-halo@v1.0.0/shockwave-halo.js` instead.
- Create the halo on the content area when it mounts and call `destroy()` when it unmounts (in React, a `useEffect` with a ref; in Vue, `onMounted` / `onBeforeUnmount`; in Svelte, an action).
- Call `halo.trigger()` from the trigger I chose. If the input animates when it opens, pass `delay: 40`.
- Put the AI input, and anything else that animates or must stay above the halo, in `exclude` (a CSS selector), and give it a `z-index` above the halo's (`zIndex` option, default 5).
- Set `bevelEdges` to the edges that are not under a toolbar.
- Set `theme` so it follows my dark mode: `'auto'` covers `<html data-theme>`, `.dark` and the system setting; otherwise pass a function.
- Mark SVG strokes that are lines (graph edges, dividers), but not icons, with `data-halo-line` so they glint.
- If my content area scrolls, put the halo on a non-scrolling parent frame instead, because a scrolled area falls back to overlay-only.
- Add nothing to the page at rest, and no global CSS beyond what the library injects.

Check, and tell me what you checked:
- In dark and light mode, text under the halo stays readable and unsplit, the halo never shows on a toolbar, and the area's corners stay clean.
- `halo.mode` reads `snapshot` (not `overlay`) after the first trigger. If it reads `overlay`, say why: cross-origin images or fonts, a scrolled area, or no WebGL2.
- The trigger and origin are the ones I chose, the page works exactly as before, and nothing runs at rest.
```

</details>

### Build from Scratch

> Best for: **Building completely from scratch with a standalone prompt—no dependency on or reference to this repo.** Ideal for mobile/desktop apps (iOS Metal, Android AGSL, Flutter, Rust, etc.) or custom implementations inside your own design system.

<details>
<summary><strong>Click to expand & copy the Build from Scratch Prompt</strong></summary>

```text
Add a shockwave halo to my product: when something triggers it (by default, clicking or focusing the AI input), a faint halo of light sweeps across the page from one place and fades out, bending the page a few pixels as it passes, with a slight color split, in my dark and light modes. Build it inside my code and design system; do not change what the page does or how it looks at rest. Every value below is a default to start from, not a requirement.

First look at my app (section 0). Then ask me these one at a time, offering the default each time, and wait for each answer:
1. Trigger: what starts the halo (clicking or focusing the AI input, a keyboard shortcut, sending a message, the AI starting to answer, something else), and what happens if it is triggered again while one is running (restart, or ignore).
2. Origin: where it spreads from (the AI input, a button, the bottom edge of the page, the point that was clicked, the middle of a panel), and over which area (the page's content area, one panel, the whole window). Toolbars always stay clear.
3. Layers: the color rings (section 3) are always on; ask yes or no for each of the others: the bend (section 4), the color split, the refraction at the edges, the glints on lines and borders. The bend, the split and the refraction need the page as an image (section 6), so say what each costs on my platform.
4. Colors: one of the four palettes in section 3, or my brand colors (then derive four rings, and a dark and a light version, from them), and which modes my app has.
5. The input: leave my AI input as it is (the default), or turn it into the pill that springs open with a metal edge (section 1).
Then propose how you will build it on my platform (section 6 is a starting point, not a prescription), with the cost and any fallback, and wait for my go-ahead.

0. Start from what exists
- Find the AI input, what opens or focuses it, the page container it sits in, its corner radius, any toolbars over it, and whether the app has a dark mode.
- List what the page draws with (DOM, a canvas, a native view tree, a GPU renderer) and the platform version range: this decides how the bend can be done (section 6).

1. The input (only if I chose the pill)
- At rest: a pill 300 x 44 px, radius 22, white (dark: rgb(30 30 33)), a 1px hairline, a sparkle icon, the placeholder "Ask AI about this project" in 14px and a shortcut hint on the right. It sits centered on the page's content, 48px above the page's bottom.
- On click: the pill dips to 97% for 90ms, then springs open into a card 460 x 100, radius 16, growing from its center and keeping its bottom edge where it was. Spring: progress = 1 - exp(-8t) * cos(6t) over 580ms (barely past the end, settles by the end). The card's content is laid out at its final size from the start and is revealed as it grows; it fades in from 30% of the way. Height and radius follow the same progress.
- The open card: one line of text at 15px on a 22px line, 16px from the left, the caret first and the placeholder right after it; a hairline; then a toolbar 52px tall: a round add button, a short divider, two pickers (model, mode), and on the right a voice button and the send button, all 32px.
- Shadow: wide, soft and far, not heavy: 0 0 0 1px rgb(15 23 42 / 0.09), 0 2px 4px rgb(15 23 42 / 0.04), 0 28px 64px -16px rgb(15 23 42 / 0.22). No focus ring; focus shows only as the caret.
- The metal edge: a 1px border painted with a light silver gradient, linear-gradient(120deg, rgb(238 240 243), rgb(196 202 210) 28%, rgb(241 243 245) 50%, rgb(188 195 204) 74%, rgb(233 236 239)) (dark: rgb(74 79 87) to rgb(51 55 61)), with a highlight on top: conic-gradient(from <angle>, transparent 0 280deg, rgb(255 255 255 / 0.8) 325deg, transparent 360deg). Turn the angle from -60deg to 300deg over 900ms (ease-out) as the card opens, and fade the whole edge in and out over that time (opacity sin(pi * t), at most 0.75). Mask the gradient to the border only (mask with content-box exclude).
- Closing: back to the pill in 320ms, ease-in-out.

2. The halo's shape and timing
- The halo is a circle that grows from the origin I chose. The defaults assume the origin is the AI input at the bottom of the page: the circle's center sits below the page, horizontally at the input's center and 650px below the page's bottom edge, so what shows is a wide arc rising from the bottom.
- It starts with its middle at the page's bottom (radius 650) and grows by 800px over 1000ms, so it ends just past the page's top: radius = 650 + 800 * (1 - 2^(-9t)) / (1 - 2^(-9)). That is very fast at first and slow near the far edge.
- For another origin, keep the same timing and set the start and the growth so the halo starts at the origin and ends just past the farthest edge of the area: from a point inside the area, center the circle on the point and start at a radius of 0 to 40px; from an edge, put the center beyond that edge, about two thirds of the area's width away.
- Strength over the same time: min(1, t / 0.03) * (1 - t^2.2), so it is gone by the end and fades over its slow last stretch.
- It starts on the trigger (40ms after the input starts opening, if it opens).
- It stays in the area I chose: clip it to that area, with a straight edge under any toolbar and the area's own corner radius elsewhere (12px in the demo). It must never draw over a browser or app toolbar.

3. The rings and the palettes
- Across the halo's width sit four broad rings, one color each, inside to outside. With w = 110px and x = (distance from the center - radius) / w, ring i is centered at x = i - 1.5 with weight exp(-((x - c) / 0.8)^2); the color is the weighted average of the four, so neighbors blend softly. One fade covers all four: alpha = strength * exp(-1.1 * (x / 2)^2).
- Light mode tints the page: color = mix(page, ring, alpha * 0.24) + ring * alpha * 0.24 * 0.2.
- Dark mode adds light (screen): color = 1 - (1 - page) * (1 - ring * alpha * 0.3 * 1.5).
- Palettes, rings inside to outside. Each is tuned twice: brighter and more saturated on dark, softer on light.
  Aurora (blue through violet and pink to peach)
    dark: rgb(80 140 255), rgb(160 110 255), rgb(255 110 180), rgb(255 190 140)
    light: rgb(110 150 255), rgb(180 130 255), rgb(255 130 190), rgb(255 180 120)
  Halo (orange through amber to gold, like low sun through a lens)
    dark: rgb(255 150 60), rgb(255 190 70), rgb(255 225 120), rgb(255 245 210)
    light: rgb(255 140 50), rgb(255 175 60), rgb(245 200 80), rgb(255 225 150)
  Frost (mint and aqua with a touch of lime)
    dark: rgb(80 220 175), rgb(70 195 225), rgb(180 240 150), rgb(235 255 245)
    light: rgb(40 190 150), rgb(50 170 210), rgb(140 210 90), rgb(180 235 215)
  Spark (violet into gold)
    dark: rgb(140 100 255), rgb(200 130 255), rgb(255 200 110), rgb(255 235 170)
    light: rgb(130 95 240), rgb(185 125 245), rgb(245 185 80), rgb(250 215 120)

4. The bend
- The whole halo bends the page as one lens, never ring by ring (ring by ring reads as water ripples). With z = x * 0.75: push = 7px * 2.33 * z * exp(-z^2), along the direction away from the circle's center; read the page at position - push. Outside the halo's middle the page stretches, inside it squeezes, over about the width of the rings and no wider.
- Color split: at most a trace. Read red at 1.08 times the offset and blue at 0.92 times; text must stay clean.
- The frame holds the page: fade the lens to nothing over the last 56px before the page's edge, so the edge stays straight.
- The page's lines catch the light: where the halo passes, its rules, borders and the outlines of chips, cards and nodes brighten toward the ring color (mixed 20% toward white), at the halo's strength times exp(-1.4 * (x / 2)^2) times 0.3 on light and 0.14 on dark (a faint glint, not a redrawn border), read at their bent position so the glint follows them. Text and icons never light up. To find the lines, use a second capture of the page with every rule and border drawn white at its own width on black, and nothing else (no text, icons, pictures, fills or shadows); light the page where that capture is white, so a 1px border glints as 1px. Without a capture (a retrofit in the DOM), give each bordered element and divider a CSS variable from 0 to 1 by its distance to the halo's front each frame, and mix its border color toward the ring color by it.
- The edge as a glass bevel: at the sides and the bottom (not under a toolbar), where the halo reaches the edge, read the last 60px of the page from up to 22px further in (22 * (1 - d/60)^2 * the halo's strength there), so content beside the edge stretches toward it. Where the halo meets the edge, add a thin line of light (exp(-d / 7)) in the ring color mixed 45% toward white.

5. Rhythm
- On the trigger: if the input opens, it dips to 97% for 90ms, springs open (580ms) and its edge highlight turns (900ms); the halo leaves 40ms after the opening starts and runs 1000ms. Without the input, the halo runs on the trigger.
- Switching between dark and light cross-fades the halo's colors with the page; never cut.
- Reduced motion: no bend, no split and no glints; the halo fades in and out in place at half strength over 600ms.
- Draw only while the halo runs; nothing at rest.

6. How to build it, by platform
These are suggestions from what worked in the demo and what each platform offers; check them against my stack and its versions, and choose what fits. The halo itself (the rings, and the glints on lines and edges) is only an overlay and works anywhere. The bend needs the page as an image to sample from.
- Web, as in the demo: a WebGL2 canvas over the page draws everything in one fragment pass from a snapshot of the page. Cap the pixel ratio at 2; the canvas ignores pointer events and is removed or hidden at rest.
- Web, getting the snapshot:
  - HTML-in-Canvas (WICG): a canvas with the page as its child, drawn with drawElementImage() or uploaded as a WebGL texture, live and with real browser rendering. Behind the canvas-draw-element flag in recent Chromium and reported on by default from Chrome 157; no Firefox or Safari yet. Use it where present.
  - SVG foreignObject libraries (html-to-image, modern-screenshot): the browser renders the clone, so it is faithful, but images and fonts must be inlined or same-origin, the root needs a background color, and backdrop-filter is unreliable. Take it once on click (tens to a few hundred ms), then animate.
  - html2canvas (or html2canvas-pro): it re-implements CSS on a canvas, so modern effects (backdrop-filter, some gradients, oklch) may come out wrong. A last resort.
  - Fallback without a snapshot: draw only the halo in a transparent canvas over the page (light mode: normal alpha; dark mode: mix-blend-mode: screen or plus-lighter), and skip the bend. In Chromium only, a bend is possible with backdrop-filter pointing at an SVG filter with feDisplacementMap, at a cost.
- iOS (SwiftUI, iOS 17+): put the halo in a Metal [[stitchable]] function and apply .layerEffect(shader, maxSampleOffset: CGSize(width: 30, height: 30)) to the page view: it can sample the view at bent positions and add the color, live. Drive radius and strength from a TimelineView or an animatable value. Below iOS 17: an overlay with an AngularGradient and blur, without the bend.
- Android (API 33+): write the shader in AGSL as a RuntimeShader with a uniform shader named for the content, and set view.setRenderEffect(RenderEffect.createRuntimeShaderEffect(shader, "content")) on the page's root (in Compose: Modifier.graphicsLayer { renderEffect = ...asComposeRenderEffect() }). Update its uniforms every frame. Below 33: an overlay only.
- Flutter (Impeller): a FragmentProgram with ImageFilter.shader inside a BackdropFilter clipped to the page; the engine passes the content as sampler 0 and its size as the first vec2. Use FlutterFragCoord(), flip y on GLES, and check ImageFilter.isShaderFilterSupported, with an overlay-only fallback.
- Rust: render the UI into an offscreen texture, then draw one fullscreen pass with the same shader ported to WGSL that samples it.
  - wgpu by hand: render target texture with TEXTURE_BINDING usage, a fullscreen triangle, uniforms in one buffer.
  - Bevy: a custom post-processing node; call post_process_write() on the ViewTarget to get the source and destination textures, as in Bevy's custom post-processing example.
  - egui or iced on wgpu: render the frame into a texture through the renderer's wgpu callback and composite with the shader; their widgets cannot sample what is under them by themselves.
- Electron and Tauri: the web route; Electron can also take a snapshot with webContents.capturePage().

7. Check
- Dark and light, in the colors I chose: the text under the halo stays readable and unsplit; the halo never shows on a toolbar; the area's corners stay clean; the bend is no wider than the rings.
- The trigger and the origin are the ones I chose, and the page works exactly as before.
- It runs only while the halo is visible and costs nothing at rest.
```

</details>
