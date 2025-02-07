import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PriceService } from './price.service';
import { pricesResource } from './prices-resource';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'prices';
  // priceService = inject(PriceService);
  // prices$ = this.priceService.prices$;

  pricesResource = pricesResource();

}
