import { Game } from './game.js';

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);
    
    // Setup control buttons
    const pauseBtn = document.getElementById('pauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const debugBtn = document.getElementById('debugBtn');
    const fpsBtn = document.getElementById('fpsBtn');
    
    pauseBtn.addEventListener('click', () => {
        game.togglePause();
        pauseBtn.textContent = game.isPaused ? 'Resume' : 'Pause';
    });
    
    muteBtn.addEventListener('click', () => {
        game.toggleMute();
        muteBtn.textContent = game.isMuted ? 'Unmute' : 'Mute';
    });
    
    debugBtn.addEventListener('click', () => {
        game.toggleDebug();
        debugBtn.textContent = game.debugMode ? 'Debug: ON' : 'Debug';
    });
    
    fpsBtn.addEventListener('click', () => {
        game.toggleFPS();
        fpsBtn.textContent = game.showFPS ? 'FPS: ON' : 'FPS';
    });
    
    // Start the game
    game.start();
});