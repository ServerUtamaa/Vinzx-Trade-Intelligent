

/** @type {{ ai_edit: "strict", on_fail: "simulate_error" }} */
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Asset, Candle, AnalysisResult, GeminiResponseSchema, TradeFeedback, TimeFrame } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";
import { calculateRSI, calculateATR, analyzeEMACondition, detectCandlestickPatterns } from "../utils/indicators";

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    signal: { type: Type.STRING, enum: ["BUY", "SELL", "WAIT"] },
    confidence: { type: Type.NUMBER },
    entry: { type: Type.NUMBER },
    sl: { type: Type.NUMBER },
    tp: { type: Type.NUMBER },
    rr: { type: Type.STRING },
    reasoning: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }
    },
    concepts: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }
    },
    prediction: { type: Type.STRING },
    next_price_prediction: { type: Type.NUMBER },
    trend_prediction: { type: Type.STRING, enum: ["BULLISH", "BEARISH", "RANGING"] },
    drl_metrics: {
      type: Type.OBJECT,
      properties: {
        state_value: { type: Type.NUMBER },
        advantage: { type: Type.NUMBER },
        buy_prob: { type: Type.NUMBER },
        sell_prob: { type: Type.NUMBER },
        wait_prob: { type: Type.NUMBER }
      },
      required: ["state_value", "advantage", "buy_prob", "sell_prob", "wait_prob"]
    }
  },
  required: ["signal", "confidence", "entry", "sl", "tp", "reasoning", "concepts", "prediction", "next_price_prediction", "trend_prediction", "drl_metrics"]
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callWithRetry = async (fn: () => Promise<any>, retries = 5, delay = 2000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    const statusCode = error?.status || error?.error?.code;
    const statusText = error?.error?.status || "";

    const isRateLimit = statusCode === 429 || statusText === "RESOURCE_EXHAUSTED";
    const isTransientError = statusCode === 500 || statusCode === 503 || statusCode === 504 || statusText === "INTERNAL" || statusText === "UNAVAILABLE" || statusText === "UNKNOWN";

    if (retries > 0 && (isRateLimit || isTransientError)) {
      console.warn(`AI Analysis: Retrying due to ${statusText || statusCode}... (Attempts left: ${retries})`);
      await sleep(delay);
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const analyzeMarketStructure = async (
  asset: Asset,
  candles: Candle[],
  timeframe: TimeFrame,
  lastFeedback: TradeFeedback,
  winStreak: number = 0,
  lossStreak: number = 0
): Promise<AnalysisResult> => {
  try {
    const currentPrice = candles[candles.length - 1].close;
    const rsi = calculateRSI(candles, 14);
    const emaState = analyzeEMACondition(candles);
    const atr = calculateATR(candles, 14);
    const patterns = detectCandlestickPatterns(candles);

    const dataSlice = candles.slice(-150); 
    const dataString = dataSlice.map(c => `${c.open},${c.high},${c.low},${c.close}`).join('\n');

    let feedbackContext = `
      🧠 **PROTOCOL: QUANTUM NEURON ENGINE v3.0** 🧠
      ENVIRONMENT: ${asset} | TIMEFRAME: ${timeframe}
      PRICE: ${currentPrice}
      EMA_BIAS: ${emaState.bias}
      RSI_MOMENTUM: ${rsi.toFixed(2)}
      VOLATILITY (ATR): ${atr.toFixed(4)}
      DETECTED_PATTERNS: ${patterns.map(p => p.name).join(', ') || 'NONE'}
      CURRENT WIN STREAK: ${winStreak}
      CURRENT LOSS STREAK: ${lossStreak}
      PREVIOUS ACTION REWARD: ${lastFeedback || 'NONE'}
    `;

    const prompt = `
      ${feedbackContext}
      [RAW DATA FEED (150 CANDLES)]
      ${dataString}
      [MISSION]
      Analyze the market using SMC and Price Action. Return a precise trade setup.
    `;

    try {
        // 1. Try Backend Analysis (DeepSeek)
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-key': `[AUTH_KEY]:VINZX_OMEGA_2026`
            },
            body: JSON.stringify({
                asset, candles, timeframe, lastFeedback, winStreak, lossStreak,
                systemInstruction: SYSTEM_INSTRUCTION
            })
        });

        if (response.ok) {
            const result = await response.json();
            return parseResponse(JSON.stringify(result), timeframe);
        }
    } catch (e) {
        console.warn("Backend Analysis failed, falling back to Gemini:", e);
    }

    // 2. Fallback to Gemini (Frontend Only per Guidelines)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const fallbackResponse = await callWithRetry(() => ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.1
        }
    }));

    return parseResponse(fallbackResponse.text || "{}", timeframe);

  } catch (error: any) {
    console.error("DRL Analysis Failed:", error);
    return {
      signal: 'WAIT', confidence: 0, entryPrice: candles[candles.length - 1].close, stopLoss: 0, takeProfit: 0, riskRewardRatio: "0:0",
      reasoning: Array(14).fill("SYSTEM ERROR: NEURAL DISCONNECT."), smcConceptsFound: [], timestamp: new Date().toLocaleTimeString(), timeframe: timeframe,
      drlMetrics: { stateValue: 0, advantage: 0, buyProb: 0, sellProb: 0, waitProb: 1 }
    };
  }
};

const parseResponse = (text: string, timeframe: TimeFrame): AnalysisResult => {
    const cleanText = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanText) as GeminiResponseSchema;
    return {
      signal: result.signal as 'BUY' | 'SELL' | 'WAIT',
      confidence: result.confidence,
      entryPrice: result.entry,
      stopLoss: result.sl,
      takeProfit: result.tp,
      riskRewardRatio: result.rr || "1:5",
      reasoning: result.reasoning,
      smcConceptsFound: result.concepts,
      prediction: result.prediction,
      nextPricePrediction: result.next_price_prediction,
      trendPrediction: result.trend_prediction,
      timestamp: new Date().toLocaleTimeString(),
      timeframe: timeframe,
      drlMetrics: result.drl_metrics ? {
        stateValue: result.drl_metrics.state_value,
        advantage: result.drl_metrics.advantage,
        buyProb: result.drl_metrics.buy_prob,
        sellProb: result.drl_metrics.sell_prob,
        waitProb: result.drl_metrics.wait_prob
      } : undefined
    };
};

