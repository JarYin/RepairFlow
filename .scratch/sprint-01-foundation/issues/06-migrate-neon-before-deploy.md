# 06: Migrate Neon ก่อน deploy

**What to build:** Pipeline migrate ฐานข้อมูล Neon ก่อนโค้ดใหม่ขึ้นเสมอ และหยุดทันทีถ้า migrate ล้มเหลว เพื่อไม่ให้โค้ดใหม่ทำงานบน schema เก่า

**Blocked by:** 04, 05

**Status:** ready-for-human

ต้องการบัญชี Neon และรหัสผ่านของ role จากเจ้าของโปรเจกต์ โดยตั้งรหัสผ่านใน Neon Console และห้ามอยู่ใน repo

- [ ] Pipeline ทำตามลำดับ migrate, deploy API, deploy Web และ smoke test
- [ ] Migrate ด้วย connection แบบตรงและ Migration role ซึ่งเก็บเป็น secret ของ Environment `production`
- [ ] API บน production เชื่อม Neon ผ่าน pooler ด้วย `app_tenant`
- [ ] มี PR ทดลองที่ migration ล้มเหลวแล้วไม่มีการ deploy
- [ ] Migration ที่รันซ้ำไม่ทำให้ pipeline พัง
- [ ] มีกติกาใน README ว่า migration ต้องเข้ากันได้กับโค้ดเวอร์ชันก่อนหน้า และไม่มี down migration
