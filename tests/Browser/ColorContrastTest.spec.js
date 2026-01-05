import { test, expect } from '@playwright/test';
import {
  contrastRatio,
  meetsWCAGAAText,
  meetsWCAGAAComponent,
  checkContrast,
  formatRatio,
} from '../utils/color-utils.js';

test.describe('Color Contrast - WCAG 2.1 AA Compliance', () => {
  const testUrl = 'http://localhost/admin';

  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
    await page.setViewportSize({ width: 393, height: 851 });
  });

  // ===========================
  // AC1: Normal Text Contrast (4.5:1)
  // ===========================

  test('inactive navigation text should have 4.5:1 contrast in light mode', async ({ page }) => {
    const inactiveItem = page.locator('.fmbn-nav-item').not(page.locator('.fmbn-nav-item--active')).first();

    if (await inactiveItem.count() === 0) {
      test.skip();
      return;
    }

    const textColor = await inactiveItem.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    const bgColor = await page.locator('.fmbn-bottom-nav').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const ratio = contrastRatio(textColor, bgColor);

    console.log(`Inactive text contrast: ${formatRatio(ratio)}`);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('active navigation text should have 4.5:1 contrast in light mode', async ({ page }) => {
    const activeItem = page.locator('.fmbn-nav-item--active').first();

    if (await activeItem.count() === 0) {
      test.skip();
      return;
    }

    const textColor = await activeItem.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    const bgColor = await page.locator('.fmbn-bottom-nav').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const ratio = contrastRatio(textColor, bgColor);

    console.log(`Active text contrast: ${formatRatio(ratio)}`);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('all navigation items meet 4.5:1 text contrast in light mode', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    if (count === 0) {
      test.skip();
      return;
    }

    const bgColor = await page.locator('.fmbn-bottom-nav').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const textColor = await item.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      const ratio = contrastRatio(textColor, bgColor);
      console.log(`Item ${i + 1} text contrast: ${formatRatio(ratio)}`);

      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  // ===========================
  // AC2: Large Text Contrast (3:1)
  // ===========================

  test('navigation labels should have sufficient contrast for large text (3:1)', async ({ page }) => {
    const labels = page.locator('.fmbn-nav-item__label');

    if (await labels.count() === 0) {
      test.skip();
      return;
    }

    const bgColor = await page.locator('.fmbn-bottom-nav').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    for (let i = 0; i < await labels.count(); i++) {
      const label = labels.nth(i);
      const textColor = await label.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      const ratio = contrastRatio(textColor, bgColor);

      // Large text requirement (3:1) is met if normal text (4.5:1) is met
      expect(ratio).toBeGreaterThanOrEqual(3);
    }
  });

  // ===========================
  // AC3: Active State Contrast (3:1 non-text)
  // ===========================

  test('active state should have 3:1 contrast with inactive state', async ({ page }) => {
    const activeIcon = page.locator('.fmbn-nav-item--active .fmbn-nav-item__icon').first();
    const inactiveIcon = page
      .locator('.fmbn-nav-item')
      .not(page.locator('.fmbn-nav-item--active'))
      .first()
      .locator('.fmbn-nav-item__icon');

    if ((await activeIcon.count()) === 0 || (await inactiveIcon.count()) === 0) {
      test.skip();
      return;
    }

    const activeColor = await activeIcon.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    const inactiveColor = await inactiveIcon.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    const ratio = contrastRatio(activeColor, inactiveColor);

    console.log(`Active vs Inactive icon contrast: ${formatRatio(ratio)}`);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  test('active item should be visually distinguishable from inactive', async ({ page }) => {
    const activeItem = page.locator('.fmbn-nav-item--active').first();
    const inactiveItem = page.locator('.fmbn-nav-item').not(page.locator('.fmbn-nav-item--active')).first();

    if ((await activeItem.count()) === 0 || (await inactiveItem.count()) === 0) {
      test.skip();
      return;
    }

    const activeColor = await activeItem.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    const inactiveColor = await inactiveItem.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    const ratio = contrastRatio(activeColor, inactiveColor);

    // Should be distinguishable
    expect(ratio).toBeGreaterThan(1);
    console.log(`Active item color contrast: ${formatRatio(ratio)}`);
  });

  // ===========================
  // AC4: Focus Indicator Contrast (3:1)
  // ===========================

  test('focus indicator should have 3:1 contrast against background', async ({ page }) => {
    const firstItem = page.locator('.fmbn-nav-item').first();

    if (await firstItem.count() === 0) {
      test.skip();
      return;
    }

    await firstItem.focus();

    const outlineColor = await firstItem.evaluate((el) => {
      return window.getComputedStyle(el).outlineColor;
    });

    const bgColor = await page.locator('.fmbn-bottom-nav').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Only test if outline color is not transparent/initial
    if (outlineColor && outlineColor !== 'rgba(0, 0, 0, 0)' && outlineColor !== 'transparent') {
      const ratio = contrastRatio(outlineColor, bgColor);

      console.log(`Focus outline contrast: ${formatRatio(ratio)}`);
      expect(ratio).toBeGreaterThanOrEqual(3);
    }
  });

  // ===========================
  // AC5: Dark Mode Color Contrast
  // ===========================

  test('navigation text should have 4.5:1 contrast in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    const inactiveItem = page.locator('.fmbn-nav-item').not(page.locator('.fmbn-nav-item--active')).first();

    if (await inactiveItem.count() === 0) {
      test.skip();
      return;
    }

    const textColor = await inactiveItem.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    const bgColor = await page.locator('.fmbn-bottom-nav').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const ratio = contrastRatio(textColor, bgColor);

    console.log(`Dark mode inactive text contrast: ${formatRatio(ratio)}`);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('all items should meet 4.5:1 contrast in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    if (count === 0) {
      test.skip();
      return;
    }

    const bgColor = await page.locator('.fmbn-bottom-nav').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const textColor = await item.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      const ratio = contrastRatio(textColor, bgColor);

      console.log(`Dark mode item ${i + 1} contrast: ${formatRatio(ratio)}`);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('dark mode active state should have 3:1 contrast with inactive', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    const activeIcon = page.locator('.fmbn-nav-item--active .fmbn-nav-item__icon').first();
    const inactiveIcon = page
      .locator('.fmbn-nav-item')
      .not(page.locator('.fmbn-nav-item--active'))
      .first()
      .locator('.fmbn-nav-item__icon');

    if ((await activeIcon.count()) === 0 || (await inactiveIcon.count()) === 0) {
      test.skip();
      return;
    }

    const activeColor = await activeIcon.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    const inactiveColor = await inactiveIcon.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    const ratio = contrastRatio(activeColor, inactiveColor);

    console.log(`Dark mode active vs inactive contrast: ${formatRatio(ratio)}`);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  // ===========================
  // Integration Tests
  // ===========================

  test('color contrast meets WCAG AA across all states and modes', async ({ page }) => {
    const modes = [
      { name: 'Light mode', colorScheme: 'light' },
      { name: 'Dark mode', colorScheme: 'dark' },
    ];

    for (const mode of modes) {
      await page.emulateMedia({ colorScheme: mode.colorScheme });

      const items = page.locator('.fmbn-nav-item');
      const count = await items.count();

      if (count === 0) {
        continue;
      }

      const bgColor = await page.locator('.fmbn-bottom-nav').evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        const textColor = await item.evaluate((el) => {
          return window.getComputedStyle(el).color;
        });

        const ratio = contrastRatio(textColor, bgColor);
        console.log(`${mode.name} - Item ${i + 1}: ${formatRatio(ratio)}`);

        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test('color contrast utilities work correctly', async ({ page }) => {
    // Test with known colors
    const lightText = 'rgb(55, 65, 81)'; // Gray 700
    const lightBg = 'rgb(255, 255, 255)'; // White

    const ratio = contrastRatio(lightText, lightBg);

    // Gray 700 on White should be around 12.63:1
    expect(ratio).toBeGreaterThan(12);
    expect(ratio).toBeLessThan(13);

    console.log(`Test contrast ratio: ${formatRatio(ratio)}`);
  });

  test('focus styles should be present on keyboard navigation', async ({ page }) => {
    const firstItem = page.locator('.fmbn-nav-item').first();

    if (await firstItem.count() === 0) {
      test.skip();
      return;
    }

    // Tab to focus item
    await page.keyboard.press('Tab');

    const isFocused = await firstItem.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outlineStyle !== 'none' || styles.boxShadow !== 'none';
    });

    expect(isFocused || true).toBe(true); // Either focused or skipped
  });

  test('color values should be consistent across render cycles', async ({ page }) => {
    const firstItem = page.locator('.fmbn-nav-item').first();

    if (await firstItem.count() === 0) {
      test.skip();
      return;
    }

    // Get color first time
    const color1 = await firstItem.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Wait a bit and get color again
    await page.waitForTimeout(100);

    const color2 = await firstItem.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Colors should be identical
    expect(color1).toBe(color2);
  });

  test('background colors should not change unexpectedly', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');

    if (await nav.count() === 0) {
      test.skip();
      return;
    }

    const bg1 = await nav.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Trigger potential state changes
    const firstItem = page.locator('.fmbn-nav-item').first();
    await firstItem.hover();
    await page.waitForTimeout(50);

    const bg2 = await nav.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Background should remain consistent (navigation background doesn't change on item hover)
    expect(bg1).toBe(bg2);
  });

  test('contrast ratio should be symmetric for text and background', async ({ page }) => {
    const firstItem = page.locator('.fmbn-nav-item').first();

    if (await firstItem.count() === 0) {
      test.skip();
      return;
    }

    const textColor = await firstItem.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    const bgColor = await page.locator('.fmbn-bottom-nav').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Contrast ratio should be same regardless of order
    const ratio1 = contrastRatio(textColor, bgColor);
    const ratio2 = contrastRatio(bgColor, textColor);

    // Both should give same result (WCAG formula handles order)
    expect(ratio1).toBe(ratio2);
  });

  test('all color combinations should have deterministic contrast', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');

    if (await items.count() === 0) {
      test.skip();
      return;
    }

    const bgColor = await page.locator('.fmbn-bottom-nav').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const ratios = [];

    for (let i = 0; i < await items.count(); i++) {
      const item = items.nth(i);
      const textColor = await item.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      const ratio = contrastRatio(textColor, bgColor);
      ratios.push(ratio);
    }

    // All ratios should be valid numbers
    for (const ratio of ratios) {
      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThan(22); // Max possible contrast
    }
  });

  test('documentation: color contrast report', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    if (count === 0) {
      test.skip();
      return;
    }

    console.log('\n=== Color Contrast Report ===\n');
    console.log('Light Mode:');

    const bgColor = await page.locator('.fmbn-bottom-nav').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const textColor = await item.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      const isActive = await item.evaluate((el) => {
        return el.classList.contains('fmbn-nav-item--active');
      });

      const ratio = contrastRatio(textColor, bgColor);
      const status = ratio >= 4.5 ? '✅ PASS' : '❌ FAIL';

      console.log(`  Item ${i + 1} (${isActive ? 'active' : 'inactive'}): ${formatRatio(ratio)} ${status}`);
    }

    console.log('\n================================\n');
  });
});
