import { UserResponseDto } from "../models/DTO/UserDto";
import { User } from "../models/person";

export class UserResponseMapper {
  static fromResponseDto(dto: UserResponseDto): User {
    return {
      nom: dto.name,
      subname: dto.subname,
      email: dto.email,
      profilePicture: dto.profilePicture
    };
  }
}
