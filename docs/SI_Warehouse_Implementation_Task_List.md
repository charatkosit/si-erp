# แผนดำเนินงานและ Task List — SI Warehouse Management

**เวอร์ชัน:** 1.0  
**อ้างอิง:** PRD_SI_Warehouse_Management.md v1.7 และ SDD_SI_Warehouse_Management.md v1.6  
**วันที่:** 24 กันยายน 2569  
**สถานะเริ่มต้น:** Planned

---

## 1. วัตถุประสงค์และหลักการดำเนินงาน

เอกสารนี้ใช้เป็นแผนงานกลางสำหรับผู้บริหาร, PM และทีมพัฒนา เพื่อติดตามความคืบหน้าของระบบ Warehouse Management โดยเรียงลำดับงานดังนี้

1. เตรียมสภาพแวดล้อมและมาตรฐานการพัฒนาให้พร้อม
2. แสดงภาพเมนูและ Wireframe ของทุกหน้าที่มีผลต่อการใช้งานก่อน
3. ยืนยันรายละเอียดของแต่ละเมนูและ API contract
4. พัฒนาตามลำดับความเสี่ยงของธุรกรรมสต็อก
5. ทดสอบ, Cutover Opening Stock และเปิดใช้งานจริง

**หลักการสำคัญ:** ห้ามเริ่มพัฒนาฟังก์ชันธุรกิจของเมนูใดจนกว่าจะผ่าน Gate ของ Wireframe และรายละเอียดเมนูนั้น ยกเว้นงานโครงสร้างพื้นฐานใน Phase 0

### สถานะงานและการรายงานผู้บริหาร

| สถานะ | ความหมาย |
|---|---|
| `NOT_STARTED` | ยังไม่เริ่ม |
| `IN_PROGRESS` | กำลังทำ มีผู้รับผิดชอบและหลักฐานความคืบหน้า |
| `BLOCKED` | ทำต่อไม่ได้ ต้องระบุสาเหตุ ผู้ตัดสินใจ และวันที่ต้องการคำตอบ |
| `IN_REVIEW` | รอผู้เกี่ยวข้องตรวจ/อนุมัติ |
| `DONE` | ผ่านเกณฑ์ยอมรับและเก็บหลักฐานแล้ว |

รายงานผู้บริหารรายสัปดาห์ต้องแสดง: สถานะของแต่ละ Phase, % ความสำเร็จตามน้ำหนักงาน, Gate ที่ผ่าน/ค้าง, 3 ความเสี่ยงสูงสุด, รายการที่ต้องการการตัดสินใจ และแผนสัปดาห์ถัดไป

`Phase progress = ผลรวมน้ำหนักของงาน DONE ÷ ผลรวมน้ำหนักของงานทั้งหมดใน Phase × 100`

---

## 2. Roadmap ระดับผู้บริหาร

| Phase | เป้าหมาย | Gate สำหรับผู้บริหาร | น้ำหนักแนะนำ |
|---|---|---|---:|
| 0 | Environment, มาตรฐานทีม และ dependency พร้อม | รันระบบเปล่าบน Docker ได้, CI ผ่าน | 10% |
| 1 | เห็นภาพเมนู/หน้าจอทั้งหมดก่อน | อนุมัติ Sitemap และ Clickable Wireframe | 15% |
| 2 | ยืนยันรายละเอียดแต่ละเมนูและสัญญา API | อนุมัติ Screen Spec และ MVP Backlog | 10% |
| 3 | Platform, Login/RBAC และ Master Data | ผู้ใช้เข้าใช้ตามสิทธิ์และจัดการ Item/Location ได้ | 15% |
| 4 | โครงการ, BOQ และจัดซื้อ | เห็น Material Readiness และ Supplier-held ได้ | 15% |
| 5 | คลัง, Serial, Opening Stock และสต็อกพิเศษ | ธุรกรรมรับ/ย้าย/นับถูกต้องและตรวจสอบย้อนกลับได้ | 15% |
| 6 | Pick, Issue, Delivery และ Mobile หน้างาน | ส่งสินค้าและคืนเอกสารได้ครบวงจร | 10% |
| 7 | รายงาน, มูลค่า FIFO, QA, Cutover และ Go-live | UAT ผ่าน, Opening Stock Post, เปิดใช้จริง | 10% |

> น้ำหนักเป็นฐานตั้งต้นสำหรับรายงานความคืบหน้า ไม่ใช่ระยะเวลาหรือจำนวนคนโดยตรง

---

## 3. Phase 0 — เตรียม Environment, Libraries และมาตรฐานทีม

**เป้าหมาย:** ทุกคนเริ่มพัฒนาได้บนมาตรฐานเดียวกัน และสามารถทดสอบ Frontend, Backend, PostgreSQL, Redis และ Object Storage ได้ในเครื่องเดียว

### 3.1 ทะเบียน Libraries และ Packages ที่ต้องอนุมัติก่อนเริ่ม

| กลุ่ม | Packages/เครื่องมือหลัก | วัตถุประสงค์ | สถานะการตัดสินใจ |
|---|---|---|---|
| Frontend core | Angular, TypeScript, RxJS, Angular CDK | SPA, responsive UI, accessibility | ต้อง lock เวอร์ชันใน `package-lock` |
| Frontend UI | Tailwind CSS **หรือ** Angular Material/CDK ตาม design system ที่เลือก, icon library เดียว | ให้ Wireframe/หน้าจอใช้ component มาตรฐานเดียวกัน | ต้องเลือกเพียงแนวทางเดียวก่อน P1.3 |
| Frontend utility | Angular Router, Reactive Forms, HttpClient, IndexedDB wrapper (Phase 6+) | route, form, API, offline draft | ใช้ตาม Phase |
| Backend core | NestJS, TypeScript, TypeORM, `pg` | REST API และ PostgreSQL migration | บังคับใช้ |
| Auth/security | Passport JWT, refresh-session store, Argon2id, validation library, Helmet, rate limit | JWT/RBAC, password, API hardening | บังคับใช้ |
| Queue/cache | Redis client, BullMQ | queue, notification, export, image thumbnail | บังคับใช้ |
| File/image | S3 SDK/MinIO client, `sharp`, file-type validation, malware scan adapter | signed upload, product image, delivery evidence | บังคับใช้ก่อนอัปโหลดไฟล์ |
| API contract | OpenAPI/Swagger, generated TypeScript types (ถ้าเลือก) | ลดความคลาดเคลื่อน FE/BE | บังคับใช้กับ API ใหม่ |
| Quality/test | ESLint, Prettier, Jest, Supertest, Playwright | lint, unit/integration/E2E | บังคับใช้ |
| Dev workflow | Docker Compose, Git, commit hook, CI pipeline | ทำงานซ้ำได้และตรวจคุณภาพก่อน merge | บังคับใช้ |
| Operations | Structured logger, health check, migration runner, backup/restore script | ตรวจสอบและดูแลระบบ | บังคับใช้ก่อน UAT |

### 3.2 Task List

| ID | งาน | ผู้รับผิดชอบหลัก | ผลส่งมอบ/เกณฑ์ยอมรับ | น้ำหนัก |
|---|---|---|---|---:|
| P0-01 | แต่งตั้ง Product Owner, PM, UX, Frontend, Backend, QA และผู้แทนคลัง/จัดซื้อ | ผู้บริหาร/PM | RACI และช่องทางตัดสินใจได้รับการยืนยัน | 1 |
| P0-02 | สร้าง repository และโครงสร้าง `apps/frontend`, `apps/backend`, `packages`, `infra`, `docs` | Tech Lead | clone แล้วติดตั้งและรันตาม README ได้ | 1 |
| P0-03 | กำหนด Git workflow, branch protection, PR template และ Definition of Done | Tech Lead/PM | มี policy merge, reviewer และการจัดการ `BLOCKED` | 1 |
| P0-04 | กำหนดเวอร์ชัน Node.js, Angular, NestJS, PostgreSQL, Redis และ Docker image ที่รองรับ | Tech Lead | มี compatibility matrix และ lock file | 1 |
| P0-05 | สร้าง Docker Compose สำหรับ `frontend`, `backend`, `postgres`, `redis`, `minio` และ reverse proxy `/api` | DevOps | `docker compose up` แล้ว health check ทุก service ผ่าน | 2 |
| P0-06 | สร้าง `.env.example`, secret policy และ environment แยก dev/test/staging | DevOps/Security | ไม่มี secret ใน repository; developer เริ่มระบบได้จากตัวอย่าง | 1 |
| P0-07 | ติดตั้ง/ตั้งค่า libraries ตามทะเบียนข้อ 3.1 และสร้าง dependency register | FE/BE | package lock, license check และรายการเหตุผลการใช้ครบ | 1 |
| P0-08 | สร้าง NestJS modules เปล่า, Angular feature routes เปล่า และ shared API contract | FE/BE | เรียก `/health/live`, `/health/ready`, Swagger และหน้า shell ได้ | 1 |
| P0-09 | ตั้งค่า TypeORM migration, database seed และ test database | Backend | migration up/down และ seed ทำซ้ำได้ | 1 |
| P0-10 | ตั้ง Object Storage bucket/prefix, signed-upload policy และ file quarantine hook | Backend/DevOps | upload test file ผ่าน signed URL; bucket ไม่ public | 1 |
| P0-11 | ตั้ง lint, format, unit test, Playwright, commit hook และ CI pipeline | FE/BE/QA | PR ตัวอย่างผ่าน build/lint/test และ artifact report | 1 |
| P0-12 | ตั้ง structured log, correlation ID, error format และ monitoring baseline | Backend/DevOps | API error มี request ID; dashboard เห็น service health | 1 |
| P0-13 | สร้าง fixture/demo data: 5 คลัง, Bin, SKU, รูปสินค้า, โครงการ, BOQ และ Delivery Job | BA/QA/คลัง | ใช้แสดง Wireframe และ E2E demo ได้ | 1 |
| P0-14 | ทำ environment smoke test และคู่มือเริ่มงาน | QA/DevOps | สมาชิกใหม่ทำตามคู่มือแล้วรันระบบได้โดยไม่ต้องแก้โค้ด | 1 |

**Gate P0:** ระบบเปล่ารันผ่าน Docker ได้, CI ผ่าน, database/object storage พร้อม และมี fixture สำหรับสร้างภาพหน้าจอ

---

## 4. Phase 1 — Visual First: Sitemap, Menu และ Wireframe ทุกหน้า

**เป้าหมาย:** ผู้บริหารและผู้ใช้งานเห็นภาพการใช้งานและเมนูทั้งหมดก่อนเริ่มพัฒนาธุรกรรมจริง

### 4.1 ทะเบียนเมนูและภาพหน้าจอที่ต้องส่งมอบก่อน

| กลุ่มเมนู | หน้าจอที่ต้องมี Wireframe | รูปแบบที่ต้องแสดง |
|---|---|---|
| เข้าใช้ระบบ | Login, reset password, session expired/forbidden | Desktop และ Mobile |
| Dashboard | Executive, PM, Warehouse, Purchasing/Delivery work queue | Desktop; Mobile card ที่จำเป็น |
| สินค้าและ Serial | Item list/detail, product image gallery, Serial detail/history | Desktop และ Mobile lookup |
| คลังและแผนที่ | Warehouse map, Zone/Rack/Shelf/Bin, location search, move/put-away | Desktop map และ Mobile scan flow |
| โครงการ/BOQ | Project list/detail, BOQ revision, material readiness, phase plan | Desktop |
| จัดซื้อ | PR, PO, PO line allocation, Supplier-held, ETA/follow-up | Desktop |
| รับเข้า/Opening Stock | GRN, serial scan, inspection, put-away, opening batch/count/variance | Desktop และ Mobile scan flow |
| สต็อกและสต็อกพิเศษ | stock search, reservation, transfer, cycle count, DEMO/RMA/HOLD/OPEN_BOX | Desktop และ Mobile operation |
| จัดของ/จ่ายสินค้า | Pick List, route by Bin, scan confirm, Issue Note, field return | Desktop และ Mobile scan flow |
| จัดส่ง/หน้างาน | delivery board, assign driver/vehicle, driver mobile job, proof, paper return, field receipt/install | Desktop และ Mobile driver/field flow |
| รายงาน | capital control, BOQ readiness, stock valuation FIFO, stock by location, special stock, export | Desktop |
| ตั้งค่า/ควบคุม | users/roles, approval policy, master data, audit log, notification settings | Desktop |

### 4.2 Task List

| ID | งาน | ผู้รับผิดชอบหลัก | ผลส่งมอบ/เกณฑ์ยอมรับ | น้ำหนัก |
|---|---|---|---|---:|
| P1-01 | สร้าง Information Architecture และ Sitemap ตาม role | UX/BA/PM | ผู้ใช้แต่ละบทบาทเห็นเฉพาะเมนูที่เกี่ยวข้อง | 1 |
| P1-02 | สร้าง Navigation model: desktop sidebar/top bar และ mobile bottom navigation | UX/FE | สอดคล้อง RBAC และมีทางกลับ/ค้นหาชัดเจน | 1 |
| P1-03 | สร้าง Design tokens, component inventory และตัวอย่างข้อมูลมาตรฐาน | UX/FE | สีสถานะ, ตาราง, card, scan action, dialog และ empty state ครบ | 1 |
| P1-04 | ทำ Wireframe กลุ่ม Dashboard และการเข้าใช้ระบบ | UX/BA | แสดงข้อมูลแยก Executive/PM/คลังอย่างชัดเจน | 1 |
| P1-05 | ทำ Wireframe กลุ่ม Item/Serial/Product Image และ Warehouse Map | UX/คลัง | ค้นหาสินค้าและเห็นตำแหน่ง Bin/รูปสินค้าได้ | 1 |
| P1-06 | ทำ Wireframe กลุ่ม Project/BOQ/Procurement/Supplier-held | UX/PM/จัดซื้อ | เห็นยอด BOQ, ยอดขาด, PO และ Supplier-held | 1 |
| P1-07 | ทำ Wireframe กลุ่ม Receiving, Opening Stock, Inventory, Special Stock | UX/คลัง | มี scan/manual fallback และสถานะ Quarantine/RMA/HOLD | 2 |
| P1-08 | ทำ Wireframe กลุ่ม Pick/Issue/Delivery/Field work โดยเน้น Mobile | UX/คลัง/พนักงานส่ง/ช่าง | ผู้ขับเห็นเฉพาะงานตนเอง; มี proof และ paper return | 2 |
| P1-09 | ทำ Wireframe กลุ่ม Reports, Approval, Administration และ Audit | UX/PM/การเงิน/ผู้ตรวจสอบ | เห็น filter, export, approval timeline และ audit detail | 1 |
| P1-10 | รวมเป็น clickable prototype พร้อม demo data และ user journey สำคัญ | UX/FE | เดิน flow `BOQ → PO → GRN → Pick → Delivery` และ `Opening Stock` ได้ | 2 |
| P1-11 | Workshop review กับผู้บริหาร, PM, จัดซื้อ, คลัง, คนส่งของและช่าง | PM/UX | มีรายการ feedback, decision log และผู้อนุมัติ | 1 |
| P1-12 | ปรับ prototype และขออนุมัติ UX baseline | UX/PM | ทุกหน้าตามทะเบียน 4.1 มีสถานะ approved หรือระบุ deferred | 1 |

**Gate P1:** ผู้บริหารอนุมัติ Sitemap และ clickable prototype; ทุกเมนู MVP มีภาพหน้าจอ Desktop/Mobile ตามประเภทงานก่อนเริ่มลงรายละเอียด

---

## 5. Phase 2 — รายละเอียดแต่ละเมนูและแผนพัฒนา MVP

**เป้าหมาย:** เปลี่ยน Wireframe ที่อนุมัติแล้วเป็น Screen Specification และ Backlog ที่พัฒนา/ทดสอบได้

### Template รายละเอียดบังคับต่อหนึ่งเมนู

1. วัตถุประสงค์และบทบาทผู้ใช้
2. เมนูย่อย, route และการเข้าถึงตาม RBAC/data scope
3. ตาราง/การ์ด/ฟิลด์/ปุ่ม/สถานะ/ข้อความ error
4. กฎธุรกิจ, approval และผลกระทบต่อ ledger/serial/cost
5. API request/response, filter, pagination และ idempotency
6. Mobile/scan/offline-draft behavior (เมื่ออยู่ในขอบเขต)
7. ข้อมูลตัวอย่าง, loading/empty/error state และ accessibility
8. Acceptance criteria, test case และ audit event ที่ต้องเกิด

| ID | งาน | ผู้รับผิดชอบหลัก | ผลส่งมอบ/เกณฑ์ยอมรับ | น้ำหนัก |
|---|---|---|---|---:|
| P2-01 | ทำ Screen Spec สำหรับ Dashboard, Item/Serial, Warehouse Map และ Master Data | BA/UX/คลัง | ครบตาม template และผูกกับ Wireframe ID | 1 |
| P2-02 | ทำ Screen Spec สำหรับ Project/BOQ/Procurement/Approval | BA/PM/จัดซื้อ | ระบุ calculation, Supplier-held และ approval flow ชัดเจน | 1 |
| P2-03 | ทำ Screen Spec สำหรับ GRN, Opening Stock, Inventory, Special Stock | BA/คลัง/QA | ระบุ state, Bin, Serial, FIFO และ maker-checker | 2 |
| P2-04 | ทำ Screen Spec สำหรับ Pick/Issue/Delivery/Field mobile | BA/คลัง/คนส่ง/ช่าง | ระบุ scan, exception, photo proof และ paper return | 2 |
| P2-05 | ทำ Screen Spec สำหรับ Reports, Export, Administration และ Audit | BA/การเงิน/ผู้ตรวจสอบ | ระบุ filter, data scope และ export authorization | 1 |
| P2-06 | สร้าง OpenAPI contract และ domain event list ตามเมนูที่อนุมัติ | FE/BE | Contract review ผ่าน; ไม่มี endpoint สำคัญที่ไม่ระบุ error/idempotency | 1 |
| P2-07 | จัดลำดับ MVP backlog, dependency, test data และประมาณการงาน | PM/Tech Lead/QA | ทุก story มี owner, weight, acceptance criteria และ dependency | 1 |
| P2-08 | Review ความพร้อมก่อนพัฒนา (architecture, security, testability) | Tech Lead/Security/QA | ความเสี่ยงสูงมี mitigation/decision owner | 1 |

**Gate P2:** Menu Spec, API contract และ backlog ของ MVP ได้รับอนุมัติ; งานที่ยังไม่มีเกณฑ์ยอมรับห้ามเข้าพัฒนา

---

## 6. Phase 3 — Platform, Login/RBAC และ Master Data

| ID | งาน | ผู้รับผิดชอบหลัก | ผลส่งมอบ/เกณฑ์ยอมรับ | น้ำหนัก |
|---|---|---|---|---:|
| P3-01 | สร้าง User, Role, Permission, Data Scope และ refresh session | Backend | RBAC/data scope ถูกบังคับโดย Backend ทุก endpoint | 2 |
| P3-02 | พัฒนา Login, logout, refresh, route guard และ error screen | FE/BE | token flow และ expiry/revoke E2E ผ่าน | 1 |
| P3-03 | พัฒนา Item/Category/Brand/UOM/Supplier Master | FE/BE | CRUD, validation, search และ audit ผ่าน | 1 |
| P3-04 | พัฒนา Product Image gallery, thumbnail, permission และ image snapshot | FE/BE | primary image/archiving/audit และ access control ผ่าน | 1 |
| P3-05 | พัฒนา Warehouse/Zone/Rack/Shelf/Bin, QR label และ Warehouse Map | FE/BE/คลัง | ค้นหา/ดูตำแหน่งระดับ Bin และพิมพ์ป้ายได้ | 2 |
| P3-06 | พัฒนา Vehicle, approval policy baseline, document number service และ audit log viewer | FE/BE | เอกสารมีเลขอ้างอิง; PM ตั้ง policy ตามสิทธิ์ได้ | 1 |
| P3-07 | ทดสอบ role matrix, location/image security และ master-data UAT | QA/คลัง | UAT ผ่านตาม P2 spec | 1 |

**Gate P3:** ผู้ใช้เข้าใช้ตามบทบาท, สร้าง Item พร้อมรูป และสร้าง/ค้นหา Bin ได้จริงใน staging

---

## 7. Phase 4 — โครงการ, BOQ และจัดซื้อเป็นงวด

| ID | งาน | ผู้รับผิดชอบหลัก | ผลส่งมอบ/เกณฑ์ยอมรับ | น้ำหนัก |
|---|---|---|---|---:|
| P4-01 | พัฒนา Project, project phase, BOQ revision และ import | FE/BE | Revision ไม่ทับประวัติ และตรวจรายการได้ | 2 |
| P4-02 | พัฒนา material requirement/readiness และ purchase gap | BE/FE | หักเฉพาะ Company + Available stock; ไม่ double count Supplier-held | 2 |
| P4-03 | พัฒนา PR, PO, allocation, partial receive และ Supplier-held | FE/BE/จัดซื้อ | PO หลายงวด, ETA และ Supplier-held trace ได้ | 2 |
| P4-04 | พัฒนา approval flow ของ PR/PO ตาม policy โครงการ | FE/BE/PM | ผู้อนุมัติ/ลำดับเปลี่ยนตามโครงการและมี audit | 1 |
| P4-05 | แสดง PM dashboard: readiness, risk, PO committed, open PO | FE/BE | ตัวเลขมาจาก backend read model และเจาะรายละเอียดได้ | 1 |
| P4-06 | Integration/E2E test: BOQ → PR/PO → Supplier-held → GRN partial | QA/PM/จัดซื้อ | ผ่าน critical scenario และ rollback/error case | 2 |

**Gate P4:** PM และจัดซื้อเห็นว่า “ต้องใช้อะไร, สั่งแล้วหรือยัง, ขาดเท่าไร” ต่อ BOQ line ได้จริง

---

## 8. Phase 5 — คลัง, Serial, Opening Stock และสต็อกพิเศษ

| ID | งาน | ผู้รับผิดชอบหลัก | ผลส่งมอบ/เกณฑ์ยอมรับ | น้ำหนัก |
|---|---|---|---|---:|
| P5-01 | สร้าง immutable stock ledger, stock balance, cost layer และ transaction lock | Backend | ledger/balance/FIFO ไม่ติดลบและ retry ไม่ซ้ำ | 2 |
| P5-02 | พัฒนา GRN, inspection, Serial/MAC scan และ put-away ระดับ Bin | FE/BE/คลัง | ป้องกัน Serial ซ้ำและตรวจ Bin/สถานะปลายทาง | 2 |
| P5-03 | พัฒนา stock search, multi-Bin view, transfer และ reservation | FE/BE | แสดงตำแหน่งและยอดรวมถูกต้อง; cross-project rule ผ่าน | 1 |
| P5-04 | พัฒนา cycle count, adjustment และ maker-checker approval | FE/BE/คลัง | ผลต่างต้องมีเหตุผล/หลักฐาน/ผู้อนุมัติ | 1 |
| P5-05 | พัฒนา Opening Stock batch, import/count/variance/quarantine/post | FE/BE/คลัง/QA | Post ได้ครั้งเดียวเป็น Shared Stock และมี Estimated Cost | 2 |
| P5-06 | พัฒนา DEMO, RMA, HOLD/OPEN_BOX และ SLA reminder baseline | FE/BE/คลัง | ownership/status/location แยก; ไม่ปน Available/purchase gap | 1 |
| P5-07 | Integration/Performance test ธุรกรรมสต็อกและ Serial | QA/BE | transaction atomic, index/search ตามเป้าหมาย SDD | 1 |

**Gate P5:** รับสินค้า, ย้าย, จอง, นับ, Opening Stock และสต็อกพิเศษทำได้พร้อม Stock Card/Serial history ที่ตรวจสอบได้

---

## 9. Phase 6 — จัดของ, จ่าย, ส่งสินค้า และ Mobile หน้างาน

| ID | งาน | ผู้รับผิดชอบหลัก | ผลส่งมอบ/เกณฑ์ยอมรับ | น้ำหนัก |
|---|---|---|---|---:|
| P6-01 | พัฒนา Pick List และ route ตาม Warehouse/Zone/Rack/Shelf/Bin | FE/BE/คลัง | Pick จาก Bin/Serial ผิดถูกปฏิเสธ; เห็นรูปสินค้า | 2 |
| P6-02 | พัฒนา Issue Note, partial issue, field receipt, return และ approval exception | FE/BE/PM | ปิด issue ครบไม่ได้หากยังขาด ยกเว้นอนุมัติพร้อมเหตุผล | 2 |
| P6-03 | พัฒนา delivery board, assign driver/vehicle และ load/dispatch | FE/BE/คลัง | Driver เห็นเฉพาะ job ที่มอบหมาย | 1 |
| P6-04 | พัฒนา delivery-driver mobile: scan, status, product image, proof และ exception | FE/BE/คนส่ง | ส่งมอบพร้อมชื่อผู้รับ/รูปใบส่งของและ retry ปลอดภัย | 2 |
| P6-05 | พัฒนา paper-document return และ close delivery | FE/BE/คลัง | ปิดงานได้เมื่อรับเอกสารต้นฉบับคืน/มีข้อยกเว้นอนุมัติ | 1 |
| P6-06 | พัฒนา mobile field receipt/install/return สำหรับช่าง | FE/BE/ช่าง | รับหน้างาน/ติดตั้ง/คืนคลัง มี Serial trace | 1 |
| P6-07 | Delivery/mobile E2E และ usability test หน้างานจริง | QA/คลัง/คนส่ง/ช่าง | ผ่านงานทดสอบจริงและบันทึกข้อปรับปรุง | 1 |

**Gate P6:** สินค้าเดินจาก Pick List ถึงหน้างานและเอกสารกลับบริษัทได้ครบวงจรบน Desktop/Mobile

---

## 10. Phase 7 — Reports, UAT, Cutover และ Go-live

| ID | งาน | ผู้รับผิดชอบหลัก | ผลส่งมอบ/เกณฑ์ยอมรับ | น้ำหนัก |
|---|---|---|---|---:|
| P7-01 | พัฒนารายงานทุนโครงการ, BOQ readiness, PO/Supplier-held และ export | FE/BE/การเงิน | ตัวเลขตรงกับ transaction/read model และมี data scope | 1 |
| P7-02 | พัฒนารายงานมูลค่าสต็อก FIFO ตามคลัง/Bin/สถานะ และ Estimated Cost | FE/BE/การเงิน | Available/Reserved/RMA/HOLD/Supplier-held แยกรายงานถูกต้อง | 2 |
| P7-03 | พัฒนารายงานตำแหน่งสินค้า/Serial, สต็อกพิเศษ และ audit export | FE/BE/คลัง/ผู้ตรวจสอบ | ค้นหาและ export ตามสิทธิ์ได้ | 1 |
| P7-04 | ตั้ง backup/restore drill, monitoring, alert, retention และ security review | DevOps/Security | restore test, monitoring และ incident runbook ผ่าน | 1 |
| P7-05 | ทำ System Integration Test, performance test, security E2E และแก้ defect | QA/ทุกทีม | ไม่มี critical defect ค้าง; test evidence ครบ | 2 |
| P7-06 | ทำ UAT ตาม role และลงนามผลการทดสอบ | PM/ผู้แทนธุรกิจ/QA | ทุก acceptance criteria ผ่านหรือมี waiver อนุมัติ | 1 |
| P7-07 | ทำ Cutover rehearsal: master data, QR Bin, Opening Stock import/count/variance | PM/คลัง/จัดซื้อ/QA | เวลาและจำนวนคนเพียงพอ; runbook ผ่าน rehearsal | 1 |
| P7-08 | Go-live, hypercare, daily reconciliation และ post-implementation review | PM/ทุกทีม | Opening Stock Post สำเร็จ, KPI และ issue log อยู่ในเกณฑ์ | 1 |

**Gate P7:** UAT และ Cutover ผ่าน, มี backup/rollback plan, ผู้บริหารอนุมัติเปิดใช้งานจริง

---

## 11. งานหลัง Go-live / Phase 2 Enhancement

| ID | งาน | เหตุผล/เงื่อนไขเริ่ม |
|---|---|---|
| E1 | PWA Offline Draft และ sync แบบ idempotent | หลัง workflow mobile ออนไลน์เสถียรและผ่าน UAT |
| E2 | Email/LINE OA/Push notification | หลังเลือกช่องทางและนโยบายแจ้งเตือน |
| E3 | Integration ระบบบัญชี/ERP | หลังบริษัทกำหนด data contract และ owner ฝั่งบัญชี |
| E4 | SSO/MFA/Active Directory | หลัง IT ยืนยัน identity provider และ policy |
| E5 | Forecast จัดซื้อ, BI dashboard และ Supplier Portal/EDI | หลังมีข้อมูลจริงเพียงพอและ KPI ที่ตกลง |

---

## 12. รูปแบบรายงานความคืบหน้ารายสัปดาห์

```markdown
สัปดาห์: YYYY-MM-DD ถึง YYYY-MM-DD
ภาพรวม: Green / Amber / Red
Phase ปัจจุบัน: P# — xx% (Gate: ชื่อ Gate)

เสร็จในสัปดาห์นี้
- [TASK-ID] ผลส่งมอบและลิงก์หลักฐาน

แผนสัปดาห์ถัดไป
- [TASK-ID] ผลที่คาดหวัง

ความเสี่ยง/สิ่งที่ต้องตัดสินใจ
- [BLOCKED-ID] ผลกระทบ | ผู้ตัดสินใจ | ต้องการคำตอบภายใน

ตัวชี้วัด
- งาน DONE / งานทั้งหมด: x / y
- Defect Critical/High ที่ค้าง: x / y
- UAT scenario ที่ผ่าน: x / y
```

## 13. Definition of Done สำหรับทุก Task

- ผลส่งมอบตรงกับ Screen Spec/SDD และผ่าน code review
- Unit/integration/E2E test ที่เกี่ยวข้องผ่าน พร้อมหลักฐานผลรัน
- สิทธิ์ RBAC/data scope, audit log และ error handling ได้รับการตรวจ
- ไม่มี secret, ข้อมูลจริง หรือไฟล์ตัวอย่างที่ละเมิดนโยบายอยู่ใน repository
- เอกสาร API, migration, runbook หรือคู่มือผู้ใช้ที่เกี่ยวข้องได้รับการอัปเดต
- ผู้รับผิดชอบธุรกิจตรวจรับ เมื่อ Task นั้นมีผลต่อ workflow หรือรายงาน
