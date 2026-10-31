# V3.9 — Frame Interval Evidence v1

31Oct continuation: the newer owner packet authorizes a coherent CI-recovery
Draft in this same branch. See V39_CI_RECOVERY/ADR0048. The earlier QA-only
micro-PR restriction below describes the first measurement milestone; it does
not prohibit the subsequently authorized infrastructure recovery.

## Verified reconciliation

Owner checkout preserved: `feat/v37-frame-pacing-experience-20261025`, including
untracked `.cursor/`, `Play-SEED-QA.bat` and private playtests. Work is isolated
from main `725cc79b6c3ddb433257a55734aa5281ee89a7de`.

PR30 remains OPEN/Draft at `caf6777e9aeb588b7786025c505796c5b5e710e1`;
tree `e31d7ab5c12cbb189e05f2ab2f68b4656697a770`. Only Report, its tests and
handoff differ. Its two supplied CI runs were rechecked10/10 successful.
An isolated read of the exact Report/test files passed6 tests, then both files
were restored to main before new implementation. Sampled55ms labels, missing
checkpoints, real measured zero and unchanged JSON/report behavior match the
contract. Engineering disposition: **QA_CONSOLIDATED_READY_FOR_MERGE**.
PR31 remains OPEN/Draft, included in PR30 history; neither PR is merged/closed here.

## Implemented and reproducible

ADR0047 describes the257-counter pure histogram, strict thresholds, bounded
percentiles/overflow, optional LoAF, visibility/reentry/pause coverage and cleanup.
Use `?qa=1`, press F10, download the observed-update JSON sidecar. `?profile=1`
also enables collection; `?e2e` alone does not. Do not publicly upload private
natural-session sidecars without sanitizing them. No changes to PlaytestReport,
PlaytestRecorder, save schema, canonical core, balance, accepted bow or painted Boss.
Versions remain Worldgen3 / Content20 / Save2 / historical child-law18.

Tests were written first (initial missing-module RED); the reset/drain regression
also produced a real failed assertion before implementation and then passed.
The pause-boundary test expectation was corrected to count both paused and
pause-crossing callbacks; it does not move those samples into active coverage.
10 histogram/monitor tests pass. Earlier focused QA/report/i18n group passed18;
the subsequent additional reset test is separate, not folded into that count.
19 targeted browser tests pass, including new3 interval tests, EN/TH720/1080,
download, disabled ordinary mode, explicit profile enablement and restart.
Synthetic document visibility events test adapter behavior; they are not evidence
of physical tab scheduling. Existing Boss HUD/warning and decision layout cases
in that group passed. Screenshots/sidecars stay in ignored `test-results/browser`.

Local full `npm run check` passed566 tests/99 files, third-party provenance and
production build. A subsequent typecheck also passed after the reset cleanup.
Full final-source checks and exact build/measurement receipts are recorded on
the published branch/Issue29 after source freeze; pending checks are not readiness.

```powershell
npm ci
npm run check
npm run test:e2e
npm run analyze
npm run zip
npm run release:verify
# Run only on a clean, freshly built checkout, without other local tests/builds:
node scripts/measure-frame-intervals.mjs
```

The bounded script owns port4189 and its own browser/server only. Two8s live
staged Boss windows at native720/1080 Normal record build, browser/renderer,
DPR/CSS/backing sizes, interval histogram, actual density, rolling240 sim/CPU
submit timings and valid asynchronous GPU queries. It is SYNTHETIC_DIAGNOSTIC,
not NATURAL_GAMEPLAY, STRICT_PHYSICAL_STRESS or HUMAN_SUBJECTIVE. All failures
stay in the receipt. No old24-case campaign, factorial experiment or retry loop.

Host observation: Parsec service and virtual display adapter are present; physical
Intel UHD630 reports60Hz to the OS. Active remote connection, actual browser
display refresh, thermals and exclusive GPU ownership are unverified. Never
terminate remote access to obtain a cleaner number. No strict1080p pass inferred.

## Player issue and delivery gate

Review of the original31 ledger and the bounded existing HUD/decision/Boss
regressions did **not** confirm a new player-facing P1. This is an evidence gap,
not proof every player issue is fixed. No before/after P1 capture or claimed UX
improvement is invented. No issue identity or acceptance status is changed.
Authentic new painted animation requires actual authored assets; none is fabricated.

Per the supplied plan, **do not open another QA-only micro-PR**. Push this coherent
measurement implementation to one mainline branch for inspection, link its receipt
to Issue29, and retain it for a subsequent confirmed production improvement.
Do not stack onto PR30 or modify its audited source. A new Draft PR requires
that additional verified production delta; strict readiness additionally requires
complete exact-source CI, controlled host measurement and actual owner feedback.

Research: R1/R2/R3 applied as supplied; R4 prior diagnosis retained without
repeating its experiments; R5 bow/art/determinism preserved. No external API
uncertainty currently needs broad research. Owner action: separately authorize
PR30 integration, provide controlled-host access/refresh/session conditions for
physical acceptance and a precise current player-facing reproduction if one recurs.
