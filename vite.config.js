import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    port: 8000,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html',
        dashboard: './pages/dashboard.html',
        evaluation: './pages/evaluation.html',
        reports: './pages/reports.html',
        organization: './pages/organization.html',
        settings: './pages/settings.html',
        'beta-demo': './beta-demo.html',
        'widget-sensor': './widget-sensor.html'
      }
    }
  },
  publicDir: 'public',
  base: './'
})