const path = require("path");

module.exports = {
  outputDir: path.resolve(__dirname, "../dist/frontend"),
  publicPath: "./",
  configureWebpack: {
    externals: [
      function (context, request, callback) {
        if (request == "path" || request == "fs" || request == "os") {
          // Externalize to a commonjs module using the request path
          // console.log("Externalizing module: ", request);
          return callback(null, 'commonjs ' + request);
        }
  
        // Continue without externalizing the import
        callback();
      },
    ],
  }
};
