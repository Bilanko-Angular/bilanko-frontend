import { Routes } from '@angular/router';
import { Acceuil } from './pages/acceuil/acceuil';
import { SalesComponent } from './pages/ventes/ventes';
import { ChargesComponent } from './pages/charges/charges';

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
  }
];
