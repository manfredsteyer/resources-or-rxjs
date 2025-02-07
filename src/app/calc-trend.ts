import { Trend } from './model';

export function calcTrend(formerAvg: number, currentAvg: number): Trend {
  if (currentAvg < formerAvg) {
    return 'down';
  }

  if (formerAvg < currentAvg) {
    return 'up';
  }

  return 'no change';
}
