export interface UserContext {
  idFaculty: number | null;
  idCareer: number | null;
  idTeacher: number | null;
  idStudent: number | null;
}

export interface LoginResponse {
  token: string;
  email: string;
  fullName: string;
  roles: string[];
  context: UserContext;
  primerIngreso: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CurrentUser {
  email: string;
  fullName: string;
  roles: string[];
  context: UserContext;
  primerIngreso: boolean;
}
export interface User {
  id?: number;
  identification: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username?: string;
  active: boolean;
  roles: string[];
  lastLogin?: string;
}

export interface RoleDTO {
  id: number;
  name: string;
}

export interface CareerDTO {
  idCareer: number;
  name: string;
  facultyName?: string;
}

export interface FacultyDTO {
  idFaculty: number;
  name: string;
}

export interface AcademicPeriodDTO {
  idPeriod: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface SelectionItemDTO {
  id: number;
  nombre: string;
}

export interface CreateUserRequest {
  identification: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  roleIds: number[];
}
