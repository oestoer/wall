/**
 * Storage management for Wall Line Calculator
 */

const STORAGE_KEYS = {
    INPUTS: 'wallCalculatorInputs',
    ROOMS: 'wallCalculatorRooms',
    THEME: 'wallCalculatorTheme'
};

/**
 * Save current inputs to localStorage
 * @param {Object} inputs - The input values to save
 */
export function saveInputs(inputs) {
    localStorage.setItem(STORAGE_KEYS.INPUTS, JSON.stringify(inputs));
}

/**
 * Load inputs from localStorage
 * @returns {Object|null} - The saved inputs or null if none
 */
export function loadInputs() {
    const savedInputs = localStorage.getItem(STORAGE_KEYS.INPUTS);
    return savedInputs ? JSON.parse(savedInputs) : null;
}

/**
 * Clear saved inputs
 */
export function clearInputs() {
    localStorage.removeItem(STORAGE_KEYS.INPUTS);
}

/**
 * Save room configuration to localStorage
 * @param {string} roomName - The name of the room
 * @param {Object} config - The configuration object
 * @returns {boolean} - True if saved successfully, false if limit reached
 */
export function saveRoom(roomName, config) {
    const savedRooms = getRooms();

    // Check if we already have 10 rooms and this is a new room
    if (Object.keys(savedRooms).length >= 10 && !savedRooms[roomName]) {
        return false;
    }

    // Add or update the room
    savedRooms[roomName] = config;

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(savedRooms));
    return true;
}

/**
 * Get all saved rooms from localStorage
 * @returns {Object} - Map of room names to configurations
 */
export function getRooms() {
    const savedRoomsJson = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return savedRoomsJson ? JSON.parse(savedRoomsJson) : {};
}

/**
 * Delete room from localStorage
 * @param {string} roomName - The name of the room to delete
 * @returns {boolean} - True if deleted, false if not found
 */
export function deleteRoom(roomName) {
    const savedRooms = getRooms();

    if (savedRooms[roomName]) {
        delete savedRooms[roomName];
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(savedRooms));
        return true;
    }

    return false;
}

/**
 * Clear all saved rooms
 */
export function clearRooms() {
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
}

/**
 * Save theme preference
 * @param {string} theme - 'light', 'dark', or 'auto'
 */
export function saveTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

/**
 * Load theme preference
 * @returns {string} - 'light', 'dark', or 'auto' (default)
 */
export function loadTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'auto';
}
