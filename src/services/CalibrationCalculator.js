/**
 * CalibrationCalculator — Pure calibration math utilities.
 *
 * Extracted from DoubleCalibrationRecord.vue (Issue #112) so they
 * can be unit-tested independently of the Vue component.
 */

/**
 * Generate a calibration-point pattern for a given screen size.
 *
 * @param {number} pointCount  Number of calibration points (1-9).
 * @param {number} width       Screen / viewport width in px.
 * @param {number} height      Screen / viewport height in px.
 * @param {number} offset      Margin from screen edge in px.
 * @returns {{ x: number, y: number }[]}
 */
export function generateCalibrationPattern(pointCount, width, height, offset) {
    const patterns = [];

    switch (pointCount) {
        case 1:
            patterns.push({ x: width / 2, y: height / 2 });
            break;

        case 2:
            patterns.push({ x: offset, y: height / 2 });
            patterns.push({ x: width - offset, y: height / 2 });
            break;

        case 3:
            patterns.push({ x: offset, y: height / 2 });
            patterns.push({ x: width / 2, y: height / 2 });
            patterns.push({ x: width - offset, y: height / 2 });
            break;

        case 4:
            patterns.push({ x: offset, y: offset });
            patterns.push({ x: width - offset, y: offset });
            patterns.push({ x: offset, y: height - offset });
            patterns.push({ x: width - offset, y: height - offset });
            break;

        case 5:
            patterns.push({ x: offset, y: offset });
            patterns.push({ x: width - offset, y: offset });
            patterns.push({ x: width / 2, y: height / 2 });
            patterns.push({ x: offset, y: height - offset });
            patterns.push({ x: width - offset, y: height - offset });
            break;

        case 6: {
            const stepX6 = (width - 2 * offset) / 2;
            const stepY6 = (height - 2 * offset) / 1;
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 3; j++) {
                    patterns.push({
                        x: offset + j * stepX6,
                        y: offset + i * stepY6,
                    });
                }
            }
            break;
        }

        case 7:
            patterns.push({ x: offset, y: offset });
            patterns.push({ x: width / 2, y: offset });
            patterns.push({ x: width - offset, y: offset });
            patterns.push({ x: offset, y: height / 2 });
            patterns.push({ x: width - offset, y: height / 2 });
            patterns.push({ x: offset, y: height - offset });
            patterns.push({ x: width - offset, y: height - offset });
            break;

        case 8:
            patterns.push({ x: offset, y: offset });
            patterns.push({ x: width / 2, y: offset });
            patterns.push({ x: width - offset, y: offset });
            patterns.push({ x: offset, y: height / 2 });
            patterns.push({ x: width - offset, y: height / 2 });
            patterns.push({ x: offset, y: height - offset });
            patterns.push({ x: width / 2, y: height - offset });
            patterns.push({ x: width - offset, y: height - offset });
            break;

        case 9:
        default: {
            const cols = 3;
            const rows = 3;
            const usableWidth = width - 2 * offset;
            const usableHeight = height - 2 * offset;
            const stepX = usableWidth / (cols - 1);
            const stepY = usableHeight / (rows - 1);

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    patterns.push({
                        x: offset + j * stepX,
                        y: offset + i * stepY,
                    });
                }
            }
            break;
        }
    }

    return patterns;
}

/**
 * Generate a runtime calibration pattern based on screen dimensions.
 *
 * @param {Object} opts
 * @param {boolean} opts.isSinglePointMode  Use centre-only pattern.
 * @param {number}  opts.offset             Margin from screen edge.
 * @param {number}  opts.pointNumber        Number of calibration points.
 * @param {number}  [opts.width]            Viewport width  (default: window.innerWidth).
 * @param {number}  [opts.height]           Viewport height (default: window.innerHeight).
 * @returns {{ x: number, y: number }[]}
 */
export function generateRuntimePattern({
    isSinglePointMode,
    offset = 100,
    pointNumber = 9,
    width = window.innerWidth,
    height = window.innerHeight,
}) {
    if (isSinglePointMode) {
        return [{ x: width / 2, y: height / 2 }];
    }

    const points = pointNumber;
    const minCols = 3;
    const cols = Math.max(minCols, Math.round(Math.sqrt(points)));
    const rows = Math.ceil(points / cols);

    const usableWidth = width - 2 * offset;
    const usableHeight = height - 2 * offset;

    const stepX = usableWidth / (cols - 1);
    const stepY = usableHeight / (rows - 1);

    const pattern = [];

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (pattern.length < points) {
                pattern.push({
                    x: offset + j * stepX,
                    y: offset + i * stepY,
                });
            }
        }
    }

    return pattern;
}

/**
 * Euclidean distance between two 2-D landmark points (arrays).
 *
 * @param {number[]} pointA  [x, y, …]
 * @param {number[]} pointB  [x, y, …]
 * @returns {number}
 */
export function calculateDistance(pointA, pointB) {
    const dx = pointB[0] - pointA[0];
    const dy = pointB[1] - pointA[1];
    return Math.sqrt(dx * dx + dy * dy);
}
