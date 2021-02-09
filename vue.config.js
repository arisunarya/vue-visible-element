const path = require('path')

module.exports = {
  outputDir: './docs',
  publicPath: './',
  configureWebpack: {
    entry: {
      app: path.resolve(__dirname, './docs-src/serve.js')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './')
      }
    }
  },
  css: {
    extract: true
  }
}
