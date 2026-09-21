import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-bank',
  standalone: true,
  imports: [],
  templateUrl: './hero-bank.html',
  styleUrl: './hero-bank.css',
})
export class HeroBank {
  @Input({ required: true }) stockDisponible!: number;
  @Input({ required: true }) dureeHistorique!: number;
  @Input({ required: true }) totalCA!: number;
  @Input({ required: true }) etape!: number;
}
