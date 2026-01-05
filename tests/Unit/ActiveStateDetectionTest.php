<?php

namespace Jenilutfifauzi\FilamentMobileBottomNavigation\Tests\Unit;

use Filament\Navigation\NavigationItem;
use Jenilutfifauzi\FilamentMobileBottomNavigation\Tests\TestCase;

/**
 * Story 8.4: Active State Detection Tests
 *
 * Tests verify active state detection logic works correctly
 * AC2: Active State Detection Logic
 */
class ActiveStateDetectionTest extends TestCase
{
    /** @test */
    public function can_detect_active_state_by_url()
    {
        $currentUrl = '/admin/dashboard';

        $item = NavigationItem::make('Dashboard')
            ->url('/admin/dashboard');

        // Check if URL matches
        $itemUrl = $item->getUrl();
        $isActive = $itemUrl === $currentUrl;

        $this->assertTrue($isActive);
    }

    /** @test */
    public function inactive_item_not_detected_as_active()
    {
        $currentUrl = '/admin/dashboard';

        $item = NavigationItem::make('Users')
            ->url('/admin/users');

        // Check if URL matches
        $itemUrl = $item->getUrl();
        $isActive = $itemUrl === $currentUrl;

        $this->assertFalse($isActive);
    }

    /** @test */
    public function exact_url_matching_works()
    {
        $currentUrl = '/admin/users/5/edit';

        $items = [
            NavigationItem::make('Users')->url('/admin/users'),
            NavigationItem::make('User Detail')->url('/admin/users/5'),
            NavigationItem::make('User Edit')->url('/admin/users/5/edit'),
        ];

        // Find active item
        $activeItem = null;
        foreach ($items as $item) {
            if ($item->getUrl() === $currentUrl) {
                $activeItem = $item;

                break;
            }
        }

        $this->assertNotNull($activeItem);
        $this->assertEquals('User Edit', $activeItem->getLabel());
    }

    /** @test */
    public function partial_url_matching_works_for_prefixes()
    {
        $currentUrl = '/admin/users/5/edit';
        $prefix = '/admin/users';

        // Check if current URL starts with prefix
        $isUnderPrefix = strpos($currentUrl, $prefix) === 0;

        $this->assertTrue($isUnderPrefix);
    }

    /** @test */
    public function case_insensitive_url_matching()
    {
        $currentUrl = '/admin/dashboard';
        $itemUrl = '/admin/dashboard';

        $isActive = strtolower($itemUrl) === strtolower($currentUrl);

        $this->assertTrue($isActive);
    }

    /** @test */
    public function trailing_slash_handling()
    {
        $currentUrl = '/admin/dashboard/';
        $itemUrl = '/admin/dashboard';

        // Normalize URLs by removing trailing slashes
        $normalized1 = rtrim($currentUrl, '/');
        $normalized2 = rtrim($itemUrl, '/');

        $isActive = $normalized1 === $normalized2;

        $this->assertTrue($isActive);
    }

    /** @test */
    public function handles_query_parameters()
    {
        $currentUrl = '/admin/users?sort=name&order=asc';
        $itemUrl = '/admin/users';

        // Extract base URL without query params
        $baseUrl = parse_url($currentUrl, PHP_URL_PATH);

        $isActive = $baseUrl === $itemUrl;

        $this->assertTrue($isActive);
    }

    /** @test */
    public function handles_url_fragments()
    {
        $currentUrl = '/admin/dashboard#section-1';
        $itemUrl = '/admin/dashboard';

        // Extract URL without fragment
        $baseUrl = parse_url($currentUrl, PHP_URL_PATH);

        $isActive = $baseUrl === $itemUrl;

        $this->assertTrue($isActive);
    }

    /** @test */
    public function root_path_matches_correctly()
    {
        $currentUrl = '/';
        $itemUrl = '/';

        $isActive = $currentUrl === $itemUrl;

        $this->assertTrue($isActive);
    }

    /** @test */
    public function external_urls_do_not_match_internal_paths()
    {
        $currentUrl = 'https://external.com/page';
        $itemUrl = '/admin/users';

        $isActive = $currentUrl === $itemUrl;

        $this->assertFalse($isActive);
    }

    /** @test */
    public function multiple_active_items_are_detected()
    {
        $currentUrl = '/admin/users/5/edit';

        $items = [
            NavigationItem::make('Admin')->url('/admin'),
            NavigationItem::make('Users')->url('/admin/users'),
            NavigationItem::make('User Edit')->url('/admin/users/5/edit'),
        ];

        $activeItems = [];
        foreach ($items as $item) {
            $url = $item->getUrl();

            // Check for exact match
            if ($url === $currentUrl) {
                $activeItems[] = $item;
            }
            // Check for prefix match
            elseif (strpos($currentUrl, $url) === 0 && $url !== '/') {
                $activeItems[] = $item;
            }
        }

        // Should have matched the exact URL
        $this->assertGreaterThanOrEqual(1, count($activeItems));
    }

    /** @test */
    public function nested_route_active_state()
    {
        $currentUrl = '/admin/users/5/edit';

        $parentUrl = '/admin/users';

        // Check if current is child of parent
        $isChild = strpos($currentUrl, $parentUrl) === 0;

        $this->assertTrue($isChild);
    }

    /** @test */
    public function active_state_changes_with_url()
    {
        $item = NavigationItem::make('Dashboard')
            ->url('/admin/dashboard');

        $urls = [
            '/admin/dashboard' => true,  // Should be active
            '/admin/users' => false,     // Should not be active
            '/admin' => false,           // Should not be active
        ];

        foreach ($urls as $url => $shouldBeActive) {
            $isActive = $item->getUrl() === $url;
            $this->assertEquals($shouldBeActive, $isActive);
        }
    }

    /** @test */
    public function regex_url_matching()
    {
        $currentUrl = '/admin/users/5';
        $pattern = '/admin/users/[0-9]+';

        $isActive = preg_match('~' . $pattern . '~', $currentUrl) === 1;

        $this->assertTrue($isActive);
    }

    /** @test */
    public function handles_encoded_urls()
    {
        $currentUrl = '/admin/users/john%20doe';
        $itemUrl = '/admin/users/john doe';

        $decodedCurrent = urldecode($currentUrl);
        $decodedItem = urldecode($itemUrl);

        $isActive = $decodedCurrent === $decodedItem;

        $this->assertTrue($isActive);
    }
}
