import { Injectable } from '@angular/core';
import { interval, Subject, combineLatest } from 'rxjs';
import {
  map,
  groupBy,
  mergeMap,
  bufferCount,
  pairwise,
  scan,
  startWith,
} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PriceService {
  priceStream$ = interval(10).pipe(
    map(() => ({
      productId: Math.floor(Math.random() * 10),
      price: Math.floor(Math.random() * 201) + 100,
    }))
  );

  userTracking$ = new Subject<{ productId: number; show: boolean }>();

  userPreferences$ = this.userTracking$.pipe(
    scan(
      (acc, update) => ({ ...acc, [update.productId]: update.show }),
      {} as Record<number, boolean>
    ), 
    startWith({} as Record<number, boolean>)
  );

  processedStream$ = this.priceStream$.pipe(
    groupBy((data) => data.productId),
    mergeMap((group$) =>
      group$.pipe(
        bufferCount(10, 1),
        map((prices) => ({
          productId: group$.key,
          avgPrice: prices.reduce((sum, p) => sum + p.price, 0) / prices.length,
        })),

        pairwise(),

        map(([prev, curr]) => ({
          productId: curr.productId,
          avgPrice: curr.avgPrice,
          trend:
            prev.avgPrice < curr.avgPrice
              ? 'up'
              : prev.avgPrice > curr.avgPrice
              ? 'down'
              : 'no change',
        }))
      )
    )
  );

  prices$ = combineLatest([this.processedStream$, this.userPreferences$]).pipe(
    scan((acc, [marketData, userPrefs]) => {
      if (userPrefs[marketData.productId] === false) {
        delete acc[marketData.productId];
      } else {
        acc[marketData.productId] = marketData;
      }
      return { ...acc };
    }, {} as Record<number, { productId: number; avgPrice: number; trend: string }>),
    map((acc) => Object.values(acc))
  );
}
