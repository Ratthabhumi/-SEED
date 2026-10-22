# V3.1 bounded development evidence

`summary.json` is readable; each `.json.gz` preserves the original complete
synthetic report. SHA256 of raw and compressed bytes is in the summary.
No human QA report or real-user save is included.

- A/A baseline: official clean PR20/4827b9a, instrumented normal/HC advancing
  prefix plus eight frozen windows each. CPU/power/browser/GPU retained.
- Parent A/B: official PR19/9b5c1fa versus PR20/4827b9a.40 cold/warm rows.
- First candidate A/B: official PR20 versus clean experimental5969c8d with
  groundGeometry=prepared.40 cold/warm rows; no primitive clipping yet.
- Candidate A/A: clean5969c8d opt-in, separately instrumented.
- Clipped A/B and A/A: clean2418086 opt-in, with actual native-bound omission;
  all five paired warm blocks improve. Separate instrumented GPU/CPU attribution
  is not a matched GPU causal claim. Both raw reports retain their original SHA.

Five-block ABBA/BAAB preserves500 enemies/800 projectiles paused, initial3s
and settled3s, frame pacing, errors, build identities and unfavorable rows.
Heap occupancy is not allocation rate. Cold=fresh context, not OS cache
eviction. Paused windows are NOT live budget or human acceptance. No thermal
sensor/exclusive-host guarantee exists. UHD630/D3D11 results are host-specific.
Different historical24-case runs are not controlled A/B.

Final exact-source live24-case and CI/native receipts belong
to the new Draft PR; never restamp these earlier sources as final head.

Unsuccessful development gates retained: initial native test found zero hits
because Phaser4 captures its render step at construction. The public-step
correction then passed96 pixel cases. A lifecycle test incorrectly expected an
empty Normal Graphics stream to create geometry; its corrected expectation
distinguishes empty native output from actual HC rebuilds. The first clipping
branch excluded the main canvas context; final tests require nonzero skips
and exact pixels. No failing case was deleted.
