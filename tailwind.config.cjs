/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./code.html', './js/**/*.js'],
  // Mantém estas utilidades de grid disponíveis mesmo quando uma variante não
  // aparece literalmente no HTML durante futuras alterações de conteúdo.
  safelist: [
    'col-span-4', 'col-span-5', 'col-span-6', 'col-span-7', 'col-span-8',
    'lg:col-span-4', 'lg:col-span-5', 'lg:col-span-6', 'lg:col-span-7', 'lg:col-span-8'
  ],
  theme: {
    extend: {
      colors: {
        surface: '#FAF8F5',
        'surface-pure': '#FFFFFF',
        'surface-warm': '#F5F1EB',
        'surface-card': '#FFFFFF',
        'surface-elevated': '#FCFBF9',
        'gold-champagne': '#765A3E',
        'gold-light': '#DFC9AD',
        'gold-dark': '#765A3E',
        'gold-glow': 'rgba(197, 168, 128, 0.18)',
        'text-primary': '#272422',
        'text-secondary': '#5C5650',
        'text-muted': '#6B645C',
        'border-subtle': '#EAE5DC',
        'border-gold': '#E3D3C1',
        'whatsapp-green': '#25D366'
      },
      fontFamily: {
        serif: ['Bodoni Moda', 'serif'],
        sans: ['DM Sans', 'sans-serif']
      },
      borderRadius: { soft: '1.25rem', delicate: '2rem' },
      boxShadow: { xs: '0 1px 2px rgba(61, 39, 23, 0.06)' },
      opacity: { 92: '0.92' }
    }
  }
};
