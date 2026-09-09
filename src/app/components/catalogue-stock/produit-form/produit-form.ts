import {
  Component,
  input,
  output,
  effect,
  signal,
  inject,
  computed,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Produit } from '../../../models/produit';
import { PreferencesService } from '../../../services/preferences';
import { CategoryApiService } from '../../../service/api/product/category-api.service';
import { AiProductApiService } from '../../../service/api/product/ai-product-api.service';
import { CategorieOption } from '../../../components/catalogue-stock/product-filter-dropdown/product-filter-dropdown';
import { CreateProduitPayload } from '../../../models/DTO/payload/ProductPayload';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './produit-form.html',
  styleUrl: './produit-form.css',
})
export class ProduitForm {
  protected readonly prefs = inject(PreferencesService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly aiApi = inject(AiProductApiService);

  // ─── I/O ────────────────────────────────────────────────────────────────────
  readonly produit = input<Produit | undefined>(undefined);
  readonly enregistrer = output<CreateProduitPayload>();
  readonly annuler = output<void>();

  // ─── Champs du formulaire ────────────────────────────────────────────────────
  readonly nom = signal('');
  readonly quantiteStock = signal(0);
  readonly seuilAlerte = signal(5);
  readonly prixAchat = signal(0);
  readonly prixVente = signal(0);

  // ─── Catégories ─────────────────────────────────────────────────────────────
  readonly categoriesSelectionnees = signal<CategorieOption[]>([]);
  readonly categorieSearchQuery = signal('');
  readonly categoriesSuggestions = signal<CategorieOption[]>([]);
  readonly categorieDropdownOpen = signal(false);
  readonly categorieLoading = signal(false);

  // ─── IA Image ────────────────────────────────────────────────────────────────
  readonly aiImageLoading = signal(false);
  readonly aiImageError = signal<string | null>(null);

  // ─── IA Voice ────────────────────────────────────────────────────────────────
  readonly aiVoiceLoading = signal(false);
  readonly aiVoiceError = signal<string | null>(null);
  readonly isRecording = signal(false);
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: BlobPart[] = [];

  constructor() {
    effect(() => {
      const p = this.produit();
      if (p) {
        this.nom.set(p.nom);
        this.quantiteStock.set(p.quantiteStock);
        this.seuilAlerte.set(p.seuilAlerte);
        this.prixAchat.set(p.prixAchat);
        this.prixVente.set(p.prixVente);
        // On n'a pas les IDs des catégories dans le modèle Produit existant
        this.categoriesSelectionnees.set([]);
      } else {
        this.reinitialiser();
      }
    });
  }

  // ─── Catégories ─────────────────────────────────────────────────────────────

  async onCategorieSearchInput(query: string) {
    this.categorieSearchQuery.set(query);
    if (query.trim().length < 1) {
      this.categoriesSuggestions.set([]);
      return;
    }
    this.categorieLoading.set(true);
    try {
      const results = await this.categoryApi.search(query.trim());
      // Exclure déjà sélectionnées
      const selectedIds = this.categoriesSelectionnees().map((c) => c.id);
      this.categoriesSuggestions.set(results.filter((c) => !selectedIds.includes(c.id)));
    } catch {
      this.categoriesSuggestions.set([]);
    } finally {
      this.categorieLoading.set(false);
    }
  }

  selectCategorie(cat: CategorieOption) {
    this.categoriesSelectionnees.update((list) => [...list, cat]);
    this.categorieSearchQuery.set('');
    this.categoriesSuggestions.set([]);
  }

  removeCategorie(catId: number) {
    this.categoriesSelectionnees.update((list) => list.filter((c) => c.id !== catId));
  }

  // ─── IA Image ────────────────────────────────────────────────────────────────

  triggerImageInput() {
    const input = document.getElementById('ai-image-input') as HTMLInputElement;
    input?.click();
  }

  async onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.aiImageLoading.set(true);
    this.aiImageError.set(null);
    try {
      const desc = await this.aiApi.recognizeFromImage(file);
      this.nom.set(desc.name ?? '');
      this.quantiteStock.set(desc.quantity ?? 0);
      this.prixAchat.set(desc.purchasePrice ?? 0);
      this.prixVente.set(desc.price ?? 0);
      if (desc.categoryDTOS?.length) {
        this.categoriesSelectionnees.set(
          desc.categoryDTOS.map((c) => ({ id: c.id, name: c.name }))
        );
      }
    } catch (e) {
      this.aiImageError.set("Impossible de reconnaître le produit depuis l'image.");
    } finally {
      this.aiImageLoading.set(false);
      // Reset input pour permettre de resélectionner le même fichier
      (event.target as HTMLInputElement).value = '';
    }
  }

  // ─── IA Voice ────────────────────────────────────────────────────────────────

  async toggleRecording() {
    if (this.isRecording()) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  private async startRecording() {
    this.aiVoiceError.set(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.sendVoice(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      this.mediaRecorder.start();
      this.isRecording.set(true);
    } catch {
      this.aiVoiceError.set('Accès au microphone refusé.');
    }
  }

  private stopRecording() {
    this.mediaRecorder?.stop();
    this.isRecording.set(false);
  }

  private async sendVoice(blob: Blob) {
    this.aiVoiceLoading.set(true);
    try {
      const desc = await this.aiApi.recognizeFromVoice(blob);
      this.nom.set(desc.name ?? '');
      this.quantiteStock.set(desc.quantity ?? 0);
      this.prixAchat.set(desc.purchasePrice ?? 0);
      this.prixVente.set(desc.price ?? 0);
      if (desc.categoryDTOS?.length) {
        this.categoriesSelectionnees.set(
          desc.categoryDTOS.map((c) => ({ id: c.id, name: c.name }))
        );
      }
    } catch {
      this.aiVoiceError.set("Impossible de reconnaître le produit depuis la voix.");
    } finally {
      this.aiVoiceLoading.set(false);
    }
  }

  // ─── Soumission ──────────────────────────────────────────────────────────────

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.enregistrer.emit({
      nom: this.nom().trim(),
      quantiteStock: Number(this.quantiteStock()),
      prixVente: Number(this.prixVente()),
      prixAchat: Number(this.prixAchat()),
      seuilAlerte: Number(this.seuilAlerte()),
      idCategories: this.categoriesSelectionnees().map((c) => c.id),
    });
  }

  fermer() {
    this.annuler.emit();
  }

  private reinitialiser() {
    this.nom.set('');
    this.quantiteStock.set(0);
    this.seuilAlerte.set(5);
    this.prixAchat.set(0);
    this.prixVente.set(0);
    this.categoriesSelectionnees.set([]);
    this.categorieSearchQuery.set('');
    this.categoriesSuggestions.set([]);
    this.aiImageError.set(null);
    this.aiVoiceError.set(null);
  }
}