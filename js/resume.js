// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('resumeInput');
const loadingOverlay = document.getElementById('loadingOverlay');
const dashboard = document.getElementById('dashboard');
const uploadSection = document.getElementById('uploadSection');
const scoreValue = document.getElementById('scoreValue');
const ringProgress = document.querySelector('.ring-progress');
const shortlistLevel = document.getElementById('shortlistLevel');
const levelDesc = document.getElementById('levelDesc');
const issuesGrid = document.getElementById('issuesGrid');
const learningGrid = document.getElementById('learningGrid');

// Event Listeners for Upload
dropZone.addEventListener('click', () => fileInput.click());
['dragover', 'dragenter'].forEach(event => {
    dropZone.addEventListener(event, (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent-color)';
        dropZone.style.transform = 'translateZ(30px) scale(1.02)';
    });
});

['dragleave', 'dragend', 'drop'].forEach(event => {
    dropZone.addEventListener(event, () => {
        dropZone.style.borderColor = 'var(--glass-border)';
        dropZone.style.transform = 'translateZ(0) scale(1)';
    });
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFileUpload(e.target.files[0]);
});

function handleFileUpload(file) {
    // Show Loading with 3D transition
    gsap.to(uploadSection, {
        opacity: 0,
        y: -50,
        duration: 0.5,
        onComplete: () => {
            uploadSection.style.display = 'none';
            loadingOverlay.style.display = 'flex';
            gsap.fromTo(loadingOverlay, { opacity: 0, z: -100 }, { opacity: 1, z: 0, duration: 0.5 });
        }
    });

    // Simulate Parsing Delay (3 seconds for "3D effect" loading)
    setTimeout(() => {
        gsap.to(loadingOverlay, {
            opacity: 0,
            scale: 0.8,
            duration: 0.5,
            onComplete: () => {
                loadingOverlay.style.display = 'none';
                dashboard.style.display = 'block';
                analyzeResume(file.name);
            }
        });
    }, 3000);
}

function analyzeResume(filename) {
    // Simulated ATS Logic
    let score = Math.floor(Math.random() * (95 - 45 + 1)) + 45;

    // Animate Score Gauge
    animateScore(score);

    // Determine Level Info
    let level = "Average";
    let desc = "";
    let color = "#ffaa00";

    const nextChallengeContainer = document.getElementById('nextChallengeContainer');

    // Reset button visibility
    if (nextChallengeContainer) nextChallengeContainer.style.display = 'none';

    if (score >= 90) {
        level = "Excellent";
        desc = "Highly Shortlisted! Your resume is in the top 5% of applicants.";
        color = "#00ff88";
    } else if (score >= 75) {
        level = "Good";
        desc = "Shortlist Possible. A few tweaks to your projects section could secure it.";
        color = "#00f2fe";
    } else if (score >= 60) {
        level = "Average";
        desc = "Needs Improvement. Minor formatting issues and missing keywords detected.";
        color = "#ffaa00";
    } else {
        level = "Poor";
        desc = "Not Shortlisted. We recommend using our Builder to restructure your resume.";
        color = "#ff3333";
    }

    shortlistLevel.innerText = level;
    shortlistLevel.style.color = color;
    levelDesc.innerText = desc;

    // Show "Next" button for all scores after analysis
    if (nextChallengeContainer) {
        nextChallengeContainer.style.display = 'block';
        gsap.fromTo(nextChallengeContainer,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, delay: 2.2, ease: "power2.out" }
        );
    }

    // --- SMART DETECTION (3D Cards) ---
    issuesGrid.innerHTML = "";
    if (score < 85) {
        const potentialIssues = [
            { title: "Missing Keywords", desc: "Missing: Kubernetes, CI/CD, React, TypeScript, GraphQL", icon: "🔑" },
            { title: "Weak Descriptions", desc: "Project bullet points lack measurable impact (e.g., 'saved time', 'reduced costs').", icon: "📊" },
            { title: "Format Mismatch", desc: "ATS-unfriendly layout. Multi-column resumes are harder to parse.", icon: "📐" },
            { title: "Skill Gap", desc: "Your listed skills don't fully match contemporary Senior Developer requirements.", icon: "⚠️" }
        ];

        potentialIssues.slice(0, score < 65 ? 4 : 2).forEach(issue => {
            const card = document.createElement('div');
            card.className = "issue-card";
            card.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 1rem;">${issue.icon}</div>
                <h4>${issue.title}</h4>
                <p>${issue.desc}</p>
            `;
            issuesGrid.appendChild(card);
        });
    }

    // --- RECOMENDED LEARNING (3D Flip Cards) ---
    learningGrid.innerHTML = "";
    const learningContent = [
        { front: "System Design", back: "Master Scalability, Microservices, and Cloud Patterns.", color: "var(--gradient-1)" },
        { front: "Tech Stack", back: "Deep dive into React 18, Next.js, and Node.js performance.", color: "var(--gradient-2)" },
        { front: "Impact Writing", back: "Learn the STAR method to describe your professional achievements.", color: "var(--gradient-3)" }
    ];

    learningContent.forEach(item => {
        const card = document.createElement('div');
        card.className = "flip-card";
        card.innerHTML = `
            <div class="flip-inner">
                <div class="flip-front">
                    <h3 style="color: var(--accent-color)">${item.front}</h3>
                    <p>Click to Reveal</p>
                </div>
                <div class="flip-back" style="background: ${item.color}">
                    <p>${item.back}</p>
                </div>
            </div>
        `;
        learningGrid.appendChild(card);
    });

    // Dashboard Entrance Animation
    gsap.from('.dashboard > section, .score-panel', {
        opacity: 0,
        y: 100,
        z: -200,
        stagger: 0.15,
        duration: 1,
        ease: "power4.out"
    });
}

function animateScore(target) {
    let current = 0;
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing (OutQuad)
        current = Math.floor(progress * target);
        scoreValue.innerText = current;

        // Update Ring (Circumference ~ 565)
        const offset = 565 - (565 * current) / 100;
        ringProgress.style.strokeDashoffset = offset;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}
