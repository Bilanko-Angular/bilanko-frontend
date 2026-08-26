import { Injectable, signal, computed, inject } from '@angular/core';
import { ChargeApiService } from '../../api/charge/charge-api.service';
import { ChargeMapper } from '../../../mapper/ChargeMapper';
import type { Charge } from '../../../models/finance';

@Injectable({
  providedIn: 'root',
})
export class ChargeStoreService {
  private readonly chargeApi = inject(ChargeApiService);

  // --- État central ---
  private readonly _charges = signal<Charge[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // --- Barre de recherche (liée au rechargement backend) ---
  readonly searchTerm = signal<string>('');

  // --- Exposition en lecture seule ---
  readonly charges = this._charges.asReadonly();

  /** Charges filtrées côté front selon le searchTerm (après chargement backend) */
  readonly filteredCharges = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this._charges();
    return this._charges().filter(
      (c) =>
        c.label.toLowerCase().includes(term) ||
        (c.supplier ?? '').toLowerCase().includes(term)
    );
  });

  constructor() {
    this.loadAll();
  }

  // ──────────────────────────────────────────
  // Lecture
  // ──────────────────────────────────────────

  /** Charge toutes les charges depuis le backend */
  async loadAll(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const dtos = await this.chargeApi.getAllCharges();
      this._charges.set(ChargeMapper.fromResponseDTOList(dtos));
    } catch (err) {
      console.error('ChargeStore: erreur lors du chargement', err);
      this.error.set('Impossible de charger les charges.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ──────────────────────────────────────────
  // Création
  // ──────────────────────────────────────────

  async add(charge: Omit<Charge, 'id'>): Promise<void> {
    const dto = ChargeMapper.toRequestDTO(charge);
    try {
      const created = await this.chargeApi.createCharge(dto);
      this._charges.update((list) => [...list, ChargeMapper.fromResponseDTO(created)]);
    } catch (err) {
      console.error('ChargeStore: erreur lors de la création', err);
      this.error.set('Impossible de créer la charge.');
    }
  }

  // ──────────────────────────────────────────
  // Mise à jour
  // ──────────────────────────────────────────

  async update(id: string, charge: Omit<Charge, 'id'>): Promise<void> {
    const numericId = Number(id);
    const dto = ChargeMapper.toRequestDTO(charge);
    try {
      const updated = await this.chargeApi.updateCharge(numericId, dto);
      this._charges.update((list) =>
        list.map((c) => (c.id === id ? ChargeMapper.fromResponseDTO(updated) : c))
      );
    } catch (err) {
      console.error('ChargeStore: erreur lors de la mise à jour', err);
      this.error.set('Impossible de mettre à jour la charge.');
    }
  }

  // ──────────────────────────────────────────
  // Suppression
  // ──────────────────────────────────────────

  async delete(id: string): Promise<void> {
    const numericId = Number(id);
    try {
      await this.chargeApi.deleteCharge(numericId);
      this._charges.update((list) => list.filter((c) => c.id !== id));
    } catch (err) {
      console.error('ChargeStore: erreur lors de la suppression', err);
      this.error.set('Impossible de supprimer la charge.');
    }
  }

  // ──────────────────────────────────────────
  // Utilitaires
  // ──────────────────────────────────────────

  /** Mise à jour du terme de recherche */
  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }
}
