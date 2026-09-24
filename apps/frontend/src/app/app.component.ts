import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<main><h1>SI Warehouse</h1><router-outlet /></main>',
})
export class AppComponent {}
