<?php

namespace Jenilutfifauzi\FilamentMobileBottomNavigation;

use Closure;
use Filament\Facades\Filament;
use Filament\Panel;
use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Assets\Asset;
use Filament\Support\Assets\Css;
use Filament\Support\Assets\Js;
use Filament\Support\Facades\FilamentAsset;
use Filament\Support\Facades\FilamentIcon;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Blade;
use Jenilutfifauzi\FilamentMobileBottomNavigation\Commands\FilamentMobileBottomNavigationCommand;
use Jenilutfifauzi\FilamentMobileBottomNavigation\Components\MobileBottomNavigation;
use Jenilutfifauzi\FilamentMobileBottomNavigation\Testing\TestsFilamentMobileBottomNavigation;
use Livewire\Features\SupportTesting\Testable;
use Livewire\Livewire;
use Spatie\LaravelPackageTools\Commands\InstallCommand;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class FilamentMobileBottomNavigationServiceProvider extends PackageServiceProvider
{
    public static string $name = 'filament-mobile-bottom-navigation';

    public static string $viewNamespace = 'filament-mobile-bottom-navigation';

    public function configurePackage(Package $package): void
    {
        /*
         * This class is a Package Service Provider
         *
         * More info: https://github.com/spatie/laravel-package-tools
         */
        $package->name(static::$name)
            ->hasCommands($this->getCommands())
            ->hasInstallCommand(function (InstallCommand $command) {
                $command
                    ->publishConfigFile()
                    ->publishMigrations()
                    ->askToRunMigrations()
                    ->askToStarRepoOnGitHub('jenilutfifauzi/filament-mobile-bottom-navigation');
            });

        $configFileName = $package->shortName();

        if (file_exists($package->basePath("/../config/{$configFileName}.php"))) {
            $package->hasConfigFile();
        }

        if (file_exists($package->basePath('/../database/migrations'))) {
            $package->hasMigrations($this->getMigrations());
        }

        if (file_exists($package->basePath('/../resources/lang'))) {
            $package->hasTranslations();
        }

        if (file_exists($package->basePath('/../resources/views'))) {
            $package->hasViews(static::$viewNamespace);
        }
    }

    public function packageRegistered(): void {}

    public function packageBooted(): void
    {
        // Asset Registration
        FilamentAsset::register(
            $this->getAssets(),
            $this->getAssetPackageName()
        );

        FilamentAsset::registerScriptData(
            $this->getScriptData(),
            $this->getAssetPackageName()
        );

        // Icon Registration
        FilamentIcon::register($this->getIcons());

        // Livewire Component Registration
        Livewire::component('filament-mobile-bottom-navigation', MobileBottomNavigation::class);

        // Register Panel macro for optional configuration
        $this->registerPanelMacro();

        // Auto-inject bottom navigation into Filament layouts
        $this->injectBottomNavigationIntoLayouts();

        // Handle Stubs
        if (app()->runningInConsole()) {
            foreach (app(Filesystem::class)->files(__DIR__ . '/../stubs/') as $file) {
                $this->publishes([
                    $file->getRealPath() => base_path("stubs/filament-mobile-bottom-navigation/{$file->getFilename()}"),
                ], 'filament-mobile-bottom-navigation-stubs');
            }
        }

        // Testing
        Testable::mixin(new TestsFilamentMobileBottomNavigation);
    }

    protected function getAssetPackageName(): ?string
    {
        return 'jenilutfifauzi/filament-mobile-bottom-navigation';
    }

    /**
     * @return array<Asset>
     */
    protected function getAssets(): array
    {
        return [
            // AlpineComponent::make('filament-mobile-bottom-navigation', __DIR__ . '/../resources/dist/components/filament-mobile-bottom-navigation.js'),
            Css::make('filament-mobile-bottom-navigation-styles', __DIR__ . '/../resources/dist/filament-mobile-bottom-navigation.css'),
            Js::make('filament-mobile-bottom-navigation-scripts', __DIR__ . '/../resources/dist/filament-mobile-bottom-navigation.js'),
        ];
    }

    /**
     * @return array<class-string>
     */
    protected function getCommands(): array
    {
        return [
            FilamentMobileBottomNavigationCommand::class,
        ];
    }

    /**
     * @return array<string>
     */
    protected function getIcons(): array
    {
        return [];
    }

    /**
     * @return array<string>
     */
    protected function getRoutes(): array
    {
        return [];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getScriptData(): array
    {
        return [];
    }

    /**
     * @return array<string>
     */
    protected function getMigrations(): array
    {
        return [
            'create_filament-mobile-bottom-navigation_table',
        ];
    }

    /**
     * Register Panel macro for optional configuration
     *
     * Allows developers to optionally configure the mobile bottom navigation
     * through Filament's Panel configuration, while maintaining zero-config by default.
     *
     * Usage:
     *   $panel->mobileBottomNavigation()              // Explicitly enable (default)
     *   $panel->mobileBottomNavigation(true)          // Explicitly enable
     *   $panel->mobileBottomNavigation(false)         // Disable for this panel
     *   $panel->mobileBottomNavigation(fn() => ...) // Conditional enable
     */
    protected function registerPanelMacro(): void
    {
        Panel::macro('mobileBottomNavigation', function (bool|Closure $condition = true): Panel {
            /** @var Panel $this */

            // Resolve closure or use boolean directly
            $enabled = value($condition);

            // Store configuration on panel instance
            $this->mobileBottomNavigationEnabled = $enabled;

            // Return for fluent interface
            return $this;
        });
    }

    /**
     * Auto-inject mobile bottom navigation into Filament layouts
     *
     * Registers a render hook that automatically includes the bottom navigation
     * component in all Filament panels, unless explicitly disabled via the macro.
     */
    protected function injectBottomNavigationIntoLayouts(): void
    {
        Filament::serving(function () {
            Filament::registerRenderHook(
                'panels::body.end',
                function (): string {
                    $panel = Filament::getCurrentPanel();

                    // Check if explicitly disabled via macro
                    if (property_exists($panel, 'mobileBottomNavigationEnabled') &&
                        !$panel->mobileBottomNavigationEnabled) {
                        return '';
                    }

                    // Render component (enabled by default or explicitly enabled)
                    return Blade::render('<livewire:filament-mobile-bottom-navigation />');
                }
            );
        });
    }
}
