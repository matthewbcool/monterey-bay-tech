# Monterey Bay Cozy assets

The sea otter, moon jelly and giant kelp models under this directory are copied
from [Monterey Bay Cozy](https://github.com/matthewbcool/Monterey-Bay-Cozy)
(`c25abaf5fd9b945949d3713ef14e276a3dfd1aa1`), which is MIT licensed — see
`LICENSE` in this directory.

## What was copied

| Here | Upstream |
| --- | --- |
| `style.ts` | `src/models/shared/style.ts` |
| `random.ts` | `src/models/shared/random.ts` |
| `staticAsset.ts` | `src/models/shared/staticAsset.ts` |
| `props.ts` | subset of `src/models/props/primitives.ts` (`mat`, `mesh`, `disposeObject`) |
| `sea-otter/*` | `src/models/habitat/sea-otter/*` |
| `moon-jelly/*` | `src/models/habitat/moon-jelly/*` |
| `giantKelp.ts` | `src/models/habitat/giantKelp.ts` |
| `fish/*` | `src/models/shared/fish/*` |
| `school/schooling.ts` | `src/models/shared/school/schooling.ts` |
| `assembly.ts` | `src/models/shared/assembly.ts` |
| `types.ts` | `src/models/types.ts` |
| `sardine/*` | `src/models/pacific-sardine/*` |

## Adaptations

- **Sardine school.** `createSardineSchool()` builds one instanced draw for the
  whole school (shared geometry, per-instance morph weights). The otter model
  was vendored first but is not used by the hero; it is kept because it is
  complete and cheap to re-enable.
- **No distance LOD.** Upstream calls `defineGeometryLods()` (meshoptimizer WASM)
  to build mid/far variants. The hero renders a handful of objects at a fixed
  camera distance, so the vendored `createSeaOtter` builds only the `near`
  geometry and the LOD import was removed. No geometry, material or motion
  values were changed.
- **Trimmed prop helpers.** `props.ts` carries only the three helpers the kelp
  factory uses; the rest of the upstream props catalogue is not copied.
- **Import paths** were rewritten to this directory, and `staticAsset.ts`,
  `assembly.ts` and `fish/batches.ts` use `Array.from(...)` instead of iterating
  Maps/iterators directly because the site compiles to an ES5 target.
- `sea-otter/geometry.ts` declares its `LodLevel` union locally instead of
  importing the LOD module.

Everything else — proportions, colours, toon ramp, bone rig, pulse animation,
seed handling and disposal — is upstream code.

## Attribution

Original code © 2026 Monterey Bay Cozy contributors, MIT. Species references and
size bases are recorded in the upstream `definition.ts` files and are not
endorsements by the institutions cited there.
