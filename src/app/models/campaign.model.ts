export class Campaign {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public targetAudience: string, // ex: "Crianças de 6 meses a 5 anos"
    public startDate: Date,
    public endDate: Date,
    public location: string,
    public vaccineName: string,
  ) {}

  isActive(referenceDate: Date = new Date()): boolean {
    return referenceDate >= this.startDate && referenceDate <= this.endDate;
  }

  getDaysRemaining(referenceDate: Date = new Date()): number {
    return Math.max(
      0,
      Math.ceil((this.endDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }
}
