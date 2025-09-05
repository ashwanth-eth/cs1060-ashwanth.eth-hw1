export class Bird {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.radius = 12;
        this.rotation = 0;
        
        // Physics constants
        this.gravity = 1800;
        this.flapPower = -420;
        this.terminalVelocity = 900;
        this.rotationSpeed = 3;
        
        // Animation
        this.wingFrame = 0;
        this.wingTimer = 0;
        this.wingSpeed = 0.2;
        
        this.reset(x, y);
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.rotation = 0;
        this.wingFrame = 0;
        this.wingTimer = 0;
    }
    
    flap() {
        this.velocity = this.flapPower;
        this.wingFrame = 0;
        this.wingTimer = 0;
    }
    
    update(deltaTime) {
        // Apply gravity
        this.velocity += this.gravity * deltaTime;
        
        // Clamp to terminal velocity
        if (this.velocity > this.terminalVelocity) {
            this.velocity = this.terminalVelocity;
        }
        
        // Update position
        this.y += this.velocity * deltaTime;
        
        // Update rotation based on velocity
        const targetRotation = Math.max(-30, Math.min(90, this.velocity * 0.03));
        this.rotation += (targetRotation - this.rotation) * this.rotationSpeed * deltaTime;
        
        // Update wing animation
        this.wingTimer += deltaTime;
        if (this.wingTimer >= this.wingSpeed) {
            this.wingFrame = (this.wingFrame + 1) % 3;
            this.wingTimer = 0;
        }
    }
    
    render(ctx, debugMode = false) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        
        // Bird body
        const bodySize = this.radius * 1.5;
        
        // Main body (circle)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, bodySize, 0, Math.PI * 2);
        ctx.fill();
        
        // Body outline
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Wing animation
        const wingOffset = this.wingFrame * 3 - 3;
        
        // Wing
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(-bodySize * 0.3, wingOffset, bodySize * 0.6, bodySize * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(bodySize * 0.3, -bodySize * 0.3, bodySize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupil
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(bodySize * 0.4, -bodySize * 0.3, bodySize * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Beak
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.moveTo(bodySize, 0);
        ctx.lineTo(bodySize * 1.5, -bodySize * 0.2);
        ctx.lineTo(bodySize * 1.5, bodySize * 0.2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // Debug collision circle
        if (debugMode) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}