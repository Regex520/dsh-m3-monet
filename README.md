# dsh-m3-monet · 莫奈美化

Monet wallpaper theming for the DeepSeek Harness desktop app, built on
Material Design 3 dynamic color. The wallpaper seed goes through the official
Material color pipeline (HCT → quantize → Score → tonal palettes) and maps the
M3 roles onto the Harness design tokens per color scheme.

- 壁纸取色：本地图片/图片链接/内置渐变 → 莫奈种子提取（`Quantizer`-style 采样 + `Score` 评分）
- 换图即自动重取色：壁纸以内容哈希标记，选择新壁纸后立即重新提取种子并应用（无需手动切色源）
- MD3 Token 映射：`--dsw-alias-*` 全套别名令牌（100+ 项，亮暗各自取值）由 `theme.overrideTokens` 注入
- 毛玻璃：**侧边栏与主体分别配置**（各自开关 / 模糊 / 饱和度 / 不透明度），`backdrop-filter` 直接作用于壁纸
- 壁纸背景：整窗口背景（带亮/暗各自的暗化层），并把顶层表面改为半透明使其透出
- 顶部标题栏固定为主题纯色，不参与壁纸与毛玻璃
- 侧边栏底部原「阴影式」软边界替换为主题色 1px 横线
- 设置对话框背景透视：全屏遮罩恢复为半透明 scrim、面板改为半透明 + 毛玻璃，壁纸从设置页背后透出
- 调色控制：风格（标准/鲜艳/柔和/表现/单色）、色彩强度、明度微调，实时预览
- 内置 8 组 Material palette 预设 + 8 组渐变壁纸（随当前调色联动）
- 设置全部持久化在 `localStorage`（`dsh.m3monet.v1`），跟随系统亮暗自动切换

## 壁纸图层处理

壁纸画在 `.BynINW_frame` 的背景上，而布局的子列会在其上再铺自己的底色，导致壁纸被完全遮住
（源码见 `@deepseek-ai/dsh-client-ui-layout/lib/client.js`）：

| 图层 | 覆盖色 | 处理方式 |
| --- | --- | --- |
| `[data-windows-titlebar] .BynINW_centerCol` | `--dsw-alias-bg-base` | 开启壁纸时按「主体毛玻璃不透明度」或「界面不透明度」改为 `color-mix(... transparent)` |
| `.BynINW_sidebarCol` | `--dsw-specific-sidebar-fill` | 开启壁纸时按「侧边栏毛玻璃不透明度」或「界面不透明度」改为半透明 |
| `.BynINW_sidebarCol ._2H3hWW_root` | 同上（第二层） | 壁纸开启时置为 `background: transparent`，避免两层叠加 |
| `[data-windows-titlebar] .BynINW_frame:before` | `--dsw-specific-sidebar-fill` | **改为主题纯色**（`surfaceContainer`），并清掉 `backdrop-filter` |
| `--dsw-alias-bg-layer-1/2/3` | 卡片/面板底色 | 取「界面不透明度 + 14%」，保持正文可读性 |
| `.wCInkW_mask`（设置页全屏遮罩） | `--dsw-alias-bg-mask-1` | 遮罩 token 恢复为半透明 scrim（stock `#0000003d` 语义），并加 `backdrop-filter` 毛玻璃 |
| `.wCInkW_panel`（设置页 800px 面板） | `--dsw-alias-bg-layer-2` | 开启壁纸时改为按「主体毛玻璃不透明度 / 界面不透明度」的 `color-mix(... transparent)` + 毛玻璃 |

> `--dsw-alias-bg-mask-1/2/3`、`bg-mask-photo/drop`、`bg-skeleton`、`border-inverted(2)` 在 stock 主题里都是**半透明**叠加层；
> 早期版本把它们错误地映射成了不透明 `scrim`，会让设置页遮罩变成纯黑（壁纸完全看不见），现已按语义修正。

毛玻璃 `backdrop-filter` 按分组分别作用于 `.BynINW_sidebarCol`（侧边栏）与 `.BynINW_centerCol`（主体），
它们直接坐在 frame 背景上，因此模糊的正是壁纸本身；标题栏条不参与模糊。

侧边栏底部（`_2H3hWW_footArea`，账号行上方）原有软性阴影边界，现替换为
`border-top: 1px solid var(--dsw-alias-border-l2)` 的主题色横线。

## 壁纸取色

壁纸每次变化都会重新走一遍取色流程，用「壁纸标记」（`wallpaperTag`）判断是否需要重算：

```js
function hashString(str) {            // FNV-1a
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16) + '-' + str.length;
}
wallpaperTag = kind + ':' + hashString(value);
```

早期版本用 `kind + value.slice(0, 64)` 当标记，而所有 JPEG data URL 的前 64 个字符都是同一段
`data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD…`，于是换壁纸后标记不变、被判定为「已提取过」而跳过重算，
主题就一直停留在上一张壁纸的颜色。改为内容哈希（并附上长度）后，任何换图都会触发重新提取。

- 图像一变即提取，不再要求 `palette.source === 'wallpaper'`；若当前色源为「预设色板」，会自动切到「壁纸自动」。
- 提取结果以内存中的最新设置为基座合并后落盘（避免存储回读把它覆盖回旧值）。
- 提取失败时落盘 `seeds: []` + `extractError: true`，设置页给出提示而不是静默沿用旧色。
- 插件激活时若存储里的标记与当前壁纸不符（例如升级前留下的旧标记），也会重新提取一次。
- 提取是异步的，因此结果以「立即应用」写回并**取消仍在排队中的防抖应用**：否则那次延迟 120ms 的防抖回调
  会在提取完成后拿着更新前的快照再跑一遍，把刚取到的新颜色覆盖回上一张壁纸的颜色（表现就是「换壁纸后颜色不变，
  手动把色源切走再切回来才刷新」）。同时用自增序号丢弃过期的提取结果，连续换图时只有最后一次生效。

## 入口

- 仅插件设置页：`设置 > 插件 > 莫奈美化 > 配置`（`settings.section` 槽位，页面内容可上下滚动）
- 不在主页面显示，也不占用主页面左侧栏——只作为插件自身设置存在

## 说明与限制

- 主题覆盖随会话临时生效：关闭插件或卸载后恢复默认界面；设置项保留在本地。
- 仅使用 Harness 主题令牌与 `--dsw-*` CSS 变量绘制 UI，不引入任何客户端 UI 包。
- 远端图片链接受页面 CSP 限制时可能无法作为壁纸显示；本地图片（data URL）不受影响。
- 引擎为离线打包的 `@material/material-color-utilities`（Apache-2.0，见 THIRD_PARTY_NOTICES.md）。

## 开发

```bash
node scripts/build.mjs      # 由 src/engine-core.js + src/engine-ext.js 生成 lib/engine.js 并内联进 client.js
node scripts/test.mjs       # 引擎单元测试（HCT 已知值、Scheme 角色、Monet 取色、Token 映射）
node scripts/smoke-client.mjs  # 浏览器端冒烟：模块装载、槽位注册、Token 注入、壁纸取色
```

包体结构：`index.js`（Host 空实现）、`client.js`（浏览器端全量逻辑）、`cordis.patch.yml`（一行插件行）。

## 验证记录

- `plugin_manager install_bundle`：`application: applied`，无警告；包以 `link:` 形式装入 `profiles/desktop`。
- Client 槽位实时注册（`cordis_inspect_query`）：仅 `settings.section` 出现 `monet-theme`（order 120，`active: true`）；`main` 与 `sidebar.panellist` 均不注册（按需求：不在主页面/左侧栏显示）。
- 主题注册表 `Theme.listTokens` 中已出现本插件注册的 `--m3-*` 自定义令牌，证明 `theme.overrideTokens` 在页面端生效；覆盖值为 {light, dark} 双方案，符合 `requiresLightAndDark: true` 约束。
- 引擎对照官方实现验证：`#4285f4` → HCT (265.98, 62.27, 56.55)；`Scheme.light(blue).primary = #005ac1`、dark = `#adc6ff`（Material You 蓝的规范值）。
- 本会话无浏览器控制，未截屏验证毛玻璃/壁纸的最终像素效果；需要重载应用加载最新 client.js 生成物后肉眼确认。
- 图层修复（壁纸被覆盖）由 `scripts/smoke-client.mjs` 覆盖：断言壁纸开启时 `--dsw-alias-bg-base`/`--dsw-specific-sidebar-fill` 变为 `color-mix` 半透明、`_2H3hWW_root` 置透明；并断言无壁纸图源时表面保持不透明、总开关关闭时不注入覆盖。
- 后续四项修复同样由冒烟测试覆盖：①设置页重新进入时读取已存值（断言读回 `#b90063` / blur 20 / opacity 55，旧代码会退回默认值）；②侧边栏与主体毛玻璃独立（断言两个 veil 分别用 80% 与 60%、两条 `backdrop-filter` 各自参数）；③顶部标题栏为纯色且 `backdrop-filter:none`；④侧边栏底部为 `border-top: 1px solid var(--dsw-alias-border-l2)` 横线。另含旧版扁平 `glass` 配置的迁移断言。
- 设置页背景透视由冒烟测试覆盖：断言 `--dsw-alias-bg-mask-1` 为 24% 半透明 scrim（非不透明）、`bg-skeleton` 半透明、`border-inverted` 亮色为 `transparent`；壁纸开启时 `.wCInkW_mask` 与 `.wCInkW_panel` 均带 `backdrop-filter`，面板背景为 60%（主体毛玻璃不透明度）的 `color-mix`；无壁纸时不下发 `.wCInkW_panel` 规则。
- 壁纸自动取色由冒烟测试场景 5/6 覆盖：场景 5 用「旧版前缀标记 + 已存紫色种子」模拟升级前状态，断言重新提取出的标记与旧标记不同、种子来自新壁纸（纯绿 64×64，`greenFromArgb > blueFromArgb`）、最终 `--dsw-alias-brand-primary` 亮色不再是 `#6750a4`（实测 `#006e21`，种子 `#48a850`）且主题被重复应用；场景 6 断言开启壁纸后色源自动从 `preset` 切到 `wallpaper`。
- 「换壁纸后颜色不刷新」的竞态由场景 5 守住：测试等待 `settle(260ms)` 越过 120ms 防抖窗口后才断言，要求最终生效的主题既不是旧种子 `#6750a4`、也不等于旧种子推出的 `brand-primary`。把修复临时还原（`applySoon` 用旧快照 + `applyFresh` 不取消防抖）后该断言确实失败（实测回落到 `#6750a4`），证明断言不是空转。
