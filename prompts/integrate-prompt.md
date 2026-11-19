# Integrate prompt（接入现成组件）

把下面这段交给 AI 编码助手（Claude Code、Codex、Cursor 等），它会把 `shockwave-halo` 接进你现有的 Web 项目，适用于 React、Vue、Svelte、原生 HTML、Electron、Tauri。iOS、Android 等原生平台请改用 [spec-prompt.md](spec-prompt.md) 从零实现。

---

Add the shockwave halo from https://github.com/amasun/shockwave-halo to my web app: when a moment I choose happens (by default, the AI input being clicked or focused), a faint halo of light sweeps across the page's content area from where it happened and fades out, bending the page a few pixels as it passes. Use the library as it is; do not copy its shader into my code. Do not change what the page does or how it looks at rest.

First read the library's README (https://github.com/amasun/shockwave-halo#readme), then the commented option lists at the top of https://github.com/amasun/shockwave-halo/blob/main/shockwave-halo.js (`DEFAULTS`) and https://github.com/amasun/shockwave-halo/blob/main/ai-pill.js (the `o = {...}` block) for every option and its default. Then look at my app and tell me, in a short list:
- the moments in my app that could trigger it (an AI or search input being focused or sent, a form submit, a success or error message, a switch of mode, view or route, a notification arriving, a button press), and the element or event behind each;
- the content area the halo should cover: a non-scrolling element that holds the page under the toolbars, its corner radius, and whether it has `overflow: hidden`;
- any toolbars, and which edges of that area sit under one;
- how dark mode is switched (`<html data-theme>`, a `.dark` class, or something else);
- my framework and bundler.

Then ask me, one at a time, offering the default each time:
1. Trigger: which of those moments should fire it (default: focusing or clicking the AI input, if there is one), or others such as a keyboard shortcut, sending a message, the AI starting to answer, a successful save or publish, entering a focused view; and re-trigger while running: restart (default) or ignore.
2. Origin: the element that caused it (default), the point that was clicked, the middle of the area, or an edge.
3. Palette: Aurora (default), Halo, Frost, Spark, or my brand colors (then derive four rings inside to outside, with a brighter dark version and a softer light version).
4. Layers: bend, color split, edge refraction and line glints are all on by default, and a dot-matrix wave (a faint grid of white or black dots that rides the wave, as circles, squares, four-point stars, crosses or grid lines) is off by default; ask whether to turn any off, or the dot matrix on.
5. Input (only if the trigger is an AI input): keep my AI input as it is (default), or replace it with the library's `ai-pill.js`.

Wait for my go-ahead, then integrate it:
- Install: `npm i github:amasun/shockwave-halo#v1.0.0 html-to-image`, then `import { createShockwaveHalo } from 'shockwave-halo'` and pass `snapshot: (el, opts) => toCanvas(el, opts)` with `toCanvas` from `html-to-image`. Without a bundler, import from `https://cdn.jsdelivr.net/gh/amasun/shockwave-halo@v1.0.0/shockwave-halo.js` instead.
- Create the halo on the content area when it mounts and call `destroy()` when it unmounts (in React, a `useEffect` with a ref; in Vue, `onMounted` / `onBeforeUnmount`; in Svelte, an action).
- Call `halo.trigger({ origin })` from each trigger I chose, passing the element or point that caused it. If that element animates when it opens, pass `delay: 40`.
- Put anything that animates or must stay above the halo (an AI input, a floating button) in `exclude` (a CSS selector), and give it a `z-index` above the halo's (`zIndex` option, default 5).
- Set `bevelEdges` to the edges that are not under a toolbar.
- Set `theme` so it follows my dark mode: `'auto'` covers `<html data-theme>`, `.dark` and the system setting; otherwise pass a function.
- Mark SVG strokes that are lines (graph edges, dividers), but not icons, with `data-halo-line` so they glint.
- If my content area scrolls, put the halo on a non-scrolling parent frame instead, because a scrolled area falls back to overlay-only.
- If parts of the area keep updating by themselves (clocks, live counters, streaming text), put them in `exclude`, or set `watch: false` so the halo only takes its snapshot when it is triggered; otherwise it re-snapshots about every half second.
- Add nothing to the page at rest, and no global CSS beyond what the library injects.

Check, and tell me what you checked:
- In dark and light mode, text under the halo stays readable and unsplit, the halo never shows on a toolbar, and the area's corners stay clean.
- `halo.mode` reads `snapshot` (not `overlay`) after the first trigger. If it reads `overlay`, say why: cross-origin images or fonts, a scrolled area, or no WebGL2.
- The trigger and origin are the ones I chose, the page works exactly as before, and nothing runs at rest.
