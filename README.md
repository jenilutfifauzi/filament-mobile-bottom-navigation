# This is my package filament-mobile-bottom-navigation

[![Latest Version on Packagist](https://img.shields.io/packagist/v/jenilutfifauzi/filament-mobile-bottom-navigation.svg?style=flat-square)](https://packagist.org/packages/jenilutfifauzi/filament-mobile-bottom-navigation)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/jenilutfifauzi/filament-mobile-bottom-navigation/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/jenilutfifauzi/filament-mobile-bottom-navigation/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/jenilutfifauzi/filament-mobile-bottom-navigation/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/jenilutfifauzi/filament-mobile-bottom-navigation/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/jenilutfifauzi/filament-mobile-bottom-navigation.svg?style=flat-square)](https://packagist.org/packages/jenilutfifauzi/filament-mobile-bottom-navigation)



This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

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
