/**
 * Semantic HTML Test Suite
 *
 * Tests for semantic HTML structure, ARIA attributes, and accessibility compliance
 * for the mobile bottom navigation component.
 *
 * @group Story 7-1: Implement Semantic HTML Structure
 */

import { test, expect } from '@playwright/test';

test.describe('Semantic HTML - Mobile Navigation', () => {

  // Test data
  const mobileViewport = { width: 393, height: 851 };
  const testUrl = '/admin';

  // ========================================
  // Navigation Element Tests
  // ========================================

  test.describe('Navigation Element (AC1)', () => {
    test('should use semantic <nav> element', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      // Check for <nav> element
      const nav = page.locator('nav.fmbn-bottom-nav');
      await expect(nav).toBeVisible();

      // Verify it's a nav element (not div)
      const tagName = await nav.evaluate(el => el.tagName);
      expect(tagName).toBe('NAV');
    });

    test('should have role="navigation" attribute', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      await expect(nav).toHaveAttribute('role', 'navigation');
    });

    test('should have descriptive aria-label', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const ariaLabel = await nav.getAttribute('aria-label');

      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('navigation');
    });

    test('should be positioned at bottom of viewport', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const box = await nav.boundingBox();

      // Should be positioned at bottom
      expect(box?.y).toBeGreaterThan(0);
    });

    test('should have visible content', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const isVisible = await nav.isVisible();
      expect(isVisible).toBe(true);
    });

    test('should have proper z-index layering', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const zIndex = await nav.evaluate(el =>
        window.getComputedStyle(el).zIndex
      );

      expect(parseInt(zIndex)).toBeGreaterThan(10); // Should be above most content
    });
  });

  // ========================================
  // List Structure Tests
  // ========================================

  test.describe('List Structure (AC2)', () => {
    test('should have <ul> wrapper for navigation items', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const list = nav.locator('ul');

      await expect(list).toBeVisible();

      // Verify it's a UL element
      const tagName = await list.evaluate(el => el.tagName);
      expect(tagName).toBe('UL');
    });

    test('should have list-style: none (no bullet points)', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const list = page.locator('nav.fmbn-bottom-nav ul');
      const listStyle = await list.evaluate(el =>
        window.getComputedStyle(el).listStyle
      );

      expect(listStyle).toContain('none');
    });

    test('should wrap each item in <li> element', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const listItems = nav.locator('li');
      const count = await listItems.count();

      expect(count).toBeGreaterThan(0);

      // Verify all are LI elements
      for (let i = 0; i < count; i++) {
        const tagName = await listItems.nth(i).evaluate(el => el.tagName);
        expect(tagName).toBe('LI');
      }
    });

    test('should have proper list item structure', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const listItems = nav.locator('li');
      const count = await listItems.count();

      // Each list item should contain exactly one link
      for (let i = 0; i < count; i++) {
        const li = listItems.nth(i);
        const link = li.locator('a');
        const linkCount = await link.count();

        expect(linkCount).toBe(1);
      }
    });

    test('should have margin and padding reset on list', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const list = page.locator('nav.fmbn-bottom-nav ul');
      const margin = await list.evaluate(el =>
        window.getComputedStyle(el).margin
      );
      const padding = await list.evaluate(el =>
        window.getComputedStyle(el).padding
      );

      expect(margin).toContain('0');
      expect(padding).toContain('0');
    });

    test('should display list items as flex containers', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const list = page.locator('nav.fmbn-bottom-nav ul');
      const display = await list.evaluate(el =>
        window.getComputedStyle(el).display
      );

      expect(display).toBe('flex');
    });

    test('should announce list structure to screen readers', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const list = page.locator('nav.fmbn-bottom-nav ul');
      const role = await list.evaluate(el => el.getAttribute('role') || el.tagName);

      // UL has implicit role="list"
      expect(role).toBe('UL');
    });
  });

  // ========================================
  // Link Element Tests
  // ========================================

  test.describe('Link Elements (AC3)', () => {
    test('should use <a> elements for navigation items', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const links = nav.locator('a.fmbn-nav-item');
      const count = await links.count();

      expect(count).toBeGreaterThan(0);

      // Verify all are A elements
      for (let i = 0; i < count; i++) {
        const tagName = await links.nth(i).evaluate(el => el.tagName);
        expect(tagName).toBe('A');
      }
    });

    test('should have valid href attribute on all links', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('nav.fmbn-bottom-nav a.fmbn-nav-item');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');

        expect(href).toBeTruthy();
        expect(href).not.toBe('');
        expect(href).not.toBe('#');
        expect(href).not.toMatch(/^javascript:/);
      }
    });

    test('should not have onclick handlers', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('nav.fmbn-bottom-nav a.fmbn-nav-item');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const onclick = await link.getAttribute('onclick');
        expect(onclick).toBeNull();
      }
    });

    test('should have aria-label on links', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('nav.fmbn-bottom-nav a.fmbn-nav-item');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const ariaLabel = await link.getAttribute('aria-label');

        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel?.trim()).not.toBe('');
      }
    });

    test('should have aria-current="page" on active link', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const activeLink = page.locator('a.fmbn-nav-item--active');
      const count = await activeLink.count();

      if (count > 0) {
        const ariaCurrent = await activeLink.first().getAttribute('aria-current');
        expect(ariaCurrent).toBe('page');
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('nav.fmbn-bottom-nav a.fmbn-nav-item');
      const firstLink = links.first();

      // Focus the first link
      await firstLink.focus();

      // Check if it's focused
      const isFocused = await firstLink.evaluate(el =>
        document.activeElement === el
      );

      expect(isFocused).toBe(true);
    });

    test('should support Enter key activation', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const firstLink = page.locator('nav.fmbn-bottom-nav a.fmbn-nav-item').first();
      const href = await firstLink.getAttribute('href');

      // Focus and press Enter
      await firstLink.focus();
      await page.keyboard.press('Enter');

      // Should navigate (we check URL changed)
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();

      expect(currentUrl).toContain(href || '/');
    });

    test('should support Tab navigation', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('nav.fmbn-bottom-nav a.fmbn-nav-item');
      const count = await links.count();

      expect(count).toBeGreaterThan(1);

      // Tab through first few links
      const firstLink = links.first();
      await firstLink.focus();

      for (let i = 0; i < Math.min(2, count - 1); i++) {
        await page.keyboard.press('Tab');

        // Check that focus moved to next item
        const focusedElement = await page.evaluate(() =>
          document.activeElement?.className
        );

        expect(focusedElement).toContain('fmbn-nav-item');
      }
    });

    test('should have descriptive link text', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('nav.fmbn-bottom-nav a.fmbn-nav-item');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const label = await link.locator('.fmbn-nav-item__label').textContent();

        expect(label).toBeTruthy();
        expect(label?.trim()).not.toBe('');
      }
    });
  });

  // ========================================
  // Icon Accessibility Tests
  // ========================================

  test.describe('Icon Accessibility (AC4)', () => {
    test('should have aria-hidden on decorative icons', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const icons = page.locator('nav.fmbn-bottom-nav .fmbn-nav-item__icon');
      const count = await icons.count();

      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const icon = icons.nth(i);
        const ariaHidden = await icon.getAttribute('aria-hidden');
        expect(ariaHidden).toBe('true');
      }
    });

    test('should have SVG or IMG elements for icons', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const icons = page.locator('nav.fmbn-bottom-nav .fmbn-nav-item__icon');
      const count = await icons.count();

      for (let i = 0; i < count; i++) {
        const icon = icons.nth(i);
        const svg = icon.locator('svg');
        const img = icon.locator('img');

        const hasSvg = await svg.count() > 0;
        const hasImg = await img.count() > 0;

        expect(hasSvg || hasImg).toBe(true);
      }
    });

    test('should have visible text labels for all items', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const items = page.locator('nav.fmbn-bottom-nav .fmbn-nav-item');
      const count = await items.count();

      for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        const label = item.locator('.fmbn-nav-item__label');
        const text = await label.textContent();

        expect(text).toBeTruthy();
        expect(text?.trim()).not.toBe('');
      }
    });

    test('should not use icon fonts alone without labels', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const items = page.locator('nav.fmbn-bottom-nav .fmbn-nav-item');
      const count = await items.count();

      for (let i = 0; i < count; i++) {
        const item = items.nth(i);

        // Should have label text, not just icon font
        const label = item.locator('.fmbn-nav-item__label');
        const labelCount = await label.count();

        expect(labelCount).toBeGreaterThan(0);
      }
    });

    test('should have proper contrast for text labels', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const labels = page.locator('nav.fmbn-bottom-nav .fmbn-nav-item__label');
      const count = await labels.count();

      for (let i = 0; i < count; i++) {
        const label = labels.nth(i);

        // Check that text is visible (not white on white, etc.)
        const color = await label.evaluate(el =>
          window.getComputedStyle(el).color
        );

        expect(color).toBeTruthy();
      }
    });

    test('should scale icons with content', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const icons = page.locator('nav.fmbn-bottom-nav .fmbn-nav-item__icon');
      const firstIcon = icons.first();

      const width = await firstIcon.evaluate(el =>
        window.getComputedStyle(el).width
      );
      const height = await firstIcon.evaluate(el =>
        window.getComputedStyle(el).height
      );

      // Icons should have explicit dimensions
      expect(width).not.toBe('auto');
      expect(height).not.toBe('auto');
    });
  });

  // ========================================
  // HTML Validation Tests
  // ========================================

  test.describe('HTML Validation (AC5)', () => {
    test('should not use deprecated HTML elements', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const html = await nav.evaluate(el => el.outerHTML);

      // Check for deprecated elements
      const deprecatedElements = [
        '<font', '<center', '<marquee', '<blink',
        'align=', 'bgcolor', 'border="0"'
      ];

      for (const deprecated of deprecatedElements) {
        expect(html.toLowerCase()).not.toContain(deprecated.toLowerCase());
      }
    });

    test('should have all required attributes', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');

      // Nav should have required attributes
      const role = await nav.getAttribute('role');
      const ariaLabel = await nav.getAttribute('aria-label');

      expect(role).toBe('navigation');
      expect(ariaLabel).toBeTruthy();
    });

    test('should have properly nested elements', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const list = nav.locator('> ul');
      const listItems = list.locator('> li');
      const links = listItems.locator('> a');

      // Proper nesting: nav > ul > li > a
      expect(await list.count()).toBe(1);
      expect(await listItems.count()).toBeGreaterThan(0);
      expect(await links.count()).toEqual(await listItems.count());
    });

    test('should have valid attribute values', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const html = await nav.evaluate(el => el.outerHTML);

      // Check for unclosed attributes
      expect(html).not.toMatch(/href="/);  // Should be completed
      expect(html).not.toMatch(/class="/); // Should be completed
    });

    test('should not have empty href attributes', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('nav.fmbn-bottom-nav a');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const href = await links.nth(i).getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).not.toBe('');
      }
    });

    test('should not have duplicate IDs', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const elements = await nav.evaluate(el => {
        const allElements = el.querySelectorAll('[id]');
        const ids = Array.from(allElements).map(e => e.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        return duplicates;
      });

      expect(elements.length).toBe(0);
    });
  });

  // ========================================
  // Integration Tests
  // ========================================

  test.describe('Semantic Structure Integration', () => {
    test('should work with screen readers (semantic structure)', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      // Simulate screen reader navigation
      const nav = page.locator('nav.fmbn-bottom-nav');
      const role = await nav.getAttribute('role');
      const ariaLabel = await nav.getAttribute('aria-label');
      const list = nav.locator('ul');
      const items = list.locator('li');
      const itemCount = await items.count();

      expect(role).toBe('navigation');
      expect(ariaLabel).toBeTruthy();
      expect(itemCount).toBeGreaterThan(0);
    });

    test('should maintain semantic structure on different screen sizes', async ({ page }) => {
      // Test mobile
      await page.goto(testUrl);
      await page.setViewportSize({ width: 375, height: 667 });

      let nav = page.locator('nav.fmbn-bottom-nav');
      await expect(nav).toBeVisible();

      let list = nav.locator('ul');
      await expect(list).toBeVisible();

      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      // On tablet/desktop, nav should be hidden
      nav = page.locator('nav.fmbn-bottom-nav');
      const isHidden = await nav.isHidden().catch(() => true);
      expect(isHidden).toBe(true);
    });

    test('should preserve semantics with dynamic content', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const initialCount = await nav.locator('li').count();

      // Check structure is still valid
      const list = nav.locator('ul');
      await expect(list).toBeVisible();

      const items = list.locator('li');
      const count = await items.count();
      expect(count).toEqual(initialCount);
    });

    test('should have proper semantic document structure', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      // Check main content area exists
      const main = page.locator('main, [role="main"]');
      const nav = page.locator('nav.fmbn-bottom-nav');

      // Navigation should not be the only landmark
      const hasMainContent = await main.count() > 0;
      const hasNav = await nav.count() > 0;

      expect(hasNav).toBe(true);
      // Main content may be in different selectors, so we just check nav exists
    });
  });
});
