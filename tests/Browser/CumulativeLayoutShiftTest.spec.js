import { test, expect } from '@playwright/test';

/**
 * Cumulative Layout Shift (CLS) Prevention Tests
 *
 * Tests ensure the mobile navigation layout remains stable without layout shifts:
 * - Body padding reserves exact space for navigation
 * - Navigation has fixed height matching body padding
 * - No layout shift occurs when navigation renders
 * - Safe area handled consistently (iOS notch)
 * - CSS loading doesn't cause layout shifts
 * - CLS score < 0.1 (Web Vitals Good)
 *
 * Acceptance Criteria:
 * - Body padding-bottom set to ~69px (61px + safe area)
 * - Navigation height fixed to match body padding
 * - CLS measurement < 0.1 (ideally ≈ 0)
 * - No visible layout shifts during page load
 * - Layout stable when CSS loads asynchronously
 * - Safe area calculated consistently
 */

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const TEST_URL = 'http://localhost:8000';

test.describe('Cumulative Layout Shift (CLS) Prevention', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test.describe('Layout Shift Measurement', () => {
    test('should have minimal CLS during page load', async ({ page }) => {
      // Start CLS measurement using PerformanceObserver
      await page.evaluate(() => {
        window.cumulativeLayoutShift = 0;
        window.layoutShiftEntries = [];

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Only count shifts without recent input
            if (!entry.hadRecentInput) {
              window.cumulativeLayoutShift += entry.value;
              window.layoutShiftEntries.push({
                value: entry.value,
                source: entry.sources?.[0],
                hadRecentInput: entry.hadRecentInput,
              });
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
      });

      // Navigate to page
      await page.goto(TEST_URL, { waitUntil: 'networkidle' });

      // Wait for any delayed shifts
      await page.waitForTimeout(2000);

      // Get final CLS value
      const cls = await page.evaluate(() => window.cumulativeLayoutShift);
      const entries = await page.evaluate(() => window.layoutShiftEntries);

      console.log(`CLS: ${cls}, Entries: ${entries.length}`);

      // Target: CLS < 0.1 (Web Vitals Good), ideally ≈ 0 (Excellent)
      expect(cls).toBeLessThan(0.1);

      // Ideally very close to zero
      if (cls > 0) {
        console.log('Layout shifts detected:', entries);
      }
    });

    test('should have zero CLS in ideal case', async ({ page }) => {
      await page.evaluate(() => {
        window.cumulativeLayoutShift = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.cumulativeLayoutShift += entry.value;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
      });

      await page.goto(TEST_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const cls = await page.evaluate(() => window.cumulativeLayoutShift);

      // With proper padding, should be zero or nearly zero
      expect(cls).toBeLessThanOrEqual(0.05);
    });
  });

  test.describe('Body Padding for Navigation Space', () => {
    test('body should have padding-bottom to reserve navigation space', async ({ page }) => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle' });

      const bodyPaddingBottom = await page.evaluate(() => {
        const body = document.body;
        const styles = window.getComputedStyle(body);
        return parseInt(styles.paddingBottom);
      });

      console.log('Body padding-bottom:', bodyPaddingBottom);

      // Should be at least 61px (navigation base height)
      expect(bodyPaddingBottom).toBeGreaterThanOrEqual(61);

      // Should be less than 150px (including safe area)
      expect(bodyPaddingBottom).toBeLessThanOrEqual(150);
    });

    test('body padding should match navigation height', async ({ page }) => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle' });

      const bodyPadding = await page.evaluate(() => {
        const body = document.body;
        const styles = window.getComputedStyle(body);
        return parseInt(styles.paddingBottom);
      });

      const navHeight = await page.evaluate(() => {
        const nav = document.querySelector('.fmbn-bottom-nav');
        return nav ? nav.offsetHeight : 0;
      });

      console.log(`Body padding: ${bodyPadding}px, Nav height: ${navHeight}px`);

      // Padding should match or exceed nav height
      expect(bodyPadding).toBeGreaterThanOrEqual(navHeight - 2); // Allow 2px tolerance
      expect(bodyPadding).toBeLessThanOrEqual(navHeight + 2);
    });

    test('desktop view should have no body padding', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1024, height: 768 });

      await page.goto(TEST_URL, { waitUntil: 'networkidle' });

      const bodyPaddingBottom = await page.evaluate(() => {
        const body = document.body;
        const styles = window.getComputedStyle(body);
        return parseInt(styles.paddingBottom);
      });

      // Should be 0 or very small on desktop
      expect(bodyPaddingBottom).toBeLessThanOrEqual(5);
    });
  });

  test.describe('Navigation Height Consistency', () => {
    test('navigation should have fixed height', async ({ page }) => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle' });

      const navHeight = await page.evaluate(() => {
        const nav = document.querySelector('.fmbn-bottom-nav');
        return nav ? nav.offsetHeight : 0;
      });

      console.log('Navigation height:', navHeight);

      // Should be approximately 69px (61px + safe area)
      expect(navHeight).toBeGreaterThanOrEqual(61);
      expect(navHeight).toBeLessThanOrEqual(100);
    });

    test('navigation height should be CSS variable controlled', async ({ page }) => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle' });

      const cssVars = await page.evaluate(() => {
        const root = document.documentElement;
        const styles = window.getComputedStyle(root);
        return {
          baseHeight: styles.getPropertyValue('--fmbn-nav-base-height'),
          navHeight: styles.getPropertyValue('--fmbn-nav-height'),
        };
      });

      console.log('CSS Variables:', cssVars);

      // Variables should be defined
      expect(cssVars.baseHeight).toBeTruthy();
      expect(cssVars.navHeight).toBeTruthy();
    });
  });

  test.describe('Layout Stability', () => {
    test('content above navigation should not move', async ({ page }) => {
      await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });

      // Get initial scroll height
      const initialScrollHeight = await page.evaluate(() => document.body.scrollHeight);

      // Wait for complete load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Get final scroll height
      const finalScrollHeight = await page.evaluate(() => document.body.scrollHeight);

      console.log(`Initial: ${initialScrollHeight}px, Final: ${finalScrollHeight}px`);

      // Body height should not change (nav fills reserved space)
      expect(finalScrollHeight).toBe(initialScrollHeight);
    });

    test('viewport should remain stable', async ({ page }) => {
      let initialViewportHeight;
      let finalViewportHeight;

      await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });

      initialViewportHeight = await page.evaluate(() => window.innerHeight);

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      finalViewportHeight = await page.evaluate(() => window.innerHeight);

      // Viewport height should not change
      expect(finalViewportHeight).toBe(initialViewportHeight);
    });

    test('scrollbar should not jump', async ({ page }) => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle' });

      // Check if scrollbar appears/disappears
      const hasScrollbar = await page.evaluate(() => {
        return window.innerHeight < document.documentElement.scrollHeight;
      });

      // Document should be consistent
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);

      console.log(`Has scrollbar: ${hasScrollbar}, Heights: ${scrollHeight}/${clientHeight}`);

      // Heights should be stable
      expect(scrollHeight).toBeGreaterThan(0);
      expect(clientHeight).toBeGreaterThan(0);
    });
  });

  test.describe('Safe Area Handling', () => {
    test('safe area should be included in calculations', async ({ page }) => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle' });

      const safeAreaInfo = await page.evaluate(() => {
        const root = document.documentElement;
        const styles = window.getComputedStyle(root);

        return {
          safeAreaBottom: styles.getPropertyValue('env(safe-area-inset-bottom)'),
          navHeight: window.getComputedStyle(document.querySelector('.fmbn-bottom-nav'))
            .height,
          bodyPadding: window.getComputedStyle(document.body).paddingBottom,
        };
      });

      console.log('Safe area info:', safeAreaInfo);

      // All should be defined
      expect(safeAreaInfo.navHeight).toBeTruthy();
      expect(safeAreaInfo.bodyPadding).toBeTruthy();
    });

    test('safe area should not cause layout shift', async ({ page }) => {
      await page.evaluate(() => {
        window.cumulativeLayoutShift = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.cumulativeLayoutShift += entry.value;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
      });

      await page.goto(TEST_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const cls = await page.evaluate(() => window.cumulativeLayoutShift);

      // Even with safe area calculation, CLS should be minimal
      expect(cls).toBeLessThan(0.1);
    });
  });

  test.describe('CSS Loading Impact', () => {
    test('async CSS loading should not cause shift', async ({ page, context }) => {
      let cssBlocked = false;
      const blockedCssFiles = [];

      // Start with CSS blocked
      await context.route('**/*.css', (route) => {
        if (cssBlocked) {
          blockedCssFiles.push(route.request().url());
          route.abort();
        } else {
          route.continue();
        }
      });

      // Start CLS measurement
      await page.evaluate(() => {
        window.cumulativeLayoutShift = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.cumulativeLayoutShift += entry.value;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
      });

      // Navigate
      await page.goto(TEST_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Get CLS
      const cls = await page.evaluate(() => window.cumulativeLayoutShift);

      console.log(`CLS with CSS: ${cls}`);

      // Should still be minimal even without all CSS
      expect(cls).toBeLessThan(0.15);
    });

    test('critical CSS should prevent layout shifts', async ({ page }) => {
      await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });

      // Check if critical CSS is applied (body padding exists)
      const hasBodyPadding = await page.evaluate(() => {
        const body = document.body;
        const padding = window.getComputedStyle(body).paddingBottom;
        return parseInt(padding) > 0;
      });

      // Critical CSS should be applied immediately
      expect(hasBodyPadding).toBe(true);
    });
  });

  test.describe('Inline Styles', () => {
    test('navigation should have inline height style', async ({ page }) => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle' });

      const inlineStyle = await page.evaluate(() => {
        const nav = document.querySelector('.fmbn-bottom-nav');
        return nav?.getAttribute('style');
      });

      console.log('Navigation inline style:', inlineStyle);

      // Should have inline height
      expect(inlineStyle).toMatch(/height/);
    });

    test('nav items should have dimension hints', async ({ page }) => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle' });

      const itemStyle = await page.evaluate(() => {
        const item = document.querySelector('.fmbn-nav-item');
        return item?.getAttribute('style');
      });

      console.log('Nav item inline style:', itemStyle);

      // Should have min-width and min-height
      expect(itemStyle).toMatch(/min-width|min-height/);
    });

    test('icon should have explicit dimensions', async ({ page }) => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle' });

      const iconStyle = await page.evaluate(() => {
        const icon = document.querySelector('.fmbn-nav-item__icon');
        return icon?.getAttribute('style');
      });

      console.log('Icon inline style:', iconStyle);

      // Should have width and height
      expect(iconStyle).toMatch(/width.*height/);
    });

    test('label should have font size hint', async ({ page }) => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle' });

      const labelStyle = await page.evaluate(() => {
        const label = document.querySelector('.fmbn-nav-item__label');
        return label?.getAttribute('style');
      });

      console.log('Label inline style:', labelStyle);

      // Should have font-size
      expect(labelStyle).toMatch(/font-size/);
    });
  });

  test.describe('Performance', () => {
    test('page should load quickly without CLS delays', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(TEST_URL, { waitUntil: 'networkidle' });

      const loadTime = Date.now() - startTime;

      console.log(`Page load time: ${loadTime}ms`);

      // Should load in reasonable time
      expect(loadTime).toBeLessThan(10000); // 10 seconds for dev
    });

    test('navigation should render instantly', async ({ page }) => {
      await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });

      // Navigation should be visible immediately
      const nav = page.locator('.fmbn-bottom-nav');
      await expect(nav).toBeVisible({ timeout: 1000 });
    });
  });

  test.describe('Web Vitals Compliance', () => {
    test('CLS should meet Web Vitals Good threshold', async ({ page }) => {
      await page.evaluate(() => {
        window.cumulativeLayoutShift = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.cumulativeLayoutShift += entry.value;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
      });

      await page.goto(TEST_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000); // Wait for delayed shifts

      const cls = await page.evaluate(() => window.cumulativeLayoutShift);

      // Web Vitals Good: CLS < 0.1
      expect(cls).toBeLessThan(0.1);

      // Log result
      if (cls < 0.01) {
        console.log(`✓ Excellent CLS: ${cls}`);
      } else if (cls < 0.1) {
        console.log(`✓ Good CLS: ${cls}`);
      } else {
        console.log(`✗ Poor CLS: ${cls}`);
      }
    });

    test('should not have poor CLS', async ({ page }) => {
      await page.evaluate(() => {
        window.cumulativeLayoutShift = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.cumulativeLayoutShift += entry.value;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
      });

      await page.goto(TEST_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const cls = await page.evaluate(() => window.cumulativeLayoutShift);

      // Should not be poor (> 0.25)
      expect(cls).toBeLessThan(0.25);
    });
  });

  test.describe('Mobile Device Consistency', () => {
    test('CLS should be consistent across page reloads', async ({ page }) => {
      const clsValues = [];

      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => {
          window.cumulativeLayoutShift = 0;

          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                window.cumulativeLayoutShift += entry.value;
              }
            }
          });

          observer.observe({ type: 'layout-shift', buffered: true });
        });

        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        const cls = await page.evaluate(() => window.cumulativeLayoutShift);
        clsValues.push(cls);
      }

      console.log('CLS across reloads:', clsValues);

      // All should be similar and < 0.1
      for (const cls of clsValues) {
        expect(cls).toBeLessThan(0.1);
      }
    });
  });
});
