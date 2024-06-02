const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack');
module.exports = defineConfig({
  lintOnSave: false,
  transpileDependencies: true,
  devServer: {
    client: {
      webSocketTransport: 'ws', // หรือ 'sockjs' หรือ 'native' ถ้าต้องการปรับแต่ง
      webSocketURL: false, // ปิดการใช้งาน WebSocket
    },
    allowedHosts: 'all',
    hot: false, // ปิดการใช้งาน HMR
    liveReload: false, // ปิดการใช้งานการโหลดสด
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
