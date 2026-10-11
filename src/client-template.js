/**
 * dsh-m3-monet — Material Design 3 / Monet wallpaper theming for DeepSeek Harness.
 * Browser half of the bundle. The vendored color engine (HCT/CAM16/token
 * mapping) is inlined by scripts/build.mjs at the engine marker below.
 */
//__ENGINE_JS__
window.__ModuleLoader__.load({
  id: '@local/dsh-m3-monet',
  factory(require) {
    'use strict';
    const React = require('react');
    const h = React.createElement;
    const { useState, useCallback, useRef, useEffect } = React;

    /*__ENGINE_JS__*/

    const M = window.__M3_ENGINE__;
    if (!M) throw new Error('dsh-m3-monet: vendored engine did not initialize');

    const PKG = '@local/dsh-m3-monet';
    const STORE_KEY = 'dsh.m3monet.v1';

    // ------------------------------------------------------------------ i18n
    const ZH = {
      title: '莫奈美化',
      panelLabel: '莫奈主题',
      sectionDesc: '壁纸取色 · Material Design 3 动态主题',
      on: '开', off: '关',
      master: '启用美化',
      masterDesc: '关闭后恢复 Harness 默认界面，保留你的设置',
      palette: '主题取色',
      paletteDesc: '壁纸驱动 HCT 色彩空间，映射到完整的 MD3 token',
      srcWallpaper: '壁纸自动',
      srcColor: '自选颜色',
      srcPreset: '预设色板',
      style: '风格',
      styleTonal: '标准',
      styleVibrant: '鲜艳',
      styleMuted: '柔和',
      styleExpressive: '表现',
      styleMonochrome: '单色',
      chroma: '色彩强度',
      tone: '明度微调',
      wallpaper: '壁纸',
      wallpaperDesc: '作为应用背景，并作为「壁纸自动」取色的来源',
      wpNone: '无壁纸',
      wpGradient: '内置渐变',
      wpUpload: '上传图片',
      wpUrl: '图片链接',
      wpUrlPlaceholder: 'https://… 图片地址',
      wpApplyUrl: '应用',
      wpClear: '清除壁纸',
      wpDim: '暗度',
      surfaceOpacity: '界面不透明度',
      surfaceOpacityDesc: '数值越低，壁纸从内容区透出越明显',
      wpPreview: '预览',
      glass: '毛玻璃',
      glassDesc: '侧边栏与主体分别设置（配合壁纸效果更佳）',
      glassSidebar: '侧边栏毛玻璃',
      glassSidebarDesc: '左侧栏的半透明模糊',
      glassContent: '主体毛玻璃',
      glassContentDesc: '对话区/内容区的半透明模糊',
      glassBlur: '模糊强度',
      glassSat: '饱和度',
      glassOpacity: '不透明度',
      palettePreview: '调色预览',
      paletteLight: '亮色',
      paletteDark: '暗色',
      reset: '恢复默认',
      extracting: '正在从壁纸提取颜色…',
      extractFailed: '壁纸取色失败：请改用本地图片（远端链接可能被页面策略拦截）',
      seededBy: '当前取色来源',
      seedFromWallpaper: '壁纸主色',
      seedFromColor: '自选颜色',
      seedFromPreset: '预设色板',
      chromeHint: '该页样式全部使用 Harness 主题 Token，自动跟随亮暗切换。',
      presetGallery: '内置渐变壁纸（随当前调色板联动）',
    };
    const EN = {
      title: 'Monet Theme',
      panelLabel: 'Monet Theme',
      sectionDesc: 'Wallpaper palette · Material Design 3 dynamic theming',
      on: 'On', off: 'Off',
      master: 'Enable beautification',
      masterDesc: 'Reverts to the stock Harness UI while keeping your settings',
      palette: 'Palette source',
      paletteDesc: 'The wallpaper drives the HCT color space and maps onto full MD3 tokens',
      srcWallpaper: 'From wallpaper',
      srcColor: 'Custom color',
      srcPreset: 'Preset palette',
      style: 'Style',
      styleTonal: 'Tonal',
      styleVibrant: 'Vibrant',
      styleMuted: 'Muted',
      styleExpressive: 'Expressive',
      styleMonochrome: 'Mono',
      chroma: 'Chroma strength',
      tone: 'Tone shift',
      wallpaper: 'Wallpaper',
      wallpaperDesc: 'App background, and the source for “From wallpaper” seeds',
      wpNone: 'None',
      wpGradient: 'Gradient',
      wpUpload: 'Upload image',
      wpUrl: 'Image URL',
      wpUrlPlaceholder: 'https://… image URL',
      wpApplyUrl: 'Apply',
      wpClear: 'Clear wallpaper',
      wpDim: 'Dim',
      surfaceOpacity: 'Surface opacity',
      surfaceOpacityDesc: 'Lower values let more of the wallpaper show through the content area',
      wpPreview: 'Preview',
      glass: 'Frosted glass',
      glassDesc: 'Sidebar and content area are configured separately (best over a wallpaper)',
      glassSidebar: 'Sidebar glass',
      glassSidebarDesc: 'Translucent blur for the left column',
      glassContent: 'Content glass',
      glassContentDesc: 'Translucent blur for the conversation area',
      glassBlur: 'Blur',
      glassSat: 'Saturation',
      glassOpacity: 'Opacity',
      palettePreview: 'Palette preview',
      paletteLight: 'Light',
      paletteDark: 'Dark',
      reset: 'Reset to defaults',
      extracting: 'Extracting colors from wallpaper…',
      extractFailed: 'Wallpaper extraction failed — try a local image (remote links may be blocked by page policy)',
      seededBy: 'Seed source',
      seedFromWallpaper: 'Wallpaper primary',
      seedFromColor: 'Custom color',
      seedFromPreset: 'Preset palette',
      chromeHint: 'This page is styled with Harness theme tokens only; it follows light/dark automatically.',
      presetGallery: 'Built-in gradient wallpapers (tuned to the current palette)',
    };
    const t = (key) => {
      const lang = (typeof navigator !== 'undefined' && navigator.language || 'zh-CN');
      const table = lang.toLowerCase().startsWith('zh') ? ZH : EN;
      return table[key] || EN[key] || key;
    };

    // ------------------------------------------------------------- defaults
    const PRESETS = [
      { name: 'Indigo', color: '#6750a4' },
      { name: 'Ocean', color: '#0061a4' },
      { name: 'Basil', color: '#00696c' },
      { name: 'Rose', color: '#b90063' },
      { name: 'Mango', color: '#a33e00' },
      { name: 'Sage', color: '#386a20' },
      { name: 'Mist', color: '#535353' },
      { name: 'Aurora', color: '#764672' },
    ];

    const DEFAULT_SETTINGS = {
      enabled: true,
      palette: { source: 'preset', color: '#6750a4', preset: 0, style: 'tonal', chroma: 100, tone: 0 },
      wallpaper: { enabled: false, kind: 'none', value: '' },
      dim: 30,
      // how much of the frame wallpaper shows through the top-level surfaces
      surfaceOpacity: 78,
      glass: {
        // sidebar and main content are configured independently
        sidebar: { enabled: false, blur: 16, saturation: 150, opacity: 88 },
        content: { enabled: false, blur: 16, saturation: 150, opacity: 88 },
      },
      seeds: [],
      seedTag: null,
      extractError: false,
    };

    // ------------------------------------------------------------ persistence
    const store = {
      read() {
        try {
          const raw = window.localStorage.getItem(STORE_KEY);
          if (!raw) return null;
          return JSON.parse(raw);
        } catch (e) { return null; }
      },
      write(s) {
        try { window.localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) { /* quota */ }
      },
    };

    /** Copy the numeric/boolean glass fields shared by a group. */
    function applyGlassGroup(target, src) {
      if (!src) return target;
      if (typeof src.enabled === 'boolean') target.enabled = src.enabled;
      if (Number.isFinite(src.blur)) target.blur = src.blur;
      if (Number.isFinite(src.saturation)) target.saturation = src.saturation;
      if (Number.isFinite(src.opacity)) target.opacity = src.opacity;
      return target;
    }
    /** Accept both the current {sidebar, content} shape and the legacy flat one. */
    function migrateGlass(baseGlass, storedGlass) {
      const out = JSON.parse(JSON.stringify(baseGlass));
      const g = storedGlass;
      if (!g || typeof g !== 'object') return out;
      if (g.sidebar || g.content) {
        applyGlassGroup(out.sidebar, g.sidebar);
        applyGlassGroup(out.content, g.content);
        return out;
      }
      applyGlassGroup(out.sidebar, g);
      out.sidebar.enabled = typeof g.enabled === 'boolean' ? g.enabled : out.sidebar.enabled;
      out.content.enabled = false;
      return out;
    }

    function mergeSettings(stored) {
      if (!stored || typeof stored !== 'object') return { ...DEFAULT_SETTINGS, seeds: [], seedTag: null };
      const base = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      return {
        ...base,
        ...stored,
        palette: { ...base.palette, ...(stored.palette || {}) },
        wallpaper: { ...base.wallpaper, ...(stored.wallpaper || {}) },
        glass: migrateGlass(base.glass, stored.glass),
        seeds: Array.isArray(stored.seeds) ? stored.seeds.map(Number).filter(Number.isFinite) : [],
        seedTag: typeof stored.seedTag === 'string' ? stored.seedTag : null,
      };
    }

    // The last settings this session applied. A re-mounted settings page reads this
    // instead of the defaults captured at activation time, so it shows current values.
    let latestSettings = null;
    function currentSettings() {
      return mergeSettings(latestSettings || store.read());
    }

    // -------------------------------------------------------------- css utils
    let styleEl = null;
    let disposeOverrides = null;
    let applyTimer = null;

    function svgWallpaper(primary, tertiary) {
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
        `<stop offset="0%" stop-color="${primary}"/>` +
        `<stop offset="55%" stop-color="${M.translucent(tertiary, 55)}"/>` +
        `<stop offset="100%" stop-color="${primary}"/>` +
        '</linearGradient></defs>' +
        `<rect width="1600" height="1000" fill="url(#g)"/>` +
        '</svg>';
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
    function cssUrl(value) {
      return 'url("' + String(value).replace(/["\\]/g, (m) => '\\' + m) + '")';
    }
    function wallpaperSource(s) {
      const wp = s.wallpaper;
      if (!wp.enabled) return null;
      if (wp.kind === 'file' || wp.kind === 'url') return wp.value ? cssUrl(wp.value) : null;
      if (wp.kind === 'gradient') {
        // derive from the extrema of the active palette
        const core = buildCoreFromSettings(s);
        const roles = M.buildMaterialRoles(core, 0);
        return cssUrl(svgWallpaper(roles.light.primary, roles.light.tertiary));
      }
      return null;
    }

    function buildCoreFromSettings(s) {
      const seed = resolveSeed(s);
      // During wallpaper extraction the seed can be momentarily unavailable.
      return M.buildCore(seed === null ? 0xff6750a4 : seed, s.palette.chroma / 100, s.palette.style, 0);
    }

    function buildCss(s, source) {
      const wp = s.wallpaper;
      const gs = s.glass.sidebar;
      const gc = s.glass.content;
      const dimL = Math.min(0.55, (s.dim / 100) * 0.55);
      const dimD = Math.min(0.66, (s.dim / 100) * 0.72 + 0.06);
      const gradL = `linear-gradient(rgba(250,250,252,${dimL.toFixed(3)}), rgba(250,250,252,${dimL.toFixed(3)}))`;
      const gradD = `linear-gradient(rgba(8,10,14,${dimD.toFixed(3)}), rgba(8,10,14,${dimD.toFixed(3)}))`;
      const parts = [];
      const roles = M.buildMaterialRoles(buildCoreFromSettings(s), s.palette.tone);
      parts.push('html.m3-monet-on{--m3-font:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}');
      // The window chrome stays a solid theme surface: no wallpaper, no blur.
      parts.push(
        `html.m3-monet-on body:not([data-ds-dark-theme]) [data-windows-titlebar] .BynINW_frame:before{background:${roles.light.surfaceContainer};background-image:none;backdrop-filter:none;-webkit-backdrop-filter:none;}`,
        `html.m3-monet-on body[data-ds-dark-theme] [data-windows-titlebar] .BynINW_frame:before{background:${roles.dark.surfaceContainer};background-image:none;backdrop-filter:none;-webkit-backdrop-filter:none;}`
      );
      if (wp.enabled && source) {
        parts.push(
          `html.m3-wallpaper body:not([data-ds-dark-theme]) .BynINW_frame{background-image:${gradL},${source};background-size:cover;background-position:center;background-repeat:no-repeat;}`,
          `html.m3-wallpaper body[data-ds-dark-theme] .BynINW_frame{background-image:${gradD},${source};background-size:cover;background-position:center;background-repeat:no-repeat;}`,
          // The sidebar shell also paints --dsw-specific-sidebar-fill, right on top of
          // the frame. Make the inner root transparent so a single veil covers the image
          // instead of two stacked ones.
          'html.m3-wallpaper .BynINW_sidebarCol ._2H3hWW_root{background:transparent;}'
        );
        // The settings dialog is an 800px panel over a full-screen mask
        // (ui-settings-general: .wCInkW_panel / .wCInkW_mask). Make both see-through so
        // the wallpaper stays visible behind the settings page, with a frosted backdrop.
        const basePct = Math.max(35, Math.min(96, Number(s.surfaceOpacity) || 78));
        const contentPct = gc.enabled ? gc.opacity : basePct;
        const panelBlur = gc.enabled ? gc.blur : 18;
        const panelSat = gc.enabled ? gc.saturation : 150;
        const frost = `backdrop-filter:blur(${panelBlur}px) saturate(${panelSat}%);-webkit-backdrop-filter:blur(${panelBlur}px) saturate(${panelSat}%);`;
        parts.push(
          `html.m3-wallpaper .wCInkW_mask{${frost}}`,
          `html.m3-wallpaper body:not([data-ds-dark-theme]) .wCInkW_panel{background:color-mix(in srgb, ${roles.light.surfaceContainer} ${contentPct}%, transparent);${frost}}`,
          `html.m3-wallpaper body[data-ds-dark-theme] .wCInkW_panel{background:color-mix(in srgb, ${roles.dark.surfaceContainer} ${contentPct}%, transparent);${frost}}`
        );
      }
      // Sidebar and content glass are configured separately.
      if (gs.enabled) {
        parts.push(
          `html.m3-glass-sidebar .BynINW_sidebarCol{backdrop-filter:blur(${gs.blur}px) saturate(${gs.saturation}%);-webkit-backdrop-filter:blur(${gs.blur}px) saturate(${gs.saturation}%);}`
        );
      }
      if (gc.enabled) {
        parts.push(
          `html.m3-glass-content .BynINW_centerCol{backdrop-filter:blur(${gc.blur}px) saturate(${gc.saturation}%);-webkit-backdrop-filter:blur(${gc.blur}px) saturate(${gc.saturation}%);}`
        );
      }
      // Replace the soft edge under the sidebar list with a crisp theme-colored line.
      parts.push(
        'html.m3-monet-on .BynINW_sidebarCol,html.m3-monet-on ._2H3hWW_root,html.m3-monet-on ._2H3hWW_footArea,html.m3-monet-on ._2H3hWW_regionArea{box-shadow:none;}',
        'html.m3-monet-on ._2H3hWW_footArea{border-top:1px solid var(--dsw-alias-border-l2);}'
      );
      return parts.join('\n');
    }

    // ----------------------------------------------------------- seed resolve
    function resolveSeed(s) {
      const p = s.palette;
      if (p.source === 'wallpaper') {
        if (Array.isArray(s.seeds) && s.seeds.length > 0) return s.seeds[0];
        return null;
      }
      if (p.source === 'color') return M.argbFromHex(p.color);
      return M.argbFromHex(PRESETS[p.preset] ? PRESETS[p.preset].color : PRESETS[0].color);
    }
    /** Stable short hash: data URLs share a long common prefix, so slicing is not enough. */
    function hashString(str) {
      let hash = 0x811c9dc5;
      for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        // imul keeps the multiply in 32-bit space; a plain `*` loses the low bits of the
        // product (values above 2^53 get rounded) and weakens the fingerprint.
        hash = Math.imul(hash, 0x01000193) >>> 0;
      }
      return hash.toString(16) + '-' + str.length;
    }
    function wallpaperTag(s) {
      return s.wallpaper.kind + ':' + hashString(String(s.wallpaper.value || ''));
    }

    // ------------------------------------------------------------------ apply
    function applyCss(s) {
      const source = wallpaperSource(s);
      const css = buildCss(s, source);
      if (styleEl) { styleEl.textContent = css; return; }
      styleEl = document.createElement('style');
      styleEl.setAttribute('data-m3-monet', '');
      styleEl.textContent = css;
      (document.head || document.documentElement).appendChild(styleEl);
    }
    function setRootFlag(flag, on) {
      const root = document.documentElement;
      if (on) root.classList.add(flag); else root.classList.remove(flag);
    }
    function applyThemeTokens(s) {
      const seed = resolveSeed(s);
      if (seed === null) return false;
      const core = M.buildCore(seed, s.palette.chroma / 100, s.palette.style, 0);
      const roles = M.buildMaterialRoles(core, s.palette.tone);
      let overrides = M.buildDshTokenOverrides(roles);
      const gl = s.glass;
      const wall = !!s.wallpaper.enabled && (s.wallpaper.kind === 'gradient' || !!s.wallpaper.value);
      const basePct = Math.max(35, Math.min(96, Number(s.surfaceOpacity) || 78));
      const panelPct = Math.max(88, Math.min(98, basePct + 14));
      // The frame owns the wallpaper image; the center column and the sidebar shells are
      // painted on top of it, so they must be translucent for it to be visible at all.
      // Each region follows its own glass opacity, falling back to 界面不透明度.
      const sidebarPct = wall ? (gl.sidebar.enabled ? gl.sidebar.opacity : basePct) : 100;
      const contentPct = wall ? (gl.content.enabled ? gl.content.opacity : basePct) : 100;
      const sFill = sidebarPct >= 100
        ? { light: roles.light.surfaceContainer, dark: roles.dark.surfaceContainer }
        : {
          light: M.translucent(roles.light.surfaceContainer, sidebarPct),
          dark: M.translucent(roles.dark.surfaceContainer, sidebarPct),
        };
      overrides['--dsw-specific-sidebar-fill'] = sFill;
      const navPct = gl.sidebar.enabled ? Math.max(60, gl.sidebar.opacity) : 100;
      overrides['--dsw-specific-sidebar-nav-item-active'] = navPct >= 100
        ? { light: roles.light.secondaryContainer, dark: roles.dark.secondaryContainer }
        : { light: M.translucent(roles.light.secondaryContainer, navPct), dark: M.translucent(roles.dark.secondaryContainer, navPct) };
      if (wall) {
        const veil = (v, pct) => (typeof v === 'string' && v.startsWith('#')
          ? `color-mix(in srgb, ${v} ${pct}%, transparent)`
          : v);
        const veilToken = (key, pct) => {
          const cur = overrides[key];
          if (!cur || typeof cur.light !== 'string') return;
          overrides[key] = { light: veil(cur.light, pct), dark: veil(cur.dark, pct) };
        };
        veilToken('--dsw-alias-bg-base', contentPct);
        veilToken('--dsw-alias-bg-layer-1', panelPct);
        veilToken('--dsw-alias-bg-layer-2', panelPct);
        veilToken('--dsw-alias-bg-layer-3', panelPct);
      }
      try {
        if (typeof disposeOverrides === 'function') { try { disposeOverrides(); } catch (e) { /* noop */ } }
        const ret = ctx.theme.overrideTokens(PKG, overrides);
        disposeOverrides = typeof ret === 'function' ? ret : () => {};
      } catch (e) {
        console.warn('[dsh-m3-monet] overrideTokens failed', e);
        return false;
      }
      return true;
    }
    function applyState(s) {
      latestSettings = s;
      const root = document.documentElement;
      root.classList.add('m3-monet');
      setRootFlag('m3-monet-on', !!s.enabled);
      setRootFlag('m3-glass-sidebar', s.enabled && !!s.glass.sidebar.enabled);
      setRootFlag('m3-glass-content', s.enabled && !!s.glass.content.enabled);
      setRootFlag('m3-wallpaper', s.enabled && s.wallpaper.enabled);
      if (!s.enabled) {
        // release the theme override so the stock theme is restored
        if (typeof disposeOverrides === 'function') { try { disposeOverrides(); } catch (e) { /* noop */ } }
        disposeOverrides = null;
        if (styleEl) styleEl.textContent = '';
        return;
      }
      applyCss(s);
      applyThemeTokens(s);
    }
    function cancelApply() {
      if (applyTimer) { clearTimeout(applyTimer); applyTimer = null; }
    }
    /**
     * Debounced apply. The timer resolves against the newest settings instead of the
     * snapshot it was scheduled with: wallpaper extraction can finish inside the debounce
     * window, and re-applying that older snapshot afterwards would silently revert the
     * colours that were just extracted.
     */
    function applySoon(s) {
      cancelApply();
      const snapshot = s;
      applyTimer = setTimeout(() => { applyTimer = null; applyState(latestSettings || snapshot); }, 120);
    }
    /** Apply a freshly extracted result, beating any debounced apply still in flight. */
    function applyFresh(ns) {
      cancelApply();
      latestSettings = ns;
      store.write(ns);
      applyState(ns);
      if (pendingRefresh) pendingRefresh(ns);
    }
    let extractSeq = 0;
    /**
     * Recompute and persist. Wallpaper colours are extracted whenever the image changes —
     * not only while 「壁纸自动」 is selected — so a stale seed from an earlier wallpaper
     * can never survive.
     */
    function scheduleUpdate(next) {
      let s = mergeSettings(next);
      latestSettings = s;
      const wp = s.wallpaper;
      const isImage = wp.enabled && (wp.kind === 'file' || wp.kind === 'url') && !!wp.value;
      const imageChanged = isImage && s.seedTag !== wallpaperTag(s);
      // Picking a wallpaper drives the palette, unless the user chose a source of their own.
      if (imageChanged && s.palette.source === 'preset') {
        s = mergeSettings({ ...s, palette: { ...s.palette, source: 'wallpaper' }, extractError: false });
        latestSettings = s;
      }
      store.write(s);
      if (imageChanged) {
        const tag = wallpaperTag(s);
        // Extraction is async and can overlap: only the newest request may write results.
        const seq = (extractSeq += 1);
        extractSeeds(s).then((seeds) => {
          if (seq !== extractSeq) return;
          applyFresh(mergeSettings({ ...(latestSettings || store.read()), seeds, seedTag: tag, extractError: false }));
        }).catch((err) => {
          if (seq !== extractSeq) return;
          console.warn('[dsh-m3-monet] wallpaper extraction failed', err);
          applyFresh(mergeSettings({ ...(latestSettings || store.read()), seeds: [], seedTag: tag, extractError: true }));
        });
      }
      applySoon(s);
      if (pendingRefresh) pendingRefresh(s);
    }
    let ctx = null;
    let pendingRefresh = null;

    // ------------------------------------------------------- wallpaper decode
    function loadImageRgba(src, maxEdge = 160) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
            const w = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
            const hh = Math.max(1, Math.round((img.naturalHeight || 1) * scale));
            const c = document.createElement('canvas');
            c.width = w; c.height = hh;
            const g = c.getContext('2d', { willReadFrequently: true });
            g.drawImage(img, 0, 0, w, hh);
            resolve(g.getImageData(0, 0, w, hh).data);
          } catch (e) { reject(e); }
        };
        img.onerror = () => reject(new Error('image load failed'));
        img.src = src;
      });
    }
    async function extractSeeds(s) {
      const value = s.wallpaper.value;
      if (!value) return [];
      const rgba = await loadImageRgba(value, 160);
      return M.extractSeedsFromRgba(rgba, 4);
    }
    function fileToScaledDataUrl(file, maxEdge = 1600, quality = 0.82) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            try {
              const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
              const w = Math.round(img.naturalWidth * scale);
              const hh = Math.round(img.naturalHeight * scale);
              const c = document.createElement('canvas');
              c.width = w; c.height = hh;
              c.getContext('2d').drawImage(img, 0, 0, w, hh);
              resolve(c.toDataURL('image/jpeg', quality));
            } catch (e) { reject(e); }
          };
          img.onerror = () => reject(new Error('decode failed'));
          img.src = String(reader.result);
        };
        reader.onerror = () => reject(new Error('read failed'));
        reader.readAsDataURL(file);
      });
    }

    // ------------------------------------------------------------- ui kit
    const ROW = { padding: '10px 14px', borderTop: '1px solid var(--dsw-alias-border-l1)' };
    const rowText = (label, desc) =>
      h('div', { style: { minWidth: 0, flex: 1 } },
        h('div', { style: { fontSize: 13, color: 'var(--dsw-alias-label-primary)', lineHeight: '20px' } }, label),
        desc ? h('div', { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)', marginTop: 1 } }, desc) : null);

    function Row({ label, desc, children }) {
      return h('div', { style: ROW },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' } },
          rowText(label, desc),
          children ? h('div', { style: { flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 } }, children) : null));
    }
    function Toggle({ value, onChange, label }) {
      return h('button', {
        role: 'switch', 'aria-checked': !!value, 'aria-label': label || '',
        onClick: () => onChange(!value),
        style: {
          width: 36, height: 20, borderRadius: 999, padding: 0, border: 'none', cursor: 'pointer',
          background: value ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-border-l3)',
          transition: 'background 0.18s ease', position: 'relative', flexShrink: 0,
        },
      }, h('span', { style: {
        position: 'absolute', top: 2, left: value ? 18 : 2, width: 16, height: 16, borderRadius: '50%',
        background: 'var(--dsw-alias-label-primary-inverted)', transition: 'left 0.18s ease',
      }}));
    }
    function Slider({ value, min, max, step = 1, onChange, suffix }) {
      return h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 190 } },
        h('input', {
          type: 'range', min, max, step, value,
          onChange: (e) => onChange(Number(e.target.value)),
          style: { flex: 1, accentColor: 'var(--dsw-alias-brand-primary)', height: 3, minWidth: 120 },
        }),
        h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)', width: 40, textAlign: 'right' } },
          value + (suffix || '')));
    }
    function Segment({ options, value, onChange }) {
      return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
        options.map((o) => h('button', {
          key: o.value, onClick: () => onChange(o.value),
          style: {
            fontSize: 12, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l2)',
            color: value === o.value ? 'var(--dsw-alias-label-primary-inverted)' : 'var(--dsw-alias-label-secondary)',
            background: value === o.value ? 'var(--dsw-alias-brand-primary)' : 'transparent',
          },
        }, o.label)));
    }
    function Swatch({ color, title }) {
      return h('div', {
        title,
        style: { width: 26, height: 26, borderRadius: 8, background: color, border: '1px solid var(--dsw-alias-border-l2)', flexShrink: 0 },
      });
    }
    function Section({ title, children }) {
      return h('div', { style: { marginTop: 4 } },
        h('div', { style: { fontSize: 13, fontWeight: 600, color: 'var(--dsw-alias-label-primary)', padding: '10px 14px 2px', lineHeight: '20px' } }, title),
        children);
    }
    function Card({ children, style }) {
      return h('div', { style: {
        margin: '10px 14px', borderRadius: 12, overflow: 'hidden',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)', ...(style || {}),
      } }, children);
    }

    // -------------------------------------------------------- settings view
    const STYLE_OPTIONS = [
      { value: 'tonal', label: t('styleTonal') },
      { value: 'vibrant', label: t('styleVibrant') },
      { value: 'muted', label: t('styleMuted') },
      { value: 'expressive', label: t('styleExpressive') },
      { value: 'monochrome', label: t('styleMonochrome') },
    ];
    const SRC_OPTIONS = [
      { value: 'wallpaper', label: t('srcWallpaper') },
      { value: 'color', label: t('srcColor') },
      { value: 'preset', label: t('srcPreset') },
    ];
    const WP_OPTIONS = [
      { value: 'none', label: t('wpNone') },
      { value: 'gradient', label: t('wpGradient') },
      { value: 'upload', label: t('wpUpload') },
    ];

    function PaletteStrip({ s }) {
      const core = buildCoreFromSettings(s);
      const roles = M.buildMaterialRoles(core, 0);
      const rows = [
        { label: t('paletteLight'), colors: [roles.light.primary, roles.light.primaryContainer, roles.light.secondary, roles.light.secondaryContainer, roles.light.tertiary, roles.light.tertiaryContainer, roles.light.surfaceContainerHighest, roles.light.error] },
        { label: t('paletteDark'), colors: [roles.dark.primary, roles.dark.primaryContainer, roles.dark.secondary, roles.dark.secondaryContainer, roles.dark.tertiary, roles.dark.tertiaryContainer, roles.dark.surfaceContainerHighest, roles.dark.error] },
      ];
      return h('div', { style: { padding: '10px 14px', display: 'grid', gap: 8 } },
        rows.map((r) => h('div', { key: r.label, style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)', width: 34 } }, r.label),
          r.colors.map((c, i) => h(Swatch, { key: i, color: c, title: c })))));
    }

    function SettingsView({ s, update, status }) {
      const p = s.palette;
      const wp = s.wallpaper;
      const gl = s.glass;
      const fileRef = useRef(null);
      const seedLabel = p.source === 'wallpaper'
        ? (s.seeds && s.seeds.length ? t('seedFromWallpaper') : (s.extractError ? t('extractFailed') : (status || t('extracting'))))
        : (p.source === 'color' ? t('seedFromColor') : t('seedFromPreset'));
      const seed = resolveSeed(s);
      const seedHex = seed === null ? null : M.hexFromArgb(seed);
      const previewBg = (wp.enabled && (wp.kind === 'file' ? wp.value : wp.kind === 'url' ? wp.value : null))

      return h('div', { style: { fontFamily: 'var(--m3-font)' } },
        h(Section, { title: t('palette') },
          h(Card, {},
            h(Row, { label: t('palette'), desc: t('paletteDesc') },
              h(Segment, { options: SRC_OPTIONS, value: p.source, onChange: (v) => update({ ...s, palette: { ...p, source: v } }) })),
            p.source === 'color' && h(Row, { label: t('srcColor') },
              h('input', {
                type: 'color', value: /^#[0-9a-f]{6}$/i.test(p.color) ? p.color : '#6750a4',
                onChange: (e) => update({ ...s, palette: { ...p, color: e.target.value } }),
                style: { width: 30, height: 30, padding: 0, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8, background: 'transparent', cursor: 'pointer' },
              }),
              h('input', {
                value: p.color, spellCheck: false,
                onChange: (e) => update({ ...s, palette: { ...p, color: e.target.value } }),
                style: { width: 90, fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)' },
              })),
            p.source === 'preset' && h(Row, { label: t('srcPreset') },
              h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 220 } },
                PRESETS.map((pr, i) => h('button', {
                  key: pr.name, title: pr.name,
                  onClick: () => update({ ...s, palette: { ...p, preset: i } }),
                  style: { width: 22, height: 22, borderRadius: 7, border: '2px solid ' + (i === p.preset ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-border-l2)'), background: pr.color, cursor: 'pointer', padding: 0 },
                })))),
            h(Row, { label: t('style') },
              h(Segment, { options: STYLE_OPTIONS, value: p.style, onChange: (v) => update({ ...s, palette: { ...p, style: v } }) })),
            h(Row, { label: t('chroma') },
              h(Slider, { value: p.chroma, min: 40, max: 160, suffix: '%', onChange: (v) => update({ ...s, palette: { ...p, chroma: v } }) })),
            h(Row, { label: t('tone'), desc: seedLabel },
              h(Slider, { value: p.tone, min: -6, max: 6, suffix: '', onChange: (v) => update({ ...s, palette: { ...p, tone: v } }) })),
            h(Row, { label: t('seededBy'), desc: seedHex || '' },
              h(Swatch, { color: seedHex || 'transparent', title: seedHex || '' })))),

        h(Section, { title: t('palettePreview') },
          h(Card, {}, h(PaletteStrip, { s }))),

        h(Section, { title: t('wallpaper'), desc: t('wallpaperDesc') },
          h(Card, {},
            h(Row, { label: t('wallpaper'), desc: t('wallpaperDesc') },
              h(Toggle, { value: wp.enabled, onChange: (v) => update({ ...s, wallpaper: { ...wp, enabled: v } }) })),
            wp.enabled && h(Row, { label: t('wpPreview') },
              h('div', {
                style: {
                  width: 130, height: 60, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                  backgroundImage: previewBg ? `url(${previewBg})` : (wp.kind === 'gradient'
                    ? `url(${svgWallpaper(seedHex || '#6750a4', M.hexFromArgb(M.argbFromHex(PRESETS[p.preset] ? PRESETS[p.preset].color : '#6750a4')))})`
                    : 'none'),
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  border: '1px solid var(--dsw-alias-border-l2)',
                },
              })),
            wp.enabled && h(Row, { label: t('wpGradient') },
              h(Segment, { options: WP_OPTIONS, value: wp.kind, onChange: (v) => update({ ...s, wallpaper: { ...wp, kind: v, value: v === 'gradient' ? '' : wp.value } }) })),
            wp.enabled && (wp.kind === 'upload' || wp.kind === 'file') && h(Row, { label: t('wpUpload') },
              h('input', { ref: fileRef, type: 'file', accept: 'image/*', style: { display: 'none' },
                onChange: async (e) => {
                  const f = e.target.files && e.target.files[0];
                  if (!f) return;
                  try {
                    const dataUrl = await fileToScaledDataUrl(f);
                    update({ ...s, wallpaper: { ...wp, kind: 'file', value: dataUrl } });
                  } catch (err) { console.warn('[dsh-m3-monet] upload failed', err); }
                  e.target.value = '';
                } }),
              h('button', { onClick: () => fileRef.current && fileRef.current.click(), style: btnStyle('ghost') }, t('wpUpload'))),
            wp.enabled && wp.kind === 'url' && h(Row, { label: t('wpUrl') },
              h('input', {
                placeholder: t('wpUrlPlaceholder'), value: wp.kind === 'url' ? wp.value : '',
                spellCheck: false,
                onChange: (e) => update({ ...s, wallpaper: { ...wp, value: e.target.value } }),
                style: { width: 170, fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)' },
              })),
            wp.enabled && (wp.kind === 'file' || wp.kind === 'url') && h(Row, { label: '' },
              h('button', { onClick: () => update({ ...s, wallpaper: { ...wp, kind: 'none', value: '' } }), style: btnStyle('ghost') }, t('wpClear'))),
            wp.enabled && h(Row, { label: t('wpDim') },
              h(Slider, { value: s.dim, min: 0, max: 60, suffix: '%', onChange: (v) => update({ ...s, dim: v }) })),
            wp.enabled && h(Row, { label: t('surfaceOpacity'), desc: t('surfaceOpacityDesc') },
              h(Slider, { value: s.surfaceOpacity, min: 40, max: 96, suffix: '%', onChange: (v) => update({ ...s, surfaceOpacity: v }) })))),

        h(Section, { title: t('glass'), desc: t('glassDesc') },
          h(Card, {},
            h(Row, { label: t('glassSidebar'), desc: t('glassSidebarDesc') },
              h(Toggle, { value: gl.sidebar.enabled, onChange: (v) => update({ ...s, glass: { ...gl, sidebar: { ...gl.sidebar, enabled: v } } }) })),
            gl.sidebar.enabled && h(Row, { label: t('glassBlur') },
              h(Slider, { value: gl.sidebar.blur, min: 6, max: 36, suffix: 'px', onChange: (v) => update({ ...s, glass: { ...gl, sidebar: { ...gl.sidebar, blur: v } } }) })),
            gl.sidebar.enabled && h(Row, { label: t('glassSat') },
              h(Slider, { value: gl.sidebar.saturation, min: 100, max: 220, suffix: '%', onChange: (v) => update({ ...s, glass: { ...gl, sidebar: { ...gl.sidebar, saturation: v } } }) })),
            gl.sidebar.enabled && h(Row, { label: t('glassOpacity') },
              h(Slider, { value: gl.sidebar.opacity, min: 45, max: 96, suffix: '%', onChange: (v) => update({ ...s, glass: { ...gl, sidebar: { ...gl.sidebar, opacity: v } } }) })),
            h(Row, { label: t('glassContent'), desc: t('glassContentDesc') },
              h(Toggle, { value: gl.content.enabled, onChange: (v) => update({ ...s, glass: { ...gl, content: { ...gl.content, enabled: v } } }) })),
            gl.content.enabled && h(Row, { label: t('glassBlur') },
              h(Slider, { value: gl.content.blur, min: 6, max: 36, suffix: 'px', onChange: (v) => update({ ...s, glass: { ...gl, content: { ...gl.content, blur: v } } }) })),
            gl.content.enabled && h(Row, { label: t('glassSat') },
              h(Slider, { value: gl.content.saturation, min: 100, max: 220, suffix: '%', onChange: (v) => update({ ...s, glass: { ...gl, content: { ...gl.content, saturation: v } } }) })),
            gl.content.enabled && h(Row, { label: t('glassOpacity') },
              h(Slider, { value: gl.content.opacity, min: 45, max: 96, suffix: '%', onChange: (v) => update({ ...s, glass: { ...gl, content: { ...gl.content, opacity: v } } }) })))),

        h(Section, { title: t('master') },
          h(Card, {},
            h(Row, { label: t('master'), desc: t('masterDesc') },
              h(Toggle, { value: s.enabled, onChange: (v) => update({ ...s, enabled: v }) })),
            h(Row, { label: '' },
              h('button', { onClick: () => update(JSON.parse(JSON.stringify(DEFAULT_SETTINGS))), style: btnStyle('ghost') }, t('reset'))))),

        h('div', { style: { padding: '8px 14px 18px', fontSize: 11, color: 'var(--dsw-alias-label-tertiary)', lineHeight: '18px' } }, t('chromeHint')),
      );
    }

    function btnStyle(kind) {
      return {
        fontSize: 12, padding: '4px 12px', borderRadius: 999, cursor: 'pointer',
        color: kind === 'primary' ? 'var(--dsw-alias-brand-text)' : 'var(--dsw-alias-label-secondary)',
        background: kind === 'primary' ? 'var(--dsw-alias-brand-primary)' : 'transparent',
        border: '1px solid var(--dsw-alias-border-l2)',
      };
    }

    // -------------------------------------------------------------- entries

    const SCROLL_WRAP = { height: '100%', maxHeight: '100%', overflowY: 'auto', overscrollBehavior: 'contain' };
    const PAGE_PADDING = { padding: '0 0 24px' };

    // The plugin's own settings page: the shell scrolls the section area when the
    // content overflows, so keep a full-height, vertically scrollable wrapper.
    function SettingsPage(props) {
      return h('div', { style: { ...SCROLL_WRAP, ...PAGE_PADDING } }, h(SettingsView, props));
    }

    // ------------------------------------------------------------------ apply
    return {
      inject: ['slots', 'theme'],
      apply(appCtx) {
        ctx = appCtx;
        let mounted = {};
        const initial = mergeSettings(store.read());
        latestSettings = initial;
        pendingRefresh = (s) => {
          Object.keys(mounted).forEach((k) => mounted[k] && mounted[k](s));
        };

        // initial application
        applyState(initial);
        // A stored wallpaper whose colours are missing/stale must be re-extracted now.
        if (initial.enabled && initial.wallpaper.enabled
          && (initial.wallpaper.kind === 'file' || initial.wallpaper.kind === 'url')
          && initial.wallpaper.value && initial.seedTag !== wallpaperTag(initial)) {
          scheduleUpdate(initial);
        }

        // plugin settings page; not exposed on the main page or the sidebar
        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'monet-theme',
          order: 120,
          label: () => t('panelLabel'),
        }, (props) => {
          // read the live settings on every mount, so re-entering the page keeps them
          const [s, setS] = useState(() => currentSettings());
          mounted.settings = setS;
          useEffect(() => () => { delete mounted.settings; }, []);
          return h(SettingsPage, { s, update: (next) => scheduleUpdate(next), ...props });
        }));

        return () => {
          ctx = null;
          pendingRefresh = null;
          if (applyTimer) { clearTimeout(applyTimer); applyTimer = null; }
          if (typeof disposeOverrides === 'function') { try { disposeOverrides(); } catch (e) { /* noop */ } disposeOverrides = null; }
          if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
          styleEl = null;
          const root = document.documentElement;
          root.classList.remove('m3-monet', 'm3-monet-on', 'm3-wallpaper', 'm3-glass', 'm3-glass-sidebar', 'm3-glass-content');
        };
      },
    };
  },
});