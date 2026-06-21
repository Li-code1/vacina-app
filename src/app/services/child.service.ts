import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp,
  getDocs,
} from '@angular/fire/firestore';
import { Auth, user as authState } from '@angular/fire/auth';
import { Observable, switchMap, of, map } from 'rxjs';
import { Child } from '../models/child.model';
import { VaccineDose } from '../models/vaccine.model';

interface ChildDoc {
  id?: string;
  ownerId: string;
  name: string;
  birthDate: Timestamp;
  avatarColor: string;
}

interface DoseDoc {
  id?: string;
  vaccineId: string;
  doseLabel: string;
  expectedDate: Timestamp;
  appliedDate: Timestamp | null;
  location: string | null;
  batch: string | null;
  customName?: string | null;
}

/**
 * Serviço responsável pelas crianças e seus calendários de vacinação.
 *
 * Toda leitura/escrita é restrita ao usuário autenticado (campo `ownerId`).
 * A garantia definitiva de isolamento entre famílias, porém, vem das
 * Regras de Segurança do Firestore (ver firestore.rules na raiz do projeto):
 * mesmo que este serviço tivesse um bug, o backend recusaria qualquer
 * acesso a dados que não pertençam ao próprio usuário logado.
 */
@Injectable({ providedIn: 'root' })
export class ChildService {
  /** Stream reativo: refaz a consulta automaticamente quando o usuário loga/desloga. */
  readonly children$: Observable<Child[]>;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {
    this.children$ = authState(this.auth).pipe(
      switchMap((user) => {
        if (!user) return of([] as Child[]);
        const childrenRef = collection(this.firestore, 'children');
        const q = query(childrenRef, where('ownerId', '==', user.uid));
        return (collectionData(q, { idField: 'id' }) as Observable<ChildDoc[]>).pipe(
          map((docs) => docs.map((d) => new Child(d.id!, d.name, d.birthDate.toDate(), d.avatarColor, []))),
        );
      }),
    );
  }

  async addChild(name: string, birthDate: Date, avatarColor = 'app-green'): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');
    const childrenRef = collection(this.firestore, 'children');
    const newDoc: ChildDoc = {
      ownerId: user.uid,
      name,
      birthDate: Timestamp.fromDate(birthDate),
      avatarColor,
    };
    const ref = await addDoc(childrenRef, newDoc);
    return ref.id;
  }

  async addDose(
    childId: string,
    vaccineId: string,
    doseLabel: string,
    expectedDate: Date,
    customName: string | null = null,
  ): Promise<void> {
    const dosesRef = collection(this.firestore, `children/${childId}/doses`);
    const doseDoc: DoseDoc = {
      vaccineId,
      doseLabel,
      expectedDate: Timestamp.fromDate(expectedDate),
      appliedDate: null,
      location: null,
      batch: null,
      customName,
    };
    await addDoc(dosesRef, doseDoc);
  }

  async applyDose(childId: string, doseId: string, appliedDate: Date = new Date()): Promise<void> {
    const doseRef = doc(this.firestore, `children/${childId}/doses/${doseId}`);
    await updateDoc(doseRef, { appliedDate: Timestamp.fromDate(appliedDate) });
  }

  /** Desfaz a marcação de "aplicada", voltando a dose para pendente. */
  async unapplyDose(childId: string, doseId: string): Promise<void> {
    const doseRef = doc(this.firestore, `children/${childId}/doses/${doseId}`);
    await updateDoc(doseRef, { appliedDate: null });
  }

  /**
   * Cadastra duas crianças de exemplo (com vacinas em situações distintas:
   * em dia, atrasada e próxima do vencimento) para o usuário recém-criado.
   * Isso evita que pais novos vejam uma tela vazia no primeiro acesso e
   * já entendam como a plataforma funciona antes de cadastrar os próprios filhos.
   */
  async seedDemoChildren(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;

    const today = new Date();
    const addDays = (n: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + n);
      return d;
    };

    const sofiaId = await this.addChild('Sofia (exemplo)', new Date(2026, 1, 12), 'app-green');
    await this.addDose(sofiaId, 'bcg', 'Dose única', addDays(-128));
    await this.applyDoseByExpected(sofiaId, addDays(-130));
    await this.addDose(sofiaId, 'pentavalente', '1ª dose', addDays(-10));
    await this.applyDoseByExpected(sofiaId, addDays(-10));
    await this.addDose(sofiaId, 'pentavalente', '2ª dose', addDays(20));
    await this.addDose(sofiaId, 'rotavirus', '1ª dose', addDays(-2)); // atrasada

    const lucasId = await this.addChild('Lucas (exemplo)', new Date(2022, 5, 3), 'app-orange');
    await this.addDose(lucasId, 'bcg', 'Dose única', addDays(-1398));
    await this.applyDoseByExpected(lucasId, addDays(-1398));
    await this.addDose(lucasId, 'triplice-viral', '1ª dose', addDays(-695));
    await this.applyDoseByExpected(lucasId, addDays(-695));
    await this.addDose(lucasId, 'triplice-viral', '2ª dose', addDays(10)); // próxima
    await this.addDose(lucasId, 'hepatite-a', 'Dose única', addDays(-30)); // atrasada
  }

  /**
   * Auxiliar usado só pelo seed: marca como aplicada a dose mais recente
   * cadastrada com a data prevista informada (evita precisar do id de volta
   * do addDose, já que addDoc não retorna a sub-coleção pai facilmente aqui).
   */
  private async applyDoseByExpected(childId: string, expectedDate: Date): Promise<void> {
    const dosesRef = collection(this.firestore, `children/${childId}/doses`);
    const snapshot = await getDocs(
      query(dosesRef, where('expectedDate', '==', Timestamp.fromDate(expectedDate))),
    );
    const docSnap = snapshot.docs[0];
    if (docSnap) {
      await updateDoc(docSnap.ref, { appliedDate: Timestamp.fromDate(expectedDate) });
    }
  }

  /** Stream das doses de uma criança específica (sub-coleção). */
  getDoses$(childId: string): Observable<VaccineDose[]> {
    const dosesRef = collection(this.firestore, `children/${childId}/doses`);
    return (collectionData(dosesRef, { idField: 'id' }) as Observable<DoseDoc[]>).pipe(
      map((docs) =>
        docs.map(
          (d) =>
            new VaccineDose(
              d.id!,
              d.vaccineId,
              d.doseLabel,
              d.expectedDate.toDate(),
              d.appliedDate ? d.appliedDate.toDate() : null,
              d.location,
              d.batch,
              d.customName ?? null,
            ),
        ),
      ),
    );
  }
}
