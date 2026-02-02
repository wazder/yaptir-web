/* ═══════════════════════════════════════════════════════════════════════
   THEME SWITCHER - Live Theme Demonstration
   Clicking on style pills (Modern, Futuristic, Bold, Minimal) changes
   the entire website appearance in real-time
═══════════════════════════════════════════════════════════════════════ */

export function initThemeSwitcher() {
    const orbitItems = document.querySelectorAll('.orbit-item');
    const body = document.body;

    if (!orbitItems.length) return;

    // Track current theme
    let currentTheme = 'modern';

    // Theme definitions
    const themes = {
        modern: {
            name: 'Modern',
            '--theme-primary': '#00D4AA',
            '--theme-primary-light': '#33DDBB',
            '--theme-secondary': '#0066FF',
            '--theme-accent': '#7C3AED',
            '--theme-gradient': 'linear-gradient(135deg, #00D4AA, #0066FF)',
            '--theme-bg': '#FFFFFF',
            '--theme-surface': '#F5F5F5',
            '--theme-text': '#171717',
            '--theme-text-muted': '#525252',
            '--theme-radius': '24px',
            '--theme-shadow': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            '--theme-font-weight': '600',
            '--theme-letter-spacing': '-0.02em',
            '--theme-border-width': '1px'
        },
        futuristic: {
            name: 'Futuristic',
            '--theme-primary': '#7C3AED',
            '--theme-primary-light': '#A78BFA',
            '--theme-secondary': '#EC4899',
            '--theme-accent': '#06B6D4',
            '--theme-gradient': 'linear-gradient(135deg, #7C3AED, #EC4899)',
            '--theme-bg': '#0F0F23',
            '--theme-surface': '#1A1A35',
            '--theme-text': '#FFFFFF',
            '--theme-text-muted': '#A3A3C2',
            '--theme-radius': '16px',
            '--theme-shadow': '0 0 60px rgba(124, 58, 237, 0.3)',
            '--theme-font-weight': '500',
            '--theme-letter-spacing': '0.05em',
            '--theme-border-width': '1px'
        },
        bold: {
            name: 'Bold',
            '--theme-primary': '#FF6B35',
            '--theme-primary-light': '#FF8F66',
            '--theme-secondary': '#FFD60A',
            '--theme-accent': '#10B981',
            '--theme-gradient': 'linear-gradient(135deg, #FF6B35, #FFD60A)',
            '--theme-bg': '#FFFFFF',
            '--theme-surface': '#FFF5F0',
            '--theme-text': '#171717',
            '--theme-text-muted': '#525252',
            '--theme-radius': '32px',
            '--theme-shadow': '0 25px 50px -12px rgba(255, 107, 53, 0.25)',
            '--theme-font-weight': '800',
            '--theme-letter-spacing': '-0.03em',
            '--theme-border-width': '3px'
        },
        minimal: {
            name: 'Minimal',
            '--theme-primary': '#171717',
            '--theme-primary-light': '#404040',
            '--theme-secondary': '#737373',
            '--theme-accent': '#A3A3A3',
            '--theme-gradient': 'linear-gradient(135deg, #171717, #404040)',
            '--theme-bg': '#FAFAFA',
            '--theme-surface': '#FFFFFF',
            '--theme-text': '#171717',
            '--theme-text-muted': '#737373',
            '--theme-radius': '8px',
            '--theme-shadow': '0 1px 3px rgba(0, 0, 0, 0.1)',
            '--theme-font-weight': '400',
            '--theme-letter-spacing': '0',
            '--theme-border-width': '1px'
        }
    };

    // Apply theme to document
    function applyTheme(themeName) {
        const theme = themes[themeName];
        if (!theme) return;

        // Add transition class for smooth animation
        body.classList.add('theme-transitioning');

        // Apply all theme variables
        Object.entries(theme).forEach(([key, value]) => {
            if (key.startsWith('--')) {
                document.documentElement.style.setProperty(key, value);
            }
        });

        // Set theme attribute for additional styling
        body.setAttribute('data-theme', themeName);

        // Update active state on orbit items
        orbitItems.forEach(item => {
            item.classList.remove('orbit-item--active');
            if (item.dataset.theme === themeName) {
                item.classList.add('orbit-item--active');
            }
        });

        currentTheme = themeName;

        // Show theme change notification
        showThemeNotification(theme.name);

        // Remove transition class after animation
        setTimeout(() => {
            body.classList.remove('theme-transitioning');
        }, 600);
    }

    // Create and show notification
    function showThemeNotification(themeName) {
        // Remove existing notification
        const existing = document.querySelector('.theme-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.innerHTML = `
            <span class="theme-notification__icon">✨</span>
            <span class="theme-notification__text">
                <strong>${themeName}</strong> tema aktif
            </span>
        `;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('theme-notification--visible');
        });

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('theme-notification--visible');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Set up click handlers with data attributes
    orbitItems.forEach((item, index) => {
        // Add theme data attribute based on position
        const themeNames = ['modern', 'futuristic', 'bold', 'minimal'];
        item.dataset.theme = themeNames[index];

        // Make it clickable
        item.style.cursor = 'pointer';

        // Add click handler
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const themeName = item.dataset.theme;
            applyTheme(themeName);
        });

        // Add hover effect
        item.addEventListener('mouseenter', () => {
            item.style.transform = item.classList.contains('orbit-item--1') ||
                item.classList.contains('orbit-item--4')
                ? 'translateX(-50%) scale(1.15)'
                : 'scale(1.15)';
            item.style.boxShadow = '0 8px 25px -5px currentColor';
        });

        item.addEventListener('mouseleave', () => {
            if (!item.classList.contains('orbit-item--active')) {
                item.style.transform = item.classList.contains('orbit-item--1') ||
                    item.classList.contains('orbit-item--4')
                    ? 'translateX(-50%) scale(1)'
                    : 'scale(1)';
                item.style.boxShadow = 'none';
            }
        });
    });

    // Set Modern as default active
    const modernItem = document.querySelector('.orbit-item--1');
    if (modernItem) {
        modernItem.classList.add('orbit-item--active');
    }

    console.log('🎨 Theme Switcher initialized');
}
