/* ═══════════════════════════════════════════════════════════════════════
   OKEEP AI STUDIO - Hero Canvas
   Canva-style Interactive Dot Grid with Mouse Effects
═══════════════════════════════════════════════════════════════════════ */

// Configuration
const CONFIG = {
    dotSpacing: 32,           // Wider spacing
    baseDotSize: 1.5,         // Small, elegant dots
    mouseRadius: 140,         // Radius of mouse repulsion effect
    dotColor: 'rgba(148, 163, 184, 0.6)',      // Slate-400 with transparency for space
    lineColor: 'rgba(148, 163, 184, 0.4)',     // Slate-400 lighter for space
    lineOpacity: 0.1,         // Subtle ghost thread
    lineTension: 1.1,         // Threshold ratio for line breaking
    flowColor: '#7C3AED',     // Flow connection color (purple)
    animationSpeed: 0.05,     // How fast dots animate back
    repulsionStrength: 50,    // How far dots scatter from mouse
    flowSpeed: 6,             // Speed of flow wave
    flowMaxRadius: 400,       // Max radius of flow effect
};

let canvas, ctx;
let dots = [];
let gridCols = 0; // Store column count for neighbor finding
let gridRows = 0; // Store row count for exclusion zone logic
let xRayState = {
    active: false,
    nextTrigger: Infinity, // DISABLED - X-ray moved to approach section
    duration: 1000, // 1 second duration
    interval: Infinity, // Never trigger on hero
    ghosts: []
};
let visualMode = 'DOTS'; // 'DOTS' or 'LINES'
let flowIcons = []; // Icons flowing on lines
let mouse = { x: -1000, y: -1000, active: false };
let animationId;
let lastTime = 0;
let isInitialized = false; // Prevent multiple initializations
let ripples = [];
let flowWaves = [];  // Click flow effect
let sprite; // The Tiny Architect
let workflows = []; // Active automation workflows
let resources = []; // Resource popups (Mario effect)
let explosions = []; // Particle effects
let robotMode = 'HERO'; // 'HERO' or 'SECTORS'

// Mobile detection - disable complex effects on mobile
let isMobile = false;
function checkMobile() {
    isMobile = window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024);
    return isMobile;
}

// Mobile: Only draw horizontal lines, disable all fancy effects

// Trail particles - colorful dots instead of emojis
const TRAIL_COLORS = ['#FF6B35', '#F7C948', '#22C55E', '#3B82F6', '#A855F7', '#EC4899'];

// ─────────────────────────────────────────────────────────────────────
// Dot Class
// ─────────────────────────────────────────────────────────────────────
class Dot {
    constructor(x, y, row, col) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.row = row;
        this.col = col;

        // Optimizer State
        this.energy = 0; // 0 to 1 (User Interaction Level)
        this.optimized = false; // Is it fixed by robot?
        this.optimizeTime = 0; // Timestamp of optimization

        this.size = CONFIG.baseDotSize;
        this.color = CONFIG.dotColor;
        this.alpha = 0.6;

        this.targetSize = CONFIG.baseDotSize;
        this.targetColor = CONFIG.dotColor;
        this.targetAlpha = 0.6;
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
    }

    reset() {
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
        this.targetSize = CONFIG.baseDotSize;
        this.targetColor = CONFIG.dotColor;
        this.targetAlpha = 0.6;
    }

    update(deltaTime) {
        // Smooth transition
        this.x += (this.baseX + this.targetOffsetX - this.x) * 0.1;
        this.y += (this.baseY + this.targetOffsetY - this.y) * 0.1;
        this.size += (this.targetSize - this.size) * 0.1;
        this.alpha += (this.targetAlpha - this.alpha) * 0.1;

        // Energy Decay (If not optimized)
        if (!this.optimized && this.energy > 0) {
            this.energy -= 0.005; // Decay
            if (this.energy < 0) this.energy = 0;
        }
    }

    draw() { // Fixed draw method
        // Color blending based on state
        if (this.optimized) {
            // Optimized: Cyan
            if (Date.now() - this.optimizeTime > 10000) {
                this.optimized = false; // Decay optimization
            }
            this.color = '#00D4AA';
        } else if (this.energy > 0.1) {
            // Energy: Orange
            this.color = '#FF6B35';
        } else {
            // Default
            this.color = CONFIG.dotColor;
        }

        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ─────────────────────────────────────────────────────────────────────
// Ripple Class for Click Effects
// ─────────────────────────────────────────────────────────────────────
class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = CONFIG.flowMaxRadius;
        this.speed = CONFIG.flowSpeed;
        this.alpha = 1;
        this.complete = false;
    }

    update() {
        this.radius += this.speed;
        this.alpha = 1 - (this.radius / this.maxRadius);

        if (this.radius >= this.maxRadius) {
            this.complete = true;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────
// Flow Wave Class - Creates flowing connections on click
// ─────────────────────────────────────────────────────────────────────
class FlowWave {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = CONFIG.flowMaxRadius;
        this.speed = CONFIG.flowSpeed;
        this.ringWidth = 60;  // Width of the active ring
        this.complete = false;
    }

    update() {
        this.radius += this.speed;
        if (this.radius >= this.maxRadius) {
            this.complete = true;
        }
    }

    getInfluence(distance) {
        // Returns influence based on distance from the ring edge
        const distFromRing = Math.abs(distance - this.radius);
        if (distFromRing < this.ringWidth) {
            return (1 - distFromRing / this.ringWidth) * (1 - this.radius / this.maxRadius);
        }
        return 0;
    }
}

// ─────────────────────────────────────────────────────────────────────
// Workflow Path Class (Automation Visualization)
// ─────────────────────────────────────────────────────────────────────
class WorkflowPath {
    constructor(dots, isConnector = false) {
        this.dots = dots; // Array of connected Dot objects
        this.pulseProgress = 0;
        this.complete = false;
        this.pulseSpeed = 0.08; // FAST Flow (Automation speed)
        this.color = '#00D4AA'; // Success / Data color
        this.isConnector = isConnector;
    }

    update() {
        this.pulseProgress += this.pulseSpeed;
        if (this.pulseProgress >= 3.0) { // Loop 3 times for "Processing" effect
            this.complete = true;
        }
    }

    draw() {
        if (this.dots.length < 2) return;

        ctx.beginPath();

        if (this.isConnector) {
            ctx.strokeStyle = '#64748b'; // Slate-500 (Subtle Connector)
            ctx.lineWidth = 1.0;
            ctx.setLineDash([4, 4]); // Dashed Line for connections
        } else {
            ctx.strokeStyle = '#7C3AED'; // Deep Purple (Foundation)
            ctx.lineWidth = 2.0;
            ctx.setLineDash([]);
        }

        // Draw the static connection line first
        ctx.moveTo(this.dots[0].x, this.dots[0].y);
        for (let i = 1; i < this.dots.length; i++) {
            ctx.lineTo(this.dots[i].x, this.dots[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Draw the DATA PULSE (Looping Energy)
        if (!this.complete) {
            // Modulo for looping effect
            const loopP = this.pulseProgress % 1.0;

            // Calculate current position along the path
            const totalSegments = this.dots.length - 1;
            const currentSegmentFloat = loopP * totalSegments;
            const segmentIndex = Math.floor(currentSegmentFloat);
            const segmentT = currentSegmentFloat - segmentIndex;

            if (segmentIndex < totalSegments) {
                const start = this.dots[segmentIndex];
                const end = this.dots[segmentIndex + 1];

                const px = start.x + (end.x - start.x) * segmentT;
                const py = start.y + (end.y - start.y) * segmentT;

                // SUPER GLOW for Visibility
                ctx.shadowColor = '#00F0FF'; // Cyan Glow
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#fff';

                // Energy Bead (Larger)
                ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();

                // Trail Effect (Line behind bead)
                ctx.beginPath();
                ctx.strokeStyle = '#00F0FF';
                ctx.lineWidth = 4;
                // Simple short trail logic could act weird on corners, 
                // so just the glowy bead is usually cleanest

                ctx.shadowBlur = 0;
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────
// Resource Popup Class (Mario "Coin Block" Effect) - Now uses particles
// ─────────────────────────────────────────────────────────────────────
class ResourcePopup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.yStart = y;
        this.life = 1.0;
        // Colors instead of emojis
        const colors = ['#F7C948', '#3B82F6', '#A855F7', '#22C55E'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.life -= 0.015; // Slow fade
        this.y -= 1.5; // Float up
    }

    draw() {
        ctx.globalAlpha = this.life;

        // Draw glowing particle
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Inner white glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}


// ─────────────────────────────────────────────────────────────────────
// Flow Icon Class (Sectors Mode)
// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// Flow Icon Class (Sectors Mode) - Now uses colored shapes
// ─────────────────────────────────────────────────────────────────────
const SECTOR_DATA = [
    { color: '#FF6B35', label: 'Restoran' },
    { color: '#8B5A2B', label: 'Kafe' },
    { color: '#A855F7', label: 'Bar & Pub' },
    { color: '#3B82F6', label: 'Otel' },
    { color: '#22C55E', label: 'E-Ticaret' },
    { color: '#EC4899', label: 'Güzellik' },
    { color: '#F97316', label: 'Spor' },
    { color: '#EF4444', label: 'Sağlık' },
    { color: '#6366F1', label: 'Eğitim' },
    { color: '#10B981', label: 'Emlak' },
    { color: '#64748B', label: 'Oto' },
    { color: '#F59E0B', label: 'Sanat' },
    { color: '#1E293B', label: 'Hukuk' },
    { color: '#0EA5E9', label: 'Finans' }
];

class FlowIcon {
    constructor(rowY) {
        this.x = -50;
        this.y = rowY;
        this.speed = 2 + Math.random() * 2;

        const data = SECTOR_DATA[Math.floor(Math.random() * SECTOR_DATA.length)];
        this.color = data.color;
        this.label = data.label; // Store label

        this.size = 20 + Math.random() * 10;
        this.complete = false;
    }

    update() {
        this.x += this.speed;
        if (this.x > canvas.width + 50) {
            this.complete = true;
        }
    }

    draw() {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw colored circle particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        
        // Inner glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Label (New)
        ctx.font = `600 12px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = '#64748b'; // Slate-500
        ctx.fillText(this.label, this.x, this.y + this.size + 4);
    }
}

// ─────────────────────────────────────────────────────────────────────
// Explosion Class (Particle Effect)
// ─────────────────────────────────────────────────────────────────────
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.complete = false;

        // Create particles
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: 0,
                y: 0,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1.0,
                color: ['#FF6B35', '#7C3AED', '#00D4AA', '#FFF'][Math.floor(Math.random() * 4)],
                size: Math.random() * 3 + 1
            });
        }
    }

    update() {
        let activeParticles = 0;
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if (p.life > 0) activeParticles++;
        });

        if (activeParticles === 0) {
            this.complete = true;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        this.particles.forEach(p => {
            if (p.life <= 0) return;
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
}

// ─────────────────────────────────────────────────────────────────────
// Grid Sprite ("The Workflow Architect")
// ─────────────────────────────────────────────────────────────────────
class GridSprite {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.row = 0;
        this.col = 0;

        // Target state
        this.targetRow = 0;
        this.targetCol = 0;

        // Movement state
        this.progress = 0;
        this.speed = 0.28; // AGILE SPEED (Jump & Zip)
        this.gravitySpeed = 0.50;
        this.state = 'IDLE'; // IDLE, MOVING, WAITING
        this.waitTimer = 0;

        // Visual state
        this.jumpHeight = 0;
        this.color = '#FF6B35'; // Brand Orange
        this.scale = 2.2; // Current scale (was 1.4)
        this.targetScale = 2.2; // Target scale (was 1.4)
        this.trail = []; // Particle trail

        // Pick a random color for next drop
        this.nextColor = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)];

        // Fainted Logic
        this.isFainted = false;
        this.faintTimer = 0;
        this.isHappy = false; // New Happy State

        // Path queue for planned movements
        this.pathQueue = [];
        this.visitedHistory = []; // Track recent moves
        this.maxHistory = 20;

        // Exclusion Zone (Text Area)
        this.exclusionZone = { minRow: -1, maxRow: -1, minCol: -1, maxCol: -1 };

        // Narrative Mission State
        this.mission = 'FLANKING_RIGHT'; // Start by moving away from center
        this.currentJumpPower = 0; // 0 = Glide, >0 = Jump

        this.init();
    }

    updateExclusionZone() {
        // Find the hero content text area
        const heroContent = document.querySelector('.hero__content');
        if (!heroContent) return;

        const rect = heroContent.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();

        // Validate that we got meaningful values (DOM must be rendered)
        if (rect.height === 0 || rect.width === 0 || canvasRect.height === 0) {
            console.log('⚠️ DOM not ready, using fallback exclusion zone');
            // Use sensible defaults based on typical content position
            this.exclusionZone.minCol = Math.floor(gridCols * 0.2);
            this.exclusionZone.maxCol = Math.floor(gridCols * 0.8);
            this.exclusionZone.minRow = Math.floor(gridRows * 0.2);
            this.exclusionZone.maxRow = Math.floor(gridRows * 0.6);
            return;
        }

        // Convert DOM rect to canvas coordinates
        const x1 = rect.left - canvasRect.left;
        const y1 = rect.top - canvasRect.top;
        const x2 = x1 + rect.width;
        const y2 = y1 + rect.height;

        // Convert to Grid Rows/Cols (with some padding buffer)
        const buffer = 1;
        this.exclusionZone.minCol = Math.floor(x1 / CONFIG.dotSpacing) - buffer;
        this.exclusionZone.maxCol = Math.ceil(x2 / CONFIG.dotSpacing) + buffer;
        this.exclusionZone.minRow = Math.floor(y1 / CONFIG.dotSpacing) - buffer;
        this.exclusionZone.maxRow = Math.ceil(y2 / CONFIG.dotSpacing) + buffer;

        console.log('🚫 Exclusion Zone Updated:', this.exclusionZone);
    }

    isExcluded(r, c) {
        if (robotMode === 'SECTORS') return false; // Force allow in Sectors
        return (
            r >= this.exclusionZone.minRow &&
            r <= this.exclusionZone.maxRow &&
            c >= this.exclusionZone.minCol &&
            c <= this.exclusionZone.maxCol
        );
    }

    init() {
        this.updateExclusionZone(); // Ensure zone is calculated first

        // Validate grid dimensions exist
        if (gridRows <= 0 || gridCols <= 0) {
            console.log('⚠️ Grid not ready, deferring sprite init');
            return;
        }

        // Start below the exclusion zone (buttons)
        // Ensure exclusionZone has valid values
        const hasValidExclusion = this.exclusionZone.maxRow > 0 && 
                                  this.exclusionZone.maxRow < gridRows - 2 &&
                                  this.exclusionZone.maxRow > this.exclusionZone.minRow;
        
        if (hasValidExclusion) {
            // Start centered below the content
            this.row = Math.min(this.exclusionZone.maxRow + 1, gridRows - 1);
            this.col = Math.floor(gridCols / 2);
        } else {
            // Fallback: Start in lower half (70% down the screen)
            this.row = Math.floor(gridRows * 0.70);
            this.col = Math.floor(gridCols * 0.5);
        }

        // Clamp values to valid range
        this.row = Math.max(0, Math.min(this.row, gridRows - 1));
        this.col = Math.max(0, Math.min(this.col, gridCols - 1));

        const startDot = this.getDot(this.row, this.col);
        if (startDot) {
            this.x = startDot.x;
            this.y = startDot.y;
        } else {
            // Absolute fallback: bottom center of canvas
            this.x = canvas.width / 2;
            this.y = canvas.height * 0.7;
        }

        console.log('🤖 Sprite initialized at row:', this.row, 'col:', this.col, 'x:', this.x, 'y:', this.y);

        // Add initial position to trail
        this.addToTrail();
        this.pickTarget();
    }

    getDot(r, c) {
        if (r < 0 || c < 0 || c >= gridCols || r >= gridRows) return null;
        const idx = r * gridCols + c;
        return dots[idx] || null;
    }

    addToTrail() {
        // Drop a colored particle at current position
        this.trail.push({
            x: this.x,
            y: this.y,
            color: this.nextColor,
            life: 2.0, // Seconds before explosion
            maxLife: 2.0
        });

        // Pick new color for next step
        this.nextColor = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)];
    }

    addToHistory(r, c) {
        this.visitedHistory.push({ r, c });
        if (this.visitedHistory.length > this.maxHistory) {
            this.visitedHistory.shift();
        }
    }

    pickTarget() {
        // If we have a path, continue it
        if (this.pathQueue.length > 0) {
            const next = this.pathQueue.shift();
            // Validate next step
            if (next.r >= 0 && next.r < gridRows && next.c >= 0 && next.c < gridCols) {
                this.targetRow = next.r;
                this.targetCol = next.c;
                // Set Jump Power based on Move Type (stored in queue or derived)
                this.currentJumpPower = next.jumpPower !== undefined ? next.jumpPower : 0;

                this.state = 'MOVING';
                this.progress = 0;
                return;
            }
            this.pathQueue = []; // Clear invalid
        }

        // ─── NARRATIVE MISSION LOGIC ───

        let targetR = this.row;
        let targetC = this.col;
        let moveType = 'GLIDE'; // 'GLIDE', 'CLIMB', 'DESCEND'

        // State Machine
        switch (this.mission) {
            case 'FLANKING_RIGHT':
                // Move from center buttons to Right Edge
                // Target: Rightmost valid col, same row (or slightly varied)
                targetC = gridCols - 3;
                targetR = this.row; // Maintain altitude roughly

                if (this.col >= gridCols - 5) {
                    this.mission = 'CLIMBING';
                }
                moveType = 'GLIDE';
                break;

            case 'CLIMBING':
                // Jump UP to the top (above text)
                targetR = 6; // Adjusted to 6 to prevent off-screen clipping (was 3)
                targetC = this.col; // Maintain column

                if (this.row <= 8) {
                    this.mission = 'PATROLLING_TOP';
                }
                moveType = 'CLIMB';
                break;

            case 'PATROLLING_TOP':
                // Walk Left across the top
                targetC = 3; // Leftmost valid
                targetR = 6; // Keep at row 6 for patrolling

                if (this.col <= 5) {
                    this.mission = 'DESCENDING';
                }
                moveType = 'GLIDE';
                break;

            case 'DESCENDING':
                // Jump DOWN to bottom
                targetR = gridRows - 6; // Bottom zone
                targetC = this.col;

                if (this.row >= gridRows - 8) {
                    this.mission = 'RETURN_CENTER';
                }
                moveType = 'DESCEND';
                break;

            case 'RETURN_CENTER':
                // Go back to start cycle (Center-ish) then Flank Right again
                if (this.col < Math.floor(gridCols / 2)) {
                    targetC = Math.floor(gridCols / 2);
                    moveType = 'GLIDE';
                } else {
                    this.mission = 'FLANKING_RIGHT';
                    return this.pickTarget(); // Re-evaluate immediately
                }
                break;
        }

        // GENERATE PATH TO TARGET
        // Current simple logic: Axial movement
        const dr = targetR - this.row;
        const dc = targetC - this.col;

        // Break into steps
        const stepCount = Math.floor(Math.random() * 3) + 3; // 3-6 steps at a time

        let nextR = this.row;
        let nextC = this.col;

        for (let i = 0; i < stepCount; i++) {
            // Pick direction towards target
            let dR = 0, dC = 0;

            // Prioritize axis based on mission
            if (this.mission === 'CLIMBING' || this.mission === 'DESCENDING') {
                if (targetR !== nextR) dR = Math.sign(targetR - nextR);
            } else {
                if (targetC !== nextC) dC = Math.sign(targetC - nextC);
                else if (targetR !== nextR) dR = Math.sign(targetR - nextR);
            }

            // If already at target for current axis, maybe drift slightly?
            if (dR === 0 && dC === 0) break;

            nextR += dR;
            nextC += dC;

            // Determine Jump Power for this step
            let power = 0;
            if (moveType === 'CLIMB') power = 15; // Big Jump Up
            else if (moveType === 'DESCEND') power = 8; // Drop Down
            else if (moveType === 'GLIDE') power = 0; // Smooth Slide

            // Variation: Occasional hop during glide?
            if (moveType === 'GLIDE' && Math.random() < 0.1) power = 4;

            if (nextR >= 2 && nextR < gridRows - 2 && nextC >= 2 && nextC < gridCols - 2) {
                this.pathQueue.push({ r: nextR, c: nextC, jumpPower: power });
                this.addToHistory(nextR, nextC);
            } else {
                break;
            }
        }

        // Trigger next move
        if (this.pathQueue.length === 0) {
            // Stuck or arrived? Force mission switch/nudge
            this.pathQueue.push({ r: this.row, c: this.col, jumpPower: 4 }); // Hop in place
            // Force random nudges to unstuck
        }

        // Pick from queue now
        this.pickTarget(); // Recursive call to pop the first item immediately
    }

    update() {
        if (!this.x || !this.y) return;

        // SCALE TRANSITION
        this.scale += (this.targetScale - this.scale) * 0.05;

        // 0. Update Trail Life
        for (let i = this.trail.length - 1; i >= 0; i--) {
            const item = this.trail[i];
            item.life -= 0.03; // Age the icon

            if (item.life <= 0) {
                // EXPLODE!
                explosions.push(new Explosion(item.x, item.y));
                this.trail.splice(i, 1);
            }
        }

        // 1. FAINTED STATE (No movement)
        if (this.isFainted) {
            this.faintTimer -= 16; // Approx 1 frame @ 60fps
            if (this.faintTimer <= 0) {
                this.isFainted = false; // Wake up!
                this.color = '#FF6B35';
            }
            return; // Don't move
        }

        // 2. MODE HANDLING
        // 2. MODE HANDLING
        if (robotMode === 'SECTORS') {
            this.targetScale = 4.5; // MASSIVE for Sectors (was 3.5)
            this.color = '#FF6B35'; // Ensure Orange

            // Move to fixed spot (Bottom Right usually looks good, or Bottom Left)
            // TARGET: Bottom Right, slightly indented
            this.targetRow = Math.max(0, gridRows - 6);
            this.targetCol = Math.max(0, gridCols - 8);

            // If far away, move towards it
            if (this.row !== this.targetRow || this.col !== this.targetCol) {
                // Override logic to force walk to target
                if (this.state === 'IDLE' || this.state === 'WAITING') {
                    // Calculate distance
                    const dR = this.targetRow - this.row;
                    const dC = this.targetCol - this.col;

                    // TELEPORT if very far (e.g. initial transition) to ensure visibility
                    // This prevents "walking slowly from top to bottom" feeling like it's missing
                    // Distance > 15 cells is a long walk
                    if (Math.abs(dR) > 15 || Math.abs(dC) > 15) {
                        this.row = this.targetRow;
                        this.col = this.targetCol;
                        const tDot = this.getDot(this.targetRow, this.targetCol);
                        if (tDot) {
                            this.x = tDot.x;
                            this.y = tDot.y;
                            // Add big spawn effect
                            explosions.push(new Explosion(this.x, this.y));
                        }
                        this.state = 'IDLE';
                        return;
                    }

                    // Otherwise walk fast
                    let nextR = this.row;
                    let nextC = this.col;

                    if (Math.abs(dR) > 0) nextR += Math.sign(dR);
                    else if (Math.abs(dC) > 0) nextC += Math.sign(dC);

                    // Force next step validity (ignoring exclusion)
                    this.pathQueue = [{ r: nextR, c: nextC }];

                    // Force speed up
                    this.waitTimer = 0;

                    this.pickTarget(); // This will consume the queue
                }
            } else {
                // Arrived at station. Just idle or look around.
                this.state = 'IDLE';
                // Jump occasionally
                if (Math.random() < 0.01) this.jumpHeight = 6;
            }
        } else {
            // HERO MODE
            this.targetScale = 2.2; // Bigger Hero presence (was 1.4)

            // ─── HAPPY/AFFECTIONATE LOGIC ───
            // Check proximity to mouse for "Happy" state
            if (mouse.active) {
                const distToMouse = Math.sqrt(Math.pow(this.x - mouse.x, 2) + Math.pow(this.y - mouse.y, 2));
                if (distToMouse < 250) { // Increased range for friendliness
                    this.isHappy = true;
                    // Occasional Particle Emission
                    if (Math.random() < 0.08) {
                        const happyColors = ['#EC4899', '#F7C948', '#A855F7'];
                        this.trail.push({
                            x: this.x + (Math.random() - 0.5) * 20,
                            y: this.y - 15,
                            color: happyColors[Math.floor(Math.random() * happyColors.length)],
                            life: 1.5,
                            maxLife: 1.5
                        });
                    }
                } else {
                    this.isHappy = false;
                }
            } else {
                this.isHappy = false;
            }
        }

        // 3. NORMAL MOVEMENT
        if (this.state === 'IDLE' || this.state === 'WAITING') {
            if (this.waitTimer > 0) {
                this.waitTimer--;
            } else {
                this.pickTarget();
            }
        } else if (this.state === 'MOVING') {
            this.progress += this.speed;

            const startDot = this.getDot(this.row, this.col);
            const targetDot = this.getDot(this.targetRow, this.targetCol);

            // Panic recovery if dots are invalid
            if (!startDot || !targetDot) {
                this.state = 'IDLE';
                // Teleport to center if lost
                const centerDot = dots[Math.floor(dots.length / 2)];
                if (centerDot) { this.x = centerDot.x; this.y = centerDot.y; }
                this.waitTimer = 20;
                return;
            }

            if (this.progress >= 1) {
                // Arrived at dot
                this.row = this.targetRow;
                this.col = this.targetCol;
                this.x = targetDot.x;
                this.y = targetDot.y;
                this.progress = 0;
                this.jumpHeight = 0;

                this.addToTrail();

                // FLUIDITY CHECK: Do we have more steps?
                if (this.pathQueue.length > 0) {
                    // YES: CONTINUE MOVING IMMEDIATELY (No Wait)
                    this.pickTarget(); // This pops the next target
                    this.state = 'MOVING';
                } else {
                    // NO: End of run. Pause briefly.
                    this.state = 'WAITING';
                    this.waitTimer = 10; // Brief thought (approx 160ms)
                }
            } else {
                // ADAPTIVE EASING (Improved for Serpentine)
                // Linear for mid-path to keep momentum through turns.
                // Soft ease-out only at the very end.

                const t = this.progress;
                let ease = t;

                if (this.pathQueue.length === 0) {
                    // FINAL STOP: Smooth deceleration
                    ease = 1 - Math.pow(1 - t, 3); // Cubic Ease Out
                } else {
                    // MID-FLOW: Linear for constant "Seri" velocity
                    ease = t;
                }

                this.x = startDot.x + (targetDot.x - startDot.x) * ease;
                this.y = startDot.y + (targetDot.y - startDot.y) * ease;

                // MISSION CONTROLLED JUMP
                // Variable height based on currentJumpPower
                if (this.currentJumpPower > 0) {
                    this.jumpHeight = -Math.sin(this.progress * Math.PI) * this.currentJumpPower;
                } else {
                    this.jumpHeight = 0; // Pure Glide
                }
            }
        }
    }

    draw() {
        // ─── DRAW PARTICLE TRAIL ───
        this.trail.forEach(item => {
            const lifeRatio = item.life / item.maxLife;

            ctx.save();
            ctx.translate(item.x, item.y);

            // Fading out?
            ctx.globalAlpha = lifeRatio;

            // Pulse effect before explosion
            let scale = 1;
            if (item.life < 0.5) {
                scale = 1 + Math.sin(Date.now() * 0.02) * 0.2; // Rapid pulse
            }

            // Draw glowing circle particle (without shadowBlur to avoid rectangular artifacts)
            const radius = 6 * scale;
            
            // Create radial gradient for glow effect instead of shadowBlur
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 2);
            gradient.addColorStop(0, item.color);
            gradient.addColorStop(0.5, item.color);
            gradient.addColorStop(1, 'transparent');
            
            ctx.beginPath();
            ctx.arc(0, 0, radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Inner bright core
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();

            ctx.restore();
        });

        // ─── DRAW CUTE ROBOT ───
        const x = this.x;
        const groundY = this.y;

        ctx.save();
        ctx.translate(x, groundY);
        ctx.scale(this.scale, this.scale); // Dynamic Scale

        // FAINTED ROTATION (Upside down if fainted)
        if (this.isFainted) {
            ctx.rotate(Math.PI);
            ctx.translate(0, -10); // Offset to look somewhat grounded
        }

        // 1. Shadow 
        if (!this.isFainted) {
            const jumpObj = Math.abs(this.jumpHeight);
            const jumpRatio = jumpObj / 20;
            const shadowScale = Math.max(0.4, 1 - jumpRatio * 0.6);
            const shadowAlpha = 0.2 * (1 - jumpRatio * 0.6);

            ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
            ctx.beginPath();
            ctx.ellipse(0, 6, 8 * shadowScale, 3 * shadowScale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.translate(0, this.jumpHeight);
        }

        // ─── SQUASH & STRETCH ───
        let scaleX = 1; let scaleY = 1;
        if (this.isFainted) {
            scaleX = 0.9; scaleY = 1.1; // Limp
        } else if (this.state === 'MOVING') {
            // JUMP STRETCH
            // When jumping (height > 0), stretch vertically.
            const jumpObj = Math.abs(this.jumpHeight);
            const jumpRatio = jumpObj / 12; // Normalized roughly to max height

            // Stretch Y up to 1.3x, Squash X down to 0.85x
            scaleY = 1 + jumpRatio * 0.3;
            scaleX = 1 - jumpRatio * 0.15;
        }
        ctx.scale(scaleX, scaleY);

        // 5. Feet
        if (!this.isFainted) {
            const walkCycle = (this.state === 'MOVING') ? Math.sin(this.progress * Math.PI * 4) : 0;
            const leg1Y = walkCycle * 2;
            const leg2Y = -walkCycle * 2;
            ctx.fillStyle = this.color;
            ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-7, 3 + leg1Y, 4, 5, 2); else ctx.rect(-7, 3 + leg1Y, 4, 5); ctx.fill();
            ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(3, 3 + leg2Y, 4, 5, 2); else ctx.rect(3, 3 + leg2Y, 4, 5); ctx.fill();
        } else {
            // Legs sticking up
            ctx.fillStyle = this.color;
            ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-7, 5, 4, 5, 2); else ctx.rect(-7, 5, 4, 5); ctx.fill();
            ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(3, 5, 4, 5, 2); else ctx.rect(3, 5, 4, 5); ctx.fill();
        }

        // 2. Body
        ctx.fillStyle = this.isFainted ? '#ff8f66' : this.color; // Pale orange
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-10, -15, 20, 18, 6);
        else ctx.rect(-10, -15, 20, 18);
        ctx.fill();

        // 3. Face
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-7, -11, 14, 10, 3);
        else ctx.rect(-7, -11, 14, 10);
        ctx.fill();

        // 4. Eyes (Dizzy X_X or Happy ^_^)
        if (this.isFainted) {
            ctx.strokeStyle = '#0A0A0A';
            ctx.lineWidth = 1.5;
            // X Left
            ctx.beginPath(); ctx.moveTo(-5, -8); ctx.lineTo(-2, -5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-2, -8); ctx.lineTo(-5, -5); ctx.stroke();
            // X Right
            ctx.beginPath(); ctx.moveTo(2, -8); ctx.lineTo(5, -5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(5, -8); ctx.lineTo(2, -5); ctx.stroke();
        } else if (this.isHappy) {
            // HAPPY EYES (^ ^)
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';

            // Left Eye
            ctx.beginPath();
            ctx.arc(-3, -4, 2.5, Math.PI, 0); // Arch up
            ctx.stroke();

            // Right Eye
            ctx.beginPath();
            ctx.arc(3, -4, 2.5, Math.PI, 0); // Arch up
            ctx.stroke();

            // Cheek Blush
            ctx.fillStyle = '#ffb3b3';
            ctx.beginPath(); ctx.arc(-6, -2, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(6, -2, 1.5, 0, Math.PI * 2); ctx.fill();

        } else {
            ctx.fillStyle = '#1e293b';
            // Normal blink or wide eyes
            if (this.state === 'WAITING' && Math.random() < 0.05) {
                // Blink
                ctx.fillRect(-4.5, -6.5, 3, 1); ctx.fillRect(1.5, -6.5, 3, 1);
            } else {
                // Wide Eyes (Look direction?)
                // Simple dot eyes for cuteness
                ctx.beginPath(); ctx.arc(-3, -6, 2.0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(3, -6, 2.0, 0, Math.PI * 2); ctx.fill();
            }
        }

        ctx.restore();
    }
}
function createDots() {
    dots = [];

    const cols = Math.ceil(canvas.width / CONFIG.dotSpacing) + 2;
    gridCols = cols; // Store for neighbor lookup
    const rows = Math.ceil(canvas.height / CONFIG.dotSpacing) + 2;
    gridRows = rows; // Store for exclusion logic

    // Center the grid
    const startX = (canvas.width - (cols - 1) * CONFIG.dotSpacing) / 2;
    const startY = (canvas.height - (rows - 1) * CONFIG.dotSpacing) / 2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = startX + col * CONFIG.dotSpacing;
            const y = startY + row * CONFIG.dotSpacing;
            dots.push(new Dot(x, y, row, col));
        }
    }

    console.log(`✅ Created ${dots.length} dots (${rows} rows × ${cols} cols)`);
    console.log(`📐 Canvas size: ${canvas.width}×${canvas.height}`);
    console.log(`🎨 Dot config: size=${CONFIG.baseDotSize}, color=${CONFIG.dotColor}, alpha=0.6`);
}

// ─────────────────────────────────────────────────────────────────────
// Update Mouse Interactions
// ─────────────────────────────────────────────────────────────────────
function updateMouseInteractions() {
    dots.forEach((dot, index) => {
        const dx = dot.baseX - mouse.x;
        const dy = dot.baseY - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check ripple effects
        let rippleEffect = 0;
        ripples.forEach(ripple => {
            const rippleDx = dot.baseX - ripple.x;
            const rippleDy = dot.baseY - ripple.y;
            const rippleDist = Math.sqrt(rippleDx * rippleDx + rippleDy * rippleDy);

            // Ring effect - dots near the ripple edge are affected
            const ringWidth = 50;
            const distFromRing = Math.abs(rippleDist - ripple.radius);

            if (distFromRing < ringWidth) {
                const influence = (1 - distFromRing / ringWidth) * ripple.alpha;
                rippleEffect = Math.max(rippleEffect, influence);
            }
        });

        if (distance < CONFIG.mouseRadius && mouse.active) {
            // Calculate influence based on distance (cubic easing for smooth falloff)
            const influence = 1 - (distance / CONFIG.mouseRadius);
            const easedInfluence = Math.pow(influence, 2);

            // Push dots outward from mouse - ONLY repulsion, no size/color change
            const angle = Math.atan2(dy, dx);
            const pushDistance = easedInfluence * CONFIG.repulsionStrength;
            dot.targetOffsetX = Math.cos(angle) * pushDistance;
            dot.targetOffsetY = Math.sin(angle) * pushDistance;

            // ACTIVATION! (Orange Energy)
            dot.energy = 1;
            dot.optimized = false; // Reset optimization if disturbed
            dot.optimizeTime = 0;
            // Visual jitter/vibrate for energy?
            dot.targetOffsetX += (Math.random() - 0.5) * 5;
            dot.targetOffsetY += (Math.random() - 0.5) * 5;

        } else if (rippleEffect > 0) {
            // Subtle ripple repulsion effect
            const rippleDx = dot.baseX - ripples[0]?.x || 0;
            const rippleDy = dot.baseY - ripples[0]?.y || 0;
            const rippleAngle = Math.atan2(rippleDy, rippleDx);
            const ripplePush = rippleEffect * CONFIG.repulsionStrength * 0.5;
            dot.targetOffsetX = Math.cos(rippleAngle) * ripplePush;
            dot.targetOffsetY = Math.sin(rippleAngle) * ripplePush;
            dot.targetSize = CONFIG.baseDotSize;
            dot.targetColor = CONFIG.dotColor;

        } else if (sprite && sprite.state === 'REPAIRING' && sprite.targetDot === dot) {
            // If the sprite is repairing this specific dot
            // We don't want it to reset, but to be influenced by the repair
            // The actual repair action (snapping back) is handled in sprite.draw()
            // Here, we just prevent it from resetting to default immediately
            // and potentially give it a slight pull towards its base position.
            const repairInfluence = 0.5; // How much repair pulls it back
            dot.targetOffsetX = dot.offsetX * (1 - repairInfluence);
            dot.targetOffsetY = dot.offsetY * (1 - repairInfluence);
            dot.targetSize = CONFIG.baseDotSize;
            dot.targetColor = '#00D4AA'; // Repair color hint
            dot.targetAlpha = 0.8;

        } else {
            // Reset to default
            dot.reset();
        }
    });
}

// ─────────────────────────────────────────────────────────────────────
// Draw Connections (Tailor Made Effect)
// ─────────────────────────────────────────────────────────────────────
function drawConnections() {
    ctx.strokeStyle = CONFIG.lineColor;
    ctx.lineWidth = 1;

    for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // Right neighbor
        // Check if next dot exists and is in the same row
        if (dots[i + 1] && dots[i + 1].row === dot.row) {
            drawLine(dot, dots[i + 1]);
        }

        // Bottom neighbor
        // Check if dot below exists
        if (dots[i + gridCols]) {
            drawLine(dot, dots[i + gridCols]);
        }
    }
}

function drawLine(dot1, dot2) {
    const dx = dot1.x - dot2.x;
    const dy = dot1.y - dot2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Calculate tension (stretch)
    const stretch = dist / CONFIG.dotSpacing;

    if (stretch >= CONFIG.lineTension) {
        return; // Line broken
    }

    // 1. Ghost Thread Base Alpha
    let baseAlpha = CONFIG.lineOpacity * (1 - (stretch - 1) / (CONFIG.lineTension - 1));
    baseAlpha = Math.max(0, Math.min(CONFIG.lineOpacity, baseAlpha));

    // 2. Active Repair Glow (The Flash)
    const disp1 = Math.sqrt(dot1.offsetX * dot1.offsetX + dot1.offsetY * dot1.offsetY);
    const disp2 = Math.sqrt(dot2.offsetX * dot2.offsetX + dot2.offsetY * dot2.offsetY);
    const avgDisp = (disp1 + disp2) / 2;

    // Boosted glow sensitivity
    const glow = Math.min(1.0, avgDisp * 0.05); // More sensitive (0.02 -> 0.05)

    let finalAlpha = baseAlpha + glow;
    finalAlpha *= Math.min(dot1.alpha, dot2.alpha) * 4;

    if (finalAlpha > 0.01) {
        ctx.beginPath();

        // Dynamic styling based on glow intensity
        if (glow > 0.1) {
            // REPAIR STATE: "Daha Mutlu" Gradient Effect (Orange -> Purple -> Cyan)
            const gradient = ctx.createLinearGradient(dot1.x, dot1.y, dot2.x, dot2.y);
            gradient.addColorStop(0, '#FF6B35'); // Orange
            gradient.addColorStop(0.5, '#7C3AED'); // Purple (Middle)
            gradient.addColorStop(1, '#00D4AA'); // Cyan

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.2; // Very thin and elegant
            ctx.setLineDash([]); // Solid line

            // Reduced opacity for subtle, "faint" elegance
            ctx.globalAlpha = Math.min(0.9, finalAlpha * 1.0);

        } else {
            // RESTING STATE: Ghost thread
            ctx.strokeStyle = CONFIG.lineColor;
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 8]); // Dashed aesthetic
            ctx.globalAlpha = finalAlpha;
        }

        ctx.moveTo(dot1.x, dot1.y);
        ctx.lineTo(dot2.x, dot2.y);
        ctx.stroke();

        // Reset properties
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
        ctx.strokeStyle = CONFIG.lineColor;
    }
}



// ─────────────────────────────────────────────────────────────────────
// Draw Flow Connections - Lines between dots affected by click wave
// ─────────────────────────────────────────────────────────────────────
function drawFlowConnections() {
    if (flowWaves.length === 0) return;

    flowWaves.forEach(wave => {
        const affectedDots = [];

        // Find dots within the wave ring
        dots.forEach(dot => {
            const dx = dot.baseX - wave.x;
            const dy = dot.baseY - wave.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const influence = wave.getInfluence(distance);

            if (influence > 0.1) {
                affectedDots.push({ dot, influence, distance });
            }
        });

        // Sort by distance for flowing effect
        affectedDots.sort((a, b) => a.distance - b.distance);

        // Draw connections between adjacent affected dots
        for (let i = 0; i < affectedDots.length - 1; i++) {
            const current = affectedDots[i];
            const next = affectedDots[i + 1];
            const dot1 = current.dot;
            const dot2 = next.dot;
            const distance = Math.sqrt(
                Math.pow(dot1.x - dot2.x, 2) + Math.pow(dot1.y - dot2.y, 2)
            );

            // Only connect if reasonable distance
            if (distance < CONFIG.dotSpacing * 2.5) {
                const alpha = (1 - distance / (CONFIG.dotSpacing * 2.5)) * 0.15;

                // Create gradient line
                const gradient = ctx.createLinearGradient(dot1.x, dot1.y, dot2.x, dot2.y);
                gradient.addColorStop(0, dot1.color);
                gradient.addColorStop(1, dot2.color);

                ctx.beginPath();
                ctx.moveTo(dot1.x, dot1.y);
                ctx.lineTo(dot2.x, dot2.y);
                ctx.strokeStyle = gradient;
                ctx.globalAlpha = alpha;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    });
}

// ─────────────────────────────────────────────────────────────────────
// Resize Handler
// ─────────────────────────────────────────────────────────────────────
function handleResize() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) {
        console.error('❌ Hero section not found!');
        return;
    }

    canvas.width = heroSection.offsetWidth;
    canvas.height = heroSection.offsetHeight;

    console.log('📐 Canvas resized to:', canvas.width, 'x', canvas.height);
    console.log('📐 Canvas resized to:', canvas.width, 'x', canvas.height);
    // INIT LISTENERS -> V10 Button Tracking


    createDots();
    // Initial DOM Track

    // Re-init sprite on resize - ONLY ON DESKTOP
    checkMobile();
    if (!isMobile) {
        sprite = new GridSprite();
        sprite.updateExclusionZone(); // Update exclusions
    } else {
        sprite = null; // Explicitly clear sprite on mobile
    }
}

// ─────────────────────────────────────────────────────────────────────
// Initialize
// ─────────────────────────────────────────────────────────────────────
export function initHeroCanvas() {
    console.log('🔵 initHeroCanvas() called');
    
    // Prevent multiple initializations (which cause speed multiplication)
    if (isInitialized) {
        console.log('⚠️ HeroCanvas already initialized, calling handleResize instead');
        handleResize();
        return;
    }
    
    // Check mobile status first
    checkMobile();
    console.log('📱 Mobile status:', isMobile);

    canvas = document.getElementById('hero-canvas');
    console.log('🔵 Canvas element:', canvas);

    if (!canvas) {
        console.error('❌ Canvas element #hero-canvas not found!');
        return;
    }

    ctx = canvas.getContext('2d');
    console.log('🔵 Canvas context:', ctx);

    // MOBILE: Simplified initialization - only horizontal lines
    if (isMobile) {
        console.log('📱 Mobile mode - simplified canvas with horizontal lines only');
        
        // Simple resize handler for mobile
        const mobileResize = () => {
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                canvas.width = heroSection.offsetWidth;
                canvas.height = heroSection.offsetHeight;
            }
        };
        
        mobileResize();
        window.addEventListener('resize', mobileResize);
        
        // Simple animation loop for mobile - just horizontal lines
        function mobileAnimate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawHorizontalLines();
            animationId = requestAnimationFrame(mobileAnimate);
        }
        
        mobileAnimate();
        isInitialized = true;
        console.log('📱 Mobile hero canvas initialized (horizontal lines only)');
        return; // Exit early - no fancy effects on mobile
    }

    // DESKTOP: Full initialization with all effects
    // Delay initial setup to ensure DOM is fully rendered
    // This fixes the robot starting position issue on page load
    requestAnimationFrame(() => {
        setTimeout(() => {
            // Set canvas size
            handleResize();
            
            // Re-initialize sprite with correct positions after DOM is ready
            if (!isMobile && sprite) {
                sprite.updateExclusionZone();
                sprite.init();
            }
        }, 100);
    });
    
    window.addEventListener('resize', handleResize);

    // Mouse tracking
    const heroSection = document.querySelector('.hero');
    console.log('🔵 Hero section:', heroSection);

    // RE-ENABLED MOUSE TRACKING
    heroSection.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    });

    heroSection.addEventListener('mouseenter', () => {
        mouse.active = true;
    });

    heroSection.addEventListener('mouseleave', () => {
        mouse.active = false;
        mouse.x = -1000;
        mouse.y = -1000;
    });

    // Click for ripple effect AND catch robot
    heroSection.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if robot hit?
        if (sprite && !sprite.isFainted) {
            const dist = Math.sqrt(Math.pow(x - sprite.x, 2) + Math.pow(y - sprite.y, 2));
            if (dist < 40) { // Hitbox
                console.log('😵 Robot FAINTED!');
                sprite.isFainted = true;
                sprite.faintTimer = 3000; // 3 seconds nap
                // sprite.trail = []; // Don't clear trail on faint
            }
        }

        ripples.push(new Ripple(x, y));
        flowWaves.push(new FlowWave(x, y));  // Flow connection effect
    });

    // Touch support - ONLY on desktop, disabled on mobile to allow native scrolling
    if (!isMobile) {
        heroSection.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            mouse.x = touch.clientX - rect.left;
            mouse.y = touch.clientY - rect.top;
            mouse.active = true;
        }, { passive: false });

        heroSection.addEventListener('touchstart', (e) => {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            mouse.x = touch.clientX - rect.left;
            mouse.y = touch.clientY - rect.top;
            mouse.active = true;
            ripples.push(new Ripple(mouse.x, mouse.y));
            flowWaves.push(new FlowWave(mouse.x, mouse.y));  // Flow connection effect
        });

        heroSection.addEventListener('touchend', () => {
            mouse.active = false;
        });
    }

    // ─────────────────────────────────────────────────────────────────────
    // Animation Loop
    // ─────────────────────────────────────────────────────────────────────
    function animate(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // MOBILE: Only draw horizontal lines, skip everything else
        if (isMobile) {
            drawHorizontalLines();
            animationId = requestAnimationFrame(animate);
            return;
        }

        // ─── X-RAY LOGIC ───
        const now = Date.now();
        // X-RAY RESTRICTION: ONLY ON PAGE 1 (DOTS MODE)
        if (visualMode === 'DOTS' && !xRayState.active && now > xRayState.nextTrigger) {
            // ACTIVATE X-RAY
            console.log('💀 X-Ray ON');
            xRayState.active = true;
            xRayState.endTime = now + xRayState.duration;
            xRayState.nextTrigger = now + xRayState.interval;

            // ─── INIT DYNAMIC DATA ───
            xRayState.ghosts = [];
            xRayState.cables = [];
            xRayState.scanX = 0;

            // 1. Spawn Working Ghosts (Swarm)
            const ghostCount = 80;
            for (let i = 0; i < ghostCount; i++) {
                if (gridCols > 4 && gridRows > 4) {
                    const r = Math.floor(Math.random() * (gridRows - 4)) + 2;
                    const c = Math.floor(Math.random() * (gridCols - 4)) + 2;
                    const dot = dots[r * gridCols + c];
                    // Pick a neighbor to move towards
                    const neighbors = [
                        dots[(r + 1) * gridCols + c], dots[(r - 1) * gridCols + c],
                        dots[r * gridCols + c + 1], dots[r * gridCols + c - 1]
                    ].filter(n => n);
                    const target = neighbors.length ? neighbors[Math.floor(Math.random() * neighbors.length)] : dot;

                    if (dot) {
                        xRayState.ghosts.push({
                            x: dot.x, y: dot.y,
                            targetX: target.x, targetY: target.y,
                            progress: 0,
                            speed: 0.02 + Math.random() * 0.04, // Varied speed
                            color: Math.random() > 0.5 ? '#00D4AA' : '#7C3AED'
                        });
                    }
                }
            }

            // 2. Generate Data Cables (Network)
            const cableCount = 150;
            for (let i = 0; i < cableCount; i++) {
                if (dots.length > 2) {
                    const d1 = dots[Math.floor(Math.random() * dots.length)];
                    // Find a closer dot for realistic cabling, not random across screen
                    // Simple hack: Pick random, if too far pick another.
                    let d2 = dots[Math.floor(Math.random() * dots.length)];
                    let dist = Math.sqrt(Math.pow(d1.x - d2.x, 2) + Math.pow(d1.y - d2.y, 2));
                    if (dist > 300) d2 = dots[Math.floor(Math.random() * dots.length)]; // Try once more to get closer

                    xRayState.cables.push({
                        start: d1, end: d2,
                        offset: Math.random(), // Random start phase
                        speed: 0.005 + Math.random() * 0.01 // Flow speed
                    });
                }
            }

        } else if (xRayState.active && (now > xRayState.endTime || visualMode !== 'DOTS')) {
            // DEACTIVATE (Time up OR Left Page 1)
            console.log('🛑 X-Ray OFF');
            xRayState.active = false;
            xRayState.ghosts = [];
            xRayState.cables = [];
        }

        // Draw X-Ray Background (Swarm & Data)
        if (xRayState.active) {
            ctx.save();
            // Darken background slightly for contrast?
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; // Dark Overlay
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // ─── DRAW DATA CABLES (Animated) ───
            ctx.lineWidth = 1;
            xRayState.cables.forEach(cable => {
                // Static Line (Faint)
                ctx.strokeStyle = 'rgba(0, 212, 170, 0.1)';
                ctx.beginPath();
                ctx.moveTo(cable.start.x, cable.start.y);
                ctx.lineTo(cable.end.x, cable.end.y);
                ctx.stroke();

                // Moving Data Packet
                cable.offset += cable.speed;
                const p = cable.offset % 1; // Loop 0 to 1
                const x = cable.start.x + (cable.end.x - cable.start.x) * p;
                const y = cable.start.y + (cable.end.y - cable.start.y) * p;

                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#00D4AA';
                ctx.shadowBlur = 4;
                ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            });

            // ─── DRAW WORKING GHOSTS (Animated) ───
            xRayState.ghosts.forEach(ghost => {
                // Animate Movement
                ghost.progress += ghost.speed;
                let t = ghost.progress;
                if (t > 1) {
                    // Ping pong or loop? Let's just loop for simplicity
                    t = t % 1;
                    // Ideally we'd pick a new target, but simple loop is cleaner for now
                    // Or reverse:
                    const cycle = Math.floor(ghost.progress);
                    if (cycle % 2 === 1) t = 1 - (ghost.progress % 1); // Return trip
                    else t = ghost.progress % 1;
                }

                // Lerp Position
                const curX = ghost.x + (ghost.targetX - ghost.x) * t;
                const curY = ghost.y + (ghost.targetY - ghost.y) * t;

                ctx.fillStyle = ghost.color;
                ctx.globalAlpha = 0.8;

                // Draw Robot
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(curX - 9, curY - 14, 18, 16, 4);
                else ctx.rect(curX - 9, curY - 14, 18, 16);
                ctx.fill();

                // Eyes
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(curX - 3, curY - 6, 1.5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(curX + 3, curY - 6, 1.5, 0, Math.PI * 2); ctx.fill();
            });

            // ─── DRAW SCANLINE ───
            // 1 Second Duration regardless of FPS
            // Speed = Width per second
            // Move = (Speed * deltaTime) / 1000
            xRayState.scanX += (canvas.width * deltaTime) / 1000;

            // ONE PASS ONLY LOGIC
            if (xRayState.scanX > canvas.width + 100) {
                // Scan complete - Turn off X-Ray immediately for single pass feel
                xRayState.active = false;
                xRayState.nextTrigger = Date.now() + xRayState.interval; // Reset timer for next random trigger
                console.log('🏁 X-Ray Scan Complete');
            }

            const sx = xRayState.scanX;
            const grad = ctx.createLinearGradient(sx, 0, sx + 50, 0);
            grad.addColorStop(0, 'rgba(0, 212, 170, 0)');
            grad.addColorStop(0.5, 'rgba(0, 212, 170, 0.4)');
            grad.addColorStop(1, 'rgba(0, 212, 170, 0)');

            ctx.fillStyle = grad;
            ctx.fillRect(sx, 0, 50, canvas.height);

            // Scanline Border
            ctx.strokeStyle = 'rgba(0, 212, 170, 0.8)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(sx + 25, 0); ctx.lineTo(sx + 25, canvas.height); ctx.stroke();

            ctx.restore();
        }

        // Update Mouse Interactions
        updateMouseInteractions();

        // Draw Grid Lines (Optimization: Only near mouse or active areas)
        if (!xRayState.active && gridCols > 0 && gridRows > 0) {
            // Only draw faint lines when NOT in X-Ray mode
        }

        // Update & Draw Dots OR Lines
        if (visualMode === 'DOTS') {
            dots.forEach(dot => {
                dot.update(deltaTime);
                dot.draw();
            });
            // Robot only active in DOTS mode AND on desktop
            if (sprite && !isMobile) {
                sprite.update();
                sprite.draw();
            }
        } else if (visualMode === 'LINES') {
            // Force disable XRay if we are in LINES mode
            if (xRayState.active) {
                xRayState.active = false;
            }

            drawHorizontalLines();
            // updateFlowIcons(); // DISABLED FOR SECTOR GRID REDESIGN
        }

        // Draw Flows, Ripples, Workflows
        ripples.forEach((ripple, index) => {
            ripple.update();
            if (ripple.complete) ripples.splice(index, 1);
        });
        flowWaves.forEach((wave, index) => {
            wave.update();
            if (wave.complete) flowWaves.splice(index, 1);
        });
        workflows.forEach((flow, index) => {
            flow.update();
            flow.draw();
            if (flow.complete) workflows.splice(index, 1);
        });
        resources.forEach((res, index) => {
            res.update();
            res.draw();
            if (res.life <= 0) resources.splice(index, 1);
        });

        if (resources.length > 0) { // Only checking length to keep existing logic valid if needed
            resources.forEach((res, index) => {
                res.update();
                res.draw();
                if (res.life <= 0) resources.splice(index, 1);
            });
        }

        // Sprite drawn inside visualMode check above now


        animationId = requestAnimationFrame(animate);
    }

    animate(0);
    isInitialized = true; // Mark as initialized
    console.log('🎨 Interactive dot grid initialized');
}


function drawHorizontalLines() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'; // Slate-400 equivalent with opacity

    const rows = Math.ceil(canvas.height / CONFIG.dotSpacing);
    const startY = (canvas.height - (rows - 1) * CONFIG.dotSpacing) / 2;

    for (let i = 0; i < rows; i++) {
        const y = startY + i * CONFIG.dotSpacing;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function updateFlowIcons() {
    // Spawn random icons
    if (Math.random() < 0.05) {
        const rows = Math.ceil(canvas.height / CONFIG.dotSpacing);
        const startY = (canvas.height - (rows - 1) * CONFIG.dotSpacing) / 2;
        const randomRow = Math.floor(Math.random() * rows);
        const y = startY + randomRow * CONFIG.dotSpacing;
        flowIcons.push(new FlowIcon(y));
    }

    flowIcons = flowIcons.filter(icon => {
        icon.update();
        icon.draw();
        return !icon.complete;
    });
}

export function setCanvasMode(mode) {
    if (mode === visualMode) return;
    console.log(`🎨 Canvas Mode Switched: ${mode}`);
    visualMode = mode;

    if (mode === 'LINES') {
        // Force disable XRay immediately
        xRayState.active = false;
        xRayState.ghosts = [];
        xRayState.cables = [];
        xRayState.scanX = 0;
    } else {
        // Reset to dots
        flowIcons = [];
    }
}

// ─────────────────────────────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────────────────────────────
export function destroyHeroCanvas() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    dots = [];
    ripples = [];
    explosions = [];
}
export function setRobotMode(mode) {
    if (mode === 'HERO' || mode === 'SECTORS') {
        robotMode = mode;
        console.log(`🤖 Robot Mode Set: ${mode}`);
    }
}
