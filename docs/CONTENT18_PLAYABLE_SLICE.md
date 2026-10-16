# Playable slice — human review candidate

ADR0038: finite Cross danger now has a filled interior/closed perimeter
matching real hit geometry; dark backing separates Cross/Slam from terrain.
Gameplay/terrain/UI/localization stay intact. Two ground-cache prototypes
were rejected. Performance OPEN; continuous painted animation BLOCKED on
actual editable source, not a research report or metadata-only rig.

## เล่นตรวจจาก clean final source

```powershell
npm run qa:human
```

เปิด http://localhost:5173/?qa=1 ตรวจ build SHA ให้ตรง PR เริ่มรอบใหม่
Hunters / EPOCH-GOLDEN-001: Stone → เคลื่อนที่/ยิง → เลือกเทคโนโลยี → พบและ
ยึดฐาน → raid → เปลี่ยนยุค → Space → บอสจนชนะหรือแพ้ → ถ้าชนะเข้า World2
หากไปไม่ถึงให้บันทึกจุดติดและเวลาจริง ไม่ใช้ debug grant รับรองรอบ

ลอง Normal/Reduced/High Contrast, UI100%/200%, ไทย/English ตรวจชื่อการ์ด/
เมนู, อาวุธต่อมือ, ภูมิประเทศ/ฐาน, Slam/Cross จากบอสนอกจอ ตอน Dash พร้อม/
ติดคูลดาวน์ ทั้งหนีช้าและหนีทัน ภาพ staged ใช้ตรวจเฉพาะจุด ไม่ใช่ natural run

หลังเล่นให้คะแนน1–5 พร้อมเหตุการณ์สั้นๆ ใน7ด้าน: ภาพ, ความรู้สึกเคลื่อนไหว,
ความต่อเนื่องแอนิเมชัน, การอ่านภัย, ความยุติธรรมบอส, ความชัดของการพัฒนา
อารยธรรม, ความอยากเล่นซ้ำ ระบุ seed/build/mode/ภาษา/scale/เวลาเกิดปัญหา
หากเกมค้างให้เก็บหลักฐานก่อน refresh

Raw QA อยู่ ignored test-results/human-playtests/. qa:finalize ใช้เฉพาะ
ผลจริงที่ตรวจแล้ว ไม่ปลอมคะแนน/HUMAN_FUN_PASS แทนผู้เล่น รอบบั๊กเดิมยังเป็น
INTERRUPTED_BY_BUG. HUMAN_REVIEW_READY หมายถึงพร้อมให้ตรวจ ไม่ใช่ผ่านรับรอง

## ส่งต่อเฉพาะจุด

- ChatGPT Research: joint render/sim outlier จาก matched A/A + CPU/GPU/host
  telemetry ก่อนเลือก optimization ใหม่; cache2แบบยังไม่ให้ผลดีซ้ำได้
- Artist production: Hunters Stone front/back แยก torso/head/แขน/ขาท่อนบนล่าง/
  เท้า พร้อมผิวส่วนที่ถูกบัง, grip/muzzle/ground anchor และ timeline
  idle/walk/anticipation/release/recovery/hurt/dash/ability/death; sourceแก้ได้
  จริง + PNG/timing/sockets/hash ตาม ANIMATION_PRODUCTION_CONTRACT
- Human design: อ่านภัย/หลบทันจริงหรือไม่, add pressureเหมาะหรือไม่ และ
  ยอมรับ Hunters burst4.72sหรือไม่ ไม่ปรับ HP/Damage จากผลบอต

No repeated market/camera/culling/batching research. Stack integration is
separate bottom-up read-only review; no merge authorization is inferred.
