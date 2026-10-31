# 10: ลบ `spike` ออกจาก production

**What to build:** ไม่เหลือ endpoint หรือข้อมูลทดลองบน production และการลบนี้เป็นการใช้ pipeline จริงกับ migration แบบลบของเก่า

**Blocked by:** 08, 09

**Status:** ready-for-agent

- [ ] ลบโมดูล `spike`, เทสต์ของโมดูลนี้ และ environment variable ที่เกี่ยวข้อง
- [ ] Migration ลบตารางทดลอง โดยเทสต์ RLS ของโมดูล `database` ยังผ่านด้วยตารางที่สร้างเฉพาะในเทสต์
- [ ] การลบผ่าน PR, CI และ pipeline ปกติจนผ่าน smoke test
- [ ] เรียก path ของ `spike` บน production แล้วไม่พบ route
- [ ] `health`, `database` และเทสต์ของทั้งสองยังทำงานต่อได้
