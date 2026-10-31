# Deploy ฟรีบน Vercel และ Neon โดยไม่ใช้ Docker ใน production

Live Demo ต้องไม่มีค่าใช้จ่าย จึงรัน Next.js และ NestJS บน Vercel Hobby ใช้ Neon Free เป็น Postgres และ Vercel Blob เก็บรูป เอกสารตั้งต้นระบุ Docker สำหรับ deployment แต่ Vercel ไม่ได้ใช้ เราจึงใช้ Docker Compose เฉพาะการพัฒนาในเครื่อง และ build image ของ API ใน CI เพื่อพิสูจน์ว่าย้ายออกได้

## Considered Options

- **Render Free สำหรับ API:** เป็น Node process ปกติและรัน in-process poller ได้ แต่หลับหลังไม่มี traffic 15 นาทีและตื่นราว 1 นาที ซึ่งแย่กับเดโม จึงเก็บไว้เป็นแผนสำรอง
- **Oracle Always Free VM:** ไม่หลับและคุมทุกอย่างได้ แต่ต้องใช้บัตร ดูแลเครื่องเอง และอาจถูก reclaim เมื่อ idle
- **Render Postgres:** หมดอายุใน 30 วัน

ข้อมูลอ้างอิงอยู่ใน [ผลการค้นคว้า](../research/inventory-and-free-hosting.md)

## Consequences

- ไม่มี background process ระบบจึงไม่มี poller ถ้ามีงานตามเวลาต้องใช้ Vercel Cron ซึ่งรันได้วันละครั้งและคลาดเคลื่อนได้ ±59 นาที หรือคำนวณจากวันที่ตอนอ่านข้อมูล
- ใช้ `pg` Pool กับ `attachDatabasePool` และไม่ทำ keep-alive เพราะ Vercel ถือว่าการเลี่ยง limit ผิด fair use
- ถ้าใช้ quota ของ Hobby หมด เว็บและ API อาจหยุดพร้อมกันนานถึง 30 วัน
- ยังไม่มีการทดลอง deploy repo นี้จริง สัปดาห์แรกต้องทดลองตามรายการใน [architecture.md](../architecture.md#ความเสี่ยงและสิ่งที่ต้องทดลอง)
