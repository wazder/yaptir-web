/* ═══════════════════════════════════════════════════════════════════════
   YAPTIR.IO AI STUDIO - Full Page Scroll Core
   Manages section-based scrolling interactions
═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   YAPTIR.IO AI STUDIO - Premium Full Page Scroll
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

// Check if device is mobile/touch - works for ALL orientations
function isMobileDevice() {
    // Check for touch capability (most reliable for mobile detection)
    const hasTouch = 'ontouchstart' in window || 
                     navigator.maxTouchPoints > 0 || 
                     window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    
    // User agent check as fallback
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Return true if it's a touch device OR mobile user agent
    // Don't check width - touch devices should always use native scroll
    return hasTouch || isMobileUA;
}

export function initFullPageScroll() {
    console.log('📜 Premium Full Page Scroll Initialized');

    const sections = document.querySelectorAll('.scroll-section');
    console.log('📜 Found sections:', sections.length);
    if (sections.length === 0) return;

    // Check if mobile (class already added by inline script in HTML)
    const isMobile = document.documentElement.classList.contains('is-touch-device');

    // MOBILE: Use native scrolling for better UX
    if (isMobile) {
        console.log('📱 Touch device detected - native scroll active');
        
        // Just create scroll indicator for visual feedback
        // CSS already handles the scroll enabling via .is-touch-device class
        createMobileScrollIndicator(sections);
        return; // Exit early - let native mobile scroll handle everything
    }

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

    // Force scroll to top on page load - multiple attempts to ensure it works
    function forceScrollToTop() {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Also ensure first section is visible
        if (sections[0]) {
            sections[0].scrollIntoView({ behavior: 'auto', block: 'start' });
        }
    }

    // Immediate scroll reset
    forceScrollToTop();
    
    // Additional resets to handle race conditions
    requestAnimationFrame(() => {
        forceScrollToTop();
        updateBackgroundColor(0);
    });
    
    // Final reset after a short delay to ensure DOM is fully ready
    setTimeout(() => {
        forceScrollToTop();
        updateBackgroundColor(0);
    }, 50);

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

        // Don't hijack space key when user is typing in an input or textarea
        const activeElement = document.activeElement;
        const isTyping = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable
        );

        if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !isTyping)) {
            if (e.key === ' ') e.preventDefault(); // Prevent default only for space scroll
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

// ─────────────────────────────────────────────────────────────────────
// Mobile Scroll Indicator (passive tracking)
// ─────────────────────────────────────────────────────────────────────
function createMobileScrollIndicator(sections) {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.innerHTML = Array.from(sections).map((section, i) => 
        `<button class="scroll-dot" data-index="${i}" aria-label="Go to section ${i + 1}"></button>`
    ).join('');
    document.body.appendChild(indicator);

    // Click handlers for dots - smooth scroll to section with immediate visual feedback
    indicator.querySelectorAll('.scroll-dot').forEach(dot => {
        const handleTap = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const index = parseInt(dot.dataset.index);
            
            // Immediate visual feedback
            document.querySelectorAll('.scroll-dot').forEach((d, i) => {
                d.classList.toggle('active', i === index);
            });
            
            // Scroll to section
            sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        
        dot.addEventListener('click', handleTap);
        dot.addEventListener('touchend', handleTap, { passive: false });
    });

    // Update active dot on scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateMobileScrollIndicator(sections);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Initial update
    updateMobileScrollIndicator(sections);
}

function updateMobileScrollIndicator(sections) {
    const scrollPos = window.scrollY + window.innerHeight * 0.3;
    let currentIndex = 0;

    sections.forEach((section, i) => {
        if (section.offsetTop <= scrollPos) {
            currentIndex = i;
        }
    });

    document.querySelectorAll('.scroll-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
    });
    
    // Also update background color for mobile
    updateMobileBackgroundColor(currentIndex);
}

// Space theme colors for mobile
const MOBILE_SPACE_COLORS = [
    { r: 30, g: 30, b: 63 },
    { r: 22, g: 22, b: 43 },
    { r: 15, g: 15, b: 35 },
    { r: 10, g: 10, b: 26 },
    { r: 8, g: 8, b: 20 },
    { r: 5, g: 5, b: 16 },
];

function updateMobileBackgroundColor(index) {
    const color = MOBILE_SPACE_COLORS[Math.min(index, MOBILE_SPACE_COLORS.length - 1)];
    const bgColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    
    document.body.style.transition = 'background-color 0.4s ease';
    document.body.style.backgroundColor = bgColor;
    
    const canvasBg = document.getElementById('global-canvas-bg');
    if (canvasBg) {
        canvasBg.style.transition = 'background-color 0.4s ease';
        canvasBg.style.backgroundColor = bgColor;
    }
}

