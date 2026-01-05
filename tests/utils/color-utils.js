/**
 * Color Contrast Utility Functions
 * 
 * Implements WCAG 2.1 color contrast ratio calculations
 * Using relative luminance formula
 */

/**
 * Parse RGB color string to {r, g, b} object
 * Handles both rgb() and rgba() formats
 * 
 * @param {string} colorString - RGB color string (e.g., "rgb(55, 65, 81)" or "rgba(55, 65, 81, 1)")
 * @returns {Object} Color object with r, g, b properties
 */
export function parseColor(colorString) {
  if (!colorString) {
    throw new Error('Invalid color: empty or null');
  }

  // Handle hex colors
  if (colorString.startsWith('#')) {
    const hex = colorString.slice(1);
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return { r, g, b };
  }

  // Handle rgb/rgba
  const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    throw new Error(`Invalid color format: ${colorString}`);
  }

  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
  };
}

/**
 * Calculate relative luminance according to WCAG formula
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * 
 * @param {string} color - RGB color string or hex
 * @returns {number} Relative luminance value (0-1)
 */
export function relativeLuminance(color) {
  const { r, g, b } = parseColor(color);

  // Normalize RGB values to 0-1 range
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  // Apply gamma correction to each channel
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate weighted sum
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 * According to WCAG 2.1 formula
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 * 
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 * Where L1 is the lighter color and L2 is the darker color
 * 
 * @param {string} color1 - First RGB color string
 * @param {string} color2 - Second RGB color string
 * @returns {number} Contrast ratio (1-21)
 */
export function contrastRatio(color1, color2) {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);

  // Determine which is lighter
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  // Apply WCAG contrast formula
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG 2.1 Level AA for normal text
 * 
 * @param {string} foreground - Foreground color
 * @param {string} background - Background color
 * @returns {boolean} True if >= 4.5:1 contrast
 */
export function meetsWCAGAAText(foreground, background) {
  const ratio = contrastRatio(foreground, background);
  return ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG 2.1 Level AA for large text or UI components
 * 
 * @param {string} foreground - Foreground color
 * @param {string} background - Background color
 * @returns {boolean} True if >= 3:1 contrast
 */
export function meetsWCAGAAComponent(foreground, background) {
  const ratio = contrastRatio(foreground, background);
  return ratio >= 3;
}

/**
 * Check if contrast ratio meets WCAG 2.1 Level AAA for normal text
 * 
 * @param {string} foreground - Foreground color
 * @param {string} background - Background color
 * @returns {boolean} True if >= 7:1 contrast
 */
export function meetsWCAGAAAText(foreground, background) {
  const ratio = contrastRatio(foreground, background);
  return ratio >= 7;
}

/**
 * Check if contrast ratio meets WCAG 2.1 Level AAA for large text or UI components
 * 
 * @param {string} foreground - Foreground color
 * @param {string} background - Background color
 * @returns {boolean} True if >= 4.5:1 contrast
 */
export function meetsWCAGAAAComponent(foreground, background) {
  const ratio = contrastRatio(foreground, background);
  return ratio >= 4.5;
}

/**
 * Format contrast ratio for display
 * 
 * @param {number} ratio - Contrast ratio
 * @returns {string} Formatted ratio (e.g., "4.5:1")
 */
export function formatRatio(ratio) {
  return `${ratio.toFixed(2)}:1`;
}

/**
 * Check contrast against WCAG standards and return result object
 * 
 * @param {string} foreground - Foreground color
 * @param {string} background - Background color
 * @returns {Object} Result object with ratio and compliance levels
 */
export function checkContrast(foreground, background) {
  const ratio = contrastRatio(foreground, background);

  return {
    ratio,
    formatted: formatRatio(ratio),
    meetsAAText: ratio >= 4.5,
    meetsAAComponent: ratio >= 3,
    meetsAAAText: ratio >= 7,
    meetsAAAComponent: ratio >= 4.5,
  };
}
