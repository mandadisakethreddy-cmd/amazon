// Elements
const inputs = {
    name: document.getElementById('inputName'),
    role: document.getElementById('inputRole'),
    email: document.getElementById('inputEmail'),
    phone: document.getElementById('inputPhone'),
    linkedin: document.getElementById('inputLinkedin'),
    summary: document.getElementById('inputSummary'),
    experience: document.getElementById('inputExp'),
    skills: document.getElementById('inputSkills'),
    education: document.getElementById('inputEdu')
};

const outputs = {
    name: document.getElementById('outName'),
    role: document.getElementById('outRole'),
    email: document.getElementById('outEmail'),
    phone: document.getElementById('outPhone'),
    linkedin: document.getElementById('outLinkedin'),
    summary: document.getElementById('outSummary'),
    experience: document.getElementById('outExp'),
    skills: document.getElementById('outSkills'),
    education: document.getElementById('outEdu')
};

const liveScoreVal = document.getElementById('liveScoreVal');
const resumePaper = document.getElementById('resumePreview');

// Keywords for "Smart" Scoring
const powerKeywords = ["leadership", "achieved", "managed", "developed", "architected", "optimized", "increased", "reduced", "scaled"];
const techKeywords = ["react", "node", "python", "aws", "kubernetes", "docker", "sql", "git", "ci/cd", "typescript"];

// Event Listeners for Real-time Updates
Object.keys(inputs).forEach(key => {
    inputs[key].addEventListener('input', () => {
        // Update Text
        outputs[key].innerText = inputs[key].value || (key === 'name' ? 'Your Name' : '...');

        // Calculate Live Score
        calculateLiveScore();
    });
});

function calculateLiveScore() {
    let score = 0;

    // Basic Presence Checks
    if (inputs.name.value.length > 2) score += 5;
    if (inputs.role.value.length > 2) score += 5;
    if (inputs.email.value.includes('@')) score += 5;
    if (inputs.phone.value.length > 5) score += 5;
    if (inputs.linkedin.value.includes('linkedin.com')) score += 5;

    // Content Quality
    const fullText = Object.values(inputs).map(i => i.value.toLowerCase()).join(" ");

    // Keyword Matching
    powerKeywords.forEach(word => {
        if (fullText.includes(word)) score += 3;
    });

    techKeywords.forEach(word => {
        if (fullText.includes(word)) score += 4;
    });

    // Length/Depth
    if (inputs.summary.value.length > 50) score += 10;
    if (inputs.experience.value.split('\n').length > 3) score += 15;
    if (inputs.skills.value.split(',').length > 5) score += 10;

    // Cap at 100
    score = Math.min(score, 100);

    // Update Display
    liveScoreVal.innerText = score;

    // Color coding
    if (score < 50) liveScoreVal.style.color = '#ff3333';
    else if (score < 80) liveScoreVal.style.color = '#ffaa00';
    else liveScoreVal.style.color = '#00ff88';
}

// 3D Parallax Effect for Resume Paper
document.querySelector('.builder-preview-wrapper').addEventListener('mousemove', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = -y / 30;
    const rotateY = x / 40;

    resumePaper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
});

document.querySelector('.builder-preview-wrapper').addEventListener('mouseleave', () => {
    resumePaper.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)`;
});

function exportPDF() {
    const element = document.getElementById('resumePreview');
    const opt = {
        margin: 0,
        filename: 'My_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    liveScoreVal.innerText = "Generating...";
    html2pdf().set(opt).from(element).save().then(() => {
        calculateLiveScore();
    });
}
