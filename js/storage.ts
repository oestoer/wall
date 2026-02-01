/**
 * Storage management for Wall Line Calculator
 */

const STORAGE_KEYS = {
    INPUTS: 'wallCalculatorInputs',
    ROOMS: 'wallCalculatorRooms',
    THEME: 'wallCalculatorTheme'
};

export interface SavedInputs {
    [key: string]: any;
}

export interface RoomConfig {
    [key: string]: any;
    wallLength: string | number;
    wallHeight: string | number;
}

export interface SavedRooms {
    [roomName: string]: RoomConfig;
}

/**
 * Save current inputs to localStorage
 */
export function saveInputs(inputs: SavedInputs): void {
    localStorage.setItem(STORAGE_KEYS.INPUTS, JSON.stringify(inputs));
}

/**
 * Load inputs from localStorage
 */
export function loadInputs(): SavedInputs | null {
    const savedInputs = localStorage.getItem(STORAGE_KEYS.INPUTS);
    return savedInputs ? JSON.parse(savedInputs) : null;
}

/**
 * Clear saved inputs
 */
export function clearInputs(): void {
    localStorage.removeItem(STORAGE_KEYS.INPUTS);
}

/**
 * Save room configuration to localStorage
 */
export function saveRoom(roomName: string, config: RoomConfig): boolean {
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
 */
export function getRooms(): SavedRooms {
    const savedRoomsJson = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return savedRoomsJson ? JSON.parse(savedRoomsJson) : {};
}

/**
 * Delete room from localStorage
 */
export function deleteRoom(roomName: string): boolean {
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
export function clearRooms(): void {
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
}

/**
 * Save theme preference
 */
export function saveTheme(theme: string): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

/**
 * Load theme preference
 */
export function loadTheme(): string {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'auto';
}
