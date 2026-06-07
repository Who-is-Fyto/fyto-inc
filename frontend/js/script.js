/**
 * Fytò Inc. - Final Integrated Logic
 * Specializing in Python Backends & Responsive Web Experiences
 */

// CONFIG — Calibrated for dynamic API access
const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000"
  : "https://fyto-inc.onrender.com"; 

const ADMIN_KEY = "FYTO_SECRET_2026_SQUAD";

// --- 1. GREENHOUSE & STATUS ENGINE ---
async function updateStatusBadge() {
    const statusBadge = document.querySelector(".status-text");
    if (!statusBadge) return;
    try {
        const response = await fetch(`${API_BASE}/api/status`);
        if (response.ok) {
            const data = await response.json();
            statusBadge.innerText = data.text;
        }
    } catch (error) { console.log("Status API offline."); }
}

function displayProjects(data) {
    const projectContainer = document.getElementById("project-list");
    if (!projectContainer) return;
    projectContainer.innerHTML = data.map(project => `
        <div class="project-card">
            <h3>${project.name}</h3>
            <p>${project.description}</p>
            <div class="tech-stack">
                ${project.tech_stack.map(tag => `<span class="tech-tag">${tag}</span>`).join("")}
            </div>
            <a href="${project.link || '#'}" target="_blank" class="project-link">View Project →</a>
        </div>
    `).join("");
}

async function initGreenhouse() {
    try {
        const response = await fetch(`${API_BASE}/api/projects`);
        if (!response.ok) throw new Error('API Offline');
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.log("Greenhouse API offline, using backup data.");
        const backupProjects = [
            { name: "Smart Urban Road Safety Tracker", description: "A Python-powered application...", tech_stack: ["Python", "FastAPI", "IoT"], link: "#" },
            { name: "Portfolio Brand V1", description: "The initial launch...", tech_stack: ["HTML", "CSS", "JavaScript"], link: "#" }
        ];
        displayProjects(backupProjects);
    }
}

// --- 2. THE HIDDEN PROTOCOL (KONAMI CODE) ---
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

function triggerAdminHUD() {
    console.log("PROTOCOL ALPHA ACTIVATED");
    const hud = document.getElementById('admin-hud');
    if (hud) hud.classList.add('active');
}

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            triggerAdminHUD();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

let touchStartX = 0;
let touchStartY = 0;
let swipeSequence = [];
const swipeCode = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right'];

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

document.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
    let swipe = '';
    if (Math.abs(dx) > Math.abs(dy)) {
        swipe = dx > 0 ? 'right' : 'left';
    } else {
        swipe = dy > 0 ? 'down' : 'up';
    }

    swipeSequence.push(swipe);
    if (swipeSequence.length > swipeCode.length) swipeSequence.shift();

    if (JSON.stringify(swipeSequence) === JSON.stringify(swipeCode)) {
        triggerAdminHUD();
        swipeSequence = [];
    }
}, false);

// --- 3. ADMIN HUD LOGIC ---
async function handleAdminAction(endpoint, data, method = 'POST') {
    try {
        const response = await fetch(`${API_BASE}/api/admin/${endpoint}`, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'X-Admin-Key': ADMIN_KEY 
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            alert("Command Executed Successfully");
            location.reload();
        } else {
            alert("Security Violation: Invalid Key");
        }
    } catch (error) {
        alert("Backend Connection Error");
    }
}

// --- 4. MOBILE NAV & FORM ---
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button');
        const originalText = submitBtn.innerText;
        
        submitBtn.innerText = "Transmitting...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";

        try {
            const response = await fetch(`${API_BASE}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: contactForm.name.value, 
                    email: contactForm.email.value, 
                    message: contactForm.message.value 
                })
            });

            if (response.ok) {
                submitBtn.innerText = "Signal Received ✓";
                submitBtn.style.background = "var(--fyto-green)";
                submitBtn.style.color = "#000";
                contactForm.reset();
                setTimeout(() => { 
                    submitBtn.innerText = originalText; 
                    submitBtn.removeAttribute('style'); 
                    submitBtn.disabled = false; 
                }, 3000);
            } else {
                throw new Error('Signal Interrupted');
            }
        } catch (error) {
            submitBtn.innerText = "Systems Offline";
            submitBtn.style.background = "#ff4444";
            setTimeout(() => { 
                submitBtn.innerText = originalText; 
                submitBtn.disabled = false; 
            }, 3000);
        }
    });
}

// --- 5. SENTRY GLOW ENGINE ---
function initSentryGlow() {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    window.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
}

// --- 6. EASTER EGGS ---
function showToast(message) {
    let toast = document.querySelector('.system-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'system-toast';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add('active');
    setTimeout(() => { toast.classList.remove('active'); }, 4000);
}

function triggerGlitch() {
    const flash = document.createElement('div');
    flash.className = 'glitch-flash glitch-active';
    document.body.appendChild(flash);
    setTimeout(() => { flash.remove(); }, 600);
}

let logoClickCount = 0;
function handleLogoClick() {
    logoClickCount++;
    if (logoClickCount === 10) {
        triggerGlitch();
        showToast("S-S-SYSTEM NOTE: This interface was meticulously debugged and optimized by Gemma 4. (Yes, the AI did a great job. Don't tell Tony.)");
        logoClickCount = 0;
    }
}

let jarvisBuffer = "";
document.addEventListener('keydown', (e) => {
    jarvisBuffer += e.key.toLowerCase();
    if (jarvisBuffer.includes("jarvis")) {
        showToast("I'm sorry, sir. I'm not Jarvis. I'm Friday. Please update your records.");
        jarvisBuffer = "";
    }
    if (jarvisBuffer.length > 20) jarvisBuffer = jarvisBuffer.slice(-10);
});

document.addEventListener("DOMContentLoaded", () => {
    initGreenhouse();
    updateStatusBadge();
    initSentryGlow();
    
    // Attach logo egg
    const footerLogo = document.getElementById('fyto-sig');
    if (footerLogo) {
        footerLogo.addEventListener('click', handleLogoClick);
    }
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="admin-hud" class="admin-hud">
            <div class="hud-header">
                <div class="hud-title">⚡ System Admin HUD</div>
                <button class="close-hud" onclick="document.getElementById('admin-hud').classList.remove('active')">CLOSE</button>
            </div>
            <div class="hud-grid">
                <div class="hud-section">
                    <h4>Update Status</h4>
                    <input type="text" id="admin-status-text" class="hud-input" placeholder="New status text...">
                    <button class="hud-btn" onclick="handleAdminAction('status', {text: document.getElementById('admin-status-text').value})">Update Signal</button>
                </div>
                <div class="hud-section">
                    <h4>Cultivate Project</h4>
                    <input type="text" id="proj-name" class="hud-input" placeholder="Project Name">
                    <input type="text" id="proj-desc" class="hud-input" placeholder="Description">
                    <input type="text" id="proj-tech" class="hud-input" placeholder="Tech Stack (comma separated)">
                    <input type="text" id="proj-link" class="hud-input" placeholder="URL Link">
                    <button class="hud-btn" onclick="handleAdminAction('projects', {
                        name: document.getElementById('proj-name').value,
                        description: document.getElementById('proj-desc').value,
                        tech_stack: document.getElementById('proj-tech').value.split(','),
                        link: document.getElementById('proj-link').value
                    })">Deploy to Greenhouse</button>
                </div>
            </div>
        </div>
    `);
});
