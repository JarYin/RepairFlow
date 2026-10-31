# 05: Transaction ของ Shop บน Postgres

**What to build:** นักพัฒนาเปิด Postgres ในเครื่องได้ด้วยคำสั่งเดียว และมีวิธีรันงานใน transaction ของ Shop หนึ่งร้าน ซึ่ง CI พิสูจน์ทุก PR ว่าข้อมูลไม่รั่วข้าม Shop

**Blocked by:** 03

**Status:** ready-for-human

เจ้าของโปรเจกต์ต้องอ่านโค้ดทุกบรรทัดและอธิบายได้ว่าทำไมถึงถูก

- [ ] Docker Compose เปิด Postgres รุ่นหลักเดียวกับ Neon
- [ ] รัน migration ในเครื่องได้ด้วยคำสั่งเดียว
- [ ] Migration สร้าง `app_tenant` แบบไม่มีรหัสผ่าน และตารางทดลองที่เปิด RLS กับ `FORCE`
- [ ] โมดูล `database` ใช้ `pg` Pool กับ `attachDatabasePool` และส่ง transaction ต่อผ่าน AsyncLocalStorage ตาม ADR-0002
- [ ] CI รัน integration test กับ Postgres ใน container โดยไม่แตะ Neon
- [ ] เทสต์: `app_tenant` มี `rolsuper = false` และ `rolbypassrls = false`
- [ ] เทสต์: งานที่รันพร้อมกันเห็นเฉพาะแถวของ Shop ตนเอง
- [ ] เทสต์: หลัง transaction จบ ค่า Shop ไม่ติดไปกับ connection ถัดไป
- [ ] เทสต์: query ที่ไม่ได้ตั้งค่า Shop เห็นศูนย์แถว
- [ ] เทสต์: error กลางงานทำให้ rollback ทุกอย่าง
