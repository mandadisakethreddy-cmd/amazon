import { useEffect, useRef, useState } from 'react';
import { useFaceDetection, type EmotionData } from '../hooks/useFaceDetection';
import { Timer, Video } from 'lucide-react';

interface RecordingPhaseProps {
    onComplete: (data: EmotionData[]) => void;
    topic: string;
}

export const RecordingPhase: React.FC<RecordingPhaseProps> = ({ onComplete, topic }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
    const [hasStarted, setHasStarted] = useState(false);
    const [isRecording, setIsRecording] = useState(true);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // Only collect emotions if started and no error
    const { isModelLoaded, emotions } = useFaceDetection(videoRef, isRecording && hasStarted && !cameraError);

    // Get current emotion for feedback
    const currentEmotion = emotions.length > 0 ? emotions[emotions.length - 1].dominant : null;

    useEffect(() => {
        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setCameraError(null);
            } catch (err) {
                console.error("Error accessing webcam:", err);
                setCameraError("Camera access denied. Please allow camera permissions to continue.");
            }
        };
        startVideo();
    }, []);

    useEffect(() => {
        if (!hasStarted) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [hasStarted]);

    const handleStart = () => {
        setHasStarted(true);
    };

    const handleFinish = () => {
        setIsRecording(false);
        onComplete(emotions); // Pass the collected data
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center h-full max-w-5xl mx-auto w-full justify-center">
            {/* Header Card - Only show when started */}
            {hasStarted && (
                <div className="w-full flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full animate-pulse">
                            <Video className="w-5 h-5 text-red-500" />
                        </div>
                        <span className="font-semibold text-slate-700">Recording Session</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xl text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                        <Timer className="w-5 h-5 text-slate-400" />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            )}

            {/* Video Card - Smaller size */}
            <div className={`relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 transition-all duration-500 ${hasStarted ? 'w-full flex-1' : 'w-full max-w-2xl aspect-video'}`}>
                {cameraError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-red-50 gap-4 text-center p-6">
                        <div className="p-4 bg-red-100 rounded-full">
                            <Video className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-red-800">Camera Error</h3>
                        <p className="text-red-600">{cameraError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : !isModelLoaded ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-50/80 backdrop-blur-sm gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-slate-500 font-medium">Initializing Tracker...</span>
                    </div>
                ) : null}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    onPlay={() => console.log("Video started")}
                    className="w-full h-full object-cover transform scale-x-[-1]"
                />

                {/* Real-time Feedback Overlay - Only when started */}
                {hasStarted && (
                    <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center pointer-events-none gap-4">
                        {currentEmotion && (
                            <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-2">
                                <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Detected Mood:</span>
                                <span className="text-indigo-600 font-bold capitalize text-lg">{currentEmotion}</span>
                            </div>
                        )}

                        <div className="bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-slate-700 max-w-md text-center">
                            <p className="text-white font-medium text-lg leading-snug">
                                "{topic}"
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Start / Actions */}
            <div className="mt-8 flex flex-col items-center gap-4">
                {!hasStarted ? (
                    <button
                        onClick={handleStart}
                        disabled={!isModelLoaded}
                        className={`px-10 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg shadow-xl hover:bg-indigo-700 transition-all transform hover:scale-105 ${!isModelLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isModelLoaded ? 'Start Session' : 'Loading Camera...'}
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        className="px-8 py-3 rounded-full bg-white text-slate-600 font-medium border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                    >
                        End Session Early
                    </button>
                )}
            </div>
        </div>
    );
};
