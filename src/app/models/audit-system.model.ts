export interface AuditSystem {
  idAudit: number;
  idUser: number;
  action: string;
  moduleTable: string;
  recordId: string;
  oldValues: string;
  newValues: string;
  ipAddress: string;
  dateTime: string;
}

export interface AuditPageResponse {
  content: AuditSystem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
