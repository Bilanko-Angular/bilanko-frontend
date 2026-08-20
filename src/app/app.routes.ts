// src/app/app.routes.ts - Vérifier que les routes sont correctes
import { Routes } from '@angular/router';
import { Acceuil } from './pages/acceuil/acceuil';
import { SalesComponent } from './pages/ventes/ventes';
import { ChargesComponent } from './pages/charges/charges';
import { CatalogueStocks } from './pages/catalogue-stocks/catalogue-stocks';
import { Connexion } from './pages/auth-user/connexion/connexion';
import { Inscription } from './pages/auth-user/inscription/inscription';
import { MotDePasseOublie } from './pages/auth-user/mot-de-passe-oublie/mot-de-passe-oublie';

export const routes: Routes = [
  { path: '', component: Acceuil },
  { path: 'catalogue', component: CatalogueStocks },
  { path: 'ventes', component: SalesComponent },
  { path: 'charges', component: ChargesComponent },
  { path: 'connexion', component: Connexion },
  { path: 'inscription', component: Inscription },
  { path: 'mot-de-passe-oublie', component: MotDePasseOublie },
  { path: '**', redirectTo: '' }
];