<?php

namespace Jenilutfifauzi\FilamentMobileBottomNavigation\Components;

use Filament\Facades\Filament;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Collection;
use Livewire\Component;

class MobileBottomNavigation extends Component
{
    /**
     * Get navigation items from the current Filament panel.
     *
     * Retrieves navigation items from the active panel. Returns an empty
     * collection if no panel is currently active, ensuring graceful
     * degradation without errors.
     *
     * @return Collection<int, \Filament\Navigation\NavigationItem>
     */
    protected function getNavigationItems(): Collection
    {
        $panel = Filament::getCurrentPanel();

        if (! $panel) {
            return collect([]);
        }

        return collect($panel->getNavigation());
    }

    /**
     * Render the mobile bottom navigation component.
     */
    public function render(): View
    {
        return view('filament-mobile-bottom-navigation::components.mobile-bottom-navigation', [
            'navigationItems' => $this->getNavigationItems(),
        ]);
    }
}
