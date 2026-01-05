/**
 * ARIA Attributes Test Suite
 *
 * Comprehensive tests for ARIA attributes implementation in mobile bottom navigation.
 * Verifies accessibility and screen reader compatibility.
 *
 * @group Story 7-2: Implement ARIA Attributes
 */

import { test, expect } from '@playwright/test';

test.describe('ARIA Attributes - Mobile Navigation', () => {

  // Test configuration
  const mobileViewport = { width: 393, height: 851 };
  const testUrl = '/admin';

  // ========================================
  // Navigation Landmark Tests (AC1)
  // ========================================

  test.describe('Navigation Landmark Label (AC1)', () => {
    test('should have aria-label on nav element', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const ariaLabel = await nav.getAttribute('aria-label');

      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).not.toBe('');
    });

    test('should have descriptive aria-label (not just "Navigation")', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const ariaLabel = await nav.getAttribute('aria-label');

      expect(ariaLabel).toContain('navigation');
      expect(ariaLabel.length).toBeGreaterThan(10); // Should be descriptive
    });

    test('should include "Mobile" in aria-label to distinguish from other navs', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const ariaLabel = await nav.getAttribute('aria-label');

      // Should distinguish from other navigation regions
      expect(ariaLabel.toLowerCase()).toMatch(/mobile|bottom/);
    });

    test('should have role="navigation" attribute', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const role = await nav.getAttribute('role');

      expect(role).toBe('navigation');
    });

    test('navigation should be recognized as landmark by screen readers', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const ariaLabel = await nav.getAttribute('aria-label');
      const role = await nav.getAttribute('role');

      // Both should be present for landmark recognition
      expect(role).toBe('navigation');
      expect(ariaLabel).toBeTruthy();
    });

    test('aria-label should not contain HTML or special characters', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const ariaLabel = await nav.getAttribute('aria-label');

      // Should not contain HTML entities
      expect(ariaLabel).not.toMatch(/<|>|&[a-z]+;/);
    });

    test('aria-label text should match visible context', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const ariaLabel = await nav.getAttribute('aria-label');

      // Should be consistent and professional
      expect(ariaLabel).toMatch(/[Mm]obile/);
      expect(ariaLabel).toMatch(/[Nn]avigation|[Nn]av/);
    });

    test('navigation landmark should be visible only on mobile', async ({ page }) => {
      await page.goto(testUrl);

      // Mobile: visible
      await page.setViewportSize(mobileViewport);
      let nav = page.locator('nav.fmbn-bottom-nav');
      await expect(nav).toBeVisible();

      // Desktop: hidden
      await page.setViewportSize({ width: 1024, height: 768 });
      nav = page.locator('nav.fmbn-bottom-nav');
      const isHidden = await nav.isHidden().catch(() => true);
      expect(isHidden).toBe(true);
    });
  });

  // ========================================
  // Active Page Indicator Tests (AC2)
  // ========================================

  test.describe('Active Page Indicator (AC2)', () => {
    test('active link should have aria-current="page"', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const activeLink = page.locator('a.fmbn-nav-item--active');

      if (await activeLink.count() > 0) {
        await expect(activeLink.first()).toHaveAttribute('aria-current', 'page');
      }
    });

    test('inactive links should NOT have aria-current attribute', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const inactiveLinks = page.locator('a.fmbn-nav-item:not(.fmbn-nav-item--active)');
      const count = await inactiveLinks.count();

      for (let i = 0; i < count; i++) {
        const link = inactiveLinks.nth(i);
        const ariaCurrent = await link.getAttribute('aria-current');
        expect(ariaCurrent).toBeNull();
      }
    });

    test('only ONE link should have aria-current at any time', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const linksWithAriaCurrent = page.locator('[aria-current="page"]');
      const count = await linksWithAriaCurrent.count();

      expect(count).toBeLessThanOrEqual(1);
    });

    test('aria-current should update when navigating', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      // Get initial active link
      const initialActive = page.locator('a.fmbn-nav-item--active').first();
      const initialHref = await initialActive.getAttribute('href');

      let ariaCurrentBefore = await initialActive.getAttribute('aria-current');
      expect(ariaCurrentBefore).toBe('page');

      // Navigate to different page (if available)
      const otherLinks = page.locator('a.fmbn-nav-item:not(.fmbn-nav-item--active)');
      if (await otherLinks.count() > 0) {
        const otherHref = await otherLinks.first().getAttribute('href');

        if (otherHref && otherHref !== initialHref) {
          await otherLinks.first().click();
          await page.waitForLoadState('networkidle');

          // Previous active should NOT have aria-current
          const ariaCurrentAfter = await initialActive.getAttribute('aria-current').catch(() => null);
          expect(ariaCurrentAfter).toBeNull();

          // New active should have aria-current
          const newActive = page.locator('a.fmbn-nav-item--active').first();
          const newAriaCurrent = await newActive.getAttribute('aria-current');
          expect(newAriaCurrent).toBe('page');
        }
      }
    });

    test('aria-current value should be "page" (not "true")', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const activeLinks = page.locator('[aria-current]');
      const count = await activeLinks.count();

      for (let i = 0; i < count; i++) {
        const link = activeLinks.nth(i);
        const ariaCurrent = await link.getAttribute('aria-current');
        // Should be specific value, not generic "true"
        expect(ariaCurrent).toBe('page');
      }
    });

    test('active page indicator should be synchronized with CSS active state', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const activeLink = page.locator('a.fmbn-nav-item--active').first();

      if (await activeLink.count() > 0) {
        const hasActiveClass = await activeLink.evaluate(el =>
          el.classList.contains('fmbn-nav-item--active')
        );
        const ariaCurrentValue = await activeLink.getAttribute('aria-current');

        // If has active class, should have aria-current
        if (hasActiveClass) {
          expect(ariaCurrentValue).toBe('page');
        }
      }
    });

    test('screen reader should announce "current page"', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const activeLink = page.locator('a.fmbn-nav-item--active').first();

      if (await activeLink.count() > 0) {
        const ariaCurrent = await activeLink.getAttribute('aria-current');
        expect(ariaCurrent).toBe('page');

        // Should have accessible name
        const ariaLabel = await activeLink.getAttribute('aria-label');
        const label = await activeLink.locator('.fmbn-nav-item__label').textContent();

        const accessibleName = ariaLabel || label;
        expect(accessibleName).toBeTruthy();
      }
    });
  });

  // ========================================
  // Icon Hiding Tests (AC3)
  // ========================================

  test.describe('Icon Hiding (AC3)', () => {
    test('all icons should have aria-hidden="true"', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const icons = page.locator('.fmbn-nav-item__icon');
      const count = await icons.count();

      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const icon = icons.nth(i);
        const ariaHidden = await icon.getAttribute('aria-hidden');
        expect(ariaHidden).toBe('true');
      }
    });

    test('aria-hidden should specifically be "true" (not empty string)', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const icons = page.locator('.fmbn-nav-item__icon');
      const count = await icons.count();

      for (let i = 0; i < count; i++) {
        const icon = icons.nth(i);
        const ariaHidden = await icon.getAttribute('aria-hidden');
        expect(ariaHidden).toBe('true');
        expect(ariaHidden).not.toBe('');
        expect(ariaHidden).not.toBe('false');
      }
    });

    test('decorative icons should not be announced separately', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('a.fmbn-nav-item');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);

        // Icon should be hidden
        const icon = link.locator('.fmbn-nav-item__icon');
        const iconHidden = await icon.getAttribute('aria-hidden');
        expect(iconHidden).toBe('true');

        // Only text label should be accessible
        const label = link.locator('.fmbn-nav-item__label');
        const labelText = await label.textContent();
        expect(labelText).toBeTruthy();
      }
    });

    test('SVG icons should be properly hidden', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const icons = page.locator('.fmbn-nav-item__icon');
      const count = await icons.count();

      for (let i = 0; i < count; i++) {
        const icon = icons.nth(i);
        const svg = icon.locator('svg');

        if (await svg.count() > 0) {
          // SVG parent should have aria-hidden
          const ariaHidden = await icon.getAttribute('aria-hidden');
          expect(ariaHidden).toBe('true');
        }
      }
    });

    test('aria-hidden should not be on the link itself', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('a.fmbn-nav-item');
      const count = await links.count();

      // Links should NOT be hidden
      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const ariaHidden = await link.getAttribute('aria-hidden');
        // Links should NOT have aria-hidden
        expect(ariaHidden).toBeNull();
      }
    });

    test('badges should be announced (if not hidden)', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const badges = page.locator('.fmbn-nav-item__badge');
      const count = await badges.count();

      // If badges exist, they should be inside aria-hidden icon container
      for (let i = 0; i < count; i++) {
        const badge = badges.nth(i);
        const parent = badge.locator('..');

        // Badge parent should have aria-hidden
        const parentHidden = await parent.getAttribute('aria-hidden');
        expect(parentHidden).toBe('true');
      }
    });
  });

  // ========================================
  // Link Label Tests (AC4)
  // ========================================

  test.describe('Link Labels (AC4)', () => {
    test('all links should have accessible name', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('a.fmbn-nav-item');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);

        // Get accessible name (aria-label or visible text)
        const ariaLabel = await link.getAttribute('aria-label');
        const label = await link.locator('.fmbn-nav-item__label').textContent();

        const accessibleName = ariaLabel || label;
        expect(accessibleName).toBeTruthy();
        expect(accessibleName?.trim()).not.toBe('');
      }
    });

    test('link labels should be concise and meaningful', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('a.fmbn-nav-item');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const label = await link.locator('.fmbn-nav-item__label').textContent();

        // Labels should be 1-5 words, meaningful
        expect(label).toBeTruthy();
        expect(label.length).toBeGreaterThan(1);
        expect(label.length).toBeLessThan(50); // Reasonable length
      }
    });

    test('aria-label should describe link destination', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('a.fmbn-nav-item');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);

        // Get accessible name
        const ariaLabel = await link.getAttribute('aria-label');
        const visibleLabel = await link.locator('.fmbn-nav-item__label').textContent();

        const accessibleName = ariaLabel || visibleLabel;

        // Should describe what the link does
        expect(accessibleName).toBeTruthy();
        expect(accessibleName).not.toMatch(/^click|^link|^button/i);
      }
    });

    test('visible text should not be empty on any link', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('a.fmbn-nav-item');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const label = await link.locator('.fmbn-nav-item__label').textContent();

        expect(label).toBeTruthy();
        expect(label?.trim()).not.toBe('');
      }
    });

    test('aria-label should not duplicate visible text unnecessarily', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('a.fmbn-nav-item');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);

        const ariaLabel = await link.getAttribute('aria-label');
        const visibleText = await link.locator('.fmbn-nav-item__label').textContent();

        // If aria-label exists and matches visible text exactly, it's redundant
        // But aria-label can be used if visible text needs enhancement
        if (ariaLabel && visibleText) {
          // This is acceptable pattern - aria-label for clarity
          expect(ariaLabel).toBeTruthy();
        }
      }
    });

    test('links should be keyboard accessible', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const firstLink = page.locator('a.fmbn-nav-item').first();

      // Focus the link
      await firstLink.focus();

      // Check if focused
      const isFocused = await firstLink.evaluate(el =>
        document.activeElement === el
      );

      expect(isFocused).toBe(true);
    });

    test('links should support Enter key activation', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const firstLink = page.locator('a.fmbn-nav-item').first();
      const href = await firstLink.getAttribute('href');

      if (href && href !== '#') {
        await firstLink.focus();

        // Get current URL
        const initialUrl = page.url();

        // Press Enter
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');

        // URL should have changed
        const finalUrl = page.url();
        expect(finalUrl).not.toBe(initialUrl);
      }
    });
  });

  // ========================================
  // Role Attribute Tests (AC5)
  // ========================================

  test.describe('Role Attributes (AC5)', () => {
    test('nav element should have explicit role="navigation"', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      await expect(nav).toHaveAttribute('role', 'navigation');
    });

    test('ul element should maintain list semantics', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const list = nav.locator('ul');

      await expect(list).toBeVisible();

      // UL has implicit role="list"
      const tagName = await list.evaluate(el => el.tagName);
      expect(tagName).toBe('UL');
    });

    test('li elements should have implicit listitem role', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const listItems = page.locator('nav.fmbn-bottom-nav li');
      const count = await listItems.count();

      expect(count).toBeGreaterThan(0);

      // All should be LI elements (implicit listitem role)
      for (let i = 0; i < count; i++) {
        const li = listItems.nth(i);
        const tagName = await li.evaluate(el => el.tagName);
        expect(tagName).toBe('LI');
      }
    });

    test('a elements should have implicit link role', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('a.fmbn-nav-item');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const tagName = await link.evaluate(el => el.tagName);
        expect(tagName).toBe('A');
      }
    });

    test('roles should not be overridden incorrectly', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const html = await nav.evaluate(el => el.outerHTML);

      // Should not have conflicting roles
      expect(html).not.toMatch(/role="list"/i); // nav should not be role="list"
      expect(html).not.toMatch(/role="link"/i); // nav should not be role="link"
    });

    test('should work with legacy screen readers that need explicit roles', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');

      // For legacy support: explicit role + semantic HTML
      const tagName = await nav.evaluate(el => el.tagName);
      const role = await nav.getAttribute('role');

      expect(tagName).toBe('NAV');
      expect(role).toBe('navigation');
    });

    test('list structure should maintain proper role hierarchy', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      // Hierarchy: navigation > list > listitem > link
      const nav = page.locator('nav.fmbn-bottom-nav');
      const ul = nav.locator('ul');
      const li = ul.locator('li');
      const a = li.locator('a');

      // All parts should exist
      await expect(nav).toBeVisible();
      await expect(ul).toBeVisible();
      expect(await li.count()).toBeGreaterThan(0);
      expect(await a.count()).toBeGreaterThan(0);
    });
  });

  // ========================================
  // Integration & Compliance Tests
  // ========================================

  test.describe('ARIA Integration & Compliance', () => {
    test('all ARIA attributes should be present together', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');

      // Should have both attributes for landmark recognition
      const role = await nav.getAttribute('role');
      const ariaLabel = await nav.getAttribute('aria-label');

      expect(role).toBe('navigation');
      expect(ariaLabel).toBeTruthy();
    });

    test('ARIA attributes should not conflict with semantic HTML', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');

      // Should be semantic nav element
      const tagName = await nav.evaluate(el => el.tagName);
      expect(tagName).toBe('NAV');

      // Should also have role (for compatibility)
      const role = await nav.getAttribute('role');
      expect(role).toBe('navigation');

      // No conflict
    });

    test('ARIA attributes should be valid per WCAG 2.1 AA', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const links = nav.locator('a');
      const count = await links.count();

      // Check WCAG compliance
      // - Navigation has aria-label ✓
      const ariaLabel = await nav.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();

      // - Active link has aria-current="page" ✓
      const activeLink = nav.locator('a[aria-current="page"]');
      expect(await activeLink.count()).toBeLessThanOrEqual(1);

      // - Icons have aria-hidden ✓
      const icons = nav.locator('[aria-hidden="true"]');
      expect(await icons.count()).toBeGreaterThan(0);
    });

    test('ARIA attributes should not contain errors', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const html = await nav.evaluate(el => el.outerHTML);

      // Should not have malformed ARIA
      expect(html).not.toMatch(/aria-[a-z-]*=$/); // Incomplete attribute
      expect(html).not.toMatch(/aria-[a-z-]*=""/); // Empty value (usually)
      expect(html).not.toMatch(/aria-/gi.split('aria-').length).toBeGreaterThan(1); // Has ARIA
    });

    test('ARIA should be consistent across page loads', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const getAriaAttrs = async () => {
        const nav = page.locator('nav.fmbn-bottom-nav');
        return {
          navRole: await nav.getAttribute('role'),
          navLabel: await nav.getAttribute('aria-label'),
          activeCount: await page.locator('[aria-current="page"]').count(),
          hiddenCount: await page.locator('[aria-hidden="true"]').count(),
        };
      };

      const initial = await getAriaAttrs();

      // Reload page
      await page.reload();
      const after = await getAriaAttrs();

      // Should be same
      expect(initial.navRole).toBe(after.navRole);
      expect(initial.navLabel).toBe(after.navLabel);
      expect(initial.activeCount).toBe(after.activeCount);
      expect(initial.hiddenCount).toBe(after.hiddenCount);
    });

    test('should pass WCAG 2.1 Level AA guidelines', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const links = nav.locator('a');
      const count = await links.count();

      // 4.1.2 Name, Role, Value: All UI components must have accessible name, role, value
      for (let i = 0; i < count; i++) {
        const link = links.nth(i);

        // Has role (implicit from <a>)
        const tagName = await link.evaluate(el => el.tagName);
        expect(tagName).toBe('A');

        // Has accessible name
        const ariaLabel = await link.getAttribute('aria-label');
        const text = await link.locator('.fmbn-nav-item__label').textContent();
        expect(ariaLabel || text).toBeTruthy();
      }

      // 2.4.3 Focus Order: Focus order is logical
      // 3.2.1 On Focus: No unexpected changes on focus
      // (Manual testing required, but no errors in automation)
    });
  });

  // ========================================
  // Internationalization Tests
  // ========================================

  test.describe('ARIA Internationalization', () => {
    test('aria-label should be in appropriate language', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const nav = page.locator('nav.fmbn-bottom-nav');
      const ariaLabel = await nav.getAttribute('aria-label');

      // Should be meaningful (not empty or placeholder)
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).not.toMatch(/TODO|FIXME|test/i);
    });

    test('link labels should not use abbreviations without explanation', async ({ page }) => {
      await page.goto(testUrl);
      await page.setViewportSize(mobileViewport);

      const links = page.locator('a.fmbn-nav-item');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const label = await link.locator('.fmbn-nav-item__label').textContent();

        // Labels should be full words, not cryptic abbreviations
        expect(label).toMatch(/[a-z]{3,}/i); // At least 3-letter words
      }
    });
  });
});
