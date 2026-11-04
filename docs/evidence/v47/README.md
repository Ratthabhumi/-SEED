# V4.7 candidate browser gallery

Staged local Playwright captures from the final candidate runtime, before the
source commit stamps its SHA. Exact committed-source captures are independently
uploaded by Push/PR CI. These are not human acceptance or native performance tests.
One cold Draft capture overlays FPS15; do not hide it or infer physical60Hz PASS.
At720p the long collection uses its deliberate sidebar scroll; Start stays visible.

![Main Thai720p](main-th-720.png)
![Main English1080p](main-en-1080.png)
![Pause Thai720p](pause-th-720.png)
![Draft Thai1080p](draft-th-1080.png)
![Collection with owned/equipped and locked items, staged save](collection-owned-en.png)
![Main Thai200percent keyboard access](main-th-200.png)
![Draft Thai200percent high contrast/reduced effects](draft-th-200.png)
![POI before canonical discovery](poi-before-discovery.png)

poi-pixel.json records2948 image-difference pixels and a1.5ms CPU post-render
checkpoint after discovery in this run. The former is raster evidence; the
latter is explicitly NOT GPU completion/presentation or a latency guarantee.
The destination is already identified before the canonical discovery reward.

parent-source-proof.json verifies61 archived parent source blobs against57df3d1
after CRLF-to-LF normalization for text only. The comparison script's unchecked
cache-reuse behavior is a deferred minor, not a claim about arbitrary future caches.
