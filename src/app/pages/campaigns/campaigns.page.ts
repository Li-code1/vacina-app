import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { Campaign } from '../../models/campaign.model';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="app-yellow">
        <ion-title>Campanhas de Vacinação</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="page-wrap">
        <h3 class="section-title">Ativas agora</h3>
        <div *ngIf="active.length; else noActive">
          <ion-card *ngFor="let c of active" class="campaign-card active">
            <ion-card-content>
              <div class="row">
                <h2>{{ c.title }}</h2>
                <span class="status-chip ok">Ativa</span>
              </div>
              <p>{{ c.description }}</p>
              <ul>
                <li><ion-icon name="people-outline"></ion-icon> {{ c.targetAudience }}</li>
                <li><ion-icon name="location-outline"></ion-icon> {{ c.location }}</li>
                <li>
                  <ion-icon name="calendar-outline"></ion-icon>
                  Até {{ c.endDate | date: 'dd/MM/yyyy' }} ({{ c.getDaysRemaining() }} dias restantes)
                </li>
              </ul>
            </ion-card-content>
          </ion-card>
        </div>
        <ng-template #noActive>
          <div class="empty-state">
            <p>Nenhuma campanha ativa neste momento.</p>
          </div>
        </ng-template>

        <h3 class="section-title">Outras campanhas</h3>
        <ion-card *ngFor="let c of others" class="campaign-card">
          <ion-card-content>
            <div class="row">
              <h2>{{ c.title }}</h2>
              <span class="status-chip" [class.scheduled]="!isPast(c)" [class.late]="isPast(c)">
                {{ isPast(c) ? 'Encerrada' : 'Em breve' }}
              </span>
            </div>
            <p>{{ c.description }}</p>
            <ul>
              <li><ion-icon name="people-outline"></ion-icon> {{ c.targetAudience }}</li>
              <li>
                <ion-icon name="calendar-outline"></ion-icon>
                {{ c.startDate | date: 'dd/MM/yyyy' }} – {{ c.endDate | date: 'dd/MM/yyyy' }}
              </li>
            </ul>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .page-wrap { padding: 12px 16px 32px; }
      .campaign-card { --background: #fff; border-radius: 16px; margin-bottom: 12px; }
      .campaign-card.active { border-left: 4px solid var(--app-green); }
      .row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
      .row h2 { font-size: 1rem; color: var(--app-brown); margin: 0; }
      .campaign-card p { color: #6f635a; font-size: 0.88rem; }
      .campaign-card ul { list-style: none; padding: 0; margin: 8px 0 0; }
      .campaign-card li { font-size: 0.8rem; color: #8a7d72; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    `,
  ],
})
export class CampaignsPage {
  all: Campaign[] = [];
  active: Campaign[] = [];
  others: Campaign[] = [];

  constructor(private campaignService: CampaignService) {
    this.all = this.campaignService.getAll();
    this.active = this.campaignService.getActive();
    this.others = this.all.filter((c) => !c.isActive());
  }

  isPast(c: Campaign): boolean {
    return c.endDate.getTime() < new Date().getTime();
  }
}
