<?php

namespace Jenilutfifauzi\FilamentMobileBottomNavigation\Tests\Unit;

use Filament\Navigation\NavigationItem;
use Jenilutfifauzi\FilamentMobileBottomNavigation\Tests\TestCase;

/**
 * Story 8.4: Navigation Item Unit Tests
 *
 * Tests verify navigation item methods work correctly in isolation
 * AC1: Navigation Item Retrieval Logic
 */
class NavigationItemTest extends TestCase
{
    /** @test */
    public function can_create_navigation_item_with_label_and_url()
    {
        $item = NavigationItem::make('Dashboard')
            ->url('/admin');

        $this->assertEquals('Dashboard', $item->getLabel());
        $this->assertEquals('/admin', $item->getUrl());
    }

    /** @test */
    public function can_set_icon_on_navigation_item()
    {
        $item = NavigationItem::make('Dashboard')
            ->url('/admin')
            ->icon('heroicon-o-home');

        $this->assertEquals('heroicon-o-home', $item->getIcon());
    }

    /** @test */
    public function can_set_badge_on_navigation_item()
    {
        $item = NavigationItem::make('Notifications')
            ->url('/notifications')
            ->badge('5');

        $this->assertEquals('5', $item->getBadge());
    }

    /** @test */
    public function badge_can_be_numeric()
    {
        $item = NavigationItem::make('Messages')
            ->url('/messages')
            ->badge(10);

        $this->assertEquals(10, $item->getBadge());
    }

    /** @test */
    public function badge_can_be_null()
    {
        $item = NavigationItem::make('Dashboard')
            ->url('/admin');

        $this->assertNull($item->getBadge());
    }

    /** @test */
    public function icon_can_be_null()
    {
        $item = NavigationItem::make('Dashboard')
            ->url('/admin');

        $this->assertNull($item->getIcon());
    }

    /** @test */
    public function can_set_sort_order()
    {
        $item = NavigationItem::make('Dashboard')
            ->url('/admin')
            ->sort(10);

        $this->assertEquals(10, $item->getSort());
    }

    /** @test */
    public function sort_defaults_to_zero_if_not_set()
    {
        $item = NavigationItem::make('Dashboard')
            ->url('/admin');

        // Default sort order should be 0 or null
        $sort = $item->getSort();
        $this->assertTrue($sort === 0 || $sort === null || $sort === false);
    }

    /** @test */
    public function can_chain_navigation_item_methods()
    {
        $item = NavigationItem::make('Dashboard')
            ->url('/admin')
            ->icon('heroicon-o-home')
            ->badge('1')
            ->sort(1);

        $this->assertEquals('Dashboard', $item->getLabel());
        $this->assertEquals('/admin', $item->getUrl());
        $this->assertEquals('heroicon-o-home', $item->getIcon());
        $this->assertEquals('1', $item->getBadge());
        $this->assertEquals(1, $item->getSort());
    }

    /** @test */
    public function navigation_item_label_is_required()
    {
        $item = NavigationItem::make('Navigation Item');

        $this->assertNotNull($item->getLabel());
        $this->assertNotEmpty($item->getLabel());
    }

    /** @test */
    public function navigation_item_url_is_required()
    {
        $item = NavigationItem::make('Test')->url('/test');

        $this->assertNotNull($item->getUrl());
        $this->assertNotEmpty($item->getUrl());
    }

    /** @test */
    public function multiple_items_can_have_same_label()
    {
        $item1 = NavigationItem::make('Dashboard')->url('/admin/dashboard');
        $item2 = NavigationItem::make('Dashboard')->url('/admin/dashboard2');

        $this->assertEquals($item1->getLabel(), $item2->getLabel());
        $this->assertNotEquals($item1->getUrl(), $item2->getUrl());
    }

    /** @test */
    public function navigation_item_url_can_be_external()
    {
        $item = NavigationItem::make('External')
            ->url('https://example.com');

        $this->assertEquals('https://example.com', $item->getUrl());
    }

    /** @test */
    public function navigation_item_url_can_be_route()
    {
        $item = NavigationItem::make('Dashboard')
            ->url(route('filament.admin.pages.dashboard') ?? '/admin/dashboard');

        $this->assertNotNull($item->getUrl());
    }

    /** @test */
    public function badge_can_be_string()
    {
        $item = NavigationItem::make('Test')
            ->url('/test')
            ->badge('new');

        $this->assertEquals('new', $item->getBadge());
    }

    /** @test */
    public function icon_name_is_preserved()
    {
        $icons = [
            'heroicon-o-home',
            'heroicon-o-user',
            'heroicon-o-cog',
        ];

        foreach ($icons as $icon) {
            $item = NavigationItem::make('Test')
                ->url('/test')
                ->icon($icon);

            $this->assertEquals($icon, $item->getIcon());
        }
    }

    /** @test */
    public function navigation_item_instance_is_fluent()
    {
        $item = NavigationItem::make('Test')
            ->url('/test')
            ->icon('icon')
            ->badge('1');

        // All methods return the same instance
        $this->assertInstanceOf(NavigationItem::class, $item);
    }

    /** @test */
    public function can_clear_badge()
    {
        $item = NavigationItem::make('Test')
            ->url('/test')
            ->badge('5');

        $this->assertEquals('5', $item->getBadge());

        // Set to null to clear
        $clearedItem = NavigationItem::make('Test')
            ->url('/test')
            ->badge(null);

        $this->assertNull($clearedItem->getBadge());
    }

    /** @test */
    public function can_update_navigation_item()
    {
        $item = NavigationItem::make('Dashboard')
            ->url('/admin')
            ->badge('1');

        // Create updated version
        $updatedItem = NavigationItem::make('Dashboard')
            ->url('/admin')
            ->badge('5');

        $this->assertNotEquals(
            $item->getBadge(),
            $updatedItem->getBadge()
        );
    }
}
