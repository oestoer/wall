/**
 * Visualization logic for Wall Line Calculator
 */
import { adjustColor } from './utils';
import { WallData } from './wall-model';

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

interface WardrobeParams {
    show: boolean;
    width: number;
    height: number;
    offset: number;
    color: string;
    wallLength: number;
    wallHeight: number;
}

interface WindowParams {
    show: boolean;
    width: number;
    height: number;
    rightOffset: number;
    floorOffset: number;
    color: string;
    wallLength: number;
    wallHeight: number;
}

/**
 * Visualize the wall with lines, wardrobe, and window
 */
export function renderWall(data: WallData, config: RenderConfig): void {
    const wallContainer = document.getElementById('wall-container');
    if (!wallContainer) return;

    const {
        wallLengthCm,
        wallHeightCm,
        numColoured,
        numWhite,
        whiteLineWidth,
        coloredLineWidth,
        wallDimension,
        lineDirection
    } = data;

    const {
        mainColor,
        whiteColor,
        showWardrobe,
        wardrobeWidth,
        wardrobeHeight,
        wardrobeOffset,
        wardrobeColor,
        showWindow,
        windowWidth,
        windowHeight,
        windowRightOffset,
        windowFloorOffset,
        windowColor
    } = config;

    // Set wall container to normal state
    wallContainer.className = 'wall-container';
    wallContainer.innerHTML = ''; // Clear previous content

    // Create container elements
    const wardrobeElement = document.createElement('div');
    wardrobeElement.id = 'wardrobe';
    wallContainer.appendChild(wardrobeElement);

    const windowElementDiv = document.createElement('div');
    windowElementDiv.id = 'window';
    wallContainer.appendChild(windowElementDiv);

    // Calculate and set proper aspect ratio based on actual wall dimensions
    const wallAspectRatio = wallLengthCm / wallHeightCm;
    updateContainerDimensions(wallContainer, wallAspectRatio);

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

    // Render lines
    for (let i = 0; i < numColoured + numWhite; i++) {
        const lineDiv = document.createElement('div');
        lineDiv.classList.add('line');

        // Apply the selected colours and dimensions based on line type
        if (i % 2 === 0) { // Even index is coloured
            lineDiv.style.backgroundColor = mainColor;
            lineDiv.style.flexBasis = `${coloredLineDimensionPercentage}%`;
        } else { // Odd index is white
            lineDiv.style.backgroundColor = whiteColor;
            lineDiv.style.flexBasis = `${whiteLineDimensionPercentage}%`;
        }

        linesContainer.appendChild(lineDiv);
    }

    // Render wardrobe
    renderWardrobe(wardrobeElement, {
        show: showWardrobe,
        width: wardrobeWidth,
        height: wardrobeHeight,
        offset: wardrobeOffset,
        color: wardrobeColor,
        wallLength: wallLengthCm,
        wallHeight: wallHeightCm
    });

    // Render window
    renderWindow(windowElementDiv, {
        show: showWindow,
        width: windowWidth,
        height: windowHeight,
        rightOffset: windowRightOffset,
        floorOffset: windowFloorOffset,
        color: windowColor,
        wallLength: wallLengthCm,
        wallHeight: wallHeightCm
    });
}

/**
 * Handle container sizing logic
 */
function updateContainerDimensions(container: HTMLElement, wallAspectRatio: number): void {
    // Set container dimensions based on aspect ratio and screen size
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 600;

    let containerWidth: number, containerHeight: number;

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
    container.style.width = `${Math.round(containerWidth)}px`;
    container.style.height = `${Math.round(containerHeight)}px`;
    container.style.maxWidth = `${Math.round(containerWidth)}px`;
    container.style.maxHeight = `${Math.round(containerHeight)}px`;

    // Set appropriate height class based on calculated height for CSS compatibility
    if (containerHeight <= 160) {
        container.setAttribute('data-height', 'small');
    } else if (containerHeight <= 250) {
        container.setAttribute('data-height', 'medium');
    } else {
        container.setAttribute('data-height', 'large');
    }
}

/**
 * Render wardrobe element
 */
function renderWardrobe(element: HTMLElement, params: WardrobeParams): void {
    const { show, width, height, offset, color, wallLength, wallHeight } = params;

    if (show && width > 0 && height > 0) {
        // Validate wardrobe dimensions
        if (width > wallLength) console.warn(`Wardrobe width (${width}cm) exceeds wall length`);
        if (height > wallHeight) console.warn(`Wardrobe height (${height}cm) exceeds wall height`);

        // Calculate wardrobe dimensions relative to wall visualization
        const widthPct = Math.min((width / wallLength) * 100, 100);
        const heightPct = Math.min((height / wallHeight) * 100, 100);
        const offsetPct = (offset / wallLength) * 100;

        // Set styles
        element.style.width = `${widthPct}%`;
        element.style.height = `${heightPct}%`;
        element.style.backgroundColor = color;
        element.style.display = 'block';
        element.className = 'visible';

        // Position
        element.style.position = 'absolute';
        element.style.bottom = '0';
        element.style.right = `${offsetPct}%`;

        // Border
        const darkerBorderColor = adjustColor(color, -30);
        element.style.border = `2px solid ${darkerBorderColor}`;
    } else {
        element.style.display = 'none';
        element.className = 'hidden';
    }
}

/**
 * Render window element
 */
function renderWindow(element: HTMLElement, params: WindowParams): void {
    const { show, width, height, rightOffset, floorOffset, color, wallLength, wallHeight } = params;

    if (show && width > 0 && height > 0) {
        // Validate window dimensions
        if (width > wallLength) console.warn(`Window width (${width}cm) exceeds wall length`);
        if (height > wallHeight) console.warn(`Window height (${height}cm) exceeds wall height`);

        // Calculate dimensions relative to wall visualization
        const widthPct = Math.min((width / wallLength) * 100, 100);
        const heightPct = Math.min((height / wallHeight) * 100, 100);
        const rightOffsetPct = (rightOffset / wallLength) * 100;
        const floorOffsetPct = (floorOffset / wallHeight) * 100;

        // Set styles
        element.style.width = `${widthPct}%`;
        element.style.height = `${heightPct}%`;
        element.style.backgroundColor = color;
        element.style.display = 'block';
        element.className = 'visible';

        // Position
        element.style.position = 'absolute';
        element.style.bottom = `${floorOffsetPct}%`;
        element.style.right = `${rightOffsetPct}%`;

        // Border
        const darkerBorderColor = adjustColor(color, -30);
        element.style.border = `2px solid ${darkerBorderColor}`;
    } else {
        element.style.display = 'none';
        element.className = 'hidden';
    }
}

/**
 * Show error state in visualization
 */
export function setVisualizerError(isError: boolean): void {
    const wallContainer = document.getElementById('wall-container');
    if (wallContainer) {
        if (isError) {
            wallContainer.className = 'wall-container error';
        } else {
            wallContainer.className = 'wall-container';
        }
    }
}
