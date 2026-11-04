# ADR0055 — V4.9 coherent menus without balance guesses

Status: implemented; final receipts in the V4.9 Draft PR.

Base: f4cc341 / Draft PR39. Owner ratings Combat1/5, Upgrade2/5 predate a new natural V4.8 acceptance. Natural36 worsened: historical27/23/0→23/20/4, defender-aware27/23/3→23/19/5. Neither UI polish nor green CI establishes enjoyment.

## Decision

Reuse the existing theme/token system, native buttons/details and Save3. Share one settings renderer and fresh save transactions across Main/Pause, one optional Guide, one optional-menu keyboard boundary. Main retains Seed and Origin view state when opening/closing Settings; language changes preserve it. Help and Back are explicit. Optional dialogs trap Tab/ShiftTab and restore caller focus. Mandatory Draft/Legacy/Origin/Expansion still use the existing DecisionInputBoundary and queue; never attach dismissable menu navigation to them.

Pause initially discloses only immediate play/navigation; identity, full settings and save clearing expand on request. The five-item Collection uses compact rows and explicit unlock disclosures. No grants, new inventory, new currency or new dependency. Existing equip transactions and focus restoration remain.

Use canonical POI discovery/territory state for the Civilization Map; visited-but-unclaimed sites must not disappear. Give player/site/base/loss/boss markers distinguishable geometry and a localized accessible legend. Preserve reward/discovery rules and frontier-link semantics. Chronicle receives a named dialog/keyboard boundary only after terminal settlement, preserving exactly-once persistence.

## Evidence and limits

Actual720p screenshots identified crowded Collection/Pause and duplicated settings. RED tests reproduced Settings Escape losing navigation, inaccessible Pause option parity, and initial-heading reverse Tab skipping Back. One fresh whole-change reviewer identified Important pre-existing Chronicle focus escape and missing discovered/unclaimed map sites, plus a minor failed-save slider display mismatch; one bounded fix pass uses browser regressions.

The initial audit accidentally photographed Draft while labeling POI/Map/Outpost after a discovery reward. Keep that failed audit and do not treat those three pictures as coverage. Corrected audit resolves real choices and asserts each actual surface before photographing it. Initial targeted browser28PASS/1FAIL: the legacy Clear Save test omitted opening newly collapsed Danger; update only navigation and retain its dialog-dismissal/save assertions.

Core/content source, Worldgen3/Content26/Save3/child18 remain identical to V4.8. No density, HP, damage, cadence or Boss retune. Mandatory CI may repeat Natural36 because its scope is based on main ancestry; do not locally duplicate it or alter the workflow. Compare candidate rows to V4.8, not to a target win percentage.

Human usability, combat feel, preferred art and physical60Hz remain separate acceptance gates. No BUG_FREE, ART_COMPLETE or HUMAN_FUN_PASS claim. No external research; use owner-supplied design direction.
