/**
 * Status possíveis de uma dose de vacina, calculado dinamicamente
 * a partir da data prevista e da data de aplicação (se houver).
 */
export enum DoseStatus {
  APPLIED = 'APPLIED', // já aplicada
  SCHEDULED = 'SCHEDULED', // prevista para o futuro, dentro do prazo
  DUE_SOON = 'DUE_SOON', // prevista para os próximos 15 dias
  LATE = 'LATE', // prazo expirado e não aplicada
}

/** Representa o catálogo de uma vacina (ex: BCG, Pentavalente). */
export class Vaccine {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public protectsAgainst: string[],
    public dosesCount: number,
  ) {}
}

/**
 * Representa uma dose específica de vacina dentro do calendário
 * de uma criança (ex: 2ª dose da Pentavalente, prevista para os 4 meses).
 */
export class VaccineDose {
  constructor(
    public id: string,
    public vaccineId: string,
    public doseLabel: string, // ex: "1ª dose", "Dose única", "Reforço"
    public expectedDate: Date,
    public appliedDate: Date | null = null,
    public location: string | null = null,
    public batch: string | null = null,
    /** Preenchido quando a vacina não está no catálogo padrão (digitada manualmente). */
    public customName: string | null = null,
  ) {}

  /** Calcula o status atual da dose com base nas datas. */
  getStatus(referenceDate: Date = new Date()): DoseStatus {
    if (this.appliedDate) {
      return DoseStatus.APPLIED;
    }
    const diffDays = Math.ceil(
      (this.expectedDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0) {
      return DoseStatus.LATE;
    }
    if (diffDays <= 15) {
      return DoseStatus.DUE_SOON;
    }
    return DoseStatus.SCHEDULED;
  }
}
