const { createGlobPatternsForDependencies } = require('@nrwl/angular/tailwind');
const { join } = require('path');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'ap-',
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans,sans-serif', ...defaultTheme.fontFamily.sans],
      },
      boxShadow:{
        'step-container-ds':'0px 0px 22px rgba(186, 186, 191, 0.3)',
        'portal-ds' : '0px 0px 90px rgba(0, 0, 0, 0.14)'
      },
      backgroundImage: {
        authBg: "url('/assets/img/custom/auth/auth-bg.png')",
        nofbg: "url('/assets/img/custom/auth/404.svg')",
      },
      spacing: {
        '7.5': '1.875rem',
      },
      colors: {
        title:'var(--title)',
        line:'var(--line)',
        header: 'var(--header)',
        dividers: 'var(--dividers)',
        body: 'var(--body)',
        border: 'var(--border)',
        white: 'var(--white)',
        'gray-card': 'var(--gray-card)',
        placeholder: 'var(--placeholder)',
        'form-label': 'var(--form-label)',
        black: 'var(--black)',
        disable: 'var(--disable)',
        sidebar: 'var(--sidebar)',
        hover:'var(--hover)',
        avatar: 'var(--avatar)',
        'blue-link': 'var(--blue-link)',
        'gray-select': 'var(--gray-select)',
        'add-piece': 'var(--add-piece)',
        'blue-border': 'var(--blue-border)',
        'purple-border': 'var(--purple-border)',
        'green-border': 'var(--green-border)',
        outline: 'var(--outline)',
        description: 'var(--description)',
        danger: {
          DEFAULT: '#dc3545',
          light: '#efa2a980',
        },
        primary: { DEFAULT: 'var(--primary-default)',
        medium:'var(--primary-medium)',
         light: 'var(--primary-light)', 
         dark: 'var(--primary-dark)' },
        warn: {
         DEFAULT:'#f78a3b',
         light:"#FFF6E4",
         dark:"#CC8805",
         medium:"#F0D6A1"},
        success: '#209e34',
       'bleached-gray':'var(--bleached-gray)',
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
      },
    },
  },
  variants: {
    extend: {
        display: ["group-hover"],
    },
},
  plugins: [],
};
