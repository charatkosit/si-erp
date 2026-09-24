# Decision Log — SI Warehouse Management

บันทึกเฉพาะการตัดสินใจที่เปลี่ยน scope, architecture, workflow, schema, security หรือแผนงาน เพื่อให้ Agent รุ่นถัดไปไม่ย้อนตัดสินใจเดิมจาก memory ของ conversation

| ID | วันที่ | สถานะ | การตัดสินใจ | ผู้อนุมัติ | ผลกระทบ | อ้างอิง |
|---|---|---|---|---|---|---|
| D-001 | 24 ก.ย. 2569 | CONFIRMED | ใช้ Frontend Angular และ Backend NestJS แยก Docker container; PostgreSQL, Redis, TypeORM, RESTful API, JWT/RBAC | ผู้ใช้/เจ้าของโครงการ | P0 architecture และทุก phase | SDD v1.6 |
| D-002 | 24 ก.ย. 2569 | CONFIRMED | ให้ Phase 1 แสดง Wireframe/Clickable Prototype ของเมนูทั้งหมดก่อนลงรายละเอียดและพัฒนาฟังก์ชัน | ผู้ใช้/เจ้าของโครงการ | ห้ามเริ่ม business feature ก่อน Gate P1/P2 | Task List v1.0 |
| D-003 | 24 ก.ย. 2569 | CONFIRMED | ใช้ Master Agent ควบคุม task lock, state, resume และรายงานความคืบหน้าของ Agent เฉพาะทาง | ผู้ใช้/เจ้าของโครงการ | ต้องใช้ AGENTS/WORKFLOW_STATE/RESUME ทุก session | Agent Operating Model v1.0 |

## Template สำหรับรายการใหม่

| ID | วันที่ | สถานะ | การตัดสินใจ | ผู้อนุมัติ | ผลกระทบ | อ้างอิง |
|---|---|---|---|---|---|---|
| D-XXX | YYYY-MM-DD | PROPOSED/CONFIRMED/SUPERSEDED | ... | ... | task, schema, API, timeline | link/commit |


## P0-01 decisions — 2026-09-24

| ID | วันที่ | สถานะ | การตัดสินใจ | ผู้อนุมัติ | ผลกระทบ | อ้างอิง |
|---|---|---|---|---|---|---|
| D-004 | 2026-09-24 | CONFIRMED | ผู้ใช้มอบหมาย master-agent ทำเฉพาะ P0-01; lock สี่ไฟล์ Contract/State/Resume/Decisions; ใช้ Phase ID ตาม Task List/D-002 | ผู้ใช้ (คำสั่งงานปัจจุบัน); Master ออก lock | ไม่เริ่ม P0-02 หรือ business feature | docs/specs/P0-01.md |
| D-005 | 2026-09-24 | CONFIRMED | Master กำหนด UX=ux-agent, FE=frontend-agent, BE=backend-agent, DB=database-agent, CI/CD=cicd-agent, QA=qa-agent และ security-reviewer ตาม Operating Model; ยังไม่เรียกทำงานหรืออ้างว่า review ผ่าน | master-agent ตาม D-003 | ยืนยันหน้าที่ Agent ไม่แทนอำนาจธุรกิจ | docs/specs/P0-01.md |
| D-006 | 2026-09-24 | SUPERSEDED | เดิมรอระบุ PO/PM/ผู้แทนคลัง/จัดซื้อและตรวจรับ RACI; ผู้ใช้รับบทบาทชั่วคราวตาม D-008 และอนุมัติตาม D-011 แล้ว | ผู้ใช้/เจ้าของโครงการ | B-P0-01-01 resolved | D-008, D-011 |
| D-007 | 2026-09-24 | SUPERSEDED | เดิมไม่พบ Git repository; ผู้ใช้ออกคำสั่ง Git bootstrap ตาม D-009 และดำเนินการสำเร็จตาม D-010 แล้ว | ผู้ใช้/เจ้าของโครงการ | B-P0-01-02 resolved | D-009, D-010 |
| D-008 | 2026-09-24 | CONFIRMED | ผู้ใช้รับบทบาท Product Owner, PM และผู้แทนคลัง/จัดซื้อชั่วคราว ตามคำตอบ "ฉันรับบทบาทธุรกิจทั้งหมดชั่วคราว"; ยืนยันส่วนผู้รับบทบาทของ D-006 ส่วน RACI/ช่องทางยังรอ review | ผู้ใช้/เจ้าของโครงการ ผ่านคำตอบใน task นี้ | AC2 ผ่าน; AC3 ยัง PENDING | docs/specs/P0-01.md revision 1 |
| D-009 | 2026-09-24 | CONFIRMED | ผู้ใช้อนุญาต README, git init, first commit, main, origin และ push ไป https://github.com/charatkosit/si-erp.git; Master ขยาย lock เพิ่ม README.md และ .git/** เฉพาะ bootstrap นี้ | ผู้ใช้ผ่านคำสั่ง Git ใน task นี้ | แก้ข้อจำกัด Git ของ P0-01; ยังไม่ถือว่าอนุมัติ RACI หรือเริ่ม P0-02 ทั้งงาน | README.md / Git history |
| D-010 | 2026-09-24 | CONFIRMED | ดำเนิน D-009 สำเร็จ: README first commit ce1e65a7e975ad28794a8cd24460c2f6bc486003 บน main และ push ไป origin/main; D-007 resolved; RACI ยังรอตรวจรับ | master-agent ตรวจผลคำสั่งที่ผู้ใช้อนุญาต | ปลด B-P0-01-02; ไม่ปิด P0-01 | Git remote main / RESUME.md |
| D-011 | 2026-09-24 | CONFIRMED | ผู้ใช้อนุมัติ P0-01 revision 1 และยืนยันใช้ task สนทนานี้เป็นช่องทางอนุมัติ | ผู้ใช้/เจ้าของโครงการ | AC3 ผ่าน; Master ปิด P0-01 หลังตรวจ evidence และ commit | docs/specs/P0-01.md revision 1 |
| D-012 | 2026-09-24 | CONFIRMED | P0-02 ต้องนำ source documents ทั้งห้าเข้า Git, สร้าง directory baseline ด้วย .gitkeep และ README โดยไม่สร้าง application code/Compose/migration; เพิ่ม version metadata 1.0 ให้ Operating Model ให้ตรงกับ state | ผู้ใช้/เจ้าของโครงการ | Repository มีแหล่งความจริงสำหรับ Agent/Resume และขอบเขต P0-02 ชัดเจน | docs/specs/P0-02.md |
| D-013 | 2026-09-24 | CONFIRMED | P0-02 ผ่านเกณฑ์: source documents เข้า Git, version ถูกต้อง, ไม่มี secret, baseline structure/README พร้อม, staged allowlist ถูกต้อง และไม่มี feature/Compose/migration | master-agent ตรวจตาม acceptance ที่ user/project-owner กำหนด | ปิด P0-02; next P0-03 ยังไม่เริ่ม | commit 9ab03edefb99587052abf7eaa1498f11b7079ba6 / docs/specs/P0-02.md |
| D-014 | 2026-09-24 | CONFIRMED | ใช้ main เป็น protected long-lived branch, short-lived task branches, PR-only merge, squash default, reviewer matrix ตามความเสี่ยง, ห้าม merge งาน BLOCKED; required CI checks จะผูกหลัง P0-11 สร้างชื่อ check ที่เสถียร | ผู้ใช้มอบหมาย P0-03; master-agent จัดทำตาม Task List/Operating Model | ควบคุมการ merge/review ทุก task หลัง P0-03 | docs/GIT_WORKFLOW.md; docs/DEFINITION_OF_DONE.md |
| D-015 | 2026-09-24 | CONFIRMED | P0-03 ผ่านเกณฑ์ policy/reviewer/BLOCKED/PR template/DoD และ commit แล้ว; การเปิด GitHub ruleset เป็น repository-admin operation ตาม activation checklist ส่วน required CI checks รอ P0-11 | master-agent ตรวจ acceptance ตาม Task List/Operating Model | ปิด P0-03; next P0-04 ยังไม่เริ่ม | commit 611b212159f9150591a7b94f7de39c4035e328e4 / docs/GIT_WORKFLOW.md |
| D-016 | 2026-09-24 | CONFIRMED | ผู้ใช้/เจ้าของโครงการอนุมัติใช้ Redis 8.10.2 ภายใต้ source-available license สำหรับ deployment นี้ หลังได้รับการแจ้ง license; ใช้ official image `redis:8.10.2-trixie` | ผู้ใช้/เจ้าของโครงการ ผ่านคำตอบ “อนุมัติ” ใน task นี้ | ปลด B-P0-04-01 และอนุญาตให้ P0-05 ใช้ baseline นี้; การเปลี่ยน cache/queue server ต้องทำ Change Request | docs/TECHNOLOGY_COMPATIBILITY_MATRIX.md |
| D-017 | 2026-09-24 | CONFIRMED | P0-04 ผ่าน technical acceptance: matrix, lock manifest และ `.nvmrc` ตรงกัน; upstream compatibility/image-tag review, scope/secret/staged checks และ push ผ่าน | master-agent ตามเกณฑ์ P0-04 ที่ผู้ใช้มอบหมาย และ D-016 | ปิด P0-04; P0-05 ต้องใช้ baseline โดยไม่ขยาย version เอง | commit f744687d24e4c44ae55869a7f099fc026fa9ad96 |
| D-018 | 2026-09-24 | CONFIRMED | ผู้ใช้อนุมัติให้ P0-05 ทำ Compose wiring และตรวจ data-service health ก่อน โดยเลื่อน health acceptance ของ frontend/backend ไป P0-08 | ผู้ใช้/เจ้าของโครงการ ผ่านคำตอบ “ได้” ใน task นี้ | ปลด B-P0-05-01; P0-08 ต้องตรวจรับ frontend/backend health ที่เลื่อนมา | docs/specs/P0-05.md |
