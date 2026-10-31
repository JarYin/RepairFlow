# Dashboard

[กลับไปหน้ารวม](README.md)

ให้ Owner เห็นภาพรวมของ Shop จากข้อมูลจริง ตัวเลขใช้[นิยามในรายงาน](../architecture.md#รายงาน) และทุกตัวเลขหลักกดดูรายการต้นทางได้

```text
+-- RepairFlow | Work Orders | Parts | Dashboard{O} | [Notifications 3] | Owner v
|
|  Dashboard           Range [This month v]   (Shop timezone: Asia/Bangkok)
|
|  Work Orders by status
|    RECEIVED              4  >
|    DIAGNOSING            3  >
|    WAITING_FOR_APPROVAL  2  >
|    WAITING_FOR_PARTS     1  >
|    IN_PROGRESS           5  >
|    COMPLETED             2  >
|    DELIVERED            40  >
|    CANCELLED             3  >
|
|  Overdue             3  >
|  Avg repair time     2.4 days  >
|  Revenue             85,000.00  >
|  Repair Damage cost  1,700.00  >
|
|  Open Work Orders by Technician
|    Krit   6  >
|    Mali   4  >
|    -      2  >
|
|  --- Source rows (after clicking Revenue) ---
|  Date        Work Order  Amount     Method  Received by
|  ----------  ----------  ---------  ------  -----------
|  2026-11-15  WO-1042     1,000.00   cash    Somsri
|  ...
|  Total                   85,000.00
```

| ตัวเลข | กดแล้วไปที่ |
|---|---|
| งานตามสถานะ, งานเกินกำหนด, งานของ Technician | [รายการ Work Order](work-order-list.md) พร้อมตัวกรองนั้น |
| ต้นทุนความเสียหาย | แท็บ Stock Movement ของ[คลัง Part](inventory.md) เฉพาะ Repair Damage |
| ระยะเวลาซ่อมเฉลี่ย, รายได้ | รายการต้นทางบนหน้านี้ เพราะไม่มีหน้าอื่นที่แสดงรายการเหล่านี้ |

ยอดรวมของรายการต้นทางต้องเท่ากับตัวเลขที่กด และระยะเวลาซ่อมเฉลี่ยไม่รวมงาน CANCELLED

## บทบาทและสิทธิ์

| ส่วนของหน้า | Owner | Receptionist | Technician | Customer |
|---|---|---|---|---|
| เข้าหน้านี้และกดดูรายการต้นทาง | ได้ | ไม่ได้ | ไม่ได้ | ไม่ได้ |

บทบาทอื่นไม่เห็นเมนูนี้ และถ้าเปิด URL ตรงจะเห็นหน้าไม่มีสิทธิ์ ส่วน Expired Shop ยังอ่านได้เพราะหน้านี้ไม่มีการเขียน

## AC ที่หน้านี้รองรับ

AC-03, AC-05

Acceptance Criteria ของ Workflow หลักไม่มีข้อเรื่องรายงาน หน้านี้จึงตรวจรับด้วย[สถานการณ์ของปัญหาข้อ 6](../prd.md#ปัญหาและสถานการณ์ที่พิสูจน์ได้) และไม่มี AC ของหน้านี้ที่ติดคำถามเปิด
