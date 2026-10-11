// ============================ extensions (plugin-owned) ============================
function hexFromArgb(argb) {
    const r = redFromArgb(argb);
    const g = greenFromArgb(argb);
    const b = blueFromArgb(argb);
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}
function argbFromHex(hex) {
    let text = String(hex).trim().replace(/^#/, '');
    if (text.length === 3) {
        text = text.split('').map((c) => c + c).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(text)) return 0xff4285f4;
    return argbFromRgb(parseInt(text.slice(0, 2), 16), parseInt(text.slice(2, 4), 16), parseInt(text.slice(4, 6), 16));
}
/**
 * Build a frequency map from RGBA pixel data. Skips transparent pixels, rounds
 * channels to `roundBits` to merge near-duplicates, caps the color count by
 * keeping the most frequent colors.
 */
function quantizePixels(rgba, roundBits = 5, maxColors = 4096) {
    const shift = 8 - roundBits;
    const map = new Map();
    const total = rgba ? Math.floor(rgba.length / 4) : 0;
    const skip = Math.max(1, Math.floor(total / 65536));
    for (let i = 0; i < total; i += skip) {
        const o = i * 4;
        const a = rgba[o + 3];
        if (a < 200) continue;
        const r = rgba[o] >> shift;
        const g = rgba[o + 1] >> shift;
        const b = rgba[o + 2] >> shift;
        const argb = argbFromRgb(r << shift, g << shift, b << shift);
        map.set(argb, (map.get(argb) || 0) + 1);
    }
    if (map.size > maxColors) {
        const byCount = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxColors);
        return new Map(byCount);
    }
    return map;
}
/**
 * Monet seed extraction: quantize the image, score the candidates, return the
 * ranked seed ARGB colors (most suitable first). Mirrors image_utils.
 * @param rgba Uint8ClampedArray RGBA data.
 * @param desired number of candidate seeds.
 */
function extractSeedsFromRgba(rgba, desired = 4) {
    const map = quantizePixels(rgba, 5, 4096);
    return Score.score(map, { desired, fallbackColorARGB: 0xff4285f4, filter: true });
}
/**
 * Build a CorePalette-equivalent from a seed with chroma scaling and tertiary
 * hue offset, so "chroma 强度" and "风格" tweaks can reshape the theme.
 */
function buildCore(seed, chromaScale = 1.0, style = 'tonal', chromaBoost = 0) {
    const hct = Hct.fromInt(seed);
    const hue = hct.hue;
    const sourceChroma = hct.chroma;
    // Merge (Average) vs (Neutral) style presets adjust hue/chroma targets.
    let primaryChroma = Math.max(24, Math.min(96, sourceChroma * chromaScale + chromaBoost));
    let secondaryChroma = 16 * chromaScale + chromaBoost * 0.4;
    let tertiaryHue = hue + 60;
    let tertiaryChroma = 24 * chromaScale + chromaBoost * 0.6;
    let neutralChroma = 4;
    let neutralVariantChroma = 8;
    if (style === 'vibrant') {
        primaryChroma = Math.max(40, Math.min(110, sourceChroma * chromaScale * 1.25 + chromaBoost));
        secondaryChroma = Math.max(24, 16 * chromaScale * 1.2);
        tertiaryChroma = Math.max(28, 24 * chromaScale * 1.2);
        neutralChroma = 6;
        neutralVariantChroma = 12;
    } else if (style === 'muted') {
        primaryChroma = Math.max(20, Math.min(70, sourceChroma * chromaScale * 0.7));
        secondaryChroma = Math.max(12, 16 * chromaScale * 0.7);
        tertiaryChroma = Math.max(16, 24 * chromaScale * 0.7);
        neutralChroma = 3;
        neutralVariantChroma = 6;
    } else if (style === 'expressive') {
        tertiaryHue = hue + 120;
        tertiaryChroma = Math.max(28, 24 * chromaScale * 1.4);
    } else if (style === 'monochrome') {
        primaryChroma = Math.min(primaryChroma, 20);
        secondaryChroma = Math.min(secondaryChroma, 8);
        tertiaryChroma = Math.min(tertiaryChroma, 12);
    }
    const core = {
        a1: TonalPalette.fromHueAndChroma(hue, primaryChroma),
        a2: TonalPalette.fromHueAndChroma(hue, secondaryChroma),
        a3: TonalPalette.fromHueAndChroma(sanitizeDegreesDouble(tertiaryHue), tertiaryChroma),
        n1: TonalPalette.fromHueAndChroma(hue, neutralChroma),
        n2: TonalPalette.fromHueAndChroma(hue, neutralVariantChroma),
        error: TonalPalette.fromHueAndChroma(25, 84),
        success: TonalPalette.fromHueAndChroma(150, 55),
        warn: TonalPalette.fromHueAndChroma(60, 60),
    };
    return core;
}
function clampTone(t) {
    return Math.max(0, Math.min(100, t));
}
/**
 * Full M3 role set (light and dark) from a core, with chromatic tones mapped
 * through the tonal palettes. `toneShift` nudges every picked tone.
 */
function buildMaterialRoles(core, toneShift = 0) {
    const t = (palette, tone) => hexFromArgb(palette.tone(clampTone(tone + toneShift)));
    const light = {
        primary: t(core.a1, 40), onPrimary: t(core.a1, 100),
        primaryContainer: t(core.a1, 90), onPrimaryContainer: t(core.a1, 10),
        secondary: t(core.a2, 40), onSecondary: t(core.a2, 100),
        secondaryContainer: t(core.a2, 90), onSecondaryContainer: t(core.a2, 10),
        tertiary: t(core.a3, 40), onTertiary: t(core.a3, 100),
        tertiaryContainer: t(core.a3, 90), onTertiaryContainer: t(core.a3, 10),
        error: t(core.error, 40), onError: t(core.error, 100),
        errorContainer: t(core.error, 90), onErrorContainer: t(core.error, 10),
        success: t(core.success, 40), onSuccess: t(core.success, 100),
        successContainer: t(core.success, 90), onSuccessContainer: t(core.success, 10),
        warn: t(core.warn, 40), onWarn: t(core.warn, 100),
        warnContainer: t(core.warn, 90), onWarnContainer: t(core.warn, 10),
        background: t(core.n1, 98), onBackground: t(core.n1, 10),
        surface: t(core.n1, 98), onSurface: t(core.n1, 10),
        surfaceDim: t(core.n1, 87), surfaceBright: t(core.n1, 98),
        surfaceContainerLowest: t(core.n1, 100), surfaceContainerLow: t(core.n1, 96),
        surfaceContainer: t(core.n1, 94), surfaceContainerHigh: t(core.n1, 92),
        surfaceContainerHighest: t(core.n1, 90),
        surfaceVariant: t(core.n2, 90), onSurfaceVariant: t(core.n2, 30),
        outline: t(core.n2, 50), outlineVariant: t(core.n2, 80),
        shadow: t(core.n1, 0), scrim: t(core.n1, 0),
        inverseSurface: t(core.n1, 20), inverseOnSurface: t(core.n1, 95),
        inversePrimary: t(core.a1, 80),
    };
    const dark = {
        primary: t(core.a1, 80), onPrimary: t(core.a1, 20),
        primaryContainer: t(core.a1, 30), onPrimaryContainer: t(core.a1, 90),
        secondary: t(core.a2, 80), onSecondary: t(core.a2, 20),
        secondaryContainer: t(core.a2, 30), onSecondaryContainer: t(core.a2, 90),
        tertiary: t(core.a3, 80), onTertiary: t(core.a3, 20),
        tertiaryContainer: t(core.a3, 30), onTertiaryContainer: t(core.a3, 90),
        error: t(core.error, 80), onError: t(core.error, 20),
        errorContainer: t(core.error, 30), onErrorContainer: t(core.error, 80),
        success: t(core.success, 80), onSuccess: t(core.success, 20),
        successContainer: t(core.success, 30), onSuccessContainer: t(core.success, 90),
        warn: t(core.warn, 80), onWarn: t(core.warn, 20),
        warnContainer: t(core.warn, 30), onWarnContainer: t(core.warn, 90),
        background: t(core.n1, 6), onBackground: t(core.n1, 90),
        surface: t(core.n1, 6), onSurface: t(core.n1, 90),
        surfaceDim: t(core.n1, 6), surfaceBright: t(core.n1, 24),
        surfaceContainerLowest: t(core.n1, 4), surfaceContainerLow: t(core.n1, 10),
        surfaceContainer: t(core.n1, 12), surfaceContainerHigh: t(core.n1, 17),
        surfaceContainerHighest: t(core.n1, 22),
        surfaceVariant: t(core.n2, 30), onSurfaceVariant: t(core.n2, 80),
        outline: t(core.n2, 60), outlineVariant: t(core.n2, 30),
        shadow: t(core.n1, 0), scrim: t(core.n1, 0),
        inverseSurface: t(core.n1, 90), inverseOnSurface: t(core.n1, 20),
        inversePrimary: t(core.a1, 40),
    };
    return { light, dark };
}
/** css color-mix fragment with an alpha percentage. */
function translucent(hex, percent) {
    return `color-mix(in srgb, ${hex} ${percent}%, transparent)`;
}
/** Drop-in translucency for a surface over the app base. */
function surfaceOverBase(hex, base, percent) {
    return `color-mix(in srgb, ${hex} ${percent}%, ${base})`;
}
/**
 * Map M3 roles onto the Harness alias tokens (light and dark variants).
 * The returned object is passed to ctx.theme.overrideTokens.
 */
function buildDshTokenOverrides(roles) {
    const L = roles.light;
    const D = roles.dark;
    const mk = (lightValue, darkValue) => ({ light: lightValue, dark: darkValue });
    const kv = (role) => mk(L[role], D[role]);
    const overrides = {};
    const tokens = [
        ['--dsw-alias-bg-base', 'background'],
        ['--dsw-alias-bg-document-preview', 'surfaceContainerLow'],
        ['--dsw-alias-bg-document-selection', 'primaryContainer'],
        ['--dsw-alias-bg-layer-1', 'surfaceContainerLow'],
        ['--dsw-alias-bg-layer-2', 'surfaceContainer'],
        ['--dsw-alias-bg-layer-3', 'surfaceContainerHigh'],
        ['--dsw-alias-bg-mask-1', 'scrim'],
        ['--dsw-alias-bg-mask-2', 'scrim'],
        ['--dsw-alias-bg-mask-3', 'scrim'],
        ['--dsw-alias-bg-mask-drop', 'scrim'],
        ['--dsw-alias-bg-mask-photo', 'scrim'],
        ['--dsw-alias-bg-module-platform', 'surfaceContainerHighest'],
        ['--dsw-alias-bg-multi-select', 'primaryContainer'],
        ['--dsw-alias-bg-overlay', 'surfaceContainerHigh'],
        ['--dsw-alias-bg-skeleton', 'outlineVariant'],
        ['--dsw-alias-border-inverted', 'inverseSurface'],
        ['--dsw-alias-border-inverted2', 'inverseSurface'],
        ['--dsw-alias-border-l1', 'outlineVariant'],
        ['--dsw-alias-border-l2', 'outline'],
        ['--dsw-alias-border-l2-darkmode-thin', 'outline'],
        ['--dsw-alias-border-l3', 'outline'],
        ['--dsw-alias-border-l4', 'outlineVariant'],
        ['--dsw-alias-brand-primary', 'primary'],
        ['--dsw-alias-brand-primary-invert', 'inversePrimary'],
        ['--dsw-alias-brand-primary-new-colorprimary-new-color', 'primary'],
        ['--dsw-alias-brand-text', 'onPrimary'],
        ['--dsw-alias-button-contrast-fill', 'inverseSurface'],
        ['--dsw-alias-button-elevated-fill', 'surfaceContainerLow'],
        ['--dsw-alias-button-floating-fill', 'surfaceContainerHigh'],
        ['--dsw-alias-button-floating-hover', 'surfaceContainerHighest'],
        ['--dsw-alias-button-ghost-active-border', 'outline'],
        ['--dsw-alias-button-ghost-active-fill', 'primaryContainer'],
        ['--dsw-alias-button-ghost-active-hover', 'surfaceContainerHigh'],
        ['--dsw-alias-button-info-fill', 'primaryContainer'],
        ['--dsw-alias-button-info-hover', 'onPrimaryContainer'],
        ['--dsw-alias-button-primary-dimmed', 'onPrimary'],
        ['--dsw-alias-button-primary-fill', 'primary'],
        ['--dsw-alias-button-primary-hover', 'inversePrimary'],
        ['--dsw-alias-button-tool-bar-fill', 'surfaceContainerLow'],
        ['--dsw-alias-button-tool-bar-hover', 'surfaceContainerHigh'],
        ['--dsw-alias-code-diff-added', 'success'],
        ['--dsw-alias-code-diff-deleted', 'error'],
        ['--dsw-alias-file-diff-added-bg', 'successContainer'],
        ['--dsw-alias-file-diff-added-gutter', 'success'],
        ['--dsw-alias-file-diff-added-marker', 'onSuccessContainer'],
        ['--dsw-alias-file-diff-deleted-bg', 'errorContainer'],
        ['--dsw-alias-file-diff-deleted-gutter', 'error'],
        ['--dsw-alias-file-diff-deleted-marker', 'onErrorContainer'],
        ['--dsw-alias-interactive-bg-active', 'surfaceContainerHighest'],
        ['--dsw-alias-interactive-bg-hover', 'surfaceContainerHigh'],
        ['--dsw-alias-interactive-bg-hover-accent', 'primaryContainer'],
        ['--dsw-alias-interactive-bg-hover-danger', 'errorContainer'],
        ['--dsw-alias-label-caption', 'onSurfaceVariant'],
        ['--dsw-alias-label-deep-diving', 'primary'],
        ['--dsw-alias-label-deep-diving-shimmer', 'primaryContainer'],
        ['--dsw-alias-label-dimmed', 'onSurfaceVariant'],
        ['--dsw-alias-label-document-preview', 'onSurfaceVariant'],
        ['--dsw-alias-label-primary', 'onSurface'],
        ['--dsw-alias-label-primary-bluish', 'onSurface'],
        ['--dsw-alias-label-primary-dimmed', 'onSurfaceVariant'],
        ['--dsw-alias-label-primary-foreground', 'onPrimary'],
        ['--dsw-alias-label-primary-inverted', 'inverseOnSurface'],
        ['--dsw-alias-label-secondary', 'onSurfaceVariant'],
        ['--dsw-alias-label-shimmer', 'onSurfaceVariant'],
        ['--dsw-alias-label-tertiary', 'outline'],
        ['--dsw-alias-link', 'primary'],
        ['--dsw-alias-markdown-citation', 'surfaceContainerHigh'],
        ['--dsw-alias-markdown-code-block', 'surfaceContainerHighest'],
        ['--dsw-alias-markdown-code-block-banner', 'surfaceContainerHigh'],
        ['--dsw-alias-markdown-code-segment-selected', 'primary'],
        ['--dsw-alias-markdown-code-segment-unselected', 'onSurfaceVariant'],
        ['--dsw-alias-markdown-inline-code', 'primaryContainer'],
        ['--dsw-alias-markdown-placeholder', 'outlineVariant'],
        ['--dsw-alias-markdown-tag', 'primaryContainer'],
        ['--dsw-alias-menu-group-header-fill', 'surfaceContainerHigh'],
        ['--dsw-alias-menu-icon', 'onSurfaceVariant'],
        ['--dsw-alias-onboarding-accent', 'primary'],
        ['--dsw-alias-onboarding-card-fill', 'surfaceContainerLow'],
        ['--dsw-alias-onboarding-checkbox-border', 'outline'],
        ['--dsw-alias-onboarding-secondary-fill', 'surfaceContainer'],
        ['--dsw-alias-scrollbar-bg-l1', 'surfaceContainerHighest'],
        ['--dsw-alias-scrollbar-bg-l2', 'outlineVariant'],
        ['--dsw-alias-scrollbar-hover-l1', 'surfaceContainerHighest'],
        ['--dsw-alias-scrollbar-hover-l2', 'outline'],
        ['--dsw-alias-settings-card-fill', 'surfaceContainer'],
        ['--dsw-alias-settings-card-stroke', 'outlineVariant'],
        ['--dsw-alias-state-business-primary', 'primary'],
        ['--dsw-alias-state-business-tertiary', 'tertiary'],
        ['--dsw-alias-state-error-primary', 'error'],
        ['--dsw-alias-state-error-secondary', 'errorContainer'],
        ['--dsw-alias-state-idle-primary', 'outline'],
        ['--dsw-alias-state-success-primary', 'success'],
        ['--dsw-alias-state-success-secondary', 'successContainer'],
        ['--dsw-alias-state-success-tertiary', 'success'],
        ['--dsw-alias-state-warn-label', 'warn'],
        ['--dsw-alias-state-warn-primary', 'warn'],
        ['--dsw-alias-state-warn-secondary', 'warnContainer'],
        ['--dsw-alias-state-warn-tertiary', 'outline'],
        ['--dsw-alias-switch-thumb', 'inverseSurface'],
        ['--dsw-alias-toast-bg', 'inverseSurface'],
        ['--dsw-alias-toast-label', 'inverseOnSurface'],
        ['--dsw-alias-tooltip-bg', 'inverseSurface'],
        ['--dsw-alias-tooltip-key-bg', 'inverseSurface'],
        ['--dsw-alias-turn-trigger-bg', 'surfaceContainerHigh'],
        ['--dsw-alias-turn-trigger-bg-hover', 'surfaceContainerHighest'],
        // specific
        ['--dsw-specific-bubble', 'surfaceContainerHigh'],
        ['--dsw-specific-bubble-highlight', 'primaryContainer'],
        ['--dsw-specific-input-major', 'surfaceContainerLow'],
        ['--dsw-specific-login-input', 'surfaceContainerLow'],
        ['--dsw-specific-menu', 'surfaceContainerHigh'],
        ['--dsw-specific-selector', 'surfaceContainerLow'],
        ['--dsw-specific-sidebar-nav-item-active', 'secondaryContainer'],
        ['--dsw-specific-sidebar-nav-item-active-accent', 'primary'],
        ['--dsw-specific-sidebar-nav-item-hover', 'translucent(onSurface, 8)'],
        ['--dsw-specific-tip', 'surfaceVariant'],
    ];
    for (const [token, role] of tokens) {
        if (role === 'translucent(onSurface, 8)') {
            overrides[token] = mk(translucent(L.onSurface, 8), translucent(D.onSurface, 8));
        } else if (role === 'translucent(onSurface, 12)') {
            overrides[token] = mk(translucent(L.onSurface, 12), translucent(D.onSurface, 12));
        } else if (L[role] !== undefined) {
            overrides[token] = kv(role);
        }
    }
    // translucent-interactive defaults handled above; a few semantic extras:
    overrides['--dsw-alias-interactive-bg-hover-solid'] = mk(translucent(L.onSurface, 10), translucent(D.onSurface, 10));
    overrides['--dsw-alias-button-tool-bar-fill-invisible'] = mk('transparent', 'transparent');
    overrides['--dsw-alias-markdown-inline-code'] = mk(translucent(L.primaryContainer, 55), translucent(D.primaryContainer, 45));
    overrides['--dsw-alias-label-tertiary'] = mk(L.outline, D.outline);
    // Masks and inverted borders are translucent overlays in the stock theme
    // (e.g. --dsw-alias-bg-mask-1 is #0000003d). Keep that semantics so overlay
    // backdrops such as the settings dialog stay see-through instead of going opaque.
    overrides['--dsw-alias-bg-mask-1'] = mk(translucent(L.scrim, 24), translucent(D.scrim, 50));
    overrides['--dsw-alias-bg-mask-2'] = mk(translucent(L.scrim, 12), translucent(D.scrim, 20));
    overrides['--dsw-alias-bg-mask-3'] = mk(translucent(L.scrim, 48), translucent(D.scrim, 64));
    overrides['--dsw-alias-bg-mask-photo'] = mk(translucent(L.scrim, 88), translucent(D.scrim, 88));
    overrides['--dsw-alias-bg-mask-drop'] = mk(translucent(L.inverseOnSurface, 70), translucent(D.surfaceContainerHigh, 70));
    overrides['--dsw-alias-bg-skeleton'] = mk(translucent(L.scrim, 4), translucent(D.onSurface, 8));
    overrides['--dsw-alias-border-inverted'] = mk('transparent', translucent(D.onSurface, 6));
    overrides['--dsw-alias-border-inverted2'] = mk('transparent', translucent(D.onSurface, 8));
    // plugin-owned design tokens for our own surfaces and previews
    overrides['--m3-primary'] = kv('primary');
    overrides['--m3-on-primary'] = kv('onPrimary');
    overrides['--m3-primary-container'] = kv('primaryContainer');
    overrides['--m3-on-primary-container'] = kv('onPrimaryContainer');
    overrides['--m3-secondary'] = kv('secondary');
    overrides['--m3-secondary-container'] = kv('secondaryContainer');
    overrides['--m3-tertiary'] = kv('tertiary');
    overrides['--m3-tertiary-container'] = kv('tertiaryContainer');
    overrides['--m3-surface'] = kv('surface');
    overrides['--m3-surface-container'] = kv('surfaceContainer');
    overrides['--m3-surface-container-high'] = kv('surfaceContainerHigh');
    overrides['--m3-surface-variant'] = kv('surfaceVariant');
    overrides['--m3-on-surface'] = kv('onSurface');
    overrides['--m3-on-surface-variant'] = kv('onSurfaceVariant');
    overrides['--m3-outline'] = kv('outline');
    overrides['--m3-outline-variant'] = kv('outlineVariant');
    overrides['--m3-error'] = kv('error');
    overrides['--m3-error-container'] = kv('errorContainer');
    overrides['--m3-success'] = kv('success');
    overrides['--m3-success-container'] = kv('successContainer');
    overrides['--m3-warn'] = kv('warn');
    overrides['--m3-warn-container'] = kv('warnContainer');
    return overrides;
}
return {
    argbFromRgb: argbFromRgb,
    argbFromHex: argbFromHex,
    hexFromArgb: hexFromArgb,
    redFromArgb: redFromArgb,
    greenFromArgb: greenFromArgb,
    blueFromArgb: blueFromArgb,
    alphaFromArgb: alphaFromArgb,
    argbFromLstar: argbFromLstar,
    lstarFromArgb: lstarFromArgb,
    yFromLstar: yFromLstar,
    Cam16: Cam16,
    Hct: Hct,
    HctSolver: HctSolver,
    ViewingConditions: ViewingConditions,
    TonalPalette: TonalPalette,
    CorePalette: CorePalette,
    Score: Score,
    Scheme: Scheme,
    differenceDegrees: differenceDegrees,
    sanitizeDegreesDouble: sanitizeDegreesDouble,
    sanitizeDegreesInt: sanitizeDegreesInt,
    lerp: lerp,
    signum: signum,
    clampInt: clampInt,
    buildCore: buildCore,
    buildMaterialRoles: buildMaterialRoles,
    buildDshTokenOverrides: buildDshTokenOverrides,
    extractSeedsFromRgba: extractSeedsFromRgba,
    quantizePixels: quantizePixels,
    translucent: translucent,
    surfaceOverBase: surfaceOverBase,
};
})();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = __M3Engine;
}
if (typeof window !== 'undefined') {
    window.__M3_ENGINE__ = __M3Engine;
}