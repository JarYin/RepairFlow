# รายการ Work Order

[กลับไปหน้ารวม](README.md)

หน้าแรกของพนักงาน ใช้หางานและดูว่าใครรับผิดชอบงานใด

```text
+-- RepairFlow | Work Orders | Parts | Dashboard{O} | [Notifications 3] | Somsri v
|
|  Work Orders                                         [+ New Work Order]{O R}
|
|  Search [______________]
|  Status [All v]  Technician [All v]  Date [from] - [to]  Customer [________]
|  [ ] Overdue   [ ] Open Customer Contact Task
|
|  WO       Status                Technician  Customer  Device     Promised Date
|  -------  --------------------  ----------  --------  ---------  -------------
|  WO-1042  IN_PROGRESS           Krit        Somchai   iPhone 13  2026-11-20
|  WO-1041  WAITING_FOR_APPROVAL  Krit        Nida      iPad 9     2026-11-02 (!)
|  WO-1040  RECEIVED              -           Anan      MacBook    2026-11-25
|  WO-1039  COMPLETED             Mali        Pim       Switch     2026-11-01  (Task)
|
|  < 1 2 3 >
```

- `(!)` คืองานเกินกำหนดตาม[นิยามในรายงาน](../architecture.md#รายงาน)
- `(Task)` คืองานที่มี Customer Contact Task ค้าง
- `-` ในคอลัมน์ Technician คืองานที่ยังไม่ได้มอบหมาย
- กดแถวเพื่อไป[รายละเอียด Work Order](work-order-detail.md)

## บทบาทและสิทธิ์

| ส่วนของหน้า | Owner | Receptionist | Technician | Customer |
|---|---|---|---|---|
| เห็นรายการ | ทั้งร้าน | ทั้งร้าน | ทั้งร้าน | ไม่ใช้หน้านี้ ([Customer Portal](customer-portal.md)) |
| ค้นหาและกรอง | ได้ | ได้ | ได้ | ไม่ได้ |
| ปุ่มเปิด Work Order | เห็น | เห็น | ไม่เห็น | ไม่ได้ |

Technician เห็นงานทั้งร้าน แต่เขียนได้เฉพาะงานที่รับมอบหมาย ซึ่งความต่างนี้อยู่ใน[รายละเอียด Work Order](work-order-detail.md) และตัวกรอง Technician ใช้หางานของตนเองได้ (User Story 5)

## AC ที่หน้านี้รองรับ

AC-03, AC-04, AC-05, AC-09, AC-28, AC-36

ไม่มี AC ของหน้านี้ที่ติดคำถามเปิด
