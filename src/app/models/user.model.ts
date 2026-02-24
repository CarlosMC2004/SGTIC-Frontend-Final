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

export interface CreateUserRequest {
  identification: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  roleIds: number[];
}
