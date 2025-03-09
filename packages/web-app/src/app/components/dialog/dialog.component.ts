import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'dialog-box',
  templateUrl: './dialog.component.html',
  standalone: false,
})
export class DialogComponent {
  public acceptLabel: string;
  public cancelLabel: string;
  public content: string;
  public title: string;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogConfig,
  ) {
    this.acceptLabel = data?.acceptLabel ?? 'Ok';
    this.cancelLabel = data?.cancelLabel ?? 'Cancel';
    this.content = data?.content ?? 'Perform action?';
    this.title = data?.title ?? 'Confirm';
  }
}

export interface ConfirmationDialogConfig {
  acceptLabel: string;
  cancelLabel: string;
  content: string;
  title: string;
}
