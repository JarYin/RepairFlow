# 03: CI ที่คุมการ merge

**What to build:** ทุก PR ต้องผ่านการตรวจครบก่อน merge เข้า `main` ได้ โดยไม่ต้องใช้ secret ใด ทำให้ PR จาก fork เข้าถึงความลับไม่ได้

**Blocked by:** 02

**Status:** resolved

- [x] PR รัน lint, unit, Playwright, dependency-cruiser และ build image ของ API
- [x] กฎ dependency-cruiser ทำให้ CI ล้มเหลวเมื่อกราฟการเรียกของโมดูลมีวงจร
- [x] ติดตั้ง dependency จาก lockfile แบบห้ามแก้
- [x] Workflow ไม่ใช้ secret, ไม่ใช้ `pull_request_target`, ตั้ง permission ของ token เป็นอ่านอย่างเดียว และตรึงเวอร์ชันของ Actions ด้วย commit SHA
- [x] Branch protection ไม่ให้ merge เข้า `main` ถ้า CI ไม่ผ่าน
- [x] มี PR ทดลองที่ CI ล้มเหลวแล้ว merge ไม่ได้

## Comments

หลักฐานจากการรันจริง (`main` ยังอยู่ที่ `f213e61` ไม่มีการ merge ใด)

**CI ผ่าน:** [PR #1](https://github.com/JarYin/RepairFlow/pull/1) จาก `ticket-03` เข้า `main` รันครบทุกขั้นใน [run 41225224313](https://github.com/JarYin/RepairFlow/actions/runs/41225224313) และปิดโดยไม่ merge

**CI ล้มเหลวแล้ว merge ไม่ได้:** [PR #2](https://github.com/JarYin/RepairFlow/pull/2) (draft) ใส่วงจรจริงระหว่างโมดูล `health` กับ `cycle-demo` โดยไม่มีวงจรระดับไฟล์ แล้วล้มที่ขั้น `Dependency rules` ใน [run 41225454430](https://github.com/JarYin/RepairFlow/actions/runs/41225454430) จากนั้นปิดและลบ branch แล้ว

```text
error no-module-cycle: src/health →
error no-module-cycle: src/cycle-demo →
x 2 dependency violations (2 errors, 0 warnings). 13 modules, 15 dependencies cruised.

$ gh pr view 2 --json isDraft,mergeable,mergeStateStatus,statusCheckRollup
isDraft=true mergeable=MERGEABLE mergeStateStatus=BLOCKED verify=FAILURE

$ gh pr merge 2 --merge
X Pull request JarYin/RepairFlow#2 is not mergeable: the base branch policy prohibits the merge.
```

สาเหตุคือ check ที่ล้มเหลว ไม่ใช่สถานะ draft: PR #1 ที่ CI ผ่านอ่านได้ `CLEAN` ทั้งตอนเป็น draft และไม่เป็น draft ภายใต้ protection ชุดเดียวกัน

**Branch protection ของ `main`:** check ที่บังคับคือ `verify`, `enforce_admins=true`, `required_approving_review_count=0`, `strict=false`

**สิ่งที่พบตอนเขียนกฎ:** กฎ `circular` ธรรมดาตรวจเฉพาะระดับไฟล์ จึงไม่เห็นวงจรระหว่างโมดูลที่ไม่มีไฟล์ชุดใดปิดวง ต้องเพิ่มกฎระดับโฟลเดอร์ และกฎระดับโฟลเดอร์ไม่เห็นเส้นที่ชี้เข้าโฟลเดอร์ย่อยของโมดูลอื่น จึงห้าม import แบบนั้นด้วย (บันทึกใน `docs/architecture.md`)

**ยังไม่อยู่ในตั๋วนี้:** integration test กับ Postgres ใน container เป็นงานของตั๋ว 05 ส่วนกฎห้าม query ตารางของโมดูลอื่นตาม ADR-0002 ยังไม่มีตารางให้ตรวจ
