# RepairFlow PRD

เอกสารนี้บอกว่า RepairFlow แก้ปัญหาอะไร ให้ใคร และ Workflow หลักต้องเสร็จแค่ไหน ส่วนการออกแบบอยู่ใน [architecture.md](architecture.md) แผนงานอยู่ใน [roadmap.md](roadmap.md) และคำศัพท์อยู่ใน [GLOSSARY.md](../GLOSSARY.md)

ถ้าข้อความขัดกับ `architecture.md` ให้ยึด `architecture.md` และแก้เอกสารนี้ให้ตรง

## ปัญหา

RepairFlow ออกแบบสำหรับร้านซ่อมอุปกรณ์อิเล็กทรอนิกส์ที่มี Technician หลายคนและมีคลัง Part [เอกสารตั้งต้น](RepairFlow-Portfolio-Project.md) ระบุปัญหา 6 ข้อ ซึ่งยกมาตามถ้อยคำเดิม โดย "ลูกค้า" คือ Customer และ "ผู้จัดการ" คือ Owner

1. ลูกค้าไม่ทราบว่างานซ่อมอยู่ในขั้นตอนใด
2. พนักงานไม่ทราบว่าใครเป็นผู้รับผิดชอบงาน
3. การเบิกอะไหล่ทำให้ยอดสต็อกไม่ตรงกับของจริง
4. มีการเสนอราคา แต่ยังไม่มีการอนุมัติจากลูกค้า
5. งานซ่อมเสร็จแล้วแต่ไม่มีการแจ้งลูกค้าอย่างเป็นระบบ
6. ผู้จัดการไม่เห็นภาพรวมของงานล่าช้า ระยะเวลาซ่อม และรายได้

โปรเจกต์นี้เป็นงานแสดงผลงานที่ไม่มีผู้ใช้จริง จึงวัดผลด้วย[สถานการณ์ทดสอบ](#ปัญหาและสถานการณ์ที่พิสูจน์ได้)แทนตัวเลขการใช้งาน

## ผู้ใช้

| ผู้ใช้ | สิ่งที่ต้องการจากระบบ |
|---|---|
| Owner | เห็นภาพรวมของ Shop, จัดการ User, ดูรายงาน และตรวจสอบงาน |
| Receptionist | รับ Device, เปิด Work Order, บันทึก Customer และเสนอราคา |
| Technician | รับผิดชอบการซ่อม, อัปเดตสถานะ, บันทึกผล และ Issue Part |
| Customer | ติดตามสถานะ, ตรวจสอบ Quotation และตอบรับหรือปฏิเสธ โดยอาจไม่มี User ก็ได้ |
| Platform Admin | ดูและระงับ Shop โดยอ่านข้อมูลงานซ่อมไม่ได้ ([ADR-0009](adr/0009-platform-admin-cannot-read-shop-data.md)) |
| ผู้ชม Portfolio | ทดลอง Demo Shop ได้ครบทุกบทบาท และเห็นหลักฐานว่าระบบแก้ปัญหาได้จริง |

สิทธิ์ของแต่ละบทบาทอยู่ใน[ตารางสิทธิ์](architecture.md#authentication-และ-authorization) ซึ่งเจ้าของโปรเจกต์ทบทวนและยืนยันแล้ว

## ขอบเขต MVP

| ส่วน | สิ่งที่ทำ | Sprint |
|---|---|---|
| Shop และ User | สมัคร Shop, ลิงก์เชิญ, recovery codes, RLS และ Authorization ตามบทบาท | 2 |
| Work Order | Customer, Device, การเปลี่ยนสถานะ, Status History, การมอบหมาย Technician, รูปภาพ, การค้นหาและกรอง | 2 |
| Audit Log | เขียนในทุกโมดูลตั้งแต่แรก และค้นได้ใน Sprint 5 | 2, 5 |
| Inventory | Part, การรับเข้า, ยอดตามสถานะ, Reservation, Issue, Part Request, Part ที่เสีย และ Stock Movement | 3 |
| Notification | Notification ในแอป และ Customer Contact Task | 3, 4 |
| Quotation | Quotation ที่ส่งแล้วแก้ไม่ได้, การหมดอายุ, ฉบับใหม่ และ Approval | 4 |
| Customer Portal | Customer ดูงาน สถานะ และ Quotation ของตนเอง และตอบ Quotation ได้ | 4 |
| Payment | บันทึก Payment, Outstanding Balance และการคืน Device | 4 |
| Dashboard | ตัวเลขจากข้อมูลจริงที่กดดูรายการต้นทางได้ | 5 |
| Subscription | แผนเดียวพร้อม Trial แบบจำลอง, Expired Shop และ Suspended Shop | 5 |
| Platform Admin | ดูรายชื่อ Shop, สถานะ Subscription, ตัวเลขรวม และระงับ Shop | 5 |
| Demo Shop | seed, บัญชีครบทุกบทบาท และ Cron ที่รีเซ็ตทุกวัน | 6 |

ถ้าทำไม่ทันให้ตัดงานตาม[ลำดับใน architecture.md](architecture.md#แผนและลำดับการตัดงาน) Workflow หลักต้องจบก่อน billing และ Platform Admin

## ฟีเจอร์ที่เลือกไม่ทำ

| ไม่ทำ | เหตุผล | ที่มา |
|---|---|---|
| ส่งอีเมล, SMS หรือแจ้งเตือนออกนอกแอป | ต้องมีโดเมน, outbox และ scheduler ซึ่งขัดกับข้อจำกัดเรื่องฟรี จึงใช้ Customer Contact Task แทน | [ADR-0006](adr/0006-in-app-notifications-only.md) |
| Realtime หรือ polling ของ Notification | ทำให้ DB ตื่นตลอดและกิน quota ของ Neon | [ADR-0006](adr/0006-in-app-notifications-only.md) |
| รับเงินจริงทั้ง Payment และ Subscription | เป็นงานแสดงผลงานที่ไม่ได้รับเงินจริง จึงบันทึก Payment อย่างเดียวและจำลอง Subscription | [ADR-0007](adr/0007-simulated-subscription-payments.md) |
| บัญชีกลางที่ใช้ได้หลาย Shop | ไม่มีวิธียืนยันตัวตนข้าม Shop เมื่อไม่ส่งอีเมล จึงเสี่ยงที่ Shop หนึ่งจะเข้าถึงข้อมูลของอีก Shop | [ADR-0003](adr/0003-per-shop-user-accounts.md) |
| Impersonation และการอ่านข้อมูล Shop ของ Platform Admin | การ bypass RLS ทำลายขอบเขตการแยก Shop | [ADR-0009](adr/0009-platform-admin-cannot-read-shop-data.md) |
| Serial และ lot, หลายคลัง | ละเอียดกว่าที่ต้องการและเกินขอบเขต จึงใช้ 5 สถานะยอดและ 12 ชนิด Stock Movement แทน | [ADR-0005](adr/0005-stock-buckets-reservation-and-conditional-update.md) |
| RMA เต็มรูปแบบ, ใบสั่งซื้อเต็มรูปแบบ, ต้นทุนเฉลี่ย, งาน refurbish | ตัดออกเพื่อให้ model พอดีกับ 12 สัปดาห์ ของ refurbished ถือเป็น Part คนละชนิด | [ผลการค้นคว้า](research/inventory-and-free-hosting.md) |
| Stock ติดลบ | ขัดกับเป้าหมายที่ยอดต้องตรงกับของจริง | [ADR-0005](adr/0005-stock-buckets-reservation-and-conditional-update.md) |
| Microservices, Redis และ Queue | ระบบยังเล็ก และ Postgres ตัวเดียวรับประกันความถูกต้องได้ | เอกสารตั้งต้น, [ADR-0002](adr/0002-synchronous-module-calls-with-shared-transaction.md) |
| Rollup ของรายงาน | Query สดก่อน และค่อยเพิ่มเมื่อมีผลวัดว่าช้า | [architecture.md](architecture.md#รายงาน) |
| Preview Deployment | ไม่ควรชี้ไปฐานข้อมูล production และการแยกฐานข้อมูลต่อ PR กิน quota ของ Neon | [architecture.md](architecture.md#delivery) |
| OTP | ต้องมีช่องทางอีเมลหรือ SMS ซึ่งโปรเจกต์ฟรีนี้ไม่มี | การตัดสินใจของเจ้าของโปรเจกต์ 1 พ.ย. 2569, [ADR-0006](adr/0006-in-app-notifications-only.md) |
| MFA | เพิ่มงานลงทะเบียนและกู้คืนเกินขอบเขต MVP และเลือกใช้ httpOnly cookie ที่ตรวจกับ DB เป็นมาตรการหลักแล้ว | การตัดสินใจของเจ้าของโปรเจกต์ 1 พ.ย. 2569, [ADR-0004](adr/0004-jwt-in-httponly-cookies-checked-against-db.md) |

## User Stories

เรื่องที่ระบุการกระทำของบทบาท อ้างจากหน้าที่ใน[เอกสารตั้งต้น](RepairFlow-Portfolio-Project.md#2-กลุ่มผู้ใช้งานและบทบาท) ถ้าต่างกันให้ยึด[ตารางสิทธิ์](architecture.md#authentication-และ-authorization)

**Receptionist**

1. ในฐานะ Receptionist ฉันต้องการเปิด Work Order พร้อมข้อมูล Customer และ Device เพื่อให้ทุกงานเริ่มจากจุดเดียวกัน
2. ในฐานะ Receptionist ฉันต้องการบันทึกอาการเสียและรูปภาพ เพื่อให้ Technician เห็นสภาพตอนรับเครื่อง
3. ในฐานะ Receptionist ฉันต้องการออก Quotation จากค่าแรงและ Part เพื่อส่งให้ Customer ตัดสินใจ
4. ในฐานะ Receptionist ฉันต้องการออกลิงก์เชิญให้ Customer เพื่อให้ Customer เข้า Customer Portal ได้โดยไม่ต้องส่งอีเมล

**Technician**

5. ในฐานะ Technician ฉันต้องการเห็น Work Order ที่รับมอบหมาย เพื่อรู้ว่าต้องทำอะไรต่อ
6. ในฐานะ Technician ฉันต้องการอัปเดตสถานะตาม Workflow เพื่อให้ทุกคนเห็นความคืบหน้าเดียวกัน
7. ในฐานะ Technician ฉันต้องการ Issue Part ที่จองให้ Work Order ของฉัน เพื่อให้มั่นใจว่างานอื่นแย่งไม่ได้
8. ในฐานะ Technician ฉันต้องการบันทึกเมื่อ Part เสียระหว่างซ่อม เพื่อให้ได้ชิ้นทดแทนโดย Customer ไม่ถูกคิดเงิน

**Customer**

9. ในฐานะ Customer ฉันต้องการดู Device, Work Order และ Status History ของตนเอง เพื่อรู้ว่างานอยู่ขั้นไหนโดยไม่ต้องโทรถาม
10. ในฐานะ Customer ฉันต้องการตรวจสอบ Quotation แล้วตอบรับหรือปฏิเสธ เพื่อตัดสินใจก่อนเกิดค่าใช้จ่าย
11. ในฐานะ Customer ฉันต้องการมั่นใจว่าคนอื่นเห็นงานของฉันไม่ได้ เพื่อให้ข้อมูลของฉันปลอดภัย
12. ในฐานะ Customer ที่ไม่มี User ฉันต้องการให้ Shop ติดต่อฉันเมื่องานเสร็จ เพื่อมารับ Device ได้

**Owner**

13. ในฐานะ Owner ฉันต้องการ Dashboard จากข้อมูลจริงที่กดดูรายการต้นทางได้ เพื่อเชื่อตัวเลขที่เห็น
14. ในฐานะ Owner ฉันต้องการเห็นงานเกินกำหนดและงานของแต่ละ Technician เพื่อจัดการงานล่าช้า
15. ในฐานะ Owner ฉันต้องการจัดการ User และออกลิงก์เชิญให้พนักงาน เพื่อคุมว่าใครเข้าระบบได้
16. ในฐานะ Owner ฉันต้องการปรับยอดจากการนับ, Scrap และจัดลำดับ Part Request เพื่อให้ยอดและคิวตรงกับของจริง
17. ในฐานะ Owner ฉันต้องการค้น Audit Log เพื่อตรวจย้อนหลังว่าใครทำอะไรเมื่อใด

**พนักงาน**

18. ในฐานะพนักงาน ฉันต้องการค้นหาและกรอง Work Order ตามสถานะ, Technician, วันที่ และ Customer เพื่อหางานได้เร็ว
19. ในฐานะพนักงาน ฉันต้องการเห็นว่าใครรับผิดชอบ Work Order แต่ละใบ เพื่อไม่ต้องถามต่อกัน
20. ในฐานะพนักงาน ฉันต้องการบันทึก Staff-recorded Approval เพื่อรองรับ Customer ที่ตอบนอกระบบ
21. ในฐานะพนักงาน ฉันต้องการบันทึก Payment รวมถึงการจ่ายบางส่วน เพื่อรู้ Outstanding Balance ก่อนคืน Device
22. ในฐานะพนักงาน ฉันต้องการเห็น Customer Contact Task เพื่อติดต่อ Customer ที่ไม่มี User แล้วบันทึกช่องทางและผู้ติดต่อ

**Platform Admin และผู้ชม Portfolio**

23. ในฐานะ Platform Admin ฉันต้องการดูและระงับ Shop เพื่อดูแลธุรกิจโดยไม่เห็นข้อมูลงานซ่อม
24. ในฐานะผู้ชม Portfolio ฉันต้องการทดลอง Demo Shop ครบทุกบทบาท เพื่อเห็น Workflow ทั้งหมดโดยไม่ต้องติดตั้ง
25. ในฐานะผู้ชม Portfolio ฉันต้องการเห็นว่าปัญหาแต่ละข้อถูกพิสูจน์ด้วยสถานการณ์ใด เพื่อดูว่าระบบแก้ปัญหาได้จริงแม้ไม่มีผู้ใช้จริง

## Acceptance Criteria ของ Workflow หลัก

ครอบคลุมตั้งแต่ RECEIVED ถึง DELIVERED ตาม[แผนภาพสถานะ](architecture.md#workflow-ของ-work-order) ผู้ทำเป็นไปตาม[ตารางสิทธิ์](architecture.md#authentication-และ-authorization) ส่วนที่ติด Q อยู่ยังตรวจรับไม่ได้จนกว่าจะมีคำตอบ

### กฎร่วม

- **AC-01** การเปลี่ยนสถานะที่ไม่อยู่ใน transition table ถูกปฏิเสธ เช่น RECEIVED ไป IN_PROGRESS โดยสถานะเดิมไม่เปลี่ยนและไม่เกิด Status History
- **AC-02** ทุกการเปลี่ยนสถานะเขียน Status History และ Audit Log ใน transaction เดียวกัน ถ้าเกิด error ต้องไม่เหลือส่วนใดเลย
- **AC-03** สิทธิ์ถูกตรวจใน backend เมื่อเรียก API โดยตรงด้วยบทบาทที่ไม่มีสิทธิ์จะถูกปฏิเสธ และมีเทสต์แบบ matrix ทั้งบทบาทและเจ้าของข้อมูล
- **AC-04** Work Order ของ Shop อื่นเข้าถึงไม่ได้ และ Customer เข้าถึง Work Order ของ Customer อื่นไม่ได้ แม้เรียก API โดยตรง
- **AC-05** Expired Shop และ Suspended Shop ทำได้ตาม[ตารางสถานะร้าน](architecture.md#การเงิน)
- **AC-06** Issue, Approval และการบันทึก Payment ที่ส่งซ้ำด้วย `Idempotency-Key` เดิมเป็นไปตาม[ตารางความล้มเหลว](architecture.md#การรับมือความล้มเหลว)

### RECEIVED

- **AC-07** เปิด Work Order ได้เมื่อระบุ Customer, Device และอาการเสีย โดยเก็บ Promised Date และเริ่มที่ RECEIVED พร้อม Status History รายการแรก
- **AC-08** แนบรูปได้ไม่เกิน 5 รูปต่อ Work Order ซึ่งเก็บแบบ private และเปิดผ่าน API ที่ตรวจสิทธิ์เท่านั้น ถ้าอัปโหลดรูปไม่ได้ Workflow ต้องทำงานต่อได้
- **AC-09** Owner และ Receptionist มอบหมาย Technician ได้ ทุกคนที่เห็น Work Order เห็นว่าใครรับผิดชอบ และการมอบหมายถูกบันทึกใน Audit Log

### DIAGNOSING

- **AC-10** Owner และ Technician ที่รับมอบหมายเปลี่ยน RECEIVED เป็น DIAGNOSING ได้ ส่วน Receptionist เปลี่ยนไม่ได้ และจาก DIAGNOSING ไปต่อได้เฉพาะ WAITING_FOR_APPROVAL หรือ CANCELLED

### WAITING_FOR_APPROVAL

- **AC-11** Quotation ประกอบด้วยค่าแรงและ Part เก็บราคาแต่ละรายการเป็น snapshot และมีวันหมดอายุ Owner และ Receptionist เป็นผู้ส่ง และการส่งเปลี่ยน Work Order เป็น WAITING_FOR_APPROVAL ในตัว ส่วน Technician ส่ง Quotation และเปลี่ยนเป็นสถานะนี้โดยตรงไม่ได้
- **AC-12** Quotation ที่ส่งแล้วแก้ไม่ได้ การเปลี่ยนต้องออกฉบับใหม่ และ Superseded Quotation รับ Approval ไม่ได้
- **AC-13** Customer ที่มี User ตอบ Quotation ของตนเองใน Customer Portal ได้ ส่วน Staff-recorded Approval ต้องระบุช่องทางและผู้บันทึก
- **AC-14** Approval เป็น transaction เดียวตาม[ขั้นตอนใน architecture.md](architecture.md#quotation-และ-approval) ถ้าล้มเหลวกลางทาง Quotation, Reservation, สถานะ Work Order, Audit Log และ Notification ต้องไม่เปลี่ยน
- **AC-15** ถ้า Available พอทุกรายการ Part ทั้งหมดถูกจองและ Work Order เป็น IN_PROGRESS
- **AC-16** ถ้า Available ไม่พอ ส่วนที่ขาดเกิด Part Request และ Work Order เป็น WAITING_FOR_PARTS ([Q7](#คำถามที่-acceptance-criteria-ยังตอบไม่ได้))
- **AC-17** Approval ซ้ำ และ Approval ของ Quotation ที่หมดอายุ ไม่สำเร็จและไม่เปลี่ยนข้อมูลใด
- **AC-18** การปฏิเสธถูกบันทึกในประวัติการตัดสินใจ ไม่เกิด Reservation และ Work Order กลับไป DIAGNOSING ใน transaction เดียวกับที่บันทึกการปฏิเสธ เพื่อเสนอราคาใหม่ ส่วนการปฏิเสธ Quotation เพิ่มเติมยังติด [Q5](#คำถามที่-acceptance-criteria-ยังตอบไม่ได้)

### WAITING_FOR_PARTS

- **AC-19** `RECEIPT` จัดสรร Part ให้ Part Request ตามลำดับก่อนหลังใน transaction เดียวกัน และเกิด Notification โดย Owner ปรับลำดับได้
- **AC-20** WAITING_FOR_PARTS เปลี่ยนเป็น IN_PROGRESS ได้เมื่อ Part ครบ ([Q4](#คำถามที่-acceptance-criteria-ยังตอบไม่ได้))

### IN_PROGRESS

- **AC-21** Issue ตัดจาก Reserved ของ Work Order นั้นเท่านั้น ถ้าไม่มียอดจองจะถูกปฏิเสธ และ Work Order อื่นแย่งไม่ได้
- **AC-22** การ Issue หลายรายการสำเร็จหรือล้มเหลวพร้อมกันทั้งใบ และทุกรายการเขียน Stock Movement พร้อมต้นทุนต่อหน่วย
- **AC-23** Owner และ Technician ที่รับมอบหมายคืน Part ที่ไม่ได้ใช้เป็น Available ด้วย `RETURN_UNUSED`
- **AC-24** Repair Damage ต้องระบุเหตุผล ไม่คิดเงิน Customer ไม่ต้องขอ Approval ใหม่ และชิ้นทดแทนใช้ `RESERVE` กับ `ISSUE` ตามปกติ ถ้าของไม่พอจะเข้าคิว Part Request และ Work Order เปลี่ยนเป็น WAITING_FOR_PARTS ได้
- **AC-25** DOA ไม่คิดเงิน Customer และแยกไปเคลมกับผู้ขาย
- **AC-26** ถ้า Customer ต้องจ่ายเพิ่ม ต้องผ่าน Quotation ใหม่ และ Work Order กลับไป WAITING_FOR_APPROVAL ([Q5](#คำถามที่-acceptance-criteria-ยังตอบไม่ได้))

### COMPLETED

- **AC-27** Owner และ Technician ที่รับมอบหมายเปลี่ยน IN_PROGRESS เป็น COMPLETED ได้ และเขียนการแจ้ง Customer ใน transaction เดียวกัน คือ Notification ถ้า Customer มี User หรือ Customer Contact Task ถ้าไม่มี ([Q6](#คำถามที่-acceptance-criteria-ยังตอบไม่ได้))
- **AC-28** Customer Contact Task บันทึกช่องทางและผู้ติดต่อได้
- **AC-29** บันทึก Payment ได้โดยเก็บยอด วิธีชำระ และผู้รับเงิน รองรับการจ่ายบางส่วน และไม่มีการรับเงินจริงผ่านระบบ
- **AC-30** Outstanding Balance เท่ากับยอดตาม Quotation ที่ได้รับ Approval หักด้วย Payment ทั้งหมดของ Work Order ([Q5](#คำถามที่-acceptance-criteria-ยังตอบไม่ได้))

### DELIVERED

- **AC-31** COMPLETED ที่ยังมี Outstanding Balance เปลี่ยนเป็น DELIVERED ไม่ได้ และเมื่อไม่มียอดค้าง Owner และ Receptionist เปลี่ยนได้ ส่วน Technician เปลี่ยนไม่ได้
- **AC-32** DELIVERED เป็นจุดสิ้นสุด เปลี่ยนสถานะต่อไม่ได้ และ Customer เห็น Status History ครบ

### CANCELLED

- **AC-33** Owner และ Receptionist ยกเลิกได้จาก RECEIVED, DIAGNOSING, WAITING_FOR_APPROVAL, WAITING_FOR_PARTS และ IN_PROGRESS โดยต้องระบุเหตุผล ส่วน Technician ยกเลิกไม่ได้ และ COMPLETED กับ DELIVERED ยกเลิกไม่ได้
- **AC-34** การยกเลิกคืน Reservation ที่ยังไม่ถูกเบิกกลับเป็น Available ด้วย `RELEASE`
- **AC-35** CANCELLED ยังไม่จบงาน ต้องเปลี่ยนเป็น DELIVERED เมื่อคืน Device ([Q1](#คำถามที่-acceptance-criteria-ยังตอบไม่ได้))

### ทั้ง Workflow

- **AC-36** Work Order เดินจาก RECEIVED ถึง DELIVERED บน URL จริงได้ทุกบทบาท โดย Receptionist เปิดงาน มอบหมาย ส่ง Quotation รับ Payment และคืน Device ส่วน Technician ที่รับมอบหมายทำสถานะงานซ่อมและ Issue Part และ Customer ตอบ Quotation

## ปัญหาและสถานการณ์ที่พิสูจน์ได้

เมื่อไม่มีผู้ใช้จริง แต่ละปัญหาถือว่าแก้แล้วเมื่อสถานการณ์เหล่านี้ผ่านเป็นเทสต์อัตโนมัติ

| ปัญหา | สถานการณ์ | ผลที่ต้องได้ | ระดับเทสต์ | Sprint |
|---|---|---|---|---|
| 1. Customer ไม่ทราบขั้นตอน | Customer ล็อกอินหลัง Work Order เปลี่ยนสถานะ | เห็นสถานะปัจจุบันและ Status History ตรงกับที่พนักงานบันทึก | E2E | 4 |
| | Customer เรียก API ด้วย ID ของ Work Order ของ Customer อื่น | ถูกปฏิเสธและไม่เห็นข้อมูล | Integration, E2E | 4 |
| 2. ไม่ทราบผู้รับผิดชอบ | มอบหมาย Technician แล้วเปิดรายการ Work Order แล้วกรองตาม Technician นั้น | เห็นผู้รับผิดชอบ และรายการตรงกับที่มอบหมาย | E2E | 2 |
| | มอบหมาย Technician ใหม่ | ผู้รับผิดชอบเปลี่ยน และ Audit Log บอกได้ว่าใครเปลี่ยนเมื่อใด | Integration | 2 |
| 3. ยอดสต็อกไม่ตรง | ทุกกรณีใน[ตารางความล้มเหลว](architecture.md#การรับมือความล้มเหลว) | ตามพฤติกรรมที่ตารางกำหนด | Integration | 3 |
| | สอง Approval พร้อมกันต่อ Part ชิ้นสุดท้าย | ได้ Reservation หนึ่งงาน อีกงานเกิด Part Request และ Available ไม่ติดลบ | Integration | 3, 4 |
| | สองคำขอ Issue พร้อมกันจาก Reservation เดียวกันจำนวน 1 ชิ้น | สำเร็จคำขอเดียว | Integration | 3 |
| | ทำครบทุกชนิด Stock Movement แล้วเทียบยอด | ยอดคงเหลือตรงกับผลรวมของ Stock Movement | Integration | 3 |
| 4. เสนอราคาแต่ไม่มี Approval | พยายามเปลี่ยนจาก DIAGNOSING หรือ WAITING_FOR_APPROVAL เป็น IN_PROGRESS โดยไม่มี Approval | ถูกปฏิเสธ และไม่เกิด Reservation | Unit, Integration | 2, 4 |
| | Approval ซ้ำ, Approval ของ Quotation ที่หมดอายุ และของ Superseded Quotation | ไม่สำเร็จและไม่เปลี่ยนข้อมูลใด | Integration | 4 |
| | ดู Approval ย้อนหลัง ทั้งที่ Customer ตอบเองและ Staff-recorded Approval | บอกได้ว่าใครตัดสินใจ ผ่านช่องทางใด และใครบันทึก | Integration | 4 |
| 5. ไม่แจ้ง Customer | Work Order เป็น COMPLETED และ Customer มี User | เกิด Notification ใน transaction เดียวกับการเปลี่ยนสถานะ | Integration | 4 |
| | Work Order เป็น COMPLETED และ Customer ไม่มี User | เกิด Customer Contact Task และบันทึกช่องทางกับผู้ติดต่อได้ | Integration, E2E | 4 |
| | การเปลี่ยนเป็น COMPLETED ล้มเหลวกลาง transaction | ไม่เกิดทั้ง Notification และ Customer Contact Task | Integration | 4 |
| 6. Owner ไม่เห็นภาพรวม | Seed ข้อมูลที่รู้คำตอบแล้วเรียก[ตัวเลขทุกตัวในรายงาน](architecture.md#รายงาน) | ตัวเลขตรงกับค่าที่คำนวณจากข้อมูลต้นทาง | Integration | 5 |
| | กดตัวเลขหลักใน Dashboard | รายการต้นทางรวมกันได้เท่าตัวเลขที่แสดง | E2E | 5 |
| | ข้อมูลอยู่ใกล้ขอบเขต timezone ของ Shop และมี Work Order ที่ CANCELLED | รวมยอดตาม timezone ของ Shop และระยะเวลาซ่อมเฉลี่ยไม่รวมงาน CANCELLED | Integration | 5 |

ข้อจำกัดของปัญหาข้อ 5 คือ Notification ไปไม่ถึง Customer ที่ไม่ล็อกอิน ซึ่งต้อง[ระบุใน Portfolio](architecture.md#ข้อจำกัดที่ต้องระบุใน-portfolio)

## Test Plan

กรณีความล้มเหลวของ transaction และ concurrency มีรายการเดียวคือ[ตารางความล้มเหลวใน architecture.md](architecture.md#การรับมือความล้มเหลว) ซึ่งเอกสารนี้อ้างถึงโดยไม่คัดลอก ถ้าเพิ่มกรณีให้แก้ที่ตารางนั้น

เทสต์ที่ดีตรวจพฤติกรรมที่มองเห็นจากภายนอก ไม่ตรวจรายละเอียดภายใน

| ระดับ | เครื่องมือ | ครอบคลุม | รันเมื่อ |
|---|---|---|---|
| Unit | Vitest | transition table และ guard, policy function ของแต่ละโมดูล | ทุก PR |
| Integration | Vitest กับ Postgres ใน container | ตารางความล้มเหลว, [กฎของ RLS และ DB role](architecture.md#tenancy-และการเข้าถึงฐานข้อมูล), เทสต์สิทธิ์แบบ matrix, Approval, ยอดเทียบกับ Stock Movement, ตัวเลขในรายงาน | ทุก PR |
| E2E | Playwright ผ่าน `/api/*` ของ Web | Workflow จาก RECEIVED ถึง DELIVERED ทุกบทบาท, Customer Portal, สิทธิ์ผิด, ข้อมูลผิด และ request ซ้ำ | ทุก PR |
| Smoke | HTTP บน URL จริง | health endpoint ของ API และหน้าเว็บตาม[กฎของ pipeline](architecture.md#delivery) | หลัง deploy ทุกครั้ง |

- ทุกงานที่แตะข้อมูลร้านต้องมีเทสต์ว่าอีก Shop เข้าถึงไม่ได้ ตาม [Definition of Done](roadmap.md#definition-of-done)
- ทุก AC ต้องมีเทสต์อย่างน้อยหนึ่งระดับ โดยชื่อเทสต์อ้างรหัส AC
- CI ของ PR ไม่แตะ Neon และเกณฑ์ของการทดลองบน production อยู่ใน [Sprint 1](../.scratch/sprint-01-foundation/spec.md)

## สิ่งที่รอการยืนยัน

### ตารางสิทธิ์

เจ้าของโปรเจกต์ทบทวนและยืนยัน[ตารางสิทธิ์ใน architecture.md](architecture.md#authentication-และ-authorization)เมื่อ 1 พ.ย. 2569 เหลือเพียงการตีความสองข้อที่ระบุใต้ตารางให้เจ้าของโปรเจกต์ตรวจดู

### คำถามที่ Acceptance Criteria ยังตอบไม่ได้

| รหัส | คำถาม | กระทบ |
|---|---|---|
| Q1 | CANCELLED เปลี่ยนเป็น DELIVERED ได้หรือไม่ถ้ายังมี Outstanding Balance เช่น Quotation ได้รับ Approval แล้วยกเลิกก่อนจ่าย แผนภาพไม่มีเงื่อนไขยอดค้างที่เส้นนี้ แต่กฎใน GLOSSARY และ architecture ห้าม Delivered ทุกกรณี | AC-30, AC-35 |
| Q2 | ปิดแล้ว 1 พ.ย. 2569: Owner และ Receptionist เปลี่ยนเป็น DELIVERED, ยกเลิก Work Order และมอบหมาย Technician | AC-09, AC-31, AC-33, AC-36 |
| Q3 | ปิดแล้ว 1 พ.ย. 2569: การส่ง Quotation เปลี่ยน Work Order เป็น WAITING_FOR_APPROVAL ในตัว | AC-11 |
| Q4 | WAITING_FOR_PARTS เปลี่ยนเป็น IN_PROGRESS อัตโนมัติเมื่อจัดสรรครบหรือให้คนกด และต้องจัดสรรครบทุกรายการหรือไม่ | AC-20 |
| Q5 | Quotation เพิ่มเติมระหว่าง IN_PROGRESS บวกกับฉบับเดิมใน Outstanding Balance หรือไม่ และถ้าถูกปฏิเสธ Work Order ต้องกลับ DIAGNOSING เหมือนฉบับแรกหรือไม่ ทั้งที่มี Approval และ Part ที่เบิกแล้ว | AC-18, AC-26, AC-30 |
| Q6 | Customer ที่มี User แต่ยังไม่รับทราบเหตุการณ์ต้องเกิด Customer Contact Task หรือไม่ GLOSSARY ระบุว่าต้องเกิด แต่ architecture ระบุเฉพาะ Customer ที่ไม่มีบัญชี และไม่มี scheduler ให้ตรวจ | AC-27 |
| Q7 | ถ้าต้องการ 3 ชิ้นแต่ Available เหลือ 2 จะจอง 2 แล้วขอเพิ่ม 1 หรือเข้าคิวทั้ง 3 ตัวอย่าง SQL ที่ใช้ `available >= :qty` ทำแบบหลัง แต่ข้อความระบุว่าส่วนที่ขาดเข้าคิว | AC-16 |
| Q8 | ปิดแล้ว 1 พ.ย. 2569: เจ้าของโปรเจกต์ให้เหตุผลไว้ใน[ฟีเจอร์ที่เลือกไม่ทำ](#ฟีเจอร์ที่เลือกไม่ทำ) | ฟีเจอร์ที่เลือกไม่ทำ |
| Q9 | Reserved ที่ยังไม่ถูกเบิกตอน COMPLETED และ Part Request ที่ค้างตอนยกเลิกต้องทำอย่างไร `RELEASE` ระบุเฉพาะตอนยกเลิกงาน และการยกเลิกระบุเฉพาะ Reservation | AC-27, AC-34 |
| Q10 | ปิดแล้ว 1 พ.ย. 2569: WAITING_FOR_APPROVAL เปลี่ยนเป็น DIAGNOSING ใน transaction เดียวกับที่บันทึกการปฏิเสธ เหมือน Approval | AC-18 |
| Q11 | ปิดแล้ว 1 พ.ย. 2569: `RETURN_UNUSED` เป็นของ Owner และ Technician ที่รับมอบหมาย ส่วน `INSPECT_PASS`, `INSPECT_FAIL`, `VENDOR_SEND`, `VENDOR_RESOLVE` และ `MARK_DEFECTIVE` ของ Part ที่ไม่ผูกกับ Work Order เป็นของ Owner เท่านั้น | AC-23 |
