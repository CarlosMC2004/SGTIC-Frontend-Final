export interface AuditoriaSistema {
  idAuditoria: number;
  idUsuario: number;
  moduloTabla: string;
  accion: string;
  valoresAnteriores: string;
  valoresNuevos: string;
  direccionIp: string;
  fechaHora: string;
  expandido?: boolean;
}
