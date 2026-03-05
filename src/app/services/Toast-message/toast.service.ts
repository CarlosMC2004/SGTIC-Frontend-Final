import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  mensaje: string;
  tipo: 'exito' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  toast$ = this.toastSubject.asObservable();

  mostrarExito(mensaje: string) {
    this.toastSubject.next({ mensaje, tipo: 'exito' });
  }

  mostrarError(mensaje: string) {
    this.toastSubject.next({ mensaje, tipo: 'error' });
  }
}