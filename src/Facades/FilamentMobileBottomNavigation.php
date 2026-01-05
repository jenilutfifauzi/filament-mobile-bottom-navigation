<?php

namespace Jenilutfifauzi\FilamentMobileBottomNavigation\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \Jenilutfifauzi\FilamentMobileBottomNavigation\FilamentMobileBottomNavigation
 */
class FilamentMobileBottomNavigation extends Facade
{
    protected static function getFacadeAccessor()
    {
        return \Jenilutfifauzi\FilamentMobileBottomNavigation\FilamentMobileBottomNavigation::class;
    }
}
