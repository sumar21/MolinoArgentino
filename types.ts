
// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  PLANNER = 'PLANNER',
  TECHNICIAN = 'TECHNICIAN',
  OPERATIONS = 'OPERATIONS'
}

export enum WorkOrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED'
}

export enum WorkOrderType {
  CORRECTIVE = 'CORRECTIVE',
  PREVENTIVE = 'PREVENTIVE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum PurchaseRequestStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PURCHASED = 'PURCHASED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  COMPLETED = 'COMPLETED'
}

export enum WorkOrderOrigin {
  DAILY_TASK = 'DAILY_TASK',
  INSPECTION = 'INSPECTION',
  THIRD_PARTY = 'THIRD_PARTY',
  PREVENTIVE = 'PREVENTIVE',
  MANUAL = 'MANUAL'
}

// Interfaces
export interface User {
  id: string;
  name: string;
  role: UserRole;
  specialty?: string;
  avatar: string;
}

export interface FrequentFailure {
  id: string;
  code: string;
  title: string;
  description?: string;
  cause?: string;
  solution?: string;
  imageUrl?: string;
}

export interface Asset {
  id: string;
  name: string;
  location: string;
  sector?: string;
  brand?: string;
  category?: string;
  model?: string;
  serialNumber?: string;
  manualUrl?: string;
  imageUrl?: string;
  frequentFailures?: FrequentFailure[];
  status: 'OPERATIONAL' | 'DOWN';
  tag?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minStock: number;
  cost: number;
  category: string;
}

export interface ReceptionEntry {
  id: string;
  date: string;
  quantity: number;
  remito: string;
  receivedBy: string;
}

export interface PurchaseRequest {
  id: string;
  itemId: string;
  itemName: string;
  requestedBy: string;
  date: string;
  status: PurchaseRequestStatus;
  originalQuantity: number;
  approvedQuantity: number;
  receivedQuantity: number;
  estimatedCost: number;
  provider?: string;
  orderDate?: string;
  receptionLog?: ReceptionEntry[];
}

export interface ChecklistTask {
  id: string;
  description: string;
  completed: boolean;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  specialty: string;
  estimatedHours: number;
  frequencyDays: number;
  tasks: string[];
}

export interface PlanPart {
  itemId: string;
  itemName: string;
  quantity: number;
}

export interface MaintenancePlan {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  frequencyDays: number;
  nextDueDate: string;
  estimatedHours: number;
  specialtyRequired: string;
  checklistTemplate: string[];
  requiresDowntime?: boolean;
  requiredParts?: PlanPart[];
  // Molino fields
  sector?: string;
  element?: string;
  task?: string;
  registerCode?: string;
  frequencyLabel?: string;
  scheduledMonths?: number[];
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  assetId: string;
  assetName: string;
  assignedTechnicianId?: string;
  technicianName?: string;
  type: WorkOrderType;
  priority: Priority;
  status: WorkOrderStatus;
  dueDate: string;
  specialtyRequired: string;
  planId?: string;
  checklist?: ChecklistTask[];
  startTime?: string;
  endTime?: string;
  completionComment?: string;
  evidenceImageUrl?: string;
  // R-199 fields
  sector?: string;
  reportedBy?: string;
  reportDate?: string;
  isTemporaryRepair?: boolean;
  repairHours?: number;
  releasedBy?: string;
  contractor?: string;
  origin?: WorkOrderOrigin;
  needsScheduling?: boolean;
}

export interface CatalogModel {
  id: string;
  brand: string;
  category: string;
  name: string;
  description: string;
  manualUrl: string;
  imageUrl: string;
  standardPlans: Partial<MaintenancePlan>[];
  commonFailures: FrequentFailure[];
}

export interface PreventiveLogEntry {
  id: string;
  planId: string;
  date: string;
  observations?: string;
  responsible?: string;
  month: number;
}

export interface DailyReport {
  id: string;
  date: string;
  rawText: string;
  createdWorkOrderIds: string[];
}

// Draft type used by the parser before creating real WorkOrders
export interface WorkOrderDraft {
  title: string;
  description: string;
  assetName: string;
  tag?: string;
  sector?: string;
  location?: string;
  activity: string;
  contractor?: string;
  origin: WorkOrderOrigin;
  priority: Priority;
  needsScheduling?: boolean;
  specialtyRequired: string;
}
