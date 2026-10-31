# Customer Portal

[กลับไปหน้ารวม](README.md)

Customer ที่มี User ใช้ติดตามงานและตอบ Quotation ของตนเอง ส่วน Customer ที่ไม่มี User เข้าหน้านี้ไม่ได้ และ Shop จะติดต่อผ่าน Customer Contact Task แทน

```text
+-- RepairFlow | [Notifications 1] | Somchai v
|
|  My repairs
|
|  iPhone 13
|    WO-1042  [WAITING_FOR_APPROVAL]   Promised Date 2026-11-20  Technician: Krit  [Open]
|  iPad 9
|    WO-0987  [DELIVERED]              Promised Date 2026-08-01  Technician: Mali  [Open]
|
|  --- Open: WO-1042 ---
|  Device: iPhone 13
|  Problem: screen does not turn on
|  Status: WAITING_FOR_APPROVAL
|  Technician: Krit
|
|  Quotation v2 (SENT)   expires 2026-11-25
|     Labor        800.00
|     Screen x1  1,700.00
|     Total      2,500.00
|     [Approve]   [Reject]
|     [ยังไม่ตัดสิน Q5] AC-18, AC-26: ปฏิเสธ Quotation เพิ่มเติมแล้วงานจะกลับ DIAGNOSING หรือไม่
|
|  Quotation v1 (SUPERSEDED)   no reply possible
|
|  Status History
|     2026-11-11 16:00  DIAGNOSING -> WAITING_FOR_APPROVAL
|     2026-11-11 10:05  RECEIVED -> DIAGNOSING
|     2026-11-10 14:12  (new) -> RECEIVED
```

สถานะหลังตอบ Quotation:

```text
|  Approve, Available enough     -> Status: IN_PROGRESS
|  Approve, Available not enough -> Status: WAITING_FOR_PARTS
|     [ยังไม่ตัดสิน Q7] AC-16: จองบางส่วนหรือเข้าคิวทั้งหมด Customer เห็นสถานะเดียวกัน
|  Reject                        -> Status: DIAGNOSING, decision kept in history
|  Failed / expired / already answered -> error, nothing changed
```

แจ้งเมื่องานเสร็จ:

```text
|  [Notifications 1]
|     WO-1042 is COMPLETED. Please come to pick up your device.
|     [ยังไม่ตัดสิน Q6] AC-27: ถ้ายังไม่รับทราบ พนักงานต้องได้ Customer Contact Task หรือไม่
```

- แสดง Technician ในงาน เพราะ AC-09 กำหนดว่าทุกคนที่เห็น Work Order เห็นว่าใครรับผิดชอบ
- ปุ่ม `[Approve]` และ `[Reject]` แสดงเฉพาะ Quotation ที่ส่งแล้ว ยังไม่หมดอายุ และยังไม่ถูกตอบ (AC-12, AC-17)
- กดซ้ำได้ผลเดิมและไม่เกิดรายการซ้ำ (AC-06)
- เมื่อ Work Order เป็น DELIVERED ยังเห็น Status History ครบ (AC-32)
- URL ของ Work Order ของ Customer อื่นแสดงไม่พบข้อมูล โดยไม่บอกว่ามีงานนั้นอยู่หรือไม่ (AC-04)

## บทบาทและสิทธิ์

| ส่วนของหน้า | Customer ที่มี User | Customer ที่ไม่มี User | พนักงาน |
|---|---|---|---|
| Device, Work Order, Status History | ของตนเท่านั้น | เข้าไม่ได้ | ใช้[รายละเอียด Work Order](work-order-detail.md) |
| Quotation | ของตนเท่านั้น | เข้าไม่ได้ | ใช้รายละเอียด Work Order |
| ตอบ Quotation | ของตนเท่านั้น | ตอบนอกระบบให้พนักงานบันทึกแทน | บันทึกแทนในรายละเอียด Work Order |

| สถานะร้าน | สิ่งที่ Customer ทำได้ |
|---|---|
| Expired Shop | ติดตามงานและตอบ Quotation ที่ค้างได้ |
| Suspended Shop | เห็นเฉพาะหน้าแจ้งว่าร้านถูกระงับ |

## AC ที่หน้านี้รองรับ

AC-03, AC-04, AC-05, AC-06, AC-09, AC-12, AC-13, AC-14, AC-15, AC-16, AC-17, AC-18, AC-26, AC-27, AC-32, AC-36

## เรื่องที่ยังไม่ตัดสิน

| คำถาม | AC | สิ่งที่ขึ้นกับคำตอบ |
|---|---|---|
| [ยังไม่ตัดสิน Q5] | AC-18, AC-26 | ข้อความและสถานะหลังปฏิเสธ Quotation เพิ่มเติม |
| [ยังไม่ตัดสิน Q6] | AC-27 | ถ้าคำตอบคือต้องเกิด หน้านี้ต้องบันทึกว่า Customer รับทราบ Notification แล้ว |
| [ยังไม่ตัดสิน Q7] | AC-16 | ไม่เปลี่ยนสิ่งที่หน้านี้แสดง เพราะหน้านี้ไม่แสดงจำนวนที่จอง |
| [ยังไม่ตัดสิน Q9] | AC-27 | ไม่เปลี่ยนสิ่งที่หน้านี้แสดง เพราะ Customer ไม่เห็นยอด Reserved |

## เรื่องที่เอกสารยังไม่ได้กำหนด

- ไม่ได้แสดง Outstanding Balance, Payment และรูปภาพ เพราะ[ขอบเขต MVP](../prd.md#ขอบเขต-mvp)ระบุเฉพาะงาน สถานะ และ Quotation แต่ไม่มีข้อห้ามชัดเจน ([รายการทั้งหมด](README.md#สิ่งที่พบระหว่างทำ-wireframe))
- หน้าล็อกอินและหน้ารับลิงก์เชิญอยู่นอก 6 หน้านี้
