/**
 * Fytò Inc. - Final Integrated Logic
 * Specializing in Python Backends & Responsive Web Experiences
 */

// CONFIG — swap this to your deployed backend URL before going live
// e.g. "https://fyto-api.onrender.com"
const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000"
  : "https://YOUR_DEPLOYED_BACKEND_URL_HERE";

// 1. Project Data (Fallback for local 'file://' access)
const backupProjects = [
  {
    title: "Smart Urban Road Safety Tracker",
    description: "A Python-powered application focused on enhancing pedestrian safety through real-time tracking and data analysis.",
    tags: ["Python", "FastAPI", "IoT"],
    link: "#",
  },
  {
    title: "Portfolio Brand V1",
    description: "The initial launch of Fytò Inc. built with a modular vanilla stack to showcase brand growth.",
    tags: ["HTML", "CSS", "JavaScript"],
    link: "#",
  }
];

// Function to render HTML for projects
function displayProjects(data) {
    const projectContainer = document.getElementById("project-list");
    if (!projectContainer) return;

    projectContainer.innerHTML = data.map(project => `
        <div class="project-card">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="tech-stack">
                ${project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join("")}
            </div>
            <a href="${project.link}" class="project-link">View Project →</a>
        </div>
    `).join("");
}

// Logic to load projects (JSON Fetch -> Fallback)
async function initGreenhouse() {
    try {
        const response = await fetch('/js/projects.json');
        if (!response.ok) throw new Error('Offline');
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.log("Using backup project data (Local File Mode)");
        displayProjects(backupProjects);
    }
}

// 2. Mobile Navigation Logic
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

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// 3. Silky Contact Form UX
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button');
        const originalText = submitBtn.innerText;

        // Loading State
        submitBtn.innerText = "Transmitting...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";

        const formData = {
            name: contactForm.name.value,
            email: contactForm.email.value,
            message: contactForm.message.value
        };

        try {
            const response = await fetch(`${API_BASE}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Success State
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
            // Error State
            submitBtn.innerText = "Systems Offline";
            submitBtn.style.background = "#ff4444";
            setTimeout(() => {
                submitBtn.innerText = originalText;
                submitBtn.removeAttribute('style');
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// Initialize everything on load
document.addEventListener("DOMContentLoaded", initGreenhouse);