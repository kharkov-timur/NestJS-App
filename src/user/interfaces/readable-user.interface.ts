export interface IReadableUser {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: string;
  status: string;
  accessToken?: string;
}
