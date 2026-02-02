/* ═══════════════════════════════════════════════════════════════════════
   OKEEP AI CHAT - Galaxy Canvas (Module)
   Targets #galaxy-canvas inside the section.
═══════════════════════════════════════════════════════════════════════ */

const CONFIG = {
    dotSpacing: 32,
    baseDotSize: 1.5,
    mouseRadius: 150,
    dotColor: '#ffffff',
    lineColor: '#64748b',
    lineOpacity: 0.15,
    animationSpeed: 0.05,
    repulsionStrength: 50,
    starFrequency: 0.008,
};

let canvas, ctx;
let dots = [];
let shootingStars = [];
let animationId;
let mouse = { x: -1000, y: -1000, active: false };

// Helper to get mouse pos relative to canvas
function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

class Dot {
    constructor(x, y, row, col) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.size = Math.random() < 0.15 ? CONFIG.baseDotSize * 1.5 : CONFIG.baseDotSize;
        this.alpha = Math.random() * 0.5 + 0.2;

        this.vx = 0;
        this.vy = 0;
        this.friction = 0.90;
        this.springFactor = 0.1;

        this.twinkleSpeed = Math.random() * 0.04;
        this.twinklePhase = Math.random() * Math.PI * 2;
    }

    update() {
        this.twinklePhase += this.twinkleSpeed;

        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (mouse.active && distance < CONFIG.mouseRadius) {
            const angle = Math.atan2(dy, dx);
            const force = (CONFIG.mouseRadius - distance) / CONFIG.mouseRadius;
            const repulsion = force * CONFIG.repulsionStrength;

            this.vx -= Math.cos(angle) * repulsion;
            this.vy -= Math.sin(angle) * repulsion;
        }

        const dxBase = this.baseX - this.x;
        const dyBase = this.baseY - this.y;
        this.vx += dxBase * this.springFactor;
        this.vy += dyBase * this.springFactor;

        this.vx *= this.friction;
        this.vy *= this.friction;

        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        let alpha = this.alpha + Math.sin(this.twinklePhase) * 0.2;
        if (alpha < 0.1) alpha = 0.1;

        ctx.fillStyle = CONFIG.dotColor;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class ShootingStar {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.6;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 10 + 10;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
        this.opacity = 0;
        this.life = 0;
        this.maxLife = 60;
        this.fadingIn = true;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life++;

        if (this.fadingIn) {
            this.opacity += 0.08;
            if (this.opacity >= 1) this.fadingIn = false;
        } else {
            if (this.life > this.maxLife - 15) {
                this.opacity -= 0.1;
            }
        }
    }

    draw() {
        if (this.opacity <= 0) return;

        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;

        const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
    }
}

export function initGalaxyCanvas() {
    // Skip canvas initialization on mobile for better performance
    const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024);
    if (isMobile) {
        console.log('📱 Galaxy canvas disabled on mobile');
        return;
    }
    
    canvas = document.getElementById('galaxy-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Resize Observer to handle section resizing
    const resizeObserver = new ResizeObserver(() => {
        setCanvasSize();
    });
    resizeObserver.observe(canvas.parentElement); // Observe section

    setCanvasSize();

    // Mouse Events scoped to canvas
    canvas.addEventListener('mousemove', (e) => {
        const pos = getMousePos(e);
        mouse.x = pos.x;
        mouse.y = pos.y;
        mouse.active = true;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    animate();
}

function setCanvasSize() {
    // Fill the parent container
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    initDots();
}

function initDots() {
    dots = [];
    const cols = Math.ceil(canvas.width / CONFIG.dotSpacing) + 1;
    const rows = Math.ceil(canvas.height / CONFIG.dotSpacing) + 1;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = (c * CONFIG.dotSpacing);
            const y = (r * CONFIG.dotSpacing);
            const offsetX = (Math.random() - 0.5) * 15;
            const offsetY = (Math.random() - 0.5) * 15;
            dots.push(new Dot(x + offsetX, y + offsetY, r, c));
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < CONFIG.starFrequency) {
        shootingStars.push(new ShootingStar());
    }

    dots.forEach(dot => {
        dot.update();
        dot.draw();
    });

    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.update();
        s.draw();
        if (s.opacity <= 0 || s.life > s.maxLife + 20) {
            shootingStars.splice(i, 1);
        }
    }

    if (mouse.active) drawConstellations();

    animationId = requestAnimationFrame(animate);
}

function drawConstellations() {
    ctx.strokeStyle = CONFIG.lineColor;
    ctx.lineWidth = 0.5;

    // Naive O(N^2) but optimized by distance check, fine for section size
    // Only check stars near mouse
    const nearStars = dots.filter(d => {
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        return (dx * dx + dy * dy) < (CONFIG.mouseRadius * CONFIG.mouseRadius);
    });

    for (let i = 0; i < nearStars.length; i++) {
        for (let j = i + 1; j < nearStars.length; j++) {
            const a = nearStars[i];
            const b = nearStars[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 60) {
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.globalAlpha = (1 - dist / 60) * 0.4;
                ctx.stroke();
            }
        }
    }
    ctx.globalAlpha = 1;
}
