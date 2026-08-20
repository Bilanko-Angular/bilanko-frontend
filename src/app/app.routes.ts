import { Routes } from '@angular/router';
import { Acceuil } from './pages/acceuil/acceuil';
import { SalesComponent } from './pages/ventes/ventes';
import { ChargesComponent } from './pages/charges/charges';
import path from 'path';
import { Component } from '@angular/core';
import { CatalogueStocks } from './pages/catalogue-stocks/catalogue-stocks';
import { BanqueFiscalite } from './pages/banque-fiscalite/banque-fiscalite';

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
  path:"catalogue",  component:CatalogueStocks
 },
 { path: 'banque-fiscalite', component: BanqueFiscalite },
];