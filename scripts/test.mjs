import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert';

// lib/engine.js is a plain script (the package is ESM, so it exports nothing);
// run it in a CJS-ish sandbox and pick the engine up from module.exports.
const code = readFileSync(new URL('../lib/engine.js', import.meta.url), 'utf8');
const sandbox = { console, JSON, Math, Map, Set, Uint8ClampedArray, module: { exports: {} } };
vm.runInNewContext(code, sandbox, { filename: 'engine.js' });
const M = sandbox.module.exports;
assert.ok(M && M.hexFromArgb, 'engine did not export its API');

function hex(v) { return M.hexFromArgb(v); }

// 1) hex roundtrip
assert.strictEqual(hex(M.argbFromHex('#4285f4')), '#4285f4');
assert.strictEqual(hex(M.argbFromHex('4285f4')), '#4285f4');

// 2) HCT from a known color (Google Blue)
const hct = M.Hct.fromInt(0xff4285f4);
console.log('blue hct:', hct.hue.toFixed(2), hct.chroma.toFixed(2), hct.tone.toFixed(2));
assert.ok(hct.hue > 250 && hct.hue < 280, 'hue of #4285f4 should be ~262');
assert.ok(hct.chroma > 60, 'chroma should be high');

// 3) tonal palette monotonicity: tone 90 lighter than tone 40
const tp = M.TonalPalette.fromInt(0xff4285f4);
const l40 = M.lstarFromArgb(tp.tone(40));
const l90 = M.lstarFromArgb(tp.tone(90));
assert.ok(l90 > l40, 'tone 90 must be lighter than tone 40');

// 4) Scheme roles from a seed
const light = M.Scheme.light(0xff4285f4).toJSON();
const dark = M.Scheme.dark(0xff4285f4).toJSON();
console.log('light.primary:', hex(light.primary), 'dark.primary:', hex(dark.primary));
assert.strictEqual(hex(light.primary), '#005ac1');
assert.strictEqual(hex(dark.primary), '#adc6ff');
assert.ok(light.primary !== dark.primary);

// 5) Monet extraction: synthetic image, mostly blue with some red accents
const w = 96, h = 96;
const rgba = new Uint8ClampedArray(w * h * 4);
for (let i = 0; i < w * h; i++) {
  const o = i * 4;
  const blue = (i % 4) !== 3; // 75% blue, 25% red
  rgba[o] = blue ? 40 : 220;
  rgba[o + 1] = blue ? 120 : 40;
  rgba[o + 2] = blue ? 240 : 40;
  rgba[o + 3] = 255;
}
const seeds = M.extractSeedsFromRgba(rgba, 4);
console.log('seeds:', seeds.map(hex).join(', '));
assert.ok(seeds.length >= 1);
const s0 = seeds[0];
assert.ok(M.blueFromArgb(s0) > M.redFromArgb(s0), 'dominant seed should be blue');

// 6) token overrides
const core = M.buildCore(0xff4285f4, 1.0, 'tonal', 0);
const roles = M.buildMaterialRoles(core, 0);
const ov = M.buildDshTokenOverrides(roles);
console.log('brand:', JSON.stringify(ov['--dsw-alias-brand-primary']));
console.log('bg-base:', JSON.stringify(ov['--dsw-alias-bg-base']));
console.log('sidebar:', JSON.stringify(ov['--dsw-specific-sidebar-fill']));
console.log('m3-primary:', JSON.stringify(ov['--m3-primary']));
assert.ok(ov['--dsw-alias-brand-primary'].light.startsWith('#'));
assert.ok(ov['--dsw-alias-bg-base'].dark.startsWith('#'));
assert.ok(Object.keys(ov).length > 60, 'override map should cover most tokens');

console.log('ALL ENGINE TESTS PASSED');