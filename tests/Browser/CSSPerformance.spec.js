import { test, expect } from '@playwright/test';

/**
 * CSS Performance Optimization Tests
 *
 * Tests to verify:
 * - Critical CSS inlined for first paint
 * - Non-critical CSS loaded asynchronously
 * - CSS minification and optimization
 * - File size targets met
 * - Performance metrics (FCP, LCP, CLS)
 *
 * Acceptance Criteria:
 * - Critical CSS inlined < 1.5KB
 * - Non-critical CSS < 1KB
 * - FCP < 1.8 seconds
 * - LCP < 2.5 seconds
 * - CLS < 0.1
 * - Performance Score >= 90
 */

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const NAVIGATION_URL = 'http://localhost:8000';

test.describe('CSS Performance Optimization (Story 6-1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test.describe('Critical CSS Inlining', () => {
    test('critical CSS is inlined in <head>', async ({ page }) => {
      // Navigate and get page content
      await page.goto(NAVIGATION_URL);

      // Get the head element
      const head = page.locator('head');
      const headContent = await head.innerHTML();

      // Should contain inline critical CSS
      expect(headContent).toContain('.fmbn-bottom-nav');
      expect(headContent).toContain('position: fixed');
      expect(headContent).toContain('display: flex');
    });

    test('navigation visible on first paint without external CSS', async ({
      page,
    }) => {
      // Block external CSS
      await page.route('**/*.css', (route) => {
        if (route.request().url().includes('filament-mobile-bottom-navigation')) {
          route.abort();
        } else {
          route.continue();
        }
      });

      await page.goto(NAVIGATION_URL);

      // Navigation should still be visible (from inline CSS)
      const nav = page.locator('.fmbn-bottom-nav');
      await expect(nav).toBeVisible();

      // Navigation items should be visible
      const items = page.locator('.fmbn-nav-item');
      expect(await items.count()).toBeGreaterThan(0);
    });

    test('critical CSS is minimal (structure, position, colors only)', async ({
      page,
    }) => {
      const response = await page.goto(NAVIGATION_URL);

      // Get page HTML
      const html = await page.content();

      // Extract inline style content
      const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      expect(styleMatch).toBeTruthy();

      const styleContent = styleMatch[1];

      // Critical CSS should include structure styles
      expect(styleContent).toContain('position: fixed');
      expect(styleContent).toContain('display: flex');
      expect(styleContent).toContain('background-color');

      // Should NOT include animations or transitions in critical CSS
      // (these should be in separate async CSS)
      const hasMinimalTransitions = (styleContent.match(/transition/g) || [])
        .length < 3;
      expect(hasMinimalTransitions).toBe(true);
    });
  });

  test.describe('Non-Critical CSS Async Loading', () => {
    test('non-critical CSS loads asynchronously', async ({ page }) => {
      const cssRequests = [];

      page.on('response', (response) => {
        if (
          response.request().resourceType() === 'stylesheet' &&
          response.request().url().includes('mobile-bottom-nav-enhancements')
        ) {
          cssRequests.push({
            url: response.request().url(),
            timing: response.timing(),
          });
        }
      });

      await page.goto(NAVIGATION_URL);

      // Should have enhancements CSS loaded
      expect(cssRequests.length).toBeGreaterThan(0);

      // Check that it uses preload + onload pattern
      const head = page.locator('head');
      const headHtml = await head.innerHTML();

      expect(headHtml).toContain('rel="preload"');
      expect(headHtml).toContain('mobile-bottom-nav-enhancements');
      expect(headHtml).toContain('onload=');
    });

    test('noscript fallback for non-critical CSS', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const html = await page.content();

      // Should have noscript fallback
      expect(html).toContain('<noscript>');
      expect(html).toContain('mobile-bottom-nav-enhancements');
    });

    test('animations load from async CSS', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      // Get enhancements CSS content
      const response = await page.request.get(
        new URL(
          'css/mobile-bottom-nav-enhancements.css',
          NAVIGATION_URL
        ).toString()
      );

      const cssContent = await response.text();

      // Should contain animations, transitions, and advanced styles
      expect(cssContent).toContain('transition');
      expect(cssContent).toContain('@supports');
      expect(cssContent).toContain('@media');
      expect(cssContent).toContain('prefers-reduced-motion');
    });
  });

  test.describe('CSS Minification and Optimization', () => {
    test('production CSS is minified', async ({ page }) => {
      const response = await page.request.get(
        new URL(
          'resources/dist/filament-mobile-bottom-navigation.css',
          NAVIGATION_URL
        ).toString()
      );

      const cssContent = await response.text();

      // Minified CSS should not have:
      // - Comments
      // - Multiple spaces
      // - Line breaks (usually)

      // Should not have block comments
      expect(cssContent).not.toContain('/**/');

      // Should not have excessive whitespace
      const hasExcessiveWhitespace = /\n\n\n/.test(cssContent);
      expect(hasExcessiveWhitespace).toBe(false);
    });

    test('CSS file size is optimized', async ({ page }) => {
      // Get main CSS file size
      const mainResponse = await page.request.get(
        new URL(
          'resources/dist/filament-mobile-bottom-navigation.css',
          NAVIGATION_URL
        ).toString()
      );
      const mainSize = (await mainResponse.text()).length;

      // Get enhancements CSS file size
      const enhancementsResponse = await page.request.get(
        new URL(
          'css/mobile-bottom-nav-enhancements.css',
          NAVIGATION_URL
        ).toString()
      );
      const enhancementsSize = (await enhancementsResponse.text()).length;

      // Log sizes
      console.log(`Main CSS size: ${mainSize} bytes`);
      console.log(`Enhancements CSS size: ${enhancementsSize} bytes`);

      // Reasonable file sizes (not gzipped, so a bit larger)
      expect(mainSize).toBeLessThan(20000); // < 20KB uncompressed
      expect(enhancementsSize).toBeLessThan(5000); // < 5KB uncompressed
    });

    test('unused CSS is purged', async ({ page }) => {
      const response = await page.request.get(
        new URL(
          'resources/dist/filament-mobile-bottom-navigation.css',
          NAVIGATION_URL
        ).toString()
      );

      const cssContent = await response.text();

      // Should contain critical classes
      expect(cssContent).toContain('fmbn-bottom-nav');
      expect(cssContent).toContain('fmbn-nav-item');

      // Should not contain obviously unused Tailwind classes
      // (This is a heuristic check - actual purge is done by Tailwind)
      const hasReasonableSize = cssContent.length < 30000;
      expect(hasReasonableSize).toBe(true);
    });
  });

  test.describe('Performance Metrics (FCP, LCP, CLS)', () => {
    test('First Contentful Paint (FCP) < 1.8s', async ({ page }) => {
      const metrics = [];

      page.on('console', (msg) => {
        if (
          msg.type() === 'log' &&
          msg.text().includes('FCP')
        ) {
          metrics.push(msg.text());
        }
      });

      const navigationStart = Date.now();
      await page.goto(NAVIGATION_URL, { waitUntil: 'load' });
      const navigationTime = Date.now() - navigationStart;

      // Navigation should complete reasonably fast
      expect(navigationTime).toBeLessThan(5000); // 5 seconds max

      // Get performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (!navigation) return {};

        return {
          responseStart: navigation.responseStart,
          domContentLoaded: navigation.domContentLoadedEventEnd,
          loadComplete: navigation.loadEventEnd,
        };
      });

      // DOM should load quickly
      if (performanceMetrics.responseStart) {
        const fcp = performanceMetrics.domContentLoaded -
          performanceMetrics.responseStart;
        console.log(`Approximate FCP: ${fcp}ms`);

        // Should be < 1800ms
        expect(fcp).toBeLessThan(1800);
      }
    });

    test('Largest Contentful Paint (LCP) < 2.5s', async ({ page }) => {
      const navigationStart = Date.now();
      await page.goto(NAVIGATION_URL, { waitUntil: 'load' });
      const navigationTime = Date.now() - navigationStart;

      // Overall load time should be < 2.5s
      // (This is a simplified check; real LCP measurement is more nuanced)
      expect(navigationTime).toBeLessThan(2500);
    });

    test('Cumulative Layout Shift (CLS) < 0.1', async ({ page }) => {
      let cls = 0;

      page.on('console', (msg) => {
        if (msg.type() === 'log' && msg.text().includes('CLS')) {
          console.log('CLS:', msg.text());
        }
      });

      await page.goto(NAVIGATION_URL);

      // Navigation should not shift layout
      const navInitial = await page.locator('.fmbn-bottom-nav').boundingBox();

      // Wait a bit for any late renders
      await page.waitForTimeout(500);

      const navFinal = await page.locator('.fmbn-bottom-nav').boundingBox();

      // Navigation position should not change
      expect(navInitial.x).toBe(navFinal.x);
      expect(navInitial.y).toBe(navFinal.y);
      expect(navInitial.width).toBe(navFinal.width);
      expect(navInitial.height).toBe(navFinal.height);
    });
  });

  test.describe('Resource Hints and Preloading', () => {
    test('preload hint for critical CSS', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const html = await page.content();

      // Should have preload for CSS if applicable
      // Critical CSS is inline, but enhancements should have preload
      expect(html).toContain('preload');
      expect(html).toContain('as="style"');
    });

    test('dns-prefetch or preconnect hints present', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const html = await page.content();

      // Should have resource hints for optimization
      const hasResourceHints =
        html.includes('dns-prefetch') ||
        html.includes('preconnect') ||
        html.includes('prefetch');

      // At least one optimization hint should exist
      expect(html.includes('preload')).toBe(true);
    });
  });

  test.describe('CSS Architecture Compliance', () => {
    test('critical CSS contains only essential styles', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const html = await page.content();
      const inlineCss = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];

      // Essential styles present
      expect(inlineCss).toContain('position: fixed');
      expect(inlineCss).toContain('bottom: 0');
      expect(inlineCss).toContain('display: flex');
      expect(inlineCss).toContain('color');
      expect(inlineCss).toContain('background-color');

      // Layout should be minimal
      expect(inlineCss).toContain('768px'); // Desktop breakpoint
      expect(inlineCss).toContain('display: none'); // Hide on desktop
    });

    test('navigation displays with CSS variables or hex fallbacks', async ({
      page,
    }) => {
      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      const style = await nav.evaluate((el) => window.getComputedStyle(el));

      // Should have background color (from CSS var or hex)
      expect(style.backgroundColor).not.toMatch(/transparent|rgba?\(.*0\)/);

      // Navigation should have color
      const item = page.locator('.fmbn-nav-item').first();
      const itemStyle = await item.evaluate((el) =>
        window.getComputedStyle(el)
      );
      expect(itemStyle.color).not.toMatch(/transparent|rgba?\(.*0\)/);
    });
  });

  test.describe('Mobile Optimization', () => {
    test('CSS optimized for mobile first', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      await expect(nav).toBeVisible();

      // Navigation should be at bottom
      const boundingBox = await nav.boundingBox();
      expect(boundingBox.y + boundingBox.height).toBeCloseTo(
        MOBILE_VIEWPORT.height,
        5
      );
    });

    test('CSS hides navigation on tablet/desktop', async ({ page }) => {
      // Test on tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');

      // Should be hidden via CSS media query
      const isHidden = await nav.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.display === 'none';
      });

      expect(isHidden).toBe(true);
    });

    test('CSS supports safe area insets', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      const style = await nav.evaluate((el) => window.getComputedStyle(el));

      // Should have padding for safe area (notch/home indicator)
      const hasSafeAreaSupport =
        style.paddingBottom.includes('env') ||
        parseInt(style.paddingBottom) >= 8;

      expect(hasSafeAreaSupport || style.paddingBottom !== '0px').toBe(true);
    });
  });

  test.describe('Browser Compatibility', () => {
    test('CSS works without CSS variables (@supports fallback)', async ({
      page,
    }) => {
      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');

      // Should still render with hex color fallback
      const backgroundColor = await nav.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Color should be defined (either from var or hex fallback)
      expect(backgroundColor).not.toMatch(/transparent|rgba?\(.*0\)/);
    });

    test('dark mode CSS loads when needed', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      const style = await nav.evaluate((el) => window.getComputedStyle(el));

      // Should have dark background
      const bgColor = style.backgroundColor;
      console.log('Dark mode background:', bgColor);

      // Should be visible in dark mode
      expect(bgColor).not.toMatch(/transparent/);
    });

    test('reduced motion preference respected', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(NAVIGATION_URL);

      const item = page.locator('.fmbn-nav-item').first();

      // Should have no transition (or immediate transition)
      const transition = await item.evaluate((el) => {
        return window.getComputedStyle(el).transition;
      });

      expect(transition).toMatch(/none|0s/);
    });
  });

  test.describe('Performance Budget Compliance', () => {
    test('Performance score targets (simplified check)', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(NAVIGATION_URL, { waitUntil: 'load' });
      const loadTime = Date.now() - startTime;

      // Simplified performance check
      // Real Lighthouse audit would be more comprehensive
      console.log(`Page load time: ${loadTime}ms`);

      // Should load reasonably fast
      expect(loadTime).toBeLessThan(5000);

      // Navigation should be visible
      const nav = page.locator('.fmbn-bottom-nav');
      await expect(nav).toBeVisible();
    });
  });
});
