import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, RouterLink],
  template: `
    <ion-content [fullscreen]="true" class="auth-content">
      <div class="screen">
        <div class="hero">
          <ion-icon name="medkit-outline"></ion-icon>
          <h1>VacinaJá</h1>
          <p>Acompanhe a saúde vacinal da sua família.</p>
        </div>

        <div class="auth-wrap">
          <div class="auth-card">
            <form [formGroup]="form" (ngSubmit)="submit()">
              <ion-item class="auth-item">
                <ion-icon name="mail-outline" slot="start"></ion-icon>
                <ion-input
                  type="email"
                  placeholder="E-mail"
                  formControlName="email"
                  autocomplete="email"
                ></ion-input>
              </ion-item>

              <ion-item class="auth-item">
                <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
                <ion-input
                  type="password"
                  placeholder="Senha"
                  formControlName="password"
                  autocomplete="current-password"
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
                <span *ngIf="!loading">Entrar</span>
              </ion-button>

              <ion-button fill="clear" size="small" color="medium" (click)="forgotPassword()" type="button">
                Esqueci minha senha
              </ion-button>
            </form>
          </div>

          <p class="switch">
            Não tem conta?
            <a routerLink="/register">Cadastre-se</a>
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
        background: linear-gradient(135deg, var(--app-green), var(--app-orange));
        padding: 28px 24px 32px;
        text-align: center;
        border-bottom-left-radius: 32px;
        border-bottom-right-radius: 32px;
        color: var(--app-brown);
      }
      .hero ion-icon { font-size: 32px; }
      .hero h1 { margin: 6px 0 4px; font-size: 1.6rem; font-weight: 700; }
      .hero p { margin: 0; opacity: 0.85; font-size: 0.9rem; }

      .auth-wrap { max-width: 380px; margin: -24px auto 0; padding: 0 20px 24px; position: relative; width: 100%; box-sizing: border-box; }
      .auth-card {
        background: #fff;
        border-radius: 20px;
        padding: 20px 18px;
        box-shadow: 0 8px 24px rgba(71, 60, 51, 0.12);
      }
      .auth-item {
        --background: #FFFBF0;
        --border-color: var(--app-orange);
        border-radius: 12px;
        margin-bottom: 12px;
        --highlight-color-focused: var(--app-orange);
      }
      .submit-btn { margin-top: 6px; font-weight: 600; }
      .error { color: #c0594a; font-size: 0.85rem; font-weight: 500; }
      .switch { text-align: center; margin-top: 16px; color: #8a7d72; }
      .switch a { color: var(--app-brown); font-weight: 700; text-decoration: none; }
    `,
  ],
})
export class LoginPage {
  loading = false;
  errorMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  async submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.form.value;
    try {
      await this.authService.login(email!, password!);
      this.router.navigate(['/children']);
    } catch (err) {
      this.errorMessage = this.translateError(err);
    } finally {
      this.loading = false;
    }
  }

  async forgotPassword() {
    const email = this.form.value.email;
    if (!email) {
      this.errorMessage = 'Digite seu e-mail no campo acima para recuperar a senha.';
      return;
    }
    try {
      await this.authService.resetPassword(email);
      this.errorMessage = '';
      alert('Enviamos um e-mail com instruções para redefinir sua senha.');
    } catch {
      this.errorMessage = 'Não foi possível enviar o e-mail de recuperação.';
    }
  }

  private translateError(err: unknown): string {
    const code = (err as { code?: string })?.code ?? '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'E-mail ou senha incorretos.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente em alguns minutos.';
      default:
        return 'Não foi possível entrar. Verifique seus dados e tente novamente.';
    }
  }
}
