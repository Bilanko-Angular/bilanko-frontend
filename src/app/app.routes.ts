import { Routes } from '@angular/router';

import { Acceuil } from './pages/acceuil/acceuil';
import { SalesComponent } from './pages/ventes/ventes';
import { ChargesComponent } from './pages/charges/charges';
import { CatalogueStocks } from './pages/catalogue-stocks/catalogue-stocks';
import { Connexion } from './pages/auth-user/connexion/connexion';
import { Inscription } from './pages/auth-user/inscription/inscription';

export const routes: Routes = [

  // ============================================================
  // ACCUEIL
  // ============================================================

  {
    path: '',
    component: Acceuil
  },


  // ============================================================
  // CATALOGUE
  // ============================================================

  {
    path: 'catalogue',
    component: CatalogueStocks
  },


  // ============================================================
  // VENTES
  // ============================================================

  {
    path: 'ventes',
    component: SalesComponent
  },


  // ============================================================
  // CHARGES
  // ============================================================

  {
    path: 'charges',
    component: ChargesComponent
  },


  // ============================================================
  // AUTHENTIFICATION
  // ============================================================

  {
    path: 'connexion',
    component: Connexion
  },

  {
    path: 'inscription',
    component: Inscription
  },


  // ============================================================
  // ROUTE INCONNUE
  // ============================================================

  {
    path: '**',
    redirectTo: ''
  }

];