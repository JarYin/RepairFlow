# Sprint 0: ออกแบบและวางแผน

สิ้นสุดวันที่ 31 ต.ค. 2569 ก่อนเริ่มแผน 12 สัปดาห์

## เป้าหมาย

ตั้ง monorepo และตัดสินใจเรื่องสถาปัตยกรรมให้ครบ เพื่อให้ Sprint 1 เริ่มพิสูจน์ของจริงได้

## สิ่งที่เสร็จ

| งาน | หลักฐาน |
|---|---|
| Monorepo ของ NestJS และ Next.js ด้วย pnpm workspace | [`apps/api`](../../apps/api), [`apps/web`](../../apps/web) |
| เอกสารสถาปัตยกรรม | [architecture.md](../architecture.md) |
| ภาษากลางของ domain | [GLOSSARY.md](../../GLOSSARY.md) |
| การตัดสินใจหลัก 9 เรื่อง | [ADR 0001–0009](../adr/) |
| ค้นคว้าเรื่องคลังอะไหล่และ hosting ฟรี | [ผลการค้นคว้า](../research/inventory-and-free-hosting.md) |
| แผน 6 Sprint | [roadmap.md](../roadmap.md) |

ทั้งหมดเป็นการออกแบบ ยังไม่มีหลักฐานจากการรันบน production

## สิ่งที่ไม่เสร็จ

งานเหล่านี้อยู่ใน Sprint 1 ตามแผน ไม่ใช่งานล่าช้า

- ยังไม่ได้ `git init` จึงยังไม่มี repo, CI และ git history
- ยังไม่มีการ deploy หรือสร้าง DB role จริงบน provider ใด
- ยังไม่มี `packages/contracts`, schema และ business logic
- ยังไม่มี PRD, ERD และ wireframe

## Bug ที่น่าสนใจ

**pnpm install และ build ล้มเหลวด้วย `ERR_PNPM_IGNORED_BUILDS`:** `unrs-resolver` มี build script ที่ pnpm ไม่อนุญาตให้รันโดยไม่ระบุ แก้โดยตั้ง `allowBuilds: unrs-resolver: false` ใน `pnpm-workspace.yaml` ระหว่างแก้เกิด key ซ้ำเพราะ pnpm เติมค่าไว้ก่อนแล้ว จึงต้องเขียนไฟล์ใหม่

## จุดที่ตรวจแล้วแก้สิ่งที่ AI เสนอ

| AI เสนอ | สิ่งที่แย้ง | ผลลัพธ์ |
|---|---|---|
| ตัดสต็อกตอนช่างเบิก | ถ้าตัดตอนเบิกจริงจะแย่งอะไหล่กันหรือไม่ และยังไม่ครอบคลุมอะไหล่เสีย | จองตอน Approval และแยกยอดตามสถานะ ([ADR-0005](../adr/0005-stock-buckets-reservation-and-conditional-update.md)) |
| API อยู่บน Render Free | ให้ API อยู่บน Vercel ด้วย | เลี่ยงการตื่นราว 1 นาทีของ Render และเก็บไว้เป็นแผนสำรอง ([ADR-0008](../adr/0008-free-deployment-on-vercel-and-neon.md)) |
| ใช้อีเมลในบางขั้นตอน | ตัดอีเมลออกทั้งหมด | แจ้งเตือนในแอปเท่านั้น ([ADR-0006](../adr/0006-in-app-notifications-only.md)) และต้องเปลี่ยนจากบัญชีกลางเป็นบัญชีต่อร้าน เพราะไม่มีอีเมลยืนยัน ([ADR-0003](../adr/0003-per-shop-user-accounts.md)) |

บางจุดเป็น AI ที่แย้งกลับ:

- **ความปลอดภัยของ JWT:** JWT ไม่ได้กัน CSRF ได้ด้วยตัวเอง จึงใช้ httpOnly cookie ร่วมกับ `SameSite=Strict`, การตรวจ Origin และ CSRF token ([ADR-0004](../adr/0004-jwt-in-httponly-cookies-checked-against-db.md))
- **หน้าชำระเงินจำลอง:** หน้าที่เลียนแบบ Stripe อาจถูกมองเป็น phishing จึงทำเป็นหน้าสาธิตของ RepairFlow เอง ([ADR-0007](../adr/0007-simulated-subscription-payments.md))
- **ลำดับงานใน Roadmap:** ร่างแรกวาง Audit Log ไว้ Sprint 5 ซึ่งขัดกับกฎที่ต้องเขียนใน transaction เดียวกับทุกงาน จึงย้ายโมดูลมา Sprint 2

## สิ่งที่จะปรับใน Sprint ถัดไป

- พิสูจน์ความเสี่ยงของการ deploy ก่อนเขียนฟีเจอร์
- เริ่มเก็บเวลาที่ใช้จริง เพื่อเทียบกับที่คาดไว้ 20 ชั่วโมงต่อสัปดาห์ และดูว่า AI ช่วยให้เร็วขึ้นแค่ไหน
