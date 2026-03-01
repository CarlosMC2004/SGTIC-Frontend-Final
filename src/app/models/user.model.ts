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

export interface AcademicPeriodDTO {
  idPeriod: number;
  name: string;
  startDate: string; // ISO date string
  endDate: string;
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
