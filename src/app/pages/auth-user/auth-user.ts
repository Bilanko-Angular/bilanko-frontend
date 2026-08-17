import { Component } from '@angular/core';
import { HeaderUser } from "../../../components/user/shared/header-user/header-user";

@Component({
  selector: 'app-auth-user',
  imports: [HeaderUser],
  templateUrl: './auth-user.html',
  styleUrl: './auth-user.css',
})
export class AuthUser {

}
