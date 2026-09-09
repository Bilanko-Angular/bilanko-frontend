import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { Template } from '../../../components/shared/template/template';
import { PreferencesService } from '../../../services/preferences';
import { VenteStoreService } from '../../../service/store/vente/vente-store.service';
import type { Sale } from '../../../models/sale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-vente-detail',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, Template],
  templateUrl: './vente-detail.html',
  styleUrl: './vente-detail.css',
})
export class VenteDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(VenteStoreService);
  protected readonly prefs = inject(PreferencesService);

  readonly sale = signal<Sale | undefined>(undefined);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    void this.loadSale();
  }

  private async loadSale(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    this.isLoading.set(true);
    if (!id) {
      this.sale.set(undefined);
      this.isLoading.set(false);
      return;
    }
    this.sale.set(await this.store.getById(id));
    this.isLoading.set(false);
  }

  retour(): void {
    this.router.navigate(['/ventes']);
  }

  telechargerFacture(): void {
    const s = this.sale();
    if (!s) return;

    const doc = new jsPDF();
    const currency = this.prefs.currency();
    const dateStr = new Date(s.saleDate).toLocaleString('fr-FR');
    const client = s.customerName || this.prefs.t().comptantClient;

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('Bilanko — Facture', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`N° ${s.id}`, 14, 28);
    doc.text(`Date : ${dateStr}`, 14, 34);
    doc.text(`Client : ${client}`, 14, 40);

    const colonnes = [
      this.prefs.t().product,
      this.prefs.t().quantity,
      `P.U. (${currency})`,
      `Total (${currency})`,
    ];
    const donnees = s.items.map((item) => [
      item.productName,
      item.quantity.toString(),
      item.unitSellingPrice.toLocaleString('fr-FR'),
      (item.unitSellingPrice * item.quantity).toLocaleString('fr-FR'),
    ]);

    autoTable(doc, {
      startY: 48,
      head: [colonnes],
      body: donnees,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `${this.prefs.t().totalAmount} : ${s.totalAmount.toLocaleString('fr-FR')} ${currency}`,
      14,
      finalY
    );
    doc.text(
      `${this.prefs.t().simplifiedMargin} : ${(s.totalMargin ?? 0).toLocaleString('fr-FR')} ${currency}`,
      14,
      finalY + 7
    );

    const safeClient = client.replace(/\s+/g, '-').toLowerCase();
    doc.save(`facture-${safeClient}-${s.id}.pdf`);
  }
}
