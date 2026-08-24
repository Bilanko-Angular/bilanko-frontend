import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

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

  private readonly elementRef = inject(ElementRef);

  /* ============================================================
     ÉTAT
     ============================================================ */

  readonly open = signal(false);

  /* ============================================================
     POSITION DU MENU
     ============================================================ */

  readonly menuTop = signal(0);

  readonly menuLeft = signal(0);

  /* ============================================================
     ÉVÉNEMENT
     ============================================================ */

  @Output()
  readonly action = new EventEmitter<string>();


  /* ============================================================
     OUVRIR / FERMER
     ============================================================ */

  toggle(event: MouseEvent): void {

    event.preventDefault();

    event.stopPropagation();

    if (this.open()) {

      this.open.set(false);

      return;
    }

    const button =
      event.currentTarget as HTMLElement;

    if (!button) {
      return;
    }

    this.positionMenu(button);

    this.open.set(true);
  }


  /* ============================================================
     POSITIONNEMENT INTELLIGENT
     ============================================================ */

  private positionMenu(button: HTMLElement): void {

    const rect =
      button.getBoundingClientRect();

    const menuWidth = 180;

    const menuHeight = 140;

    const gap = 6;

    const viewportWidth =
      window.innerWidth;

    const viewportHeight =
      window.innerHeight;


    /*
     * ----------------------------------------------------------
     * HORIZONTAL
     * ----------------------------------------------------------
     *
     * Le bord DROIT du menu est aligné
     * avec le bord DROIT des trois points.
     */

    let left =
      rect.right - menuWidth;


    /*
     * Protection droite
     */

    if (
      left + menuWidth >
      viewportWidth - gap
    ) {

      left =
        viewportWidth -
        menuWidth -
        gap;
    }


    /*
     * Protection gauche
     */

    if (left < gap) {

      left = gap;
    }


    /*
     * ----------------------------------------------------------
     * VERTICAL
     * ----------------------------------------------------------
     *
     * Normalement :
     *
     *       ⋮
     *       ↓
     *   ┌──────────────┐
     *   │ Voir         │
     *   │ Modifier     │
     *   │ Supprimer    │
     *   └──────────────┘
     *
     * ----------------------------------------------------------
     */

    let top =
      rect.bottom + gap;


    /*
     * Si le menu ne rentre pas en bas,
     * on le place au-dessus du bouton.
     */

    if (
      top + menuHeight >
      viewportHeight - gap
    ) {

      top =
        rect.top -
        menuHeight -
        gap;
    }


    /*
     * Protection contre la sortie par le haut.
     */

    if (top < gap) {

      top = gap;
    }


    /*
     * Valeurs finales.
     */

    this.menuTop.set(top);

    this.menuLeft.set(left);
  }


  /* ============================================================
     ACTION
     ============================================================ */

  select(
    type: string,
    event?: MouseEvent
  ): void {

    event?.preventDefault();

    event?.stopPropagation();

    this.action.emit(type);

    this.open.set(false);
  }


  /* ============================================================
     CLIC EXTÉRIEUR
     ============================================================ */

  @HostListener(
    'document:click',
    ['$event']
  )
  onDocumentClick(event: MouseEvent): void {

    const target =
      event.target as Node | null;

    if (
      this.open() &&
      target &&
      !this.elementRef.nativeElement.contains(target)
    ) {

      this.open.set(false);
    }
  }


  /* ============================================================
     ESC
     ============================================================ */

  @HostListener(
    'document:keydown.escape'
  )
  onEscape(): void {

    this.open.set(false);
  }


  /* ============================================================
     SCROLL
     ============================================================ */

  @HostListener(
    'window:scroll'
  )
  onScroll(): void {

    if (this.open()) {

      this.open.set(false);
    }
  }


  /* ============================================================
     RESIZE
     ============================================================ */

  @HostListener(
    'window:resize'
  )
  onResize(): void {

    if (this.open()) {

      this.open.set(false);
    }
  }

}