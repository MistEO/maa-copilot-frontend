import react from '@vitejs/plugin-react'

import { defineConfig } from 'vite'
import viteTsconfigPath from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPath()],
  resolve: {
    alias: {
      src: require('path').resolve(__dirname, 'src'),
    },
  },
})
