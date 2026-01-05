{{--
    Mobile Bottom Navigation Component

    Renders the bottom navigation bar for mobile devices with icons and labels.
    Navigation items are retrieved from the current Filament panel.

    @var \Illuminate\Support\Collection<int, \Filament\Navigation\NavigationItem> $navigationItems
--}}

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

