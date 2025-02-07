import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { PriceService } from './price.service';
import { pricesResource } from './prices-resource';
import { AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [DecimalPipe, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  priceService = inject(PriceService);

  // Signal Implementation
  pricesResource = pricesResource();

  // RxJS Implementation
  prices$ = this.priceService.prices$;

  // Bridge using rxResouce
  pricesRxResource = rxResource({
    defaultValue: [],
    loader: () => this.priceService.prices$
  });
}
