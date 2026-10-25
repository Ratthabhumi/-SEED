# Content 9 private pilot — operator checklist

Engineering eligibility depends on the final exact-SHA CI receipt in SESSION_HANDOFF. Human result is pending. Use 3–5 novices for qualitative discovery, not a numerical fun certification. Read PLAYTEST_PROTOCOL_V0261.md for the unchanged integrity rules.

## Start

1. Preserve any active or interrupted run first; never refresh it to install a fix. Stop the old QA launcher with Ctrl+C only after its report is saved.
2. From the repository, run `npm run qa` (alias of qa:human). It starts both Vite and the report watcher; do not start dev in another terminal.
3. Open http://localhost:5173/?qa=1 in a fresh page. Record branch, exact git HEAD, seed/origin, language/UI scale, browser, viewport and relevant target-hardware context privately.
4. Confirm the report buildSha equals the approved SHA and buildDirty=false. The launcher freezes build provenance at startup; restart it after pulling/committing source. Old sessions are not relabeled as a clean new build. Missing/dirty provenance is ineligible for a clean pilot.

## Blind first experience

- Observe up to 15 minutes or natural death without explaining solutions or staging state. Let the player choose naturally. Do not demand Space/Ascension to call the observation valid.
- Record first movement, understanding auto-attack/Knowledge, first deliberate card and what effect the player thinks it gives. Separate observation, interpretation and proposed change.
- Note awareness and use of F, T, claiming a cleared site, specialization/biome differences, and visible unmet age gates. Do not coach the full-logistics recovery during this blind phase.
- If the game blocks: screenshot before refresh, preserve local raw evidence, mark INTERRUPTED_BY_BUG; a workaround makes the session non-clean.
- At natural end, ask: What changed after your upgrade? What did your base give you? Why did you die or stop? Would you start another run now, and what would you change? Record the exact response; missing response stays missing.

## Follow-up tasks (identified as guided, separate from blind evidence)

- At full logistics, claim a site → Later button and Esc → confirm movement resumes; retry later from the site/map. Check first Signal is explained as an intentional one-time exception.
- Reallocate an existing base via confirmed refund; verify the displayed paid cost returns, tier/benefits are lost, and a T2 upgrade/age requirement can be pursued when its other gates are met. No free Knowledge or healing.
- On a draft with alternatives, reroll changes choices and spends once. Without alternatives, the button disables and explains why; skip/terminal reward remains available. Compare actual effects and localized rarity with what happens.
- Check pause/draft/map at100/125/150/200%, desktop and narrow window; Tab/Enter/Esc, visible focus, readable Thai, no clipping of essential actions. Find the last upgrade at a dense frontier.
- Compare two origins on the same seed, then two seeds with one origin. Counterbalance AB/BA order across players; not every novice needs every permutation. Keep effects of experience separate from seed/origin effects.
- Record natural advancement and late-age/Ascension only when actually reached. A staged check proves access, not natural completion or fun.

## Evidence and decision

At death/end the watcher saves local raw reports and sanitized summaries. Optional ratings/comments must come from the player. Before staging summaries, inspect them for paths, emails, hardware identifiers, IPs, and identifying comments; sanitization alone is not approval. Keep screenshots private unless reviewed.

Check positive, plausible wall duration; build provenance; zero assertion/console errors; direct subjective responses; and blocker status. Duplicate action marks or missing metadata invalidate precise behavior counts, not the whole person's observations.

Frame p95 and simulation p95 are distinct. Measure the unchanged 60FPS/sim<4ms/render<8ms targets on the stress workload with renderer profiling; a small simulation p95 does not certify GPU/render performance.

GO: exact-SHA engineering evidence permits controlled pilot. HOLD: subjective quality and broad demo/release are pending real responses and target-hardware evidence. Choose one repeated problem for the next small experiment; do not add large systems to compensate for an unclear result.
