import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import { UserResponseDto } from '../../../models/DTO/UserDto';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly basePath = environment.baseApiUrl + '/users';

  async getCurrentUser(): Promise<UserResponseDto> {
    const response = await apiClient.get<UserResponseDto>(`${this.basePath}/me`);
    console.log(response.data);
    return response.data;
  }
}
