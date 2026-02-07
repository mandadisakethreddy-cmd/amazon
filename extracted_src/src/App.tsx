import { useState } from 'react';
import { Layout } from './components/Layout';
import { QuestionPhase } from './components/QuestionPhase';
import { RecordingPhase } from './components/RecordingPhase';
import { AnalysisPhase } from './components/AnalysisPhase';
import type { EmotionData } from './hooks/useFaceDetection';


export type Phase = 'intro' | 'recording' | 'analyzing';

function App() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [recordedData, setRecordedData] = useState<EmotionData[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>('');

  const handleStart = (topic: string) => {
    setCurrentTopic(topic);
    setPhase('recording');
  };

  const handleComplete = (data: EmotionData[]) => {
    setRecordedData(data);
    setPhase('analyzing');
  };

  return (
    <Layout>
      {phase === 'intro' && <QuestionPhase onStart={handleStart} />}
      {phase === 'recording' && <RecordingPhase topic={currentTopic} onComplete={handleComplete} />}
      {phase === 'analyzing' && <AnalysisPhase data={recordedData} />}
    </Layout>
  );
}

export default App;
