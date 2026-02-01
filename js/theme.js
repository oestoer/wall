/**
 * Theme management for Wall Line Calculator
 */
import { saveTheme } from './storage.js';

/**
 * Apply theme to the document
 * @param {string} theme - 'light', 'dark', or 'auto'
 */
export function applyTheme(theme) {
    const html = document.documentElement;

    // First remove all theme classes
    html.classList.remove('theme-light', 'theme-dark');

    // Then apply the selected theme
    if (theme === 'light') {
        html.classList.add('theme-light');
        console.log('Applied light theme');
    } else if (theme === 'dark') {
        html.classList.add('theme-dark');
        console.log('Applied dark theme');
    } else {
        console.log('Using system preference theme (auto)');
    }
}

/**
 * Initialize theme functionality
 * @param {string} initialTheme - The theme to start with
 * @returns {Function} - Cleanup function
 */
export function initTheme(initialTheme) {
    const themeSelect = document.getElementById('theme-select');

    if (themeSelect) {
        themeSelect.value = initialTheme;

        themeSelect.addEventListener('change', function () {
            const theme = themeSelect.value;
            saveTheme(theme);
            applyTheme(theme);
        });
    }

    applyTheme(initialTheme);

    // Detect system preference changes
    if (window.matchMedia) {
        const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e) => {
            if (themeSelect && themeSelect.value === 'auto') {
                console.log(`System theme preference changed to: ${e.matches ? 'dark' : 'light'}`);
            }
        };

        colorSchemeQuery.addEventListener('change', listener);

        // Return cleanup function
        return () => colorSchemeQuery.removeEventListener('change', listener);
    }

    return () => { };
}
