# คลัง Part

[กลับไปหน้ารวม](README.md)

ดูยอด Part ตาม 5 สถานะยอด และงานคลังของ Owner ส่วนการ Issue, `RETURN_UNUSED` และ `MARK_DEFECTIVE` ของ Part ในงานอยู่ที่[รายละเอียด Work Order](work-order-detail.md)

```text
+-- RepairFlow | Work Orders | Parts | Dashboard{O} | [Notifications 3] | Somsri v
|
|  Parts      Tabs: [Stock]  [Part Request queue]{O}  [Stock Movements]{O}
|
|  --- Tab: Stock ---
|  Search [____________]                    [+ Part]{O}  [RECEIPT]{O}
|
|  Part          Available  Reserved  Quarantine  Defective  At Vendor
|  ------------  ---------  --------  ----------  ---------  ---------
|  Screen i13    2          1         0           1          0     [Actions v]{O}
|  Battery i13   0          2         1           0          1     [Actions v]{O}
|
|  [Actions v]{O}
|     MARK_DEFECTIVE (not tied to a Work Order): STORE_DAMAGE / DOA
|     INSPECT_PASS, INSPECT_FAIL
|     VENDOR_SEND, VENDOR_RESOLVE
|     SCRAP         Reason * [__________]
|     COUNT_ADJUST  Reason * [__________]
|
|  RECEIPT form{O}: Part * [v]  Qty * [_]  To [Available/Quarantine v]  Unit cost [___]
|
|  --- Tab: Part Request queue{O} ---
|  #  Part         Qty  Work Order  Requested    Move
|  -  -----------  ---  ----------  -----------  ------
|  1  Battery i13  1    WO-1042     2026-11-12   [^][v]{O}
|  2  Battery i13  3    WO-1044     2026-11-13   [^][v]{O}
|  [ยังไม่ตัดสิน Q7] AC-16: จำนวนในคิวคือเฉพาะส่วนที่ขาดหรือทั้งหมด
|  [ยังไม่ตัดสิน Q4] AC-20: RECEIPT จัดสรรครบแล้ว Work Order เปลี่ยนเองหรือต้องกด
|  [ยังไม่ตัดสิน Q9] AC-34: Part Request ของงานที่ยกเลิกแล้วอยู่ในคิวต่อหรือไม่
|
|  --- Tab: Stock Movements{O} ---
|  When              Type           Part        Qty  Unit cost  Work Order  By
|  ----------------  -------------  ----------  ---  ---------  ----------  ------
|  2026-11-12 10:00  ISSUE          Screen i13  1    1,200.00   WO-1037     Mali
|  2026-11-12 09:30  RESERVE        Screen i13  1    -          WO-1037     Pim
|  2026-11-11 15:00  RELEASE        Screen i13  1    -          WO-1038     Somsri
```

- Stock Movement เป็นบันทึกที่แก้ไขไม่ได้ จึงไม่มีปุ่มแก้หรือลบ
- `RECEIPT` จัดสรรให้ Part Request ตามลำดับในคิวใน transaction เดียวกัน และเกิด Notification (AC-19)
- Part ที่ส่งเคลมด้วย DOA แยกไปยอด At Vendor ผ่าน `VENDOR_SEND` และ Customer ไม่ถูกคิดเงิน (AC-25)
- การยกเลิกงานคืน Reserved ของงานนั้นเป็น Available ด้วย `RELEASE` และเห็นในประวัติ (AC-34)

## บทบาทและสิทธิ์

| ส่วนของหน้า | Owner | Receptionist | Technician | Customer |
|---|---|---|---|---|
| แท็บยอด Part | ได้ | ดูอย่างเดียว | ดูอย่างเดียว | ไม่ได้ |
| รายการ Part, `RECEIPT` | ได้ | ไม่ได้ | ไม่ได้ | ไม่ได้ |
| `MARK_DEFECTIVE` ที่ไม่ผูกกับ Work Order | ได้ | ไม่ได้ | ไม่ได้ | ไม่ได้ |
| `INSPECT_PASS`, `INSPECT_FAIL`, `VENDOR_SEND`, `VENDOR_RESOLVE` | ได้ | ไม่ได้ | ไม่ได้ | ไม่ได้ |
| `COUNT_ADJUST`, `SCRAP`, จัดลำดับคิว | ได้ | ไม่ได้ | ไม่ได้ | ไม่ได้ |
| แท็บคิวและแท็บ Stock Movement | ได้ | `[ไม่ระบุ]` | `[ไม่ระบุ]` | ไม่ได้ |

Customer ไม่มีเมนูนี้ และถ้าเปิด URL ตรงจะเห็นหน้าไม่มีสิทธิ์ ส่วน Expired Shop เห็นแท็บที่บทบาทนั้นเข้าได้แบบอ่านอย่างเดียว

## AC ที่หน้านี้รองรับ

AC-03, AC-05, AC-16, AC-19, AC-20, AC-22, AC-25, AC-34

## เรื่องที่ยังไม่ตัดสิน

| คำถาม | AC | สิ่งที่ขึ้นกับคำตอบ |
|---|---|---|
| [ยังไม่ตัดสิน Q4] | AC-20 | ผลต่อ Work Order หลัง `RECEIPT` จัดสรรให้ครบหรือบางรายการ |
| [ยังไม่ตัดสิน Q7] | AC-16 | จำนวนที่แสดงในคิว |
| [ยังไม่ตัดสิน Q9] | AC-34 | แถวในคิวของงานที่ยกเลิกแล้ว |

## เรื่องที่เอกสารยังไม่ได้กำหนด

- ป้าย `[ไม่ระบุ]` คือตารางสิทธิ์ให้ Receptionist และ Technician "ดูยอด Part" แต่ไม่ได้ระบุว่ารวมคิวและประวัติหรือไม่ wireframe จึงแสดงเฉพาะ Owner ไว้ก่อน เพราะเป็นบทบาทเดียวที่มีสิทธิ์แน่นอน ([รายการทั้งหมด](README.md#สิ่งที่พบระหว่างทำ-wireframe))
