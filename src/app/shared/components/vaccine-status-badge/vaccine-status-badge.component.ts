import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DoseStatus } from '../../../models/vaccine.model';

@Component({
  selector: 'app-vaccine-status-badge',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <span class="status-chip" [ngClass]="cssClass">
      <ion-icon [name]="icon"></ion-icon>
      {{ label }}
    </span>
  `,
})
export class VaccineStatusBadgeComponent {
  @Input() status: DoseStatus = DoseStatus.SCHEDULED;

  get cssClass(): string {
    switch (this.status) {
      case DoseStatus.APPLIED:
        return 'ok';
      case DoseStatus.DUE_SOON:
        return 'due-soon';
      case DoseStatus.LATE:
        return 'late';
      default:
        return 'scheduled';
    }
  }

  get icon(): string {
    switch (this.status) {
      case DoseStatus.APPLIED:
        return 'checkmark-circle-outline';
      case DoseStatus.DUE_SOON:
        return 'time-outline';
      case DoseStatus.LATE:
        return 'alert-circle-outline';
      default:
        return 'calendar-outline';
    }
  }

  get label(): string {
    switch (this.status) {
      case DoseStatus.APPLIED:
        return 'Aplicada';
      case DoseStatus.DUE_SOON:
        return 'Próxima';
      case DoseStatus.LATE:
        return 'Atrasada';
      default:
        return 'Agendada';
    }
  }
}
