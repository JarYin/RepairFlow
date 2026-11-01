# RepairFlow

ระบบจัดการงานซ่อมสำหรับร้านซ่อม เป็น monorepo ที่มี API (NestJS) ใน `apps/api`, Web (Next.js) ใน `apps/web` และ contract ร่วมใน `packages/contracts` รายละเอียดอยู่ใน [docs/architecture.md](docs/architecture.md)

## Deploy

เมื่อ merge เข้า `main` workflow [`deploy.yml`](.github/workflows/deploy.yml) จะ deploy API, deploy Web แล้วรัน smoke test บนโดเมน production ตามลำดับ ถ้าขั้นใดล้มเหลวจะไม่ทำขั้นถัดไป และ GitHub จะแจ้งเตือนว่า workflow ล้มเหลว

> ยังไม่เคยรัน workflow นี้จริง ต้องตั้งค่าตามหัวข้อด้านล่างก่อน merge เข้า `main` ครั้งแรก

### โปรเจกต์บน Vercel

สร้างสองโปรเจกต์ และตั้งค่าใน Settings ของแต่ละโปรเจกต์:

| การตั้งค่า | API | Web |
|---|---|---|
| Root Directory | `apps/api` | `apps/web` |
| Include files outside the root directory | เปิด | เปิด |
| Git | ไม่เชื่อม repo | ไม่เชื่อม repo |
| Deployment Protection | โดเมน production ต้องเปิดได้โดยไม่ล็อกอิน | โดเมน production ต้องเปิดได้โดยไม่ล็อกอิน |

Framework, คำสั่ง install และ build อยู่ใน `vercel.json` ของแต่ละแอป ส่วนรุ่น Node อยู่ใน `engines` ของ `package.json` ไฟล์ `vercel.json` ปิด deployment จาก Git ไว้แล้วเผื่อมีการเชื่อม repo ภายหลัง จึงไม่มีทั้ง auto-deploy และ Preview Deployment จากการ push

### GitHub Environment `production`

สร้าง Environment ชื่อ `production` และจำกัด deployment branch ให้เป็น `main` เท่านั้น

| ชนิด | ชื่อ | ค่า |
|---|---|---|
| Secret | `VERCEL_TOKEN` | token ของบัญชี Vercel |
| Variable | `VERCEL_ORG_ID` | ID ของบัญชีหรือทีมบน Vercel |
| Variable | `VERCEL_API_PROJECT_ID` | Project ID ของ API |
| Variable | `VERCEL_WEB_PROJECT_ID` | Project ID ของ Web |
| Variable | `API_PRODUCTION_ORIGIN` | โดเมน production ของ API เช่น `https://<api>.vercel.app` ห้ามใช้ URL ของ deployment แต่ละครั้ง |
| Variable | `WEB_PRODUCTION_ORIGIN` | โดเมน production ของ Web เช่น `https://<web>.vercel.app` |

Web อ่าน `API_ORIGIN` ตอน build และ workflow เป็นผู้ส่งค่านี้ให้ ถ้ากด Redeploy ของ Web จาก dashboard ค่านี้จะไม่ติดไปด้วยและ build จะล้มเหลว ให้ใช้ Instant Rollback หรือ merge ใหม่แทน

### รัน smoke test เอง

```bash
SMOKE_BASE_URL=https://<web>.vercel.app pnpm test:smoke
```

## Rollback ด้วยมือ

> **ยังไม่เคยลองทำจริงบน production** ขั้นตอนนี้เขียนจากเอกสารของ Vercel ต้องซ้อมและแก้ให้ตรงกับที่เกิดขึ้นจริงก่อนจึงจะเชื่อถือได้

Rollback ย้อนเฉพาะโค้ด ไม่ย้อนฐานข้อมูล ทุก migration ต้องเข้ากันได้กับโค้ดเวอร์ชันก่อนหน้าอยู่แล้ว และถ้าข้อมูลพลาดให้เขียน migration ใหม่เพื่อแก้ไปข้างหน้า

1. ดูว่า workflow ล้มที่ขั้นใด แล้วย้อนเฉพาะโปรเจกต์ที่พัง ถ้าต้องย้อนทั้งคู่ให้ย้อน Web ก่อนแล้วจึงย้อน API ซึ่งกลับลำดับกับตอน deploy
2. เปิดโปรเจกต์บน Vercel กด **Instant Rollback** ที่ช่อง Production Deployment เลือก deployment ก่อนหน้า แล้วกด **Confirm Rollback** แผน Hobby ย้อนได้เฉพาะ deployment ก่อนหน้าเท่านั้น
3. ตรวจผลด้วย smoke test ตามคำสั่งด้านบน
4. แก้โค้ดผ่าน PR ตามปกติแล้ว merge

**สิ่งที่ต้องทำหลัง merge ตัวแก้:** หลัง rollback Vercel จะปิดการย้ายโดเมน production ไป deployment ใหม่โดยอัตโนมัติ ตัวแก้จึงอาจยังไม่ขึ้น production และ smoke test อาจผ่านเพราะยังทดสอบของเก่าอยู่ ให้เปิดโปรเจกต์ที่ย้อนไว้ กด **Undo Rollback** เลือก deployment ของตัวแก้ แล้วกด **Confirm** จากนั้นรัน smoke test อีกครั้ง

ใช้ CLI แทน dashboard ได้โดยรันจาก root ของ repo ด้วยรุ่นเดียวกับ `VERCEL_CLI_VERSION` ใน workflow และตั้ง `VERCEL_TOKEN`, `VERCEL_ORG_ID` กับ `VERCEL_PROJECT_ID` ของโปรเจกต์นั้นก่อน:

```bash
npx --yes vercel@65.9.0 list --environment production  # หา URL ของ deployment
npx --yes vercel@65.9.0 rollback <deployment-url>      # ย้อนไป deployment ก่อนหน้า
npx --yes vercel@65.9.0 promote <deployment-url>       # เทียบเท่า Undo Rollback
```

อ้างอิง: [Instant Rollback](https://vercel.com/docs/instant-rollback)
