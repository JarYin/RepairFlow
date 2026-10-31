# 01: Repo public ที่กันความลับ

**What to build:** โค้ดและเอกสารของ RepairFlow อยู่บน GitHub แบบ public โดยไม่มีความลับหลุดเข้า history ตั้งแต่ commit แรก และ GitHub กันความลับใน commit หลังจากนั้นได้

**Blocked by:** None (can start immediately)

**Status:** resolved

ต้องได้รับการยืนยันจากเจ้าของโปรเจกต์ก่อนสร้าง repo แบบ public

- [x] `*.tsbuildinfo` และไฟล์ที่ build สร้างขึ้นไม่ถูก commit
- [x] `.env.example` ระบุตัวแปรที่ต้องตั้งโดยไม่มีค่าจริง
- [x] สแกน secret ในเครื่องผ่านก่อน push ครั้งแรก
- [x] Repo ถูกสร้างแบบ public และมีเอกสารกับ `.scratch/` ครบ
- [x] เปิด secret scanning และ push protection แล้ว
- [x] ทดลองแล้วว่า `.env` ไม่ถูก track

## Comments

- 2026-11-01: เจ้าของโปรเจกต์ยืนยันการสร้าง repo แบบ public แล้ว สร้างที่ https://github.com/JarYin/RepairFlow
- สแกนด้วย gitleaks v8.28.0 ทั้งไฟล์ที่ stage และ history ก่อน push ไม่พบความลับ รายการเดียวที่พบในรอบแรกคือ token ตัวอย่างใน badge ของ README จาก scaffold ซึ่งลบออกก่อน commit แรก
- เปิด secret scanning และ push protection ผ่าน GitHub API แล้ว
- ทดลองสร้าง `.env` แล้ว `git add` ถูกปฏิเสธเพราะอยู่ใน `.gitignore`
- Commit ใน repo นี้ใช้อีเมล noreply ของ GitHub ตั้งไว้เฉพาะ repo
