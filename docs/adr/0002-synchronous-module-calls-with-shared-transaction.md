# โมดูลเรียกกันแบบ synchronous และใช้ transaction เดียวกัน

การอนุมัติ Quotation ต้องเปลี่ยนข้อมูลของหลายโมดูลแบบ atomic เราจึงให้โมดูลของ Modular Monolith เรียก service ที่โมดูลอื่น export โดยตรง และส่ง transaction ต่อด้วย AsyncLocalStorage แทนการใช้ domain event หรือ outbox เพราะ Postgres ตัวเดียวรับประกันความถูกต้องได้อยู่แล้ว และลำดับการทำงานยังติดตามได้จากโค้ด

กฎที่บังคับใน CI ด้วย dependency-cruiser คือโมดูลห้าม query ตารางของโมดูลอื่น ยกเว้น `reports` ที่อ่านได้อย่างเดียว และกราฟการ import ต้องไม่มีวงจร Audit Log เขียนใน transaction เดียวกับการเปลี่ยนแปลง จึงไม่มีการเปลี่ยนแปลงที่ขาดบันทึก
