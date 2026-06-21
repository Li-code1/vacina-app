import { Injectable } from '@angular/core';
import { Campaign } from '../models/campaign.model';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private today = new Date();
  private addDays = (n: number) => {
    const d = new Date(this.today);
    d.setDate(d.getDate() + n);
    return d;
  };

  private campaigns: Campaign[] = [
    new Campaign(
      'cmp1',
      'Campanha Nacional de Multivacinação',
      'Atualização da caderneta de vacinação para crianças que perderam doses durante a pandemia.',
      'Crianças de 0 a 5 anos',
      this.addDays(-5),
      this.addDays(10),
      'Postos de Saúde da rede municipal',
      'Múltiplas vacinas',
    ),
    new Campaign(
      'cmp2',
      'Campanha contra a Poliomielite',
      'Dose de reforço contra a poliomielite para garantir a imunidade coletiva.',
      'Crianças de 1 a 4 anos',
      this.addDays(2),
      this.addDays(20),
      'UBS e escolas parceiras',
      'VIP/VOP',
    ),
    new Campaign(
      'cmp3',
      'Campanha de Influenza Infantil',
      'Vacinação anual contra a gripe para reduzir hospitalizações no período de inverno.',
      'Crianças de 6 meses a 6 anos',
      this.addDays(-40),
      this.addDays(-10),
      'Postos de Saúde da rede municipal',
      'Influenza',
    ),
  ];

  getAll(): Campaign[] {
    return this.campaigns;
  }

  getActive(referenceDate: Date = new Date()): Campaign[] {
    return this.campaigns.filter((c) => c.isActive(referenceDate));
  }
}
