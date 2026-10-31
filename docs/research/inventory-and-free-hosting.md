# RepairFlow: การจัดการสต็อกอะไหล่ และ free hosting

ค้นคว้าและอ่านข้อมูลเมื่อ **2026-10-31** ตัวเลข pricing/limit ทุกตัวในเอกสารนี้อ่านในวันที่นี้ ถ้าไม่ได้ระบุเป็นอย่างอื่น

ข้อความที่ขึ้นต้นด้วย **[ข้อสรุปของผู้เขียน]** เป็นการอนุมานหรือคำแนะนำของผู้เขียน ไม่ใช่ข้อเท็จจริงจากเอกสารของ vendor

## สรุปสั้น

**Inventory**

- ระบบ repair shop ที่อ่านมา (Syncro, RepairDesk) ยอมให้สต็อกติดลบ ส่วน ERP (Odoo, ERPNext, SAP) ใช้ reservation เป็นกลไกแยกต่างหาก ในเอกสารที่อ่านได้ ไม่มีระบบใดอธิบายกติกาตัดสินเมื่อหลายงานแย่งอะไหล่ชิ้นเดียวกัน
- การแยกสถานะสต็อกมีสองแบบ คือแยกด้วย location/warehouse (Odoo, ERPNext) และแยกด้วย stock type (SAP) RepairDesk ใช้ report และ status ของ item ที่เสีย
- ไม่พบเอกสารของ vendor รายใดที่กำหนดว่าอะไหล่เสียระหว่างซ่อมแล้วใครรับต้นทุน พบแค่กรณี warranty ของ Odoo ที่ไม่คิดเงินลูกค้า นี่จึงเป็น policy ที่ RepairFlow ต้องตัดสินใจเอง
- Model ขั้นต่ำที่เสนอมี 5 สถานะกับ 12 movement type (ดูท้าย Question 1)

**Hosting (ต้องฟรีจริงเท่านั้น)**

- **ไม่มี option ไหนได้ครบ** ทั้ง long-running Node ที่ไม่หลับ, Postgres ถาวร, ไม่ใส่บัตร และไม่มีข้อจำกัดเรื่องการ reclaim หรือ suspend ทุกชุดต้องยอมแลกบางอย่าง
- **ตัดออกเพราะต้องจ่ายหรือมีความเสี่ยงโดนเก็บเงิน:** Fly.io, Cloudflare Containers, Koyeb (สมัครใหม่), Railway (เครดิตไม่พอ), Google Cloud (ต้องผูกบัญชี billing)
- **Render Free** เป็นที่รันเซิร์ฟเวอร์ Node ฟรีที่ตรงโจทย์ที่สุด แต่หลับหลังไม่มี inbound traffic 15 นาที ทำให้ in-process poller หยุดด้วย และ **Postgres ของ Render หมดอายุใน 30 วัน** จึงต้องใช้ DB ที่อื่น
- **ข้อควรระวังหลักของ Neon:** ถ้า poller ถี่กว่า 5 นาทีและแอปไม่หลับ compute จะไม่ได้ suspend ค่าที่ 0.25 CU จะใช้ประมาณ 180 CU-hours ต่อเดือน เกิน quota 100 ทำให้ DB ถูก suspend จนถึงรอบถัดไป (ตัวเลขนี้เป็นการคำนวณของผู้เขียน ดูหัวข้อ "Poller กับ Neon")
- **ข้อควรระวังหลักของ RLS:** `FORCE ROW LEVEL SECURITY` ไม่มีผลกับ role ที่มี `BYPASSRLS` และ role หลักของ Neon (สร้างจาก Console) และ Supabase (`postgres`) มี attribute นี้ แอปจึงต้องต่อด้วย role อื่น
- **Email:** Resend ต้องมีโดเมนของตัวเอง ส่วน Brevo ใช้ verified sender ได้ แต่ที่อยู่ฟรีจะถูกเขียนทับเป็นโดเมนของ Brevo ซึ่ง Brevo เองเรียกว่าทางแก้ชั่วคราว การซื้อโดเมนจึงเป็นรายจ่ายที่ต้องระวัง
- **ข้อเสนอของผู้เขียน:** Vercel Hobby + Render Free + Neon Free + Brevo โดยยอมรับ cold start (ชุด A)

---

## Question 1: การจัดการสต็อกอะไหล่ในระบบซ่อม

### 1.1 Reservation เทียบกับการตัดสต็อกตอนเบิก และการแย่งอะไหล่

| ระบบ | ข้อเท็จจริงที่เอกสารระบุ | แหล่งที่มา |
|---|---|---|
| Odoo 19 Repairs | กด Confirm Repair แล้วระบบ "reserves the necessary components" และมีฟิลด์ Component Status บอกว่าอะไหล่พร้อมหรือไม่ หน้านี้ไม่ได้ระบุว่าตัดสต็อกตอนไหนอย่างชัดเจน | [Odoo repair orders](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/repairs/repair_orders.html) |
| Odoo 19 Inventory | มี 3 วิธี reservation: At Confirmation (จองเมื่อมีของ), Manually, Before scheduled date ตั้งค่าราย operation type transfer ที่ติดดาวตั้งจำนวนวันแยกได้ หน้านี้ไม่ได้พูดถึงการตัดสินเมื่อ order แย่งกัน | [Odoo reservation methods](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/inventory/shipping_receiving/reservation_methods.html) |
| ERPNext | Stock Reservation Entry เป็น feature ที่ต้องเปิดใน Stock Settings จองจาก Sales Order หรือ Pick List ได้ และจองอัตโนมัติเมื่อรับของจาก Purchase Receipt ได้ ยกเลิกจองได้ หน้านี้ไม่ได้พูดถึง partial reservation | [ERPNext stock reservation](https://docs.frappe.io/erpnext/stock-reservation) |
| ERPNext | Projected Qty = Actual + Planned + Requested + Ordered - Reserved (และ reserved ประเภทอื่น) | [ERPNext projected quantity](https://docs.frappe.io/erpnext/user/manual/en/projected-quantity) |
| Syncro | ของที่มีอยู่ถูก reserve ก่อน ส่วนที่ขาดทำให้สต็อกติดลบและไปโผล่ที่หน้า Pending Orders ตอนรับของจาก PO ถ้าเลือก fulfill ของจะถูกจัดสรรให้ pending orders แทนการเข้า In Stock บทความนี้พูดถึง invoice ไม่ได้พูดถึง ticket และ Syncro ระบุเองว่ายังไม่ได้ verify บทความ | [Syncro pending orders](https://docs.syncrosecure.com/products-services-inventory/pending-orders) |
| RepairDesk | เพิ่มของที่หมดสต็อกลง ticket จะมี popup และเลือก Proceed Anyway ได้ ซึ่งทำให้สต็อกติดลบ บทความไม่ได้พูดถึง reservation หรือจังหวะตัดสต็อก | [RepairDesk add item to ticket](https://help.repairdesk.co/portal/en/kb/articles/how-to-add-an-inventory-item-to-a-ticket) |
| RepairDesk | Special Part Order สร้างจาก ticket ได้ ถ้าไม่กรอก Receive Date ticket จะเป็น Waiting for Parts และส่ง email/SMS แจ้งลูกค้า ของที่อยู่ใน inventory จะเพิ่มสต็อกเมื่อทำ GRN | [RepairDesk special part order](https://help.repairdesk.co/portal/en/kb/articles/how-to-create-a-special-part-order-in-the-repairdesk) |
| RepairShopr | Parts Orders ผูกกับ ticket ติดตามสถานะได้ และสร้าง charge อัตโนมัติเมื่อ invoice หน้า features ระบุถึง "RMA and return tracking, rework tracking" แต่ไม่มีรายละเอียด | [RepairShopr features](https://www.repairshopr.com/features) |
| SAP | Refurbishment order จองจำนวนที่ระบุไว้ใน storage location ตอน save (อ่านจาก excerpt ใน search result) | [SAP refurbishment order processing](https://help.sap.com/doc/b183ce53118d4308e10000000a174cb4/700_SFIN3E%20006/en-US/44cab65334e6b54ce10000000a174cb4.html) |

**การแย่งอะไหล่, waitlist, priority:** ไม่พบเอกสารของระบบใดที่อธิบายกติกาการจัดลำดับระหว่างงาน Syncro บอกแค่ว่าจัดสรรให้ pending orders แต่ไม่บอกลำดับ ([Syncro](https://docs.syncrosecure.com/products-services-inventory/pending-orders)) ส่วน Odoo มีแค่ค่าวันจองแยกของ transfer ที่ติดดาว ([Odoo](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/inventory/shipping_receiving/reservation_methods.html))

### 1.2 อะไหล่เสีย

| สถานการณ์ | ระบบ | ข้อเท็จจริง | แหล่งที่มา |
|---|---|---|---|
| เสียในคลัง | Odoo | Scrap ย้ายของออกจาก on hand ไปยัง virtual Inventory Loss location สร้าง scrap order จาก receipt, delivery หรือ internal transfer ได้ | [Odoo scrap](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/inventory/warehouses_storage/inventory_management/scrap_inventory.html) |
| เสียในคลัง | RepairDesk | Inventory Adjustment ใช้กับ theft, loss, breakages, errors มีชนิด Increase Stock, Decrease Stock, Revalue Cost | [RepairDesk adjustment](https://help.repairdesk.co/portal/en/kb/articles/inventory-adjustment) |
| เสียระหว่างซ่อม / warranty ของอะไหล่ | RepairDesk | ถ้าอะไหล่มี warranty เปิด warranty claim แล้วเลือก faulty หรือ broken ระบบปรับสต็อก, ticket history และ part status ให้เอง บทความไม่ได้บอกเรื่องต้นทุนหรือการคิดเงินลูกค้า | [RepairDesk warranty claim](https://help.repairdesk.co/portal/en/kb/articles/how-to-add-a-new-repair-part-process-a-warranty-claim-for-a-repair-part) |
| จัดการของเสีย | RepairDesk | Damage Part Report มี action 3 แบบ: restock, สร้าง RMA, mark breakage (เก็บเป็น record อย่างเดียว) | [RepairDesk damage report](https://help.repairdesk.co/portal/en/kb/articles/damage-part-report) |
| DOA จาก supplier / ตรวจตอนรับ | ERPNext | Purchase Receipt รับของเข้า Accepted หรือ Rejected Warehouse แยกกันได้ และคืนของจาก Rejected Warehouse ด้วยจำนวนติดลบ | [ERPNext return rejected](https://docs.frappe.io/erpnext/return-rejected-item) |
| Quarantine รอตรวจ | Odoo | Quality Control Point ตั้ง failure location ได้ ของที่ตรวจไม่ผ่านจะถูกส่งไปที่นั่น ส่วนของที่ผ่านเข้าที่เก็บปกติ (อ่านจาก excerpt ใน search result) | [Odoo failure locations](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/quality/quality_management/failure_locations.html) |
| Quarantine รอตรวจ | SAP | Stock type quality inspection และ blocked เบิกไม่ได้ตามค่ามาตรฐาน แต่ตั้ง Customizing ให้ available ได้ | [SAP stock types](https://help.sap.com/doc/a6a8c7536e8e2a4be10000000a174cb4/700_SFIN3E%20006/en-US/299bc7536e8e2a4be10000000a174cb4.html) |

### 1.3 RMA กับ vendor, ส่งซ่อมนอก, ของ refurbished

- **RepairDesk RMA:** มี vendor, reason, requested resolution, tracking และ status (ตัวอย่างในบทความ: In Progress, Sent to Supplier, Refunded) ปิดด้วย Refund หรือ Credit Note ก็ได้ credit เก็บไว้ที่ supplier และใช้กับ PO ถัดไปได้ สินค้า serialized จะเป็น "In RMA" และยังไม่ออกจากสต็อกจนกว่าสถานะจะเป็น sent to supplier บทความไม่ได้อธิบายสินค้าที่ไม่ serialized และกระบวนการ replacement ([RepairDesk RMA](https://help.repairdesk.co/portal/en/kb/articles/how-does-rma-work))
- **Syncro:** ตอน refund เลือกได้ว่าเป็น Pending (ไป Returns Manager), Restock (เข้าสต็อกและปรับจำนวน) หรือ RMA Request ([Syncro refunding](https://docs.syncrosecure.com/refunding))
- **Syncro Refurbs:** เพิ่มอะไหล่เข้า refurb แล้ว available ลดลง และจะถูกหักเมื่อ refurb เสร็จ กด Complete แล้วเครื่องเข้า stock ต้นทุนปรับตามของที่ใส่เข้าไป ([Syncro refurbs](https://docs.syncrosecure.com/refurbs-resell-purchases))
- **SAP Repairable spares:** เป็นระบบที่ละเอียดที่สุด แยก valuation ตามสถานะ เช่น New, Refurbished, Defective ผ่าน split valuation ([SAP repairable spare](https://help.sap.com/doc/b183ce53118d4308e10000000a174cb4/700_SFIN3E%20006/en-US/41cab65334e6b54ce10000000a174cb4.html)) เบิกของเสียเข้า refurbishment order เป็น goods issue รับกลับเป็น goods receipt และอัปเดต batch/valuation type ส่วนที่ซ่อมไม่ได้ให้ยกเลิกการจองแล้ว post เป็น scrap ([SAP refurbishment](https://help.sap.com/doc/b183ce53118d4308e10000000a174cb4/700_SFIN3E%20006/en-US/44cab65334e6b54ce10000000a174cb4.html))
- **ERPNext:** มี Stock Entry ชนิด Send to Subcontractor ([ERPNext stock entry](https://docs.frappe.io/erpnext/user/manual/en/stock-entry)) แต่ไม่พบเอกสารของ flow ส่งอะไหล่ที่เสียไปซ่อมนอก สิ่งที่พบเป็น subcontracting แบบการผลิต ([ERPNext subcontracting](https://docs.frappe.io/erpnext/user/manual/en/subcontracting))
- **Odoo:** Parts ของ repair order มี 3 ชนิด: Add, Remove, Recycle โดย Recycle คือถอดเก็บไว้ใช้ภายหลังในคลัง ([Odoo repair orders](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/repairs/repair_orders.html)) ยังไม่พบ procedure คืนของให้ vendor หลังตรวจไม่ผ่านในหน้าที่อ่าน

### 1.4 Scrap, คืนของเหลือจากงาน, นับสต็อก

- **Scrap:** Odoo อยู่ในหัวข้อ 1.2 ส่วน SAP ใช้ movement type 551 สำหรับ scrap จาก unrestricted (553 จาก inspection, 555 จาก blocked) อ่านจาก excerpt ใน search result ของ help.sap.com เท่านั้น ([SAP goods movement type](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/ee6ff9b281d8448f96b4fe6c89f2bdc8/8b7b5fe73ef54063a2bfcfbe83cebd38.html))
- **คืนของที่ไม่ได้ใช้:** Odoo ตอน End Repair ถ้าจำนวนที่ใช้ต่างจาก demand จะมี popup ให้ยืนยัน ([Odoo repair orders](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/repairs/repair_orders.html)) ไม่พบเอกสารของ RepairDesk ที่บอกว่าการลบอะไหล่ออกจาก ticket คืนสต็อกอัตโนมัติหรือไม่
- **นับสต็อก:**
  - Odoo: คำนวณ Difference ระหว่าง On Hand กับ Counted แล้ว Apply ([Odoo count products](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/inventory/warehouses_storage/inventory_management/count_products.html))
  - ERPNext: Stock Reconciliation post ส่วนต่างเข้า difference account ซึ่งใช้ตั้งยอดเปิดได้ด้วย ([ERPNext reconciliation](https://docs.frappe.io/erpnext/user/manual/en/stock-reconciliation))
  - Syncro: มี Expected และ Counted Quantity พร้อมเหตุผล Borrowed, Broken, Lost และถ้าไม่ติ๊ก Update to Counted จำนวนจะไม่เปลี่ยน ([Syncro stock take](https://docs.syncrosecure.com/stock-take-inventory-reconciliation))
  - RepairDesk: ต้องเปิด Update Inventory Level จึงปรับสต็อก และ count ที่ save แล้วแก้ไม่ได้ ([RepairDesk count](https://help.repairdesk.co/portal/en/kb/articles/inventory-count))

### 1.5 แต่ละระบบ model สถานะอย่างไร

| ระบบ | รูปแบบ | รายละเอียด | แหล่งที่มา |
|---|---|---|---|
| Odoo | Location | ชนิด location: Vendor, Virtual, Internal, Customer, Inventory Loss, Production, Transit ซึ่งชนิดกำหนดพฤติกรรมของ stock move และ valuation | [Odoo locations](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/inventory/warehouses_storage/inventory_management/use_locations.html) |
| ERPNext | Warehouse + เอกสาร | Stock Entry: Material Issue, Receipt, Transfer, Send to Subcontractor ฯลฯ และ Accepted/Rejected Warehouse | [ERPNext stock entry](https://docs.frappe.io/erpnext/user/manual/en/stock-entry) |
| SAP | Stock type + movement type | Unrestricted, quality inspection, blocked | [SAP stock types](https://help.sap.com/doc/a6a8c7536e8e2a4be10000000a174cb4/700_SFIN3E%20006/en-US/299bc7536e8e2a4be10000000a174cb4.html) |
| SAP | Movement type (จาก excerpt เท่านั้น) | 261 consumption for order, 311 ย้าย storage location, 321 QI ไป unrestricted, 551 scrap, 122 คืน vendor | [SAP goods movements](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/95f56a29a41e4861ba3424598848ee2b/4d6df0468bf051b0e10000000a42189c.html) |
| RepairDesk | ยอดเดียว + status ของ item | "In RMA", faulty, breakage ผ่าน report | [RepairDesk damage report](https://help.repairdesk.co/portal/en/kb/articles/damage-part-report) |
| Syncro | ยอดเดียว + Returns Manager | ติดลบได้, Pending Orders | [Syncro pending orders](https://docs.syncrosecure.com/products-services-inventory/pending-orders) |

### 1.6 ต้นทุนและการคิดเงินลูกค้าเมื่ออะไหล่เสียระหว่างซ่อม

- Odoo: ถ้าสินค้าอยู่ใน warranty "the Customer is not charged for all the parts used in the repair order" ถ้าไม่อยู่ ใช้ Create Quotation ซึ่งเติมอะไหล่และ cost ให้ ([Odoo repair orders](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/repairs/repair_orders.html))
- ERPNext: Warranty Claim มีสถานะ Under/Out of Warranty, AMC หน้านี้ไม่พูดถึงผลต่อสต็อก ([ERPNext warranty claim](https://docs.frappe.io/erpnext/user/manual/en/warranty-claim))
- SAP: order ได้รับ credit ตามจำนวนที่ส่งมอบคูณราคาปัจจุบันของ material ที่ refurbish แล้ว และ settle ต้นทุนเข้า material ([SAP refurbishment](https://help.sap.com/doc/b183ce53118d4308e10000000a174cb4/700_SFIN3E%20006/en-US/44cab65334e6b54ce10000000a174cb4.html))
- RepairDesk: ไม่ได้ระบุเรื่องต้นทุนหรือการคิดเงินใน claim ([RepairDesk warranty claim](https://help.repairdesk.co/portal/en/kb/articles/how-to-add-a-new-repair-part-process-a-warranty-claim-for-a-repair-part)) และ report ก็ไม่ได้ระบุ ([RepairDesk damage report](https://help.repairdesk.co/portal/en/kb/articles/damage-part-report))
- **ไม่พบ** เอกสารใดที่กำหนดกติกาว่า ช่างทำอะไหล่เสียแล้วใครรับต้นทุน

### 1.7 Minimum viable model สำหรับโปรเจกต์ 12 สัปดาห์

**[ข้อสรุปของผู้เขียน]** ทั้งหัวข้อนี้เป็นข้อเสนอของผู้เขียน โดยอิงจากสิ่งที่ตัดสินใจไปแล้ว (conditional UPDATE + `stock_movements` แบบ append-only)

**หลักการ:** เก็บยอดเป็น bucket แบบ SAP stock type แต่ไม่ทำ location hierarchy แบบ Odoo เพราะร้านซ่อมมีคลังเดียวในขอบเขตนี้ และ conditional UPDATE ทำงานกับคอลัมน์หรือแถวของ bucket ได้ตรงๆ

**ไม่ยอมให้สต็อกติดลบ** ต่างจาก Syncro และ RepairDesk เพราะเงื่อนไขของ conditional UPDATE ก็คือ invariant นี้ และเป็นจุดที่โชว์ใน portfolio ได้

**สถานะสต็อก (5 bucket ต่อ tenant + part):**

| Bucket | ความหมาย | เบิกได้ไหม |
|---|---|---|
| `AVAILABLE` | พร้อมใช้ | ได้ |
| `RESERVED` | จองให้งานแล้ว ยังไม่เบิก | เฉพาะงานนั้น |
| `QUARANTINE` | รอตรวจ | ไม่ได้ |
| `DEFECTIVE` | ยืนยันแล้วว่าเสีย รอตัดสินใจ | ไม่ได้ |
| `AT_VENDOR` | ส่ง RMA หรือส่งซ่อมนอก | ไม่ได้ |

อะไหล่ที่เบิกเข้างานแล้วหรือ scrap แล้วออกจากยอดคงเหลือ และดูย้อนหลังได้จาก ledger

**Movement types (12 แบบ):**

| Type | จาก → ไป | หมายเหตุ |
|---|---|---|
| `RECEIPT` | ภายนอก → `AVAILABLE` หรือ `QUARANTINE` | รับของเข้า |
| `RESERVE` | `AVAILABLE` → `RESERVED` | conditional UPDATE ผู้ commit ก่อนได้ของ |
| `RELEASE` | `RESERVED` → `AVAILABLE` | ยกเลิกงาน |
| `ISSUE` | `RESERVED` → งาน | จุดตัดต้นทุนเข้างาน |
| `RETURN_UNUSED` | งาน → `AVAILABLE` | คืนของเหลือ |
| `MARK_DEFECTIVE` | `AVAILABLE` หรืองาน → `QUARANTINE` | ต้องมี reason (`STORE_DAMAGE`, `REPAIR_DAMAGE`, `DOA`) |
| `INSPECT_PASS` | `QUARANTINE` → `AVAILABLE` | |
| `INSPECT_FAIL` | `QUARANTINE` → `DEFECTIVE` | |
| `VENDOR_SEND` | `DEFECTIVE` → `AT_VENDOR` | RMA หรือส่งซ่อม |
| `VENDOR_RESOLVE` | `AT_VENDOR` → `AVAILABLE` หรือภายนอก | ได้ของแทน ซ่อมกลับมา หรือ credit |
| `SCRAP` | `QUARANTINE` หรือ `DEFECTIVE` → ภายนอก | ต้องมี reason และผู้ทำรายการ |
| `COUNT_ADJUST` | ภายนอก ↔ `AVAILABLE` | ผลจากการนับ ต้องมี reason |

ทุกแถวเก็บ `tenant_id`, `part_id`, `qty`, `job_id` (ถ้ามี), `reason`, `actor`, `unit_cost` ตอนทำรายการ และ `created_at`

**กรณีแย่งอะไหล่:** ถ้า `RESERVE` ไม่สำเร็จ งานเข้าสถานะ `WAITING_PARTS` และมีแถวใน `part_requests` เมื่อของเข้า ให้จัดสรรแบบ FIFO ตาม `created_at` โดยมี manager ปรับลำดับเองได้ ส่วน priority แบบซับซ้อนตัดออก

**อะไหล่เสียระหว่างซ่อม:** แยก movement ออกจาก charge

- ทำ `MARK_DEFECTIVE` พร้อม `job_id` แล้ว `RESERVE` + `ISSUE` ใหม่
- เก็บ `billable` บน charge line แยกต่างหาก `REPAIR_DAMAGE` ไม่คิดเงินลูกค้าเป็นค่าเริ่มต้น
- ต้นทุนชิ้นที่เสียแสดงเป็น "ต้นทุนร้าน" ไม่รวมในราคาขายของงาน ส่วน `DOA` ให้ไป claim กับ vendor

**สิ่งที่ตัดออก:** serial และ lot tracking, multi-warehouse และ transfer, split valuation และ moving average cost, สถานะ RMA แบบเต็ม, PO แบบเต็ม (partial receipt, backorder อัตโนมัติ), priority อัตโนมัติ, refurbishment order และการหักต้นทุน (ของ refurbished ให้แยก SKU ไปก่อน), และการ post บัญชี

---

## Question 2: Free hosting (ณ 2026-10-31)

### 2.1 RLS: กติกาที่ใช้ตัดสินทุก provider

- Superuser และ role ที่มี `BYPASSRLS` ข้าม RLS เสมอ ส่วน table owner ปกติข้าม เว้นแต่ใช้ `FORCE ROW LEVEL SECURITY` ([PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html))
- Referential integrity check ข้าม RLS เสมอ ([PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html))
- `SET LOCAL` มีผลถึงจบ transaction ([PostgreSQL SET](https://www.postgresql.org/docs/current/sql-set.html)) ส่วน PgBouncer transaction pooling ไม่รองรับ `SET/RESET` ระดับ session ตาราง feature ไม่มีแถวสำหรับ `SET LOCAL` ([PgBouncer features](https://www.pgbouncer.org/features.html))
- **[ข้อสรุปของผู้เขียน]** ตั้งค่า tenant ด้วย `SET LOCAL` หรือ `set_config(..., true)` ภายใน transaction น่าจะปลอดภัยกับ pooler แต่ต้องทดสอบจริง และให้ test ตรวจ `pg_roles.rolbypassrls = false` และ `rolsuper = false` ของ role แอป

### 2.2 รายละเอียดแต่ละ provider

ความเสี่ยงเรื่องเงินใช้ป้ายนี้: **PAID** = ต้องจ่าย, **CARD** = ต้องผูกบัตรหรือบัญชี billing, **OK** = เอกสารระบุว่าไม่ต้องใช้บัตร หรือเกิน limit แล้วโดนหยุดแทนเก็บเงิน

#### Vercel Hobby (OK สำหรับ Next.js)

- Limit ต่อเดือน: Fast Data Transfer 100 GB, Function Invocations 1,000,000, Active CPU 4 ชม., Provisioned Memory 360 GB-hrs เกินแล้วส่วนใหญ่ต้องรอ 30 วัน ([Vercel Hobby](https://vercel.com/docs/plans/hobby))
- Function: สูงสุด 300 วินาที, 2 GB ([Vercel functions limits](https://vercel.com/docs/functions/limitations))
- NestJS deploy ได้เป็น Vercel Function ตัวเดียว และ scale ตาม traffic งาน schedule ให้ใช้ Cron Jobs ([Vercel NestJS](https://vercel.com/docs/frameworks/backend/nestjs))
- Cron บน Hobby: วันละครั้ง, คลาดเคลื่อนได้ ±59 นาที ถ้าถี่กว่านั้น deploy ไม่ผ่าน ([Vercel cron](https://vercel.com/docs/cron-jobs/usage-and-pricing))
- Daemons (Public Beta): รันบน Hobby ได้ที่ 1 หรือ 2 GiB, quota 5 Active CPU-hours และ 420 GB-hours ต่อเดือน พอถึง quota daemon หยุดจนถึงต้นเดือนถัดไป รับ inbound HTTP ไม่ได้ และยังไม่รองรับ project ที่ตั้ง root directory เป็นโฟลเดอร์ย่อย ([Vercel daemons limits](https://vercel.com/docs/daemons/limits))
- **[ข้อสรุปของผู้เขียน]** 1 GiB รันได้ประมาณ 420 ชม. หรือ 17.5 วัน จึงไม่พอทั้งเดือน
- Terms: Hobby จำกัด "non-commercial personal use" นิยาม commercial คือมี financial gain ของใครก็ตามในการผลิต รวมถึงพนักงานหรือที่ปรึกษาที่ได้เงินจากการเขียนโค้ด และบอกว่าการเลี่ยง limit ผิด fair use ถ้าไม่แน่ใจให้ถาม Support ([Vercel fair use](https://vercel.com/docs/limits/fair-use-guidelines))
- **[ข้อสรุปของผู้เขียน]** demo ส่วนตัวไม่มีรายได้เข้าข่ายใช้ได้ แต่เอกสารไม่ได้พูดถึงคำว่า portfolio โดยตรง และถ้าเอาไปขายลูกค้าจริงจะไม่เข้าข่าย
- บัตร: หน้า Hobby ให้กรอกบัตรเฉพาะตอน upgrade ([Vercel Hobby](https://vercel.com/docs/plans/hobby)) ไม่พบประโยคที่ระบุตรงๆ ว่าไม่ต้องใช้บัตรตอนสมัคร
- Custom Postgres role: ไม่เกี่ยว เพราะไม่ใช่ DB

#### Render Free (OK ถ้าไม่ผูกบัตร)

- Web service: 750 instance hours ต่อเดือนต่อ workspace หลับหลังไม่มี inbound traffic 15 นาที ตื่นประมาณ 1 นาที ไม่มี disk, block SMTP ขาออกที่ port 25, 465, 587 Cron job และ background worker ใช้ Free ไม่ได้ เอกสารบอกว่า "Do not use them for production applications" ([Render free](https://render.com/docs/free))
- Postgres: 1 GB, **หมดอายุ 30 วันหลังสร้าง**, มี grace 14 วันแล้วถูกลบ, ไม่มี backup, ไม่มี connection pooling, ได้ 1 instance ต่อ workspace ([Render free](https://render.com/docs/free))
- **เรื่องเงิน:** ถ้าใช้ instance hours หมดจะถูก suspend ไม่เก็บเงิน แต่ bandwidth และ build minutes ที่เกิน "Render bills you for a supplementary amount" ถ้าไม่ได้เพิ่ม payment method จะ suspend แทน ([Render free](https://render.com/docs/free))
- **[ข้อสรุปของผู้เขียน]** ถ้าต้องฟรีจริง ห้ามผูกบัตรกับ Render
- Custom role: `CREATE USER` ใช้ได้แต่ Render ไม่จัดการให้ ([Render credentials](https://render.com/docs/postgresql-credentials)) เรื่องที่ default user ไม่ใช่ superuser พบเฉพาะใน community forum ซึ่งเป็น **secondary source** ([Render forum](https://community.render.com/t/permissions-setting-in-postgresql-database/6892))
- RAM/CPU ของ Free และเงื่อนไขบัตรตอนสมัคร: ไม่พบในหน้าที่อ่านได้

#### Koyeb (ถือเป็น PAID สำหรับผู้สมัครใหม่)

- Blog วันที่ 2026-02-17: "The Starter plan will soon be removed and new users will instead need to subscribe to the Pro, Scale, or Enterprise plan" ([Koyeb blog](https://www.koyeb.com/blog/koyeb-is-joining-mistral-ai-to-build-the-future-of-ai-infrastructure))
- หน้า pricing แสดงแค่ Pro ($29/เดือน), Scale, Enterprise และมี Postgres "Free 5h" (1 GB) ([Koyeb pricing](https://www.koyeb.com/pricing))
- **เอกสารขัดกัน:** FAQ ยังพูดถึง Starter และ free web service 512 MB, 0.1 vCPU และบอกว่าต้องใช้บัตร พร้อม pre-authorization $29 ([Koyeb FAQ](https://www.koyeb.com/docs/faqs/pricing)) FAQ ยังบอกว่ายังไม่ scale to zero อัตโนมัติ แต่อีกหน้าบอกว่า free instance scale to zero หลังไม่มี traffic 1 ชม. ปิดไม่ได้ ([Koyeb scale to zero](https://www.koyeb.com/docs/run-and-scale/scale-to-zero))
- Postgres: 5 ชม. ต่อเดือน, 1 GB, หลับหลัง 5 นาที, สร้าง role ได้ ([Koyeb databases](https://www.koyeb.com/docs/databases))
- Terms: URL ที่ลองได้ 404

#### Fly.io (PAID/CARD)

- Trial: 2 ชม. ของ machine runtime หรือ 7 วัน แล้วแต่อย่างไหนถึงก่อน ([Fly pricing](https://docs.fly.io/about/pricing))
- Machine เล็กสุด $2.19/เดือน, Managed Postgres Basic $38/เดือน และ "All organizations (except for Linked Organizations) require a credit card on file" ([Fly pricing](https://docs.fly.io/about/pricing))
- หน้า trial บอกว่าเพิ่มบัตรระหว่าง trial ได้ตามต้องการ ([Fly trial](https://docs.fly.io/about/free-trial)) ซึ่งดูขัดกับข้อความด้านบน แต่ไม่ว่ากรณีใดก็ไม่ฟรีหลัง trial

#### Neon Free (OK)

- 100 CU-hours ต่อ project ต่อเดือน (0.25 CU ได้ราว 400 ชม.), 1 GB ต่อ project, egress 5 GB, 10 branches, scale to zero หลัง 5 นาทีและปิดไม่ได้ ([Neon plans](https://neon.com/docs/introduction/plans))
- ตื่นในไม่กี่ร้อย ms ([Neon scale to zero](https://neon.com/docs/introduction/scale-to-zero))
- ไม่ต้องใช้บัตร ([Neon pricing](https://neon.com/pricing)) เกิน limit แล้ว compute suspend จนถึงรอบถัดไป และ "none of these limits delete your data" ([Neon plans](https://neon.com/docs/introduction/plans)) ไม่พบการหมดอายุจากการไม่ใช้งาน
- **Role:** role จาก Console, CLI, API ได้ `neon_superuser` ซึ่งมี `BYPASSRLS` ส่วน role จาก SQL ได้แค่สิทธิ์พื้นฐานของ public schema ใช้ Postgres superuser จริงไม่ได้ จำกัด 500 role ต่อ branch ([Neon roles](https://neon.com/docs/manage/roles))
- **[ข้อสรุปของผู้เขียน]** ใช้ role จาก Console สำหรับ migration และ role จาก SQL สำหรับแอป จึงทำ RLS + FORCE ได้
- Pooler: PgBouncer transaction mode ไม่รองรับ `SET/RESET` ระดับ session และ session advisory lock ([Neon pooling](https://neon.com/docs/connect/connection-pooling))
- Terms: หน้า schedule ที่อ่านได้ไม่มีข้อจำกัด free plan หรือ commercial ที่ระบุตรงๆ ([Neon terms](https://neon.com/terms-of-service)) แต่ไม่ได้อ่านเอกสารสัญญาทุกฉบับ

#### Supabase Free (OK)

- 2 active projects, DB 500 MB, egress 5 GB, ไม่ต้องใช้บัตร แต่บาง feature อาจต้อง verify ด้วยบัตร ([Supabase pricing](https://supabase.com/pricing))
- **Pausing:** ดูจาก user database activity ย้อนหลัง 7 วัน "a few user requests to the database each day" มักพอ มี email เตือนและ restore ได้ถึง 1 ปี หน้านี้ไม่พูดถึง keep-alive ([Supabase pausing](https://supabase.com/docs/guides/platform/free-project-pausing))
- เกิน Fair Use: pause, read-only, block หรือคืน 402 ไม่ได้ระบุว่าเก็บเงิน (จาก excerpt ใน search result) ([Supabase billing FAQ](https://supabase.com/docs/guides/platform/billing-faq))
- **Role:** `CREATE ROLE` ได้ ([Supabase roles](https://supabase.com/docs/guides/database/postgres/roles)) `postgres` มี `bypassrls` และ grant ให้ role อื่นได้ ([Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security))
- Connection: direct เป็น IPv6-only บน free ส่วน shared pooler รองรับ IPv4 และ custom role ใช้ username รูปแบบ `[ROLE].[PROJECT-REF]` ([Supabase connecting](https://supabase.com/docs/guides/database/connecting-to-postgres))
- Terms: ไม่พบข้อห้าม commercial บน free แต่ให้สิทธิ์ throttle และ suspend ไว้กว้าง ([Supabase terms](https://supabase.com/terms))

#### Oracle Cloud Always Free (CARD)

- A1 Flex: 1,500 OCPU-hours และ 9,000 GB-hours ต่อเดือน เทียบเท่า 2 OCPU, 12 GB, block storage 200 GB, outbound 10 TB ต่อเดือน, Email Delivery 3,000 ฉบับต่อเดือน ([Oracle Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm))
- **Idle reclaim:** "Idle Always Free compute instances may be reclaimed by Oracle" เมื่อใน 7 วัน CPU 95th percentile, network และ memory (เฉพาะ A1) ต่ำกว่า 20% ([Oracle Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm))
- สร้าง instance อาจเจอ "out of host capacity" ([Oracle Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm))
- Always Free ไม่มี managed PostgreSQL (มี Autonomous DB, NoSQL, MySQL HeatWave) ([Oracle Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)) ต้องลง Postgres เอง
- **[ข้อสรุปของผู้เขียน]** ติดตั้ง Postgres เองจะคุม role ได้เต็มที่
- **บัตร:** "most users need a mobile phone number and a credit card" และ "will not be charged unless you upgrade" หลัง trial Always Free ยังใช้ได้ ([Oracle Free Tier](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm))
- Terms: oracle.com ตอบ 403 จึงอ่านไม่ได้

#### Cloudflare

- Workers Free: 100,000 requests/วัน, CPU 10 ms ต่อ invocation ([Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)), 128 MB, Cron Triggers 5 ตัวต่อ account ([Workers limits](https://developers.cloudflare.com/workers/platform/limits/))
- Hyperdrive: 100,000 queries/วัน ([Hyperdrive pricing](https://developers.cloudflare.com/hyperdrive/platform/pricing/))
- **Containers: PAID** ไม่มี free plan ต้องใช้ Workers Paid $5/เดือน ([Containers pricing](https://developers.cloudflare.com/containers/pricing/))
- **[ข้อสรุปของผู้เขียน]** NestJS แบบ long-running รันบน Workers Free ไม่ได้ แต่อาจใช้ Cron Trigger เรียก endpoint ได้ (ไม่ได้ทดสอบ) ยังไม่ได้อ่าน terms หรือเงื่อนไขบัตรของ Cloudflare

#### Option อื่นที่พบ

- **Aiven Free PostgreSQL (OK):** 1 CPU, 1 GB RAM, 1 GB disk, `max_connections` 20, ไม่มี connection pooling, ได้ 1 service ([Aiven free tier](https://aiven.io/docs/products/postgresql/concepts/pg-free-tier)) ไม่ต้องใช้บัตร, เลือก region ไม่ได้, อาจถูก power off ถ้าไม่มีการใช้งาน โดยจะแจ้งก่อนและเปิดกลับได้ ([Aiven free plan](https://aiven.io/docs/platform/concepts/free-plan)) `avnadmin` ไม่ใช่ superuser แต่สร้าง role ได้ (จาก excerpt) ([Aiven DBA tasks](https://aiven.io/docs/products/postgresql/concepts/dba-tasks-pg)) ไม่ได้ยืนยันว่า `avnadmin` มี `BYPASSRLS` หรือไม่
- **Northflank Sandbox (เอกสารขัดกัน: ถือเป็น CARD):** หน้า pricing บอก 2 services, 2 jobs, 1 database, "No card needed", "Always on, no sleeping" ([Northflank pricing](https://northflank.com/pricing)) แต่เอกสาร billing บอกว่าผู้ใช้ทุกคนต้องเพิ่ม payment method ก่อนสร้าง resource และ sandbox "should not be used for production applications" ([Northflank billing docs](https://northflank.com/docs/v1/application/billing/pricing-on-northflank)) Terms บอกว่าห้ามใช้กับ "commercial endeavors" เว้นแต่ได้รับอนุมัติ ([Northflank terms](https://northflank.com/legal/terms)) ไม่ได้ยืนยันเรื่องขนาด addon และ role
- **Railway (ไม่พอใช้):** trial $5 ไม่เกิน 30 วัน ตามด้วย Free $1 ต่อเดือน และ volume ของ trial ถูกลบ 30 วันหลังเครดิตหมด ([Railway trial](https://docs.railway.com/reference/pricing/free-trial))
- **Google Cloud (CARD):** Cloud Run 2 ล้าน requests, e2-micro 1 ตัว, Cloud SQL เป็นแค่ trial 30 วัน, ต้องมี billing account และวิธีชำระเงิน ([Google free features](https://docs.cloud.google.com/free/docs/free-cloud-features))
- **GitHub Actions (ใช้เป็น scheduler ภายนอก):** ถี่สุด 5 นาที, อาจล่าช้าช่วงโหลดสูง, public repo ที่ไม่มี activity 60 วันจะถูกปิด schedule ([GitHub events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)) ไม่ได้อ่านหน้า billing ของ Actions

### 2.3 Email ฟรี

| Provider | Limit | บัตร | เงื่อนไขที่ต้องระวัง | แหล่งที่มา |
|---|---|---|---|---|
| Resend | 3,000/เดือน, 100/วัน, 10 req/s | ไม่ต้อง | "You must add and verify at least one domain" จึงต้องมีโดเมน | [pricing](https://resend.com/pricing), [quotas](https://resend.com/docs/knowledge-base/account-quotas-and-limits), [domains](https://resend.com/docs/dashboard/domains/introduction) |
| Brevo | 300/วัน คิว retry 1,000 (จาก excerpt เพราะหน้า FAQ ตอบ 403) | ไม่ได้ยืนยัน | Verified sender ใช้ได้ด้วยรหัส 6 หลัก แต่ที่อยู่ฟรีเช่น Gmail ยืนยันโดเมนไม่ได้ และถูกเขียนทับเป็น `t-sender-sib.com` เป็นทางแก้ชั่วคราว (จาก excerpt) | [limits](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan), [requirements](https://help.brevo.com/hc/en-us/articles/14925263522578-Comply-with-Gmail-Yahoo-and-Microsoft-s-requirements-for-email-senders) |
| MailerSend | 500/เดือน, 1 domain, 100 API request/วัน | **ต้องใช้** | ต้องมีโดเมน 1 โดเมนตาม limit | [pricing](https://www.mailersend.com/pricing) |
| Oracle Email Delivery | 3,000/เดือน | ตามบัญชี OCI | ไม่ได้ยืนยันเรื่องโดเมน | [Oracle Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm) |

**[ข้อสรุปของผู้เขียน]** ถ้าไม่ซื้อโดเมน Brevo กับ verified sender เป็นทางที่ไม่มีค่าใช้จ่ายที่สุด แต่ deliverability ไม่แน่นอน ควรทดสอบกับกล่องจดหมายจริงก่อน และเพราะ Render Free block SMTP ([Render free](https://render.com/docs/free)) ควรส่งผ่าน HTTP API

### 2.4 ตารางเปรียบเทียบ

| Provider | ใช้ทำอะไร | Limit หลัก | หลับ/หยุด | DB หมดอายุ | บัตร | Terms | Role/RLS | ป้าย |
|---|---|---|---|---|---|---|---|---|
| Vercel Hobby | Next.js | 100 GB, 1M invocations | Serverless, cron วันละครั้ง | n/a | ไม่พบว่าต้องใช้ | Non-commercial | n/a | OK |
| Render Free | NestJS | 750 ชม. | หลับ 15 นาที ตื่น ~1 นาที | **30 วัน** | ไม่บังคับตามที่อ่าน | ห้าม production | `CREATE USER` ได้ | OK ถ้าไม่ผูกบัตร |
| Koyeb | ไม่แนะนำ | ปิดรับ Starter | 1 ชม. | Postgres 5 ชม. | ต้องใช้ | อ่านไม่ได้ | ได้ | **PAID** |
| Fly.io | ไม่แนะนำ | 2 ชม./7 วัน | n/a | n/a | ต้องใช้ | ไม่ได้อ่าน | n/a | **PAID** |
| Neon Free | Postgres | 100 CU-h, 1 GB | Suspend 5 นาที | ไม่พบ | ไม่ต้อง | ไม่พบข้อห้าม | ได้ | OK |
| Supabase Free | Postgres | 500 MB | Pause เมื่อ activity ต่ำ 7 วัน | Restore ได้ 1 ปี | ไม่ต้อง (อาจ verify) | ไม่พบข้อห้าม | ได้ | OK |
| Oracle Always Free | VM ทั้งชุด | 2 OCPU, 12 GB, 200 GB | ไม่หลับ แต่ reclaim ได้ | จัดการเอง | **ส่วนใหญ่ต้องใช้** | อ่านไม่ได้ | เต็มที่ (อนุมาน) | **CARD** |
| Cloudflare Workers | Cron ภายนอก | 10 ms CPU | n/a | n/a | ไม่ได้อ่าน | ไม่ได้อ่าน | n/a | ไม่ยืนยัน |
| Cloudflare Containers | ไม่แนะนำ | n/a | n/a | n/a | ต้องใช้ | ไม่ได้อ่าน | n/a | **PAID** |
| Aiven Free | Postgres สำรอง | 1 GB, 20 conn | Power off ถ้าไม่ใช้ | ไม่พบ | ไม่ต้อง | ไม่ได้อ่าน AUP | สร้าง role ได้ | OK |
| Northflank | ไม่แนะนำ | 2 services, 1 DB | ไม่หลับ | ไม่ยืนยัน | **เอกสารขัดกัน** | จำกัด commercial | ไม่ยืนยัน | **CARD** |
| Railway | ไม่แนะนำ | $1/เดือน | n/a | Volume ถูกลบ | ไม่ต้องตอน trial | ไม่ได้อ่าน | n/a | เครดิตไม่พอ |
| Google Cloud | ไม่แนะนำ | Cloud Run free tier | Scale to zero (ไม่ได้อ่านรายละเอียด) | ไม่มี Postgres ฟรี | **ต้องใช้** | ไม่ได้อ่าน | n/a | **CARD** |

### 2.5 Poller กับ Neon

**[ข้อสรุปของผู้เขียน]** ทั้งหมดในหัวข้อนี้คำนวณจากตัวเลขในเอกสาร ไม่ได้ทดสอบจริง และ Neon ไม่ได้นิยามว่า activity แบบไหนกัน compute ไม่ให้หลับ ([Neon scale to zero](https://neon.com/docs/introduction/scale-to-zero))

ที่ 0.25 CU เดือนละ 720 ชม. โดยสมมติว่าแต่ละครั้งที่ query ทำให้ compute ตื่นต่อราว 5 นาที

| ความถี่ poller (แอปไม่หลับ) | ชั่วโมงที่ DB ตื่น | CU-hours | ผล |
|---|---|---|---|
| ทุก 1 ถึง 5 นาที | ~720 | ~180 | **เกิน 100 หมดราววันที่ 17 แล้ว DB ถูก suspend จนถึงรอบถัดไป** |
| ทุก 10 นาที | ~360 | ~90 | เสี่ยง เหลือที่ให้ traffic จริงน้อย |
| ทุก 15 นาที | ~240 | ~60 | พอใช้ |
| ทุก 1 ชม. | ~60 | ~15 | ปลอดภัย |

ทั้งนี้ ถ้า compute scale ขึ้นเกิน 0.25 CU quota จะหมดเร็วกว่านี้ ([Neon plans](https://neon.com/docs/introduction/plans) ระบุว่า Free autoscale ได้ถึง 2 CU)

### 2.6 ชุด free ที่ใช้งานได้

ส่วน platform admin ไม่เพิ่ม requirement ด้าน hosting ทุกชุดรองรับได้เหมือนกัน

ทั้งหัวข้อนี้เป็น **[ข้อสรุปของผู้เขียน]** โดยอิงจากข้อเท็จจริงที่อ้างไว้ข้างบน ยังไม่ได้ทดลอง deploy

#### ชุด A: Vercel Hobby + Render Free + Neon Free + Brevo (แนะนำ)

- **ค่าใช้จ่าย:** ไม่ต้องผูกบัตรตามเอกสารที่อ่าน ถ้าไม่ผูกบัตรกับ Render จะถูก suspend แทนการเก็บเงิน
- **Poller เมื่อแอปหลับ:** หยุดด้วย เพราะอยู่ใน process เดียวกัน และ outbox ค้างอยู่ใน Postgres ไม่หาย Render ดู inbound traffic ([Render free](https://render.com/docs/free)) poller ที่ทำงานขาออกจึงไม่ทำให้แอปตื่น
- **ผลจริงในการ demo:** งานที่ผู้ชมกดแล้วเกิดอีเมลจะถูกส่งภายในช่วงที่แอปตื่นอยู่ อีก 15 นาทีเพียงพอต่อการ drain สิ่งที่ค้างคืออีเมลตามเวลาระหว่างหลับ และงานที่ค้างตอน crash ควร drain ทันทีตอน boot
- **Neon:** หลับตามแอป จึงไม่เจอปัญหา CU-hours แต่ถ้าเพิ่ม keep-alive ภายหลังต้องลดความถี่ poller
- **ข้อเสีย:** request แรกรอราว 1 นาที ต้องมีหน้า loading ที่ดี และ `vercel.app` กับ `onrender.com` เป็นคนละโดเมน จึงควรทดสอบ cookie auth หรือใช้ proxy ผ่าน Next
- **ความเสี่ยง:** ทั้ง Render และ Vercel มีเงื่อนไขการใช้งาน (ห้าม production, non-commercial) ซึ่ง portfolio น่าจะเข้าข่าย แต่ไม่มีเอกสารยืนยันตรงๆ

#### ชุด B: Oracle Always Free VM ตัวเดียว (Next + Nest + Postgres + Brevo)

- **ค่าใช้จ่าย:** **ต้องผูกบัตร** Oracle ระบุว่าไม่เก็บเงินถ้าไม่ upgrade ถ้า user ตีความ "ฟรีจริง" ว่าห้ามมีบัตร ให้ตัดชุดนี้
- **Poller:** ทำงานตลอด เพราะ VM ไม่หลับ ไม่มี cold start และตรงกับการตัดสินใจเดิมมากที่สุด
- **ข้อเสีย:** จัดการ patch, backup และ TLS เอง และ HTTPS อาจต้องมีโดเมน ซึ่งเป็นรายจ่ายที่ต้องตรวจก่อน
- **ความเสี่ยง:** demo ที่ traffic น้อยอาจเข้าเกณฑ์ idle และถูก reclaim ควรใช้ VM เล็กเพื่อให้ memory เกิน 20% และทำ `pg_dump` ออกนอก VM อาจเจอ "out of host capacity" ตอนสร้าง และยังอ่าน terms ไม่ได้
- **Image:** ต้อง build เป็น arm64

#### ชุด C: Vercel Hobby + Render Free + Supabase Free + keep-alive ด้วย GitHub Actions

- **ค่าใช้จ่าย:** ไม่ต้องผูกบัตรตามเอกสารที่อ่าน (Supabase แจ้งว่าบาง feature อาจต้อง verify ด้วยบัตร)
- **Poller:** ทำงานตลอดเวลาที่ ping ทัน โดยตั้ง schedule ทุก 10 นาที แต่ GitHub เตือนว่า schedule อาจล่าช้า จึงยังหลับได้บ้าง และ 750 ชม. พอสำหรับ 1 service เท่านั้น
- **Supabase:** เอกสารไม่ได้ระบุ quota ชั่วโมง compute แบบ Neon จึงเข้ากับ poller ถี่ได้ดีกว่า และ activity น่าจะกัน pause แต่ไม่ได้ยืนยันว่า poller นับเป็น "user database activity"
- **การเชื่อมต่อ:** ใช้ shared pooler แบบ session mode เพราะ direct เป็น IPv6-only และ username ของ custom role เป็น `[ROLE].[PROJECT-REF]`
- **ความเสี่ยง:** ไม่พบเอกสารของ Render ที่อนุญาตหรือห้าม keep-alive ([Render free](https://render.com/docs/free)) และยังอ่าน terms ไม่ได้ อาจถูกมองว่าเลี่ยงเงื่อนไข และ public repo ต้องมี activity ไม่งั้น schedule ถูกปิดใน 60 วัน
- **อื่นๆ:** Aiven ใช้แทน Supabase ได้ ถ้าไม่ต้องการ pooler แต่ต้องยืนยัน role ก่อน

#### ที่ไม่แนะนำ: รวมทุกอย่างบน Vercel

NestJS เป็น Function ได้ แต่ in-process poller ไม่เหมาะ เพราะ function มีอายุตาม request สูงสุด 300 วินาที และ cron วันละครั้งไม่พอ ทางเลือกคือ HTTP drain endpoint กับ scheduler ภายนอก แต่นั่นเปลี่ยนการตัดสินใจเรื่อง poller และ Vercel ระบุว่าการเลี่ยง limit ผิด fair use ([Vercel fair use](https://vercel.com/docs/limits/fair-use-guidelines)) ส่วน Daemon รับ HTTP ไม่ได้และ quota ไม่พอทั้งเดือน ([Vercel daemons limits](https://vercel.com/docs/daemons/limits))

---

## สิ่งที่ยืนยันไม่ได้

**วิธีอ่านข้อมูล**

- เครื่องมืออ่านเว็บส่วนใหญ่ส่งผลผ่านตัวสรุปอัตโนมัติ ข้อความที่อยู่ในเครื่องหมายคำพูดจึงควรเปิดลิงก์ตรวจก่อนใช้อ้างอิงอย่างเป็นทางการ ยกเว้นหน้า Vercel ที่ได้ข้อความเต็ม
- ข้อมูลที่ระบุว่า "จาก excerpt" มาจาก search result ของโดเมนทางการ แต่ไม่ได้เปิดอ่านหน้านั้นเต็มๆ
- ไม่มีการทดลอง deploy หรือสร้าง role จริงบน provider ใดเลย

**หน้าที่อ่านไม่ได้**

- `oracle.com/cloud/free/` และ `/faq/` ตอบ 403 จึงไม่ได้อ่าน terms และการใช้เชิงพาณิชย์ของ Oracle
- หน้า FAQ limit ของ Brevo ตอบ 403 และหน้า pricing ไม่มีรายละเอียด ตัวเลข 300/วันจึงมาจาก excerpt เงื่อนไขบัตรของ Brevo ไม่ได้ยืนยัน
- หน้า `help.sap.com/docs/...` แสดงผลไม่ออก จึงยืนยัน movement type (261, 311, 321, 551, 122) และ blocked stock returns ได้จาก excerpt เท่านั้น
- `render.com/terms` ได้แค่เมนูเว็บ และ `render.com/pricing` ไม่มีตัวเลข จึงไม่ได้ยืนยัน terms, RAM/CPU ของ Free และ bandwidth ที่รวม
- Terms ของ Koyeb ที่ `/tos` ตอบ 404

**ข้อเท็จจริงที่ยังไม่ได้ยืนยัน**

- Inventory:
  - กติกาจัดลำดับเมื่อหลายงานแย่งอะไหล่ ในทุกระบบ
  - กติกาความรับผิดชอบต้นทุนเมื่ออะไหล่เสียระหว่างซ่อม ในทุกระบบ
  - จังหวะตัดสต็อกตอนเพิ่มอะไหล่ใน ticket ของ RepairDesk และ Syncro
  - บทความ Syncro บางหน้าระบุเองว่ายังไม่ verify
  - เอกสารของ RepairShopr ที่อ่านได้มีแค่หน้า features ไม่มีรายละเอียดการทำงาน
  - flow ส่งซ่อมนอกของ ERPNext และ Odoo
- Hosting:
  - Koyeb ปิด Starter สำหรับผู้สมัครใหม่แล้วจริงหรือไม่ (pricing ไม่แสดง แต่ FAQ ยังกล่าวถึง)
  - Northflank ต้องใช้บัตรหรือไม่ (เอกสารขัดกัน)
  - `avnadmin` ของ Aiven มี `BYPASSRLS` หรือไม่
  - Default user ของ Render ไม่ใช่ superuser (พบเฉพาะใน forum ซึ่งเป็น secondary source)
  - Poller นับเป็น "user database activity" ของ Supabase หรือไม่ และ Neon นับ activity อย่างไร
  - Keep-alive ping ถูกอนุญาตบน Render, Supabase, Neon หรือไม่
  - `SET LOCAL` ทำงานกับ pooler ของ Neon และ Supabase อย่างที่อนุมานหรือไม่
  - Vercel ถือว่า portfolio ของคนหางานเป็น non-commercial หรือไม่ (ควรถาม Support ถ้าสำคัญ)
  - Free tier ของแต่ละรายอาจเปลี่ยนภายหลัง ควรตรวจอีกครั้งก่อน deploy
- Email:
  - Resend ส่งได้แค่ไหนโดยไม่มีโดเมน
  - Deliverability ของ Brevo ที่ไม่มีโดเมน
  - HTTPS บน Oracle VM โดยไม่มีโดเมน
