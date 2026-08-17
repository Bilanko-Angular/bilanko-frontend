import { Component, inject } from '@angular/core';
import { AuthUser } from "../auth-user";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-connexion',
  imports: [AuthUser,ReactiveFormsModule],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
})
export class Connexion {
  private readonly fb = inject(FormBuilder)
  readonly connectionForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  
  get email() {
    return this.connectionForm.controls.email;
  }

  get password() {
    return this.connectionForm.controls.password;
  }

  soumettre(event:Event):void {    
    if(this.connectionForm.invalid) return;
    console.log('Connexion :', this.connectionForm.value)
    
  }
}
