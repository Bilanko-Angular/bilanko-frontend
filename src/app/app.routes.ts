import { Routes } from '@angular/router';
import { Acceuil } from './pages/acceuil/acceuil';
import { Connexion } from './pages/auth-user/connexion/connexion';
import { Inscription } from './pages/auth-user/inscription/inscription';

export const routes: Routes = [
  {
    path:"",
    component:Acceuil
  },
  {
    path:"connexion",
    component:Connexion
  },
  {
    path:"inscription",
    component:Inscription
  }
];
