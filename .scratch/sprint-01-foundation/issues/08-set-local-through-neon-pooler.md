# 08: ทดลอง `SET LOCAL` ผ่าน pooler

**What to build:** ได้คำตอบจาก production จริงว่าการตั้งค่า Shop ด้วย `SET LOCAL` ผ่าน pooler ของ Neon ไม่รั่วข้าม request ซึ่งเป็นความเสี่ยงที่ใหญ่ที่สุด เพราะ RLS ทั้งระบบต้องอาศัยข้อนี้

**Blocked by:** 06, 07

**Status:** ready-for-human

เจ้าของโปรเจกต์ต้องอ่านโค้ดและตรวจผลการทดลองด้วยตนเอง

- [ ] ทดลองผ่านโดเมนของ Web โดยใช้โมดูล `database` และ `app_tenant` ผ่าน pooler
- [ ] คำขอพร้อมกันด้วยค่า Shop ต่างกันเห็นเฉพาะแถวของตนภายใต้ `FORCE` RLS อย่างน้อย 100 รอบ
- [ ] Transaction ถัดไปที่ไม่ตั้งค่าเห็นศูนย์แถว
- [ ] ยืนยันบน Neon ว่า `app_tenant` มี `rolsuper = false` และ `rolbypassrls = false`
- [ ] ไม่มีข้อมูลจริงของ Shop ในการทดลอง
- [ ] บันทึกผลพร้อมตัวเลขสำหรับ Sprint Log และถ้าไม่ผ่านต้องมี ADR ใหม่ก่อนเริ่ม Sprint 2
