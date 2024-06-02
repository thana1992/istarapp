const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack');
module.exports = defineConfig({
  lintOnSave: false,
  transpileDependencies: true,
  devServer: {
    allowedHosts: 'all',
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
