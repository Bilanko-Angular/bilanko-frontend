import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { User } from '../../../models/person';
import { AuthUser } from "../auth-user";
@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule, AuthUser],
  templateUrl: './inscription.html',
  styleUrl: './inscription.css',
})
export class Inscription {
  private readonly fb = inject(FormBuilder)
  readonly inscriptionForm = this.fb.group({
    nom:['',Validators.required,Validators.minLength(3)],
    prenom:[''],
    email:['',Validators.required,Validators.email],
    password: ['', [Validators.required, Validators.pattern("(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}")]],
    confirmPassword:['',Validators.required]
  })
  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
  get nom(){
    return this.inscriptionForm.controls.nom
  }

  get prenom(){
    return this.inscriptionForm.controls.prenom
  }

  get email(){
    return this.inscriptionForm.controls.email
  }

  get password(){
    return this.inscriptionForm.controls.password
  }

  get confirmPassword(){
    return this.inscriptionForm.controls.confirmPassword
  }
  
  hasMinLength(): boolean {
    return (this.password.value || '').length >= 8;
  }


  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.password.value || '');
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.password.value || '');
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.password.value || '');
  }

  hasSpecialChar(): boolean {
    return /[#?!@$%^&*-]/.test(this.password.value || '');
  }
  soumettre(){

  }
}
