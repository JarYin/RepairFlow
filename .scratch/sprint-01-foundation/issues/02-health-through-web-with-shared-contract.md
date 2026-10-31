# 02: Health ผ่าน Web ด้วย contract ร่วม

**What to build:** นักพัฒนาเปิด Web ในเครื่องแล้วเรียก `/api/health` ผ่าน rewrite ได้เหมือน production โดย API และ Web ใช้ schema ชุดเดียวกันจาก `packages/contracts` และสร้าง OpenAPI จาก schema นั้น

**Blocked by:** 01

**Status:** resolved

- [x] `packages/contracts` อยู่ใน pnpm workspace และทั้ง API กับ Web import จริง
- [x] API ใช้ prefix `/api` และ `GET /api/health` คืนค่าตาม contract โดยไม่แตะฐานข้อมูล
- [x] Web ส่ง `/api/*` ไปยัง API ผ่าน rewrite โดยอ่านโดเมนของ API จาก environment variable
- [x] สร้างเอกสาร OpenAPI จาก Zod ได้ด้วยคำสั่งเดียว
- [x] เทสต์ Playwright เรียก `/api/health` ผ่านโดเมนของ Web และตรวจกับ schema ใน contract
- [x] โค้ดตัวอย่างจาก scaffold ที่ไม่ใช้แล้วถูกลบ

## Comments

- หน้าแรกของ Web แสดงสถานะ API ที่ตรวจกับ schema ใน contract เพื่อให้ Web import contract ในโค้ดจริง ไม่ใช่แค่ในเทสต์
- `next build` ล้มเหลวทันทีถ้าไม่ตั้ง `API_ORIGIN` ดังนั้น `pnpm build` ใน CI ต้องตั้งค่านี้ ส่วน `next dev` ใช้ `http://localhost:4000` เมื่อไม่ได้ตั้ง
- `pnpm openapi` เขียนไฟล์ไปที่ `packages/contracts/dist/openapi.json` ซึ่งไม่ถูก commit เพื่อไม่ให้เอกสารเก่ากว่า schema
