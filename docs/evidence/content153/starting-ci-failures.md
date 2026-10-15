# Retained starting CI failures

Source081ec5b802de5a715fd050a0587df458850a2911; Push38657190200 and
PR38657196755 both failed E2E. Node22/24, Analyze and render-evidence jobs passed;
passing measurement execution did not establish strict performance acceptance.

|Failure family|Cases|Original evidence|Correction and retained requirement|
|--|--:|--|--|
|Age roster Stone/Space, EN/TH|4|Expected hero-reference; received hero-reference-attack|Check sampled exact texture/frame/Age; retain upright/in-view/bounds/Guardian assertions|
|Hunters neutral six-age progression|1|Expected hero-reference; received hero-reference-attack|Verify the correct attack/legacy Age segment and exact sampled frame|
|Real burst painted attack|1|Cannot set properties of undefined (timer)|Use canonical Industrial burst; Space ranged enemies have no burst evolution state; still require actual painted shot/role0 and bounded atlas|
|Viewport body hierarchy|1|Expected112; received126|Assert intended Hero126/squad60; retain camera zoom and64-tile/16MiB bounds|
|Retained glyph cache|1|Expected glyph count>0; received0 after30s|Select existing hostile=legacy path explicitly; keep positive≤64 cache and restart bounds; separately require actual painted canonical burst|

No failure/assertion was deleted to obtain green CI. No CI failure was described
as an art/fun verdict. Raw public CI log was retained locally in ignored scratch;
this portable extract removes runner-specific filesystem stack paths. Historical
human reports/session384 and rejected animation source are untouched.

## Additional local Windows verification failure

A complete local check returned493/494 passing with one180s frontier-policy
audit timeout and worker onTaskUpdate RPC timeout. The eight900s simulations
were synchronous and the explicit180s cap bypassed the repository's existing
Windows600s allowance. The correction yields every1024 fixed simulation steps,
keeps the exact seeds/policies/900s duration/replay equality, and uses600s only
on Windows (Linux180s unchanged). No gameplay performance budget or test
assertion was relaxed. Final validation must include this audit in the full
check; a focused rerun alone is not certification.
