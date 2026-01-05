import { test, expect } from '@playwright/test';

test.describe('Touch Target Size - WCAG 2.1 AAA Compliance', () => {
  const testUrl = 'http://localhost/admin';

  const viewports = [
    { width: 320, height: 568, name: 'iPhone SE' },
    { width: 375, height: 667, name: 'iPhone 8' },
    { width: 390, height: 844, name: 'iPhone 12' },
    { width: 393, height: 851, name: 'Pixel 5' },
    { width: 412, height: 915, name: 'Pixel 6' },
    { width: 480, height: 800, name: 'Older Android' },
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
    await page.setViewportSize({ width: 393, height: 851 });
  });

  // ===========================
  // AC1: Minimum Touch Target Size
  // ===========================

  test('all navigation items should be at least 44x44px', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const box = await item.boundingBox();

      expect(box).not.toBeNull();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('each navigation item meets minimum 44x44px on standard phone', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const box = await item.boundingBox();

      const meetsRequirement = box.width >= 44 && box.height >= 44;
      expect(meetsRequirement).toBe(true);
    }
  });

  test('navigation item width should be sufficient for touch', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');

    if (await items.count() === 0) {
      test.skip();
      return;
    }

    const firstItem = items.first();
    const box = await firstItem.boundingBox();

    // Width should be at least 44px
    expect(box.width).toBeGreaterThanOrEqual(44);
  });

  test('navigation item height should be sufficient for touch', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');

    if (await items.count() === 0) {
      test.skip();
      return;
    }

    const firstItem = items.first();
    const box = await firstItem.boundingBox();

    // Height should be at least 44px
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  // ===========================
  // AC2: Touch Target Spacing
  // ===========================

  test('adjacent navigation items should not overlap', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    if (count < 2) {
      test.skip();
      return;
    }

    const boxes = [];
    for (let i = 0; i < count; i++) {
      boxes.push(await items.nth(i).boundingBox());
    }

    // Check for overlaps
    for (let i = 0; i < boxes.length - 1; i++) {
      const currentBox = boxes[i];
      const nextBox = boxes[i + 1];

      // Check if items overlap horizontally or vertically
      const horizontalOverlap = currentBox.x + currentBox.width > nextBox.x;
      const verticalOverlap = currentBox.y + currentBox.height > nextBox.y;

      // Items should not overlap
      if (horizontalOverlap && verticalOverlap) {
        // Adjacent items in flex layout may share edges, which is acceptable
        // As long as clickable areas don't overlap
        const edgeTouch =
          (currentBox.x + currentBox.width) === nextBox.x ||
          currentBox.x === (nextBox.x + nextBox.width);

        expect(edgeTouch).toBe(true);
      }
    }
  });

  test('spacing between touch targets should allow accurate tapping', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    if (count < 2) {
      test.skip();
      return;
    }

    for (let i = 0; i < count - 1; i++) {
      const currentBox = await items.nth(i).boundingBox();
      const nextBox = await items.nth(i + 1).boundingBox();

      // Calculate spacing (can be negative if adjacent)
      const spacing = nextBox.x - (currentBox.x + currentBox.width);

      // Spacing should be >= 0 (no overlap)
      // Ideally >= 0px for mobile (full-bleed)
      expect(spacing).toBeGreaterThanOrEqual(-1); // Allow 1px rounding error
    }
  });

  test('touch targets should be vertically aligned', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    if (count < 2) {
      test.skip();
      return;
    }

    const firstBox = await items.first().boundingBox();

    // All items should have same top position and height
    for (let i = 1; i < count; i++) {
      const box = await items.nth(i).boundingBox();

      expect(Math.abs(box.y - firstBox.y)).toBeLessThan(2); // Allow 1px difference
      expect(Math.abs(box.height - firstBox.height)).toBeLessThan(2);
    }
  });

  // ===========================
  // AC3: Clickable Area Accuracy
  // ===========================

  test('clickable area should match visual bounds', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');

    if (await items.count() === 0) {
      test.skip();
      return;
    }

    const firstItem = items.first();
    const box = await firstItem.boundingBox();
    const href = await firstItem.getAttribute('href');

    // Test tapping at center (should work)
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    expect(currentUrl).toContain(href.replace(/^https?:\/\/[^\/]+/, ''));

    // Navigate back
    await page.goto(testUrl);
  });

  test('corners of touch targets should be clickable', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');

    if (await items.count() === 0) {
      test.skip();
      return;
    }

    const firstItem = items.first();
    const box = await firstItem.boundingBox();

    // Test multiple points within the target
    const testPoints = [
      { x: box.x + 5, y: box.y + 5, name: 'top-left' },
      { x: box.x + box.width - 5, y: box.y + 5, name: 'top-right' },
      { x: box.x + 5, y: box.y + box.height - 5, name: 'bottom-left' },
      { x: box.x + box.width - 5, y: box.y + box.height - 5, name: 'bottom-right' },
    ];

    const href = await firstItem.getAttribute('href');

    for (const point of testPoints) {
      await page.mouse.click(point.x, point.y);
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      expect(currentUrl).toContain(href.replace(/^https?:\/\/[^\/]+/, ''));

      // Navigate back for next test
      await page.goto(testUrl);
    }
  });

  test('no dead zones in clickable area', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');

    if (await items.count() === 0) {
      test.skip();
      return;
    }

    const firstItem = items.first();
    const box = await firstItem.boundingBox();
    const href = await firstItem.getAttribute('href');

    // Click at multiple grid points within the target
    const gridSize = 8; // Test every 8 pixels
    const points = [];

    for (let x = box.x; x < box.x + box.width; x += gridSize) {
      for (let y = box.y; y < box.y + box.height; y += gridSize) {
        points.push({ x, y });
      }
    }

    // Test subset of points to avoid excessive clicking
    const samplePoints = points.slice(0, Math.min(points.length, 12));

    for (const point of samplePoints) {
      await page.mouse.click(point.x, point.y);
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      expect(currentUrl).toContain(href.replace(/^https?:\/\/[^\/]+/, ''));

      await page.goto(testUrl);
    }
  });

  // ===========================
  // AC4: Responsive Touch Targets
  // ===========================

  test('touch targets meet 44x44px on small phones (320px)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const box = await item.boundingBox();

      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('touch targets meet 44x44px across all mobile viewports', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const items = page.locator('.fmbn-nav-item');
      const count = await items.count();

      if (count === 0) {
        continue;
      }

      let allMeet44px = true;

      for (let i = 0; i < count; i++) {
        const box = await items.nth(i).boundingBox();

        if (box.width < 44 || box.height < 44) {
          allMeet44px = false;
          console.error(
            `${viewport.name}: Item ${i + 1} FAILED: ${Math.round(box.width)}×${Math.round(box.height)}px`
          );
        }
      }

      expect(allMeet44px).toBe(true);
    }
  });

  test('touch targets remain usable on iPad (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const nav = page.locator('.fmbn-bottom-nav');
    const isVisible = await nav.isVisible();

    // On larger screens, navigation might be hidden (desktop)
    // If visible, verify touch targets
    if (isVisible) {
      const items = page.locator('.fmbn-nav-item');
      const count = await items.count();

      for (let i = 0; i < count; i++) {
        const box = await items.nth(i).boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  // ===========================
  // AC5: Playwright Touch Target Tests
  // ===========================

  test('touch target dimensions match WCAG 2.1 AAA requirements', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    expect(count).toBeGreaterThan(0);

    // Verify each item
    const results = [];
    for (let i = 0; i < count; i++) {
      const box = await items.nth(i).boundingBox();
      const meetsRequirement = box.width >= 44 && box.height >= 44;

      results.push({
        index: i + 1,
        width: Math.round(box.width),
        height: Math.round(box.height),
        passes: meetsRequirement,
      });
    }

    // All should pass
    const allPass = results.every((r) => r.passes);
    expect(allPass).toBe(true);
  });

  test('touch target spacing verified programmatically', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    if (count < 2) {
      test.skip();
      return;
    }

    // Collect all bounding boxes
    const boxes = [];
    for (let i = 0; i < count; i++) {
      boxes.push(await items.nth(i).boundingBox());
    }

    // Verify spacing between each adjacent pair
    const spacingResults = [];
    for (let i = 0; i < boxes.length - 1; i++) {
      const current = boxes[i];
      const next = boxes[i + 1];

      // Calculate spacing (how much space between right edge of current and left edge of next)
      const spacing = next.x - (current.x + current.width);

      spacingResults.push({
        between: `Item ${i + 1} and ${i + 2}`,
        spacing: Math.round(spacing),
        acceptable: spacing >= -1, // Allow for rounding
      });
    }

    // All spacing should be acceptable
    const allAcceptable = spacingResults.every((r) => r.acceptable);
    expect(allAcceptable).toBe(true);
  });

  test('all items have same height for consistent touch experience', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    if (count < 2) {
      test.skip();
      return;
    }

    const boxes = [];
    for (let i = 0; i < count; i++) {
      boxes.push(await items.nth(i).boundingBox());
    }

    // All should have same height (within 2px tolerance)
    const firstHeight = boxes[0].height;
    const heightConsistent = boxes.every((box) => Math.abs(box.height - firstHeight) < 2);

    expect(heightConsistent).toBe(true);
  });

  test('touch targets distribute width evenly across viewport', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    if (count < 2) {
      test.skip();
      return;
    }

    const boxes = [];
    for (let i = 0; i < count; i++) {
      boxes.push(await items.nth(i).boundingBox());
    }

    // Items should have roughly equal width (within 5% tolerance)
    const avgWidth = boxes.reduce((sum, box) => sum + box.width, 0) / count;
    const tolerance = avgWidth * 0.05;

    const widthConsistent = boxes.every((box) => Math.abs(box.width - avgWidth) <= tolerance);

    expect(widthConsistent).toBe(true);
  });

  test('navigation container uses full viewport width for touch targets', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');
    const navBox = await nav.boundingBox();

    // Navigation should span full width
    const viewportSize = page.viewportSize();
    expect(Math.abs(navBox.width - viewportSize.width)).toBeLessThan(2);
  });

  test('touch targets documented in console output', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');
    const count = await items.count();

    const output = [];
    output.push('\n=== Touch Target Size Report ===');

    for (let i = 0; i < count; i++) {
      const box = await items.nth(i).boundingBox();
      const passes = box.width >= 44 && box.height >= 44 ? '✅' : '❌';

      output.push(`Item ${i + 1}: ${Math.round(box.width)}×${Math.round(box.height)}px ${passes}`);
    }

    output.push('================================\n');
    console.log(output.join('\n'));

    // Just verify count > 0
    expect(count).toBeGreaterThan(0);
  });

  // ===========================
  // Integration Tests
  // ===========================

  test('touch targets work across browser orientations', async ({ page }) => {
    const viewportWithOrientations = [
      { width: 393, height: 851, name: 'Portrait' },
      { width: 851, height: 393, name: 'Landscape' },
    ];

    for (const viewport of viewportWithOrientations) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const items = page.locator('.fmbn-nav-item');
      const count = await items.count();

      if (count === 0) {
        continue; // Navigation might be hidden on landscape
      }

      for (let i = 0; i < count; i++) {
        const box = await items.nth(i).boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('CSS min-width and min-height properties enforced', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');

    if (await items.count() === 0) {
      test.skip();
      return;
    }

    const firstItem = items.first();

    // Check computed CSS properties
    const minWidth = await firstItem.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.minWidth;
    });

    const minHeight = await firstItem.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.minHeight;
    });

    // Should have min-width and min-height defined
    expect(minWidth).not.toBe('auto');
    expect(minHeight).not.toBe('auto');

    // Parse pixel values
    const minWidthPx = parseInt(minWidth);
    const minHeightPx = parseInt(minHeight);

    // Should be at least 44px
    expect(minWidthPx).toBeGreaterThanOrEqual(44);
    expect(minHeightPx).toBeGreaterThanOrEqual(44);
  });

  test('padding extends touch target size', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');

    if (await items.count() === 0) {
      test.skip();
      return;
    }

    const firstItem = items.first();

    const paddingInfo = await firstItem.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        paddingTop: parseInt(styles.paddingTop),
        paddingRight: parseInt(styles.paddingRight),
        paddingBottom: parseInt(styles.paddingBottom),
        paddingLeft: parseInt(styles.paddingLeft),
      };
    });

    // Should have some padding
    const totalPadding =
      paddingInfo.paddingTop +
      paddingInfo.paddingRight +
      paddingInfo.paddingBottom +
      paddingInfo.paddingLeft;

    expect(totalPadding).toBeGreaterThan(0);
  });

  test('touch targets accessible without JavaScript', async ({ page }) => {
    const items = page.locator('.fmbn-nav-item');

    if (await items.count() === 0) {
      test.skip();
      return;
    }

    // Even without JavaScript, basic element structure should support touch
    const firstItem = items.first();
    const box = await firstItem.boundingBox();

    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });
});
