// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Acceuil } from './pages/acceuil/acceuil';
import { SalesComponent } from './pages/ventes/ventes';
import { ChargesComponent } from './pages/charges/charges';
import { Connexion } from './pages/auth-user/connexion/connexion';
import { Inscription } from './pages/auth-user/inscription/inscription';
import { MotDePasseOublie } from './pages/auth-user/mot-de-passe-oublie/mot-de-passe-oublie';
import { Parametres } from './pages/parametres/parametres';
import { BanqueFiscalite } from './pages/banque-fiscalite/banque-fiscalite';
import { Landing } from './pages/landing/landing';
import {CatalogueStocks} from './refractor/catalogue-stocks/catalogue-stocks';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'dashboard', component: Acceuil },
  { path: 'catalogue', component: CatalogueStocks },
  { path: 'ventes', component: SalesComponent },
  { path: 'charges', component: ChargesComponent },
  { path: 'connexion', component: Connexion },
  { path: 'inscription', component: Inscription },
  { path: 'mot-de-passe-oublie', component: MotDePasseOublie },
  { path: 'parametres', component: Parametres },
  {path: 'banque-fiscalite', component:BanqueFiscalite},
  { path: '**', redirectTo: '' }
];