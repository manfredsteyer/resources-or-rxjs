import { resource, signal } from '@angular/core';
import { PriceEvent, PriceRecord, ProductToPriceHistory, StreamItem, Trend } from './model';

const history: ProductToPriceHistory = {};

export function pricesResource() {
  return resource({
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
    .sort((record) => record.productId);
}

function calcAvg(prices: number[]): number {
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

function calcTrend(prices: number[]): Trend {
  if (prices.length < 2) {
    return 'no change';
  }

  const latest = prices.at(-1) as number;
  const before = prices.at(-2) as number;

  if (latest < before) {
    return 'down';
  }

  if (before < latest) {
    return 'up';
  }

  return 'no change';
}
