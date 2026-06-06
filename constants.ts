
import {
  User, UserRole, WorkOrder, WorkOrderStatus, WorkOrderType, Priority,
  Asset, InventoryItem, PurchaseRequest, PurchaseRequestStatus,
  MaintenancePlan, TaskTemplate, CatalogModel, WorkOrderOrigin,
  DailyReport, PreventiveLogEntry
} from './types';

const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// ─── USUARIOS ────────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Jefe de Planta',       role: UserRole.ADMIN,      avatar: 'https://picsum.photos/seed/u1/100/100' },
  { id: 'u2', name: 'Jefe Mantenimiento',   role: UserRole.PLANNER,    avatar: 'https://picsum.photos/seed/u2/100/100' },
  { id: 'u3', name: 'Walter',               role: UserRole.TECHNICIAN, specialty: 'Mecánica',        avatar: 'https://picsum.photos/seed/u3/100/100' },
  { id: 'u4', name: 'Daniel',               role: UserRole.TECHNICIAN, specialty: 'Eléctrico',       avatar: 'https://picsum.photos/seed/u4/100/100' },
  { id: 'u5', name: 'Bejarano',             role: UserRole.TECHNICIAN, specialty: 'Mecánica',        avatar: 'https://picsum.photos/seed/u5/100/100' },
  { id: 'u6', name: 'Tejeda',               role: UserRole.TECHNICIAN, specialty: 'Lubricación',     avatar: 'https://picsum.photos/seed/u6/100/100' },
  { id: 'u7', name: 'Ramírez',              role: UserRole.TECHNICIAN, specialty: 'Mecánica',        avatar: 'https://picsum.photos/seed/u7/100/100' },
  { id: 'u8', name: 'Marchetti',            role: UserRole.TECHNICIAN, specialty: 'Eléctrico',       avatar: 'https://picsum.photos/seed/u8/100/100' },
  { id: 'u9', name: 'González (Producción)', role: UserRole.OPERATIONS, avatar: 'https://picsum.photos/seed/u9/100/100' },
];

// ─── ACTIVOS ─────────────────────────────────────────────────────────────────
export const MOCK_ASSETS: Asset[] = [
  { id: 'a01', name: 'Banco C6',              tag: undefined,   location: 'Piso 6',              sector: 'Producción/Molienda',   category: 'Banco de Cilindros', status: 'OPERATIONAL' },
  { id: 'a02', name: 'Banco C7',              tag: undefined,   location: 'Piso 6',              sector: 'Producción/Molienda',   category: 'Banco de Cilindros', status: 'OPERATIONAL' },
  { id: 'a03', name: 'Banco C10',             tag: undefined,   location: 'Piso 6',              sector: 'Producción/Molienda',   category: 'Banco de Cilindros', status: 'OPERATIONAL' },
  { id: 'a04', name: 'Banco T1',              tag: undefined,   location: 'Piso 6',              sector: 'Producción/Molienda',   category: 'Banco de Cilindros', status: 'OPERATIONAL' },
  { id: 'a05', name: 'Esclusa 10M008',        tag: '10M008',    location: 'Piso 8 trigo',        sector: 'Neumático/Filtros',      category: 'Esclusa',            status: 'OPERATIONAL' },
  { id: 'a06', name: 'Rosca 10M010',          tag: '10M010',    location: '8° piso',             sector: 'Neumático/Filtros',      category: 'Transportador',      status: 'OPERATIONAL' },
  { id: 'a07', name: 'Reductor 52M014',       tag: '52M014',    location: 'Piso 5',              sector: 'Producción/Molienda',   category: 'Reductor',           status: 'OPERATIONAL' },
  { id: 'a08', name: 'Motor 78M001',          tag: '78M001',    location: 'Piso 7',              sector: 'Producción/Molienda',   category: 'Motor Eléctrico',    status: 'OPERATIONAL' },
  { id: 'a09', name: 'Soplante Repicky 51M001', tag: '51M001', location: 'Pellets',             sector: 'Neumático/Filtros',      category: 'Soplante',           status: 'OPERATIONAL' },
  { id: 'a10', name: 'Soplante Repicky',      tag: undefined,   location: '9° piso trigo',       sector: 'Neumático/Filtros',      category: 'Soplante',           status: 'OPERATIONAL' },
  { id: 'a11', name: 'Motor 10M015 (ex redler)', tag: '10M015', location: 'Terraza de trigo',  sector: 'Producción/Molienda',   category: 'Motor Eléctrico',    status: 'OPERATIONAL' },
  { id: 'a12', name: 'Humedecanter',          tag: undefined,   location: 'Planta baja',         sector: 'Producción/Molienda',   category: 'Acondicionador',     status: 'OPERATIONAL' },
  { id: 'a13', name: 'Sasores',               tag: undefined,   location: '3° piso',             sector: 'Limpieza de Trigo',     category: 'Separador',          status: 'OPERATIONAL' },
  { id: 'a14', name: 'Filtro de Sasores / pulmón', tag: undefined, location: '2° piso',         sector: 'Neumático/Filtros',      category: 'Filtro de Mangas',   status: 'OPERATIONAL' },
  { id: 'a15', name: 'Filtro de ensilaje/trasilaje', tag: undefined, location: '6° E',          sector: 'Neumático/Filtros',      category: 'Filtro de Mangas',   status: 'OPERATIONAL' },
  { id: 'a16', name: 'MTKB',                  tag: undefined,   location: 'Limpieza trigo',      sector: 'Limpieza de Trigo',     category: 'Máq. Combinada Limpieza', status: 'OPERATIONAL' },
  { id: 'a17', name: 'Compresor Atlas GA37',  tag: undefined,   location: 'Sala de compresores', sector: 'Aire Comprimido',       category: 'Compresor',          status: 'OPERATIONAL' },
  { id: 'a18', name: 'Compresor Atlas GA30',  tag: undefined,   location: 'Sala de compresores', sector: 'Aire Comprimido',       category: 'Compresor',          status: 'OPERATIONAL' },
  { id: 'a19', name: 'Secador de Aire Atlas', tag: undefined,   location: 'Sala de compresores', sector: 'Aire Comprimido',       category: 'Secador de Aire',    status: 'OPERATIONAL' },
  { id: 'a20', name: 'Caldera 1',             tag: undefined,   location: 'Sala de calderas',    sector: 'Caldera',               category: 'Caldera',            status: 'OPERATIONAL' },
  { id: 'a21', name: 'Caldera 2',             tag: undefined,   location: 'Sala de calderas',    sector: 'Caldera',               category: 'Caldera',            status: 'OPERATIONAL' },
  { id: 'a22', name: 'Balanza de camiones',   tag: undefined,   location: 'Planta baja',         sector: 'Calibración',           category: 'Balanza',            status: 'OPERATIONAL' },
  { id: 'a23', name: 'Autoelevador 1',        tag: undefined,   location: 'Patio',               sector: 'Vehículos',             category: 'Autoelevador',       status: 'OPERATIONAL' },
  { id: 'a24', name: 'Autoelevador 2',        tag: undefined,   location: 'Patio',               sector: 'Vehículos',             category: 'Autoelevador',       status: 'OPERATIONAL' },
  { id: 'a25', name: 'Barredora de calles',   tag: undefined,   location: 'Patio',               sector: 'Vehículos',             category: 'Vehículo',           status: 'OPERATIONAL' },
  { id: 'a26', name: 'Tableros eléctricos',   tag: undefined,   location: 'Sala eléctrica',      sector: 'Electricidad',          category: 'Tablero Eléctrico',  status: 'OPERATIONAL' },
  { id: 'a27', name: 'Transformadores MT',    tag: undefined,   location: 'Sala eléctrica',      sector: 'Electricidad',          category: 'Transformador',      status: 'OPERATIONAL' },
  { id: 'a28', name: 'Dosificador de cloro',  tag: undefined,   location: 'Tanque principal',    sector: 'General',               category: 'Dosificador',        status: 'OPERATIONAL' },
];

// ─── PLAN PREVENTIVO (PL-006) ─────────────────────────────────────────────────
export const MOCK_MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    id: 'mp-01', title: 'Control de pérdidas - Dosificador de cloro',
    assetId: 'a28', assetName: 'Dosificador de cloro',
    frequencyDays: 30, nextDueDate: addDays(5),
    estimatedHours: 0.5, specialtyRequired: 'General',
    checklistTemplate: ['Verificar conexiones', 'Revisar pérdidas visibles', 'Registrar en R-142'],
    sector: 'General', element: 'Dosificador de cloro tanque ppal',
    task: 'Control de pérdidas', registerCode: 'R-142',
    frequencyLabel: 'Mensual', scheduledMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
  },
  {
    id: 'mp-02', title: 'Limpieza de tableros eléctricos',
    assetId: 'a26', assetName: 'Tableros eléctricos',
    frequencyDays: 120, nextDueDate: addDays(20),
    estimatedHours: 2, specialtyRequired: 'Eléctrico',
    checklistTemplate: ['Cortar tensión', 'Soplado con aire seco', 'Reapriete de borneras', 'Verificar fusibles'],
    sector: 'Electricidad', element: 'Tableros eléctricos',
    task: 'Limpieza', registerCode: 'R-142',
    frequencyLabel: '3/año', scheduledMonths: [1, 5, 9],
  },
  {
    id: 'mp-03', title: 'Control trimestral luces de emergencia',
    assetId: 'a26', assetName: 'Tableros eléctricos',
    frequencyDays: 90, nextDueDate: addDays(15),
    estimatedHours: 1, specialtyRequired: 'Eléctrico',
    checklistTemplate: ['Activar modo prueba', 'Verificar autonomía mínima 1 hs', 'Registrar resultado'],
    sector: 'Electricidad', element: 'Luces de emergencia',
    task: 'Control trimestral', registerCode: 'R-153',
    frequencyLabel: 'Trimestral', scheduledMonths: [1, 4, 7, 11],
  },
  {
    id: 'mp-04', title: 'Control de aceite - Compresor Atlas GA37',
    assetId: 'a17', assetName: 'Compresor Atlas GA37',
    frequencyDays: 90, nextDueDate: addDays(10),
    estimatedHours: 1, specialtyRequired: 'Mecánica',
    checklistTemplate: ['Verificar nivel de aceite', 'Revisar filtro de aceite', 'Registrar en R-085'],
    sector: 'Aire Comprimido', element: 'Compresor Atlas GA37',
    task: 'Control de aceite', registerCode: 'R-085',
    frequencyLabel: '4/año', scheduledMonths: [1, 4, 7, 11],
  },
  {
    id: 'mp-05', title: 'Limpieza de radiador - Secador de Aire Atlas',
    assetId: 'a19', assetName: 'Secador de Aire Atlas',
    frequencyDays: 60, nextDueDate: addDays(8),
    estimatedHours: 1, specialtyRequired: 'Mecánica',
    checklistTemplate: ['Soplado de aletas del radiador', 'Verificar presión diferencial', 'Registrar'],
    sector: 'Aire Comprimido', element: 'Secador de Aire Atlas',
    task: 'Limpieza de radiador', registerCode: 'R-142',
    frequencyLabel: '6/año', scheduledMonths: [1, 3, 5, 7, 9, 11],
  },
  {
    id: 'mp-06', title: 'Control fisicoquímico agua - Caldera 1',
    assetId: 'a20', assetName: 'Caldera 1',
    frequencyDays: 30, nextDueDate: addDays(3),
    estimatedHours: 0.5, specialtyRequired: 'General',
    checklistTemplate: ['Tomar muestra de agua', 'Medir pH y dureza', 'Ajustar dosificación', 'Registrar en sistema TQ'],
    sector: 'Caldera', element: 'Caldera 1 — control de agua',
    task: 'Control fisicoquímico', registerCode: 'Sistema TQ',
    frequencyLabel: 'Mensual', scheduledMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
  },
  {
    id: 'mp-07', title: 'Calibración anual balanzas de trigo',
    assetId: 'a22', assetName: 'Balanza de camiones',
    frequencyDays: 365, nextDueDate: addDays(180),
    estimatedHours: 4, specialtyRequired: 'Instrumentación',
    checklistTemplate: ['Solicitar empresa certificadora', 'Prueba con pesos patrón', 'Emitir certificado'],
    sector: 'Calibración', element: 'Balanzas de trigo',
    task: 'Calibración anual', registerCode: 'PL-008',
    frequencyLabel: 'Anual', scheduledMonths: [1],
    requiresDowntime: true,
  },
  {
    id: 'mp-08', title: 'Check list semanal - Autoelevador 1',
    assetId: 'a23', assetName: 'Autoelevador 1',
    frequencyDays: 7, nextDueDate: addDays(2),
    estimatedHours: 0.5, specialtyRequired: 'Mecánica',
    checklistTemplate: ['Verificar nivel de combustible/batería', 'Revisar frenos', 'Verificar horquillas', 'Verificar bocina y luces', 'Registrar en R-113'],
    sector: 'Vehículos', element: 'Autoelevador 1',
    task: 'Check list semanal', registerCode: 'R-113',
    frequencyLabel: 'Semanal', scheduledMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
  },
  {
    id: 'mp-09', title: 'Check list semanal - Autoelevador 2',
    assetId: 'a24', assetName: 'Autoelevador 2',
    frequencyDays: 7, nextDueDate: addDays(3),
    estimatedHours: 0.5, specialtyRequired: 'Mecánica',
    checklistTemplate: ['Verificar nivel de combustible/batería', 'Revisar frenos', 'Verificar horquillas', 'Verificar bocina y luces', 'Registrar en R-113'],
    sector: 'Vehículos', element: 'Autoelevador 2',
    task: 'Check list semanal', registerCode: 'R-113',
    frequencyLabel: 'Semanal', scheduledMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
  },
  {
    id: 'mp-10', title: 'Control de aceite - Compresor Atlas GA30',
    assetId: 'a18', assetName: 'Compresor Atlas GA30',
    frequencyDays: 90, nextDueDate: addDays(25),
    estimatedHours: 1, specialtyRequired: 'Mecánica',
    checklistTemplate: ['Verificar nivel de aceite', 'Revisar filtro de aceite', 'Registrar en R-085'],
    sector: 'Aire Comprimido', element: 'Compresor Atlas GA30',
    task: 'Control de aceite', registerCode: 'R-085',
    frequencyLabel: '4/año', scheduledMonths: [2, 5, 8, 11],
  },
  {
    id: 'mp-11', title: 'Control fisicoquímico agua - Caldera 2',
    assetId: 'a21', assetName: 'Caldera 2',
    frequencyDays: 30, nextDueDate: addDays(6),
    estimatedHours: 0.5, specialtyRequired: 'General',
    checklistTemplate: ['Tomar muestra de agua', 'Medir pH y dureza', 'Ajustar dosificación', 'Registrar en sistema TQ'],
    sector: 'Caldera', element: 'Caldera 2 — control de agua',
    task: 'Control fisicoquímico', registerCode: 'Sistema TQ',
    frequencyLabel: 'Mensual', scheduledMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
  },
  {
    id: 'mp-12', title: 'Lubricación de reductores - Sasores',
    assetId: 'a13', assetName: 'Sasores',
    frequencyDays: 90, nextDueDate: addDays(12),
    estimatedHours: 1.5, specialtyRequired: 'Lubricación',
    checklistTemplate: ['Verificar nivel de aceite', 'Cambiar aceite si corresponde', 'Lubricar rodamientos', 'Registrar'],
    sector: 'Producción/Molienda', element: 'Sasores',
    task: 'Lubricación de reductores', registerCode: 'R-142',
    frequencyLabel: 'Trimestral', scheduledMonths: [2, 5, 8, 11],
  },
  {
    id: 'mp-13', title: 'Revisión filtros de mangas - Filtro ensilaje',
    assetId: 'a15', assetName: 'Filtro de ensilaje/trasilaje',
    frequencyDays: 180, nextDueDate: addDays(60),
    estimatedHours: 3, specialtyRequired: 'Mecánica',
    checklistTemplate: ['Inspeccionar mangas', 'Revisar golpe de martillo', 'Verificar válvulas de pulso', 'Registrar'],
    sector: 'Neumático/Filtros', element: 'Filtro de ensilaje/trasilaje 6° E',
    task: 'Revisión filtros de mangas', registerCode: 'R-142',
    frequencyLabel: '2 veces por año', scheduledMonths: [3, 9],
    requiresDowntime: true,
  },
  {
    id: 'mp-14', title: 'Inspección anual transformadores MT',
    assetId: 'a27', assetName: 'Transformadores MT',
    frequencyDays: 365, nextDueDate: addDays(200),
    estimatedHours: 4, specialtyRequired: 'Eléctrico',
    checklistTemplate: ['Medir temperatura de bornes', 'Verificar aislación', 'Revisar aceite dieléctrico', 'Registrar'],
    sector: 'Electricidad', element: 'Transformadores MT',
    task: 'Inspección anual', registerCode: 'R-142',
    frequencyLabel: 'Anual', scheduledMonths: [6],
    requiresDowntime: true,
  },
  {
    id: 'mp-15', title: 'Control matafuegos',
    assetId: 'a26', assetName: 'Tableros eléctricos',
    frequencyDays: 365, nextDueDate: addDays(90),
    estimatedHours: 2, specialtyRequired: 'General',
    checklistTemplate: ['Verificar fecha de vencimiento', 'Controlar presión', 'Registrar en R-087'],
    sector: 'General', element: 'Matafuegos planta',
    task: 'Control anual', registerCode: 'R-087',
    frequencyLabel: 'Anual', scheduledMonths: [4],
  },
];

// ─── TASK TEMPLATES ───────────────────────────────────────────────────────────
export const MOCK_TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Protocolo Semanal: Equipos de Molienda',
    description: 'Mantenimiento mecánico básico semanal.',
    specialty: 'Mecánica',
    estimatedHours: 2,
    frequencyDays: 7,
    tasks: ['Verificar niveles de aceite', 'Engrasar cadenas y piñones', 'Revisar tensión de correas']
  }
];

// ─── INVENTARIO ───────────────────────────────────────────────────────────────
export const MOCK_INVENTORY = [
  { id: 'i1', name: 'Rodamiento SKF 6205',       sku: 'ROD-6205',      quantity: 4,   minStock: 10, cost: 850,   category: 'Rodamientos' },
  { id: 'i2', name: 'Correa AXS 42 dentada',     sku: 'COR-AXS42',     quantity: 2,   minStock: 4,  cost: 1200,  category: 'Transmisión' },
  { id: 'i3', name: 'Aceite reductor ISO 220',    sku: 'LUB-ISO220',    quantity: 50,  minStock: 20, cost: 180,   category: 'Lubricantes' },
  { id: 'i4', name: 'Retén de aceite 40x62x8',   sku: 'RET-40x62',     quantity: 0,   minStock: 5,  cost: 320,   category: 'Sellos' },
  { id: 'i5', name: 'Manómetro 0-10 bar',        sku: 'MAN-010',       quantity: 1,   minStock: 3,  cost: 2800,  category: 'Instrumentación' },
  { id: 'i6', name: 'Aceite hidráulico ISO 68',  sku: 'LUB-ISO68',     quantity: 100, minStock: 40, cost: 120,   category: 'Lubricantes' },
  { id: 'i7', name: 'Contactor Schneider 24V',   sku: 'EL-CONT-24',    quantity: 3,   minStock: 5,  cost: 4500,  category: 'Eléctrico' },
  { id: 'i8', name: 'Filtro de aire compresor',  sku: 'FIL-COMP-G37',  quantity: 0,   minStock: 2,  cost: 3200,  category: 'Filtros' },
];

// ─── SOLICITUDES DE COMPRA ────────────────────────────────────────────────────
export const MOCK_PURCHASE_REQUESTS: PurchaseRequest[] = [
  {
    id: 'pr1', itemId: 'i4', itemName: 'Retén de aceite 40x62x8',
    requestedBy: 'Jefe Mantenimiento', date: addDays(-2),
    status: PurchaseRequestStatus.PENDING_APPROVAL,
    originalQuantity: 10, approvedQuantity: 0, receivedQuantity: 0,
    estimatedCost: 3200
  },
  {
    id: 'pr2', itemId: 'i8', itemName: 'Filtro de aire compresor',
    requestedBy: 'Walter', date: addDays(-5),
    status: PurchaseRequestStatus.APPROVED,
    originalQuantity: 4, approvedQuantity: 4, receivedQuantity: 0,
    estimatedCost: 12800
  },
];

// ─── ÓRDENES DE TRABAJO (seed inicial) ───────────────────────────────────────
export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'ot-seed-01',
    title: 'Caño de bajada Banco T1 emparchado — reemplazar',
    description: 'Caño de bajada emparchado con cinta de papel. Reemplazar con caño definitivo.',
    assetId: 'a04', assetName: 'Banco T1',
    assignedTechnicianId: 'u3', technicianName: 'Walter',
    type: WorkOrderType.CORRECTIVE, priority: Priority.HIGH,
    status: WorkOrderStatus.IN_PROGRESS,
    dueDate: '2026-05-18', specialtyRequired: 'Mecánica',
    sector: 'Producción/Molienda', reportedBy: 'Producción',
    reportDate: '2026-05-18', origin: WorkOrderOrigin.DAILY_TASK,
  },
  {
    id: 'ot-seed-02',
    title: 'Banco C10 — falla en llave de corte de distribución',
    description: 'No para la distribución. Continúa falla en la llave de corte.',
    assetId: 'a03', assetName: 'Banco C10',
    assignedTechnicianId: 'u3', technicianName: 'Walter',
    type: WorkOrderType.CORRECTIVE, priority: Priority.HIGH,
    status: WorkOrderStatus.PENDING,
    dueDate: '2026-05-18', specialtyRequired: 'Mecánica',
    sector: 'Producción/Molienda', reportedBy: 'Producción',
    reportDate: '2026-05-18', origin: WorkOrderOrigin.DAILY_TASK,
  },
  {
    id: 'ot-seed-03',
    title: 'Esclusa 10M008 — pérdida de aceite en reductor',
    description: 'Pérdida de aceite en reductor llegó a bornera del motor. Reemplazar retén.',
    assetId: 'a05', assetName: 'Esclusa 10M008',
    assignedTechnicianId: 'u5', technicianName: 'Bejarano',
    type: WorkOrderType.CORRECTIVE, priority: Priority.HIGH,
    status: WorkOrderStatus.PENDING,
    dueDate: '2026-05-18', specialtyRequired: 'Mecánica',
    sector: 'Neumático/Filtros', reportedBy: 'Jefe Mantenimiento',
    reportDate: '2026-05-18', origin: WorkOrderOrigin.INSPECTION,
  },
  {
    id: 'ot-seed-04',
    title: 'Soplante Repicky — reemplazar correa AXS 42',
    description: 'Reemplazar correa AXS 42 dentada.',
    assetId: 'a10', assetName: 'Soplante Repicky',
    type: WorkOrderType.CORRECTIVE, priority: Priority.MEDIUM,
    status: WorkOrderStatus.PENDING,
    dueDate: '2026-05-19', specialtyRequired: 'Mecánica',
    sector: 'Neumático/Filtros', reportedBy: 'Jefe Mantenimiento',
    reportDate: '2026-05-18', origin: WorkOrderOrigin.INSPECTION,
  },
  {
    id: 'ot-seed-05',
    title: 'Motor 78M001 — seguimiento zumbido rulemanes',
    description: 'Filtro reemplazado. Zumbidos en rulemanes: posible rotura de rodamientos. Seguir evolución.',
    assetId: 'a08', assetName: 'Motor 78M001',
    type: WorkOrderType.CORRECTIVE, priority: Priority.LOW,
    status: WorkOrderStatus.PENDING,
    dueDate: '2026-05-25', specialtyRequired: 'Mecánica',
    sector: 'Producción/Molienda', reportedBy: 'Jefe Mantenimiento',
    reportDate: '2026-05-18', origin: WorkOrderOrigin.INSPECTION,
    needsScheduling: true,
  },
  {
    id: 'ot-seed-06',
    title: 'Reparación de luminarias (Federico Rial)',
    description: 'Reparación de luminarias en planta.',
    assetId: 'a26', assetName: 'Tableros eléctricos',
    type: WorkOrderType.CORRECTIVE, priority: Priority.MEDIUM,
    status: WorkOrderStatus.COMPLETED,
    dueDate: '2026-05-18', specialtyRequired: 'Eléctrico',
    sector: 'Electricidad', contractor: 'Federico Rial',
    reportDate: '2026-05-18', origin: WorkOrderOrigin.THIRD_PARTY,
    repairHours: 3, releasedBy: 'Jefe Mantenimiento',
    completionComment: 'Luminarias reparadas. Todo en orden.',
    endTime: '2026-05-18T17:00:00',
  },
  {
    id: 'ot-seed-07',
    title: 'Check list semanal Autoelevador 1',
    description: 'Mantenimiento preventivo semanal según PL-006.',
    assetId: 'a23', assetName: 'Autoelevador 1',
    assignedTechnicianId: 'u7', technicianName: 'Ramírez',
    type: WorkOrderType.PREVENTIVE, priority: Priority.MEDIUM,
    status: WorkOrderStatus.COMPLETED,
    dueDate: addDays(-3), specialtyRequired: 'Mecánica',
    sector: 'Vehículos', planId: 'mp-08',
    origin: WorkOrderOrigin.PREVENTIVE,
    repairHours: 0.5, releasedBy: 'Ramírez',
    completionComment: 'Sin novedades.',
    endTime: addDays(-3) + 'T09:30:00',
  },
];

// ─── PARTE DIARIO SEED (WhatsApp del 18/5/2026) ───────────────────────────────
export const MOCK_DAILY_REPORTS: DailyReport[] = [
  {
    id: 'dr-seed-01',
    date: '2026-05-18',
    rawText: `Tareas lunes 18/5/2026

1- Banco T1: caño de bajada emparchado con cinta de papel. Reemplazar.
2- Banco C10: No para la distribución, continúa falla en la llave de corte.
3- Banco C6: No se pueden regular las cuchillas; desmontar, limpiar y/o reemplazar si hay desgaste.
4- Esclusas filtros TN / Sasores / pulmón (3° piso / 2° piso): Revisar cadenas, piñones y acoples. Lubricar rodamientos y reductores.
5- Filtro de ensilaje/trasilaje (6° E): Revisar golpe de martillo. Ver con Fede Rial.
6- Humedecanter: Desgaste en acople de sinfín inferior. Ver aceite del reductor.
7- Motor 10M015 (ex redler, terraza de trigo): Bajar motor de la terraza de trigo.

Relevamiento de J y O rodamientos:
1- Esclusa 10M008 (Piso 8 trigo): Pérdida de aceite en reductor (llegó a bornera del motor). Reemplazar retén. Idem 10M010 (rosca 8° piso).
2- Reductor 52M014: Pérdida de aceite, cadena suelta, piñones con desgaste. Revisar.
3- Soplante Repicky (9° piso trigo): Reemplazar correa AXS 42 (dentada).
4- Motor 78M001: Filtro reemplazado. Zumbidos en rulemanes: posible rotura de rodamientos. Seguir evolución, reemplazo a programar. NO ES URGENTE.
5- Soplante Repicky pellets 51M001: Reemplazar manómetro en mal estado. NO ES URGENTE.

Trabajos de y con terceros:
- Edilicio: Hugo Vera: Pintura en vigilancia y expedición.
- Tercerizados: Wonder: 2 personas acompañan a planta en preventivos/correctivos.
- Federico Rial: Reparación de luminarias. Reemplazo de botonera colgante en aparejo de guinche frente al taller. Revisión de golpe de martillo en filtro del trasilaje.
- Héctor Peralta: Pérdida de agua en caño de elevación al tanque principal (8° piso). Mismo caño en 2° piso a cambiar por corrosión. Pérdida en termotanque baño de dársenas. Reparar ducha de vestuarios.
- Carlos Mussa (TN): Moledor a martillos: reparar caños con pérdida de producto. Bajada de MYFC al mojador intensivo: cañería con pérdida de trigo. Tolva de salida de SORTEX: reparar pérdida de trigo.`,
    createdWorkOrderIds: [
      'ot-seed-01','ot-seed-02','ot-seed-03','ot-seed-04',
      'ot-seed-05','ot-seed-06',
    ],
  }
];

// ─── PREVENTIVE LOG (R-142) seed ──────────────────────────────────────────────
export const MOCK_PREVENTIVE_LOGS: PreventiveLogEntry[] = [
  { id: 'pl-01', planId: 'mp-08', date: '2026-05-12', observations: 'Sin novedades', responsible: 'Ramírez', month: 5 },
  { id: 'pl-02', planId: 'mp-08', date: '2026-05-05', observations: 'Sin novedades', responsible: 'Ramírez', month: 5 },
  { id: 'pl-03', planId: 'mp-01', date: '2026-05-02', observations: 'Sin pérdidas', responsible: 'Tejeda', month: 5 },
  { id: 'pl-04', planId: 'mp-06', date: '2026-05-03', observations: 'pH 8.2 / Dureza 12 ppm. Ajuste mínimo', responsible: 'Walter', month: 5 },
  { id: 'pl-05', planId: 'mp-04', date: '2026-04-10', observations: 'Nivel OK', responsible: 'Bejarano', month: 4 },
];

// ─── CATALOG DE MODELOS DEL MOLINO ────────────────────────────────────────────
// Cada entrada es un tipo de equipo único que sirve de plantilla al crear activos.
export const MOCK_MODEL_CATALOG: CatalogModel[] = [
  {
    id: 'cat-banco-cilindros',
    brand: 'Bühler',
    category: 'Banco de Cilindros',
    name: 'Banco de Cilindros',
    description: 'Banco de cilindros de molienda para trigo. Incluye pares de cilindros lisos y estriados.',
    manualUrl: '#',
    imageUrl: '',
    standardPlans: [
      {
        title: 'Revisión quincenal — Banco de Cilindros',
        frequencyDays: 15,
        estimatedHours: 1,
        specialtyRequired: 'Mecánica',
        checklistTemplate: [
          'Verificar temperatura de rodamientos',
          'Controlar tensión de correas',
          'Lubricar rodamientos laterales',
          'Revisar estado de cuchillas y desgaste',
          'Verificar paralelismo de cilindros',
        ],
      },
    ],
    commonFailures: [
      { id: 'f-bc-01', code: 'BC-01', title: 'No regula las cuchillas', cause: 'Desgaste o traba en mecanismo de regulación', solution: 'Desmontar, limpiar y/o reemplazar si hay desgaste excesivo' },
      { id: 'f-bc-02', code: 'BC-02', title: 'No para la distribución', cause: 'Falla en llave de corte', solution: 'Revisar y reemplazar llave de corte' },
    ],
  },
  {
    id: 'cat-soplante',
    brand: 'Repicky',
    category: 'Soplante',
    name: 'Soplante',
    description: 'Soplante de transporte neumático de harinas y subproductos.',
    manualUrl: '#',
    imageUrl: '',
    standardPlans: [
      {
        title: 'Mantenimiento mensual — Soplante',
        frequencyDays: 30,
        estimatedHours: 1.5,
        specialtyRequired: 'Mecánica',
        checklistTemplate: [
          'Verificar tensión y estado de correas',
          'Revisar manómetro y presostatos',
          'Lubricar rodamientos',
          'Verificar temperatura de carcasa',
        ],
      },
    ],
    commonFailures: [
      { id: 'f-sp-01', code: 'SP-01', title: 'Correa rota o floja', cause: 'Desgaste por uso o falta de tensión', solution: 'Reemplazar correa y verificar alineación de poleas' },
      { id: 'f-sp-02', code: 'SP-02', title: 'Manómetro en mal estado', cause: 'Desgaste del instrumento', solution: 'Reemplazar manómetro' },
    ],
  },
  {
    id: 'cat-esclusa',
    brand: 'Genérico',
    category: 'Esclusa',
    name: 'Esclusa rotativa',
    description: 'Esclusa rotativa para descarga de filtros de mangas y transporte neumático.',
    manualUrl: '#',
    imageUrl: '',
    standardPlans: [
      {
        title: 'Inspección trimestral — Esclusa',
        frequencyDays: 90,
        estimatedHours: 1,
        specialtyRequired: 'Mecánica',
        checklistTemplate: [
          'Verificar nivel de aceite del reductor',
          'Inspeccionar retenes y sellos',
          'Revisar estado de paletas internas',
          'Controlar temperatura de motor',
        ],
      },
    ],
    commonFailures: [
      { id: 'f-es-01', code: 'ES-01', title: 'Pérdida de aceite en reductor', cause: 'Retén desgastado', solution: 'Reemplazar retén y verificar nivel de aceite' },
    ],
  },
  {
    id: 'cat-reductor',
    brand: 'Genérico',
    category: 'Reductor',
    name: 'Reductor de velocidad',
    description: 'Reductor de velocidad para transmisión de equipos de molienda y transporte.',
    manualUrl: '#',
    imageUrl: '',
    standardPlans: [
      {
        title: 'Control trimestral — Reductor',
        frequencyDays: 90,
        estimatedHours: 0.5,
        specialtyRequired: 'Lubricación',
        checklistTemplate: [
          'Verificar nivel de aceite',
          'Revisar pérdidas por sellos',
          'Controlar temperatura en operación',
          'Inspeccionar cadena y piñones asociados',
        ],
      },
    ],
    commonFailures: [
      { id: 'f-red-01', code: 'RED-01', title: 'Pérdida de aceite', cause: 'Desgaste de retenes o sellos', solution: 'Reemplazar retenes y reponer nivel de aceite' },
      { id: 'f-red-02', code: 'RED-02', title: 'Ruido excesivo', cause: 'Desgaste de engranajes o falta de lubricación', solution: 'Verificar aceite y revisar engranajes' },
    ],
  },
  {
    id: 'cat-motor-electrico',
    brand: 'WEG',
    category: 'Motor Eléctrico',
    name: 'Motor eléctrico',
    description: 'Motor eléctrico trifásico para accionamiento de equipos de molienda y transporte.',
    manualUrl: '#',
    imageUrl: '',
    standardPlans: [
      {
        title: 'Revisión semestral — Motor eléctrico',
        frequencyDays: 180,
        estimatedHours: 1,
        specialtyRequired: 'Eléctrico',
        checklistTemplate: [
          'Medir consumo de corriente en las tres fases',
          'Verificar temperatura de carcasa',
          'Revisar rodamientos (vibración y temperatura)',
          'Revisar bornera y conexiones',
          'Limpiar ventilación',
        ],
      },
    ],
    commonFailures: [
      { id: 'f-mot-01', code: 'MOT-01', title: 'Zumbido o vibración anormal', cause: 'Rodamiento en mal estado', solution: 'Seguir evolución y programar reemplazo de rodamientos' },
      { id: 'f-mot-02', code: 'MOT-02', title: 'Sobrecalentamiento', cause: 'Ventilación tapada o sobrecarga', solution: 'Limpiar ventilación y verificar carga' },
    ],
  },
  {
    id: 'cat-compresor',
    brand: 'Atlas Copco',
    category: 'Compresor',
    name: 'Compresor tornillo',
    description: 'Compresor de tornillo para generación de aire comprimido en planta.',
    manualUrl: '#',
    imageUrl: '',
    standardPlans: [
      {
        title: 'Control de aceite trimestral — Compresor',
        frequencyDays: 90,
        estimatedHours: 1,
        specialtyRequired: 'Mecánica',
        checklistTemplate: [
          'Verificar nivel de aceite',
          'Revisar filtro de aceite',
          'Verificar filtro de aire',
          'Controlar presión de trabajo',
          'Registrar en R-085',
        ],
      },
    ],
    commonFailures: [
      { id: 'f-comp-01', code: 'COMP-01', title: 'Alta temperatura', cause: 'Filtro de aceite obstruido o bajo nivel', solution: 'Cambiar filtro de aceite y reponer nivel' },
    ],
  },
  {
    id: 'cat-filtro-mangas',
    brand: 'Genérico',
    category: 'Filtro de Mangas',
    name: 'Filtro de mangas',
    description: 'Filtro de mangas para desempolvado de silos, transporte neumático y molienda.',
    manualUrl: '#',
    imageUrl: '',
    standardPlans: [
      {
        title: 'Revisión semestral — Filtro de mangas',
        frequencyDays: 180,
        estimatedHours: 3,
        specialtyRequired: 'Mecánica',
        requiresDowntime: true,
        checklistTemplate: [
          'Inspeccionar estado de mangas (roturas, desgaste)',
          'Revisar golpe de martillo (válvulas de pulso)',
          'Verificar temporizador y solenoide',
          'Controlar nivel de polvo en tolva',
        ],
      },
    ],
    commonFailures: [
      { id: 'f-fil-01', code: 'FIL-01', title: 'Golpe de martillo sin funcionamiento', cause: 'Válvula de pulso dañada o sin aire', solution: 'Revisar presión de aire y reemplazar válvula' },
    ],
  },
  {
    id: 'cat-caldera',
    brand: 'Genérico',
    category: 'Caldera',
    name: 'Caldera de vapor',
    description: 'Caldera de vapor para acondicionamiento de trigo en el proceso de molienda.',
    manualUrl: '#',
    imageUrl: '',
    standardPlans: [
      {
        title: 'Control fisicoquímico mensual — Caldera',
        frequencyDays: 30,
        estimatedHours: 0.5,
        specialtyRequired: 'General',
        checklistTemplate: [
          'Tomar muestra de agua',
          'Medir pH y dureza',
          'Ajustar dosificación de químicos',
          'Registrar en sistema TQ',
        ],
      },
    ],
    commonFailures: [],
  },
  {
    id: 'cat-autoelevador',
    brand: 'Toyota',
    category: 'Autoelevador',
    name: 'Autoelevador',
    description: 'Autoelevador para movimiento de materiales en planta y patio.',
    manualUrl: '#',
    imageUrl: '',
    standardPlans: [
      {
        title: 'Check list semanal — Autoelevador',
        frequencyDays: 7,
        estimatedHours: 0.5,
        specialtyRequired: 'Mecánica',
        checklistTemplate: [
          'Verificar nivel de combustible/batería',
          'Revisar frenos de servicio y estacionamiento',
          'Verificar estado y alineación de horquillas',
          'Verificar bocina, luces y alarma de retroceso',
          'Registrar en R-113',
        ],
      },
    ],
    commonFailures: [
      { id: 'f-auto-01', code: 'AUTO-01', title: 'Frenos deficientes', cause: 'Desgaste de pastillas', solution: 'Reemplazar pastillas de freno' },
    ],
  },
  {
    id: 'cat-balanza',
    brand: 'Genérico',
    category: 'Balanza',
    name: 'Balanza de camiones',
    description: 'Balanza de pesaje de camiones para control de materia prima y producto terminado.',
    manualUrl: '#',
    imageUrl: '',
    standardPlans: [
      {
        title: 'Calibración anual — Balanza',
        frequencyDays: 365,
        estimatedHours: 4,
        specialtyRequired: 'Instrumentación',
        requiresDowntime: true,
        checklistTemplate: [
          'Solicitar empresa certificadora habilitada',
          'Prueba con pesos patrón certificados',
          'Verificar plataforma y celdas de carga',
          'Emitir certificado de calibración',
          'Registrar en PL-008',
        ],
      },
    ],
    commonFailures: [],
  },
  {
    id: 'cat-tablero',
    brand: 'Schneider',
    category: 'Tablero Eléctrico',
    name: 'Tablero eléctrico',
    description: 'Tablero de distribución eléctrica de baja tensión para equipos de planta.',
    manualUrl: '#',
    imageUrl: '',
    standardPlans: [
      {
        title: 'Limpieza y revisión cuatrimestral — Tablero',
        frequencyDays: 120,
        estimatedHours: 2,
        specialtyRequired: 'Eléctrico',
        checklistTemplate: [
          'Cortar tensión con protocolo de bloqueo',
          'Soplado interior con aire seco',
          'Reapriete de borneras y terminales',
          'Verificar estado de fusibles y disyuntores',
          'Medir temperatura de bornes con termografía',
        ],
      },
    ],
    commonFailures: [],
  },
];
