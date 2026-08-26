import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DemandeDossier, REGIMES_FISCAUX } from '../models/document-fiscal';

const VERT_FONCE: [number, number, number] = [46, 95, 69];
const VERT_BILANKO: [number, number, number] = [99, 183, 141];
const ANTHRACITE: [number, number, number] = [43, 43, 40];
const GRIS: [number, number, number] = [107, 107, 101];
const VERT_SUBTLE: [number, number, number] = [228, 238, 232];

// jsPDF utilise les polices standard (Helvetica) qui ne supportent pas
// l'espace fine insécable que `toLocaleString('fr-FR')` insère entre les
// milliers — ça s'affichait comme des barres "/" dans le PDF. On formate
// donc les montants nous-mêmes avec un espace normal.
function formatFCFA(montant: number): string {
  const arrondi = Math.round(montant);
  const negatif = arrondi < 0;
  const chiffres = Math.abs(arrondi).toString();
  const groupes: string[] = [];
  for (let i = chiffres.length; i > 0; i -= 3) {
    groupes.unshift(chiffres.slice(Math.max(0, i - 3), i));
  }
  return `${negatif ? '-' : ''}${groupes.join(' ')} FCFA`;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  // Même taux indicatif que dans banque-fiscalite.ts, dupliqué ici pour que
  // le PDF reste cohérent avec ce qui est affiché à l'écran.
  private readonly TAUX_ENDETTEMENT_INDICATIF = 0.33;

  /**
   * Génère le dossier PDF entièrement côté navigateur (comme l'export du
   * catalogue) : pas de backend nécessaire, résultat immédiat.
   */
  genererDossier(demande: DemandeDossier): Blob {
    const doc = new jsPDF();
    const largeur = doc.internal.pageSize.getWidth();
    const dateGeneration = new Date().toLocaleDateString('fr-FR');

    this.entete(doc, demande, largeur, dateGeneration);

    let y = 46;
    y = this.sectionIdentification(doc, demande, y);

    if (demande.type === 'pret_bancaire' && demande.pretBancaire) {
      y = this.sectionPret(doc, demande, y);
    } else if (demande.type === 'dsf_smt' && demande.dsf) {
      y = this.sectionDsf(doc, demande, y);
    }

    y = this.sectionHistorique(doc, demande, y);
    this.sectionSignature(doc, y);
    this.piedDePage(doc);

    return doc.output('blob');
  }

  private entete(doc: jsPDF, demande: DemandeDossier, largeur: number, dateGeneration: string) {
    doc.setFillColor(...VERT_FONCE);
    doc.rect(0, 0, largeur, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('BILANKO', 14, 14);
    doc.setFontSize(8.5);
    doc.text('Gestion financière pour commerçants', 14, 20);

    const titre =
      demande.type === 'pret_bancaire'
        ? 'DOSSIER DE DEMANDE DE PRÊT BANCAIRE'
        : 'DÉCLARATION FISCALE SIMPLIFIÉE';
    doc.setFontSize(11.5);
    doc.text(titre, largeur - 14, 14, { align: 'right' });
    doc.setFontSize(8);
    doc.text(`Généré le ${dateGeneration}`, largeur - 14, 20, { align: 'right' });

    doc.setTextColor(...ANTHRACITE);
  }

  private sectionTitre(doc: jsPDF, texte: string, y: number): number {
    doc.setFillColor(...VERT_BILANKO);
    doc.rect(14, y, 3, 6, 'F');
    doc.setFontSize(11);
    doc.setTextColor(...ANTHRACITE);
    doc.text(texte, 20, y + 5);
    return y + 11;
  }

  private sectionIdentification(doc: jsPDF, demande: DemandeDossier, y: number): number {
    y = this.sectionTitre(doc, 'IDENTIFICATION DU COMMERÇANT', y);
    const c = demande.commercant;
    const regimeLabels: Record<string, string> = Object.fromEntries(
      REGIMES_FISCAUX.map((r) => [r.id, r.label])
    );

    const body: string[][] = [
      ['Raison sociale / Nom', c.raisonSociale],
      ['Activité', c.activite],
      ['Adresse', c.adresse],
      ["Numéro d'Identifiant Unique (NIU)", c.niu],
      ["Date de création de l'activité", c.dateCreation],
    ];

    // Le régime fiscal n'a de sens que pour une déclaration fiscale
    if (c.regimeFiscal) {
      body.splice(4, 0, ['Régime fiscal', regimeLabels[c.regimeFiscal] ?? c.regimeFiscal]);
    }

    autoTable(doc, {
      startY: y,
      theme: 'plain',
      styles: { fontSize: 9.5, cellPadding: 1.4 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 58 }, 1: { cellWidth: 'auto' } },
      body,
    });

    return (doc as any).lastAutoTable.finalY + 7;
  }

  private sectionPret(doc: jsPDF, demande: DemandeDossier, y: number): number {
    const p = demande.pretBancaire!;
    y = this.sectionTitre(doc, 'CAPITAL & BESOIN DE FINANCEMENT', y);

    const totalCA = demande.historique.reduce((s, l) => s + l.chiffreAffaires, 0);
    const caMoyenMensuel = totalCA / (demande.historique.length || 1);
    const capaciteMensuelle = caMoyenMensuel * this.TAUX_ENDETTEMENT_INDICATIF;
    const montantMaxIndicatif = capaciteMensuelle * p.dureeMois;

    autoTable(doc, {
      startY: y,
      theme: 'plain',
      styles: { fontSize: 9.5, cellPadding: 1.4 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 58 }, 1: { cellWidth: 'auto' } },
      body: [
        ['Capital propre / apport personnel', formatFCFA(p.capitalPropre)],
        ['Stock disponible (garantie potentielle)', formatFCFA(demande.stockDisponible)],
        ['Objet du prêt', p.objetPret],
        ['Montant du prêt demandé', formatFCFA(p.montantDemande)],
        ['Durée souhaitée', `${p.dureeMois} mois`],
        ['Garanties proposées', p.garanties || 'Non précisé'],
      ],
    });

    let finY = (doc as any).lastAutoTable.finalY + 4;
    // doc.setFontSize(7.5);
    // doc.setTextColor(...GRIS);
    // doc.text(
    //   '* Estimation indicative (mensualite <= ~33% du CA mensuel moyen). Chaque banque applique ses propres criteres.',
    //   14,
    //   finY
    // );

    return finY + 9;
  }

  private sectionDsf(doc: jsPDF, demande: DemandeDossier, y: number): number {
    const d = demande.dsf!;
    y = this.sectionTitre(doc, 'INFORMATIONS FISCALES', y);

    autoTable(doc, {
      startY: y,
      theme: 'plain',
      styles: { fontSize: 9.5, cellPadding: 1.4 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 58 }, 1: { cellWidth: 'auto' } },
      body: [
        ['Exercice fiscal', d.exerciceFiscal],
        ["Centre des impôts de rattachement", d.centreImpots],
        ["Chiffre d'affaires déclaré", formatFCFA(d.chiffreAffairesAnnuelEstime)],
      ],
    });

    return (doc as any).lastAutoTable.finalY + 7;
  }

  private sectionHistorique(doc: jsPDF, demande: DemandeDossier, y: number): number {
    y = this.sectionTitre(doc, `HISTORIQUE D'ACTIVITÉ (${demande.dureeHistorique} MOIS)`, y);

    const totalCA = demande.historique.reduce((s, l) => s + l.chiffreAffaires, 0);
    const totalAchats = demande.historique.reduce((s, l) => s + l.achatsCharges, 0);

    const corps = demande.historique.map((l) => [
      l.mois,
      formatFCFA(l.chiffreAffaires),
      formatFCFA(l.achatsCharges),
      formatFCFA(l.chiffreAffaires - l.achatsCharges),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Mois', "Chiffre d'affaires", 'Achats / Charges', 'Marge brute']],
      body: corps,
      foot: [[
        'TOTAL',
        formatFCFA(totalCA),
        formatFCFA(totalAchats),
        formatFCFA(totalCA - totalAchats),
      ]],
      theme: 'striped',
      headStyles: { fillColor: VERT_FONCE },
      footStyles: { fillColor: VERT_SUBTLE, textColor: ANTHRACITE, fontStyle: 'bold' },
      styles: { fontSize: 8.5 },
    });

    let finY = (doc as any).lastAutoTable.finalY + 5;
    doc.setFontSize(7.5);
    doc.setTextColor(...GRIS);
    doc.text(
      "* Marge brute = chiffre d'affaires - charges enregistrées dans Bilanko (hors salaire, impots, charges non declarees).",
      14,
      finY
    );

    return finY + 8;
  }

  private sectionSignature(doc: jsPDF, y: number) {
    if (y > 245) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(9);
    doc.setTextColor(...GRIS);
    doc.text('Fait à ______________________, le ______________________', 14, y + 8);
    doc.line(14, y + 24, 80, y + 24);
    doc.text('Signature du commerçant', 14, y + 29);
  }

  private piedDePage(doc: jsPDF) {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      const largeur = doc.internal.pageSize.getWidth();
      const hauteur = doc.internal.pageSize.getHeight();
      doc.setFontSize(7.5);
      doc.setTextColor(...GRIS);
      doc.text('Document généré via Bilanko — à vérifier avant dépôt officiel.', 14, hauteur - 10);
      doc.text(`Page ${i}/${pages}`, largeur - 14, hauteur - 10, { align: 'right' });
    }
  }
}