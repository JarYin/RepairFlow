# RepairFlow

ระบบบริหารงานซ่อมสำหรับร้านซ่อมอุปกรณ์อิเล็กทรอนิกส์หลายร้าน ครอบคลุมตั้งแต่รับเครื่อง เสนอราคา เบิกอะไหล่ ไปจนถึงรับเงินและคืนเครื่อง

## Language

### ร้านและผู้ใช้

**Shop**:
ร้านซ่อมหนึ่งร้านที่ใช้ RepairFlow และเป็นเจ้าของข้อมูลของตนเอง
_Avoid_: Tenant, store, organization

**User**:
บัญชีสำหรับเข้าสู่ระบบของคนหนึ่งคนใน Shop หนึ่งร้าน คนเดียวกันที่เกี่ยวข้องกับสองร้านจะมีสอง User
_Avoid_: Account, member, login

**Owner**:
User ที่บริหาร Shop จัดการผู้ใช้ ดูรายงาน และตรวจสอบงาน เอกสารเดิมเรียกบทบาทนี้ว่า Owner / Manager
_Avoid_: Admin, Manager (ในฐานะบทบาทแยก)

**Receptionist**:
User ที่รับเครื่อง เปิด Work Order บันทึกข้อมูล Customer และเสนอราคา
_Avoid_: Staff, front desk

**Technician**:
User ที่รับผิดชอบการซ่อม อัปเดตสถานะ และเบิกอะไหล่ให้ Work Order ที่ตนได้รับมอบหมาย
_Avoid_: Engineer, repairer

**Customer**:
เจ้าของอุปกรณ์ในทะเบียนของ Shop ซึ่งอาจมีหรือไม่มี User ก็ได้
_Avoid_: Client, user (เมื่อหมายถึงลูกค้า)

**Platform Admin**:
ผู้ดูแลธุรกิจของ RepairFlow ที่ดูและระงับ Shop ได้ แต่ไม่ใช่ User ของ Shop ใดและอ่านข้อมูลงานซ่อมไม่ได้
_Avoid_: Super admin, system admin

**Demo Shop**:
Shop ตัวอย่างที่เปิดให้ผู้ชม Portfolio ทดลองใช้งานและถูกคืนค่าเป็นประจำ
_Avoid_: Test shop, sandbox

### งานซ่อม

**Device**:
อุปกรณ์ของ Customer ที่นำมาซ่อม
_Avoid_: Machine, product, item

**Work Order**:
ใบงานซ่อมหนึ่งใบของ Device หนึ่งเครื่อง ตั้งแต่รับเครื่องจนคืนเครื่อง
_Avoid_: Job, ticket, repair order

**Promised Date**:
วันที่ Shop แจ้ง Customer ว่างานจะเสร็จ ใช้ตัดสินว่า Work Order เกินกำหนดหรือไม่
_Avoid_: Due date, deadline

**Delivered**:
สถานะที่ Device กลับถึงมือ Customer แล้ว ไม่ว่าจะซ่อมหรือไม่ได้ซ่อม
_Avoid_: Closed, returned

**Cancelled**:
สถานะที่ Shop เลิกซ่อมและรอคืน Device ให้ Customer ยังไม่ใช่จุดสิ้นสุดของ Work Order
_Avoid_: Rejected, aborted

### ใบเสนอราคา

**Quotation**:
ข้อเสนอราคาค่าแรงและอะไหล่ที่ส่งให้ Customer ซึ่งแก้ไขไม่ได้หลังส่ง Work Order หนึ่งใบมีได้หลาย Quotation
_Avoid_: Estimate, quote

**Superseded Quotation**:
Quotation ที่ถูกฉบับใหม่แทนที่ก่อน Customer ตัดสินใจ จึงอนุมัติไม่ได้อีก
_Avoid_: Revised quotation, old quotation

**Approval**:
การตัดสินใจรับ Quotation โดยระบุได้ว่าใครเป็นผู้ตัดสินใจและผ่านช่องทางใด
_Avoid_: Confirmation, acceptance

**Staff-recorded Approval**:
Approval ที่ Customer ตอบนอกระบบและพนักงานบันทึกแทน พร้อมระบุช่องทางและผู้บันทึก
_Avoid_: Manual approval, override

### อะไหล่และคลัง

**Part**:
ชนิดอะไหล่ในรายการของ Shop ของ refurbished ถือเป็น Part คนละชนิดกับของใหม่
_Avoid_: Item, product, component, SKU

**Available**:
จำนวน Part ที่พร้อมถูกจองให้ Work Order
_Avoid_: On hand, in stock, free stock

**Reserved**:
จำนวน Part ที่จองให้ Work Order แล้วและยังไม่ถูกเบิก
_Avoid_: Allocated, held

**Quarantine**:
จำนวน Part ที่รอตรวจว่าใช้งานได้หรือไม่
_Avoid_: Pending inspection, hold

**Defective**:
จำนวน Part ที่ยืนยันแล้วว่าเสียและรอตัดสินใจว่าจะส่งคืนหรือตัดทิ้ง
_Avoid_: Broken, damaged stock

**At Vendor**:
จำนวน Part ที่ส่งไปให้ผู้ขายแล้วเพื่อคืนหรือซ่อม
_Avoid_: In RMA, sent out

**Reservation**:
การกันจำนวน Part ให้ Work Order หนึ่งใบหลังเกิด Approval
_Avoid_: Allocation, hold

**Issue**:
การเบิก Part ที่จองไว้ออกไปใช้กับ Work Order
_Avoid_: Withdrawal, deduct, consume

**Part Request**:
คำขอ Part ที่รอคิวเพราะ Available ไม่พอต่อ Reservation ได้รับของตามลำดับก่อนหลังเว้นแต่ Owner ปรับลำดับ
_Avoid_: Backorder, waitlist entry

**Stock Movement**:
บันทึกการเปลี่ยนจำนวน Part หนึ่งครั้งซึ่งแก้ไขไม่ได้ ยอดคงเหลือต้องตรงกับผลรวมของบันทึกเหล่านี้
_Avoid_: Stock transaction, stock log

**Repair Damage**:
Part ที่เสียระหว่างการซ่อมของร้าน ร้านเป็นผู้รับต้นทุนและไม่คิดเงิน Customer
_Avoid_: Technician error, breakage

**Store Damage**:
Part ที่เสียขณะอยู่ในคลังก่อนถูกใช้กับงาน
_Avoid_: Breakage, loss

**DOA**:
Part ที่เสียมาตั้งแต่ได้รับจากผู้ขาย ร้านเรียกร้องจากผู้ขายได้
_Avoid_: Factory defect, vendor defect

**Scrap**:
การตัดจำนวน Part ที่ใช้ไม่ได้ออกจากคลังถาวร
_Avoid_: Write-off, dispose

### เงิน

**Payment**:
เงินที่ Customer จ่ายให้ Shop สำหรับ Work Order ซึ่งพนักงานบันทึกไว้ RepairFlow ไม่ได้รับเงินนี้เอง
_Avoid_: Billing, charge, transaction

**Outstanding Balance**:
ยอดตาม Quotation ที่ได้รับ Approval หักด้วย Payment ทั้งหมดของ Work Order
_Avoid_: Debt, amount due

**Subscription**:
สิทธิ์การใช้ RepairFlow ของ Shop ซึ่งเป็นเงินระหว่าง Shop กับ RepairFlow และแยกจาก Payment
_Avoid_: Plan, membership, license

**Trial**:
ช่วงทดลองใช้ก่อน Subscription เริ่มต้องชำระเงิน
_Avoid_: Free plan, free tier

**Expired Shop**:
Shop ที่ Subscription หมดอายุ พนักงานอ่านได้อย่างเดียวแต่ Customer ยังติดตามงานและตอบ Quotation ได้
_Avoid_: Suspended, inactive

**Suspended Shop**:
Shop ที่ Platform Admin ระงับ ทั้งพนักงานและ Customer ใช้งานไม่ได้
_Avoid_: Expired, banned, disabled

### การสื่อสารและการตรวจสอบ

**Notification**:
ข้อความในแอปถึง User เกี่ยวกับเหตุการณ์ของงาน
_Avoid_: Alert, message, email

**Customer Contact Task**:
รายการที่บอกพนักงานว่าต้องติดต่อ Customer ที่ไม่มี User หรือยังไม่รับทราบเหตุการณ์สำคัญ พร้อมบันทึกช่องทางและผู้ติดต่อ
_Avoid_: Reminder, follow-up

**Audit Log**:
บันทึกแก้ไขไม่ได้ว่าใครทำอะไรกับข้อมูลสำคัญเมื่อใด
_Avoid_: History, activity feed

**Status History**:
ลำดับการเปลี่ยนสถานะของ Work Order หนึ่งใบ ซึ่งเป็นที่มาของระยะเวลาซ่อม
_Avoid_: Timeline, Audit Log

## Relationships

- **Shop** หนึ่งร้านมีหลาย **User**, **Customer**, **Work Order** และ **Part** โดยข้อมูลเหล่านี้ไม่ข้ามร้าน
- **Customer** หนึ่งคนมีได้หลาย **Device** และ **Device** หนึ่งเครื่องมีได้หลาย **Work Order**
- **Work Order** หนึ่งใบมีได้หลาย **Quotation** โดยต้องมี **Approval** ก่อนเกิด **Reservation** ของ Quotation นั้น
- **Reservation** ที่ Available ไม่พอจะกลายเป็น **Part Request** และ **Issue** เบิกได้จาก Reservation ของ Work Order นั้นเท่านั้น
- ทุกการเปลี่ยนจำนวน **Part** เกิด **Stock Movement** หนึ่งรายการ
- **Work Order** จะเป็น **Delivered** ไม่ได้ถ้ายังมี **Outstanding Balance**
- **Platform Admin** มีความสัมพันธ์กับ **Shop** ผ่าน **Subscription** และสถานะการระงับเท่านั้น

## Example dialogue

> **Dev:** "Technician ขอเบิกชิ้นสุดท้าย แต่มีอีกงานต้องใช้เหมือนกัน ใครได้?"
> **Domain expert:** "ดูที่ Reservation ไม่ใช่ว่าใครกดก่อน งานที่ได้ Approval ก่อนจองไปแล้ว อีกงานมี Part Request รอของเข้า"

> **Dev:** "ถ้า Part เสียตอนซ่อม ต้องออก Quotation ใหม่ไหม?"
> **Domain expert:** "ถ้าเป็น Repair Damage ไม่ต้อง ร้านรับต้นทุนแล้วจองชิ้นใหม่ ถ้า Customer ต้องจ่ายเพิ่มด้วยเหตุอื่นค่อยออก Quotation ใหม่"

> **Dev:** "Shop ไม่จ่าย Subscription แล้ว Customer ดูงานตัวเองได้ไหม?"
> **Domain expert:** "ได้ ถ้าเป็น Expired Shop แต่ถ้าเป็น Suspended Shop ใช้ไม่ได้ทั้งหมด"

## Flagged ambiguities

- **"Tenant"** ในเอกสาร research หมายถึง **Shop** โค้ดและเอกสารใหม่ให้ใช้ Shop
- **"Job"** ในเอกสาร research หมายถึง **Work Order** โค้ดและเอกสารใหม่ให้ใช้ Work Order
- **"Manager"** เอกสารเดิมเขียนว่า Owner / Manager แต่ระบบมีบทบาทเดียวคือ **Owner**
- **"Payment"** เคยปนกับค่าสมาชิกของร้าน ตอนนี้แยกเป็น **Payment** (Customer จ่าย Shop) และ **Subscription** (Shop จ่าย RepairFlow)
