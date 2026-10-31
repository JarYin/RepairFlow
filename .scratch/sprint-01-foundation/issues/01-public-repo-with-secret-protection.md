# 01: Repo public ที่กันความลับ

**What to build:** โค้ดและเอกสารของ RepairFlow อยู่บน GitHub แบบ public โดยไม่มีความลับหลุดเข้า history ตั้งแต่ commit แรก และ GitHub กันความลับใน commit หลังจากนั้นได้

**Blocked by:** None (can start immediately)

**Status:** ready-for-human

ต้องได้รับการยืนยันจากเจ้าของโปรเจกต์ก่อนสร้าง repo แบบ public

- [ ] `*.tsbuildinfo` และไฟล์ที่ build สร้างขึ้นไม่ถูก commit
- [ ] `.env.example` ระบุตัวแปรที่ต้องตั้งโดยไม่มีค่าจริง
- [ ] สแกน secret ในเครื่องผ่านก่อน push ครั้งแรก
- [ ] Repo ถูกสร้างแบบ public และมีเอกสารกับ `.scratch/` ครบ
- [ ] เปิด secret scanning และ push protection แล้ว
- [ ] ทดลองแล้วว่า `.env` ไม่ถูก track
