export type ProductToPriceHistory = Record<number, number[]>;

export type PriceEvent = {
  productId: number;
  price: number;
};

export type Trend = 'up' | 'down' | 'no change';

export type PriceRecord = {
  productId: number;
  avgPrice: number;
  trend: Trend;
};

export type StreamItem<T> =
  | {
      value: T;
    }
  | {
      error: unknown;
    };
