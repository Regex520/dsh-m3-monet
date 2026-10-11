import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const code = readFileSync(join(root, 'client.js'), 'utf8');

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

/** A synthetic 64x64 green image, as canvas pixel data. */
function greenRgba(hex = { r: 0x4c, g: 0xaf, b: 0x50 }) {
  const size = 64 * 64 * 4;
  const data = new Uint8ClampedArray(size);
  for (let i = 0; i < size; i += 4) {
    data[i] = hex.r; data[i + 1] = hex.g; data[i + 2] = hex.b; data[i + 3] = 255;
  }
  return data;
}
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
// Long enough for the 120ms debounced apply AND the async extraction to both have run,
// so a pending debounce can still overwrite the extracted result (the regression below).
const settle = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));

/** Load client.js in a stubbed browser and run apply() with the given stored settings. */
function runScenario(stored) {
  const React = {
    createElement: (t, props, ...children) => ({ t, props: props || {}, children }),
    useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
    useEffect: () => {},
    useRef: (v) => ({ current: v }),
    useCallback: (fn) => fn,
  };
  const registrations = [];
  const writes = [];
  const fakeCtx = {
    slots: {
      inject: (name, regFn) => { const r = regFn(); registrations.push({ ...r, name }); },
      register: (opts, comp) => ({ ...opts, comp }),
    },
    theme: {
      overrideTokens: (source, tokens) => {
        fakeCtx.lastSource = source;
        fakeCtx.lastTokens = tokens;
        fakeCtx.renders = (fakeCtx.renders || 0) + 1;
        return () => { fakeCtx.disposed = true; };
      },
    },
  };
  const styleEls = [];
  const sandbox = {
    console, JSON, Math, Map, Set, Promise, Uint8ClampedArray, encodeURIComponent, setTimeout, clearTimeout,
    navigator: { language: 'zh-CN' },
    window: {
      __ModuleLoader__: { load: (m) => { sandbox.__mod = m; } },
      localStorage: {
        getItem: () => (stored === undefined ? null : JSON.stringify(stored)),
        setItem: (k, v) => { writes.push(v); try { stored = JSON.parse(v); } catch (e) { /* noop */ } },
        removeItem: () => {},
      },
      __M3_ENGINE__: null,
    },
    document: {
      createElement: (tag) => {
        if (tag === 'canvas') {
          return { width: 0, height: 0, getContext: () => ({ drawImage() {}, getImageData: () => ({ data: greenRgba() }) }) };
        }
        const e = { setAttribute() {}, appendChild() {}, textContent: '', style: {} };
        styleEls.push(e);
        return e;
      },
      head: { appendChild() {} },
      documentElement: { style: { setProperty() {} }, classList: { add() {}, remove() {} } },
    },
    // loads synchronously so wallpaper extraction can be asserted without a real browser
    Image: function Image() {
      this.naturalWidth = 64;
      this.naturalHeight = 64;
      this.onload = null;
      this.onerror = null;
      let src = '';
      Object.defineProperty(this, 'src', {
        get: () => src,
        set: (v) => { src = v; if (this.onload) this.onload(); },
      });
    },
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.navigator = sandbox.navigator;

  vm.runInNewContext(code, sandbox, { filename: 'client.js' });
  const mod = sandbox.__mod;
  assert(mod, 'ModuleLoader.load was never called');
  const api = mod.factory((name) => {
    if (name === 'react') return React;
    throw new Error('unexpected require(' + name + ')');
  });
  assert(api && api.apply, 'factory returned no apply');
  const cleanup = api.apply(fakeCtx);
  return {
    mod, api, registrations, writes, tokens: fakeCtx.lastTokens, source: fakeCtx.lastSource,
    renders: fakeCtx.renders, css: styleEls[0] && styleEls[0].textContent, cleanup, ctx: fakeCtx,
    engine: sandbox.window.__M3_ENGINE__,
  };
}

const sectionOf = (r) => r.registrations.find((x) => x.name === 'settings.section');
/** Render the registered settings page with the fake hook runtime and read its state. */
const settingsSeenByPage = (r) => sectionOf(r).comp({}).props.s;

// ---------------------------------------------------------- scenario 1: defaults
const s1 = runScenario(undefined);
assert(s1.mod.id === '@local/dsh-m3-monet', 'bad module id: ' + s1.mod.id);
assert(s1.api.inject.includes('slots') && s1.api.inject.includes('theme'), 'missing slots/theme inject');
assert(s1.tokens['--dsw-alias-brand-primary'].light.startsWith('#'), 'brand-primary should be a solid color by default');
assert(s1.source === '@local/dsh-m3-monet', 'override source wrong: ' + s1.source);
assert(s1.tokens['--dsw-alias-bg-base'].light.startsWith('#'), 'bg-base must stay solid without a wallpaper');
assert(!String(s1.tokens['--dsw-specific-sidebar-fill'].light).includes('color-mix'), 'sidebar must stay solid without wallpaper or glass');
const names1 = s1.registrations.map((r) => r.name);
assert(names1.includes('settings.section'), 'settings.section not registered');
assert(!names1.includes('main'), 'main panel must NOT be registered (no main-page presence)');
assert(!names1.includes('sidebar.panellist'), 'sidebar.panellist must NOT be registered (no left-sidebar entry)');
assert(sectionOf(s1).id === 'monet-theme', 'settings.section id wrong');
// window chrome is a solid theme surface, never wallpaper/glass
assert(s1.css.includes('[data-windows-titlebar] .BynINW_frame:before{background:#'), 'title bar must be a solid color');
assert(s1.css.includes('backdrop-filter:none'), 'title bar must not be blurred');
assert(!s1.css.includes('m3-glass '), 'the old combined glass flag must be gone');
// the soft sidebar edge is replaced by a theme-colored line
assert(s1.css.includes('._2H3hWW_footArea{border-top:1px solid var(--dsw-alias-border-l2);}'), 'sidebar footer line missing');
// overlay masks stay translucent like the stock theme (never an opaque scrim)
const mask1 = s1.tokens['--dsw-alias-bg-mask-1'].light;
assert(mask1.includes('color-mix') && mask1.includes('24%'), 'bg-mask-1 must be a 24% translucent scrim, got: ' + mask1);
assert(s1.tokens['--dsw-alias-bg-skeleton'].light.includes('color-mix'), 'bg-skeleton must stay translucent');
assert(s1.tokens['--dsw-alias-border-inverted'].light === 'transparent', 'border-inverted is transparent in the light theme');
// no wallpaper -> the settings dialog keeps the stock opaque surface
assert(!s1.css.includes('.wCInkW_panel'), 'the settings panel must stay stock without a wallpaper');

// --------------------------------- scenario 2: wallpaper on, separate sidebar/content glass
const s2 = runScenario({
  enabled: true,
  wallpaper: { enabled: true, kind: 'url', value: 'https://example.com/bg.jpg' },
  surfaceOpacity: 70,
  glass: {
    sidebar: { enabled: true, blur: 18, saturation: 160, opacity: 80 },
    content: { enabled: true, blur: 8, saturation: 120, opacity: 60 },
  },
});
const s2bg = s2.tokens['--dsw-alias-bg-base'].light;
const s2fill = s2.tokens['--dsw-specific-sidebar-fill'].light;
assert(s2bg.includes('color-mix') && s2bg.includes('60%'), 'content veil must use the CONTENT glass opacity, got: ' + s2bg);
assert(s2fill.includes('color-mix') && s2fill.includes('80%'), 'sidebar veil must use the SIDEBAR glass opacity, got: ' + s2fill);
assert(s2.tokens['--dsw-alias-bg-layer-1'].light.includes('color-mix'), 'panels stay slightly translucent');
assert(s2.css.includes('.BynINW_sidebarCol{backdrop-filter:blur(18px) saturate(160%)'), 'sidebar blur must be independent');
assert(s2.css.includes('.BynINW_centerCol{backdrop-filter:blur(8px) saturate(120%)'), 'content blur must be independent');
assert(s2.css.includes('https://example.com/bg.jpg'), 'wallpaper must be painted on the frame');
assert(s2.css.includes('.BynINW_sidebarCol ._2H3hWW_root{background:transparent;}'), 'inner sidebar root must be transparent');
// the settings dialog becomes see-through over the wallpaper, using the content glass values
assert(s2.css.includes('.wCInkW_mask{backdrop-filter:blur(8px) saturate(120%)'), 'settings backdrop must be frosted with the content glass values');
assert(
  s2.css.includes('.wCInkW_panel{background:color-mix(in srgb, ') && s2.css.includes('60%, transparent);backdrop-filter:blur(8px) saturate(120%)'),
  'settings panel must be a 60% see-through surface, css: ' + s2.css
);

// ------------------- scenario 2b: wallpaper switched on but no image yet -> stay solid
const s2b = runScenario({
  enabled: true,
  wallpaper: { enabled: true, kind: 'url', value: '' },
  surfaceOpacity: 70,
});
assert(
  s2b.tokens['--dsw-alias-bg-base'].light.startsWith('#'),
  'with no wallpaper source the surfaces must stay solid, got: ' + s2b.tokens['--dsw-alias-bg-base'].light
);

// ------------------ scenario 3: persisted settings survive re-entering the page
const stored = {
  enabled: true,
  palette: { source: 'color', color: '#b90063', preset: 3, style: 'vibrant', chroma: 120, tone: 2 },
  wallpaper: { enabled: true, kind: 'url', value: 'https://example.com/x.jpg' },
  surfaceOpacity: 55,
  glass: {
    sidebar: { enabled: true, blur: 20, saturation: 170, opacity: 75 },
    content: { enabled: false, blur: 8, saturation: 120, opacity: 60 },
  },
  dim: 45,
};
const s3 = runScenario(stored);
const seen = settingsSeenByPage(s3);
assert(seen.palette.color === '#b90063', 'settings page must show the stored palette color, got: ' + seen.palette.color);
assert(seen.palette.source === 'color', 'settings page must show the stored palette source');
assert(seen.glass.sidebar.blur === 20, 'settings page must show the stored sidebar blur');
assert(seen.glass.content.enabled === false, 'settings page must show the stored content glass state');
assert(seen.surfaceOpacity === 55, 'settings page must show the stored surface opacity');

// ------------------ scenario 3b: legacy flat glass config migrates to the sidebar group
const s3b = runScenario({
  glass: { enabled: true, blur: 12, saturation: 140, opacity: 70 },
});
const seenLegacy = settingsSeenByPage(s3b);
assert(seenLegacy.glass.sidebar.enabled === true, 'legacy glass.enabled must migrate to the sidebar group');
assert(seenLegacy.glass.sidebar.blur === 12, 'legacy glass.blur must migrate');
assert(seenLegacy.glass.content.enabled === false, 'legacy config must not enable content glass');

// --------------------------------- scenario 4: master switch off -> override released
const s4 = runScenario({
  enabled: false,
  wallpaper: { enabled: true, kind: 'url', value: 'https://example.com/bg.jpg' },
});
assert(!s4.tokens, 'no theme override may be applied while beautification is disabled');

// ---------------- scenario 5: a new wallpaper image must re-extract its colours
// Regression: the tag used to be `kind + value.slice(0, 64)`, and every JPEG data URL
// shares that prefix, so a second wallpaper was treated as "already extracted" and the
// seed stayed at the previous wallpaper's colour.
const dataUrlB = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD' + 'B'.repeat(400);
const staleTag = 'file:' + dataUrlB.slice(0, 64); // what the old code persisted
const s5 = runScenario({
  enabled: true,
  palette: { source: 'wallpaper' },
  wallpaper: { enabled: true, kind: 'file', value: dataUrlB },
  seeds: [0xff6750a4],
  seedTag: staleTag,
});
await settle();
const s5writes = s5.writes.map((w) => JSON.parse(w));
const s5last = s5writes[s5writes.length - 1];
assert(s5last.seedTag !== staleTag, 'a new wallpaper must produce a NEW seed tag, got: ' + s5last.seedTag);
assert(Array.isArray(s5last.seeds) && s5last.seeds.length > 0, 'stale seeds must be re-extracted from the wallpaper');
const extracted = s5last.seeds[0];
assert(
  s5.engine.greenFromArgb(extracted) > s5.engine.blueFromArgb(extracted),
  'the extracted seed must come from the green wallpaper, got: ' + s5.engine.hexFromArgb(extracted)
);
const s5token = s5.ctx.lastTokens['--dsw-alias-brand-primary'].light;
assert(s5token !== '#6750a4', 'the applied theme must follow the re-extracted wallpaper colour, got: ' + s5token);
// Regression: extraction finishes inside the 120ms debounce window, and the pending
// debounced apply used to run afterwards with the pre-extraction snapshot — silently
// re-applying the OLD seed, so the colour only refreshed after a manual source toggle.
const oldSeedPrimary = s5.engine.buildDshTokenOverrides(
  s5.engine.buildMaterialRoles(s5.engine.buildCore(0xff6750a4, 1, 'tonal', 0))
)['--dsw-alias-brand-primary'].light;
assert(
  s5token !== oldSeedPrimary,
  'the stale debounced apply must not revert the theme to the previous seed (' + oldSeedPrimary + ')'
);
assert(s5.ctx.renders >= 2, 'the theme must be re-applied after extraction');

// ---------------- scenario 6: enabling a wallpaper drives the palette automatically
const s6 = runScenario({
  enabled: true,
  palette: { source: 'preset', preset: 0 },
  wallpaper: { enabled: true, kind: 'file', value: dataUrlB },
  seedTag: null,
});
await settle();
const s6last = s6.writes.map((w) => JSON.parse(w)).pop();
assert(s6last.palette.source === 'wallpaper', 'a wallpaper must switch the palette source to 壁纸自动, got: ' + s6last.palette.source);
assert(
  s6.engine.greenFromArgb(s6last.seeds[0]) > s6.engine.blueFromArgb(s6last.seeds[0]),
  'the auto-selected seed must come from the wallpaper'
);

[s1, s2, s2b, s3, s3b, s4, s5, s6].forEach((r) => r.cleanup());

console.log('slots registered:', names1.join(', '));
console.log('brand-primary:', JSON.stringify(s1.tokens['--dsw-alias-brand-primary']));
console.log('bg-base (no wallpaper):', JSON.stringify(s1.tokens['--dsw-alias-bg-base'].light));
console.log('bg-base (content glass 60%):', JSON.stringify(s2bg));
console.log('sidebar fill (sidebar glass 80%):', JSON.stringify(s2fill));
console.log('persisted page state:', JSON.stringify({ color: seen.palette.color, sidebarBlur: seen.glass.sidebar.blur, surfaceOpacity: seen.surfaceOpacity }));
console.log('wallpaper seed extracted:', s5.engine.hexFromArgb(extracted), '-> brand-primary', s5token);
console.log('CLIENT SMOKE PASSED');
