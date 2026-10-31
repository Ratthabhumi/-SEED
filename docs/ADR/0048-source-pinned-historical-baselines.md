# ADR0048 — Source-pinned historical comparison contract v2

The owner-supplied research packet authorizes this repair in the existing V3.9
branch. Old CI41096719423 passed235 browser tests/1 skip, then historical
downloads failed. Original PR18/19 run artifacts are absent; PR21/25 remain
temporarily downloadable. Local authorized archives recover the exact PR18
ZIP anchor and PR19/25 receipts; a fresh PR21 official download is recorded.

Use immutable source/lock identities instead of requiring old artifact run IDs.
One shared preparation job resolves four baselines, validates any cached result,
or clones detached historical source, runs npm ci and the original Vite build.
Node24 compatibility was demonstrated by actual source rehearsals. Producer
Node/npm/Python/zlib/Git versions, OS/architecture, recipe and lock hashes are
recorded. CI cache keys include those identities; cache loss/corruption rebuilds.
Consumers verify the shared producer index, receipts, archive hashes, complete
extracted file hashes and embedded clean source stamps. Consumers need not run
the identical producer Git/Python versions merely to inspect a frozen binary.

Classifications are ORIGINAL_ARCHIVED, RECONSTRUCTED_FROM_SOURCE and UNAVAILABLE.
Never reclassify reconstruction as an original because the source SHA matches.
The original5a88... ZIP anchor remains unchanged. Original ZIP byte integrity,
normalized extracted parity and rendered/human acceptance are different claims.
Original reference trees are committed as small metadata; binaries/videos are not.
Fresh archives use standard-library Python with fixed entry times; their new
hashes are independent from historical ZIP timestamps/compression metadata.

SOURCE_PINNED_HISTORICAL_COMPARISON_V2 explicitly replaces the CI comparison
input contract, preserving source SHAs, seed, fixtures, viewports, all240-row
paired campaigns, live stress and geometry assertions. Every output labels
baseline provenance. Exact-original ZIP comparison v1 remains available via
the existing strict original-ZIP invocation; v2 does not report v1 as PASS.
No required comparison is dropped or made continue-on-error. Missing required
source, failed reconstruction, bad layout/stamp/identity fails preparation/CI.

Natural36 follows the explicit current instruction: run only when src/core or
src/content differs from main. Otherwise log NOT_RUN_NO_CANONICAL_DELTA, omit
the new-cohort claim, and retain all other existing tests/progression/policy gates.

No Release/tag, third-party binary service or permission change. No new package
dependency. Original archives remain in ignored authorized local storage; durable
CI recovery comes from Git source and lock, not from local files or cache survival.
