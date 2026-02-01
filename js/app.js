/**
 * Wall Line Calculator & Visualizer
 * Main application entry point
 */

import { initTheme } from './theme.js';
import { UIManager } from './ui-manager.js';
import { loadTheme } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    const savedTheme = loadTheme();
    initTheme(savedTheme);

    // Initialize UI Manager (handles all app logic)
    const uiManager = new UIManager();

    console.log('Wall Line Calculator initialized');
});
