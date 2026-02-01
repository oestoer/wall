/**
 * Wall Line Calculator & Visualizer
 * Main application JavaScript
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Debounce function to limit how often a function can fire
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
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
 * @param {string} color - Hex color code
 * @param {number} percent - Brightness adjustment
 * @returns {string} - Adjusted hex color
 */
function adjustColor(color, percent) {
    // Convert hex to RGB
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    // Adjust brightness
    r = Math.max(0, Math.min(255, r + percent));
    g = Math.max(0, Math.min(255, g + percent));
    b = Math.max(0, Math.min(255, b + percent));

    // Convert back to hex
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ============================================================================
// FORM VALUE UTILITIES
// ============================================================================

/**
 * Get value from form element (supports custom color-picker)
 */
function getValue(id) {
    const element = document.getElementById(id);
    // Check if it's a custom color-picker element
    if (element.tagName.toLowerCase() === 'color-picker') {
        return element.value;
    }
    return element.value;
}

/**
 * Set value to form element (supports custom color-picker)
 */
function setValue(id, value) {
    const element = document.getElementById(id);
    // Check if it's a custom color-picker element
    if (element.tagName.toLowerCase() === 'color-picker') {
        element.value = value;
    } else {
        element.value = value;
    }
}

/**
 * Get checked state of checkbox
 */
function getChecked(id) {
    return document.getElementById(id).checked;
}

/**
 * Set checked state of checkbox
 */
function setChecked(id, value) {
    document.getElementById(id).checked = value;
}

/**
 * Get float value from input
 */
function getFloat(id) {
    return parseFloat(getValue(id));
}

// ============================================================================
// LINE CONFIGURATION
// ============================================================================

/**
 * Update the line configuration dropdown based on current parameters
 */
function updateLineConfigOptions() {
    const wallLengthCm = getFloat('wallLength');
    const wallHeightCm = getFloat('wallHeight');
    const minThickness = getFloat('minThickness') || 20;
    const maxThickness = getFloat('maxThickness') || 45;
    const lineRatio = getFloat('lineRatio') || 1;
    const lineDirection = getValue('lineDirection') || 'vertical';
    const lineConfigSelect = document.getElementById('lineConfig');
    const currentValue = lineConfigSelect.value;

    // Clear existing options except the first one
    lineConfigSelect.innerHTML = '<option value="">Select a configuration</option>';

    if (isNaN(wallLengthCm) || wallLengthCm <= 0) {
        return;
    }

    // Generate configurations where colored = n+1 and white = n
    const validOptions = [];

    for (let n = 1; n <= 15; n++) { // n from 1 to 15 (reasonable range)
        const colored = n + 1;
        const white = n;

        // Choose the correct dimension based on line direction
        const wallDimension = lineDirection === 'vertical' ? wallLengthCm : wallHeightCm;

        // Calculate line widths based on ratio
        const whiteLineWidth = wallDimension / (colored * lineRatio + white);
        const coloredLineWidth = lineRatio * whiteLineWidth;

        // Check if both line widths are within acceptable range
        if (whiteLineWidth >= minThickness && whiteLineWidth <= maxThickness &&
            coloredLineWidth >= minThickness && coloredLineWidth <= maxThickness) {
            validOptions.push({
                colored: colored,
                white: white,
                whiteLineWidth: whiteLineWidth,
                coloredLineWidth: coloredLineWidth,
                total: colored + white
            });
        }
    }

    // Sort by total lines, then by colored lines
    validOptions.sort((a, b) => {
        if (a.total !== b.total) return a.total - b.total;
        return a.colored - b.colored;
    });

    // Add options to dropdown
    validOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = `${option.colored},${option.white}`;

        // Display different format based on whether ratio is 1 or not
        if (lineRatio === 1) {
            optionElement.textContent = `${option.colored} Coloured, ${option.white} White (${option.whiteLineWidth.toFixed(1)}cm thick)`;
        } else {
            optionElement.textContent = `${option.colored} Coloured (${option.coloredLineWidth.toFixed(1)}cm), ${option.white} White (${option.whiteLineWidth.toFixed(1)}cm)`;
        }
        lineConfigSelect.appendChild(optionElement);
    });

    // Try to restore the previous selection if it's still valid
    if (currentValue) {
        const optionExists = Array.from(lineConfigSelect.options).some(opt => opt.value === currentValue);
        if (optionExists) {
            lineConfigSelect.value = currentValue;
        }
    }
}

// ============================================================================
// LOCAL STORAGE MANAGEMENT
// ============================================================================

/**
 * Save current inputs to localStorage
 */
function saveInputsToLocalStorage() {
    const inputs = {
        wallLength: getValue('wallLength'),
        wallHeight: getValue('wallHeight'),
        minThickness: getValue('minThickness'),
        maxThickness: getValue('maxThickness'),
        lineRatio: getValue('lineRatio'),
        lineConfig: getValue('lineConfig'),
        lineDirection: getValue('lineDirection'),
        mainColor: getValue('mainColor'),
        whiteColor: getValue('whiteColor'),
        showWardrobe: getChecked('showWardrobe'),
        wardrobeWidth: getValue('wardrobeWidth'),
        wardrobeHeight: getValue('wardrobeHeight'),
        wardrobeOffset: getValue('wardrobeOffset'),
        wardrobeColor: getValue('wardrobeColor'),
        showWindow: getChecked('showWindow'),
        windowWidth: getValue('windowWidth'),
        windowHeight: getValue('windowHeight'),
        windowRightOffset: getValue('windowRightOffset'),
        windowFloorOffset: getValue('windowFloorOffset'),
        windowColor: getValue('windowColor')
    };

    localStorage.setItem('wallCalculatorInputs', JSON.stringify(inputs));
}

/**
 * Load inputs from localStorage
 */
function loadInputsFromLocalStorage() {
    const savedInputs = localStorage.getItem('wallCalculatorInputs');
    if (savedInputs) {
        try {
            const inputs = JSON.parse(savedInputs);

            // Restore text/number inputs
            if (inputs.wallLength) setValue('wallLength', inputs.wallLength);
            if (inputs.wallHeight) setValue('wallHeight', inputs.wallHeight);
            if (inputs.minThickness) setValue('minThickness', inputs.minThickness);
            if (inputs.maxThickness) setValue('maxThickness', inputs.maxThickness);
            if (inputs.lineRatio) setValue('lineRatio', inputs.lineRatio);
            if (inputs.mainColor) setValue('mainColor', inputs.mainColor);
            if (inputs.whiteColor) setValue('whiteColor', inputs.whiteColor);
            if (inputs.wardrobeWidth) setValue('wardrobeWidth', inputs.wardrobeWidth);
            if (inputs.wardrobeHeight) setValue('wardrobeHeight', inputs.wardrobeHeight);
            if (inputs.wardrobeOffset) setValue('wardrobeOffset', inputs.wardrobeOffset);
            if (inputs.wardrobeColor) setValue('wardrobeColor', inputs.wardrobeColor);
            if (inputs.windowWidth) setValue('windowWidth', inputs.windowWidth);
            if (inputs.windowHeight) setValue('windowHeight', inputs.windowHeight);
            if (inputs.windowRightOffset) setValue('windowRightOffset', inputs.windowRightOffset);
            if (inputs.windowFloorOffset) setValue('windowFloorOffset', inputs.windowFloorOffset);
            if (inputs.windowColor) setValue('windowColor', inputs.windowColor);

            // Restore checkboxes - CSS will handle the visibility
            if (inputs.showWardrobe !== undefined) {
                setChecked('showWardrobe', inputs.showWardrobe);
            }
            if (inputs.showWindow !== undefined) {
                setChecked('showWindow', inputs.showWindow);
            }

            // Update line config options first, then restore selection
            updateLineConfigOptions();
            if (inputs.lineConfig) {
                setValue('lineConfig', inputs.lineConfig);
            }

            // Restore line direction
            if (inputs.lineDirection) {
                setValue('lineDirection', inputs.lineDirection);
            }

        } catch (error) {
            console.warn('Error loading saved inputs:', error);
        }
    }
}

/**
 * Add event listeners to save inputs when they change
 */
function addSaveListeners() {
    const inputElements = [
        'wallLength', 'wallHeight', 'minThickness', 'maxThickness',
        'lineRatio', 'lineConfig', 'mainColor', 'whiteColor',
        'showWardrobe', 'wardrobeWidth', 'wardrobeHeight',
        'wardrobeOffset', 'wardrobeColor', 'showWindow',
        'windowWidth', 'windowHeight', 'windowRightOffset',
        'windowFloorOffset', 'windowColor'
    ];

    inputElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'checkbox') {
                element.addEventListener('change', saveInputsToLocalStorage);
            } else {
                element.addEventListener('input', saveInputsToLocalStorage);
                element.addEventListener('change', saveInputsToLocalStorage);
            }
        }
    });
}

// ============================================================================
// RESULT MESSAGES
// ============================================================================

/**
 * Show result message with type
 */
function showResultMessage(message, type = 'success') {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = message;
    resultDiv.className = `result-message show ${type}`;
}

/**
 * Hide result message
 */
function hideResultMessage() {
    const resultDiv = document.getElementById('result');
    resultDiv.className = 'result-message';
}

// ============================================================================
// MAIN CALCULATION AND VISUALIZATION
// ============================================================================

/**
 * Calculate and visualize the wall with lines
 */
function calculateAndVisualize() {
    const wallLengthCm = getFloat('wallLength');
    const wallHeightCm = getFloat('wallHeight');
    const lineConfigValue = getValue('lineConfig');
    const lineRatio = getFloat('lineRatio') || 1;
    const lineDirection = getValue('lineDirection') || 'vertical';
    const wallContainer = document.getElementById('wall-container');

    if (isNaN(wallLengthCm) || wallLengthCm <= 0) {
        showResultMessage('Please enter a valid wall length.', 'error');
        wallContainer.className = 'wall-container error';
        return;
    }

    if (isNaN(wallHeightCm) || wallHeightCm <= 0) {
        showResultMessage('Please enter a valid wall height.', 'error');
        wallContainer.className = 'wall-container error';
        return;
    }

    if (!lineConfigValue) {
        showResultMessage('Please select a line configuration.', 'warning');
        wallContainer.className = 'wall-container error';
        return;
    }

    const [numColouredStr, numWhiteStr] = lineConfigValue.split(',');
    const numColoured = parseInt(numColouredStr);
    const numWhite = parseInt(numWhiteStr);

    // Choose the correct dimension based on line direction
    const wallDimension = lineDirection === 'vertical' ? wallLengthCm : wallHeightCm;

    // Calculate line widths based on ratio
    const whiteLineWidth = wallDimension / (numColoured * lineRatio + numWhite);
    const coloredLineWidth = lineRatio * whiteLineWidth;

    // Get the configured thickness range
    const minThickness = getFloat('minThickness') || 20;
    const maxThickness = getFloat('maxThickness') || 45;

    // Check if both line widths are within the acceptable range
    if (whiteLineWidth < minThickness || whiteLineWidth > maxThickness ||
        coloredLineWidth < minThickness || coloredLineWidth > maxThickness) {
        let errorMessage = '';
        if (lineRatio === 1) {
            errorMessage = `Calculated line thickness: ${whiteLineWidth.toFixed(1)}cm. This is outside the allowed range (${minThickness}cm - ${maxThickness}cm). Please choose another configuration.`;
        } else {
            errorMessage = `Calculated line thickness: Coloured ${coloredLineWidth.toFixed(1)}cm, White ${whiteLineWidth.toFixed(1)}cm. One or both are outside the allowed range (${minThickness}cm - ${maxThickness}cm). Please choose another configuration.`;
        }
        showResultMessage(errorMessage, 'error');
        wallContainer.className = 'wall-container error';
        return;
    }

    // Display result based on whether ratio is 1 or not
    let statusText = '';
    const directionText = lineDirection === 'vertical' ? 'vertical' : 'horizontal';

    if (lineRatio === 1) {
        statusText = `For a wall of ${wallLengthCm.toFixed(1)}cm × ${wallHeightCm.toFixed(1)}cm with ${numColoured} coloured and ${numWhite} white ${directionText} lines, each line will be approximately ${whiteLineWidth.toFixed(1)}cm thick.`;
    } else {
        statusText = `For a wall of ${wallLengthCm.toFixed(1)}cm × ${wallHeightCm.toFixed(1)}cm with ${numColoured} coloured and ${numWhite} white ${directionText} lines, coloured lines will be ${coloredLineWidth.toFixed(1)}cm thick and white lines will be ${whiteLineWidth.toFixed(1)}cm thick.`;
    }

    showResultMessage(statusText, 'success');

    // Set wall container to normal state
    wallContainer.className = 'wall-container';

    // Calculate and set proper aspect ratio based on actual wall dimensions
    const wallAspectRatio = wallLengthCm / wallHeightCm;

    // Set container dimensions based on aspect ratio and screen size
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 600;

    let containerWidth, containerHeight;

    // Define maximum available space for the visualization
    const maxAvailableWidth = isMobile ? (isSmallMobile ? 280 : 350) : 500;
    const maxAvailableHeight = isMobile ? (isSmallMobile ? 220 : 280) : 400;

    if (wallAspectRatio >= 1) {
        // Wall is wider than it is tall (width >= height)
        containerWidth = Math.min(maxAvailableWidth, maxAvailableHeight * wallAspectRatio);
        containerHeight = containerWidth / wallAspectRatio;
    } else {
        // Wall is taller than it is wide (height > width)
        containerHeight = Math.min(maxAvailableHeight, maxAvailableWidth / wallAspectRatio);
        containerWidth = containerHeight * wallAspectRatio;
    }

    // Ensure minimum sizes for usability
    const minWidth = isMobile ? (isSmallMobile ? 200 : 250) : 300;
    const minHeight = isMobile ? (isSmallMobile ? 120 : 150) : 180;

    if (containerWidth < minWidth) {
        containerWidth = minWidth;
        containerHeight = containerWidth / wallAspectRatio;
    }
    if (containerHeight < minHeight) {
        containerHeight = minHeight;
        containerWidth = containerHeight * wallAspectRatio;
    }

    // Apply the calculated dimensions
    wallContainer.style.width = `${Math.round(containerWidth)}px`;
    wallContainer.style.height = `${Math.round(containerHeight)}px`;
    wallContainer.style.maxWidth = `${Math.round(containerWidth)}px`;
    wallContainer.style.maxHeight = `${Math.round(containerHeight)}px`;

    // Set appropriate height class based on calculated height for CSS compatibility
    if (containerHeight <= 160) {
        wallContainer.setAttribute('data-height', 'small');
    } else if (containerHeight <= 250) {
        wallContainer.setAttribute('data-height', 'medium');
    } else {
        wallContainer.setAttribute('data-height', 'large');
    }

    // Visualize the lines
    wallContainer.innerHTML = ''; // Clear previous lines

    // Add the wardrobe and window elements back after clearing the container
    const wardrobeElement = document.createElement('div');
    wardrobeElement.id = 'wardrobe';
    wallContainer.appendChild(wardrobeElement);

    const windowElementDiv = document.createElement('div');
    windowElementDiv.id = 'window';
    wallContainer.appendChild(windowElementDiv);

    // Create a container for lines that will use flexbox appropriately
    const linesContainer = document.createElement('div');
    linesContainer.style.display = 'flex';
    linesContainer.style.width = '100%';
    linesContainer.style.height = '100%';

    // Set flex direction based on selected orientation
    if (lineDirection === 'vertical') {
        linesContainer.style.flexDirection = 'row';
    } else {
        linesContainer.style.flexDirection = 'column';
    }

    wallContainer.appendChild(linesContainer);

    // Calculate percentages for line widths
    const coloredLineDimensionPercentage = (coloredLineWidth / wallDimension) * 100;
    const whiteLineDimensionPercentage = (whiteLineWidth / wallDimension) * 100;

    // Get the selected colours
    const colouredColor = getValue('mainColor');
    const whiteColor = getValue('whiteColor');

    for (let i = 0; i < numColoured + numWhite; i++) {
        const lineDiv = document.createElement('div');
        lineDiv.classList.add('line');

        // Apply the selected colours and dimensions based on line type
        if (i % 2 === 0) { // Even index is coloured
            lineDiv.style.backgroundColor = colouredColor;
            lineDiv.style.flexBasis = `${coloredLineDimensionPercentage}%`;
        } else { // Odd index is white
            lineDiv.style.backgroundColor = whiteColor;
            lineDiv.style.flexBasis = `${whiteLineDimensionPercentage}%`;
        }

        linesContainer.appendChild(lineDiv);
    }

    // Handle the wardrobe
    const showWardrobe = getChecked('showWardrobe');
    const wardrobe = document.getElementById('wardrobe');
    const wardrobeWidth = getFloat('wardrobeWidth');
    const wardrobeHeight = getFloat('wardrobeHeight');
    const wardrobeColor = getValue('wardrobeColor');

    if (showWardrobe && !isNaN(wardrobeWidth) && !isNaN(wardrobeHeight) && wardrobeWidth > 0 && wardrobeHeight > 0) {
        // Validate wardrobe dimensions don't exceed wall dimensions
        if (wardrobeWidth > wallLengthCm) {
            console.warn(`Wardrobe width (${wardrobeWidth}cm) exceeds wall length (${wallLengthCm}cm)`);
        }
        if (wardrobeHeight > wallHeightCm) {
            console.warn(`Wardrobe height (${wardrobeHeight}cm) exceeds wall height (${wallHeightCm}cm)`);
        }

        // Get the offset from right side
        const wardrobeOffset = getFloat('wardrobeOffset') || 0;

        // Calculate wardrobe dimensions relative to wall visualization
        const wardrobeWidthPct = Math.min((wardrobeWidth / wallLengthCm) * 100, 100);
        const wardrobeHeightPct = Math.min((wardrobeHeight / wallHeightCm) * 100, 100);
        const offsetPct = (wardrobeOffset / wallLengthCm) * 100;

        // Set wardrobe dimensions and display it
        wardrobe.style.width = `${wardrobeWidthPct}%`;
        wardrobe.style.height = `${wardrobeHeightPct}%`;
        wardrobe.style.backgroundColor = wardrobeColor;
        wardrobe.style.display = 'block';
        wardrobe.className = 'visible';

        // Position with offset from the right edge
        wardrobe.style.position = 'absolute';
        wardrobe.style.bottom = '0';
        wardrobe.style.right = `${offsetPct}%`;

        // Darker border based on the selected color
        const darkerBorderColor = adjustColor(wardrobeColor, -30);
        wardrobe.style.border = `2px solid ${darkerBorderColor}`;
    } else {
        // Hide the wardrobe if checkbox is unchecked
        wardrobe.style.display = 'none';
        wardrobe.className = 'hidden';
    }

    // Handle the window
    const showWindow = getChecked('showWindow');
    const windowElement = document.getElementById('window');
    const windowWidth = getFloat('windowWidth');
    const windowHeight = getFloat('windowHeight');
    const windowColor = getValue('windowColor');

    if (showWindow && !isNaN(windowWidth) && !isNaN(windowHeight) && windowWidth > 0 && windowHeight > 0) {
        // Validate window dimensions don't exceed wall dimensions
        if (windowWidth > wallLengthCm) {
            console.warn(`Window width (${windowWidth}cm) exceeds wall length (${wallLengthCm}cm)`);
        }
        if (windowHeight > wallHeightCm) {
            console.warn(`Window height (${windowHeight}cm) exceeds wall height (${wallHeightCm}cm)`);
        }

        // Get the offsets from right side and floor
        const windowRightOffset = getFloat('windowRightOffset') || 0;
        const windowFloorOffset = getFloat('windowFloorOffset') || 0;

        // Calculate window dimensions relative to wall visualization
        const windowWidthPct = Math.min((windowWidth / wallLengthCm) * 100, 100);
        const windowHeightPct = Math.min((windowHeight / wallHeightCm) * 100, 100);
        const rightOffsetPct = (windowRightOffset / wallLengthCm) * 100;
        const floorOffsetPct = (windowFloorOffset / wallHeightCm) * 100;

        // Set window dimensions and display it
        windowElement.style.width = `${windowWidthPct}%`;
        windowElement.style.height = `${windowHeightPct}%`;
        windowElement.style.backgroundColor = windowColor;
        windowElement.style.display = 'block';
        windowElement.className = 'visible';

        // Position with offsets from the right edge and floor
        windowElement.style.position = 'absolute';
        windowElement.style.bottom = `${floorOffsetPct}%`;
        windowElement.style.right = `${rightOffsetPct}%`;

        // Darker border based on the selected color
        const darkerBorderColor = adjustColor(windowColor, -30);
        windowElement.style.border = `2px solid ${darkerBorderColor}`;
    } else {
        // Hide the window if checkbox is unchecked
        windowElement.style.display = 'none';
        windowElement.className = 'hidden';
    }
}

// Create debounced version for input events
const debouncedCalculateAndVisualize = debounce(calculateAndVisualize, 300);

// ============================================================================
// RESET FUNCTIONALITY
// ============================================================================

/**
 * Reset function to restore all default values
 */
function resetToDefaults() {
    // Show confirmation dialog before resetting
    if (!confirm('Are you sure you want to reset all values to defaults? This will clear all your current settings and cannot be undone.')) {
        return;
    }

    // Ask if user wants to clear saved rooms as well
    const clearRooms = confirm('Would you also like to clear all saved rooms?');
    if (clearRooms) {
        // Clear saved rooms
        localStorage.removeItem('wallCalculatorRooms');
        // Refresh the saved rooms list
        if (typeof initRoomConfigurations === 'function') {
            initRoomConfigurations();
        }
    }

    // Clear localStorage inputs
    localStorage.removeItem('wallCalculatorInputs');

    // Set all inputs back to their default values
    setValue('wallLength', '485.6');
    setValue('wallHeight', '260');
    setValue('minThickness', '20');
    setValue('maxThickness', '45');
    setValue('lineRatio', '1');
    setValue('lineConfig', '');
    setValue('lineDirection', 'vertical');
    setValue('mainColor', '#FFEEEE');
    setValue('whiteColor', '#FFFFFF');
    setChecked('showWardrobe', false);
    setValue('wardrobeWidth', '64');
    setValue('wardrobeHeight', '200');
    setValue('wardrobeOffset', '0');
    setValue('wardrobeColor', '#8B4513');
    setChecked('showWindow', false);
    setValue('windowWidth', '120');
    setValue('windowHeight', '120');
    setValue('windowRightOffset', '100');
    setValue('windowFloorOffset', '100');
    setValue('windowColor', '#87CEEB');

    // Update UI state
    updateLineConfigOptions();
    calculateAndVisualize();

    // Show success message
    showResultMessage('All values reset to defaults', 'success');
    setTimeout(() => hideResultMessage(), 3000);
}

// ============================================================================
// ROOM CONFIGURATION MANAGEMENT
// ============================================================================

/**
 * Save room configuration to localStorage
 */
function saveRoomToLocalStorage(roomName, config) {
    const savedRooms = getRoomsFromLocalStorage();

    // Check if we already have 10 rooms
    if (Object.keys(savedRooms).length >= 10 && !savedRooms[roomName]) {
        return false;
    }

    // Add or update the room
    savedRooms[roomName] = config;

    // Save back to localStorage
    localStorage.setItem('wallCalculatorRooms', JSON.stringify(savedRooms));
    return true;
}

/**
 * Get rooms from localStorage
 */
function getRoomsFromLocalStorage() {
    const savedRoomsJson = localStorage.getItem('wallCalculatorRooms');
    return savedRoomsJson ? JSON.parse(savedRoomsJson) : {};
}

/**
 * Delete room from localStorage
 */
function deleteRoomFromLocalStorage(roomName) {
    const savedRooms = getRoomsFromLocalStorage();

    if (savedRooms[roomName]) {
        delete savedRooms[roomName];
        localStorage.setItem('wallCalculatorRooms', JSON.stringify(savedRooms));
        return true;
    }

    return false;
}

/**
 * Get current room configuration from form
 */
function getCurrentRoomConfig() {
    return {
        wallLength: getValue('wallLength'),
        wallHeight: getValue('wallHeight'),
        minThickness: getValue('minThickness'),
        maxThickness: getValue('maxThickness'),
        lineRatio: getValue('lineRatio'),
        lineConfig: getValue('lineConfig'),
        lineDirection: getValue('lineDirection'),
        mainColor: getValue('mainColor'),
        whiteColor: getValue('whiteColor'),
        showWardrobe: getChecked('showWardrobe'),
        wardrobeWidth: getValue('wardrobeWidth'),
        wardrobeHeight: getValue('wardrobeHeight'),
        wardrobeOffset: getValue('wardrobeOffset'),
        wardrobeColor: getValue('wardrobeColor'),
        showWindow: getChecked('showWindow'),
        windowWidth: getValue('windowWidth'),
        windowHeight: getValue('windowHeight'),
        windowRightOffset: getValue('windowRightOffset'),
        windowFloorOffset: getValue('windowFloorOffset'),
        windowColor: getValue('windowColor')
    };
}

/**
 * Apply room configuration to form
 */
function applyRoomConfig(config) {
    // Basic dimensions
    setValue('wallLength', config.wallLength);
    setValue('wallHeight', config.wallHeight);
    setValue('minThickness', config.minThickness);
    setValue('maxThickness', config.maxThickness);
    setValue('lineRatio', config.lineRatio);
    setValue('lineConfig', config.lineConfig);
    if (config.lineDirection) {
        setValue('lineDirection', config.lineDirection);
    }

    // Colors
    setValue('mainColor', config.mainColor);
    setValue('whiteColor', config.whiteColor);

    // Wardrobe settings
    setChecked('showWardrobe', config.showWardrobe);
    setValue('wardrobeWidth', config.wardrobeWidth);
    setValue('wardrobeHeight', config.wardrobeHeight);
    setValue('wardrobeOffset', config.wardrobeOffset);
    setValue('wardrobeColor', config.wardrobeColor);

    // Window settings
    setChecked('showWindow', config.showWindow);
    setValue('windowWidth', config.windowWidth);
    setValue('windowHeight', config.windowHeight);
    setValue('windowRightOffset', config.windowRightOffset);
    setValue('windowFloorOffset', config.windowFloorOffset);
    setValue('windowColor', config.windowColor);

    // Update dependent UI elements
    updateLineConfigOptions();

    // Trigger wardrobe and window visibility updates
    document.getElementById('showWardrobe').dispatchEvent(new Event('change'));
    document.getElementById('showWindow').dispatchEvent(new Event('change'));

    // Calculate and visualize with the new values
    calculateAndVisualize();
}

/**
 * Initialize room configurations functionality
 */
function initRoomConfigurations() {
    const saveRoomBtn = document.getElementById('save-room-btn');
    const roomNameInput = document.getElementById('room-name-input');
    const savedRoomsList = document.getElementById('saved-rooms-list');
    const noRoomsMessage = savedRoomsList.querySelector('.no-rooms-message');

    // Create a room item template
    function createRoomItemTemplate(roomName, config) {
        const wallWidth = config.wallLength;
        const wallHeight = config.wallHeight;

        const roomItem = document.createElement('div');
        roomItem.className = 'saved-room-item';
        roomItem.dataset.roomName = roomName;
        roomItem.innerHTML = `
            <div>
                <div class="saved-room-name">${roomName}</div>
                <div class="saved-room-dimensions">${wallWidth}cm × ${wallHeight}cm</div>
            </div>
            <div class="room-actions">
                <button class="room-delete-btn" title="Delete room">×</button>
            </div>
        `;

        // Add event listeners for the room item
        roomItem.querySelector('.room-delete-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            if (confirm(`Delete room "${roomName}"?`)) {
                if (deleteRoomFromLocalStorage(roomName)) {
                    roomItem.remove();

                    // Show "No rooms" message if this was the last room
                    if (savedRoomsList.querySelectorAll('.saved-room-item:not([style*="display: none"])').length === 0) {
                        noRoomsMessage.style.display = 'block';
                    }
                }
            }
        });

        // Add click event to load the room configuration
        roomItem.addEventListener('click', function () {
            const rooms = getRoomsFromLocalStorage();
            if (rooms[roomName]) {
                applyRoomConfig(rooms[roomName]);

                // Close the side menu
                const sideMenu = document.getElementById('side-menu');
                const menuOverlay = document.getElementById('menu-overlay');
                const hamburgerMenu = document.getElementById('hamburger-menu');

                sideMenu.classList.remove('open');
                menuOverlay.classList.remove('open');
                hamburgerMenu.classList.remove('open');

                // Show a success message
                showResultMessage(`Room "${roomName}" loaded successfully`, 'success');
                setTimeout(() => hideResultMessage(), 3000);
            }
        });

        return roomItem;
    }

    // Add event listener to the save button
    saveRoomBtn.addEventListener('click', function () {
        const roomName = roomNameInput.value.trim();
        if (!roomName) return;

        // Get current configuration
        const currentConfig = getCurrentRoomConfig();

        // Save to localStorage
        const success = saveRoomToLocalStorage(roomName, currentConfig);

        if (!success) {
            alert("You've reached the maximum limit of 10 saved rooms. Please delete some rooms before adding new ones.");
            return;
        }

        // Check if this room already exists in the UI
        const existingRoom = savedRoomsList.querySelector(`.saved-room-item[data-room-name="${roomName}"]`);
        if (existingRoom) {
            existingRoom.remove();
        }

        // Create a new room item for display
        const roomItem = createRoomItemTemplate(roomName, currentConfig);

        // Hide the "No rooms" message if this is the first room
        if (savedRoomsList.querySelectorAll('.saved-room-item:not([style*="display: none"])').length === 0) {
            noRoomsMessage.style.display = 'none';
        }

        // Add the new room to the list
        savedRoomsList.appendChild(roomItem);

        // Clear the input field
        roomNameInput.value = '';
        roomNameInput.dispatchEvent(new Event('input'));

        // Show success message
        showResultMessage(`Room "${roomName}" saved successfully`, 'success');
        setTimeout(() => hideResultMessage(), 3000);
    });

    // Add input validation for room name
    roomNameInput.addEventListener('input', function () {
        // Limit to 10 characters
        if (this.value.length > 10) {
            this.value = this.value.substring(0, 10);
        }

        // Enable/disable save button based on input
        saveRoomBtn.disabled = this.value.trim() === '';
    });

    // Load saved rooms from localStorage
    function loadSavedRooms() {
        const rooms = getRoomsFromLocalStorage();
        const roomNames = Object.keys(rooms);

        // Clear existing room items (except the template)
        const existingRooms = savedRoomsList.querySelectorAll('.saved-room-item:not([style*="display: none"])');
        existingRooms.forEach(room => room.remove());

        // Show or hide the "No rooms" message based on the number of rooms
        if (roomNames.length === 0) {
            noRoomsMessage.style.display = 'block';
        } else {
            noRoomsMessage.style.display = 'none';

            // Add each room to the list
            roomNames.forEach(roomName => {
                const roomItem = createRoomItemTemplate(roomName, rooms[roomName]);
                savedRoomsList.appendChild(roomItem);
            });
        }
    }

    // Load existing saved rooms
    loadSavedRooms();

    // Trigger input event to set initial state
    roomNameInput.dispatchEvent(new Event('input'));
}

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

/**
 * Apply theme to the document
 */
function applyTheme(theme) {
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

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', function () {
    // Theme initialization
    const themeSelect = document.getElementById('theme-select');
    const savedTheme = localStorage.getItem('wallCalculatorTheme') || 'auto';

    themeSelect.value = savedTheme;
    applyTheme(savedTheme);

    themeSelect.addEventListener('change', function () {
        const theme = themeSelect.value;
        localStorage.setItem('wallCalculatorTheme', theme);
        applyTheme(theme);
    });

    // Detect system preference changes
    if (window.matchMedia) {
        const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        colorSchemeQuery.addEventListener('change', (e) => {
            if (themeSelect.value === 'auto') {
                console.log(`System theme preference changed to: ${e.matches ? 'dark' : 'light'}`);
            }
        });
    }

    // Load saved inputs and initialize
    loadInputsFromLocalStorage();
    updateLineConfigOptions();
    addSaveListeners();

    // Setup event listeners for color-picker custom elements
    document.querySelectorAll('color-picker').forEach(picker => {
        picker.addEventListener('color-changed', () => {
            debouncedCalculateAndVisualize();
        });
    });

    // Initial calculation
    calculateAndVisualize();

    // Form submission handler
    const form = document.getElementById('wallForm');
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (form.checkValidity()) {
            form.classList.add('form-calculating');

            setTimeout(() => {
                calculateAndVisualize();
                form.classList.remove('form-calculating');
            }, 100);
        } else {
            form.reportValidity();
        }
    });

    // Real-time validation for min/max thickness relationship
    const minThicknessInput = document.getElementById('minThickness');
    const maxThicknessInput = document.getElementById('maxThickness');

    function validateThicknessRange() {
        const minVal = parseFloat(minThicknessInput.value);
        const maxVal = parseFloat(maxThicknessInput.value);

        if (minVal && maxVal && minVal > maxVal) {
            maxThicknessInput.setCustomValidity('Maximum thickness must be greater than or equal to minimum thickness');
            minThicknessInput.setCustomValidity('Minimum thickness must be less than or equal to maximum thickness');
        } else {
            maxThicknessInput.setCustomValidity('');
            minThicknessInput.setCustomValidity('');
        }
    }

    minThicknessInput.addEventListener('input', validateThicknessRange);
    maxThicknessInput.addEventListener('input', validateThicknessRange);

    // Add debounced event listeners for inputs that trigger recalculation
    const inputsToDebounce = [
        'wallLength', 'wallHeight', 'minThickness', 'maxThickness',
        'lineRatio', 'lineDirection', 'wardrobeWidth', 'wardrobeHeight',
        'wardrobeOffset', 'windowWidth', 'windowHeight', 'windowRightOffset',
        'windowFloorOffset'
    ];

    inputsToDebounce.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                if (id === 'wallLength' || id === 'minThickness' || id === 'maxThickness' || id === 'lineRatio' || id === 'lineDirection') {
                    updateLineConfigOptions();
                }
                debouncedCalculateAndVisualize();
            });
        }
    });

    // Non-debounced listeners for immediate feedback
    const immediateInputs = ['lineConfig', 'showWardrobe', 'showWindow'];
    immediateInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', calculateAndVisualize);
        }
    });

    // Hamburger Menu functionality
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');

    function toggleMenu() {
        const isOpen = sideMenu.classList.contains('open');

        sideMenu.classList.toggle('open');
        menuOverlay.classList.toggle('open');
        hamburgerMenu.classList.toggle('open');

        // Update ARIA attributes for accessibility
        sideMenu.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
        hamburgerMenu.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        hamburgerMenu.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');

        // Store menu state in sessionStorage
        sessionStorage.setItem('menuOpen', !isOpen ? 'true' : 'false');
    }

    // Event Listeners for menu interactions
    hamburgerMenu.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);

    // Add keyboard accessibility
    hamburgerMenu.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && sideMenu.classList.contains('open')) {
            toggleMenu();
        }
    });

    // Handle menu state on page resize
    window.addEventListener('resize', function () {
        if (sideMenu.classList.contains('open')) {
            toggleMenu();
        }
    });

    // Initialize menu state
    function initMenuState() {
        hamburgerMenu.classList.remove('open');
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('open');
        initRoomConfigurations();
    }

    initMenuState();

    console.log(`Theme initialized: ${savedTheme}`);
});
