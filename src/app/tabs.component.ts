import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonicModule],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" color="light">
        <ion-tab-button tab="children">
          <ion-icon name="people-outline"></ion-icon>
          <ion-label>Crianças</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="campaigns">
          <ion-icon name="megaphone-outline"></ion-icon>
          <ion-label>Campanhas</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsComponent {}
