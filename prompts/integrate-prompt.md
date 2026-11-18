# Integrate prompt（接入现成组件）

把下面这段交给 AI 编码助手（Claude Code、Codex、Cursor 等），它会把 `shockwave-halo` 接进你现有的 Web 项目，适用于 React、Vue、Svelte、原生 HTML、Electron、Tauri。iOS、Android 等原生平台请改用 [spec-prompt.md](spec-prompt.md) 从零实现。

---

Add the shockwave halo from https://github.com/amasun/shockwave-halo to my web app: when the AI input is clicked or focused, a faint halo of light sweeps across the page's content area from the input and fades out, bending the page a few pixels as it passes. Use the library as it is; do not copy its shader into my code. Do not change what the page does or how it looks at rest.

First read the library's README (https://github.com/amasun/shockwave-halo#readme), then the commented option lists at the top of https://github.com/amasun/shockwave-halo/blob/main/shockwave-halo.js (`DEFAULTS`) and https://github.com/amasun/shockwave-halo/blob/main/ai-pill.js (the `o = {...}` block) for every option and its default. Then look at my app and tell me, in a short list:
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
