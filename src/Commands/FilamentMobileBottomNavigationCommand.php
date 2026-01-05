<?php

namespace Jenilutfifauzi\FilamentMobileBottomNavigation\Commands;

use Illuminate\Console\Command;

class FilamentMobileBottomNavigationCommand extends Command
{
    public $signature = 'filament-mobile-bottom-navigation';

    public $description = 'My command';

    public function handle(): int
    {
        $this->comment('All done');

        return self::SUCCESS;
    }
}
