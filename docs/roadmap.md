# RepairFlow Roadmap

เอกสารนี้บอกว่าแต่ละ Sprint ต้องส่งมอบอะไรและวิธีทำงาน โดยใช้แทนแผน 12 สัปดาห์ใน [เอกสารตั้งต้น](RepairFlow-Portfolio-Project.md) ส่วนการออกแบบระบบอยู่ใน [architecture.md](architecture.md) และสิ่งที่ทำไปแล้วอยู่ใน [Sprint Log](sprints/)

## แผน

เริ่มวันที่ 2 พ.ย. 2569 และจบวันที่ 24 ม.ค. 2570 มี 6 Sprint ยาว Sprint ละ 2 สัปดาห์ โดยคาดว่าลงเวลาประมาณ 20 ชั่วโมงต่อสัปดาห์

| Sprint | ช่วงเวลา | เป้าหมาย | สถานะ |
|---|---|---|---|
| [0](sprints/sprint-00.md) | ก่อนเริ่มแผน | ออกแบบสถาปัตยกรรมและวางแผน | เสร็จ |
| 1 | 2–15 พ.ย. 2569 | เอกสารเริ่มต้นครบ และพิสูจน์ว่า deploy ได้จริง | ยังไม่เริ่ม |
| 2 | 16–29 พ.ย. 2569 | สมัครร้าน ล็อกอิน และเปิด Work Order ได้ | ยังไม่เริ่ม |
| 3 | 30 พ.ย.–13 ธ.ค. 2569 | จัดการอะไหล่ได้ถูกต้องแม้มีคำขอพร้อมกัน | ยังไม่เริ่ม |
| 4 | 14–27 ธ.ค. 2569 | Work Order เดินจบตั้งแต่รับเครื่องจนส่งคืน | ยังไม่เริ่ม |
| 5 | 28 ธ.ค. 2569–10 ม.ค. 2570 | ผู้จัดการเห็นภาพรวม และมีวงจร Subscription | ยังไม่เริ่ม |
| 6 | 11–24 ม.ค. 2570 | ระบบพร้อมเปิดให้ทดลองและนำเสนอ | ยังไม่เริ่ม |

ทุก Sprint ตั้งแต่ Sprint 2 เป็นต้นไปต้องมีผลงานที่ใช้งานได้จริงบน Vercel รายละเอียดของงานจะแตกเป็น issue ตอนเริ่ม Sprint นั้น จึงเปลี่ยนได้ตามสิ่งที่เรียนรู้ระหว่างทาง

## รายละเอียดแต่ละ Sprint

### Sprint 1: เอกสารเริ่มต้นและการ deploy

- เขียน `docs/prd.md` ที่มี Acceptance Criteria ของ Workflow หลัก และ Test Plan แบบสั้นที่อ้าง[ตารางความล้มเหลว](architecture.md#การรับมือความล้มเหลว)
- ผูกปัญหา 6 ข้อในเอกสารตั้งต้นกับสถานการณ์ทดสอบที่พิสูจน์ได้ เพราะไม่มีผู้ใช้จริงให้วัดผล
- เขียน `docs/erd.md` ด้วย Mermaid
- ทำ wireframe แบบหยาบเฉพาะหน้าหลักราว 6 หน้า
- สร้าง GitHub repo แบบ public พร้อม `.env.example` และ secret scanning ตั้งแต่ commit แรก
- ตั้ง Docker Compose สำหรับ Postgres ในเครื่อง
- สร้าง `packages/contracts` และให้ OpenAPI สร้างจาก Zod
- ตั้ง [CI/CD](architecture.md#delivery) ให้ merge เข้า `main` แล้วขึ้น production อัตโนมัติ

**จบเมื่อ:** ทุกข้อใน[รายการทดลอง](architecture.md#ความเสี่ยงและสิ่งที่ต้องทดลอง)ผ่าน หรือมี ADR ใหม่ที่เปลี่ยนแผน และ PR ตัวอย่างขึ้น production ได้จนผ่าน smoke test

### Sprint 2: ร้าน ผู้ใช้ และ Work Order

- สร้าง schema พร้อม `shop_id`, RLS และ DB role ตาม [ADR-0001](adr/0001-shared-schema-multi-tenancy-with-rls.md)
- ทำการสมัครร้านพร้อมตัวจำกัดการสมัคร, ลิงก์เชิญ, recovery codes และ auth ตาม [ADR-0004](adr/0004-jwt-in-httponly-cookies-checked-against-db.md)
- ทำ request flow ที่ตรวจสถานะร้าน และ policy ตามบทบาท
- สร้างโมดูล `audit-logs` เพื่อให้ทุกโมดูลเขียนได้ตั้งแต่แรก
- ทำ Customer, Device, Work Order, การเปลี่ยนสถานะ, Status History, การมอบหมายช่าง, รูปภาพ, การค้นหาและกรอง

**จบเมื่อ:** พนักงานสองร้านใช้งานพร้อมกันบน URL จริงได้โดยเห็นข้อมูลข้ามร้านไม่ได้ มีเทสต์ RLS และเทสต์สิทธิ์แบบ matrix และการเปลี่ยนสถานะที่ผิดกฎถูกปฏิเสธ

### Sprint 3: อะไหล่และ transaction

- ทำรายการ Part, การรับเข้า, ยอดตามสถานะ และประวัติ Stock Movement
- ทำ Reservation, Issue, Return, Part Request และอะไหล่เสีย
- สร้างโมดูล `notifications` เพราะการจัดสรรอะไหล่จาก Part Request ต้องแจ้งเตือน
- ทำ `Idempotency-Key` และการจัดการ deadlock

Approval ที่เป็นตัวสั่งจองอะไหล่จะมาใน Sprint 4 ดังนั้น Sprint นี้พิสูจน์การจองด้วย integration test ส่วนหน้าจอจัดการคลัง การรับเข้า และอะไหล่เสียใช้งานได้บน URL จริง

**จบเมื่อ:** ทุกกรณีใน[ตารางความล้มเหลว](architecture.md#การรับมือความล้มเหลว)เป็น integration test ที่ผ่านกับ Postgres จริง และยอดคงเหลือตรงกับผลรวมของ Stock Movement

### Sprint 4: Quotation, Portal และ Payment

- ทำ Quotation ที่ส่งแล้วแก้ไม่ได้, การหมดอายุ และการออกฉบับใหม่
- ทำ Approval เป็น transaction เดียวที่จองอะไหล่และเปลี่ยนสถานะงาน
- ทำ Customer Portal, ลิงก์เชิญ Customer และ Customer Contact Task
- ทำหน้าจอ Issue ต่อจาก Approval
- ทำการบันทึก Payment, Outstanding Balance และการส่งเครื่องคืน

**จบเมื่อ:** Work Order เดินจาก RECEIVED ถึง DELIVERED บน URL จริงได้ทุกบทบาท Customer เข้าถึงงานของคนอื่นไม่ได้แม้เรียก API ตรง และอนุมัติซ้ำหรืออนุมัติใบหมดอายุไม่ได้

### Sprint 5: รายงานและธุรกิจ

- ทำ Dashboard จากข้อมูลจริงที่กดดูรายการต้นทางได้
- ทำหน้าค้น Audit Log
- ทำ Subscription, Trial และ `MockPaymentProvider` ตาม [ADR-0007](adr/0007-simulated-subscription-payments.md)
- ทำสิทธิ์ของ Expired Shop และ Suspended Shop
- ทำหน้า Platform Admin ตาม [ADR-0009](adr/0009-platform-admin-cannot-read-shop-data.md)

**จบเมื่อ:** ทุกตัวเลขมีเทสต์ที่เทียบกับข้อมูลต้นทาง ร้านที่หมดอายุเป็นแบบอ่านอย่างเดียว และ Platform Admin อ่านข้อมูลงานของร้านไม่ได้

### Sprint 6: ความพร้อมและ Portfolio

- ทำ E2E ของ Workflow สำคัญให้ครบ และทดสอบสิทธิ์ผิด ข้อมูลผิด และ request ซ้ำ
- ตรวจ performance เบื้องต้น
- ทำ Demo Shop พร้อม seed และ Cron ที่รีเซ็ตเดโมและลบร้านที่ไม่ใช้งาน
- เขียน README และ Portfolio Case Study พร้อม[ข้อจำกัดที่ต้องระบุ](architecture.md#ข้อจำกัดที่ต้องระบุใน-portfolio)

**จบเมื่อ:** ทุกข้อใน Project Success Criteria ของเอกสารตั้งต้นผ่าน หรือถูกตัดโดยมีเหตุผลบันทึกไว้ และคนนอกทำตาม README จนลองเดโมครบทุกบทบาทได้

## วิธีทำงาน

- **เริ่ม Sprint:** แตก issue เฉพาะ Sprint นั้นลงใน `.scratch/<feature>/` ตาม[กติกา issue](agents/issue-tracker.md)
- **ระหว่าง Sprint:** ทำ branch สั้นต่อ issue แล้วเปิด PR เข้า `main` ให้ CI ผ่านก่อน merge
- **จบ Sprint:** ลองใช้งานบน URL จริง เขียน Sprint Log และปรับ Roadmap

เอกสารนี้ไม่มี daily log, burndown chart หรือ velocity เพราะทำงานคนเดียว สิ่งที่ทำรายวันดูได้จาก git history

### Sprint Log

แต่ละ Sprint มีไฟล์ `docs/sprints/sprint-NN.md` ที่มีหัวข้อเหล่านี้:

1. เป้าหมาย
2. สิ่งที่เสร็จพร้อมลิงก์หลักฐาน
3. สิ่งที่ไม่เสร็จพร้อมเหตุผล
4. Bug ที่น่าสนใจ
5. จุดที่ตรวจแล้วแก้สิ่งที่ AI เสนอ
6. สิ่งที่จะปรับใน Sprint ถัดไป

### การใช้ AI

ใช้ AI เขียนโค้ดได้เต็มที่ แต่ระดับการตรวจขึ้นกับความเสี่ยงของงาน

| Label | งาน | วิธีตรวจ |
|---|---|---|
| `ready-for-human` | RLS, auth, token, การเปลี่ยนสต็อก, Approval, Payment | อ่านทุกบรรทัด และอธิบายได้ว่าทำไมถึงถูก |
| `ready-for-agent` | UI, CRUD, รายงาน, เทสต์ทั่วไป | ดูผลเทสต์ ลองใช้จริง และอ่านผ่านๆ |

ไม่ลดเวลาในแผนล่วงหน้า ถ้าทำเสร็จเร็วให้ขยับงานถัดไปขึ้นมาหรือเพิ่มเทสต์ แล้วใช้ตัวเลขจริงจาก Sprint Log ปรับแผน

### เมื่อทำไม่ทัน

ถ้าจบ Sprint แล้วเป้าหมายไม่สำเร็จ ให้[ตัดงานตามลำดับ](architecture.md#แผนและลำดับการตัดงาน)หรือยกงานไป Sprint ถัดไป ห้ามขยายวันจบ และต้องบันทึกเหตุผลใน Sprint Log

## Definition of Done

งานหนึ่งชิ้นจะเสร็จเมื่อ:

- [ ] ตรงตาม Acceptance Criteria
- [ ] ตรวจ Input ทั้ง Client และ Server ตามความเหมาะสม
- [ ] ตรวจ Authentication และ Authorization
- [ ] ถ้าแตะข้อมูลร้าน ต้องมีเทสต์ว่าอีกร้านเข้าถึงไม่ได้
- [ ] Business Rules ทำงานถูกต้อง
- [ ] รองรับ Error Cases ที่สำคัญ
- [ ] มี Automated Tests ตามระดับความเสี่ยง
- [ ] ทดสอบ Workflow จริงแล้ว
- [ ] ตรวจสอบผลกระทบต่อข้อมูลที่เกี่ยวข้องแล้ว
- [ ] มีเอกสารหรือคำอธิบายที่จำเป็น
- [ ] Deploy แล้วและตรวจสอบบน production แล้ว
