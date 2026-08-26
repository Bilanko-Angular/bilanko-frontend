import { Charge } from '../models/finance';
import { ChargeRequestDTO, ChargeResponseDTO } from '../models/DTO/ChargeDto';

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
    };
  }

  /**
   * Convertit une liste de ChargeResponseDTO vers une liste de Charge.
   */
  static fromResponseDTOList(dtos: ChargeResponseDTO[]): Charge[] {
    return dtos.map((dto) => ChargeMapper.fromResponseDTO(dto));
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
    };
  }
}
