import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import axios from 'axios';
import { User } from '../../../models/person';
import { UserMapper } from '../../../mapper/UserMapper';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private apiUrl = environment.baseApiUrl + "auth";
  async register(userData:User){
    const userDto = UserMapper.toRegisterDto(userData);
    axios.post(this.apiUrl+'/signup', userDto)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
  }
}
