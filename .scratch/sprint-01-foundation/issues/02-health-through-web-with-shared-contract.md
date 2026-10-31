# 02: Health ผ่าน Web ด้วย contract ร่วม

**What to build:** นักพัฒนาเปิด Web ในเครื่องแล้วเรียก `/api/health` ผ่าน rewrite ได้เหมือน production โดย API และ Web ใช้ schema ชุดเดียวกันจาก `packages/contracts` และสร้าง OpenAPI จาก schema นั้น

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] `packages/contracts` อยู่ใน pnpm workspace และทั้ง API กับ Web import จริง
- [ ] API ใช้ prefix `/api` และ `GET /api/health` คืนค่าตาม contract โดยไม่แตะฐานข้อมูล
- [ ] Web ส่ง `/api/*` ไปยัง API ผ่าน rewrite โดยอ่านโดเมนของ API จาก environment variable
- [ ] สร้างเอกสาร OpenAPI จาก Zod ได้ด้วยคำสั่งเดียว
- [ ] เทสต์ Playwright เรียก `/api/health` ผ่านโดเมนของ Web และตรวจกับ schema ใน contract
- [ ] โค้ดตัวอย่างจาก scaffold ที่ไม่ใช้แล้วถูกลบ
