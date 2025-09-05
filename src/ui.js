export class UIManager {
    constructor(virtualWidth, virtualHeight) {
        this.virtualWidth = virtualWidth;
        this.virtualHeight = virtualHeight;
        
        // Animation states
        this.titlePulse = 0;
        this.scoreScale = 1;
        this.scoreScaleTarget = 1;
        
        // Flash effect for score
        this.flashAlpha = 0;
        this.flashDecay = 3;
    }
    
    render(ctx, gameData) {
        const { state, score, bestScore, isPaused, showFPS, fps, debugMode } = gameData;
        
        this.updateAnimations();
        
        switch (state) {
            case 'TITLE':
                this.renderTitleScreen(ctx);
                break;
            case 'PLAYING':
                this.renderGameUI(ctx, score);
                if (isPaused) {
                    this.renderPauseOverlay(ctx);
                }
                break;
            case 'GAME_OVER':
                this.renderGameUI(ctx, score);
                this.renderGameOverScreen(ctx, score, bestScore);
                break;
        }
        
        if (showFPS) {
            this.renderFPS(ctx, fps);
        }
        
        if (debugMode) {
            this.renderDebugInfo(ctx, gameData);
        }
    }
    
    updateAnimations() {
        this.titlePulse += 0.08;
        
        // Score scale animation
        this.scoreScale += (this.scoreScaleTarget - this.scoreScale) * 0.2;
        
        // Flash effect
        if (this.flashAlpha > 0) {
            this.flashAlpha -= this.flashDecay * 0.016; // ~60fps
            if (this.flashAlpha < 0) this.flashAlpha = 0;
        }
    }
    
    renderTitleScreen(ctx) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);
        
        // Title with pulsing effect
        const pulse = 1 + Math.sin(this.titlePulse) * 0.1;
        const titleSize = 36 * pulse;
        
        ctx.save();
        ctx.translate(this.virtualWidth / 2, this.virtualHeight * 0.3);
        ctx.scale(pulse, pulse);
        
        // Title shadow
        this.drawText(ctx, 'FLAPPY BIRD', 0, 2, titleSize, '#000', 'center');
        
        // Title main
        this.drawText(ctx, 'FLAPPY BIRD', 0, 0, titleSize, '#FFD700', 'center');
        
        ctx.restore();
        
        // Instructions
        const instructionY = this.virtualHeight * 0.6;
        this.drawText(ctx, 'TAP TO START', this.virtualWidth / 2, instructionY, 18, '#FFF', 'center');
        this.drawText(ctx, 'Space/Click/Tap = Flap', this.virtualWidth / 2, instructionY + 40, 14, '#CCC', 'center');
        this.drawText(ctx, 'P = Pause  •  D = Debug', this.virtualWidth / 2, instructionY + 65, 12, '#AAA', 'center');
    }
    
    renderGameUI(ctx, score) {
        // Score with scale animation
        ctx.save();
        ctx.translate(this.virtualWidth / 2, 50);
        ctx.scale(this.scoreScale, this.scoreScale);
        
        // Score shadow
        this.drawText(ctx, score.toString(), 2, 2, 28, '#000', 'center');
        
        // Score main
        this.drawText(ctx, score.toString(), 0, 0, 28, '#FFF', 'center');
        
        ctx.restore();
        
        // Flash effect for scoring
        if (this.flashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
            ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);
        }
    }
    
    renderPauseOverlay(ctx) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);
        
        // Pause text
        this.drawText(ctx, 'PAUSED', this.virtualWidth / 2, this.virtualHeight / 2, 32, '#FFF', 'center');
        this.drawText(ctx, 'Press P to Resume', this.virtualWidth / 2, this.virtualHeight / 2 + 40, 16, '#CCC', 'center');
    }
    
    renderGameOverScreen(ctx, score, bestScore) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);
        
        const centerX = this.virtualWidth / 2;
        const centerY = this.virtualHeight / 2;
        
        // Game Over title
        this.drawText(ctx, 'GAME OVER', centerX, centerY - 60, 28, '#FF4444', 'center');
        
        // Score panel background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(centerX - 80, centerY - 20, 160, 80);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - 80, centerY - 20, 160, 80);
        
        // Scores
        this.drawText(ctx, `Score: ${score}`, centerX, centerY - 5, 16, '#333', 'center');
        
        if (score >= bestScore) {
            this.drawText(ctx, `NEW BEST!`, centerX, centerY + 15, 14, '#FF6B35', 'center');
        } else {
            this.drawText(ctx, `Best: ${bestScore}`, centerX, centerY + 15, 14, '#666', 'center');
        }
        
        // Restart instruction
        this.drawText(ctx, 'TAP TO RESTART', centerX, centerY + 80, 18, '#FFF', 'center');
    }
    
    renderFPS(ctx, fps) {
        this.drawText(ctx, `FPS: ${fps}`, 10, 20, 12, '#FFF', 'left');
    }
    
    renderDebugInfo(ctx, gameData) {
        let y = this.virtualHeight - 80;
        const x = 10;
        const lineHeight = 14;
        
        this.drawText(ctx, 'DEBUG MODE', x, y, 12, '#0F0', 'left');
        y += lineHeight;
        this.drawText(ctx, `State: ${gameData.state}`, x, y, 10, '#0F0', 'left');
        y += lineHeight;
        this.drawText(ctx, `Bird Y: ${Math.round(gameData.bird?.y || 0)}`, x, y, 10, '#0F0', 'left');
        y += lineHeight;
        this.drawText(ctx, `Velocity: ${Math.round(gameData.bird?.velocity || 0)}`, x, y, 10, '#0F0', 'left');
        y += lineHeight;
        this.drawText(ctx, `Active Pipes: ${gameData.activePipeCount || 0}`, x, y, 10, '#0F0', 'left');
    }
    
    drawText(ctx, text, x, y, size, color, align = 'left') {
        ctx.font = `${size}px 'Courier New', monospace`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
    }
    
    animateScore() {
        this.scoreScaleTarget = 1.3;
        setTimeout(() => {
            this.scoreScaleTarget = 1;
        }, 150);
        
        this.flashAlpha = 0.3;
    }
}