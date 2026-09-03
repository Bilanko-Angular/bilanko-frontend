export interface CleanCategoryDTO {
  id: number;
  name: string;
}

/** Réponse du backend IA (image ou voice) */
export interface ProductDescriptionClean {
  name: string;
  quantity: number;
  price: number;
  purchasePrice: number;
  categoryDTOS: CleanCategoryDTO[];
  suggestCategories: string[]; // ignoré pour l'instant
  comments: string;           // ignoré pour l'instant
}
