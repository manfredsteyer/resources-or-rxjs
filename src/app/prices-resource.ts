//
// This is a _negative_ example for not using RxJS for a
// case where its possibilities would provide a huge advantage
//

import { resource, signal } from '@angular/core';
import {
  PriceEvent,
  PriceRecord,
  ProductHistory,
  ProductToPriceHistory,
  StreamItem,
} from './model';
import { calcTrend } from './calc-trend';

export function pricesResource() {

  const history: ProductHistory = {
    priceHistory: {},
    formerAvg: {},
    priceRecords: {},
  };

  return resource({
    defaultValue: [],
    stream: async (param) => {
      const stream = signal<StreamItem<PriceRecord[]>>({ value: [] });

      const ref = setInterval(() => {
        const event = produceEvent();
        processEvent(event, history);
        const result = toResult(history);
        stream.set({ value: result });
      }, 10);

      param.abortSignal.addEventListener('abort', () => {
        clearInterval(ref);
      });

      return stream;
    },
  });
}

function produceEvent(): PriceEvent {
  return {
    productId: Math.floor(Math.random() * 10),
    price: Math.floor(Math.random() * 201) + 100,
  };
}

function processEvent(priceEvent: PriceEvent, history: ProductHistory): void {
  ensureProduct(priceEvent, history.priceHistory);

  const entry = history.priceHistory[priceEvent.productId];
  entry.push(priceEvent.price);
  const updated = calcWindow(entry, 10);
  history.priceHistory[priceEvent.productId] = updated;

  const record = toPriceRecord(priceEvent.productId, history);
  if (record.avgPrice > -1 && record.trend !== 'no trend') {
    history.priceRecords[priceEvent.productId] = record;
  }
  if (record.avgPrice > -1) {
    history.formerAvg[priceEvent.productId] = record.avgPrice;
  }
}

function toResult(history: ProductHistory): PriceRecord[] {
  return Object.values(history.priceRecords);
}

function toPriceRecord(
  productId: number,
  history: ProductHistory
): PriceRecord {
  const prices = history.priceHistory[productId];

  if (prices.length != 10) {
    return {
      productId,
      avgPrice: -1,
      trend: 'no trend',
    };
  }

  const avg = prices.reduce((acc, cur) => acc + cur, 0) / prices.length;
  const formerAvg = history.formerAvg[productId];

  if (typeof formerAvg === 'undefined') {
    return {
      productId,
      avgPrice: avg,
      trend: 'no trend',
    };
  }

  return {
    productId,
    avgPrice: avg,
    trend: calcTrend(formerAvg, avg),
  };
}

function calcWindow(entry: number[], windowSize: number) {
  return entry.slice(Math.max(0, entry.length - windowSize), entry.length);
}

function ensureProduct(priceEvent: PriceEvent, history: ProductToPriceHistory) {
  if (!history[priceEvent.productId]) {
    history[priceEvent.productId] = [];
  }
}
