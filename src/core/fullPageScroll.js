/* ═══════════════════════════════════════════════════════════════════════
   OKEEP AI STUDIO - Full Page Scroll Core
   Manages section-based scrolling interactions
═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   OKEEP AI STUDIO - Premium Full Page Scroll
   Strict "Slide-Like" Navigation (One scroll = One page)
═══════════════════════════════════════════════════════════════════════ */

export function initFullPageScroll() {
    console.log('📜 Premium Full Page Scroll Initialized');

    const sections = document.querySelectorAll('.scroll-section');
    if (sections.length === 0) return;

    let currentSectionIndex = 0;
    let isScrolling = false;
    let lastScrollTime = 0;
    const scrollDelay = 750; // BALANCED: 750ms for serial fluidity (slightly faster than 800ms anim)

    // Disable native scroll behavior to take full control
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.scrollBehavior = 'auto'; // We handle the smoothing

    // Initialize position
    scrollToSection(0, 'auto');

    // ─────────────────────────────────────────────────────────────────
    // Wheel Handler (The "Slide" Logic)
    // ─────────────────────────────────────────────────────────────────
    window.addEventListener('wheel', (e) => {
        // e.preventDefault(); // Stop native scroll logic immediately

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
    }, { passive: false }); // Passive false allows preventDefault (if we enabled it)

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
    // Helpers
    // ─────────────────────────────────────────────────────────────────
    function scrollToSection(index, behavior = 'smooth') {
        isScrolling = true;
        lastScrollTime = Date.now();

        console.log(`🎬 Sliding to section ${index}`);

        sections[index].scrollIntoView({
            behavior: behavior,
            block: 'start'
        });

        // Dispatch Custom Event for external modules (like EmojiRain)
        const event = new CustomEvent('sectionChanged', {
            detail: { index: index, sectionId: sections[index].id }
        });
        window.dispatchEvent(event);

        // Release lock after animation finishes
        setTimeout(() => {
            isScrolling = false;
        }, scrollDelay);
    }
}

