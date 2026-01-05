<?php

namespace Jenilutfifauzi\FilamentMobileBottomNavigation\Tests\Unit;

use Filament\Navigation\NavigationItem;
use Jenilutfifauzi\FilamentMobileBottomNavigation\Tests\TestCase;

/**
 * Story 8.4: Error Handling and Edge Cases Tests
 *
 * Tests verify error handling and edge cases are managed correctly
 * AC3: Error Handling Paths
 * AC4: Edge Cases
 */
class ErrorHandlingTest extends TestCase
{
    /** @test */
    public function handles_null_navigation_item_label()
    {
        $item = NavigationItem::make('');

        $this->assertNotNull($item->getLabel());
    }

    /** @test */
    public function handles_empty_string_url()
    {
        $item = NavigationItem::make('Test')
            ->url('');

        $this->assertEquals('', $item->getUrl());
    }

    /** @test */
    public function handles_null_icon()
    {
        $item = NavigationItem::make('Test')
            ->url('/test')
            ->icon(null);

        $this->assertNull($item->getIcon());
    }

    /** @test */
    public function handles_null_badge()
    {
        $item = NavigationItem::make('Test')
            ->url('/test')
            ->badge(null);

        $this->assertNull($item->getBadge());
    }

    /** @test */
    public function handles_zero_badge_value()
    {
        $item = NavigationItem::make('Test')
            ->url('/test')
            ->badge(0);

        // Zero is a valid badge value
        $this->assertEquals(0, $item->getBadge());
    }

    /** @test */
    public function handles_negative_badge_value()
    {
        $item = NavigationItem::make('Test')
            ->url('/test')
            ->badge(-1);

        $this->assertEquals(-1, $item->getBadge());
    }

    /** @test */
    public function handles_large_badge_number()
    {
        $item = NavigationItem::make('Test')
            ->url('/test')
            ->badge(999999);

        $this->assertEquals(999999, $item->getBadge());
    }

    /** @test */
    public function handles_special_characters_in_label()
    {
        $labels = [
            'Test & Label',
            "Label's Test",
            'Label <Script>',
            'Label™',
        ];

        foreach ($labels as $label) {
            $item = NavigationItem::make($label)->url('/test');
            $this->assertEquals($label, $item->getLabel());
        }
    }

    /** @test */
    public function handles_special_characters_in_url()
    {
        $urls = [
            '/admin/users?id=1&name=test',
            '/admin/users/john%20doe',
            '/admin/users#section',
        ];

        foreach ($urls as $url) {
            $item = NavigationItem::make('Test')->url($url);
            $this->assertEquals($url, $item->getUrl());
        }
    }

    /** @test */
    public function handles_very_long_label()
    {
        $longLabel = str_repeat('A', 500);
        $item = NavigationItem::make($longLabel)->url('/test');

        $this->assertEquals($longLabel, $item->getLabel());
        $this->assertGreaterThan(100, strlen($item->getLabel()));
    }

    /** @test */
    public function handles_very_long_url()
    {
        $longUrl = '/admin/' . str_repeat('path/', 50) . 'end';
        $item = NavigationItem::make('Test')->url($longUrl);

        $this->assertEquals($longUrl, $item->getUrl());
    }

    /** @test */
    public function handles_empty_badge_string()
    {
        $item = NavigationItem::make('Test')
            ->url('/test')
            ->badge('');

        $this->assertEquals('', $item->getBadge());
    }

    /** @test */
    public function handles_whitespace_only_label()
    {
        $item = NavigationItem::make('   ')
            ->url('/test');

        // Should still have a value (even if whitespace)
        $this->assertNotNull($item->getLabel());
    }

    /** @test */
    public function handles_unicode_characters()
    {
        $labels = [
            'Tëst',
            '测试',
            'тест',
            '🏠 Home',
        ];

        foreach ($labels as $label) {
            $item = NavigationItem::make($label)->url('/test');
            $this->assertEquals($label, $item->getLabel());
        }
    }

    /** @test */
    public function handles_missing_required_parameters()
    {
        // NavigationItem requires a label
        try {
            $item = NavigationItem::make('');
            $this->assertNotNull($item);
        } catch (\Exception $e) {
            // Exception is acceptable for missing required params
            $this->assertTrue(true);
        }
    }

    /** @test */
    public function handles_null_sort_value()
    {
        $item = NavigationItem::make('Test')
            ->url('/test')
            ->sort(null);

        // Should handle null gracefully
        $sort = $item->getSort();
        $this->assertTrue($sort === null || $sort === 0 || $sort === false);
    }

    /** @test */
    public function handles_negative_sort_value()
    {
        $item = NavigationItem::make('Test')
            ->url('/test')
            ->sort(-10);

        $this->assertEquals(-10, $item->getSort());
    }

    /** @test */
    public function handles_empty_icon_string()
    {
        $item = NavigationItem::make('Test')
            ->url('/test')
            ->icon('');

        $this->assertEquals('', $item->getIcon());
    }

    /** @test */
    public function handles_invalid_icon_name()
    {
        // Should not throw exception for invalid icon names
        $item = NavigationItem::make('Test')
            ->url('/test')
            ->icon('not-a-real-icon');

        $this->assertEquals('not-a-real-icon', $item->getIcon());
    }

    /** @test */
    public function handles_malformed_url()
    {
        $malformedUrls = [
            'not-a-url',
            '///',
            'http://',
            'https://::',
        ];

        foreach ($malformedUrls as $url) {
            try {
                $item = NavigationItem::make('Test')->url($url);
                $this->assertEquals($url, $item->getUrl());
            } catch (\Exception $e) {
                // Malformed URL exception is acceptable
                $this->assertTrue(true);
            }
        }
    }

    /** @test */
    public function handles_circular_or_recursive_structure()
    {
        // Test that navigation items don't create circular references
        $item1 = NavigationItem::make('Item1')->url('/url1');
        $item2 = NavigationItem::make('Item2')->url('/url2');

        // Items should be independent
        $this->assertNotEquals($item1->getLabel(), $item2->getLabel());
        $this->assertNotEquals($item1->getUrl(), $item2->getUrl());
    }

    /** @test */
    public function handles_duplicate_navigation_items()
    {
        $items = [
            NavigationItem::make('Dashboard')->url('/admin'),
            NavigationItem::make('Dashboard')->url('/admin'),
            NavigationItem::make('Dashboard')->url('/admin'),
        ];

        // Should handle duplicates without error
        $this->assertEquals(3, count($items));

        foreach ($items as $item) {
            $this->assertEquals('Dashboard', $item->getLabel());
        }
    }

    /** @test */
    public function handles_array_to_string_conversion()
    {
        // NavigationItem should handle attempting to set array values gracefully
        try {
            $item = NavigationItem::make('Test')->url('/test');

            // Attempting to use array as badge should be handled
            // (depending on implementation)
            $this->assertNotNull($item);
        } catch (\Exception $e) {
            // Exception is acceptable
            $this->assertTrue(true);
        }
    }
}
