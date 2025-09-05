export class Pipe {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 50;
        this.gap = 160;
        this.speed = 120;
        this.active = false;
        this.scored = false;
    }
    
    setup(x, gapY, gapSize) {
        this.x = x;
        this.y = gapY;
        this.gap = gapSize;
        this.active = true;
        this.scored = false;
    }
    
    update(deltaTime) {
        this.x -= this.speed * deltaTime;
    }
    
    render(ctx, debugMode = false) {
        const topHeight = this.y;
        const bottomY = this.y + this.gap;
        const bottomHeight = 512 - 60 - bottomY; // Account for ground
        
        // Pipe gradient
        const gradient = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
        gradient.addColorStop(0, '#228B22');
        gradient.addColorStop(0.5, '#32CD32');
        gradient.addColorStop(1, '#228B22');
        
        // Top pipe
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, 0, this.width, topHeight);
        
        // Top pipe cap
        const capHeight = 20;
        ctx.fillRect(this.x - 5, topHeight - capHeight, this.width + 10, capHeight);
        
        // Bottom pipe
        ctx.fillRect(this.x, bottomY, this.width, bottomHeight);
        
        // Bottom pipe cap
        ctx.fillRect(this.x - 5, bottomY, this.width + 10, capHeight);
        
        // Pipe highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(this.x + 2, 0, 6, topHeight);
        ctx.fillRect(this.x + 2, bottomY, 6, bottomHeight);
        
        // Debug collision boxes
        if (debugMode) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, 0, this.width, topHeight);
            ctx.strokeRect(this.x, bottomY, this.width, bottomHeight);
        }
    }
    
    // For collision detection - returns array of AABBs
    getCollisionBoxes() {
        const topHeight = this.y;
        const bottomY = this.y + this.gap;
        const bottomHeight = 512 - 60 - bottomY;
        
        return [
            {
                x: this.x,
                y: 0,
                width: this.width,
                height: topHeight
            },
            {
                x: this.x,
                y: bottomY,
                width: this.width,
                height: bottomHeight
            }
        ];
    }
}

export class PipePool {
    constructor() {
        this.pipes = [];
        this.active = [];
    }
    
    get() {
        let pipe = this.pipes.find(p => !p.active);
        if (!pipe) {
            pipe = new Pipe();
            this.pipes.push(pipe);
        }
        pipe.active = true;
        this.active.push(pipe);
        return pipe;
    }
    
    release(pipe) {
        pipe.active = false;
        const index = this.active.indexOf(pipe);
        if (index !== -1) {
            this.active.splice(index, 1);
        }
    }
    
    getActive() {
        return this.active;
    }
    
    clear() {
        for (let pipe of this.active) {
            pipe.active = false;
        }
        this.active = [];
    }
}