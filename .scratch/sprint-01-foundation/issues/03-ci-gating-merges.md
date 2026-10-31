# 03: CI ที่คุมการ merge

**What to build:** ทุก PR ต้องผ่านการตรวจครบก่อน merge เข้า `main` ได้ โดยไม่ต้องใช้ secret ใด ทำให้ PR จาก fork เข้าถึงความลับไม่ได้

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] PR รัน lint, unit, Playwright, dependency-cruiser และ build image ของ API
- [ ] กฎ dependency-cruiser ทำให้ CI ล้มเหลวเมื่อกราฟการเรียกของโมดูลมีวงจร
- [ ] ติดตั้ง dependency จาก lockfile แบบห้ามแก้
- [ ] Workflow ไม่ใช้ secret, ไม่ใช้ `pull_request_target`, ตั้ง permission ของ token เป็นอ่านอย่างเดียว และตรึงเวอร์ชันของ Actions ด้วย commit SHA
- [ ] Branch protection ไม่ให้ merge เข้า `main` ถ้า CI ไม่ผ่าน
- [ ] มี PR ทดลองที่ CI ล้มเหลวแล้ว merge ไม่ได้
