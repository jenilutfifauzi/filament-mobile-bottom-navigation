import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

export default {
    content: [
        './resources/**/*.blade.php',
        './src/**/*.php',
    ],
    darkMode: 'class',
    theme: {
        extend: {},
    },
    plugins: [forms, typography],
    // Safelist navigation classes for PurgeCSS (prevent removal)
    safelist: [
        'fmbn-bottom-nav',
        'fmbn-nav-item',
        'fmbn-nav-item--active',
        'fmbn-nav-item__icon',
        'fmbn-nav-item__label',
        'fmbn-nav-item__badge',
        'fmbn-nav-item__badge--danger',
        'fmbn-nav-item__badge--warning',
        'fmbn-nav-item__badge--success',
        'fmbn-nav-item__badge--info',
    ],}
