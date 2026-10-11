# Third-party notices

## @material/material-color-utilities (v0.3.0, vendored, Apache-2.0)

The color engine embedded in `client.js` (HCT / CAM16 / viewing conditions,
tonal palettes, core palettes, quantize & score, and the M3 scheme) is adapted
from https://github.com/material-foundation/material-color-utilities,
Copyright 2021 Google LLC, licensed under the Apache License 2.0:

```
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

Vendored files (in `src/`, inlined into the built bundle):
- `math_utils.js`, `color_utils.js`
- `viewing_conditions.js`, `cam16.js`, `hct_solver.js`, `hct.js`
- `tonal_palette.js`, `core_palette.js`, `score.js`, `scheme.js`

Minor adaptations: ESM namespace imports inlined into one closure; `export`
keywords removed; the `Score.score` loop counter renamed to avoid a shadowing
collision after inlining. The 莫奈取色 sampling step in `engine-ext.js` uses a
frequency-map quantizer instead of the optional Wu/WSMeans clusterer; seed
curation still runs through the official `Score` algorithm.