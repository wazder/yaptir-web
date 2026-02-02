/* ═══════════════════════════════════════════════════════════════════════
   OKEEP AI STUDIO - Main JavaScript
   Orchestrates all interactions and animations
═══════════════════════════════════════════════════════════════════════ */

import { initHeroCanvas } from './modules/heroCanvas.js';
import { initScrollAnimations, initMarqueeParallax, initCanvasModeObserver } from './modules/scrollAnimations.js';
import { initThemeSwitcher } from './core/themeSwitcher.js';
import { initFullPageScroll } from './core/fullPageScroll.js';
import { initSectorSpotlight } from './modules/sectorSpotlight.js';
// import { initEmojiRain } from './modules/emojiRain.js'; // Disabled - replaced with icons
import { initGalaxyCanvas } from './modules/aiChatCanvas.js';
import { initGalaxyChat } from './modules/aiChat.js';
import { initApproachXray } from './modules/approachXray.js';

// ─────────────────────────────────────────────────────────────────────
// DOM Ready
// ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Okeep AI Studio - Initializing...');

    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Initialize all modules
    initHeroCanvas();
    initScrollAnimations();
    initMarqueeParallax();
    initCanvasModeObserver();
    initThemeSwitcher();
    initFullPageScroll();
    initSectorSpotlight();
    // initEmojiRain(); // Disabled - replaced with icons
    initGalaxyCanvas();
    initGalaxyChat();
    initApproachXray();
    initHeader();
    initContactForm();

    // Re-initialize Lucide icons after dynamic content loads
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 500);

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
// Smooth Scroll for Anchor Links (Synced with Full Page Scroll)
// ─────────────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            // Find the section index for full-page scroll sync
            const sections = document.querySelectorAll('.scroll-section');
            let targetIndex = -1;
            sections.forEach((section, index) => {
                if (section === target || section.contains(target) || `#${section.id}` === targetId) {
                    targetIndex = index;
                }
            });

            // If found, dispatch section change event
            if (targetIndex >= 0) {
                const event = new CustomEvent('navigateToSection', { detail: { index: targetIndex } });
                window.dispatchEvent(event);
            }

            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
