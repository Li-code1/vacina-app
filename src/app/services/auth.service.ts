import { Injectable } from '@angular/core';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { user as authState } from '@angular/fire/auth';

/**
 * Centraliza toda a comunicação com o Firebase Authentication.
 * Nenhuma senha é manipulada ou armazenada pela aplicação:
 * tudo é delegado ao Firebase (hash, tokens, expiração de sessão).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Stream reativo do usuário autenticado (null quando deslogado). */
  readonly user$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.user$ = authState(this.auth);
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  async register(name: string, email: string, password: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    // Exige confirmação de e-mail antes de liberar o uso completo da plataforma.
    await sendEmailVerification(credential.user);
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  isEmailVerified(): boolean {
    return !!this.auth.currentUser?.emailVerified;
  }
}
