# 07: ทดลอง cookie และ cold start

**What to build:** มีโมดูล `spike` ที่ใช้ทดลองบน production ได้โดยคนนอกเรียกไม่ได้ และได้คำตอบว่า cookie แบบที่ออกแบบไว้ผ่าน proxy ได้จริงหรือไม่ และผู้ชมเดโมต้องรอ cold start นานแค่ไหน

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] ถ้าไม่ตั้ง environment flag จะไม่มี route ของ `spike` เลย
- [ ] ทุก endpoint ต้องส่ง header ที่มีค่าลับตรงกัน โดยเทียบแบบ constant-time
- [ ] เทสต์ยืนยันว่าเรียกโดยไม่มีค่าลับหรือค่าลับผิดแล้วไม่สำเร็จ
- [ ] Browser ได้ cookie แบบ httpOnly, Secure และ `SameSite=Strict` จากโดเมนของ Web และส่งกลับถึง API ใน request ถัดไป
- [ ] วัด cold start 5 ครั้งหลังไม่มี traffic และบันทึกค่ากลาง โดยผ่านเมื่อไม่เกิน 10 วินาที
- [ ] บันทึกผลพร้อมตัวเลขสำหรับ Sprint Log และถ้าไม่ผ่านต้องมี ADR ใหม่
