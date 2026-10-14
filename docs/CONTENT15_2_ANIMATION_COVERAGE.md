# Animation and attachment coverage

No new motion images in15.2; original source/provenance remain in15.1.
Hunters Stone/Space front/back:36distinct authored reference key poses.
Idle/hurt/dash/ability/death each one key pose; walk and attack each two frames.
Recovery reuses the second attack key pose. Canonical clock/native Phaser
playback unchanged. Other Origins/intermediate Ages: original static costumes
with procedural motion; not production animation.

This candidate corrects the equipment coordinate composition, not character
anatomy. Per-frame body socket is still mirrored with facing. Equipment's grip
origin now lands on that socket (≤2u recoil) rather than a27u offset center.
Bow(Stone–Iron)92/64, crossbow43/74, gun49/93, staff30/64, shield63/67 in128px
source cells. These initial visual source coordinates require per-weapon artist
review; they are not claimed accurate anatomy through every attack angle.
Actual canonical projectile spawn/muzzle positions have not been changed.

Full continuous motion family is **NOT DELIVERED**. Remaining production task:
authored idle/walk/anticipation/release/recovery/hurt/dash/ability/death clips,
stable anatomy/facing and socket/muzzle continuity, variable-length clip metadata
where needed, deterministic packer roundtrip, texture budget, real movement/
combat capture and human artist approval. Existing export/import is reused;
no fake frame duplication or fabricated Krita source. Expanding24costumes before
reference acceptance remains inappropriate.
