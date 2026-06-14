import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SpinnerService } from './services/spinner.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly spinner = inject(SpinnerService);

  protected readonly spinnerVisible = this.spinner.visible;
}
