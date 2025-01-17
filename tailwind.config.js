/** @type {import('tailwindcss').Config} */

// https://github.com/tailwindlabs/tailwindcss-typography
import typeography from '@tailwindcss/typography';

// https://github.com/tailwindlabs/tailwindcss-forms
// import forms from '@tailwindcss/forms';

// https://github.com/tailwindlabs/tailwindcss-container-queries
// import containerQueries from '@tailwindcss/container-queries';

// https://github.com/tailwindlabs/tailwindcss-aspect-ratio
// import aspectRatio from '@tailwindcss/aspect-ratio';

export default {
  content: [
    './index.html',
    './src/components/shared-components/WholeInputField/*.vue',
  ],
  theme: {
    fontFamily: {
      poppins: ['Poppins', 'sans-serif'],
      symbol: ['Material Symbols Rounded'],
      icon: ['Material Icons', 'Material Symbols Rounded'],
    },
    fontSize: {
      'heading-xl-desktop': ['2rem', {
        lineHeight: '2.5rem',
        letterSpacing: '-0.02em',
        fontWeight: '700',
      }],
      'heading-xl-mobile': ['1.75rem', {
        lineHeight: '2.25rem',
        letterSpacing: '-0.02em',
        fontWeight: '700',
      }],
      'heading-lg': ['1.5rem', {
        lineHeight: '2rem',
        letterSpacing: '-0.02em',
        fontWeight: '700',
      }],
      'heading-md': ['1.125rem', {
        lineHeight: '1.5rem',
        letterSpacing: '-0.02em',
        fontWeight: '600',
      }],
      'heading-sm': ['1rem', {
        lineHeight: '1.25rem',
        fontWeight: '600',
      }],
      'heading-xs': ['0.875rem', {
        lineHeight: '1rem',
        fontWeight: '600',
      }],
      'body-xl': ['1.125rem', {
        lineHeight: '1.75rem',
        fontWeight: '400',
      }],
      'bold-xl': ['1.125rem', {
        lineHeight: '1.75rem',
        fontWeight: '600',
      }],
      'body-lg': ['1rem', {
        lineHeight: '1.5rem',
        fontWeight: '400',
      }],
      'bold-lg': ['1rem', {
        lineHeight: '1.5rem',
        fontWeight: '600',
      }],
      'body-md': ['0.875rem', {
        lineHeight: '1.25rem',
        fontWeight: '400',
      }],
      'bold-md': ['0.875rem', {
        lineHeight: '1.25rem',
        fontWeight: '600',
      }],
      'body-sm': ['0.75rem', {
        lineHeight: '1rem',
        fontWeight: '400',
      }],
      'bold-sm': ['0.75rem', {
        lineHeight: '1rem',
        fontWeight: '600',
      }],
      'link-xl': ['1.125rem', {
        lineHeight: '1.75rem',
        fontWeight: '400',
      }],
      'link-lg': ['1rem', {
        lineHeight: '1.5rem',
        fontWeight: '400',
      }],
      'link-md': ['0.875rem', {
        lineHeight: '1.25rem',
        fontWeight: '400',
      }],
      'link-sm': ['0.75rem', {
        lineHeight: '1rem',
        fontWeight: '400',
      }],
      caption: ['0.75rem', {
        lineHeight: '1rem',
        fontWeight: '400',
      }],
      'label-lg': ['0.875rem', {
        lineHeight: '1.25rem',
        fontWeight: '400',
      }],
      'label-sm': ['0.75rem', {
        lineHeight: '0.75rem',
        fontWeight: '400',
      }],
    },
  },
  plugins: [
    typeography,
    // forms,
    // containerQueries,
    // aspectRatio,
  ],
};
