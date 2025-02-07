import { Component, computed, inject, signal } from '@angular/core';
import { PriceService } from './price.service';
import { pricesResource } from './prices-resource';
import { PriceRecord } from './model';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

type UserPreferences = Record<number, boolean>;

@Component({
  selector: 'app-root',
  imports: [DecimalPipe, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'prices';
  priceService = inject(PriceService);

  // Signal Implementation
  preferences = signal<UserPreferences>({0: false});
  pricesResource = pricesResource();
  filtered = computed(() => filterByPreferences(this.pricesResource.value(), this.preferences())); 

  // RxJS Implementation
  preferences$ = new BehaviorSubject<UserPreferences>({1: false});
  prices$ = this.priceService.prices$;
  filtered$ = combineLatest([this.prices$, this.preferences$]).pipe(
    map(([records, preferences]) => filterByPreferences(records, preferences))
  );

}

function filterByPreferences(records: PriceRecord[], preferences: UserPreferences) {
  return records.filter(r => preferences[r.productId] !== false);
}