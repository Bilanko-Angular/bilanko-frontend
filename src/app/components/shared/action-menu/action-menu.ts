import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { PreferencesService } from '../../../services/preferences';

@Component({
  selector: 'app-action-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-menu.html',
  styleUrls: ['./action-menu.css']
})
export class ActionMenu {
  protected readonly prefs = inject(PreferencesService);
  open = signal(false);
  @Output() action = new EventEmitter<string>();

  toggle() { this.open.update(v => !v); }
  select(type: string) { this.action.emit(type); this.open.set(false); }
}