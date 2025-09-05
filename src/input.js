export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mousePressed = false;
        this.touchPressed = false;
        this.lastFlapTime = 0;
        this.flapCooldown = 100; // ms to prevent multi-flap
        
        // Callbacks
        this.onFlap = null;
        this.onPause = null;
        this.onDebug = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Touch events (with passive listeners for better performance)
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Prevent context menu on long press
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
        
        switch (e.code) {
            case 'Space':
            case 'ArrowUp':
            case 'KeyW':
                e.preventDefault();
                this.triggerFlap();
                break;
            case 'KeyP':
                e.preventDefault();
                this.triggerPause();
                break;
            case 'KeyD':
                e.preventDefault();
                this.triggerDebug();
                break;
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    handleMouseDown(e) {
        e.preventDefault();
        this.mousePressed = true;
        this.triggerFlap();
    }
    
    handleMouseUp(e) {
        e.preventDefault();
        this.mousePressed = false;
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        this.touchPressed = true;
        this.triggerFlap();
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.touchPressed = false;
    }
    
    triggerFlap() {
        const now = Date.now();
        if (now - this.lastFlapTime > this.flapCooldown) {
            this.lastFlapTime = now;
            if (this.onFlap) {
                this.onFlap();
            }
        }
    }
    
    triggerPause() {
        if (this.onPause) {
            this.onPause();
        }
    }
    
    triggerDebug() {
        if (this.onDebug) {
            this.onDebug();
        }
    }
    
    update() {
        // Update any continuous input states here if needed
    }
    
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }
}