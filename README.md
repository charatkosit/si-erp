# SI Warehouse Management

Repository baseline สำหรับระบบบริหารคลังสินค้าและวัสดุโครงการของบริษัท System Integrator

## Repository structure

```text
apps/
  frontend/       Angular application (เริ่มใน task ที่ได้รับ lock)
  backend/        NestJS application (เริ่มใน task ที่ได้รับ lock)
packages/         Shared packages/contracts ตาม task ที่อนุมัติ
infra/            Infrastructure files ตาม Phase 0 task
docs/
  specs/          Task Contracts
  ux/             UX artifacts
  qa/             QA plans and evidence
tests/             Cross-application tests
```

Directory เปล่าใช้ `.gitkeep` เพื่อให้ Git เก็บ repository baseline โดยยังไม่มี application code

## Safe start sequence

ก่อนแก้ไฟล์หรือมอบหมาย Agent ทุกครั้ง:

1. อ่าน `AGENTS.md`
2. อ่าน `WORKFLOW_STATE.json`
3. อ่าน `RESUME.md`
4. อ่าน `DECISIONS.md`
5. อ่าน `docs/SI_Warehouse_Implementation_Task_List.md`
6. อ่าน `docs/specs/<task-id>.md` และส่วน PRD/SDD ที่เกี่ยวข้อง
7. ตรวจว่า task มีสถานะ `IN_PROGRESS`, มี active lock และ path ที่จะแก้อยู่ใน `allowed_paths`
8. ตรวจ Git status และ evidence ล่าสุดก่อนดำเนินงาน

ทำได้ครั้งละหนึ่ง Task ID เท่านั้น ห้ามเริ่ม business feature ก่อน Wireframe/Screen Spec gate และห้ามแก้ API, schema, permission หรือ environment contract โดยไม่มี Change Request ตาม Operating Model

## Source documents

- `AGENTS.md` — กติกาบังคับสำหรับ Agent
- `docs/PRD_SI_Warehouse_Management.md` — PRD v1.7
- `docs/SDD_SI_Warehouse_Management.md` — SDD v1.6
- `docs/SI_Warehouse_Implementation_Task_List.md` — Task List v1.0
- `docs/SI_Warehouse_Agent_Operating_Model.md` — Operating Model v1.0
- `WORKFLOW_STATE.json`, `RESUME.md`, `DECISIONS.md` — durable workflow state

## Current scope

P0-02 จัดทำเฉพาะ repository baseline และเอกสารต้นทาง ยังไม่มี Frontend/Backend business feature, Docker Compose, dependencies หรือ database migration
