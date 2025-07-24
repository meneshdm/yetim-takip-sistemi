// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// Person types
export interface Person extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  groups: string[];
  totalPayments: number;
  monthlyDebt: number;
  lastPayment: string;
  status: string;
}

export interface CreatePersonRequest {
  name: string;
  email?: string;
  phone?: string;
}

export interface UpdatePersonRequest {
  name?: string;
  email?: string;
  phone?: string;
}

// Group types
export interface Group extends BaseEntity {
  name: string;
  perPersonFee?: number;
  startMonth?: number;
  startYear?: number;
  memberCount: number;
  orphanCount: number;
  totalMonthlyAmount: number;
  members?: GroupMember[];
  orphans?: OrphanAssignment[];
}

export interface CreateGroupRequest {
  name: string;
  perPersonFee?: number;
  startMonth?: number;
  startYear?: number;
}

export interface UpdateGroupRequest {
  name?: string;
  perPersonFee?: number;
  startMonth?: number;
  startYear?: number;
}

// Orphan types
export interface Orphan extends BaseEntity {
  name: string;
  age?: number;
  location?: string;
  photo?: string;
  description?: string;
  monthlyFee: number;
  pdfFile?: string;
  documents?: string;
  groups: string[];
  totalPaid: number;
  currentMonthPaid: boolean;
}

export interface CreateOrphanRequest {
  name: string;
  age?: number;
  location?: string;
  photo?: string;
  description?: string;
  monthlyFee: number;
  pdfFile?: string;
}

export interface UpdateOrphanRequest {
  name?: string;
  age?: number;
  location?: string;
  photo?: string;
  description?: string;
  monthlyFee?: number;
  pdfFile?: string;
}

// Payment types
export interface Payment extends BaseEntity {
  personId: string;
  personName: string;
  amount: number;
  month: number;
  year: number;
  isPaid: boolean;
  paidAt?: string;
  description?: string;
}

export interface CreatePaymentRequest {
  personId: string;
  amount: number;
  month?: number;
  year?: number;
  description?: string;
  isPaid?: boolean;
}

// Dashboard types
export interface DashboardStats {
  totalPeople: number;
  totalGroups: number;
  totalOrphans: number;
  monthlyIncome: number;
  totalPaid: number;
  totalUnpaid: number;
}

export interface DashboardBalance {
  current: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyChange: number;
}

export interface DashboardDebtor {
  id: string;
  name: string;
  debt: number;
  monthsBehind: number;
}

export interface DashboardData {
  stats: DashboardStats;
  balance: DashboardBalance;
  debtors: DashboardDebtor[];
}

// Relation types
export interface GroupMember {
  id: string;
  groupId: string;
  personId: string;
  customAmount?: number;
  isActive: boolean;
  person?: Person;
  group?: Group;
}

export interface OrphanAssignment {
  id: string;
  groupId: string;
  orphanId: string;
  group?: Group;
  orphan?: Orphan;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form types
export interface FormState {
  isLoading: boolean;
  error: string;
  success: boolean;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface PersonModalProps extends ModalProps {
  person?: Person;
}

export interface GroupModalProps extends ModalProps {
  group?: Group;
}

export interface OrphanModalProps extends ModalProps {
  orphan?: Orphan;
}

export interface PaymentModalProps extends ModalProps {
  person: Person;
}

export interface FileUploadModalProps extends ModalProps {
  orphan: Orphan;
}

// File upload types
export interface FileUploadResponse {
  success: boolean;
  fileName?: string;
  filePath?: string;
  error?: string;
}
