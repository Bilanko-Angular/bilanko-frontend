import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';

@Component({
  selector: 'app-action-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-menu.html',
  styleUrls: ['./action-menu.css']
})
export class ActionMenu {
  open = signal(false);
  @Output() action = new EventEmitter<string>();

  toggle() { this.open.update(v => !v); }
  select(type: string) { this.action.emit(type); this.open.set(false); }
}
