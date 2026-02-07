// AI HR Interview Logic
let currentTopic = '';
let isRecording = false;
let startTime;
let timerInterval;
let emotionData = [];
let modelsLoaded = false;

const video = document.getElementById('videoElement');
const emotionFeedback = document.getElementById('emotionFeedback');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

// Model URLs - using a public CDN for models
const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

// Initialize - Load Models
async function initModels() {
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        modelsLoaded = true;
        loadingOverlay.style.opacity = '0';
        setTimeout(() => loadingOverlay.style.display = 'none', 500);
    } catch (err) {
        console.error("Error loading models:", err);
        loadingText.innerText = "Model loading failed. Proceeding in Simulation Mode.";
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.style.display = 'none', 500);
        }, 2000);
    }
}

// Start models on load
window.addEventListener('load', initModels);

// Topic Selection
function selectTopic(card, topicId) {
    document.querySelectorAll('.topic-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    currentTopic = card.querySelector('h3').innerText;
    document.getElementById('customTopic').value = '';
}

function clearSelections() {
    document.querySelectorAll('.topic-card').forEach(c => c.classList.remove('selected'));
    currentTopic = '';
}

// State Management
async function startInterview() {
    const custom = document.getElementById('customTopic').value.trim();
    if (custom) currentTopic = custom;

    if (!currentTopic) {
        alert("Please select a topic or type your own question.");
        return;
    }

    document.getElementById('phase-intro').classList.remove('active');
    document.getElementById('phase-recording').classList.add('active');
    document.getElementById('displayTopic').innerText = currentTopic;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        isRecording = true;
        startTracking();
        startTimer();
    } catch (err) {
        console.error("Webcam error:", err);
        alert("Camera access denied. Proceeding in simulation mode for demonstration.");
        isRecording = true;
        startTracking(true); // Simulated tracking
        startTimer();
    }
}

function startTimer() {
    let timeLeft = 120;
    const timerDisplay = document.getElementById('interviewTimer');

    timerInterval = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) finishInterview();
    }, 1000);
}

// Emotion Tracking Logic
async function startTracking(simulated = false) {
    if (!isRecording) return;

    if (simulated || !modelsLoaded) {
        runSimulation();
        return;
    }

    const track = async () => {
        if (!isRecording) return;

        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

        if (detections) {
            const exp = detections.expressions;
            // Find dominant
            const dominant = Object.keys(exp).reduce((a, b) => exp[a] > exp[b] ? a : b);

            emotionData.push({
                time: (Date.now() - startTime) / 1000,
                emotions: exp,
                dominant: dominant
            });

            emotionFeedback.innerText = dominant;
            emotionFeedback.style.color = dominant === 'happy' ? '#00ff88' : (dominant === 'neutral' ? '#00f2fe' : '#ff4d4d');
        }

        if (isRecording) requestAnimationFrame(track);
    };

    startTime = Date.now();
    track();
}

function runSimulation() {
    let count = 0;
    const emotions = ['neutral', 'happy', 'surprised', 'neutral', 'neutral', 'sad', 'neutral'];

    const simInterval = setInterval(() => {
        if (!isRecording) {
            clearInterval(simInterval);
            return;
        }

        const emotions_obj = {
            neutral: Math.random() * 0.5 + 0.5,
            happy: Math.random() * 0.2,
            surprised: Math.random() * 0.1,
            sad: 0, angry: 0, fearful: 0, disgusted: 0
        };

        const dominant = emotions[Math.floor(Math.random() * emotions.length)];

        emotionData.push({
            time: count * 0.5,
            emotions: emotions_obj,
            dominant: dominant
        });

        emotionFeedback.innerText = dominant + " (Simulated)";
        count++;
    }, 500);
}

// Finish and Analyze
function finishInterview() {
    isRecording = false;
    clearInterval(timerInterval);

    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }

    document.getElementById('phase-recording').classList.remove('active');
    document.getElementById('phase-analysis').classList.add('active');

    processResults();
}

function processResults() {
    if (emotionData.length === 0) {
        // Fallback mock data if something went wrong
        emotionData = Array.from({ length: 20 }).map((_, i) => ({
            time: i,
            emotions: { neutral: 0.8, happy: 0.1, surprised: 0.1 },
            dominant: 'neutral'
        }));
    }

    // 1. Calculate Score
    const totalSamples = emotionData.length;
    const neutralCount = emotionData.filter(d => d.dominant === 'neutral').length;
    const happyCount = emotionData.filter(d => d.dominant === 'happy').length;
    const score = Math.round(((neutralCount * 0.8 + happyCount * 1.0) / totalSamples) * 100);

    document.getElementById('finalScore').innerText = score;
    document.getElementById('scoreLabel').innerText = score > 70 ? "Professional & Engaging" : "Keep Practicing Presence";

    // 2. Emotion Pie Chart
    const counts = {};
    emotionData.forEach(d => counts[d.dominant] = (counts[d.dominant] || 0) + 1);

    new Chart(document.getElementById('emotionPieChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#00f2fe', '#00ff88', '#f59e0b', '#ef4444', '#6366f1'],
                borderWidth: 0
            }]
        },
        options: {
            plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } },
            cutout: '70%'
        }
    });

    // 3. Timeline Chart
    new Chart(document.getElementById('timelineChart'), {
        type: 'line',
        data: {
            labels: emotionData.map(d => d.time.toFixed(1) + 's'),
            datasets: [{
                label: 'Confidence level',
                data: emotionData.map(d => d.emotions.neutral || d.emotions.happy || 0.5),
                borderColor: '#00f2fe',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(0, 242, 254, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { display: false },
                x: { ticks: { color: '#888', maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// Detailed Report Generation
function showDetailedReport() {
    const finalScore = document.getElementById('finalScore').innerText;
    const scoreLabel = document.getElementById('scoreLabel').innerText;
    const modal = document.getElementById('reportModal');
    const content = document.getElementById('reportContent');

    // Calculate detailed metrics
    const totalSamples = emotionData.length;
    const counts = {};
    emotionData.forEach(d => counts[d.dominant] = (counts[d.dominant] || 0) + 1);

    const dominantEmotion = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    const confidenceAvg = (emotionData.reduce((acc, curr) => acc + (curr.emotions.neutral || 0) + (curr.emotions.happy || 0), 0) / totalSamples * 100).toFixed(1);

    let reportHTML = `
        <p><strong>Selected Topic:</strong> ${currentTopic}</p>
        <p><strong>Overall Score:</strong> ${finalScore}/100</p>
        <p><strong>Performance Level:</strong> ${scoreLabel}</p>
        <p><strong>Dominant Emotion:</strong> ${dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1)}</p>
        <p><strong>Communication Stability:</strong> ${confidenceAvg}%</p>
        <div style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 10px;">
            <p style="color: var(--accent-color); font-weight: 600;">Free Online Learning Resources:</p>
            <ul style="padding-left: 1.2rem; font-size: 0.9rem; list-style: none;">
                <li style="margin-bottom: 0.5rem;"><a href="https://www.freecodecamp.org/" target="_blank" style="color: #00f2fe; text-decoration: none;">🚀 FreeCodeCamp - Full Stack Masterclass</a></li>
                <li style="margin-bottom: 0.5rem;"><a href="https://leetcode.com/explore/" target="_blank" style="color: #00f2fe; text-decoration: none;">💻 LeetCode - Algorithm Practice</a></li>
                <li style="margin-bottom: 0.5rem;"><a href="https://www.coursera.org/specializations/interview-preparation" target="_blank" style="color: #00f2fe; text-decoration: none;">🎓 Coursera - Career Success Specialization</a></li>
                <li><a href="https://www.youtube.com/c/CS50" target="_blank" style="color: #00f2fe; text-decoration: none;">🎥 Harvard CS50 - Computer Science Intro</a></li>
            </ul>
        </div>
    `;

    content.innerHTML = reportHTML;
    modal.classList.remove('hidden');
}

function downloadReport() {
    const finalScore = document.getElementById('finalScore').innerText;
    const scoreLabel = document.getElementById('scoreLabel').innerText;

    // Detailed metrics for text report
    const totalSamples = emotionData.length;
    const counts = {};
    emotionData.forEach(d => counts[d.dominant] = (counts[d.dominant] || 0) + 1);
    const dominantEmotion = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

    const reportText = `
INTERVIEW PERFORMANCE REPORT
---------------------------
Topic: ${currentTopic}
Score: ${finalScore}/100
Level: ${scoreLabel}

METRICS breakdown:
- Dominant Emotion: ${dominantEmotion}
- Total Duration Analyzed: ${totalSamples * 0.5} seconds

FREE LEARNING RESOURCES:
- FreeCodeCamp: https://www.freecodecamp.org/
- LeetCode: https://leetcode.com/explore/
- Coursera Interview Prep: https://www.coursera.org/specializations/interview-preparation
- Harvard CS50: https://www.youtube.com/c/CS50

Generated by InterviewMaster AI
Timestamp: ${new Date().toLocaleString()}
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Interview_Report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
