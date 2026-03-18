
import { GoogleGenAI, Type, Schema, ThinkingLevel } from "@google/genai";
import { Asset, Candle, AnalysisResult, GeminiResponseSchema, TradeFeedback, TimeFrame } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";
import { calculateRSI, calculateBollingerBands, calculateATR, analyzeEMACondition, detectCandlestickPatterns } from "../utils/indicators";

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    signal: { type: Type.STRING, enum: ["BUY", "SELL", "WAIT"] },
    confidence: { type: Type.NUMBER, description: "Policy probability π(a|s) for the chosen action (0.0 to 1.0)." },
    entry: { type: Type.NUMBER },
    sl: { type: Type.NUMBER },
    tp: { type: Type.NUMBER },
    rr: { type: Type.STRING },
    reasoning: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Return exactly 14 strings explaining the DRL state evaluation, 30-method confluence, and SMC alignment." 
    },
    concepts: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List the technical methods and SMC concepts detected (e.g., FVG, OB, RSI Divergence)."
    },
    prediction: {
      type: Type.STRING,
      description: "Predict the next 10-25 candles movement based on the state space trajectory."
    },
    next_price_prediction: {
      type: Type.NUMBER,
      description: "Predict the exact next price value based on the current timeframe."
    },
    trend_prediction: {
      type: Type.STRING,
      enum: ["BULLISH", "BEARISH", "RANGING"],
      description: "Predict the overall market trend."
    },
    drl_metrics: {
      type: Type.OBJECT,
      properties: {
        state_value: { type: Type.NUMBER, description: "V(s) from Critic Network (-1.0 to 1.0)" },
        advantage: { type: Type.NUMBER, description: "A(s,a) Advantage estimate" },
        buy_prob: { type: Type.NUMBER, description: "Probability of BUY action" },
        sell_prob: { type: Type.NUMBER, description: "Probability of SELL action" },
        wait_prob: { type: Type.NUMBER, description: "Probability of WAIT action" }
      },
      required: ["state_value", "advantage", "buy_prob", "sell_prob", "wait_prob"]
    }
  },
  required: ["signal", "confidence", "entry", "sl", "tp", "reasoning", "concepts", "prediction", "next_price_prediction", "trend_prediction", "drl_metrics"]
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.error?.code === 429 || error?.error?.status === "RESOURCE_EXHAUSTED";
    if (retries > 0 && isRateLimit) {
      console.warn(`Rate limit hit, retrying in ${delay}ms...`);
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const currentPrice = candles[candles.length - 1].close;
    const rsi = calculateRSI(candles, 14);
    const emaState = analyzeEMACondition(candles);
    const atr = calculateATR(candles, 14);
    const patterns = detectCandlestickPatterns(candles);

    // STRICTLY USE 150 CANDLES AS REQUESTED BY USER
    const dataSlice = candles.slice(-150); 
    const dataString = dataSlice.map(c => 
      `${c.open},${c.high},${c.low},${c.close}`
    ).join('\\n');

    // --- DRL AGENTIC CONTEXT (PPO/SAC ARCHITECTURE) ---
    let feedbackContext = `
      🧠 **PROTOCOL: DRL NEURON ENGINE (PPO/SAC HYBRID) v2.0** 🧠
      ENVIRONMENT: ${asset} | TIMEFRAME: ${timeframe}
      
      [STATE SPACE S(t) - REAL-TIME VECTORS]
      PRICE: ${currentPrice}
      EMA_BIAS: ${emaState.bias} (Trend Vector)
      RSI_MOMENTUM: ${rsi.toFixed(2)}
      VOLATILITY (ATR): ${atr.toFixed(4)}
      DETECTED_PATTERNS: ${patterns.map(p => p.name).join(', ') || 'NONE'}
      
      [REWARD FUNCTION / EPISODE CONTEXT]
      CURRENT WIN STREAK (R+): ${winStreak}
      CURRENT LOSS STREAK (R-): ${lossStreak}
      PREVIOUS ACTION REWARD: ${lastFeedback ? 'Status: ' + lastFeedback : 'NONE'}
    `;

    feedbackContext += `
    
    📜 **POLICY NETWORK ALGORITHM (30-METHOD CONFLUENCE):**
    
    You are acting as the Actor-Critic Neural Network in a Proximal Policy Optimization (PPO) and Soft Actor-Critic (SAC) environment.
    Evaluate the State Space S(t) using the EXACT 150 previous candlesticks provided.
    
    **INTEGRATE THE FOLLOWING 30 METHODS FOR DECISION MAKING:**
    1. SMC (Smart Money Concepts)
    2. ICT (Inner Circle Trader)
    3. Order Blocks (OB)
    4. Fair Value Gaps (FVG)
    5. Liquidity Sweeps (BSL/SSL)
    6. Break of Structure (BOS)
    7. Change of Character (CHoCH)
    8. Mitigation Blocks
    9. Breaker Blocks
    10. Imbalance / Inefficiency
    11. Premium & Discount Zones
    12. Optimal Trade Entry (OTE)
    13. Killzones (London/NY)
    14. Volume Profile / VPA
    15. Wyckoff Accumulation/Distribution
    16. Elliott Wave Theory
    17. Fibonacci Retracements & Extensions
    18. Moving Average Crossovers (EMA/SMA)
    19. RSI Divergence (Hidden & Regular)
    20. MACD Histogram Momentum
    21. Bollinger Bands Squeeze/Expansion
    22. ATR Volatility Analysis
    23. Stochastic Oscillator
    24. Ichimoku Cloud (Kumo Breakouts)
    25. Pivot Points (Standard/Camarilla)
    26. Support & Resistance Flips
    27. Supply & Demand Zones
    28. Candlestick Patterns (Engulfing, Pinbar, Doji, etc.)
    29. Market Structure Shifts (MSS)
    30. Multi-Timeframe Analysis (MTF) Alignment
    
    **NEURON EXECUTION STEPS:**
    1. **CRITIC NETWORK (Value Evaluation V(s))**
       - Evaluate the overall market structure based on the 150 candles and the 30 methods above.
       - Assign a State Value V(s) between -1.0 (Extreme Bearish) and 1.0 (Extreme Bullish).
       
    2. **ACTOR NETWORK (Policy Distribution π(a|s))**
       - Calculate probabilities for Action Space A(t): [BUY, SELL, WAIT].
       - Sum of probabilities MUST equal 1.0.
       - Maximize entropy (SAC) to explore if conditions are ambiguous.
       
    3. **ADVANTAGE ESTIMATION A(s,a)**
       - Calculate the advantage of the chosen action over the baseline state value.
       
    4. **EXECUTION & RISK MANAGEMENT (Action Selection)**
       - **ENTRY:** Exactly at the OB proximal line, FVG start, or OTE level.
       - **SL:** Strictly beyond the OB distal line, structural swing point, or invalidation level.
       - **TP:** Target opposing unmitigated liquidity (BSL/SSL) or major Supply/Demand zones.
       - **RR:** Minimum 1:3. If RR < 1:3 -> SIGNAL: WAIT.
    
    🔮 **PREDICTION MISSION:**
    - Predict the state trajectory for the next 10-25 candles based on the current Markov Decision Process.
    - Predict the EXACT NEXT PRICE value based on the current timeframe momentum.
    - Predict the overall market trend (BULLISH, BEARISH, RANGING).
    
    💰 **RISK PARAMETERS (STRICT ENFORCEMENT):**
    - **BTCUSD:** SWING / POSITION TRADING. SL below/above HTF structural swing. TP targets major liquidity pools.
    - **XAUUSD:** Strict structural SL to avoid fakeouts. High RR targeting next major liquidity.
    - **OTHERS:** Standard 1:3 to 1:5 RR minimum.
    `;

    const prompt = `
      ${feedbackContext}
      
      [RAW DATA FEED (OBSERVATION SEQUENCE - EXACTLY 150 CANDLES)]
      ${dataString}

      [MISSION]
      Act as the DRL (PPO/SAC) Neuron Engine. Process the observation sequence of 150 candles using the 30 technical methods.
      
      **DECISION MATRIX:**
      - IF Structure is clear, Liquidity is swept, and Price is at a valid POI with high confluence -> Output Policy favoring BUY/SELL.
      - IF ANY condition is missing, RR is poor, or entry is not precise -> Output Policy favoring WAIT.
      - DO NOT force a trade. "WAIT" is a highly profitable position. Your primary goal is ZERO DRAWDOWN.
      
      **Generate precise Entry, SL, TP based on the specific Asset Risk Parameters. Calculate DRL metrics (State Value, Advantage, Policy Probabilities). Provide the exact next price prediction and trend prediction.**
    `;

    try {
        const response = await callWithRetry(() => ai.models.generateContent({
          model: 'gemini-3.1-pro-preview', 
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }, // Max Intelligence for DRL Neuron
            temperature: 0.1, // Precision mode
          }
        }));
        
        if (!response.text) throw new Error("Empty response");
        return parseResponse(response.text, timeframe);

    } catch (modelError) {
        console.error("DRL Core failed, engaging Fallback Neural Net:", modelError);
        const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1
            }
        });
        return parseResponse(fallbackResponse.text || "{}", timeframe);
    }

  } catch (error) {
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

