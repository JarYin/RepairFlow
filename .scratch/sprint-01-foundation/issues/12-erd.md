# 12: ERD

**What to build:** นักพัฒนาเห็นโครงสร้างข้อมูลทั้งระบบก่อนสร้าง schema ใน Sprint 2 รวมถึงวิธีที่แต่ละตารางกันการอ้างอิงข้าม Shop

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] ERD เป็น Mermaid ที่แสดงผลบน GitHub ได้ และครอบคลุมทุกโมดูลใน `architecture.md`
- [x] ทุกตารางข้อมูลของ Shop แสดง `shop_id` และ composite foreign key `(shop_id, id)`
- [x] แยกตาราง platform ออกจากตารางของ Shop ชัดเจนตาม ADR-0009
- [x] Stock Movement และยอดตามสถานะตรงกับตารางใน `architecture.md`
- [x] ชื่อ entity ตรงกับ `GLOSSARY.md`
