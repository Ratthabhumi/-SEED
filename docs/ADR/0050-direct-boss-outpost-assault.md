# ADR0050 — Actual boss outpost assault, superseding ADR0049's raid trigger

Owner follow-up rates recalled enjoyment1/5, controls usable, and specifically
wants the boss to try to destroy bases while the player protects them. Visible
character growth/Fashion/collection are also requested as future product goals.
These are real qualitative inputs, not fabricated numeric sub-ratings or
acceptance of the new candidate. Raw QA117/118 is never rewritten to add them.

Content21 prototypea644ef8 generated zero boss-siege warnings in all36 policies:
the nearby/no-active-raid condition failed to create the intended defense loop.
Its complete outcomes and canceled remaining CI are retained. The old trigger
is removed. We do not tune a win ratio after seeing results; the owner clarified
the encounter objective. E2E/render CI was canceled to avoid spending the rest
of a run on superseded source. Successful verification/analysis remains evidence
for that source only, never transferred to the next commit.

Content22 stores one real outpost identity in BossEncounter and canonical hash.
At phase2 entry the boss chooses an active specialized base, preferring the
existing raid's target; otherwise nearest to the boss with stable ID tie-break.
Ordinary new raids coordinate on this same target, not another simultaneous
defense. Disabled targets are reconsidered only at safe phases. No teleport,
extra damage system, manufactured raid, invulnerability or base grant.

Even pattern cycles approach/attack the base; alternate cycles threaten the
player. Targeted base coordinates use no predictive lead. The boss must physically
reach the existing600u engagement range, then complete the existing fixed-origin
warning and commitment. Only actual slam/cross geometry in range can damage the
base. A shared damageOutpost helper feeds its existing HP/disable/repair/loss
model for both ordinary siege units and boss strikes. Accepted boss damage has
its own event/counter, distinguishable from ordinary raid damage. Normal fan
shots still threaten player/allies, not an invisible new base collider.

HUD names the actual base with an M reminder; target/loss events and real damage
feedback accompany the actual warning geometry. Player response is to follow,
intercept/kill during recovery, use existing powers/orders and repair after loss.
Long routes give travel time through actual boss movement rather than silently
damaging an offscreen base. Human fairness/enjoyment remains a retest gate.

Worldgen3, Save2 and child laws18 remain compatible. Content22 explicitly breaks
older encounter replays; runtime encounter state is not a persisted save schema.
No new gacha or fake Fashion recolors are added without a product/reward design
and legitimate source art. ChatGPT receives a bounded design brief in the report.
