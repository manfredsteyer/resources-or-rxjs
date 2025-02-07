import { resource, signal } from '@angular/core';
import { PriceEvent, PriceRecord, ProductToPriceHistory, StreamItem, Trend } from './model';
import { calcTrend } from './calc-trend';

const history: ProductToPriceHistory = {};

export function pricesResource() {
  return resource({
    defaultValue: [],
    stream: async (param) => {
      const stream = signal<StreamItem<PriceRecord[]>>({ value: [] });

      const ref = setInterval(() => {
        const event = produceEvent();
        processEvent(event, history);
        const result = toResult(history);
        stream.set({value: result});
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

function processEvent(
  priceEvent: PriceEvent,
  history: ProductToPriceHistory
): void {
  ensureProduct(priceEvent);

  const entry = history[priceEvent.productId];
  entry.push(priceEvent.price);

  const updated = calcWindow(entry, 10);
  history[priceEvent.productId] = updated;
}

function toResult(history: ProductToPriceHistory): PriceRecord[] {
  const productIds = Object.keys(history).map(
    (productId) => parseInt(productId) as keyof ProductToPriceHistory
  );

  return productIds
    .map(
      (productId) =>
        ({
          productId,
          avgPrice: calcAvg(history[productId]),
          trend: calcTrend(history[productId]),
        } as PriceRecord)
    )
    // mimic behavior of buffer and pairwise
    .filter(record => record.avgPrice > -1 && record.trend !== 'no trend')
    .sort((record) => record.productId);
}

function calcAvg(prices: number[]): number {
  if (prices.length != 10) {
    return -1;
  }
  return prices.reduce((acc, cur) => acc + cur, 0) / prices.length;
}

function calcWindow(entry: number[], windowSize: number) {
  return entry.slice(Math.max(0, entry.length - windowSize), entry.length);
}

function ensureProduct(priceEvent: PriceEvent) {
  if (!history[priceEvent.productId]) {
    history[priceEvent.productId] = [];
  }
}
