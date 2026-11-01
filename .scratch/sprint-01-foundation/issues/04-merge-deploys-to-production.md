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

## Comments

**สถานะ:** โค้ดและ config เสร็จเท่าที่ทำได้โดยไม่มีบัญชี Vercel ยังไม่มีการ deploy จริง ไม่มีการ merge เข้า `main` จึงยังไม่ติ๊กรายการใดเลย และยังไม่มีข้อใดยืนยันได้ว่าใช้งานได้บน production

**สิ่งที่ทำแล้ว:** `.github/workflows/deploy.yml`, `apps/api/vercel.json`, `apps/web/vercel.json`, smoke test ใน `apps/web/smoke` และ `README.md`

**สิ่งที่ตรวจในเครื่องแล้ว (ไม่ใช่หลักฐานของ production):**

- Smoke test ผ่านกับ stack ในเครื่อง, ล้มเหลวเมื่อปิด API (`/api/health` ตอบ 500) และล้มเหลวเมื่อ API ตอบ 200 แต่ผิด contract (`{"status":"down"}`) โดยทุกกรณีที่ล้มเหลวจบด้วย exit code 1
- `actionlint` 1.7.12 ผ่านทั้งสอง workflow ยกเว้นข้อเดียวคือไม่รู้จัก `queue: max` ของ `concurrency` เอกสารของ GitHub ระบุ key นี้ไว้ จึงเก็บไว้ แต่ GitHub ยังไม่เคยตรวจไฟล์นี้จริง
- `vercel build` รุ่น 65.9.0 แบบ offline บน Linux ด้วย project settings สมมติ: build ได้ทั้ง API และ Web ด้วย pnpm 11.18.0 และ Node 24, rewrite ของ Web ชี้ไปที่ `API_ORIGIN` ที่ส่งให้, Web build ไม่ผ่านถ้าไม่มี `API_ORIGIN` และ function ของ API ตอบ `/api/health` ได้เมื่อรันจากไฟล์ที่ trace ไว้ด้วย `node` ธรรมดา ไม่ใช่ runtime ของ Vercel

**สิ่งที่เหลือ:**

1. เจ้าของโปรเจกต์สร้างโปรเจกต์ Vercel สองโปรเจกต์และ GitHub Environment `production` ตาม README
2. อนุมัติและ merge เข้า `main` เพื่อให้ workflow รันจริงครั้งแรก
3. ยืนยันบน production ทีละข้อตามรายการด้านบน รวมถึงว่า `queue: max` ใช้ได้จริงและ deploy เรียงตามลำดับ merge
4. ตรวจว่า `--build-env ENABLE_EXPERIMENTAL_COREPACK=1` ทำให้ build บนเครื่องของ Vercel ใช้ pnpm ตาม `packageManager` จริง
5. ซ้อม rollback บน production แล้วแก้ README ให้ตรงกับที่เกิดขึ้น โดยเฉพาะข้อที่ว่าหลัง rollback การ deploy ด้วย `--prod` จะไม่ย้ายโดเมนจนกว่าจะกด Undo Rollback ซึ่งเอกสารของ Vercel พูดถึงการ push แต่ยังไม่ยืนยันกับ CLI
6. ตั๋ว 06 เพิ่มขั้น migrate ตรงจุดที่มี comment ไว้ก่อน `Deploy API`

**เรื่องที่ควรรู้:**

- ถ้า merge เข้า `main` ก่อนตั้งค่าครบ workflow จะหยุดที่ขั้นตรวจค่าก่อนแตะ Vercel แต่ GitHub จะสร้าง Environment `production` ให้เองโดยไม่มีกฎจำกัด branch จึงควรตั้งค่าก่อน merge
- `API_ORIGIN` ส่งจาก workflow ตอน build ปุ่ม Redeploy ของ Web บน dashboard จึง build ไม่ผ่าน ซึ่งเขียนไว้ใน README แล้ว
- `test/module-graph.spec.ts` ล้มเหลว 2 เทสต์ครั้งหนึ่งตอนเครื่องกำลัง build ใน Docker และผ่านเมื่อเครื่องว่าง สาเหตุน่าจะเป็น timeout 5 วินาทีของ vitest แต่ยังไม่ได้พิสูจน์ และไม่ได้แก้ในตั๋วนี้
