import { Injectable, signal, inject } from '@angular/core';
import { DocumentApiService } from '../../api/document/document-api.service';
import {
  DocumentBootstrapDTO,
  LigneHistoriqueDTO,
  DocumentResponseDTO,
  CreateDocumentPretRequest,
  CreateDocumentFiscalRequest,
} from '../../../models/DTO/DocumentDto';

@Injectable({
  providedIn: 'root',
})
export class DocumentStoreService {
  private readonly documentApi = inject(DocumentApiService);

  // État global
  readonly bootstrapData = signal<DocumentBootstrapDTO | null>(null);
  readonly isLoadingBootstrap = signal(false);
  readonly isCreating = signal(false);
  readonly error = signal<string | null>(null);

  // Historique (mis à jour à la demande)
  readonly historique = signal<LigneHistoriqueDTO[]>([]);
  readonly isLoadingHistorique = signal(false);

  // Dernier document créé
  readonly lastCreatedDocument = signal<DocumentResponseDTO | null>(null);

  /**
   * Charge les données de base pour le formulaire (catalogues, profil, stock, etc.).
   */
  async loadBootstrap(dureeHistorique: number = 6): Promise<void> {
    this.isLoadingBootstrap.set(true);
    this.error.set(null);
    try {
      const data = await this.documentApi.getBootstrap(dureeHistorique);
      this.bootstrapData.set(data);
      // Le bootstrap contient déjà l'historique par défaut
      if (data.historique) {
        this.historique.set(data.historique);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement du bootstrap document', err);
      this.error.set('Impossible de charger les données requises pour le formulaire.');
    } finally {
      this.isLoadingBootstrap.set(false);
    }
  }

  /**
   * Permet de rafraîchir l'historique si la durée change (ex: de 6 à 12 mois).
   */
  async reloadHistorique(dureeHistorique: number): Promise<void> {
    this.isLoadingHistorique.set(true);
    this.error.set(null);
    try {
      const hist = await this.documentApi.getHistorique(dureeHistorique);
      this.historique.set(hist);
    } catch (err: any) {
      console.error('Erreur lors du rechargement de l\'historique', err);
      this.error.set('Impossible de rafraîchir l\'historique.');
    } finally {
      this.isLoadingHistorique.set(false);
    }
  }

  async creerDocumentPret(request: CreateDocumentPretRequest): Promise<DocumentResponseDTO | null> {
    this.isCreating.set(true);
    this.error.set(null);
    try {
      const doc = await this.documentApi.createPret(request);
      this.lastCreatedDocument.set(doc);
      return doc;
    } catch (err: any) {
      console.error('Erreur création document prêt', err);
      this.error.set('Échec de la création du document de prêt.');
      return null;
    } finally {
      this.isCreating.set(false);
    }
  }

  async creerDocumentFiscal(request: CreateDocumentFiscalRequest): Promise<DocumentResponseDTO | null> {
    this.isCreating.set(true);
    this.error.set(null);
    try {
      const doc = await this.documentApi.createFiscal(request);
      this.lastCreatedDocument.set(doc);
      return doc;
    } catch (err: any) {
      console.error('Erreur création document fiscal', err);
      this.error.set('Échec de la création de la déclaration fiscale.');
      return null;
    } finally {
      this.isCreating.set(false);
    }
  }
}
