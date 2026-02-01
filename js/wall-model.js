/**
 * Business logic for Wall Line Calculator
 */

/**
 * Calculate available line configurations based on current wall dimensions and constraints
 * @param {number} wallLengthCm 
 * @param {number} wallHeightCm 
 * @param {number} minThickness 
 * @param {number} maxThickness 
 * @param {number} lineRatio 
 * @param {string} lineDirection 
 * @returns {Array} List of valid configuration objects
 */
export function calculateLineConfigs(wallLengthCm, wallHeightCm, minThickness, maxThickness, lineRatio, lineDirection) {
    if (isNaN(wallLengthCm) || wallLengthCm <= 0) {
        return [];
    }

    const minT = minThickness || 20;
    const maxT = maxThickness || 45;
    const ratio = lineRatio || 1;
    const direction = lineDirection || 'vertical';

    // Generate configurations where colored = n+1 and white = n
    const validOptions = [];

    for (let n = 1; n <= 15; n++) { // n from 1 to 15 (reasonable range)
        const colored = n + 1;
        const white = n;

        // Choose the correct dimension based on line direction
        const wallDimension = direction === 'vertical' ? wallLengthCm : wallHeightCm;

        // Calculate line widths based on ratio
        // Total width = colored_count * colored_width + white_count * white_width
        // colored_width = ratio * white_width
        // Total width = colored_count * (ratio * white_width) + white_count * white_width
        // Total width = white_width * (colored_count * ratio + white_count)
        // white_width = Total width / (colored_count * ratio + white_count)

        const whiteLineWidth = wallDimension / (colored * ratio + white);
        const coloredLineWidth = ratio * whiteLineWidth;

        // Check if both line widths are within acceptable range
        if (whiteLineWidth >= minT && whiteLineWidth <= maxT &&
            coloredLineWidth >= minT && coloredLineWidth <= maxT) {
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

    return validOptions;
}

/**
 * Calculate line dimensions for a specific configuration
 * @param {Object} params - Calculation parameters
 * @returns {Object} Result with status and calculated values
 */
export function calculateWallDimensions(params) {
    const {
        wallLengthCm,
        wallHeightCm,
        lineConfigValue,
        lineRatio = 1,
        lineDirection = 'vertical',
        minThickness = 20,
        maxThickness = 45
    } = params;

    // Validation
    if (isNaN(wallLengthCm) || wallLengthCm <= 0) {
        return { success: false, error: 'Please enter a valid wall length.', type: 'error' };
    }

    if (isNaN(wallHeightCm) || wallHeightCm <= 0) {
        return { success: false, error: 'Please enter a valid wall height.', type: 'error' };
    }

    if (!lineConfigValue) {
        return { success: false, error: 'Please select a line configuration.', type: 'warning' };
    }

    const [numColouredStr, numWhiteStr] = lineConfigValue.split(',');
    const numColoured = parseInt(numColouredStr);
    const numWhite = parseInt(numWhiteStr);

    // Choose the correct dimension based on line direction
    const wallDimension = lineDirection === 'vertical' ? wallLengthCm : wallHeightCm;

    // Calculate line widths based on ratio
    const whiteLineWidth = wallDimension / (numColoured * lineRatio + numWhite);
    const coloredLineWidth = lineRatio * whiteLineWidth;

    // Check if both line widths are within the acceptable range
    if (whiteLineWidth < minThickness || whiteLineWidth > maxThickness ||
        coloredLineWidth < minThickness || coloredLineWidth > maxThickness) {

        let errorMessage = '';
        if (lineRatio === 1) {
            errorMessage = `Calculated line thickness: ${whiteLineWidth.toFixed(1)}cm. This is outside the allowed range (${minThickness}cm - ${maxThickness}cm). Please choose another configuration.`;
        } else {
            errorMessage = `Calculated line thickness: Coloured ${coloredLineWidth.toFixed(1)}cm, White ${whiteLineWidth.toFixed(1)}cm. One or both are outside the allowed range (${minThickness}cm - ${maxThickness}cm). Please choose another configuration.`;
        }

        return { success: false, error: errorMessage, type: 'error' };
    }

    // Success result
    const directionText = lineDirection === 'vertical' ? 'vertical' : 'horizontal';
    let statusText = '';

    if (lineRatio === 1) {
        statusText = `For a wall of ${wallLengthCm.toFixed(1)}cm × ${wallHeightCm.toFixed(1)}cm with ${numColoured} coloured and ${numWhite} white ${directionText} lines, each line will be approximately ${whiteLineWidth.toFixed(1)}cm thick.`;
    } else {
        statusText = `For a wall of ${wallLengthCm.toFixed(1)}cm × ${wallHeightCm.toFixed(1)}cm with ${numColoured} coloured and ${numWhite} white ${directionText} lines, coloured lines will be ${coloredLineWidth.toFixed(1)}cm thick and white lines will be ${whiteLineWidth.toFixed(1)}cm thick.`;
    }

    return {
        success: true,
        message: statusText,
        data: {
            numColoured,
            numWhite,
            whiteLineWidth,
            coloredLineWidth,
            wallDimension,
            wallLengthCm,
            wallHeightCm,
            lineDirection
        }
    };
}
