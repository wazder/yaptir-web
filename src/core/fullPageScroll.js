/* ═══════════════════════════════════════════════════════════════════════
   OKEEP AI STUDIO - Full Page Scroll Core
   Manages section-based scrolling interactions
═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   OKEEP AI STUDIO - Premium Full Page Scroll
   Strict "Slide-Like" Navigation (One scroll = One page)
═══════════════════════════════════════════════════════════════════════ */

// Space theme colors - progressively darker
const SPACE_COLORS = [
    { r: 30, g: 30, b: 63 },    // #1e1e3f - Hero (lightest space)
    { r: 22, g: 22, b: 43 },    // #16162b - Sectors
    { r: 15, g: 15, b: 35 },    // #0f0f23 - Approach
    { r: 10, g: 10, b: 26 },    // #0a0a1a - Galaxy Chat (stays same)
    { r: 8, g: 8, b: 20 },      // #080814 - Team
    { r: 5, g: 5, b: 16 },      // #050510 - Contact (darkest)
];

// Disable browser's automatic scroll restoration
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

export function initFullPageScroll() {
    console.log('📜 Premium Full Page Scroll Initialized');

    const sections = document.querySelectorAll('.scroll-section');
    console.log('📜 Found sections:', sections.length);
    if (sections.length === 0) return;

    let currentSectionIndex = 0;
    let isScrolling = false;
    let lastScrollTime = 0;
    const scrollDelay = 600;

    // ─────────────────────────────────────────────────────────────────
    // Background Color Transition
    // ─────────────────────────────────────────────────────────────────
    function updateBackgroundColor(index) {
        const color = SPACE_COLORS[Math.min(index, SPACE_COLORS.length - 1)];
        const bgColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
        
        // Smooth transition on body
        document.body.style.transition = 'background-color 0.6s ease';
        document.body.style.backgroundColor = bgColor;
        
        // Also update canvas container
        const canvasBg = document.getElementById('global-canvas-bg');
        if (canvasBg) {
            canvasBg.style.transition = 'background-color 0.6s ease';
            canvasBg.style.backgroundColor = bgColor;
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // Helper Functions (defined first)
    // ─────────────────────────────────────────────────────────────────
    function scrollToSection(index, behavior = 'smooth') {
        isScrolling = true;
        lastScrollTime = Date.now();

        console.log(`🎬 Sliding to section ${index}`);

        sections[index].scrollIntoView({
            behavior: behavior,
            block: 'start'
        });

        // Update scroll indicator
        updateScrollIndicator(index);
        
        // Update background color based on section
        updateBackgroundColor(index);

        // Dispatch Custom Event for external modules
        const event = new CustomEvent('sectionChanged', {
            detail: { index: index, sectionId: sections[index].id }
        });
        window.dispatchEvent(event);

        // Release lock after animation finishes
        setTimeout(() => {
            isScrolling = false;
        }, scrollDelay);
    }

    function createScrollIndicator(sectionList) {
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.innerHTML = Array.from(sectionList).map((section, i) => 
            `<button class="scroll-dot" data-index="${i}" aria-label="Go to section ${i + 1}"></button>`
        ).join('');
        document.body.appendChild(indicator);

        // Click handlers for dots
        indicator.querySelectorAll('.scroll-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.index);
                if (index !== currentSectionIndex && !isScrolling) {
                    currentSectionIndex = index;
                    scrollToSection(index);
                }
            });
        });
    }

    function updateScrollIndicator(index) {
        document.querySelectorAll('.scroll-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    // ─────────────────────────────────────────────────────────────────
    // Initialize
    // ─────────────────────────────────────────────────────────────────
    
    // Disable native scroll behavior to take full control
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.scrollBehavior = 'auto';

    // Force scroll to top on page load
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Initialize position
    scrollToSection(0, 'auto');

    // Create scroll indicator
    createScrollIndicator(sections);
    updateScrollIndicator(0);

    // ─────────────────────────────────────────────────────────────────
    // Wheel Handler (The "Slide" Logic)
    // ─────────────────────────────────────────────────────────────────
    window.addEventListener('wheel', (e) => {
        const now = Date.now();
        if (isScrolling || now - lastScrollTime < scrollDelay) return;

        // Threshold to ignore tiny trackpad jitters
        if (Math.abs(e.deltaY) < 20) return;

        if (e.deltaY > 0) {
            // Scroll Down
            if (currentSectionIndex < sections.length - 1) {
                currentSectionIndex++;
                scrollToSection(currentSectionIndex);
            }
        } else {
            // Scroll Up
            if (currentSectionIndex > 0) {
                currentSectionIndex--;
                scrollToSection(currentSectionIndex);
            }
        }
    }, { passive: false });

    // ─────────────────────────────────────────────────────────────────
    // Touch/Swipe Support for Mobile
    // ─────────────────────────────────────────────────────────────────
    let touchStartY = 0;
    let touchEndY = 0;
    const minSwipeDistance = 50;

    document.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (isScrolling) return;

        touchEndY = e.changedTouches[0].screenY;
        const swipeDistance = touchStartY - touchEndY;

        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0 && currentSectionIndex < sections.length - 1) {
                // Swipe Up = Scroll Down
                currentSectionIndex++;
                scrollToSection(currentSectionIndex);
            } else if (swipeDistance < 0 && currentSectionIndex > 0) {
                // Swipe Down = Scroll Up
                currentSectionIndex--;
                scrollToSection(currentSectionIndex);
            }
        }
    }, { passive: true });

    // ─────────────────────────────────────────────────────────────────
    // Keyboard Navigation
    // ─────────────────────────────────────────────────────────────────
    window.addEventListener('keydown', (e) => {
        if (isScrolling) return;

        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            if (currentSectionIndex < sections.length - 1) {
                currentSectionIndex++;
                scrollToSection(currentSectionIndex);
            }
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            if (currentSectionIndex > 0) {
                currentSectionIndex--;
                scrollToSection(currentSectionIndex);
            }
        }
    });

    // ─────────────────────────────────────────────────────────────────
    // Listen for navigation requests from anchor links
    // ─────────────────────────────────────────────────────────────────
    window.addEventListener('navigateToSection', (e) => {
        const { index } = e.detail;
        if (index >= 0 && index < sections.length && index !== currentSectionIndex) {
            currentSectionIndex = index;
            scrollToSection(currentSectionIndex);
        }
    });
}

