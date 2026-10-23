# Integration readiness —23 October2026

V3.3 reconciliation: remote PR22 remains Draft at
`c529f7c47d2e142b51e37255fd965fd24a966d03`, parent PR21/835a25f;
main remains5e6d5c65. PR22 is191 commits above main. This one child workstream
adds its own source/validation receipt; no integration authority or claim that
the108-commit prerequisite has been independently integrated/validated.

REVIEW_PREPARED / HUMAN_ACCEPTANCE_OPEN. One source reconciliation before V3.2 editing. Main `5e6d5c65ea905bc3859f115e73bfd02913988d45`; PR21 source `835a25f821b5aa0e8492c9f13787a3d7aa59f6ad` is190 commits ahead. All21 PRs are OPEN Drafts; no merge/retarget/history change performed.

Bottom prerequisite: `d3814a6b7e94182a05be66e341eb36c0914eabc0` on `feat/v0261-outpost-softlock-20261008`, **108 commits ahead of main**. PR1 starts above this prerequisite, not directly above main. Its old48-test softlock CI is historical evidence; it does not independently validate the whole108-commit prerequisite against current integration requirements.

|PR|Source|Parent|Current synthetic merge ref|
|--|--|--|--|
|[#1](https://github.com/Ratthabhumi/-SEED/pull/1)|`a09babda`|prerequisite `d3814a6b`|`35152a3d`|
|[#2](https://github.com/Ratthabhumi/-SEED/pull/2)|`781687aa`|PR1 `a09babda`|`ab040cb2`|
|[#3](https://github.com/Ratthabhumi/-SEED/pull/3)|`a1d74ca2`|PR2 `781687aa`|`1d6189be`|
|[#4](https://github.com/Ratthabhumi/-SEED/pull/4)|`47aa8c62`|PR3 `a1d74ca2`|`4d0c2211`|
|[#5](https://github.com/Ratthabhumi/-SEED/pull/5)|`2ea1191c`|PR4 `47aa8c62`|`dd80204c`|
|[#6](https://github.com/Ratthabhumi/-SEED/pull/6)|`36c0bbb1`|PR5 `2ea1191c`|`5f1b2493`|
|[#7](https://github.com/Ratthabhumi/-SEED/pull/7)|`2222002b`|PR6 `36c0bbb1`|`d4a06ded`|
|[#8](https://github.com/Ratthabhumi/-SEED/pull/8)|`8d52ecd3`|PR7 `2222002b`|`ac3c224e`|
|[#9](https://github.com/Ratthabhumi/-SEED/pull/9)|`fd171b23`|PR8 `8d52ecd3`|`b6da85b7`|
|[#10](https://github.com/Ratthabhumi/-SEED/pull/10)|`efef11ef`|PR9 `fd171b23`|`a38bf6a2`|
|[#11](https://github.com/Ratthabhumi/-SEED/pull/11)|`0fa6378a`|PR10 `efef11ef`|`347d806d`|
|[#12](https://github.com/Ratthabhumi/-SEED/pull/12)|`ce63df35`|PR11 `0fa6378a`|`6511249b`|
|[#13](https://github.com/Ratthabhumi/-SEED/pull/13)|`4d1dc0cb`|PR12 `ce63df35`|`6e7bc09c`|
|[#14](https://github.com/Ratthabhumi/-SEED/pull/14)|`7b9b164a`|PR13 `4d1dc0cb`|`9913babe`|
|[#15](https://github.com/Ratthabhumi/-SEED/pull/15)|`b909802d`|PR14 `7b9b164a`|`c668765f`|
|[#16](https://github.com/Ratthabhumi/-SEED/pull/16)|`a9d0af44`|PR15 `b909802d`|`ca3329a9`|
|[#17](https://github.com/Ratthabhumi/-SEED/pull/17)|`f6281228`|PR16 `a9d0af44`|`15df343f`|
|[#18](https://github.com/Ratthabhumi/-SEED/pull/18)|`cf5aaf69`|PR17 `f6281228`|`0028758a`|
|[#19](https://github.com/Ratthabhumi/-SEED/pull/19)|`9b5c1fac`|PR18 `cf5aaf69`|`d2fe2d15`|
|[#20](https://github.com/Ratthabhumi/-SEED/pull/20)|`4827b9ad`|PR19 `9b5c1fac`|`3f8416cc`|
|[#21](https://github.com/Ratthabhumi/-SEED/pull/21)|`835a25f8`|PR20 `4827b9ad`|`d2f4f40f`|

V3.2 / PR22 is the single new child of PR21 on `feat/v32-combat-presentation-20261023`, parent `835a25f821b5aa0e8492c9f13787a3d7aa59f6ad`. Its final source and synthetic merge SHAs are in the linked Draft PR's exact-source receipt (embedding this document's own commit hash would be self-referential). The190-ahead count above describes PR21 before this workstream's commit.

Each actual base is verified to be an ancestor of its source; full SHAs and branch names are in [integration-stack.json](evidence/v32/integration-stack.json). Merge refs are synthetic mutable GitHub candidates, not merged production commits or proof of green CI. PR21 receipt independently verifies equal source/testmerge trees and both5/5 CI events. PR22's final source/testmerge/CI receipt is published on that Draft PR. No PR23 before owner play.

## Gates before any authorized integration

- Review all108 prerequisite commits (scope, provenance, deterministic version/save migrations, package completeness); validate the proposed combined tree with current full check, browser lifecycle/EN/TH, Natural36 and packaging. Do not infer this from old48-test CI alone.
- Preserve PR21 native96/parity and HC optimization; compare final source/tree and synthetic merge tree, and rerun exact-target CI after any authorized ancestry/integration change. Historical green CI belongs to its original tree.
- Final V3.2 engineering, natural/World2, strict physical8ms/4ms and package receipts are separate from human approval. Retain failures and all36 natural outcomes.
- Original31 human issues retain IDs/statuses. Continuous painted source remains BLOCKED; art/motion/readability/threat/fairness/fun/replay ratings remain pending. No HUMAN_FUN_PASS or release authorization.

## Proposed owner-controlled sequence

1. Owner plays/reviews the one PR22 slice and supplies ratings/blockers; finish corrections in that PR.
2. Review the prerequisite against main, audit its108 commits and validate an explicitly selected integration tree. Obtain separate integration authorization.
3. Integrate prerequisite then PR1→PR22 in topological order, with reviewed source/parent/tree receipts and checks at the selected integration boundaries. Any retarget/squash/rebase policy requires explicit owner approval; this report performs none.
4. Revalidate final main tree, native/physical/save/progression and fresh human gates before a separately authorized tag/release. Avoid declaring all historical PRs accepted merely because the newest descendant passes.
