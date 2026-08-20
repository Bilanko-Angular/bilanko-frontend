import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentService } from '../../services/document.service';
import { Template } from '../../components/shared/template/template';
import {
  DOCUMENTS_DISPONIBLES,
  TypeDocumentFiscal,
  DemandeDossierFiscal,
} from '../../models/document-fiscal';

@Component({
  selector: 'app-banque-fiscalite',
  standalone: true,
  imports: [FormsModule, Template],
  templateUrl: './banque-fiscalite.html',
  styleUrl: './banque-fiscalite.css',
})
export class BanqueFiscalite {
  private readonly documentService = inject(DocumentService);
  private readonly destroyRef = inject(DestroyRef);

  readonly documentsDisponibles = DOCUMENTS_DISPONIBLES;
  readonly etape = signal<1 | 2 | 3>(1);

  readonly documentsSelectionnes = signal<Set<TypeDocumentFiscal>>(new Set());
  readonly format = signal<'A4' | 'Legal'>('A4');
  readonly periodeDebut = signal('');
  readonly periodeFin = signal('');

  readonly genereEnCours = signal(false);
  readonly erreurGeneration = signal<string | null>(null);

  // Les objets complets des documents cochés, pour l'affichage du récapitulatif
  readonly documentsChoisis = computed(() =>
    this.documentsDisponibles.filter((d) => this.documentsSelectionnes().has(d.id))
  );

  readonly peutContinuerEtape2 = computed(() => this.documentsSelectionnes().size > 0);
  readonly peutGenerer = computed(
    () => this.documentsSelectionnes().size > 0 && !!this.periodeDebut() && !!this.periodeFin()
  );

  etapeSuivante() {
    if (this.etape() === 2 && !this.peutContinuerEtape2()) return;
    this.etape.update((e) => (e < 3 ? ((e + 1) as 1 | 2 | 3) : e));
  }
  etapePrecedente() {
    this.etape.update((e) => (e > 1 ? ((e - 1) as 1 | 2 | 3) : e));
  }
  allerA(e: 1 | 2 | 3) {
    if (e === 3 && !this.peutContinuerEtape2()) return;
    this.etape.set(e);
  }

  estSelectionne(id: TypeDocumentFiscal): boolean {
    return this.documentsSelectionnes().has(id);
  }

  toggleDocument(id: TypeDocumentFiscal) {
    this.documentsSelectionnes.update((ensemble) => {
      const copie = new Set(ensemble);
      copie.has(id) ? copie.delete(id) : copie.add(id);
      return copie;
    });
  }

  genererDossier() {
    if (!this.peutGenerer()) return;

    const demande: DemandeDossierFiscal = {
      documents: [...this.documentsSelectionnes()],
      format: this.format(),
      periodeDebut: this.periodeDebut(),
      periodeFin: this.periodeFin(),
    };

    this.genereEnCours.set(true);
    this.erreurGeneration.set(null);

    this.documentService
      .genererDossier(demande)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pdfBlob) => {
          const url = URL.createObjectURL(pdfBlob);
          const lien = document.createElement('a');
          lien.href = url;
          lien.download = `dossier-fiscal-${demande.periodeDebut}-${demande.periodeFin}.pdf`;
          lien.click();
          URL.revokeObjectURL(url);
          this.genereEnCours.set(false);
        },
        error: () => {
          this.erreurGeneration.set('La génération du dossier a échoué. Vérifiez votre connexion et réessayez.');
          this.genereEnCours.set(false);
        },
      });
  }
}