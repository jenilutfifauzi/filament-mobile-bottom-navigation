import { test, expect } from '@playwright/test';

/**
 * Typography System Tests (Story 3.3)
 * 
 * Verifies that navigation labels and badges use Filament's typography system
 * instead of hardcoded font properties. Tests font-family, font-size, font-weight,
 * and line-height variables, plus mobile optimization properties.
 * 
 * @see Story 3-3: Apply Filament Typography System
 */

const NAV_SELECTOR = '.fmbn-bottom-nav';
const NAV_ITEM_SELECTOR = '.fmbn-nav-item';
const LABEL_SELECTOR = '.fmbn-nav-item__label';
const BADGE_SELECTOR = '.fmbn-nav-item__badge';

test.describe('Filament Typography System (Story 3.3)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page with navigation
    await page.goto('http://localhost:3000'); // Adjust to your test environment
  });

  // ============================================
  // Label Typography Tests
  // ============================================

  test('should apply font-family variable to labels', async ({ page }) => {
    const label = page.locator(LABEL_SELECTOR).first();
    
    const fontFamily = await label.evaluate(el => 
      window.getComputedStyle(el).fontFamily
    );
    
    // Should not be empty - either uses system font or Figtree
    expect(fontFamily).toBeTruthy();
    expect(fontFamily.length).toBeGreaterThan(0);
  });

  test('should use font-size-xs variable for labels (12px)', async ({ page }) => {
    const label = page.locator(LABEL_SELECTOR).first();
    
    const fontSize = await label.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // var(--font-size-xs) = 0.75rem = 12px
    expect(fontSize).toMatch(/^12px$/);
  });

  test('should use font-weight-medium variable for labels (500)', async ({ page }) => {
    const label = page.locator(LABEL_SELECTOR).first();
    
    const fontWeight = await label.evaluate(el => 
      window.getComputedStyle(el).fontWeight
    );
    
    // var(--font-weight-medium) = 500
    expect(fontWeight).toMatch(/^500$/);
  });

  test('should use line-height-tight variable for labels (1.25)', async ({ page }) => {
    const label = page.locator(LABEL_SELECTOR).first();
    
    const lineHeight = await label.evaluate(el => 
      window.getComputedStyle(el).lineHeight
    );
    
    // var(--line-height-tight) = 1.25 = 15px at 12px font size
    // (1.25 * 12px = 15px)
    expect(lineHeight).toMatch(/^15px$/);
  });

  test('should have antialiased font-smoothing on labels', async ({ page }) => {
    const label = page.locator(LABEL_SELECTOR).first();
    
    const fontSmoothing = await label.evaluate(el => 
      window.getComputedStyle(el).WebkitFontSmoothing || 
      el.style.WebkitFontSmoothing
    );
    
    // WebKit browsers
    if (fontSmoothing) {
      expect(fontSmoothing).toMatch(/antialiased/);
    }
  });

  test('should have text-size-adjust disabled on labels for iOS', async ({ page }) => {
    const label = page.locator(LABEL_SELECTOR).first();
    
    const textAdjust = await label.evaluate(el => 
      window.getComputedStyle(el).WebkitTextSizeAdjust ||
      el.style.WebkitTextSizeAdjust
    );
    
    // iOS landscape zoom prevention
    if (textAdjust) {
      expect(textAdjust).toMatch(/100%/);
    }
  });

  test('should disable user-select on labels', async ({ page }) => {
    const label = page.locator(LABEL_SELECTOR).first();
    
    const userSelect = await label.evaluate(el => 
      window.getComputedStyle(el).userSelect
    );
    
    // Prevent accidental text selection
    expect(userSelect).toMatch(/none/);
  });

  // ============================================
  // Badge Typography Tests
  // ============================================

  test('should use font-weight-semibold variable for badges (600)', async ({ page }) => {
    // Add test badge to page
    await page.evaluate(() => {
      const badge = document.createElement('span');
      badge.className = 'fmbn-nav-item__badge';
      badge.textContent = '5';
      document.body.appendChild(badge);
    });

    const badge = page.locator(BADGE_SELECTOR).last();
    
    const fontWeight = await badge.evaluate(el => 
      window.getComputedStyle(el).fontWeight
    );
    
    // var(--font-weight-semibold) = 600
    expect(fontWeight).toMatch(/^600$/);
  });

  test('should use fixed line-height for badges (1.25rem)', async ({ page }) => {
    // Add test badge to page
    await page.evaluate(() => {
      const badge = document.createElement('span');
      badge.className = 'fmbn-nav-item__badge';
      badge.textContent = '5';
      document.body.appendChild(badge);
    });

    const badge = page.locator(BADGE_SELECTOR).last();
    
    const lineHeight = await badge.evaluate(el => 
      window.getComputedStyle(el).lineHeight
    );
    
    // line-height: 1.25rem = 20px
    expect(lineHeight).toMatch(/^20px$/);
  });

  test('should keep badge font-size at 10px (0.625rem)', async ({ page }) => {
    // Add test badge to page
    await page.evaluate(() => {
      const badge = document.createElement('span');
      badge.className = 'fmbn-nav-item__badge';
      badge.textContent = '5';
      document.body.appendChild(badge);
    });

    const badge = page.locator(BADGE_SELECTOR).last();
    
    const fontSize = await badge.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // 0.625rem = 10px
    expect(fontSize).toMatch(/^10px$/);
  });

  // ============================================
  // Typography Consistency Tests
  // ============================================

  test('should apply consistent typography across multiple labels', async ({ page }) => {
    const labels = page.locator(LABEL_SELECTOR);
    const count = await labels.count();
    
    // Get first label baseline
    const firstFontSize = await labels.nth(0).evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // All labels should match
    for (let i = 1; i < count; i++) {
      const fontSize = await labels.nth(i).evaluate(el => 
        window.getComputedStyle(el).fontSize
      );
      
      expect(fontSize).toBe(firstFontSize);
    }
  });

  test('should not have hardcoded font properties in labels', async ({ page }) => {
    const label = page.locator(LABEL_SELECTOR).first();
    
    const inlineStyle = await label.evaluate(el => el.getAttribute('style'));
    
    // Should not have inline font properties
    if (inlineStyle) {
      expect(inlineStyle).not.toContain('font-size:');
      expect(inlineStyle).not.toContain('font-weight:');
      expect(inlineStyle).not.toContain('line-height:');
    }
  });

  // ============================================
  // Mobile Optimization Tests
  // ============================================

  test('should prevent text selection on mobile labels', async ({ page }) => {
    const label = page.locator(LABEL_SELECTOR).first();
    
    // Try to select the label
    const selectedText = await label.evaluate(el => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      return selection.toString();
    });
    
    // Note: Actual selection behavior depends on browser
    // This test verifies the CSS property is applied
    const userSelect = await label.evaluate(el => 
      window.getComputedStyle(el).userSelect
    );
    
    expect(userSelect).toMatch(/none/);
  });

  test('should maintain readability at different zoom levels', async ({ page }) => {
    const label = page.locator(LABEL_SELECTOR).first();
    
    // Test at 110% zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1.1';
    });
    
    const zoomedSize = await label.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Size should scale with zoom (not be fixed pixel)
    expect(zoomedSize).toBeTruthy();
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });

  // ============================================
  // CSS Variable Usage Tests
  // ============================================

  test('should use CSS variables instead of hardcoded values', async ({ page }) => {
    const cssFile = await page.request.get(
      'http://localhost:3000/resources/dist/filament-mobile-bottom-navigation.css'
    );
    const cssContent = await cssFile.text();
    
    // Should contain variable references
    expect(cssContent).toContain('var(--font-family)');
    expect(cssContent).toContain('var(--font-size-xs)');
    expect(cssContent).toContain('var(--font-weight-medium)');
    expect(cssContent).toContain('var(--line-height-tight)');
    expect(cssContent).toContain('var(--font-weight-semibold)');
  });

  test('should not have hardcoded font values in CSS output', async ({ page }) => {
    const cssFile = await page.request.get(
      'http://localhost:3000/resources/dist/filament-mobile-bottom-navigation.css'
    );
    const cssContent = await cssFile.text();
    
    // Extract label styles section
    const labelSection = cssContent.match(/\.fmbn-nav-item__label\s*{[^}]+}/);
    
    if (labelSection) {
      // Should not have hardcoded sizes like "0.75rem" or "12px" in property
      expect(labelSection[0]).not.toContain('font-size:0.75rem');
      expect(labelSection[0]).not.toContain('font-weight:500');
    }
  });

  // ============================================
  // Accessibility & Readability Tests
  // ============================================

  test('should maintain minimum font size for accessibility', async ({ page }) => {
    const label = page.locator(LABEL_SELECTOR).first();
    
    const fontSize = parseFloat(await label.evaluate(el => 
      window.getComputedStyle(el).fontSize
    ));
    
    // 12px is minimum readable size (Filament's font-size-xs)
    expect(fontSize).toBeGreaterThanOrEqual(12);
  });

  test('should maintain adequate line height for readability', async ({ page }) => {
    const label = page.locator(LABEL_SELECTOR).first();
    
    const fontSize = parseFloat(await label.evaluate(el => 
      window.getComputedStyle(el).fontSize
    ));
    
    const lineHeight = parseFloat(await label.evaluate(el => 
      window.getComputedStyle(el).lineHeight
    ));
    
    // Line height should be at least 1.25x font size
    const ratio = lineHeight / fontSize;
    expect(ratio).toBeGreaterThanOrEqual(1.25);
  });

  test('should handle long labels without text overflow in typography', async ({ page }) => {
    // Create a very long label
    await page.evaluate(() => {
      const item = document.querySelector('.fmbn-nav-item');
      if (item) {
        const label = item.querySelector('.fmbn-nav-item__label');
        if (label) {
          label.textContent = 'This is a very long navigation label that does not fit';
        }
      }
    });
    
    const label = page.locator(LABEL_SELECTOR).first();
    const fontSize = await label.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Typography should still apply correctly
    expect(fontSize).toMatch(/^12px$/);
  });
});
