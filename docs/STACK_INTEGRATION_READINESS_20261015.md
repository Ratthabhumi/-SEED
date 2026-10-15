# PR stack integration readiness — read-only audit

Snapshot2026-10-15 before continuation fixes. No merge/rebase/reset was performed. Preserve the stack and review bottom-up after human quality gates.

|PR|Head|Base|Base ancestor of head|Remote SHA|
|--|--|--|--|--|
|#1|feat/civilization-playability-20261011|feat/v0261-outpost-softlock-20261008|YES|`a09babda190a4104eb6314cb608341054bd5768d`|
|#2|feat/content9-ascension-guidance-20261011|feat/civilization-playability-20261011|YES|`781687aadb071bc1cf56203385d42b86088c271a`|
|#3|feat/visual-gameplay-evolution-20261011|feat/content9-ascension-guidance-20261011|YES|`a1d74ca28861fe7a4127b36b71a686fb48f623a9`|
|#4|feat/unified-art-ui-repair-20261012|feat/visual-gameplay-evolution-20261011|YES|`47aa8c620166f92b11d61d9d58c480620c602052`|
|#5|feat/age-combat-evolution-20261012|feat/unified-art-ui-repair-20261012|YES|`2ea1191ca555dc7e00164702b0dd6f0c9fbc97ac`|
|#6|feat/combat-feedback-slice-20261012|feat/age-combat-evolution-20261012|YES|`36c0bbb11a1de1fd5f503058488c657af9ec22e8`|
|#7|feat/breakthrough-quality-closure-20261013|feat/combat-feedback-slice-20261012|YES|`2222002b84928fff38dedad9689bfbcd0b67edae`|
|#8|feat/integrated-gameplay-art-closure-20261013|feat/breakthrough-quality-closure-20261013|YES|`8d52ecd34ca3de4cb5c1bb55293d663c3b515493`|
|#9|feat/content14-stutter-art-consistency-20261013|feat/integrated-gameplay-art-closure-20261013|YES|`fd171b239d00827d8100ae165d551d5766630cc7`|
|#10|feat/content15-combat-world-ui-quality|feat/content14-stutter-art-consistency-20261013|YES|`efef11ef9729c3bbc388061a45b605688b6a213e`|
|#11|feat/content15-perf-animation-closure-20261014|feat/content15-combat-world-ui-quality|YES|`0fa6378a457606e4066055032e8ea52b22fc63b1`|
|#12|feat/content15-integrated-human-quality-20261014|feat/content15-perf-animation-closure-20261014|YES|`ce63df35d52e8b3041d232f5e8e3438c087cecf8`|
|#13|feat/content153-playable-visual-boss-20261015|feat/content15-integrated-human-quality-20261014|YES|`081ec5b802de5a715fd050a0587df458850a2911`|

Main remains5e6d5c65ea905bc3859f115e73bfd02913988d45. PR1 itself targets feat/v0261-outpost-softlock-20261008, so merging only PR1–13 would not integrate the missing base into main. That base also needs an explicit reviewed integration plan. No approval to merge is inferred.

Review order: establish the base/main boundary first, then PR1→13. Preserve authored assets/provenance and historical negative evidence. For each proposed integration revision, check ancestry and tree differences, resolve actual conflicts without rewriting public branch history, run exact resulting-head CI/package checks, and obtain human art/fun acceptance. Current mergeability metadata is temporary and cannot substitute for testing the resulting tree. Parallel alternate branches should not be merged merely because their names look newer.
