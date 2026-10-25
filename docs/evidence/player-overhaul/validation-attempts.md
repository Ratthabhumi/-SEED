# Preserved precommit attempts

These are dirty development attempts, not exact-head final evidence.

- New motion continuity tests initially failed3/6 because lean jumped from
  anticipation to release. Corrected the analytic tracks;6/6 then passed.
- First full local check:523 tests/91 files; provenance/build passed.
- First focused native run:27/29 passed (12m). New rig/HUD matrix passed
 720/1080, EN/TH,200%, normal/reduced/high-contrast; existing held-key,
 glyph bounds, real dodge/fan/phase assertions passed. POI fixture failed
 because it searched offsets<60 while the generator places them≥64; the
 fixture now searches all four real edges<69, leaving discovery<70 and
 worldgen unchanged. Mount comparison timed out at initial title loading;
 no simulated mount result or human verdict is claimed from that attempt.
- A production rebuild overlapped the first browser run. This is a possible
 contributor to that boot timeout, not a proven browser/game root cause.
 Serialize final build→browser and keep hardware profiling separate.
- Source PNG sizes are measured actual alpha dimensions, not full transparent
 cells. The new atlas adds3MiB runtime RGBA; no memory-saving claim.
- The next full check rejected the new original vector in two manifest tests:
  their asset-ID lists classified it as Kenney/CC0 or production-selected.
  Register this specific original MIT source with pending-art status; keep
  vendor/source SHA equality for its unmodified SVG and every existing check.

Final clean source/CI/native/package and physical receipts are appended to
the Draft PR without modifying this historical attempt record.

## Final lifecycle review of4a7cab8

Source review found HUD reconstruction on language changes retained old
ResizeObservers until scene shutdown. A new browser regression wraps the
native observer API and checks active observer count across real EN/TH
switches. Preserve the failing4a7cab8 reproduction, then disconnect the
previous HUD observer before reconstruction and the current one at shutdown.
The existing4a7cab8 packages/measurements/CI evidence remain labelled4a7cab8;
the corrective final SHA needs fresh checks/CI/native/physical evidence.
