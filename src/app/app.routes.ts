import { Routes } from '@angular/router';
import { Acceuil } from './pages/acceuil/acceuil';
import { SalesComponent } from './pages/ventes/ventes';
import { ChargesComponent } from './pages/charges/charges';
import { Connexion } from './pages/auth-user/connexion/connexion';
import { Inscription } from './pages/auth-user/inscription/inscription';

export const routes: Routes = [
  {
    path:"",
    component:Acceuil
  },
  {
    path:"ventes",
    component:SalesComponent
  }
  ,
  {
    path: "charges",
    component: ChargesComponent
  },
  {
    path: "connexion",
    component:Connexion
  },
  {
    path: "inscription",
    component:Inscription
  }
];
