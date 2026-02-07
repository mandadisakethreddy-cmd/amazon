import { useEffect, useState, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { SmoothingService } from '../utils/SmoothingService';

export interface EmotionData {
    timestamp: number;
    emotions: faceapi.FaceExpressions;
    dominant: string;
}

export const useFaceDetection = (videoRef: React.RefObject<HTMLVideoElement | null>, isRecording: boolean) => {
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [emotions, setEmotions] = useState<EmotionData[]>([]);

    // Refs for mutable state avoiding re-renders
    const detectionInterval = useRef<NodeJS.Timeout | null>(null);
    const smoothingService = useRef(new SmoothingService(5)); // Window of 5 frames

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                ]);
                setIsModelLoaded(true);
                console.log('FaceAPI models loaded');
            } catch (error) {
                console.error('Error loading FaceAPI models:', error);
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (!isModelLoaded || !videoRef.current || !isRecording) {
            if (detectionInterval.current) {
                clearInterval(detectionInterval.current);
                detectionInterval.current = null;
            }
            return;
        }

        const detect = async () => {
            if (!videoRef.current) return;

            // Ensure video is playing and has dimensions
            if (videoRef.current.paused || videoRef.current.ended || !videoRef.current.videoWidth) {
                return;
            }

            const detections = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();

            if (detections) {
                // Smooth the expressions
                const smoothedExpressions = smoothingService.current.add(detections.expressions);

                const dominant = Object.keys(smoothedExpressions).reduce((a, b) =>
                    smoothedExpressions[a as keyof faceapi.FaceExpressions] > smoothedExpressions[b as keyof faceapi.FaceExpressions] ? a : b
                );

                setEmotions(prev => [...prev, {
                    timestamp: Date.now(),
                    emotions: smoothedExpressions,
                    dominant
                }]);
            }
        };

        detectionInterval.current = setInterval(detect, 250); // Throttled to 4fps

        return () => {
            if (detectionInterval.current) {
                clearInterval(detectionInterval.current);
            }
            smoothingService.current.reset();
        };
    }, [isModelLoaded, isRecording, videoRef]);

    return { isModelLoaded, emotions };
};

