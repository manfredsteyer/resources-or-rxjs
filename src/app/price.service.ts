import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
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
  private priceStream$ = interval(10).pipe(
    map(() => ({
      productId: Math.floor(Math.random() * 10),
      price: Math.floor(Math.random() * 201) + 100,
    }))
  );

  private statisticStream$ = this.priceStream$.pipe(
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
          trend: calcTrend(prev.avgPrice, curr.avgPrice)
        }))
      )
    )
  );

  prices$ = this.statisticStream$.pipe(
    scan((acc, marketData) => {
      return { 
        ...acc,
        [marketData.productId]: marketData
      };
    }, {} as Record<number, PriceRecord>),
    map((acc) => Object.values(acc))
  );
}
