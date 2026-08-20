// src/app/services/document.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DemandeDossierFiscal } from '../models/document-fiscal';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.serverUrl}/api/documents/dossier-fiscal`;

  genererDossier(demande: DemandeDossierFiscal) {
    return this.http.post(this.url, demande, { responseType: 'blob' });
  }
}