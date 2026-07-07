import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { DialogAction, DialogMessage, DialogType } from '../models/shared/dialog-message.model';

export enum DialogResult {
  Confirmed = 'confirmed',
  Canceled = 'canceled',
  Ok = 'ok',
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private readonly dialogMessageSubject = new BehaviorSubject<DialogMessage | null>(null);
  private readonly dialogResultSubject = new BehaviorSubject<DialogResult | null>(null);

  readonly dialogMessage$: Observable<DialogMessage | null> = this.dialogMessageSubject.asObservable();
  readonly dialogResult$: Observable<DialogResult | null> = this.dialogResultSubject.asObservable();

  showDialog(type: DialogType, title: string, message: string): void {
    this.dialogMessageSubject.next({
      action: DialogAction.ShowDialog,
      type,
      title,
      message,
    });
  }

  clearDialog(): void {
    this.dialogMessageSubject.next(null);
  }

  sendResult(result: DialogResult): void {
    this.dialogResultSubject.next(result);
  }

  clearResult(): void {
    this.dialogResultSubject.next(null);
  }
}
