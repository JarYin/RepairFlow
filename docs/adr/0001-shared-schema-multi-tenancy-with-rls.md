# ใช้ schema เดียวร่วมกันและบังคับการแยกร้านด้วย Postgres RLS

RepairFlow ต้องแสดงให้เห็นว่าเป็นผลิตภัณฑ์ที่หลายร้านใช้ร่วมกันและสร้างรายได้ได้ จึงเลือก multi-tenancy ตั้งแต่แรก ทุกตารางข้อมูลร้านมี `shop_id` และบังคับด้วย Postgres RLS ร่วมกับ application เพื่อให้ query ที่ลืม filter ยังเข้าถึงข้อมูลร้านอื่นไม่ได้

## Considered Options

- **Filter ใน application อย่างเดียว:** ง่ายกว่า แต่ถ้าลืมเงื่อนไขเพียงจุดเดียวข้อมูลจะรั่ว
- **แยก schema หรือ database ต่อร้าน:** แยกขาดกว่า แต่ migration และ connection ซับซ้อนเกินความจำเป็น และไม่เหมาะกับ quota ของ free tier
- **ร้านเดียว:** ลดงานได้มาก แต่ไม่ตอบเป้าหมายด้านผลิตภัณฑ์

## Consequences

- ทุก query ของร้านต้องอยู่ใน transaction ที่ตั้ง `shop_id` ด้วย `SET LOCAL` จึงต้องใช้ interactive transaction และ HTTP driver ของ Neon ใช้ไม่ได้
- แอปห้ามต่อด้วย role จาก Neon Console เพราะมี `BYPASSRLS` และ `FORCE ROW LEVEL SECURITY` ไม่มีผลกับ role แบบนั้น เทสต์ต้องตรวจ `rolsuper` และ `rolbypassrls` ของ role แอป
- ใช้ composite foreign key `(shop_id, id)` เพื่อกันการอ้างอิงข้ามร้าน เพราะการตรวจ foreign key ไม่ผ่าน RLS
