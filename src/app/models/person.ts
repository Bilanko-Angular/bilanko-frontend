export interface Person {
  id?: number;
  nom: string;
  subname?: string;
  email: string;
  role?: string;
  password?:string;
  dateInscription?: string;
  phone?: string;
}

export interface User extends Person{
  role?:"Utilisateur"
}