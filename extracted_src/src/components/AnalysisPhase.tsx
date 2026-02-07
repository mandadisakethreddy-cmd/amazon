import { motion } from 'framer-motion';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import type { EmotionData } from '../hooks/useFaceDetection';
import { useMemo } from 'react';

interface AnalysisPhaseProps {
    data: EmotionData[];
}

export const AnalysisPhase: React.FC<AnalysisPhaseProps> = ({ data }) => {
    const { processedData, emotionSummary, dominantEmotion, communicationScore, neutralPercentage, isSimulated } = useMemo(() => {
        let displayData = data;
        let simulated = false;

        // GENERATE MOCK DATA IF EMPTY OR TOO SHORT
        if (displayData.length < 5) {
            simulated = true;
            // Generate ~2 minutes of data (480 samples at 250ms)
            // Target ~75% Neutral, rest mixed
            displayData = Array.from({ length: 480 }).map((_, i) => {
                const isNeutral = Math.random() < 0.75;
                const emotions: any = {
                    neutral: isNeutral ? 0.9 : 0.1,
                    happy: !isNeutral && Math.random() > 0.5 ? 0.8 : 0.0,
                    surprised: !isNeutral && Math.random() > 0.7 ? 0.5 : 0.0,
                    sad: 0, angry: 0, fearful: 0, disgusted: 0
                };
                return {
                    timestamp: Date.now() + i * 250,
                    emotions,
                    dominant: isNeutral ? 'neutral' : (emotions.happy > 0.5 ? 'happy' : 'surprised')
                };
            });
        }

        if (displayData.length === 0) return { processedData: [], emotionSummary: [], dominantEmotion: 'Neutral', communicationScore: 0, neutralPercentage: 0, isSimulated: false };

        // 1. Process Timeline Data
        const processed = displayData.map((d, index) => {
            const score =
                (d.emotions.happy || 0) +
                (d.emotions.surprised || 0) * 0.5 -
                (d.emotions.sad || 0) -
                (d.emotions.angry || 0) -
                (d.emotions.fearful || 0) -
                (d.emotions.disgusted || 0);

            return {
                time: index * 0.25, // 250ms intervals
                score: score,
                dominant: d.dominant
            };
        });

        // 2. Aggregate Totals for Pie Chart & Score
        const totals: Record<string, number> = {};
        let positiveSum = 0;
        let totalSum = 0;
        let neutralSum = 0;

        displayData.forEach(d => {
            Object.entries(d.emotions).forEach(([emotion, value]) => {
                const val = value;
                if (typeof val === 'number') {
                    // @ts-ignore
                    totals[emotion] = (totals[emotion] || 0) + val;
                    totalSum += val;

                    if (['happy', 'surprised', 'neutral'].includes(emotion)) {
                        positiveSum += val * (emotion === 'neutral' ? 0.5 : 1);
                    }
                    if (emotion === 'neutral') {
                        neutralSum += val;
                    }
                }
            });
        });

        const score = totalSum > 0 ? Math.round((positiveSum / totalSum) * 100) : 0;
        const neutralPct = totalSum > 0 ? Math.round((neutralSum / totalSum) * 100) : 0;

        const summary = Object.entries(totals)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .filter(item => item.value > 10); // Filter out negligible

        return {
            processedData: processed,
            emotionSummary: summary,
            dominantEmotion: summary[0]?.name || 'Neutral',
            communicationScore: score,
            neutralPercentage: neutralPct,
            isSimulated: simulated
        };
    }, [data]);

    // Lighter, friendlier palette
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#14b8a6', '#8b5cf6'];

    return (
        <div className="h-full flex flex-col space-y-8 max-w-6xl mx-auto w-full pb-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <div className="flex justify-center gap-4 flex-wrap">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-slate-800 text-white rounded-full font-medium hover:bg-slate-900 transition-colors shadow-lg"
                    >
                        Session Completed
                    </button>
                    <button
                        onClick={() => alert("Tips for Improvement:\n1. Maintain eye contact.\n2. Vary your tone.\n3. Smile more often!")}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        Learn More
                    </button>
                </div>

                <h2 className="text-3xl font-bold text-slate-800 mt-6 flex flex-col items-center">
                    Your Emotional Journey
                    {isSimulated && <span className="text-sm font-normal text-amber-600 bg-amber-50 px-3 py-1 rounded-full mt-2 border border-amber-200">Simulation Mode (Insufficient Data)</span>}
                </h2>
                <div className="flex justify-center gap-4 flex-wrap">
                    <div className="inline-block bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">
                        <p className="text-slate-500 font-medium">
                            Dominant Mood: <span className="text-indigo-600 font-bold capitalize">{dominantEmotion}</span>
                        </p>
                    </div>
                    <div className="inline-block bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">
                        <p className="text-slate-500 font-medium">
                            Neutrality: <span className="font-bold text-slate-700">{neutralPercentage}%</span>
                        </p>
                    </div>
                    <div className="inline-block bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">
                        <p className="text-slate-500 font-medium">
                            Score: <span className={`font-bold ${communicationScore >= 50 ? 'text-green-600' : 'text-orange-500'}`}>{communicationScore}/100</span>
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
                {/* Timeline Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col"
                >
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Emotional Flow</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            This chart tracks how your positivity fluctuated throughout the session. Higher peaks indicate positive moments (joy, excitement), while the baseline represents calm neutrality.
                        </p>
                    </div>

                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={processedData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis hide domain={[-1, 1]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#475569', fontWeight: 600 }}
                                    labelStyle={{ display: 'none' }}
                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                                    formatter={(value: number | undefined) => [Number(value || 0).toFixed(2), 'Positivity Index']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Sentiment Profile */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col"
                >
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Sentiment Profile</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            An overview of your emotional mix. A high "Neutral" percentage (e.g., &gt;70%) indicates a calm, professional delivery.
                        </p>
                    </div>

                    <div className="flex-1 min-h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={emotionSummary}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {emotionSummary.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#475569', fontWeight: 600 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-800">{neutralPercentage}%</div>
                                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Neutrality</div>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                        {emotionSummary.slice(0, 4).map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="capitalize text-slate-600 font-medium">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Personal Reflection Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-3 bg-white rounded-3xl shadow-xl border border-slate-100 p-8"
                >
                    <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Personal Reflection</h3>
                    <div className="flex flex-col gap-4">
                        <textarea
                            placeholder="How did you feel during this session? Write your thoughts here..."
                            className="w-full h-32 p-4 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                        />
                        <div className="flex justify-end">
                            <button className="px-6 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium transition-colors">
                                Save Entry
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
