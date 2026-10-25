# ADR0045 — final-anchor aim and minimum muzzle clearance

Parent PR25/fe04927d0a03f1478cdf4b57bb4aee40a68256dd. Content20.

Controlled identical-input fixtures established two defects in Content19:

- Aim was solved and rotation advanced **before** the mount translated. The
  release then validated against the translated pivot, discarding an otherwise
  attainable shot. Target(100,-80), initially aligned Float Hunters, reproduces
  this without changing enemy HP, weapon damage or angular velocity.
- A fixed Hand anchor could put an overlapping target behind the barrel.
  Four origin/Atomic Hand fixtures spent360 consecutive due ticks rejecting
  forward geometry, emitting no volley. Hand defects do **not** explain the
  Float-default Natural36 outcomes by themselves.

Translate toward the planned anchor first, then solve and rotate toward the
actual translated anchor. If the desired anchor is inside the authored muzzle
reach, retract it away from the target to reach+4 units. Translation still
converges at10/s; rotation still caps at14rad/s. A target exactly on the desired
anchor uses the prior heading as a deterministic retreat direction. The existing
0.045rad release tolerance, forward>=1 gate, recoil and physical socket remain.
There is no instant invisible shot or added hitbox. Hand may visibly retract
away from its nominal18/-12 comparison anchor to create a valid barrel ray.

Select this correction from96 offline controlled ablation cases **before**
looking at candidate policy outcomes. Across24 fixtures per variant:

|Variant|Zero-volley cases|Volleys|Angle deferrals|Forward deferrals|
|--|--:|--:|--:|--:|
|PR25|4|130|120|1440|
|Placement/final-anchor correction|0|156|103|93|
|Target lock only|4|126|212|1440|
|Placement plus lock|0|153|171|93|

Reject target-lock state and its pool-generation complexity in this iteration:
it did not improve these controlled firing opportunities. Keep nearest-target
selection and assess real source-backed reversal captures. This rejects an
unhelpful intervention, not evidence that all target switching is ideal.

No damage, HP, cooldown, count, projectile speed/radius, range, swept contact,
RNG or world-generation tuning. Content20 marks different canonical aim/release
traces; old Content19 input traces are not interchangeable. Worldgen3/save2
remain; child World Laws retain the explicit18 seed. Active runs are not saved
in the persistent schema, so existing settings/archive migrations remain valid.
No new dependency or bitmap change.

Natural36 uses PR25 as the exact baseline, guarded against all36 published PR25
hashes. Offline observers collect due ticks, angular/forward rejection, actual
releases, projectile expiry/hits, resolved HP/shield damage and30s checkpoints.
Candidate replay runs without observers must match its observed canonical state.
Missing-target intervals are excluded from completed readiness-wait episodes;
unfinished waits and unresolved projectiles remain explicit. Chronicle damage is
kept separately from resolved HP damage. Responsive-policy inputs can diverge
between versions; these are not matched historical human input traces.

Keep every outcome, including regressions. Winning21/36 is not a tuning target.
Final source/CI and physical24 receipts belong to the single DraftPR. Green
engineering checks cannot establish human fun or close performance/art gates.

The explicit e2e+combatReview operator surface is separate from natural QA:
it skips the tutorial, labels staged ages/targets/readiness and suppresses the
Human QA recorder even if qa=1 is also supplied. Normal QA stays unchanged.
Use a private browser window; existing owner launcher/raw evidence stays intact.
