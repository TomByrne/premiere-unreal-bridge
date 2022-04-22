const path = require("path");

module.exports = {
  outputDir: path.resolve(__dirname, "../dist/frontend"),
  publicPath: "./",
  configureWebpack: {
    externals: [
      function (context, request, callback) {
        if (request == "path" || request == "fs" || request == "os" || request == 'perf_hooks') {
          // Externalize to a commonjs module using the request path
          // console.log("Externalizing module: ", request);
          return callback(null, 'commonjs ' + request);
        }
  
        // Continue without externalizing the import
        callback();
      },
    ],
  },
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule
      .use('vue-loader')
      .loader('vue-loader') // or `vue-loader-v16` if you are using a preview support of Vue 3 in Vue CLI
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');
  }
};
