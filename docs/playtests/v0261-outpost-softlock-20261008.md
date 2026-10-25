# v0.26.1 human-observed Outpost specialization softlock

- Evidence: operator report supplied on 2026-10-08; screenshot observations relayed by the operator. Original screenshot and session identifier are not present in this checkout. No raw telemetry was edited or invented.
- Reproduction build: `c310c20cb56fa095ad7a4da50e5d93be974cb29f`, branch `fix/v0261-playtest-readiness-20261008`.
- Observation: Industrial Age, elapsed 11:43, Logistics 6/6; newly claimed site opens specialization, all three choices disabled (1/2/1 cost), Escape cannot dismiss, canonical stepping stays paused.
- Classification: `HUMAN_OBSERVED_P1_SOFTLOCK`; session status `INTERRUPTED_BY_BUG`.
- `HUMAN_FUN_VERDICT = PENDING`; `REPLAY_DESIRE_VERDICT = PENDING`. This interrupted session is not `HUMAN_FUN_PASS` or a clean pilot. The offered console workaround was not confirmed as executed; if used, record it separately and keep the session interrupted.

## Verified cause and corrective contract

Claims intentionally cost no Logistics. The adapter opened a binding picker, disabled all buttons using a duplicated capacity check, and prohibited Escape. The simulation also already accepted the first specialized Signal at full capacity, but the UI rejected that valid action.

The picker now always exposes localized Later (Esc), with initial focus, Tab/Shift+Tab containment and dialog semantics. Closing keeps the unspecialized claim with no resource or specialization mutation; the blocking coordinator drains FIFO and canonical stepping resumes only when all blocking surfaces are gone. The contextual prompt permits retry, prioritizes a currently affordable pending claim (including first Signal), and keeps free claim actions available.

`RunSimulation.canSetOutpostSpec` is the read-only authority shared with `setOutpostSpec` and the UI. Non-Signal and subsequent Signal selections cannot exceed capacity. Preserve the pre-existing first-Signal exemption: full cost is charged, maximum capacity is unchanged, so research/economy can reach 7/6 and military 8/6. Existing disabled specialized Signals still count, preventing a repeated exemption after a raid. Repair grandfathering remains unchanged. This intentionally preserves existing progression and balance; no worldgen, content or save schema changes or dependencies.

## Automated coverage

- Unit: exact Industrial 6/6 rejection without mutation, retry after capacity becomes available, every first-Signal spec and charged overflow, subsequent/disabled Signal rejection, missing/disabled/over targets.
- Browser: exact 11:43/6/6 staging followed by real free claim and modal path, EN/TH Later/click/Escape/Tab/Shift+Tab, paused-state stability, real stepping after close, FIFO beats and queued picker, ordinary affordable Enter selection, first Signal military overflow, pending-claim priority, second Signal rejection.
- Browser staging is test-only (`?e2e`) and conditioned evidence, not an additional human playtest or natural-run balance evidence.
- Existing visual regression now closes its already-specialized target with Later rather than attempting an invalid second specialization.
- Screenshots: gitignored `test-results/outpost-softlock-en.png` and `test-results/outpost-softlock-th.png`.

## Operator acceptance after exact-SHA CI passes

1. Start a fresh clean build/session at the corrective SHA. Preserve the interrupted session evidence separately.
2. At full Logistics, claim a cleared ordinary site. Confirm disabled choices, readable EN/TH Later, and Escape/click returning to moving gameplay.
3. Reopen from the base prompt; when capacity grows, select normally and confirm the displayed exact cost is charged once.
4. At full capacity, specialize the first Signal; confirm the stated exception and mission progress. Subsequent Signal receives no exemption.
5. Check a queued transition does not overlap the picker or resume combat behind a blocking dialog.
6. Play beyond 11:43 naturally and report any repeat softlock. Human post-fix revalidation and fun/replay verdicts remain pending until actual operator evidence.

## Verification commands

`npm run check`, `npm run analyze`, `npm run test`, `npm run test:e2e`, `npm run zip`, `npm run release:verify`.
The repository has no `npm run release` or `npm run verify` script; use its actual `release:verify` and third-party verification (included in check). Packaging does not publish a release or tag.

## Local results

Final `npm run check`: PASS, 353 tests / 45 files plus typecheck, asset verification and production build. `analyze` and standalone `test`: PASS. ZIP and release verification: 17/17 PASS (46 files, 1114 KB). Final focused Chromium: 8/8 PASS including both frontier scenarios and Thai 200% at 1280×720; Thai screenshots visually inspected.

The initial full browser sweep had 45 passes, 2 subsequently repaired failures (missing full-Logistics prompt; an EN line-height test incorrectly applying the Thai criterion to CSS `normal`), and one historical capture-only skip. The corrected cases passed their rerun. One concurrent check timed out in the existing factorial audit/worker RPC; isolated unchanged `npm run check` then passed in 20.38s. No acceptance threshold was relaxed. Existing large-bundle and terminal-color warnings remain. Exact-SHA CI must certify the final entire browser suite. No hardware performance or post-fix human gameplay result is claimed.
