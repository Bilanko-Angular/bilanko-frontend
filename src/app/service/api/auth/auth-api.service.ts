import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import axios from 'axios';
import { User } from '../../../models/person';
import { UserMapper } from '../../../mapper/UserMapper';
import { AuthResponseDto } from '../../../models/DTO/UserDto';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private apiUrl = environment.baseApiUrl + 'api/auth';

  async register(userData: User): Promise<AuthResponseDto> {
    const userDto = UserMapper.toRegisterDto(userData);
    const response = await axios.post<AuthResponseDto>(this.apiUrl + '/signup', userDto);
    return response.data;
  }

  async login(userData: User): Promise<AuthResponseDto> {
    const userDto = UserMapper.toLoginDto(userData);
    const response = await axios.post<AuthResponseDto>(this.apiUrl + '/login', userDto);
    return response.data;
  }
}
