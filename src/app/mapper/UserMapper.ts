import { UserRegisterDto } from "../models/DTO/UserDto";
import { User } from "../models/person";

export class UserMapper {
  static toRegisterDto(user: User): UserRegisterDto {
    return {
      name: user.nom,
      subname: user.subname ?? '',
      email: user.email,
      password: user.password ?? '',
    };
  }

  static fromRegisterDto(dto: UserRegisterDto, id?: number): User {
    return {
      id: id,
      nom: dto.name,
      subname: dto.subname,
      email: dto.email,
    };
  }
}