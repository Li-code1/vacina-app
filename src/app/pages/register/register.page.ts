import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonItem,
  IonIcon,
  IonInput,
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { ChildService } from '../../services/child.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonItem,
    IonIcon,
    IonInput,
    IonButton,
    IonSpinner,
  ],
  template: `
    <ion-content [fullscreen]="true" class="auth-content">
      <div class="screen">
        <div class="hero">
          <ion-icon name="person-outline"></ion-icon>
          <h1>Criar conta</h1>
          <p>Leva menos de um minuto.</p>
        </div>

        <div class="auth-wrap">
          <div class="auth-card">
            <form [formGroup]="form" (ngSubmit)="submit()">
              <ion-item class="auth-item">
                <ion-icon name="person-outline" slot="start"></ion-icon>
                <ion-input placeholder="Seu nome" formControlName="name"></ion-input>
              </ion-item>

              <ion-item class="auth-item">
                <ion-icon name="mail-outline" slot="start"></ion-icon>
                <ion-input type="email" placeholder="E-mail" formControlName="email"></ion-input>
              </ion-item>

              <ion-item class="auth-item">
                <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
                <ion-input
                  type="password"
                  placeholder="Senha (mín. 6 caracteres)"
                  formControlName="password"
                ></ion-input>
              </ion-item>

              <ion-item class="auth-item">
                <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
                <ion-input
                  type="password"
                  placeholder="Confirmar senha"
                  formControlName="confirmPassword"
                ></ion-input>
              </ion-item>

              <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

              <ion-button
                expand="block"
                type="submit"
                color="app-brown"
                [disabled]="form.invalid || loading"
                class="submit-btn"
              >
                <ion-spinner *ngIf="loading" name="crescent"></ion-spinner>
                <span *ngIf="!loading">Criar conta</span>
              </ion-button>
            </form>
          </div>

          <p class="switch">
            Já tem conta?
            <a routerLink="/login">Entrar</a>
          </p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .auth-content { --background: var(--ion-background-color); --padding-top: 0; --padding-bottom: 0; }

      .screen {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .hero {
        background: linear-gradient(135deg, var(--app-yellow), var(--app-orange));
        padding: 24px 24px 28px;
        text-align: center;
        border-bottom-left-radius: 32px;
        border-bottom-right-radius: 32px;
        color: var(--app-brown);
      }
      .hero ion-icon { font-size: 30px; }
      .hero h1 { margin: 6px 0 4px; font-size: 1.5rem; font-weight: 700; }
      .hero p { margin: 0; opacity: 0.85; font-size: 0.9rem; }

      .auth-wrap { max-width: 380px; margin: -20px auto 0; padding: 0 20px 24px; position: relative; width: 100%; box-sizing: border-box; }
      .auth-card {
        background: #fff;
        border-radius: 20px;
        padding: 20px 18px;
        box-shadow: 0 8px 24px rgba(71, 60, 51, 0.12);
      }
      .auth-item { --background: #fff; --inner-border-width: 0; border: 1px solid #e8ddc8; border-radius: 12px; margin-bottom: 12px; }
      .submit-btn { margin-top: 6px; font-weight: 600; }
      .error { color: #c0594a; font-size: 0.85rem; font-weight: 500; }
      .switch { text-align: center; margin-top: 16px; color: #8a7d72; }
      .switch a { color: var(--app-brown); font-weight: 700; text-decoration: none; }
    `,
  ],
})
export class RegisterPage {
  loading = false;
  errorMessage = '';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private childService: ChildService,
    private router: Router,
  ) {}

  async submit() {
    if (this.form.invalid) return;
    const { name, email, password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    try {
      await this.authService.register(name!, email!, password!);
      await this.childService.seedDemoChildren();
      alert(
        'Conta criada! Já deixamos duas crianças de exemplo cadastradas para você explorar o app. Enviamos também um e-mail de confirmação para ' +
          email,
      );
      this.router.navigate(['/login']);
    } catch (err) {
      this.errorMessage = this.translateError(err);
    } finally {
      this.loading = false;
    }
  }

  private translateError(err: unknown): string {
    const code = (err as { code?: string })?.code ?? '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este e-mail já está cadastrado.';
      case 'auth/weak-password':
        return 'A senha precisa ter pelo menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'E-mail inválido.';
      default:
        return 'Não foi possível criar a conta. Tente novamente.';
    }
  }
}
