/* ═══════════════════════════════════════════════════════════════════════
   YAPTIR.IO AI STUDIO - Emoji Rain Module
   Triggered on specific section transitions
   Emojis: ⏳, 💰, 🤖, 👷, ⚡, 📈, 🚀
═══════════════════════════════════════════════════════════════════════ */

export function initEmojiRain() {
    console.log('🌧️ Emoji Rain Module Initialized');

    const EMOJIS = ['⏳', '💰', '🤖', '👷', '⚡', '📈', '🚀', '⏱️', '💵', '🏗️'];
    const TARGET_SECTION_INDEX = 1; // "Sektörler" section index (0-based)
    let hasRainTriggered = false;

    // Listen for custom section change event from fullPageScroll.js
    window.addEventListener('sectionChanged', (e) => {
        const { index } = e.detail;
        console.log(`🌧️ Rain Debug: Section index: ${index}, Target: ${TARGET_SECTION_INDEX}, Triggered: ${hasRainTriggered}`);

        // Only trigger when moving TO the sectors page, and only ONCE
        if (index === TARGET_SECTION_INDEX && !hasRainTriggered) {
            console.log('🌧️ Rain Debug: Triggering rain!');
            triggerEmojiRain();
            hasRainTriggered = true;
        }
    });

    function triggerEmojiRain() {
        const container = document.createElement('div');
        container.classList.add('emoji-rain-container');
        document.body.appendChild(container);

        const emojiCount = 10; // Even Fewer drops (Reduced from 15)

        for (let i = 0; i < emojiCount; i++) {
            const emoji = document.createElement('div');
            emoji.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
            emoji.classList.add('falling-emoji');

            // Jittered Grid: Ensure spread across 100vw
            // Divide screen into 'emojiCount' segments, place one in each
            const segmentWidth = 100 / emojiCount; // e.g., 10%
            const randomOffset = Math.random() * (segmentWidth * 0.8); // slight padding

            emoji.style.left = (i * segmentWidth + randomOffset) + 'vw';

            // Randomize Top start slightly so they don't fall in a perfect "wave"
            emoji.style.top = (-50 - Math.random() * 100) + 'px';

            emoji.style.animationDuration = (Math.random() * 0.7 + 0.8) + 's'; // 0.8s - 1.5s (Faster)
            emoji.style.fontSize = (Math.random() * 1.5 + 2.5) + 'rem'; // 2.5rem - 4rem (Ideal Size)
            emoji.style.animationDelay = Math.random() * 0.5 + 's'; // 0 - 0.5s delay

            container.appendChild(emoji);
        }

        // Cleanup after animation
        setTimeout(() => {
            container.remove();
        }, 5000); // 5 seconds safety cleanup
    }
}
