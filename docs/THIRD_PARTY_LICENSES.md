# Third-Party Licenses & Legal Ledger
**Project**: -SEED  
**Audit Baseline**: v0.22 Open-Source Leverage Pass  
**Status**: APPROVED & AUDITED

---

## 1. Summary of Dependencies & Assets

| Component | Version | License | Source / Author | Used Where | Modified? | Attribution Required? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `@dagrejs/dagre` | 3.1.1 | MIT | Chris Pettitt & contributors | `src/game/tech/TechGraphLayout.ts` (Tech DAG layout) | No | Yes (MIT notice below) |
| `@panzoom/panzoom` | 4.6.2 | MIT | Timmy Willison | `src/game/tech/TechMapModal.ts` (Tech Map pan/zoom) | No | Yes (MIT notice below) |
| `Kenney Input Prompts` | 1.5 | CC0 1.0 Universal | Kenney (kenney.nl) | `assets/seed/input/` (Q/E/R/F/T/M keyboard prompts) | Yes (normalized) | No (CC0 Public Domain) |
| `Kenney Sci-Fi RTS` | 1.0 | CC0 1.0 Universal | Kenney (kenney.nl) | `assets/seed/structures/` (Outpost structure sprites) | Yes (normalized) | No (CC0 Public Domain) |
| `Kenney UI Pack - Sci-Fi` | 1.0 | CC0 1.0 Universal | Kenney (kenney.nl) | `assets/seed/ui/` (Modal headers, button borders) | Yes (normalized) | No (CC0 Public Domain) |
| `Kenney Particle Pack` | 1.0 | CC0 1.0 Universal | Kenney (kenney.nl) | `assets/seed/vfx/` (Hit, claim, breakthrough, raid VFX) | Yes (normalized) | No (CC0 Public Domain) |
| `Kenney Board Game Icons`| 1.0 | CC0 1.0 Universal | Kenney (kenney.nl) | `assets/seed/icons/` (Research, military, economy icons) | Yes (normalized) | No (CC0 Public Domain) |

---

## 2. Complete License Notices

### MIT License — @dagrejs/dagre (3.1.1)
```text
Copyright (c) 2012-2014 Chris Pettitt
Copyright (c) 2023-2025 David Newell & Matthew Dahl

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

### MIT License — @panzoom/panzoom (4.6.2)
```text
MIT License

Copyright (c) 2020 Timmy Willison

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Creative Commons CC0 1.0 Universal (Public Domain Dedication)
Applicable to all vendored Kenney asset collections:
- Kenney Input Prompts
- Kenney Sci-Fi RTS
- Kenney UI Pack - Sci-Fi
- Kenney Particle Pack
- Kenney Board Game Icons

```text
CC0 1.0 Universal (CC0 1.0) Public Domain Dedication

The person who associated a work with this deed has dedicated the work to the
public domain by waiving all of his or her rights to the work worldwide under
copyright law, including all related and neighboring rights, to the extent
allowed by law.

You can copy, modify, distribute and perform the work, even for commercial
purposes, all without asking permission.

Full legal code: https://creativecommons.org/publicdomain/zero/1.0/legalcode
```

---

## 3. Provenance Verification
Every vendored asset is indexed in [assets/ASSET_MANIFEST.json](file:///c:/Users/MewMew/Desktop/Co-op/-SEED/assets/ASSET_MANIFEST.json) with exact source URL, downloaded timestamp, checksum/source path, and documented modification record.

Automated verification script:
```bash
npm run verify:third-party
```
Ensures no unlisted asset, mismatched package version, or ambiguous license enters the project release.
