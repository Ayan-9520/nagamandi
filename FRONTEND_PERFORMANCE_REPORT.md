# Frontend performance report

Measurements are from the production build in this phase. The earlier Phase 15 build is the before figure. Both builds exited 0.

## Entry script

| Build | File | Minified | Gzip |
| --- | --- | --- | --- |
| Before Phase 16 | `dist/assets/index-Co_KeTne.js` | 1,792.03 kB | 478.40 kB |
| After Phase 16 | `dist/assets/index-Dg5NuceC.js` | 761.90 kB | 214.48 kB |

The entry is 1,030.13 kB smaller minified and 263.92 kB smaller gzipped. Vite still warns that it is over 500 kB.

## Where the rest of the code went

`npm run build` emitted 123 JavaScript files totalling 1,856,498 bytes. That total is close to the old single chunk because the code was split rather than deleted. The largest lazy pieces are:

| Chunk | Minified | Gzip | What it is |
| --- | --- | --- | --- |
| `CartesianChart-BcaHoWhS.js` | 352.02 kB | 102.43 kB | Chart library, loaded with the dashboard |
| `LoadingState-DrFFidMX.js` | 136.79 kB | 47.80 kB | Shared page dependency chunk |
| `DashboardPage-Ch-0QBYP.js` | 66.08 kB | 18.83 kB | Dashboard page |
| `browser-J7lMOXco.js` | 23.46 kB | 8.86 kB | Shared dependency |
| `TemperaturePages-DAmNJk4Y.js` | 22.40 kB | 7.68 kB | Cold-storage temperature pages |

Login, the introduction and the application shell stay in the entry. Desk pages are dynamic imports. Opening the dashboard is what pulls the chart chunk.

## Lint

`npm run lint` exited 0 with 22 warnings and no errors. Rules were not turned off.

| Warning | Count | Why it remains |
| --- | --- | --- |
| `react(only-export-components)` | 11 | Shared UI and feature files export a component and a helper. Splitting every file would be a wide rename with no runtime gain. |
| `react(incompatible-library)` | 9 | React Hook Form’s `watch` API. The forms rely on it. |
| `react(set-state-in-effect)` on `PartyFormPage` | 1 | The form is reset when the stored party changes. That effect is the synchronisation with the persisted record. |
| `react-hooks(exhaustive-deps)` on `PartyFormPage` | 1 | The effect depends on `form.reset` rather than the whole form object, so the reset does not loop on every render. |

## Typecheck and dev server

`npx tsc -b --pretty false` exited 0. `npm run dev` was already serving http://localhost:5173 with `strictPort`. It was not restarted.

## What this does not claim

The smaller entry is the first script a signed-out visitor downloads. A signed-in dashboard visit still downloads the chart chunk. No Lighthouse run was taken. No runtime frame-rate measurement was taken.
