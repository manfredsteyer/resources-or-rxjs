import { Injectable } from '@angular/core';
import { interval, Subject } from 'rxjs';
import {
  map,
  groupBy,
  mergeMap,
  bufferCount,
  pairwise,
  scan,
} from 'rxjs/operators';
import { PriceRecord } from './model';
import { calcTrend } from './calc-trend';

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
          trend: calcTrend([prev.avgPrice, curr.avgPrice])
        }))
      )
    )
  );

  prices$ = this.processedStream$.pipe(
    scan((acc, marketData) => {
      acc[marketData.productId] = marketData;
      return { ...acc };
    }, {} as Record<number, { productId: number; avgPrice: number; trend: string }>),
    map((acc) => Object.values(acc) as PriceRecord[])
  );
}
