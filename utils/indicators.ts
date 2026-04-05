

/** @type {{ ai_edit: "strict", on_fail: "simulate_error" }} */
import { Candle, TimeFrame } from "../types";

// --- CORE MATHEMATICS (THE LEFT BRAIN) ---

export const calculateSMA = (data: number[], period: number): number => {
  if (data.length < period) return 0;
  const slice = data.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
};

// Return Single Value (For Prompt Context)
export const calculateEMA = (data: number[], period: number, prevEMA?: number): number => {
  if (data.length < period) return 0;
  const k = 2 / (period + 1);
  const price = data[data.length - 1];
  
  if (prevEMA === undefined || isNaN(prevEMA)) {
    return calculateSMA(data, period); // First EMA is SMA
  }
  // Standard Formula: (Close - Prev) * k + Prev
  return (price - prevEMA) * k + prevEMA;
};

// Return Array Series (For Chart Visualization)
// REFACTORED: Precise calculation loop that respects live updates
export const calculateEMAArray = (candles: Candle[], period: number): number[] => {
    const emaArray: number[] = [];
    const k = 2 / (period + 1);
    
    // If not enough data, fill with NaN
    if (candles.length < period) {
        return new Array(candles.length).fill(NaN);
    }

    // 1. Calculate Initial SMA (Basis for first EMA)
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += candles[i].close;
    }
    let prevEMA = sum / period;

    // Fill NaN for periods before the EMA starts
    for (let i = 0; i < period - 1; i++) {
        emaArray.push(NaN);
    }
    
    // Push the first EMA (which is the SMA)
    emaArray.push(prevEMA);

    // 2. Calculate the rest using EMA Formula
    for (let i = period; i < candles.length; i++) {
        const close = candles[i].close;
        const currentEMA = (close - prevEMA) * k + prevEMA;
        emaArray.push(currentEMA);
        prevEMA = currentEMA;
    }

    return emaArray;
};

// --- NEW: EMA STRUCTURAL ANALYSIS (BASED ON USER MATERIAL) ---
export const analyzeEMACondition = (candles: Candle[]) => {
    const ema50Array = calculateEMAArray(candles, 50);
    const ema200Array = calculateEMAArray(candles, 200);

    const currentIdx = candles.length - 1;
    const prevIdx = candles.length - 2;

    if (currentIdx < 201) return { bias: 'NEUTRAL', cross: 'NONE', zone: 'NONE' };

    const currPrice = candles[currentIdx].close;
    const curr50 = ema50Array[currentIdx];
    const curr200 = ema200Array[currentIdx];
    
    const prev50 = ema50Array[prevIdx];
    const prev200 = ema200Array[prevIdx];

    // 1. BIAS DETERMINATION (Rule: Price vs EMA 200)
    let bias = 'RANGING';
    if (currPrice > curr200) bias = 'BULLISH (Bias BUY)';
    else if (currPrice < curr200) bias = 'BEARISH (Bias SELL)';

    // 2. CROSS DETECTION
    let cross = 'NONE';
    if (prev50 < prev200 && curr50 > curr200) cross = 'GOLDEN CROSS (Start Uptrend)';
    else if (prev50 > prev200 && curr50 < curr200) cross = 'DEATH CROSS (Start Downtrend)';

    // 3. DYNAMIC ZONE DETECTION (Price vs EMA 50)
    // Check distance percent to EMA 50
    const distTo50 = Math.abs(currPrice - curr50) / curr50 * 100;
    let zone = 'FAR';
    if (distTo50 < 0.05) zone = 'AT EMA 50 (Dynamic S/R)';

    return {
        bias,
        cross,
        zone,
        values: { ema50: curr50, ema200: curr200 }
    };
};

// Return Array Series for Bollinger Bands
export const calculateBollingerBandsArray = (candles: Candle[], period: number = 20, multiplier: number = 2) => {
    const upper: number[] = [];
    const lower: number[] = [];
    const closes = candles.map(c => c.close);

    for (let i = 0; i < candles.length; i++) {
        if (i < period - 1) {
            upper.push(NaN);
            lower.push(NaN);
            continue;
        }

        const slice = closes.slice(i - period + 1, i + 1);
        const sum = slice.reduce((a, b) => a + b, 0);
        const mean = sum / period;

        const squaredDiffs = slice.map(val => Math.pow(val - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / period;
        const stdDev = Math.sqrt(avgSquaredDiff);

        upper.push(mean + (multiplier * stdDev));
        lower.push(mean - (multiplier * stdDev));
    }
    return { upper, lower };
};

export const calculateRSI = (candles: Candle[], period: number = 14): number => {
  if (candles.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  // Calculate initial average
  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Smooth it (Wilder's Smoothing) for the rest
  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

export const calculateBollingerBands = (candles: Candle[], period: number = 20, multiplier: number = 2) => {
  if (candles.length < period) return { upper: 0, middle: 0, lower: 0 };
  
  const closes = candles.map(c => c.close);
  const middle = calculateSMA(closes, period); 
  
  const slice = closes.slice(-period);
  const squaredDiffs = slice.map(val => Math.pow(val - middle, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const stdDev = Math.sqrt(avgSquaredDiff);

  return {
    upper: middle + (multiplier * stdDev),
    middle: middle,
    lower: middle - (multiplier * stdDev)
  };
};

export const calculateATR = (candles: Candle[], period: number = 14): number => {
  if (candles.length < period + 1) return 0;

  const trs: number[] = [];
  for(let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const closePrev = candles[i-1].close;
    
    const tr = Math.max(
      high - low,
      Math.abs(high - closePrev),
      Math.abs(low - closePrev)
    );
    trs.push(tr);
  }

  return calculateSMA(trs, period);
};

export const calculateStochastic = (candles: Candle[], periodK: number = 14, periodD: number = 3): { k: number, d: number } => {
  if (candles.length < periodK) return { k: 50, d: 50 };

  const kValues: number[] = [];
  
  for (let i = periodK - 1; i < candles.length; i++) {
    const slice = candles.slice(i - periodK + 1, i + 1);
    const highestHigh = Math.max(...slice.map(c => c.high));
    const lowestLow = Math.min(...slice.map(c => c.low));
    const currentClose = candles[i].close;
    
    let k = 50;
    if (highestHigh - lowestLow !== 0) {
      k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    }
    kValues.push(k);
  }

  const currentK = kValues[kValues.length - 1];
  const currentD = calculateSMA(kValues, periodD);

  return { k: currentK, d: currentD };
};

export interface CandlestickPattern {
    name: string;
    type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strength: number; // 1-3
}

export const detectCandlestickPatterns = (candles: Candle[]): CandlestickPattern[] => {
    if (candles.length < 5) return [];

    const patterns: CandlestickPattern[] = [];
    const c = candles[candles.length - 1]; // Current
    const c1 = candles[candles.length - 2]; // Previous
    const c2 = candles[candles.length - 3]; // 2nd Previous
    const c3 = candles[candles.length - 4]; // 3rd Previous
    const c4 = candles[candles.length - 5]; // 4th Previous

    const body = Math.abs(c.close - c.open);
    const upperShadow = c.high - Math.max(c.close, c.open);
    const lowerShadow = Math.min(c.close, c.open) - c.low;
    const isBullish = c.close > c.open;
    const isBearish = c.close < c.open;
    const isDoji = body <= 0.1 * (c.high - c.low);

    const body1 = Math.abs(c1.close - c1.open);
    const upperShadow1 = c1.high - Math.max(c1.close, c1.open);
    const isBullish1 = c1.close > c1.open;
    const isBearish1 = c1.close < c1.open;
    const isDoji1 = body1 <= 0.1 * (c1.high - c1.low);

    const body2 = Math.abs(c2.close - c2.open);
    const isBullish2 = c2.close > c2.open;
    const isBearish2 = c2.close < c2.open;
    const isDoji2 = body2 <= 0.1 * (c2.high - c2.low);

    const body3 = Math.abs(c3.close - c3.open);
    const isBullish3 = c3.close > c3.open;
    const isBearish3 = c3.close < c3.open;

    const body4 = Math.abs(c4.close - c4.open);
    const isBullish4 = c4.close > c4.open;
    const isBearish4 = c4.close < c4.open;

    // Helper: Trend detection (simple)
    const isUptrend = c1.close > c2.close && c2.close > c3.close;
    const isDowntrend = c1.close < c2.close && c2.close < c3.close;

    const avgBody = (body + body1 + body2 + body3) / 4;
    const isLongBody = body > avgBody * 1.5;
    const isShortBody = body < avgBody * 0.5;

    // --- 1. SINGLE CANDLE PATTERNS (15) ---
    
    // 1. Hammer: B kecil & D >= 2B & U kecil & C > O
    if (isShortBody && lowerShadow >= 2 * body && upperShadow <= 0.1 * body && isBullish) {
        patterns.push({ name: 'Hammer', type: 'BULLISH', strength: 2 });
    }
    // 2. Hanging Man: Hammer in uptrend
    if (isShortBody && lowerShadow >= 2 * body && upperShadow <= 0.1 * body && isUptrend) {
        patterns.push({ name: 'Hanging Man', type: 'BEARISH', strength: 2 });
    }
    // 3. Inverted Hammer: B kecil & U >= 2B & D kecil
    if (isShortBody && upperShadow >= 2 * body && lowerShadow <= 0.1 * body) {
        patterns.push({ name: 'Inverted Hammer', type: 'BULLISH', strength: 1 });
    }
    // 4. Shooting Star: Inverted Hammer in uptrend
    if (isShortBody && upperShadow >= 2 * body && lowerShadow <= 0.1 * body && isUptrend) {
        patterns.push({ name: 'Shooting Star', type: 'BEARISH', strength: 2 });
    }
    // 5. Bullish Marubozu
    if (isBullish && upperShadow < 0.05 * body && lowerShadow < 0.05 * body && isLongBody) {
        patterns.push({ name: 'Bullish Marubozu', type: 'BULLISH', strength: 3 });
    }
    // 6. Bearish Marubozu
    if (isBearish && upperShadow < 0.05 * body && lowerShadow < 0.05 * body && isLongBody) {
        patterns.push({ name: 'Bearish Marubozu', type: 'BEARISH', strength: 3 });
    }
    // 7-11. Dojis
    if (isDoji) {
        if (upperShadow > 3 * body && lowerShadow > 3 * body) patterns.push({ name: 'Long-Legged Doji', type: 'NEUTRAL', strength: 1 });
        else if (lowerShadow > 3 * body && upperShadow <= 0.1 * body) patterns.push({ name: 'Dragonfly Doji', type: 'BULLISH', strength: 2 });
        else if (upperShadow > 3 * body && lowerShadow <= 0.1 * body) patterns.push({ name: 'Gravestone Doji', type: 'BEARISH', strength: 2 });
        else if (c.open === c.high && c.high === c.low && c.low === c.close) patterns.push({ name: 'Four Price Doji', type: 'NEUTRAL', strength: 1 });
        else patterns.push({ name: 'Standard Doji', type: 'NEUTRAL', strength: 1 });
    }
    // 12. Spinning Top
    if (isShortBody && upperShadow > body && lowerShadow > body && !isDoji) {
        patterns.push({ name: 'Spinning Top', type: 'NEUTRAL', strength: 1 });
    }
    // 13. Long Bullish Candle
    if (isBullish && isLongBody) patterns.push({ name: 'Long Bullish Candle', type: 'BULLISH', strength: 2 });
    // 14. Long Bearish Candle
    if (isBearish && isLongBody) patterns.push({ name: 'Long Bearish Candle', type: 'BEARISH', strength: 2 });
    // 15. Short Body Candle
    if (isShortBody && !isDoji) patterns.push({ name: 'Short Body Candle', type: 'NEUTRAL', strength: 1 });

    // --- 2. DOUBLE CANDLE PATTERNS (15) ---
    
    // 16. Bullish Engulfing (Updated based on PDF "BULLISH ENGULFING")
    // Rules: Strong green candle that 'engulfs' the prior red candle body (disregard wicks). Occurs at bottom of downward trend.
    // Stronger if prior is doji.
    if (isBearish1 && isBullish && body > body1 && c.open <= c1.close && c.close >= c1.open && isDowntrend) {
        let strength = 2;
        if (isDoji1) strength = 3; // Stronger signal if red candle is a doji
        patterns.push({ name: 'Bullish Engulfing', type: 'BULLISH', strength: strength });
    }
    
    // 17. Bearish Engulfing
    if (isBullish1 && isBearish && body > body1 && c.open >= c1.close && c.close <= c1.open && isUptrend) {
        let strength = 2;
        if (isDoji1) strength = 3;
        patterns.push({ name: 'Bearish Engulfing', type: 'BEARISH', strength: strength });
    }
    // 18. Piercing Line
    if (isBearish1 && isBullish && c.open < c1.close && c.close > (c1.open + c1.close) / 2 && c.close < c1.open) {
        patterns.push({ name: 'Piercing Line', type: 'BULLISH', strength: 2 });
    }
    // 19. Dark Cloud Cover
    if (isBullish1 && isBearish && c.open > c1.close && c.close < (c1.open + c1.close) / 2 && c.close > c1.open) {
        patterns.push({ name: 'Dark Cloud Cover', type: 'BEARISH', strength: 2 });
    }
    // 20. Bullish Harami
    if (isBearish1 && isBullish && body <= body1 * 0.25 && c.open > c1.close && c.close < c1.open) {
        patterns.push({ name: 'Bullish Harami', type: 'BULLISH', strength: 2 });
    }
    // 21. Bearish Harami
    if (isBullish1 && isBearish && body <= body1 * 0.25 && c.open < c1.close && c.close > c1.open) {
        patterns.push({ name: 'Bearish Harami', type: 'BEARISH', strength: 2 });
    }
    // 22. Harami Cross
    if (body1 > body && c.high < Math.max(c1.open, c1.close) && c.low > Math.min(c1.open, c1.close) && isDoji) {
        patterns.push({ name: 'Harami Cross', type: 'NEUTRAL', strength: 2 });
    }
    // 23. Tweezer Top
    if (isBullish1 && isBearish && Math.abs(c.high - c1.high) < 0.0001 * c.high && isUptrend) {
        patterns.push({ name: 'Tweezer Top', type: 'BEARISH', strength: 2 });
    }
    // 24. Tweezer Bottom
    if (isBearish1 && isBullish && Math.abs(c.low - c1.low) < 0.0001 * c.low && isDowntrend) {
        patterns.push({ name: 'Tweezer Bottom', type: 'BULLISH', strength: 2 });
    }
    // 25. Bullish Kicker
    if (isBearish1 && isBullish && c.open >= c1.open && c.low > c1.close) {
        patterns.push({ name: 'Bullish Kicker', type: 'BULLISH', strength: 3 });
    }
    // 26. Bearish Kicker
    if (isBullish1 && isBearish && c.open <= c1.open && c.high < c1.close) {
        patterns.push({ name: 'Bearish Kicker', type: 'BEARISH', strength: 3 });
    }
    // 27. Matching Low
    if (isBearish1 && isBearish && Math.abs(c.close - c1.close) < 0.0001 * c.close) {
        patterns.push({ name: 'Matching Low', type: 'BULLISH', strength: 2 });
    }
    // 28. Matching High
    if (isBullish1 && isBullish && Math.abs(c.close - c1.close) < 0.0001 * c.close) {
        patterns.push({ name: 'Matching High', type: 'BEARISH', strength: 2 });
    }
    // 29. On-Neck
    if (isBearish1 && isLongBody && isBullish && c.close === c1.low) {
        patterns.push({ name: 'On-Neck', type: 'BEARISH', strength: 2 });
    }
    // 30. In-Neck
    if (isBearish1 && isLongBody && isBullish && c.close > c1.low && c.close < c1.close) {
        patterns.push({ name: 'In-Neck', type: 'BEARISH', strength: 2 });
    }

    // --- 3. TRIPLE CANDLE PATTERNS (20) ---
    
    // 31. Morning Star
    if (isBearish2 && body2 > avgBody && body1 < avgBody * 0.5 && isBullish && c.close > (c2.open + c2.close) / 2 && c1.open < c2.close && c.open > c1.close) {
        patterns.push({ name: 'Morning Star', type: 'BULLISH', strength: 3 });
    }
    // 32. Evening Star
    if (isBullish2 && body2 > avgBody && body1 < avgBody * 0.5 && isBearish && c.close < (c2.open + c2.close) / 2 && c1.open > c2.close && c.open < c1.close) {
        patterns.push({ name: 'Evening Star', type: 'BEARISH', strength: 3 });
    }
    // 33. Morning Doji Star
    if (isBearish2 && body2 > avgBody && isDoji1 && isBullish && c.close > (c2.open + c2.close) / 2 && c1.open < c2.close && c.open > c1.close) {
        patterns.push({ name: 'Morning Doji Star', type: 'BULLISH', strength: 3 });
    }
    // 34. Evening Doji Star
    if (isBullish2 && body2 > avgBody && isDoji1 && isBearish && c.close < (c2.open + c2.close) / 2 && c1.open > c2.close && c.open < c1.close) {
        patterns.push({ name: 'Evening Doji Star', type: 'BEARISH', strength: 3 });
    }
    // 35. Three White Soldiers
    if (isBullish && isBullish1 && isBullish2 && c.close > c1.close && c1.close > c2.close && c.open > c1.open && c.open < c1.close && c1.open > c2.open && c1.open < c2.close) {
        patterns.push({ name: 'Three White Soldiers', type: 'BULLISH', strength: 3 });
    }
    // 36. Three Black Crows
    if (isBearish && isBearish1 && isBearish2 && c.close < c1.close && c1.close < c2.close && c.open < c1.open && c.open > c1.close && c1.open < c2.open && c1.open > c2.close) {
        patterns.push({ name: 'Three Black Crows', type: 'BEARISH', strength: 3 });
    }
    // 37. Three Inside Up
    if (isBearish2 && isBullish1 && c1.close < c2.open && c1.open > c2.close && c1.close > (c2.open + c2.close) / 2 && isBullish && c.close > c2.open) {
        patterns.push({ name: 'Three Inside Up', type: 'BULLISH', strength: 3 });
    }
    // 38. Three Inside Down
    if (isBullish2 && isBearish1 && c1.close > c2.open && c1.open < c2.close && c1.close < (c2.open + c2.close) / 2 && isBearish && c.close < c2.open) {
        patterns.push({ name: 'Three Inside Down', type: 'BEARISH', strength: 3 });
    }
    // 39. Three Outside Up
    if (isBearish2 && isBullish1 && c1.open < c2.close && c1.close > c2.open && isBullish && c.close > c1.close) {
        patterns.push({ name: 'Three Outside Up', type: 'BULLISH', strength: 3 });
    }
    // 40. Three Outside Down
    if (isBullish2 && isBearish1 && c1.open > c2.close && c1.close < c2.open && isBearish && c.close < c1.close) {
        patterns.push({ name: 'Three Outside Down', type: 'BEARISH', strength: 3 });
    }
    // 41. Rising Three Methods
    if (isBullish && isBearish1 && isBearish2 && isBearish3 && c4.close > c4.open && c.close > c4.close && c1.close > c4.open && c2.close > c4.open && c3.close > c4.open) {
        patterns.push({ name: 'Rising Three Methods', type: 'BULLISH', strength: 3 });
    }
    // 42. Falling Three Methods
    if (isBearish && isBullish1 && isBullish2 && isBullish3 && c4.close < c4.open && c.close < c4.close && c1.close < c4.open && c2.close < c4.open && c3.close < c4.open) {
        patterns.push({ name: 'Falling Three Methods', type: 'BEARISH', strength: 3 });
    }
    // 43. Three Line Strike
    if (isBullish3 && isBullish2 && isBullish1 && isBearish && c.open > c1.close && c.close < c3.open) {
        patterns.push({ name: 'Three Line Strike (Bullish)', type: 'BULLISH', strength: 3 });
    } else if (isBearish3 && isBearish2 && isBearish1 && isBullish && c.open < c1.close && c.close > c3.open) {
        patterns.push({ name: 'Three Line Strike (Bearish)', type: 'BEARISH', strength: 3 });
    }
    // 44. Deliberation Pattern
    if (isBullish && isBullish1 && isBullish2 && c2.close > c2.open && c1.close > c1.open && body < body1 && body1 < body2) {
        patterns.push({ name: 'Deliberation Pattern', type: 'BEARISH', strength: 2 });
    }
    // 45. Abandoned Baby (Bullish)
    if (isBearish2 && isDoji1 && isBullish && c1.high < c2.low && c1.high < c.low) {
        patterns.push({ name: 'Abandoned Baby (Bullish)', type: 'BULLISH', strength: 3 });
    }
    // 46. Abandoned Baby (Bearish)
    if (isBullish2 && isDoji1 && isBearish && c1.low > c2.high && c1.low > c.high) {
        patterns.push({ name: 'Abandoned Baby (Bearish)', type: 'BEARISH', strength: 3 });
    }
    // 47. Tri-Star
    if (isDoji && isDoji1 && isDoji2) {
        if (c1.low > c2.high && c1.low > c.high) patterns.push({ name: 'Tri-Star Top', type: 'BEARISH', strength: 3 });
        if (c1.high < c2.low && c1.high < c.low) patterns.push({ name: 'Tri-Star Bottom', type: 'BULLISH', strength: 3 });
    }
    // 48. Upside Tasuki Gap
    if (isBullish2 && isBullish1 && isBearish && c1.open > c2.close && c.open < c1.open && c.close < c1.open && c.close > c2.close) {
        patterns.push({ name: 'Upside Tasuki Gap', type: 'BULLISH', strength: 2 });
    }
    // 49. Downside Tasuki Gap
    if (isBearish2 && isBearish1 && isBullish && c1.open < c2.close && c.open > c1.open && c.close > c1.open && c.close < c2.close) {
        patterns.push({ name: 'Downside Tasuki Gap', type: 'BEARISH', strength: 2 });
    }
    // 50. Stick Sandwich
    if (isBearish2 && isBullish1 && isBearish && Math.abs(c.close - c2.close) < 0.0001 * c.close) {
        patterns.push({ name: 'Stick Sandwich', type: 'BULLISH', strength: 2 });
    }

    // --- NEW PATTERNS FROM PDF ---

    // 51. Mat Hold (Bullish)
    if (isBullish && isBearish1 && isBearish2 && isBearish3 && c4.close > c4.open && c4.close < c3.open && c.close > c4.close && c.close > c1.high) {
        patterns.push({ name: 'Bullish Mat Hold', type: 'BULLISH', strength: 3 });
    }
    // 52. Mat Hold (Bearish)
    if (isBearish && isBullish1 && isBullish2 && isBullish3 && c4.close < c4.open && c4.close > c3.open && c.close < c4.close && c.close < c1.low) {
        patterns.push({ name: 'Bearish Mat Hold', type: 'BEARISH', strength: 3 });
    }
    // 53. Above The Stomach
    if (isBearish1 && isBullish && c.open >= (c1.open + c1.close) / 2 && c.close > c1.open) {
        patterns.push({ name: 'Above The Stomach', type: 'BULLISH', strength: 2 });
    }
    // 54. Below The Stomach
    if (isBullish1 && isBearish && c.open <= (c1.open + c1.close) / 2 && c.close < c1.open) {
        patterns.push({ name: 'Below The Stomach', type: 'BEARISH', strength: 2 });
    }
    // 55. Thrusting Line
    if (isBearish1 && isBullish && c.open < c1.low && c.close < (c1.open + c1.close) / 2 && c.close > c1.close) {
        patterns.push({ name: 'Thrusting Line', type: 'BEARISH', strength: 1 }); // Continuation
    }
    // 56. Separating Line (Bullish)
    if (isBearish1 && isBullish && Math.abs(c.open - c1.open) < 0.0001 * c.open) {
        patterns.push({ name: 'Bullish Separating Line', type: 'BULLISH', strength: 2 });
    }
    // 57. Separating Line (Bearish)
    if (isBullish1 && isBearish && Math.abs(c.open - c1.open) < 0.0001 * c.open) {
        patterns.push({ name: 'Bearish Separating Line', type: 'BEARISH', strength: 2 });
    }
    // 58. Meeting Line (Bullish)
    if (isBearish1 && isBullish && Math.abs(c.close - c1.close) < 0.0001 * c.close && c.open < c1.close) {
        patterns.push({ name: 'Bullish Meeting Line', type: 'BULLISH', strength: 2 });
    }
    // 59. Meeting Line (Bearish)
    if (isBullish1 && isBearish && Math.abs(c.close - c1.close) < 0.0001 * c.close && c.open > c1.close) {
        patterns.push({ name: 'Bearish Meeting Line', type: 'BEARISH', strength: 2 });
    }
    // 60. Homing Pigeon
    if (isBearish1 && isBearish && c.open < c1.open && c.close > c1.close) {
        patterns.push({ name: 'Homing Pigeon', type: 'BULLISH', strength: 2 });
    }
    // 61. Advance Block
    if (isBullish2 && isBullish1 && isBullish && c1.open > c2.open && c1.open < c2.close && c.open > c1.open && c.open < c1.close && body < body1 && body1 < body2 && upperShadow > upperShadow1) {
        patterns.push({ name: 'Advance Block', type: 'BEARISH', strength: 2 });
    }
    // 62. Bullish Unique Three River Bottom
    if (isBearish2 && isBearish1 && isBullish && c1.open < c2.close && c1.close > c2.close && c1.low < c2.low && c.close < c1.close) {
        patterns.push({ name: 'Unique Three River Bottom', type: 'BULLISH', strength: 2 });
    }
    // 63. Bullish Three Stars in the South
    if (isBearish2 && isBearish1 && isBearish && c1.open < c2.open && c1.open > c2.close && c1.low > c2.low && c.open < c1.open && c.open > c1.close && c.high < c1.high && c.low > c1.low) {
        patterns.push({ name: 'Three Stars in the South', type: 'BULLISH', strength: 2 });
    }
    // 64. Bullish Concealing Baby Swallow
    if (isBearish3 && isBearish2 && isBearish1 && isBearish && c3.open > c3.close && c2.open > c2.close && c1.open < c2.close && c1.high > c2.close && c.open > c1.high && c.close < c1.low) {
        patterns.push({ name: 'Concealing Baby Swallow', type: 'BULLISH', strength: 3 });
    }
    // 65. Bullish Ladder Bottom
    if (isBearish3 && isBearish2 && isBearish1 && isBearish && isBullish && c3.close < c4.close && c2.close < c3.close && c1.close < c2.close && c.open > c1.open) {
        patterns.push({ name: 'Ladder Bottom', type: 'BULLISH', strength: 3 });
    }
    // 66. Side-by-Side White Lines (Bullish)
    if (isBullish2 && isBullish1 && isBullish && c1.open > c2.close && Math.abs(c.open - c1.open) < 0.0001 * c.open && Math.abs(c.close - c1.close) < 0.0001 * c.close) {
        patterns.push({ name: 'Side-by-Side White Lines', type: 'BULLISH', strength: 2 });
    }
    // 67. Tower Bottom
    if (isBearish4 && body4 > avgBody * 1.5 && body3 < avgBody * 0.5 && body2 < avgBody * 0.5 && body1 < avgBody * 0.5 && isBullish && body > avgBody * 1.5 && c.close > c1.high) {
        patterns.push({ name: 'Tower Bottom', type: 'BULLISH', strength: 3 });
    }
    // 68. Tower Top
    if (isBullish4 && body4 > avgBody * 1.5 && body3 < avgBody * 0.5 && body2 < avgBody * 0.5 && body1 < avgBody * 0.5 && isBearish && body > avgBody * 1.5 && c.close < c1.low) {
        patterns.push({ name: 'Tower Top', type: 'BEARISH', strength: 3 });
    }

    return patterns;
};

export interface SMCResult {
    structure: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
    phase: 'ACCUMULATION' | 'MARKUP' | 'DISTRIBUTION' | 'MARKDOWN';
    bos: 'BULLISH' | 'BEARISH' | 'NONE';
    choch: 'BULLISH' | 'BEARISH' | 'NONE';
    liquiditySweep: 'BUY_SIDE' | 'SELL_SIDE' | 'NONE';
    orderBlock: 'BULLISH' | 'BEARISH' | 'NONE';
    fvg: 'BULLISH' | 'BEARISH' | 'NONE';
    mitigationBlock: 'BULLISH' | 'BEARISH' | 'NONE';
    inducement: boolean;
    score: number;
    bullishStrongCount: number;
    bearishStrongCount: number;
    dojiCount: number;
    sndPattern: 'RBR' | 'DBD' | 'RBD' | 'DBR' | 'NONE';
    liquidityType: 'EQH' | 'EQL' | 'TRENDLINE' | 'NONE';
    crtStatus: 'ACCUMULATION' | 'MANIPULATION_SWEEP' | 'DISTRIBUTION' | 'NONE';
    pivotPoints: { PP: number, R1: number, R2: number, S1: number, S2: number } | null;
    fibonacciOTE: { level0_5: number, level0_618: number, level0_786: number, level0_886: number } | null;
    fibonacciZone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM' | 'NONE';
    baseTrading: 'BASE_BREAK_BULLISH' | 'BASE_BREAK_BEARISH' | 'BASE_RETURN_BULLISH' | 'BASE_RETURN_BEARISH' | 'NONE';
    sidewaysBounces: number;
    chartPattern: 'DOUBLE_TOP' | 'DOUBLE_BOTTOM' | 'HEAD_AND_SHOULDERS' | 'INVERTED_HEAD_AND_SHOULDERS' | 'TRIPLE_TOP' | 'TRIPLE_BOTTOM' | 'NONE';
}

export const detectSMC = (candles: Candle[], timeframe: TimeFrame = 'H1'): SMCResult => {
    const result: SMCResult = {
        structure: 'SIDEWAYS',
        phase: 'ACCUMULATION',
        bos: 'NONE',
        choch: 'NONE',
        liquiditySweep: 'NONE',
        orderBlock: 'NONE',
        fvg: 'NONE',
        mitigationBlock: 'NONE',
        inducement: false,
        score: 0,
        bullishStrongCount: 0,
        bearishStrongCount: 0,
        dojiCount: 0,
        sndPattern: 'NONE',
        liquidityType: 'NONE',
        crtStatus: 'NONE',
        pivotPoints: null,
        fibonacciOTE: null,
        fibonacciZone: 'NONE',
        baseTrading: 'NONE',
        sidewaysBounces: 0,
        chartPattern: 'NONE'
    };

    if (candles.length < 150) return result;

    const isM1M5 = timeframe === 'M1' || timeframe === 'M5';
    const isM15M30 = timeframe === 'M15' || timeframe === 'M30';

    const wStructure = isM1M5 ? 2 : isM15M30 ? 3 : 4;
    const wMomentum = 2;
    const wBOS = 3;
    const wSweep = 3;
    const wOB = isM1M5 ? 2 : isM15M30 ? 3 : 4;
    const wFVG = isM1M5 ? 2 : isM15M30 ? 2 : 3;
    const wInducement = isM1M5 ? 2 : isM15M30 ? 2 : 1;

    const recentCandles = candles.slice(-150);
    const current = recentCandles[recentCandles.length - 1];
    const prev1 = recentCandles[recentCandles.length - 2];
    const prev2 = recentCandles[recentCandles.length - 3];
    const prev3 = recentCandles[recentCandles.length - 4];

    // 1. MARKET STRUCTURE (150 Candles)
    let swings: { type: 'HIGH' | 'LOW', price: number, index: number }[] = [];
    for (let i = 2; i < recentCandles.length - 2; i++) {
        const c = recentCandles[i];
        if (c.high > recentCandles[i-1].high && c.high > recentCandles[i-2].high && c.high > recentCandles[i+1].high && c.high > recentCandles[i+2].high) {
            swings.push({ type: 'HIGH', price: c.high, index: i });
        }
        if (c.low < recentCandles[i-1].low && c.low < recentCandles[i-2].low && c.low < recentCandles[i+1].low && c.low < recentCandles[i+2].low) {
            swings.push({ type: 'LOW', price: c.low, index: i });
        }
    }

    let hhCount = 0, hlCount = 0, llCount = 0, lhCount = 0;
    let lastHigh = 0, lastLow = Infinity;

    swings.forEach(s => {
        if (s.type === 'HIGH') {
            if (lastHigh !== 0 && s.price > lastHigh) hhCount++;
            else if (lastHigh !== 0 && s.price < lastHigh) lhCount++;
            lastHigh = s.price;
        } else {
            if (lastLow !== Infinity && s.price > lastLow) hlCount++;
            else if (lastLow !== Infinity && s.price < lastLow) llCount++;
            lastLow = s.price;
        }
    });

    const totalBullishSwings = hhCount + hlCount;
    const totalBearishSwings = llCount + lhCount;
    const totalSwings = totalBullishSwings + totalBearishSwings;

    if (totalSwings > 0) {
        if (totalBullishSwings / totalSwings >= 0.7) {
            result.structure = 'BULLISH';
            result.score += wStructure;
        } else if (totalBearishSwings / totalSwings >= 0.7) {
            result.structure = 'BEARISH';
            result.score -= wStructure;
        } else {
            // It's SIDEWAYS. Count bounces (approximate by recent alternating swings)
            result.structure = 'SIDEWAYS';
            // A bounce is roughly a pair of High/Low swings in a tight range.
            // We can estimate bounces by totalSwings / 2.
            result.sidewaysBounces = Math.floor(totalSwings / 2);
        }
    }

    // 2. MOMENTUM DISTRIBUTION
    recentCandles.forEach(c => {
        const body = Math.abs(c.close - c.open);
        const range = c.high - c.low;
        const isBullish = c.close > c.open;
        
        if (range === 0) return;

        // Bullish Strong: Body >= 70% of range
        if (body / range >= 0.7) {
            if (isBullish) result.bullishStrongCount++;
            else result.bearishStrongCount++;
        } else if (body / range <= 0.1) {
            result.dojiCount++;
        }
    });

    if (result.bullishStrongCount > result.bearishStrongCount) {
        result.score += wMomentum;
    } else if (result.bearishStrongCount > result.bullishStrongCount) {
        result.score -= wMomentum;
    }

    // 3. SIKLUS MARKET (Wyckoff)
    if (result.bullishStrongCount > result.bearishStrongCount * 1.5) {
        result.phase = 'MARKUP';
        result.score += 2;
    } else if (result.bearishStrongCount > result.bullishStrongCount * 1.5) {
        result.phase = 'MARKDOWN';
        result.score -= 2;
    } else if (result.dojiCount > 30 && result.structure === 'BULLISH') {
        result.phase = 'DISTRIBUTION';
        result.score -= 2;
    } else if (result.dojiCount > 30 && result.structure === 'BEARISH') {
        result.phase = 'ACCUMULATION';
        result.score += 2;
    }

    // 4. BOS & CHoCH (With RTO logic)
    const currentBodySize = Math.abs(current.close - current.open) / (current.high - current.low);
    const isStrongBreak = currentBodySize >= 0.6;

    if (lastHigh !== 0 && current.close > lastHigh && isStrongBreak) {
        if (result.structure === 'BULLISH') {
            result.bos = 'BULLISH';
            result.score += wBOS;
        } else {
            result.choch = 'BULLISH';
            result.score += 2;
            // Check for Quick RTO (Return to Origin)
            if (prev1.low <= lastHigh && current.close > lastHigh) {
                result.score += 2; // Extra points for RTO
            }
        }
    } else if (lastLow !== Infinity && current.close < lastLow && isStrongBreak) {
        if (result.structure === 'BEARISH') {
            result.bos = 'BEARISH';
            result.score -= wBOS;
        } else {
            result.choch = 'BEARISH';
            result.score -= 2;
            // Check for Quick RTO (Return to Origin)
            if (prev1.high >= lastLow && current.close < lastLow) {
                result.score -= 2; // Extra points for RTO
            }
        }
    }

    // 5. LIQUIDITY SWEEP
    const upperWick = current.high - Math.max(current.open, current.close);
    const lowerWick = Math.min(current.open, current.close) - current.low;
    const currentRange = current.high - current.low;

    if (lastHigh !== 0 && current.high > lastHigh && current.close < lastHigh && upperWick / currentRange >= 0.5) {
        result.liquiditySweep = 'BUY_SIDE';
        result.score -= wSweep; 
    } else if (lastLow !== Infinity && current.low < lastLow && current.close > lastLow && lowerWick / currentRange >= 0.5) {
        result.liquiditySweep = 'SELL_SIDE';
        result.score += wSweep;
    }

    // 6. FVG (Fair Value Gap)
    if (current.low > prev2.high && prev1.close > prev1.open && (prev1.close - prev1.open) / (prev1.high - prev1.low) >= 0.6) {
        result.fvg = 'BULLISH';
        // Score based on bias
        if (result.score > 0) result.score += wFVG;
        else result.score -= 1;
    } else if (current.high < prev2.low && prev1.close < prev1.open && (prev1.open - prev1.close) / (prev1.high - prev1.low) >= 0.6) {
        result.fvg = 'BEARISH';
        if (result.score < 0) result.score -= wFVG;
        else result.score += 1;
    }

    // 7. ORDER BLOCK (OB)
    if (result.fvg === 'BULLISH' && prev2.close < prev2.open) {
        result.orderBlock = 'BULLISH';
        if (current.close > prev2.high) result.score += wOB;
    } else if (result.fvg === 'BEARISH' && prev2.close > prev2.open) {
        result.orderBlock = 'BEARISH';
        if (current.close < prev2.low) result.score -= wOB;
    }

    // 8. INDUCEMENT
    if (result.liquiditySweep !== 'NONE' && !isStrongBreak) {
        result.inducement = true;
        if (result.liquiditySweep === 'SELL_SIDE') result.score += wInducement;
        else result.score -= wInducement;
    }

    // 8. MITIGATION BLOCK
    if (result.bos === 'BEARISH' && prev3.close > prev3.open && current.high >= prev3.low) {
        result.mitigationBlock = 'BEARISH';
    } else if (result.bos === 'BULLISH' && prev3.close < prev3.open && current.low <= prev3.high) {
        result.mitigationBlock = 'BULLISH';
    }

    // 9. SUPPLY & DEMAND (SND) PATTERNS
    const isBullish1 = prev1.close > prev1.open;
    const isBearish1 = prev1.close < prev1.open;
    const isBullish3 = prev3.close > prev3.open;
    const isBearish3 = prev3.close < prev3.open;
    const isBase2 = Math.abs(prev2.close - prev2.open) < (prev2.high - prev2.low) * 0.3;

    if (isBullish3 && isBase2 && isBullish1) result.sndPattern = 'RBR';
    else if (isBearish3 && isBase2 && isBearish1) result.sndPattern = 'DBD';
    else if (isBullish3 && isBase2 && isBearish1) result.sndPattern = 'RBD';
    else if (isBearish3 && isBase2 && isBullish1) result.sndPattern = 'DBR';

    // 9.5 BASE TRADING SYSTEMS (Break & Return)
    const isBase3 = Math.abs(prev3.close - prev3.open) < (prev3.high - prev3.low) * 0.5;
    
    // Base Break Entry
    if (isBase2) {
        if (prev1.close > prev2.high) {
            result.baseTrading = 'BASE_BREAK_BULLISH';
            result.score += 2;
        } else if (prev1.close < prev2.low) {
            result.baseTrading = 'BASE_BREAK_BEARISH';
            result.score -= 2;
        }
    }

    // Base Break Return Entry (Rejection)
    if (isBase3) {
        // Bullish Return: Broke high, then came back to test base
        if (prev2.close > prev3.high && prev1.low <= prev3.high && prev1.close > prev3.high) {
            result.baseTrading = 'BASE_RETURN_BULLISH';
            result.score += 3;
        }
        // Bearish Return: Broke low, then came back to test base
        else if (prev2.close < prev3.low && prev1.high >= prev3.low && prev1.close < prev3.low) {
            result.baseTrading = 'BASE_RETURN_BEARISH';
            result.score -= 3;
        }
    }

    // 10. LIQUIDITY TYPES (EQH, EQL)
    let eqhFound = false;
    let eqlFound = false;
    const lookback = recentCandles.slice(-20, -1);
    for (let i = 0; i < lookback.length - 1; i++) {
        for (let j = i + 1; j < lookback.length; j++) {
            if (Math.abs(lookback[i].high - lookback[j].high) / lookback[i].high < 0.0005) eqhFound = true;
            if (Math.abs(lookback[i].low - lookback[j].low) / lookback[i].low < 0.0005) eqlFound = true;
        }
    }
    if (eqhFound && current.high > lastHigh) result.liquidityType = 'EQH';
    else if (eqlFound && current.low < lastLow) result.liquidityType = 'EQL';
    else if (eqhFound) result.liquidityType = 'EQH';
    else if (eqlFound) result.liquidityType = 'EQL';

    // 11. CANDLE RANGE THEORY (CRT)
    const crtWindow = recentCandles.slice(-20, -1);
    const crtHigh = Math.max(...crtWindow.map(c => c.high));
    const crtLow = Math.min(...crtWindow.map(c => c.low));
    
    if (current.high > crtHigh && current.close < crtHigh) {
        result.crtStatus = 'MANIPULATION_SWEEP';
        result.score -= 2;
    } else if (current.low < crtLow && current.close > crtLow) {
        result.crtStatus = 'MANIPULATION_SWEEP';
        result.score += 2;
    } else if (current.close > crtHigh || current.close < crtLow) {
        result.crtStatus = 'DISTRIBUTION';
    } else {
        result.crtStatus = 'ACCUMULATION';
    }

    // 12. PIVOT POINTS (PP, R1, R2, S1, S2)
    const pp = (prev1.high + prev1.low + prev1.close) / 3;
    const r1 = (2 * pp) - prev1.low;
    const r2 = pp + (prev1.high - prev1.low);
    const s1 = (2 * pp) - prev1.high;
    const s2 = pp - (prev1.high - prev1.low);
    result.pivotPoints = { PP: pp, R1: r1, R2: r2, S1: s1, S2: s2 };

    // 13. FIBONACCI OTE & ZONES
    if (lastHigh !== 0 && lastLow !== Infinity) {
        const swingRange = Math.abs(lastHigh - lastLow);
        if (result.structure === 'BULLISH') {
            result.fibonacciOTE = {
                level0_5: lastHigh - (swingRange * 0.5),
                level0_618: lastHigh - (swingRange * 0.618),
                level0_786: lastHigh - (swingRange * 0.786),
                level0_886: lastHigh - (swingRange * 0.886)
            };
            if (current.close < result.fibonacciOTE.level0_5) {
                result.fibonacciZone = 'DISCOUNT';
                result.score += 2; // Good for buying
            } else if (current.close > result.fibonacciOTE.level0_5) {
                result.fibonacciZone = 'PREMIUM';
            } else {
                result.fibonacciZone = 'EQUILIBRIUM';
            }
        } else {
            result.fibonacciOTE = {
                level0_5: lastLow + (swingRange * 0.5),
                level0_618: lastLow + (swingRange * 0.618),
                level0_786: lastLow + (swingRange * 0.786),
                level0_886: lastLow + (swingRange * 0.886)
            };
            if (current.close > result.fibonacciOTE.level0_5) {
                result.fibonacciZone = 'PREMIUM';
                result.score -= 2; // Good for selling
            } else if (current.close < result.fibonacciOTE.level0_5) {
                result.fibonacciZone = 'DISCOUNT';
            } else {
                result.fibonacciZone = 'EQUILIBRIUM';
            }
        }
    }

    // 14. CHART PATTERNS (Double/Triple Tops/Bottoms, H&S)
    const recentHighs = swings.filter(s => s.type === 'HIGH').slice(-3);
    const recentLows = swings.filter(s => s.type === 'LOW').slice(-3);

    if (recentHighs.length >= 2) {
        const h1 = recentHighs[recentHighs.length - 2].price;
        const h2 = recentHighs[recentHighs.length - 1].price;
        const diff = Math.abs(h1 - h2) / h1;
        if (diff < 0.005) { // 0.5% tolerance
            if (recentHighs.length === 3) {
                const h3 = recentHighs[recentHighs.length - 3].price;
                if (Math.abs(h3 - h1) / h3 < 0.005) {
                    result.chartPattern = 'TRIPLE_TOP';
                    result.score -= 3;
                } else {
                    result.chartPattern = 'DOUBLE_TOP';
                    result.score -= 2;
                }
            } else {
                result.chartPattern = 'DOUBLE_TOP';
                result.score -= 2;
            }
        }
    }

    if (recentLows.length >= 2) {
        const l1 = recentLows[recentLows.length - 2].price;
        const l2 = recentLows[recentLows.length - 1].price;
        const diff = Math.abs(l1 - l2) / l1;
        if (diff < 0.005) {
            if (recentLows.length === 3) {
                const l3 = recentLows[recentLows.length - 3].price;
                if (Math.abs(l3 - l1) / l3 < 0.005) {
                    result.chartPattern = 'TRIPLE_BOTTOM';
                    result.score += 3;
                } else {
                    result.chartPattern = 'DOUBLE_BOTTOM';
                    result.score += 2;
                }
            } else {
                result.chartPattern = 'DOUBLE_BOTTOM';
                result.score += 2;
            }
        }
    }

    // Head and Shoulders (H&S)
    if (recentHighs.length >= 3) {
        const ls = recentHighs[recentHighs.length - 3].price;
        const head = recentHighs[recentHighs.length - 2].price;
        const rs = recentHighs[recentHighs.length - 1].price;
        if (head > ls && head > rs && Math.abs(ls - rs) / ls < 0.01) {
            result.chartPattern = 'HEAD_AND_SHOULDERS';
            result.score -= 4;
        }
    }

    // Inverted Head and Shoulders
    if (recentLows.length >= 3) {
        const ls = recentLows[recentLows.length - 3].price;
        const head = recentLows[recentLows.length - 2].price;
        const rs = recentLows[recentLows.length - 1].price;
        if (head < ls && head < rs && Math.abs(ls - rs) / ls < 0.01) {
            result.chartPattern = 'INVERTED_HEAD_AND_SHOULDERS';
            result.score += 4;
        }
    }

    return result;
};

export const getTrendStatus = (candles: Candle[]): string => {
  const emaAnalysis = analyzeEMACondition(candles);
  return emaAnalysis.bias; // Now returns specific EMA 200 Bias
};
