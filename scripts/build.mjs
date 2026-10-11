import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const core = readFileSync(join(root, 'src', 'engine-core.js'), 'utf8');
const ext = readFileSync(join(root, 'src', 'engine-ext.js'), 'utf8');
if (!core.includes('//__EXT__')) throw new Error('engine-core missing __EXT__ marker');
const body = core.replace('//__EXT__', ext);
mkdirSync(join(root, 'lib'), { recursive: true });
writeFileSync(join(root, 'lib', 'engine.js'), body);
console.log('lib/engine.js written:', body.length, 'bytes');

// Emit the bundle client.js by inlining the engine at the marker.
const template = readFileSync(join(root, 'src', 'client-template.js'), 'utf8');
const marker = '//__ENGINE_JS__';
if (!template.includes(marker)) throw new Error('client-template missing engine marker');
const out = template.replace(marker, body);
writeFileSync(join(root, 'client.js'), out);
console.log('client.js written:', out.length, 'bytes');