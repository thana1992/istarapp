const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack');
module.exports = defineConfig({
  lintOnSave: false,
  transpileDependencies: true,
  devServer: {
    allowedHosts: 'all',
    hot: false, // ปิดการใช้งาน HMR
    liveReload: false, // ปิดการใช้งานการโหลดสด
    client: {
      webSocketURL: 'ws://localhost:8080/ws',
    },
    webSocketServer: false,
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          SERVER_URL: JSON.stringify(process.env.SERVER_URL)
        }
      })
    ]
  }
})
