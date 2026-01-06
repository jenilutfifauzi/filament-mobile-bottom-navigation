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

Automatic dark mode support with proper color switching:

```php
return $panel
    ->darkMode(true) // Bottom nav adapts automatically
```

**Features:**
- Automatic detection of system dark mode preference
- Manual toggle support (respects user's theme selection)
- Proper CSS specificity ensures colors change on toggle
- Works with Filament's dark mode implementation
- Tested with HP dark mode + manual light toggle

**CSS Strategy:**
The dark mode implementation uses a triple-layer CSS approach:

1. **Explicit Light Mode** (Highest Priority)
   - Selector: `html:not(.dark) .fmbn-bottom-nav`
   - Use: Ensures light colors when user manually selects light theme

2. **Class-Based Dark Mode** (Higher Priority)
   - Selector: `.dark .fmbn-bottom-nav`
   - Use: Applies dark colors when Filament adds `.dark` class to `<html>`

3. **Media Query Fallback** (Lower Priority)
   - Query: `@media (prefers-color-scheme: dark)`
   - Use: System preference detection for initial load

This approach ensures proper color switching in all scenarios:
- System dark mode + no toggle = media query applies
- System dark + manual light toggle = explicit light mode applies
- System light + manual dark toggle = class-based dark mode applies

## Authentication & Page Exclusion

The mobile bottom navigation automatically hides on:

1. **Authentication Pages**
   - Login pages
   - Registration pages  
   - Password reset flows
   - Email verification pages

2. **Unauthenticated Access**
   - No navigation shown if user not authenticated
   - Prevents UI confusion on public pages

**Example:**
A user visiting `/admin/login` will NOT see the bottom navigation, keeping the interface clean.

## Status Indicator Macros

Check if mobile bottom navigation is enabled for a panel:

```php
// Check if enabled (boolean)
if ($panel->isMobileBottomNavigationEnabled()) {
    // Navigation is active
}

// Get status string with indicator
$status = $panel->getMobileBottomNavigationStatus();
// Output: "✅ Mobile Bottom Navigation: Enabled"
// or
// Output: "❌ Mobile Bottom Navigation: Disabled"

// Configure enable/disable
$panel->mobileBottomNavigation(true);  // Enable
$panel->mobileBottomNavigation(false); // Disable
```

**Use Cases:**
- Admin dashboard showing which plugins are active
- Debug logs showing plugin status on each page load
- Settings page displaying feature availability
- Integration checking before dependent features load

**Example in Admin Dashboard:**
```php
// In a Filament resource or page
use Filament\Infolists\Infolist;

public function infolist(Infolist $infolist): Infolist
{
    return $infolist
        ->schema([
            Section::make('Enabled Plugins')
                ->description(
                    Auth::user()->can('view_system_status') 
                        ? 'Status of installed admin plugins'
                        : null
                )
                ->columns(2)
                ->schema([
                    Stat::make(
                        'Mobile Navigation',
                        auth()->user()->panel->getMobileBottomNavigationStatus()
                    ),
                ])
        ]);
}
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

5. **Unauthenticated or on auth page**
   - **Solution:** The navigation only appears on authenticated pages outside of login/register/password flows. Try navigating to a protected page after logging in.

### Dark Mode Not Switching Colors

**Issue:** Background color doesn't change when toggling between light and dark mode

**Debug Steps:**

1. **Check HTML for dark class:**
   ```bash
   # In browser DevTools console
   document.documentElement.classList.contains('dark')
   # Should return: true (dark mode) or false (light mode)
   ```

2. **Verify CSS loaded:**
   ```bash
   # In DevTools Network tab
   # Check that mobile-bottom-navigation-*.css loads successfully
   # Status should be 200 (OK)
   ```

3. **Check CSS specificity:**
   ```bash
   # In DevTools Styles panel, click the bottom nav element
   # Look for: 
   # ✅ html:not(.dark) .fmbn-bottom-nav (light mode)
   # ✅ .dark .fmbn-bottom-nav (dark mode)
   ```

4. **Clear cache if recently updated:**
   ```bash
   php artisan optimize:clear
   npm run build
   ```

5. **Test in private/incognito mode:**
   - Clears cached CSS/localStorage
   - Isolates theme preference issues

**Common Scenario:** 
- System dark mode enabled
- User manually toggles to light theme
- Bottom navigation still showing dark colors

**Solution:** This is now fixed! The triple-layer CSS strategy ensures `.dark` class-based selector takes priority over media query.

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

### Navigation Showing on Login/Register Pages

**Issue:** Bottom navigation appears on `/admin/login` or `/admin/register`

**Solution:** This should NOT happen with version 1.0.2+. The plugin automatically excludes:
- Login pages (`login`)
- Register pages (`register`)  
- Password reset pages (`password.request`, `password.reset`, `password.email`)
- Unauthenticated users

If still occurring:
1. Update to latest version: `composer update jenilutfifauzi/filament-mobile-bottom-navigation`
2. Clear cache: `php artisan optimize:clear`
3. Check route names match Filament defaults

## Configuration Examples

### Basic Setup (Recommended)

```php
// app/Providers/Filament/AdminPanelProvider.php
public function panel(Panel $panel): Panel
{
    return $panel
        ->id('admin')
        ->path('admin')
        ->darkMode(true)
        ->navigationGroups([
            'Main' => [
                Pages\Dashboard::class,
                Resources\ProductResource::class,
            ],
        ])
        // Mobile bottom navigation works automatically!
}
```

### Multi-Panel with Mixed Configuration

```php
// Admin Panel - Mobile nav enabled with dark mode
class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('admin')
            ->path('admin')
            ->darkMode(true)
            ->mobileBottomNavigation(true)
    }
}

// Internal Panel - Mobile nav disabled
class InternalPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('internal')
            ->path('internal')
            ->mobileBottomNavigation(false)
    }
}

// User Portal - Mobile nav conditional on device
class UserPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('user')
            ->path('user')
            ->mobileBottomNavigation(fn() => 
                request()->userAgent() && 
                (str_contains(request()->userAgent(), 'Mobile') ||
                 str_contains(request()->userAgent(), 'Tablet'))
            )
    }
}
```

### Monitoring in Debug Mode

```php
// Enable debug logging for mobile navigation status
// In .env during development:
LOG_LEVEL=debug

// Check logs:
// tail -f storage/logs/laravel-*.log | grep "Mobile Bottom Navigation"
```

Output will show:
```
[2024-01-15 10:30:45] local.DEBUG: ✅ Mobile Bottom Navigation: Enabled (admin panel)
[2024-01-15 10:30:46] local.DEBUG: ❌ Mobile Bottom Navigation: Disabled (internal panel)
```

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

### Version 1.0.2 (Current)

**Enhanced Dark Mode & Security**

Features:
- 🌓 **Dark Mode Triple-Layer CSS** - Fixed system dark + manual toggle scenario
  - Explicit light mode selectors with priority
  - Class-based dark mode support  
  - Media query fallback for system preference
  - Tested on HP dark + manual light toggle

- 🔐 **Smart Page Exclusion** - Navigation auto-hides on:
  - Login/Register pages
  - Password reset flows
  - Unauthenticated users
  - Keeps interface clean on auth flows

- 📊 **Status Indicator Macros** - Developer tools for monitoring:
  - `isMobileBottomNavigationEnabled()` - boolean check
  - `getMobileBottomNavigationStatus()` - formatted status string with ✅/❌
  - `mobileBottomNavigation()` - configuration option

 - 🐛 **Bug Fixes**:
   - Fixed dark mode CSS specificity issues
   - Fixed macro registration timing (moved to `packageRegistered()` phase)
   - Fixed NavigationGroup handling (flatMap logic)
   - Fixed primary color integration - navigation now properly uses Filament's CSS variables instead of hardcoded colors
   - Added auto-logging for plugin status

 - ✅ **Improved Documentation**:
  - Dark mode debugging guide
  - Configuration examples for multi-panel setups
  - Troubleshooting dark mode scenarios
  - Status indicator usage examples

### Version 1.0.1

- 🐛 Production bug fixes for icon rendering
- ✨ Added `wire:navigate` for SPA support
- 📱 Improved mobile responsiveness

### Version 1.0.0

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
