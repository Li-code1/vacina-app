import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  megaphoneOutline,
  addOutline,
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline,
  calendarOutline,
  medkitOutline,
  happyOutline,
  checkmarkDoneOutline,
  locationOutline,
  mailOutline,
  lockClosedOutline,
  personOutline,
  logOutOutline,
} from 'ionicons/icons';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';

addIcons({
  'people-outline': peopleOutline,
  'megaphone-outline': megaphoneOutline,
  'add-outline': addOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'time-outline': timeOutline,
  'alert-circle-outline': alertCircleOutline,
  'calendar-outline': calendarOutline,
  'medkit-outline': medkitOutline,
  'happy-outline': happyOutline,
  'checkmark-done-outline': checkmarkDoneOutline,
  'location-outline': locationOutline,
  'mail-outline': mailOutline,
  'lock-closed-outline': lockClosedOutline,
  'person-outline': personOutline,
  'log-out-outline': logOutOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({}),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
});
