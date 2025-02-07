import { Trend } from './model';

export function calcTrend(prices: number[]): Trend {
  if (prices.length < 2) {
    return 'no trend';
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
