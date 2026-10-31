# Sprint 1: เอกสารเริ่มต้นและการ deploy

Status: ready-for-agent

ช่วงเวลา: 2–15 พ.ย. 2569 ตาม Roadmap

## Problem Statement

RepairFlow มีการออกแบบครบแล้ว แต่ยังไม่มีอะไรพิสูจน์ว่าการออกแบบนั้นทำงานได้จริง โปรเจกต์ยังไม่อยู่ใน git, ไม่มี CI และไม่เคย deploy ขึ้น Vercel หรือ Neon

ถ้าเริ่มเขียนฟีเจอร์เลย นักพัฒนาอาจพบช้าเกินไปว่า `SET LOCAL` ใช้ผ่าน pooler ของ Neon ไม่ได้ ซึ่งจะทำให้ RLS ทั้งระบบต้องออกแบบใหม่ และ Sprint 2 ยังขาด Acceptance Criteria, ERD และ wireframe ที่ใช้กำหนดว่างานต้องเสร็จแค่ไหน

## Solution

เมื่อจบ Sprint นี้ นักพัฒนาจะมี repo แบบ public ที่ทุก PR ต้องผ่าน CI และเมื่อ merge เข้า `main` ระบบจะ migrate ฐานข้อมูล, deploy API, deploy Web และทำ smoke test บน production เองทั้งหมด

ความเสี่ยงทุกข้อในรายการทดลองจะมีผลลัพธ์จากการทดลองจริง ถ้าข้อใดไม่ผ่านจะมี ADR ใหม่ที่เปลี่ยนแผน และเอกสาร PRD, ERD และ wireframe จะพร้อมให้เริ่ม Sprint 2 ได้โดยไม่ต้องเดาขอบเขต

## User Stories

### Repo และความปลอดภัยของ repo

1. ในฐานะนักพัฒนา ฉันต้องการให้โปรเจกต์อยู่ใน git เพื่อให้ทุกการเปลี่ยนแปลงตรวจย้อนหลังได้
2. ในฐานะนักพัฒนา ฉันต้องการ repo แบบ public บน GitHub เพื่อให้ผู้ชม Portfolio เห็นโค้ดและวิธีทำงาน
3. ในฐานะนักพัฒนา ฉันต้องการสแกน secret ก่อน push ครั้งแรก เพื่อไม่ให้ความลับหลุดเข้า history ที่เป็น public
4. ในฐานะนักพัฒนา ฉันต้องการเปิด secret scanning และ push protection เพื่อให้ GitHub กันความลับใน commit หลังจากนั้น
5. ในฐานะนักพัฒนาคนใหม่ ฉันต้องการ `.env.example` เพื่อให้รู้ว่าต้องตั้งค่าอะไรโดยไม่ต้องเห็นค่าจริง
6. ในฐานะนักพัฒนา ฉันต้องการให้ไฟล์ที่ build สร้างขึ้นไม่ถูก commit เพื่อให้ history สะอาด
7. ในฐานะผู้ชม Portfolio ฉันต้องการเห็น `.scratch/` และ Sprint Log เพื่อเข้าใจว่าเจ้าของโปรเจกต์วางแผนงานอย่างไร

### การพัฒนาในเครื่อง

8. ในฐานะนักพัฒนา ฉันต้องการเปิด Postgres ด้วย Docker Compose คำสั่งเดียว เพื่อไม่ต้องติดตั้งหรือแตะ Neon ตอนพัฒนา
9. ในฐานะนักพัฒนา ฉันต้องการให้ Postgres ในเครื่องเป็นรุ่นหลักเดียวกับ Neon เพื่อให้ผลทดสอบตรงกับ production
10. ในฐานะนักพัฒนา ฉันต้องการรัน migration ในเครื่องด้วยคำสั่งเดียว เพื่อให้ฐานข้อมูลตรงกับโค้ดเสมอ
11. ในฐานะนักพัฒนา ฉันต้องการเรียก `/api/*` ผ่าน Web ในเครื่องเหมือน production เพื่อพบปัญหาของการ proxy ก่อน deploy

### Contract ร่วม

12. ในฐานะนักพัฒนา ฉันต้องการ `packages/contracts` ที่ทั้ง API และ Web ใช้ร่วมกัน เพื่อไม่ต้องเขียน type ซ้ำสองที่
13. ในฐานะนักพัฒนา ฉันต้องการสร้าง OpenAPI จาก Zod เพื่อให้เอกสาร API ตรงกับ schema ที่ใช้จริง

### CI

14. ในฐานะนักพัฒนา ฉันต้องการให้ทุก PR รัน lint, unit, integration, E2E, dependency-cruiser และ build image ของ API เพื่อให้รู้ปัญหาก่อน merge
15. ในฐานะนักพัฒนา ฉันต้องการให้ integration test ใช้ Postgres ใน container เพื่อไม่ให้ CI ปลุก Neon หรือกิน quota
16. ในฐานะเจ้าของ repo ฉันต้องการให้ CI ของ PR ทำงานได้โดยไม่มี secret เพื่อให้ PR จาก fork เข้าถึงความลับไม่ได้
17. ในฐานะเจ้าของ repo ฉันต้องการ branch protection เพื่อให้ merge เข้า `main` ได้เมื่อ CI ผ่านเท่านั้น

### CD

18. ในฐานะนักพัฒนา ฉันต้องการให้ merge เข้า `main` แล้วขึ้น production อัตโนมัติ เพื่อไม่ต้อง deploy เองทุกครั้ง
19. ในฐานะนักพัฒนา ฉันต้องการให้ migration เสร็จก่อนโค้ดใหม่ขึ้น เพื่อไม่ให้โค้ดเรียก schema ที่ยังไม่มี
20. ในฐานะนักพัฒนา ฉันต้องการให้ deploy หยุดทันทีเมื่อ migration ล้มเหลว เพื่อไม่ให้โค้ดใหม่ขึ้นบน schema เก่า
21. ในฐานะนักพัฒนา ฉันต้องการให้ deploy ทีละรอบตามลำดับที่ merge เพื่อไม่ให้ migration ทับกัน
22. ในฐานะเจ้าของ repo ฉันต้องการให้ secret ของ production ใช้ได้เฉพาะ job ที่รันจาก `main` เพื่อจำกัดความเสียหายถ้า workflow อื่นถูกแก้
23. ในฐานะนักพัฒนา ฉันต้องการ smoke test บน URL จริงหลัง deploy เพื่อรู้ทันทีว่า production พัง
24. ในฐานะนักพัฒนา ฉันต้องการให้ workflow ล้มเหลวเมื่อ smoke test ไม่ผ่าน เพื่อให้ GitHub แจ้งเตือนฉัน
25. ในฐานะนักพัฒนา ฉันต้องการขั้นตอน rollback ใน README เพื่อย้อนโค้ดได้เร็วโดยไม่ต้องคิดใหม่ตอนระบบพัง

### การทดลองบน production

26. ในฐานะนักพัฒนา ฉันต้องการยืนยันว่า API, Web และ `packages/contracts` deploy เป็น Vercel สองโปรเจกต์ได้ เพื่อให้โครงสร้าง monorepo ใช้ต่อได้
27. ในฐานะนักพัฒนา ฉันต้องการพิสูจน์ว่า `SET LOCAL` ผ่าน pooler ของ Neon ไม่รั่วข้าม request เพื่อให้เชื่อถือ RLS ได้
28. ในฐานะนักพัฒนา ฉันต้องการพิสูจน์ว่า cookie แบบ httpOnly และ `SameSite=Strict` ผ่าน proxy `/api/*` ได้ เพื่อให้ทำ auth ใน Sprint 2 ตามที่ออกแบบได้
29. ในฐานะนักพัฒนา ฉันต้องการวัด cold start ของ API เพื่อรู้ว่าผู้ชมเดโมต้องรอนานแค่ไหน
30. ในฐานะนักพัฒนา ฉันต้องการพิสูจน์ว่าอัปโหลดและอ่าน Blob แบบ private ผ่าน API ได้ และเปิดตรงจากภายนอกไม่ได้ เพื่อให้รูปของ Work Order ปลอดภัย
31. ในฐานะเจ้าของระบบ ฉันต้องการให้ endpoint สำหรับทดลองเรียกจากคนนอกไม่ได้ และถูกลบก่อนจบ Sprint เพื่อไม่ให้เหลือช่องโหว่บน production
32. ในฐานะนักพัฒนา ฉันต้องการมี ADR ใหม่ถ้าการทดลองข้อใดไม่ผ่าน เพื่อให้แผนสำรองถูกตัดสินใจอย่างมีเหตุผล

### เอกสารสำหรับ Sprint 2

33. ในฐานะนักพัฒนา ฉันต้องการ PRD ที่มี Acceptance Criteria ของ Workflow หลัก เพื่อรู้ว่าฟีเจอร์เสร็จเมื่อไร
34. ในฐานะนักพัฒนา ฉันต้องการทบทวนตารางสิทธิ์ใน `architecture.md` ตอนเขียน Acceptance Criteria เพื่อยืนยันแถวที่เป็นค่าอนุมาน
35. ในฐานะผู้ชม Portfolio ฉันต้องการเห็นว่าปัญหา 6 ข้อในเอกสารตั้งต้นถูกพิสูจน์ด้วยสถานการณ์ใด เพื่อดูว่าระบบแก้ปัญหาได้จริงแม้ไม่มีผู้ใช้จริง
36. ในฐานะนักพัฒนา ฉันต้องการ Test Plan แบบสั้นที่อ้างตารางความล้มเหลวเดิม เพื่อไม่ต้องดูแลรายการเดียวกันสองที่
37. ในฐานะนักพัฒนา ฉันต้องการ ERD ที่ครอบคลุมทุกโมดูล เพื่อเห็น `shop_id` และ composite foreign key ก่อนสร้าง schema ใน Sprint 2
38. ในฐานะนักพัฒนา ฉันต้องการ wireframe แบบหยาบของหน้าหลัก เพื่อตกลงลำดับการใช้งานก่อนเขียน UI
39. ในฐานะนักพัฒนา ฉันต้องการเขียน Sprint Log พร้อมเวลาที่ใช้จริง เพื่อเทียบกับ 20 ชั่วโมงต่อสัปดาห์และปรับแผนจากตัวเลขจริง

## Implementation Decisions

### โครงสร้าง

- เพิ่ม `packages/contracts` เข้า pnpm workspace โดยใช้ Zod เป็นแหล่งเดียวของ schema และสร้าง OpenAPI จากที่นี่
- Contract แรกคือคำตอบของ health endpoint ซึ่งทั้ง API และ Web ต้อง import จริง เพื่อพิสูจน์ว่า workspace dependency ทำงานบน Vercel
- API ใช้ prefix `/api` เพื่อให้ path เหมือนกันทั้งตอนเรียกผ่าน Web และเรียกโดยตรง
- เพิ่มกฎ dependency-cruiser ตั้งแต่ตอนนี้ แม้ยังมีโมดูลน้อย เพื่อให้ CI บังคับกราฟได้ตั้งแต่โมดูลแรกของ Sprint 2

### โมดูลของ API

- **`health`:** `GET /api/health` คืนสถานะตาม contract และไม่แตะฐานข้อมูล เพื่อไม่ให้คนนอกปลุก Neon จนกิน quota
- **`database`:** จัดการ `pg` Pool กับ `attachDatabasePool` และมี interface หลักคือ "รันงานใน transaction ของ Shop หนึ่งร้าน" ซึ่งทำ `BEGIN`, `SET LOCAL`, งาน และ `COMMIT` หรือ rollback โดยส่ง transaction ต่อผ่าน AsyncLocalStorage ตาม ADR-0002 โมดูลนี้ใช้ต่อใน Sprint 2 ไม่ใช่โค้ดทิ้ง
- **`spike`:** endpoint สำหรับทดลอง SET LOCAL, cookie และ Blob ใช้ชั่วคราวและลบก่อนจบ Sprint

### กติกาของ `spike`

- เปิดเมื่อตั้ง environment flag เท่านั้น ถ้าไม่ตั้ง จะไม่ลงทะเบียน route เลย
- ทุก endpoint ต้องส่ง header ที่มีค่าลับตรงกับ environment variable ซึ่งเก็บเป็น secret และเทียบแบบ constant-time
- ไม่แตะข้อมูลจริง และใช้ตารางทดลองที่ไม่มีข้อมูลของ Shop
- การลบต้องทำผ่าน PR ปกติ พร้อม migration ที่ลบตารางทดลอง ซึ่งเป็นการพิสูจน์ pipeline ไปด้วย

### เกณฑ์ของการทดลอง

| การทดลอง | ผ่านเมื่อ |
|---|---|
| Monorepo บน Vercel สองโปรเจกต์ | API และ Web ที่ import `packages/contracts` deploy สำเร็จจาก commit เดียวกัน |
| `SET LOCAL` ผ่าน pooler | คำขอพร้อมกันหลายคำขอด้วยค่า Shop ต่างกันเห็นเฉพาะแถวของตนภายใต้ `FORCE` RLS และ transaction ถัดไปที่ไม่ตั้งค่าเห็นศูนย์แถว ทดสอบซ้ำอย่างน้อย 100 รอบ |
| Role ของแอป | `app_tenant` มี `rolsuper = false` และ `rolbypassrls = false` |
| Cookie ผ่าน proxy | browser ได้ cookie แบบ httpOnly, Secure และ `SameSite=Strict` จากโดเมนของ Web และส่งกลับถึง API ใน request ถัดไป |
| Cold start | ค่ากลางของการเรียกครั้งแรกหลังไม่มี traffic 5 ครั้ง ไม่เกิน 10 วินาที ค่า 10 วินาทีเป็นเกณฑ์ที่ตั้งเองจากการที่แผนสำรองช้าราว 1 นาที |
| Blob แบบ private | อัปโหลดและอ่านผ่าน API ได้ และ URL ของ Blob เปิดตรงไม่ได้ |
| Deploy จาก GitHub Actions | PR ตัวอย่าง merge แล้วขึ้น production ครบทุกขั้นโดยไม่มีคนสั่ง และ push เข้า `main` ไม่ทำให้ Vercel สร้าง deployment เอง |

บันทึกผลพร้อมตัวเลขใน Sprint Log และติ๊กรายการใน `architecture.md` ถ้าข้อใดไม่ผ่าน ต้องเขียน ADR ใหม่ และถ้า API บน Vercel ใช้ไม่ได้ ให้ใช้ Render Free แทนตาม ADR-0008

### ฐานข้อมูลและ migration

- ใช้ Drizzle สร้าง migration ส่วน schema จริงเริ่มใน Sprint 2 Sprint นี้มีเฉพาะ `app_tenant` และตารางทดลอง
- CI ใช้ connection แบบตรงของ Neon ด้วย Migration role ตอน migrate ส่วนแอปใช้ pooler ด้วย `app_tenant`
- Migration ใน repo สร้าง role แบบไม่มีรหัสผ่านเท่านั้น เพราะ repo เป็น public รหัสผ่านตั้งใน Neon Console และเก็บเป็น secret
- ทุก migration ต้องเข้ากันได้กับโค้ดเวอร์ชันก่อนหน้า และไม่มี down migration

### CI ของ PR

- รัน lint, unit, integration กับ Postgres ใน container, Playwright, dependency-cruiser และ build image ของ API
- ไม่ใช้ secret, ไม่ใช้ `pull_request_target`, ตั้ง permission ของ token เป็นอ่านอย่างเดียว และตรึงเวอร์ชันของ Actions ด้วย commit SHA
- ติดตั้ง dependency จาก lockfile แบบห้ามแก้
- ไม่มี Preview Deployment

### CD เมื่อ merge เข้า `main`

ลำดับคือ migrate, deploy API, deploy Web และ smoke test ถ้าขั้นใดล้มเหลวจะไม่ทำขั้นถัดไป

- ปิด auto-deploy ของ Vercel และสั่ง deploy จาก GitHub Actions ด้วย Vercel CLI ที่ตรึงเวอร์ชัน
- ใช้ concurrency group เพื่อให้ deploy ทีละรอบตามลำดับ โดยไม่ยกเลิกรอบที่กำลังทำ
- Secret ของ production อยู่ใน GitHub Environment `production` ที่อนุญาตเฉพาะ `main`
- Web อ่านโดเมน production ของ API จาก environment variable ตอน build และใช้ rewrite ส่ง `/api/*` ไปที่โดเมนนั้น ไม่ใช้ URL ของ deployment แต่ละครั้ง
- Smoke test เรียก `/api/health` ผ่านโดเมนของ Web และเปิดหน้าแรกของ Web
- Rollback ทำด้วยมือผ่าน Vercel ตามขั้นตอนใน README

### เอกสาร

- **PRD:** ปัญหา, ผู้ใช้, ขอบเขต MVP, User Stories, Acceptance Criteria ของ Workflow หลัก, ตารางผูกปัญหา 6 ข้อกับสถานการณ์ทดสอบ และ Test Plan แบบสั้น
- **ERD:** Mermaid ครอบคลุมทุกโมดูล แสดง `shop_id` และ composite foreign key
- **Wireframe:** แบบหยาบ 6 หน้า ได้แก่ รายการ Work Order, เปิด Work Order, รายละเอียด Work Order, คลังอะไหล่, Customer Portal และ Dashboard โดยเก็บไว้ใน repo และเปิดดูได้โดยไม่ต้องใช้เครื่องมือเฉพาะ
- **API Contract:** ใช้ OpenAPI ที่สร้างจาก Zod ไม่เขียนมือ
- **Sprint Log:** บันทึกตามหัวข้อใน Roadmap เพิ่มเวลาที่ใช้จริง และอัปเดตสถานะใน Roadmap

## Testing Decisions

เทสต์ที่ดีตรวจพฤติกรรมที่มองเห็นจากภายนอก ไม่ตรวจรายละเอียดภายใน เช่น ตรวจว่า transaction ของอีกร้านเห็นศูนย์แถว ไม่ใช่ตรวจว่าเรียก `SET LOCAL` กี่ครั้ง

มี 2 จุดทดสอบ:

**1. HTTP ผ่าน `/api/*` ของ Web**

เป็นจุดเดียวกันทั้งในเครื่อง, CI และ production ต่างกันแค่ URL

- Playwright ใน CI เปิด Web แล้วเรียก `/api/health` ผ่าน rewrite และตรวจกับ schema ใน contract
- Smoke test ทำแบบเดียวกันบน URL จริงหลัง deploy
- การทดลองบน production ใช้จุดนี้ทั้งหมดเพื่อให้ผลตรงกับเส้นทางจริงของผู้ใช้

**2. Interface "รันงานใน transaction ของ Shop" ของโมดูล `database`**

ใช้ integration test กับ Postgres ใน container ด้วย role `app_tenant` เพราะ CI ของ PR ไม่แตะ Neon จึงตรวจกฎเหล่านี้ได้ทุก PR

- `app_tenant` ไม่มี `rolsuper` และ `rolbypassrls`
- งานใน transaction เห็นเฉพาะแถวของ Shop ตนเอง แม้รันพร้อมกัน
- หลัง transaction จบ ค่า Shop ไม่ติดไปกับ connection ถัดไป
- query ที่ไม่ได้ตั้งค่า Shop เห็นศูนย์แถว
- error กลางงานทำให้ rollback ทุกอย่าง

เทสต์ของ `spike` จะถูกลบไปพร้อมโมดูล ส่วนเทสต์ของ `health` และ `database` ใช้ต่อ

**แบบอย่างที่มีอยู่:** unit test ของ controller และ e2e test ด้วย supertest ใน `apps/api` ที่มากับ scaffold ส่วน `apps/web` ยังไม่มีเทสต์ และ integration test กับ Postgres จริงกับ Playwright เป็นของใหม่

## Out of Scope

- Schema จริงของ Shop, User, Work Order และโมดูลธุรกิจทั้งหมด
- Authentication จริง, หน้าล็อกอิน และ `app_platform`, `app_system`
- UI จริงและการตั้ง shadcn/ui เว้นแต่จำเป็นต่อการทดลอง
- Vercel Cron และ Demo Shop
- Preview Deployment และฐานข้อมูลแยกต่อ PR
- การ rollback อัตโนมัติ
- Cloudflare และ Turnstile
- โดเมนของตัวเอง

## Further Notes

- **งานที่ต้องให้เจ้าของโปรเจกต์ทำเอง:** สมัครหรือเชื่อมบัญชี Vercel และ Neon, ออก `VERCEL_TOKEN`, ตั้งรหัสผ่าน role และยืนยันการสร้าง repo แบบ public ส่วน GitHub CLI ในเครื่องล็อกอินเป็น `JarYin` แล้ว
- **ข้อจำกัดการ bootstrap:** push แรกต้องเกิดก่อนตั้ง branch protection จึงต้องสแกน secret ในเครื่องก่อน push
- **Label ของ issue ย่อย:** ถึง spec นี้จะเป็น `ready-for-agent` แต่งานของโมดูล `database` และ migration ของ role ต้องเป็น `ready-for-human` ตามระดับการตรวจใน Roadmap
- **ความต่างจาก `architecture.md`:** เอกสารระบุว่า smoke test เปิดหน้าล็อกอิน แต่ Sprint นี้ยังไม่มีหน้านั้น จึงเปิดหน้าแรกไปก่อน และเปลี่ยนเป็นหน้าล็อกอินใน Sprint 2
- **Cookie:** ยังคงการทดลองนี้ไว้ เพราะยังไม่ยืนยันว่าการ deploy ที่เจ้าของโปรเจกต์เคยทำรวมการล็อกอินด้วย httpOnly cookie ถ้ายืนยันได้ให้ตัดข้อนี้ออก
- **`.gitignore`:** ยังไม่ครอบคลุม `*.tsbuildinfo` ซึ่งมีไฟล์อยู่ใน `apps/api` ต้องเพิ่มก่อน commit แรก
- **เครื่องมือ:** Docker มีในเครื่องแล้ว ส่วน Vercel CLI ยังไม่ได้ติดตั้ง

ไม่มีข้อที่ขัดกับ ADR
