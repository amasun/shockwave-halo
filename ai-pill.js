/**
 * AI Pill — an AI input that rests as a pill and springs open into a card with a turning metal edge.
 * Optional companion to shockwave-halo.js. Framework-agnostic ES module; injects its own CSS once.
 *
 *   import { createAIPill } from './ai-pill.js';
 *   const pill = createAIPill(area, { onTrigger: ({ opened }) => halo.trigger({ delay: opened ? 40 : 0 }) });
 *
 * Theme: dark when an ancestor has [data-theme="dark"] or .dark. Override colours with CSS variables
 * (--aip-bg, --aip-text, --aip-muted, --aip-faint, --aip-line, --aip-accent, --aip-send, --aip-send-fg, --aip-shadow).
 */

const CSS = `
.aip{--aip-bg:#fff;--aip-text:#0f172a;--aip-muted:#64748b;--aip-faint:#94a3b8;--aip-line:rgb(15 23 42/.10);--aip-line2:rgb(15 23 42/.16);--aip-soft:#f5f6f8;--aip-accent:#4f6bff;--aip-send:#0f172a;--aip-send-fg:#fff;
  --aip-shadow:0 0 0 1px rgb(15 23 42/.09),0 2px 4px rgb(15 23 42/.04),0 28px 64px -16px rgb(15 23 42/.22);
  --aip-metal:linear-gradient(120deg,rgb(238 240 243),rgb(196 202 210) 28%,rgb(241 243 245) 50%,rgb(188 195 204) 74%,rgb(233 236 239));
  position:absolute;left:50%;bottom:var(--aip-bottom,48px);z-index:var(--aip-z,10);width:300px;height:44px;border-radius:22px;
  transform:translateX(-50%) scale(var(--aip-s,1));transform-origin:50% 100%;background:var(--aip-bg);box-shadow:var(--aip-shadow);
  font-family:inherit;transition:background-color .4s,box-shadow .4s}
:is([data-theme="dark"],.dark) .aip{--aip-bg:rgb(30 30 33);--aip-text:#ececf1;--aip-muted:#8d8d98;--aip-faint:#5f5f69;--aip-line:rgb(255 255 255/.08);--aip-line2:rgb(255 255 255/.14);--aip-soft:#26262b;--aip-accent:#8ea2ff;--aip-send:#ececf1;--aip-send-fg:#111;
  --aip-shadow:0 0 0 1px rgb(255 255 255/.08),0 2px 4px rgb(0 0 0/.3),0 28px 64px -16px rgb(0 0 0/.7);--aip-metal:linear-gradient(120deg,rgb(74 79 87),rgb(51 55 61))}
.aip *{box-sizing:border-box}
.aip-clip{position:absolute;inset:0;border-radius:inherit;overflow:hidden}
.aip-edge{position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;opacity:0;
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.aip-pill{position:absolute;inset:0;width:100%;display:flex;align-items:center;gap:9px;padding:0 12px 0 15px;border:0;background:transparent;color:var(--aip-muted);font:inherit;font-size:14px;cursor:text;outline:none}
.aip-pill>svg{color:var(--aip-accent);flex:none}
.aip-ph{flex:1;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.aip kbd{font:inherit;font-size:11px;line-height:1;color:var(--aip-faint);border:1px solid var(--aip-line2);border-radius:5px;padding:3px 5px}
.aip-card{position:absolute;left:50%;bottom:0;width:460px;height:100px;transform:translateX(-50%);opacity:0;visibility:hidden;display:flex;flex-direction:column}
.aip-line{height:22px;margin:13px 16px 12px}
.aip-input{width:100%;height:22px;border:0;outline:none;background:transparent;color:var(--aip-text);font:inherit;font-size:15px;line-height:22px;padding:0;caret-color:var(--aip-accent)}
.aip-input::placeholder{color:var(--aip-faint)}
.aip-hair{height:1px;background:var(--aip-line)}
.aip-tools{height:52px;display:flex;align-items:center;gap:6px;padding:0 10px}
.aip-ib{width:32px;height:32px;border-radius:50%;border:1px solid var(--aip-line);background:transparent;color:var(--aip-muted);display:grid;place-items:center;cursor:pointer;padding:0}
.aip-ib:hover,.aip-pick:hover{background:var(--aip-soft)}
.aip-send{background:var(--aip-send);color:var(--aip-send-fg);border-color:transparent}
.aip-send:hover{background:var(--aip-send);opacity:.9}
.aip-div{width:1px;height:16px;background:var(--aip-line2);margin:0 4px}
.aip-pick{height:32px;border-radius:8px;border:0;background:transparent;color:var(--aip-muted);font:inherit;font-size:13px;padding:0 8px;cursor:pointer;display:inline-flex;align-items:center;gap:4px}
.aip-sp{flex:1}`;

const ICON = {
  spark: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  chev: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>',
  mic: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  send: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
};

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

export function createAIPill(container, options = {}) {
  const o = {
    placeholder: 'Ask AI about this project', shortcut: 'k', model: 'Opus 5.5', mode: 'Ask',
    bottom: 48, zIndex: 10, reducedMotion: 'auto', alwaysOpen: false,
    ignoreOutside: null,   // selector: clicks on matching elements outside the pill don't close it (e.g. '.toolbar')
    onTrigger: null, onSubmit: null, onOpen: null, onClose: null, ...options,
  };
  if (!document.getElementById('aip-css')) {
    const s = document.createElement('style'); s.id = 'aip-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  if (getComputedStyle(container).position === 'static') container.style.position = 'relative';

  const el = document.createElement('div');
  el.className = 'aip';
  el.style.setProperty('--aip-bottom', o.bottom + 'px'); el.style.setProperty('--aip-z', o.zIndex);
  const key = o.shortcut ? `<kbd>${isMac ? '⌘' : 'Ctrl '}${esc(o.shortcut.toUpperCase())}</kbd>` : '';
  el.innerHTML = `
    <div class="aip-clip">
      <button class="aip-pill" type="button" aria-label="${esc(o.placeholder)}">${ICON.spark}<span class="aip-ph">${esc(o.placeholder)}</span>${key}</button>
      <form class="aip-card">
        <div class="aip-line"><input class="aip-input" tabindex="-1" placeholder="${esc(o.placeholder)}" autocomplete="off"></div>
        <div class="aip-hair"></div>
        <div class="aip-tools">
          <button type="button" class="aip-ib" tabindex="-1" aria-label="Add">${ICON.plus}</button>
          <span class="aip-div"></span>
          <button type="button" class="aip-pick" tabindex="-1">${esc(o.model)} ${ICON.chev}</button>
          <button type="button" class="aip-pick" tabindex="-1">${esc(o.mode)} ${ICON.chev}</button>
          <span class="aip-sp"></span>
          <button type="button" class="aip-ib" tabindex="-1" aria-label="Voice">${ICON.mic}</button>
          <button type="submit" class="aip-ib aip-send" tabindex="-1" aria-label="Send">${ICON.send}</button>
        </div>
      </form>
    </div>
    <div class="aip-edge"></div>`;
  container.appendChild(el);
  const pill = el.querySelector('.aip-pill'), card = el.querySelector('.aip-card'), input = el.querySelector('.aip-input'), edge = el.querySelector('.aip-edge');
  const focusables = card.querySelectorAll('input,button');

  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => o.reducedMotion === 'auto' ? mq.matches : !!o.reducedMotion;
  const spring = t => 1 - Math.exp(-8 * t) * Math.cos(6 * t);
  const easeInOut = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
  const easeOut = t => 1 - (1 - t) ** 3;

  let st = 'closed', st0 = 0, pFrom = 0, p = 0, edgeT0 = -1e9, raf = 0;
  function apply(prog, s) {
    el.style.width = (300 + 160 * prog) + 'px';
    el.style.height = (44 + 56 * prog) + 'px';
    el.style.borderRadius = (22 - 6 * prog) + 'px';
    el.style.setProperty('--aip-s', s);
    pill.style.opacity = Math.max(0, 1 - prog / 0.3);
    pill.style.pointerEvents = prog > 0.01 ? 'none' : '';
    card.style.opacity = Math.max(0, Math.min(1, (prog - 0.3) / 0.4));
    card.style.visibility = prog > 0.3 ? 'visible' : 'hidden';
  }
  function frame(now) {
    raf = 0;
    const e = now - st0; let s = 1;
    if (st === 'opening') {
      if (reduced()) { p = 1; st = 'open'; }
      else if (e < 90) { s = 1 - 0.03 * Math.sin(Math.PI * e / 90); p = 0; }    // dip to 97%
      else { const t = (e - 90) / 580; if (t >= 1) { p = 1; st = 'open'; } else p = spring(t); }
    } else if (st === 'closing') {
      const t = reduced() ? 1 : e / 320;
      if (t >= 1) { p = 0; st = 'closed'; } else p = pFrom * (1 - easeInOut(t));
    }
    apply(p, s);
    const te = (now - edgeT0) / 900;   // metal edge: -60° → 300°, opacity sin(πt)·0.75
    if (te >= 0 && te < 1 && !reduced()) {
      edge.style.background = `conic-gradient(from ${-60 + 360 * easeOut(te)}deg, transparent 0 280deg, rgb(255 255 255 / 0.8) 325deg, transparent 360deg), var(--aip-metal)`;
      edge.style.opacity = Math.sin(Math.PI * te) * 0.75;
    } else edge.style.opacity = 0;
    if (st === 'opening' || st === 'closing' || (te >= 0 && te < 1)) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  function open({ silent = false } = {}) {
    if (st === 'opening' || st === 'open') return false;
    st = 'opening'; st0 = performance.now(); edgeT0 = st0 + 90;
    focusables.forEach(b => b.tabIndex = 0); pill.tabIndex = -1;
    kick();
    requestAnimationFrame(() => input.focus({ preventScroll: true }));
    if (!silent) o.onOpen?.();
    return true;
  }
  function close() {
    if (o.alwaysOpen || st === 'closed' || st === 'closing') return;
    pFrom = p; st = 'closing'; st0 = performance.now();
    focusables.forEach(b => b.tabIndex = -1); pill.tabIndex = 0;
    kick(); o.onClose?.();
  }
  // delay: the halo leaves 40ms after the opening starts (0 when already open or reduced motion)
  function trigger() {
    if (o.alwaysOpen) { o.onTrigger?.({ opened: false, reduced: reduced(), delay: 0 }); return; }
    const opened = open(); o.onTrigger?.({ opened, reduced: reduced(), delay: opened && !reduced() ? 40 : 0 });
  }

  if (o.alwaysOpen) {
    st = 'open'; p = 1; apply(1, 1);
    focusables.forEach(b => b.tabIndex = 0); pill.tabIndex = -1;
  }

  const onPillFocus = e => { if (e.isTrusted && st === 'closed') trigger(); };
  const onInputDown = () => { if (!o.alwaysOpen && st === 'open') o.onTrigger?.({ opened: false, reduced: reduced(), delay: 0 }); };
  const onDocDown = e => {
    if (o.alwaysOpen || el.contains(e.target)) return;
    if (o.ignoreOutside && e.target.closest?.(o.ignoreOutside)) return;   // e.g. a toolbar that should not close the card
    close();
  };
  const onKey = e => {
    if (o.shortcut && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === o.shortcut) {
      e.preventDefault(); if (st === 'closed' || st === 'closing') trigger(); else input.focus();
    } else if (e.key === 'Escape' && !o.alwaysOpen && st !== 'closed') { close(); pill.focus({ preventScroll: true }); }
  };
  const onSubmit = e => { e.preventDefault(); const v = input.value.trim(); if (v || o.alwaysOpen) { o.onSubmit?.(v); input.value = ''; } };
  pill.addEventListener('click', trigger);
  pill.addEventListener('focus', onPillFocus);
  input.addEventListener('pointerdown', onInputDown);
  card.addEventListener('submit', onSubmit);
  document.addEventListener('pointerdown', onDocDown);
  document.addEventListener('keydown', onKey);

  return {
    el, input,
    open: () => open(), close, trigger,
    /** Snap back to the pill instantly (no animation). */
    reset() {
      if (o.alwaysOpen) return;
      st = 'closed'; p = 0; apply(0, 1); focusables.forEach(b => b.tabIndex = -1); pill.tabIndex = 0;
    },
    get isOpen() { return st === 'open' || st === 'opening'; },
    destroy() {
      cancelAnimationFrame(raf); document.removeEventListener('pointerdown', onDocDown); document.removeEventListener('keydown', onKey); el.remove();
    },
  };
}

export default createAIPill;
