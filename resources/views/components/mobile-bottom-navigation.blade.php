{{--
    Mobile Bottom Navigation Component

    Renders the bottom navigation bar for mobile devices with icons and labels.
    Navigation items are retrieved from the current Filament panel.

    @var \Illuminate\Support\Collection<int, \Filament\Navigation\NavigationItem> $navigationItems
--}}

<style>
    /* Critical inline CSS for graceful degradation (fallback when external CSS fails) */
    .fmbn-bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 50;
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        background-color: #ffffff;
        border-top: 1px solid #e5e7eb;
        box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
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
        min-height: 4.5rem;
        padding: 0.5rem;
        color: #374151;
        text-decoration: none;
        transition: background-color 0.2s ease-in-out;
        position: relative;
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

    /* Dark mode support */
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
    <nav class="fmbn-bottom-nav" role="navigation" aria-label="Mobile bottom navigation">
        @foreach ($navigationItems as $item)
            <a
                href="{{ $item->getUrl() }}"
                @class([
                    'fmbn-nav-item',
                    'fmbn-nav-item--active' => $item->isActive(),
                ])
                @if ($item->isActive())
                    aria-current="page"
                @endif
            >
                <span class="fmbn-nav-item__icon">
                    @svg($item->getIcon(), 'h-6 w-6')

                    @if ($item->getBadge())
                        <span
                            @class([
                                'fmbn-nav-item__badge',
                                "fmbn-nav-item__badge--{$item->getBadgeColor()}" => $item->getBadgeColor(),
                            ])
                        >
                            {{ $item->getBadge() }}
                        </span>
                    @endif
                </span>
                <span class="fmbn-nav-item__label">
                    {{ $item->getLabel() }}
                </span>
            </a>
        @endforeach
    </nav>
@endif

