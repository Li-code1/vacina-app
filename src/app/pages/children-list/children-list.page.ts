import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { Child } from '../../models/child.model';
import { ChildService } from '../../services/child.service';
import { AuthService } from '../../services/auth.service';
import { ChildCardComponent } from '../../shared/components/child-card/child-card.component';

@Component({
  selector: 'app-children-list',
  standalone: true,
  imports: [
    CommonModule,
    ChildCardComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonFab,
    IonFabButton,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="app-green">
        <ion-title>Minhas Crianças</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()" fill="solid" color="app-brown" class="header-action-btn">
            <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="page-wrap">
        <p class="subtitle">
          Acompanhe a jornada de vacinação de cada criança da sua família.
        </p>

        <ng-container *ngIf="children$ | async as children">
          <div *ngIf="children.length; else empty">
            <app-child-card
              *ngFor="let child of children"
              [child]="child"
              (click)="openChild(child)"
            ></app-child-card>
          </div>

          <ng-template #empty>
            <div class="empty-state">
              <ion-icon name="happy-outline" style="font-size: 48px;"></ion-icon>
              <p>Nenhuma criança cadastrada ainda.</p>
              <p>Toque no botão laranja abaixo para adicionar a primeira.</p>
            </div>
          </ng-template>
        </ng-container>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="app-orange" (click)="openAddChild()">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [
    `
      .page-wrap { padding: 12px 16px; }
      .subtitle { color: #8a7d72; margin-top: 0; }
      .header-action-btn {
        --border-radius: 50%;
        --padding-start: 10px;
        --padding-end: 10px;
        margin-right: 4px;
        font-size: 1.2rem;
      }
    `,
  ],
})
export class ChildrenListPage {
  children$: Observable<Child[]>;

  private colors = ['app-green', 'app-orange', 'app-yellow', 'app-brown'];

  constructor(
    private childService: ChildService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router,
  ) {
    this.children$ = this.childService.children$;
  }

  openChild(child: Child) {
    this.router.navigate(['/children', child.id]);
  }

  async openAddChild() {
    const alert = await this.alertCtrl.create({
      header: 'Nova criança',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nome completo' },
        { name: 'birthDate', type: 'date', placeholder: 'Data de nascimento' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: async (data) => {
            if (!data.name || !data.birthDate) return false;
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            await this.childService.addChild(data.name, new Date(data.birthDate), color);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
