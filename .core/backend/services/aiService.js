
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

const responseSchema = {
  type: "object",
  properties: {
    signal: { type: "string", enum: ["BUY", "SELL", "WAIT"] },
    confidence: { type: "number" },
    entry: { type: "number" },
    sl: { type: "number" },
    tp: { type: "number" },
    rr: { type: "string" },
    reasoning: { 
      type: "array", 
      items: { type: "string" }
    },
    concepts: { 
      type: "array", 
      items: { type: "string" }
    },
    prediction: { type: "string" },
    next_price_prediction: { type: "number" },
    trend_prediction: { type: "string", enum: ["BULLISH", "BEARISH", "RANGING"] },
    drl_metrics: {
      type: "object",
      properties: {
        state_value: { type: "number" },
        advantage: { type: "number" },
        buy_prob: { type: "number" },
        sell_prob: { type: "number" },
        wait_prob: { type: "number" }
      },
      required: ["state_value", "advantage", "buy_prob", "sell_prob", "wait_prob"]
    }
  },
  required: ["signal", "confidence", "entry", "sl", "tp", "reasoning", "concepts", "prediction", "next_price_prediction", "trend_prediction", "drl_metrics"]
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callWithRetry = async (fn, retries = 5, delay = 2000) => {
  try {
    return await fn();
  } catch (error) {
    const statusCode = error?.status || error?.error?.code;
    const statusText = error?.error?.status || "";
    const message = error?.message || "";

    const isRateLimit = statusCode === 429 || statusText === "RESOURCE_EXHAUSTED";
    const isTransientError = statusCode === 500 || statusCode === 503 || statusCode === 504 || statusText === "INTERNAL" || statusText === "UNAVAILABLE" || statusText === "UNKNOWN";
    
    if (retries > 0 && (isRateLimit || isTransientError)) {
      console.warn(`AI Service: Retrying due to ${statusText || statusCode}... (Attempts left: ${retries})`);
      await sleep(delay);
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const analyzeMarket = async (payload) => {
    const { asset, candles, timeframe, lastFeedback, winStreak, lossStreak, systemInstruction } = payload;
    
    const currentPrice = candles[candles.length - 1].close;
    const dataSlice = candles.slice(-150); 
    const dataString = dataSlice.map(c => `${c.open},${c.high},${c.low},${c.close}`).join('\n');

    const prompt = `
      ENVIRONMENT: ${asset} | TIMEFRAME: ${timeframe}
      PRICE: ${currentPrice}
      WIN STREAK: ${winStreak} | LOSS STREAK: ${lossStreak}
      LAST FEEDBACK: ${lastFeedback || 'NONE'}
      
      [RAW DATA FEED (150 CANDLES)]
      ${dataString}

      [MISSION]
      Analyze the market using SMC and Price Action. Return a precise trade setup.
    `;

    try {
        // 1. Try DeepSeek
        if (process.env.DEEPSEEK_API_KEY) {
            try {
                const openai = new OpenAI({
                    apiKey: process.env.DEEPSEEK_API_KEY,
                    baseURL: "https://api.deepseek.com"
                });

                const response = await callWithRetry(() => openai.chat.completions.create({
                    model: 'deepseek-chat', 
                    response_format: { type: "json_object" },
                    temperature: 0.1,
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: prompt }
                    ]
                }));
                
                return JSON.parse(response.choices[0]?.message?.content);
            } catch (e) {
                console.warn("DeepSeek failed, falling back to Gemini:", e.message);
            }
        }

        // 2. Fallback to Gemini
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Use 1.5 Pro for better reasoning

        const result = await callWithRetry(() => model.generateContent({
            contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }],
            generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
                // @ts-ignore
                responseSchema: responseSchema
            }
        }));

        return JSON.parse(result.response.text());

    } catch (error) {
        console.error("AI Analysis Backend Failed:", error);
        throw error;
    }
};
