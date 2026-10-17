import { Component, inject, signal, ViewEncapsulation, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Template } from '../../components/shared/template/template';
import { ActionResponsePopup } from '../../components/globals/action-response-popup/action-response-popup';
import { PreferencesService } from '../../service/app/preference/preferences';

import { GeneralSettingsComponent } from '../../components/parametres/general-settings/general-settings';
import { SecuritySettingsComponent } from '../../components/parametres/security-settings/security-settings';
import { NotificationSettingsComponent } from '../../components/parametres/notification-settings/notification-settings';
import { ApparenceSettingsComponent } from '../../components/parametres/apparence-settings/apparence-settings';

type Tab = 'general' | 'compte' | 'notifications' | 'apparence';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [
    CommonModule,
    Template,
    ActionResponsePopup,
    GeneralSettingsComponent,
    SecuritySettingsComponent,
    NotificationSettingsComponent,
    ApparenceSettingsComponent
  ],
  templateUrl: './parametres.html',
  styleUrls: ['./parametres.css'],
  encapsulation: ViewEncapsulation.None
})
export class Parametres implements OnInit {
  public prefs: PreferencesService = inject(PreferencesService);
  private readonly route = inject(ActivatedRoute);

  activeTab = signal<Tab>('general');

  ngOnInit(): void {
    const section = this.route.snapshot.queryParamMap.get('section');
    if (section === 'general' || section === 'compte' || section === 'notifications' || section === 'apparence') {
      this.activeTab.set(section);
    }
  }

  setActiveTab(tab: Tab): void {
    this.activeTab.set(tab);
  }
}
