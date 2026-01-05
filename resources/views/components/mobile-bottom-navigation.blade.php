{{--
    Mobile Bottom Navigation Component

    Renders the bottom navigation bar for mobile devices with icons and labels.
    Navigation items are retrieved from the current Filament panel.

    @var \Illuminate\Support\Collection<int, \Filament\Navigation\NavigationItem> $navigationItems
--}}

@php
    use Filament\Facades\Filament;

    $panel = Filament::getCurrentPanel();

    if (!$panel) {
        $navigationItems = collect([]);
    } else {
        $navigation = collect($panel->getNavigation());

        $navigationItems = $navigation->flatMap(function ($item) {
            // If it's a NavigationGroup, extract its items
            if ($item instanceof \Filament\Navigation\NavigationGroup) {
                return $item->getItems();
            }

            // If it's a NavigationItem, return it
            if ($item instanceof \Filament\Navigation\NavigationItem) {
                return [$item];
            }

            // Skip unknown types
            return [];
        });
    }
@endphp

<style>
    /* CSS Variables for CLS prevention */
    :root {
        --fmbn-nav-base-height: 61px;
        --fmbn-nav-padding-top: 8px;
        --fmbn-nav-padding-bottom: 8px;
        --fmbn-nav-height: calc(var(--fmbn-nav-base-height) + env(safe-area-inset-bottom, 0px));
    }

    /* CRITICAL: Reserve space for mobile navigation to prevent Cumulative Layout Shift */
    @media (max-width: 767px) {
        body {
            padding-bottom: var(--fmbn-nav-height);
            margin-bottom: 0;
        }
    }

    /* Critical inline CSS for graceful degradation (fallback when external CSS fails) */
    .fmbn-bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 50;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        height: var(--fmbn-nav-height);
        background-color: #ffffff;
        border-top: 1px solid #e5e7eb;
        box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
        padding: var(--fmbn-nav-padding-top) 0;
        padding-bottom: calc(var(--fmbn-nav-padding-bottom) + env(safe-area-inset-bottom, 0px));
        margin: 0;
        list-style: none;
    }

    /* Semantic list structure */
    .fmbn-nav__list {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        gap: 0;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .fmbn-nav__list-item {
        flex: 1;
        display: flex;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    /* Hide on desktop (no padding needed) */
    @media (min-width: 768px) {
        .fmbn-bottom-nav {
            display: none;
        }

        body {
            padding-bottom: 0;
        }
    }

    /* Fallback for browsers without flexbox */
    @supports not (display: flex) {
        .fmbn-bottom-nav {
            display: block;
            font-size: 0; /* Remove whitespace between inline-block items */
        }
    }

    .fmbn-nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        min-height: 44px;
        min-width: 44px;
        padding: 0.5rem;
        color: #374151;
        text-decoration: none;
        transition: background-color 0.2s ease-in-out;
        position: relative;
        width: 100%;
    }

    /* Fallback for browsers without flexbox */
    @supports not (display: flex) {
        .fmbn-nav-item {
            display: inline-block;
            width: calc(100% / 5); /* Adjust if different number of items */
            font-size: 14px;
            vertical-align: top;
            text-align: center;
            padding: 0.5rem 0;
            min-height: 4rem;
        }
    }

    .fmbn-nav-item:hover {
        background-color: #f9fafb;
    }

    .fmbn-nav-item--active {
        color: #3b82f6;
        background-color: #f0f9ff;
    }

    .fmbn-nav-item__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
    }

    .fmbn-nav-item__label {
        font-size: 0.75rem;
        line-height: 1;
        font-weight: 500;
    }

    .fmbn-nav-item__badge {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 1.25rem;
        height: 1.25rem;
        padding: 0 0.25rem;
        background-color: #ef4444;
        color: #ffffff;
        font-size: 0.625rem;
        font-weight: 600;
        border-radius: 999px;
    }

    /* Hide navigation on larger screens (desktop) */
    @media (min-width: 768px) {
        .fmbn-bottom-nav {
            display: none;
        }
    }

    /* Light mode - Explicit override for manual toggle (highest priority) */
    html:not(.dark) .fmbn-bottom-nav {
        background-color: #ffffff !important;
        border-top-color: #e5e7eb !important;
    }

    html:not(.dark) .fmbn-nav-item {
        color: #374151 !important;
    }

    html:not(.dark) .fmbn-nav-item:hover {
        background-color: #f9fafb !important;
    }

    html:not(.dark) .fmbn-nav-item--active {
        color: #3b82f6 !important;
        background-color: #f0f9ff !important;
    }

    /* Dark mode support - System preference (OS/Browser setting) */
    @media (prefers-color-scheme: dark) {
        .fmbn-bottom-nav {
            background-color: #1f2937;
            border-top-color: #374151;
        }

        .fmbn-nav-item {
            color: #d1d5db;
        }

        .fmbn-nav-item:hover {
            background-color: #111827;
        }

        .fmbn-nav-item--active {
            color: #60a5fa;
            background-color: #1e3a8a;
        }
    }

    /* Dark mode support - Class-based (Filament manual toggle) - Overrides media query */
    .dark .fmbn-bottom-nav {
        background-color: #1f2937 !important;
        border-top-color: #374151 !important;
    }

    .dark .fmbn-nav-item {
        color: #d1d5db !important;
    }

    .dark .fmbn-nav-item:hover {
        background-color: #111827 !important;
    }

    .dark .fmbn-nav-item--active {
        color: #60a5fa !important;
        background-color: #1e3a8a !important;
    }

    /* High contrast mode */
    @media (prefers-contrast: more) {
        .fmbn-bottom-nav {
            border-top-width: 2px;
        }

        .fmbn-nav-item--active {
            text-decoration: underline;
        }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
        .fmbn-nav-item {
            transition: none;
        }
    }
</style>

@if ($navigationItems->isNotEmpty())
    <nav class="fmbn-bottom-nav" role="navigation" aria-label="Mobile bottom navigation"
         style="height: calc(61px + env(safe-area-inset-bottom, 0px));">
        <ul class="fmbn-nav__list" style="display: flex; flex-wrap: wrap; width: 100%; gap: 0; margin: 0; padding: 0; list-style: none;">
            @foreach ($navigationItems as $item)
                <li class="fmbn-nav__list-item" style="flex: 1; display: flex; margin: 0; padding: 0;">
                    <a
                        href="{{ $item->getUrl() }}"
                        wire:navigate
                        class="fmbn-nav-item"
                        @class([
                            'fmbn-nav-item--active' => $item->isActive(),
                        ])
                        aria-label="{{ $item->getLabel() }}"
                        @if ($item->isActive())
                            aria-current="page"
                        @endif
                        style="min-width: 44px; min-height: 44px; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;"
                    >
                        <span class="fmbn-nav-item__icon" aria-hidden="true" style="width: 24px; height: 24px; position: relative; display: flex; align-items: center; justify-content: center;">
                            @if ($item->getIcon())
                                <x-filament::icon
                                    :icon="$item->getIcon()"
                                    class="h-6 w-6"
                                    style="width: 24px; height: 24px;"
                                />
                            @endif

                            @if ($item->getBadge())
                                <span
                                    @class([
                                        'fmbn-nav-item__badge',
                                        "fmbn-nav-item__badge--{$item->getBadgeColor()}" => $item->getBadgeColor(),
                                    ])
                                    style="position: absolute; top: -4px; right: -4px;"
                                >
                                    {{ $item->getBadge() }}
                                </span>
                            @endif
                        </span>
                        <span class="fmbn-nav-item__label" style="font-size: 12px; line-height: 1.2;">
                            {{ $item->getLabel() }}
                        </span>
                    </a>
                </li>
            @endforeach
        </ul>
    </nav>
@endif

{{-- Async load non-critical CSS enhancements (animations, transitions, theme variables) --}}
<link rel="preload"
      href="{{ asset('css/mobile-bottom-nav-enhancements.css') }}"
      as="style"
      onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link rel="stylesheet" href="{{ asset('css/mobile-bottom-nav-enhancements.css') }}">
</noscript>
