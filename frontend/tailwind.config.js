module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f4f6ff',
          100: '#e8ecff',
          500: '#6f7fdc',
          600: '#5a69c8',
          700: '#38428f'
        },
        mint: {
          50: '#f0fdf7',
          100: '#d8f7e8',
          500: '#46c69a',
          600: '#22a978',
          700: '#157257'
        },
        lilac: {
          50: '#f7f5ff',
          100: '#eeeaff',
          200: '#ded8ff',
          500: '#7b82d9',
          700: '#464b9e'
        }
      },
      boxShadow: {
        soft: '0 24px 60px rgba(86, 94, 160, 0.16)',
        insetSoft: 'inset 0 1px 0 rgba(255,255,255,0.75)'
      }
    }
  },
  plugins: []
};
