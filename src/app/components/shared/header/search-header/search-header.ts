import { Component, ElementRef, HostListener, inject, model, signal } from '@angular/core';
import {PreferencesService} from '../../../../service/app/preference/preferences';
import { GlobalSearchApiService } from '../../../../service/api/search/global-search-api.service';
import type { GlobalSearchResultDTO, NavigationSearchData } from '../../../../models/DTO/GlobalSearchDto';
import type { ProductApiDto } from '../../../../models/DTO/ProductDto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-header',
  imports: [],
  templateUrl: './search-header.html',
  styleUrl: './search-header.css',
})
export class SearchHeader {
  protected readonly prefs = inject(PreferencesService);
  private readonly searchApi = inject(GlobalSearchApiService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  readonly searchTerm = signal('');
  searchPopupOpen = model(false);
  readonly searchResults = this.searchApi.results;
  readonly isLoading = this.searchApi.isLoading;
  readonly searchError = this.searchApi.error;
  readonly desktopPosition = signal({ left: 0, top: 0, width: 0 });

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.searchApi.searchDebounced(value);
    this.updateDesktopPosition();
  }

  openResult(result: GlobalSearchResultDTO): void {
    this.searchTerm.set('');
    this.searchApi.clear();
    this.searchPopupOpen.set(false);

    if (result.type === 'PRODUCT') {
      const product = this.asProduct(result.data);
      void this.router.navigate(['/catalogue', product?.reference ?? result.id]);
      return;
    }
    if (result.type === 'SALE') {
      void this.router.navigate(['/ventes', result.id]);
      return;
    }
    if (result.type === 'CHARGE') {
      void this.router.navigate(['/charges'], { queryParams: { viewId: result.id } });
      return;
    }
    if (result.type === 'URL') {
      const data = this.asNavigationData(result.data);
      const url = data?.url ?? data?.path;
      if (url) void this.router.navigateByUrl(url);
      return;
    }
    if (result.type === 'PARAM') {
      const data = this.asNavigationData(result.data);
      void this.router.navigate(['/parametres'], {
        queryParams: { section: data?.section ?? data?.parameter ?? 'general' },
      });
    }
  }

  resultTitle(result: GlobalSearchResultDTO): string {
    const data = this.asRecord(result.data);
    if (result.type === 'PRODUCT') return String(data?.['name'] ?? 'Produit');
    if (result.type === 'SALE') return `Vente #${result.id}`;
    if (result.type === 'CHARGE') return String(data?.['label'] ?? 'Charge');
    return String(data?.['title'] ?? data?.['label'] ?? data?.['url'] ?? 'Navigation');
  }

  resultSubtitle(result: GlobalSearchResultDTO): string {
    const data = this.asRecord(result.data);
    if (result.type === 'PRODUCT') {
      return `${String(data?.['reference'] ?? '')} · ${String(data?.['categories']?.[0]?.['name'] ?? 'Produit')}`;
    }
    if (result.type === 'SALE') {
      return `${String(data?.['customerName'] ?? 'Client comptant')} · ${this.formatAmount(data?.['totalAmount'])}`;
    }
    if (result.type === 'CHARGE') {
      return `${String(data?.['supplier'] ?? 'Sans fournisseur')} · ${this.formatAmount(data?.['amount'])}`;
    }
    return String(data?.['section'] ?? data?.['path'] ?? data?.['url'] ?? '');
  }

  resultIcon(type: string): string {
    return {
      PRODUCT: 'inventory_2',
      SALE: 'receipt_long',
      CHARGE: 'payments',
      URL: 'link',
      PARAM: 'settings',
    }[type] ?? 'search';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.searchTerm.set('');
      this.searchApi.clear();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateDesktopPosition();
  }

  private updateDesktopPosition(): void {
    const search = this.elementRef.nativeElement.querySelector('.bk-header-search--desktop') as HTMLElement | null;
    if (!search) return;
    const rect = search.getBoundingClientRect();
    this.desktopPosition.set({ left: rect.left, top: rect.bottom + 6, width: rect.width });
  }

  private asRecord(value: unknown): Record<string, any> | null {
    return typeof value === 'object' && value !== null ? value as Record<string, any> : null;
  }

  private asProduct(value: unknown): ProductApiDto | null {
    const data = this.asRecord(value);
    return data ? data as ProductApiDto : null;
  }

  private asNavigationData(value: unknown): NavigationSearchData {
    if (typeof value === 'string') return { url: value };
    const data = this.asRecord(value);
    return data ? data as NavigationSearchData : {};
  }

  private formatAmount(value: unknown): string {
    return typeof value === 'number' ? value.toLocaleString('fr-FR') : '';
  }
}
