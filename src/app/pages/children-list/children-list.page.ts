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
import { Observable, map } from 'rxjs';
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
        <p class="greeting" *ngIf="userName$ | async as name">
          Olá, <strong>{{ name }}</strong> 👋
        </p>
        <p class="subtitle">
          Acompanhe a jornada de vacinação de cada criança da sua família.
        </p>

        <ng-container *ngIf="children$ | async as children">
          <div *ngIf="children.length; else empty">
            <app-child-card
              *ngFor="let child of children"
              [child]="child"
              (click)="openChild(child)"
              (optionsClick)="openChildOptions(child)"
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
      .greeting { color: var(--app-brown); margin: 0 0 2px; font-size: 1rem; }
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
  userName$: Observable<string | null>;

  private colors = ['app-green', 'app-orange', 'app-yellow', 'app-brown'];

  constructor(
    private childService: ChildService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router,
  ) {
    this.children$ = this.childService.children$;
    this.userName$ = this.authService.user$.pipe(
      map((user) => user?.displayName ?? null),
    );
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

  async openChildOptions(child: Child) {
    const alert = await this.alertCtrl.create({
      header: child.name,
      message: 'O que você quer fazer?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Excluir', role: 'destructive', handler: () => this.confirmDeleteChild(child) },
        { text: 'Editar', handler: () => this.editChild(child) },
      ],
    });
    await alert.present();
  }

  async editChild(child: Child) {
    const dateStr = child.birthDate.toISOString().slice(0, 10);
    const alert = await this.alertCtrl.create({
      header: 'Editar criança',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nome completo', value: child.name },
        { name: 'birthDate', type: 'date', placeholder: 'Data de nascimento', value: dateStr },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: async (data) => {
            if (!data.name || !data.birthDate) return false;
            await this.childService.updateChild(child.id, data.name, new Date(data.birthDate));
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async confirmDeleteChild(child: Child) {
    const alert = await this.alertCtrl.create({
      header: 'Excluir criança',
      message: `Tem certeza que deseja excluir "${child.name}"? Todas as doses cadastradas também serão excluídas. Essa ação não pode ser desfeita.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            await this.childService.deleteChild(child.id);
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
