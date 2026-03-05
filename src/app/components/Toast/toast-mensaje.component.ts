import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-mensaje',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="visible">
      <div class="toast-mensaje" [ngClass]="tipo">
        <span class="material-symbols-outlined">
          {{ tipo === 'exito' ? 'check_circle' : 'error' }}
        </span>
        <span>{{ mensaje }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      animation: slideIn 0.3s ease;
    }
    .toast-mensaje {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 14px;
      font-weight: 500;
    }
    .toast-mensaje.exito {
      background-color: #4caf50;
      color: white;
    }
    .toast-mensaje.error {
      background-color: #f44336;
      color: white;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastMensajeComponent {
  visible = false;
  mensaje = '';
  tipo: 'exito' | 'error' = 'exito';
  private timeoutId: any;

  mostrarToast(mensaje: string, tipo: 'exito' | 'error' = 'exito') {
    // Limpiar timeout anterior
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Reiniciar estado
    this.mensaje = mensaje;
    this.tipo = tipo;
    this.visible = true;

    // Ocultar después de 2 segundos
    this.timeoutId = setTimeout(() => {
      this.visible = false;
      this.timeoutId = null;
    }, 1000);
  }
}