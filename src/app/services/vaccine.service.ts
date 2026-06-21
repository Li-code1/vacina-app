import { Injectable } from '@angular/core';
import { Vaccine } from '../models/vaccine.model';

/** Serviço responsável pelo catálogo informativo de vacinas. */
@Injectable({ providedIn: 'root' })
export class VaccineService {
  private catalog: Vaccine[] = [
    new Vaccine('bcg', 'BCG', 'Protege contra formas graves de tuberculose.', ['Tuberculose'], 1),
    new Vaccine(
      'hepatite-b',
      'Hepatite B',
      'Previne a infecção pelo vírus da hepatite B, aplicada preferencialmente ao nascer.',
      ['Hepatite B'],
      1,
    ),
    new Vaccine(
      'pentavalente',
      'Pentavalente',
      'Combinação que protege contra cinco doenças em uma única injeção.',
      ['Difteria', 'Tétano', 'Pertussis', 'Hib', 'Hepatite B'],
      3,
    ),
    new Vaccine(
      'vip-vop',
      'Poliomielite (VIP/VOP)',
      'Protege contra a paralisia infantil (poliomielite).',
      ['Poliomielite'],
      3,
    ),
    new Vaccine(
      'rotavirus',
      'Rotavírus',
      'Previne gastroenterites graves causadas pelo rotavírus.',
      ['Diarreia por rotavírus'],
      2,
    ),
    new Vaccine(
      'triplice-viral',
      'Tríplice Viral (SCR)',
      'Protege contra sarampo, caxumba e rubéola.',
      ['Sarampo', 'Caxumba', 'Rubéola'],
      2,
    ),
    new Vaccine(
      'hepatite-a',
      'Hepatite A',
      'Previne a infecção pelo vírus da hepatite A.',
      ['Hepatite A'],
      1,
    ),
    new Vaccine(
      'dtp',
      'DTP (Reforço)',
      'Reforço da proteção contra difteria, tétano e pertussis.',
      ['Difteria', 'Tétano', 'Pertussis'],
      1,
    ),
  ];

  getAll(): Vaccine[] {
    return this.catalog;
  }

  getById(id: string): Vaccine | undefined {
    return this.catalog.find((v) => v.id === id);
  }
}
