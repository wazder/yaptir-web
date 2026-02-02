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
// Contact Form - Sends email via Web3Forms API
// ─────────────────────────────────────────────────────────────────────
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        
        // Show loading state
        btn.innerHTML = '<span style="display: inline-flex; align-items: center; gap: 8px;">Gönderiliyor... <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke-linecap="round"/></svg></span>';
        btn.disabled = true;

        // Get form data
        const formData = new FormData(form);
        
        // Add Web3Forms access key and recipient
        formData.append('access_key', 'YOUR_WEB3FORMS_KEY'); // User needs to replace this
        formData.append('to_email', 'destek@okeep.ai');
        formData.append('from_name', 'Okeep Website');
        formData.append('subject', `Yeni İletişim Formu: ${formData.get('name')}`);
        
        // Build email body
        const emailBody = `
Yeni bir iletişim formu gönderildi:

📧 İsim: ${formData.get('name')}
📬 E-posta: ${formData.get('email')}
💬 Mesaj: ${formData.get('message') || 'Mesaj yok'}

---
Bu mesaj okeep.ai web sitesi üzerinden gönderilmiştir.
        `.trim();
        
        formData.append('message', emailBody);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Success
                btn.innerHTML = '<span style="display: inline-flex; align-items: center; gap: 8px;">✓ Gönderildi!</span>';
                btn.style.background = 'linear-gradient(135deg, #10B981, #34D399)';
                form.reset();
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            } else {
                throw new Error(result.message || 'Gönderim başarısız');
            }
        } catch (error) {
            console.error('Form error:', error);
            
            // Fallback: Open mailto link
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message') || '';
            
            const mailtoBody = `İsim: ${name}%0D%0AE-posta: ${email}%0D%0A%0D%0AMesaj:%0D%0A${encodeURIComponent(message)}`;
            const mailtoLink = `mailto:destek@okeep.ai?subject=Okeep İletişim Formu - ${encodeURIComponent(name)}&body=${mailtoBody}`;
            
            window.location.href = mailtoLink;
            
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }
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
