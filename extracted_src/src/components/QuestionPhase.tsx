import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Star, Target, Users } from 'lucide-react';
import { useState } from 'react';

interface QuestionPhaseProps {
    onStart: (topic: string) => void;
}

const TOPICS = [
    { id: 'aspirations', icon: Target, text: "What do you want to become after 5 years?" },
    { id: 'strengths', icon: Star, text: "What are your core professional strengths?" },
    { id: 'challenge', icon: Briefcase, text: "Describe a challenge you overcame recently." },
    { id: 'leadership', icon: Users, text: "How would you describe your leadership style?" },
];

export const QuestionPhase: React.FC<QuestionPhaseProps> = ({ onStart }) => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [customTopic, setCustomTopic] = useState('');

    const handleStart = () => {
        if (selectedTopic === 'custom' && customTopic.trim()) {
            onStart(customTopic);
        } else if (selectedTopic && selectedTopic !== 'custom') {
            const topic = TOPICS.find(t => t.id === selectedTopic)?.text;
            if (topic) onStart(topic);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-bold text-slate-800 mb-4">Choose Your Focus</h1>
                <p className="text-slate-500 text-lg">Select a topic to guide your reflection session.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12">
                {TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    const isSelected = selectedTopic === topic.id;
                    return (
                        <motion.button
                            key={topic.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedTopic(topic.id)}
                            className={`p-6 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${isSelected
                                    ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-200'
                                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                                }`}
                        >
                            <div className={`p-3 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={`font-semibold text-lg mb-1 ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                    {topic.text}
                                </h3>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Custom Input */}
            <motion.div
                className="w-full mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className={`p-1 rounded-2xl border-2 transition-all ${selectedTopic === 'custom' ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200'}`}>
                    <input
                        type="text"
                        placeholder="Or type your own question here..."
                        className="w-full p-4 rounded-xl outline-none text-lg text-slate-700 placeholder:text-slate-400"
                        onFocus={() => setSelectedTopic('custom')}
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                    />
                </div>
            </motion.div>

            <motion.button
                disabled={!selectedTopic || (selectedTopic === 'custom' && !customTopic.trim())}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className={`px-12 py-4 rounded-full font-bold text-lg flex items-center gap-2 shadow-xl transition-all ${selectedTopic
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
            >
                Begin Session
                <ArrowRight className="w-5 h-5" />
            </motion.button>
        </div>
    );
};
