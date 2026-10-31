# เปิด Work Order

[กลับไปหน้ารวม](README.md)

ใช้ตอนรับ Device เมื่อบันทึกแล้วจะไป[รายละเอียด Work Order](work-order-detail.md) ที่สถานะ RECEIVED

```text
+-- RepairFlow | Work Orders | Parts | Dashboard{O} | [Notifications 3] | Somsri v
|
|  < Work Orders
|  New Work Order
|
|  1. Customer *
|     Search name or phone [______________]   [+ New Customer]
|     New Customer: Name * [__________]  Phone [__________]
|
|  2. Device *
|     Existing device of this Customer [Select v]   [+ New Device]
|     New Device: Type/Model * [__________]
|
|  3. Problem *
|     [________________________________________]
|
|  4. Promised Date [ไม่ระบุว่าบังคับหรือไม่]
|     [yyyy-mm-dd]
|
|  5. Photos (0/5, optional)
|     [+ Add photo]
|     Upload failed: photo-1.jpg  [Retry]  [Skip]
|
|  [Cancel]                                    [Create Work Order]
```

- อัปโหลดรูปไม่ได้ต้องไม่ขวางการเปิดงาน จึงกด `[Skip]` แล้วสร้าง Work Order ต่อได้ (AC-08)
- เมื่อครบ 5 รูป ปุ่ม `[+ Add photo]` จะหายไป
- ปุ่ม `[Cancel]` ของหน้านี้ออกจากฟอร์มเฉยๆ ยังไม่เกิด Work Order จึงไม่ใช่การเปลี่ยนเป็น CANCELLED
- การมอบหมาย Technician ทำในหน้ารายละเอียดหลังเปิดงาน
- ถ้าบันทึกสำเร็จ Status History มีรายการแรกเป็น RECEIVED (AC-07)

## บทบาทและสิทธิ์

| ส่วนของหน้า | Owner | Receptionist | Technician | Customer |
|---|---|---|---|---|
| เข้าหน้านี้และสร้าง Work Order กับ Customer | ได้ | ได้ | ไม่ได้ | ไม่ได้ |

บทบาทที่ไม่มีสิทธิ์ไม่เห็นปุ่มเข้าหน้านี้ และถ้าเปิด URL ตรงจะเห็นหน้าไม่มีสิทธิ์ ส่วน Expired Shop เปิดงานใหม่ไม่ได้ เพราะพนักงานอ่านได้อย่างเดียว

## AC ที่หน้านี้รองรับ

AC-03, AC-05, AC-07, AC-08, AC-36

ไม่มี AC ของหน้านี้ที่ติดคำถามเปิด

## เรื่องที่เอกสารยังไม่ได้กำหนด

- AC-07 บอกว่าเก็บ Promised Date แต่ไม่ได้บอกว่าต้องกรอก ([รายการทั้งหมด](README.md#สิ่งที่พบระหว่างทำ-wireframe))
