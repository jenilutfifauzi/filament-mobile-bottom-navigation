{{-- Mobile Bottom Navigation Component --}}
{{-- This component will be fully implemented in Story 1.2 --}}

<nav class="fmbn-bottom-nav">
    {{-- Navigation items will be rendered here in Story 1.2 --}}
    @foreach ($navigationItems as $item)
        {{-- Placeholder for navigation item --}}
        <div>{{ $item->getLabel() }}</div>
    @endforeach
</nav>
