import { Bird } from './bird.js';
import { PipePool } from './pipe.js';
import { ParticleSystem } from './particle.js';
import { AudioManager } from './audio.js';
import { InputManager } from './input.js';
import { UIManager } from './ui.js';
import { CollisionDetector } from './collision.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Virtual game dimensions
        this.VIRTUAL_WIDTH = 288;
        this.VIRTUAL_HEIGHT = 512;
        
        // Game state
        this.state = 'TITLE'; // TITLE, PLAYING, PAUSED, GAME_OVER
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('flappyBirdBest') || '0');
        
        // Timing
        this.lastTime = 0;
        this.accumulator = 0;
        this.targetDT = 1/60; // 60 FPS
        
        // Game settings
        this.isPaused = false;
        this.isMuted = localStorage.getItem('flappyBirdMuted') === 'true';
        this.debugMode = false;
        this.showFPS = false;
        this.slowMotion = false;
        
        // FPS tracking
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        
        // Camera shake
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeMagnitude = 0;
        this.shakeDecay = 0.9;
        
        // Game objects
        this.bird = new Bird(this.VIRTUAL_WIDTH * 0.2, this.VIRTUAL_HEIGHT * 0.5);
        this.pipePool = new PipePool();
        this.particles = new ParticleSystem();
        this.audio = new AudioManager(this.isMuted);
        this.input = new InputManager(canvas);
        this.ui = new UIManager(this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT);
        this.collision = new CollisionDetector();
        
        // Pipe spawning
        this.pipeSpawnTimer = 0;
        this.pipeSpawnInterval = 1.25;
        
        // Background scrolling
        this.groundOffset = 0;
        this.bgOffset = 0;
        
        this.setupCanvas();
        this.setupInputHandlers();
    }
    
    setupCanvas() {
        const pixelRatio = window.devicePixelRatio || 1;
        const aspectRatio = this.VIRTUAL_WIDTH / this.VIRTUAL_HEIGHT;
        
        // Calculate size to fit viewport while maintaining aspect ratio
        const maxWidth = Math.min(window.innerWidth * 0.9, 600);
        const maxHeight = window.innerHeight * 0.8;
        
        let displayWidth = maxWidth;
        let displayHeight = maxWidth / aspectRatio;
        
        if (displayHeight > maxHeight) {
            displayHeight = maxHeight;
            displayWidth = maxHeight * aspectRatio;
        }
        
        // Set display size
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
        
        // Set actual size with pixel ratio
        this.canvas.width = displayWidth * pixelRatio;
        this.canvas.height = displayHeight * pixelRatio;
        
        // Scale context to match virtual coordinates
        this.scaleX = this.canvas.width / this.VIRTUAL_WIDTH;
        this.scaleY = this.canvas.height / this.VIRTUAL_HEIGHT;
        
        this.ctx.scale(this.scaleX, this.scaleY);
        this.ctx.imageSmoothingEnabled = false;
        
        // Handle resize
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    setupInputHandlers() {
        this.input.onFlap = () => {
            if (this.state === 'TITLE') {
                this.startGame();
            } else if (this.state === 'PLAYING' && !this.isPaused) {
                this.bird.flap();
                this.audio.playFlap();
                this.particles.burst(this.bird.x, this.bird.y, '#FFD700', 8);
            } else if (this.state === 'GAME_OVER') {
                this.restart();
            }
        };
        
        this.input.onPause = () => {
            if (this.state === 'PLAYING') {
                this.togglePause();
            }
        };
        
        this.input.onDebug = () => {
            this.debugMode = !this.debugMode;
            this.slowMotion = this.debugMode;
        };
    }
    
    start() {
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    
    gameLoop(currentTime) {
        requestAnimationFrame((time) => this.gameLoop(time));
        
        let deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Apply slow motion in debug mode
        if (this.slowMotion) {
            deltaTime *= 0.25;
        }
        
        // FPS calculation
        this.frameCount++;
        this.fpsTimer += deltaTime;
        if (this.fpsTimer >= 1) {
            this.fps = Math.round(this.frameCount / this.fpsTimer);
            this.frameCount = 0;
            this.fpsTimer = 0;
        }
        
        // Fixed timestep with accumulator
        this.accumulator += deltaTime;
        
        while (this.accumulator >= this.targetDT) {
            this.update(this.targetDT);
            this.accumulator -= this.targetDT;
        }
        
        this.render();
    }
    
    update(deltaTime) {
        if (this.isPaused && this.state === 'PLAYING') return;
        
        this.input.update();
        
        if (this.state === 'PLAYING') {
            this.updateGame(deltaTime);
        }
        
        // Update camera shake
        if (this.shakeMagnitude > 0.1) {
            this.shakeMagnitude *= this.shakeDecay;
            this.shakeX = (Math.random() - 0.5) * this.shakeMagnitude;
            this.shakeY = (Math.random() - 0.5) * this.shakeMagnitude;
        } else {
            this.shakeMagnitude = 0;
            this.shakeX = 0;
            this.shakeY = 0;
        }
        
        this.particles.update(deltaTime);
    }
    
    updateGame(deltaTime) {
        // Update bird physics
        this.bird.update(deltaTime);
        
        // Check ground/ceiling collision
        if (this.bird.y + this.bird.radius >= this.VIRTUAL_HEIGHT - 60 || 
            this.bird.y - this.bird.radius <= 0) {
            this.gameOver();
            return;
        }
        
        // Update pipe spawning
        this.pipeSpawnTimer += deltaTime;
        if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
            this.spawnPipe();
            this.pipeSpawnTimer = 0;
        }
        
        // Update pipes
        const activePipes = this.pipePool.getActive();
        for (let pipe of activePipes) {
            pipe.update(deltaTime);
            
            // Check pipe collision
            if (this.collision.circleAABB(this.bird, pipe)) {
                this.gameOver();
                return;
            }
            
            // Check scoring
            if (!pipe.scored && pipe.x + pipe.width < this.bird.x) {
                pipe.scored = true;
                this.score++;
                this.audio.playScore();
                this.particles.burst(this.bird.x, this.bird.y, '#00FF00', 12);
            }
            
            // Deactivate pipes that are off-screen
            if (pipe.x + pipe.width < -50) {
                this.pipePool.release(pipe);
            }
        }
        
        // Update background scrolling
        this.groundOffset += 180 * deltaTime;
        this.bgOffset += 30 * deltaTime;
        
        if (this.groundOffset >= 64) this.groundOffset = 0;
        if (this.bgOffset >= 100) this.bgOffset = 0;
    }
    
    spawnPipe() {
        // Progressive difficulty - gap gets smaller with score
        const baseGap = 160;
        const minGap = 120;
        const gapReduction = Math.min(this.score, 40); // Cap at 40 points of reduction
        const currentGap = Math.max(baseGap - gapReduction, minGap);
        
        // Random gap position with some variance
        const minY = 80;
        const maxY = this.VIRTUAL_HEIGHT - 60 - currentGap - 80;
        const gapY = minY + Math.random() * (maxY - minY);
        
        const pipe = this.pipePool.get();
        pipe.setup(this.VIRTUAL_WIDTH + 50, gapY, currentGap);
    }
    
    startGame() {
        this.state = 'PLAYING';
        this.score = 0;
        this.bird.reset(this.VIRTUAL_WIDTH * 0.2, this.VIRTUAL_HEIGHT * 0.5);
        this.pipePool.clear();
        this.particles.clear();
        this.pipeSpawnTimer = 0;
        this.shakeMagnitude = 0;
    }
    
    gameOver() {
        this.state = 'GAME_OVER';
        this.audio.playHit();
        this.addCameraShake(15);
        this.particles.explosion(this.bird.x, this.bird.y, '#FF4444', 20);
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBirdBest', this.bestScore.toString());
        }
    }
    
    restart() {
        this.startGame();
    }
    
    togglePause() {
        if (this.state === 'PLAYING') {
            this.isPaused = !this.isPaused;
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.audio.setMuted(this.isMuted);
        localStorage.setItem('flappyBirdMuted', this.isMuted.toString());
    }
    
    toggleDebug() {
        this.debugMode = !this.debugMode;
        this.slowMotion = this.debugMode;
    }
    
    toggleFPS() {
        this.showFPS = !this.showFPS;
    }
    
    addCameraShake(magnitude) {
        this.shakeMagnitude = magnitude;
    }
    
    render() {
        // Clear canvas
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        
        // Apply camera shake
        this.ctx.save();
        this.ctx.translate(this.shakeX, this.shakeY);
        
        this.renderBackground();
        this.renderPipes();
        this.bird.render(this.ctx, this.debugMode);
        this.renderGround();
        this.particles.render(this.ctx);
        this.renderUI();
        
        this.ctx.restore();
    }
    
    renderBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.VIRTUAL_HEIGHT);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT);
        
        // Parallax clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        const cloudOffset = this.bgOffset;
        for (let i = -1; i < 4; i++) {
            const x = (i * 100 - cloudOffset) % (this.VIRTUAL_WIDTH + 100);
            this.renderCloud(x, 60);
            this.renderCloud(x + 50, 100);
        }
    }
    
    renderCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 15, y, 25, 0, Math.PI * 2);
        this.ctx.arc(x + 35, y, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderPipes() {
        const activePipes = this.pipePool.getActive();
        for (let pipe of activePipes) {
            pipe.render(this.ctx, this.debugMode);
        }
    }
    
    renderGround() {
        const groundHeight = 60;
        const groundY = this.VIRTUAL_HEIGHT - groundHeight;
        
        // Ground base
        const groundGradient = this.ctx.createLinearGradient(0, groundY, 0, this.VIRTUAL_HEIGHT);
        groundGradient.addColorStop(0, '#8FBC8F');
        groundGradient.addColorStop(1, '#556B2F');
        
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, groundY, this.VIRTUAL_WIDTH, groundHeight);
        
        // Scrolling ground pattern
        this.ctx.fillStyle = '#6B8E23';
        for (let i = -1; i < Math.ceil(this.VIRTUAL_WIDTH / 64) + 1; i++) {
            const x = (i * 64 - this.groundOffset) % (this.VIRTUAL_WIDTH + 64);
            this.ctx.fillRect(x, groundY, 32, 8);
            this.ctx.fillRect(x + 16, groundY + 20, 32, 8);
        }
    }
    
    renderUI() {
        this.ui.render(this.ctx, {
            state: this.state,
            score: this.score,
            bestScore: this.bestScore,
            isPaused: this.isPaused,
            showFPS: this.showFPS,
            fps: this.fps,
            debugMode: this.debugMode
        });
    }
}