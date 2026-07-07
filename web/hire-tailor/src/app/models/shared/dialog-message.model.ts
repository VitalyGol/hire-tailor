export enum DialogAction {
  ShowDialog = 'showDialog',
}

export enum DialogType {
  Confirm = 'confirm',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
}

export interface DialogMessage {
  action: DialogAction;
  type: DialogType;
  title: string;
  message: string;
}
