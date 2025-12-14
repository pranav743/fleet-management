export enum UserRole {
  OWNER = "OWNER",
  DRIVER = "DRIVER",
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  user: User;
  expires: string;
}
