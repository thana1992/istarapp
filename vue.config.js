const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack');
module.exports = defineConfig({
  lintOnSave: false,
  transpileDependencies: true,
  devServer: {
    allowedHosts: 'all',
    // hot: false,
    liveReload: false,
    // webSocketServer: false,
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
})
