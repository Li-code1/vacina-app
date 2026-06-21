import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, IonicModule],
  template: `
    <ion-app>
      <router-outlet></router-outlet>
    </ion-app>
  `,
})
export class AppComponent {}
