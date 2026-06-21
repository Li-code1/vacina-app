import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';
import { Observable, combineLatest, map } from 'rxjs';
import { Child } from '../../models/child.model';
import { VaccineDose } from '../../models/vaccine.model';
import { ChildService } from '../../services/child.service';
import { VaccineService } from '../../services/vaccine.service';
import { VaccineStatusBadgeComponent } from '../../shared/components/vaccine-status-badge/vaccine-status-badge.component';

@Component({
  selector: 'app-child-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VaccineStatusBadgeComponent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="app-orange">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/children"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ (child$ | async)?.name }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openAddDose()" fill="solid" color="app-brown" class="header-action-btn">
            <ion-icon name="add-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" *ngIf="child$ | async as child">
      <div class="page-wrap">
        <ion-card class="summary-card">
          <ion-card-content>
            <h2>{{ child.name }}</h2>
            <p>{{ child.getAgeLabel() }} · Nascido em {{ child.birthDate | date: 'dd/MM/yyyy' }}</p>
            <div class="bar"><div class="fill" [style.width.%]="child.getCompletionRate()"></div></div>
            <p class="rate">{{ child.getCompletionRate() }}% do calendário vacinal concluído</p>
          </ion-card-content>
        </ion-card>

        <ion-segment [(ngModel)]="filter" class="segment">
          <ion-segment-button value="pending">
            <ion-label>Pendentes ({{ child.getPendingDoses().length }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="all">
            <ion-label>Histórico completo</ion-label>
          </ion-segment-button>
        </ion-segment>

        <div *ngIf="visibleDoses(child).length; else noDoses">
          <ion-list lines="none">
            <ion-item *ngFor="let dose of visibleDoses(child)" class="dose-item">
              <ion-icon
                slot="start"
                name="medkit-outline"
                [color]="dose.getStatus() === 'LATE' ? 'danger' : 'medium'"
              ></ion-icon>
              <ion-label>
                <h3>{{ vaccineName(dose) }} — {{ dose.doseLabel }}</h3>
                <p *ngIf="dose.appliedDate">
                  Aplicada em {{ dose.appliedDate | date: 'dd/MM/yyyy' }}
                </p>
                <p *ngIf="!dose.appliedDate">
                  Prevista para {{ dose.expectedDate | date: 'dd/MM/yyyy' }}
                </p>
              </ion-label>
              <ion-button
                *ngIf="!dose.appliedDate"
                slot="end"
                fill="clear"
                size="small"
                (click)="confirmApply(child.id, dose)"
              >
                <ion-icon name="checkmark-circle-outline" slot="icon-only"></ion-icon>
              </ion-button>
              <span
                *ngIf="dose.appliedDate"
                slot="end"
                (click)="confirmUndo(child.id, dose)"
                class="status-chip ok clickable"
              >
                <ion-icon name="checkmark-circle-outline"></ion-icon>
                Aplicada
              </span>
              <app-vaccine-status-badge
                *ngIf="!dose.appliedDate"
                slot="end"
                [status]="dose.getStatus()"
              ></app-vaccine-status-badge>
            </ion-item>
          </ion-list>
        </div>
        <ng-template #noDoses>
          <div class="empty-state">
            <ion-icon name="checkmark-done-outline" style="font-size: 40px;"></ion-icon>
            <p>Nenhuma dose cadastrada ainda. Toque no "+" no topo para adicionar.</p>
          </div>
        </ng-template>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .page-wrap { padding: 12px 16px 32px; }
      .summary-card { --background: #fff; border-radius: 16px; }
      .summary-card h2 { margin: 0; color: var(--app-brown); }
      .summary-card p { color: #8a7d72; margin: 4px 0; }
      .bar { height: 6px; border-radius: 3px; background: #eee2cf; overflow: hidden; margin-top: 8px; }
      .fill { height: 100%; background: var(--app-green); }
      .rate { font-size: 0.8rem; }
      .segment { margin: 16px 0; }
      .dose-item { --background: #fff; border-radius: 12px; margin-bottom: 8px; }
      .dose-item h3 { color: var(--app-brown); font-size: 0.95rem; }
      .dose-item p { font-size: 0.8rem; color: #8a7d72; }
      .header-action-btn {
        --border-radius: 50%;
        --padding-start: 10px;
        --padding-end: 10px;
        margin-right: 4px;
        font-size: 1.2rem;
      }
      .status-chip.clickable { cursor: pointer; }
    `,
  ],
})
export class ChildDetailPage implements OnInit {
  child$!: Observable<Child>;
  filter: 'pending' | 'all' = 'pending';
  private childId!: string;

  constructor(
    private route: ActivatedRoute,
    private childService: ChildService,
    private vaccineService: VaccineService,
    private alertCtrl: AlertController,
  ) {}

  ngOnInit(): void {
    this.childId = this.route.snapshot.paramMap.get('id')!;

    this.child$ = combineLatest([
      this.childService.children$,
      this.childService.getDoses$(this.childId),
    ]).pipe(
      map(([children, doses]) => {
        const base = children.find((c) => c.id === this.childId);
        if (!base) return new Child(this.childId, 'Criança', new Date(), 'app-green', doses);
        return new Child(base.id, base.name, base.birthDate, base.avatarColor, doses);
      }),
    );
  }

  visibleDoses(child: Child): VaccineDose[] {
    const doses = this.filter === 'pending' ? child.getPendingDoses() : child.doses;
    return [...doses].sort((a, b) => a.expectedDate.getTime() - b.expectedDate.getTime());
  }

  vaccineName(dose: VaccineDose): string {
    if (dose.customName) return dose.customName;
    return this.vaccineService.getById(dose.vaccineId)?.name ?? dose.vaccineId;
  }

  async confirmApply(childId: string, dose: VaccineDose) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const alert = await this.alertCtrl.create({
      header: 'Confirmar vacinação',
      message: `Confirma que a dose "${dose.doseLabel}" de ${this.vaccineName(dose)} foi aplicada?`,
      inputs: [{ name: 'appliedDate', type: 'date', value: todayStr, placeholder: 'Data da aplicação' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: async (data) => {
            const date = data.appliedDate ? new Date(data.appliedDate) : new Date();
            await this.childService.applyDose(childId, dose.id, date);
          },
        },
      ],
    });
    await alert.present();
  }

  async confirmUndo(childId: string, dose: VaccineDose) {
    const alert = await this.alertCtrl.create({
      header: 'Desfazer marcação',
      message: `Tem certeza que "${dose.doseLabel}" de ${this.vaccineName(dose)} NÃO foi aplicada? Ela voltará para pendente.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Desfazer',
          role: 'destructive',
          handler: async () => {
            await this.childService.unapplyDose(childId, dose.id);
          },
        },
      ],
    });
    await alert.present();
  }

  async openAddDose() {
    const catalogOptions = this.vaccineService
      .getAll()
      .map((v) => ({ name: 'vaccineId', type: 'radio' as const, label: v.name, value: v.id }));

    const customOption = {
      name: 'vaccineId',
      type: 'radio' as const,
      label: 'Outra vacina (não está na lista)',
      value: '__custom__',
    };

    const alert = await this.alertCtrl.create({
      header: 'Qual vacina?',
      inputs: [...catalogOptions, customOption],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Avançar', handler: (vaccineId) => this.askDoseDetails(vaccineId) },
      ],
    });
    await alert.present();
  }

  private async askDoseDetails(vaccineId: string) {
    if (!vaccineId) return;

    if (vaccineId === '__custom__') {
      const alert = await this.alertCtrl.create({
        header: 'Nome da vacina',
        inputs: [
          { name: 'customName', type: 'text', placeholder: 'Ex: Febre Amarela, vacina de viagem...' },
        ],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Avançar',
            handler: (data) => {
              if (!data.customName) return false;
              this.askDoseSchedule(vaccineId, data.customName);
              return true;
            },
          },
        ],
      });
      await alert.present();
      return;
    }

    this.askDoseSchedule(vaccineId, null);
  }

  private async askDoseSchedule(vaccineId: string, customName: string | null) {
    const alert = await this.alertCtrl.create({
      header: 'Detalhes da dose',
      inputs: [
        { name: 'doseLabel', type: 'text', placeholder: 'Ex: 1ª dose, Reforço, Dose única...' },
        { name: 'expectedDate', type: 'date', placeholder: 'Data prevista' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: async (data) => {
            if (!data.doseLabel || !data.expectedDate) return false;
            await this.childService.addDose(
              this.childId,
              vaccineId,
              data.doseLabel,
              new Date(data.expectedDate),
              customName,
            );
            return true;
          },
        },
      ],
    });
    await alert.present();
  }
}
