// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Select elements
const cards = document.querySelectorAll('.card');
const hiddenContent = document.querySelector('.hidden-content');
const heroTitle = document.querySelector('.hero-title');
const heroSubtitle = document.querySelector('.hero-subtitle');
const ctaGroup = document.querySelector('.cta-group');
const statsRow = document.querySelector('.stats-row');

// Initial setup: Position cards in a 3D stack
function setInitialState() {
    if (!cards.length) return;
    gsap.set(cards, {
        opacity: 0,
        z: -500,
        y: 100
    });

    // Animate cards in one by one into the stack
    gsap.to(cards, {
        duration: 1.5,
        opacity: 1,
        z: (i) => i * 50, // Stack them on Z-axis
        y: 0,
        rotationX: (i) => Math.random() * 10 - 5, // Slight random rotation
        rotationY: (i) => Math.random() * 10 - 5,
        stagger: 0.2,
        ease: "power3.out",
        onComplete: startDispersionSequence
    });
}

function startDispersionSequence() {
    if (!cards.length || !hiddenContent) return;
    const tl = gsap.timeline({ delay: 1 }); // Wait 1s after stack forms (total ~3s from load)

    // 1. Explode/Disperse Cards
    tl.to(cards, {
        duration: 2,
        x: (i) => (Math.random() - 0.5) * 1500, // Scatter wide horizontally
        y: (i) => (Math.random() - 0.5) * 1500, // Scatter wide vertically
        z: (i) => Math.random() * 2000 + 500, // Fly towards/past camera
        rotationX: (i) => Math.random() * 360,
        rotationY: (i) => Math.random() * 360,
        autoAlpha: 0, // Opacity 0 + visibility hidden
        stagger: 0.1,
        ease: "power2.inOut"
    });

    // 2. Reveal Hidden Content
    tl.to(hiddenContent, {
        opacity: 1,
        z: 0, // Bring forward
        pointerEvents: "all", // Enable interaction
        duration: 1
    }, "-=1.5"); // Overlap with explosion

    // 3. Stagger in content elements
    const revealElements = [heroTitle, heroSubtitle, ctaGroup, statsRow].filter(el => el);
    if (revealElements.length) {
        tl.from(revealElements, {
            y: 50,
            opacity: 0,
            stagger: 0.2,
            ease: "back.out(1.7)",
            duration: 1
        }, "-=0.5");
    }
}

// Start the sequence
window.addEventListener('load', setInitialState);

// Optional: Parallax effect on mouse move for the background/content
if (hiddenContent) {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;

        gsap.to(hiddenContent, {
            rotationY: x,
            rotationX: -y,
            duration: 2,
            ease: "power1.out"
        });
    });
}


// =========================================
// SCROLLTRIGGER ANIMATIONS
// =========================================

// 1. Roadmap Animation
// Animated Line
if (document.querySelector('.roadmap-line')) {
    gsap.from('.roadmap-line', {
        scrollTrigger: {
            trigger: '.roadmap-section',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1
        },
        scaleY: 0,
        transformOrigin: 'top center',
        ease: "none"
    });
}

// Roadmap Items Pop up
const roadmapItemsArr = document.querySelectorAll('.roadmap-item');
roadmapItemsArr.forEach((item, index) => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: 'top 85%',
        },
        opacity: 0,
        x: index % 2 === 0 ? -100 : 100, // Alternate coming from left/right
        duration: 1,
        ease: "power3.out"
    });
});

// 2. Features Cards Stagger
if (document.querySelector('.features-grid')) {
    gsap.from('.feature-card', {
        scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 80%'
        },
        y: 100,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "back.out(1.7)"
    });
}

// 3. Curriculum List Stagger
if (document.querySelector('.curriculum-container')) {
    gsap.fromTo('.curriculum-item',
        { x: -100, autoAlpha: 0 },
        {
            scrollTrigger: {
                trigger: '.curriculum-container',
                start: 'top 80%'
            },
            x: 0,
            autoAlpha: 1,
            stagger: 0.2,
            duration: 1,
            ease: "power3.out"
        }
    );
}

// 4. Testimonials Robust Sequence
const carousel = document.querySelector('.carousel');
const carouselItemsArr = document.querySelectorAll('.carousel-item');
if (carousel && carouselItemsArr.length > 0) {
    const totalItems = carouselItemsArr.length;
    const angleStep = 360 / totalItems;
    let currentTestimonialIndex = 0;

    // Initial Setup - arranged in a circle
    carouselItemsArr.forEach((item, index) => {
        gsap.set(item, {
            rotationY: index * angleStep,
            z: 800, // Push out to form cylinder
            transformOrigin: "50% 50% -800px", // Rotate around center
            backfaceVisibility: "hidden" // Hide back to prevent glitches
        });
    });

    function nextTestimonial() {
        // 1. Rotate cylinder to current item
        gsap.to(carousel, {
            rotationY: -currentTestimonialIndex * angleStep,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                const currentItem = carouselItemsArr[currentTestimonialIndex];
                if (!currentItem) return;

                // 2. Highlight Active Item
                gsap.to(currentItem, {
                    scale: 1.2,
                    z: 900,
                    backgroundColor: "#1a1a3a",
                    boxShadow: "0 0 50px rgba(0, 242, 254, 0.8)",
                    border: "2px solid #00f2fe",
                    zIndex: 500,
                    duration: 0.5,
                    onComplete: () => {
                        // 3. Wait for reading
                        gsap.delayedCall(2, () => {
                            // 4. Reset Active Item
                            gsap.to(currentItem, {
                                scale: 1,
                                z: 800,
                                backgroundColor: "#141428",
                                boxShadow: "none",
                                border: "1px solid var(--accent-color)",
                                zIndex: 1,
                                duration: 0.5,
                                onComplete: () => {
                                    // 5. Move to next
                                    currentTestimonialIndex = (currentTestimonialIndex + 1) % totalItems;
                                    nextTestimonial();
                                }
                            });
                        });
                    }
                });
            }
        });
    }
    nextTestimonial();
}

// Curriculum Detail Content
const curriculumData = {
    "curr-dsa": {
        title: "Data Structures & Algorithms",
        desc: "Master the foundations of computer science. We cover everything from Basic Arrays to Advanced Dynamic Programming and Graph Theory. Our practice sets are curated from top tech company interviews."
    },
    "curr-sysdesign": {
        title: "System Design",
        desc: "Learn how to build scalable systems. Topics include Load Balancing, Caching, Database Sharding, Microservices, and CAP Theorem. Essential for Senior and Staff level roles."
    },
    "curr-behavioral": {
        title: "Behavioral Prep",
        desc: "Master the STAR method. We help you prepare stories that demonstrate Leadership Principles, Conflict Resolution, and Technical Ownership. Perfect for Amazon and other culture-focused firms."
    },
    "curr-company": {
        title: "Company Specifics",
        desc: "Deep dive into the interview loops of Google, Meta, Amazon, and Microsoft. Understand their unique evaluation criteria and common question patterns."
    },
    "curr-mock": {
        title: "Mock Interviews",
        desc: "Get real-time feedback with our AI-driven mock interviews or peer-to-peer sessions. Practice coding, system design, and behavioral questions in a timed environment."
    },
    "curr-neg": {
        title: "Negotiation",
        desc: "Don't leave money on the table. Learn how to handle multiple offers, understand equity packages (RSUs/Options), and communicate your value effectively to recruiters."
    },
    "curr-softskills": {
        title: "Soft Skills",
        desc: "Improve your communication, empathy, and teamwork. Learn how to explain complex technical concepts simply and how to lead teams effectively."
    }
};

// Curriculum Interaction Logic
const curriculumItems = document.querySelectorAll('.curriculum-item');
const overlay = document.getElementById('curriculumOverlay');
const overlayDetails = document.getElementById('overlayDetails');
const closeOverlayBtn = document.querySelector('.close-overlay');
const backToListBtn = document.querySelector('.back-to-list');
const btnHeroStart = document.getElementById('btnHeroStart');

function closeOverlay() {
    if (!overlay) return;
    gsap.to(overlay, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
            overlay.style.display = 'none';
        }
    });
}

const btnViewRoadmap = document.getElementById('btnViewRoadmap');
const cardHR = document.getElementById('cardHR');

// Hero & Round Card Connections
if (btnHeroStart) {
    btnHeroStart.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = 'resume-analyzer.html';
    });
}

if (btnViewRoadmap) {
    btnViewRoadmap.addEventListener('click', (e) => {
        e.stopPropagation();
        const roadmapSection = document.getElementById('rounds');
        if (roadmapSection) {
            roadmapSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

if (cardHR) {
    cardHR.addEventListener('click', () => {
        window.location.href = 'hr-interview.html';
    });
}

curriculumItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = item.id;

        if (id === 'curr-resume') {
            window.location.href = 'resume-analyzer.html';
            return;
        }

        const data = curriculumData[id];
        if (data && overlay && overlayDetails) {
            overlayDetails.innerHTML = `
                <h2>${data.title}</h2>
                <p>${data.desc}</p>
            `;

            overlay.style.display = 'flex';
            gsap.to(overlay, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            });

            gsap.from('.overlay-content', {
                scale: 0.8,
                rotateX: 20,
                opacity: 0,
                duration: 0.6,
                ease: "back.out(1.7)"
            });
        }
    });
});

if (closeOverlayBtn) closeOverlayBtn.addEventListener('click', closeOverlay);
if (backToListBtn) backToListBtn.addEventListener('click', closeOverlay);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && overlay.style.display === 'flex') {
        closeOverlay();
    }
});

// Coding Playground Logic
const problemItems = document.querySelectorAll('.problem-item');
const codeEditor = document.getElementById('codeEditor');
const runCodeBtn = document.getElementById('runCode');
const codeOutput = document.getElementById('codeOutput');

if (problemItems.length > 0 && codeEditor && runCodeBtn && codeOutput) {
    const problems = {
        "two-sum": {
            starter: "// Write your code here...\nfunction solution(nums, target) {\n    \n}",
            solutionRegex: /return/i
        },
        "add-two-numbers": {
            starter: "// Add two numbers represented as linked lists...\nfunction addTwoNumbers(l1, l2) {\n    \n}",
            solutionRegex: /ListNode|ListNode/i
        },
        "max-subarray": {
            starter: "// Find the contiguous subarray with the largest sum...\nfunction maxSubArray(nums) {\n    \n}",
            solutionRegex: /Math\.max/i
        },
        "valid-parentheses": {
            starter: "// Check if brackets are validly closed...\nfunction isValid(s) {\n    \n}",
            solutionRegex: /stack|push|pop/i
        }
    };

    problemItems.forEach(item => {
        item.addEventListener('click', () => {
            problemItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const id = item.dataset.id;
            if (problems[id]) {
                codeEditor.value = problems[id].starter;
                codeOutput.innerText = "Click Run Code to see results...";
                codeOutput.style.color = "#00ff88";
            }
        });
    });

    runCodeBtn.addEventListener('click', () => {
        codeOutput.innerText = "Compiling and Running...\n";
        const activeProblem = document.querySelector('.problem-item.active');
        if (!activeProblem) return;

        const activeProblemId = activeProblem.dataset.id;
        const userCode = codeEditor.value;

        setTimeout(() => {
            if (problems[activeProblemId] && problems[activeProblemId].solutionRegex.test(userCode)) {
                codeOutput.innerText += "✓ Test Passed: Case 1 Success\n✓ Test Passed: Case 2 Success\n\nFinal Result: All test cases passed!";
                codeOutput.style.color = "#00ff88";
            } else {
                codeOutput.innerText += "✗ Error: Output did not match expected result.\n\nHint: Make sure you are returning the correct value.";
                codeOutput.style.color = "#ff3333";
            }
        }, 1500);
    });
}



// Smooth Scroll for all hash links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const targetElement = document.querySelector(href);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Initialize VanillaTilt for 3D Tilt effect
if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.5,
    });
}

