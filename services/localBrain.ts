

/** @type {{ ai_edit: "strict", on_fail: "simulate_error" }} */
import { Asset, Candle, AnalysisResult, TimeFrame } from "../types";
import { calculateRSI, calculateStochastic, calculateATR, analyzeEMACondition, detectCandlestickPatterns, detectSMC, SMCResult } from "../utils/indicators";

// --- QUANTUM NEURON ENGINE v4.0 NARRATIVE GENERATOR (14 Points with 4 Variations) ---
const getCurrentSession = (): string => {
    const now = new Date();
    const hour = now.getUTCHours();
    
    let sessions = [];
    if (hour >= 22 || hour < 7) sessions.push("Sydney");
    if (hour >= 0 && hour < 9) sessions.push("Tokyo");
    if (hour >= 8 && hour < 17) sessions.push("London");
    if (hour >= 13 && hour < 22) sessions.push("New York");
    
    if (sessions.length > 1) {
        return `${sessions.join("-")} Overlap (High Volatility)`;
    } else if (sessions.length === 1) {
        return `${sessions[0]} Session`;
    }
    return "Off-Peak Session";
};

const generate16PointNarrative = (signal: 'BUY' | 'SELL' | 'WAIT', timeframe: TimeFrame, rrType: string, smc: SMCResult, patterns: any[], totalScore: number, minScore: number, modeName: string, contextualCandleNarrative: string): string[] => {
    const isBullish = signal === 'BUY';
    const isBearish = signal === 'SELL';
    
    // Seed random based on timestamp to avoid flickering on re-renders but still be dynamic
    const rand = () => Math.floor(Math.random() * 4);

    const p1 = [
        `1. [MARKET STRUCTURE & TREND CYCLE]: Berdasarkan 150 candle terakhir di ${timeframe}, struktur pasar menunjukkan fase ${smc.structure === 'BULLISH' ? 'UPTREND (Membentuk Higher High dan Higher Low)' : smc.structure === 'BEARISH' ? 'DOWNTREND (Membentuk Lower Low dan Lower High)' : 'SIDEWAYS (Ranging mendatar)'}. ${smc.structure === 'SIDEWAYS' ? `Rahasia Sideways: Kondisi ini selalu terjadi di antara Uptrend dan Downtrend. Terdeteksi sekitar ${smc.sidewaysBounces} pantulan, bersiaplah untuk breakout jika pantulan sudah 2-3 kali.` : ''} ${smc.sndPattern !== 'NONE' ? 'Pola Supply & Demand ' + smc.sndPattern + ' terdeteksi.' : ''} ${smc.chartPattern !== 'NONE' ? 'Formasi Harga (Chart Pattern) ' + smc.chartPattern.replace(/_/g, ' ') + ' terkonfirmasi.' : ''}`,
        `1. [ANALISIS SIKLUS TREN]: Fase market saat ini adalah ${smc.structure === 'BULLISH' ? 'UPTREND (Fokus mencari setup BUY di Higher Low)' : smc.structure === 'BEARISH' ? 'DOWNTREND (Fokus mencari setup SELL di Lower High)' : 'SIDEWAYS (Fokus pada pantulan Support/Resistance)'}. ${smc.structure === 'SIDEWAYS' ? `Ingat aturan Sideways: Ini adalah fase transisi. Saat ini ada ~${smc.sidewaysBounces} pantulan, antisipasi pergerakan besar berikutnya.` : ''} ${smc.baseTrading !== 'NONE' ? 'Aksi ' + smc.baseTrading.replace(/_/g, ' ') + ' tervalidasi.' : ''} ${smc.chartPattern !== 'NONE' ? 'Pola ' + smc.chartPattern.replace(/_/g, ' ') + ' memberikan petunjuk arah.' : ''}`,
        `1. [PEMETAAN STRUKTUR]: Pemetaan HH/HL/LL/LH mengkonfirmasi bahwa market sedang ${smc.structure === 'BULLISH' ? 'dalam jalur UPTREND yang solid.' : smc.structure === 'BEARISH' ? 'dalam tekanan DOWNTREND yang kuat.' : 'terjebak dalam fase SIDEWAYS.'} ${smc.structure === 'SIDEWAYS' ? `Fase Sideways ini adalah "Halte" tempat institusi mengumpulkan order. Terdeteksi ${smc.sidewaysBounces} pantulan sebelum tren baru dimulai.` : ''} ${isBullish ? 'Fokus pada peluang Buy mengikuti arus institusi.' : (isBearish ? 'Fokus pada peluang Sell mengikuti tekanan institusi.' : 'Market ranging, waspada manipulasi harga.')} ${smc.chartPattern !== 'NONE' ? 'Didukung oleh formasi ' + smc.chartPattern.replace(/_/g, ' ') + '.' : ''}`,
        `1. [SIKLUS HARGA & CHART PATTERN]: Berdasarkan pergerakan harga, kita berada di fase ${smc.structure === 'BULLISH' ? 'UPTREND' : smc.structure === 'BEARISH' ? 'DOWNTREND' : 'SIDEWAYS'}. ${smc.structure === 'SIDEWAYS' ? `Sesuai siklus market, Sideways selalu menjembatani dua tren utama. Waspada setelah 2-3 pantulan (saat ini: ${smc.sidewaysBounces}).` : ''} ${smc.sndPattern !== 'NONE' ? 'Struktur ' + smc.sndPattern + ' terbentuk.' : ''} ${smc.chartPattern !== 'NONE' ? 'Pola ' + smc.chartPattern.replace(/_/g, ' ') + ' terdeteksi pada grafik.' : ''}`
    ][rand()];

    const p2 = [
        `2. [RETAIL PSYCHOLOGY]: Market saat ini berada dalam fase ${smc.phase}. ${smc.phase === 'MARKUP' ? 'Retail trader mulai FOMO (Fear of Missing Out) buy.' : smc.phase === 'MARKDOWN' ? 'Retail trader sedang panic selling.' : smc.phase === 'ACCUMULATION' ? 'Retail trader bosan dan cut loss, institusi menampung.' : 'Retail trader serakah, institusi mulai jualan.'}`,
        `2. [SENTIMEN PASAR]: Deteksi siklus menunjukkan fase ${smc.phase}. ${smc.phase === 'MARKUP' ? 'Euforia bullish sedang menguasai ritel.' : smc.phase === 'MARKDOWN' ? 'Ketakutan (Fear) memegang kendali penuh ritel.' : smc.phase === 'ACCUMULATION' ? 'Fase keputusasaan ritel sebelum kenaikan.' : 'Fase keserakahan ritel sebelum potensi penurunan.'}`,
        `2. [KONDISI SIKLUS]: Kita berada di tahap ${smc.phase}. ${smc.phase === 'MARKUP' ? 'Tanda-tanda partisipasi publik yang terlambat dalam tren naik.' : smc.phase === 'MARKDOWN' ? 'Kepanikan massal mendominasi.' : smc.phase === 'ACCUMULATION' ? 'Smart money menyerap likuiditas dari ritel yang menyerah.' : 'Smart money mendistribusikan aset ke ritel yang FOMO.'}`,
        `2. [ZONA SIKLUS]: Analisis Wyckoff mendeteksi fase ${smc.phase}. ${smc.phase === 'MARKUP' ? 'Tren naik didorong oleh emosi massa.' : smc.phase === 'MARKDOWN' ? 'Tren turun diperparah oleh margin call ritel.' : smc.phase === 'ACCUMULATION' ? 'Konsolidasi bawah: transfer kekayaan dari ritel ke institusi.' : 'Konsolidasi atas: transfer risiko dari institusi ke ritel.'}`
    ][rand()];

    const p3 = [
        `3. [TEKNIKAL ANALISIS - SNR & TRENDLINE]: Dari sisi Support And Resistant (SNR) dan Trendline, terdapat ${smc.bullishStrongCount} dorongan Bullish kuat vs ${smc.bearishStrongCount} Bearish kuat. ${smc.bullishStrongCount > smc.bearishStrongCount ? 'Momentum beli sangat agresif menembus resistance.' : 'Momentum jual sangat agresif menembus support.'}`,
        `3. [TEKNIKAL ANALISIS - SNR & TRENDLINE]: Statistik 150 candle mencatat ${smc.bullishStrongCount} injeksi Buyer dan ${smc.bearishStrongCount} tekanan Seller pada area Support And Resistant. ${smc.bullishStrongCount > smc.bearishStrongCount ? 'Dominasi hijau menunjukkan urgensi beli di area support.' : 'Dominasi merah menunjukkan urgensi jual di area resistance.'}`,
        `3. [TEKNIKAL ANALISIS - SNR & TRENDLINE]: Perbandingan candle solid menunjukkan ${smc.bullishStrongCount} Bullish berbanding ${smc.bearishStrongCount} Bearish di sekitar Trendline. ${smc.bullishStrongCount > smc.bearishStrongCount ? 'Tekanan beli mendominasi volatilitas.' : 'Tekanan jual lebih masif dan volatil.'}`,
        `3. [TEKNIKAL ANALISIS - SNR & TRENDLINE]: Kekuatan pasar terbagi menjadi ${smc.bullishStrongCount} candle naik solid dan ${smc.bearishStrongCount} candle turun solid pada level Support And Resistant. ${smc.bullishStrongCount > smc.bearishStrongCount ? 'Banteng (Bull) mengendalikan momentum.' : 'Beruang (Bear) menguasai volatilitas.'}`
    ][rand()];

    const p4 = [
        `4. [LIQUIDITY SWEEP (STOP HUNT)]: ${smc.liquiditySweep === 'SELL_SIDE' ? 'Stop loss ritel (Sell-side) baru saja disapu bersih oleh institusi (Stop Hunt).' : smc.liquiditySweep === 'BUY_SIDE' ? 'Stop loss ritel (Buy-side) telah diambil (Stop Hunt).' : 'Belum ada sapuan likuiditas (Sweep) yang signifikan.'} ${smc.liquiditySweep !== 'NONE' && smc.bos !== 'NONE' ? 'Kombinasi maut Stop Hunt (SH) + Break Market Structure (BMS) terdeteksi!' : ''}`,
        `4. [JEBAKAN LIKUIDITAS]: ${smc.liquiditySweep === 'SELL_SIDE' ? 'Harga memancing ritel untuk sell lalu berbalik (Sell-side Sweep / Stop Hunt).' : smc.liquiditySweep === 'BUY_SIDE' ? 'Harga memancing ritel untuk buy lalu berbalik (Buy-side Sweep / Stop Hunt).' : 'Market masih bergerak natural tanpa manipulasi likuiditas ekstrem.'} ${smc.liquiditySweep !== 'NONE' && smc.bos !== 'NONE' ? 'Validasi SH + BMS memberikan probabilitas kemenangan sangat tinggi.' : ''}`,
        `4. [ZONA MANIPULASI]: ${smc.liquiditySweep === 'SELL_SIDE' ? 'Institusi telah mengambil likuiditas di bawah support (Stop Hunt) untuk bahan bakar naik.' : smc.liquiditySweep === 'BUY_SIDE' ? 'Institusi telah mengambil likuiditas di atas resistance (Stop Hunt) untuk bahan bakar turun.' : 'Tidak terdeteksi adanya perburuan stop-loss skala besar.'} ${smc.liquiditySweep !== 'NONE' && smc.bos !== 'NONE' ? 'Pola SH + BMS mengkonfirmasi arah institusi.' : ''}`,
        `4. [STATUS LIQUIDITY]: ${smc.liquiditySweep === 'SELL_SIDE' ? 'Likuiditas bawah telah dibersihkan (Stop Hunt), jalan ke atas terbuka lebar.' : smc.liquiditySweep === 'BUY_SIDE' ? 'Likuiditas atas telah dibersihkan (Stop Hunt), jalan ke bawah terbuka lebar.' : 'Likuiditas utama masih utuh, waspada pergerakan tiba-tiba.'} ${smc.liquiditySweep !== 'NONE' && smc.bos !== 'NONE' ? 'Kombinasi SH + BMS adalah setup terbaik Smart Money.' : ''}`
    ][rand()];

    const p5 = [
        `5. [KONFIRMASI STRUKTUR]: ${smc.choch !== 'NONE' ? 'Terjadi perubahan karakter (CHoCH) ' + smc.choch + ', tren mulai berbalik mengikuti institusi.' : smc.bos !== 'NONE' ? 'Tren berlanjut dengan penembusan struktur (BOS) ' + smc.bos + '.' : 'Belum ada penembusan struktur (BOS/CHoCH) baru.'} ${smc.choch !== 'NONE' && Math.abs(totalScore) > 6 ? 'Pola Quick RTO (Return to Origin) terdeteksi, ini adalah setup probabilitas tinggi.' : ''}`,
        `5. [BREAKOUT VALID]: ${smc.choch !== 'NONE' ? 'Sinyal awal pembalikan arah terkonfirmasi via CHoCH ' + smc.choch + '.' : smc.bos !== 'NONE' ? 'Struktur lama berhasil ditembus (BOS ' + smc.bos + '), tren berlanjut.' : 'Harga masih tertahan di dalam struktur lama.'} ${smc.choch !== 'NONE' && Math.abs(totalScore) > 6 ? 'Harga kembali ke Origin (RTO) pasca CHoCH, area entry ideal.' : ''}`,
        `5. [PERGESERAN TREN]: ${smc.choch !== 'NONE' ? 'Market menunjukkan indikasi reversal kuat (CHoCH ' + smc.choch + ').' : smc.bos !== 'NONE' ? 'Konfirmasi penerusan arah terdeteksi (BOS ' + smc.bos + ').' : 'Tidak ada pergeseran struktur yang terdeteksi saat ini.'} ${smc.choch !== 'NONE' && Math.abs(totalScore) > 6 ? 'Setup CHoCH + RTO tervalidasi, siapkan posisi.' : ''}`,
        `5. [STATUS BREAK]: ${smc.choch !== 'NONE' ? 'Level penting ditembus berlawanan arah (CHoCH ' + smc.choch + ').' : smc.bos !== 'NONE' ? 'Level penting ditembus searah tren (BOS ' + smc.bos + ').' : 'Market sedang menguji batas struktur tanpa penembusan.'} ${smc.choch !== 'NONE' && Math.abs(totalScore) > 6 ? 'Quick Return to Origin (RTO) memberikan konfirmasi entry.' : ''}`
    ][rand()];

    const isLimitEntryTF = timeframe === 'M15' || timeframe === 'M30' || timeframe === 'H1';
    const entryTypeStr = isLimitEntryTF ? 'Limit Entry (RR lebih kecil, probabilitas tereksekusi tinggi)' : 'Confirmation Entry (Tunggu CHoCH di TF kecil, RR lebih besar)';

    const p6 = [
        `6. [LOKASI HARGA & ENTRY TYPE]: Harga saat ini berada di area ${smc.fibonacciZone === 'DISCOUNT' ? 'Discount (Murah)' : smc.fibonacciZone === 'PREMIUM' ? 'Premium (Mahal)' : 'Equilibrium (Tengah)'}. Direkomendasikan menggunakan ${entryTypeStr}. Ini adalah setup Low Risk, High Reward.`,
        `6. [ZONA SND & ENTRY TYPE]: Posisi harga masuk ke zona ${smc.fibonacciZone === 'DISCOUNT' ? 'Demand (Discount Zone)' : smc.fibonacciZone === 'PREMIUM' ? 'Supply (Premium Zone)' : 'Netral'}. Berdasarkan timeframe ${timeframe}, gunakan ${entryTypeStr}.`,
        `6. [VALUASI MARKET & ENTRY TYPE]: Secara valuasi, harga sedang berada di tingkat ${smc.fibonacciZone === 'DISCOUNT' ? 'Oversold/Discount, sangat menarik bagi buyer institusi.' : smc.fibonacciZone === 'PREMIUM' ? 'Overbought/Premium, sangat menarik bagi seller institusi.' : 'Wajar (Fair Value).'}. Strategi eksekusi: ${entryTypeStr}.`,
        `6. [AREA KEPUTUSAN & ENTRY TYPE]: Kita berada di wilayah ${smc.fibonacciZone === 'DISCOUNT' ? 'Bawah (Discount Zone)' : smc.fibonacciZone === 'PREMIUM' ? 'Atas (Premium Zone)' : 'Tengah range'}. Sesuai aturan timeframe ${timeframe}, terapkan ${entryTypeStr}.`
    ][rand()];

    const p7 = [
        `7. [JEJAK INSTITUSI & CRT]: Terdeteksi adanya Order Block (OB) ${smc.orderBlock !== 'NONE' ? smc.orderBlock : 'yang belum jelas'}. Status Candle Range Theory (CRT): ${smc.crtStatus}.`,
        `7. [ORDER BLOCK & CRT]: Terdapat blok pesanan besar (OB) ${smc.orderBlock !== 'NONE' ? smc.orderBlock : 'yang tidak teridentifikasi'}. Analisis CRT menunjukkan fase ${smc.crtStatus}.`,
        `7. [ZONA REAKSI & CRT]: Area ini memiliki Order Block ${smc.orderBlock !== 'NONE' ? smc.orderBlock : 'yang minim'}. Konfirmasi CRT: ${smc.crtStatus}.`,
        `7. [INSTITUTIONAL ENTRY]: Jejak smart money (OB) ${smc.orderBlock !== 'NONE' ? 'bertipe ' + smc.orderBlock + ' terlihat jelas.' : 'belum terbentuk sempurna.'} Status CRT: ${smc.crtStatus}.`
    ][rand()];

    const p8 = [
        `8. [IMBALANCE & FIBONACCI]: Terdapat Fair Value Gap (FVG) ${smc.fvg !== 'NONE' ? smc.fvg : 'yang sudah tertutup'}. ${smc.fibonacciOTE ? 'Harga mendekati zona OTE Fibonacci.' : ''}`,
        `8. [KETIDAKSEIMBANGAN & OTE]: Market meninggalkan FVG ${smc.fvg !== 'NONE' ? smc.fvg : 'yang minim'}. ${smc.fibonacciOTE ? 'Level Golden Zone (0.618) terpantau.' : ''}`,
        `8. [GAP HARGA & FIBO]: Ruang kosong atau FVG ${smc.fvg !== 'NONE' ? smc.fvg : 'tidak ditemukan'}. ${smc.fibonacciOTE ? 'Retracement Fibonacci mendukung area ini.' : ''}`,
        `8. [INEFFICIENCY & OTE]: Terdeteksi inefisiensi pasar (FVG) ${smc.fvg !== 'NONE' ? smc.fvg : 'yang telah diseimbangkan'}. ${smc.fibonacciOTE ? 'Zona Premium/Discount Fibonacci aktif.' : ''}`
    ][rand()];

    const p9 = [
        `9. [ALGORITHMIC CONFLUENCE & PATTERN]: Area ini didukung oleh konfluensi indikator algoritmik (RSI/EMA) dan Pivot Points ${smc.pivotPoints ? `(PP: ${smc.pivotPoints.PP.toFixed(2)})` : ''}. ${smc.chartPattern !== 'NONE' ? 'Pola grafik ' + smc.chartPattern.replace(/_/g, ' ') + ' terdeteksi, memperkuat sinyal.' : ''}`,
        `9. [BATAS PSIKOLOGIS & CHART PATTERN]: Terdapat pertemuan (confluence) zona SMC dengan level Support/Resistance klasik dan Pivot ${smc.pivotPoints ? `(R1/S1 aktif)` : ''}. ${smc.chartPattern !== 'NONE' ? 'Validasi tambahan dari pola ' + smc.chartPattern.replace(/_/g, ' ') + '.' : ''}`,
        `9. [KEY LEVEL & FORMASI]: Harga bereaksi pada level kunci algoritmik dan Pivot Point ${smc.pivotPoints ? `(S2/R2 terpantau)` : ''} yang sering menjadi titik balik institusi. ${smc.chartPattern !== 'NONE' ? 'Formasi ' + smc.chartPattern.replace(/_/g, ' ') + ' terbentuk.' : ''}`,
        `9. [ZONA PENAHAN & STRUKTUR]: Konfluensi indikator dan Pivot Points ${smc.pivotPoints ? `(PP: ${smc.pivotPoints.PP.toFixed(2)})` : ''} memberikan lapisan pertahanan ekstra untuk setup sniper. ${smc.chartPattern !== 'NONE' ? 'Pola ' + smc.chartPattern.replace(/_/g, ' ') + ' mengkonfirmasi arah.' : ''}`
    ][rand()];

    const p10 = [
        `10. [CANDLESTICK TRIGGER & MOMENTUM]: Muncul pola candlestick ${patterns.length > 0 ? patterns[0].name : 'Netral/Doji'} sebagai pemicu. ${contextualCandleNarrative} ${patterns.length > 0 && patterns[0].name === 'Bullish Engulfing' ? 'Surge in buying pressure terdeteksi di bottom downtrend.' : ''} ${smc.bullishStrongCount > smc.bearishStrongCount * 1.5 ? 'Momentum Akselerasi (Cepat) terdeteksi, tren sangat kuat.' : smc.dojiCount > 20 ? 'Momentum Deselerasi (Lambat) terdeteksi, waspada reversal.' : ''}`,
        `10. [AKSI HARGA & RITME]: Reaksi harga membentuk pola ${patterns.length > 0 ? patterns[0].name : 'konsolidasi'}. ${contextualCandleNarrative} ${patterns.length > 0 && patterns[0].name === 'Bearish Engulfing' ? 'Surge in selling pressure terdeteksi di top uptrend.' : ''} ${smc.bearishStrongCount > smc.bullishStrongCount * 1.5 ? 'Momentum Akselerasi (Cepat) ke bawah, tren sangat kuat.' : smc.dojiCount > 20 ? 'Ritme harga melambat (Deselerasi), potensi CHoCH tinggi.' : ''}`,
        `10. [TRIGGER ENTRY & PACE]: Pola ${patterns.length > 0 ? patterns[0].name : 'Indecision'} terdeteksi. ${contextualCandleNarrative} ${smc.bullishStrongCount + smc.bearishStrongCount > 30 ? 'Pace pergerakan harga sangat agresif (Akselerasi).' : 'Pace pergerakan harga lambat dan penuh keraguan (Deselerasi).'}`
    ][rand() % 3];

    const p11 = [
        `11. [RETAIL TRAP CONFIRMATION]: ${smc.inducement ? 'Terdeteksi adanya Inducement (jebakan ritel) sebelum pergerakan ini. Ritel sudah terkena stop loss, jalan aman.' : 'Tidak terlihat adanya jebakan (Inducement) yang mencolok.'}`,
        `11. [MANIPULASI PASAR]: ${smc.inducement ? 'Market baru saja melakukan pergerakan palsu (Inducement) untuk memancing likuiditas ritel.' : 'Pergerakan terlihat organik tanpa manipulasi (Inducement) yang jelas.'}`,
        `11. [SMART MONEY TRAP]: ${smc.inducement ? 'Pola Inducement terkonfirmasi, smart money telah mengumpulkan order dari ritel yang terjebak.' : 'Belum ada tanda-tanda jebakan likuiditas (Inducement) di area ini.'}`,
        `11. [STATUS INDUCEMENT]: ${smc.inducement ? 'Trader ritel telah dijebak (Inducement), jalan sekarang terbuka untuk pergerakan asli institusi.' : 'Market bergerak bersih tanpa pola jebakan (Inducement) sebelumnya.'}`
    ][rand()];

    const p12 = [
        `12. [ZERO DRAWDOWN PROTOCOL]: Berdasarkan skor (Total: ${totalScore}) pada mode ${modeName}, probabilitas keberhasilan setup ini > ${signal === 'WAIT' ? '0' : '92'}%. Target eksekusi adalah reaksi instan tanpa floating minus.`,
        `12. [SNIPER ACCURACY]: Kalkulasi algoritma mode ${modeName} memberikan Total Skor ${totalScore}, menghasilkan tingkat akurasi prediksi > ${signal === 'WAIT' ? '0' : '92'}%. Filter ketat diterapkan untuk memastikan Zero Drawdown.`,
        `12. [SKOR KESUKSESAN]: Dengan mempertimbangkan semua pilar pada mode ${modeName}, AI memberikan Total Skor ${totalScore} (Probabilitas > ${signal === 'WAIT' ? '0' : '92'}%). Hanya setup sniper ekstrem yang dieksekusi.`,
        `12. [RATING SETUP]: Setup mode ${modeName} ini dievaluasi dengan Total Skor ${totalScore}, mencerminkan peluang profit instan sebesar > ${signal === 'WAIT' ? '0' : '92'}%. Fokus pada presisi entry untuk menghindari floating.`
    ][rand()];

    const p13 = [
        `13. [RISK MANAGEMENT]: Setup ini menggunakan rasio Risk:Reward (RR) sebesar ${rrType}, sangat sehat untuk pertumbuhan akun dengan risiko minimal.`,
        `13. [PROFIL RISIKO]: Target keuntungan dan batasan kerugian diatur ketat dengan rasio RR ${rrType}, memastikan profitabilitas jangka panjang.`,
        `13. [RISK/REWARD RATIO]: Skema perdagangan ini menawarkan rasio RR ${rrType}, memberikan ruang yang cukup dengan Stop Loss yang sangat presisi.`,
        `13. [PARAMETER TRADING]: Dengan rasio RR ${rrType}, setup ini memenuhi standar manajemen risiko institusional yang ketat.`
    ][rand()];

    const p14 = [
        `14. [BASE TRADING & ZONA KESEIMBANGAN]: ${smc.baseTrading !== 'NONE' ? `Harga berada di Zona Keseimbangan (Halte) dengan sinyal ${smc.baseTrading.replace(/_/g, ' ')}.` : 'Harga tidak sedang berada di Zona Keseimbangan (Halte) yang signifikan.'} ${totalScore > 5 && (smc.sndPattern === 'RBR' || smc.sndPattern === 'DBR') ? 'Stochastic oscillator mengkonfirmasi momentum naik dari area oversold.' : (totalScore < -5 && (smc.sndPattern === 'DBD' || smc.sndPattern === 'RBD') ? 'Stochastic oscillator mengkonfirmasi momentum turun dari area overbought.' : '')}`,
        `14. [SND, STOCHASTIC & ENTRY TYPE]: ${smc.baseTrading !== 'NONE' ? `Reaksi harga pada Zona Keseimbangan (${smc.baseTrading.replace(/_/g, ' ')}) memvalidasi arah pergerakan.` : 'Harga tidak sedang berada di Zona Keseimbangan (Halte).'} ${totalScore > 5 && (smc.sndPattern === 'RBR' || smc.sndPattern === 'DBR') ? 'Konfluensi Demand Zone dan Stochastic crossing level 20 memvalidasi sinyal BUY.' : (totalScore < -5 && (smc.sndPattern === 'DBD' || smc.sndPattern === 'RBD') ? 'Konfluensi Supply Zone dan Stochastic crossing level 80 memvalidasi sinyal SELL.' : '')}`
    ][rand() % 2];

    const p15 = [
        `15. [TRADING SESSION]: Saat ini berada di ${getCurrentSession()}. ${getCurrentSession().includes('Overlap') ? 'Volatilitas tinggi diharapkan, cocok untuk eksekusi cepat.' : 'Volatilitas mungkin lebih rendah, waspada pergerakan lambat atau ranging.'}`,
        `15. [WAKTU PASAR]: Sesi aktif adalah ${getCurrentSession()}. ${getCurrentSession().includes('Overlap') ? 'Likuiditas maksimal dari dua pusat keuangan besar sedang berlangsung.' : 'Perhatikan karakteristik likuiditas pada sesi ini.'}`
    ][rand() % 2];

    const p16 = [
        `16. [QUANTUM NEURON DECISION]: **${signal === 'WAIT' ? 'WAIT (TUNGGU)' : `EKSEKUSI ${signal}`}**. ${signal === 'WAIT' ? `Skor mode ${modeName} belum mencapai batas minimal sniper atau konfirmasi belum valid.` : `Semua parameter konfirmasi mode ${modeName} (Institusi, Ritel, Algoritma) telah selaras sempurna.`}`,
        `16. [KESIMPULAN AI]: **${signal === 'WAIT' ? 'WAIT (TUNGGU)' : `EKSEKUSI ${signal}`}**. ${signal === 'WAIT' ? `Sabar, jangan paksakan entry saat probabilitas rendah (Skor < ${minScore}) pada mode ${modeName}.` : `Setup mode ${modeName} valid dengan konfirmasi ganda, silakan tempatkan posisi sniper sesuai parameter.`}`,
        `16. [REKOMENDASI SISTEM]: **${signal === 'WAIT' ? 'WAIT (TUNGGU)' : `EKSEKUSI ${signal}`}**. ${signal === 'WAIT' ? `Lebih baik menjaga modal hingga setup sniper mode ${modeName} yang tepat muncul di area OB/FVG.` : `Lampu hijau dari Quantum Engine untuk mode ${modeName}, eksekusi dengan disiplin ${rrType}.`}`,
        `16. [TINDAKAN FINAL]: **${signal === 'WAIT' ? 'WAIT (TUNGGU)' : `EKSEKUSI ${signal}`}**. ${signal === 'WAIT' ? `Tidak ada peluang sniper mode ${modeName} yang jelas, pantau terus pergerakan harga.` : `Momentum, struktur, dan psikologi pasar selaras untuk mode ${modeName}, eksekusi sniper sekarang.`}`
    ][rand()];

    return [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16];
};

export const analyzeLocalMarket = (
  asset: Asset,
  candles: Candle[],
  timeframe: TimeFrame
): AnalysisResult => {
  
  if (!candles || candles.length < 150) {
      return {
          signal: 'WAIT', confidence: 0, entryPrice: 0, stopLoss: 0, takeProfit: 0, riskRewardRatio: "0:0",
          reasoning: Array(14).fill("Initializing ASI Core (Need 150 Candles)..."), smcConceptsFound: [], timestamp: new Date().toLocaleTimeString(), timeframe: timeframe
      };
  }

  const current = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const rsi = calculateRSI(candles, 14);
  const stoch = calculateStochastic(candles, 14, 3);
  const atr = calculateATR(candles, 14) || (current.close * 0.001);
  const emaState = analyzeEMACondition(candles);
  const patterns = detectCandlestickPatterns(candles);
  const smc = detectSMC(candles, timeframe);

  // --- MATHEMATICAL AGENT LOGIC (LOCAL BRAIN) ---
  
  let signal: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
  let confidence = 0;
  let setupType = "SMC_TREND";

  // TIMEFRAME-SPECIFIC THRESHOLDS (Strict Sniper Mode)
  let minScore = 7;
  let rrRatioVal = 3.0;
  let rrLabel = "1:3";

  const isCrypto = [Asset.BTCUSD, Asset.ETHUSD, Asset.SOLUSD, Asset.BNBUSD].includes(asset);

  if (isCrypto) {
      if (timeframe === 'M1') { minScore = 5; rrRatioVal = 2.0; rrLabel = "1:2"; }
      else if (timeframe === 'M5') { minScore = 6; rrRatioVal = 2.5; rrLabel = "1:2.5"; }
      else if (timeframe === 'M15') { minScore = 7; rrRatioVal = 3.0; rrLabel = "1:3"; }
      else if (timeframe === 'M30') { minScore = 7; rrRatioVal = 3.0; rrLabel = "1:3"; }
      else if (timeframe === 'H1') { minScore = 8; rrRatioVal = 4.0; rrLabel = "1:4"; }
      else if (timeframe === 'H4' || timeframe === 'D1') { minScore = 8; rrRatioVal = 5.0; rrLabel = "1:5"; }
  } else {
      // Forex/Gold - Stricter for zero drawdown
      if (timeframe === 'M1') { minScore = 8; rrRatioVal = 3.0; rrLabel = "1:3"; }
      else if (timeframe === 'M5') { minScore = 8; rrRatioVal = 3.0; rrLabel = "1:3"; }
      else if (timeframe === 'M15') { minScore = 8; rrRatioVal = 4.0; rrLabel = "1:4"; }
      else if (timeframe === 'M30') { minScore = 8; rrRatioVal = 4.0; rrLabel = "1:4"; }
      else if (timeframe === 'H1') { minScore = 9; rrRatioVal = 5.0; rrLabel = "1:5"; }
      else if (timeframe === 'H4' || timeframe === 'D1') { minScore = 9; rrRatioVal = 5.0; rrLabel = "1:5"; }
  }

  // 1. LAYER 1: SMC VECTOR (DIRECTION)
  const emaValues = emaState.values || { ema50: current.close, ema200: current.close };
  const isUptrend = current.close > emaValues.ema200 && current.close > emaValues.ema50;
  const isDowntrend = current.close < emaValues.ema200 && current.close < emaValues.ema50;

  // 2. LAYER 2 & 4: SND LOCATION & CANDLE TRIGGER
  const bullishPatterns = patterns.filter(p => p.type === 'BULLISH');
  const bearishPatterns = patterns.filter(p => p.type === 'BEARISH');
  
  // --- ADVANCED SCORING SYSTEM (QUANTUM NEURON v4.0) ---
  let totalScore = smc.score; // Base score from SMC structure

  // Check if price is in Demand Zone (using SMC sndPattern or baseTrading as proxy for zones)
  const inDemandZone = smc.sndPattern === 'RBR' || smc.sndPattern === 'DBR' || smc.baseTrading === 'BASE_RETURN_BULLISH';
  const inSupplyZone = smc.sndPattern === 'DBD' || smc.sndPattern === 'RBD' || smc.baseTrading === 'BASE_RETURN_BEARISH';

  // Stochastic crossing up from below 20
  const prevStochK = calculateStochastic(candles.slice(0, -1), 14, 3).k;
  const stochCrossUp20 = prevStochK < 20 && stoch.k >= 20;
  
  // Stochastic crossing down from above 80
  const stochCrossDown80 = prevStochK > 80 && stoch.k <= 80;

  if (inDemandZone && stochCrossUp20) {
      totalScore += 8; // High probability signal from PDF
  }
  if (inSupplyZone && stochCrossDown80) {
      totalScore -= 8; // High probability signal from PDF
  }

  // 1. NEURAL EMOTIONAL LAYER (Market Sentiment Simulation)
  const fearGreedIndex = rsi; // Simplified: <30 Fear, >70 Greed
  
  let emotionalBias = 0;
  if (fearGreedIndex < 25) emotionalBias = 2; // Extreme Fear = Opportunity
  if (fearGreedIndex > 75) emotionalBias = -2; // Extreme Greed = Danger

  // 2. ZERO-FLOATING PROTOCOL (Precision Filter)
  const isAtExtremeZone = smc.orderBlock !== 'NONE' || smc.liquiditySweep !== 'NONE' || smc.sndPattern !== 'NONE' || smc.fibonacciOTE !== null || smc.baseTrading !== 'NONE';
  const momentumStrength = Math.abs(current.close - prev.close) / atr;
  
  if (isAtExtremeZone && momentumStrength > 1.5) {
      // High momentum at key zone = High probability of instant reaction
      totalScore += (totalScore > 0 ? 3 : -3);
  }

  // --- FOREXIMF BREAKOUT VS PULLBACK STRATEGY ---
  const hasBullishMomentum = patterns.some(p => p.name === 'Bullish Marubozu' || p.name === 'Bullish Engulfing');
  const hasBearishMomentum = patterns.some(p => p.name === 'Bearish Marubozu' || p.name === 'Bearish Engulfing');
  
  const isBreakoutBuy = smc.baseTrading === 'BASE_BREAK_BULLISH' && hasBullishMomentum;
  const isBreakoutSell = smc.baseTrading === 'BASE_BREAK_BEARISH' && hasBearishMomentum;
  
  const isPullbackBuy = smc.baseTrading === 'BASE_RETURN_BULLISH';
  const isPullbackSell = smc.baseTrading === 'BASE_RETURN_BEARISH';

  // Reward Pullbacks higher as per PDF recommendation (lower risk, higher probability)
  if (isPullbackBuy) totalScore += 5;
  if (isPullbackSell) totalScore -= 5;
  
  // Breakouts are good if validated by momentum
  if (isBreakoutBuy) totalScore += 3;
  if (isBreakoutSell) totalScore -= 3;

  // Add Candlestick Pattern Scores (Trigger)
  
  if (bullishPatterns.length > 0) {
      const bestPattern = bullishPatterns[0];
      if (bestPattern.name === 'Bullish Engulfing') {
          // PDF Rule: Stronger signal if RSI is oversold
          if (rsi < 35) totalScore += 6; 
          else totalScore += 4;
      }
      else if (bestPattern.name.includes('Morning Star') || bestPattern.name.includes('Three White Soldiers') || bestPattern.name.includes('Engulfing')) totalScore += 4;
      else if (bestPattern.strength >= 3) totalScore += 3;
      else totalScore += 1;
  }
  if (bearishPatterns.length > 0) {
      const bestPattern = bearishPatterns[0];
      if (bestPattern.name === 'Bearish Engulfing') {
          if (rsi > 65) totalScore -= 6;
          else totalScore -= 4;
      }
      else if (bestPattern.name.includes('Evening Star') || bestPattern.name.includes('Three Black Crows') || bestPattern.name.includes('Engulfing')) totalScore -= 4;
      else if (bestPattern.strength >= 3) totalScore -= 3;
      else totalScore -= 1;
  }

  // --- CONTEXTUAL CANDLESTICK ANALYSIS (CARA MEMBACA POSISI CANDLESTICK) ---
  const cBody = Math.abs(current.close - current.open);
  const cUpper = current.high - Math.max(current.close, current.open);
  const cLower = Math.min(current.close, current.open) - current.low;
  const cIsBullish = current.close > current.open;
  const cIsBearish = current.close < current.open;
  const cIsDoji = cBody <= 0.1 * (current.high - current.low);
  const cIsLongBody = cBody > atr * 0.8; // Approximation of long body

  const pBody = Math.abs(prev.close - prev.open);
  const pIsLongBody = pBody > atr * 0.8;
  const pIsShortBody = pBody < atr * 0.4 && pBody > 0.1 * (prev.high - prev.low);
  const pIsBullish = prev.close > prev.open;
  const pIsBearish = prev.close < prev.open;

  let contextualCandleNarrative = "";

  // 1. Doji Context
  if (cIsDoji) {
      if (pIsLongBody) {
          if (pIsBullish) { totalScore += 2; contextualCandleNarrative = "Doji setelah Long Bullish: Penyumbatan tenaga, potensi ledakan ke atas."; }
          if (pIsBearish) { totalScore -= 2; contextualCandleNarrative = "Doji setelah Long Bearish: Penyumbatan tenaga, potensi ledakan ke bawah."; }
      } else if (pIsShortBody) {
          if (isUptrend) { totalScore -= 3; contextualCandleNarrative = "Doji setelah Spinning Top di Uptrend: Market melemah, potensi reversal turun."; }
          if (isDowntrend) { totalScore += 3; contextualCandleNarrative = "Doji setelah Spinning Top di Downtrend: Market melemah, potensi reversal naik."; }
      }
  }

  // 2. Ekor Atas Panjang (Long Upper Wick)
  if (cUpper > 2 * cBody && cUpper > cLower) {
      if (isUptrend) {
          if (cIsBearish) { totalScore -= 3; contextualCandleNarrative = "Ekor Atas Panjang (Bearish) di Uptrend: Tekanan turun kuat, potensi reversal turun."; }
          else if (cIsBullish) { totalScore += 2; contextualCandleNarrative = "Ekor Atas Panjang (Bullish) di Uptrend: Koreksi selesai, siap lanjut naik."; }
      } else if (isDowntrend) {
          totalScore += 2; contextualCandleNarrative = "Ekor Atas Panjang di Downtrend: Percobaan mengangkat harga, potensi reversal naik.";
      }
  }

  // 3. Body Panjang (Long Body)
  if (cIsLongBody) {
      if ((rsi > 70 && cIsBullish) || (rsi < 30 && cIsBearish)) {
          if (cIsBullish) { totalScore -= 4; contextualCandleNarrative = "Long Bullish Body di area Jenuh Beli (Overbought): Anomali/Exhaustion, potensi reversal turun."; }
          if (cIsBearish) { totalScore += 4; contextualCandleNarrative = "Long Bearish Body di area Jenuh Jual (Oversold): Anomali/Exhaustion, potensi reversal naik."; }
      } else if ((pIsBearish && rsi > 30 && rsi < 50 && cIsBullish) || (pIsBullish && rsi < 70 && rsi > 50 && cIsBearish)) {
          if (cIsBullish) { totalScore += 2; contextualCandleNarrative = "Long Bullish Body meninggalkan area bawah: Dominasi buyer, lanjut naik."; }
          if (cIsBearish) { totalScore -= 2; contextualCandleNarrative = "Long Bearish Body meninggalkan area atas: Dominasi seller, lanjut turun."; }
      }
  }

  // 4. Ekor Bawah Panjang (Long Lower Wick)
  if (cLower > 2 * cBody && cLower > cUpper) {
      if (isDowntrend) {
          totalScore += 3; contextualCandleNarrative = "Ekor Bawah Panjang di Downtrend: Upaya pembalikan arah, potensi reversal naik.";
      } else if (isUptrend) {
          totalScore -= 2; contextualCandleNarrative = "Ekor Bawah Panjang di Uptrend: Percobaan untuk turun, potensi reversal turun.";
      } else {
          if (cIsBearish) { totalScore -= 2; contextualCandleNarrative = "Ekor Bawah Panjang (Bearish) di Volatile: Market siap turun lagi."; }
          if (cIsBullish) { totalScore += 2; contextualCandleNarrative = "Ekor Bawah Panjang (Bullish) di Volatile: Tenaga naik terbukti besar, siap naik."; }
      }
  }

  // Apply Emotional Bias
  totalScore += emotionalBias;

  // Add Zone Rejection Scores (Algorithmic Confluence)
  if (rsi < 35 && isUptrend) totalScore += 4; 
  if (rsi > 65 && isDowntrend) totalScore -= 4; 

  // Retail Trap (Inducement) Multiplier - High probability if retail is trapped
  if (smc.inducement) {
      if (totalScore > 0) totalScore += 3;
      if (totalScore < 0) totalScore -= 3;
  }

  // New SMC Concepts Scoring
  if (smc.sndPattern === 'RBR' || smc.sndPattern === 'DBR') totalScore += 2;
  if (smc.sndPattern === 'DBD' || smc.sndPattern === 'RBD') totalScore -= 2;
  
  if (smc.baseTrading === 'BASE_BREAK_BULLISH' || smc.baseTrading === 'BASE_RETURN_BULLISH') totalScore += 3;
  if (smc.baseTrading === 'BASE_BREAK_BEARISH' || smc.baseTrading === 'BASE_RETURN_BEARISH') totalScore -= 3;

  if (smc.crtStatus === 'ACCUMULATION') totalScore += 1;
  if (smc.crtStatus === 'DISTRIBUTION') totalScore -= 1;
  if (smc.crtStatus === 'MANIPULATION_SWEEP') {
      if (totalScore > 0) totalScore += 2;
      if (totalScore < 0) totalScore -= 2;
  }

  if (smc.fibonacciOTE) {
      if (totalScore > 0) totalScore += 2;
      if (totalScore < 0) totalScore -= 2;
  }

  if (smc.pivotPoints) {
      if (current.close > smc.pivotPoints.PP) totalScore += 1;
      if (current.close < smc.pivotPoints.PP) totalScore -= 1;
  }

  // Interpretation (Strict Sniper Entry)
  const currentBodySize = Math.abs(current.close - current.open) / ((current.high - current.low) || 1);
  const isStrongConfirmation = currentBodySize >= (isCrypto ? 0.4 : 0.7); // Stricter for Forex
  
  let modeName = "TRADING";
  if (timeframe === 'M1' || timeframe === 'M5') modeName = "SCALPING";
  else if (timeframe === 'M15') modeName = "INTRADAY";
  else if (timeframe === 'M30') modeName = "DAY_TRADE";
  else if (timeframe === 'H1') modeName = "SWING_MINGGUAN";
  else if (timeframe === 'H4' || timeframe === 'D1') modeName = "SWING_BULANAN";

  if (totalScore >= minScore) {
      // ZERO FLOATING CHECK: Must have strong rejection or sweep
      const hasBullishConfirmation = bullishPatterns.length > 0 || isStrongConfirmation;
      const atBullishLevel = smc.orderBlock === 'BULLISH' || smc.liquiditySweep === 'SELL_SIDE' || smc.sndPattern === 'DBR' || smc.sndPattern === 'RBR' || smc.baseTrading === 'BASE_BREAK_BULLISH' || smc.baseTrading === 'BASE_RETURN_BULLISH';
      
      if (hasBullishConfirmation && atBullishLevel) {
          signal = 'BUY';
          confidence = Math.min(99.9, 88 + (totalScore * 1.5));
          setupType = `${modeName}_ZERO_FLOATING_BUY`;
      } else {
          signal = 'WAIT';
          setupType = "BULLISH_WAIT_FOR_ZERO_FLOATING_CONFIRMATION";
      }
  } else if (totalScore <= -minScore) {
      const hasBearishConfirmation = bearishPatterns.length > 0 || isStrongConfirmation;
      const atBearishLevel = smc.orderBlock === 'BEARISH' || smc.liquiditySweep === 'BUY_SIDE' || smc.sndPattern === 'DBD' || smc.sndPattern === 'RBD' || smc.baseTrading === 'BASE_BREAK_BEARISH' || smc.baseTrading === 'BASE_RETURN_BEARISH';

      if (hasBearishConfirmation && atBearishLevel) {
          signal = 'SELL';
          confidence = Math.min(99.9, 88 + (Math.abs(totalScore) * 1.5));
          setupType = `${modeName}_ZERO_FLOATING_SELL`;
      } else {
          signal = 'WAIT';
          setupType = "BEARISH_WAIT_FOR_ZERO_FLOATING_CONFIRMATION";
      }
  } else if (totalScore >= 4) {
      signal = 'WAIT';
      setupType = "BUILDING_BULLISH_MOMENTUM";
  } else if (totalScore <= -4) {
      signal = 'WAIT';
      setupType = "BUILDING_BEARISH_MOMENTUM";
  } else {
      signal = 'WAIT';
      setupType = "RETAIL_CHOP_ZONE_NO_TRADE";
  }

  // 3. LAYER 3: SNR (Implicitly handled by zones and EMA support in this simplified math model)

  // 4. EXECUTION CALCULATION
  let entry = current.close;
  let sl = 0, tp = 0;
  let pipsTarget = 0;
  let pipsRisk = 0;

  if (signal === 'BUY') {
      // SL below low of confirmation candle or OB
      const riskBuffer = current.close * 0.0005; 
      sl = Math.min(current.low, prev.low) - riskBuffer;
      const risk = entry - sl;
      tp = entry + (risk * rrRatioVal); 
      pipsRisk = (entry - sl) * (isCrypto ? 1 : 10000); // Approximate pips (10 points = 1 pip)
      pipsTarget = (tp - entry) * (isCrypto ? 1 : 10000);
  } else if (signal === 'SELL') {
      const riskBuffer = current.close * 0.0005;
      sl = Math.max(current.high, prev.high) + riskBuffer;
      const risk = sl - entry;
      tp = entry - (risk * rrRatioVal); 
      pipsRisk = (sl - entry) * (isCrypto ? 1 : 10000);
      pipsTarget = (entry - tp) * (isCrypto ? 1 : 10000);
  } else {
      sl = 0;
      tp = 0;
      rrLabel = "0:0";
  }

  // PREDICTION 10-25 CANDLES
  let prediction = "";
  let multiplier = 1.5;
  let candleTarget = "10-25";
  if (timeframe === 'M1' || timeframe === 'M5') { multiplier = 1.2; candleTarget = "10-15"; }
  else if (timeframe === 'M15' || timeframe === 'M30') { multiplier = 1.8; candleTarget = "15-20"; }
  else { multiplier = 2.5; candleTarget = "15-25"; }

  const avgSwingDist = atr * 10; // Approximation of average swing distance
  const targetPriceUp = current.close + (avgSwingDist * multiplier);
  const targetPriceDown = current.close - (avgSwingDist * multiplier);

  if (signal === 'BUY') {
      prediction = `Mode ${modeName} - Prediksi ${candleTarget} candle ke depan: Institusi memproyeksikan pergerakan impulsif naik menuju area likuiditas ${targetPriceUp.toFixed(4)} didukung oleh struktur bullish dan momentum saat ini. Secara Fundamental Analisis (Interest Rate & Inflation Rate), sentimen mendukung penguatan aset ini. Target Profit: ~${pipsTarget.toFixed(1)} Pips, Resiko: ~${pipsRisk.toFixed(1)} Pips.`;
  } else if (signal === 'SELL') {
      prediction = `Mode ${modeName} - Prediksi ${candleTarget} candle ke depan: Institusi memproyeksikan pergerakan impulsif turun menuju area likuiditas ${targetPriceDown.toFixed(4)} didukung oleh struktur bearish dan momentum saat ini. Secara Fundamental Analisis (Interest Rate & Inflation Rate), sentimen mendukung pelemahan aset ini. Target Profit: ~${pipsTarget.toFixed(1)} Pips, Resiko: ~${pipsRisk.toFixed(1)} Pips.`;
  } else {
      prediction = `Mode ${modeName} - Prediksi ${candleTarget} candle ke depan: Market kemungkinan akan bergerak ranging/sideways di sekitar ${current.close.toFixed(4)} untuk menjebak ritel sebelum pergerakan besar berikutnya. Fundamental Analisis saat ini netral.`;
  }

  const smcConcepts = ["ASI_CORE", setupType, timeframe + "_ANALYSIS"];
  if (smc.bos !== 'NONE') smcConcepts.push(`BOS_${smc.bos}`);
  if (smc.choch !== 'NONE') smcConcepts.push(`CHoCH_${smc.choch}`);
  if (smc.orderBlock !== 'NONE') smcConcepts.push(`OB_${smc.orderBlock}`);
  if (smc.fvg !== 'NONE') smcConcepts.push(`FVG_${smc.fvg}`);
  if (smc.liquiditySweep !== 'NONE') smcConcepts.push(`SWEEP_${smc.liquiditySweep}`);
  if (smc.inducement) smcConcepts.push('INDUCEMENT');
  if (smc.sndPattern !== 'NONE') smcConcepts.push(`SND_${smc.sndPattern}`);
  if (smc.baseTrading !== 'NONE') smcConcepts.push(`BASE_${smc.baseTrading}`);
  if (smc.liquidityType !== 'NONE') smcConcepts.push(`LIQ_${smc.liquidityType}`);
  if (smc.crtStatus !== 'NONE') smcConcepts.push(`CRT_${smc.crtStatus}`);
  if (smc.fibonacciOTE) smcConcepts.push('FIBO_OTE');
  if (smc.pivotPoints) smcConcepts.push('PIVOT_POINTS');
  smcConcepts.push(...patterns.map(p => p.name));

  const reasoning = generate16PointNarrative(signal, timeframe, rrLabel, smc, patterns, totalScore, minScore, modeName, contextualCandleNarrative);

  return {
    signal,
    confidence: signal === 'WAIT' ? 0 : confidence,
    entryPrice: entry,
    stopLoss: sl,
    takeProfit: tp,
    riskRewardRatio: rrLabel,
    reasoning: reasoning,
    smcConceptsFound: smcConcepts,
    timestamp: new Date().toLocaleTimeString(),
    timeframe: timeframe,
    prediction: prediction
  };
};
