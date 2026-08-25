import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser } from "../auth-user";
import { VerifyMailComponent } from '../../../components/auth/verify-mail/verify-mail';
import { InputOtpFormComponent } from '../../../components/auth/input-otp-form.component/input-otp-form.component';
import { ResetYourPasswordComponent } from '../../../components/auth/reset-your-password/reset-your-password';

@Component({
  selector: 'app-mot-de-passe-oublie',
  standalone: true,
  imports: [AuthUser, VerifyMailComponent, InputOtpFormComponent, ResetYourPasswordComponent],
  templateUrl: './mot-de-passe-oublie.html',
  styleUrl: './mot-de-passe-oublie.css',
})
export class MotDePasseOublie {
  step = signal<number>(1);
  email = signal<string>('');
  token = signal<string>('');
  otp=signal<string>('');
  newPassword=signal<string>('');

  constructor(private router: Router) { }

  onMailVerified(email: string) {
    this.email.set(email);
    this.step.set(2);
  }

  onOtpVerified(token: string) {
    this.token.set(token);
    this.step.set(3);
  }

  onPasswordReset() {
    this.router.navigate(['/connexion']);
  }
  
  onRestart() {
    this.step.set(1);
    this.email.set('');
  }
}