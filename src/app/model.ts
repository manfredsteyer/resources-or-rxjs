export type ProductToPriceHistory = Record<number, number[]>;

export type ProductToFormerAvg = Record<number, number>;

export type ProductToPriceRecord = Record<number, PriceRecord>;

export type ProductHistory = {
  priceHistory: ProductToPriceHistory;
  formerAvg: ProductToFormerAvg;
  priceRecords: ProductToPriceRecord;
};

export type PriceEvent = {
  productId: number;
  price: number;
};

export type Trend = 'up' | 'down' | 'no change' | 'no trend';

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
