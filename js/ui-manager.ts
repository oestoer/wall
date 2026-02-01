/**
 * UI Manager for Wall Line Calculator
 * Handles DOM events, form inputs, and coordination between modules
 */

import { debounce } from './utils';
import { saveInputs, loadInputs, saveRoom, deleteRoom, getRooms, clearRooms, clearInputs, SavedInputs, RoomConfig } from './storage';
import { calculateLineConfigs, calculateWallDimensions } from './wall-model';
import { renderWall, setVisualizerError } from './visualizer';

interface RenderConfig {
    mainColor: string;
    whiteColor: string;
    showWardrobe: boolean;
    wardrobeWidth: number;
    wardrobeHeight: number;
    wardrobeOffset: number;
    wardrobeColor: string;
    showWindow: boolean;
    windowWidth: number;
    windowHeight: number;
    windowRightOffset: number;
    windowFloorOffset: number;
    windowColor: string;
}

export class UIManager {
    private form: HTMLFormElement;
    private resultDiv: HTMLElement;
    private lineConfigSelect: HTMLSelectElement;
    private inputIds: string[];
    private debouncedCalculate: () => void;
    private closeMenu?: () => void;
    private loadSavedRooms?: () => void;

    constructor() {
        this.form = document.getElementById('wallForm') as HTMLFormElement;
        this.resultDiv = document.getElementById('result') as HTMLElement;
        this.lineConfigSelect = document.getElementById('lineConfig') as HTMLSelectElement;

        // Inputs that trigger recalculation
        this.inputIds = [
            'wallLength', 'wallHeight', 'minThickness', 'maxThickness',
            'lineRatio', 'lineConfig', 'lineDirection', 'mainColor', 'whiteColor',
            'showWardrobe', 'wardrobeWidth', 'wardrobeHeight',
            'wardrobeOffset', 'wardrobeColor', 'showWindow',
            'windowWidth', 'windowHeight', 'windowRightOffset',
            'windowFloorOffset', 'windowColor'
        ];

        // Create debounced calculator
        this.debouncedCalculate = debounce(this.calculateAndVisualize.bind(this), 300);

        // Initialize
        this.init();
    }

    init(): void {
        this.loadSavedInputs();
        this.setupEventListeners();
        this.setupMenu();
        this.setupRoomManagement();
        this.calculateAndVisualize();
    }

    /**
     * Get value from form element
     */
    getValue(id: string): string | null {
        const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
        if (!element) return null;
        return element.value;
    }

    /**
     * Set value to form element
     */
    setValue(id: string, value: string): void {
        const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
        if (!element) return;
        element.value = value;
    }

    /**
     * Get checked state
     */
    getChecked(id: string): boolean {
        const element = document.getElementById(id) as HTMLInputElement | null;
        return element ? element.checked : false;
    }

    /**
     * Set checked state
     */
    setChecked(id: string, value: boolean): void {
        const element = document.getElementById(id) as HTMLInputElement | null;
        if (element) element.checked = value;
    }

    /**
     * Get float value
     */
    getFloat(id: string): number {
        return parseFloat(this.getValue(id) || '0');
    }

    /**
     * Collect all current form values
     */
    getAllValues(): SavedInputs {
        const values: SavedInputs = {};
        this.inputIds.forEach(id => {
            const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
            if (element) {
                if (element.type === 'checkbox') {
                    values[id] = (element as HTMLInputElement).checked;
                } else {
                    values[id] = element.value;
                }
            }
        });
        return values;
    }

    /**
     * Apply values to form
     */
    applyValues(values: SavedInputs | null): void {
        if (!values) return;

        Object.entries(values).forEach(([key, value]) => {
            if (this.inputIds.includes(key)) {
                const element = document.getElementById(key) as HTMLElement;
                if (element) {
                    if ((element as HTMLInputElement).type === 'checkbox') {
                        (element as HTMLInputElement).checked = value;
                        // Trigger change event for checkboxes to update visibility
                        element.dispatchEvent(new Event('change'));
                    } else {
                        (element as HTMLInputElement).value = value;
                        // For custom color picker
                        if (element.tagName.toLowerCase() === 'color-picker') {
                            element.setAttribute('value', value);
                        }
                    }
                }
            }
        });

        this.updateLineConfigOptions();
    }

    loadSavedInputs(): void {
        const savedInputs = loadInputs();
        if (savedInputs) {
            this.applyValues(savedInputs);

            // Restore line config specifically after options are updated
            if (savedInputs.lineConfig) {
                this.setValue('lineConfig', savedInputs.lineConfig);
            }
        } else {
            this.updateLineConfigOptions();
        }
    }

    setupEventListeners(): void {
        // Save inputs on change
        this.inputIds.forEach(id => {
            const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
            if (element) {
                const eventType = element.type === 'checkbox' ? 'change' : 'input';
                element.addEventListener(eventType, () => {
                    saveInputs(this.getAllValues());

                    if (['wallLength', 'wallHeight', 'minThickness', 'maxThickness', 'lineRatio', 'lineDirection'].includes(id)) {
                        this.updateLineConfigOptions();
                    }

                    // Immediate update for some, debounced for others
                    if (['lineConfig', 'showWardrobe', 'showWindow'].includes(id)) {
                        this.calculateAndVisualize();
                    } else {
                        this.debouncedCalculate();
                    }
                });
            }
        });

        // Color pickers custom event
        document.querySelectorAll('color-picker').forEach(picker => {
            picker.addEventListener('color-changed', () => {
                saveInputs(this.getAllValues());
                this.debouncedCalculate();
            });
        });

        // Form submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.form.checkValidity()) {
                this.form.classList.add('form-calculating');
                setTimeout(() => {
                    this.calculateAndVisualize();
                    this.form.classList.remove('form-calculating');
                }, 100);
            } else {
                this.form.reportValidity();
            }
        });

        // Reset button
        const resetBtn = document.querySelector('button[onclick="resetToDefaults()"]');
        if (resetBtn) {
            // Remove inline onclick handler
            resetBtn.removeAttribute('onclick');
            resetBtn.addEventListener('click', () => this.resetToDefaults());
        }

        // Thickness validation
        const minThickness = document.getElementById('minThickness') as HTMLInputElement;
        const maxThickness = document.getElementById('maxThickness') as HTMLInputElement;

        const validateThickness = () => {
            const minVal = parseFloat(minThickness.value);
            const maxVal = parseFloat(maxThickness.value);

            if (minVal && maxVal && minVal > maxVal) {
                maxThickness.setCustomValidity('Maximum thickness must be greater than or equal to minimum thickness');
                minThickness.setCustomValidity('Minimum thickness must be less than or equal to maximum thickness');
            } else {
                maxThickness.setCustomValidity('');
                minThickness.setCustomValidity('');
            }
        };

        minThickness.addEventListener('input', validateThickness);
        maxThickness.addEventListener('input', validateThickness);
    }

    updateLineConfigOptions(): void {
        const configs = calculateLineConfigs(
            this.getFloat('wallLength'),
            this.getFloat('wallHeight'),
            this.getFloat('minThickness'),
            this.getFloat('maxThickness'),
            this.getFloat('lineRatio'),
            this.getValue('lineDirection') || 'vertical'
        );

        const currentValue = this.lineConfigSelect.value;
        const lineRatio = this.getFloat('lineRatio') || 1;

        this.lineConfigSelect.innerHTML = '<option value="">Select a configuration</option>';

        configs.forEach((config) => {
            const option = document.createElement('option');
            option.value = `${config.colored},${config.white}`;

            if (lineRatio === 1) {
                option.textContent = `${config.colored} Coloured, ${config.white} White (${config.whiteLineWidth.toFixed(1)}cm thick)`;
            } else {
                option.textContent = `${config.colored} Coloured (${config.coloredLineWidth.toFixed(1)}cm), ${config.white} White (${config.whiteLineWidth.toFixed(1)}cm)`;
            }
            this.lineConfigSelect.appendChild(option);
        });

        // Restore selection if valid
        if (currentValue) {
            const optionExists = Array.from(this.lineConfigSelect.options).some(opt => opt.value === currentValue);
            if (optionExists) {
                this.lineConfigSelect.value = currentValue;
            }
        }
    }

    calculateAndVisualize(): void {
        const result = calculateWallDimensions({
            wallLengthCm: this.getFloat('wallLength'),
            wallHeightCm: this.getFloat('wallHeight'),
            lineConfigValue: this.getValue('lineConfig') || '',
            lineRatio: this.getFloat('lineRatio'),
            lineDirection: this.getValue('lineDirection') || 'vertical',
            minThickness: this.getFloat('minThickness'),
            maxThickness: this.getFloat('maxThickness')
        });

        if (!result.success || !result.data) {
            this.showResultMessage(result.error || 'Unknown error', result.type || 'error');
            setVisualizerError(true);
            return;
        }

        this.showResultMessage(result.message || 'Success', 'success');
        setVisualizerError(false);

        // Prepare config for render
        const renderConfig: RenderConfig = {
            mainColor: this.getValue('mainColor') || '#FFEEEE',
            whiteColor: this.getValue('whiteColor') || '#FFFFFF',
            showWardrobe: this.getChecked('showWardrobe'),
            wardrobeWidth: this.getFloat('wardrobeWidth'),
            wardrobeHeight: this.getFloat('wardrobeHeight'),
            wardrobeOffset: this.getFloat('wardrobeOffset'),
            wardrobeColor: this.getValue('wardrobeColor') || '#8B4513',
            showWindow: this.getChecked('showWindow'),
            windowWidth: this.getFloat('windowWidth'),
            windowHeight: this.getFloat('windowHeight'),
            windowRightOffset: this.getFloat('windowRightOffset'),
            windowFloorOffset: this.getFloat('windowFloorOffset'),
            windowColor: this.getValue('windowColor') || '#87CEEB'
        };

        renderWall(result.data, renderConfig);
    }

    showResultMessage(message: string, type: string = 'success'): void {
        this.resultDiv.textContent = message;
        this.resultDiv.className = `result-message show ${type}`;
    }

    hideResultMessage(): void {
        this.resultDiv.className = 'result-message';
    }

    resetToDefaults(): void {
        if (!confirm('Are you sure you want to reset all values to defaults? This will clear all your current settings and cannot be undone.')) {
            return;
        }

        const clearSaved = confirm('Would you also like to clear all saved rooms?');
        if (clearSaved) {
            clearRooms();
            if (this.loadSavedRooms) this.loadSavedRooms(); // Refresh list
        }

        clearInputs();

        // Reset defaults manually or reload page. Manual reset is smoother.
        this.setValue('wallLength', '485.6');
        this.setValue('wallHeight', '260');
        this.setValue('minThickness', '20');
        this.setValue('maxThickness', '45');
        this.setValue('lineRatio', '1');
        this.setValue('lineConfig', '');
        this.setValue('lineDirection', 'vertical');
        this.setValue('mainColor', '#FFEEEE');
        this.setValue('whiteColor', '#FFFFFF');
        this.setChecked('showWardrobe', false);
        this.setValue('wardrobeWidth', '64');
        this.setValue('wardrobeHeight', '200');
        this.setValue('wardrobeOffset', '0');
        this.setValue('wardrobeColor', '#8B4513');
        this.setChecked('showWindow', false);
        this.setValue('windowWidth', '120');
        this.setValue('windowHeight', '120');
        this.setValue('windowRightOffset', '100');
        this.setValue('windowFloorOffset', '100');
        this.setValue('windowColor', '#87CEEB');

        // Trigger updates
        const showWardrobe = document.getElementById('showWardrobe');
        if (showWardrobe) showWardrobe.dispatchEvent(new Event('change'));

        const showWindow = document.getElementById('showWindow');
        if (showWindow) showWindow.dispatchEvent(new Event('change'));

        this.updateLineConfigOptions();
        this.calculateAndVisualize();

        this.showResultMessage('All values reset to defaults', 'success');
        setTimeout(() => this.hideResultMessage(), 3000);
    }

    setupMenu(): void {
        const hamburgerMenu = document.getElementById('hamburger-menu') as HTMLElement;
        const sideMenu = document.getElementById('side-menu') as HTMLElement;
        const menuOverlay = document.getElementById('menu-overlay') as HTMLElement;

        const toggleMenu = () => {
            const isOpen = sideMenu.classList.contains('open');
            sideMenu.classList.toggle('open');
            menuOverlay.classList.toggle('open');
            hamburgerMenu.classList.toggle('open');

            sideMenu.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
            hamburgerMenu.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
            hamburgerMenu.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
        };

        hamburgerMenu.addEventListener('click', toggleMenu);
        menuOverlay.addEventListener('click', toggleMenu);

        // Keyboard accessibility
        hamburgerMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sideMenu.classList.contains('open')) {
                toggleMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (sideMenu.classList.contains('open')) {
                toggleMenu();
            }
        });

        // Expose close menu for internal use
        this.closeMenu = () => {
            if (sideMenu.classList.contains('open')) toggleMenu();
        };
    }

    setupRoomManagement(): void {
        const saveRoomBtn = document.getElementById('save-room-btn') as HTMLButtonElement | null;
        const roomNameInput = document.getElementById('room-name-input') as HTMLInputElement | null;
        const savedRoomsList = document.getElementById('saved-rooms-list');

        if (!saveRoomBtn || !roomNameInput || !savedRoomsList) return;

        this.loadSavedRooms = () => {
            const rooms = getRooms();
            const roomNames = Object.keys(rooms);

            // Clear list
            savedRoomsList.innerHTML = '<div class="no-rooms-message">No saved rooms yet</div>';
            const noRoomsMessage = savedRoomsList.querySelector('.no-rooms-message') as HTMLElement;

            if (roomNames.length === 0) {
                noRoomsMessage.style.display = 'block';
            } else {
                noRoomsMessage.style.display = 'none';
                roomNames.forEach(name => {
                    const item = this.createRoomItem(name, rooms[name]);
                    savedRoomsList.appendChild(item);
                });
            }
        };

        saveRoomBtn.addEventListener('click', () => {
            const name = roomNameInput.value.trim();
            if (!name) return;

            const config = this.getAllValues();
            if (config && !saveRoom(name, config as RoomConfig)) {
                alert("You've reached the maximum limit of 10 saved rooms.");
                return;
            }

            if (this.loadSavedRooms) this.loadSavedRooms();
            roomNameInput.value = '';
            roomNameInput.dispatchEvent(new Event('input'));

            this.showResultMessage(`Room "${name}" saved successfully`, 'success');
            setTimeout(() => this.hideResultMessage(), 3000);
        });

        roomNameInput.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.value.length > 10) target.value = target.value.substring(0, 10);
            saveRoomBtn.disabled = target.value.trim() === '';
        });

        // Initial load
        this.loadSavedRooms();
        // Initial button state
        roomNameInput.dispatchEvent(new Event('input'));
    }

    createRoomItem(name: string, config: RoomConfig): HTMLDivElement {
        const div = document.createElement('div');
        div.className = 'saved-room-item';
        div.dataset.roomName = name;
        div.innerHTML = `
            <div>
                <div class="saved-room-name">${name}</div>
                <div class="saved-room-dimensions">${config.wallLength}cm × ${config.wallHeight}cm</div>
            </div>
            <div class="room-actions">
                <button class="room-delete-btn" title="Delete room">×</button>
            </div>
        `;

        const deleteBtn = div.querySelector('.room-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete room "${name}"?`)) {
                    deleteRoom(name);
                    if (this.loadSavedRooms) this.loadSavedRooms();
                }
            });
        }

        div.addEventListener('click', () => {
            this.applyValues(config as SavedInputs);
            if (this.closeMenu) this.closeMenu();
            this.showResultMessage(`Room "${name}" loaded successfully`, 'success');
            setTimeout(() => this.hideResultMessage(), 3000);

            // Update UI fully
            const showWardrobe = document.getElementById('showWardrobe');
            if (showWardrobe) showWardrobe.dispatchEvent(new Event('change'));

            const showWindow = document.getElementById('showWindow');
            if (showWindow) showWindow.dispatchEvent(new Event('change'));

            this.updateLineConfigOptions();
            this.calculateAndVisualize();
        });

        return div;
    }
}
