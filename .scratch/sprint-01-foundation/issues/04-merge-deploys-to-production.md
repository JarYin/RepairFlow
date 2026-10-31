# 04: Merge แล้วขึ้น production

**What to build:** เมื่อ merge เข้า `main` API และ Web จะขึ้น production บน Vercel สองโปรเจกต์เองตามลำดับ แล้วตรวจด้วย smoke test บน URL จริง ถ้าพังจะมีการแจ้งเตือนและมีขั้นตอนย้อนกลับชัดเจน

**Blocked by:** 03

**Status:** ready-for-agent

ต้องการบัญชี Vercel และ `VERCEL_TOKEN` จากเจ้าของโปรเจกต์

- [ ] API และ Web ที่ import `packages/contracts` deploy สำเร็จจาก commit เดียวกัน
- [ ] Deploy API ก่อน Web และถ้าขั้นใดล้มเหลวจะไม่ทำขั้นถัดไป
- [ ] Web ส่ง `/api/*` ไปยังโดเมน production ของ API ไม่ใช่ URL ของ deployment แต่ละครั้ง
- [ ] Push เข้า `main` ไม่ทำให้ Vercel สร้าง deployment เอง และไม่มี Preview Deployment
- [ ] Deploy ทีละรอบตามลำดับที่ merge โดยไม่ยกเลิกรอบที่กำลังทำ
- [ ] Secret อยู่ใน GitHub Environment `production` ที่อนุญาตเฉพาะ `main` และใช้ Vercel CLI ที่ตรึงเวอร์ชัน
- [ ] Smoke test เรียก `/api/health` ผ่านโดเมนของ Web และเปิดหน้าแรกของ Web
- [ ] ถ้า smoke test ไม่ผ่าน workflow จะล้มเหลว
- [ ] README มีขั้นตอน rollback ด้วยมือที่ลองทำจริงแล้ว
