# 05: Transaction ของ Shop บน Postgres

**What to build:** นักพัฒนาเปิด Postgres ในเครื่องได้ด้วยคำสั่งเดียว และมีวิธีรันงานใน transaction ของ Shop หนึ่งร้าน ซึ่ง CI พิสูจน์ทุก PR ว่าข้อมูลไม่รั่วข้าม Shop

**Blocked by:** 03

**Status:** ready-for-human

เจ้าของโปรเจกต์ต้องอ่านโค้ดทุกบรรทัดและอธิบายได้ว่าทำไมถึงถูก

- [ ] Docker Compose เปิด Postgres รุ่นหลักเดียวกับ Neon
- [x] รัน migration ในเครื่องได้ด้วยคำสั่งเดียว
- [x] Migration สร้าง `app_tenant` แบบไม่มีรหัสผ่าน และตารางทดลองที่เปิด RLS กับ `FORCE`
- [x] โมดูล `database` ใช้ `pg` Pool กับ `attachDatabasePool` และส่ง transaction ต่อผ่าน AsyncLocalStorage ตาม ADR-0002
- [x] CI รัน integration test กับ Postgres ใน container โดยไม่แตะ Neon
- [x] เทสต์: `app_tenant` มี `rolsuper = false` และ `rolbypassrls = false`
- [x] เทสต์: งานที่รันพร้อมกันเห็นเฉพาะแถวของ Shop ตนเอง
- [x] เทสต์: หลัง transaction จบ ค่า Shop ไม่ติดไปกับ connection ถัดไป
- [x] เทสต์: query ที่ไม่ได้ตั้งค่า Shop เห็นศูนย์แถว
- [x] เทสต์: error กลางงานทำให้ rollback ทุกอย่าง

## Comments

### ลำดับการอ่าน

1. `compose.yaml`: Postgres ในเครื่องไม่มีรหัสผ่าน และเปิดพอร์ตเฉพาะ `127.0.0.1` ดูว่ายอมรับ `trust` ได้ไหม
2. `apps/api/drizzle/0000_app_tenant_and_spike_table.sql`: role, `ENABLE`, `FORCE`, policy และเหตุผลที่ต้องมี `NULLIF`
3. `apps/api/src/database/database.service.ts`: `runInShopTransaction` และ `tx` ซึ่งเป็นแกนของตั๋วนี้
4. `apps/api/src/database/database.module.ts`: การสร้าง Pool, `attachDatabasePool` และ listener ของ `error`
5. `apps/api/test/shop-transaction.integration-spec.ts`: เทียบเทสต์กับกฎใน spec
6. `.github/workflows/ci.yml`, `apps/api/drizzle.config.ts`, `.env.example`: การรันใน CI และค่าเริ่มต้นที่ชี้เครื่องตัวเอง

### คำสั่ง

```text
pnpm db:up
pnpm db:migrate
pnpm test:integration
```

### ช่องที่ยังไม่ติ๊ก

- **รุ่น Postgres:** ใช้ `postgres:18-alpine` (ได้ 18.6) เพราะ [เอกสาร Neon CLI](https://neon.com/docs/cli/projects) ระบุว่าโปรเจกต์ใหม่ใช้ Postgres 18 เป็นค่าเริ่มต้น เจ้าของโปรเจกต์ต้องยืนยันว่าโปรเจกต์ Neon จริงเป็นรุ่น 18 ด้วย เพราะ Neon เปลี่ยนรุ่นหลักของโปรเจกต์ภายหลังไม่ได้

### หลักฐาน CI

[PR #3](https://github.com/JarYin/RepairFlow/pull/3) ปิดโดยไม่ merge และ `verify` ผ่านใน [run 41328988991](https://github.com/JarYin/RepairFlow/actions/runs/41328988991) ที่ commit `cf0461f` ขั้น `Integration tests` รันกับ Postgres ใน container และผ่าน 19 ข้อ workflow ไม่ใช้ secret

### เทสต์ `module-graph.spec.ts` ที่ล้มเหลวเป็นบางครั้ง

เทสต์นี้สร้าง process ของ dependency-cruiser ใหม่ทุกข้อ ใช้เวลาราว 1.2 วินาทีตอนเครื่องว่าง แต่ถึง 28 วินาทีเมื่อดิสก์และหน่วยความจำถูกแย่งใช้ จึงเกินค่าเริ่มต้น 5 วินาที ความล้มเหลวนี้มีอยู่แล้วที่ `7dbb3e5` และไม่เกี่ยวกับโมดูล `database` จึงตั้ง timeout 60 วินาทีเฉพาะ spec นี้

### ผลการทำให้พังโดยตั้งใจ

ทุกเทสต์ล็อกอินเป็น `app_tenant` ก่อนทำให้พังผ่าน 19 ข้อ และกลับมาผ่าน 19 ข้อหลังคืนค่า

| สิ่งที่ทำให้พัง | เทสต์ที่ล้มเหลว |
|---|---|
| ถอน `FORCE` | 1 ข้อ: ตรวจ catalog ว่าเปิด RLS และ `FORCE` |
| ปิด RLS | 8 ข้อ รวมการแยก Shop และ query ที่ไม่ตั้งค่า Shop |
| ให้ `BYPASSRLS` กับ `app_tenant` | 8 ข้อ รวมการตรวจ role |
| Policy ไม่มี `NULLIF` | 1 ข้อ: ค่า Shop หลัง transaction จบ |
| `SET` แทน `SET LOCAL` (`set_config(..., false)`) | 1 ข้อ: ค่า Shop หลัง transaction จบ |
| เก็บ transaction ใน field แทน AsyncLocalStorage | 3 ข้อ รวมงานที่รันพร้อมกัน |
| กลืน error จน transaction ถูก commit | 5 ข้อ รวม rollback |
| ไม่ปิด transaction สำหรับงานที่ค้างอยู่ | 1 ข้อ: งานที่ยังรันหลัง transaction จบ |
| ให้เทสต์ต่อเป็น superuser | 9 ข้อ รวมการตรวจ role |

การถอน `FORCE` เท่านั้นที่ `app_tenant` มองไม่เห็นจากพฤติกรรม เพราะ `FORCE` มีผลกับเจ้าของตาราง และ `app_tenant` ไม่ได้เป็นเจ้าของ เทสต์ข้อนี้จึงอ่าน catalog โดยตรง และครอบทุกตารางที่มี `shop_id` ตารางของ Sprint 2 จึงถูกตรวจด้วยอัตโนมัติ

### สิ่งที่พบระหว่างทำ

- **Process ล่มเมื่อ connection หลุด:** ถ้า connection หลุดระหว่าง transaction ตอนที่ไม่มี query ค้างอยู่ `pg` จะส่ง event `error` ที่ไม่มีใครรับ และทำให้ทั้ง process ล่ม จึงเพิ่ม listener และเทสต์ข้อนี้ โดยเห็นเทสต์ล้มเหลวก่อนแก้
- **`NULLIF` จำเป็นจริง:** หลังใช้ `SET LOCAL` บน connection หนึ่ง ค่าจะกลับมาเป็น `''` ไม่ใช่ null ถ้าไม่มี `NULLIF` query ถัดไปจะ error แทนที่จะเห็นศูนย์แถว

### สิ่งที่ควรตัดสินใจหรือรับทราบ

- **ยังไม่ได้ทดสอบบน Neon:** เอกสาร Neon ไม่ได้บอกชัดว่า `CREATE ROLE ... LOGIN` แบบไม่มีรหัสผ่านทำได้ไหม และ local migrate ด้วย superuser ส่วน Neon ใช้ Migration role ที่ไม่ใช่ superuser ต้องตรวจตอนทำตั๋ว 06
- **ห้ามสร้าง `app_tenant` จาก Neon Console:** role แบบนั้นมี `BYPASSRLS` ถ้ามี role นี้อยู่ก่อน migration จะล้มเหลวโดยตั้งใจ
- **`DatabaseModule` ยังไม่ถูก import ใน `AppModule`:** เพื่อให้ API ขึ้นได้โดยไม่ต้องมี `DATABASE_URL` จนกว่าตั๋ว 06 จะตั้งค่า โมดูล `spike` ของตั๋ว 08 จะเป็นผู้ import
- **เพิ่มจาก ticket:** การเรียกซ้อนสำหรับ Shop เดียวกันจะเข้าร่วม transaction เดิมตาม ADR-0002 ส่วน Shop อื่นจะถูกปฏิเสธ และ Shop id ที่ไม่ใช่ UUID จะถูกปฏิเสธก่อนเริ่มงาน
- **ข้อจำกัดที่เหลือ:** การปิดกั้นงานที่ค้างอยู่หลัง transaction จบมีผลเมื่ออ่านผ่าน `tx` เท่านั้น ถ้าโค้ดเก็บ handle ไว้ในตัวแปรเองจะไม่ถูกกั้น และถ้าคำสั่ง `ROLLBACK` เองล้มเหลว Drizzle จะโยน error ของ `ROLLBACK` แทน error เดิม
