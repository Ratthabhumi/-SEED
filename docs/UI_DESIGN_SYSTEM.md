# Living Frontier — UI Design System v1

Canonical colors: src/theme/tokens.ts. Generated CSS: src/styles/tokens.css (node scripts/theme-css.mjs; --check validates). Phaser mappings derive from the same palette. Common controls/cards/HUD consume semantic variables; specialized map/domain colors remain. Incremental migration; not every legacy literal has been removed.

Slate canvas/surfaces; cream text; gold action/focus/warnings; teal friendly/success; coral hostile/damage; blue research; violet permanent Archive. Labels, glyphs and silhouettes accompany meaningful color. Tests validate common rendered text pairs >=4.5:1. High contrast changes surfaces/borders.

Bundled Noto Sans/Thai. Display40–72px; screen22px, section19px, body18px, caption16px. Scale100–200%; Thai line-height1.8, no truncation of instructions.4/8 spacing,44px targets,12px radii,12–24px safe margins. Dialog50/UI10/world labels40 preserve hierarchy.

Title owns two bounded regions; Start/settings footer stays outside content scroll. Below760px vertical regions; Archive up to35dvh. Short wide screens compact padding. Native details owns Archive scrolling. Native Tab/ShiftTab/Enter/Space, focus scrolls into view. Controls have price/names and disabled states. Existing coordinator owns modal focus.

HUD existing dock priority retained: context top-left, progression center, goals right, commands lower-left, knowledge lower-center, minimap lower-right. Compact density discloses secondary content. Shared buttons/cards/panels consume tokens. Reduced Effects controls ornamentation. Repair progress reads canonical state with no separate clock.

Verification and unfinished work: docs/UNIFIED_ART_UI_REVIEW.md.
