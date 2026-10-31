# รายละเอียด Work Order

[กลับไปหน้ารวม](README.md)

หน้าที่ใช้มากที่สุด เพราะงานของพนักงานเกือบทั้ง Workflow อยู่ที่นี่ ตัวอย่างด้านล่างรวมทุกส่วนไว้ในภาพเดียว แต่ของจริงจะแสดงเฉพาะส่วนที่ใช้ได้ตาม[สถานะและบทบาท](#สถานะกับปุ่มที่แสดง)

```text
+-- RepairFlow | Work Orders | Parts | Dashboard{O} | [Notifications 3] | Somsri v
|
|  < Work Orders
|  WO-1042   [IN_PROGRESS]   Promised Date 2026-11-20
|
|  A. Summary
|     Customer: Somchai (has User)      [Invite Customer]{R} [ไม่ระบุ: O]
|     Device:   iPhone 13
|     Problem:  screen does not turn on
|     Repair notes: display connector replaced   [Edit]{O T}
|     Technician: Krit   [Change v]{O R}
|     Photos 2/5: [img] [img]  [+ Add photo] [ไม่ระบุ: ผู้แนบ]
|        (image failed to load: [Retry], the rest of the page still works)
|
|  B. Status actions
|     [-> COMPLETED]{O T}  [-> WAITING_FOR_PARTS]{O T}  [Cancel...]{O R}
|     Cancel: Reason * [__________]  [Cancel Work Order]
|
|  C. Quotation
|     v2  APPROVED    expires 2026-11-25   total 2,500.00   by Somchai (Portal)
|         Labor: 800.00 | Screen x1: 1,700.00
|     v1  SUPERSEDED  no reply possible
|     [New Quotation]{O R}
|     Form: Labor [____]  Part [Select v] Qty [_] Price [____]  [+ row]
|           Expires * [yyyy-mm-dd]   [Send]{O R}
|     Reply for Customer{O R}: [Approve] [Reject]
|           Channel * [Phone/Walk-in/Other v]   Recorded by: Somsri
|     [ยังไม่ตัดสิน Q5] AC-18, AC-26: ปฏิเสธ Quotation เพิ่มเติมแล้วสถานะไปไหน
|
|  D. Parts
|     Part     Needed  Reserved  Part Request  Issued
|     -------  ------  --------  ------------  ------
|     Screen   1       1         0             0        [x] Issue{O T}
|     Battery  3       2         1             0        [ ] Issue{O T}
|     [Issue selected]{O T}   [Return unused]{O T}
|     [Mark defective...]{O T}
|        Reason * (REPAIR_DAMAGE / DOA)   Note * [_______]
|        [ ] Need replacement  [ไม่ระบุ: ผู้สั่ง RESERVE]
|     [ยังไม่ตัดสิน Q7] AC-16: แถว Battery เป็นแบบจองบางส่วน อีกคำตอบคือเข้าคิวทั้ง 3
|     [ยังไม่ตัดสิน Q4] AC-20: ครบแล้วเปลี่ยนเองหรือกดปุ่ม และต้องครบทุกรายการหรือไม่
|     [ยังไม่ตัดสิน Q9] AC-27, AC-34: Reserved ที่เหลือตอน COMPLETED และ Part Request ที่ค้างตอนยกเลิก
|
|  E. Customer contact (after COMPLETED)
|     Customer has User    -> Notification sent 2026-11-15 10:20
|     Customer has no User -> Customer Contact Task: OPEN
|        Channel * [Phone v]  Contacted by: Somsri  [Save] [ไม่ระบุ: T]
|     [ยังไม่ตัดสิน Q6] AC-27: Customer ที่มี User แต่ยังไม่รับทราบ ต้องเกิด Task หรือไม่
|
|  F. Payment
|     Approved Quotation total      2,500.00
|     Payments                     -1,000.00   (cash, Somsri, 2026-11-15)
|     Outstanding Balance           1,500.00
|     Amount * [____]  Method * [v]  Received by: Somsri   [Record]{O R}
|     [-> DELIVERED]{O R}   shown only when Outstanding Balance = 0
|     [ยังไม่ตัดสิน Q5] AC-30: Quotation เพิ่มเติมบวกกับฉบับเดิมใน Outstanding Balance หรือไม่
|     [ยังไม่ตัดสิน Q1] AC-30, AC-35: CANCELLED ที่มี Outstanding Balance คืน Device ได้หรือไม่
|
|  G. Status History
|     2026-11-12 09:30  WAITING_FOR_APPROVAL -> IN_PROGRESS   Somchai
|     2026-11-11 16:00  DIAGNOSING -> WAITING_FOR_APPROVAL    Somsri
|     2026-11-11 10:05  RECEIVED -> DIAGNOSING                Krit
|     2026-11-10 14:12  (new) -> RECEIVED                     Somsri
```

## สถานะกับปุ่มที่แสดง

ส่วนของ Technician คนอื่นที่ไม่ได้รับมอบหมายคืออ่านอย่างเดียวในทุกสถานะ จึงไม่มีคอลัมน์แยก

| สถานะ | Owner | Receptionist | Technician ที่รับมอบหมาย |
|---|---|---|---|
| RECEIVED | เริ่มตรวจ, ยกเลิก | ยกเลิก | เริ่มตรวจ |
| DIAGNOSING | บันทึกผล, ส่ง Quotation, ยกเลิก | ส่ง Quotation, ยกเลิก | บันทึกผล |
| WAITING_FOR_APPROVAL | ออกฉบับใหม่, บันทึกแทน, ยกเลิก | ออกฉบับใหม่, บันทึกแทน, ยกเลิก | ไม่มี |
| WAITING_FOR_PARTS | เริ่มซ่อมต่อ `[ยังไม่ตัดสิน Q4]`, ยกเลิก | ยกเลิก | เริ่มซ่อมต่อ `[ยังไม่ตัดสิน Q4]` |
| IN_PROGRESS | บันทึกผล, COMPLETED, WAITING_FOR_PARTS, Issue, คืน Part, Part เสีย, Quotation เพิ่มเติม, ยกเลิก | Quotation เพิ่มเติม, ยกเลิก | บันทึกผล, COMPLETED, WAITING_FOR_PARTS, Issue, คืน Part, Part เสีย |
| COMPLETED | Payment, DELIVERED เมื่อไม่มียอดค้าง | Payment, DELIVERED เมื่อไม่มียอดค้าง | ไม่มี |
| CANCELLED | คืน Device `[ยังไม่ตัดสิน Q1]` | คืน Device `[ยังไม่ตัดสิน Q1]` | ไม่มี |
| DELIVERED | ไม่มี เป็นจุดสิ้นสุด | ไม่มี เป็นจุดสิ้นสุด | ไม่มี เป็นจุดสิ้นสุด |

ตารางนี้ตรงกับ[แผนภาพสถานะ](../architecture.md#workflow-ของ-work-order) และ[ตารางสิทธิ์](../architecture.md#authentication-และ-authorization) ส่วนปุ่มมอบหมาย Technician อยู่นอกตารางนี้ เพราะเอกสารไม่ได้จำกัดสถานะ และตารางแสดง Payment เฉพาะ COMPLETED ตามตำแหน่งของ AC-29 ส่วนสถานะอื่นยัง `[ไม่ระบุ]`

ข้อที่มักสับสน:

- Receptionist เปลี่ยน RECEIVED เป็น DIAGNOSING ไม่ได้ (AC-10)
- Technician ส่ง Quotation และเปลี่ยนเป็น WAITING_FOR_APPROVAL ไม่ได้ (AC-11)
- การเปลี่ยนจาก WAITING_FOR_APPROVAL เกิดจากการตอบ Quotation เท่านั้น จึงไม่มีปุ่มเปลี่ยนสถานะโดยตรง
- Technician ยกเลิกงาน เปลี่ยนเป็น DELIVERED และบันทึก Payment ไม่ได้ (AC-31, AC-33)
- Quotation เพิ่มเติมระหว่าง IN_PROGRESS นับเป็นการส่ง Quotation ตาม[การตีความใต้ตารางสิทธิ์](../architecture.md#authentication-และ-authorization) ซึ่งเจ้าของโปรเจกต์ยังไม่ได้ทบทวนแยก

## พฤติกรรมเมื่อเกิด error

- เปลี่ยนสถานะไม่สำเร็จ, Approval ล้มเหลว หรือ Issue บางรายการไม่ได้ แสดง error และข้อมูลเดิมทั้งหมด ไม่มีผลสำเร็จบางส่วน (AC-01, AC-02, AC-14, AC-22)
- กด Issue, Approval หรือ Payment ซ้ำได้ผลเดิมและไม่เกิดรายการซ้ำ (AC-06)
- Approval ซ้ำ หรือ Quotation หมดอายุ แสดงข้อความว่าไม่สำเร็จ และ Quotation ที่หมดอายุไม่มีปุ่มตอบ (AC-17)
- URL ของ Work Order ใน Shop อื่นแสดงไม่พบข้อมูล (AC-04)

## บทบาทและสิทธิ์

| ส่วนของหน้า | Owner | Receptionist | Technician ที่รับมอบหมาย | Technician คนอื่น | Customer |
|---|---|---|---|---|---|
| A ดูข้อมูลและผู้รับผิดชอบ | ได้ | ได้ | ได้ | ได้ | ใช้ [Customer Portal](customer-portal.md) |
| A มอบหมาย Technician | ได้ | ได้ | ไม่ได้ | ไม่ได้ | ไม่ได้ |
| A ออกลิงก์เชิญ Customer | `[ไม่ระบุ]` | ได้ | ไม่ได้ | ไม่ได้ | ไม่ได้ |
| A บันทึกผลการซ่อม | ได้ | ไม่ได้ | ได้ | ไม่ได้ | ไม่ได้ |
| B เปลี่ยนสถานะงานซ่อม | ได้ | ไม่ได้ | ได้ | ไม่ได้ | ไม่ได้ |
| B ยกเลิก | ได้ | ได้ | ไม่ได้ | ไม่ได้ | ไม่ได้ |
| C ออกและส่ง Quotation | ได้ | ได้ | ไม่ได้ | ไม่ได้ | ไม่ได้ |
| C บันทึกคำตอบแทน Customer | ได้ | ได้ | ไม่ได้ | ไม่ได้ | ตอบเองใน Portal |
| D Issue, คืน Part, Part เสีย | ได้ | ไม่ได้ | ได้ | ไม่ได้ | ไม่ได้ |
| E บันทึก Customer Contact Task | `[ไม่ระบุ]` | `[ไม่ระบุ]` | `[ไม่ระบุ]` | `[ไม่ระบุ]` | ไม่ได้ |
| F บันทึก Payment, เปลี่ยนเป็น DELIVERED | ได้ | ได้ | ไม่ได้ | ไม่ได้ | ไม่ได้ |
| C, D, F, G อ่าน | ได้ | ได้ | ได้ | ได้ | เฉพาะที่อยู่ใน Portal |

Expired Shop เห็นทุกส่วนแบบอ่านอย่างเดียว

## AC ที่หน้านี้รองรับ

AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13, AC-14, AC-15, AC-16, AC-17, AC-18, AC-19, AC-20, AC-21, AC-22, AC-23, AC-24, AC-25, AC-26, AC-27, AC-28, AC-29, AC-30, AC-31, AC-32, AC-33, AC-34, AC-35, AC-36

## เรื่องที่ยังไม่ตัดสิน

| คำถาม | AC | สิ่งที่ขึ้นกับคำตอบ |
|---|---|---|
| [ยังไม่ตัดสิน Q1] | AC-30, AC-35 | ปุ่มคืน Device ของ CANCELLED ที่ยังมี Outstanding Balance |
| [ยังไม่ตัดสิน Q4] | AC-20 | มีปุ่มเริ่มซ่อมต่อหรือไม่ และจัดสรรบางรายการแล้วเปลี่ยนสถานะได้หรือไม่ |
| [ยังไม่ตัดสิน Q5] | AC-18, AC-26, AC-30 | สูตร Outstanding Balance และสถานะหลังปฏิเสธ Quotation เพิ่มเติม |
| [ยังไม่ตัดสิน Q6] | AC-27 | ส่วน E ต้องแสดง Task ให้ Customer ที่มี User ด้วยหรือไม่ |
| [ยังไม่ตัดสิน Q7] | AC-16 | ค่าในคอลัมน์ Reserved และ Part Request เมื่อของไม่พอ |
| [ยังไม่ตัดสิน Q9] | AC-27, AC-34 | สิ่งที่แสดงกับ Reserved ที่เหลือตอน COMPLETED และ Part Request ที่ค้างตอนยกเลิก |

ค่าในตัวอย่างของส่วน D เป็นเพียงภาพหนึ่งในหลายคำตอบ ไม่ได้แปลว่าเลือกแบบนั้นแล้ว

## เรื่องที่เอกสารยังไม่ได้กำหนด

ป้าย `[ไม่ระบุ]` บนหน้านี้ชี้ไปที่[รายการในหน้ารวม](README.md#สิ่งที่พบระหว่างทำ-wireframe) ได้แก่ สิทธิ์ของ Customer Contact Task, สิทธิ์แนบรูปหลังเปิดงาน, ผู้สั่ง `RESERVE` ของชิ้นทดแทน, ช่วงที่บันทึก Payment ได้, ลิงก์เชิญ Customer ของ Owner และการส่งต่อหลังตรวจเสร็จ
