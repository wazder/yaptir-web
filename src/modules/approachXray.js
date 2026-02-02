// ═══════════════════════════════════════════════════════════════════════
//                    APPROACH X-RAY CANVAS
//      Permanent X-Ray effect for the Yaklaşımımız section
// ═══════════════════════════════════════════════════════════════════════

let canvas, ctx;
let dots = [];
let ghosts = [];
let cables = [];
let gridCols = 0;
let gridRows = 0;
let animationId;
let isVisible = false;

const DOT_SPACING = 40;
const DOT_SIZE = 3;

// Darker teal/green for x-ray effect
const XRAY_PRIMARY = '#008B7A';  // Darker teal
const XRAY_SECONDARY = '#5B21B6'; // Darker purple
const XRAY_GLOW = '#006B5A';  // Even darker for glow

class Dot {
    constructor(x, y, row, col) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.col = col;
        this.baseAlpha = 0.15 + Math.random() * 0.1;
        this.pulseOffset = Math.random() * Math.PI * 2;
    }

    draw() {
        const pulse = Math.sin(Date.now() * 0.002 + this.pulseOffset) * 0.05;
        ctx.fillStyle = `rgba(0, 139, 122, ${this.baseAlpha + pulse})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, DOT_SIZE, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initCanvas() {
    canvas = document.getElementById('approach-xray-canvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    resize();
    initGrid();
    initXrayElements();
    
    // Intersection observer for performance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
            if (isVisible && !animationId) {
                animate();
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(canvas.parentElement);
    
    window.addEventListener('resize', () => {
        resize();
        initGrid();
        initXrayElements();
    });
}

function resize() {
    const section = canvas.parentElement;
    canvas.width = section.offsetWidth;
    canvas.height = section.offsetHeight;
}

function initGrid() {
    dots = [];
    gridCols = Math.ceil(canvas.width / DOT_SPACING) + 1;
    gridRows = Math.ceil(canvas.height / DOT_SPACING) + 1;
    
    const offsetX = (canvas.width - (gridCols - 1) * DOT_SPACING) / 2;
    const offsetY = (canvas.height - (gridRows - 1) * DOT_SPACING) / 2;
    
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            const x = offsetX + c * DOT_SPACING;
            const y = offsetY + r * DOT_SPACING;
            dots.push(new Dot(x, y, r, c));
        }
    }
}

function initXrayElements() {
    // Create ghost workers (animated robots)
    ghosts = [];
    const ghostCount = 50;
    
    for (let i = 0; i < ghostCount; i++) {
        if (dots.length > 10) {
            const startDot = dots[Math.floor(Math.random() * dots.length)];
            // Find nearby dot for target
            const nearbyDots = dots.filter(d => {
                const dist = Math.sqrt(Math.pow(d.x - startDot.x, 2) + Math.pow(d.y - startDot.y, 2));
                return dist > 0 && dist < DOT_SPACING * 3;
            });
            const targetDot = nearbyDots.length ? nearbyDots[Math.floor(Math.random() * nearbyDots.length)] : startDot;
            
            ghosts.push({
                x: startDot.x,
                y: startDot.y,
                targetX: targetDot.x,
                targetY: targetDot.y,
                progress: Math.random(),
                speed: 0.003 + Math.random() * 0.005,
                color: Math.random() > 0.5 ? XRAY_PRIMARY : XRAY_SECONDARY
            });
        }
    }
    
    // Create data cables
    cables = [];
    const cableCount = 80;
    
    for (let i = 0; i < cableCount; i++) {
        if (dots.length > 2) {
            const d1 = dots[Math.floor(Math.random() * dots.length)];
            let d2 = dots[Math.floor(Math.random() * dots.length)];
            
            // Prefer closer connections
            const dist = Math.sqrt(Math.pow(d1.x - d2.x, 2) + Math.pow(d1.y - d2.y, 2));
            if (dist > 200) {
                d2 = dots[Math.floor(Math.random() * dots.length)];
            }
            
            cables.push({
                start: d1,
                end: d2,
                offset: Math.random(),
                speed: 0.002 + Math.random() * 0.004
            });
        }
    }
}

function animate() {
    if (!isVisible) {
        animationId = null;
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw subtle dark overlay
    ctx.fillStyle = 'rgba(15, 23, 42, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid dots
    dots.forEach(dot => dot.draw());
    
    // Draw data cables
    ctx.lineWidth = 1;
    cables.forEach(cable => {
        // Static line (faint)
        ctx.strokeStyle = `rgba(0, 139, 122, 0.06)`;
        ctx.beginPath();
        ctx.moveTo(cable.start.x, cable.start.y);
        ctx.lineTo(cable.end.x, cable.end.y);
        ctx.stroke();
        
        // Moving data packet
        cable.offset += cable.speed;
        const p = cable.offset % 1;
        const x = cable.start.x + (cable.end.x - cable.start.x) * p;
        const y = cable.start.y + (cable.end.y - cable.start.y) * p;
        
        ctx.fillStyle = 'rgba(0, 139, 122, 0.6)';
        ctx.shadowColor = XRAY_GLOW;
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
    
    // Draw ghost workers
    ghosts.forEach(ghost => {
        // Animate movement (ping-pong)
        ghost.progress += ghost.speed;
        let t = ghost.progress % 2;
        if (t > 1) t = 2 - t; // Reverse direction
        
        const curX = ghost.x + (ghost.targetX - ghost.x) * t;
        const curY = ghost.y + (ghost.targetY - ghost.y) * t;
        
        ctx.fillStyle = ghost.color;
        ctx.globalAlpha = 0.5;
        
        // Draw small robot body
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(curX - 6, curY - 9, 12, 10, 2);
        } else {
            ctx.rect(curX - 6, curY - 9, 12, 10);
        }
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(curX - 2, curY - 4, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(curX + 2, curY - 4, 1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    });
    
    animationId = requestAnimationFrame(animate);
}

export function initApproachXray() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCanvas);
    } else {
        initCanvas();
    }
}

export default { initApproachXray };
