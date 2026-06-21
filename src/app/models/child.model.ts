import { DoseStatus, VaccineDose } from './vaccine.model';

export class Child {
  constructor(
    public id: string,
    public name: string,
    public birthDate: Date,
    public avatarColor: string,
    public doses: VaccineDose[] = [],
  ) {}

  /** Idade calculada em anos e meses, usada nas telas de listagem. */
  getAgeLabel(referenceDate: Date = new Date()): string {
    let months =
      (referenceDate.getFullYear() - this.birthDate.getFullYear()) * 12 +
      (referenceDate.getMonth() - this.birthDate.getMonth());
    if (referenceDate.getDate() < this.birthDate.getDate()) {
      months--;
    }
    if (months < 1) return 'Recém-nascido(a)';
    if (months < 24) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    const years = Math.floor(months / 12);
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }

  private dosesByStatus(status: DoseStatus, referenceDate: Date = new Date()): VaccineDose[] {
    return this.doses.filter((d) => d.getStatus(referenceDate) === status);
  }

  getPendingDoses(referenceDate: Date = new Date()): VaccineDose[] {
    return this.doses.filter((d) => d.getStatus(referenceDate) !== DoseStatus.APPLIED);
  }

  getLateDoses(referenceDate: Date = new Date()): VaccineDose[] {
    return this.dosesByStatus(DoseStatus.LATE, referenceDate);
  }

  getDueSoonDoses(referenceDate: Date = new Date()): VaccineDose[] {
    return this.dosesByStatus(DoseStatus.DUE_SOON, referenceDate);
  }

  getAppliedDoses(): VaccineDose[] {
    return this.dosesByStatus(DoseStatus.APPLIED);
  }

  /** Percentual do calendário vacinal já cumprido (0-100). */
  getCompletionRate(): number {
    if (this.doses.length === 0) return 0;
    return Math.round((this.getAppliedDoses().length / this.doses.length) * 100);
  }

  /** Resumo da situação vacinal usado nos cards e badges. */
  getOverallStatusLabel(referenceDate: Date = new Date()): 'late' | 'due-soon' | 'ok' {
    if (this.getLateDoses(referenceDate).length > 0) return 'late';
    if (this.getDueSoonDoses(referenceDate).length > 0) return 'due-soon';
    return 'ok';
  }
}
