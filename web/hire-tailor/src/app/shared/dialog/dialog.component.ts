import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DialogType } from '../../models/shared/dialog-message.model';
import { DialogResult } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-dialog',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  @Input({ required: true }) type: DialogType = DialogType.Info;
  @Input({ required: true }) title = '';
  @Input({ required: true }) message = '';

  @Output() dialogResult = new EventEmitter<DialogResult>();

  protected readonly dialogType = DialogType;
  protected readonly result = DialogResult;
}
