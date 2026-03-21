export interface DuplicadoResult {
  id_tema_propuesto?: number;
  id_tema?: number;
  titulo: string;
  similitud: number;
  motivo: string;
}

export interface VerificacionIAResponse {
  duplicados_estudiantes: DuplicadoResult[];
  duplicados_banco: DuplicadoResult[];
}
