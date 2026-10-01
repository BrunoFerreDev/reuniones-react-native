export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO';

export interface GetArbitroDTO {
  idArbitro: number;
  nombre: string;
  apellido: string;
  categoria?: string;
  whatsapp?: string;
  estadoSistema?: boolean;
  tieneAuto?: boolean;
  talleCamiseta?: string;
  talleShort?: string;
  disponibleSabado?: boolean;
  disponibleDomingo?: boolean;
  email?: string;
  activo?: boolean;
}

export interface TemaReunionDTO {
  idTema?: number;
  titulo: string;
  descripcion?: string;
  orden?: number;
  urlMaterial?: string;
  conclusiones?: string;
  tiempoMinutos?: number;
}

export interface CrearReunionDTO {
  fecha: string; // ISO string e.g. "2026-09-08T19:30:00"
  lugar: string;
  titulo: string;
  observaciones?: string;
  sincronizarArbitrosActivos?: boolean;
  temas?: TemaReunionDTO[];
}

export interface GetReunionResumenDTO {
  idReunion: number;
  fecha: string;
  lugar: string;
  titulo: string;
  observaciones?: string;
  editable?: boolean;
  totalTemas: number;
  totalPresentes: number;
  totalAusentes: number;
  totalJustificados: number;
  disponiblesSabado: number;
  disponiblesDomingo: number;
}

export interface GetAsistenciaDTO {
  idAsistencia?: number;
  arbitro: GetArbitroDTO;
  estadoAsistencia: EstadoAsistencia;
  observacion?: string;
  disponibleSabado?: boolean;
  disponibleDomingo?: boolean;
}

export interface GetReunionDetalleDTO {
  idReunion: number;
  fecha: string;
  lugar: string;
  titulo: string;
  observaciones?: string;
  editable?: boolean;
  totalPresentes: number;
  totalAusentes: number;
  totalJustificados: number;
  disponiblesSabado: number;
  disponiblesDomingo: number;
  temas: TemaReunionDTO[];
  asistencias: GetAsistenciaDTO[];
}

export interface AsistenciaItemBatchDTO {
  idAsistencia?: number;
  idArbitro: number;
  estadoAsistencia: EstadoAsistencia;
  observacion?: string;
  disponibleSabado?: boolean;
  disponibleDomingo?: boolean;
}

export interface RegistrarAsistenciaBatchDTO {
  sincronizarConActivos?: boolean;
  asistencias: AsistenciaItemBatchDTO[];
}

export interface GetDisponibilidadFinDeSemanaDTO {
  idReunion: number;
  fechaReunion: string;
  tituloReunion: string;
  totalEvaluados: number;
  totalDisponiblesSabado: number;
  totalDisponiblesDomingo: number;
  totalDisponiblesAmbosDias: number;
  totalNoDisponibles: number;
  disponiblesSabado: GetAsistenciaDTO[];
  disponiblesDomingo: GetAsistenciaDTO[];
  disponiblesAmbosDias: GetAsistenciaDTO[];
  noDisponibles: GetAsistenciaDTO[];
}

export interface Page<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AuthLogin {
  whatsapp: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  roles: string[];
  expiresIn?: number;
}

