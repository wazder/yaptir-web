/* ═══════════════════════════════════════════════════════════════════════
   OKEEP AI STUDIO - Main JavaScript
   Orchestrates all interactions and animations
═══════════════════════════════════════════════════════════════════════ */

import { initHeroCanvas } from './modules/heroCanvas.js';
import { initScrollAnimations, initMarqueeParallax, initCanvasModeObserver } from './modules/scrollAnimations.js';
import { initThemeSwitcher } from './core/themeSwitcher.js';
import { initFullPageScroll } from './core/fullPageScroll.js';
import { initSectorSpotlight } from './modules/sectorSpotlight.js';
import { initEmojiRain } from './modules/emojiRain.js';
import { initGalaxyCanvas } from './modules/aiChatCanvas.js';
import { initGalaxyChat } from './modules/aiChat.js';

// ─────────────────────────────────────────────────────────────────────
// DOM Ready
// ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Okeep AI Studio - Initializing...');

    // Initialize all modules
    initHeroCanvas();
    initScrollAnimations();
    initMarqueeParallax();
    initCanvasModeObserver();
    initThemeSwitcher();
    initFullPageScroll();
    initSectorSpotlight();
    initEmojiRain();
    initGalaxyCanvas();
    initGalaxyChat();
    initHeader();
    initContactForm();

    console.log('✨ All modules initialized!');
});

// ─────────────────────────────────────────────────────────────────────
// Header Scroll Effects
// ─────────────────────────────────────────────────────────────────────
function initHeader() {
    const header = document.getElementById('header');
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Add shadow when scrolled
        if (currentScrollY > 10) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        } else {
            header.style.boxShadow = 'none';
        }

        // Hide/show on scroll direction
        if (currentScrollY > 100) {
            if (currentScrollY > lastScrollY) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        }

        lastScrollY = currentScrollY;
    }, { passive: true });
}

// ─────────────────────────────────────────────────────────────────────
// Contact Form
// ─────────────────────────────────────────────────────────────────────
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        console.log('📧 Form submitted:', data);

        // Show success feedback
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Gönderildi!';
        btn.style.background = 'linear-gradient(135deg, #10B981, #34D399)';

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            form.reset();
        }, 3000);
    });
}

// ─────────────────────────────────────────────────────────────────────
// Smooth Scroll for Anchor Links
// ─────────────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
