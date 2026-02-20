/* ═══════════════════════════════════════════════════════════════════════
   YAPTIR.IO AI STUDIO - Scroll Animations
   Spring-physics reveal animations using IntersectionObserver
═══════════════════════════════════════════════════════════════════════ */

export function initScrollAnimations() {
    // Add data-animate attributes to elements
    addAnimationAttributes();

    // Create observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        }
    );

    // Observe all animated elements
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });

    console.log('📜 Scroll animations initialized');
}

function addAnimationAttributes() {
    // Section headers
    document.querySelectorAll('.section-header').forEach((el, i) => {
        el.setAttribute('data-animate', '');
    });

    // Sector cards with staggered delay
    document.querySelectorAll('.sector-card').forEach((el, i) => {
        el.setAttribute('data-animate', '');
        el.setAttribute('data-animate-delay', (i + 1).toString());
    });

    // Bento cards with staggered delay
    document.querySelectorAll('.bento-card').forEach((el, i) => {
        el.setAttribute('data-animate', '');
        el.setAttribute('data-animate-delay', (i + 1).toString());
    });

    // Team orbs
    document.querySelectorAll('.team-orb').forEach((el, i) => {
        el.setAttribute('data-animate', '');
        el.setAttribute('data-animate-delay', (i + 1).toString());
    });

    // Contact content
    document.querySelectorAll('.contact-info, .contact-form').forEach((el, i) => {
        el.setAttribute('data-animate', '');
        el.setAttribute('data-animate-delay', (i + 1).toString());
    });
}



// ─────────────────────────────────────────────────────────────────────
// Marquee Parallax - Diagonal straightening on scroll
// ─────────────────────────────────────────────────────────────────────
export function initMarqueeParallax() {
    const marqueeWrapper = document.querySelector('.marquee-wrapper');
    if (!marqueeWrapper) return;

    const marqueeSection = document.querySelector('.sector-marquee');
    if (!marqueeSection) return;

    // Initial rotation
    const initialRotation = -3;

    window.addEventListener('scroll', () => {
        const rect = marqueeSection.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const windowHeight = window.innerHeight;

        // Calculate how much of the section is in view
        if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
            // Progress from 0 (just entering) to 1 (leaving)
            const progress = Math.max(0, Math.min(1,
                (windowHeight - sectionTop) / (windowHeight + sectionHeight)
            ));

            // Smoothly interpolate rotation from -3deg to 0deg
            const currentRotation = initialRotation * (1 - progress * 1.5);
            const clampedRotation = Math.max(0, Math.min(0, currentRotation));

            // Apply only when scrolling down past section
            if (progress > 0.3) {
                const straightenProgress = Math.min(1, (progress - 0.3) / 0.4);
                const newRotation = initialRotation + (straightenProgress * Math.abs(initialRotation));
                marqueeWrapper.style.transform = `rotate(${Math.min(0, newRotation)}deg)`;
            } else {
                marqueeWrapper.style.transform = `rotate(${initialRotation}deg)`;
            }
        }
    }, { passive: true });

    console.log('🎠 Marquee parallax initialized');
}

// ─────────────────────────────────────────────────────────────────────
// Canvas Mode Observer - Switches Visuals based on Section
// ─────────────────────────────────────────────────────────────────────
import { setCanvasMode, setRobotMode } from './heroCanvas.js';

export function initCanvasModeObserver() {
    const hero = document.getElementById('hero');
    const sectors = document.getElementById('sektorler-snap');

    if (!hero || !sectors) return;

    const options = {
        root: null,
        threshold: 0.1 // Trigger earlier
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === 'hero') {
                    setCanvasMode('DOTS');
                    setRobotMode('HERO');
                } else if (entry.target.id === 'sektorler-snap') {
                    setCanvasMode('LINES');
                    setRobotMode('SECTORS');
                }
            }
        });
    }, options);

    observer.observe(hero);
    observer.observe(sectors);

    console.log('👀 Canvas Mode Observer initialized');
}
