/**
 * Rounds a number using banker's rounding (round half to even) at the given decimal precision.
 * This avoids cumulative rounding bias — values exactly at the midpoint round toward
 * the nearest even digit instead of always rounding up.
 *
 * @example
 * bankersRound(1.23455) // 1.2346  (5 is odd → rounds up)
 * bankersRound(1.23465) // 1.2346  (6 is even → rounds down)
 */
const bankersRound = (value: number, decimals: number = 4): number => {
  const factor = 10 ** decimals;
  const shifted = value * factor;
  const floored = Math.floor(shifted);
  const remainder = shifted - floored;
  if (Math.abs(remainder - 0.5) < Number.EPSILON) {
    return (floored % 2 === 0 ? floored : floored + 1) / factor;
  }
  return Math.round(shifted) / factor;
};

export const formatters = {
  /**
   * Converts a decimal fraction to its percentage value, rounded with banker's rounding (4 decimal places).
   *
   * @example
   * formatters.percentage(0.20000001) // 20.0
   * formatters.percentage(0.1255)     // 12.55
   */
  percentage: (value: number): number => bankersRound(value * 100),

  /**
   * Rounds a number with banker's rounding (4 decimal places).
   *
   * @example
   * formatters.number(1.23455) // 1.2346
   * formatters.number(1.23465) // 1.2346
   */
  number: (value: number): number => bankersRound(value),
};
