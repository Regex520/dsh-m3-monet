/**
 * dsh-m3-monet — Material Design 3 / Monet wallpaper theming for DeepSeek Harness.
 * Browser half of the bundle. The vendored color engine (HCT/CAM16/token
 * mapping) is inlined by scripts/build.mjs at the engine marker below.
 */
/**
 * engine-core.js — Material color utilities core (vendored).
 *
 * The code below is adapted from the Apache-2.0 licensed
 * @material/material-color-utilities (Copyright 2021 Google LLC):
 *   https://github.com/material-foundation/material-color-utilities
 * Sources: math_utils.js, color_utils.js, viewing_conditions.js, cam16.js,
 *   hct_solver.js, hct.js, tonal_palette.js, core_palette.js, score.js, scheme.js
 * Namespace imports were inlined and `export` keywords removed so the file
 * concatenates into one closure. See THIRD_PARTY_NOTICES.md.
 */
const __M3Engine = (() => {
// ============================ math_utils ============================
function signum(num) {
    if (num < 0) {
        return -1;
    } else if (num === 0) {
        return 0;
    } else {
        return 1;
    }
}
function lerp(start, stop, amount) {
    return (1.0 - amount) * start + amount * stop;
}
function clampInt(min, max, input) {
    if (input < min) {
        return min;
    } else if (input > max) {
        return max;
    }
    return input;
}
function clampDouble(min, max, input) {
    if (input < min) {
        return min;
    } else if (input > max) {
        return max;
    }
    return input;
}
function sanitizeDegreesInt(degrees) {
    degrees = degrees % 360;
    if (degrees < 0) {
        degrees = degrees + 360;
    }
    return degrees;
}
function sanitizeDegreesDouble(degrees) {
    degrees = degrees % 360.0;
    if (degrees < 0) {
        degrees = degrees + 360.0;
    }
    return degrees;
}
function rotationDirection(from, to) {
    const increasingDifference = sanitizeDegreesDouble(to - from);
    return increasingDifference <= 180.0 ? 1.0 : -1.0;
}
function differenceDegrees(a, b) {
    return 180.0 - Math.abs(Math.abs(a - b) - 180.0);
}
function matrixMultiply(row, matrix) {
    const a = row[0] * matrix[0][0] + row[1] * matrix[0][1] + row[2] * matrix[0][2];
    const b = row[0] * matrix[1][0] + row[1] * matrix[1][1] + row[2] * matrix[1][2];
    const c = row[0] * matrix[2][0] + row[1] * matrix[2][1] + row[2] * matrix[2][2];
    return [a, b, c];
}
// ============================ color_utils ============================
const SRGB_TO_XYZ = [
    [0.41233895, 0.35762064, 0.18051042],
    [0.2126, 0.7152, 0.0722],
    [0.01932141, 0.11916382, 0.95034478],
];
const XYZ_TO_SRGB = [
    [3.2413774792388685, -1.5376652402851851, -0.49885366846268053],
    [-0.9691452513005321, 1.8758853451067872, 0.04156585616912061],
    [0.05562093689691305, -0.20395524564742123, 1.0571799111220335],
];
const WHITE_POINT_D65 = [95.047, 100.0, 108.883];
function argbFromRgb(red, green, blue) {
    return (255 << 24 | (red & 255) << 16 | (green & 255) << 8 | blue & 255) >>> 0;
}
function argbFromLinrgb(linrgb) {
    const r = delinearized(linrgb[0]);
    const g = delinearized(linrgb[1]);
    const b = delinearized(linrgb[2]);
    return argbFromRgb(r, g, b);
}
function alphaFromArgb(argb) {
    return argb >> 24 & 255;
}
function redFromArgb(argb) {
    return argb >> 16 & 255;
}
function greenFromArgb(argb) {
    return argb >> 8 & 255;
}
function blueFromArgb(argb) {
    return argb & 255;
}
function isOpaque(argb) {
    return alphaFromArgb(argb) >= 255;
}
function argbFromXyz(x, y, z) {
    const matrix = XYZ_TO_SRGB;
    const linearR = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z;
    const linearG = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z;
    const linearB = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z;
    const r = delinearized(linearR);
    const g = delinearized(linearG);
    const b = delinearized(linearB);
    return argbFromRgb(r, g, b);
}
function xyzFromArgb(argb) {
    const r = linearized(redFromArgb(argb));
    const g = linearized(greenFromArgb(argb));
    const b = linearized(blueFromArgb(argb));
    return matrixMultiply([r, g, b], SRGB_TO_XYZ);
}
function argbFromLab(l, a, b) {
    const whitePoint = WHITE_POINT_D65;
    const fy = (l + 16.0) / 116.0;
    const fx = a / 500.0 + fy;
    const fz = fy - b / 200.0;
    const xNormalized = labInvf(fx);
    const yNormalized = labInvf(fy);
    const zNormalized = labInvf(fz);
    const x = xNormalized * whitePoint[0];
    const y = yNormalized * whitePoint[1];
    const z = zNormalized * whitePoint[2];
    return argbFromXyz(x, y, z);
}
function labFromArgb(argb) {
    const linearR = linearized(redFromArgb(argb));
    const linearG = linearized(greenFromArgb(argb));
    const linearB = linearized(blueFromArgb(argb));
    const matrix = SRGB_TO_XYZ;
    const x = matrix[0][0] * linearR + matrix[0][1] * linearG + matrix[0][2] * linearB;
    const y = matrix[1][0] * linearR + matrix[1][1] * linearG + matrix[1][2] * linearB;
    const z = matrix[2][0] * linearR + matrix[2][1] * linearG + matrix[2][2] * linearB;
    const whitePoint = WHITE_POINT_D65;
    const xNormalized = x / whitePoint[0];
    const yNormalized = y / whitePoint[1];
    const zNormalized = z / whitePoint[2];
    const fx = labF(xNormalized);
    const fy = labF(yNormalized);
    const fz = labF(zNormalized);
    const l = 116.0 * fy - 16;
    const a = 500.0 * (fx - fy);
    const b = 200.0 * (fy - fz);
    return [l, a, b];
}
function argbFromLstar(lstar) {
    const y = yFromLstar(lstar);
    const component = delinearized(y);
    return argbFromRgb(component, component, component);
}
function lstarFromArgb(argb) {
    const y = xyzFromArgb(argb)[1];
    return 116.0 * labF(y / 100.0) - 16.0;
}
function yFromLstar(lstar) {
    return 100.0 * labInvf((lstar + 16.0) / 116.0);
}
function lstarFromY(y) {
    return labF(y / 100.0) * 116.0 - 16.0;
}
function linearized(rgbComponent) {
    const normalized = rgbComponent / 255.0;
    if (normalized <= 0.040449936) {
        return normalized / 12.92 * 100.0;
    } else {
        return Math.pow((normalized + 0.055) / 1.055, 2.4) * 100.0;
    }
}
function delinearized(rgbComponent) {
    const normalized = rgbComponent / 100.0;
    let delinearizedValue = 0.0;
    if (normalized <= 0.0031308) {
        delinearizedValue = normalized * 12.92;
    } else {
        delinearizedValue = 1.055 * Math.pow(normalized, 1.0 / 2.4) - 0.055;
    }
    return clampInt(0, 255, Math.round(delinearizedValue * 255.0));
}
function whitePointD65() {
    return WHITE_POINT_D65;
}
function rgbaFromArgb(argb) {
    const r = redFromArgb(argb);
    const g = greenFromArgb(argb);
    const b = blueFromArgb(argb);
    const a = alphaFromArgb(argb);
    return { r, g, b, a };
}
function argbFromRgba(rgba) {
    const rValue = clampComponent(rgba.r);
    const gValue = clampComponent(rgba.g);
    const bValue = clampComponent(rgba.b);
    const aValue = clampComponent(rgba.a);
    return (aValue << 24) | (rValue << 16) | (gValue << 8) | bValue;
}
function clampComponent(value) {
    if (value < 0) return 0;
    if (value > 255) return 255;
    return value;
}
function labF(t) {
    const e = 216.0 / 24389.0;
    const kappa = 24389.0 / 27.0;
    if (t > e) {
        return Math.pow(t, 1.0 / 3.0);
    } else {
        return (kappa * t + 16) / 116;
    }
}
function labInvf(ft) {
    const e = 216.0 / 24389.0;
    const kappa = 24389.0 / 27.0;
    const ft3 = ft * ft * ft;
    if (ft3 > e) {
        return ft3;
    } else {
        return (116 * ft - 16) / kappa;
    }
}
// ============================ viewing_conditions ============================
class ViewingConditions {
    static make(whitePoint = whitePointD65(), adaptingLuminance = (200.0 / Math.PI) * yFromLstar(50.0) / 100.0, backgroundLstar = 50.0, surround = 2.0, discountingIlluminant = false) {
        const xyz = whitePoint;
        const rW = xyz[0] * 0.401288 + xyz[1] * 0.650173 + xyz[2] * -0.051461;
        const gW = xyz[0] * -0.250268 + xyz[1] * 1.204414 + xyz[2] * 0.045854;
        const bW = xyz[0] * -0.002079 + xyz[1] * 0.048952 + xyz[2] * 0.953127;
        const f = 0.8 + surround / 10.0;
        const c = f >= 0.9 ? lerp(0.59, 0.69, (f - 0.9) * 10.0) : lerp(0.525, 0.59, (f - 0.8) * 10.0);
        let d = discountingIlluminant ? 1.0 : f * (1.0 - (1.0 / 3.6) * Math.exp((-adaptingLuminance - 42.0) / 92.0));
        d = d > 1.0 ? 1.0 : d < 0.0 ? 0.0 : d;
        const nc = f;
        const rgbD = [d * (100.0 / rW) + 1.0 - d, d * (100.0 / gW) + 1.0 - d, d * (100.0 / bW) + 1.0 - d];
        const k = 1.0 / (5.0 * adaptingLuminance + 1.0);
        const k4 = k * k * k * k;
        const k4F = 1.0 - k4;
        const fl = k4 * adaptingLuminance + 0.1 * k4F * k4F * Math.cbrt(5.0 * adaptingLuminance);
        const n = yFromLstar(backgroundLstar) / whitePoint[1];
        const z = 1.48 + Math.sqrt(n);
        const nbb = 0.725 / Math.pow(n, 0.2);
        const ncb = nbb;
        const rgbAFactors = [
            Math.pow((fl * rgbD[0] * rW) / 100.0, 0.42),
            Math.pow((fl * rgbD[1] * gW) / 100.0, 0.42),
            Math.pow((fl * rgbD[2] * bW) / 100.0, 0.42),
        ];
        const rgbA = [
            (400.0 * rgbAFactors[0]) / (rgbAFactors[0] + 27.13),
            (400.0 * rgbAFactors[1]) / (rgbAFactors[1] + 27.13),
            (400.0 * rgbAFactors[2]) / (rgbAFactors[2] + 27.13),
        ];
        const aw = (2.0 * rgbA[0] + rgbA[1] + 0.05 * rgbA[2]) * nbb;
        return new ViewingConditions(n, aw, nbb, ncb, c, nc, rgbD, fl, Math.pow(fl, 0.25), z);
    }
    constructor(n, aw, nbb, ncb, c, nc, rgbD, fl, fLRoot, z) {
        this.n = n;
        this.aw = aw;
        this.nbb = nbb;
        this.ncb = ncb;
        this.c = c;
        this.nc = nc;
        this.rgbD = rgbD;
        this.fl = fl;
        this.fLRoot = fLRoot;
        this.z = z;
    }
}
ViewingConditions.DEFAULT = ViewingConditions.make();
// ============================ cam16 ============================
class Cam16 {
    constructor(hue, chroma, j, q, m, s, jstar, astar, bstar) {
        this.hue = hue;
        this.chroma = chroma;
        this.j = j;
        this.q = q;
        this.m = m;
        this.s = s;
        this.jstar = jstar;
        this.astar = astar;
        this.bstar = bstar;
    }
    distance(other) {
        const dJ = this.jstar - other.jstar;
        const dA = this.astar - other.astar;
        const dB = this.bstar - other.bstar;
        const dEPrime = Math.sqrt(dJ * dJ + dA * dA + dB * dB);
        const dE = 1.41 * Math.pow(dEPrime, 0.63);
        return dE;
    }
    static fromInt(argb) {
        return Cam16.fromIntInViewingConditions(argb, ViewingConditions.DEFAULT);
    }
    static fromIntInViewingConditions(argb, viewingConditions) {
        const red = (argb & 0x00ff0000) >> 16;
        const green = (argb & 0x0000ff00) >> 8;
        const blue = (argb & 0x000000ff);
        const redL = linearized(red);
        const greenL = linearized(green);
        const blueL = linearized(blue);
        const x = 0.41233895 * redL + 0.35762064 * greenL + 0.18051042 * blueL;
        const y = 0.2126 * redL + 0.7152 * greenL + 0.0722 * blueL;
        const z = 0.01932141 * redL + 0.11916382 * greenL + 0.95034478 * blueL;
        const rC = 0.401288 * x + 0.650173 * y - 0.051461 * z;
        const gC = -0.250268 * x + 1.204414 * y + 0.045854 * z;
        const bC = -0.002079 * x + 0.048952 * y + 0.953127 * z;
        const rD = viewingConditions.rgbD[0] * rC;
        const gD = viewingConditions.rgbD[1] * gC;
        const bD = viewingConditions.rgbD[2] * bC;
        const rAF = Math.pow((viewingConditions.fl * Math.abs(rD)) / 100.0, 0.42);
        const gAF = Math.pow((viewingConditions.fl * Math.abs(gD)) / 100.0, 0.42);
        const bAF = Math.pow((viewingConditions.fl * Math.abs(bD)) / 100.0, 0.42);
        const rA = (signum(rD) * 400.0 * rAF) / (rAF + 27.13);
        const gA = (signum(gD) * 400.0 * gAF) / (gAF + 27.13);
        const bA = (signum(bD) * 400.0 * bAF) / (bAF + 27.13);
        const a = (11.0 * rA + -12.0 * gA + bA) / 11.0;
        const b = (rA + gA - 2.0 * bA) / 9.0;
        const u = (20.0 * rA + 20.0 * gA + 21.0 * bA) / 20.0;
        const p2 = (40.0 * rA + 20.0 * gA + bA) / 20.0;
        const atan2 = Math.atan2(b, a);
        const atanDegrees = (atan2 * 180.0) / Math.PI;
        const hue = atanDegrees < 0 ? atanDegrees + 360.0 : atanDegrees >= 360 ? atanDegrees - 360.0 : atanDegrees;
        const hueRadians = (hue * Math.PI) / 180.0;
        const ac = p2 * viewingConditions.nbb;
        const j = 100.0 * Math.pow(ac / viewingConditions.aw, viewingConditions.c * viewingConditions.z);
        const q = (4.0 / viewingConditions.c) * Math.sqrt(j / 100.0) * (viewingConditions.aw + 4.0) * viewingConditions.fLRoot;
        const huePrime = hue < 20.14 ? hue + 360 : hue;
        const eHue = 0.25 * (Math.cos((huePrime * Math.PI) / 180.0 + 2.0) + 3.8);
        const p1 = (50000.0 / 13.0) * eHue * viewingConditions.nc * viewingConditions.ncb;
        const t = (p1 * Math.sqrt(a * a + b * b)) / (u + 0.305);
        const alpha = Math.pow(t, 0.9) * Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73);
        const c = alpha * Math.sqrt(j / 100.0);
        const m = c * viewingConditions.fLRoot;
        const s = 50.0 * Math.sqrt((alpha * viewingConditions.c) / (viewingConditions.aw + 4.0));
        const jstar = ((1.0 + 100.0 * 0.007) * j) / (1.0 + 0.007 * j);
        const mstar = (1.0 / 0.0228) * Math.log(1.0 + 0.0228 * m);
        const astar = mstar * Math.cos(hueRadians);
        const bstar = mstar * Math.sin(hueRadians);
        return new Cam16(hue, c, j, q, m, s, jstar, astar, bstar);
    }
    static fromJch(j, c, h) {
        return Cam16.fromJchInViewingConditions(j, c, h, ViewingConditions.DEFAULT);
    }
    static fromJchInViewingConditions(j, c, h, viewingConditions) {
        const q = (4.0 / viewingConditions.c) * Math.sqrt(j / 100.0) * (viewingConditions.aw + 4.0) * viewingConditions.fLRoot;
        const m = c * viewingConditions.fLRoot;
        const alpha = c / Math.sqrt(j / 100.0);
        const s = 50.0 * Math.sqrt((alpha * viewingConditions.c) / (viewingConditions.aw + 4.0));
        const hueRadians = (h * Math.PI) / 180.0;
        const jstar = ((1.0 + 100.0 * 0.007) * j) / (1.0 + 0.007 * j);
        const mstar = (1.0 / 0.0228) * Math.log(1.0 + 0.0228 * m);
        const astar = mstar * Math.cos(hueRadians);
        const bstar = mstar * Math.sin(hueRadians);
        return new Cam16(h, c, j, q, m, s, jstar, astar, bstar);
    }
    static fromUcs(jstar, astar, bstar) {
        return Cam16.fromUcsInViewingConditions(jstar, astar, bstar, ViewingConditions.DEFAULT);
    }
    static fromUcsInViewingConditions(jstar, astar, bstar, viewingConditions) {
        const a = astar;
        const b = bstar;
        const m = Math.sqrt(a * a + b * b);
        const M = (Math.exp(m * 0.0228) - 1.0) / 0.0228;
        const c = M / viewingConditions.fLRoot;
        let h = Math.atan2(b, a) * (180.0 / Math.PI);
        if (h < 0.0) {
            h += 360.0;
        }
        const j = jstar / (1 - (jstar - 100) * 0.007);
        return Cam16.fromJchInViewingConditions(j, c, h, viewingConditions);
    }
    toInt() {
        return this.viewed(ViewingConditions.DEFAULT);
    }
    viewed(viewingConditions) {
        const alpha = this.chroma === 0.0 || this.j === 0.0 ? 0.0 : this.chroma / Math.sqrt(this.j / 100.0);
        const t = Math.pow(alpha / Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73), 1.0 / 0.9);
        const hRad = (this.hue * Math.PI) / 180.0;
        const eHue = 0.25 * (Math.cos(hRad + 2.0) + 3.8);
        const ac = viewingConditions.aw * Math.pow(this.j / 100.0, 1.0 / viewingConditions.c / viewingConditions.z);
        const p1 = eHue * (50000.0 / 13.0) * viewingConditions.nc * viewingConditions.ncb;
        const p2 = ac / viewingConditions.nbb;
        const hSin = Math.sin(hRad);
        const hCos = Math.cos(hRad);
        const gamma = (23.0 * (p2 + 0.305) * t) / (23.0 * p1 + 11.0 * t * hCos + 108.0 * t * hSin);
        const a = gamma * hCos;
        const b2 = gamma * hSin;
        const rA = (460.0 * p2 + 451.0 * a + 288.0 * b2) / 1403.0;
        const gA = (460.0 * p2 - 891.0 * a - 261.0 * b2) / 1403.0;
        const bA = (460.0 * p2 - 220.0 * a - 6300.0 * b2) / 1403.0;
        const rCBase = Math.max(0, (27.13 * Math.abs(rA)) / (400.0 - Math.abs(rA)));
        const rC = signum(rA) * (100.0 / viewingConditions.fl) * Math.pow(rCBase, 1.0 / 0.42);
        const gCBase = Math.max(0, (27.13 * Math.abs(gA)) / (400.0 - Math.abs(gA)));
        const gC = signum(gA) * (100.0 / viewingConditions.fl) * Math.pow(gCBase, 1.0 / 0.42);
        const bCBase = Math.max(0, (27.13 * Math.abs(bA)) / (400.0 - Math.abs(bA)));
        const bC = signum(bA) * (100.0 / viewingConditions.fl) * Math.pow(bCBase, 1.0 / 0.42);
        const rF = rC / viewingConditions.rgbD[0];
        const gF = gC / viewingConditions.rgbD[1];
        const bF = bC / viewingConditions.rgbD[2];
        const x = 1.86206786 * rF - 1.01125463 * gF + 0.14918677 * bF;
        const y = 0.38752654 * rF + 0.62144744 * gF - 0.00897398 * bF;
        const z = -0.01584150 * rF - 0.03412294 * gF + 1.04996444 * bF;
        return argbFromXyz(x, y, z);
    }
    static fromXyzInViewingConditions(x, y, z, viewingConditions) {
        const rC = 0.401288 * x + 0.650173 * y - 0.051461 * z;
        const gC = -0.250268 * x + 1.204414 * y + 0.045854 * z;
        const bC = -0.002079 * x + 0.048952 * y + 0.953127 * z;
        const rD = viewingConditions.rgbD[0] * rC;
        const gD = viewingConditions.rgbD[1] * gC;
        const bD = viewingConditions.rgbD[2] * bC;
        const rAF = Math.pow(viewingConditions.fl * Math.abs(rD) / 100.0, 0.42);
        const gAF = Math.pow(viewingConditions.fl * Math.abs(gD) / 100.0, 0.42);
        const bAF = Math.pow(viewingConditions.fl * Math.abs(bD) / 100.0, 0.42);
        const rA = signum(rD) * 400.0 * rAF / (rAF + 27.13);
        const gA = signum(gD) * 400.0 * gAF / (gAF + 27.13);
        const bA = signum(bD) * 400.0 * bAF / (bAF + 27.13);
        const a = (11.0 * rA + -12.0 * gA + bA) / 11.0;
        const b = (rA + gA - 2.0 * bA) / 9.0;
        const u = (20.0 * rA + 20.0 * gA + 21.0 * bA) / 20.0;
        const p2 = (40.0 * rA + 20.0 * gA + bA) / 20.0;
        const atan2 = Math.atan2(b, a);
        const atanDegrees = atan2 * 180.0 / Math.PI;
        const hue = atanDegrees < 0 ? atanDegrees + 360.0 : atanDegrees >= 360 ? atanDegrees - 360 : atanDegrees;
        const hueRadians = hue * Math.PI / 180.0;
        const ac = p2 * viewingConditions.nbb;
        const J = 100.0 * Math.pow(ac / viewingConditions.aw, viewingConditions.c * viewingConditions.z);
        const Q = (4.0 / viewingConditions.c) * Math.sqrt(J / 100.0) * (viewingConditions.aw + 4.0) * (viewingConditions.fLRoot);
        const huePrime = (hue < 20.14) ? hue + 360 : hue;
        const eHue = (1.0 / 4.0) * (Math.cos(huePrime * Math.PI / 180.0 + 2.0) + 3.8);
        const p1 = 50000.0 / 13.0 * eHue * viewingConditions.nc * viewingConditions.ncb;
        const t = p1 * Math.sqrt(a * a + b * b) / (u + 0.305);
        const alpha = Math.pow(t, 0.9) * Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73);
        const C = alpha * Math.sqrt(J / 100.0);
        const M = C * viewingConditions.fLRoot;
        const s = 50.0 * Math.sqrt((alpha * viewingConditions.c) / (viewingConditions.aw + 4.0));
        const jstar = (1.0 + 100.0 * 0.007) * J / (1.0 + 0.007 * J);
        const mstar = Math.log(1.0 + 0.0228 * M) / 0.0228;
        const astar = mstar * Math.cos(hueRadians);
        const bstar = mstar * Math.sin(hueRadians);
        return new Cam16(hue, C, J, Q, M, s, jstar, astar, bstar);
    }
    xyzInViewingConditions(viewingConditions) {
        const alpha = (this.chroma === 0.0 || this.j === 0.0) ? 0.0 : this.chroma / Math.sqrt(this.j / 100.0);
        const t = Math.pow(alpha / Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73), 1.0 / 0.9);
        const hRad = this.hue * Math.PI / 180.0;
        const eHue = 0.25 * (Math.cos(hRad + 2.0) + 3.8);
        const ac = viewingConditions.aw * Math.pow(this.j / 100.0, 1.0 / viewingConditions.c / viewingConditions.z);
        const p1 = eHue * (50000.0 / 13.0) * viewingConditions.nc * viewingConditions.ncb;
        const p2 = (ac / viewingConditions.nbb);
        const hSin = Math.sin(hRad);
        const hCos = Math.cos(hRad);
        const gamma = 23.0 * (p2 + 0.305) * t / (23.0 * p1 + 11 * t * hCos + 108.0 * t * hSin);
        const a = gamma * hCos;
        const b = gamma * hSin;
        const rA = (460.0 * p2 + 451.0 * a + 288.0 * b) / 1403.0;
        const gA = (460.0 * p2 - 891.0 * a - 261.0 * b) / 1403.0;
        const bA = (460.0 * p2 - 220.0 * a - 6300.0 * b) / 1403.0;
        const rCBase = Math.max(0, (27.13 * Math.abs(rA)) / (400.0 - Math.abs(rA)));
        const rC = signum(rA) * (100.0 / viewingConditions.fl) * Math.pow(rCBase, 1.0 / 0.42);
        const gCBase = Math.max(0, (27.13 * Math.abs(gA)) / (400.0 - Math.abs(gA)));
        const gC = signum(gA) * (100.0 / viewingConditions.fl) * Math.pow(gCBase, 1.0 / 0.42);
        const bCBase = Math.max(0, (27.13 * Math.abs(bA)) / (400.0 - Math.abs(bA)));
        const bC = signum(bA) * (100.0 / viewingConditions.fl) * Math.pow(bCBase, 1.0 / 0.42);
        const rF = rC / viewingConditions.rgbD[0];
        const gF = gC / viewingConditions.rgbD[1];
        const bF = bC / viewingConditions.rgbD[2];
        const x = 1.86206786 * rF - 1.01125463 * gF + 0.14918677 * bF;
        const y = 0.38752654 * rF + 0.62144744 * gF - 0.00897398 * bF;
        const z = -0.01584150 * rF - 0.03412294 * gF + 1.04996444 * bF;
        return [x, y, z];
    }
}
// ============================ hct_solver ============================
class HctSolver {
    static sanitizeRadians(angle) {
        return (angle + Math.PI * 8) % (Math.PI * 2);
    }
    static trueDelinearized(rgbComponent) {
        const normalized = rgbComponent / 100.0;
        let delinearizedValue = 0.0;
        if (normalized <= 0.0031308) {
            delinearizedValue = normalized * 12.92;
        } else {
            delinearizedValue = 1.055 * Math.pow(normalized, 1.0 / 2.4) - 0.055;
        }
        return delinearizedValue * 255.0;
    }
    static chromaticAdaptation(component) {
        const af = Math.pow(Math.abs(component), 0.42);
        return signum(component) * 400.0 * af / (af + 27.13);
    }
    static hueOf(linrgb) {
        const scaledDiscount = matrixMultiply(linrgb, HctSolver.SCALED_DISCOUNT_FROM_LINRGB);
        const rA = HctSolver.chromaticAdaptation(scaledDiscount[0]);
        const gA = HctSolver.chromaticAdaptation(scaledDiscount[1]);
        const bA = HctSolver.chromaticAdaptation(scaledDiscount[2]);
        const a = (11.0 * rA + -12.0 * gA + bA) / 11.0;
        const b = (rA + gA - 2.0 * bA) / 9.0;
        return Math.atan2(b, a);
    }
    static areInCyclicOrder(a, b, c) {
        const deltaAB = HctSolver.sanitizeRadians(b - a);
        const deltaAC = HctSolver.sanitizeRadians(c - a);
        return deltaAB < deltaAC;
    }
    static intercept(source, mid, target) {
        return (mid - source) / (target - source);
    }
    static lerpPoint(source, t, target) {
        return [
            source[0] + (target[0] - source[0]) * t,
            source[1] + (target[1] - source[1]) * t,
            source[2] + (target[2] - source[2]) * t,
        ];
    }
    static setCoordinate(source, coordinate, target, axis) {
        const t = HctSolver.intercept(source[axis], coordinate, target[axis]);
        return HctSolver.lerpPoint(source, t, target);
    }
    static isBounded(x) {
        return 0.0 <= x && x <= 100.0;
    }
    static nthVertex(y, n) {
        const kR = HctSolver.Y_FROM_LINRGB[0];
        const kG = HctSolver.Y_FROM_LINRGB[1];
        const kB = HctSolver.Y_FROM_LINRGB[2];
        const coordA = n % 4 <= 1 ? 0.0 : 100.0;
        const coordB = n % 2 === 0 ? 0.0 : 100.0;
        if (n < 4) {
            const g = coordA;
            const b = coordB;
            const r = (y - g * kG - b * kB) / kR;
            if (HctSolver.isBounded(r)) {
                return [r, g, b];
            } else {
                return [-1.0, -1.0, -1.0];
            }
        } else if (n < 8) {
            const b = coordA;
            const r = coordB;
            const g = (y - r * kR - b * kB) / kG;
            if (HctSolver.isBounded(g)) {
                return [r, g, b];
            } else {
                return [-1.0, -1.0, -1.0];
            }
        } else {
            const r = coordA;
            const g = coordB;
            const b = (y - r * kR - g * kG) / kB;
            if (HctSolver.isBounded(b)) {
                return [r, g, b];
            } else {
                return [-1.0, -1.0, -1.0];
            }
        }
    }
    static bisectToSegment(y, targetHue) {
        let left = [-1.0, -1.0, -1.0];
        let right = left;
        let leftHue = 0.0;
        let rightHue = 0.0;
        let initialized = false;
        let uncut = true;
        for (let n = 0; n < 12; n++) {
            const mid = HctSolver.nthVertex(y, n);
            if (mid[0] < 0) {
                continue;
            }
            const midHue = HctSolver.hueOf(mid);
            if (!initialized) {
                left = mid;
                right = mid;
                leftHue = midHue;
                rightHue = midHue;
                initialized = true;
                continue;
            }
            if (uncut || HctSolver.areInCyclicOrder(leftHue, midHue, rightHue)) {
                uncut = false;
                if (HctSolver.areInCyclicOrder(leftHue, targetHue, midHue)) {
                    right = mid;
                    rightHue = midHue;
                } else {
                    left = mid;
                    leftHue = midHue;
                }
            }
        }
        return [left, right];
    }
    static midpoint(a, b) {
        return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    }
    static criticalPlaneBelow(x) {
        return Math.floor(x - 0.5);
    }
    static criticalPlaneAbove(x) {
        return Math.ceil(x - 0.5);
    }
    static bisectToLimit(y, targetHue) {
        const segment = HctSolver.bisectToSegment(y, targetHue);
        let left = segment[0];
        let leftHue = HctSolver.hueOf(left);
        let right = segment[1];
        for (let axis = 0; axis < 3; axis++) {
            if (left[axis] !== right[axis]) {
                let lPlane = -1;
                let rPlane = 255;
                if (left[axis] < right[axis]) {
                    lPlane = HctSolver.criticalPlaneBelow(HctSolver.trueDelinearized(left[axis]));
                    rPlane = HctSolver.criticalPlaneAbove(HctSolver.trueDelinearized(right[axis]));
                } else {
                    lPlane = HctSolver.criticalPlaneAbove(HctSolver.trueDelinearized(left[axis]));
                    rPlane = HctSolver.criticalPlaneBelow(HctSolver.trueDelinearized(right[axis]));
                }
                for (let i = 0; i < 8; i++) {
                    if (Math.abs(rPlane - lPlane) <= 1) {
                        break;
                    } else {
                        const mPlane = Math.floor((lPlane + rPlane) / 2.0);
                        const midPlaneCoordinate = HctSolver.CRITICAL_PLANES[mPlane];
                        const mid = HctSolver.setCoordinate(left, midPlaneCoordinate, right, axis);
                        const midHue = HctSolver.hueOf(mid);
                        if (HctSolver.areInCyclicOrder(leftHue, targetHue, midHue)) {
                            right = mid;
                            rPlane = mPlane;
                        } else {
                            left = mid;
                            leftHue = midHue;
                            lPlane = mPlane;
                        }
                    }
                }
            }
        }
        return HctSolver.midpoint(left, right);
    }
    static inverseChromaticAdaptation(adapted) {
        const adaptedAbs = Math.abs(adapted);
        const base = Math.max(0, 27.13 * adaptedAbs / (400.0 - adaptedAbs));
        return signum(adapted) * Math.pow(base, 1.0 / 0.42);
    }
    static findResultByJ(hueRadians, chroma, y) {
        let j = Math.sqrt(y) * 11.0;
        const viewingConditions = ViewingConditions.DEFAULT;
        const tInnerCoeff = 1 / Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73);
        const eHue = 0.25 * (Math.cos(hueRadians + 2.0) + 3.8);
        const p1 = eHue * (50000.0 / 13.0) * viewingConditions.nc * viewingConditions.ncb;
        const hSin = Math.sin(hueRadians);
        const hCos = Math.cos(hueRadians);
        for (let iterationRound = 0; iterationRound < 5; iterationRound++) {
            const jNormalized = j / 100.0;
            const alpha = chroma === 0.0 || j === 0.0 ? 0.0 : chroma / Math.sqrt(jNormalized);
            const t = Math.pow(alpha * tInnerCoeff, 1.0 / 0.9);
            const ac = viewingConditions.aw * Math.pow(jNormalized, 1.0 / viewingConditions.c / viewingConditions.z);
            const p2 = ac / viewingConditions.nbb;
            const gamma = 23.0 * (p2 + 0.305) * t / (23.0 * p1 + 11 * t * hCos + 108.0 * t * hSin);
            const a = gamma * hCos;
            const b = gamma * hSin;
            const rA = (460.0 * p2 + 451.0 * a + 288.0 * b) / 1403.0;
            const gA = (460.0 * p2 - 891.0 * a - 261.0 * b) / 1403.0;
            const bA = (460.0 * p2 - 220.0 * a - 6300.0 * b) / 1403.0;
            const rCScaled = HctSolver.inverseChromaticAdaptation(rA);
            const gCScaled = HctSolver.inverseChromaticAdaptation(gA);
            const bCScaled = HctSolver.inverseChromaticAdaptation(bA);
            const linrgb = matrixMultiply([rCScaled, gCScaled, bCScaled], HctSolver.LINRGB_FROM_SCALED_DISCOUNT);
            if (linrgb[0] < 0 || linrgb[1] < 0 || linrgb[2] < 0) {
                return 0;
            }
            const kR = HctSolver.Y_FROM_LINRGB[0];
            const kG = HctSolver.Y_FROM_LINRGB[1];
            const kB = HctSolver.Y_FROM_LINRGB[2];
            const fnj = kR * linrgb[0] + kG * linrgb[1] + kB * linrgb[2];
            if (fnj <= 0) {
                return 0;
            }
            if (iterationRound === 4 || Math.abs(fnj - y) < 0.002) {
                if (linrgb[0] > 100.01 || linrgb[1] > 100.01 || linrgb[2] > 100.01) {
                    return 0;
                }
                return argbFromLinrgb(linrgb);
            }
            j = j - (fnj - y) * j / (2 * fnj);
        }
        return 0;
    }
    static solveToInt(hueDegrees, chroma, lstar) {
        if (chroma < 0.0001 || lstar < 0.0001 || lstar > 99.9999) {
            return argbFromLstar(lstar);
        }
        hueDegrees = sanitizeDegreesDouble(hueDegrees);
        const hueRadians = hueDegrees / 180 * Math.PI;
        const y = yFromLstar(lstar);
        const exactAnswer = HctSolver.findResultByJ(hueRadians, chroma, y);
        if (exactAnswer !== 0) {
            return exactAnswer;
        }
        const linrgb = HctSolver.bisectToLimit(y, hueRadians);
        return argbFromLinrgb(linrgb);
    }
    static solveToCam(hueDegrees, chroma, lstar) {
        return Cam16.fromInt(HctSolver.solveToInt(hueDegrees, chroma, lstar));
    }
}
HctSolver.SCALED_DISCOUNT_FROM_LINRGB = [
    [0.001200833568784504, 0.002389694492170889, 0.0002795742885861124],
    [0.0005891086651375999, 0.0029785502573438758, 0.0003270666104008398],
    [0.00010146692491640572, 0.0005364214359186694, 0.0032979401770712076],
];
HctSolver.LINRGB_FROM_SCALED_DISCOUNT = [
    [1373.2198709594231, -1100.4251190754821, -7.278681089101213],
    [-271.815969077903, 559.6580465940733, -32.46047482791194],
    [1.9622899599665666, -57.173814538844006, 308.7233197812385],
];
HctSolver.Y_FROM_LINRGB = [0.2126, 0.7152, 0.0722];
HctSolver.CRITICAL_PLANES = [
    0.015176349177441876, 0.045529047532325624, 0.07588174588720938,
    0.10623444424209313, 0.13658714259697685, 0.16693984095186062,
    0.19729253930674434, 0.2276452376616281, 0.2579979360165119,
    0.28835063437139563, 0.3188300904430532, 0.350925934958123,
    0.3848314933096426, 0.42057480301049466, 0.458183274052838,
    0.4976837250274023, 0.5391024159806381, 0.5824650784040898,
    0.6277969426914107, 0.6751227633498623, 0.7244668422128921,
    0.775853049866786, 0.829304845476233, 0.8848452951698498,
    0.942497089126609, 1.0022825574869039, 1.0642236851973577,
    1.1283421258858297, 1.1946592148522128, 1.2631959812511864,
    1.3339731595349034, 1.407011200216447, 1.4823302800086415,
    1.5599503113873272, 1.6398909516233677, 1.7221716113234105,
    1.8068114625156377, 1.8938294463134073, 1.9832442801866852,
    2.075074464868551, 2.1693382909216234, 2.2660538449872063,
    2.36523901573795, 2.4669114995532007, 2.5710888059345764,
    2.6777882626779785, 2.7870270208169257, 2.898822059350997,
    3.0131901897720907, 3.1301480604002863, 3.2497121605402226,
    3.3718988244681087, 3.4967242352587946, 3.624204428461639,
    3.754355295633311, 3.887192587735158, 4.022731918402185,
    4.160988767090289, 4.301978482107941, 4.445716283538092,
    4.592217266055746, 4.741496401646282, 4.893568542229298,
    5.048448422192488, 5.20615066083972, 5.3666897647573375,
    5.5300801301023865, 5.696336044816294, 5.865471690767354,
    6.037501145825082, 6.212438385869475, 6.390297286737924,
    6.571091626112461, 6.7548350853498045, 6.941541251256611,
    7.131223617812143, 7.323895587840543, 7.5195704746346665,
    7.7182615035334345, 7.919981813454504, 8.124744458384042,
    8.332562408825165, 8.543448553206703, 8.757415699253682,
    8.974476575321063, 9.194643831691977, 9.417930041841839,
    9.644347703669503, 9.873909240696694, 10.106627003236781,
    10.342513269534024, 10.58158024687427, 10.8238400726681,
    11.069304815507364, 11.317986476196008, 11.569896988756009,
    11.825048221409341, 12.083451977536606, 12.345119996613247,
    12.610063955123938, 12.878295467455942, 13.149826086772048,
    13.42466730586372, 13.702830557985108, 13.984327217668513,
    14.269168601521828, 14.55736596900856, 14.848930523210871,
    15.143873411576273, 15.44220572664832, 15.743938506781891,
    16.04908273684337, 16.35764934889634, 16.66964922287304,
    16.985093187232053, 17.30399201960269, 17.62635644741625,
    17.95219714852476, 18.281524751807332, 18.614349837764564,
    18.95068293910138, 19.290534541298456, 19.633915083172692,
    19.98083495742689, 20.331304511189067, 20.685334046541502,
    21.042933821039977, 21.404114048223256, 21.76888489811322,
    22.137256497705877, 22.50923893145328, 22.884842241736916,
    23.264076429332462, 23.6469514538663, 24.033477234264016,
    24.42366364919083, 24.817520537484558, 25.21505769858089,
    25.61628489293138, 26.021211842414342, 26.429848230738664,
    26.842203703840827, 27.258287870275353, 27.678110301598522,
    28.10168053274597, 28.529008062403893, 28.96010235337422,
    29.39497283293396, 29.83362889318845, 30.276079891419332,
    30.722335150426627, 31.172403958865512, 31.62629557157785,
    32.08401920991837, 32.54558406207592, 33.010999283389665,
    33.4802739966603, 33.953417292456834, 34.430438229418264,
    34.911345834551085, 35.39614910352207, 35.88485700094671,
    36.37747846067349, 36.87402238606382, 37.37449765026789,
    37.87891309649659, 38.38727753828926, 38.89959975977785,
    39.41588851594697, 39.93615253289054, 40.460400508064545,
    40.98864111053629, 41.520882981230194, 42.05713473317016,
    42.597404951718396, 43.141702194811224, 43.6900349931913,
    44.24241185063697, 44.798841244188324, 45.35933162437017,
    45.92389141541209, 46.49252901546552, 47.065252796817916,
    47.64207110610409, 48.22299226451468, 48.808024568002054,
    49.3971762874833, 49.9904556690408, 50.587870934119984,
    51.189430279724725, 51.79514187861014, 52.40501387947288,
    53.0190544071392, 53.637271562750364, 54.259673423945976,
    54.88626804504493, 55.517063457223934, 56.15206766869424,
    56.79128866487574, 57.43473440856916, 58.08241284012621,
    58.734331877617365, 59.39049941699807, 60.05092333227251,
    60.715611475655585, 61.38457167773311, 62.057811747619894,
    62.7353394731159, 63.417162620860914, 64.10328893648692,
    64.79372614476921, 65.48848194977529, 66.18756403501224,
    66.89098006357258, 67.59873767827808, 68.31084450182222,
    69.02730813691093, 69.74813616640164, 70.47333615344107,
    71.20291564160104, 71.93688215501312, 72.67524319850172,
    73.41800625771542, 74.16517879925733, 74.9167682708136,
    75.67278210128072, 76.43322770089146, 77.1981124613393,
    77.96744375590167, 78.74122893956174, 79.51947534912904,
    80.30219030335869, 81.08938110306934, 81.88105503125999,
    82.67721935322541, 83.4778813166706, 84.28304815182372,
    85.09272707154808, 85.90692527145302, 86.72564993000343,
    87.54890820862819, 88.3767072518277, 89.2090541872801,
    90.04595612594655, 90.88742016217518, 91.73345337380438,
    92.58406282226491, 93.43925555268066, 94.29903859396902,
    95.16341895893969, 96.03240364439274, 96.9059996312159,
    97.78421388448044, 98.6670533535366, 99.55452497210776,
];
// ============================ hct ============================
class Hct {
    static from(hue, chroma, tone) {
        return new Hct(HctSolver.solveToInt(hue, chroma, tone));
    }
    static fromInt(argb) {
        return new Hct(argb);
    }
    toInt() {
        return this.argb;
    }
    get hue() {
        return this.internalHue;
    }
    set hue(newHue) {
        this.setInternalState(HctSolver.solveToInt(newHue, this.internalChroma, this.internalTone));
    }
    get chroma() {
        return this.internalChroma;
    }
    set chroma(newChroma) {
        this.setInternalState(HctSolver.solveToInt(this.internalHue, newChroma, this.internalTone));
    }
    get tone() {
        return this.internalTone;
    }
    set tone(newTone) {
        this.setInternalState(HctSolver.solveToInt(this.internalHue, this.internalChroma, newTone));
    }
    constructor(argb) {
        this.argb = argb;
        const cam = Cam16.fromInt(argb);
        this.internalHue = cam.hue;
        this.internalChroma = cam.chroma;
        this.internalTone = lstarFromArgb(argb);
        this.argb = argb;
    }
    setInternalState(argb) {
        const cam = Cam16.fromInt(argb);
        this.internalHue = cam.hue;
        this.internalChroma = cam.chroma;
        this.internalTone = lstarFromArgb(argb);
        this.argb = argb;
    }
    inViewingConditions(vc) {
        const cam = Cam16.fromInt(this.toInt());
        const viewedInVc = cam.xyzInViewingConditions(vc);
        const recastInVc = Cam16.fromXyzInViewingConditions(viewedInVc[0], viewedInVc[1], viewedInVc[2], ViewingConditions.make());
        const recastHct = Hct.from(recastInVc.hue, recastInVc.chroma, lstarFromY(viewedInVc[1]));
        return recastHct;
    }
}
// ============================ tonal_palette ============================
class TonalPalette {
    static fromInt(argb) {
        const hct = Hct.fromInt(argb);
        return TonalPalette.fromHct(hct);
    }
    static fromHct(hct) {
        return new TonalPalette(hct.hue, hct.chroma, hct);
    }
    static fromHueAndChroma(hue, chroma) {
        const keyColor = new KeyColor(hue, chroma).create();
        return new TonalPalette(hue, chroma, keyColor);
    }
    constructor(hue, chroma, keyColor) {
        this.hue = hue;
        this.chroma = chroma;
        this.keyColor = keyColor;
        this.cache = new Map();
    }
    tone(tone) {
        let argb = this.cache.get(tone);
        if (argb === undefined) {
            argb = Hct.from(this.hue, this.chroma, tone).toInt();
            this.cache.set(tone, argb);
        }
        return argb;
    }
    getHct(tone) {
        return Hct.fromInt(this.tone(tone));
    }
}
class KeyColor {
    constructor(hue, requestedChroma) {
        this.hue = hue;
        this.requestedChroma = requestedChroma;
        this.chromaCache = new Map();
        this.maxChromaValue = 200.0;
    }
    create() {
        const pivotTone = 50;
        const toneStepSize = 1;
        const epsilon = 0.01;
        let lowerTone = 0;
        let upperTone = 100;
        while (lowerTone < upperTone) {
            const midTone = Math.floor((lowerTone + upperTone) / 2);
            const isAscending = this.maxChroma(midTone) < this.maxChroma(midTone + toneStepSize);
            const sufficientChroma = this.maxChroma(midTone) >= this.requestedChroma - epsilon;
            if (sufficientChroma) {
                if (Math.abs(lowerTone - pivotTone) < Math.abs(upperTone - pivotTone)) {
                    upperTone = midTone;
                } else {
                    if (lowerTone === midTone) {
                        return Hct.from(this.hue, this.requestedChroma, lowerTone);
                    }
                    lowerTone = midTone;
                }
            } else {
                if (isAscending) {
                    lowerTone = midTone + toneStepSize;
                } else {
                    upperTone = midTone;
                }
            }
        }
        return Hct.from(this.hue, this.requestedChroma, lowerTone);
    }
    maxChroma(tone) {
        if (this.chromaCache.has(tone)) {
            return this.chromaCache.get(tone);
        }
        const chroma = Hct.from(this.hue, this.maxChromaValue, tone).chroma;
        this.chromaCache.set(tone, chroma);
        return chroma;
    }
}
// ============================ core_palette ============================
class CorePalette {
    static of(argb) {
        return new CorePalette(argb, false);
    }
    static contentOf(argb) {
        return new CorePalette(argb, true);
    }
    static fromColors(colors) {
        return CorePalette.createPaletteFromColors(false, colors);
    }
    static contentFromColors(colors) {
        return CorePalette.createPaletteFromColors(true, colors);
    }
    static createPaletteFromColors(content, colors) {
        const palette = new CorePalette(colors.primary, content);
        if (colors.secondary) {
            const p = new CorePalette(colors.secondary, content);
            palette.a2 = p.a1;
        }
        if (colors.tertiary) {
            const p = new CorePalette(colors.tertiary, content);
            palette.a3 = p.a1;
        }
        if (colors.error) {
            const p = new CorePalette(colors.error, content);
            palette.error = p.a1;
        }
        if (colors.neutral) {
            const p = new CorePalette(colors.neutral, content);
            palette.n1 = p.n1;
        }
        if (colors.neutralVariant) {
            const p = new CorePalette(colors.neutralVariant, content);
            palette.n2 = p.n2;
        }
        return palette;
    }
    constructor(argb, isContent) {
        const hct = Hct.fromInt(argb);
        const hue = hct.hue;
        const chroma = hct.chroma;
        if (isContent) {
            this.a1 = TonalPalette.fromHueAndChroma(hue, chroma);
            this.a2 = TonalPalette.fromHueAndChroma(hue, chroma / 3);
            this.a3 = TonalPalette.fromHueAndChroma(hue + 60, chroma / 2);
            this.n1 = TonalPalette.fromHueAndChroma(hue, Math.min(chroma / 12, 4));
            this.n2 = TonalPalette.fromHueAndChroma(hue, Math.min(chroma / 6, 8));
        } else {
            this.a1 = TonalPalette.fromHueAndChroma(hue, Math.max(48, chroma));
            this.a2 = TonalPalette.fromHueAndChroma(hue, 16);
            this.a3 = TonalPalette.fromHueAndChroma(hue + 60, 24);
            this.n1 = TonalPalette.fromHueAndChroma(hue, 4);
            this.n2 = TonalPalette.fromHueAndChroma(hue, 8);
        }
        this.error = TonalPalette.fromHueAndChroma(25, 84);
    }
}
// ============================ score ============================
const SCORE_OPTION_DEFAULTS = {
    desired: 4,
    fallbackColorARGB: 0xff4285f4,
    filter: true,
};
function compare(a, b) {
    if (a.score > b.score) {
        return -1;
    } else if (a.score < b.score) {
        return 1;
    }
    return 0;
}
class Score {
    static score(colorsToPopulation, options) {
        const { desired, fallbackColorARGB, filter } = { ...SCORE_OPTION_DEFAULTS, ...options };
        const colorsHct = [];
        const huePopulation = new Array(360).fill(0);
        let populationSum = 0;
        for (const [argb, population] of colorsToPopulation.entries()) {
            const hct = Hct.fromInt(argb);
            colorsHct.push(hct);
            const hue = Math.floor(hct.hue);
            huePopulation[hue] += population;
            populationSum += population;
        }
        const hueExcitedProportions = new Array(360).fill(0.0);
        for (let hue = 0; hue < 360; hue++) {
            const proportion = huePopulation[hue] / populationSum;
            for (let i = hue - 14; i < hue + 16; i++) {
                const neighborHue = sanitizeDegreesInt(i);
                hueExcitedProportions[neighborHue] += proportion;
            }
        }
        const scoredHct = [];
        for (const hct of colorsHct) {
            const hue = sanitizeDegreesInt(Math.round(hct.hue));
            const proportion = hueExcitedProportions[hue];
            if (filter && (hct.chroma < Score.CUTOFF_CHROMA || proportion <= Score.CUTOFF_EXCITED_PROPORTION)) {
                continue;
            }
            const proportionScore = proportion * 100.0 * Score.WEIGHT_PROPORTION;
            const chromaWeight = hct.chroma < Score.TARGET_CHROMA ? Score.WEIGHT_CHROMA_BELOW : Score.WEIGHT_CHROMA_ABOVE;
            const chromaScore = (hct.chroma - Score.TARGET_CHROMA) * chromaWeight;
            const score = proportionScore + chromaScore;
            scoredHct.push({ hct, score });
        }
        scoredHct.sort(compare);
        const chosenColors = [];
        for (let dDegrees = 90; dDegrees >= 15; dDegrees--) {
            chosenColors.length = 0;
            for (const { hct } of scoredHct) {
                const duplicateHue = chosenColors.find((chosenHct) => {
                    return differenceDegrees(hct.hue, chosenHct.hue) < dDegrees;
                });
                if (!duplicateHue) {
                    chosenColors.push(hct);
                }
                if (chosenColors.length >= desired)
                    break;
            }
            if (chosenColors.length >= desired)
                break;
        }
        const colors = [];
        if (chosenColors.length === 0) {
            colors.push(fallbackColorARGB);
        }
        for (const chosenHct of chosenColors) {
            colors.push(chosenHct.toInt());
        }
        return colors;
    }
}
Score.TARGET_CHROMA = 48.0;
Score.WEIGHT_PROPORTION = 0.7;
Score.WEIGHT_CHROMA_ABOVE = 0.3;
Score.WEIGHT_CHROMA_BELOW = 0.1;
Score.CUTOFF_CHROMA = 5.0;
Score.CUTOFF_EXCITED_PROPORTION = 0.01;
// ============================ scheme ============================
class Scheme {
    get primary() { return this.props.primary; }
    get onPrimary() { return this.props.onPrimary; }
    get primaryContainer() { return this.props.primaryContainer; }
    get onPrimaryContainer() { return this.props.onPrimaryContainer; }
    get secondary() { return this.props.secondary; }
    get onSecondary() { return this.props.onSecondary; }
    get secondaryContainer() { return this.props.secondaryContainer; }
    get onSecondaryContainer() { return this.props.onSecondaryContainer; }
    get tertiary() { return this.props.tertiary; }
    get onTertiary() { return this.props.onTertiary; }
    get tertiaryContainer() { return this.props.tertiaryContainer; }
    get onTertiaryContainer() { return this.props.onTertiaryContainer; }
    get error() { return this.props.error; }
    get onError() { return this.props.onError; }
    get errorContainer() { return this.props.errorContainer; }
    get onErrorContainer() { return this.props.onErrorContainer; }
    get background() { return this.props.background; }
    get onBackground() { return this.props.onBackground; }
    get surface() { return this.props.surface; }
    get onSurface() { return this.props.onSurface; }
    get surfaceVariant() { return this.props.surfaceVariant; }
    get onSurfaceVariant() { return this.props.onSurfaceVariant; }
    get outline() { return this.props.outline; }
    get outlineVariant() { return this.props.outlineVariant; }
    get shadow() { return this.props.shadow; }
    get scrim() { return this.props.scrim; }
    get inverseSurface() { return this.props.inverseSurface; }
    get inverseOnSurface() { return this.props.inverseOnSurface; }
    get inversePrimary() { return this.props.inversePrimary; }
    static light(argb) {
        return Scheme.lightFromCorePalette(CorePalette.of(argb));
    }
    static dark(argb) {
        return Scheme.darkFromCorePalette(CorePalette.of(argb));
    }
    static lightContent(argb) {
        return Scheme.lightFromCorePalette(CorePalette.contentOf(argb));
    }
    static darkContent(argb) {
        return Scheme.darkFromCorePalette(CorePalette.contentOf(argb));
    }
    static lightFromCorePalette(core) {
        return new Scheme({
            primary: core.a1.tone(40),
            onPrimary: core.a1.tone(100),
            primaryContainer: core.a1.tone(90),
            onPrimaryContainer: core.a1.tone(10),
            secondary: core.a2.tone(40),
            onSecondary: core.a2.tone(100),
            secondaryContainer: core.a2.tone(90),
            onSecondaryContainer: core.a2.tone(10),
            tertiary: core.a3.tone(40),
            onTertiary: core.a3.tone(100),
            tertiaryContainer: core.a3.tone(90),
            onTertiaryContainer: core.a3.tone(10),
            error: core.error.tone(40),
            onError: core.error.tone(100),
            errorContainer: core.error.tone(90),
            onErrorContainer: core.error.tone(10),
            background: core.n1.tone(99),
            onBackground: core.n1.tone(10),
            surface: core.n1.tone(99),
            onSurface: core.n1.tone(10),
            surfaceVariant: core.n2.tone(90),
            onSurfaceVariant: core.n2.tone(30),
            outline: core.n2.tone(50),
            outlineVariant: core.n2.tone(80),
            shadow: core.n1.tone(0),
            scrim: core.n1.tone(0),
            inverseSurface: core.n1.tone(20),
            inverseOnSurface: core.n1.tone(95),
            inversePrimary: core.a1.tone(80)
        });
    }
    static darkFromCorePalette(core) {
        return new Scheme({
            primary: core.a1.tone(80),
            onPrimary: core.a1.tone(20),
            primaryContainer: core.a1.tone(30),
            onPrimaryContainer: core.a1.tone(90),
            secondary: core.a2.tone(80),
            onSecondary: core.a2.tone(20),
            secondaryContainer: core.a2.tone(30),
            onSecondaryContainer: core.a2.tone(90),
            tertiary: core.a3.tone(80),
            onTertiary: core.a3.tone(20),
            tertiaryContainer: core.a3.tone(30),
            onTertiaryContainer: core.a3.tone(90),
            error: core.error.tone(80),
            onError: core.error.tone(20),
            errorContainer: core.error.tone(30),
            onErrorContainer: core.error.tone(80),
            background: core.n1.tone(10),
            onBackground: core.n1.tone(90),
            surface: core.n1.tone(10),
            onSurface: core.n1.tone(90),
            surfaceVariant: core.n2.tone(30),
            onSurfaceVariant: core.n2.tone(80),
            outline: core.n2.tone(60),
            outlineVariant: core.n2.tone(30),
            shadow: core.n1.tone(0),
            scrim: core.n1.tone(0),
            inverseSurface: core.n1.tone(90),
            inverseOnSurface: core.n1.tone(20),
            inversePrimary: core.a1.tone(40)
        });
    }
    constructor(props) {
        this.props = props;
    }
    toJSON() {
        return { ...this.props };
    }
}
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