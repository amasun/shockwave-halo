/**
 * Shockwave Halo — a faint halo of light that sweeps across an area, bending the page as it passes.
 * Framework-agnostic ES module. WebGL2 + page snapshot (html-to-image); overlay-only fallback.
 *
 *   import { createShockwaveHalo } from './shockwave-halo.js';
 *   const halo = createShockwaveHalo(document.querySelector('#content'), { origin: inputEl, exclude: '.ai-input' });
 *   inputEl.addEventListener('focus', () => halo.trigger());
 */

export const PALETTES = {
  Aurora: { dark: [[80,140,255],[160,110,255],[255,110,180],[255,190,140]], light: [[110,150,255],[180,130,255],[255,130,190],[255,180,120]] },
  Halo:   { dark: [[255,150,60],[255,190,70],[255,225,120],[255,245,210]],  light: [[255,140,50],[255,175,60],[245,200,80],[255,225,150]] },
  Frost:  { dark: [[80,220,175],[70,195,225],[180,240,150],[235,255,245]],  light: [[40,190,150],[50,170,210],[140,210,90],[180,235,215]] },
  Spark:  { dark: [[140,100,255],[200,130,255],[255,200,110],[255,235,170]], light: [[130,95,240],[185,125,245],[245,185,80],[250,215,120]] },
  Ocean:  { dark: [[60,120,255],[50,185,255],[120,225,255],[220,245,255]],  light: [[75,130,245],[65,175,240],[115,210,245],[185,230,250]] },
  Rose:   { dark: [[245,75,130],[255,120,155],[255,175,170],[255,225,225]], light: [[230,80,125],[245,115,145],[250,165,160],[255,210,205]] },
  Silver: { dark: [[150,170,210],[190,205,230],[225,232,245],[255,255,255]], light: [[135,150,180],[165,178,205],[195,205,225],[225,232,242]] },
};

const DEFAULTS = {
  origin: 'bottom',          // Element | {x,y} (client px) | 'bottom'|'top'|'left'|'right'|'center'
  palette: 'Aurora',         // palette name | { dark: [[r,g,b]×4], light: [[r,g,b]×4] }
  theme: 'auto',             // 'auto' | 'light' | 'dark' | () => 'light'|'dark'
  layers: { bend: true, split: true, bevel: true, glints: true, dots: false },   // dots = the optional dot-matrix wave (off by default)
  bevelEdges: ['left', 'right', 'bottom'],   // edges that act as glass (never the edge under a toolbar)
  duration: 1000,            // ms
  ringWidth: 110,            // px, w
  bendPx: 7,                 // px, lens strength
  dotShape: 'circle',        // dot-matrix layer: 'circle' | 'square' | 'star' (four-point) | 'cross' | 'grid'
  dotSpacing: 14,            // px between dot centres
  dotSize: 1.2,              // px, dot radius at the crest of the wave (dots grow towards the crest and shrink away from it)
  dotOpacity: 0.22,          // 0-1, alpha at the crest
  dotTone: 'auto',           // 'auto' (white on dark, black on light) | 'white' | 'black'
  arcDepth: null,            // px; edge origins put the centre this far beyond the edge (default ⅔ of the edge length)
  retrigger: 'restart',      // 'restart' | 'ignore'
  reducedMotion: 'auto',     // 'auto' | true | false
  exclude: null,             // selector: elements kept out of the snapshot (e.g. the AI input that animates)
  svgLines: '[data-halo-line]', // selector: SVG strokes that count as lines for glints (icons never do)
  snapshot: 'auto',          // 'auto' (html-to-image) | false (overlay only) | async (area, opts) => canvas
  watch: true,               // re-snapshot after DOM mutations inside the area (debounced, idle)
  maxDpr: 2,
  zIndex: 5,
  themeFadeMs: 400,
  onStart: null, onEnd: null,
};

const H2I_CDN = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm';

const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D uPage, uLines;
uniform vec2 uRes; uniform float uDpr;
uniform vec4 uB;      // snapshot origin of the padding box (border left, top) and snapshot size, CSS px
uniform vec2 uC; uniform float uR, uS, uW, uPx;
uniform vec3 uPD[4], uPL[4];
uniform float uDark, uBend, uSplit, uGlint, uHasTex, uDotOn, uDotTone;
uniform vec4 uDot;     // dot spacing, dot radius at the crest, opacity at the crest, shape id
uniform vec4 uBevel;   // left, right, bottom, top
out vec4 o;
vec3 ring(float x, vec3 P[4]){
  vec3 acc = vec3(0.); float ws = 0.;
  for (int i = 0; i < 4; i++) { float w = exp(-pow((x - (float(i) - 1.5)) / 0.8, 2.)); acc += P[i] * w; ws += w; }
  return acc / max(ws, 1e-5);
}
vec4 page(vec2 q){ q = clamp(q, vec2(0.), uRes); return texture(uPage, (q + uB.xy) / uB.zw); }
// signed distance in px to the dot shape centred at the origin (negative inside); r is the dot radius
float dotSdf(vec2 q, float r, float shape){
  if (shape < .5) return length(q) - r;                                          // circle
  if (shape < 1.5) return max(abs(q.x), abs(q.y)) - r;                           // square
  if (shape < 2.5) { float R = r * 2.2; vec2 a = abs(q) / max(R, 1e-3); return (sqrt(a.x) + sqrt(a.y) - 1.) * R * .5; }   // four-point star
  if (shape < 3.5) { float t = r * .38, l = r * 1.5; return min(max(abs(q.x) - l, abs(q.y) - t), max(abs(q.x) - t, abs(q.y) - l)); }   // cross
  return min(abs(q.x), abs(q.y)) - r * .4;                                       // grid lines
}
// translucent white or black dots laid over what is already drawn (premultiplied alpha)
vec4 withDots(vec4 b, float ad){ float tone = uDotTone < 0. ? uDark : uDotTone; return vec4(b.rgb * (1. - ad) + vec3(tone) * ad, b.a * (1. - ad) + ad); }
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 d = p - uC; float dist = length(d); vec2 dir = d / max(dist, 1e-3);
  float x = (dist - uR) / uW;
  float cover = 1. - smoothstep(3.4, 4.4, abs(x));
  if (cover <= 0. || uS <= 0.) { o = vec4(0.); return; }
  float a = uS * exp(-1.1 * pow(x * .5, 2.));
  vec3 rD = ring(x, uPD), rL = ring(x, uPL);

  // dot-matrix wave: a fixed grid, drawn only where the wave passes, growing towards the crest (x = 0)
  float ad = 0.;
  if (uDotOn > .5) {
    float s = max(uDot.x, 2.);
    vec2 g = (fract(p / s) - .5) * s;
    float prof = exp(-.8 * x * x);
    float px = 1. / uDpr;
    float cov = smoothstep(px * .75, -px * .75, dotSdf(g, uDot.y * prof, uDot.w));
    ad = clamp(uDot.z * prof * uS * cov, 0., 1.) * cover;
  }

  float dl = p.x, dr = uRes.x - p.x, db = uRes.y - p.y, dt = p.y;
  float lens = smoothstep(0., 56., min(min(dl, dr), min(db, dt)));
  float z = x * .75;
  vec2 off = dir * (uPx * 2.33 * z * exp(-z * z) * uS * lens * uBend);

  vec2 bev = vec2(0.);
  if (dl < 60.) bev.x += uBevel.x * 22. * pow(1. - dl / 60., 2.) * a;
  if (dr < 60.) bev.x -= uBevel.y * 22. * pow(1. - dr / 60., 2.) * a;
  if (db < 60.) bev.y -= uBevel.z * 22. * pow(1. - db / 60., 2.) * a;
  if (dt < 60.) bev.y += uBevel.w * 22. * pow(1. - dt / 60., 2.) * a;
  float ed = 1e5;
  if (uBevel.x > .5) ed = min(ed, dl);
  if (uBevel.y > .5) ed = min(ed, dr);
  if (uBevel.z > .5) ed = min(ed, db);
  if (uBevel.w > .5) ed = min(ed, dt);
  float eline = exp(-ed / 7.) * a;

  if (uHasTex < .5) {               // overlay only: no snapshot
    float k = a * .24;
    vec3 cl = rL * k * 1.2 + mix(rL, vec3(1.), .45) * eline * .5;
    vec3 cd = rD * a * .45 + mix(rD, vec3(1.), .45) * eline * .5;
    float al = (k + eline * .5) * (1. - uDark);   // alpha 0 on dark = additive, close to screen
    o = withDots(vec4(mix(cl, cd, uDark), al) * cover, ad);
    return;
  }

  vec2 q = p - off + bev;
  float sp = .08 * uSplit;
  vec3 c;
  c.r = page(p - off * (1. + sp) + bev).r;
  c.g = page(q).g;
  c.b = page(p - off * (1. - sp) + bev).b;

  float L = texture(uLines, clamp(q / uRes, vec2(0.), vec2(1.))).r;
  float g = uS * exp(-1.4 * pow(x * .5, 2.)) * mix(.3, .14, uDark) * uGlint * L;

  vec3 pl = mix(c, mix(rL, vec3(1.), .2), g);
  vec3 cl = mix(pl, rL, a * .24) + rL * a * .24 * .2;
  cl = mix(cl, mix(rL, vec3(1.), .45), eline * .6);
  vec3 pd = mix(c, mix(rD, vec3(1.), .2), g);
  vec3 cd = 1. - (1. - pd) * (1. - rD * a * .3 * 1.5);
  cd = 1. - (1. - cd) * (1. - mix(rD, vec3(1.), .45) * eline * .6);

  o = withDots(vec4(clamp(mix(cl, cd, uDark), 0., 1.), 1.) * cover, ad);
}`;

const UNIFORMS = ['uPage','uLines','uRes','uDpr','uB','uC','uR','uS','uW','uPx','uPD','uPL','uDark','uBend','uSplit','uGlint','uHasTex','uBevel','uDot','uDotOn','uDotTone'];
const DOT_SHAPES = ['circle', 'square', 'star', 'cross', 'grid'];

function detectDark() {
  const h = document.documentElement;
  const t = h.dataset.theme || (h.classList.contains('dark') ? 'dark' : h.classList.contains('light') ? 'light' : '');
  if (t) return t === 'dark';
  return matchMedia('(prefers-color-scheme: dark)').matches;
}

const isTransparent = c => c === 'transparent' || /rgba?\([^)]*[,/]\s*0(\.0+)?\s*\)$/.test(c);

function svgPath(el) {
  const n = el.tagName.toLowerCase(), A = k => parseFloat(el.getAttribute(k)) || 0;
  if (n === 'path') return new Path2D(el.getAttribute('d') || '');
  const p = new Path2D();
  if (n === 'line') { p.moveTo(A('x1'), A('y1')); p.lineTo(A('x2'), A('y2')); }
  else if (n === 'rect') { p.roundRect ? p.roundRect(A('x'), A('y'), A('width'), A('height'), A('rx')) : p.rect(A('x'), A('y'), A('width'), A('height')); }
  else if (n === 'circle') p.arc(A('cx'), A('cy'), A('r'), 0, Math.PI * 2);
  else if (n === 'ellipse') p.ellipse(A('cx'), A('cy'), A('rx'), A('ry'), 0, 0, Math.PI * 2);
  else if (n === 'polyline' || n === 'polygon') {
    const v = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
    for (let i = 0; i + 1 < v.length; i += 2) i ? p.lineTo(v[i], v[i + 1]) : p.moveTo(v[i], v[i + 1]);
    if (n === 'polygon') p.closePath();
  } else return null;
  return p;
}

export function createShockwaveHalo(area, options = {}) {
  if (!(area instanceof HTMLElement)) throw new TypeError('createShockwaveHalo: area must be an HTMLElement');
  let o = { ...DEFAULTS, ...options, layers: { ...DEFAULTS.layers, ...(options.layers || {}) } };

  if (getComputedStyle(area).position === 'static') area.style.position = 'relative';
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.shockwaveHalo = '';
  canvas.style.cssText = `position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;display:none;border-radius:inherit;z-index:${o.zIndex}`;
  area.appendChild(canvas);

  const dpr = () => Math.min(o.maxDpr, devicePixelRatio || 1);
  const isExcluded = n => !n || n === canvas || !!(o.exclude && n.closest && n.closest(o.exclude));

  /* ---------- GL ---------- */
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false, alpha: true });
  let U = {}, texPage, texLines, glOK = false;
  try {
    if (!gl) throw new Error('WebGL2 unavailable');
    const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const n of UNIFORMS) U[n] = gl.getUniformLocation(prog, n);
    const mk = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); return t; };
    texPage = mk(); texLines = mk();
    gl.uniform1i(U.uPage, 0); gl.uniform1i(U.uLines, 1);
    glOK = true;
  } catch (e) { console.warn('[shockwave-halo]', e.message); }

  /* ---------- theme (cross-fades, never cuts) ---------- */
  const themeIsDark = () => typeof o.theme === 'function' ? o.theme() === 'dark' : o.theme === 'auto' ? detectDark() : o.theme === 'dark';
  let lastDark = themeIsDark(), darkFrom = +lastDark, darkTo = +lastDark, darkT0 = 0;
  const darkNow = now => darkFrom + (darkTo - darkFrom) * Math.min(1, (now - darkT0) / o.themeFadeMs);
  function syncTheme() {
    const d = themeIsDark(); if (d === lastDark) return;
    const now = performance.now(); darkFrom = darkNow(now); darkTo = +d; darkT0 = now; lastDark = d;
    invalidate(o.themeFadeMs + 60);
  }
  const themeMO = new MutationObserver(syncTheme);
  themeMO.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
  const mqDark = matchMedia('(prefers-color-scheme: dark)'); mqDark.addEventListener('change', syncTheme);
  const mqRM = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => o.reducedMotion === 'auto' ? mqRM.matches : !!o.reducedMotion;

  /* ---------- snapshot ---------- */
  const snap = { ok: false, dirty: true, busy: null, ms: 0, mode: 'none', pw: 0, ph: 0 };
  let dirtyTimer = 0, h2i = null;
  async function snapshotFn() {
    if (typeof o.snapshot === 'function') return o.snapshot;
    if (o.snapshot === false) return null;
    if (!h2i) h2i = window.htmlToImage || await import(/* @vite-ignore */ H2I_CDN).catch(() => null);
    if (!h2i) return null;
    return (el, opts) => h2i.toCanvas(el, opts);
  }

  // Second capture: every rule and border white at its own width on black — nothing else.
  function drawLines(w, h, r) {
    const c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(h * r);
    const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = x.strokeStyle = '#fff';
    const ar = area.getBoundingClientRect(), ox = ar.left + area.clientLeft, oy = ar.top + area.clientTop;
    let scrolled = false;
    const svgSel = o.svgLines;
    for (const el of area.querySelectorAll('*')) {
      if (isExcluded(el)) continue;
      if (el.scrollTop || el.scrollLeft) scrolled = true;
      if (el instanceof SVGElement) {
        if (!(el instanceof SVGGeometryElement) || !svgSel || !el.closest(svgSel)) continue;
        const cs = getComputedStyle(el); if (cs.stroke === 'none' || isTransparent(cs.stroke)) continue;
        const m = el.getScreenCTM(), path = svgPath(el); if (!m || !path) continue;
        x.setTransform(r * m.a, r * m.b, r * m.c, r * m.d, r * (m.e - ox), r * (m.f - oy));
        x.lineWidth = parseFloat(cs.strokeWidth) || 1; x.stroke(path);
        continue;
      }
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const bw = ['Top','Right','Bottom','Left'].map(s => cs[`border${s}Style`] !== 'none' && !isTransparent(cs[`border${s}Color`]) ? parseFloat(cs[`border${s}Width`]) || 0 : 0);
      if (!bw.some(Boolean)) continue;
      const b = el.getBoundingClientRect(); if (!b.width || !b.height) continue;
      const L = b.left - ox, T = b.top - oy, rad = parseFloat(cs.borderTopLeftRadius) || 0;
      x.setTransform(r, 0, 0, r, 0, 0);
      if (bw.every(v => v === bw[0])) {
        const k = bw[0]; x.lineWidth = k; x.beginPath();
        x.roundRect(L + k / 2, T + k / 2, b.width - k, b.height - k, Math.max(0, Math.min(rad - k / 2, (b.height - k) / 2, (b.width - k) / 2))); x.stroke();
      } else {
        if (bw[0]) x.fillRect(L, T, b.width, bw[0]);
        if (bw[2]) x.fillRect(L, T + b.height - bw[2], b.width, bw[2]);
        if (bw[3]) x.fillRect(L, T, bw[3], b.height);
        if (bw[1]) x.fillRect(L + b.width - bw[1], T, bw[1], b.height);
      }
    }
    if (area.scrollTop || area.scrollLeft) scrolled = true;
    return { canvas: c, scrolled };
  }

  function capture() {
    if (snap.busy) return snap.busy;
    if (!glOK) { snap.ok = false; snap.dirty = false; snap.mode = 'overlay'; return Promise.resolve(snap); }
    const t0 = performance.now();
    snap.dirty = false;
    snap.busy = (async () => {
      const fn = await snapshotFn();
      const r = dpr(), w = area.clientWidth, h = area.clientHeight;
      const lines = drawLines(w, h, r);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texLines);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, lines.canvas);
      // A clone loses scroll positions, so a scrolled area can't be sampled faithfully: overlay only.
      if (!fn || lines.scrolled) { snap.ok = false; snap.mode = fn ? 'overlay (scrolled)' : 'overlay'; return; }
      const page = await fn(area, {
        pixelRatio: r, skipFonts: true, width: area.offsetWidth, height: area.offsetHeight,
        backgroundColor: getComputedStyle(area).backgroundColor, style: { margin: '0' },
        filter: n => !(n.nodeType === 1 && isExcluded(n)),
      });
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texPage);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, page);
      // map by the snapshot's real pixel size so texels line up 1:1 with the canvas
      snap.pw = page.width / r; snap.ph = page.height / r;
      snap.ok = true; snap.mode = 'snapshot';
    })().catch(e => { console.warn('[shockwave-halo] snapshot failed, overlay only:', e); snap.ok = false; snap.mode = 'overlay'; })
      .finally(() => { snap.ms = Math.round(performance.now() - t0); snap.busy = null; if (snap.dirty) invalidate(); });
    return snap.busy.then(() => snap);
  }

  function invalidate(delay = 300) {
    snap.dirty = true; clearTimeout(dirtyTimer);
    dirtyTimer = setTimeout(() => {
      if (running) return;   // re-captured when the run ends
      const go = () => capture();
      window.requestIdleCallback ? requestIdleCallback(go, { timeout: 800 }) : go();
    }, delay);
  }

  const ro = new ResizeObserver(() => invalidate(150)); ro.observe(area);
  const onScroll = () => invalidate(200);
  area.addEventListener('scroll', onScroll, { capture: true, passive: true });
  let mo = null;
  if (o.watch) {
    mo = new MutationObserver(list => { if (list.some(m => !isExcluded(m.target.nodeType === 1 ? m.target : m.target.parentElement))) invalidate(500); });
    mo.observe(area, { subtree: true, childList: true, attributes: true, characterData: true });
  }
  // Typed text, checkbox/radio/select state and focus are element properties or pseudo-states, not DOM changes, so the
  // observer never sees them. Without this, a login form snapshotted at 3 typed characters still shows 3 when 6 are typed.
  const FORM_EVENTS = ['input', 'change', 'focusin', 'focusout'];
  const onFormEvent = e => { if (!isExcluded(e.target)) invalidate(250); };
  if (o.watch) FORM_EVENTS.forEach(t => area.addEventListener(t, onFormEvent, true));

  /* ---------- geometry ---------- */
  function geometry(origin, w, h) {
    const ar = area.getBoundingClientRect(), ox = ar.left + area.clientLeft, oy = ar.top + area.clientTop;
    const far = (cx, cy) => Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy));
    const edgeArc = (edge, along) => {
      const D = o.arcDepth ?? Math.round((edge === 'left' || edge === 'right' ? h : w) * 2 / 3);
      const c = edge === 'bottom' ? [along, h + D] : edge === 'top' ? [along, -D] : edge === 'left' ? [-D, along] : [w + D, along];
      return { c, R0: D, G: far(c[0], c[1]) - D + 40 };
    };
    const point = (px, py) => ({ c: [px, py], R0: 20, G: far(px, py) - 20 + 40 });
    if (typeof origin === 'string') {
      if (origin === 'center') return point(w / 2, h / 2);
      return edgeArc(origin, origin === 'left' || origin === 'right' ? h / 2 : w / 2);
    }
    if (origin instanceof Element) {
      const b = origin.getBoundingClientRect();
      const cx = b.left + b.width / 2 - ox, cy = b.top + b.height / 2 - oy;
      const dists = { bottom: h - cy, top: cy, left: cx, right: w - cx };
      const [edge, dist] = Object.entries(dists).sort((a, b) => a[1] - b[1])[0];
      // close to an edge → a wide arc rising from that edge; otherwise a circle from the element's centre
      if (dist < Math.min(w, h) * 0.25) return edgeArc(edge, edge === 'left' || edge === 'right' ? cy : cx);
      return point(cx, cy);
    }
    if (origin && typeof origin.x === 'number') return point(origin.x - ox, origin.y - oy);
    return edgeArc('bottom', w / 2);
  }

  /* ---------- run ---------- */
  let running = false, start = 0, dur = 1000, runReduced = false, runOrigin = o.origin, raf = 0, hold = null;
  function resize() { const r = dpr(); canvas.width = Math.round(area.clientWidth * r); canvas.height = Math.round(area.clientHeight * r); }

  function trigger({ origin, delay = 0 } = {}) {
    if (running && o.retrigger === 'ignore') return Promise.resolve(false);
    const begin = () => {
      runReduced = reduced(); dur = runReduced ? 600 : o.duration;
      runOrigin = origin ?? o.origin;
      start = performance.now() + delay;
      if (!running) {
        running = true; resize();
        canvas.style.top = area.scrollTop + 'px'; canvas.style.left = area.scrollLeft + 'px';
        canvas.style.display = 'block'; o.onStart?.();
      }
      loop();
      return true;
    };
    // watch:false means "don't track changes": take a fresh snapshot at every trigger instead of trusting an old one
    if ((snap.dirty || !o.watch) && glOK) {
      const t = performance.now();
      return capture().then(() => { delay = Math.max(0, delay - (performance.now() - t)); return begin(); });
    }
    return Promise.resolve(begin());
  }

  function stop() {
    if (!running) return;
    running = false; cancelAnimationFrame(raf); raf = 0;
    canvas.style.display = 'none';
    if (glOK) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
    o.onEnd?.();
    if (snap.dirty) invalidate(50);
  }

  const toVec = a => a.flat().map(v => v / 255);
  function frame(now) {
    raf = 0;
    if (!running) return;
    const t = hold ?? (now - start) / dur;
    if (t >= 1) { stop(); return; }
    if (!glOK) { loop(); return; }
    const w = area.clientWidth, h = area.clientHeight, r = dpr();
    const { c, R0, G } = geometry(runOrigin, w, h);
    let R, S;
    if (t < 0) { R = R0; S = 0; }
    else if (runReduced) { R = R0 + G * 0.5; S = 0.5 * Math.sin(Math.PI * t); }
    else { R = R0 + G * (1 - 2 ** (-9 * t)) / (1 - 2 ** -9); S = Math.min(1, t / 0.03) * (1 - t ** 2.2); }
    const pal = typeof o.palette === 'string' ? (PALETTES[o.palette] || PALETTES.Aurora) : o.palette;
    const L = o.layers, motion = runReduced ? 0 : 1, be = o.bevelEdges;
    const bev = (L.bevel ? motion : 0);

    if (canvas.width !== Math.round(w * r) || canvas.height !== Math.round(h * r)) resize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uRes, w, h);
    gl.uniform1f(U.uDpr, r);
    gl.uniform4f(U.uB, area.clientLeft, area.clientTop, snap.pw || area.offsetWidth, snap.ph || area.offsetHeight);
    gl.uniform2f(U.uC, c[0], c[1]); gl.uniform1f(U.uR, R); gl.uniform1f(U.uS, S);
    gl.uniform1f(U.uW, o.ringWidth); gl.uniform1f(U.uPx, o.bendPx);
    gl.uniform3fv(U.uPD, toVec(pal.dark)); gl.uniform3fv(U.uPL, toVec(pal.light));
    gl.uniform1f(U.uDark, darkNow(now));
    gl.uniform1f(U.uBend, L.bend ? motion : 0);
    gl.uniform1f(U.uSplit, L.split ? motion : 0);
    gl.uniform1f(U.uGlint, L.glints ? motion : 0);
    gl.uniform4f(U.uBevel, be.includes('left') * bev, be.includes('right') * bev, be.includes('bottom') * bev, be.includes('top') * bev);
    gl.uniform1f(U.uHasTex, snap.ok ? 1 : 0);
    gl.uniform1f(U.uDotOn, L.dots ? motion : 0);
    gl.uniform4f(U.uDot, o.dotSpacing, o.dotSize, o.dotOpacity, Math.max(0, DOT_SHAPES.indexOf(o.dotShape)));
    gl.uniform1f(U.uDotTone, o.dotTone === 'white' ? 1 : o.dotTone === 'black' ? 0 : -1);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texPage);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texLines);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    loop();
  }
  const loop = () => { if (!raf) raf = requestAnimationFrame(frame); };

  // first snapshot once fonts are in
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => invalidate(150));

  return {
    /** Start the halo. origin overrides the default for this run; delay in ms. */
    trigger,
    /** Stop immediately. */
    stop,
    /** Tell the halo the page changed (re-snapshot when idle). */
    invalidate,
    /** Take the snapshot now; resolves to { ok, mode, ms }. */
    capture,
    /** Merge new options (palette, layers, origin, theme, …). */
    setOptions(next = {}) { o = { ...o, ...next, layers: { ...o.layers, ...(next.layers || {}) } }; if ('theme' in next) syncTheme(); },
    get running() { return running; },
    get mode() { return glOK ? snap.mode : 'overlay (no WebGL2)'; },
    get snapshotMs() { return snap.ms; },
    /** Debug: freeze the sweep at t∈[0,1); pass null to release. */
    debugHold(t) { hold = t; if (t == null) start = performance.now() - dur * 0.9; else if (!running) trigger(); },
    destroy() {
      stop(); clearTimeout(dirtyTimer); ro.disconnect(); mo?.disconnect(); themeMO.disconnect();
      mqDark.removeEventListener('change', syncTheme); area.removeEventListener('scroll', onScroll, { capture: true });
      FORM_EVENTS.forEach(t => area.removeEventListener(t, onFormEvent, true));
      gl?.getExtension('WEBGL_lose_context')?.loseContext(); canvas.remove();
    },
  };
}

export default createShockwaveHalo;
