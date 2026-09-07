import type { Sale, SaleItem } from '../models/sale';
import type {
  SaleItemRequestDTO,
  SaleItemResponseDTO,
  SaleRequestDTO,
  SaleResponseDTO,
} from '../models/DTO/SaleDto';

export class SaleMapper {
  static fromItemResponseDTO(dto: SaleItemResponseDTO): SaleItem {
    return {
      id: dto.id.toString(),
      productId: dto.productId.toString(),
      productName: dto.productName,
      quantity: dto.quantity,
      unitSellingPrice: dto.unitSellingPrice,
      unitPurchasePrice: dto.unitPurchasePrice,
      margin: dto.margin,
    };
  }

  static fromResponseDTO(dto: SaleResponseDTO): Sale {
    return {
      id: dto.id.toString(),
      saleDate: dto.saleDate,
      customerName: dto.customerName ?? '',
      totalAmount: dto.totalAmount,
      totalMargin: dto.totalMargin,
      items: (dto.items ?? []).map((item) => SaleMapper.fromItemResponseDTO(item)),
    };
  }

  static fromResponseDTOList(dtos: SaleResponseDTO[]): Sale[] {
    return dtos.map((dto) => SaleMapper.fromResponseDTO(dto));
  }

  static toItemRequestDTO(item: SaleItem): SaleItemRequestDTO {
    return {
      productId: Number(item.productId),
      quantity: item.quantity,
      unitSellingPrice: item.unitSellingPrice,
    };
  }

  /**
   * Convertit le modèle front Sale vers un SaleRequestDTO (backend).
   * totalAmount / totalMargin sont calculés côté serveur.
   */
  static toRequestDTO(sale: Omit<Sale, 'id'> | Sale): SaleRequestDTO {
    return {
      saleDate: sale.saleDate,
      customerName: sale.customerName,
      items: sale.items.map((item) => SaleMapper.toItemRequestDTO(item)),
    };
  }
}
