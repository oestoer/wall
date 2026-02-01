/**
 * Theme management for Wall Line Calculator
 */
import { saveTheme } from './storage';

/**
 * Apply theme to the document
 */
export function applyTheme(theme: string): void {
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
 */
export function initTheme(initialTheme: string): () => void {
    const themeSelect = document.getElementById('theme-select') as HTMLSelectElement | null;

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
        const listener = (e: MediaQueryListEvent) => {
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
