# Filament Mobile Bottom Navigation

[![CI](https://github.com/jenilutfifauzi/filament-mobile-bottom-navigation/actions/workflows/ci.yml/badge.svg)](https://github.com/jenilutfifauzi/filament-mobile-bottom-navigation/actions/workflows/ci.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/jenilutfifauzi/filament-mobile-bottom-navigation.svg?style=flat-square)](https://packagist.org/packages/jenilutfifauzi/filament-mobile-bottom-navigation)
[![Total Downloads](https://img.shields.io/packagist/dt/jenilutfifauzi/filament-mobile-bottom-navigation.svg?style=flat-square)](https://packagist.org/packages/jenilutfifauzi/filament-mobile-bottom-navigation)
[![License](https://img.shields.io/packagist/l/jenilutfifauzi/filament-mobile-bottom-navigation.svg?style=flat-square)](LICENSE.md)

Mobile-first bottom navigation bar for Filament 3.x admin panels with **zero configuration required**.

## Features

✨ **Zero Configuration** - Works automatically after `composer require`
📱 **Mobile-First Design** - Responsive at 768px breakpoint, pure CSS
🎨 **Theme Integration** - Automatically inherits Filament colors and typography
🌓 **Dark Mode Support** - Automatic with no additional code
🍎 **iOS Safe Area** - Respects notch and home indicator on modern iPhones
♿ **Accessible** - WCAG 2.1 Level AA compliant with 44×44px touch targets
⚡ **Performant** - Zero layout shift (CLS = 0), <200ms render time
🧪 **Thoroughly Tested** - 100+ Playwright browser tests + PHPUnit coverage

## Requirements

- PHP 8.1 or higher
- Laravel 10.x or 11.x
- Filament 3.0 or higher
- Livewire 3.0 or higher

## Installation

### Step 1: Install via Composer

Install the package using Composer:

```bash
composer require jenilutfifauzi/filament-mobile-bottom-navigation
```

### Step 2: Verify Installation

No additional configuration needed! The plugin auto-registers via Laravel's package discovery.

Verify the service provider is loaded:

```bash
php artisan package:discover
```

Expected output:
```
Discovered Package: jenilutfifauzi/filament-mobile-bottom-navigation
Provider: Jenilutfifauzi\FilamentMobileBottomNavigation\FilamentMobileBottomNavigationServiceProvider
```

### Step 3: Test Mobile Navigation

1. Start your Laravel development server:
   ```bash
   php artisan serve
   ```

2. Open your Filament admin panel:
   ```
   http://localhost:8000/admin
   ```

3. Open browser DevTools (F12) and toggle responsive mode (Ctrl+Shift+M / Cmd+Shift+M)

4. Set viewport to iPhone 14 (390px width)

5. You should see the bottom navigation bar appear automatically ✨

### Optional: Asset Publishing

If you need to customize CSS (not typically needed - use CSS variables instead):

```bash
php artisan vendor:publish --tag=filament-mobile-bottom-navigation-assets
```

Assets will be copied to `public/vendor/filament-mobile-bottom-navigation/`

## Verification Checklist

After installation, verify these features work:

### ✅ Installation Verified

- [ ] `composer require` completed without errors
- [ ] Service provider appears in `php artisan package:discover`
- [ ] No manual configuration needed

### ✅ Mobile Navigation Appears

- [ ] Bottom navigation visible at viewport width < 768px
- [ ] Navigation hidden at viewport width ≥ 768px
- [ ] All panel navigation items displayed
- [ ] Icons and labels both visible

### ✅ Theme Integration Works

- [ ] Navigation colors match panel's primary color
- [ ] Dark mode toggle changes navigation colors
- [ ] Custom fonts apply to navigation labels
- [ ] Active state highlights current page

### ✅ Responsive Behavior

- [ ] Navigation shows on iPhone viewport (390px)
- [ ] Navigation hides on iPad viewport (768px)
- [ ] Orientation change handled smoothly
- [ ] No layout shift during page load

### ✅ iOS Features (if testing on iPhone)

- [ ] Safe area padding above home indicator
- [ ] Navigation items fully tappable
- [ ] Notch/Dynamic Island doesn't cover content

## Configuration (Optional)

### Zero-Config Default

By default, the mobile bottom navigation works automatically:

```php
// app/Providers/Filament/AdminPanelProvider.php

use Filament\Panel;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('admin')
            ->path('admin')
            ->login()
            // Mobile navigation works automatically - no config needed!
    }
}
```

### Disable for Specific Panel

```php
return $panel
    ->id('internal')
    ->path('internal')
    ->mobileBottomNavigation(false) // Disable mobile nav
```

### Conditional Enabling

```php
return $panel
    ->id('admin')
    ->mobileBottomNavigation(
        fn (): bool => auth()->user()?->prefers_mobile_nav ?? true
    )
```

### Multi-Panel Setup

```php
// Admin Panel - Mobile nav enabled (default)
class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel->id('admin')->path('admin')
    }
}

// Internal Panel - Mobile nav disabled
class InternalPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel->id('internal')->mobileBottomNavigation(false)
    }
}
```

## Troubleshooting Installation

### "Package not found"

```bash
composer clear-cache
composer require jenilutfifauzi/filament-mobile-bottom-navigation
```

### Service provider not loading

```bash
php artisan package:discover
php artisan optimize:clear
```

If auto-discovery fails, manually register in `config/app.php`:

```php
'providers' => [
    // ...
    Jenilutfifauzi\FilamentMobileBottomNavigation\FilamentMobileBottomNavigationServiceProvider::class,
],
```

### CSS not loading

```bash
php artisan view:clear
php artisan filament:optimize-clear
php artisan filament:optimize
```

### Navigation appears on desktop

- Ensure viewport width < 768px in DevTools
- Hard refresh browser (Ctrl+Shift+R)
- Check DevTools for CSS 404 errors

## Next Steps

After successful installation:

1. **Customize Theme Colors:**
   ```php
   use Filament\Support\Colors\Color;

   $panel->colors(['primary' => Color::Amber])
   ```

2. **Enable Dark Mode:**
   ```php
   $panel->darkMode(true)
   ```

3. **Add Navigation Items:**
   ```php
   $panel->navigationItems([
       NavigationItem::make('Custom')
           ->url('/custom')
           ->icon('heroicon-o-star')
   ])
   ```

4. **Test on Real Devices:** Deploy to staging and test on physical iOS/Android devices

## Usage

### Default Behavior (Zero Configuration)

The mobile bottom navigation appears automatically on screens smaller than 768px. It reads your Filament panel's navigation items and displays them in a responsive bottom bar.

```php
// app/Providers/Filament/AdminPanelProvider.php
public function panel(Panel $panel): Panel
{
    return $panel
        ->id('admin')
        ->path('admin')
        ->navigationGroups([
            'Content Management' => [
                Pages\ManagePosts::class,
                Pages\ManageCategories::class,
            ],
            'Settings' => [
                Pages\ManageSettings::class,
            ],
        ])
        // Bottom navigation works automatically ✨
        // No configuration needed!
}
```

**Result:** On mobile screens, your navigation items appear in a fixed bottom navigation bar instead of the sidebar.

### Optional Configuration

#### Disable for Specific Panel

```php
return $panel
    ->mobileBottomNavigation(false)
```

#### Conditional Rendering

```php
return $panel
    ->mobileBottomNavigation(
        fn() => auth()->user()->prefersMobileNavigation()
    )
```

#### Fluent Configuration

```php
return $panel
    ->id('admin')
    ->path('admin')
    ->mobileBottomNavigation() // Enable (default)
    ->darkMode()
    ->viteTheme('resources/css/app.css')
```

## How It Works

### Architecture

1. **Mobile Detection** - CSS media queries detect viewport < 768px
2. **Automatic Injection** - Livewire component auto-injects into Filament layouts
3. **Navigation Sync** - Component reads navigation items from Panel config
4. **Theme Inheritance** - Uses Filament's CSS variables for colors and fonts
5. **Responsive Hiding** - Hides on desktop (≥768px), shows on mobile (<768px)

### Technical Details

- **Pure CSS** - No JavaScript, responsive behavior via media queries
- **Livewire Component** - `livewire:filament-mobile-bottom-navigation`
- **CSS Variables** - All colors use Filament's design system (automatic dark mode)
- **Fixed Positioning** - Bottom nav fixed to viewport, doesn't scroll
- **Safe Area Support** - iOS notch/home indicator spacing automatic
- **Zero Layout Shift** - Body padding reserves space upfront (CLS = 0)

## Browser & Device Compatibility

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| iOS Safari | 15+ | ✅ Full | Notch/home indicator support |
| Chrome Mobile | 80+ | ✅ Full | Android and iOS |
| Samsung Internet | 9.2+ | ✅ Full | Android |
| Firefox Mobile | 69+ | ✅ Full | iOS and Android |
| Opera Mobile | 56+ | ✅ Full | Android |
| Chrome Desktop | Any | ✅ Hidden | Hides on desktop (≥768px) |
| Safari Desktop | Any | ✅ Hidden | Hides on desktop (≥768px) |

### Device Support

- iPhone X and newer: Full support with safe area
- iPhone SE (2nd gen and newer): Full support
- iPhone 6-8: Full support (no safe area)
- iPad: Hidden (landscape ≥768px)
- Android phones: Full support
- Android tablets: Hidden on landscape

## Customization

### Theme Colors

The navigation automatically uses your panel's primary color:

```php
use Filament\Support\Colors\Color;

return $panel
    ->colors([
        'primary' => Color::Amber,      // Active nav items use Amber
        'danger' => Color::Red,
        'success' => Color::Green,
    ])
```

### Typography

Inherits Filament's font configuration:

```php
return $panel
    ->font('Inter') // Bottom nav uses Inter font
```

### Dark Mode

Automatic dark mode support:

```php
return $panel
    ->darkMode(true) // Bottom nav adapts automatically
```

## Troubleshooting

### Navigation Not Appearing on Mobile

**Possible Causes:**

1. **Viewport width ≥ 768px** - Navigation hidden on screens larger than tablets
   - **Solution:** Check DevTools responsive mode. Viewport must be < 768px.

2. **Panel has no navigation items**
   - **Solution:** Verify panel has navigation configured:
     ```php
     ->navigationGroups([...])
     ```

3. **CSS not loaded properly**
   - **Solution:** Clear cache:
     ```bash
     php artisan optimize:clear
     npm run build
     ```

4. **Livewire component not registered**
   - **Solution:** Verify service provider auto-registered:
     ```bash
     php artisan package:discover
     ```

### Navigation Items Cut Off on iPhone

**Cause:** Missing `viewport-fit=cover` meta tag

**Solution:** Filament 3.x includes this by default. If using custom layout:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

### Active Navigation State Not Highlighting

**Check:**
- URL matches navigation item exactly
- Route structure is standard
- Browser cache is cleared

### Spacing Issues or Layout Shift

**Solutions:**
- Clear cache: `php artisan optimize:clear`
- Verify CSS file loads: DevTools → Network tab
- Check body padding: DevTools → Styles → body element

## Testing

### PHP Tests

```bash
composer test
```

### Browser Testing

```bash
npm run test:browser
```

### Browser Tests in Headed Mode

```bash
npm run test:browser:headed
```

### Accessibility Tests

```bash
npm run test:a11y
```

### Test Report

```bash
npx playwright show-report
```

**Test Coverage:**
- 100+ Playwright browser tests
- Mobile responsiveness (768px breakpoint)
- Dark mode automatic switching
- iOS safe area handling
- Typography variable application
- Color contrast (WCAG AA)
- Layout shift prevention (CLS = 0)
- Touch target sizing (44×44px minimum)

## Performance

### Core Web Vitals

- **CLS (Cumulative Layout Shift)** = 0
- **Bundle Size** = ~12.6KB (minified)
- **First Contentful Paint** = ~100ms

### Why It's Fast

- Pure CSS implementation (no JavaScript)
- CSS variables: Native browser support
- Media queries: Native CSS evaluation
- Zero layout shift: Space reserved upfront

## Security

If you discover security vulnerabilities, please email [security@example.com](mailto:security@example.com).

## Credits

- [Jeni Lutfi Fauzi](https://github.com/jenilutfifauzi)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). See [License File](LICENSE.md) for more information.

## Changelog

See [CHANGELOG](CHANGELOG.md) for recent changes.

### Version 1.0.0 (Current)

- ✨ Initial release
- ✨ Mobile bottom navigation component
- ✨ Zero-configuration setup
- ✨ Automatic theme inheritance and dark mode
- ✨ iOS safe area support
- ✨ WCAG 2.1 Level AA accessibility
- ✨ Comprehensive test coverage (100+ tests)

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

Contributions are welcome! Help us improve by:

1. Reporting issues
2. Suggesting features
3. Submitting pull requests
4. Improving documentation

## Support

- 📖 Check [Troubleshooting](#troubleshooting) section
- 🐛 Open an [Issue](../../issues)
- 💬 Start a [Discussion](../../discussions)

---

Made with ❤️ for the Filament community
