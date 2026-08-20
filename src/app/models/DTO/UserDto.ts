export interface UserRegisterDto {
  name:string,
  subname:string,
  email: string;
  password: string;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
}