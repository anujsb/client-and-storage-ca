export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateEmployeeInput {
  name: string;
  phone?: string | null;
  email?: string | null;
}

export interface UpdateEmployeeInput {
  name?: string;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
}
