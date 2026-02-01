import { initTheme } from './theme';
import { UIManager } from './ui-manager';
import { loadTheme } from './storage';
import '../components/color-picker'; // Register web component

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    const savedTheme = loadTheme();
    initTheme(savedTheme);

    // Initialize UI Manager (handles all app logic)
    new UIManager();

    // Explicitly importing types just to make sure they are included in compilation if needed
    console.log('Wall Line Calculator initialized with TypeScript');
});
