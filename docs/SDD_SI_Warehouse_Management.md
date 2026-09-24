# เอกสารออกแบบซอฟต์แวร์ (SDD)

## ระบบบริหารคลังสินค้าและวัสดุโครงการสำหรับบริษัท System Integrator

**เวอร์ชัน:** 1.6  
**อ้างอิง:** PRD_SI_Warehouse_Management.md เวอร์ชัน 1.7  
**วันที่:** 24 กันยายน 2569  
**สถานะ:** ร่างเพื่อเริ่มออกแบบและพัฒนา

---

## 1. วัตถุประสงค์ของเอกสาร

เอกสารนี้แปลงความต้องการจาก PRD เป็นสถาปัตยกรรม ระบบข้อมูล โมดูล API กฎความปลอดภัย และแนวทางติดตั้งของระบบ Warehouse Management สำหรับบริษัท System Integrator ที่มี 5 คลังในบริษัทเดียวกัน

เป้าหมายสำคัญคือให้ระบบติดตามวัสดุโครงการตั้งแต่ BOQ, การจัดซื้อ, Supplier-held, รับเข้า, Serial, จัด/จ่ายสินค้า, ส่งมอบหน้างาน และใบส่งของที่ลงนามกลับบริษัทได้อย่างตรวจสอบย้อนหลังได้ พร้อมแสดงรูปอ้างอิงของสินค้าให้ผู้ปฏิบัติงานระบุสินค้าได้ตรงกัน

---

## 2. ขอบเขตเชิงเทคนิคและข้อสมมติ

| หัวข้อ | ข้อกำหนดออกแบบ |
|---|---|
| โครงสร้างระบบ | Frontend และ Backend แยกกันคนละ Server ใน Production; ระหว่างพัฒนาอยู่ Host เดียวกันได้ |
| Frontend | Angular แบบ SPA Responsive รองรับ Desktop และ Mobile Web |
| Backend | NestJS แบบ Modular Monolith, RESTful API ผ่าน HTTPS |
| Database | PostgreSQL เป็นฐานข้อมูลหลัก; TypeORM สำหรับ data access และ migration |
| Cache/งานเบื้องหลัง | Redis สำหรับ cache, rate limit, queue และ token/session support |
| Authentication | JWT access token แบบอายุสั้น + refresh token แบบหมุนเวียน; RBAC และ data scope |
| การแยกระบบ | Docker container แยก `frontend`, `backend`, `postgres`, `redis` และ service เสริมตามความจำเป็น |
| ต้นทุน | ใช้ราคาซื้อจริงต่อ Lot/Serial และ FIFO เพื่อคำนวณมูลค่าสต็อกสำหรับบริหาร; ไม่สร้างรายการ GL หรือระบบบัญชีเจ้าหนี้เต็มรูปแบบ |
| Go-live | ต้องมี Phase 0 สำหรับ Opening Stock ของทั้ง 5 คลัง; สินค้าตั้งต้นที่ผ่านการยืนยันเป็น Shared Stock และไม่ผูกโครงการ |
| Physical location | หน่วยตำแหน่งต่ำสุดคือ Bin โดยใช้ลำดับ Warehouse → Zone → Rack → Shelf → Bin และติด QR/Barcode ทุก Bin |
| Special stock | แยก Ownership, Inventory Status และ Physical Location; DEMO, RMA และ HOLD/OPEN_BOX ไม่เป็น Available stock โดยอัตโนมัติ |
| Warehouse scope | มี 5 คลังในบริษัทเดียวกัน; ทุก Warehouse ใช้ master location และ status policy ชุดเดียวกัน |
| Product image | รูปอยู่ระดับ Item Master (SKU/รุ่น) มีรูปหลักและรูปเพิ่มเติม; แยกจากรูป Serial และหลักฐานธุรกรรม, ใช้ Object Storage และ audit ทุกการจัดการรูป |

---

## 3. สถาปัตยกรรมภาพรวม

```mermaid
flowchart TB
  U["ผู้ใช้ Desktop / Mobile"] --> FE["Angular Frontend\nFrontend Server / Container"]
  FE -->|HTTPS REST API| BE["NestJS Backend\nBackend Server / Container"]
  BE --> PG["PostgreSQL\nธุรกรรมและ Audit"]
  BE --> R["Redis\nCache, Queue, Rate limit"]
  BE --> OS["Object Storage\nรูปสินค้า / หลักฐาน / ฉลาก"]
  BE --> NT["Notification Adapter\nEmail / LINE / Push ในอนาคต"]
```

### 3.1 Production topology

| Server/Zone | Container หรือองค์ประกอบ | หน้าที่ |
|---|---|---|
| Frontend Server / DMZ | `frontend` + Nginx | เสิร์ฟ Angular static files, TLS termination หรือ reverse proxy ตามนโยบาย IT |
| Backend Server / App Zone | `backend` | NestJS API, authorization, workflow, report generation และ worker process |
| Data Zone | PostgreSQL, Redis, Object Storage | เก็บข้อมูลและไฟล์หลักฐาน; ไม่เปิด public Internet |
| Monitoring/Backup Zone | Monitoring, log aggregation, backup job | เฝ้าระวังและสำรองข้อมูล |

**Network rule:** เปิดจาก Internet/Corporate network ไป Frontend เฉพาะ HTTPS 443; Frontend ติดต่อ Backend เฉพาะ HTTPS; เฉพาะ Backend เท่านั้นที่ติดต่อ PostgreSQL, Redis และ Object Storage ได้

### 3.2 Development topology

ระหว่างพัฒนา ทุก container อยู่บน host เดียวกันผ่าน Docker Compose network เดียวกัน โดย Frontend เข้าถึง Backend ผ่าน `/api` reverse proxy เพื่อจำลองพฤติกรรม Production และลดปัญหา CORS

```mermaid
flowchart LR
  DEV["Developer Host"] --> FEC["frontend :4200"]
  DEV --> BEC["backend :3000"]
  BEC --> PGC["postgres :5432"]
  BEC --> RC["redis :6379"]
  BEC --> MC["minio :9000\noptional dev"]
```

---

## 4. Technology Stack

### 4.1 Frontend

| ส่วน | เทคโนโลยี/แนวทาง |
|---|---|
| Framework | Angular (standalone components, lazy-loaded feature routes) |
| UI | Responsive component system และ design tokens; รองรับ Thai-first UI |
| Product image UX | แสดง thumbnail ในรายการรับเข้า/Pick/Issue/Delivery และเปิด gallery ได้; ใช้ placeholder เมื่อไม่มีรูป, โหลดรูปเต็มเฉพาะเมื่อผู้ใช้เปิดดู |
| State | Angular Signals สำหรับ local/UI state; service/facade สำหรับ server state; ไม่เก็บ access token ถาวรใน Local Storage |
| API | Angular `HttpClient`, interceptor สำหรับ access token, retry เฉพาะ request ที่ idempotent |
| Forms | Typed Reactive Forms และ validation ที่สอดคล้อง API contract |
| Scanner/Camera | Web Camera API ผ่าน HTTPS; รองรับกรอก Manual fallback เสมอ |
| Offline draft | IndexedDB สำหรับรายการร่างและรูปที่รอส่งใน Phase 2 |
| Test | Unit: Jasmine/Karma หรือ Jest ตามมาตรฐานทีม; E2E: Playwright |

### 4.2 Backend

| ส่วน | เทคโนโลยี/แนวทาง |
|---|---|
| Framework | NestJS แบบ Modular Monolith |
| API | RESTful JSON, version prefix `/api/v1`, OpenAPI/Swagger เป็น API contract |
| ORM | TypeORM + PostgreSQL migrations แบบ versioned |
| Validation | `class-validator`/`class-transformer` หรือ schema validation ที่ประกาศ DTO ชัดเจน |
| Auth | Passport JWT strategy, guards, permission decorator, refresh token rotation |
| Queue | BullMQ บน Redis สำหรับแจ้งเตือน, export report, import BOQ และประมวลผลรูป |
| Logging | Structured JSON log พร้อม request/correlation ID |
| Test | Unit test สำหรับ domain services, integration test กับ PostgreSQL, E2E สำหรับ API สำคัญ |

### 4.3 Data and infrastructure

| ส่วน | เทคโนโลยี/แนวทาง |
|---|---|
| Main database | PostgreSQL: constraints, transactions, row locks, JSONB เฉพาะข้อมูลยืดหยุ่น |
| Cache/queue | Redis แยก data volume, password และ private network |
| File evidence | S3-compatible Object Storage เช่น MinIO (on-prem) หรือ cloud object storage; เก็บเฉพาะ metadata/file key ใน PostgreSQL และแยก purpose `ITEM_IMAGE` ออกจากหลักฐานธุรกรรม |
| Container | Docker multi-stage build; Docker Compose สำหรับ dev; image registry สำหรับ production |
| Reverse proxy | Nginx หรือองค์กรกำหนด; HTTP security headers และ request size limit |

---

## 5. โครงสร้างโครงการและโมดูล

```text
si-warehouse/
├── apps/
│   ├── frontend/                 # Angular
│   └── backend/                  # NestJS
├── packages/
│   ├── api-contracts/            # OpenAPI generated types/DTO contracts (optional)
│   └── shared-types/             # constants ที่ไม่ผูก framework
├── infra/
│   ├── nginx/
│   ├── docker/
│   └── compose/
├── docs/
│   ├── PRD_SI_Warehouse_Management.md
│   └── SDD_SI_Warehouse_Management.md
└── docker-compose.dev.yml
```

### 5.1 NestJS modules

| Module | ความรับผิดชอบ |
|---|---|
| `auth` | login, refresh, logout, password policy, session/token revoke |
| `iam` | users, roles, permissions, role assignments, data scopes |
| `master-data` | item, category, brand, UOM, supplier, warehouse, location hierarchy, QR/Barcode label, vehicle และ item image gallery |
| `projects` | project, phase, BOQ revision, material requirement, readiness calculation |
| `procurement` | PR, PO, PO lines, supplier-held, expected delivery |
| `inventory` | stock balance ระดับ Bin, immutable stock ledger, receipt cost layer, FIFO consumption, reservation, put-away, transfer, adjustment, stock count และ pick route |
| `opening-stock` | cutover batch, import/count/recount, serial verification, quarantine, variance review และ post opening balance |
| `special-stock` | third-party demo custody/loan, RMA claim, non-sellable inspection, release/disposal decision และ overdue reminders |
| `serials` | serial/MAC registry, lifecycle, warranty, duplicate prevention |
| `fulfillment` | pick list, issue note, field receipt, return |
| `delivery` | delivery job, driver assignment, proof of delivery, paper document return |
| `approvals` | approval policy per project, approval action, maker-checker rule |
| `files` | signed upload URL, attachment metadata, thumbnail/image-processing queue, virus-scan hook in future |
| `reports` | dashboard read models, export jobs, project capital-control reports |
| `notifications` | event consumers, reminder policy, delivery channel adapters |
| `audit` | immutable audit event, actor, before/after summaries |
| `health` | `/health/live`, `/health/ready`, dependency checks |

### 5.2 Angular feature areas

- Auth and session handling
- Dashboard and alerts
- Item Master and product image gallery
- Projects / BOQ / material readiness
- Procurement and Supplier-held
- Receiving / serial scan / put-away to Bin / location label scan
- Opening Stock / Cutover count / variance review
- Demo / RMA / Non-sellable special stock workbench
- Inventory / transfer / count
- Pick, issue and field return
- Delivery workbench (warehouse) and delivery-driver mobile view
- Reports and exports
- Administration, roles, permission and audit log

---

## 6. Domain Model และฐานข้อมูล

### 6.1 หลักการออกแบบข้อมูล

1. ยอดคงเหลือเกิดจาก **stock ledger ที่เป็น immutable**; ตาราง balance เป็น read model/summary ไม่ใช่แหล่งความจริงเพียงแห่งเดียว
2. ทุกเอกสารธุรกรรมใช้ UUID ภายใน และเลขเอกสารที่มนุษย์อ่านได้ เช่น `PO-YYYYMM-####`, `GRN-...`, `DO-...`
3. ห้าม hard delete ธุรกรรม; ใช้ cancel/void พร้อมเหตุผลและ audit event
4. Serial เป็นเอกลักษณ์ระดับองค์กร (`unique(serial_number)`) และมีตำแหน่ง/สถานะปัจจุบันได้หนึ่งค่าในเวลาเดียว
5. เงินจำนวนใช้ `numeric(18,2)` และจำนวนสินค้าใช้ `numeric(18,4)`; ห้ามใช้ float
6. ต้นทุนเป็น receipt-cost layer: ราคาจริงของ GRN/Opening Stock หนึ่ง Lot ไม่ถูกเขียนทับเมื่อราคาซื้อครั้งใหม่เปลี่ยน
6. เวลาเก็บเป็น `timestamptz` แบบ UTC; UI แสดง Asia/Bangkok

### 6.2 ความสัมพันธ์หลัก

```mermaid
erDiagram
  PROJECT ||--o{ BOQ_REVISION : has
  BOQ_REVISION ||--o{ BOQ_LINE : contains
  PROJECT ||--o{ PURCHASE_REQUEST : owns
  PURCHASE_ORDER ||--o{ PURCHASE_ORDER_LINE : contains
  PURCHASE_ORDER_LINE }o--o{ BOQ_LINE : allocates_to
  PURCHASE_ORDER ||--o{ GOODS_RECEIPT : received_by
  ITEM ||--o{ SERIAL_ASSET : identifies
  WAREHOUSE ||--o{ STORAGE_LOCATION : contains
  STORAGE_LOCATION ||--o{ SERIAL_ASSET : current_location
  ITEM ||--o{ STOCK_LEDGER : moves
  STORAGE_LOCATION ||--o{ STOCK_LEDGER : from_or_to
  OPENING_STOCK_BATCH ||--o{ OPENING_STOCK_LINE : contains
  OPENING_STOCK_LINE ||--o{ OPENING_STOCK_SERIAL : captures
  OPENING_STOCK_BATCH ||--o{ STOCK_LEDGER : posts
  PICK_LIST ||--o{ PICK_LINE : contains
  ISSUE_NOTE ||--o{ DELIVERY_JOB : fulfills
  DELIVERY_JOB ||--o{ DELIVERY_PROOF : records
  USER ||--o{ DELIVERY_JOB : assigned_driver
```

### 6.3 ตารางหลัก

| กลุ่ม | ตารางสำคัญ | หมายเหตุ |
|---|---|---|
| IAM | `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `data_scopes`, `user_data_scopes`, `refresh_sessions` | Role และขอบเขต Project/Warehouse แยกกัน |
| Master | `items`, `item_images`, `item_categories`, `brands`, `units`, `suppliers`, `warehouses`, `storage_locations`, `vehicles` | `items.item_classification` เช่น `ELECTRICAL_HIGH_VALUE`/`ACCESSORY`/`CONSUMABLE` ใช้บังคับ Serial/approval; `item_images` เก็บ attachment, ลำดับ, primary flag, caption และสถานะ archive; `storage_locations` เก็บ Zone/Rack/Shelf/Bin, `path_code`, QR/Barcode |
| Project | `projects`, `project_phases`, `boq_revisions`, `boq_lines`, `material_requirements` | BOQ line เก็บ need-by date และราคาแผน |
| Procurement | `purchase_requests`, `purchase_request_lines`, `purchase_orders`, `purchase_order_lines`, `po_line_allocations`, `supplier_held_records` | Supplier-held เป็น asset/PO commitment แต่ไม่ใช่ on-hand |
| Inventory | `stock_ledger`, `stock_balances`, `inventory_cost_layers`, `cost_layer_consumptions`, `stock_reservations`, `stock_counts`, `stock_count_lines`, `inventory_adjustments` | ledger ประเภท OPENING_BALANCE, RECEIVE, RESERVE, ISSUE, TRANSFER, RETURN, ADJUST; cost layer ตัดด้วย FIFO |
| Special Stock | `stock_ownerships`, `demo_custodies`, `demo_loans`, `rma_cases`, `rma_events`, `condition_inspections`, `special_stock_status_history` | แยกเจ้าของ, DEMO, RMA, HOLD/OPEN_BOX, กำหนดคืน/เคลม และผลตัดสิน |
| Opening Stock | `opening_stock_batches`, `opening_stock_lines`, `opening_stock_serials`, `opening_stock_variances`, `opening_stock_approvals` | เก็บ Cutover, ผลนับ, Serial, ต้นทุนต่อหน่วยจริง/ประมาณ, Quarantine, ผลต่างและการอนุมัติก่อน Post |
| Serial | `serial_assets`, `serial_movements`, `serial_attributes` | เก็บ serial, MAC, warranty, current status/location |
| Fulfillment | `pick_lists`, `pick_lines`, `issue_notes`, `issue_lines`, `field_receipts`, `returns` | คง reference ต่อ BOQ/project และ serial |
| Delivery | `delivery_jobs`, `delivery_job_lines`, `delivery_proofs`, `delivery_document_returns` | แยกงานส่งจาก Issue Note แต่ผูกกันเสมอ |
| Workflow | `approval_policies`, `approval_steps`, `approval_requests`, `approval_actions` | PM ตั้ง policy รายโครงการภายใต้ขอบเขตสิทธิ์ |
| Cross-cutting | `attachments`, `document_line_image_snapshots`, `audit_logs`, `outbox_events`, `idempotency_keys` | `document_line_image_snapshots` อ้าง attachment/version ของรูปหลัก ณ เวลาสร้างเอกสาร เพื่อให้ประวัติไม่เปลี่ยนตามการแก้รูปใน Item Master |

### 6.4 Constraint และ index สำคัญ

- `serial_assets.serial_number` เป็น unique และ normalized ก่อนบันทึก
- `item_images` มี `item_id`, `attachment_id`, `sort_order`, `is_primary`, `caption`, `archived_at`, `created_by`; ใช้ partial unique index `(item_id) WHERE is_primary = true AND archived_at IS NULL` เพื่อมีรูปหลักที่ใช้งานได้เพียงหนึ่งรูปต่อสินค้า
- Backend จำกัดจำนวนรูป active ต่อ Item ตาม setting (ค่าเริ่มต้น 5 รูป); item image รับเฉพาะ JPEG/PNG/WebP ขนาดไม่เกิน 5 MB, ตรวจ MIME จากไฟล์จริง และห้าม SVG/PDF เป็นรูปสินค้า
- `document_line_image_snapshots` เก็บ `document_type`, `document_line_id`, `item_image_id`, `attachment_id`, `image_version`, `captured_at`; เมื่อสร้าง GRN/Pick/Issue/Delivery ให้บันทึก snapshot ของรูปหลักที่มีในขณะนั้น และห้าม hard-delete attachment ที่มี snapshot อ้างถึง
- `storage_locations` มี `warehouse_id`, `zone_code`, `rack_code`, `shelf_code`, `bin_code`, `path_code`, `location_type`, `is_active`; unique ต่อ `(warehouse_id, zone_code, rack_code, shelf_code, bin_code)` และ `path_code`
- `storage_locations.qr_code` unique และ Location ระดับ Rack/Shelf มีไว้เพื่อพิมพ์ป้าย/นำทาง แต่เฉพาะ `is_bin=true` ใช้เป็นต้นทางหรือปลายทางของ stock ledger ได้
- `storage_locations.location_type` allowlist อย่างน้อย `AVAILABLE_STORAGE`, `QUARANTINE`, `DEMO`, `RMA`, `HOLD`, `OPEN_BOX`, `PICK_PACK`; transaction guard ตรวจว่า status ของสินค้าเข้ากับ Bin ปลายทางได้
- `stock_balances` unique ต่อ `(item_id, warehouse_id, location_id, stock_status, project_id nullable)`
- `inventory_cost_layers` เก็บ `received_at`, `unit_cost`, `original_qty`, `remaining_qty`, `cost_source` และผูกกับ GRN line หรือ Opening Stock line; index `(item_id, remaining_qty, received_at, id)` ใช้เลือก FIFO layer
- `cost_layer_consumptions` unique ต่อ source transaction line/layer เพื่อป้องกันตัดต้นทุนซ้ำเมื่อ mobile request retry
- `stock_ledger` index ที่ `(item_id, occurred_at)`, `(serial_asset_id, occurred_at)`, `(project_id, occurred_at)`
- เพิ่ม index `stock_balances(location_id, item_id)` และ `serial_assets(current_location_id)` เพื่อค้นหาของตาม Shelf/Bin และสร้าง Pick List ได้เร็ว
- `opening_stock_batches` unique ต่อ `(warehouse_id, cutover_date)` และ Post ได้เพียงครั้งเดียว
- `opening_stock_serials` ต้องผ่าน unique check เดียวกับ `serial_assets.serial_number` ก่อน Post
- `opening_stock_lines` ที่ `condition=QUARANTINE` ห้ามส่งผลไปยัง `available_qty`
- Opening Stock line ต้องมี `opening_unit_cost`; หาก `cost_source=ESTIMATED` ต้องมี `cost_note` และแสดงในรายงานทุกครั้ง
- `stock_ownerships` ระบุ `ownership_type` (`COMPANY`, `THIRD_PARTY`), owner/supplier และ effective date; Third-party ห้ามมี inventory cost layer ของบริษัท
- `rma_cases.rma_number` unique ต่อองค์กร และ `demo_custodies` ต้องมี owner, received date, due date (ถ้ามี) และ current location
- `purchase_order_lines` และ `boq_lines` ต้องมี constraint ป้องกันจำนวน allocated เกินยอดเอกสาร
- เอกสารที่เปลี่ยนสถานะใช้ optimistic locking (`version`) และธุรกรรมตัดสต็อกใช้ database transaction + row lock

---

## 7. State Machine และกฎธุรกรรม

### 7.0 สถานะ Opening Stock Batch

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Counting
  Counting --> Review
  Review --> Recount
  Recount --> Review
  Review --> Approved
  Approved --> Posted
  Draft --> Cancelled
  Counting --> Cancelled
```

- Batch หนึ่งผูกกับคลังหนึ่งแห่งและ Cutover date หนึ่งวัน
- เฉพาะ `Posted` เท่านั้นที่สร้าง stock ledger `OPENING_BALANCE` และ Shared Stock พร้อมใช้
- หลัง Post ห้ามแก้บรรทัด; ส่วนต่างภายหลังต้องใช้ Adjustment ตาม approval policy
- รายการ Quarantine และสินค้าที่ไม่รู้รหัสสามารถอยู่ใน batch ได้ แต่ไม่สร้าง available balance

### 7.1 สถานะ PO และ Supplier-held

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> PendingApproval
  PendingApproval --> Approved
  PendingApproval --> Rejected
  Approved --> SentToSupplier
  SentToSupplier --> PartiallyReceived
  SentToSupplier --> SupplierHeld
  SupplierHeld --> PartiallyReceived
  PartiallyReceived --> Closed
  SentToSupplier --> Cancelled
```

- เมื่อ PO มีสถานะ `SentToSupplier` ระบบสร้าง/อัปเดต Project Capital Commitment
- `SupplierHeld` เก็บจำนวนและมูลค่าที่ Supplier รับฝาก; ไม่เพิ่ม `available_qty` ในคลัง
- รับเข้าสินค้าบางส่วนได้ และสร้าง GRN/serial ตามจำนวนจริง

### 7.2 สถานะสินค้าคงคลังและ Serial

| สถานะ | ความหมาย | จ่ายได้หรือไม่ |
|---|---|---|
| `AVAILABLE` | พร้อมใช้ในคลัง รวม Shared Stock ที่ผ่าน Opening Balance | ได้ |
| `RESERVED` | จองให้โครงการ | ตามใบจ่ายที่เกี่ยวข้องเท่านั้น |
| `PICKED` | จัดออกจาก location แล้ว รอจ่าย/ส่ง | ไม่ได้กับรายการอื่น |
| `IN_TRANSIT` | อยู่กับพนักงานส่งสินค้า/ระหว่างทาง | ไม่ได้ |
| `AT_SITE` | ส่งถึงหน้างาน | ไม่ได้จากคลัง |
| `INSTALLED` | ติดตั้งแล้ว | ไม่ได้ |
| `QUARANTINE` | รอตรวจ/มีปัญหา | ไม่ได้ |
| `DAMAGED` | เสียหาย | ไม่ได้ |
| `RETURNED` | รับคืนแล้ว รอตรวจสภาพ | ไม่ได้จนกว่าจะเปลี่ยนสถานะ |
| `DEMO` | สินค้าตัวอย่างของบุคคลภายนอก | ไม่ได้ |
| `RMA_CLAIM` | สินค้าบริษัทที่รอหรืออยู่ระหว่างเคลม | ไม่ได้ |
| `NON_SELLABLE` | กล่อง/สภาพไม่สมบูรณ์ รอผลตรวจ | ไม่ได้ |

### 7.3 สถานะ Delivery Job

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Assigned
  Assigned --> Loaded
  Loaded --> InTransit
  InTransit --> Delivered
  InTransit --> PartialDelivery
  InTransit --> DeliveryFailed
  Delivered --> AwaitingPaperReturn
  PartialDelivery --> AwaitingPaperReturn
  AwaitingPaperReturn --> Closed
  DeliveryFailed --> ReturnedToWarehouse
```

**เงื่อนไขปิดงาน:** `Delivered` หรือ `PartialDelivery` ต้องมีข้อมูลผู้รับ, เวลาส่ง, หลักฐานรูปใบส่งของลงนาม และ `delivery_document_returns.received_at` ก่อนเปลี่ยนเป็น `Closed`

---

## 8. Authorization Design

### 8.1 รูปแบบสิทธิ์

การอนุญาตทุก API ใช้ 3 ชั้นพร้อมกัน:

1. **Authentication** — ยืนยันตัวตนด้วย access token
2. **Role/Permission** — เช่น `inventory.issue.create`, `delivery.proof.create`
3. **Data scope** — ตรวจว่า user มีสิทธิ์ใน warehouse/project/document นั้น

ตัวอย่าง permission สำคัญ:

| Permission | บทบาทหลัก |
|---|---|
| `project.boq.manage` | PM |
| `items.read` | ทุกบทบาทปฏิบัติการตาม data scope เพื่อเห็นข้อมูลและรูปสินค้าในงานของตน |
| `items.manage_images` | ผู้ดูแลระบบ, ผู้จัดการคลังที่ได้รับมอบหมาย |
| `procurement.po.manage` | จัดซื้อ, PM ตาม policy |
| `inventory.receive.create` | เจ้าหน้าที่คลัง, ผู้จัดการคลัง |
| `inventory.location.read` | เจ้าหน้าที่คลัง, ผู้จัดการคลัง, PM ตาม data scope |
| `inventory.location.manage` | ผู้จัดการคลัง, ผู้ดูแลระบบ |
| `inventory.put-away.create` | เจ้าหน้าที่คลัง, ผู้จัดการคลัง |
| `special-stock.demo.manage` | เจ้าหน้าที่คลัง, ผู้จัดการคลัง |
| `special-stock.rma.manage` | เจ้าหน้าที่คลัง, ผู้จัดการคลัง |
| `special-stock.non-sellable.review` | ผู้จัดการคลัง |
| `special-stock.release.approve` | ผู้จัดการคลัง; PM เพิ่มเติมเมื่อปลดไปใช้โครงการ |
| `inventory.opening-stock.manage` | เจ้าหน้าที่คลัง, ผู้จัดการคลัง |
| `inventory.opening-stock.approve` | ผู้จัดการคลัง |
| `inventory.opening-stock.post` | ผู้จัดการคลัง หรือผู้ดูแลระบบตาม Cutover policy |
| `inventory.transfer.accessory` | เจ้าหน้าที่คลัง/ผู้จัดการคลังตาม scope |
| `inventory.transfer.high_value.approve` | PM |
| `inventory.issue.create` | เจ้าหน้าที่คลัง |
| `delivery.job.assign` | ผู้จัดการคลัง, PM |
| `delivery.job.view_assigned` | พนักงานส่งสินค้า |
| `delivery.proof.create` | พนักงานส่งสินค้า |
| `delivery.paper_return.receive` | เจ้าหน้าที่คลัง, ผู้จัดการคลัง |
| `audit.read` | ผู้ดูแลระบบ, ผู้ตรวจสอบ |

### 8.2 Token design

- Access token: JWT อายุสั้น เช่น 15 นาที, เก็บใน memory ของ Angular
- Refresh token: random opaque token, เก็บแบบ hash ใน `refresh_sessions`, หมุนทุก refresh และ revoke ได้; ส่งเป็น `HttpOnly`, `Secure`, `SameSite` cookie
- Login/refresh/logout ต้องบันทึก audit และ rate-limit ต่อ IP/username
- Backend ตรวจ token audience, issuer, expiry และ signing key ผ่าน secret manager/environment variable
- ห้ามส่ง password, refresh token, access token หรือข้อมูลส่วนบุคคลลง log

---

## 9. RESTful API Design

### 9.1 มาตรฐานร่วม

- Base URL: `/api/v1`
- JSON UTF-8; วันที่ ISO 8601 UTC
- ใช้ cursor/page pagination, filter และ sort ตาม resource
- Mutation ทุกตัวรองรับ `Idempotency-Key` โดยเฉพาะ receive, issue, transfer, delivery proof และ import
- Error format มาตรฐาน:

```json
{
  "code": "SERIAL_ALREADY_EXISTS",
  "message": "Serial number already exists.",
  "requestId": "01J...",
  "details": [{"field": "serialNumber", "reason": "duplicate"}]
}
```

### 9.2 Resource groups

| กลุ่ม | Endpoint ตัวอย่าง |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| IAM | `GET/POST /users`, `GET/POST /roles`, `PUT /users/:id/roles` |
| Master | `GET/POST /items`, `GET/POST /items/:id/images`, `PATCH /items/:id/images/:imageId`, `DELETE /items/:id/images/:imageId`, `/warehouses`, `/locations`, `/suppliers`, `/vehicles` |
| Projects | `GET/POST /projects`, `POST /projects/:id/boq-revisions`, `GET /projects/:id/material-readiness` |
| Procurement | `GET/POST /purchase-requests`, `GET/POST /purchase-orders`, `POST /purchase-orders/:id/submit`, `POST /po-lines/:id/supplier-held` |
| Receiving | `POST /goods-receipts`, `POST /goods-receipts/:id/serials`, `POST /goods-receipts/:id/put-away` |
| Opening Stock | `POST /opening-stock-batches`, `POST /opening-stock-batches/:id/import`, `POST /opening-stock-batches/:id/count-lines`, `POST /opening-stock-batches/:id/submit-review`, `POST /opening-stock-batches/:id/approve`, `POST /opening-stock-batches/:id/post` |
| Special Stock | `POST /demo-custodies`, `POST /demo-custodies/:id/loans`, `POST /demo-loans/:id/return`, `POST /rma-cases`, `POST /rma-cases/:id/dispatch`, `POST /rma-cases/:id/events`, `POST /condition-inspections`, `POST /condition-inspections/:id/decision` |
| Inventory | `GET /stock-balances`, `GET /items/:id/locations`, `GET /locations/:id/stock`, `GET /stock-ledger`, `POST /put-aways`, `POST /reservations`, `POST /transfers`, `POST /stock-counts`, `POST /adjustments` |
| Fulfillment | `POST /pick-lists`, `POST /pick-lists/:id/confirm`, `POST /issue-notes`, `POST /issue-notes/:id/field-receipt` |
| Delivery | `POST /delivery-jobs`, `POST /delivery-jobs/:id/assign`, `POST /delivery-jobs/:id/load`, `POST /delivery-jobs/:id/dispatch`, `POST /delivery-jobs/:id/proof`, `POST /delivery-jobs/:id/paper-return` |
| Files | `POST /attachments/upload-url`, `POST /attachments/complete`, `GET /attachments/:id/download-url`; upload รูปสินค้าระบุ `purpose=ITEM_IMAGE` |
| Reports | `GET /reports/project-capital-control`, `GET /reports/boq-readiness`, `GET /reports/inventory-valuation`, `POST /reports/exports` |

### 9.3 ตัวอย่าง Delivery Proof

`POST /api/v1/delivery-jobs/{deliveryJobId}/proof`

```json
{
  "deliveredAt": "2026-09-26T02:15:00Z",
  "recipientName": "หัวหน้าทีมติดตั้ง",
  "recipientPhone": "optional",
  "result": "DELIVERED",
  "signedDeliveryNoteAttachmentId": "uuid",
  "lineResults": [
    {"deliveryJobLineId": "uuid", "deliveredQty": 12, "exceptionReason": null}
  ],
  "note": null
}
```

Backend ต้องตรวจว่า driver เป็นผู้ได้รับมอบหมาย, รายการไม่เกินจำนวน loaded, file เป็นของ delivery job เดียวกัน และเปลี่ยนสถานะ stock/serial ใน transaction เดียวกัน

---

## 10. Transaction Design และความถูกต้องของสต็อก

### 10.0 Opening Stock และ Cutover

1. ผู้ดูแลระบบสร้าง batch แยกตามคลังและกำหนด cutover date; ระบบป้องกันการเปิด batch ซ้ำของคลัง/วันเดียวกัน
2. เจ้าหน้าที่คลังนำเข้ารายการหรือสแกนสินค้า/Serial โดยมี manual entry fallback; บันทึก `counted_qty`, `condition`, `location_id`, `opening_unit_cost`, `cost_source` และหลักฐานเมื่อจำเป็น
3. Backend ตรวจ master item, unit of measure, location, duplicate serial, serial policy และสิทธิ์คลังทุกครั้ง
4. รายการที่ไม่มี SKU หรือสภาพไม่พร้อมใช้ต้องถูกจัดเป็น Quarantine และแยกจากยอดพร้อมใช้
5. ผู้จัดการคลังตรวจ variance, ลงนามอนุมัติ และเรียก Post ได้หนึ่งครั้งเท่านั้น
6. Post ทำใน database transaction: สร้าง serial asset, stock ledger `OPENING_BALANCE`, inventory cost layer, stock balance `AVAILABLE`/`QUARANTINE`, audit log และ outbox event; หากรายการใดผิดพลาดต้อง rollback ทั้ง batch
7. Opening balance เป็น Shared Stock (`project_id = null`) และไม่มีความสัมพันธ์กับ GRN, PO หรือ cash outflow ใหม่

**สูตรเสนอจัดซื้อหลัง Go-live:**

`purchase_gap = max(0, boq_required - available_unreserved_shared_and_project_stock - confirmed_inbound_not_double_counted)`

`confirmed_inbound_not_double_counted` ต้องนับ PO open และ Supplier-held แบบไม่ซ้ำกัน โดย Supplier-held เป็นสถานะย่อยของ PO line ไม่ใช่ปริมาณเพิ่มอีกชุดหนึ่ง

`available_unreserved_shared_and_project_stock` ต้องรวมเฉพาะ ownership `COMPANY` และ stock status `AVAILABLE` เท่านั้น จึงตัด DEMO, RMA_CLAIM, NON_SELLABLE, HOLD, QUARANTINE, RESERVED และ PICKED ออกจากยอดเสนอจัดซื้อโดยอัตโนมัติ

### 10.1 รับสินค้า (Goods Receipt)

1. Lock PO line ที่เกี่ยวข้อง
2. ตรวจว่า quantity รวมที่รับไม่เกิน quantity ที่อนุมัติ ยกเว้น permission รับเกิน
3. ตรวจ Serial/MAC ซ้ำและ policy บังคับ Serial
4. สร้าง GRN, serial assets, stock ledger `RECEIVE`, inventory cost layer จาก `actual_unit_price` ของ PO/ใบรับเข้า และ stock balance ใน database transaction เดียว
5. Publish outbox event `goods-receipt.completed` หลัง commit

**Put-away:** หลังรับเข้า เจ้าหน้าที่เลือกหรือสแกน Bin ปลายทาง; Backend ตรวจว่าเป็น active bin ของคลังที่รับเข้า, อยู่ในประเภทพื้นที่ที่อนุญาต และบันทึก `to_location_id` ใน ledger/serial movement ก่อนเพิ่ม balance ของ Bin นั้น

### 10.2 จอง/จัด/จ่าย/ส่ง

1. Reservation เปลี่ยนยอด `available` เป็น `reserved` แบบ atomically
2. ระบบสร้าง Pick List เรียงตาม `path_code` ของ Bin เพื่อลดการเดินในคลัง; ผู้จัดของสแกน Bin ต้นทางก่อนสแกนสินค้า/Serial
3. Pick confirm เลือก cost layer ที่ `remaining_qty > 0` ตาม `received_at ASC, id ASC` และสร้าง `cost_layer_consumptions` ใน transaction เดียวกันกับการย้ายสถานะเป็น `PICKED`; Serial ต้องตัด layer ที่ผูกกับ Serial นั้นโดยตรง
4. Load delivery ย้ายเป็น `IN_TRANSIT`; ทำได้เฉพาะ driver ที่ถูกมอบหมาย/คลังที่เกี่ยวข้อง
5. Delivery proof เปลี่ยนเป็น `AT_SITE` หรือคืนเข้าคลังตาม line result
6. Paper return บันทึกหมายเลขเอกสาร ผู้รับคืน เวลา และ attachment ของเอกสารถ้ามี

**Move between locations:** ทุก transfer/return/adjustment ที่ทำให้ตำแหน่งเปลี่ยนต้องส่ง `fromLocationId` และ `toLocationId` (ยกเว้นสถานะนอกคลัง เช่น AT_SITE); Backend lock balance ต้นทางและปลายทาง, ตรวจจำนวน/Serial และ post ledger เดียวที่มีทั้งสองตำแหน่ง

### 10.3 การโอนข้ามโครงการ

- ตรวจ item classification ก่อนสร้าง transfer
- อุปกรณ์ที่เสียบไฟฟ้า/High-value สร้าง approval request ให้ PM ก่อน post ledger
- Accessories ที่กำหนดสามารถ post ได้โดยเจ้าหน้าที่คลังตาม permission และต้องมีเหตุผล

### 10.4 ธุรกรรมสต็อกพิเศษ

- **Demo / Third-party custody:** สร้าง custody record และ stock presence เฉพาะตำแหน่ง `DEMO`; ไม่สร้าง inventory cost layer, Available balance, reservation หรือ purchase suggestion ของบริษัท การนำออกสาธิต/รับคืนใช้ demo loan transaction และต้องตรวจผู้รับผิดชอบ/กำหนดคืน
- **RMA claim:** สร้าง RMA case จาก Serial/GRN/PO เดิม, เปลี่ยนสถานะเป็น `RMA_CLAIM`, ย้ายเข้า Bin `RMA` และแนบรูป/อาการเสีย เมื่อ dispatch ไป Supplier ให้สร้าง ledger/location event เป็น `External – Supplier RMA`; cost layer ของบริษัทคงอยู่ แต่ไม่เป็น On-hand Available
- **Non-sellable / Open-box:** สร้าง condition inspection พร้อมรูป, เหตุผล และ status `NON_SELLABLE`; ผู้จัดการคลังเลือก decision `REPACK`, `INTERNAL_USE`, `PROJECT_RELEASE`, `DISCOUNT_SALE`, `RMA`, หรือ `DISPOSE` โดย `PROJECT_RELEASE` ต้องมี PM approval และ `DISPOSE` ต้องมี approval/audit ตาม policy
- ทุก transition ต้องตรวจ owner, current status, Bin เฉพาะ, attachment และ permission ก่อน post transaction

---

## 11. File, Reporting และ Integration Design

### 11.1 รูปสินค้า หลักฐานรูปและเอกสาร

- Backend ออก signed upload URL; Frontend อัปโหลดไฟล์ตรงไป Object Storage
- Backend รับ `attachmentId` หลังอัปโหลดสำเร็จและตรวจ content type, ขนาด, owner และ document reference
- แนะนำจำกัดไฟล์รูป 10 MB ต่อไฟล์, รองรับ JPEG/PNG/PDF และสแกนมัลแวร์ก่อนเปิด download ภายนอก
- Object storage lifecycle กำหนด retention ตามนโยบายบริษัท; metadata และ audit ใน PostgreSQL อยู่เสมอ
- รูปสินค้าใช้ `purpose=ITEM_IMAGE`: รับเฉพาะ JPEG/PNG/WebP ไม่เกิน 5 MB, worker สร้าง thumbnail/WebP rendition และเก็บ checksum เพื่อกันไฟล์ซ้ำ; Object Storage ต้องไม่เปิด public
- `GET /items`, Pick List, Issue Note และ Delivery Job ส่งเฉพาะข้อมูล thumbnail/primary image ที่ผู้ใช้มีสิทธิ์ดูสินค้า; URL เป็น signed URL อายุสั้นหรือผ่าน Backend media endpoint และรูปเต็มโหลดเมื่อเปิด gallery
- ผู้มี `items.manage_images` (ค่าเริ่มต้นผู้ดูแลระบบและผู้จัดการคลังที่ได้รับมอบหมาย) เท่านั้นที่เพิ่ม, เปลี่ยนรูปหลัก, จัดลำดับ หรือ archive รูปได้; ผู้มี `items.read` เห็นรูปเพื่อปฏิบัติงานได้
- เมื่อยืนยัน GRN/Pick/Issue/Delivery Backend สร้าง `document_line_image_snapshots`; การ archive รูปภายหลังไม่กระทบภาพอ้างอิงของเอกสารที่ปิดแล้ว

### 11.2 รายงานควบคุมทุนโครงการ

รายงานอ่านจาก query/read model ที่รวม BOQ, PO committed, GRN, Supplier-held, open PO, reservation และ issue/delivery ไม่คำนวณจาก Browser เพื่อลดความคลาดเคลื่อนและรองรับ export

### 11.3 รายงานมูลค่าสต็อก

`inventory_cost_layers.remaining_qty × inventory_cost_layers.unit_cost` คือแหล่งข้อมูลมูลค่าสินค้า On-hand ของบริษัท; รายงานต้องแยก Available, Reserved, Picked, Quarantine, RMA_CLAIM, NON_SELLABLE/HOLD และ Estimated Cost ตามคลัง/Zone/Rack/Shelf/Bin

- Supplier-held แสดงในรายงาน commitment/asset แยกต่างหาก และไม่รวมกับมูลค่า On-hand ในคลัง
- Transfer ระหว่าง Bin/คลังไม่สร้าง layer ใหม่หรือเปลี่ยน unit cost
- Return ที่รับกลับเข้า ให้คืนสู่ cost layer เดิมเมื่อระบุได้; หากระบุไม่ได้ สร้าง layer ใหม่พร้อมอ้างอิงต้นทุนของ Issue เดิมและ audit note

### 11.4 รายงานสต็อกพิเศษ

- Demo: จำนวน, owner/Supplier, Serial, วันครบกำหนดคืน, current location และสถานะการยืม
- RMA: RMA number, Supplier, Serial, อายุเคลม, ตำแหน่ง/ผู้ถือครอง, ผลการเคลม และมูลค่า FIFO แยกจาก Available
- Non-sellable/Hold: เหตุผล, รูป, อายุค้าง, decision ที่รออนุมัติ และมูลค่า FIFO ที่ไม่พร้อมใช้

### 11.5 Integration layer สำหรับระบบบัญชีอนาคต

- ใช้ `outbox_events` บันทึกเหตุการณ์หลัง transaction commit เช่น `po.approved`, `grn.completed`, `issue.completed`, `delivery.closed`
- สร้าง integration adapter ที่รับ/ส่ง DTO เวอร์ชันชัดเจน ไม่ให้ module บัญชีเรียกตารางภายในโดยตรง
- เริ่มจาก scheduled export หรือ REST API ที่มีเลขอ้างอิงเดียวกัน; เปลี่ยนเป็น event/webhook ได้ภายหลังโดยไม่เปลี่ยน domain transaction
- ส่ง event `opening-stock.posted` แยกจาก `goods-receipt.completed` เพื่อไม่ให้ระบบบัญชีอนาคตตีความสต็อกเดิมว่าเป็นการซื้อใหม่

---

## 12. Docker และการตั้งค่า Environment

### 12.1 Container responsibilities

| Container | Port ตัวอย่าง (dev) | Persistent volume |
|---|---:|---|
| `frontend` | 4200 หรือ 8080 | ไม่มี |
| `backend` | 3000 | ไม่มี; log ส่งออก stdout |
| `postgres` | 5432 | `postgres_data` |
| `redis` | 6379 | `redis_data` ตาม policy persistence |
| `minio` (แนะนำ dev/on-prem) | 9000/9001 | `minio_data` |

### 12.2 Environment variables ที่จำเป็น

```dotenv
APP_ENV=development
API_PORT=3000
DATABASE_URL=postgresql://warehouse_app:change-me@postgres:5432/warehouse
REDIS_URL=redis://:change-me@redis:6379/0
JWT_ISSUER=si-warehouse
JWT_AUDIENCE=si-warehouse-web
JWT_ACCESS_SECRET=managed-secret
REFRESH_TOKEN_PEPPER=managed-secret
OBJECT_STORAGE_ENDPOINT=http://minio:9000
OBJECT_STORAGE_BUCKET=warehouse-evidence
ITEM_IMAGE_MAX_FILES=5
ITEM_IMAGE_MAX_BYTES=5242880
```

**กติกา:** ไม่ commit `.env`, password, JWT secret หรือ access key เข้า repository; Production ใช้ secret manager หรือระบบจัดการ secrets ขององค์กร

### 12.3 Build และ deployment

- Angular build เป็น static artifact ใน Nginx image; ห้ามใช้ dev server ใน Production
- NestJS ใช้ multi-stage build, run ด้วย non-root user และ health check
- ก่อน deploy: run migrations แบบ one-off job โดยมี backup และตรวจ compatibility
- ใช้ image tag ที่อ้างถึง commit SHA; rollback เป็น image version เดิมได้
- Database migration ต้อง backward-compatible อย่างน้อยหนึ่ง deployment รอบ

---

## 13. Security, Audit และ Operations

### Security baseline

- HTTPS ทุกเส้นทาง รวมกล้องมือถือและ signed upload
- CORS allowlist เฉพาะ frontend origin; CSRF protection สำหรับ refresh cookie endpoint
- Helmet/security headers, validation whitelist, request payload size limit และ rate limit
- Parameterized query ผ่าน TypeORM; ไม่รับ raw filter/sort column จาก user โดยไม่ allowlist
- Password hash ด้วย Argon2id หรือ bcrypt ที่กำหนด cost มาตรฐานบริษัท
- RBAC และ data-scope guard อยู่ใน Backend ทุก endpoint

### Audit requirements

Audit log ต้องมี actor, role, request ID, IP (เมื่อมี), เวลา, action, resource, document number, before/after summary และเหตุผล โดยเน้น PO, receive, serial, transfer, issue, delivery proof, paper return, approval, adjustment, demo custody/loan, RMA, non-sellable decision และการเพิ่ม/เปลี่ยนรูปหลัก/archive รูปสินค้า

### Backup and monitoring

- PostgreSQL: full backup รายวัน + WAL/PITR ตาม RPO ที่ตกลง; ทดสอบ restore เป็นรอบ
- Object storage: versioning/replication หรือ backup ตาม retention policy
- Monitor: availability, error rate, API latency, DB connection pool, Redis queue backlog, disk, backup success และ failed jobs
- Alert: failed backup, migration failure, queue dead-letter, repeated login failures และ delivery document overdue
- Cutover dashboard: จำนวน batch ที่ยังไม่ Post, variance ที่รออนุมัติ, Serial ซ้ำ และ Quarantine ที่ยังไม่จัดการ
- Special stock alert: Demo ใกล้ครบกำหนดคืน, RMA เกิน SLA, และ Non-sellable/Hold ค้างเกินเกณฑ์ที่ตั้งค่า

---

## 14. Test Strategy และเกณฑ์คุณภาพ

| ระดับ | ตัวอย่างที่ต้องทดสอบ |
|---|---|
| Unit | readiness calculation, supplier-held rule, serial duplicate, permission evaluation |
| Integration | receive + ledger + balance ใน transaction, PO partial receive, delivery proof transition |
| Cutover | opening batch import/scan, duplicate serial, quarantine exclusion, approve/post rollback |
| Location | put-away by bin scan, move source/destination bin, pick wrong bin rejection, serial current location |
| Special stock | third-party demo exclusion, RMA dispatch/return, non-sellable decision, ownership/available/value separation |
| API E2E | login/RBAC, cross-project high-value approval, driver เห็นเฉพาะงานตัวเอง, paper-return close |
| Frontend E2E | scan/manual fallback, mobile delivery proof, role-based route guard, export initiation |
| Product image | upload/thumbnail/primary image, permission, archived image, image snapshot ของ GRN/Pick/Issue/Delivery และ placeholder เมื่อไม่มีรูป |
| Security | expired/revoked token, permission bypass, CORS/CSRF, upload ownership, IDOR/data-scope |
| Performance | ค้นหา SKU/Serial/MAC ภายในเป้าหมาย 2 วินาที และ query report ในขนาดข้อมูลที่คาดการณ์ |
| Valuation | receipt cost layer, FIFO issue, serial-specific cost, estimated opening cost และ concurrent issue lock |

**Critical acceptance scenarios:**

1. รับ Network Switch พร้อม Serial แล้ว Serial ซ้ำต้องถูกปฏิเสธโดยไม่มี ledger บางส่วนค้าง
2. สต็อก Accessory โอนข้ามโครงการได้ตาม permission แต่ Switch ต้องรอ PM approve
3. PO ที่ Supplier-held แสดงเป็น commitment/asset แต่ไม่เป็น stock พร้อมจ่าย
4. Delivery driver เข้าดูได้เฉพาะ delivery job ที่มอบหมาย และปิดงานไม่ได้หากไม่มี proof กับรับเอกสารต้นฉบับคืน
5. การ retry mobile request ไม่ทำให้ receive/issue/delivery proof ซ้ำ ด้วย idempotency key
6. Opening Stock Batch ที่ Post แล้วสร้าง Shared Stock ได้เพียงครั้งเดียว, ไม่สร้าง GRN/PO และไม่ทำให้รายการ Quarantine ใช้เป็นยอดจัดซื้อได้
7. การคำนวณ purchase gap หัก Shared Stock ที่พร้อมใช้และไม่นับ Supplier-held ซ้ำกับ PO
8. สินค้าชนิดเดียวกันเก็บหลาย Bin ได้ ยอดรวมคลังถูกต้อง; Pick จาก Bin ผิด, ย้ายโดยไม่ระบุ Bin หรือ Serial ที่ location ไม่ตรงต้องถูกปฏิเสธ
9. สินค้ารุ่นเดียวกันรับเข้า 2 Lot คนละราคา เมื่อจ่ายออก ระบบตัด Lot เก่าก่อนและรายงานมูลค่าคงเหลือจาก Lot ที่เหลือถูกต้อง
10. สินค้าตัวอย่าง Third-party ไม่ถูกจอง/จ่าย/รวมมูลค่าบริษัท; RMA และ Hold ไม่ถูกนำไปคำนวณ Available หรือ purchase suggestion จนได้รับการปลดสถานะ
11. ผู้จัดสินค้า พนักงานส่งสินค้า และช่างที่มีสิทธิ์เห็นงานเดียวกันเห็นรูปสินค้าหลักตรงกัน; ผู้ไม่มี `items.manage_images` แก้ไขรูปไม่ได้ และเมื่อเปลี่ยนหรือ archive รูป Item Master แล้ว เอกสาร GRN/Pick/Issue/Delivery ที่ยืนยันแล้วต้องยังอ้างรูปเดิมได้

---

## 15. ข้อเสนอแนะเพิ่มก่อนเริ่มพัฒนา

1. **ใช้ Object Storage ตั้งแต่ Phase 1** — รูปสินค้า, รูปใบส่งของและฉลากไม่ควรเก็บเป็น binary ใน PostgreSQL เพราะจะกระทบ backup และ performance
2. **ใช้ ledger + idempotency key เป็นข้อบังคับ** — สำคัญมากกับการสแกนหรือส่งข้อมูลจากมือถือที่สัญญาณไม่เสถียร เพื่อป้องกันสต็อกซ้ำ/ติดลบ
3. **กำหนด Item Classification ใน master data** — เช่น `ELECTRICAL_HIGH_VALUE`, `ACCESSORY`, `CONSUMABLE` เพื่อบังคับ Serial และ approval ได้อัตโนมัติ ไม่ต้องให้ผู้ใช้เลือกเองทุกครั้ง
4. **ออกแบบเลขเอกสารกลางก่อนเริ่ม** — PO, GRN, Pick List, Issue Note, Delivery Note และ Adjustment ควรมี pattern เดียวกันและ trace กันได้
5. **เริ่มด้วย Modular Monolith** — เหมาะกับทีมและธุรกรรมที่ต้อง consistency สูงกว่า microservices; แยก service ในอนาคตได้ด้วย outbox/event contracts
6. **กำหนด RPO/RTO และ retention เอกสาร** — ต้องตอบก่อน Production เพื่อออกแบบ backup, object storage และงบประมาณที่ถูกต้อง
7. **เพิ่ม PWA/offline draft ใน Phase 2** — ไม่ควรทำ offline stock posting เต็มรูปแบบใน MVP; ให้เก็บเป็น draft และ sync แบบ idempotent ก่อน
8. **ทำ Cutover rehearsal อย่างน้อยหนึ่งรอบ** — ใช้สำเนา master data และตรวจเวลาในการนับ/สแกน/แก้ Serial ก่อนวัน Go-live จริง
9. **ติด QR/Barcode ที่ Bin ก่อน Go-live** — ทำตามมาตรฐานรหัสเดียวกันทั้ง 5 คลัง เช่น `WH01-HV-R03-S02-B04` และจัดการป้ายชำรุด/สูญหายเป็นงานคลัง
10. **เก็บราคาต้นทุนตั้งต้นให้ครบก่อน Cutover** — Opening Stock ที่ไม่มีหลักฐานราคาต้องได้รับการยืนยันเป็น Estimated Cost เพื่อไม่ให้รายงานมูลค่าสต็อกดูแม่นยำเกินจริง
11. **กำหนด SLA ต่อ Supplier สำหรับ RMA และ Demo** — เพื่อให้ระบบแจ้งเตือนเมื่อการเคลมหรือการคืนตัวอย่างล่าช้าอย่างมีความหมาย

---

## 16. ประเด็นที่ยังต้องตัดสินใจก่อน Implementation Sprint

1. รูปแบบเลขเอกสารและผู้รับผิดชอบการเปิด running number
2. ระยะเวลาเก็บ Audit Log, รูปใบส่งของ และเอกสารต้นฉบับ
3. ขนาดข้อมูลเริ่มต้น: จำนวน SKU, Serial ต่อปี, โครงการพร้อมกัน และปริมาณรูปต่อวัน
4. ระบบแจ้งเตือนระยะแรกต้องการช่องทางใด: Email, LINE OA, Push notification หรือในระบบก่อน
5. ตำแหน่งติดตั้ง Production: On-premise, VM, Cloud หรือ Hybrid และนโยบาย backup ของบริษัท
6. ผู้ใช้ต้อง login ผ่านบัญชีระบบใหม่ หรือเชื่อม Active Directory/SSO ในอนาคต
7. วัน Cutover, ผู้มีอำนาจอนุมัติ Opening Stock และเวลาหยุดรับ/จ่ายสินค้าเดิมระหว่างตรวจนับ
8. มาตรฐานรหัส Zone/Rack/Shelf/Bin, วิธีติดป้าย และกรณีที่พื้นที่กองของไม่มี Shelf/Bin แบบปกติ

---

## 17. PRD v1.7 Traceability Check

ตารางนี้ใช้ยืนยันว่า SDD ฉบับนี้ออกแบบรองรับข้อกำหนดใน PRD เวอร์ชัน 1.7 แล้ว โดยรายละเอียดเชิงพฤติกรรมให้ยึด PRD เป็นหลักเมื่อมีการเปลี่ยนแปลงในอนาคต

| ข้อกำหนดจาก PRD v1.7 | ส่วนออกแบบที่รองรับใน SDD |
|---|---|
| Web responsive, RBAC, Frontend/Backend แยก server และ Docker แยก container | §3–§5, §8 และ §12 |
| 5 คลัง, Location ระดับ Zone/Rack/Shelf/Bin และ QR/Barcode | §2, §6.3–§6.4, §7.2 และ §10.2 |
| โครงการ/BOQ, จัดซื้อเป็นงวด, Supplier-held และการควบคุมเงินทุน | §5, §7.1, §9, §10.1 และ §11.2 |
| Opening Stock, Cutover, Quarantine และ Shared Stock | §7.0, §9, §10.0, §13 และ §14 |
| Serial/MAC สำหรับอุปกรณ์ไฟฟ้า และอนุมัติการโยกข้ามโครงการ | §6, §7.2, §8 และ §10.3 |
| Pick/Issue/Delivery พร้อม mobile พนักงานส่งของและหลักฐานเอกสารคืน | §5.2, §7.3, §9.3, §10.2 และ §11.1 |
| มูลค่าสต็อกตามต้นทุนรับเข้าแบบ FIFO รวม Estimated Cost | §6, §10.1, §11.3 และ §14 |
| DEMO, RMA, HOLD/OPEN_BOX แยก ownership/status/location และไม่ปะปนกับ Available | §5.1, §6.3–§6.4, §7.2, §9, §10.4 และ §11.4 |
| รูปสินค้า Item Master สำหรับผู้จัดสินค้า/ส่งสินค้า/ทีมหน้างาน | §4.1–§4.3, §5, §6.3–§6.4, §9, §11.1 และ §14 |
| เตรียม Integration กับระบบบัญชีในอนาคตโดยไม่ทำ GL ใน MVP | §4.3, §11.5 และ §12 |
