/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1a1a',
          'bg-secondary': '#2c2c2c',
          card: '#242424',
          'card-hover': '#2a2a2a',
          text: '#e0e0e0',
          'text-secondary': '#a0a0a0',
          border: '#3a3a3a',
          primary: '#bb86fc',
          'primary-hover': '#a058ee'
        },
      }
    },
  },
  plugins: [],
}

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;