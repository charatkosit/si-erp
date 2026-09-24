# SI Warehouse — กติกาบังคับสำหรับทุก Agent

## เริ่มงานทุกครั้ง

อ่านตามลำดับนี้ก่อนแก้ไฟล์หรือเรียก Agent อื่น:

1. `AGENTS.md`
2. `WORKFLOW_STATE.json`
3. `RESUME.md`
4. `DECISIONS.md`
5. `SI_Warehouse_Implementation_Task_List.md`
6. `docs/specs/<task-id>.md` และส่วนที่เกี่ยวข้องของ PRD/SDD

## กติกาหลัก

- ทำได้ครั้งละหนึ่ง Task ID ที่ Master lock ให้เท่านั้น
- ห้ามแก้ไฟล์นอก `allowed_paths` ของ task; shared contract/schema/infra ต้องขอ Master lock
- ห้าม mark งาน `DONE` เอง; ส่ง evidence ให้ Master เพื่อ review และเปลี่ยนสถานะ
- ทุก milestone ต้องบันทึก test ที่รัน, ผลลัพธ์, ไฟล์ที่เปลี่ยน, commit และ next action ใน handoff
- หาก context/usage limit ใกล้หมด ให้หยุดที่ checkpoint ที่ atomic, update handoff และอย่าเริ่มงานใหญ่ใหม่
- หาก requirement ไม่ชัด/ขัดกัน ให้ mark `BLOCKED` พร้อมคำถามและทางเลือก; ห้ามเดา
- ห้าม commit secret, token, PII, รูปเอกสารจริง หรือ migration ที่ยังไม่ได้ review
- ไม่ hard delete ธุรกรรมหรือข้อมูล migration ที่มีการใช้งาน; ให้ใช้ workflow ที่ย้อนกลับได้

## Agent Handoff Format

```markdown
Task ID:
Status: IN_REVIEW | BLOCKED | IN_PROGRESS
Changed:
Verification:
Evidence (commit/PR/files):
Known issues or blockers:
Next action:
```

## หลักการ Resume

ใช้ไฟล์ state เป็นแหล่งความจริง ไม่ใช้ memory ของ conversation เป็นหลัก หากไฟล์ state กับ repository ไม่ตรง ให้แจ้ง Master เพื่อสร้าง reconciliation task ก่อนทำงานต่อ

