/* ═══════════════════════════════════════════════════════════════════════
   OKEEP AI STUDIO - Main JavaScript
   Orchestrates all interactions and animations
═══════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────
// DEVICE DETECTION - Redirect to mobile version based on screen width
// ─────────────────────────────────────────────────────────────────────
(function () {
    const MOBILE_BREAKPOINT = 768; // px

    function checkScreenSize() {
        const isMobileSize = window.innerWidth <= MOBILE_BREAKPOINT;

        // If screen is small and not on mobile page, redirect to mobile
        if (isMobileSize && !window.location.pathname.includes('/mobile/')) {
            window.location.href = '/src/mobile/index.html';
        }
    }

    // Check on load
    checkScreenSize();

    // Check on resize
    window.addEventListener('resize', checkScreenSize);
})();

// Import CSS
import './styles/main.css';
import './styles/sections/galaxy-chat.css';

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
// DOM Ready (Desktop Only)
// ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    console.log('🖥️ Okeep AI Studio (Desktop) - Initializing...');

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
    if (!header) return;

    // Header only visible on first section (hero)
    // Listen to custom sectionChanged event from fullPageScroll
    window.addEventListener('sectionChanged', (e) => {
        const { index } = e.detail;

        if (index === 0) {
            // Show header on hero section
            header.style.transform = 'translateY(0)';
            header.style.opacity = '1';
            header.style.pointerEvents = 'auto';
        } else {
            // Hide header on all other sections
            header.style.transform = 'translateY(-100%)';
            header.style.opacity = '0';
            header.style.pointerEvents = 'none';
        }
    });

    // Also listen to native scroll for mobile/fallback
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            header.style.transform = 'translateY(-100%)';
            header.style.opacity = '0';
            header.style.pointerEvents = 'none';
        } else {
            header.style.transform = 'translateY(0)';
            header.style.opacity = '1';
            header.style.pointerEvents = 'auto';
        }
    }, { passive: true });
}

// ─────────────────────────────────────────────────────────────────────
// Contact Form - Opens user's email client with mailto:
// ─────────────────────────────────────────────────────────────────────
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data (updated IDs for accessibility)
        const name = form.querySelector('#contact-name').value;
        const email = form.querySelector('#contact-email').value;
        const message = form.querySelector('#contact-message').value || '';

        // Build mailto link
        const subject = `Okeep İletişim Formu - ${name}`;
        const body = `İsim: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`;

        const mailtoLink = `mailto:hasan.tatar@okeep.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Open user's email client
        window.location.href = mailtoLink;
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
