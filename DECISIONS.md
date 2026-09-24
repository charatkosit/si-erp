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
| D-006 | 2026-09-24 | PROPOSED | รอระบุ PO/PM/ผู้แทนคลัง/จัดซื้อ และตรวจรับ RACI revision 1; เสนอผู้ใช้/เจ้าของโครงการเป็น reviewer ผ่านข้อความใน task นี้ ระบุ revision/บทบาท/ผลอนุมัติ | รอผู้ใช้/เจ้าของโครงการ | B-P0-01-01; ยังปิดงานไม่ได้ | docs/specs/P0-01.md |
| D-007 | 2026-09-24 | PROPOSED | ไม่พบ Git repository; รอระบุ checkout ที่มี Git หรืออนุญาตข้อยกเว้น git init เฉพาะเก็บ P0-01 โดยขยาย lock ก่อน; ยังไม่สร้าง repository เพราะอยู่ P0-02 | รอผู้ใช้/เจ้าของโครงการ | B-P0-01-02; commit ไม่ได้ | RESUME.md |
| D-008 | 2026-09-24 | CONFIRMED | ผู้ใช้รับบทบาท Product Owner, PM และผู้แทนคลัง/จัดซื้อชั่วคราว ตามคำตอบ "ฉันรับบทบาทธุรกิจทั้งหมดชั่วคราว"; ยืนยันส่วนผู้รับบทบาทของ D-006 ส่วน RACI/ช่องทางยังรอ review | ผู้ใช้/เจ้าของโครงการ ผ่านคำตอบใน task นี้ | AC2 ผ่าน; AC3 ยัง PENDING | docs/specs/P0-01.md revision 1 |
| D-009 | 2026-09-24 | CONFIRMED | ผู้ใช้อนุญาต README, git init, first commit, main, origin และ push ไป https://github.com/charatkosit/si-erp.git; Master ขยาย lock เพิ่ม README.md และ .git/** เฉพาะ bootstrap นี้ | ผู้ใช้ผ่านคำสั่ง Git ใน task นี้ | แก้ข้อจำกัด Git ของ P0-01; ยังไม่ถือว่าอนุมัติ RACI หรือเริ่ม P0-02 ทั้งงาน | README.md / Git history |
| D-010 | 2026-09-24 | CONFIRMED | ดำเนิน D-009 สำเร็จ: README first commit ce1e65a7e975ad28794a8cd24460c2f6bc486003 บน main และ push ไป origin/main; D-007 resolved; RACI ยังรอตรวจรับ | master-agent ตรวจผลคำสั่งที่ผู้ใช้อนุญาต | ปลด B-P0-01-02; ไม่ปิด P0-01 | Git remote main / RESUME.md |
| D-011 | 2026-09-24 | CONFIRMED | ผู้ใช้อนุมัติ P0-01 revision 1 และยืนยันใช้ task สนทนานี้เป็นช่องทางอนุมัติ | ผู้ใช้/เจ้าของโครงการ | AC3 ผ่าน; Master ปิด P0-01 หลังตรวจ evidence และ commit | docs/specs/P0-01.md revision 1 |
