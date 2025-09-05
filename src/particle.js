export class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.life = 0;
        this.maxLife = 0;
        this.size = 0;
        this.color = '#fff';
        this.active = false;
        this.gravity = 400;
        this.decay = 0.98;
    }
    
    setup(x, y, vx, vy, life, size, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.color = color;
        this.active = true;
    }
    
    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += this.gravity * deltaTime;
        this.vx *= this.decay;
        this.life -= deltaTime;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        const currentSize = this.size * alpha;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.active = [];
        this.maxParticles = 100;
    }
    
    get() {
        let particle = this.particles.find(p => !p.active);
        if (!particle) {
            if (this.particles.length < this.maxParticles) {
                particle = new Particle();
                this.particles.push(particle);
            } else {
                // Reuse oldest active particle
                particle = this.active[0];
            }
        }
        
        particle.active = true;
        if (!this.active.includes(particle)) {
            this.active.push(particle);
        }
        return particle;
    }
    
    release(particle) {
        particle.active = false;
        const index = this.active.indexOf(particle);
        if (index !== -1) {
            this.active.splice(index, 1);
        }
    }
    
    burst(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 50;
            const life = 0.3 + Math.random() * 0.4;
            const size = 2 + Math.random() * 3;
            
            const particle = this.get();
            particle.setup(x, y, vx, vy, life, size, color);
        }
    }
    
    explosion(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 120;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 0.5 + Math.random() * 0.8;
            const size = 3 + Math.random() * 4;
            
            const particle = this.get();
            particle.setup(x, y, vx, vy, life, size, color);
        }
    }
    
    update(deltaTime) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const particle = this.active[i];
            particle.update(deltaTime);
            
            if (!particle.active) {
                this.release(particle);
            }
        }
    }
    
    render(ctx) {
        for (let particle of this.active) {
            particle.render(ctx);
        }
    }
    
    clear() {
        for (let particle of this.active) {
            particle.active = false;
        }
        this.active = [];
    }
}