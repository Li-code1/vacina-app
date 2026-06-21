import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';
import { Child } from '../../../models/child.model';

@Component({
  selector: 'app-child-card',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent],
  template: `
    <ion-card button class="child-card" [color]="child.avatarColor">
      <ion-card-content>
        <div class="header">
          <div class="avatar">{{ initials }}</div>
          <div class="info">
            <h2>{{ child.name }}</h2>
            <p>{{ child.getAgeLabel() }}</p>
          </div>
          <span
            class="status-chip"
            [class.ok]="statusLabel === 'ok'"
            [class.due-soon]="statusLabel === 'due-soon'"
            [class.late]="statusLabel === 'late'"
          >
            {{ statusText }}
          </span>
        </div>
        <div class="progress">
          <div class="bar">
            <div class="fill" [style.width.%]="child.getCompletionRate()"></div>
          </div>
          <span>{{ child.getCompletionRate() }}% do calendário concluído</span>
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `
      .child-card { margin: 8px 0; --background: #fff; border-radius: 16px; }
      .header { display: flex; align-items: center; gap: 12px; }
      .avatar {
        width: 44px; height: 44px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: var(--app-orange); color: var(--app-brown);
        font-weight: 700; flex-shrink: 0;
      }
      .info { flex: 1; }
      .info h2 { margin: 0; font-size: 1.05rem; color: var(--app-brown); }
      .info p { margin: 2px 0 0; font-size: 0.85rem; color: #8a7d72; }
      .progress { margin-top: 12px; }
      .bar { height: 6px; border-radius: 3px; background: #eee2cf; overflow: hidden; }
      .fill { height: 100%; background: var(--app-green); }
      .progress span { font-size: 0.75rem; color: #8a7d72; }
    `,
  ],
})
export class ChildCardComponent {
  @Input({ required: true }) child!: Child;

  get initials(): string {
    return this.child.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  get statusLabel(): 'ok' | 'due-soon' | 'late' {
    return this.child.getOverallStatusLabel();
  }

  get statusText(): string {
    switch (this.statusLabel) {
      case 'late':
        return 'Pendência';
      case 'due-soon':
        return 'Atenção';
      default:
        return 'Em dia';
    }
  }
}
