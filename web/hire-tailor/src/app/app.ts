import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';

import { DialogAction, DialogMessage } from './models/shared/dialog-message.model';
import { DialogComponent } from './shared/dialog/dialog.component';
import { ConfirmDialogService, DialogResult } from './services/confirm-dialog.service';
import { SpinnerService } from './services/spinner.service';

@Component({
  selector: 'app-root',
  imports: [DialogComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly spinner = inject(SpinnerService);

  protected readonly spinnerVisible = this.spinner.visible;
  protected readonly dialogMessage = signal<DialogMessage | null>(null);

  constructor() {
    this.confirmDialog.dialogMessage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(message => {
        if (message?.action === DialogAction.ShowDialog) {
          this.dialogMessage.set(message);
        }
      });
  }

  protected closeDialog(result: DialogResult): void {
    this.confirmDialog.sendResult(result);
    this.dialogMessage.set(null);
    this.confirmDialog.clearDialog();
  }
}
