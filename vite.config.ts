import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the built site work under any GitHub Pages address.
export default defineConfig({ base: './', plugins: [react()] });
