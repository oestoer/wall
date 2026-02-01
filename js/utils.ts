/**
 * Utility functions for Wall Line Calculator
 */

/**
 * Debounce function to limit how often a function can fire
 */
export function debounce(func: Function, wait: number = 300): (...args: any[]) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Helper function to adjust a hex color's brightness
 */
export function adjustColor(color: string, percent: number): string {
    // Remove hash if present
    const hex = color.replace('#', '');

    // Parse hex values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Adjust brightness
    r = Math.max(0, Math.min(255, r + percent));
    g = Math.max(0, Math.min(255, g + percent));
    b = Math.max(0, Math.min(255, b + percent));

    // Convert back to hex
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
