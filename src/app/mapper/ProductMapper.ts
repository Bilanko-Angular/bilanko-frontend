import { ProductApiDto } from "../models/DTO/ProductDto";
import { Produit } from "../models/produit";

export class ProductMapper {
  static toProduit(dto: ProductApiDto): Produit {
    return {
      id: dto.id?.toString() ?? '',
      reference: dto.reference,
      nom: dto.name,
      categorie: dto.categories?.length
        ? dto.categories.map((c) => c.name).join(', ')
        : 'Non catégorisé',
      prixAchat: dto.purchasePrice,
      prixVente: dto.price,
      quantiteStock: dto.quantity,
      seuilAlerte: dto.alertThreshold,
    };
  }

  static toProduitList(dtos: ProductApiDto[]): Produit[] {
    return dtos.map((dto) => ProductMapper.toProduit(dto));
  }

  // Sens front → back, pour la création
  static toCreateApiDto(produit: {
    nom: string;
    quantiteStock: number;
    prixVente: number;
    prixAchat: number;
    seuilAlerte?: number;
    idCategories?: number[];
  }): Partial<ProductApiDto> & { idCategories?: number[] } {
    return {
      name: produit.nom,
      quantity: produit.quantiteStock,
      price: produit.prixVente,
      purchasePrice: produit.prixAchat,
      alertThreshold: produit.seuilAlerte,
      idCategories: produit.idCategories,
    } as any;
  }

  // Sens front → back, pour la mise à jour
  static toUpdateApiDto(produit: Partial<{
    nom: string;
    quantiteStock: number;
    prixVente: number;
    prixAchat: number;
    seuilAlerte: number;
    idCategories: number[];
  }>): Partial<ProductApiDto> & { idCategories?: number[] } {
    const dto: any = {};
    if (produit.nom !== undefined) dto.name = produit.nom;
    if (produit.quantiteStock !== undefined) dto.quantity = produit.quantiteStock;
    if (produit.prixVente !== undefined) dto.price = produit.prixVente;
    if (produit.prixAchat !== undefined) dto.purchasePrice = produit.prixAchat;
    if (produit.seuilAlerte !== undefined) dto.alertThreshold = produit.seuilAlerte;
    if (produit.idCategories !== undefined) dto.idCategories = produit.idCategories;
    return dto;
  }
}