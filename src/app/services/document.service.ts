import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DemandeDossier, REGIMES_FISCAUX } from '../models/document-fiscal';

type RGB = [number, number, number];

const VERT_FONCE: RGB = [46, 95, 69];
const OCRE: RGB = [201, 138, 61];
const ANTHRACITE: RGB = [43, 43, 40];
const GRIS: RGB = [110, 110, 105];
const GRIS_CLAIR: RGB = [235, 235, 231];
const BORDURE: RGB = [212, 212, 206];
const FOND_LEGER: RGB = [248, 248, 246];
const SURBRILLANCE: RGB = [228, 238, 232];

const MARGE = 16;
const LARGEUR_UTILE = 178; // A4 (210mm) - 2×16

function formatFCFA(montant: number): string {
  const arrondi = Math.round(montant || 0);
  const negatif = arrondi < 0;
  const chiffres = Math.abs(arrondi).toString();
  const groupes: string[] = [];
  for (let i = chiffres.length; i > 0; i -= 3) {
    groupes.unshift(chiffres.slice(Math.max(0, i - 3), i));
  }
  return `${negatif ? '-' : ''}${groupes.join(' ')} FCFA`;
}

function genererReference(): string {
  const d = new Date();
  const jour = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const suffixe = Math.floor(1000 + Math.random() * 9000);
  return `BLK-${jour}-${suffixe}`;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private logoBase64: string | null = null;
  private logoChargementPromise: Promise<string | null> | null = null;

  /**
   * Charge le logo depuis src/assets/images/logo.png. Mis en cache
   * après le premier appel. Si le fichier est absent, on bascule sans erreur
   * sur un badge "B" vectoriel.
   */
 private async chargerLogo(): Promise<string | null> {
    if (this.logoBase64) return this.logoBase64;
    if (this.logoChargementPromise) return this.logoChargementPromise;

    const cheminsPossibles = ['/assets/images/logo.png', '/images/logo.png', '/logo.png'];

    this.logoChargementPromise = (async () => {
      for (const chemin of cheminsPossibles) {
        try {
          const res = await fetch(chemin);
          if (!res.ok) continue;

          const blob = await res.blob();
          // Rejette tout ce qui n'est pas une vraie image (ex: HTML renvoyé
          // par le fallback SPA du dev-server pour une route inexistante).
          if (!blob.type.startsWith('image/')) continue;

          const base64 = await new Promise<string | null>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          });

          if (base64) {
            console.info(`[DocumentService] Logo chargé depuis ${chemin}`);
            this.logoBase64 = base64;
            return base64;
          }
        } catch {
          /* on essaie le chemin suivant */
        }
      }
      console.warn(
        `[DocumentService] Logo introuvable. Chemins testés : ${cheminsPossibles.join(', ')}.`
      );
      return null;
    })();

    return this.logoChargementPromise;
  }

  async genererDossier(demande: DemandeDossier): Promise<Blob> {
    const doc = new jsPDF();
    const dateGeneration = new Date().toLocaleDateString('fr-FR');
    const reference = genererReference();
    const logo = await this.chargerLogo();

    let y = this.entete(doc, demande, dateGeneration, reference, logo);
    y = this.sectionObjet(doc, demande, y);
    y = this.sectionIdentite(doc, demande, y);

    if (demande.type === 'pret_bancaire' && demande.pretBancaire) {
      y = this.sectionPret(doc, demande, y);
    } else if (demande.type === 'dsf_smt' && demande.dsf) {
      y = this.sectionDsf(doc, demande, y);
    }

    y = this.assurerEspace(doc, y, 78);
    y = this.sectionHistorique(doc, demande, y);

    y = this.assurerEspace(doc, y, 42);
    this.sectionSignature(doc, demande, y);

    this.piedDePage(doc, reference, logo);

    return doc.output('blob');
  }

  // ---------------------------------------------------------------------
  private assurerEspace(doc: jsPDF, y: number, hauteurNecessaire: number): number {
    const hauteurPage = doc.internal.pageSize.getHeight();
    if (hauteurPage - y < hauteurNecessaire) {
      doc.addPage();
      return 20;
    }
    return y;
  }

  private dessinerLogoVectoriel(doc: jsPDF, x: number, y: number, taille: number) {
    doc.setFillColor(...VERT_FONCE);
    doc.roundedRect(x, y, taille, taille, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(taille * 0.62);
    doc.text('B', x + taille / 2, y + taille * 0.72, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  }

  private ajouterLogo(doc: jsPDF, x: number, y: number, taille: number, logoBase64: string | null) {
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', x, y, taille, taille);
        return;
      } catch {
        /* on bascule sur le badge vectoriel ci-dessous */
      }
    }
    this.dessinerLogoVectoriel(doc, x, y, taille);
  }

  /** Titre de section avec petit repère carré coloré, plus soigné qu'un simple filet. */
  private sectionTitre(doc: jsPDF, texte: string, y: number): number {
    doc.setFillColor(...VERT_FONCE);
    doc.rect(MARGE, y - 3.2, 2.4, 5.6, 'F');
    doc.setFontSize(9.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...VERT_FONCE);
    doc.text(texte.toUpperCase(), MARGE + 5.5, y);
    doc.setDrawColor(...BORDURE);
    doc.setLineWidth(0.3);
    doc.line(MARGE, y + 2.5, MARGE + LARGEUR_UTILE, y + 2.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...ANTHRACITE);
    return y + 9;
  }

  /**
   * Tableau clé/valeur. `ligneAccent` (optionnel, index 0-based) surligne une
   * ligne en vert pâle pour mettre en évidence le chiffre le plus important
   * (ex: le montant du crédit demandé), comme le ferait un formulaire soigné.
   */
  private tableauCle(doc: jsPDF, y: number, body: string[][], ligneAccent?: number): number {
    autoTable(doc, {
      startY: y,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, lineColor: BORDURE, lineWidth: 0.2, textColor: ANTHRACITE },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 62, fillColor: FOND_LEGER, textColor: [80, 80, 75] },
        1: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (ligneAccent !== undefined && data.row.index === ligneAccent) {
          data.cell.styles.fillColor = data.column.index === 0 ? SURBRILLANCE : [237, 245, 240];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = VERT_FONCE;
        }
      },
      body,
    });
    return (doc as any).lastAutoTable.finalY + 8;
  }

  // ---------------------------------------------------------------------
  // Sections
  // ---------------------------------------------------------------------

  private entete(
    doc: jsPDF,
    demande: DemandeDossier,
    dateGeneration: string,
    reference: string,
    logoBase64: string | null
  ): number {
    const largeur = doc.internal.pageSize.getWidth();
    const hauteurBande = 30;

    doc.setFillColor(...VERT_FONCE);
    doc.rect(0, 0, largeur, hauteurBande, 'F');
    doc.setFillColor(...OCRE);
    doc.rect(0, hauteurBande, largeur, 1, 'F');

    this.ajouterLogo(doc, MARGE, 6.5, 17, logoBase64);

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('BILANKO', MARGE + 21, 14.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Gestion financière pour commerçants', MARGE + 21, 19.5);

    const titre =
      demande.type === 'pret_bancaire'
        ? 'DOSSIER DE DEMANDE DE PRÊT'
        : 'FICHE DE DÉCLARATION ET DE PAIEMENT FISCAL';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(titre, largeur - MARGE, 12, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Référence : ${reference}`, largeur - MARGE, 18, { align: 'right' });
    doc.text(`Établi le ${dateGeneration}`, largeur - MARGE, 22.5, { align: 'right' });

    doc.setTextColor(...ANTHRACITE);
    return hauteurBande + 11;
  }

  private sectionObjet(doc: jsPDF, demande: DemandeDossier, y: number): number {
    const texte =
      demande.type === 'pret_bancaire'
        ? `Objet : demande de crédit de ${formatFCFA(demande.pretBancaire?.montantDemande ?? 0)} sur ${demande.pretBancaire?.dureeMois ?? 0} mois, pour ${demande.pretBancaire?.objetPret || "financer l'activité"}.`
        : `Objet : déclaration et paiement de ${demande.dsf?.natureImpot || "l'impôt"} au titre de la période ${demande.dsf?.periodeDeclaration || ''}.`;

    doc.setFillColor(...FOND_LEGER);
    doc.setDrawColor(...BORDURE);
    doc.setLineWidth(0.2);
    const lignes = doc.splitTextToSize(texte, LARGEUR_UTILE - 10);
    const hauteur = lignes.length * 4.6 + 6;
    doc.roundedRect(MARGE, y, LARGEUR_UTILE, hauteur, 1.5, 1.5, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(...ANTHRACITE);
    doc.text(lignes, MARGE + 5, y + 6.5);

    return y + hauteur + 9;
  }

  private sectionIdentite(doc: jsPDF, demande: DemandeDossier, y: number): number {
    y = this.sectionTitre(doc, 'Identification du demandeur', y);
    const c = demande.commercant;
    const regimeLabels: Record<string, string> = Object.fromEntries(
      REGIMES_FISCAUX.map((r) => [r.id, r.label])
    );

    const body: string[][] = [
      ['Raison sociale / Nom', c.raisonSociale || '—'],
      ['Activité exercée', c.activite || '—'],
      ['Adresse du commerce', c.adresse || '—'],
      ["Numéro d'Identifiant Unique (NIU)", c.niu || '—'],
      ["Date de création de l'activité", c.dateCreation || '—'],
    ];
    if (c.regimeFiscal) {
      body.splice(4, 0, ['Régime fiscal', regimeLabels[c.regimeFiscal] ?? c.regimeFiscal]);
    }

    return this.tableauCle(doc, y, body);
  }

  private sectionPret(doc: jsPDF, demande: DemandeDossier, y: number): number {
    const p = demande.pretBancaire!;
    y = this.sectionTitre(doc, 'Situation financière et demande de crédit', y);

    const totalCA = demande.historique.reduce((s, l) => s + l.chiffreAffaires, 0);
    const caMoyenMensuel = totalCA / (demande.historique.length || 1);

    // Le "montant du crédit demandé" (index 4) est la ligne clé pour un
    // banquier : elle est mise en évidence dans le tableau plutôt que
    // signalée par une note de calcul séparée (voir explication précédente).
    return this.tableauCle(
      doc,
      y,
      [
        ["Chiffre d'affaires sur la période analysée", formatFCFA(totalCA)],
        ["Chiffre d'affaires moyen mensuel", formatFCFA(caMoyenMensuel)],
        ['Apport personnel / capital propre', formatFCFA(p.capitalPropre)],
        ['Valeur du stock disponible (garantie potentielle)', formatFCFA(demande.stockDisponible)],
        ['Montant du crédit demandé', formatFCFA(p.montantDemande)],
        ['Objet du crédit', p.objetPret || '—'],
        ['Durée souhaitée', `${p.dureeMois} mois`],
        ['Garanties proposées', p.garanties || 'Non précisé'],
      ],
      4
    );
  }

  private sectionDsf(doc: jsPDF, demande: DemandeDossier, y: number): number {
    const d = demande.dsf!;
    y = this.sectionTitre(doc, 'Détail de la déclaration et du paiement', y);

    return this.tableauCle(
      doc,
      y,
      [
        ['Exercice fiscal', d.exerciceFiscal || '—'],
        ["Centre des impôts de rattachement", d.centreImpots || '—'],
        ["Nature de l'impôt déclaré", d.natureImpot || '—'],
        ['Période concernée', d.periodeDeclaration || '—'],
        ["Chiffre d'affaires de la période", formatFCFA(d.chiffreAffairesPeriode)],
        ["Montant de l'impôt à payer", formatFCFA(d.montantImpot)],
        ["Date de paiement ou d'échéance", d.datePaiement || 'Non précisée'],
        ['Mode de paiement', d.moyenPaiement || 'Non précisé'],
        ['Référence de paiement / avis', d.referencePaiement || 'Non précisée'],
      ],
      5
    );
  }

  private sectionHistorique(doc: jsPDF, demande: DemandeDossier, y: number): number {
    y = this.sectionTitre(doc, `Historique du chiffre d'affaires (${demande.dureeHistorique} mois)`, y);

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
      foot: [['TOTAL', formatFCFA(totalCA), formatFCFA(totalAchats), formatFCFA(totalCA - totalAchats)]],
      theme: 'grid',
      headStyles: { fillColor: VERT_FONCE, textColor: 255, fontSize: 8.6, cellPadding: 3, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: FOND_LEGER },
      footStyles: { fillColor: GRIS_CLAIR, textColor: ANTHRACITE, fontStyle: 'bold', fontSize: 8.6 },
      styles: { fontSize: 8.6, cellPadding: 2.8, lineColor: BORDURE, lineWidth: 0.2 },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    let finY = (doc as any).lastAutoTable.finalY + 5;
    doc.setFontSize(7.2);
    doc.setTextColor(...GRIS);
    doc.text(
      "Marge brute = chiffre d'affaires moins les charges enregistrées dans Bilanko (hors salaire, impôts et charges non déclarées).",
      MARGE,
      finY
    );

    return finY + 10;
  }

  private sectionSignature(doc: jsPDF, demande: DemandeDossier, y: number) {
    const largeur = doc.internal.pageSize.getWidth();
    const wBloc = 84;
    const hBloc = 32;

    doc.setDrawColor(...BORDURE);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGE, y, wBloc, hBloc, 1.5, 1.5, 'S');
    doc.setFontSize(8);
    doc.setTextColor(...GRIS);
    doc.text('Fait à ________________________', MARGE + 4, y + 9);
    doc.text('Le ___ / ___ / ______', MARGE + 4, y + 15);
    doc.setDrawColor(...ANTHRACITE);
    doc.line(MARGE + 4, y + 26, MARGE + wBloc - 4, y + 26);
    doc.setFontSize(7.3);
    doc.text('Signature et cachet du demandeur', MARGE + 4, y + 30);

    const xDroite = largeur - MARGE - wBloc;
    const labelDroite =
      demande.type === 'pret_bancaire' ? "Cadre réservé à l'établissement prêteur" : "Cadre réservé à l'administration fiscale";
    doc.setDrawColor(...BORDURE);
    doc.roundedRect(xDroite, y, wBloc, hBloc, 1.5, 1.5, 'S');
    doc.setFontSize(8);
    doc.setTextColor(...GRIS);
    const lignesLabel = doc.splitTextToSize(labelDroite, wBloc - 8);
    doc.text(lignesLabel, xDroite + 4, y + 9);
  }

  private piedDePage(doc: jsPDF, reference: string, logoBase64: string | null) {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      const largeur = doc.internal.pageSize.getWidth();
      const hauteur = doc.internal.pageSize.getHeight();

      doc.setDrawColor(...OCRE);
      doc.setLineWidth(0.5);
      doc.line(MARGE, hauteur - 13, largeur - MARGE, hauteur - 13);

      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'PNG', MARGE, hauteur - 10, 4.5, 4.5);
        } catch {
          /* silencieux — le texte suffit si l'image échoue */
        }
      }

      doc.setFontSize(7);
      doc.setTextColor(...GRIS);
      doc.text(`Document généré via Bilanko — Réf. ${reference}`, MARGE + (logoBase64 ? 6.5 : 0), hauteur - 7);
      doc.text(`Page ${i}/${pages}`, largeur - MARGE, hauteur - 7, { align: 'right' });
    }
  }
}