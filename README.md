# Shockwave Halo

[在线 Demo](https://amasun.github.io/shockwave-halo/) · [接入提示词](prompts/integrate-prompt.md) · [规格提示词](prompts/spec-prompt.md) · MIT

一道淡淡的光环从某处扫过页面并淡出：经过时把页面弯折几个像素，带一丝色散，线条和边框会闪一下。支持明暗两种模式。

两个零依赖、不绑定框架的 ES 模块：

| 文件 | 作用 |
|---|---|
| `shockwave-halo.js` | 光环本体：WebGL2 单 pass 着色器 + 页面快照（html-to-image），拿不到快照时自动降级为只叠加色环 |
| `ai-pill.js` | 可选：胶囊式 AI 输入框，点开弹成卡片，带转动的金属边 |
| `demo/index.html` | 完整示例（起点切换、四套配色、明暗、减弱动效） |

**在线 Demo：** https://amasun.github.io/shockwave-halo/ （点底部输入框；工具栏可以切换起点、配色、明暗和减弱动效）

## 安装

三种方式任选其一。

**1. CDN（不需要构建工具）**

```html
<script type="module">
  import { createShockwaveHalo } from 'https://cdn.jsdelivr.net/gh/amasun/shockwave-halo@v1.0.0/shockwave-halo.js';
  import { createAIPill } from 'https://cdn.jsdelivr.net/gh/amasun/shockwave-halo@v1.0.0/ai-pill.js'; // 可选
</script>
```

**2. npm（从 GitHub 安装）**

```bash
npm i github:amasun/shockwave-halo#v1.0.0 html-to-image
```

```js
import { createShockwaveHalo } from 'shockwave-halo';
import { createAIPill } from 'shockwave-halo/ai-pill';   // 可选
import { toCanvas } from 'html-to-image';

const halo = createShockwaveHalo(area, { snapshot: (el, opts) => toCanvas(el, opts) });
```

**3. 直接复制**：把 `shockwave-halo.js`（以及可选的 `ai-pill.js`）复制进项目。两个文件都没有任何依赖。

## 让 AI 帮你接入

`prompts/` 里有两份提示词，复制给 Claude Code、Codex、Cursor 等编码助手即可：

| 提示词 | 用途 |
|---|---|
| [prompts/integrate-prompt.md](prompts/integrate-prompt.md) | **接入现成组件**：AI 先看你的项目，问你触发方式、起点、配色、效果层和要不要换输入框，然后把本组件接进来（React、Vue、Svelte、原生、Electron、Tauri 都行） |
| [prompts/spec-prompt.md](prompts/spec-prompt.md) | **从零实现**：完整的效果规格（时间曲线、色环公式、四套配色、弯折和高光算法、各平台实现建议）。适合 iOS（Metal）、Android（AGSL）、Flutter、Rust 等非 Web 平台 |

## 本地运行 Demo

```bash
git clone https://github.com/amasun/shockwave-halo.git
cd shockwave-halo
python3 -m http.server 8788
```

然后打开 http://localhost:8788/demo/ 。ES 模块不能从 `file://` 加载，所以需要一个静态服务器。

## 最小用法

```js
import { createShockwaveHalo } from './shockwave-halo.js';

const area = document.querySelector('#content');           // 光环的作用区域（工具栏放在它外面）
const input = document.querySelector('#ai-input');

const halo = createShockwaveHalo(area, { origin: input });
input.addEventListener('focus', () => halo.trigger());
```

要让光环弯折页面，还需要 html-to-image：可以在页面里用 `<script>` 引入（全局变量 `htmlToImage`），也可以什么都不做，组件会按需从 jsDelivr 加载 `html-to-image@1.11.11`。用打包工具时建议像上面 npm 那样通过 `snapshot` 选项自己传入。

## 搭配胶囊输入框

```js
import { createShockwaveHalo } from './shockwave-halo.js';
import { createAIPill } from './ai-pill.js';

const halo = createShockwaveHalo(area, { exclude: '.aip' });   // 输入框会动，不放进快照
const pill = createAIPill(area, {
  onTrigger: ({ opened }) => halo.trigger({ origin: pill.el, delay: opened ? 40 : 0 }),
  onSubmit: text => sendToAI(text),
});
```

## `createShockwaveHalo(area, options)`

`area` 是光环所在区域，光环会被裁剪在区域内，并沿用它的圆角。区域需要 `overflow: hidden`。

| 选项 | 默认值 | 说明 |
|---|---|---|
| `origin` | `'bottom'` | 光环起点：一个元素（靠近边缘时从那条边升起一道弧，否则从元素中心扩散成圆）、`{x, y}`（视口坐标，比如点击位置）、`'bottom' \| 'top' \| 'left' \| 'right' \| 'center'` |
| `palette` | `'Aurora'` | `'Aurora' \| 'Halo' \| 'Frost' \| 'Spark'`，或自定义 `{ dark: [[r,g,b]×4], light: [[r,g,b]×4] }`（色环从内到外） |
| `theme` | `'auto'` | `'auto'` 跟随 `<html data-theme>` / `.dark` / 系统设置；也可以填 `'light'`、`'dark'`，或传一个返回其中之一的函数。切换主题时颜色会渐变过渡 |
| `layers` | 全开 | `{ bend, split, bevel, glints }`：弯折、色散、边缘玻璃折射、线条高光。色环始终开启 |
| `bevelEdges` | `['left','right','bottom']` | 哪些边当作玻璃边（贴着工具栏的那条边不要放进来） |
| `duration` | `1000` | 毫秒 |
| `ringWidth` | `110` | 单个色环宽度 w（px） |
| `bendPx` | `7` | 透镜强度（px） |
| `arcDepth` | 边长的 ⅔ | 从边缘起点时，圆心离那条边的距离 |
| `retrigger` | `'restart'` | 运行中再次触发：`'restart'` 重新开始，`'ignore'` 忽略 |
| `reducedMotion` | `'auto'` | 减弱动效时：不弯折、不色散、不闪线，光环以一半强度原地淡入淡出（600ms） |
| `exclude` | `null` | CSS 选择器：不放进快照的元素（会动的、或者盖在光环上方的） |
| `svgLines` | `'[data-halo-line]'` | 哪些 SVG 描边算作“线条”参与高光。默认只认带这个属性的，图标永远不会亮 |
| `snapshot` | `'auto'` | `'auto'`（html-to-image）、`false`（只叠加色环），或自定义 `async (el, opts) => canvas` |
| `watch` | `true` | 区域内 DOM 变化后，在空闲时重新拍快照 |
| `maxDpr` | `2` | 像素比上限 |
| `zIndex` | `5` | 画布层级。想让某个元素盖在光环上面（比如输入框），给它更高的层级 |
| `onStart` / `onEnd` | — | 回调 |

### 返回的实例

```js
halo.trigger({ origin?, delay? })  // 返回 Promise<boolean>
halo.stop()
halo.invalidate()                  // 页面变了，空闲时重新拍快照（watch 已经覆盖大多数情况）
halo.capture()                     // 立刻拍快照，返回 { ok, mode, ms }
halo.setOptions({ palette: 'Frost', layers: { split: false } })
halo.running                       // 是否正在运行
halo.mode                          // 'snapshot' | 'overlay' | 'overlay (scrolled)' | 'overlay (no WebGL2)'
halo.destroy()
halo.debugHold(0.2)                // 调试：把动画冻结在 t=0.2；传 null 恢复
```

## `createAIPill(container, options)`

| 选项 | 默认值 |
|---|---|
| `placeholder` | `'Ask AI about this project'` |
| `shortcut` | `'k'`（⌘K / Ctrl K），传 `null` 关闭快捷键 |
| `model` / `mode` | `'Opus 5.5'` / `'Ask'`（两个选择器上显示的文字） |
| `bottom` | `48`（距容器底部的像素） |
| `onTrigger({ opened, reduced })` | 点击或聚焦胶囊、按快捷键、在已打开的输入框里点击时调用 |
| `onSubmit(text)`、`onOpen`、`onClose` | — |

返回 `{ el, input, open(), close(), trigger(), reset(), isOpen, destroy() }`。

颜色可以用 CSS 变量覆盖：`--aip-bg --aip-text --aip-muted --aip-faint --aip-line --aip-accent --aip-send --aip-send-fg --aip-shadow`。祖先元素带 `[data-theme="dark"]` 或 `.dark` 时自动切到暗色。

## React 示例

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
<main ref={area}>…<input className="ai-input" onFocus={() => halo.current.trigger()} /></main>
```

Vue、Svelte 同理：挂载时创建，卸载时调 `destroy()`。

## 原理与开销

- **静止时零开销**：画布隐藏，不跑 requestAnimationFrame。只在区域内容变化后的空闲时间拍一次快照（约 60–200ms，主线程）。
- **触发时**：用缓存的快照（如果页面变了就先补拍一张），然后跑 1 秒全屏片元着色器。光环带以外的像素输出透明，直接露出下面的真实页面。
- **线条高光**：根据 DOM 里每个边框的位置和宽度，单独画一张“黑底白线”的遮罩，所以 1px 的边框只亮 1px，文字和图标不会亮。

## 限制

- 需要 WebGL2。没有的话只叠加色环，不弯折。
- html-to-image 拍到的是克隆出来的 DOM：跨域图片和字体需要同源或已内联，`backdrop-filter` 不一定靠谱。
- 克隆会丢掉滚动位置，所以区域或它的子元素滚动过时，那一次会自动降级为只叠加色环。建议把光环挂在不会滚动的外框上。
- 光环运行的 1 秒内显示的是触发时的快照。期间页面如果变了，光环带里会是旧画面（带外不受影响）。
