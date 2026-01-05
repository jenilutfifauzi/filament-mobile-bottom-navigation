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
}
