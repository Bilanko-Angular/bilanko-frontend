import { Charge } from '../models/finance';
import { ChargeRequestDTO, ChargeResponseDTO } from '../models/DTO/ChargeDto';
import { PagedResponseDto } from '../models/DTO/response/PageResponse';

export class ChargeMapper {
  /**
   * Convertit un ChargeResponseDTO (backend) vers le modèle front Charge.
   */
  static fromResponseDTO(dto: ChargeResponseDTO): Charge {
    return {
      id: dto.id.toString(),
      label: dto.label,
      supplier: dto.supplier,
      amount: dto.amount,
      date: dto.date, // format ISO YYYY-MM-DD
      categoryId: dto.categoryId,
      categoryName: dto.categoryName,
    };
  }

  /**
   * Convertit une liste de ChargeResponseDTO vers une liste de Charge.
   */
  static fromResponseDTOList(dtos: ChargeResponseDTO[]): Charge[] {
    return dtos.map((dto) => ChargeMapper.fromResponseDTO(dto));
  }

  /**
   * Extrait et mappe le contenu d'une réponse paginée backend.
   * Retourne les charges mappées et les métadonnées de pagination.
   */
  static fromPageResponse(page: PagedResponseDto<ChargeResponseDTO>): {
    charges: Charge[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  } {
    return {
      charges: ChargeMapper.fromResponseDTOList(page.content),
      totalElements: page.totalElements,
      totalPages: page.totalPages,
      currentPage: page.number,
    };
  }

  /**
   * Convertit le modèle front Charge vers un ChargeRequestDTO (backend).
   */
  static toRequestDTO(charge: Omit<Charge, 'id'>): ChargeRequestDTO {
    return {
      label: charge.label,
      supplier: charge.supplier ?? '',
      amount: charge.amount,
      date: charge.date, // format ISO YYYY-MM-DD attendu par LocalDate Java
      ...(charge.categoryId !== undefined && { categoryId: charge.categoryId }),
    };
  }
}
