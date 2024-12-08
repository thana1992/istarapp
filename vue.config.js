const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  lintOnSave: false,
  transpileDependencies: true,
  devServer: {
    allowedHosts: 'all',
    proxy: {
      // Proxy ทุกคำขอที่ไม่ใช่ Static Files ไปยัง SERVER_URL
      '/': {
        target: process.env.SERVER_URL || 'https://king-prawn-app-92x4l.ondigitalocean.app', // URL ของ API Server
        changeOrigin: true, // จำลอง origin ให้เหมือน target
        logLevel: 'debug', // ใช้สำหรับ Debugging (เอาออกเมื่อขึ้น Production)
      },
    },
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'env': {
          SERVER_URL: JSON.stringify(process.env.SERVER_URL)
        }
      })
    ]
  }
});
