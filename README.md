<div align="center">

# Shockwave Halo

点击或聚焦输入框时，一道淡淡的光环从起点扫过页面并淡出：经过时像玻璃透镜一样把页面轻轻弯折几个像素，带一丝轻微色散，同时让线条和边框泛起微光。支持明暗两种模式。

**简体中文** · [English](README.en.md)

[在线 Demo](https://amasun.github.io/shockwave-halo/) · [接入提示词](prompts/integrate-prompt.md) · [从零开始](prompts/spec-prompt.md)

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
> **在线体验**：打开 [Shockwave Halo Demo](https://amasun.github.io/shockwave-halo/)，点一下底部的输入框就能看到效果；顶部工具栏可以切换起点位置、四套配色、明暗主题和减弱动效。

## 包含什么

两个**零依赖**、**不挑框架**的原生 JS 模块（React、Vue、Svelte 或纯 HTML 都能直接用）：

| 文件 | 角色 | 通俗说明 |
|---|---|---|
| [`shockwave-halo.js`](shockwave-halo.js) | 核心光环 | 负责光环动画、页面弯折、色散和边框高光；如果页面拿不到截图，会自动退化成只显示彩色光环，不影响使用 |
| [`ai-pill.js`](ai-pill.js) | 可选输入框 | 胶囊式 AI 输入框，点开会弹性展开成卡片，边缘带一圈转动的金属高光 |
| [`demo/index.html`](demo/index.html) | 完整示例 | 展示起点切换、四套配色（`Aurora` / `Halo` / `Frost` / `Spark`）、明暗切换与减弱动效 |

---

## 安装

三种方式任选其一：

### 1. CDN（不用配置打包工具，直接引入）

```html
<script type="module">
  import { createShockwaveHalo } from 'https://cdn.jsdelivr.net/gh/amasun/shockwave-halo@v1.0.0/shockwave-halo.js';
  import { createAIPill } from 'https://cdn.jsdelivr.net/gh/amasun/shockwave-halo@v1.0.0/ai-pill.js'; // 可选
</script>
```

### 2. npm（从 GitHub 安装）

```bash
npm i github:amasun/shockwave-halo#v1.0.0 html-to-image
```

```js
import { createShockwaveHalo } from 'shockwave-halo';
import { createAIPill } from 'shockwave-halo/ai-pill';   // 可选
import { toCanvas } from 'html-to-image';

const halo = createShockwaveHalo(area, {
  snapshot: (el, opts) => toCanvas(el, opts),
});
```

### 3. 直接复制文件

把 [`shockwave-halo.js`](shockwave-halo.js)（以及可选的 [`ai-pill.js`](ai-pill.js)）直接放进你的项目目录即可，没有任何第三方依赖。

---

## 让 AI 帮你接入或复刻

不用自己研究代码或看懂参数。`prompts/` 目录下准备了两份提示词，**直接整段复制发给 Claude Code、Codex、Cursor 等 AI 助手**，它会主动问你几个简单问题并帮你完成：

| 提示词 | 什么时候用 | AI 会帮你做什么 |
|---|---|---|
| [接入提示词](prompts/integrate-prompt.md) | **你已经有网页项目**，想直接用现成组件 | AI 先看一遍你的项目，问你触发方式、起点、配色和要不要换输入框，然后直接把本组件接进去（支持 React / Vue / Svelte / 原生 / Electron / Tauri） |
| [从零开始](prompts/spec-prompt.md) | **你在做手机 App、桌面客户端**，或想在自己的技术栈里从零重写 | 文档里写好了完整的动画曲线、配色和算法配方，AI 会照着它从零写出对应版本（适合 iOS Metal、Android AGSL、Flutter、Rust 等） |

---

## 快速上手

### 最小用法（3 步跑起来）

```js
import { createShockwaveHalo } from './shockwave-halo.js';

const area = document.querySelector('#content');   // 光环扫过的区域（把工具栏放在这个区域外面）
const input = document.querySelector('#ai-input');

const halo = createShockwaveHalo(area, { origin: input });
input.addEventListener('focus', () => halo.trigger());
```

> [!NOTE]
> 想让光环经过时把页面“弯折”起来，需要 `html-to-image` 来给页面拍快照：你可以在页面里用 `<script>` 提前引入（全局变量 `htmlToImage`），也可以什么都不做——组件会在需要时自动从 jsDelivr 加载 `html-to-image@1.11.11`。如果用了 Vite / Webpack 等打包工具，建议像上面的 npm 示例那样通过 `snapshot` 选项自己传入。

### 搭配胶囊输入框

```js
import { createShockwaveHalo } from './shockwave-halo.js';
import { createAIPill } from './ai-pill.js';

const halo = createShockwaveHalo(area, { exclude: '.aip' });   // 输入框自己会动，拍快照时排除它
const pill = createAIPill(area, {
  onTrigger: ({ opened }) => halo.trigger({ origin: pill.el, delay: opened ? 40 : 0 }),
  onSubmit: text => sendToAI(text),
});
```

### 在 React / Vue / Svelte 中使用

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

Vue、Svelte 的用法也一样：页面挂载时创建，卸载时调用 `destroy()` 清理即可。

### 本地运行 Demo

```bash
git clone https://github.com/amasun/shockwave-halo.git
cd shockwave-halo
python3 -m http.server 8788
```

然后用浏览器打开 `http://localhost:8788/demo/`（浏览器安全限制不允许直接双击 `html` 通过 `file://` 加载 ES 模块，所以需要起一个本地静态服务）。

---

## API 参考

### `createShockwaveHalo(area, options)`

`area` 是光环作用的容器。光环会被裁剪在容器范围内，并自动沿用它的圆角（记得给容器加上 `overflow: hidden`）。

<details>
<summary><strong>展开查看全部配置项（options）</strong></summary>

| 选项 | 默认值 | 说明 |
|---|---|---|
| `origin` | `'bottom'` | 光环从哪出发：传一个元素（靠近边缘时从那条边升起一道弧，否则从元素中心扩散成圆）、`{x, y}`（视口坐标，如点击位置），或 `'bottom' \| 'top' \| 'left' \| 'right' \| 'center'` |
| `palette` | `'Aurora'` | `'Aurora' \| 'Halo' \| 'Frost' \| 'Spark'`，或自定义 `{ dark: [[r,g,b]×4], light: [[r,g,b]×4] }`（四圈颜色由内到外） |
| `theme` | `'auto'` | `'auto'` 自动跟随 `<html data-theme>` / `.dark` / 系统深浅色；也可传 `'light'`、`'dark'` 或返回其一的函数。切换主题时颜色会平滑过渡 |
| `layers` | 全开 | `{ bend, split, bevel, glints }`：页面弯折、色散、边缘玻璃折射、线条高光（彩色光环始终开启） |
| `bevelEdges` | `['left','right','bottom']` | 哪些边作为玻璃边缘参与折射（贴着工具栏的那条边不要放进来） |
| `duration` | `1000` | 动画总时长（毫秒） |
| `ringWidth` | `110` | 单个色环宽度 `w`（像素） |
| `bendPx` | `7` | 透镜弯折强度（像素） |
| `arcDepth` | 边长的 ⅔ | 从边缘出发时，圆心离该边缘的距离 |
| `retrigger` | `'restart'` | 动画还没结束时再次触发：`'restart'` 重新开始，`'ignore'` 忽略 |
| `reducedMotion` | `'auto'` | 系统开启“减弱动态效果”时：关闭弯折、色散与闪线，光环以一半强度原地淡入淡出（`600ms`） |
| `exclude` | `null` | CSS 选择器：拍快照时跳过哪些元素（例如会动的输入框，或盖在光环上方的元素） |
| `svgLines` | `'[data-halo-line]'` | 哪些 SVG 线条参与高光闪烁。默认只亮带这个属性的线条，图标不会误亮 |
| `snapshot` | `'auto'` | `'auto'`（自动用 `html-to-image`）、`false`（只要彩色光环，不弯折页面），或自定义 `async (el, opts) => canvas` |
| `watch` | `true` | 区域内容发生变化后，在浏览器空闲时自动更新快照 |
| `maxDpr` | `2` | 最高渲染清晰度（像素比上限） |
| `zIndex` | `5` | 光环画布层级。想让输入框等元素盖在光环上面，给它设更高的 `z-index` 即可 |
| `onStart` / `onEnd` | — | 动画开始 / 结束时的回调 |

</details>

#### 返回的实例方法

```js
halo.trigger({ origin?, delay? })  // 触发光环，返回 Promise<boolean>
halo.stop()                        // 立刻停止动画
halo.invalidate()                  // 告诉组件页面变了，空闲时重拍快照（开启 watch 时通常不用手动调）
halo.capture()                     // 立刻拍一次快照，返回 { ok, mode, ms }
halo.setOptions({ palette: 'Frost', layers: { split: false } })
halo.running                       // 当前是否正在播放
halo.mode                          // 'snapshot' | 'overlay' | 'overlay (scrolled)' | 'overlay (no WebGL2)'
halo.destroy()                     // 销毁组件并移除监听
halo.debugHold(0.2)                // 调试用：把动画定格在 t=0.2；传 null 恢复播放
```

### `createAIPill(container, options)`

| 选项 | 默认值 | 说明 |
|---|---|---|
| `placeholder` | `'Ask AI about this project'` | 输入框提示文字 |
| `shortcut` | `'k'` | 快捷键（`⌘K` / `Ctrl K`），传 `null` 关闭 |
| `model` / `mode` | `'Opus 5.5'` / `'Ask'` | 两个下拉按钮上显示的文字 |
| `bottom` | `48` | 距离容器底部的像素高度 |
| `onTrigger({ opened, reduced })` | — | 点击或聚焦胶囊、按快捷键、在已打开输入框内点击时触发 |
| `onSubmit(text)` / `onOpen` / `onClose` | — | 提交文本与展开/收起回调 |

- **返回实例**：`{ el, input, open(), close(), trigger(), reset(), isOpen, destroy() }`
- **自定义配色**：可通过 CSS 变量覆盖颜色：`--aip-bg`、`--aip-text`、`--aip-muted`、`--aip-faint`、`--aip-line`、`--aip-accent`、`--aip-send`、`--aip-send-fg`、`--aip-shadow`。祖先元素带有 `[data-theme="dark"]` 或 `.dark` 时会自动切换成暗色外观。

---

## 工作原理与性能开销

- **平时零开销**：不触发时画布完全隐藏，不跑动画循环。只在页面内容变动后的浏览器空闲时间拍一次快照（主线程约 `60–200ms`）。
- **触发时只画 1 秒**：直接复用缓存好的快照（如果页面刚变过就先补拍一张），跑 1 秒 GPU 着色器。光环带以外的像素完全透明，直接透出下面的真实网页。
- **线条高光不误伤文字**：组件会根据页面里每条边框的位置和粗细，单独画一张“黑底白线”的遮罩，所以 `1px` 的细边框只会亮 `1px`，旁边的文字和图标都不会跟着亮。

## 使用限制

- **需要 WebGL2**：如果浏览器不支持 WebGL2，会自动降级为只叠加彩色光环，不做页面弯折。
- **截图克隆的限制**：`html-to-image` 依赖克隆页面 DOM，跨域图片和字体需要同源或已内联，`backdrop-filter` 毛玻璃效果不一定能完全还原。
- **滚动区域会自动简化**：因为克隆 DOM 会丢失滚动条位置，如果作用区域或里面的元素被滚动过，那一次触发会自动退化成“只叠加色环”。建议把光环挂在外面那层不滚动的框上。
- **动画期间的画面快照**：光环扫过的 1 秒内，光环带里的像素使用的是触发那一刻的画面；这 1 秒内页面如果有局部变化，光环带里会保留旧画面（光环带外面不受影响）。
