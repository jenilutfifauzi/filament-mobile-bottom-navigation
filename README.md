# Filament Mobile Bottom Navigation

[![CI](https://github.com/jenilutfifauzi/filament-mobile-bottom-navigation/actions/workflows/ci.yml/badge.svg)](https://github.com/jenilutfifauzi/filament-mobile-bottom-navigation/actions/workflows/ci.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/jenilutfifauzi/filament-mobile-bottom-navigation.svg?style=flat-square)](https://packagist.org/packages/jenilutfifauzi/filament-mobile-bottom-navigation)
[![Total Downloads](https://img.shields.io/packagist/dt/jenilutfifauzi/filament-mobile-bottom-navigation.svg?style=flat-square)](https://packagist.org/packages/jenilutfifauzi/filament-mobile-bottom-navigation)

Mobile bottom navigation bar plugin for Filament admin panels. Transforms mobile navigation from hamburger menu pattern to bottom navigation bar - the standard pattern used in native mobile apps.

## Installation

You can install the package via composer:

```bash
composer require jenilutfifauzi/filament-mobile-bottom-navigation
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="filament-mobile-bottom-navigation-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="filament-mobile-bottom-navigation-config"
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="filament-mobile-bottom-navigation-views"
```

This is the contents of the published config file:

```php
return [
];
```

## Usage

```php
$filamentMobileBottomNavigation = new Jenilutfifauzi\FilamentMobileBottomNavigation();
echo $filamentMobileBottomNavigation->echoPhrase('Hello, Jenilutfifauzi!');
```

## Testing

```bash
composer test
```

## Continuous Integration

This plugin uses GitHub Actions for automated testing and build verification. On every push and pull request, the CI workflow runs:

- **Laravel Pint** - Code style validation (PSR-12)
- **PHPUnit/Pest** - Unit and feature tests
- **npm build** - Asset compilation verification

The CI workflow tests against PHP 8.0, 8.1, and 8.2 with Laravel 10.x to ensure compatibility across supported versions.

View the CI status and workflow runs in the [Actions tab](https://github.com/jenilutfifauzi/filament-mobile-bottom-navigation/actions).

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Jeni Lutfi Fauzi](https://github.com/jenilutfifauzi)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
